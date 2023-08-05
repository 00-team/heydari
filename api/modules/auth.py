
from fastapi import APIRouter, Response
from pydantic import BaseModel

from api.verification import Action, verify_verification
from db.models import UserModel, UserTable
from db.user import user_add, user_get, user_update
from deps import rate_limit
from shared.errors import bad_verification
from shared.tools import new_token
from shared.validators import PhoneNumber, VerificationCode

router = APIRouter(
    prefix='/auth',
    tags=['auth'],
    dependencies=[rate_limit('auth', 30 * 60, 20, False)]
)


class LoginBody(BaseModel):
    phone: PhoneNumber
    code: VerificationCode


class LoginResponse(BaseModel):
    user: UserModel
    token: str


@router.post(
    '/login/', response_model=LoginResponse,
    openapi_extra={'errors': [bad_verification]}
)
async def login(response: Response, body: LoginBody):
    await verify_verification(
        body.phone, body.code, Action.login
    )

    token, token_hash = new_token()
    user = await user_get(UserTable.phone == body.phone)
    if user is None:
        user_id = await user_add(
            phone=body.phone,
            name='',
            token=token_hash
        )

        token = f'{user_id}:{token}'
        response.set_cookie(
            key='Authorization',
            value=f'Bearer {token}',
            secure=True,
            samesite='strict'
        )

        return {
            'user': {
                'user_id': user_id,
                'name': '',
                'phone': body.phone,
                'email': None,
                'admin': None,
                'token': token_hash[:32],
            },
            'token': token
        }

    await user_update(UserTable.user_id == user.user_id, token=token_hash)
    user.token = token_hash[:32]

    token = f'{user.user_id}:{token}'
    response.set_cookie(
        key='Authorization',
        value=f'Bearer {token}',
        secure=True,
        samesite='strict'
    )

    return {
        'user': user,
        'token': token,
    }
