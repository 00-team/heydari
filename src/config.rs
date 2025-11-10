use std::sync::OnceLock;

#[derive(Debug)]
/// `Heydari` Config
pub struct Config {
    pub simurgh_pid: i64,
    pub melipayamak: String,
    pub simurgh: reqwest::Client,
    pub heimdall: reqwest::Client,
    pub iris: reqwest::Client,
    pub iris_pass_on: String,
}

macro_rules! evar {
    ($name:literal) => {
        std::env::var($name).expect(concat!($name, " was not found in env"))
    };
}

impl Config {
    pub const ONLINE_UPDATE_INTERVAL: i64 = 30;

    pub const RECORD_DIR: &str = "record";
    pub const CODE_ABC: &[u8] = b"0123456789";
    pub const TOKEN_ABC: &[u8] = b"!@#$%^&*_+abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*_+";
    pub const SLUG_ABC: &[u8] =
        b"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_";

    #[cfg(debug_assertions)]
    pub const SIMURGH_HOST: &str = "http://localhost:7700";
    #[cfg(not(debug_assertions))]
    pub const SIMURGH_HOST: &str = "https://simurgh.00-team.org";

    fn simurgh_client() -> (i64, reqwest::Client) {
        let pid = evar!("SIMURGH_PID").parse::<i64>().expect("bad SIMURGH_PID");
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::AUTHORIZATION,
            reqwest::header::HeaderValue::from_str(&format!(
                "project {pid}:{}",
                evar!("SIMURGH_TOKEN")
            ))
            .expect("invalid simurgh header"),
        );
        let client = reqwest::ClientBuilder::new()
            .default_headers(headers)
            .connection_verbose(false)
            .build()
            .expect("bad simurgh clinet");

        (pid, client)
    }

    pub fn simurgh_url(&self, path: &str) -> String {
        format!(
            "{}/api/projects/{}{path}",
            Self::SIMURGH_HOST,
            self.simurgh_pid
        )
    }

    pub fn heimdall_client() -> reqwest::Client {
        let mut headers = reqwest::header::HeaderMap::new();
        headers.insert(
            reqwest::header::AUTHORIZATION,
            reqwest::header::HeaderValue::from_str(&evar!("HEIMDALL_TOKEN"))
                .expect("invalid simurgh header"),
        );
        reqwest::ClientBuilder::new()
            .default_headers(headers)
            .connection_verbose(false)
            .build()
            .expect("bad simurgh clinet")
    }

    fn init() -> Self {
        let (simurgh_pid, simurgh) = Self::simurgh_client();

        Self {
            melipayamak: evar!("MELIPAYAMAK"),
            simurgh,
            simurgh_pid,
            heimdall: Self::heimdall_client(),
            iris: reqwest::ClientBuilder::new()
                .connection_verbose(false)
                .build()
                .expect("invalid iris"),
            iris_pass_on: evar!("IRIS_PASS_ON"),
        }
    }

    pub fn get() -> &'static Self {
        static STATE: OnceLock<Config> = OnceLock::new();
        STATE.get_or_init(Self::init)
    }
}
