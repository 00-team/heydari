
import logging
from sqlite3 import IntegrityError
from typing import ClassVar, Literal

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr, Field, constr

from db.blog import blog_add, blog_get, blog_update
from db.models import AdminPerms as AP
from db.models import BlogModel, BlogTable, BlogTagTable, UserModel
from db.record import record_exists
from db.user import user_exists, user_update
from deps import admin_required, rate_limit, user_required
from shared import settings, sqlx
from shared.errors import bad_id, no_change, not_unique
from shared.models import IDModel, OkModel
from shared.tools import utc_now

router = APIRouter(
    prefix='/admin',
    tags=['admin'],
    dependencies=[admin_required()]
)


class AddBlogBody(BaseModel):
    slug: constr(min_length=1)
    title: constr(min_length=1)
    description: constr(min_length=1) = None
    content: str = ''
    author: int = None
    thumbnail: int = None


@router.post(
    '/blogs/', response_model=IDModel,
    openapi_extra={'errors': [bad_id, not_unique]}
)
async def add_blog(request: Request, body: AddBlogBody):
    user: UserModel = request.state.user
    user.admin_assert(AP.A_BLOG)

    if body.thumbnail is not None:
        if not (await record_exists(body.thumbnail)):
            raise bad_id('Record', body.thumbnail, id=body.thumbnail)

    if body.author is not None:
        if not (await user_exists(body.author)):
            raise bad_id('User', body.author, id=body.author)

    if (await blog_get(BlogTable.slug == body.slug)):
        raise not_unique(body.slug, 'slug', value=body.slug)

    blog_id = await blog_add(
        slug=body.slug,
        title=body.title,
        description=body.description,
        content=body.content,
        author=body.author or user.user_id,
        timestamp=utc_now(),
        thumbnail=body.thumbnail,
    )

    return {'id': blog_id}


class UpdateBlogBody(BaseModel):
    slug: constr(min_length=1) = None
    title: constr(min_length=1) = None
    description: str = None
    content: constr(min_length=1) = None
    author: int = None
    thumbnail: int | Literal[-1] = None


@router.patch(
    '/blogs/{blog_id}/', response_model=OkModel,
    openapi_extra={'errors': [bad_id, not_unique, no_change]}
)
async def update_blog(request: Request, blog_id: int, body: UpdateBlogBody):
    user: UserModel = request.state.user
    user.admin_assert(AP.C_BLOG)

    change = False
    patch = {
        'last_update': utc_now()
    }

    blog = await blog_get(BlogTable.blog_id == blog_id)
    if blog is None:
        raise bad_id('Blog', blog_id, id=blog_id)

    if body.slug is not None and body.slug != blog.slug:
        if (await blog_get(BlogTable.slug == body.slug)):
            raise not_unique(body.slug, 'slug', value=body.slug)

        patch['slug'] = body.slug
        change = True

    if body.title is not None and body.title != blog.title:
        patch['title'] = body.title
        change = True

    if body.content is not None:
        patch['content'] = body.content
        change = True

    if body.description is not None:
        patch['description'] = body.description or None
        change = True

    if body.thumbnail is not None:
        change = True
        if body.thumbnail == -1:
            patch['thumbnail'] = None

        if not (await record_exists(body.thumbnail)):
            raise bad_id('Record', body.thumbnail, id=body.thumbnail)

        patch['thumbnail'] = body.thumbnail

    if body.author is not None:
        if not (await user_exists(body.author)):
            raise bad_id('User', body.author, id=body.author)

        patch['author'] = body.author
        change = True

    if not change:
        raise no_change

    await blog_update(BlogTable.blog_id == blog_id, **patch)

    return {'ok': True}
