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

  activeModId = id; // Simpan ID mod aktif

  document.getElementById('modalImg').src = mod.thumbnail || 'https://via.placeholder.com/600x300';
  document.getElementById('modalTitle').innerText = mod.title;
  document.getElementById('modalMeta').innerText = `Kategori: ${mod.category} | Author: ${mod.author || 'Unknown'} | Ukuran: ${mod.file_size || 'N/A'}`;
  document.getElementById('modalDesc').innerText = mod.description || 'Tidak ada deskripsi khusus.';
  document.getElementById('modalGuide').innerText = mod.install_guide || '1. Ekstrak file.\n2. Masukkan ke folder modloader.';
  document.getElementById('modalDownload').href = mod.download_url || '#';

  // Load komentar realtime
  loadComments(id);

  document.getElementById('modModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('modModal').style.display = 'none';
  if (activeModId) {
    database.ref('comments/' + activeModId).off(); // Matikan listener
    activeModId = null;
  }
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

// 1. Baca Komentar secara Realtime
function loadComments(modId) {
  const commentsList = document.getElementById('commentsList');
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

// 2. Kirim Komentar Baru
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

// Membaca data mod realtime dari Firebase
const modGrid = document.querySelector('.mod-grid'); // Sesuaikan nama class container kartu mod kamu

function fetchModsFromFirebase() {
  firebase.database().ref('mods').on('value', (snapshot) => {
    if (!modGrid) return;
    modGrid.innerHTML = ''; // Clear konten lama

    if (!snapshot.exists()) {
      modGrid.innerHTML = '<p>Belum ada mod yang diupload.</p>';
      return;
    }

    snapshot.forEach((child) => {
      const mod = child.val();
      const modCard = `
        <div class="mod-card" data-category="${mod.category}">
          <img src="${mod.image}" alt="${mod.title}" loading="lazy">
          <div class="mod-info">
            <span class="mod-badge">${mod.category}</span>
            <h3>${mod.title}</h3>
            <p>${mod.desc}</p>
            <a href="${mod.downloadUrl}" target="_blank" class="btn-download">Download Mod</a>
          </div>
        </div>
      `;
      modGrid.innerHTML += modCard;
    });
  });
}

// Jalankan fungsi saat web dibuka
document.addEventListener('DOMContentLoaded', fetchModsFromFirebase);