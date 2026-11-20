import path from "node:path";
import { env } from "../config/env";
import { SemesterPeriod } from "../domain/academic";
import { isImageMime } from "../domain/assignment";
import {
  formatAnnouncements,
  formatAssignments,
  formatDisciplines,
  formatFees,
  formatProfessors,
  formatStudentNp,
} from "./formatters";
import { BotCommandInput, BotReply, BotServices, IBotCommand } from "./types";

class ProfessoresCommand implements IBotCommand {
  readonly name = "professores";

  matches(command: string): boolean {
    return command === this.name;
  }

  async execute(services: BotServices): Promise<BotReply> {
    const professors = await services.catalog.listProfessors();
    return { kind: "text", text: formatProfessors(professors) };
  }
}

class CadeirasSmCommand implements IBotCommand {
  constructor(
    readonly name: string,
    private readonly period: SemesterPeriod,
  ) {}

  matches(command: string): boolean {
    return command === this.name;
  }

  async execute(services: BotServices): Promise<BotReply> {
    const disciplines = await services.catalog.listDisciplinesByPeriod(this.period);
    const label = this.period === SemesterPeriod.FIRST ? "1.º" : "2.º";
    return {
      kind: "text",
      text: formatDisciplines(`*Cadeiras — ${label} semestre*`, disciplines),
    };
  }
}

class TarefasCommand implements IBotCommand {
  readonly name = "tarefas";

  matches(command: string): boolean {
    return command === this.name || command.startsWith("tarefas-");
  }

  async execute(services: BotServices, input: BotCommandInput): Promise<BotReply> {
    const assignments = await services.catalog.listAssignments();
    if (!input.command.startsWith("tarefas-")) {
      return { kind: "text", text: formatAssignments(assignments) };
    }

    const acronym = input.command.slice("tarefas-".length).toUpperCase();
    const filtered = assignments.filter(
      (assignment) => assignment.discipline.acronym.toUpperCase() === acronym,
    );
    if (!filtered.length) {
      return { kind: "text", text: `Não há tarefas para ${acronym}.` };
    }
    return { kind: "text", text: formatAssignments(filtered) };
  }
}

class HorarioCommand implements IBotCommand {
  readonly name = "horario";

  matches(command: string): boolean {
    return command === this.name;
  }

  async execute(services: BotServices): Promise<BotReply> {
    const timetable = await services.catalog.getTimetable();
    if (!timetable || (!timetable.content && !timetable.storedName)) {
      return { kind: "text", text: "O horário ainda não foi publicado." };
    }

    if (timetable.storedName && timetable.mimeType) {
      return {
        kind: isImageMime(timetable.mimeType) ? "image" : "document",
        filePath: path.join(env.UPLOAD_DIR, path.basename(timetable.storedName)),
        caption: timetable.content || undefined,
      };
    }

    return { kind: "text", text: timetable.content };
  }
}

class ComunicadosCommand implements IBotCommand {
  readonly name = "comunicados";

  matches(command: string): boolean {
    return command === this.name;
  }

  async execute(services: BotServices): Promise<BotReply> {
    const announcements = await services.catalog.listAnnouncements();
    return { kind: "text", text: formatAnnouncements(announcements) };
  }
}

class EmolumentosCommand implements IBotCommand {
  readonly name = "emolumentos";

  matches(command: string): boolean {
    return command === this.name;
  }

  async execute(services: BotServices): Promise<BotReply> {
    const fees = await services.catalog.listFees();
    return { kind: "text", text: formatFees(fees) };
  }
}

class MeuNpCommand implements IBotCommand {
  readonly name = "meu-np";

  matches(command: string): boolean {
    return command === this.name;
  }

  async execute(services: BotServices, input: BotCommandInput): Promise<BotReply> {
    const student = await services.students.findByContact(input.senderContact);
    if (!student) {
      return {
        kind: "text",
        text: "Não encontrei nenhum aluno associado a este número. Fala com o delegado.",
      };
    }
    return { kind: "text", text: formatStudentNp(student) };
  }
}

export function createCommands(): IBotCommand[] {
  return [
    new ProfessoresCommand(),
    new CadeirasSmCommand("cadeiras-sm1", SemesterPeriod.FIRST),
    new CadeirasSmCommand("cadeiras-sm2", SemesterPeriod.SECOND),
    new TarefasCommand(),
    new HorarioCommand(),
    new ComunicadosCommand(),
    new EmolumentosCommand(),
    new MeuNpCommand(),
  ];
}
