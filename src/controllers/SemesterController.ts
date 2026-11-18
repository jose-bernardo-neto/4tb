import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { Discipline } from "../models/Discipline";
import { Semester } from "../models/Semester";
import { SemesterService } from "../services/SemesterService";

export class SemesterController {
  private service(): SemesterService {
    return new SemesterService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
    );
  }

  activate = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const semester = await this.service().activate(id);
      setFlash(res, "success", `Semestre ${semester.period === "PRIMEIRO" ? "1.º" : "2.º"} activado.`);
      res.redirect(`/anos-letivos/${semester.academicYearId}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        const semester = await AppDataSource.getRepository(Semester).findOne({ where: { id } });
        res.redirect(semester ? `/anos-letivos/${semester.academicYearId}` : "/anos-letivos");
        return;
      }
      throw err;
    }
  });
}
