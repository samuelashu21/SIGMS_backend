
const PASSWORD_FIELDS = new Set([
  'password',
  'currentPassword',
  'newPassword',
  'confirmPassword'
]);

const sanitizeValue = (
  value: unknown,
  fieldName = ''
): unknown => {
  if (typeof value === 'string') {
    if (PASSWORD_FIELDS.has(fieldName)) {
      return value.replace(/\0/g, '');
    }

    return value
      .replace(/\0/g, '')
      .trim();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};

    for (const [key, item] of Object.entries(value)) {
      if (
        key === '__proto__' ||
        key === 'prototype' ||
        key === 'constructor'
      ) {
        continue;
      }

      sanitized[key] = sanitizeValue(item, key);
    }

    return sanitized;
  }

  return value;
};

export const sanitizeInput = <T>(value: T): T =>
  sanitizeValue(value) as T;
