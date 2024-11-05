use crate::config::Config;
use crate::docs::{doc_add_prefix, ApiDoc};
use actix_files as af;
use actix_web::{
    get,
    http::header::ContentType,
    middleware,
    web::{scope, Data, Path, Redirect, ServiceConfig},
    App, HttpResponse, HttpServer, Responder,
};
use config::config;
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode};
use sqlx::{Pool, Sqlite, SqlitePool};
use std::str::FromStr;
use utoipa::OpenApi;

mod admin;
mod api;
mod config;
mod docs;
mod models;
mod sitemap;
mod utils;
mod web;

pub struct AppState {
    pub sql: Pool<Sqlite>,
    pub env: minijinja::Environment<'static>,
}

#[get("/openapi.json")]
async fn openapi() -> impl Responder {
    let mut doc = ApiDoc::openapi();
    doc.merge(api::user::ApiDoc::openapi());
    doc.merge(api::verification::ApiDoc::openapi());

    let mut admin_doc = ApiDoc::openapi();
    admin_doc.merge(admin::product::ApiDoc::openapi());
    admin_doc.merge(admin::product_tag::ApiDoc::openapi());
    admin_doc.merge(admin::users::ApiDoc::openapi());

    doc_add_prefix(&mut admin_doc, "/admin", false);

    doc.merge(admin_doc);

    doc_add_prefix(&mut doc, "/api", false);

    HttpResponse::Ok().json(doc)
}

#[get("/rapidoc")]
async fn rapidoc() -> impl Responder {
    HttpResponse::Ok().content_type(ContentType::html()).body(
        r###"<!doctype html>
    <html><head><meta charset="utf-8"><style>rapi-doc {
    --green: #00dc7d; --blue: #5199ff; --orange: #ff6b00;
    --red: #ec0f0f; --yellow: #ffd600; --purple: #782fef; }</style>
    <script type="module" src="/static/rapidoc.js"></script></head><body> <rapi-doc spec-url="/openapi.json" persist-auth="true"
    bg-color="#040404" text-color="#f2f2f2"
    header-color="#040404" primary-color="#ec0f0f"
    nav-text-color="#eee" font-size="largest"
    allow-spec-url-load="false" allow-spec-file-load="false"
    show-method-in-nav-bar="as-colored-block" response-area-height="500px"
    show-header="false" schema-expand-level="1" /></body> </html>"###,
    )
}

#[get("/simurgh-record/{path:.*}")]
async fn redirect_simrugh_record(path: Path<(String,)>) -> Redirect {
    Redirect::to(format!("{}/simurgh-record/{}", config().simurgh_host, path.0))
        .permanent()
}

#[get("/simurgh-ssrs/{path:.*}")]
async fn redirect_simrugh_ssrs(path: Path<(String,)>) -> Redirect {
    Redirect::to(format!("{}/simurgh-ssrs/{}", config().simurgh_host, path.0))
        .permanent()
}

fn config_app(app: &mut ServiceConfig) {
    if cfg!(debug_assertions) {
        app.service(af::Files::new("/static", "static"));
        app.service(af::Files::new("/admin-assets", "admin/dist/admin-assets"));
        app.service(af::Files::new("/record", Config::RECORD_DIR));
        app.service(redirect_simrugh_record);
        app.service(redirect_simrugh_ssrs);
    }

    app.service(openapi).service(rapidoc);
    app.service(
        scope("/api")
            .service(api::user::router())
            .service(api::verification::verification)
            .service(
                scope("/admin")
                    .service(admin::product::router())
                    .service(admin::product_tag::router())
                    .service(admin::users::router()),
            )
            .default_service(
                actix_web::web::route().to(HttpResponse::NotFound),
            ),
    );
    app.service(web::router());
    app.default_service(actix_web::web::to(|state: Data<AppState>| {
        web::not_found(state)
    }));
}

async fn init() -> Data<AppState> {
    dotenvy::from_path(".env").expect("could not read .env file");
    pretty_env_logger::init();

    let _ = std::fs::create_dir(Config::RECORD_DIR);
    let cpt = SqliteConnectOptions::from_str("sqlite://main.db")
        .expect("could not init sqlite connection options")
        .journal_mode(SqliteJournalMode::Off);

    let pool = SqlitePool::connect_with(cpt).await.expect("sqlite connection");
    Data::new(AppState { sql: pool, env: web::templates() })
}

#[cfg(unix)]
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let data = init().await;

    let server = HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::new("%s %r %Ts"))
            .app_data(data.clone())
            .configure(config_app)
    });

    let server = if cfg!(debug_assertions) {
        server.bind(("127.0.0.1", 7000)).unwrap()
    } else {
        use std::os::unix::fs::PermissionsExt;
        const PATH: &'static str = "/usr/share/nginx/socks/heydari.sock";
        let server = server.bind_uds(PATH).unwrap();
        std::fs::set_permissions(PATH, std::fs::Permissions::from_mode(0o777))?;
        server
    };

    server.run().await
}

#[cfg(windows)]
#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let data = init().await;

    HttpServer::new(move || {
        App::new()
            .wrap(middleware::Logger::new("%s %r %Ts"))
            .app_data(data.clone())
            .configure(config_app)
    })
    .bind(("127.0.0.1", 7000))
    .expect("server bind")
    .run()
    .await
}
