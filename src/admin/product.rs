use actix_multipart::form::MultipartForm;
use actix_web::error::{Error, ErrorBadRequest};
use actix_web::web::{Data, Json, Path, Query};
use actix_web::{delete, get, patch, post, put, HttpResponse, Scope};
use serde::Deserialize;
use utoipa::{OpenApi, ToSchema};

use crate::docs::UpdatePaths;
use crate::models::product::{Product, ProductKind, ProductPart, ProductTag};
use crate::models::user::Admin;
use crate::models::{AppErr, AppErrBadRequest, ListInput, Response};
// use crate::models::{Admin, ListInput, Photos, Product, Response, UpdatePhoto};
use crate::utils::{self, get_random_bytes, remove_photo, save_photo, CutOff};
use crate::AppState;

#[derive(OpenApi)]
#[openapi(
    tags((name = "admin::product")),
    paths(
        product_list, product_get, product_add, product_update, product_delete
    ),
    components(schemas(Product, ProductAddBody, ProductUpdateBody)),
    servers((url = "/products")),
    modifiers(&UpdatePaths)
)]
pub struct Doc;

#[utoipa::path(
    get,
    params(("page" = u32, Query, example = 0)),
    responses((status = 200, body = Vec<Product>))
)]
/// Product List
#[get("/")]
async fn product_list(
    _: Admin, query: Query<ListInput>, state: Data<AppState>,
) -> Response<Vec<Product>> {
    let offset = i64::from(query.page) * 30;

    let products = sqlx::query_as! {
        Product,
        "select * from products limit 30 offset ?",
        offset
    }
    .fetch_all(&state.sql)
    .await?;

    Ok(Json(products))
}

#[utoipa::path(
    get,
    params(("id" = i64, Path,)),
    responses(
        (status = 200, body = Product)
    )
)]
/// Product Get
#[get("/{id}/")]
async fn product_get(_: Admin, product: Product) -> Json<Product> {
    Json(product)
}

#[derive(Deserialize, ToSchema)]
struct ProductAddBody {
    name: String,
    code: String,
    kind: ProductKind,
}

#[utoipa::path(
    post,
    request_body = ProductAddBody,
    responses((status = 200, body = Product))
)]
/// Add
#[post("/")]
async fn product_add(
    _: Admin, body: Json<ProductAddBody>, state: Data<AppState>,
) -> Response<Product> {
    let now = utils::now();
    let mut body = body;

    body.name.cut_off(255);
    body.code.cut_off(255);

    let result = sqlx::query_as! {
        Product,
        "insert into products(kind, name, code, timestamp) values(?,?,?,?)",
        body.kind, body.name, body.code, now
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(Product {
        id: result.last_insert_rowid(),
        kind: body.kind.clone(),
        name: body.name.clone(),
        code: body.code.clone(),
        timestamp: now,
        ..Default::default()
    }))
}

#[derive(Deserialize, ToSchema)]
struct ProductUpdateBody {
    name: String,
    code: String,
    detail: String,
    tag_leg: Option<i64>,
    tag_bed: Option<i64>,
}

#[utoipa::path(
    patch,
    request_body = ProductUpdateBody,
    responses((status = 200, body = Product))
)]
/// Update
#[patch("/{id}/")]
async fn product_update(
    _: Admin, product: Product, body: Json<ProductUpdateBody>,
    state: Data<AppState>,
) -> Response<Product> {
    let mut product = product;

    product.name = body.name.clone();
    product.code = body.code.clone();
    product.detail = body.detail.clone();

    product.name.cut_off(255);
    product.code.cut_off(255);
    product.detail.cut_off(2048);

    if let Some(id) = body.tag_leg {
        let tag = sqlx::query_as! {
            ProductTag,
            "select * from product_tags where id = ? AND kind = ? AND part = ?",
            id, product.kind, ProductPart::Leg
        }
        .fetch_one(&state.sql)
        .await?;

        product.tag_leg = Some(tag.id);
    }

    if let Some(id) = body.tag_bed {
        let tag = sqlx::query_as! {
            ProductTag,
            "select * from product_tags where id = ? AND kind = ? AND part = ?",
            id, product.kind, ProductPart::Bed
        }
        .fetch_one(&state.sql)
        .await?;

        product.tag_bed = Some(tag.id);
    }

    sqlx::query! {
        "update products set name = ?, code = ?, detail = ?, tag_leg = ?,
        tag_bed = ? where id = ?",
        product.name, product.code, product.detail, product.tag_leg,
        product.tag_bed, product.id
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(product))
}

#[utoipa::path(
    delete,
    params(("id" = i64, Path,)),
    responses((status = 200, body = String))
)]
/// Product Delete
#[delete("/{id}/")]
async fn product_delete(
    _: Admin, path: Path<(i64,)>, state: Data<AppState>,
) -> Result<HttpResponse, AppErr> {
    sqlx::query_as! {
        Product,
        "delete from products where id = ?",
        path.0
    }
    .execute(&state.sql)
    .await?;

    Ok(HttpResponse::Ok().finish())
}

// #[utoipa::path(
//     put,
//     params(("id" = i64, Path,)),
//     request_body(content = UpdatePhoto, content_type = "multipart/form-data"),
//     responses((status = 200, body = Product))
// )]
// /// Product Add Photo
// #[put("/{id}/photo/")]
// async fn product_add_photo(
//     _: Admin, product: Product, form: MultipartForm<UpdatePhoto>,
//     state: Data<AppState>,
// ) -> Response<Product> {
//     let mut product = product;
//     let mut salt = get_random_bytes(8);
//     loop {
//         if !product.photos.salts.iter().any(|s| s == &salt) {
//             break;
//         }
//         salt = get_random_bytes(8);
//     }
//
//     product.photos.salts.push(salt.clone());
//
//     let filename = format!("{}-{}", product.id, salt);
//
//     save_photo(form.photo.file.path(), &filename)?;
//
//     sqlx::query_as! {
//         Product,
//         "update products set photos = ? where id = ?",
//         product.photos, product.id
//     }
//     .execute(&state.sql)
//     .await?;
//
//     Ok(Json(product))
// }
//
// #[utoipa::path(
//     delete,
//     params(
//         ("id" = i64, Path,),
//         ("idx" = u8, Path,),
//     ),
//     responses(
//         (status = 200, body = String)
//     )
// )]
// /// Product Delete Photo
// #[delete("/{id}/photo/{idx}/")]
// async fn product_delete_photo(
//     _: Admin, product: Product, path: Path<(i64, u8)>, state: Data<AppState>,
// ) -> Result<&'static str, Error> {
//     let mut product = product;
//     let idx: usize = path.1.into();
//     if idx >= product.photos.salts.len() {
//         return Err(ErrorBadRequest("photo not found"));
//     }
//
//     let salt = product.photos.salts.remove(idx);
//     remove_photo(&format!("{}-{}", product.id, salt));
//
//     sqlx::query_as! {
//         Product,
//         "update products set photos = ? where id = ?",
//         product.photos, product.id
//     }
//     .execute(&state.sql)
//     .await?;
//
//     Ok("photo was removed")
// }

pub fn router() -> Scope {
    Scope::new("/products")
        .service(product_list)
        .service(product_get)
        .service(product_add)
        .service(product_update)
        .service(product_delete)
    // .service(product_add_photo)
    // .service(product_delete_photo)
}
