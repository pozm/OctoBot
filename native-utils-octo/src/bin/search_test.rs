use std::path::Path;
use std::fs;

fn find_file_name(path_to:&Path,search:&str,depth:i32) -> Option<bool> {
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

fn main() {
    println!("{:?}",find_file_name(Path::new("X:\\meta\\app\\vulnus\\patron-latest\\maps"), "meta.json", 0))
}