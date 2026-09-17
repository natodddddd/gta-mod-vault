import json
import os

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

def main():
    mods = load_mods()
    if not mods:
        print("Gak ada mod di mods.json!")
        return

    print("\n=== DAFTAR MOD SAAT INI ===")
    for m in mods:
        print(f"[{m.get('id')}] {m.get('title')} ({m.get('category')})")

    mod_id = input("\nMasukkan ID mod yang mau dihapus: ")
    if not mod_id.isdigit():
        print("ID harus berupa angka!")
        return

    mod_id = int(mod_id)
    new_mods = [m for m in mods if m.get('id') != mod_id]

    if len(new_mods) == len(mods):
        print(f"Mod dengan ID {mod_id} gak ditemukan.")
    else:
        save_mods(new_mods)
        print(f"\n BERHASIL! Mod ID {mod_id} udah terhapus dari {JSON_FILE}.\n")

if __name__ == '__main__':
    main()