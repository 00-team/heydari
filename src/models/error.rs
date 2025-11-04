use actix_web::{body::BoxBody, http::StatusCode, HttpResponse, ResponseError};
use serde::Serialize;
use utoipa::ToSchema;

#[derive(Debug, Default, Serialize, ToSchema, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCode {
    #[default]
    Unknown = 0,
    Forbidden,
    ForbiddenSelfEdit,
    BadAuth,
    NotFound,
    NotUnique,
    ServerError,
    DatabaseError,
    RateLimited,
    IndexOutOfBounds,
    BadImage,
    EncodeWebpError,
    UserBanned,
    BadPhone,
    BadSlugLen,
    BadSlugAbc,
    BadVerification,

    StringTooLong,
    TooManyPhotos,
}

impl ErrorCode {
    fn status(&self) -> u16 {
        match self {
            Self::NotUnique => 400,
            Self::BadPhone => 400,
            Self::BadSlugLen | Self::BadSlugAbc => 400,
            Self::StringTooLong => 400,
            Self::BadVerification => 400,
            Self::TooManyPhotos => 400,

            Self::IndexOutOfBounds => 400,
            Self::BadImage | Self::EncodeWebpError => 400,

            Self::NotFound => 404,

            Self::UserBanned => 403,
            Self::Forbidden | Self::BadAuth | Self::ForbiddenSelfEdit => 403,

            Self::RateLimited => 429,

            Self::Unknown => 500,
            Self::ServerError | Self::DatabaseError => 500,
        }
    }
}

impl From<ErrorCode> for AppErr {
    fn from(value: ErrorCode) -> Self {
        Self { status: value.status(), debug: None, code: value }
    }
}

#[derive(Clone, Serialize, Debug, ToSchema)]
pub struct AppErr {
    status: u16,
    code: ErrorCode,
    debug: Option<String>,
}

impl AppErr {
    // pub fn new(status: u16, code: ErrorCode) -> Self {
    //     Self { status, code, debug: None }
    // }

    pub fn server_error() -> Self {
        Self { status: 500, code: ErrorCode::ServerError, debug: None }
    }

    pub fn debug(mut self, debug: &str) -> Self {
        self.debug = Some(debug.to_string());
        self
    }

    // pub fn code<C: Into<u16>>(mut self, code: C) -> Self {
    //     self.code = code.into();
    //     self
    // }
}

impl From<sqlx::Error> for AppErr {
    fn from(value: sqlx::Error) -> Self {
        log::error!("sqlx error: {value} ({value:?})");
        match value {
            sqlx::Error::RowNotFound => ErrorCode::NotFound,
            sqlx::Error::Database(e) => match e.code() {
                Some(c) if c == "2067" => ErrorCode::NotUnique,
                Some(c) if c == "787" => ErrorCode::NotFound,
                _ => ErrorCode::DatabaseError,
            },
            _ => ErrorCode::DatabaseError,
        }
        .into()
    }
}

impl std::error::Error for AppErr {}

impl std::fmt::Display for AppErr {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "{:?}", self)
    }
}

impl ResponseError for AppErr {
    fn status_code(&self) -> StatusCode {
        StatusCode::from_u16(self.status)
            .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
    }

    fn error_response(&self) -> HttpResponse<BoxBody> {
        HttpResponse::build(self.status_code()).json(self)
    }
}

impl From<image::ImageError> for AppErr {
    fn from(value: image::ImageError) -> Self {
        Self::from(ErrorCode::BadImage).debug(&value.to_string())
    }
}

macro_rules! fse {
    ($ty:path) => {
        impl From<$ty> for AppErr {
            fn from(value: $ty) -> Self {
                log::error!("_500_: [{}] {value:?}", stringify!($ty));
                Self::server_error().debug(stringify!($ty))
            }
        }
    };
}

fse!(reqwest::Error);
fse!(std::io::Error);
fse!(minijinja::Error);
fse!(serde_json::Error);

