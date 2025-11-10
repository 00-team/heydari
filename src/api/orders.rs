use crate::docs::UpdatePaths;
use crate::models::order::{Order, OrderState};
use crate::models::product::Product;
use crate::models::user::User;
use crate::models::Response;
use crate::utils::IrisChannel;
use crate::{utils, AppState};

use actix_web::web::{Data, Json};
use actix_web::{post, Scope};
use utoipa::OpenApi;

#[derive(OpenApi)]
#[openapi(
    tags((name = "api::orders")),
    paths(r_add),
    servers((url = "/orders")),
    modifiers(&UpdatePaths)
)]
pub struct ApiDoc;

#[derive(Debug, serde::Deserialize, utoipa::ToSchema)]
struct UserAddOrderBody {
    product: i64,
    count: i64,
}

#[utoipa::path(
    post,
    request_body = UserAddOrderBody,
    responses((status = 200, body = Order))
)]
/// Add
#[post("/")]
async fn r_add(
    user: User, body: Json<UserAddOrderBody>, state: Data<AppState>,
) -> Response<Order> {
    let product = sqlx::query_as! {
        Product,
        "select * from products where id = ?",
        body.product
    }
    .fetch_one(&state.sql)
    .await?;

    if body.count < 1 {
        return crate::err!(CountMin, "min count is 1 kozo");
    }

    let now = utils::now();
    let adayago = now.saturating_sub(86400);

    let count = sqlx::query!(
        "select COUNT(id) as count from orders where user = ? AND created_at > ?",
        user.id,
        adayago
    )
    .fetch_one(&state.sql).await?;

    if count.count > 100 {
        return crate::err!(RateLimited, "more than 100 req in a day???");
    }

    let mut order = Order {
        id: 0,
        updated_at: 0,
        created_at: now,
        product: product.id,
        user: user.id,
        state: OrderState::Pending,
        price: product.price * body.count,
        count: body.count,
    };

    let res = sqlx::query!(
        "insert into orders(user, product, price, created_at, count, state)
        values(?,?,?,?,?,?)",
        order.user,
        order.product,
        order.price,
        order.created_at,
        order.count,
        order.state
    )
    .execute(&state.sql)
    .await?;

    order.id = res.last_insert_rowid();

    sqlx::query!(
        "update users set order_count = (
            select COUNT(id) from orders where user = ?
        ) where id = ?",
        user.id,
        user.id
    )
    .execute(&state.sql)
    .await?;

    crate::utils::iris_message(
        IrisChannel::Orders,
        format!(
            "سفارش جدید:

محصول: {:?} | {}
تعداد: {}
قیمت: {}
خریدار: {} | +98{}",
            product.kind,
            product.name,
            order.count,
            order.price,
            user.name.unwrap_or_default(),
            user.phone
        ),
    );

    Ok(Json(order))
}

pub fn router() -> Scope {
    Scope::new("/orders").service(r_add)
}
