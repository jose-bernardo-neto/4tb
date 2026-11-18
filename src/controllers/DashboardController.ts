import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler";

export class DashboardController {
  index = asyncHandler((_req: Request, res: Response) => {
    res.render("pages/dashboard", {
      title: "Início",
    });
  });
}
