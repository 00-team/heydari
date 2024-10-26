use crate::AppState;
use actix_multipart::form::{tempfile::TempFile, MultipartForm};
use actix_web::{dev::Payload, web::Data, FromRequest, HttpRequest};
use serde::{Deserialize, Serialize};
use shah::perms::Perm;
use std::{future::Future, pin::Pin};
use utoipa::ToSchema;

use super::{auth::Authorization, AppErr, AppErrForbidden};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, ToSchema, Default)]
pub struct User {
    pub id: i64,
    pub name: Option<String>,
    pub phone: String,
    pub token: Option<String>,
    pub photo: Option<String>,
    pub admin: Vec<u8>,
    pub banned: bool,
}

#[derive(Debug, MultipartForm, ToSchema)]
pub struct UpdatePhoto {
    #[schema(value_type = String, format = Binary)]
    #[multipart(limit = "8 MiB")]
    pub photo: TempFile,
}

pub mod perms {
    shah::perms! {
        MASTER,
        V_USER, A_USER, C_USER, D_USER,
    }
}

pub struct Admin {
    pub user: User,
    pub perms: [u8; 32],
}

pub trait Perms {
    type Error;

    fn perm_get(&self, perm: Perm) -> bool;
    fn perm_set(&mut self, perm: Perm, value: bool);
    fn perm_any(&self) -> bool;
    fn perm_check(&self, perm: Perm) -> Result<(), Self::Error>;
    fn perm_check_many(&self, perms: &[Perm]) -> Result<(), Self::Error> {
        for p in perms {
            self.perm_check(*p)?;
        }

        Ok(())
    }
}

impl Perms for Admin {
    type Error = AppErr;

    fn perm_check(&self, perm: Perm) -> Result<(), Self::Error> {
        if self.perm_get(perms::MASTER) || self.perm_get(perm) {
            Ok(())
        } else {
            Err(AppErrForbidden(Some("not enough perms")))
        }
    }

    fn perm_any(&self) -> bool {
        self.perms.iter().any(|v| *v != 0)
    }

    fn perm_get(&self, (byte, bit): Perm) -> bool {
        assert!(self.perms.len() > byte);
        let n = self.perms[byte];
        let f = 1 << bit;
        (n & f) == f
    }

    fn perm_set(&mut self, (byte, bit): Perm, value: bool) {
        assert!(self.perms.len() > byte);
        let f = 1 << bit;
        if value {
            self.perms[byte] |= f;
        } else {
            self.perms[byte] &= !f;
        }
    }
}

impl FromRequest for User {
    type Error = AppErr;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, _pl: &mut Payload) -> Self::Future {
        let state = req.app_data::<Data<AppState>>().unwrap();
        let auth = Authorization::try_from(req);
        let pool = state.sql.clone();
        // let token = extract_token(req);
        // let token = BearerAuth::from_request(req, pl);

        Box::pin(async move {
            let user = match auth? {
                Authorization::User { id, token } => {
                    sqlx::query_as! {
                        User,
                        "select * from users where id = ? and token = ?",
                        id, token
                    }
                    .fetch_one(&pool)
                    .await?
                }
            };

            if user.banned {
                return Err(AppErrForbidden(Some("banned")));
            }

            Ok(user)
        })
    }
}

impl FromRequest for Admin {
    type Error = AppErr;
    type Future = Pin<Box<dyn Future<Output = Result<Self, Self::Error>>>>;

    fn from_request(req: &HttpRequest, payload: &mut Payload) -> Self::Future {
        let user = User::from_request(req, payload);
        Box::pin(async {
            let user = user.await?;
            let perms: [u8; 32] = if user.admin.len() >= 32 {
                user.admin[..32].try_into().unwrap()
            } else {
                let mut perms = [0u8; 32];
                user.admin.iter().enumerate().for_each(|(i, b)| perms[i] = *b);
                perms
            };

            let admin = Admin { user, perms };
            if !admin.perm_any() {
                return Err(AppErrForbidden(None));
            }

            Ok(admin)
        })
    }
}
