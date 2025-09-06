// Basit seçiciler
export const $ = sel => document.querySelector(sel);
export const $$ = sel => Array.from(document.querySelectorAll(sel));

// Arama kutusunu API spam’ine çevirmemek için debounce
export const debounce = (fn, wait = 400) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

export const formatYear = (s) => (s ? (s + '').slice(0,4) : '—');

export const imageUrl = (path, size='w342') => {
  if (!path) return 'https://via.placeholder.com/342x513?text=No+Image';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

// Basit localStorage sarmalayıcı
export const storage = {
  get(key, def = null) { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
};

// Kart HTML’i
export function makeCard(item, isFav) {
  const y = formatYear(item.release_date || item.first_air_date);
  const vote = item.vote_average ? item.vote_average.toFixed(1) : '—';
  const title = item.title || item.name || '—';

  return `
  <article class="card" data-id="${item.id}" data-media="${item.media_type || 'movie'}">
    <div class="card__wrap">
      <img class="card__img" src="${imageUrl(item.poster_path)}" alt="${title}" loading="lazy" />
      <button class="card__fav" data-action="fav" title="Favori">
        ${isFav ? '★' : '☆'}
      </button>
    </div>
    <div class="card__body">
      <div class="card__title">${title}</div>
      <div class="card__meta">
        <span>${y}</span>
        <span>⭐ ${vote}</span>
      </div>
      <div class="card__actions">
        <button class="btn primary" data-action="details">Detay</button>
        <button class="btn" data-action="fav">${isFav ? '★ Favori' : '☆ Favori'}</button>
      </div>
    </div>
  </article>`;
}


// Modal içeriği
export function modalTemplate(d) {
  const title = d.title || d.name || '—';
  const y = formatYear(d.release_date || d.first_air_date);
  const genres = (d.genres || []).map(g => `<span class="badge">${g.name}</span>`).join(' ');
  const cast = (d.credits?.cast || []).slice(0, 8).map(c => c.name).join(', ');
  return `
    <div class="details">
      <img class="details__poster" src="${imageUrl(d.poster_path,'w342')}" alt="${title}" />
      <div>
        <h2 class="details__title">${title} <span class="badge">${y}</span></h2>
        <p>${d.overview || 'Özet bulunamadı.'}</p>
        <div class="tags">${genres}</div>
        <p><strong>Oyuncular:</strong> ${cast || '—'}</p>
        <p><strong>IMDB / TMDB:</strong> ⭐ ${d.vote_average ? d.vote_average.toFixed(1) : '—'} (${d.vote_count || 0} oy)</p>
      </div>
    </div>
  `;
}
