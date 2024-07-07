use actix_web::dev::HttpServiceFactory;
use actix_web::http::header::ContentType;
use actix_web::middleware::NormalizePath;
use actix_web::web::{Data, Path, Query};
use actix_web::{get, routes, FromRequest, HttpRequest, HttpResponse, Scope};
use minijinja::{context, path_loader, Environment};
use serde::Deserialize;
use std::collections::HashMap;
use std::path::PathBuf;

use crate::models::product::{Product, ProductKind, ProductTag};
use crate::models::AppErr;
use crate::AppState;

type Response = Result<HttpResponse, AppErr>;

#[get("/")]
async fn home(
    env: Data<Environment<'static>>, state: Data<AppState>,
) -> Response {
    let best_products = sqlx::query_as! {
        Product,
        "select * from products where best = true"
    }
    .fetch_all(&state.sql)
    .await?;

    let result = env.get_template("home/index.html")?.render(context! {
        best_products => best_products
    })?;
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
    let mut filter = Vec::<String>::new();

    if let Ok(q) = &q {
        if matches!(q.sort, Some(Sort::Asc)) {
            sort = "asc";
        }

        if let Some(p) = q.page {
            offset = p * 32;
        }

        if let Some(kind) = &q.kind {
            filter.push(format!("kind = {}", kind.clone() as i64));

            if let Some(leg) = q.leg {
                filter.push(format!("tag_leg = {leg}"));
            }

            if let Some(bed) = q.bed {
                filter.push(format!("tag_bed = {bed}"));
            }
        }
    }

    let cond = if filter.len() > 0 {
        "where ".to_string() + &filter.join(" AND ")
    } else {
        String::new()
    };

    let products: Vec<Product> = sqlx::query_as(&format!(
        "select * from products {} order by timestamp {} limit 32 offset ?",
        cond, sort
    ))
    .bind(offset)
    .fetch_all(&state.sql)
    .await?;

    let tags = sqlx::query_as! {
        ProductTag, "select * from product_tags"
    }
    .fetch_all(&state.sql)
    .await?;

    let tags = tags
        .iter()
        .map(|v| (v.id, v.clone()))
        .collect::<HashMap<i64, ProductTag>>();

    let result = env.get_template("products/index.html")?.render(context! {
        products => products,
        tags => tags,
    })?;

    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/products/{id}")]
async fn product(
    rq: HttpRequest, env: Data<Environment<'static>>, state: Data<AppState>,
) -> Response {
    let path = Path::<(i64,)>::extract(&rq).await;
    if path.is_err() {
        return Ok(HttpResponse::NotFound()
            .content_type(ContentType::html())
            .body("404"));
    }

    let id = path.unwrap().0;
    let product = sqlx::query_as! {
        Product, "select * from products where id = ?", id
    }
    .fetch_one(&state.sql)
    .await?;

    let related = sqlx::query_as! {
        Product,
        "select * from products where id != ? and kind = ? and (tag_leg = ? or tag_bed = ?) limit 4",
        product.id, product.kind, product.tag_leg, product.tag_bed
    }
    .fetch_all(&state.sql)
    .await?;

    let tags = sqlx::query_as! {
        ProductTag, "select * from product_tags where id in (?, ?)",
        product.tag_leg, product.tag_bed
    }
    .fetch_all(&state.sql)
    .await?;

    let tags = tags
        .iter()
        .map(|value| (value.id, value.clone()))
        .collect::<HashMap<_, _>>();

    let result = env.get_template("product/index.html")?.render(context! {
        product => product,
        related => related,
        tags => tags,
    })?;

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

#[routes]
#[get("/admin")]
#[get("/admin/products")]
#[get("/admin/product-tags")]
async fn admin_index() -> HttpResponse {
    let result = std::fs::read_to_string("admin/dist/index.html")
        .unwrap_or("err reading admin index.html".to_string());
    HttpResponse::Ok().content_type(ContentType::html()).body(result)
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
        .service(admin_index)
}
