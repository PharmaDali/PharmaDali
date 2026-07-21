// Parses a time string like "9:30 AM" into minutes from midnight.
export function parseAmPmToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') {
    return null;
  }

  const match = timeValue.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  const hours12 = Number(match[1]);
  const minutes = Number(match[2]);
  const period = String(match[3]).toUpperCase();

  if (
    !Number.isInteger(hours12) ||
    !Number.isInteger(minutes) ||
    hours12 < 1 ||
    hours12 > 12 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return null;
  }

  const hours24 = (hours12 % 12) + (period === 'PM' ? 12 : 0);
  return (hours24 * 60) + minutes;
}

// Formats minutes from midnight into a display string like "6:15 PM".
export function formatMinutesToAmPm(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;

  return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
}

// Creates a Date object on the same day as baseDate with the provided minute-of-day value.
export function buildDateAtMinutes(baseDate, minutes) {
  const next = new Date(baseDate);
  next.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return next;
}

// Builds the UI label for pickup date choices (Today/Tomorrow or weekday format).
export function formatPickupDateLabel(date, offset) {
  const weekday = date.toLocaleDateString('en-PH', { weekday: 'short' });
  const month = date.toLocaleDateString('en-PH', { month: 'long' });
  const day = date.toLocaleDateString('en-PH', { day: 'numeric' });

  if (offset === 0) {
    return `Today - ${weekday}, ${month} ${day}`;
  }

  if (offset === 1) {
    return `Tomorrow - ${weekday}, ${month} ${day}`;
  }

  return `${weekday}, ${month} ${day}`;
}

// Generates the next N pickup date options from today.
export function buildDynamicPickupDates(count = 7) {
  const now = new Date();

  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index);
    date.setHours(0, 0, 0, 0);

    return {
      key: date.toISOString(),
      date,
      label: formatPickupDateLabel(date, index),
    };
  });
}

// Resolves opening/closing minutes from selected pharmacy metadata, with a safe fallback window.
export function parsePharmacyOperatingMinutes(selectedPharmacy) {
  const openingFromFields = parseAmPmToMinutes(selectedPharmacy?.formattedOpeningHour);
  const closingFromFields = parseAmPmToMinutes(selectedPharmacy?.formattedClosingHour);

  if (openingFromFields !== null && closingFromFields !== null) {
    return {
      openingMinutes: openingFromFields,
      closingMinutes: closingFromFields,
    };
  }

  if (typeof selectedPharmacy?.hours === 'string' && selectedPharmacy.hours.includes('-')) {
    const [openLabel, closeLabel] = selectedPharmacy.hours.split('-').map((value) => value.trim());
    const openingMinutes = parseAmPmToMinutes(openLabel);
    const closingMinutes = parseAmPmToMinutes(closeLabel);

    if (openingMinutes !== null && closingMinutes !== null) {
      return {
        openingMinutes,
        closingMinutes,
      };
    }
  }

  return {
    openingMinutes: parseAmPmToMinutes('9:00 AM'),
    closingMinutes: parseAmPmToMinutes('6:00 PM'),
  };
}
