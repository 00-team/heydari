
import logging

from fastapi import APIRouter, Request

from db.models import UserModel
from deps import rate_limit, user_required

router = APIRouter(
    prefix='/user',
    tags=['user'],
    dependencies=[user_required(), rate_limit('user', 60, 120)]
)


@router.get('/', response_model=UserModel)
async def get(request: Request):
    user: UserModel = request.state.user
    user.token = user.token[:32]
    return user
