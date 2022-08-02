use std::{env, path::{self, Path}, process::Command, fs::OpenOptions, io::{Write, BufRead}};

extern crate napi_build;

fn main() {
    println!("cargo:rerun-if-changed=build.rs");
    println!("cargo:rerun-if-changed=../.git/HEAD");
    let out_dir = env::var_os("OUT_DIR").unwrap();
    {
        let dest_path = Path::new(&out_dir).join("git_hash");
        let mut dst_file = OpenOptions::new().truncate(true).write(true).create(true).open(dest_path).unwrap();
        let out = Command::new("git").args(vec!["log","-n","1","--pretty=format:%H"]).output();
        if let Ok(out) = out {
            if let Ok(hash) = String::from_utf8(out.stdout) {
                dst_file.write_all(&hash.as_bytes()).unwrap();
            }
        }
    }
    {
        let dest_path = Path::new(&out_dir).join("git_branch");
        let mut dst_file = OpenOptions::new().truncate(true).write(true).create(true).open(dest_path).unwrap();
        let out = Command::new("git").args(vec!["rev-parse","--abbrev-ref","HEAD"]).output();
        if let Ok(out) = out {
            if let Ok(hash) = out.stdout.lines().next().unwrap() {
                dst_file.write_all(&hash.as_bytes()).unwrap();
            }
        }
    }
    {
        let dest_path = Path::new(&out_dir).join("cargo_info");
        let mut dst_file = OpenOptions::new().truncate(true).write(true).create(true).open(dest_path).unwrap();
        let out = Command::new("cargo").args(vec!["--version","--verbose"]).output();
        if let Ok(out) = out {
            if let Ok(hash) = String::from_utf8(out.stdout) {
                dst_file.write_all(&hash.as_bytes()).unwrap();
            }
        }
    }
    napi_build::setup();
}
