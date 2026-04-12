const DATE_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_ONLY_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;

const parseTimeOnly = (value: string) => {
  const [hoursRaw, minutesRaw, secondsRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  const seconds = Number(secondsRaw ?? "0");
  const parsed = new Date();
  parsed.setHours(hours, minutes, seconds, 0);
  return parsed;
};

const parseDateOnly = (value: string) => new Date(`${value}T00:00:00`);

const isValidDate = (value: Date) => !Number.isNaN(value.getTime());

export const formatDateTime = (value?: string | null): { date: string; time: string } => {
  if (!value) {
    return { date: "-", time: "-" };
  }

  if (DATE_ONLY_PATTERN.test(value)) {
    const parsed = parseDateOnly(value);
    return {
      date: isValidDate(parsed) ? DATE_FORMATTER.format(parsed) : "-",
      time: "-",
    };
  }

  if (TIME_ONLY_PATTERN.test(value)) {
    const parsed = parseTimeOnly(value);
    return {
      date: "-",
      time: isValidDate(parsed) ? TIME_FORMATTER.format(parsed) : "-",
    };
  }

  const parsed = new Date(value);
  if (!isValidDate(parsed)) {
    return { date: "-", time: "-" };
  }

  return {
    date: DATE_FORMATTER.format(parsed),
    time: TIME_FORMATTER.format(parsed),
  };
};

export const formatDisplayDate = (value?: string | null) => {
  if (!value) return "Not available";
  if (DATE_ONLY_PATTERN.test(value)) {
    const parsed = parseDateOnly(value);
    return isValidDate(parsed) ? DATE_FORMATTER.format(parsed) : value;
  }
  if (TIME_ONLY_PATTERN.test(value)) {
    const parsed = parseTimeOnly(value);
    return isValidDate(parsed) ? DATE_FORMATTER.format(parsed) : value;
  }
  const parsed = new Date(value);
  return isValidDate(parsed) ? DATE_FORMATTER.format(parsed) : value;
};

export const formatDisplayTime = (value?: string | null) => {
  if (!value) return "Not available";
  if (TIME_ONLY_PATTERN.test(value)) {
    const parsed = parseTimeOnly(value);
    return isValidDate(parsed) ? TIME_FORMATTER.format(parsed) : value;
  }
  const parsed = new Date(value);
  return isValidDate(parsed) ? TIME_FORMATTER.format(parsed) : value;
};

export const formatDisplayDateTime = (value?: string | null) => {
  if (!value) return "Not available";
  if (DATE_ONLY_PATTERN.test(value)) return formatDisplayDate(value);
  if (TIME_ONLY_PATTERN.test(value)) return formatDisplayTime(value);
  const parsed = new Date(value);
  if (!isValidDate(parsed)) return value;
  return `${DATE_FORMATTER.format(parsed)} ${TIME_FORMATTER.format(parsed)}`;
};
