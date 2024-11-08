use crate::docs::UpdatePaths;
use crate::models::material::Material;
use crate::models::user::perms;
use crate::models::user::Admin;
use crate::models::ListInput;
use crate::models::{AppErr, Response};
use crate::utils::{self, CutOff};
use crate::AppState;
use actix_multipart::form::tempfile::TempFile;
use actix_multipart::form::MultipartForm;
use actix_web::web::{Data, Json, Query};
use actix_web::{delete, get, patch, post, put, HttpResponse, Scope};
use serde::Deserialize;
use shah::perms::Perms;
use utoipa::{OpenApi, ToSchema};

#[derive(OpenApi)]
#[openapi(
    tags((name = "admin::material")),
    paths(list, add, update, delete, photo_set, photo_del),
    components(schemas(
        Material, MaterialAddBody, MaterialUpdateBody, MaterialPhoto
    )),
    servers((url = "/materials")),
    modifiers(&UpdatePaths)
)]
pub struct ApiDoc;

#[utoipa::path(
    get,
    params(ListInput),
    responses((status = 200, body = Vec<Material>))
)]
/// List
#[get("/")]
async fn list(
    admin: Admin, q: Query<ListInput>, state: Data<AppState>,
) -> Response<Vec<Material>> {
    admin.perm_check(perms::V_MATERIAL)?;

    let offset = q.page as i64 * 32;
    let materials = sqlx::query_as! {
        Material,
        "select * from materials order by id desc limit 32 offset ?",
        offset
    }
    .fetch_all(&state.sql)
    .await?;

    Ok(Json(materials))
}

#[derive(Deserialize, ToSchema)]
struct MaterialAddBody {
    name: String,
    detail: String,
}

#[utoipa::path(
    post,
    request_body = MaterialAddBody,
    responses((status = 200, body = Material))
)]
/// Add
#[post("/")]
async fn add(
    admin: Admin, mut body: Json<MaterialAddBody>, state: Data<AppState>,
) -> Response<Material> {
    admin.perm_check_many(&[perms::V_MATERIAL, perms::A_MATERIAL])?;

    let now = utils::now();

    body.name.cut_off(255);
    body.detail.cut_off(2047);

    let result = sqlx::query! {
        "insert into materials(name, detail, created_at)
        values(?,?,?)",
        body.name, body.detail, now
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(Material {
        id: result.last_insert_rowid(),
        name: body.name.clone(),
        detail: body.detail.clone(),
        created_at: now,
        ..Default::default()
    }))
}

#[derive(Deserialize, ToSchema)]
struct MaterialUpdateBody {
    name: String,
    detail: String,
    count: i64,
}

#[utoipa::path(
    patch,
    params(("mid" = i64, Path,)),
    request_body = MaterialUpdateBody,
    responses((status = 200, body = Material))
)]
/// Update
#[patch("/{mid}/")]
async fn update(
    admin: Admin, mut material: Material, body: Json<MaterialUpdateBody>,
    state: Data<AppState>,
) -> Response<Material> {
    admin.perm_check_many(&[perms::V_MATERIAL, perms::C_MATERIAL])?;

    material.name = body.name.clone();
    material.detail = body.detail.clone();
    material.count = body.count;
    material.updated_at = utils::now();

    material.name.cut_off(255);
    material.detail.cut_off(2047);

    sqlx::query! {
        "update materials set
        name = ?,
        detail = ?,
        count = ?,
        updated_at = ?
        where id = ?",
        material.name,
        material.detail,
        material.count,
        material.updated_at,
        material.id
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(material))
}

#[utoipa::path(
    delete,
    params(("mid" = i64, Path,)),
    responses((status = 200))
)]
/// Delete
#[delete("/{mid}/")]
async fn delete(
    admin: Admin, material: Material, state: Data<AppState>,
) -> Result<HttpResponse, AppErr> {
    admin.perm_check_many(&[perms::V_MATERIAL, perms::D_MATERIAL])?;

    if let Some(p) = material.photo {
        utils::remove_record(&format!("mp-{}-{p}", material.id));
    }

    sqlx::query! {
        "delete from materials where id = ?",
        material.id
    }
    .execute(&state.sql)
    .await?;

    Ok(HttpResponse::Ok().finish())
}

#[derive(Debug, MultipartForm, ToSchema)]
pub struct MaterialPhoto {
    #[schema(value_type = String, format = Binary)]
    #[multipart(limit = "20MB")]
    pub photo: TempFile,
}

#[utoipa::path(
    put,
    params(("mid" = i64, Path,)),
    request_body(content = MaterialPhoto, content_type = "multipart/form-data"),
    responses((status = 200, body = Material))
)]
/// Set Photo
#[put("/{mid}/photo/")]
async fn photo_set(
    admin: Admin, mut material: Material, form: MultipartForm<MaterialPhoto>,
    state: Data<AppState>,
) -> Response<Material> {
    admin.perm_check_many(&[perms::V_MATERIAL, perms::C_MATERIAL])?;

    let salt = if let Some(s) = &material.photo {
        s.clone()
    } else {
        let s = utils::get_random_bytes(8);
        material.photo = Some(s.clone());
        s
    };

    let filename = format!("mp-{}-{}", material.id, salt);
    utils::save_photo(form.photo.file.path(), &filename, (1024, 1024))?;

    sqlx::query_as! {
        Material,
        "update materials set photo = ? where id = ?",
        material.photo, material.id
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(material))
}

#[utoipa::path(
    delete,
    params(("mid" = i64, Path,)),
    responses((status = 200, body = Material))
)]
/// Del Photo
#[delete("/{mid}/photo/")]
async fn photo_del(
    admin: Admin, mut material: Material, state: Data<AppState>,
) -> Response<Material> {
    admin.perm_check_many(&[perms::V_MATERIAL, perms::C_MATERIAL])?;

    if let Some(p) = material.photo {
        utils::remove_record(&format!("mp-{}-{p}", material.id));
        material.photo = None;
    }

    sqlx::query_as! {
        Material,
        "update materials set photo = ? where id = ?",
        material.photo, material.id
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(material))
}

pub fn router() -> Scope {
    Scope::new("/materials")
        .service(list)
        .service(add)
        .service(update)
        .service(delete)
        .service(photo_set)
        .service(photo_del)
}
