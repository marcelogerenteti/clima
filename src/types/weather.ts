export interface GeocodingResult {
  name: string
  latitude: number
  longitude: number
  country_code: string
  timezone: string
}

export interface GeocodingResponse {
  results?: GeocodingResult[]
}

export interface WeatherCurrent {
  precipitation_probability: number
  temperature_2m: number
  relative_humidity_2m: number
  apparent_temperature: number
  is_day: number
  wind_speed_10m: number
  wind_direction_10m: number
  precipitation: number
  weather_code: number
}

export interface WeatherCurrentUnits {
  precipitation_probability: string
  temperature_2m: string
  relative_humidity_2m: string
  apparent_temperature: string
  is_day: string
  wind_speed_10m: string
  wind_direction_10m: string
  precipitation: string
  weather_code: string
}

export interface WeatherResponse {
  current?: WeatherCurrent
  current_units?: WeatherCurrentUnits
  hourly?: {
    precipitation_probability?: number[]
  }
  hourly_units?: {
    precipitation_probability?: string
  }
}

export interface WeatherResult {
  current: WeatherCurrent
  current_units: WeatherCurrentUnits
}

export interface CombinedWeatherData {
  location: GeocodingResult
  weather: WeatherResult
}
