use actix_web::{http::header::ContentType, HttpResponse};
use std::collections::BTreeMap;
use utoipa::{
    openapi::{
        self as oa, security::{ApiKey, ApiKeyValue, SecurityScheme}, Components, Content, RefOr, Response, SecurityRequirement
    },
    Modify, OpenApi,
};

use crate::models::AppErr;

pub struct AddSecurity;

impl Modify for AddSecurity {
    fn modify(&self, openapi: &mut oa::OpenApi) {
        if openapi.components.is_none() {
            openapi.components = Some(Components::new());
        }

        if let Some(schema) = openapi.components.as_mut() {
            schema.add_security_scheme(
                "auth_header",
                SecurityScheme::ApiKey(ApiKey::Header(ApiKeyValue::new(
                    "authorization",
                ))),
            );
            schema.add_security_scheme(
                "auth_cookie",
                SecurityScheme::ApiKey(ApiKey::Cookie(ApiKeyValue::new(
                    "authorization",
                ))),
            );
        }

        openapi.security =
            Some(vec![SecurityRequirement::new("auth_header", [""; 0])]);
    }
}

fn doc_add_prefix(openapi: &mut oa::OpenApi, prefix: &str, update_tags: bool) {
    let mut paths = BTreeMap::new();
    let tags: Vec<String> = openapi
        .tags
        .clone()
        .unwrap_or_default()
        .iter()
        .map(|t| t.name.clone())
        .collect();

    for (url, item) in openapi.paths.paths.iter() {
        let new_url = prefix.to_string() + url;
        let mut item = item.clone();
        let eref = oa::RefOr::Ref(oa::Ref::new("#/components/schemas/AppErr"));
        let content = Content::builder().schema(Some(eref)).build();
        let xxx = oa::RefOr::T(
            Response::builder()
                .description("errors")
                .content("application/json", content)
                .build(),
        );

        macro_rules! op {
            ($($op:ident),*) => {
                $(if let Some(op) = &mut item.$op {
                    op.responses.responses.insert("xxx".to_string(), xxx.clone());
                    if update_tags {
                        op.tags = Some(tags.clone());
                    }
                })*
            };
        }

        op!(get, put, post, delete, options, head, patch, trace);

        paths.insert(new_url, item);
    }
    openapi.paths.paths = paths;
}

pub struct UpdatePaths;

impl Modify for UpdatePaths {
    fn modify(&self, openapi: &mut oa::OpenApi) {
        if let Some(comps) = &mut openapi.components {
            for (k, v) in comps.schemas.iter_mut() {
                if let RefOr::T(oa::Schema::Object(obj)) = v {
                    if obj.title.is_none() {
                        obj.title = Some(k.clone());
                    }
                }
            }
        }

        let base_path = if let Some(s) = openapi.servers.as_mut() {
            if !s.is_empty() {
                s.remove(0).url
            } else {
                String::new()
            }
        } else {
            String::new()
        };

        doc_add_prefix(openapi, &base_path, true);
    }
}

#[derive(utoipa::OpenApi)]
#[openapi(
    servers((url = "/")),
    modifiers(&AddSecurity),
    components(schemas(AppErr))
)]
pub struct ApiDoc;

#[actix_web::get("/openapi.json")]
async fn r_openapi() -> HttpResponse {
    let mut doc = ApiDoc::openapi();
    doc.merge(crate::api::user::ApiDoc::openapi());
    doc.merge(crate::api::orders::ApiDoc::openapi());
    doc.merge(crate::api::verification::ApiDoc::openapi());

    let mut admin_doc = ApiDoc::openapi();
    admin_doc.merge(crate::admin::materials::ApiDoc::openapi());
    admin_doc.merge(crate::admin::product::ApiDoc::openapi());
    admin_doc.merge(crate::admin::product_tag::ApiDoc::openapi());
    admin_doc.merge(crate::admin::orders::ApiDoc::openapi());
    admin_doc.merge(crate::admin::users::ApiDoc::openapi());

    doc_add_prefix(&mut admin_doc, "/admin", false);

    doc.merge(admin_doc);

    doc_add_prefix(&mut doc, "/api", false);

    HttpResponse::Ok().json(doc)
}

#[actix_web::get("/rapidoc")]
async fn r_rapidoc() -> HttpResponse {
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
