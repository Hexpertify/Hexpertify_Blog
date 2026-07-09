import test from 'node:test';
import assert from 'node:assert/strict';
import { formatDateTimeLocal, parseDateTimeLocal } from './post-date';

test('formats an ISO timestamp into a datetime-local input value', () => {
  const value = formatDateTimeLocal('2024-01-15T14:30:00.000Z');
  assert.equal(value, '2024-01-15T14:30');
});

test('parses a datetime-local value into an ISO string', () => {
  const value = parseDateTimeLocal('2024-01-15T14:30');
  assert.equal(value, '2024-01-15T14:30:00.000Z');
});
