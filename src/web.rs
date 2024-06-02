use actix_web::dev::HttpServiceFactory;
use actix_web::http::header::ContentType;
use actix_web::middleware::NormalizePath;
use actix_web::web::Data;
use actix_web::{get, HttpResponse, Scope};
use minijinja::{path_loader, Environment};
use std::path::PathBuf;

use crate::models::AppErr;

type Response = Result<HttpResponse, AppErr>;

#[get("/")]
async fn home(env: Data<Environment<'static>>) -> Response {
    let result = env.get_template("home/index.html")?.render(())?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/products")]
async fn products(env: Data<Environment<'static>>) -> Response {
    let result = env.get_template("products/index.html")?.render(())?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/contact")]
async fn contact(env: Data<Environment<'static>>) -> Response {
    let result = env.get_template("contact/index.html")?.render(())?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/about")]
async fn about(env: Data<Environment<'static>>) -> Response {
    let result = env.get_template("about/index.html")?.render(())?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/blogs")]
async fn blogs(env: Data<Environment<'static>>) -> Response {
    let result = env.get_template("blogs/index.html")?.render(())?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

pub fn router() -> impl HttpServiceFactory {
    let tmpl_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("templates");
    let mut tmpl_env = Environment::new();
    tmpl_env.set_loader(path_loader(tmpl_path));

    Scope::new("")
        .wrap(NormalizePath::trim())
        .app_data(Data::new(tmpl_env))
        .service(home)
        .service(products)
        .service(contact)
        .service(about)
        .service(blogs)
}
