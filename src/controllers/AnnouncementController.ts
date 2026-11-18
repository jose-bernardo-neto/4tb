import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { Announcement } from "../models/Announcement";
import { Discipline } from "../models/Discipline";
import { Semester } from "../models/Semester";
import { AnnouncementService } from "../services/AnnouncementService";
import { SemesterService } from "../services/SemesterService";

export class AnnouncementController {
  private announcements(): AnnouncementService {
    return new AnnouncementService(
      AppDataSource.getRepository(Announcement),
      AppDataSource.getRepository(Semester),
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
      body: typeof body.body === "string" ? body.body : "",
      date: typeof body.date === "string" ? body.date : "",
    };
  }

  index = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    const semester = await this.semesters().getById(semesterId);
    const announcements = await this.announcements().listBySemester(semesterId);
    res.render("pages/announcements/index", {
      title: "Comunicados",
      semester,
      announcements,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    try {
      await this.announcements().create({ semesterId, ...this.readFields(req.body) });
      setFlash(res, "success", "Comunicado publicado.");
      res.redirect(`/semestres/${semesterId}/comunicados`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/semestres/${semesterId}/comunicados`);
        return;
      }
      throw err;
    }
  });

  show = asyncHandler(async (req: Request, res: Response) => {
    const announcement = await this.announcements().getById(Number(req.params.id));
    res.render("pages/announcements/show", {
      title: announcement.title,
      announcement,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const announcement = await this.announcements().update(id, this.readFields(req.body));
      setFlash(res, "success", "Comunicado actualizado.");
      res.redirect(`/comunicados/${announcement.id}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/comunicados/${id}`);
        return;
      }
      throw err;
    }
  });

  destroy = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const announcement = await this.announcements().getById(id);
      const semesterId = announcement.semesterId;
      await this.announcements().remove(id);
      setFlash(res, "success", "Comunicado apagado.");
      res.redirect(`/semestres/${semesterId}/comunicados`);
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
