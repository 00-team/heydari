use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Debug, Serialize, Deserialize, ToSchema, Default)]
pub struct Material {
    pub id: i64,
    pub name: String,
    pub detail: String,
    pub created_at: i64,
    pub updated_at: i64,
    pub created_by: Option<i64>,
    pub updated_by: Option<i64>,
    pub photo: Option<String>,
    pub count: i64,
}

super::from_request!(Material, "materials");
