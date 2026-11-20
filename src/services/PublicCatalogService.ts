import { Repository } from "typeorm";
import { SemesterPeriod, SemesterStatus } from "../domain/academic";
import { AppError } from "../errors/AppError";
import { AcademicYear } from "../models/AcademicYear";
import { Announcement } from "../models/Announcement";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";
import { Fee } from "../models/Fee";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { Timetable } from "../models/Timetable";

export class PublicCatalogService {
  constructor(
    private readonly semesters: Repository<Semester>,
    private readonly disciplines: Repository<Discipline>,
    private readonly assignments: Repository<Assignment>,
    private readonly attachments: Repository<AssignmentAttachment>,
    private readonly announcements: Repository<Announcement>,
    private readonly fees: Repository<Fee>,
    private readonly years: Repository<AcademicYear>,
    private readonly timetables: Repository<Timetable>,
  ) {}

  async getActiveSemester(): Promise<Semester | null> {
    return this.semesters.findOne({
      where: { status: SemesterStatus.ACTIVE },
      relations: { academicYear: true },
    });
  }

  async requireActiveSemester(): Promise<Semester> {
    const semester = await this.getActiveSemester();
    if (!semester) {
      throw new AppError("Não há semestre activo.", 404);
    }
    return semester;
  }

  async listDisciplines(): Promise<Discipline[]> {
    const semester = await this.requireActiveSemester();
    return this.disciplines.find({
      where: { semesterId: semester.id },
      relations: { professor: true },
      order: { acronym: "ASC" },
    });
  }

  async listProfessors(): Promise<Professor[]> {
    const disciplines = await this.listDisciplines();
    const unique = new Map<number, Professor>();
    for (const discipline of disciplines) {
      unique.set(discipline.professor.id, discipline.professor);
    }
    return [...unique.values()].sort((a, b) => a.name.localeCompare(b.name, "pt"));
  }

  async listAssignments(): Promise<Assignment[]> {
    const semester = await this.requireActiveSemester();
    return this.assignments.find({
      where: { discipline: { semesterId: semester.id } },
      relations: { discipline: true, attachments: true },
      order: { dueDate: "ASC", id: "ASC" },
    });
  }

  async getAssignment(id: number): Promise<Assignment> {
    const semester = await this.requireActiveSemester();
    const assignment = await this.assignments.findOne({
      where: { id, discipline: { semesterId: semester.id } },
      relations: { discipline: { professor: true }, attachments: true },
    });
    if (!assignment) {
      throw new AppError("Tarefa não encontrada no semestre activo.", 404);
    }
    return assignment;
  }

  async getAttachment(id: number): Promise<AssignmentAttachment> {
    const semester = await this.requireActiveSemester();
    const attachment = await this.attachments.findOne({
      where: { id, assignment: { discipline: { semesterId: semester.id } } },
      relations: { assignment: { discipline: true } },
    });
    if (!attachment) {
      throw new AppError("Anexo não encontrado no semestre activo.", 404);
    }
    return attachment;
  }

  async listAnnouncements(): Promise<Announcement[]> {
    const semester = await this.requireActiveSemester();
    return this.announcements.find({
      where: { semesterId: semester.id },
      order: { date: "DESC", id: "DESC" },
    });
  }

  async listFees(): Promise<Fee[]> {
    const semester = await this.requireActiveSemester();
    return this.fees.find({
      where: { semesterId: semester.id },
      order: { prazo: "ASC", id: "ASC" },
    });
  }

  async getCurrentAcademicYear(): Promise<AcademicYear | null> {
    const active = await this.getActiveSemester();
    if (active?.academicYear) {
      return active.academicYear;
    }
    return this.years.findOne({ order: { label: "DESC" } });
  }

  async listDisciplinesByPeriod(period: SemesterPeriod): Promise<Discipline[]> {
    const year = await this.getCurrentAcademicYear();
    if (!year) {
      throw new AppError("Não há ano letivo.", 404);
    }
    const semester = await this.semesters.findOne({
      where: { academicYearId: year.id, period },
    });
    if (!semester) {
      throw new AppError("Semestre não encontrado para o período pedido.", 404);
    }
    return this.disciplines.find({
      where: { semesterId: semester.id },
      relations: { professor: true },
      order: { acronym: "ASC" },
    });
  }

  async getTimetable(): Promise<Timetable | null> {
    const semester = await this.requireActiveSemester();
    return this.timetables.findOne({ where: { semesterId: semester.id } });
  }
}
