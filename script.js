const pokemonListElement = document.querySelector('.pokedex__lista');
const detalleOverlay = document.getElementById('detalleOverlay');
const detalleTarjeta = document.getElementById('detalleTarjeta');
const POKEAPI_URL = 'https://pokeapi.co/api/v2/pokemon?limit=151'; 

// Parte II: Consumo de la API
// Esta es una función asíncrona para obtener datos de la PokeAPI usando fetch
async function fetchPokemonList() {
    try {
        const response = await fetch(POKEAPI_URL);
        const data = await response.json();
        const pokemonPromises = data.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));
        const detailedPokemon = await Promise.all(pokemonPromises);
        // Parte III: Renderizado dinámico
        // Llamamos a la función para mostrar la lista de Pokémon en el DOM
        displayPokemon(detailedPokemon);
    } catch (error) {
        console.error('Error fetching Pokémon list:', error);
    }
}

// Parte III: Renderizado dinámico
// Función que toma los datos y los inyecta en el HTML
function displayPokemon(pokemonArray) {
    pokemonListElement.innerHTML = ''; 
    pokemonArray.forEach(pokemon => {
        const listItem = document.createElement('li');
        listItem.classList.add('pokemon');
        listItem.dataset.id = pokemon.id;
        
        // Al dar click en un pokemon, una tarjeta debe desplegarse
        // Esto cumple con la instrucción de mostrar el detalle al hacer clic, lo cual
        // no estaba en las instrucciones, pero quería implementarla para que se vea
        // más profesional e interactivo.
        listItem.addEventListener('click', () => showPokemonDetail(pokemon.id));

        // Reemplazamos el botón FAV con la descripción del tipo de pokemon
        const pokemonTypes = pokemon.types.map(typeInfo => `<span class="pokemon__tipo">${typeInfo.type.name}</span>`).join('');

        listItem.innerHTML = `
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="pokemon__imagen">
            <span class="pokemon__nombre">${pokemon.name}</span>
            <div class="pokemon__tipos">${pokemonTypes}</div>
        `;
        pokemonListElement.appendChild(listItem);
    });
}

// Función adicional a las instrucciones brindadas para mostrar la tarjeta 
// de detalle de un Pokémon
async function showPokemonDetail(id) {
    try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        const pokemon = await response.json();

        // Limpiamos el contenido previo (excepto el botón de volver)
        detalleTarjeta.innerHTML = `<button class="pokedex__detalle-cerrar" onclick="hidePokemonDetail()">← Volver</button>`;
        
        // Estructura de la tarjeta que muestra los stats del pokemon
        const pokemonTypes = pokemon.types.map(typeInfo => `<span class="detalle__tipo">${typeInfo.type.name}</span>`).join('');
        const pokemonStats = pokemon.stats.map(statInfo => `
            <li class="detalle__stat-item">
                <span class="detalle__stat-nombre">${statInfo.stat.name}</span>
                <span class="detalle__stat-valor">${statInfo.base_stat}</span>
            </li>
        `).join('');

        const detailContent = document.createElement('div');
        detailContent.innerHTML = `
            <h2 class="detalle__nombre">${pokemon.name}</h2>
            <span class="detalle__numero">Nº ${pokemon.id}</span>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="detalle__imagen">
            <div class="detalle__tipos">${pokemonTypes}</div>
            <ul class="detalle__stats">${pokemonStats}</ul>
        `;
        detalleTarjeta.appendChild(detailContent);

        detalleOverlay.classList.add('pokedex__detalle-overlay--visible'); // Muestra la tarjeta
    } catch (error) {
        console.error('Error fetching Pokémon detail:', error);
    }
}

// La flecha para retroceder a la página principal que muestra todos los Pokemón 
function hidePokemonDetail() {
    // Al hacer clic, ocultamos la tarjeta para regresar al menú principal
    detalleOverlay.classList.remove('pokedex__detalle-overlay--visible');
}

document.addEventListener('DOMContentLoaded', fetchPokemonList);