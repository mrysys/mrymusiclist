/* mry's music list — Tier List Logic */

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
const STORAGE_KEY = 'mrymusiclist_v1';

let albums = {};

function loadAlbums() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    albums = stored ? JSON.parse(stored) : {};
  } catch (_) {
    albums = {};
  }
  TIERS.forEach(t => { if (!albums[t]) albums[t] = []; });
}

function saveAlbums() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(albums));
}

function setStatus(msg) {
  document.getElementById('status-text').textContent = msg;
}

function updateCount() {
  const total = TIERS.reduce((n, t) => n + albums[t].length, 0);
  document.getElementById('album-count').textContent = total;
}

/* ---- RENDER ---- */
function renderTierList() {
  const container = document.getElementById('tier-list');
  container.innerHTML = '';

  TIERS.forEach(tier => {
    const row = document.createElement('div');
    row.className = 'tier-row';

    const label = document.createElement('div');
    label.className = 'tier-label tier-' + tier.toLowerCase();
    label.textContent = tier;

    const content = document.createElement('div');
    content.className = 'tier-content';

    if (albums[tier].length === 0) {
      const empty = document.createElement('span');
      empty.className = 'tier-empty';
      empty.textContent = 'No albums yet...';
      content.appendChild(empty);
    } else {
      albums[tier].forEach((album, idx) => {
        content.appendChild(buildAlbumEl(album, tier, idx));
      });
    }

    row.appendChild(label);
    row.appendChild(content);
    container.appendChild(row);
  });

  updateCount();
}

function buildAlbumEl(album, tier, idx) {
  const item = document.createElement('div');
  item.className = 'album-item';

  const tooltip = document.createElement('span');
  tooltip.className = 'album-tooltip';
  tooltip.textContent = album.name;

  const link = document.createElement('a');
  link.href = album.link || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const img = document.createElement('img');
  img.src = album.image;
  img.alt = album.name;
  img.loading = 'lazy';
  img.onerror = function () {
    this.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">' +
      '<rect width="64" height="64" fill="#CCC"/>' +
      '<text x="32" y="34" font-size="9" text-anchor="middle" font-family="Tahoma,Arial" fill="#666">No Image</text>' +
      '</svg>'
    );
  };
  link.appendChild(img);

  const nameEl = document.createElement('div');
  nameEl.className = 'album-name';
  nameEl.textContent = album.name;

  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-btn';
  removeBtn.title = 'Remove "' + album.name + '"';
  removeBtn.textContent = '✕';
  removeBtn.onclick = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Remove "' + album.name + '" from ' + tier + ' tier?')) {
      albums[tier].splice(idx, 1);
      saveAlbums();
      renderTierList();
      setStatus('Removed "' + album.name + '" from ' + tier + ' tier.');
    }
  };

  item.appendChild(tooltip);
  item.appendChild(link);
  item.appendChild(nameEl);
  item.appendChild(removeBtn);
  return item;
}

/* ---- DIALOG ---- */
function openDialog() {
  document.getElementById('dialog-overlay').classList.add('active');
  setTimeout(() => document.getElementById('album-name').focus(), 50);
}

function closeDialogBtn() {
  document.getElementById('dialog-overlay').classList.remove('active');
  document.getElementById('add-form').reset();
  document.getElementById('image-preview').style.display = 'none';
  document.getElementById('image-preview').src = '';
}

function overlayClick(e) {
  if (e.target === document.getElementById('dialog-overlay')) closeDialogBtn();
}

function previewImage(input) {
  const file = input.files[0];
  if (!file) return;
  document.getElementById('album-image-url').value = '';
  const reader = new FileReader();
  reader.onload = function (ev) {
    const el = document.getElementById('image-preview');
    el.src = ev.target.result;
    el.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

document.getElementById('album-image-url').addEventListener('input', function () {
  if (this.value.trim()) {
    const el = document.getElementById('image-preview');
    el.src = this.value.trim();
    el.style.display = 'block';
  }
});

function submitAlbum(e) {
  e.preventDefault();

  const name     = document.getElementById('album-name').value.trim();
  const link     = document.getElementById('album-link').value.trim() || '#';
  const tier     = document.getElementById('album-tier').value;
  const imageUrl = document.getElementById('album-image-url').value.trim();
  const file     = document.getElementById('album-image-file').files[0];

  if (!name) { alert('Please enter an album name.'); return; }
  if (!imageUrl && !file) { alert('Please provide an image URL or upload a cover image.'); return; }

  function push(image) {
    albums[tier].push({ name, image, link });
    saveAlbums();
    renderTierList();
    closeDialogBtn();
    setStatus('Added "' + name + '" to ' + tier + ' tier.');
  }

  if (file) {
    const reader = new FileReader();
    reader.onload = ev => push(ev.target.result);
    reader.readAsDataURL(file);
  } else {
    push(imageUrl);
  }
}

/* ---- EXPORT / IMPORT ---- */
function exportList() {
  const json = JSON.stringify(albums, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = 'mrymusiclist_export.json';
  a.click();
  URL.revokeObjectURL(url);
  setStatus('List exported to mrymusiclist_export.json');
}

function importList() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.onchange = function (e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (ev) {
      try {
        const data = JSON.parse(ev.target.result);
        const validTiers = TIERS.filter(t => Array.isArray(data[t]));
        if (validTiers.length === 0) { alert('No valid tier data found in file.'); return; }
        if (confirm('Merge imported albums with your current list?')) {
          validTiers.forEach(t => { albums[t] = albums[t].concat(data[t]); });
          saveAlbums();
          renderTierList();
          setStatus('Import complete.');
        }
      } catch (_) {
        alert('Could not read file — make sure it is a previously exported mrymusiclist JSON.');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ---- CLEAR ALL ---- */
function clearAll() {
  if (!confirm('Are you sure you want to clear ALL albums from the tier list?\nThis cannot be undone.')) return;
  TIERS.forEach(t => { albums[t] = []; });
  saveAlbums();
  renderTierList();
  setStatus('All albums cleared.');
}

/* ---- CLOCK ---- */
function updateClock() {
  const now = new Date();
  document.getElementById('tray-clock').textContent = now.toLocaleTimeString([], {
    hour: '2-digit', minute: '2-digit'
  });
}
setInterval(updateClock, 1000);
updateClock();

/* ---- FORM SUBMIT HANDLER ---- */
document.getElementById('add-form').addEventListener('submit', submitAlbum);

/* ---- INIT ---- */
loadAlbums();
renderTierList();
setStatus('Welcome to mry\'s music list! Click “Add Album” to get started.');
