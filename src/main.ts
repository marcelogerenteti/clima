import './style.css'
import moonIcon from './assets/moon.svg'
import sunIcon from './assets/sun.svg'
import { searchWeather } from './services/openMeteo'
import type { CombinedWeatherData } from './types/weather'
import { weatherCodeToDescription } from './utils/weatherCode'
import { windDirectionToCardinal } from './utils/windDirection'

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

const formatCityDate = (timezone: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }

  try {
    return new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: timezone }).format(new Date())
  } catch {
    return new Intl.DateTimeFormat('pt-BR', options).format(new Date())
  }
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
    const { current, current_units: units } = data.weather
    const temperature = document.createElement('p')
    temperature.className = 'current-temperature'
    temperature.textContent = `${current.temperature_2m}${units.temperature_2m}`

    const location = document.createElement('h2')
    location.className = 'location-name'
    location.textContent = `${data.location.name}, ${data.location.country_code}`

    const date = document.createElement('p')
    date.className = 'current-date'
    date.textContent = formatCityDate(data.location.timezone)

    const dayPeriod = document.createElement('p')
    dayPeriod.className = 'day-period'
    const isDay = current.is_day === 1
    const periodIcon = document.createElement('img')
    periodIcon.className = 'period-icon'
    periodIcon.src = isDay ? sunIcon : moonIcon
    periodIcon.alt = ''
    periodIcon.setAttribute('aria-hidden', 'true')
    dayPeriod.append(periodIcon, document.createTextNode(isDay ? 'Dia' : 'Noite'))

    const condition = document.createElement('p')
    condition.className = 'weather-condition'
    condition.textContent = weatherCodeToDescription(current.weather_code)

    sidebarContent.append(temperature, location, date, dayPeriod, condition)

    const metrics = [
      {
        label: 'Umidade',
        value: `${current.relative_humidity_2m}${units.relative_humidity_2m}`,
      },
      {
        label: 'Sensação térmica',
        value: `${current.apparent_temperature}${units.apparent_temperature}`,
      },
      {
        label: 'Precipitação',
        value: `${current.precipitation_probability}${units.precipitation_probability}`,
      },
      {
        label: 'Vento',
        value: `${current.wind_speed_10m} ${units.wind_speed_10m} · ${current.wind_direction_10m}° (${windDirectionToCardinal(current.wind_direction_10m)})`,
      },
    ]

    const metricGrid = document.createElement('dl')
    metricGrid.className = 'metric-grid'

    for (const metric of metrics) {
      const metricItem = document.createElement('div')
      metricItem.className = 'metric-item'

      const label = document.createElement('dt')
      label.textContent = metric.label

      const value = document.createElement('dd')
      value.textContent = metric.value

      metricItem.append(label, value)
      metricGrid.append(metricItem)
    }

    mainContent.append(metricGrid)
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
