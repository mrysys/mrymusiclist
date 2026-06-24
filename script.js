/* mry's music list — Tier List Logic */

const TIERS = ['S', 'A', 'B', 'C', 'D', 'E', 'F'];
const STORAGE_KEY = 'mrymusiclist_v1';

// bliss, autumn, azul, tulips, follow are 7x more likely than the rest
const WALLPAPERS = [
  'elements/wallpapers/bliss.png',
  'elements/wallpapers/bliss.png',
  'elements/wallpapers/bliss.png',
  'elements/wallpapers/bliss.png',
  'elements/wallpapers/bliss.png',
  'elements/wallpapers/bliss.png',
  'elements/wallpapers/bliss.png',
  'elements/wallpapers/autumn.png',
  'elements/wallpapers/autumn.png',
  'elements/wallpapers/autumn.png',
  'elements/wallpapers/autumn.png',
  'elements/wallpapers/autumn.png',
  'elements/wallpapers/autumn.png',
  'elements/wallpapers/autumn.png',
  'elements/wallpapers/azul.png',
  'elements/wallpapers/azul.png',
  'elements/wallpapers/azul.png',
  'elements/wallpapers/azul.png',
  'elements/wallpapers/azul.png',
  'elements/wallpapers/azul.png',
  'elements/wallpapers/azul.png',
  'elements/wallpapers/tulips.png',
  'elements/wallpapers/tulips.png',
  'elements/wallpapers/tulips.png',
  'elements/wallpapers/tulips.png',
  'elements/wallpapers/tulips.png',
  'elements/wallpapers/tulips.png',
  'elements/wallpapers/tulips.png',
  'elements/wallpapers/follow.png',
  'elements/wallpapers/follow.png',
  'elements/wallpapers/follow.png',
  'elements/wallpapers/follow.png',
  'elements/wallpapers/follow.png',
  'elements/wallpapers/follow.png',
  'elements/wallpapers/follow.png',
  'elements/wallpapers/moonflower.png',
  'elements/wallpapers/paradise.png',
  'elements/wallpapers/snowtrees.png',
  'elements/wallpapers/solareclipse.png',
  'elements/wallpapers/stonehenge.png',
];

(function setRandomWallpaper() {
  const wp = WALLPAPERS[Math.floor(Math.random() * WALLPAPERS.length)];
  document.getElementById('wallpaper-bg').src = wp;
})();

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

/* ---- WELCOME ---- */
function closeWelcome() {
  document.getElementById('welcome-overlay').classList.add('hidden');
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
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
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

/* ---- AUDIO ELEMENT (declared here so MEDIA PLAYER section can use it) ---- */
const bgAudio = document.getElementById('bg-audio');

/* ---- MEDIA PLAYER ---- */
let audioCtx = null;
let analyser = null;
let gainNode = null;
let vizAnimId = null;
const peaks = [];

function makeDraggable(el, handle) {
  let sx, sy, sl, st;
  handle.addEventListener('mousedown', e => {
    if (e.target.closest('.title-bar-buttons')) return;
    sx = e.clientX; sy = e.clientY;
    const r = el.getBoundingClientRect();
    sl = r.left; st = r.top;
    const onMove = e2 => {
      el.style.left = (sl + e2.clientX - sx) + 'px';
      el.style.top  = (st + e2.clientY - sy) + 'px';
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    e.preventDefault();
  });
}

makeDraggable(document.getElementById('player-window'), document.getElementById('player-title-bar'));

function initAudioCtx() {
  if (audioCtx) return;
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.8;
  gainNode = audioCtx.createGain();
  gainNode.gain.value = bgAudio.volume;
  const src = audioCtx.createMediaElementSource(bgAudio);
  src.connect(gainNode);
  gainNode.connect(analyser);
  analyser.connect(audioCtx.destination);
}

function togglePlayer() {
  const win = document.getElementById('player-window');
  const btn = document.getElementById('player-taskbar-btn');
  const showing = win.style.display === 'block';
  win.style.display = showing ? 'none' : 'block';
  btn.classList.toggle('active', !showing);
  if (!showing) {
    initAudioCtx();
    audioCtx.resume().catch(() => {});
    requestAnimationFrame(startViz);
    updatePlayerSong();
  } else {
    stopViz();
  }
}

function closePlayer() {
  const win = document.getElementById('player-window');
  const btn = document.getElementById('player-taskbar-btn');
  win.style.display = 'none';
  btn.classList.remove('active');
  stopViz();
  bgAudio.pause();
}

function updatePlayerSong() {
  const el = document.getElementById('player-song-name');
  if (!el || !bgAudio.src) return;
  const name = decodeURIComponent(bgAudio.src.split('/').pop()).replace(/\.mp3$/i, '');
  el.textContent = name || 'No song playing';
}

function startViz() {
  const canvas = document.getElementById('viz-canvas');
  canvas.width = canvas.offsetWidth || 360;
  canvas.height = canvas.offsetHeight || 160;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const barCount = 32;
  const gap = 2;
  const barW = Math.floor((W - gap * (barCount - 1)) / barCount);

  for (let i = 0; i < barCount; i++) peaks[i] = 0;

  function frame() {
    vizAnimId = requestAnimationFrame(frame);
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    analyser.getByteFrequencyData(data);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    let x = 0;
    for (let i = 0; i < barCount; i++) {
      const binStart = Math.floor(i * bufLen / barCount);
      const binEnd   = Math.max(binStart + 1, Math.floor((i + 1) * bufLen / barCount));
      let sum = 0;
      for (let b = binStart; b < binEnd; b++) sum += data[b];
      const val  = (sum / (binEnd - binStart)) / 255;
      const barH = Math.max(2, val * (H - 6));

      if (barH > peaks[i]) peaks[i] = barH;
      else peaks[i] = Math.max(0, peaks[i] - 1.5);

      const grad = ctx.createLinearGradient(0, H, 0, H - barH);
      grad.addColorStop(0,    '#7a1e00');
      grad.addColorStop(0.55, '#ff6600');
      grad.addColorStop(1,    '#ffcc00');
      ctx.fillStyle = grad;
      ctx.fillRect(x, H - barH, barW, barH);

      if (peaks[i] > 3) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, Math.floor(H - peaks[i] - 2), barW, 2);
      }

      x += barW + gap;
    }
  }
  frame();
}

