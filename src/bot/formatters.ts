import { ASSIGNMENT_TYPE_LABELS } from "../domain/assignment";
import { Announcement } from "../models/Announcement";
import { Assignment } from "../models/Assignment";
import { Discipline } from "../models/Discipline";
import { Fee } from "../models/Fee";
import { Professor } from "../models/Professor";
import { Student } from "../models/Student";

export function formatDateBr(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    return iso;
  }
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function bulletList(header: string, lines: string[]): string {
  return [header, ...lines.map((line) => `• ${line}`)].join("\n");
}

export function formatProfessors(professors: Professor[]): string {
  if (!professors.length) {
    return "Não há professores no semestre activo.";
  }
  return bulletList(
    "*Professores*",
    professors.map((p) => `${p.name} (${p.academicDegree}) — ${p.contact}`),
  );
}

export function formatDisciplines(header: string, disciplines: Discipline[]): string {
  if (!disciplines.length) {
    return "Não há cadeiras.";
  }
  return bulletList(
    header,
    disciplines.map((d) => `${d.acronym} — ${d.name} (${d.professor.name})`),
  );
}

export function formatAssignments(assignments: Assignment[]): string {
  if (!assignments.length) {
    return "Não há tarefas no semestre activo.";
  }
  return bulletList(
    "*Tarefas*",
    assignments.map(
      (a) =>
        `${a.title} [${ASSIGNMENT_TYPE_LABELS[a.type]}] — ${a.discipline.acronym} — entrega: ${formatDateBr(a.dueDate)}`,
    ),
  );
}

export function formatAnnouncements(items: Announcement[]): string {
  if (!items.length) {
    return "Não há comunicados no semestre activo.";
  }
  return bulletList(
    "*Comunicados*",
    items.map((item) => `${formatDateBr(item.date)} — ${item.title}\n  ${item.body}`),
  );
}

export function formatFees(fees: Fee[]): string {
  if (!fees.length) {
    return "Não há emolumentos no semestre activo.";
  }
  return bulletList(
    "*Emolumentos*",
    fees.map(
      (fee) =>
        `${fee.tipo}: ${fee.valor} (prazo: ${formatDateBr(fee.prazo)})${fee.obs ? ` — ${fee.obs}` : ""}`,
    ),
  );
}

export function formatStudentNp(student: Student): string {
  return `*${student.name}*\nNP: ${student.np}`;
}
