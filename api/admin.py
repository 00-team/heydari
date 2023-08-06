
import logging
from sqlite3 import IntegrityError
from typing import ClassVar, Literal

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr, Field, constr

from db.blog import blog_add, blog_update
from db.models import BlogModel, BlogTable, BlogTagTable, UserModel
from db.record import record_exists
from db.user import user_exists, user_update
from deps import admin_required, rate_limit, user_required
from shared import settings, sqlx
from shared.errors import bad_id, no_change
from shared.models import IDModel, OkModel
from shared.tools import utc_now

router = APIRouter(
    prefix='/admin',
    tags=['admin'],
    dependencies=[admin_required()]
)


class AddBlogBody(BaseModel):
    slug: str
    title: str
    description: str = None
    content: str
    author: int = None
    thumbnail: int = None


@router.post(
    '/blogs/', response_model=IDModel,
    openapi_extra={'errors': [bad_id]}
)
async def add_blog(request: Request, body: AddBlogBody):
    user: UserModel = request.state.user

    if body.thumbnail is not None:
        if not (await record_exists(body.thumbnail)):
            raise bad_id('Record', body.thumbnail, id=body.thumbnail)

    if body.author is not None:
        if not (await user_exists(body.author)):
            raise bad_id('User', body.author, id=body.author)

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
