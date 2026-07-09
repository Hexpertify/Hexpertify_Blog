export function formatDateTimeLocal(value?: string) {
  if (!value) return '';

  const normalized = new Date(value);
  if (Number.isNaN(normalized.getTime())) {
    return '';
  }

  const year = normalized.getFullYear();
  const month = String(normalized.getMonth() + 1).padStart(2, '0');
  const day = String(normalized.getDate()).padStart(2, '0');
  const hours = String(normalized.getHours()).padStart(2, '0');
  const minutes = String(normalized.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function parseDateTimeLocal(value?: string) {
  if (!value) {
    return new Date().toISOString();
  }

  const [datePart, timePart] = value.split('T');
  if (!datePart || !timePart) {
    return new Date().toISOString();
  }

  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = timePart.split(':').map(Number);

  const parsed = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  return parsed.toISOString();
}
