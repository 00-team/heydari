use crate::AppState;
use actix_web::dev::{ConnectionInfo, HttpServiceFactory};
use actix_web::http::header::ContentType;
use actix_web::middleware::NormalizePath;
use actix_web::web::Data;
use actix_web::{get, HttpResponse, Scope};
use cercis::prelude::*;

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

#[get("/sitemap-products.xml")]
async fn products(conn: ConnectionInfo, state: Data<AppState>) -> HttpResponse {
    let host = format!("{}://{}", conn.scheme(), conn.host());

    let products = sqlx::query! { "select id from products" }
        .fetch_all(&state.sql)
        .await
        .unwrap_or_default();

    let result = rsx! {
        urlset {
            xmlns: "http://www.sitemaps.org/schemas/sitemap/0.9",
            for p in products {
                url {
                    loc {"{host}/products/{p.id}/"}
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
            sitemap {
                loc { "{host}/sitemap-web.xml/" }
                loc { "{host}/sitemap-products.xml/" }
            }
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
}
