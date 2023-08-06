
import logging
from typing import ClassVar, Literal

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr, Field, constr

from db.models import BlogModel, BlogTable, BlogTagTable, RecordModel
from db.models import UserModel, UserPublic
from db.record import record_list
from db.user import user_public, user_update
from deps import rate_limit, user_required
from shared import settings, sqlx
from shared.errors import no_change
from shared.models import OkModel

router = APIRouter(
    prefix='/blogs',
    tags=['blog'],
)


class GetBlogsBody(BaseModel):
    page: int = 0
    # order: None = None
    # tag


class BlogItem(BaseModel):
    blog_id: int
    slug: str
    title: str
    description: str | None
    timestamp: int
    thumbnail: str | None
    author: UserPublic


@router.post(
    '/', response_model=list[BlogItem],
    dependencies=[rate_limit('blogs:list', 60, 30, False)]
)
async def get_blogs(request: Request, body: GetBlogsBody):
    rows = await sqlx.fetch_all(
        f'''
        SELECT * from blogs
        LIMIT {settings.page_size} OFFSET {body.page * settings.page_size}
        '''
    )

    user_ids = set()
    record_ids = set()
    blogs = []

    for row in rows:
        blog = BlogModel(**row)
        blogs.append(blog)

        user_ids.add(blog.author)

        if blog.thumbnail is not None:
            record_ids.add(blog.thumbnail)

    authors = await user_public(user_ids)
    records = await record_list(record_ids)
    result = []

    for blog in blogs:
        thumbnail = None

        if blog.thumbnail in records:
            thumbnail = records[blog.thumbnail].url

        result.append(BlogItem(
            blog_id=blog.blog_id,
            slug=blog.slug,
            title=blog.title,
            description=blog.description,
            timestamp=blog.timestamp,
            thumbnail=thumbnail,
            author=authors[blog.author],
        ))

    return result
