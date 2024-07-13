use crate::{utils, AppState};
use actix_web::dev::{ConnectionInfo, HttpServiceFactory};
use actix_web::http::header::ContentType;
use actix_web::middleware::NormalizePath;
use actix_web::web::Data;
use actix_web::{get, HttpResponse, Scope};
use cercis::prelude::*;
use chrono::TimeZone;

#[get("/sitemap-web.xml")]
async fn web(conn: ConnectionInfo) -> HttpResponse {
    let host = format!("{}://{}", conn.scheme(), conn.host());
    let result = rsx! {
        urlset {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
            url {
                loc {"{host}/"}
                lastmod { "2024-07-01" }
            }
            url {
                loc {"{host}/about/"}
                lastmod { "2024-07-01" }
            }
            url {
                loc {"{host}/contact/"}
                lastmod { "2024-07-01" }
            }
        }
    }
    .render();

    HttpResponse::Ok()
        .content_type(ContentType::xml())
        .body(r#"<?xml version="1.0" encoding="UTF-8"?>"#.to_string() + &result)
}

#[get("/sitemap-blogs.xml")]
async fn blogs(conn: ConnectionInfo) -> HttpResponse {
    let base_url = format!("{}://{}/blogs", conn.scheme(), conn.host());

    let url = format!("/blogs-sitemap/?base_url={base_url}");
    let sitemap = utils::simurgh_request(&url).await.unwrap_or_default();

    HttpResponse::Ok().content_type(ContentType::xml()).body(sitemap)
}

#[get("/sitemap-products.xml")]
async fn products(conn: ConnectionInfo, state: Data<AppState>) -> HttpResponse {
    let host = format!("{}://{}", conn.scheme(), conn.host());

    let products = sqlx::query! {
        "select slug, created_at, updated_at from products"
    }
    .fetch_all(&state.sql)
    .await
    .unwrap_or_default();

    let products = products.iter().map(|r| {
        let ts = if r.updated_at == 0 { r.created_at } else { r.updated_at };
        let dt = chrono::Local
            .timestamp_opt(ts, 0)
            .latest()
            .and_then(|v| Some(v.to_rfc3339()));
        (r.slug.clone(), dt)
    });

    let result = rsx! {
        urlset {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
            for (slug, ts) in products {
                url {
                    loc {"{host}/products/{slug}/"}
                    if let Some(ts) = ts { lastmod { "{ts}" } }
                }
            }
        }
    }
    .render();

    HttpResponse::Ok()
        .content_type(ContentType::xml())
        .body(r#"<?xml version="1.0" encoding="UTF-8"?>"#.to_string() + &result)
}

#[get("/sitemap.xml")]
async fn index(conn: ConnectionInfo) -> HttpResponse {
    let host = format!("{}://{}", conn.scheme(), conn.host());
    let result = rsx! {
        sitemapindex {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
            sitemap { loc { "{host}/sitemap-web.xml/" } }
            sitemap { loc { "{host}/sitemap-products.xml/" } }
            sitemap { loc { "{host}/sitemap-blogs.xml/" } }
        }
    }
    .render();

    HttpResponse::Ok()
        .content_type(ContentType::xml())
        .body(r#"<?xml version="1.0" encoding="UTF-8"?>"#.to_string() + &result)
}

pub fn router() -> impl HttpServiceFactory {
    Scope::new("")
        .wrap(NormalizePath::trim())
        .service(index)
        .service(web)
        .service(products)
        .service(blogs)
}
