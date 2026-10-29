import './style.css'

const app = document.querySelector<HTMLDivElement>('#app')

if (!app) {
  throw new Error('Elemento #app não encontrado')
}

app.innerHTML = `
  <main class="app-shell">
    <form class="search-form" id="search-form" role="search">
      <label class="sr-only" for="city-input">Cidade</label>
      <input
        id="city-input"
        name="city"
        type="search"
        placeholder="Digite o nome da cidade"
        autocomplete="off"
      />
      <button type="submit">Buscar</button>
    </form>

    <section class="weather-card" id="weather-card" aria-live="polite" aria-busy="false">
      <aside class="weather-sidebar" id="weather-sidebar" aria-label="Resumo do clima">
        <div class="sidebar-content" id="sidebar-content"></div>
      </aside>

      <div class="weather-main" id="weather-main">
        <div class="main-content" id="main-content"></div>
      </div>
    </section>
  </main>
`
