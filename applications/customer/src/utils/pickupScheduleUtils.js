// Parses a time string like "9:30 AM", "12am", "11:59pm", or "00:00:00" into minutes from midnight.
export function parseAmPmToMinutes(timeValue) {
  if (!timeValue || typeof timeValue !== 'string') {
    return null;
  }

  const str = timeValue.trim();

  // Match 12-hour AM/PM format (e.g. "12:00 AM", "12am", "11:59pm", "9:30 AM")
  const ampmMatch = str.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampmMatch) {
    const hours12 = Number(ampmMatch[1]);
    const minutes = Number(ampmMatch[2] || 0);
    const period = ampmMatch[3].toUpperCase();

    if (hours12 >= 1 && hours12 <= 12 && minutes >= 0 && minutes <= 59) {
      const hours24 = (hours12 % 12) + (period === 'PM' ? 12 : 0);
      return (hours24 * 60) + minutes;
    }
  }

  // Match 24-hour format (e.g. "00:00:00", "23:59:00", "00:00", "23:59")
  const match24 = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match24) {
    const hours = Number(match24[1]);
    const minutes = Number(match24[2]);
    if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
      return (hours * 60) + minutes;
    }
  }

  return null;
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
  const weekday = date.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', weekday: 'short' });
  const month = date.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', month: 'long' });
  const day = date.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', day: 'numeric' });

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
  const openTime = selectedPharmacy?.formattedOpeningHour || selectedPharmacy?.opening_hour || selectedPharmacy?.openingHour;
  const closeTime = selectedPharmacy?.formattedClosingHour || selectedPharmacy?.closing_hour || selectedPharmacy?.closingHour;

  let openingFromFields = parseAmPmToMinutes(openTime);
  let closingFromFields = parseAmPmToMinutes(closeTime);

  if (openingFromFields !== null && closingFromFields !== null) {
    if (openingFromFields === closingFromFields) {
      openingFromFields = 0;
      closingFromFields = 1439;
    }
    return {
      openingMinutes: openingFromFields,
      closingMinutes: closingFromFields,
    };
  }

  if (typeof selectedPharmacy?.hours === 'string' && selectedPharmacy.hours.includes('-')) {
    const [openLabel, closeLabel] = selectedPharmacy.hours.split('-').map((value) => value.trim());
    let openingMinutes = parseAmPmToMinutes(openLabel);
    let closingMinutes = parseAmPmToMinutes(closeLabel);

    if (openingMinutes !== null && closingMinutes !== null) {
      if (openingMinutes === closingMinutes) {
        openingMinutes = 0;
        closingMinutes = 1439;
      }
      return {
        openingMinutes,
        closingMinutes,
      };
    }
  }

  // Safe default: 12:00 AM to 11:59 PM (0 to 1439 mins) if pharmacy is active but hours unparsed
  return {
    openingMinutes: 0,
    closingMinutes: 1439,
  };
}
