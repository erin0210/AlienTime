import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

export const EARTH_REFERENCE_TIME: Date = new Date('1970-01-01T00:00:00Z')

export const earthElapsedSeconds = (earthTime: Date): number => {
  return dayjs.duration(dayjs(earthTime).diff(EARTH_REFERENCE_TIME)).asSeconds()
}
export function convertAlienToEarth(alienTime: string): Date {
  const [alienDate, alienTimePart] = alienTime.split('\n')
  const [alienDay, alienMonth, alienYear] = alienDate.split('/').map(Number)
  const [alienHour, alienMinute, alienSecond] = alienTimePart.split(':').map(Number)

  const baseAlienTime = { year: 2804, month: 18, day: 31, hour: 2, minute: 2, second: 88 }

  const totalAlienSeconds =
    ((alienYear - baseAlienTime.year) * 18 * 18 * 36 * 90 +
      (alienMonth - baseAlienTime.month) * 18 * 36 * 90 +
      (alienDay - baseAlienTime.day) * 36 * 90 +
      (alienHour - baseAlienTime.hour) * 90 +
      (alienMinute - baseAlienTime.minute)) *
      2 + // Convert to Earth seconds
    (alienSecond - baseAlienTime.second) * 2

  // Add the seconds to the reference Earth time
  const earthTime = new Date(EARTH_REFERENCE_TIME.getTime() + totalAlienSeconds * 1000)

  return earthTime
}

export function formatInputTextEarthDate(date: string): string {
  return date.split('-').reverse().join('/')
}

export function isValidDateEarthTimeFormat(dateTime: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/
  return regex.test(dateTime)
}
