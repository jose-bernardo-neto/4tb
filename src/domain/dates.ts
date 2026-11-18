import { AppError } from "../errors/AppError";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseIsoDate(value: string, field = "data"): string {
  const date = value.trim();
  if (!DATE_PATTERN.test(date)) {
    throw new AppError(`A ${field} é obrigatória e deve ter o formato AAAA-MM-DD.`, 400);
  }
  return date;
}

export function requiredText(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new AppError(`O campo ${field} é obrigatório.`, 400);
  }
  return trimmed;
}
