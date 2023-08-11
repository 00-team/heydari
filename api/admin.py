
# import logging
import mimetypes
import os
# from sqlite3 import IntegrityError
from typing import Annotated, Literal

import magic
from fastapi import APIRouter, Form, Request, UploadFile
from pydantic import BaseModel, constr

from db.blog import blog_add, blog_delete, blog_get, blog_update
from db.models import AdminPerms as AP
from db.models import BlogTable, RecordItemTable, RecordModel, RecordPublic
from db.models import RecordTable, UserModel, UserPublic
from db.record import record_add, record_delete, record_exists, record_get
from db.user import user_exists, user_public
from deps import admin_required
from shared import settings, sqlx
from shared.errors import bad_file, bad_id, no_change, not_unique
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


@router.delete(
    '/blogs/{blog_id}/', response_model=OkModel,
    openapi_extra={'errors': [bad_id]}
)
async def delete_blog(request: Request, blog_id: int):
    user: UserModel = request.state.user
    user.admin_assert(AP.D_BLOG)

    return {
        'ok': bool(await blog_delete(BlogTable.blog_id == blog_id))
    }


@router.delete(
    '/records/{record_id}/', response_model=OkModel,
    openapi_extra={'errors': [bad_id]}
)
async def delete_record(request: Request, record_id: int):
    user: UserModel = request.state.user
    user.admin_assert(AP.D_RECORD)

    record = await record_get(RecordTable.record_id == record_id)
    if record is None:
        raise bad_id('Record', record_id, id=record_id)

    record.path.unlink(True)
    await record_delete(RecordTable.record_id == record_id)

    return {'ok': True}


@router.post(
    '/records/', response_model=RecordPublic,
    openapi_extra={'errors': [bad_file]}
)
async def add_record(
    request: Request,
    file: UploadFile,
    item: Annotated[int, Form()] = None,
    item_table: Annotated[RecordItemTable, Form()] = RecordItemTable.LOST,
):
    user: UserModel = request.state.user
    user.admin_assert(AP.A_RECORD)

    mime = magic.from_buffer(file.file.read(2048), mime=True)
    if mime is None:
        raise bad_file

    ext = mimetypes.guess_extension(mime)
    if ext is None or len(ext) < 2:
        raise bad_file

    if file.size > 40 * 1024 * 1024:
        raise bad_file

    file.file.seek(0)
    record = RecordModel(
        record_id=0,
        salt=os.urandom(4),
        owner=user.user_id,
        size=file.size,
        mime=mime,
        ext=ext[1:],
        timestamp=utc_now(),
        item=item,
        item_table=item_table,
    )

    args = record.dict()
    args.pop('record_id')

    record_id = await record_add(**args)
    record.record_id = record_id

    path = settings.record_dir / (record.name + ext)
    with open(path, 'wb') as f:
        while (chunk := file.file.read(1024)):
            f.write(chunk)

    return record.public(
        UserPublic(user_id=user.user_id, name=user.name)
    )


@router.get(
    '/records/', response_model=list[RecordPublic],
)
async def get_records(request: Request, page: int = 0):
    user: UserModel = request.state.user
    user.admin_assert(AP.V_RECORD)

    rows = await sqlx.fetch_all(
        f'''
        SELECT * from records
        LIMIT {settings.page_size} OFFSET {page * settings.page_size}
        '''
    )

    user_ids = set()
    records = []

    for row in rows:
        record = RecordModel(**row)
        records.append(record)
        user_ids.add(record.owner)

    owners = await user_public(user_ids)
    result = []

    for record in records:
        result.append(record.public(
            owners[record.owner]
        ))

    return result
