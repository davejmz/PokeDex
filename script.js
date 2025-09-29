// app.js
// -------------------------------
// Mini PokeDex - app.js
// Implementa: fetch a PokeAPI, render dinámico, búsqueda, detalle, favoritos (localStorage), y eventos DOM.
// Cumple con las Partes I-V del enunciado.
// -------------------------------

const API_BASE = 'https://pokeapi.co/api/v2/pokemon/';

// === Elementos del DOM (Parte I y III: estructura y renderizado) ===
const pokemonListEl = document.getElementById('pokemonList');
const btnLoad = document.getElementById('btnLoad');
const btnSearch = document.getElementById('btnSearch');
const searchInput = document.getElementById('searchInput');
const favoritesListEl = document.getElementById('favoritesList');

const detailModal = document.getElementById('detailModal');
const detailContent = document.getElementById('detailContent');
const detailClose = document.getElementById('detailClose');

// === Gestión de favoritos (Parte IV: persistencia en localStorage) ===
let favorites = loadFavorites(); // array de nombres/ids

function saveFavorites() {
  localStorage.setItem('pokedex_favorites', JSON.stringify(favorites));
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem('pokedex_favorites');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('No se pudo leer favoritos:', e);
    return [];
  }
}

// === FETCH helpers (Parte II: consumo de la API) ===
async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Error en fetch: ' + res.status);
  return res.json();
}

// Obtiene la lista (primeros 20) - usa endpoint con limit
async function loadInitialPokemon(limit = 20) {
  try {
    const data = await fetchJSON(`${API_BASE}?limit=${limit}`);
    const results = data.results; // array {name, url}
    // Para renderizar tarjetas necesitamos datos detallados: haremos fetch en paralelo
    const detailPromises = results.map(r => fetchJSON(r.url));
    const detailed = await Promise.all(detailPromises);
    renderPokemonList(detailed);
  } catch (err) {
    console.error('Error cargando iniciales:', err);
    pokemonListEl.innerHTML = `<p>Error al cargar Pokémon: ${err.message}</p>`;
  }
}

// Obtener un Pokémon por nombre o id (búsqueda)
async function getPokemon(query) {
  try {
    const q = String(query).trim().toLowerCase();
    const data = await fetchJSON(`${API_BASE}${q}`);
    return data;
  } catch (err) {
    throw new Error('Pokémon no encontrado');
  }
}

// === RENDER - Parte III: renderizado dinámico ===
function renderPokemonList(pokemonArray) {
  // Limpia lista
  pokemonListEl.innerHTML = '';
  pokemonArray.forEach(p => {
    const card = createPokemonCard(p);
    pokemonListEl.appendChild(card);
  });
}

function createPokemonCard(pokemonData) {
  const article = document.createElement('article');
  article.className = 'pokemon-card';
  if (favorites.includes(pokemonData.name)) {
    article.classList.add('pokemon-card--favorite');
  }

  article.innerHTML = `
    <img class="pokemon-card__image" src="${pokemonData.sprites.other['official-artwork'].front_default || pokemonData.sprites.front_default}" alt="${pokemonData.name}" />
    <h3 class="pokemon-card__name">${pokemonData.name}</h3>
    <div class="pokemon-card__types">
      ${pokemonData.types.map(t => `<span class="type-badge type-${t.type.name}">${t.type.name}</span>`).join('')}
    </div>
    <div style="display:flex;gap:8px;margin-top:8px;">
      <button class="pokedex__btn btn-detail" data-name="${pokemonData.name}">Ver detalle</button>
      <button class="pokedex__btn btn-fav" data-name="${pokemonData.name}">${favorites.includes(pokemonData.name) ? 'Quitar ⭐' : 'Fav ⭐'}</button>
    </div>
  `;

  // Evento: abrir detalle (Parte III - detalle)
  article.querySelector('.btn-detail').addEventListener('click', async (e) => {
    try {
      openDetail(pokemonData);
    } catch (err) {
      alert('No se pudo abrir detalle');
    }
  });

  // Evento: toggle favorito (Parte IV)
  article.querySelector('.btn-fav').addEventListener('click', (e) => {
    const name = e.currentTarget.dataset.name;
    toggleFavorite(name);
    // actualizar texto del botón y estilo
    e.currentTarget.textContent = favorites.includes(name) ? 'Quitar ⭐' : 'Fav ⭐';
    if (favorites.includes(name)) article.classList.add('pokemon-card--favorite'); else article.classList.remove('pokemon-card--favorite');
    renderFavorites();
  });

  return article;
}

