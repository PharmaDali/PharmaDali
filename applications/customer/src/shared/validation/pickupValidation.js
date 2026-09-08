import { buildDateAtMinutes, formatMinutesToAmPm } from '@src/utils/pickupScheduleUtils'

export function isSameCalendarDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

// Build dynamic minimum time: opening time, or "now" when user selects today.
export function buildEffectivePickupBounds(selectedDate, openingMinutes, closingMinutes) {
  const openingDateTime = buildDateAtMinutes(selectedDate, openingMinutes)
  const closingDateTime = buildDateAtMinutes(selectedDate, closingMinutes)
  openingDateTime.setSeconds(0, 0)
  closingDateTime.setSeconds(0, 0)

  const now = new Date()
  const minWithLeadTime = new Date(now.getTime() + 30 * 60 * 1000)
  if (minWithLeadTime.getSeconds() > 0 || minWithLeadTime.getMilliseconds() > 0) {
    minWithLeadTime.setMinutes(minWithLeadTime.getMinutes() + 1)
  }
  minWithLeadTime.setSeconds(0, 0)

  const minimumDateTime = isSameCalendarDay(selectedDate, now) && minWithLeadTime > openingDateTime
    ? minWithLeadTime
    : openingDateTime

  return {
    closingDateTime,
    minimumDateTime,
    hasWindowToday: minimumDateTime < closingDateTime,
  }
}

export function buildScheduledPickupDateTime(selectedDate, selectedTime) {
  const scheduledPickupAt = new Date(selectedDate)
  scheduledPickupAt.setHours(selectedTime?.getHours?.() || 0, selectedTime?.getMinutes?.() || 0, 0, 0)
  return scheduledPickupAt
}

// Shared validation so picker changes and submit button always enforce the same rules.
export function validateScheduledPickupTime({
  scheduledDateTime,
  hasValidOperatingWindow,
  closingMinutes,
  minimumDateTime,
  closingDateTime,
}) {
  if (!hasValidOperatingWindow) {
    return 'Pharmacy operating hours are unavailable. Please reselect your pharmacy.'
  }

  if (!scheduledDateTime) {
    return 'Please select a pickup time within pharmacy operating hours.'
  }

  if (scheduledDateTime < minimumDateTime || scheduledDateTime > closingDateTime) {
    const startLabel = minimumDateTime.toLocaleTimeString('en-PH', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })

    return `Pickup time must be between ${startLabel} and ${formatMinutesToAmPm(closingMinutes)}.`
  }

  return ''
}
