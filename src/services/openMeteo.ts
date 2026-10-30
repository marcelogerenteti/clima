import type {
  CombinedWeatherData,
  GeocodingResponse,
  GeocodingResult,
  WeatherCurrent,
  WeatherCurrentUnits,
  WeatherResponse,
  WeatherResult,
} from '../types/weather'

const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast'
const CURRENT_PARAMETERS = [
  'precipitation_probability',
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'wind_speed_10m',
  'wind_direction_10m',
  'precipitation',
  'weather_code',
].join(',')

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isGeocodingResult = (value: unknown): value is GeocodingResult =>
  isRecord(value) &&
  isNonEmptyString(value.name) &&
  isFiniteNumber(value.latitude) &&
  isFiniteNumber(value.longitude) &&
  isNonEmptyString(value.country_code) &&
  isNonEmptyString(value.timezone)

const currentFields = [
  'precipitation_probability',
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'wind_speed_10m',
  'wind_direction_10m',
  'precipitation',
  'weather_code',
] as const

const unitFields = currentFields

const hasNumericFields = <T extends readonly string[]>(
  value: Record<string, unknown>,
  fields: T,
): value is Record<T[number], number> => fields.every((field) => isFiniteNumber(value[field]))

const hasStringFields = <T extends readonly string[]>(
  value: Record<string, unknown>,
  fields: T,
): value is Record<T[number], string> =>
  fields.every((field) => typeof value[field] === 'string')

const isWeatherCurrent = (value: unknown): value is WeatherCurrent =>
  isRecord(value) && hasNumericFields(value, currentFields)

const isWeatherCurrentUnits = (
  value: unknown,
): value is WeatherCurrentUnits =>
  isRecord(value) && hasStringFields(value, unitFields)

export async function searchCity(cityName: string): Promise<GeocodingResult | null> {
  if (typeof cityName !== 'string' || cityName.trim().length === 0) {
    return null
  }

  const params = new URLSearchParams({
    name: cityName.trim(),
    count: '1',
    language: 'pt',
    format: 'json',
  })

  try {
    const response = await fetch(`${GEOCODING_ENDPOINT}?${params.toString()}`)
    if (!response.ok) {
      return null
    }

    const data: unknown = await response.json()
    if (!isRecord(data)) {
      return null
    }

    const results = (data as GeocodingResponse).results
    return Array.isArray(results) && isGeocodingResult(results[0]) ? results[0] : null
  } catch {
    return null
  }
}

export async function getWeather(
  latitude: number,
  longitude: number,
  timezone: string,
): Promise<WeatherResult | null> {
  if (
    !isFiniteNumber(latitude) ||
    !isFiniteNumber(longitude) ||
    !isNonEmptyString(timezone)
  ) {
    return null
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: CURRENT_PARAMETERS,
    timezone: timezone.trim(),
  })

  try {
    const response = await fetch(`${FORECAST_ENDPOINT}?${params.toString()}`)
    if (!response.ok) {
      return null
    }

    const data: unknown = await response.json()
    if (!isRecord(data)) {
      return null
    }

    const weather = data as WeatherResponse

    if (
      !isWeatherCurrent(weather.current) ||
      !isWeatherCurrentUnits(weather.current_units)
    ) {
      return null
    }

    return {
      current: weather.current,
      current_units: weather.current_units,
    }
  } catch {
    return null
  }
}

export async function searchWeather(cityName: string): Promise<CombinedWeatherData | null> {
  const location = await searchCity(cityName)
  if (!location) {
    return null
  }

  const weather = await getWeather(location.latitude, location.longitude, location.timezone)
  return weather ? { location, weather } : null
}
