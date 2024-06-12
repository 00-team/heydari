use serde::{Deserialize, Serialize};
use sqlx::{sqlite::SqliteRow, Row};
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

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, ToSchema, Clone)]
pub struct ProductTag {
    pub id: i64,
    pub name: String,
    pub kind: ProductKind,
    pub part: ProductPart,
    pub count: i64,
}

from_request!(ProductTag, "product_tags");

#[derive(Debug, Serialize, Deserialize, ToSchema, Default)]
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

impl<'r> sqlx::FromRow<'r, SqliteRow> for Product {
    fn from_row(row: &'r SqliteRow) -> Result<Self, sqlx::Error> {
        let id = row.get::<i64, _>("id");
        let kind = row.get::<i64, _>("kind");
        let name = row.get::<String, _>("name");
        let code = row.get::<String, _>("code");
        let detail = row.get::<String, _>("detail");
        let timestamp = row.get::<i64, _>("timestamp");
        let thumbnail = row.get::<Option<String>, _>("thumbnail");
        let photos = row.get::<String, _>("photos");
        let tag_leg = row.get::<Option<i64>, _>("tag_leg");
        let tag_bed = row.get::<Option<i64>, _>("tag_bed");

        Ok(Product {
            id,
            kind: kind.into(),
            name,
            code,
            detail,
            timestamp,
            thumbnail,
            photos: photos.into(),
            tag_leg,
            tag_bed,
        })
    }
}
