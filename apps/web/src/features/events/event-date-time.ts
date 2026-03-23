type DateTimeInput = Date | string | null | undefined;
type DateTimeFormatConfig = {
  timeZone?: string;
};

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

export function isSameCalendarDay(
  startValue: DateTimeInput,
  endValue: DateTimeInput,
  config?: DateTimeFormatConfig,
): boolean {
  const startDate = asValidDate(startValue);
  const endDate = asValidDate(endValue);
  if (!startDate || !endDate) {
    return false;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(config?.timeZone ? { timeZone: config.timeZone } : {}),
  });

  return formatter.format(startDate) === formatter.format(endDate);
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

export function formatDate(
  value: DateTimeInput,
  locale: string,
  config?: DateTimeFormatConfig,
): string {
  const date = asValidDate(value);
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(config?.timeZone ? { timeZone: config.timeZone } : {}),
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

export function formatTime(
  value: DateTimeInput,
  locale: string,
  config?: DateTimeFormatConfig,
): string {
  const date = asValidDate(value);
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(config?.timeZone ? { timeZone: config.timeZone } : {}),
  }).format(date);
}

export function formatDateTime(
  value: DateTimeInput,
  locale: string,
  config?: DateTimeFormatConfig,
): string {
  const dateLabel = formatDate(value, locale, config);
  const timeLabel = formatTime(value, locale, config);

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

export function formatLocalDateTime(value: DateTimeInput, locale: string): string {
  return formatDateTime(value, locale);
}
