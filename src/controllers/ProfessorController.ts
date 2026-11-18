import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";
import { ProfessorService } from "../services/ProfessorService";

export class ProfessorController {
  private service(): ProfessorService {
    return new ProfessorService(
      AppDataSource.getRepository(Professor),
      AppDataSource.getRepository(Discipline),
    );
  }

  private readInput(body: Request["body"]) {
    return {
      name: typeof body.name === "string" ? body.name : "",
      academicDegree: typeof body.academicDegree === "string" ? body.academicDegree : "",
      contact: typeof body.contact === "string" ? body.contact : "",
    };
  }

  index = asyncHandler(async (_req: Request, res: Response) => {
    const professors = await this.service().list();
    res.render("pages/professors/index", {
      title: "Professores",
      professors,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    try {
      await this.service().create(this.readInput(req.body));
      setFlash(res, "success", "Professor cadastrado.");
      res.redirect("/professores");
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect("/professores");
        return;
      }
      throw err;
    }
  });

  show = asyncHandler(async (req: Request, res: Response) => {
    const professor = await this.service().getById(Number(req.params.id));
    res.render("pages/professors/show", {
      title: professor.name,
      professor,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      await this.service().update(id, this.readInput(req.body));
      setFlash(res, "success", "Professor actualizado.");
      res.redirect(`/professores/${id}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/professores/${id}`);
        return;
      }
      throw err;
    }
  });

  destroy = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      await this.service().remove(id);
      setFlash(res, "success", "Professor apagado.");
      res.redirect("/professores");
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(err.statusCode === 404 ? "/professores" : `/professores/${id}`);
        return;
      }
      throw err;
    }
  });
}
