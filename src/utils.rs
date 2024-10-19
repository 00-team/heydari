use crate::config::{config, Config};
use crate::models::{AppErr, AppErrBadRequest};
use actix_http::encoding::Decoder;
use actix_http::Payload;
use awc::ClientResponse;
use image::{EncodableLayout, ImageReader};
use rand::Rng;
use serde::Serialize;
use std::path::Path;

pub fn phone_validator(phone: &str) -> Result<(), AppErr> {
    if phone.len() != 11 || !phone.starts_with("09") {
        return Err(AppErrBadRequest(Some("invalid phone number")));
    }

    if phone.chars().any(|c| !c.is_ascii_digit()) {
        return Err(AppErrBadRequest(Some("phone number must be all digits")));
    }

    Ok(())
}

pub fn now() -> i64 {
    chrono::Local::now().timestamp()
}

pub fn verify_slug(slug: &str) -> Result<(), AppErr> {
    if slug.len() < 3 {
        return Err(AppErrBadRequest(Some("حداقل طول نشانه 3 کاراکتر است")));
    }

    if !slug.chars().all(|c| Config::SLUG_ABC.contains(&(c as u8))) {
        return Err(AppErrBadRequest(Some(
            "نشانه شامل کاراکترهای نامعتبر است",
        )));
    }

    Ok(())
}

pub fn get_random_string(charset: &[u8], len: usize) -> String {
    let mut rng = rand::thread_rng();
    (0..len).map(|_| charset[rng.gen_range(0..charset.len())] as char).collect()
}

pub fn get_random_bytes(len: usize) -> String {
    let mut rng = rand::thread_rng();
    hex::encode((0..len).map(|_| rng.gen::<u8>()).collect::<Vec<u8>>())
}

pub fn save_photo(
    path: &Path, name: &str, size: (u32, u32),
) -> Result<(), AppErr> {
    let img = ImageReader::open(path)?
        .with_guessed_format()?
        .decode()?
        .thumbnail(size.0, size.1);

    let encoder = webp::Encoder::from_image(&img)?;
    let output = encoder.encode(60.0);
    let path = Path::new(Config::RECORD_DIR).join(name);
    std::fs::write(path, output.as_bytes())?;

    // img.thumbnail(size.0, size.1)
    //     .save_with_format(
    //         Path::new(Config::RECORD_DIR).join(name),
    //         ImageFormat::Png,
    //     )
    //     .map_err(|e| io::Error::new(io::ErrorKind::Other, e))?;

    Ok(())
}

pub fn remove_record(name: &str) {
    let _ = std::fs::remove_file(Path::new(Config::RECORD_DIR).join(name));
}

pub async fn send_sms(phone: &str, text: &str) {
    // let client = awc::Client::new();
    log::info!("\nsending sms to {phone}:\n\n{text}\n");
}

pub async fn send_sms_prefab(phone: &str, body_id: i64, args: Vec<String>) {
    log::info!("\nsending sms to {phone}:\n\n{args:?}\n");

    let client = awc::Client::new();
    let request = client.post(format!(
        "https://console.melipayamak.com/api/send/shared/{}",
        config().melipayamak
    ));

    #[derive(Serialize, Debug)]
    #[serde(rename_all = "camelCase")]
    struct Body {
        body_id: i64,
        to: String,
        args: Vec<String>,
    }

    let Ok(mut res) =
        request.send_json(&Body { body_id, to: phone.to_string(), args }).await
    else {
        return;
    };

    log::info!("res: {res:#?} - {:#?}", res.body().await);
}

pub async fn simurgh_request(
    path: &str,
) -> Result<ClientResponse<Decoder<Payload>>, AppErr> {
    let Config { simurgh_project, simurgh_host, simurgh_auth, .. } = config();
    let client = awc::Client::new();
    let request = client
        .get(format!("{simurgh_host}/api/projects/{simurgh_project}{path}"))
        .insert_header(("authorization", simurgh_auth.as_str()));

    let mut result = request.send().await?;
    if result.status() != 200 {
        Err(result.json::<AppErr>().await?)
    } else {
        Ok(result)
    }
}

pub async fn heimdall_message(text: &str, tag: &str) {
    let client = awc::Client::new();
    let request = client
        .post(format!("https://heimdall.00-team.org/api/sites/messages/"))
        .insert_header(("authorization", config().heimdall_token.as_str()));

    #[derive(Serialize)]
    struct Message {
        text: String,
        tag: String,
    }

    let _ = request
        .send_json(&Message { text: text.to_string(), tag: tag.to_string() })
        .await;
}

pub trait CutOff {
    fn cut_off(&mut self, len: usize);
}

impl CutOff for String {
    fn cut_off(&mut self, len: usize) {
        let mut idx = len;
        loop {
            if self.is_char_boundary(idx) {
                break;
            }
            idx -= 1;
        }
        self.truncate(idx)
    }
}

impl CutOff for Option<String> {
    fn cut_off(&mut self, len: usize) {
        if let Some(v) = self {
            let mut idx = len;
            loop {
                if v.is_char_boundary(idx) {
                    break;
                }
                idx -= 1;
            }
            v.truncate(idx)
        }
    }
}
