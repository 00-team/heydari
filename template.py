

# from shared import settings
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

base_dir: Path = Path(__file__).parent


app = FastAPI()
templates = Jinja2Templates(
    directory=base_dir / 'mark/tmpl/'
)

# if settings.debug:
app.mount('/static', StaticFiles(directory='static'), name='static')
# app.mount('/records', StaticFiles(directory='records'), name='records')


@app.get('/', response_class=HTMLResponse, include_in_schema=False)
async def index(request: Request):
    return templates.TemplateResponse(
        'home/index.html',
        {
            'request': request,
        }
    )


@app.get('/products', response_class=HTMLResponse, include_in_schema=False)
async def products(request: Request):
    return templates.TemplateResponse(
        'products/products.html',
        {
            'request': request,
        }
    )


if __name__ == '__main__':
    uvicorn.run(app, port=7201)
