export const AssignmentType = {
  WORK: "trabalho",
  EXAM: "prova",
  PROJECT: "projeto",
} as const;

export type AssignmentType = (typeof AssignmentType)[keyof typeof AssignmentType];

export const ASSIGNMENT_TYPES: AssignmentType[] = [
  AssignmentType.WORK,
  AssignmentType.EXAM,
  AssignmentType.PROJECT,
];

export const ASSIGNMENT_TYPE_LABELS: Record<AssignmentType, string> = {
  trabalho: "Trabalho",
  prova: "Prova",
  projeto: "Projeto",
};

export function isAssignmentType(value: string): value is AssignmentType {
  return ASSIGNMENT_TYPES.includes(value as AssignmentType);
}

export const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);

export function isImageMime(mimeType: string): boolean {
  return IMAGE_MIME_TYPES.has(mimeType) || mimeType.startsWith("image/");
}
