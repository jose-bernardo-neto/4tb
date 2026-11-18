export const SemesterPeriod = {
  FIRST: "PRIMEIRO",
  SECOND: "SEGUNDO",
} as const;

export type SemesterPeriod = (typeof SemesterPeriod)[keyof typeof SemesterPeriod];

export const SemesterStatus = {
  ACTIVE: "ATIVO",
  INACTIVE: "INATIVO",
} as const;

export type SemesterStatus = (typeof SemesterStatus)[keyof typeof SemesterStatus];

export const MIN_DISCIPLINES_TO_ACTIVATE = 3;

export const ACADEMIC_YEAR_LABEL_EXAMPLE = "2025/2026";
