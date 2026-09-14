let allMods = [];
let activeCategory = 'All';
let searchQuery = '';

// 1. Ambil data dari mods.json
async function fetchMods() {
  try {
    const response = await fetch('mods.json');
    allMods = await response.json();
    renderMods();
  } catch (err) {
    console.error('Gagal mengambil data mod:', err);
  }
}

// 2. Filter & Render Mod ke HTML
function renderMods() {
  const container = document.getElementById('modGrid');
  container.innerHTML = '';

  const filtered = allMods.filter(mod => {
    const matchesCat = activeCategory === 'All' || mod.category === activeCategory;
    const matchesSearch = mod.title.toLowerCase().includes(searchQuery) ||
                          mod.category.toLowerCase().includes(searchQuery) ||
                          mod.author.toLowerCase().includes(searchQuery);
    return matchesCat && matchesSearch;
  });

  if (filtered.length === 0) {
    container.innerHTML = `<p class="no-results">Mod tidak ditemukan.</p>`;
    return;
  }

  filtered.forEach(mod => {
    const card = document.createElement('div');
    card.className = 'mod-card';
    card.innerHTML = `
      <div>
        <div class="card-image-wrap">
          <img src="${mod.thumbnail}" alt="${mod.title}">
          <span class="badge">${mod.category}</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${mod.title}</h3>
          <p class="card-meta">By: ${mod.author} • ${mod.fileSize}</p>
        </div>
      </div>
      <div class="card-footer">
        <a href="${mod.downloadUrl}" target="_blank" rel="noopener noreferrer" class="btn-download">
          Download Mod ➔
        </a>
      </div>
    `;
    container.innerHTML += card.outerHTML;
  });
}

// 3. Event Listener Search Bar
document.getElementById('searchInput').addEventListener('input', (e) => {
  searchQuery = e.target.value.toLowerCase();
  renderMods();
});

// 4. Event Listener Tombol Kategori
document.getElementById('categoryBar').addEventListener('click', (e) => {
  if (e.target.classList.contains('cat-btn')) {
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    activeCategory = e.target.getAttribute('data-cat');
    renderMods();
  }
});

// Jalankan aplikasi saat dibuka
fetchMods();

// Chatango Widget Embed (gtamabar2004)
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

function changeTheme(themeName) {
  if (themeName === 'default') {
    document.documentElement.removeAttribute('data-theme');
  } else {
    document.documentElement.setAttribute('data-theme', themeName);
  }
  localStorage.setItem('selectedTheme', themeName);
}

const savedTheme = localStorage.getItem('selectedTheme') || 'default';
if (savedTheme !== 'default') {
  document.documentElement.setAttribute('data-theme', savedTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  const themeSelect = document.getElementById('themeSelect');
  if (themeSelect) themeSelect.value = savedTheme;
});