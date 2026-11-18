import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { ASSIGNMENT_TYPE_LABELS, ASSIGNMENT_TYPES, isImageMime } from "../domain/assignment";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";
import { AssignmentService, mapMulterFiles } from "../services/AssignmentService";
import { DisciplineService } from "../services/DisciplineService";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { SemesterService } from "../services/SemesterService";

export class AssignmentController {
  private assignments(): AssignmentService {
    return new AssignmentService(
      AppDataSource.getRepository(Assignment),
      AppDataSource.getRepository(AssignmentAttachment),
      AppDataSource.getRepository(Discipline),
    );
  }

  private disciplines(): DisciplineService {
    return new DisciplineService(
      AppDataSource.getRepository(Discipline),
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Professor),
    );
  }

  private semesters(): SemesterService {
    return new SemesterService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
    );
  }

  private readFields(body: Request["body"]) {
    return {
      title: typeof body.title === "string" ? body.title : "",
      description: typeof body.description === "string" ? body.description : "",
      type: typeof body.type === "string" ? body.type : "",
      dueDate: typeof body.dueDate === "string" ? body.dueDate : "",
    };
  }

  index = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    const semester = await this.semesters().getById(semesterId);
    const disciplines = await this.disciplines().listBySemester(semesterId);
    const assignments = await this.assignments().listBySemester(semesterId);

    res.render("pages/assignments/index", {
      title: "Tarefas",
      semester,
      disciplines,
      assignments,
      types: ASSIGNMENT_TYPES,
      typeLabels: ASSIGNMENT_TYPE_LABELS,
      isImageMime,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    const fields = this.readFields(req.body);
    try {
      await this.assignments().create({
        ...fields,
        disciplineId: Number(req.body.disciplineId),
        files: mapMulterFiles(req.files as Express.Multer.File[] | undefined),
      });
      setFlash(res, "success", "Tarefa cadastrada.");
      res.redirect(`/semestres/${semesterId}/tarefas`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/semestres/${semesterId}/tarefas`);
        return;
      }
      throw err;
    }
  });

  show = asyncHandler(async (req: Request, res: Response) => {
    const assignment = await this.assignments().getById(Number(req.params.id));
    res.render("pages/assignments/show", {
      title: assignment.title,
      assignment,
      types: ASSIGNMENT_TYPES,
      typeLabels: ASSIGNMENT_TYPE_LABELS,
      isImageMime,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const assignment = await this.assignments().update(id, {
        ...this.readFields(req.body),
        files: mapMulterFiles(req.files as Express.Multer.File[] | undefined),
      });
      setFlash(res, "success", "Tarefa actualizada.");
      res.redirect(`/tarefas/${assignment.id}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/tarefas/${id}`);
        return;
      }
      throw err;
    }
  });

  destroy = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const assignment = await this.assignments().getById(id);
      const semesterId = assignment.discipline.semesterId;
      await this.assignments().remove(id);
      setFlash(res, "success", "Tarefa apagada.");
      res.redirect(`/semestres/${semesterId}/tarefas`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect("/anos-letivos");
        return;
      }
      throw err;
    }
  });

  download = asyncHandler(async (req: Request, res: Response) => {
    const attachment = await this.assignments().getAttachment(Number(req.params.id));
    const asDownload = req.path.endsWith("/download");
    const filePath = this.assignments().attachmentPath(attachment);
    const disposition =
      asDownload || !isImageMime(attachment.mimeType) ? "attachment" : "inline";

    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${attachment.originalName.replace(/"/g, "")}"`,
    );
    res.sendFile(filePath);
  });

  removeAttachment = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const attachment = await this.assignments().removeAttachment(id);
      setFlash(res, "success", "Anexo removido.");
      res.redirect(`/tarefas/${attachment.assignmentId}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect("/anos-letivos");
        return;
      }
      throw err;
    }
  });
}
