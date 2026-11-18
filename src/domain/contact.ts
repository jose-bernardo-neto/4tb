export function normalizeContact(raw: string): string | null {
  let digits = raw.replace(/\D/g, "");
  if (!digits) {
    return null;
  }

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("244")) {
    return digits.length === 12 ? digits : null;
  }

  digits = digits.replace(/^0+/, "");
  if (digits.length === 9) {
    return `244${digits}`;
  }

  return null;
}
