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

export const formatDateTime = (value?: string | null): { date: string; time: string } => {
  if (!value) {
    return { date: "-", time: "-" };
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return { date: "-", time: "-" };
  }

  return {
    date: DATE_FORMATTER.format(parsed),
    time: TIME_FORMATTER.format(parsed),
  };
};
