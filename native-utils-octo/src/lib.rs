#![deny(clippy::all)]

use std::{io::Cursor, path::Path, fs, env};

use napi::{bindgen_prelude::Buffer, Result as NResult};
use tempfile::tempdir;
use zip::{ZipArchive, read::ZipFile};

#[macro_use]
extern crate napi_derive;

#[napi]

struct Versioning;

#[napi]
impl Versioning {
    #[napi]
    pub fn get_git_hash() -> String {
        include_str!(concat!(env!("OUT_DIR"), "/git_hash")).to_string()
    }
    #[napi]
    pub fn get_git_branch() -> String {
        include_str!(concat!(env!("OUT_DIR"), "/git_branch")).to_string()
    }
    #[napi]
    pub fn get_rust_info() -> String {
        include_str!(concat!(env!("OUT_DIR"), "/cargo_info")).to_string()
    }
}

#[napi]
struct DateFns;

#[napi]
impl DateFns {
    #[napi]
    pub fn pretty_from_ms(ms:i64) -> String {
        let dt_now =  chrono::Utc::now();
        let start = chrono::Utc::now() - chrono::Duration::milliseconds(ms);

        let time = dt_now - start;
        let seconds = time.num_seconds() % 60;
        let minutes = (time.num_seconds() / 60) % 60;
        let hours = (time.num_seconds() / 60) / 60;
        format!("{hours}h {minutes}m {seconds}s")
    }
}
#[napi]
struct MapData;

pub fn find_file_name(path_to:&Path,search:&str,depth:i32) -> Option<bool> {
    let found = false;
    if depth > 3 {
        return Some(false);
    }
    let files = fs::read_dir(path_to).ok()?;
    for _file in files {
        if let Ok(file) = _file {
            if found { break ; }
            if file.file_name() == search {
                return Some(true);
            }
            if file.file_type().ok()?.is_dir() || !found {
                if let Some(found) = find_file_name(&file.path(),search,depth+1) {
                    return Some(found);
                }
            }
        }
    }
    Some(found)
}

#[napi]
impl MapData {
    #[napi]
    pub fn is_real_map(data:Buffer) -> Option<bool> {
        let buf : Vec<u8> = data.into();
        let g =tempdir().ok()?;
        let tempd = g.path();
        fs::create_dir_all(&tempd).ok()?;
        let mut read = Cursor::new(buf);
        let mut zip_file = zip::ZipArchive::new(&mut read).ok()?;
        // zip_file
        // zip_file.extract(&tempd).ok()?;
        let mut found = Some(false);
        let mut bomb = zip_file.len() > 99;

        if !bomb {

        
            for i in 0..zip_file.len() {
                let file = zip_file.by_index(i).ok()?;
                // println!("un {:?} | c {:?}",file.size(),file.compressed_size());
                let ratio =file.size() / file.compressed_size();
                println!("r {:?}",ratio);
                if ratio > 97 {
                    bomb = true;
                    break;
                }
                let filepath = file
                    .enclosed_name()?;
                if filepath.file_name()?.to_str()? == "meta.json" {
                    found = Some(true);
                    // we could do validation, but lazy 
                    break;
                }
            }
        }
        if bomb {
            println!("detected zbomb");
        }


        // let found = find_file_name(&tempd,"meta.json",0);
        if bomb { None } else { found }
    }
}