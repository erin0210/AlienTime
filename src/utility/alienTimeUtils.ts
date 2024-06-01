const alienDaysPerMonth: number[] = [
  44, 42, 48, 40, 48, 44, 40, 44, 42, 40, 40, 42, 44, 48, 42, 40, 44, 38
] // Days in each Alien month

interface AlienReference {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

const alienReference: AlienReference = {
  year: 2804,
  month: 18,
  day: 31,
  hour: 2,
  minute: 2,
  second: 88
}

const earthReferenceTime: Date = new Date('1970-01-01T00:00:00Z')

export function calculateAlienTime(): string {
  const earthSecondsSinceReference = Math.floor(
    (new Date().getTime() - earthReferenceTime.getTime()) / 1000
  ) // Seconds since reference in Earth time (rounded down)
  const alienSecondsSinceReference = earthSecondsSinceReference * 0.5 // Convert to Alien seconds (1 second alien time = 0.5 second earth time)

  const remainingAlienSeconds = alienReference.second + (alienSecondsSinceReference % 90)
  const alienMinutes =
    alienReference.minute + Math.floor((alienReference.second + alienSecondsSinceReference) / 90)

  const remainingAlienMinutes = alienMinutes % 90
  const alienHours = alienReference.hour + Math.floor(alienMinutes / 90)

  const remainingAlienHours = alienHours % 36
  let alienDays = alienReference.day - 1 + Math.floor(alienHours / 36)

  let alienMonths = alienReference.month - 1
  let alienYears = alienReference.year

  while (alienDays >= alienDaysPerMonth[alienMonths]) {
    alienDays -= alienDaysPerMonth[alienMonths]
    alienMonths++
    if (alienMonths >= 18) {
      alienMonths = 0
      alienYears++
    }
  }

  alienDays += 1 // Adjust day to 1-based index

  // Format the date in d/m/y format
  const formattedDate = `${alienDays.toString().padStart(2, '0')}/${(alienMonths + 1).toString().padStart(2, '0')}/${alienYears.toString().padStart(4, '0')}`

  // Format the time in h:i:s AM/PM format
  const hours12Format = remainingAlienHours % 12 || 12 // Convert 0 hours to 12 for 12 AM/PM format
  const ampm = remainingAlienHours >= 12 ? 'PM' : 'AM'
  const formattedTime = `${hours12Format.toString().padStart(1, '0')}:${remainingAlienMinutes.toString().padStart(2, '0')}:${remainingAlienSeconds.toString().padStart(2, '0')} ${ampm}`

  return `${formattedDate}\n${formattedTime}`
}

export function checkAlarm(
  alarmSet: boolean,
  alarmTime: string,
  now: Date,
  showModal: boolean
): boolean {
  if (alarmSet) {
    const currentFormattedTime = now.toTimeString().slice(0, 5)
    if (alarmTime === currentFormattedTime) {
      showModal = true
      return true
    }
  }
  return false
}
