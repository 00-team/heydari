use actix_web::dev::HttpServiceFactory;
use actix_web::http::header::ContentType;
use actix_web::middleware::NormalizePath;
use actix_web::web::{Data, Path, Query};
use actix_web::{get, FromRequest, HttpRequest, HttpResponse, Scope};
use minijinja::{context, path_loader, Environment};
use serde::Deserialize;
use sqlx::{Sqlite, SqlitePool};
use std::collections::HashMap;
use std::path::PathBuf;

use crate::models::product::{Product, ProductKind, ProductTag};
use crate::models::AppErr;
use crate::AppState;

type Response = Result<HttpResponse, AppErr>;

#[get("/")]
async fn home(env: Data<Environment<'static>>) -> Response {
    let result = env.get_template("home/index.html")?.render(())?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "snake_case")]
enum Sort {
    Asc,
    Desc,
}

#[derive(Deserialize, Debug)]
struct ProductsQuery {
    leg: Option<i64>,
    bed: Option<i64>,
    kind: Option<ProductKind>,
    sort: Option<Sort>,
    page: Option<u32>,
}

#[get("/products")]
async fn products(
    rq: HttpRequest, env: Data<Environment<'static>>, state: Data<AppState>,
) -> Response {
    let q = Query::<ProductsQuery>::extract(&rq).await;
    let mut sort = "desc";
    let mut offset = 0;
    match q {
        Ok(v) => {
            if matches!(v.sort, Some(Sort::Asc)) {
                sort = "asc";
            }
            if let Some(p) = v.page {
                offset = p * 32;
            }
        }
        Err(_) => {}
    }

    // let x = "select * from products order by timestamp desc limit 32 offset ?";
    let products = sqlx::query_as! {
        Product,
        "select * from products order by timestamp desc limit 32 offset ?",
        offset
    }
    .fetch_all(&state.sql)
    .await?;
    let tags = sqlx::query_as! {
        ProductTag,
        "select * from product_tags"
    }
    .fetch_all(&state.sql)
    .await?;

    let tags = tags.iter().map(|v| (v.id, v.name.clone())).collect::<HashMap<i64, String>>();

    // sqlx::query_as::<Sqlite, Product>(x);
    // let products: Vec<Product> = sqlx::query_as(x).fetch_all(&state.sql).await?;
    let result = env.get_template("products/index.html")?.render(context! {
        products => products,
        tags => tags,
    })?;
    // log::info!("result: {result}");
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/products/{id}")]
async fn product(
    path: Path<(i64,)>, env: Data<Environment<'static>>,
) -> Response {
    let result = env.get_template("product/index.html")?.render(())?;
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
        .service(product)
        .service(contact)
        .service(about)
        .service(blogs)
}
