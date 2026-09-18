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

// Returns the current minute of day (0-1439) in Asia/Manila timezone
export function getManilaMinutes(now = new Date()) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Manila',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    let hour = 0;
    let minute = 0;
    for (const part of parts) {
      if (part.type === 'hour') {
        hour = parseInt(part.value, 10);
        if (hour === 24) hour = 0;
      } else if (part.type === 'minute') {
        minute = parseInt(part.value, 10);
      }
    }
    return (hour * 60) + minute;
  } catch {
    return (now.getHours() * 60) + now.getMinutes();
  }
}

// Checks whether the pharmacy is open right now based on operating hours in Asia/Manila time
export function isPharmacyOpenNow(openingHour, closingHour, now = new Date()) {
  const openingMinutes = parseAmPmToMinutes(openingHour);
  const closingMinutes = parseAmPmToMinutes(closingHour);

  if (openingMinutes === null || closingMinutes === null) {
    return false;
  }

  const currentMinutes = getManilaMinutes(now);

  if (openingMinutes === closingMinutes) {
    return true;
  }

  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes < closingMinutes;
  }

  return currentMinutes >= openingMinutes || currentMinutes < closingMinutes;
}

// Resolves opening/closing minutes from selected pharmacy metadata, with a safe fallback window.
export function parsePharmacyOperatingMinutes(selectedPharmacy) {
  if (!selectedPharmacy) {
    return {
      openingMinutes: null,
      closingMinutes: null,
    };
  }

  const isActive = selectedPharmacy.isActive ?? selectedPharmacy.is_active ?? selectedPharmacy.isOperating;
  if (isActive === false || isActive === 0 || isActive === '0') {
    return {
      openingMinutes: null,
      closingMinutes: null,
    };
  }

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

  return {
    openingMinutes: null,
    closingMinutes: null,
  };
}
