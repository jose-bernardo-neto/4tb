import { describe, expect, it } from "vitest";
import { AssignmentType } from "../domain/assignment";
import { Announcement } from "../models/Announcement";
import { Assignment } from "../models/Assignment";
import { Discipline } from "../models/Discipline";
import { Fee } from "../models/Fee";
import { Professor } from "../models/Professor";
import { Student } from "../models/Student";
import {
  formatAnnouncements,
  formatAssignments,
  formatDateBr,
  formatDisciplines,
  formatFees,
  formatProfessors,
  formatStudentNp,
} from "./formatters";

describe("formatDateBr", () => {
  it("converte ISO para DD/MM/AAAA", () => {
    expect(formatDateBr("2026-03-10")).toBe("10/03/2026");
  });

  it("devolve o valor original fora do formato ISO", () => {
    expect(formatDateBr("10/03/2026")).toBe("10/03/2026");
    expect(formatDateBr("")).toBe("");
  });
});

describe("formatadores", () => {
  const professor = { name: "Ana", academicDegree: "Mestre", contact: "ana@faculdade.ao" } as Professor;
  const discipline = { acronym: "AM", name: "Análise Matemática", professor } as Discipline;

  it("formata professores", () => {
    expect(formatProfessors([professor])).toBe("*Professores*\n• Ana (Mestre) — ana@faculdade.ao");
    expect(formatProfessors([])).toBe("Não há professores no semestre activo.");
  });

  it("formata cadeiras com cabeçalho", () => {
    expect(formatDisciplines("*Cadeiras — 1.º semestre*", [discipline])).toBe(
      "*Cadeiras — 1.º semestre*\n• AM — Análise Matemática (Ana)",
    );
    expect(formatDisciplines("*Cadeiras*", [])).toBe("Não há cadeiras.");
  });

  it("formata tarefas com tipo, sigla e data", () => {
    const assignment = {
      title: "Lista AM",
      type: AssignmentType.WORK,
      dueDate: "2026-03-10",
      discipline,
    } as Assignment;
    expect(formatAssignments([assignment])).toBe(
      "*Tarefas*\n• Lista AM [Trabalho] — AM — entrega: 10/03/2026",
    );
    expect(formatAssignments([])).toBe("Não há tarefas no semestre activo.");
  });

  it("formata comunicados", () => {
    const announcement = { title: "Reunião", body: "Sala 12 às 10h.", date: "2026-02-01" } as Announcement;
    expect(formatAnnouncements([announcement])).toBe(
      "*Comunicados*\n• 01/02/2026 — Reunião\n  Sala 12 às 10h.",
    );
    expect(formatAnnouncements([])).toBe("Não há comunicados no semestre activo.");
  });

  it("formata emolumentos com e sem observação", () => {
    const fee = { tipo: "Inscrição", valor: "5000 Kz", prazo: "2026-02-15", obs: "" } as Fee;
    expect(formatFees([fee])).toBe("*Emolumentos*\n• Inscrição: 5000 Kz (prazo: 15/02/2026)");
    expect(formatFees([{ ...fee, obs: "pagar na secretaria" } as Fee])).toBe(
      "*Emolumentos*\n• Inscrição: 5000 Kz (prazo: 15/02/2026) — pagar na secretaria",
    );
    expect(formatFees([])).toBe("Não há emolumentos no semestre activo.");
  });

  it("formata o NP do aluno", () => {
    const student = { name: "João", np: "2025001" } as Student;
    expect(formatStudentNp(student)).toBe("*João*\nNP: 2025001");
  });
});
