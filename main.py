
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles

from deps import get_ip
from shared import settings

index_path = settings.base_dir / 'static/dist/index.html'
INDEX_HTML = 'index.html not found :/'
if index_path.is_file():
    with open(index_path, 'r') as f:
        INDEX_HTML = f.read()


app = FastAPI(
    title='Heydari',
    version='0.0.1',
    description='**Heydari api documents**',
    dependencies=[get_ip()]
)

if settings.debug:
    app.mount('/static', StaticFiles(directory='static'), name='static')


@app.on_event('startup')
async def startup():
    pass


@app.on_event('shutdown')
async def shutdown():
    pass


@app.get('/')
async def index():
    return HTMLResponse(INDEX_HTML)


for route in app.routes:
    if isinstance(route, APIRoute):
        route.operation_id = route.name
