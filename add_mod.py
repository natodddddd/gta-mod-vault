import json
import os
import subprocess

JSON_FILE = 'mods.json'

def load_mods():
    if os.path.exists(JSON_FILE):
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return []
    return []

def save_mods(mods):
    with open(JSON_FILE, 'w', encoding='utf-8') as f:
        json.dump(mods, f, indent=2, ensure_ascii=False)

def auto_git_commit(mod_title):
    print("\n--- Menjalankan Otomatisasi Git ---")
    try:
        # 1. Git Add
        subprocess.run(["git", "add", "mods.json"], check=True)
        
        # 2. Git Commit
        commit_message = f"tambah mod: {mod_title}"
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        print(f" Berhasil Commit: '{commit_message}'")

        # 3. Tanya Push
        do_push = input("Langsung push ke GitHub/Netlify? (y/n): ").strip().lower()
        if do_push == 'y':
            subprocess.run(["git", "push"], check=True)
            print(" BERHASIL PUSH KE GITHUB/NETLIFY!")
        else:
            print(" Disimpan di commit lokal (belum di-push).")

    except subprocess.CalledProcessError as e:
        print(f" Gagal mengeksekusi perintah Git: {e}")

def main():
    mods = load_mods()
    next_id = max([m.get('id', 0) for m in mods], default=0) + 1

    print("\n=== ADD NEW MOD TO MODS.JSON ===")
    title = input("1. Judul Mod             : ")
    category = input("2. Kategori (Vehicles/CLEO/Graphics/Skins): ")
    author = input("3. Author                : ")
    file_size = input("4. Ukuran File (misal 15 MB) : ")
    thumbnail = input("5. URL Gambar Thumbnail  : ")
    download_url = input("6. Link Download         : ")
    description = input("7. Deskripsi Singkat     : ")
    install_guide = input("8. Panduan Pasang        : ")

    new_mod = {
        "id": next_id,
        "title": title,
        "category": category if category else "Vehicles",
        "author": author if author else "Unknown",
        "file_size": file_size if file_size else "N/A",
        "thumbnail": thumbnail,
        "download_url": download_url,
        "description": description if description else "Tidak ada deskripsi khusus.",
        "install_guide": install_guide if install_guide else "1. Ekstrak file zip/rar.\n2. Masukkan ke direktori modloader."
    }

    mods.append(new_mod)
    save_mods(mods)
    print(f"\n Data '{title}' berhasil disimpan di {JSON_FILE} (ID: {next_id})")

    # Jalankan git commit otomatis
    auto_git_commit(title)

if __name__ == '__main__':
    main()