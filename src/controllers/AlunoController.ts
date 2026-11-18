import { Request, Response } from "express";
import { AppDataSource } from "../config/data-source";
import { AppError } from "../errors/AppError";
import { asyncHandler } from "../middlewares/asyncHandler";
import { setFlash } from "../middlewares/flash";
import { Student } from "../models/Student";
import { StudentService } from "../services/StudentService";

export class AlunoController {
  private service(): StudentService {
    return new StudentService(AppDataSource.getRepository(Student));
  }

  private readFields(body: Request["body"]) {
    return {
      contact: typeof body.contact === "string" ? body.contact : "",
      np: typeof body.np === "string" ? body.np : "",
      name: typeof body.name === "string" ? body.name : "",
    };
  }

  index = asyncHandler(async (_req: Request, res: Response) => {
    const students = await this.service().list();
    res.render("pages/students/index", {
      title: "Alunos",
      students,
    });
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    try {
      await this.service().create(this.readFields(req.body));
      setFlash(res, "success", "Aluno cadastrado.");
      res.redirect("/alunos");
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect("/alunos");
        return;
      }
      throw err;
    }
  });

  show = asyncHandler(async (req: Request, res: Response) => {
    const student = await this.service().getById(Number(req.params.id));
    res.render("pages/students/show", {
      title: student.name,
      student,
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      await this.service().update(id, this.readFields(req.body));
      setFlash(res, "success", "Aluno actualizado.");
      res.redirect(`/alunos/${id}`);
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect(`/alunos/${id}`);
        return;
      }
      throw err;
    }
  });

  destroy = asyncHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
      await this.service().remove(id);
      setFlash(res, "success", "Aluno apagado.");
      res.redirect("/alunos");
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect("/alunos");
        return;
      }
      throw err;
    }
  });

  importCsv = asyncHandler(async (req: Request, res: Response) => {
    const file = req.file;
    if (!file) {
      setFlash(res, "error", "Seleccione um ficheiro CSV.");
      res.redirect("/alunos");
      return;
    }

    try {
      const report = await this.service().importCsv(file.buffer.toString("utf8"));
      const students = await this.service().list();
      res.render("pages/students/index", {
        title: "Alunos",
        students,
        report,
      });
    } catch (err) {
      if (err instanceof AppError) {
        setFlash(res, "error", err.message);
        res.redirect("/alunos");
        return;
      }
      throw err;
    }
  });
}
