use std::{future::Future, pin::Pin};

use actix_web::dev::Payload;
use actix_web::{
    web::{Data, Path},
    FromRequest, HttpRequest,
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::AppState;

use super::{sql_enum, AppErr, JsonStr};

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

/*
create table if not exists products (
    id integer primary key not null,
    name text not null,
    code text not null,
    detail text not null default "",
    timestamp integer not null,
    thumbnail text not null,
    photos text not null default "[]",
    leg_tag integer references product_tags(id) on delete set null,
    bed_tag integer references product_tags(id) on delete set null
);
*/

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, ToSchema)]
pub struct Product {
    pub id: i64,
    pub name: String,
    pub code: String,
    pub detail: String,
    pub timestamp: i64,
    pub thumbnail: String,
    #[schema(value_type = Vec<String>)]
    pub photos: JsonStr<Vec<String>>,
    pub tag_leg: Option<i64>,
    pub tag_bed: Option<i64>,
}

impl FromRequest for Product {
    type Error = AppErr;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, _: &mut Payload) -> Self::Future {
        let path = Path::<(i64,)>::extract(req);
        let state = req.app_data::<Data<AppState>>().unwrap();
        let pool = state.sql.clone();

        Box::pin(async move {
            let path = path.await?;
            let result = sqlx::query_as! {
                Product,
                "select * from products where id = ?",
                path.0
            }
            .fetch_one(&pool)
            .await?;

            Ok(result)
        })
    }
}
