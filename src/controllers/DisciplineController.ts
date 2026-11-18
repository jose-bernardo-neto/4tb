import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { DisciplineService } from "../services/DisciplineService";
import { ProfessorService } from "../services/ProfessorService";
import { SemesterService } from "../services/SemesterService";

export class DisciplineController {
  private disciplines(): DisciplineService {
    return new DisciplineService(
      AppDataSource.getRepository(Discipline),
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Professor),
    );
  }

  private professors(): ProfessorService {
    return new ProfessorService(
      AppDataSource.getRepository(Professor),
      AppDataSource.getRepository(Discipline),
    );
  }

  private semesters(): SemesterService {
    return new SemesterService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
    );
  }

  index = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    const semester = await this.semesters().getById(semesterId);
    const disciplines = await this.disciplines().listBySemester(semesterId);
    const professors = await this.professors().list();

    res.render("pages/disciplines/index", {
      title: "Cadeiras",
      semester,
      disciplines,
      professors,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    try {
      await this.disciplines().create({
        semesterId,
        name: typeof req.body.name === "string" ? req.body.name : "",
        acronym: typeof req.body.acronym === "string" ? req.body.acronym : "",
        professorId: Number(req.body.professorId),
      });
      setFlash(res, "success", "Cadeira cadastrada.");
      res.redirect(`/semestres/${semesterId}/cadeiras`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/semestres/${semesterId}/cadeiras`);
        return;
      }
      throw err;
    }
  });

  show = asyncHandler(async (req: Request, res: Response) => {
    const discipline = await this.disciplines().getById(Number(req.params.id));
    const professors = await this.professors().list();
    res.render("pages/disciplines/show", {
      title: discipline.acronym,
      discipline,
      professors,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const discipline = await this.disciplines().update(id, {
        name: typeof req.body.name === "string" ? req.body.name : "",
        acronym: typeof req.body.acronym === "string" ? req.body.acronym : "",
        professorId: Number(req.body.professorId),
      });
      setFlash(res, "success", "Cadeira actualizada.");
      res.redirect(`/semestres/${discipline.semesterId}/cadeiras`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/cadeiras/${id}`);
        return;
      }
      throw err;
    }
  });

  destroy = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const discipline = await this.disciplines().remove(id);
      setFlash(res, "success", "Cadeira apagada.");
      res.redirect(`/semestres/${discipline.semesterId}/cadeiras`);
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
