import { Request, Response } from "express";
import path from "node:path";
import { AppDataSource } from "../config/data-source";
import { env } from "../config/env";
import { ASSIGNMENT_TYPE_LABELS, isImageMime } from "../domain/assignment";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { AcademicYear } from "../models/AcademicYear";
import { Announcement } from "../models/Announcement";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";
import { Fee } from "../models/Fee";
import { Semester } from "../models/Semester";
import { Timetable } from "../models/Timetable";
import { PublicCatalogService } from "../services/PublicCatalogService";

export class StudentController {
  private catalog(): PublicCatalogService {
    return new PublicCatalogService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
      AppDataSource.getRepository(Assignment),
      AppDataSource.getRepository(AssignmentAttachment),
      AppDataSource.getRepository(Announcement),
      AppDataSource.getRepository(Fee),
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Timetable),
    );
  }

  private async renderPublic(
    res: Response,
    view: string,
    title: string,
    extra: Record<string, unknown> = {},
  ): Promise<void> {
    const semester = await this.catalog().getActiveSemester();
    res.render(view, {
      title,
      publicArea: true,
      guest: true,
      semester,
      typeLabels: ASSIGNMENT_TYPE_LABELS,
      isImageMime,
      ...extra,
    });
  }

  home = asyncHandler(async (_req: Request, res: Response) => {
    await this.renderPublic(res, "pages/student/home", "Turma");
  });

  professors = asyncHandler(async (_req: Request, res: Response) => {
    try {
      const professors = await this.catalog().listProfessors();
      await this.renderPublic(res, "pages/student/professors", "Professores", { professors });
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 404) {
        await this.renderPublic(res, "pages/student/empty", "Professores");
        return;
      }
      throw err;
    }
  });

  disciplines = asyncHandler(async (_req: Request, res: Response) => {
    try {
      const disciplines = await this.catalog().listDisciplines();
      await this.renderPublic(res, "pages/student/disciplines", "Cadeiras", { disciplines });
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 404) {
        await this.renderPublic(res, "pages/student/empty", "Cadeiras");
        return;
      }
      throw err;
    }
  });

  assignments = asyncHandler(async (_req: Request, res: Response) => {
    try {
      const assignments = await this.catalog().listAssignments();
      await this.renderPublic(res, "pages/student/assignments", "Tarefas", { assignments });
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 404) {
        await this.renderPublic(res, "pages/student/empty", "Tarefas");
        return;
      }
      throw err;
    }
  });

  announcements = asyncHandler(async (_req: Request, res: Response) => {
    try {
      const announcements = await this.catalog().listAnnouncements();
      await this.renderPublic(res, "pages/student/announcements", "Comunicados", { announcements });
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 404) {
        await this.renderPublic(res, "pages/student/empty", "Comunicados");
        return;
      }
      throw err;
    }
  });

  fees = asyncHandler(async (_req: Request, res: Response) => {
    try {
      const fees = await this.catalog().listFees();
      await this.renderPublic(res, "pages/student/fees", "Emolumentos", { fees });
    } catch (err) {
      if (err instanceof AppError && err.statusCode === 404) {
        await this.renderPublic(res, "pages/student/empty", "Emolumentos");
        return;
      }
      throw err;
    }
  });

  assignment = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await this.catalog().getAssignment(Number(req.params.id));
    await this.renderPublic(res, "pages/student/assignment", assignment.title, { assignment });
  });

  attachment = asyncHandler(async (req: Request, res: Response) => {
    const attachment = await this.catalog().getAttachment(Number(req.params.id));
    const asDownload = req.path.endsWith("/download");
    const disposition =
      asDownload || !isImageMime(attachment.mimeType) ? "attachment" : "inline";
    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${attachment.originalName.replace(/"/g, "")}"`,
    );
    res.sendFile(path.join(env.UPLOAD_DIR, path.basename(attachment.storedName)));
  });
}
