// === KONFIGURASI FIREBASE ===
const firebaseConfig = {
  apiKey: "AIzaSyDi2mtSkBA8nzMFS9P_XW85pgLd1xuv2vQ",
  authDomain: "gtakuh-64e29.firebaseapp.com",
  databaseURL: "https://gtakuh-64e29-default-rtdb.firebaseio.com",
  projectId: "gtakuh-64e29",
  storageBucket: "gtakuh-64e29.firebasestorage.app",
  messagingSenderId: "49771543806",
  appId: "1:49771543806:web:c704c55460157b549139af"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let activeModId = null;
let allMods = [];
let currentCategory = 'All';

// 1. Fetch data mods REALTIME dari Firebase
function fetchModsFromFirebase() {
  database.ref('mods').on('value', (snapshot) => {
    allMods = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        allMods.push({
          id: child.key,
          ...child.val()
        });
      });
    }
    renderMods();
  });
}

// 2. Render Card Mod ke DOM
function renderMods() {
  const modGrid = document.getElementById('modGrid');
  if (!modGrid) return;

  const searchInput = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '';

  const filteredMods = allMods.filter(mod => {
    const matchesCategory = currentCategory === 'All' || mod.category === currentCategory;
    const matchesSearch = (mod.title && mod.title.toLowerCase().includes(searchInput)) || 
                          (mod.author && mod.author.toLowerCase().includes(searchInput));
    return matchesCategory && matchesSearch;
  });

  if (filteredMods.length === 0) {
    modGrid.innerHTML = '<p class="no-results" style="grid-column: 1/-1; text-align: center; color: #888;">Mod tidak ditemukan.</p>';
    return;
  }

  modGrid.innerHTML = filteredMods.map(mod => `
    <div class="mod-card">
      <div class="card-image-wrap" onclick="openModal('${mod.id}')" style="cursor: pointer;">
        <img src="${mod.thumbnail || 'https://via.placeholder.com/300x180'}" alt="${mod.title}">
        <span class="badge">${mod.category}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title" onclick="openModal('${mod.id}')" style="cursor: pointer;">${mod.title}</h3>
        <p class="card-meta">Author: ${mod.author || 'Unknown'} | ${mod.file_size || 'N/A'}</p>
      </div>
      <div class="card-footer">
        <button class="btn-download" onclick="openModal('${mod.id}')">PREVIEW & DOWNLOAD</button>
      </div>
    </div>
  `).join('');
}

// 3. Logika Modal Preview
function openModal(id) {
  const mod = allMods.find(m => m.id === id);
  if (!mod) return;

  activeModId = id;

  document.getElementById('modalImg').src = mod.thumbnail || 'https://via.placeholder.com/600x300';
  document.getElementById('modalTitle').innerText = mod.title;
  document.getElementById('modalMeta').innerText = `Kategori: ${mod.category} | Author: ${mod.author || 'Unknown'} | Ukuran: ${mod.file_size || 'N/A'}`;
  document.getElementById('modalDesc').innerText = mod.description || 'Tidak ada deskripsi khusus.';
  document.getElementById('modalGuide').innerText = mod.install_guide || '1. Ekstrak file.\n2. Masukkan ke folder modloader.';
  document.getElementById('modalDownload').href = mod.download_url || '#';

  loadComments(id);

  document.getElementById('modModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modModal').style.display = 'none';
  if (activeModId) {
    database.ref('comments/' + activeModId).off();
    activeModId = null;
  }
}

window.onclick = function(event) {
  const modal = document.getElementById('modModal');
  if (event.target === modal) {
    closeModal();
  }
};

// 4. Logika Filter Kategori & Search
const categoryBar = document.getElementById('categoryBar');
if (categoryBar) {
  categoryBar.addEventListener('click', (e) => {
    if (e.target.classList.contains('cat-btn')) {
      document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-cat');
      renderMods();
    }
  });
}

const searchInputEl = document.getElementById('searchInput');
if (searchInputEl) {
  searchInputEl.addEventListener('input', renderMods);
}

// 5. Logika Theme Switcher
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
  fetchModsFromFirebase();
});

// 6. Komentar Realtime
function loadComments(modId) {
  const commentsList = document.getElementById('commentsList');
  if (!commentsList) return;
  commentsList.innerHTML = '<p style="color: #888; font-size: 12px;">Memuat komentar...</p>';

  database.ref('comments/' + modId).on('value', (snapshot) => {
    commentsList.innerHTML = '';
    const data = snapshot.val();

    if (!data) {
      commentsList.innerHTML = '<p style="color: #888; font-size: 12px;">Belum ada komentar. Jadi yang pertama!</p>';
      return;
    }

    Object.values(data).forEach(c => {
      const item = document.createElement('div');
      item.style.cssText = 'background: rgba(255,255,255,0.05); padding: 8px; border-radius: 4px; margin-bottom: 6px; font-size: 13px;';
      item.innerHTML = `<strong>${c.author}</strong> <span style="font-size: 10px; color: #888;">(${c.time})</span>:<br>${c.text}`;
      commentsList.appendChild(item);
    });

    commentsList.scrollTop = commentsList.scrollHeight;
  });
}

function submitComment(e) {
  e.preventDefault();
  if (!activeModId) return;

  const authorInput = document.getElementById('commentAuthor');
  const textInput = document.getElementById('commentText');

  const author = authorInput.value.trim();
  const text = textInput.value.trim();

  if (!author || !text) return;

  const now = new Date();
  const timeStr = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;

  database.ref('comments/' + activeModId).push({
    author: author,
    text: text,
    time: timeStr
  });

  textInput.value = '';
}