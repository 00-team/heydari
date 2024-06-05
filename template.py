# from shared import settings
from pathlib import Path

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

base_dir: Path = Path(__file__).parent


app = FastAPI()
templates = Jinja2Templates(directory=base_dir / "templates/")

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/record", StaticFiles(directory="record"), name="record")


@app.get("/", response_class=HTMLResponse, include_in_schema=False)
async def index(request: Request):
    return templates.TemplateResponse(
        "home/index.html",
        {
            "request": request,
        },
    )


@app.get("/products", response_class=HTMLResponse, include_in_schema=False)
async def products(request: Request):
    return templates.TemplateResponse(
        "products/index.html",
        {
            "request": request,
        },
    )


@app.get("/product/1", response_class=HTMLResponse, include_in_schema=False)
async def product(request: Request):
    return templates.TemplateResponse(
        "product/index.html",
        {
            "request": request,
        },
    )


@app.get("/contact", response_class=HTMLResponse, include_in_schema=False)
async def contact(request: Request):
    return templates.TemplateResponse(
        "contact/index.html",
        {
            "request": request,
        },
    )


@app.get("/about", response_class=HTMLResponse, include_in_schema=False)
async def about(request: Request):
    return templates.TemplateResponse(
        "about/index.html",
        {
            "request": request,
        },
    )


@app.get("/blogs", response_class=HTMLResponse, include_in_schema=False)
async def blogs(request: Request):
    return templates.TemplateResponse(
        "blogs/index.html",
        {
            "request": request,
        },
    )


if __name__ == "__main__":
    uvicorn.run(app, port=7201)
