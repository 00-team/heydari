use crate::docs::UpdatePaths;
use crate::models::user::{perms, Admin, User};
use crate::models::{AppErrForbidden, ListInput, Response};
use crate::utils::CutOff;
use crate::AppState;
use actix_web::web::{Data, Json, Path, Query};
use actix_web::{get, patch, Scope};
use potk::Perms;
use serde::Deserialize;
use utoipa::{OpenApi, ToSchema};

#[derive(OpenApi)]
#[openapi(
    tags((name = "admin::users")),
    paths(list, get, update),
    components(schemas(User, AdminUserUpdateBody)),
    servers((url = "/users")),
    modifiers(&UpdatePaths)
)]
pub struct ApiDoc;

#[utoipa::path(
    get,
    params(ListInput),
    responses((status = 200, body = Vec<User>))
)]
/// List
#[get("/")]
async fn list(
    admin: Admin, query: Query<ListInput>, state: Data<AppState>,
) -> Response<Vec<User>> {
    admin.perm_check_many(&[perms::V_USER])?;

    let offset = i64::from(query.page) * 32;
    let users = sqlx::query_as! {
        User,
        "select * from users limit 32 offset ?",
        offset
    }
    .fetch_all(&state.sql)
    .await?;

    Ok(Json(users))
}

#[utoipa::path(
    get,
    params(("uid" = i64, Path, example = 1)),
    responses((status = 200, body = User))
)]
/// Get
#[get("/{uid}/")]
async fn get(
    admin: Admin, path: Path<(i64,)>, state: Data<AppState>,
) -> Response<User> {
    admin.perm_check(perms::V_USER)?;

    let user = sqlx::query_as! {
        User,
        "select * from users where id = ?",
        path.0
    }
    .fetch_one(&state.sql)
    .await?;

    Ok(Json(user))
}

#[derive(Deserialize, ToSchema)]
struct AdminUserUpdateBody {
    banned: bool,
    name: Option<String>,
    perms: Option<[u8; 32]>,
}

#[utoipa::path(
    patch,
    params(("id" = i64, Path,)),
    request_body = AdminUserUpdateBody,
    responses((status = 200, body = User))
)]
/// Update
#[patch("/{id}/")]
async fn update(
    admin: Admin, path: Path<(i64,)>, body: Json<AdminUserUpdateBody>,
    state: Data<AppState>,
) -> Response<User> {
    admin.perm_check_many(&[perms::V_USER, perms::C_USER])?;

    let mut user = sqlx::query_as! {
        User,
        "select * from users where id = ?",
        path.0
    }
    .fetch_one(&state.sql)
    .await?;

    user.name = body.name.clone();
    user.name.cut_off(255);

    if body.banned && user.admin.perm_any() {
        return Err(AppErrForbidden(Some("cannot ban an admin")));
    }
    user.banned = body.banned;

    if let Some(np) = body.perms {
        admin.perm_check(perms::MASTER)?;
        if user.admin.perm_get(perms::MASTER) {
            return Err(AppErrForbidden(Some("cannot edit master's perms")));
        }
        if np.perm_get(perms::MASTER) {
            return Err(AppErrForbidden(Some("cannot set master's perms")));
        }
        user.admin = np.to_vec();
    }

    sqlx::query_as! {
        User,
        "update users set name = ?, banned = ?, admin = ? where id = ?",
        user.name, user.banned, user.admin, user.id
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(user))
}

pub fn router() -> Scope {
    Scope::new("/users").service(list).service(get).service(update)
}
