import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { Discipline } from "../models/Discipline";
import { Fee } from "../models/Fee";
import { Semester } from "../models/Semester";
import { FeeService } from "../services/FeeService";
import { SemesterService } from "../services/SemesterService";

export class FeeController {
  private fees(): FeeService {
    return new FeeService(AppDataSource.getRepository(Fee), AppDataSource.getRepository(Semester));
  }

  private semesters(): SemesterService {
    return new SemesterService(
      AppDataSource.getRepository(Semester),
      AppDataSource.getRepository(Discipline),
    );
  }

  private readFields(body: Request["body"]) {
    return {
      tipo: typeof body.tipo === "string" ? body.tipo : "",
      valor: typeof body.valor === "string" ? body.valor : "",
      prazo: typeof body.prazo === "string" ? body.prazo : "",
      obs: typeof body.obs === "string" ? body.obs : "",
    };
  }

  index = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    const semester = await this.semesters().getById(semesterId);
    const fees = await this.fees().listBySemester(semesterId);
    res.render("pages/fees/index", {
      title: "Emolumentos",
      semester,
      fees,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const semesterId = Number(req.params.id);
    try {
      await this.fees().create({ semesterId, ...this.readFields(req.body) });
      setFlash(res, "success", "Emolumento cadastrado.");
      res.redirect(`/semestres/${semesterId}/emolumentos`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/semestres/${semesterId}/emolumentos`);
        return;
      }
      throw err;
    }
  });

  show = asyncHandler(async (req: Request, res: Response) => {
    const fee = await this.fees().getById(Number(req.params.id));
    res.render("pages/fees/show", {
      title: fee.tipo,
      fee,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const fee = await this.fees().update(id, this.readFields(req.body));
      setFlash(res, "success", "Emolumento actualizado.");
      res.redirect(`/emolumentos/${fee.id}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/emolumentos/${id}`);
        return;
      }
      throw err;
    }
  });

  destroy = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      const fee = await this.fees().getById(id);
      const semesterId = fee.semesterId;
      await this.fees().remove(id);
      setFlash(res, "success", "Emolumento apagado.");
      res.redirect(`/semestres/${semesterId}/emolumentos`);
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
