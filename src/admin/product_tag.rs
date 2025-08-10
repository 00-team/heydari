use crate::docs::UpdatePaths;
use crate::models::product::{ProductKind, ProductPart, ProductTag};
use crate::models::user::{perms, Admin};
use crate::models::{AppErr, ListInput, Response};
use crate::utils::CutOff;
use crate::AppState;
use actix_web::web::{Data, Json, Query};
use actix_web::{delete, get, patch, post, HttpResponse, Scope};
use serde::Deserialize;
use shah::perms::Perms;
use utoipa::{OpenApi, ToSchema};

#[derive(OpenApi)]
#[openapi(
    tags((name = "admin::product_tag")),
    paths(tag_list, tag_get, tag_add, tag_update, tag_delete),
    components(schemas(ProductTagAddBody, ProductTagUpdateBody)),
    servers((url = "/product-tags")),
    modifiers(&UpdatePaths)
)]
pub struct ApiDoc;

#[utoipa::path(
    get,
    params(ListInput),
    responses((status = 200, body = Vec<ProductTag>))
)]
/// List
#[get("/")]
async fn tag_list(
    admin: Admin, query: Query<ListInput>, state: Data<AppState>,
) -> Response<Vec<ProductTag>> {
    admin.perm_check(perms::V_PRODUCT_TAG)?;

    let offset = i64::from(query.page) * 64;
    let result = sqlx::query_as! {
        ProductTag,
        "select * from product_tags order by id desc limit 64 offset ?",
        offset
    }
    .fetch_all(&state.sql)
    .await?;

    Ok(Json(result))
}

#[utoipa::path(
    get,
    params(("id" = i64, Path, example = 1)),
    responses((status = 200, body = ProductTag))
)]
/// Get
#[get("/{id}/")]
async fn tag_get(admin: Admin, tag: ProductTag) -> Response<ProductTag> {
    admin.perm_check(perms::V_PRODUCT_TAG)?;
    Ok(Json(tag))
}

#[derive(Deserialize, ToSchema)]
struct ProductTagAddBody {
    name: String,
    kind: ProductKind,
    part: ProductPart,
}

#[utoipa::path(
    post,
    request_body = ProductTagAddBody,
    responses((status = 200, body = ProductTag))
)]
/// Add
#[post("/")]
async fn tag_add(
    admin: Admin, mut body: Json<ProductTagAddBody>, state: Data<AppState>,
) -> Response<ProductTag> {
    admin.perm_check_many(&[perms::V_PRODUCT_TAG, perms::A_PRODUCT_TAG])?;

    body.name.cut_off(1024);

    let result = sqlx::query! {
        "insert into product_tags(kind, name, part) values(?,?,?)",
        body.kind, body.name, body.part
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(ProductTag {
        id: result.last_insert_rowid(),
        kind: body.kind.clone(),
        name: body.name.clone(),
        part: body.part.clone(),
        count: 0,
    }))
}

#[derive(Deserialize, ToSchema)]
struct ProductTagUpdateBody {
    name: String,
}

#[utoipa::path(
    patch,
    params(("id" = i64, Path,)),
    request_body = ProductTagUpdateBody,
    responses((status = 200, body = ProductTag))
)]
/// Update
#[patch("/{id}/")]
async fn tag_update(
    admin: Admin, mut tag: ProductTag, body: Json<ProductTagUpdateBody>,
    state: Data<AppState>,
) -> Response<ProductTag> {
    admin.perm_check_many(&[perms::V_PRODUCT_TAG, perms::C_PRODUCT_TAG])?;

    tag.name = body.name.clone();
    tag.name.cut_off(1024);

    sqlx::query! {
        "update product_tags set name = ? where id = ?",
        tag.name, tag.id
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(tag))
}

#[utoipa::path(
    delete,
    params(("id" = i64, Path,)),
    responses((status = 200))
)]
/// Delete
#[delete("/{id}/")]
async fn tag_delete(
    admin: Admin, tag: ProductTag, state: Data<AppState>,
) -> Result<HttpResponse, AppErr> {
    admin.perm_check_many(&[perms::V_PRODUCT_TAG, perms::D_PRODUCT_TAG])?;

    sqlx::query! {
        "delete from product_tags where id = ?",
        tag.id
    }
    .execute(&state.sql)
    .await?;

    Ok(HttpResponse::Ok().finish())
}
pub fn router() -> Scope {
    Scope::new("/product-tags")
        .service(tag_list)
        .service(tag_get)
        .service(tag_add)
        .service(tag_update)
        .service(tag_delete)
}
