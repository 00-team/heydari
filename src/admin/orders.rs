use crate::docs::UpdatePaths;
use crate::models::order::Order;
use crate::models::order::OrderState;
use crate::models::user::perms;
use crate::models::user::Admin;
use crate::models::user::User;
use crate::models::ListInput;
use crate::models::{AppErr, Response};
use crate::utils;
use crate::AppState;
use actix_web::web::{Data, Json, Query};
use actix_web::{delete, get, patch, HttpResponse, Scope};
use potk::Perms;
use serde::Deserialize;
use serde::Serialize;
use sqlx::Sqlite;
use std::collections::HashSet;
use utoipa::{OpenApi, ToSchema};

#[derive(OpenApi)]
#[openapi(
    tags((name = "admin::order")),
    paths(r_list, r_get, r_update, r_delete),
    servers((url = "/orders")),
    modifiers(&UpdatePaths)
)]
pub struct ApiDoc;

#[derive(Serialize, ToSchema)]
struct OrderList {
    orders: Vec<Order>,
    users: Vec<User>,
}

#[utoipa::path(
    get,
    params(ListInput),
    responses((status = 200, body = OrderList))
)]
/// List
#[get("/")]
async fn r_list(
    admin: Admin, q: Query<ListInput>, state: Data<AppState>,
) -> Response<OrderList> {
    admin.perm_check(perms::V_ORDER)?;

    let offset = q.page as i64 * 32;
    let orders = sqlx::query_as! {
        Order,
        "select * from orders order by id desc limit 32 offset ?",
        offset
    }
    .fetch_all(&state.sql)
    .await?;

    let user_ids = HashSet::<i64>::from_iter(orders.iter().map(|o| o.user));

    let users = if !user_ids.is_empty() {
        let mut s = String::with_capacity(1024);
        s.push_str("select * from users where id IN (");
        for id in user_ids.iter() {
            s.push_str(&id.to_string());
            s.push(',');
        }
        s.pop();
        s.push(')');

        let mut users =
            sqlx::query_as::<Sqlite, User>(&s).fetch_all(&state.sql).await?;

        users.iter_mut().for_each(|user| user.token = None);
        users
    } else {
        vec![]
    };

    Ok(Json(OrderList { orders, users }))
}

#[utoipa::path(
    get,
    params(("oid" = i64, Path,)),
    responses((status = 200, body = Order))
)]
/// Get
#[get("/{oid}/")]
async fn r_get(admin: Admin, order: Order) -> Response<Order> {
    admin.perm_check(perms::V_ORDER)?;
    Ok(Json(order))
}

#[derive(Deserialize, ToSchema)]
struct OrderUpdateBody {
    state: OrderState,
}

#[utoipa::path(
    patch,
    params(("oid" = i64, Path,)),
    request_body = OrderUpdateBody,
    responses((status = 200, body = Order))
)]
/// Update
#[patch("/{oid}/")]
async fn r_update(
    admin: Admin, mut order: Order, body: Json<OrderUpdateBody>,
    state: Data<AppState>,
) -> Response<Order> {
    admin.perm_check_many(&[perms::V_ORDER, perms::C_ORDER])?;

    order.state = body.state;
    order.updated_at = utils::now();

    sqlx::query! {
        "update orders set state = ?, updated_at = ? where id = ?",
        order.state,
        order.updated_at,
        order.id
    }
    .execute(&state.sql)
    .await?;

    Ok(Json(order))
}

#[utoipa::path(
    delete,
    params(("oid" = i64, Path,)),
    responses((status = 200))
)]
/// Delete
#[delete("/{oid}/")]
async fn r_delete(
    admin: Admin, order: Order, state: Data<AppState>,
) -> Result<HttpResponse, AppErr> {
    admin.perm_check_many(&[perms::V_ORDER, perms::D_ORDER])?;

    sqlx::query! {
        "delete from orders where id = ?",
        order.id
    }
    .execute(&state.sql)
    .await?;

    Ok(HttpResponse::Ok().finish())
}

pub fn router() -> Scope {
    Scope::new("/orders")
        .service(r_list)
        .service(r_get)
        .service(r_update)
        .service(r_delete)
}
