

from io import StringIO

from fastapi import FastAPI, Request, Response
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse, PlainTextResponse
from fastapi.routing import APIRoute
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

import api
import shared.logger
from deps import get_ip
from shared import redis, settings, sqlx
from shared.errors import Error, all_errors

app = FastAPI(
    title='Heydari',
    version='0.0.1',
    description='**Heydari api documents**',
    dependencies=[get_ip()]
)
app.include_router(api.router)
templates = Jinja2Templates(
    directory=settings.base_dir / 'mark/tmpl/'
)

if settings.debug:
    app.mount('/static', StaticFiles(directory='static'), name='static')
    app.mount('/records', StaticFiles(directory='records'), name='records')


@app.exception_handler(Error)
async def error_exception_handler(request, exc: Error):
    return exc.json()


@app.on_event('startup')
async def startup():
    await redis.ping()
    await sqlx.connect()


@app.on_event('shutdown')
async def shutdown():
    await redis.connection_pool.disconnect()
    await sqlx.disconnect()


@app.get('/rapidoc/', response_class=HTMLResponse, include_in_schema=False)
async def rapidoc(response: Response):
    return '''<!doctype html>
    <html><head><meta charset="utf-8">
    <meta name="robots" content="noindex">
    <script type="module" src="/static/rapidoc.js"></script></head><body>
    <rapi-doc spec-url="/openapi.json" persist-auth="true"
    bg-color="#040404" text-color="#f2f2f2" header-color="#040404"
    primary-color="#ff8800" nav-text-color="#eee" font-size="largest"
    allow-spec-url-load="false" allow-spec-file-load="false"
    show-method-in-nav-bar="as-colored-block" response-area-height="500px"
    show-header="false" /></body> </html>'''


class XMLResponse(Response):
    media_type = 'application/xml'


@app.get('/robots.txt', response_class=PlainTextResponse)
async def robots(request: Request, response: Response):
    host = request.url.hostname
    content = (
        'User-agent: *',
        'Disallow:\n'
        f'Sitemap: https://{host}/sitemap.xml'
    )
    return '\n'.join(content)


# from xml.etree.ElementTree import tostring, Element, SubElement


@app.get('/sitemap.xml', response_class=XMLResponse)
async def sitemap(request: Request):
    host = request.url.hostname
    out = StringIO()

    out.write(
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    )

    for path in ('blogs', 'about', 'products', 'contact'):
        out.write((
            '<url>'
            f'<loc>https://{host}/{path}/</loc>'
            '</url>'
        ))

    out.write('</urlset>')

    out.seek(0)
    return out.read()


@app.get('/', response_class=HTMLResponse, include_in_schema=False)
async def index(request: Request):
    return templates.TemplateResponse(
        'home/index.html',
        {'request': request}
    )


@app.get('/products/', response_class=HTMLResponse, include_in_schema=False)
async def products(request: Request):
    return templates.TemplateResponse(
        'products/index.html',
        {'request': request}
    )


@app.get('/contact/', response_class=HTMLResponse, include_in_schema=False)
async def contact(request: Request):
    return templates.TemplateResponse(
        'contact/index.html',
        {'request': request}
    )


@app.get('/about/', response_class=HTMLResponse, include_in_schema=False)
async def about(request: Request):
    return templates.TemplateResponse(
        'about/index.html',
        {'request': request}
    )


@app.get('/blogs/', response_class=HTMLResponse, include_in_schema=False)
async def blogs(request: Request):
    return templates.TemplateResponse(
        'blogs/index.html',
        {'request': request}
    )


for route in app.routes:
    if not isinstance(route, APIRoute):
        continue

    errors = []

    for d in route.dependencies:
        errors.extend(getattr(d, 'errors', []))

    oid = route.path.replace('/', '_').strip('_')
    oid += '_' + '_'.join(route.methods)
    route.operation_id = oid

    errors.extend((route.openapi_extra or {}).pop('errors', []))

    for e in errors:
        route.responses[e.code] = {
            'description': f'{e.title} - {e.status}',
            'content': {
                'application/json': {
                    'schema': {
                        '$ref': f'#/errors/{e.code}',
                    }
                }
            }
        }


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )

    schema['errors'] = {}

    for e in all_errors:
        schema['errors'][e.code] = e.schema

    app.openapi_schema = schema
    return app.openapi_schema


app.openapi = custom_openapi
