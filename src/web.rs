use actix_web::dev::HttpServiceFactory;
use actix_web::http::header::ContentType;
use actix_web::middleware::NormalizePath;
use actix_web::web::{self, Data, Path, Query};
use actix_web::{get, routes, FromRequest, HttpRequest, HttpResponse, Scope};
use minijinja::{context, path_loader, Environment};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::path::PathBuf;

use crate::config::Config;
use crate::models::product::{Product, ProductKind, ProductTag};
use crate::models::{AppErr, ListInput};
use crate::AppState;

type Response = Result<HttpResponse, AppErr>;

#[get("/")]
async fn home(state: Data<AppState>) -> Response {
    let best_products = sqlx::query_as! {
        Product,
        "select * from products where best = true"
    }
    .fetch_all(&state.sql)
    .await?;

    let result =
        state.env.get_template("home/index.html")?.render(context! {
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
async fn products(rq: HttpRequest, state: Data<AppState>) -> Response {
    let q = Query::<ProductsQuery>::extract(&rq).await;
    let mut sort = "desc";
    let mut page = 0;
    let mut filter = Vec::<String>::new();

    if let Ok(q) = &q {
        if matches!(q.sort, Some(Sort::Asc)) {
            sort = "asc";
        }

        page = q.page.unwrap_or(0);

        if let Some(kind) = &q.kind {
            filter.push(format!("kind = {}", *kind as i64));

            if let Some(leg) = q.leg {
                filter.push(format!("tag_leg = {leg}"));
            }

            if let Some(bed) = q.bed {
                filter.push(format!("tag_bed = {bed}"));
            }
        }
    }

    let cond = if !filter.is_empty() {
        "where ".to_string() + &filter.join(" AND ")
    } else {
        String::new()
    };

    #[derive(sqlx::FromRow)]
    struct Count {
        count: i64,
    }
    let products_count: Count = sqlx::query_as(&format!(
        "select count(1) as count from products {cond}"
    ))
    .fetch_one(&state.sql)
    .await?;
    let pages = if products_count.count > 0 {
        // (products_count.count as f32 / 32f32).ceil() as u32
        products_count.count as u32 / 32
    } else {
        0
    };

    log::info!("pages: {page}/{pages} | count: {}", products_count.count);

    let products: Vec<Product> = sqlx::query_as(&format!(
        "select * from products {} order by created_at {} limit 32 offset ?",
        cond, sort
    ))
    .bind(page * 32)
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

    let result =
        state.env.get_template("products/index.html")?.render(context! {
            products => products,
            tags => tags,
            pages => pages,
            page => page
        })?;

    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/products/{slug}")]
async fn product(path: Path<(String,)>, state: Data<AppState>) -> Response {
    // let path = Path::<(String,)>::extract(&rq).await;
    // if path.is_err() {
    //     return Ok(HttpResponse::NotFound()
    //         .content_type(ContentType::html())
    //         .body("404"));
    // }

    let slug = &path.0;
    let product = sqlx::query_as! {
        Product, "select * from products where slug = ?", slug
    }
    .fetch_one(&state.sql)
    .await?;

    let mut related = sqlx::query_as! {
        Product,
        "select * from products where id != ? and kind = ? and (tag_leg = ? or tag_bed = ?) limit 4",
        product.id, product.kind, product.tag_leg, product.tag_bed
    }
    .fetch_all(&state.sql)
    .await?;

    if related.len() < 4 {
        let limit = 4 - related.len() as i64;
        let other_related = sqlx::query_as! {
            Product,
            "select * from products where id != ? and kind = ? limit ?",
            product.id, product.kind, limit
        }
        .fetch_all(&state.sql)
        .await?;

        related.extend(other_related);
    }

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

    let result =
        state.env.get_template("product/index.html")?.render(context! {
            product => product,
            related => related,
            tags => tags,
        })?;

    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/contact")]
async fn contact(state: Data<AppState>) -> Response {
    let result = state.env.get_template("contact/index.html")?.render(())?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/about")]
async fn about(state: Data<AppState>) -> Response {
    let result = state.env.get_template("about/index.html")?.render(())?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[get("/blogs")]
async fn blogs(rq: HttpRequest, state: Data<AppState>) -> Response {
    let tmpl = state.env.get_template("blogs/index.html")?;
    let mut page = 0;

    if let Ok(q) = Query::<ListInput>::extract(&rq).await {
        page = q.page;
    }

    let conf = Config::get();
    let url = conf.simurgh_url(&format!("/blogs-ssr/?page={page}"));

    let res = conf.simurgh.get(url).send().await?.text().await?;

    let result = tmpl.render(context! { blogs_body => res })?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "snake_case")]
enum BlogStatus {
    Draft,
    Published,
}

#[derive(Debug, Deserialize, Serialize)]
struct Blog {
    id: i64,
    slug: String,
    status: BlogStatus,
    author: Option<i64>,
    project: Option<i64>,
    category: Option<i64>,
    created_at: i64,
    updated_at: i64,
    title: String,
    detail: String,
    html: String,
    data: serde_json::Value,
    read_time: i64,
    thumbnail: Option<String>,
}

#[derive(Debug, Deserialize)]
struct BlogSSRR {
    blog: Blog,
    html: String,
}

#[get("/blogs/{slug}")]
async fn blog(path: Path<(String,)>, state: Data<AppState>) -> Response {
    let tmpl = state.env.get_template("blog/index.html")?;

    let conf = Config::get();
    let url = conf.simurgh_url(&format!("/blogs-ssr/{}/", path.0));
    let res = conf.simurgh.get(url).send().await?.json::<BlogSSRR>().await?;

    let result = tmpl.render(context! {
        blog_body => res.html,
        blog => res.blog,
    })?;
    Ok(HttpResponse::Ok().content_type(ContentType::html()).body(result))
}

#[routes]
#[get("/admin")]
#[get("/admin/{path:.*}")]
async fn admin_index() -> HttpResponse {
    let result = std::fs::read_to_string("admin/dist/index.html")
        .unwrap_or("err reading admin index.html".to_string());
    HttpResponse::Ok().content_type(ContentType::html()).body(result)
}

#[get("/robots.txt")]
async fn robots() -> HttpResponse {
    HttpResponse::Ok().content_type(ContentType::plaintext()).body(
        r###"User-agent: *
Disallow: /admin/
Disallow: /api/

User-agent: *
Allow: /

Sitemap: https://heydari-mi.com/sitemap.xml
"###,
    )
}

pub async fn not_found(state: Data<AppState>) -> Response {
    let result = state.env.get_template("404.html")?.render(())?;
    Ok(HttpResponse::NotFound().content_type(ContentType::html()).body(result))
}

pub fn toman(irr: i64) -> String {
    (irr / 10)
        .to_string()
        .as_bytes()
        .rchunks(3)
        .rev()
        .map(std::str::from_utf8)
        .collect::<Result<Vec<&str>, _>>()
        .unwrap_or_default()
        .join(",")
}

pub fn templates() -> Environment<'static> {
    let tmpl_path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("templates");
    let mut tmpl_env = Environment::new();
    tmpl_env.add_filter("toman", toman);
    tmpl_env.set_loader(path_loader(tmpl_path));
    tmpl_env
}

pub fn router() -> impl HttpServiceFactory {
    Scope::new("")
        .wrap(NormalizePath::trim())
        .service(home)
        .service(products)
        .service(product)
        .service(contact)
        .service(about)
        .service(blogs)
        .service(blog)
        .service(admin_index)
        .service(robots)
        .service(web::resource("/404/").get(not_found))
        .service(super::sitemap::router())
}
