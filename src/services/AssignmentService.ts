import fs from "node:fs/promises";
import path from "node:path";
import { Repository } from "typeorm";
import { env } from "../config/env";
import { ASSIGNMENT_TYPES, AssignmentType, isAssignmentType } from "../domain/assignment";
import { AppError } from "../errors/AppError";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";

export type UploadedAttachment = {
  storedName: string;
  originalName: string;
  mimeType: string;
  size: number;
};

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function requiredTitle(value: string): string {
  const title = value.trim();
  if (!title) {
    throw new AppError("O título da tarefa é obrigatório.", 400);
  }
  return title;
}

function parseDueDate(value: string): string {
  const dueDate = value.trim();
  if (!DATE_PATTERN.test(dueDate)) {
    throw new AppError("A data limite é obrigatória e deve ter o formato AAAA-MM-DD.", 400);
  }
  return dueDate;
}

function parseType(value: string): AssignmentType {
  if (!isAssignmentType(value)) {
    throw new AppError(`O tipo deve ser: ${ASSIGNMENT_TYPES.join(", ")}.`, 400);
  }
  return value;
}

export class AssignmentService {
  constructor(
    private readonly assignments: Repository<Assignment>,
    private readonly attachments: Repository<AssignmentAttachment>,
    private readonly disciplines: Repository<Discipline>,
  ) {}

  async listBySemester(semesterId: number): Promise<Assignment[]> {
    return this.assignments.find({
      where: { discipline: { semesterId } },
      relations: { discipline: true, attachments: true },
      order: { dueDate: "ASC", id: "ASC" },
    });
  }

  async listByDiscipline(disciplineId: number): Promise<Assignment[]> {
    return this.assignments.find({
      where: { disciplineId },
      relations: { discipline: true, attachments: true },
      order: { dueDate: "ASC", id: "ASC" },
    });
  }

  async getById(id: number): Promise<Assignment> {
    const assignment = await this.assignments.findOne({
      where: { id },
      relations: { discipline: { semester: { academicYear: true } }, attachments: true },
    });

    if (!assignment) {
      throw new AppError("Tarefa não encontrada.", 404);
    }

    return assignment;
  }

  async create(input: {
    title: string;
    description: string;
    type: string;
    dueDate: string;
    disciplineId: number;
    files?: UploadedAttachment[];
  }): Promise<Assignment> {
    const discipline = await this.disciplines.findOne({ where: { id: input.disciplineId } });
    if (!discipline) {
      throw new AppError("Cadeira não encontrada.", 400);
    }

    const assignment = await this.assignments.save(
      this.assignments.create({
        title: requiredTitle(input.title),
        description: input.description.trim(),
        type: parseType(input.type),
        dueDate: parseDueDate(input.dueDate),
        disciplineId: discipline.id,
      }),
    );

    await this.addAttachments(assignment.id, input.files ?? []);
    return this.getById(assignment.id);
  }

  async update(
    id: number,
    input: {
      title: string;
      description: string;
      type: string;
      dueDate: string;
      files?: UploadedAttachment[];
    },
  ): Promise<Assignment> {
    const assignment = await this.getById(id);
    assignment.title = requiredTitle(input.title);
    assignment.description = input.description.trim();
    assignment.type = parseType(input.type);
    assignment.dueDate = parseDueDate(input.dueDate);
    await this.assignments.save(assignment);
    await this.addAttachments(assignment.id, input.files ?? []);
    return this.getById(id);
  }

  async remove(id: number): Promise<Assignment> {
    const assignment = await this.getById(id);
    await this.deleteStoredFiles(assignment.attachments);
    await this.assignments.remove(assignment);
    return assignment;
  }

  async getAttachment(id: number): Promise<AssignmentAttachment> {
    const attachment = await this.attachments.findOne({
      where: { id },
      relations: { assignment: true },
    });
    if (!attachment) {
      throw new AppError("Anexo não encontrado.", 404);
    }
    return attachment;
  }

  async removeAttachment(id: number): Promise<AssignmentAttachment> {
    const attachment = await this.getAttachment(id);
    await this.deleteStoredFiles([attachment]);
    await this.attachments.remove(attachment);
    return attachment;
  }

  attachmentPath(attachment: AssignmentAttachment): string {
    return path.join(env.UPLOAD_DIR, path.basename(attachment.storedName));
  }

  private async addAttachments(assignmentId: number, files: UploadedAttachment[]): Promise<void> {
    if (!files.length) {
      return;
    }

    await this.attachments.save(
      files.map((file) =>
        this.attachments.create({
          assignmentId,
          storedName: path.basename(file.storedName),
          originalName: file.originalName,
          mimeType: file.mimeType,
          size: file.size,
        }),
      ),
    );
  }

  private async deleteStoredFiles(files: AssignmentAttachment[]): Promise<void> {
    await Promise.all(
      files.map(async (file) => {
        try {
          await fs.unlink(this.attachmentPath(file));
        } catch {
          // o ficheiro pode já ter sido removido
        }
      }),
    );
  }
}

export function mapMulterFiles(files: Express.Multer.File[] | undefined): UploadedAttachment[] {
  return (files ?? []).map((file) => ({
    storedName: file.filename,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  }));
}
