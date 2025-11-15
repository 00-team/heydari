use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[potk::enum_int(i64)]
#[derive(PartialEq, Eq, Default, Clone, Copy, Debug)]
#[derive(serde::Serialize, serde::Deserialize, utoipa::ToSchema)]
#[serde(rename_all = "snake_case")]
pub enum OrderState {
    #[default]
    Pending,
    PaymentPending,
    Sending,
    Rejected,
    Resolved,
}

super::sql_enum!(OrderState);

#[derive(Debug, Serialize, Deserialize, ToSchema, Default)]
pub struct Order {
    pub id: i64,
    pub user: i64,
    pub product: i64,
    pub price: i64,
    pub created_at: i64,
    pub count: i64,
    pub state: OrderState,
    pub updated_at: i64,
}

super::from_request!(Order, "orders");
