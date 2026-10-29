import './style.css'
import { searchWeather } from './services/openMeteo'
import type { CombinedWeatherData } from './types/weather'

type UiState = 'empty' | 'loading' | 'result'

const searchForm = document.querySelector<HTMLFormElement>('#search-form')
const cityInput = document.querySelector<HTMLInputElement>('#city-input')
const searchButton = searchForm?.querySelector<HTMLButtonElement>('button[type="submit"]')
const weatherCard = document.querySelector<HTMLElement>('#weather-card')
const sidebarContent = document.querySelector<HTMLElement>('#sidebar-content')
const mainContent = document.querySelector<HTMLElement>('#main-content')

if (!searchForm || !cityInput || !searchButton || !weatherCard || !sidebarContent || !mainContent) {
  throw new Error('Elementos da interface não encontrados')
}

const renderState = (state: UiState, data?: CombinedWeatherData): void => {
  weatherCard.dataset.state = state
  weatherCard.setAttribute('aria-busy', String(state === 'loading'))
  cityInput.disabled = state === 'loading'
  searchButton.disabled = state === 'loading'
  searchButton.textContent = state === 'loading' ? 'Buscando…' : 'Buscar'
  sidebarContent.replaceChildren()
  mainContent.replaceChildren()

  if (state === 'result' && data) {
    mainContent.textContent = `Clima encontrado para ${data.location.name}.`
  } else if (state === 'empty') {
    const emptyMessage = document.createElement('p')
    emptyMessage.className = 'empty-state'
    emptyMessage.textContent = 'Pesquise uma cidade para ver o clima.'
    mainContent.append(emptyMessage)
  } else if (state === 'loading') {
    const loadingMessage = document.createElement('div')
    loadingMessage.className = 'loading-state'
    loadingMessage.setAttribute('role', 'status')
    loadingMessage.innerHTML = '<span class="loading-spinner" aria-hidden="true"></span><span>Buscando o clima…</span>'
    mainContent.append(loadingMessage)
  }
}

renderState('empty')

searchForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const cityName = cityInput.value.trim()
  if (!cityName) {
    return
  }

  renderState('loading')
  const result = await searchWeather(cityName)
  renderState(result ? 'result' : 'empty', result ?? undefined)
})
