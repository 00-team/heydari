use crate::docs::UpdatePaths;
use crate::models::material::Material;
use crate::models::user::perms;
use crate::models::user::Admin;
use crate::models::user::User;
use crate::models::ListInput;
use crate::models::{AppErr, Response};
use crate::utils;
use crate::AppState;
use actix_multipart::form::tempfile::TempFile;
use actix_multipart::form::MultipartForm;
use actix_web::web::{Data, Json, Query};
use actix_web::{delete, get, patch, post, put, HttpResponse, Scope};
use itertools::Itertools;
use potk::Perms;
use serde::Deserialize;
use serde::Serialize;
use std::collections::HashSet;
use utoipa::{OpenApi, ToSchema};

#[derive(OpenApi)]
#[openapi(
    tags((name = "admin::material")),
    paths(list, add, update_info, update_count, delete, photo_set, photo_del),
    components(schemas(
        Material, MaterialAddBody, MaterialUpdateInfoBody, MaterialPhoto,
        MaterialList, MaterialUpdateCountBody
    )),
    servers((url = "/materials")),
    modifiers(&UpdatePaths)
)]
pub struct ApiDoc;

#[derive(Serialize, ToSchema)]
struct MaterialList {
    materials: Vec<Material>,
    users: Vec<User>,
}

#[utoipa::path(
    get,
    params(ListInput),
    responses((status = 200, body = MaterialList))
)]
/// List
#[get("/")]
async fn list(
    admin: Admin, q: Query<ListInput>, state: Data<AppState>,
) -> Response<MaterialList> {
    admin.perm_check(perms::V_MATERIAL)?;

    let offset = q.page as i64 * 32;
    let materials = sqlx::query_as! {
        Material,
        "select * from materials order by id desc limit 32 offset ?",
        offset
    }
    .fetch_all(&state.sql)
    .await?;

    let mut user_ids = HashSet::<i64>::new();
    for m in materials.iter() {
        if let Some(uid) = m.updated_by {
            user_ids.insert(uid);
        }
        if let Some(uid) = m.created_by {
            user_ids.insert(uid);
        }
    }

    let users = if !user_ids.is_empty() {
        let user_ids = user_ids.iter().join(",");
        let mut users = sqlx::query_as! {
            User, "select * from users where id in (?)", user_ids
        }
        .fetch_all(&state.sql)
        .await?;

        users.iter_mut().for_each(|user| user.token = None);
        users
    } else {
        vec![]
    };

    Ok(Json(MaterialList { materials, users }))
}

#[derive(Deserialize, ToSchema)]
struct MaterialAddBody {
    name: String,
    detail: String,
    count: i64,
}

#[utoipa::path(
    post,
    request_body = MaterialAddBody,
    responses((status = 200, body = Material))
)]
/// Add
#[post("/")]
async fn add(
    admin: Admin, body: Json<MaterialAddBody>, state: Data<AppState>,
) -> Response<Material> {
    admin.perm_check_many(&[perms::V_MATERIAL, perms::A_MATERIAL])?;

    let now = utils::now();

    let result = sqlx::query! {
        "insert into materials(name, detail, count, created_at, created_by)
        values(?,?,?,?,?)",
        body.name, body.detail, body.count, now, admin.user.id,
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(Material {
        id: result.last_insert_rowid(),
        name: body.name.clone(),
        detail: body.detail.clone(),
        count: body.count,
        created_at: now,
        created_by: Some(admin.user.id),
        ..Default::default()
    }))
}

#[derive(Deserialize, ToSchema)]
struct MaterialUpdateInfoBody {
    name: String,
    detail: String,
}

#[utoipa::path(
    patch,
    params(("mid" = i64, Path,)),
    request_body = MaterialUpdateInfoBody,
    responses((status = 200, body = Material))
)]
/// Update Info
#[patch("/{mid}/info/")]
async fn update_info(
    admin: Admin, mut material: Material, body: Json<MaterialUpdateInfoBody>,
    state: Data<AppState>,
) -> Response<Material> {
    admin.perm_check_many(&[perms::V_MATERIAL, perms::C_MATERIAL_INFO])?;

    material.name = body.name.clone();
    material.detail = body.detail.clone();
    // material.count = body.count;
    material.updated_at = utils::now();
    material.updated_by = Some(admin.user.id);

    sqlx::query! {
        "update materials set
        name = ?,
        detail = ?,
        updated_at = ?,
        updated_by = ?
        where id = ?",
        material.name,
        material.detail,
        material.updated_at,
        material.updated_by,
        material.id
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(material))
}

#[derive(Deserialize, ToSchema)]
struct MaterialUpdateCountBody {
    count: i64,
}

#[utoipa::path(
    patch,
    params(("mid" = i64, Path,)),
    request_body = MaterialUpdateCountBody,
    responses((status = 200, body = Material))
)]
/// Update Count
#[patch("/{mid}/count/")]
async fn update_count(
    admin: Admin, mut material: Material, body: Json<MaterialUpdateCountBody>,
    state: Data<AppState>,
) -> Response<Material> {
    admin.perm_check_many(&[perms::V_MATERIAL, perms::C_MATERIAL_COUNT])?;

    material.count = body.count;
    material.updated_at = utils::now();
    material.updated_by = Some(admin.user.id);

    sqlx::query! {
        "update materials set
        count = ?,
        updated_at = ?,
        updated_by = ?
        where id = ?",
        material.count,
        material.updated_at,
        material.updated_by,
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
    admin.perm_check_many(&[perms::V_MATERIAL, perms::C_MATERIAL_INFO])?;

    let salt = if let Some(s) = &material.photo {
        s.clone()
    } else {
        let s = utils::get_random_bytes(8);
        material.photo = Some(s.clone());
        s
    };

    sqlx::query_as! {
        Material,
        "update materials set photo = ? where id = ?",
        material.photo, material.id
    }
    .execute(&state.sql)
    .await?;

    let filename = format!("mp-{}-{}", material.id, salt);
    utils::save_photo(form.photo.file.path(), &filename, (1024, 1024))?;

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
    admin.perm_check_many(&[perms::V_MATERIAL, perms::C_MATERIAL_INFO])?;

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
        .service(update_info)
        .service(update_count)
        .service(delete)
        .service(photo_set)
        .service(photo_del)
}
