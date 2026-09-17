let allMods = [];
let currentCategory = 'All';

// 1. Fetch data dari mods.json
async function fetchMods() {
  try {
    const response = await fetch('mods.json');
    allMods = await response.json();
    renderMods();
  } catch (error) {
    console.error('Gagal mengambil data mods:', error);
    document.getElementById('modGrid').innerHTML = '<p class="no-results">Gagal memuat data mod.</p>';
  }
}

// 2. Render Card Mod ke DOM
function renderMods() {
  const modGrid = document.getElementById('modGrid');
  const searchInput = document.getElementById('searchInput').value.toLowerCase();

  const filteredMods = allMods.filter(mod => {
    const matchesCategory = currentCategory === 'All' || mod.category === currentCategory;
    const matchesSearch = mod.title.toLowerCase().includes(searchInput) || 
                          (mod.author && mod.author.toLowerCase().includes(searchInput));
    return matchesCategory && matchesSearch;
  });

  if (filteredMods.length === 0) {
    modGrid.innerHTML = '<p class="no-results">Mod tidak ditemukan.</p>';
    return;
  }

  modGrid.innerHTML = filteredMods.map(mod => `
    <div class="mod-card">
      <div class="card-image-wrap" onclick="openModal(${mod.id})" style="cursor: pointer;">
        <img src="${mod.thumbnail || 'https://via.placeholder.com/300x180'}" alt="${mod.title}">
        <span class="badge">${mod.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title" onclick="openModal(${mod.id})" style="cursor: pointer;">${mod.title}</h3>
        <p class="card-meta">Author: ${mod.author || 'Unknown'} | ${mod.file_size || 'N/A'}</p>
      </div>
      <div class="card-footer">
        <button class="btn-download" onclick="openModal(${mod.id})">PREVIEW & DOWNLOAD</button>
      </div>
    </div>
  `).join('');
}

// 3. Logika Modal Preview
function openModal(id) {
  const mod = allMods.find(m => m.id === id);
  if (!mod) return;

  document.getElementById('modalImg').src = mod.thumbnail || 'https://via.placeholder.com/600x300';
  document.getElementById('modalTitle').innerText = mod.title;
  document.getElementById('modalMeta').innerText = `Kategori: ${mod.category} | Author: ${mod.author || 'Unknown'} | Ukuran: ${mod.file_size || 'N/A'}`;
  document.getElementById('modalDesc').innerText = mod.description || 'Tidak ada deskripsi khusus.';
  document.getElementById('modalGuide').innerText = mod.install_guide || '1. Ekstrak file.\n2. Masukkan ke folder modloader.';
  document.getElementById('modalDownload').href = mod.download_url || '#';

  document.getElementById('modModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modModal').style.display = 'none';
}

// Tutup modal jika area di luar kotak modal diklik
window.onclick = function(event) {
  const modal = document.getElementById('modModal');
  if (event.target === modal) {
    closeModal();
  }
};

// 4. Logika Filter Kategori & Search
document.getElementById('categoryBar').addEventListener('click', (e) => {
  if (e.target.classList.contains('cat-btn')) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentCategory = e.target.getAttribute('data-cat');
    renderMods();
  }
});

document.getElementById('searchInput').addEventListener('input', renderMods);

// 5. Logika Theme Switcher (Auto Save)
function changeTheme(themeName) {
  if (themeName === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
  localStorage.setItem('selectedTheme', themeName);
}

// Load tema saat pertama kali dibuka
const savedTheme = localStorage.getItem('selectedTheme') || 'default';
if (savedTheme !== 'default') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = savedTheme;
  fetchMods();
});