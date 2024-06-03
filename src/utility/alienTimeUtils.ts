/**
 * Alien Time date standard:
 *
 * - 1970-1-1, 12:00:00am Earth time is equivalent to Year 2804, Month 18, Day 31, Hour 2, Minute 2, Second 88 Alien’s time.
 * - 1 second Alien time is 0.5 second Earth time.
 *
 * Alien Calendar:
 * 1 minute is 90 seconds.
 * 1 hour is 90 minutes.
 * 1 day is 36 hours.
 * There are 18 months in a year.
 */

import { earthElapsedSeconds } from './earthTimeUtility'

export interface AlienReference {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

// based on earth EARTH_REFERENCE_TIME
export const ALIEN_REFERENCE_TIME: AlienReference = {
  year: 2804,
  month: 18,
  day: 31,
  hour: 2,
  minute: 2,
  second: 88
}

// Days in each Alien month
const ALIEN_MONTHS = [44, 42, 48, 40, 48, 44, 40, 44, 42, 40, 40, 42, 44, 48, 42, 40, 44, 38]
const TOTAL_ALIEN_DAYS = ALIEN_MONTHS.reduce((acc, days) => acc + days, 0)

const ALIEN_TIME_SYSTEM_PER = {
  minute: 90,
  hour: 90,
  day: 36,
  month: 18
}

export const formatAlienTime = (alienTime: AlienReference) => {
  return {
    date: `${alienTime.day.toString().padStart(2, '0')}/${alienTime.month.toString().padStart(2, '0')}/${alienTime.year}`,
    time: `${alienTime.hour.toString().padStart(2, '0')}:${alienTime.minute.toString().padStart(2, '0')}:${alienTime.second.toString().padStart(2, '0')}`
  }
}

export function convertEarthToAlienTime(earthTime: Date) {
  const earthSecondsSinceReference = earthElapsedSeconds(earthTime)

  // 1 second Alien time is 0.5 second Earth time
  const alienReferenceTime = ALIEN_REFERENCE_TIME

  const alienSecondsSinceReference = earthSecondsSinceReference * 2 + alienReferenceTime.second

  const alienMinutes =
    Math.floor(alienSecondsSinceReference / ALIEN_TIME_SYSTEM_PER.minute) +
    alienReferenceTime.minute
  const currentRemainingAlienSeconds = Math.floor(
    alienSecondsSinceReference % ALIEN_TIME_SYSTEM_PER.minute
  )

  const alienHours = Math.floor(alienMinutes / ALIEN_TIME_SYSTEM_PER.hour) + alienReferenceTime.hour
  const remainingAlienMinutes = Math.floor(alienMinutes % ALIEN_TIME_SYSTEM_PER.hour)

  const alienDays = Math.floor(alienHours / ALIEN_TIME_SYSTEM_PER.day) + alienReferenceTime.day
  const remainingAlienHours = Math.floor(alienHours % ALIEN_TIME_SYSTEM_PER.day)
  const { year, month, day } = convertDaysToDate(alienDays)

  return {
    year,
    month,
    day,
    hour: remainingAlienHours,
    minute: remainingAlienMinutes,
    second: currentRemainingAlienSeconds
  }
}

function convertDaysToDate(days: number) {
  const referenceTime = ALIEN_REFERENCE_TIME
  let yearPassed = Math.floor(days / TOTAL_ALIEN_DAYS) + referenceTime.year
  let remainingDays = days % TOTAL_ALIEN_DAYS
  let monthPassed = referenceTime.month

  for (const monthDays of ALIEN_MONTHS) {
    if (remainingDays - monthDays < 0) {
      break
    }
    remainingDays -= monthDays
    monthPassed++
    if (monthPassed >= ALIEN_MONTHS.length) {
      monthPassed = 0
      yearPassed++
    }
  }

  return {
    year: yearPassed,
    month: monthPassed,
    day: remainingDays
  }
}
