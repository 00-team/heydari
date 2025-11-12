use crate::docs::UpdatePaths;
use crate::models::order::Order;
use crate::models::order::OrderState;
use crate::models::user::perms;
use crate::models::user::Admin;
use crate::models::user::User;
use crate::models::{AppErr, Response};
use crate::utils;
use crate::AppState;
use actix_web::web::{Data, Json, Query};
use actix_web::{delete, get, patch, HttpResponse, Scope};
use potk::Perms;
use serde::Deserialize;
use sqlx::Sqlite;
use std::collections::HashMap;
use utoipa::{OpenApi, ToSchema};

#[derive(OpenApi)]
#[openapi(
    tags((name = "admin::order")),
    paths(r_list, r_get, r_update, r_delete),
    servers((url = "/orders")),
    modifiers(&UpdatePaths)
)]
pub struct ApiDoc;

#[derive(serde::Deserialize, utoipa::IntoParams)]
struct AdminOrderListParams {
    #[param(example = 0)]
    page: u32,
    state: OrderState,
}

#[utoipa::path(
    get,
    params(AdminOrderListParams),
    responses((status = 200, body = Vec<(Order, Option<User>)>))
)]
/// List
#[get("/")]
async fn r_list(
    admin: Admin, q: Query<AdminOrderListParams>, state: Data<AppState>,
) -> Response<Vec<(Order, Option<User>)>> {
    admin.perm_check(perms::V_ORDER)?;

    let offset = q.page as i64 * 32;
    let orders = sqlx::query_as! {
        Order,
        "select * from orders where state = ? order by id desc limit 32 offset ?",
        q.state, offset
    }
    .fetch_all(&state.sql)
    .await?;

    let mut users = HashMap::<i64, Option<User>>::from_iter(
        orders.iter().map(|o| (o.user, None)),
    );

    if !users.is_empty() {
        let mut s = String::with_capacity(1024);
        s.push_str("select * from users where id IN (");
        for id in users.keys() {
            s.push_str(&id.to_string());
            s.push(',');
        }
        s.pop();
        s.push(')');

        let ul =
            sqlx::query_as::<Sqlite, User>(&s).fetch_all(&state.sql).await?;

        for mut u in ul {
            u.token = None;
            if let Some(oo) = users.get_mut(&u.id) {
                *oo = Some(u);
            } else {
                users.insert(u.id, Some(u));
            }
        }
    }

    let mut out = Vec::with_capacity(orders.len());
    for o in orders {
        let u = users.get(&o.user).and_then(|v| v.clone());
        out.push((o, u));
    }
    Ok(Json(out))
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