#[macro_export]
macro_rules! err {
    (r, $code:ident) => {
        $crate::AppErr::from($crate::ErrorCode::$code)
    };

    (r,$code:ident, $debug:literal) => {
        $crate::AppErr::from($crate::ErrorCode::$code).debug($debug)
    };

    (r,$code:ident, $debug:expr) => {
        $crate::AppErr::from($crate::ErrorCode::$code).debug(&$debug)
    };

    ($code:ident) => {
        Err($crate::AppErr::from($crate::ErrorCode::$code))
    };

    ($code:ident, $debug:literal) => {
        Err($crate::AppErr::from($crate::ErrorCode::$code).debug($debug))
    };

    ($code:ident, $debug:expr) => {
        Err($crate::AppErr::from($crate::ErrorCode::$code).debug(&$debug))
    };
}

// impl AppErr {
//     // pub fn new(status: u16, subject: &str) -> Self {
//     //     Self { status, subject: subject.to_string(), content: None }
//     // }
//     //
//     // pub fn default() -> Self {
//     //     Self {
//     //         status: 500, subject: "خطای سیستم".to_string(), content: None
//     //     }
//     // }
// }
//
// impl fmt::Display for AppErr {
//     fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
//         write!(f, "{:?}", self)
//     }
// }
//
// impl ResponseError for AppErr {
//     fn status_code(&self) -> StatusCode {
//         StatusCode::from_u16(self.status)
//             .unwrap_or(StatusCode::INTERNAL_SERVER_ERROR)
//     }
//
//     fn error_response(&self) -> HttpResponse<BoxBody> {
//         HttpResponse::build(self.status_code()).json(self)
//     }
// }
//
// impl From<sqlx::Error> for AppErr {
//     fn from(value: sqlx::Error) -> Self {
//         match value {
//             sqlx::Error::RowNotFound => Self {
//                 status: 404,
//                 subject: "یافت نشد".to_string(),
//                 content: None,
//             },
//             sqlx::Error::Database(e) => match e.code() {
//                 Some(c) if c == "2067" => Self {
//                     status: 400,
//                     subject: "مورد مشابهی پیدا شد".to_string(),
//                     content: None,
//                 },
//                 _ => Self::default(),
//             },
//             _ => Self::default(),
//         }
//     }
// }
//
// impl From<&str> for AppErr {
//     fn from(value: &str) -> Self {
//         Self::new(500, value)
//     }
// }
//
// impl From<actix_web::error::Error> for AppErr {
//     fn from(value: actix_web::error::Error) -> Self {
//         let r = value.error_response();
//         Self {
//             status: r.status().as_u16(),
//             subject: "خطا".to_string(),
//             content: Some(value.to_string()),
//         }
//     }
// }
//
// macro_rules! impl_from_err {
//     ($ty:path) => {
//         impl From<$ty> for AppErr {
//             fn from(value: $ty) -> Self {
//                 let value = value.to_string();
//                 log::error!("err 500: {}", value);
//                 Self {
//                     status: 500,
//                     subject: stringify!($ty).to_string(),
//                     content: Some(value),
//                 }
//             }
//         }
//     };
// }
//
// impl_from_err!(io::Error);
// impl_from_err!(PayloadError);
// impl_from_err!(ParseFloatError);
// impl_from_err!(ParseIntError);
// impl_from_err!(JsonPayloadError);
// impl_from_err!(SendRequestError);
// impl_from_err!(FromUtf8Error);
// impl_from_err!(serde_json::Error);
// impl_from_err!(minijinja::Error);
// impl_from_err!(image::ImageError);
// impl_from_err!(ToStrError);
//
// macro_rules! error_helper {
//     ($name:ident, $status:ident, $subject:literal) => {
//         #[doc = concat!("Helper function that wraps any error and generates a `", stringify!($status), "` response.")]
//         #[allow(non_snake_case)]
//         pub fn $name(err: Option<&str>) -> AppErr {
//             log::error!("err {} - {:?}", stringify!($status), err);
//             AppErr {
//                 status: StatusCode::$status.as_u16(),
//                 subject: $subject.to_string(),
//                 content: err.map(|v| v.to_string())
//             }
//         }
//     };
// }
//
// error_helper!(AppErrBadRequest, BAD_REQUEST, "درخواست بد");
// error_helper!(AppErrForbidden, FORBIDDEN, "ممنوع");
// error_helper!(AppErrBadAuth, FORBIDDEN, "احراز هویت نامعتبر");
// // error_helper!(AppErrNotFound, NOT_FOUND, "پیدا نشد");
