
import uvicorn
from fastapi import APIRouter, FastAPI
from fastapi.responses import HTMLResponse
from fastapi.routing import APIRoute

# from fastapi.staticfiles import StaticFiles


# TODO: make the doc
app = FastAPI(
    # title='Heydari',
    # version='0.0.1',
    # description='**Heydari api documents**',

    # openapi_url=None
)

# app.mount('/media', StaticFiles(directory='media'), name='media')

# api = APIRouter(
#     prefix='/api',
# )


@app.on_event('startup')
async def startup():
    # await redis.ping()
    # await database.connect()
    pass


@app.on_event('shutdown')
async def shutdown():
    # await redis.connection_pool.disconnect()
    # await database.disconnect()
    pass


# api.include_router(auth.router)
# api.include_router(user.router)

# app.include_router(api)

@app.get('/')
async def index():
    return HTMLResponse('hi')


for route in app.routes:
    if isinstance(route, APIRoute):
        route.operation_id = route.name


if __name__ == '__main__':
    uvicorn.run('main:app', port=7000, reload=True)
