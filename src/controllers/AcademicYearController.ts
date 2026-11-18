import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { AcademicYear } from "../models/AcademicYear";
import { Semester } from "../models/Semester";
import { AcademicYearService } from "../services/AcademicYearService";

export class AcademicYearController {
  private service(): AcademicYearService {
    return new AcademicYearService(
      AppDataSource.getRepository(AcademicYear),
      AppDataSource.getRepository(Semester),
    );
  }

  index = asyncHandler(async (_req: Request, res: Response) => {
    const years = await this.service().list();
    res.render("pages/academic-years/index", {
      title: "Anos letivos",
      years,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const label = typeof req.body.label === "string" ? req.body.label : "";
    try {
      const year = await this.service().create(label);
      setFlash(res, "success", `Ano letivo ${year.label} criado com 1.º e 2.º semestre.`);
      res.redirect(`/anos-letivos/${year.id}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect("/anos-letivos");
        return;
      }
      throw err;
    }
  });

  show = asyncHandler(async (req: Request, res: Response) => {
    const year = await this.service().getById(Number(req.params.id));
    res.render("pages/academic-years/show", {
      title: year.label,
      year,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const label = typeof req.body.label === "string" ? req.body.label : "";
    try {
      const year = await this.service().update(id, label);
      setFlash(res, "success", "Ano letivo actualizado.");
      res.redirect(`/anos-letivos/${year.id}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/anos-letivos/${id}`);
        return;
      }
      throw err;
    }
  });

  destroy = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      await this.service().remove(id);
      setFlash(res, "success", "Ano letivo apagado.");
      res.redirect("/anos-letivos");
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/anos-letivos/${id}`);
        return;
      }
      throw err;
    }
  });
}
