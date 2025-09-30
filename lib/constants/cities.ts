export interface City {
  code: string
  name: string
  nameSq: string
  lat: number
  lng: number
}

export const ALBANIAN_CITIES: City[] = [
  { code: 'TIA', name: 'Tirana', nameSq: 'Tiranë', lat: 41.3275, lng: 19.8189 },
  { code: 'DUR', name: 'Durrës', nameSq: 'Durrës', lat: 41.3246, lng: 19.4565 },
  { code: 'VLO', name: 'Vlorë', nameSq: 'Vlorë', lat: 40.4660, lng: 19.4914 },
  { code: 'SHK', name: 'Shkodër', nameSq: 'Shkodër', lat: 42.0683, lng: 19.5126 },
  { code: 'ELB', name: 'Elbasan', nameSq: 'Elbasan', lat: 41.1125, lng: 20.0822 },
  { code: 'FIE', name: 'Fier', nameSq: 'Fier', lat: 40.7239, lng: 19.5569 },
  { code: 'KOR', name: 'Korçë', nameSq: 'Korçë', lat: 40.6186, lng: 20.7808 },
  { code: 'BER', name: 'Berat', nameSq: 'Berat', lat: 40.7058, lng: 19.9522 },
  { code: 'LUS', name: 'Lushnjë', nameSq: 'Lushnjë', lat: 40.9419, lng: 19.7050 },
  { code: 'KAV', name: 'Kavajë', nameSq: 'Kavajë', lat: 41.1855, lng: 19.5569 },
  { code: 'POG', name: 'Pogradec', nameSq: 'Pogradec', lat: 40.9025, lng: 20.6497 },
  { code: 'GJI', name: 'Gjirokastër', nameSq: 'Gjirokastër', lat: 40.0758, lng: 20.1389 },
  { code: 'SAR', name: 'Sarandë', nameSq: 'Sarandë', lat: 39.8756, lng: 20.0047 },
  { code: 'LAC', name: 'Laç', nameSq: 'Laç', lat: 41.6356, lng: 19.7131 },
  { code: 'KUK', name: 'Kukës', nameSq: 'Kukës', lat: 42.0769, lng: 20.4219 },
]

export const CITY_NAMES = ALBANIAN_CITIES.map(c => c.name)

export const POPULAR_ROUTES = [
  { from: 'TIA', to: 'DUR', fromName: 'Tirana', toName: 'Durrës', distance: 39, duration: 40 },
  { from: 'TIA', to: 'VLO', fromName: 'Tirana', toName: 'Vlorë', distance: 147, duration: 150 },
  { from: 'TIA', to: 'SHK', fromName: 'Tirana', toName: 'Shkodër', distance: 116, duration: 120 },
  { from: 'TIA', to: 'ELB', fromName: 'Tirana', toName: 'Elbasan', distance: 45, duration: 50 },
  { from: 'DUR', to: 'VLO', fromName: 'Durrës', toName: 'Vlorë', distance: 118, duration: 120 },
]

export const TIME_PERIODS = [
  { label: 'Morning', value: 'morning', hours: '5:00 - 12:00' },
  { label: 'Afternoon', value: 'afternoon', hours: '12:00 - 18:00' },
  { label: 'Evening', value: 'evening', hours: '18:00 - 24:00' },
]

export const QUICK_MESSAGES = [
  "Where are you?",
  "I'm ready",
  "Running 5 minutes late",
  "On my way",
]