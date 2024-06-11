use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use super::{from_request, sql_enum, JsonStr};

sql_enum! {
    pub enum ProductKind {
        Chair,
        Table,
    }

    pub enum ProductPart {
        Leg,
        Bed,
    }
}

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, ToSchema)]
pub struct ProductTag {
    pub id: i64,
    pub name: String,
    pub kind: ProductKind,
    pub part: ProductPart,
    pub count: i64,
}

from_request!(ProductTag, "product_tags");

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, ToSchema, Default)]
pub struct Product {
    pub id: i64,
    pub kind: ProductKind,
    pub name: String,
    pub code: String,
    pub detail: String,
    pub timestamp: i64,
    pub thumbnail: Option<String>,
    #[schema(value_type = Vec<String>)]
    pub photos: JsonStr<Vec<String>>,
    pub tag_leg: Option<i64>,
    pub tag_bed: Option<i64>,
}

from_request!(Product, "products");
