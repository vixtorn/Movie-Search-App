Movie Search App
A fast, accessible movie & TV search interface powered by TMDB. Built with vanilla HTML/CSS/JS, it features instant search with debounce, trending titles, a favorites system, a detail modal with cast/genres, and a built-in light/dark theme.
Note: This project is a demo. It consumes TMDB’s public API; for production, proxy your API key server-side.
Features
• 🔎 Search (Movies & TV): Unified TMDB “multi” search with client-side filtering to movie/tv.
• 📈 Trending: Weekly trending feed using TMDB’s trending endpoint.
• ⭐ Favorites: Add/remove favorites; persisted in localStorage.
• 🪪 Details Modal: Poster, overview, year, genres, top cast, vote average & count (via append_to_response=credits).
• 🧭 Tabbed UI: Results, Favorites, and Trending panels.
• 🌓 Theme Toggle: One-click light/dark theme via CSS custom properties and a theme-dark/theme-light class on <html>.
• ⚡ Debounced Input: Prevents API spamming; smooth UX.
• ♿ Accessibility: Focus rings via :focus-visible, ARIA on modal, keyboard-friendly controls.
• 🧱 Skeleton Loader: Animated placeholders while content loads.
• 📦 Zero Dependencies: No build step or frameworks required.
How It Works
• API Layer: fetchJSON(path, params) composes TMDB requests (/search/multi, /trending/all/week, /movie/:id, /tv/:id) with the API key and returns JSON.
• Rendering: Results are rendered into “cards” via makeCard(item, isFav); details modal uses modalTemplate(d).
• State:
o Favorites are tracked as a Set of IDs, saved under movie_favs in localStorage.
o Theme preference is stored under theme ("dark"/"light").
• UX:
o Search input is debounced (default ~450ms).
o Tabs show/hide matching panels; “Trending” and “Favorites” load on demand.
o Modal opens on “Details”, closes via ✕ or backdrop click.
Tech Stack
• UI: HTML5, CSS3 (custom properties, gradients, animations)
• Logic: ES Modules (native), vanilla JavaScript
• Data: TMDB v3 API
Project Structure
/
├─ index.html        # Layout, header/tabs/panels/modal
├─ styles.css        # Theme, layout, card grid, modal, skeletons
├─ app.js            # App logic, API calls, tabs, modal, favorites, theming
└─ utils.js          # DOM helpers, debounce, storage wrapper, templating
