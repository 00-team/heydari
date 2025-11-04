use crate::config::Config;
use actix_files as af;
use actix_web::{
    get, middleware,
    web::{scope, Data, Path, Redirect, ServiceConfig},
    App, HttpResponse, HttpServer,
};
use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode};
use sqlx::{Pool, Sqlite, SqlitePool};
use std::str::FromStr;

use crate::models::{ErrorCode, AppErr};

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

#[get("/simurgh-record/{path:.*}")]
async fn redirect_simrugh_record(path: Path<(String,)>) -> Redirect {
    Redirect::to(format!("{}/simurgh-record/{}", Config::SIMURGH_HOST, path.0))
        .permanent()
}

#[get("/simurgh-ssrs/{path:.*}")]
async fn redirect_simrugh_ssrs(path: Path<(String,)>) -> Redirect {
    Redirect::to(format!("{}/simurgh-ssrs/{}", Config::SIMURGH_HOST, path.0))
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

    app.service(docs::r_openapi).service(docs::r_rapidoc);
    app.service(
        scope("/api")
            .service(api::user::router())
            .service(api::verification::verification)
            .service(
                scope("/admin")
                    .service(admin::materials::router())
                    .service(admin::orders::router())
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
        const PATH: &str = "/usr/share/nginx/socks/heydari.sock";
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
