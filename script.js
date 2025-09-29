// =========================
// Mini PokeDex - script.js, por David Cristopher Coronado Jiménez Cabrera
// Carné 202401777
// =========================

const API_BASE = 'https://pokeapi.co/api/v2/pokemon/';

// Elementos del DOM
const pokemonListEl = document.getElementById('pokemonList');
const btnLoad = document.getElementById('btnLoad');
const btnSearch = document.getElementById('btnSearch');
const searchInput = document.getElementById('searchInput');
const favoritesListEl = document.getElementById('favoritesList');

const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const detailClose = document.getElementById('detailClose');

// Función para manejar Favoritos con localStorage
let favorites = loadFavorites();
function saveFavorites() { localStorage.setItem('pokedex_favorites', JSON.stringify(favorites)); }
function loadFavorites() { return JSON.parse(localStorage.getItem('pokedex_favorites') || '[]'); }

// Función Fetch
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error en fetch');
  return res.json();
}

// Cargar lista de Pokémon con límite
async function loadPokemon(limit = 20) {
  try {
    const data = await fetchJSON(`${API_BASE}?limit=${limit}`);
    const detailPromises = data.results.map(r => fetchJSON(r.url));
    const detailed = await Promise.all(detailPromises);
    renderPokemonList(detailed);
  } catch (err) {
    pokemonListEl.innerHTML = `<p>Error: ${err.message}</p>`;
  }
}

// Función para obtener Pokémon por nombre o ID
async function getPokemon(query) {
  const q = String(query).trim().toLowerCase();
  return fetchJSON(`${API_BASE}${q}`);
}

// Renderizado Dinámico - Lista
function renderPokemonList(pokemonArray) {
  pokemonListEl.innerHTML = '';
  pokemonArray.forEach(p => pokemonListEl.appendChild(createPokemonCard(p)));
}

function createPokemonCard(pokemonData) {
  const article = document.createElement('article');
  article.className = 'pokemon-card';
  if (favorites.includes(pokemonData.name)) article.classList.add('pokemon-card--favorite');

  article.innerHTML = `
    <img class="pokemon-card__image" src="${pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default}" alt="${pokemonData.name}" />
    <h3 class="pokemon-card__name">${pokemonData.name}</h3>
    <div class="pokemon-card__types">
      ${pokemonData.types.map(t => `<span class="type-badge">${t.type.name}</span>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="pokedex__btn btn-detail" data-name="${pokemonData.name}">Ver detalle</button>
      <button class="pokedex__btn btn-fav" data-name="${pokemonData.name}">${favorites.includes(pokemonData.name) ? 'Quitar ⭐' : 'Fav ⭐'}</button>
    </div>
  `;

  // Detalle
  article.querySelector('.btn-detail').addEventListener('click', () => openDetail(pokemonData));

  // Favorito
  article.querySelector('.btn-fav').addEventListener('click', (e) => {
    toggleFavorite(pokemonData.name);
    e.currentTarget.textContent = favorites.includes(pokemonData.name) ? 'Quitar ⭐' : 'Fav ⭐';
    article.classList.toggle('pokemon-card--favorite', favorites.includes(pokemonData.name));
    renderFavorites();
  });

  return article;
}

// Detalle de modelos
function openDetail(pokemonData) {
  detailContent.innerHTML = `
    <div style="text-align:center;">
      <img class="detail__image" src="${pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default}" alt="${pokemonData.name}">
      <h2 style="text-transform:capitalize;margin-top:8px;">#${pokemonData.id} - ${pokemonData.name}</h2>
      <div style="display:flex;gap:6px;justify-content:center;margin-top:6px;">
        ${pokemonData.types.map(t => `<span class="type-badge">${t.type.name}</span>`).join('')}
      </div>
    </div>
    <div>
      <p><strong>Altura:</strong> ${pokemonData.height} dm</p>
      <p><strong>Peso:</strong> ${pokemonData.weight} hg</p>
      <h3>Estadísticas base</h3>
      <ul>${pokemonData.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('')}</ul>
      <button id="favFromDetail" class="pokedex__btn">${favorites.includes(pokemonData.name) ? 'Quitar ⭐' : 'Fav ⭐'}</button>
    </div>
  `;

  document.getElementById('favFromDetail').addEventListener('click', (e) => {
    toggleFavorite(pokemonData.name);
    renderFavorites();
    e.currentTarget.textContent = favorites.includes(pokemonData.name) ? 'Quitar ⭐' : 'Fav ⭐';
  });

  detailModal.classList.remove('detail--hidden');
}

detailClose.addEventListener('click', () => detailModal.classList.add('detail--hidden'));
detailModal.addEventListener('click', (e) => { if (e.target === detailModal) detailModal.classList.add('detail--hidden'); });

// Función Favoritos
function toggleFavorite(name) {
  if (favorites.includes(name)) favorites = favorites.filter(f => f !== name);
  else favorites.push(name);
  saveFavorites();
}

function renderFavorites() {
  favoritesListEl.innerHTML = '';
  if (favorites.length === 0) { favoritesListEl.innerHTML = '<li>No hay favoritos</li>'; return; }
  favorites.forEach(name => {
    const li = document.createElement('li');
    li.className = 'favorites__item';
    li.innerHTML = `
      <button class="pokedex__btn fav-item-btn" data-name="${name}">${name}</button>
      <button class="pokedex__btn pokedex__btn--secondary remove-fav" data-name="${name}">Eliminar</button>
    `;
    li.querySelector('.fav-item-btn').addEventListener('click', async () => openDetail(await getPokemon(name)));
    li.querySelector('.remove-fav').addEventListener('click', () => { toggleFavorite(name); renderFavorites(); });
    favoritesListEl.appendChild(li);
  });
}

// Eventos
btnSearch.addEventListener('click', async () => {
  const q = searchInput.value.trim();
  if (!q) return alert('Escribe un nombre o ID');
  try { renderPokemonList([await getPokemon(q)]); }
  catch { alert('Pokémon no encontrado'); }
});
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') btnSearch.click(); });

// Botón ahora carga 151
btnLoad.addEventListener('click', () => loadPokemon(151));

// Init: favoritos + primeros 20
(function init() {
  renderFavorites();
  loadPokemon(20);
})();
