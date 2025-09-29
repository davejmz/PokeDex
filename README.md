# ⚡️ Mi PokeDex - Entrega Parcial (UDV - Programación Web)

**Proyecto:** Mini PokeDex  
**Tecnologías:** HTML5, CSS (metodología BEM), JavaScript (vanilla)  
**API:** PokeAPI (https://pokeapi.co/)

---

## ✅ Resumen de lo implementado en base a los requisitos del Primer Examen Parcial de
## Programación Web.

**Parte I – Estructura HTML y CSS BEM (25 pts)**  
- Estructura semántica en `index.html` (header, main, aside, footer).  
- Clases CSS con metodología **BEM** (`pokedex__header`, `pokemon-card__name`, `pokemon-card--favorite`, etc.).  
- CSS en `css/style.css` con reglas claras y responsivas.

**Parte II – Consumo de la API (25 pts)**  
- `script/app.js` usa `fetch` y funciones `fetchJSON`, `getPokemon`, `loadInitialPokemon`.  
- Se consume `https://pokeapi.co/api/v2/pokemon/` para búsquedas individuales y la lista inicial.

**Parte III – Renderizado dinámico (20 pts)**  
- Renderizado dinámico de lista de Pokémon en `#pokemonList` con `createPokemonCard`.  
- Detalle en modal flotante (`detailModal`) que muestra nombre, imagen, tipos, altura, peso y estadísticas base.

**Parte IV – Favoritos y persistencia (10 pts)**  
- Favoritos gestionados con `localStorage` (`pokedex_favorites`).  
- Sección “Mis Favoritos” en la misma página, con opción para ver detalle o eliminar.

**Parte V – Responsividad y video explicativo (20 pts)**  
- CSS con media queries para dispositivos móviles y pantallas grandes.  

## 🚀 Cómo ejecutar localmente
1. Clona tu repositorio:
   ```bash
   git clone https://github.com/davejmz/PokeDex.git


## Gracias!