function stopViz() {
  if (vizAnimId) { cancelAnimationFrame(vizAnimId); vizAnimId = null; }
}

function playerPlayPause() {
  if (bgAudio.paused) bgAudio.play().catch(() => {});
  else bgAudio.pause();
}

function playerStop() {
  bgAudio.pause();
  bgAudio.currentTime = 0;
}

function playerNext() { playRandomSong(); }

function playerPrev() {
  bgAudio.currentTime = 0;
  bgAudio.play().catch(() => {});
}

function setVolume(val) {
  const v = val / 100;
  bgAudio.volume = v;
  if (gainNode) gainNode.gain.value = v;
  const pct = document.getElementById('player-vol-pct');
  if (pct) pct.textContent = Math.round(val) + '%';
  if (bgAudio.muted && val > 0) {
    bgAudio.muted = false;
    document.getElementById('tray-volume').textContent = '🔊';
  }
}

bgAudio.addEventListener('play', () => {
  const btn = document.getElementById('player-playpause');
  if (btn) btn.innerHTML = '&#9646;&#9646;';
  updatePlayerSong();
});

bgAudio.addEventListener('pause', () => {
  const btn = document.getElementById('player-playpause');
  if (btn) btn.innerHTML = '&#9654;';
});

bgAudio.addEventListener('timeupdate', () => {
  if (!bgAudio.duration) return;
  const pct = (bgAudio.currentTime / bgAudio.duration) * 100;
  const fill = document.getElementById('player-seek-fill');
  if (fill) fill.style.width = pct + '%';
  const timeEl = document.getElementById('player-time');
  if (timeEl) {
    const m = Math.floor(bgAudio.currentTime / 60);
    const s = Math.floor(bgAudio.currentTime % 60);
    timeEl.textContent = m + ':' + String(s).padStart(2, '0');
  }
});

/* ---- BACKGROUND MUSIC ---- */
const SONGS = [
  'elements/music/The Reverse Will.mp3',
  'elements/music/(dream) - Remaster.mp3',
  'elements/music/このまま、どこまでも〜ほうき飛行〜.mp3',
  'elements/music/2008 Toyota Corolla.mp3',
  'elements/music/End of Small Sanctuary.mp3',
  'elements/music/SABBATH.mp3',
  'elements/music/New Look (Wii U Mii Maker Lofi Mix).mp3',
  'elements/music/2010 Toyota Corolla.mp3',
  'elements/music/LEASE.mp3',
  'elements/music/Heartbeat, Heartbreak.mp3',
  'elements/music/TAE.mp3',
  'elements/music/PRESENT FOR YOU.mp3',
  'elements/music/Map Muzak.mp3',
  'elements/music/nostalgic breakdown.mp3'
];

bgAudio.volume = 0.15;

function playRandomSong() {
  bgAudio.src = SONGS[Math.floor(Math.random() * SONGS.length)];
  bgAudio.play().catch(() => {});
}

bgAudio.addEventListener('ended', playRandomSong);
playRandomSong();

// Fallback for browsers that block autoplay until first interaction
const autoplayFallback = () => {
  if (bgAudio.paused) bgAudio.play().catch(() => {});
  document.removeEventListener('click', autoplayFallback);
  document.removeEventListener('keydown', autoplayFallback);
};
document.addEventListener('click', autoplayFallback);
document.addEventListener('keydown', autoplayFallback);

function toggleMute() {
  bgAudio.muted = !bgAudio.muted;
  if (gainNode) gainNode.gain.value = bgAudio.muted ? 0 : bgAudio.volume;
  document.getElementById('tray-volume').textContent = bgAudio.muted ? '🔇' : '🔊';
}

function toggleMainWindow() {
  const win = document.getElementById('main-window');
  const btn = document.getElementById('main-taskbar-btn');
  const showing = win.style.display !== 'none';
  win.style.display = showing ? 'none' : 'block';
  btn.classList.toggle('active', !showing);
}
