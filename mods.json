let allMods = [];
let currentCategory = 'All';

// 1. Fetch data mods dari mods.json
async function fetchMods() {
  try {
    const response = await fetch('mods.json');
    allMods = await response.json();
    renderMods(allMods);
  } catch (error) {
    console.error('Gagal mengambil data mods:', error);
  }
}

// 2. Render daftar mod ke HTML
function renderMods(mods) {
  const container = document.getElementById('modGrid'); // Sesuai ID di index.html
  if (!container) return;
  
  container.innerHTML = '';

  if (mods.length === 0) {
    container.innerHTML = `<p style="color: #a0a0a0; grid-column: 1/-1; text-align: center;">Mod tidak ditemukan...</p>`;
    return;
  }

  mods.forEach(mod => {
    // Support dua versi penulisan JSON (camelCase / snake_case)
    const fileSize = mod.file_size || mod.fileSize || 'N/A';
    const downloadUrl = mod.download_url || mod.downloadUrl || '#';

    const card = document.createElement('div');
    card.className = 'mod-card';
    card.innerHTML = `
      <img src="${mod.thumbnail}" alt="${mod.title}">
      <h3>${mod.title}</h3>
      <p>Author: ${mod.author} | Size: ${fileSize}</p>
      <div class="card-buttons" style="display: flex; gap: 8px; margin-top: 10px;">
        <button onclick="openModal(${mod.id})" style="flex:1; background:#2a2a2e; color:#fff; border:1px solid #ffcc00; padding:8px; cursor:pointer; font-weight:bold;">Detail</button>
        <a href="${downloadUrl}" target="_blank" style="flex:1; background:#ffcc00; color:#000; text-align:center; padding:8px; text-decoration:none; font-weight:bold;">Download</a>
      </div>
    `;
    container.appendChild(card);
  });
}

// 3. Logika Buka Modal Detail
function openModal(id) {
  const mod = allMods.find(m => m.id === id);
  if (!mod) return;

  const fileSize = mod.file_size || mod.fileSize || 'N/A';
  const downloadUrl = mod.download_url || mod.downloadUrl || '#';

  document.getElementById('modalImg').src = mod.thumbnail;
  document.getElementById('modalTitle').innerText = mod.title;
  document.getElementById('modalMeta').innerText = `Author: ${mod.author} | Size: ${fileSize} | Kategori: ${mod.category}`;
  document.getElementById('modalDesc').innerText = mod.description || "Tidak ada deskripsi khusus.";
  document.getElementById('modalGuide').innerText = mod.install_guide || "1. Ekstrak file .zip yang diunduh.\n2. Masukkan folder/file mod ke direktori 'modloader'.\n3. Buka game GTA SA.";
  document.getElementById('modalDownload').href = downloadUrl;

  document.getElementById('modModal').style.display = 'block';
}

// 4. Logika Tutup Modal
function closeModal() {
  document.getElementById('modModal').style.display = 'none';
}

window.onclick = function(event) {
  const modal = document.getElementById('modModal');
  if (event.target === modal) {
    closeModal();
  }
};

// 5. Fitur Search & Filter Kategori
const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('input', filterMods);
}

const catButtons = document.querySelectorAll('.cat-btn');
catButtons.forEach(btn => {
  btn.addEventListener('click', (e) => {
    catButtons.forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.getAttribute('data-cat');
    filterMods();
  });
});

function filterMods() {
  const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
  
  const filtered = allMods.filter(mod => {
    const matchesSearch = mod.title.toLowerCase().includes(searchTerm) || 
                          mod.category.toLowerCase().includes(searchTerm) ||
                          mod.author.toLowerCase().includes(searchTerm);
    
    const matchesCategory = (currentCategory === 'All' || currentCategory === 'All Mods') ? true : mod.category === currentCategory;

    return matchesSearch && matchesCategory;
  });

  renderMods(filtered);
}

// Jalankan Load Mod
fetchMods();

// 6. Chatango Widget Embed (gtamabar2004)
const chatScript = document.createElement('script');
chatScript.id = "cid0020000450374074062";
chatScript.setAttribute('data-cfasync', 'false');
chatScript.async = true;
chatScript.src = "//st.chatango.com/js/gz/emb.js";
chatScript.style.cssText = "width: 311px; height: 486px;";
chatScript.textContent = JSON.stringify({
  "handle": "gtamabar2004",
  "arch": "js",
  "styles": {
    "a": "ffcc00",
    "b": 82,
    "c": "000000",
    "d": "000000",
    "f": 82,
    "i": 82,
    "k": "ffcc00",
    "l": "ffcc00",
    "m": "ffcc00",
    "o": 82,
    "p": "10",
    "q": "ffcc00",
    "r": 82,
    "fwtickm": 1
  }
});
document.body.appendChild(chatScript);