use std::sync::OnceLock;

#[derive(Debug)]
/// Main Config
pub struct Config {
    pub simurgh_project: i64,
    pub simurgh_host: String,
    pub simurgh_auth: String,
    pub heimdall_token: String,
}

impl Config {
    pub const RECORD_DIR: &'static str = "record";
    pub const CODE_ABC: &'static [u8] = b"0123456789";
    pub const TOKEN_ABC: &'static [u8] = b"!@#$%^&*_+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_+";
    pub const SLUG_ABC: &'static [u8] =
        b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";
}

macro_rules! evar {
    ($name:literal) => {
        std::env::var($name).expect(concat!($name, " was not found in env"))
    };
}

pub fn config() -> &'static Config {
    static STATE: OnceLock<Config> = OnceLock::new();

    let simurgh_host = if cfg!(debug_assertions) {
        "http://localhost:7700"
    } else {
        "https://simurgh.00-team.org"
    }
    .to_string();

    STATE.get_or_init(|| Config {
        simurgh_project: evar!("SIMURGH_PROJECT")
            .parse::<i64>()
            .expect("invalid SIMURGH_PROJECT"),
        simurgh_auth: format!("api-key {}", evar!("SIMURGH_API_KEY")),
        simurgh_host,
        heimdall_token: evar!("HEIMDALL_TOKEN"),
    })
}
