

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from deps import get_ip
from shared import settings

app = FastAPI(
    title='Heydari',
    version='0.0.1',
    description='**Heydari api documents**',
    dependencies=[get_ip()]
)
templates = Jinja2Templates(
    directory=settings.base_dir / 'static/templates/'
)

if settings.debug:
    app.mount('/static', StaticFiles(directory='static'), name='static')


@app.on_event('startup')
async def startup():
    pass


@app.on_event('shutdown')
async def shutdown():
    pass


@app.get('/', response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        'index.html',
        {
            'request': request,
        }
    )


for route in app.routes:
    if isinstance(route, APIRoute):
        route.operation_id = route.name
