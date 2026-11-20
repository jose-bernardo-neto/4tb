import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { env } from "../config/env";
import { AssignmentType } from "../domain/assignment";
import { AcademicYear } from "../models/AcademicYear";
import { Announcement } from "../models/Announcement";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";
import { Fee } from "../models/Fee";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { Student } from "../models/Student";
import { Timetable } from "../models/Timetable";
import { AcademicYearService } from "../services/AcademicYearService";
import { AnnouncementService } from "../services/AnnouncementService";
import { AssignmentService } from "../services/AssignmentService";
import { DisciplineService } from "../services/DisciplineService";
import { FeeService } from "../services/FeeService";
import { ProfessorService } from "../services/ProfessorService";
import { PublicCatalogService } from "../services/PublicCatalogService";
import { SemesterService } from "../services/SemesterService";
import { StudentService } from "../services/StudentService";
import { TimetableService } from "../services/TimetableService";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { MessageHandler } from "./handler";
import { BotReply } from "./types";

const CONTACT = "923000001";

describe("MessageHandler", () => {
  let handler: MessageHandler;
  let clock = 0;
  let years: AcademicYearService;
  let professors: ProfessorService;
  let disciplines: DisciplineService;
  let assignments: AssignmentService;
  let semesters: SemesterService;
  let announcements: AnnouncementService;
  let fees: FeeService;
  let timetables: TimetableService;
  let students: StudentService;
  let catalog: PublicCatalogService;
  let firstSemesterId: number;

  function text(reply: BotReply | null): string {
    expect(reply?.kind).toBe("text");
    return reply && reply.kind === "text" ? reply.text : "";
  }

  async function send(message: string, senderContact = CONTACT): Promise<BotReply | null> {
    return handler.handle({ text: message, senderContact });
  }

  async function seed(): Promise<void> {
    const professor = await professors.create({
      name: "Ana",
      academicDegree: "Mestre",
      contact: "ana@faculdade.ao",
    });
    const year = await years.create("2025/2026");
    const first = year.semesters[0];
    const second = year.semesters[1];
    firstSemesterId = first.id;

    const am = await disciplines.create({
      name: "Análise Matemática",
      acronym: "AM",
      semesterId: first.id,
      professorId: professor.id,
    });
    await disciplines.create({
      name: "Álgebra Linear",
      acronym: "AL",
      semesterId: first.id,
      professorId: professor.id,
    });
    await disciplines.create({
      name: "TCE",
      acronym: "TCE",
      semesterId: first.id,
      professorId: professor.id,
    });
    await disciplines.create({
      name: "Redes",
      acronym: "RC",
      semesterId: second.id,
      professorId: professor.id,
    });
    await semesters.activate(first.id);

    await assignments.create({
      title: "Lista AM",
      description: "",
      type: AssignmentType.WORK,
      dueDate: "2026-03-10",
      disciplineId: am.id,
    });
    await announcements.create({
      semesterId: first.id,
      title: "Reunião",
      body: "Sala 12 às 10h.",
      date: "2026-02-01",
    });
    await fees.create({
      semesterId: first.id,
      tipo: "Inscrição",
      valor: "5000 Kz",
      prazo: "2026-02-15",
      obs: "",
    });
    await timetables.save({ semesterId: first.id, content: "Segunda: AM 8h-10h" });
    await students.create({ contact: CONTACT, np: "2025001", name: "João" });
  }

  beforeAll(async () => {
    await setupTestDb();
    years = new AcademicYearService(
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Semester),
    );
    professors = new ProfessorService(
      AppDataSource.getRepository(Professor),
      AppDataSource.getRepository(Discipline),
    );
    disciplines = new DisciplineService(
      AppDataSource.getRepository(Discipline),
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Professor),
    );
    assignments = new AssignmentService(
      AppDataSource.getRepository(Assignment),
      AppDataSource.getRepository(AssignmentAttachment),
      AppDataSource.getRepository(Discipline),
    );
    semesters = new SemesterService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
    );
    announcements = new AnnouncementService(
      AppDataSource.getRepository(Announcement),
      AppDataSource.getRepository(Semester),
    );
    fees = new FeeService(AppDataSource.getRepository(Fee), AppDataSource.getRepository(Semester));
    timetables = new TimetableService(
      AppDataSource.getRepository(Timetable),
      AppDataSource.getRepository(Semester),
    );
    students = new StudentService(AppDataSource.getRepository(Student));
    catalog = new PublicCatalogService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
      AppDataSource.getRepository(Assignment),
      AppDataSource.getRepository(AssignmentAttachment),
      AppDataSource.getRepository(Announcement),
      AppDataSource.getRepository(Fee),
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Timetable),
    );
    handler = new MessageHandler(
      { catalog, students },
      { faahPath: "/tmp/faah.mp3", now: () => clock },
    );
  });

  beforeEach(async () => {
    await clearAcademicData();
    clock += 10_000;
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("responde /professores com os docentes do semestre activo", async () => {
    await seed();
    expect(text(await send("/professores"))).toContain("Ana (Mestre) — ana@faculdade.ao");
  });

  it("/cadeiras-sm1 e /cadeiras-sm2 separam por período", async () => {
    await seed();
    const sm1 = text(await send("/cadeiras-sm1"));
    expect(sm1).toContain("AM");
    expect(sm1).toContain("TCE");
    expect(sm1).not.toContain("RC");

    clock += 10_000;
    const sm2 = text(await send("/cadeiras-sm2"));
    expect(sm2).toContain("RC");
    expect(sm2).not.toContain("AM");
  });

  it("/tarefas lista tudo e /tarefas-<sigla> filtra", async () => {
    await seed();
    expect(text(await send("/tarefas"))).toContain("Lista AM [Trabalho] — AM — entrega: 10/03/2026");

    clock += 10_000;
    expect(text(await send("/tarefas-am"))).toContain("Lista AM");

    clock += 10_000;
    expect(text(await send("/tarefas-rc"))).toBe("Não há tarefas para RC.");
  });

  it("/horario devolve o conteúdo publicado", async () => {
    await seed();
    expect(text(await send("/horario"))).toBe("Segunda: AM 8h-10h");
  });

  it("/horario devolve imagem quando o horário é um ficheiro", async () => {
    await seed();
    await timetables.save({
      semesterId: firstSemesterId,
      content: "",
      file: {
        storedName: "horario.png",
        originalName: "horario.png",
        mimeType: "image/png",
        size: 10,
      },
    });
    const reply = await send("/horario");
    expect(reply).toEqual({
      kind: "image",
      filePath: `${env.UPLOAD_DIR}/horario.png`,
      caption: undefined,
    });
  });

  it("/horario avisa quando não há horário", async () => {
    await seed();
    await AppDataSource.query("DELETE FROM timetables");
    expect(text(await send("/horario"))).toBe("O horário ainda não foi publicado.");
  });

  it("/comunicados e /emolumentos listam os registos", async () => {
    await seed();
    expect(text(await send("/comunicados"))).toContain("Reunião");
    clock += 10_000;
    expect(text(await send("/emolumentos"))).toContain("Inscrição: 5000 Kz (prazo: 15/02/2026)");
  });

  it("/meu-np resolve pelo contacto normalizado do remetente", async () => {
    await seed();
    expect(text(await send("/meu-np"))).toBe("*João*\nNP: 2025001");
    clock += 10_000;
    expect(text(await send("/meu-np", "244923000001"))).toBe("*João*\nNP: 2025001");
  });

  it("/meu-np avisa quando o número não está registado", async () => {
    await seed();
    expect(text(await send("/meu-np", "923999999"))).toContain("Não encontrei nenhum aluno");
  });

  it("mensagem terminada em 😢 ou 😭 dispara o PTT", async () => {
    const reply = await send("que tristeza 😢");
    expect(reply).toEqual({ kind: "ptt", filePath: "/tmp/faah.mp3" });
    clock += 10_000;
    expect(await send("😭")).toEqual({ kind: "ptt", filePath: "/tmp/faah.mp3" });
  });

  it("emoji no início não dispara o PTT", async () => {
    expect(await send("😢 que tristeza")).toBeNull();
  });

  it("ignora conversa normal e comandos desconhecidos", async () => {
    expect(await send("olá pessoal")).toBeNull();
    clock += 10_000;
    expect(await send("/xyz")).toBeNull();
  });

  it("aplica cooldown por utilizador", async () => {
    await seed();
    expect(text(await send("/professores"))).toContain("Ana");
    expect(await send("/professores")).toBeNull();
    expect(text(await send("/professores", "923000002"))).toContain("Ana");
    clock += 2000;
    expect(text(await send("/professores"))).toContain("Ana");
  });

  it("responde com a mensagem de erro quando não há semestre activo", async () => {
    expect(text(await send("/professores"))).toBe("Não há semestre activo.");
  });

  it("aceita comandos em maiúsculas", async () => {
    await seed();
    expect(text(await send("/PROFESSORES"))).toContain("Ana");
  });
});
