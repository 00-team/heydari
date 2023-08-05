
import logging
from typing import ClassVar, Literal

from fastapi import APIRouter, Request
from pydantic import BaseModel, EmailStr, Field, constr

from db.models import BlogModel, BlogTable, BlogTagTable, UserModel
from db.user import user_update
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
    #


class GetBlogsResponse(BlogModel):
    content: ClassVar[None] = None


@router.get(
    '/', response_model=list[GetBlogsResponse],
    dependencies=[rate_limit('blogs:list', 60, 30)]
)
async def get_blogs(request: Request, body: GetBlogsBody):
    rows = await sqlx.fetch_all(
        f'''
        SELECT * from blogs
        LIMIT {settings.page_size} OFFSET {body.page * settings.page_size}
        '''
    )

    return [GetBlogsResponse(**r) for r in rows]
