export function validateAlbanianPhone(phone: string): boolean {
  const regex = /^\+355[0-9]{8,9}$/
  return regex.test(phone)
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  // Remove any spaces or dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  // Ensure it starts with +355
  if (!cleaned.startsWith('+355')) {
    if (cleaned.startsWith('355')) {
      return '+' + cleaned
    }
    if (cleaned.startsWith('0')) {
      return '+355' + cleaned.substring(1)
    }
    return '+355' + cleaned
  }
  return cleaned
}

export function validateSeatCount(seats: number): boolean {
  return seats >= 1 && seats <= 4
}

export function validatePrice(price: number): boolean {
  return price > 0 && price <= 100000
}

export function canCancelBooking(departureTime: Date): boolean {
  const now = new Date()
  const departure = new Date(departureTime)
  const diffInHours = (departure.getTime() - now.getTime()) / (1000 * 60 * 60)
  return diffInHours > 2
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('en-US')} ALL`
}

export function getTimePeriod(date: Date): string {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'afternoon'
  return 'evening'
}