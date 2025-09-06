import { $, $$, debounce, storage, makeCard, modalTemplate } from './utils.js';

// === Ayarlar ===
const API = 'https://api.themoviedb.org/3';
// DEMO için anahtar client'ta. Prod'da proxy önerilir.
const API_KEY = 'b54be6ca5d38c7f2d162d28ff5884f45';

const themeToggle = document.getElementById('themeToggle');
const THEME_KEY = 'theme'; // 'dark' | 'light' | null

// ilk yüklemede tema uygula
(() => {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark') document.documentElement.classList.add('theme-dark');
  if (saved === 'light') document.documentElement.classList.add('theme-light');
})();

themeToggle.addEventListener('click', () => {
  const root = document.documentElement;
  const isDark = root.classList.toggle('theme-dark');
  if (isDark){
    root.classList.remove('theme-light');
    localStorage.setItem(THEME_KEY, 'dark');
    themeToggle.textContent = '🌞';
  } else {
    root.classList.add('theme-light');
    localStorage.setItem(THEME_KEY, 'light');
    themeToggle.textContent = '🌙';
  }
});



// === DOM ===
const elSearch = $('#search');
const elClear = $('#clear');
const grid = $('#grid');
const gridFav = $('#gridFav');
const gridTrend = $('#gridTrend');
const emptyResults = $('#emptyResults');
const emptyFav = $('#emptyFav');
const emptyTrend = $('#emptyTrend');
const tabs = $$('.tab');
const panels = $$('.panel');

const modal = $('#modal');
const modalBody = $('#modalBody');
const closeModalBtn = $('#closeModal');

// === Favoriler ===
const FAV_KEY = 'movie_favs';
let favIds = new Set(storage.get(FAV_KEY, []));
function saveFavs() { storage.set(FAV_KEY, Array.from(favIds)); }

// === Yardımcılar ===
async function fetchJSON(path, params = {}) {
  const url = new URL(API + path);
  url.searchParams.set('api_key', API_KEY);
  for (const [k,v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('API error ' + res.status);
  return res.json();
}

function renderGrid(target, items) {
  target.innerHTML = items.map(item => makeCard(item, favIds.has(item.id))).join('');
}
function showEmpty(targetEmpty, show) {
  targetEmpty.classList.toggle('hidden', !show);
}

// === Arama (debounce) ===
const onInput = debounce(async (term) => {
  if (!API_KEY || API_KEY.startsWith('REPLACE_')) {
    grid.innerHTML = '<div class="empty">Lütfen app.js içindeki API_KEY değerini TMDB v3 key ile değiştirin.</div>';
    showEmpty(emptyResults, false);
    return;
  }
  if (!term) {
    grid.innerHTML = '';
    showEmpty(emptyResults, true);
    return;
  }
  try {
    const data = await fetchJSON('/search/multi', { query: term });
    const results = (data.results || []).filter(x => ['movie','tv'].includes(x.media_type));
    renderGrid(grid, results);
    showEmpty(emptyResults, results.length === 0);
  } catch (e) {
    grid.innerHTML = '<div class="empty">Arama başarısız. Konsolu kontrol edin.</div>';
    showEmpty(emptyResults, false);
    console.error(e);
  }
}, 450);

elSearch.addEventListener('input', e => onInput(e.target.value.trim()));
elClear.addEventListener('click', () => { elSearch.value=''; onInput(''); });

// === Trend ===
async function loadTrending() {
  try {
    const data = await fetchJSON('/trending/all/week');
    const results = (data.results || []).filter(x => ['movie','tv'].includes(x.media_type));
    renderGrid(gridTrend, results);
    showEmpty(emptyTrend, results.length === 0);
  } catch (e) {
    gridTrend.innerHTML = '<div class="empty">Trend verisi alınamadı.</div>';
    showEmpty(emptyTrend, false);
    console.error(e);
  }
}

// === Favoriler paneli ===
async function loadFavs() {
  if (favIds.size === 0) {
    gridFav.innerHTML = '';
    showEmpty(emptyFav, true);
    return;
  }
  const out = [];
  for (const id of favIds) {
    try {
      let d = await fetchJSON(`/movie/${id}`);
      d.media_type = 'movie';
      out.push(d);
    } catch {
      try {
        let d2 = await fetchJSON(`/tv/${id}`);
        d2.media_type = 'tv';
        out.push(d2);
      } catch {}
    }
  }
  renderGrid(gridFav, out);
  showEmpty(emptyFav, out.length === 0);
}

// === Kart tıklamaları (detay / favori) ===
function handleGridClick(e, container) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const card = e.target.closest('.card');
  const id = Number(card?.dataset?.id);
  const media = card?.dataset?.media || 'movie';
  if (!id) return;

  const action = btn.dataset.action;
  if (action === 'details') {
    openDetails(id, media);
  } else if (action === 'fav') {
    if (favIds.has(id)) favIds.delete(id); else favIds.add(id);
    saveFavs();
    if (container === gridFav) {
      loadFavs();
    } else {
      btn.textContent = favIds.has(id) ? '★ Favori' : '☆ Favori';
    }
  }
}

grid.addEventListener('click', (e)=>handleGridClick(e, grid));
gridTrend.addEventListener('click', (e)=>handleGridClick(e, gridTrend));
gridFav.addEventListener('click', (e)=>handleGridClick(e, gridFav));

// === Detay modalı ===
async function openDetails(id, media='movie') {
  try {
    const d = await fetchJSON(`/${media}/${id}`, { append_to_response: 'credits' });
    modalBody.innerHTML = modalTemplate(d);
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
  } catch (e) {
    console.error(e);
  }
}
const closeModal = () => {
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden','true');
};
$('#closeModal').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

// === Sekmeler ===
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  panels.forEach(p => p.classList.remove('active'));
  t.classList.add('active');
  const tab = t.dataset.tab;
  $('#panel-' + tab).classList.add('active');
  if (tab === 'trending') loadTrending();
  if (tab === 'favorites') loadFavs();
}));

// İlk yükleme
showEmpty(emptyResults, true);
loadTrending();
