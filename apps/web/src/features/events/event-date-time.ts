type DateTimeInput = Date | string | null | undefined;

type DateTimeParts = {
  dateStr: string;
  timeStr: string;
};

function asValidDate(value: DateTimeInput): Date | null {
  if (!value) {
    return null;
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? null : date;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}

export function parseLocalDateTimeInput(dateStr?: string, timeStr?: string): Date | undefined {
  if (!dateStr || !timeStr) {
    return undefined;
  }

  const dateParts = dateStr.split('-').map(Number);
  const timeParts = timeStr.split(':').map(Number);

  if (dateParts.length !== 3 || timeParts.length < 2) {
    return undefined;
  }

  const [year, month, day] = dateParts;
  const [hour, minute] = timeParts;

  if (
    year === undefined
    || month === undefined
    || day === undefined
    || hour === undefined
    || minute === undefined
    || ![year, month, day, hour, minute].every(Number.isFinite)
  ) {
    return undefined;
  }

  const parsed = new Date(year, month - 1, day, hour, minute, 0, 0);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function splitDateTimeToLocalInputs(value: DateTimeInput): DateTimeParts {
  const date = asValidDate(value);
  if (!date) {
    return { dateStr: '', timeStr: '' };
  }

  return {
    dateStr: `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`,
    timeStr: `${pad2(date.getHours())}:${pad2(date.getMinutes())}`,
  };
}

export function formatLocalDate(value: DateTimeInput, locale: string): string {
  const date = asValidDate(value);
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatLocalTime(value: DateTimeInput, locale: string): string {
  const date = asValidDate(value);
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function formatLocalDateTime(value: DateTimeInput, locale: string): string {
  const dateLabel = formatLocalDate(value, locale);
  const timeLabel = formatLocalTime(value, locale);

  if (!dateLabel && !timeLabel) {
    return '';
  }

  if (!dateLabel) {
    return timeLabel;
  }

  if (!timeLabel) {
    return dateLabel;
  }

  return `${dateLabel} · ${timeLabel}`;
}
