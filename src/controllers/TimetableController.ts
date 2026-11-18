import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { isImageMime } from "../domain/assignment";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { Discipline } from "../models/Discipline";
import { Semester } from "../models/Semester";
import { Timetable } from "../models/Timetable";
import { mapMulterFiles } from "../services/AssignmentService";
import { SemesterService } from "../services/SemesterService";
import { TimetableService } from "../services/TimetableService";

export class TimetableController {
  private timetables(): TimetableService {
    return new TimetableService(
      AppDataSource.getRepository(Timetable),
      AppDataSource.getRepository(Semester),
    );
  }

  private semesters(): SemesterService {
    return new SemesterService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
    );
  }

  show = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    const semester = await this.semesters().getById(semesterId);
    const timetable = await this.timetables().getBySemester(semesterId);
    res.render("pages/timetables/show", {
      title: "Horário",
      semester,
      timetable,
      isImageMime,
    });
  });

  save = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    const file = mapMulterFiles(req.file ? [req.file] : [])[0];
    try {
      await this.timetables().save({
        semesterId,
        content: typeof req.body.content === "string" ? req.body.content : "",
        file,
        removeFile: req.body.removeFile === "1",
      });
      setFlash(res, "success", "Horário guardado.");
      res.redirect(`/semestres/${semesterId}/horario`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/semestres/${semesterId}/horario`);
        return;
      }
      throw err;
    }
  });

  file = asyncHandler(async (req: Request, res: Response) => {
    const timetable = await this.timetables().getBySemester(Number(req.params.id));
    if (!timetable?.storedName) {
      throw new AppError("Este horário não tem ficheiro.", 404);
    }
    const asDownload = req.path.endsWith("/download");
    const disposition =
      asDownload || !isImageMime(timetable.mimeType ?? "") ? "attachment" : "inline";
    res.setHeader("Content-Type", timetable.mimeType ?? "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `${disposition}; filename="${(timetable.originalName ?? "horario").replace(/"/g, "")}"`,
    );
    res.sendFile(this.timetables().filePath(timetable));
  });
}