// Renderizado del modal detalle (requisito 2)
function openDetail(pokemonData) {
  // Construcción de contenido del detalle (nombre, imagen, tipos, altura, peso, stats)
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
      <ul>
        ${pokemonData.stats.map(s => `<li>${s.stat.name}: ${s.base_stat}</li>`).join('')}
      </ul>
      <div style="margin-top:8px;">
        <button id="favFromDetail" class="pokedex__btn">${favorites.includes(pokemonData.name) ? 'Quitar ⭐' : 'Fav ⭐'}</button>
      </div>
    </div>
  `;

  // Evento para favorite dentro del detalle
  document.getElementById('favFromDetail').addEventListener('click', (e) => {
    toggleFavorite(pokemonData.name);
    renderFavorites();
    // actualizar botón del modal
    e.currentTarget.textContent = favorites.includes(pokemonData.name) ? 'Quitar ⭐' : 'Fav ⭐';
  });

  detailModal.classList.remove('detail--hidden');
}

// Cerrar modal detalle
detailClose.addEventListener('click', () => {
  detailModal.classList.add('detail--hidden');
});

// Cerrar modal si click fuera del card
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) detailModal.classList.add('detail--hidden');
});

// Toggle favorito: mantiene lista y actualiza localStorage (Parte IV)
function toggleFavorite(name) {
  const idx = favorites.indexOf(name);
  if (idx >= 0) favorites.splice(idx, 1);
  else favorites.push(name);
  saveFavorites();
}

// Renderizar la lista de favoritos en aside (Parte IV)
function renderFavorites() {
  favoritesListEl.innerHTML = '';
  if (favorites.length === 0) {
    favoritesListEl.innerHTML = '<li>No hay favoritos aún</li>';
    return;
  }
  favorites.forEach(name => {
    const li = document.createElement('li');
    li.className = 'favorites__item';
    li.innerHTML = `<button class="pokedex__btn fav-item-btn" data-name="${name}">${name}</button>
                    <button class="pokedex__btn pokedex__btn--secondary remove-fav" data-name="${name}">Eliminar</button>`;
    favoritesListEl.appendChild(li);

    // Al hacer click en el nombre, se muestra detalle (buscamos por nombre)
    li.querySelector('.fav-item-btn').addEventListener('click', async (e) => {
      try {
        const data = await getPokemon(e.currentTarget.dataset.name);
        openDetail(data);
      } catch (err) {
        alert('No se pudo cargar detalle de favorito');
      }
    });

    // Botón eliminar favorito
    li.querySelector('.remove-fav').addEventListener('click', (e) => {
      toggleFavorite(e.currentTarget.dataset.name);
      renderFavorites();
      // También opcional: recargar lista principal si está cargada
    });
  });
}

// === Eventos UI (Parte III: eventos) ===
btnLoad.addEventListener('click', () => loadInitialPokemon(20));
btnSearch.addEventListener('click', async () => {
  const q = searchInput.value.trim();
  if (!q) return alert('Escribe nombre o ID para buscar.');
  try {
    const p = await getPokemon(q);
    renderPokemonList([p]); // mostrar solo el resultado
  } catch (err) {
    alert(err.message);
  }
});

// Búsqueda también con Enter key
searchInput.addEventListener('keydown', async (e) => {
  if (e.key === 'Enter') btnSearch.click();
});

// Inicialización al cargar la app: render favoritos y cargar 20 pokémon por defecto
(function init() {
  renderFavorites();
  // Cargar los primeros 20 automáticamente para la entrega (mejor experiencia)
  loadInitialPokemon(20);
})();
