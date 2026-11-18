import { Repository } from "typeorm";
import { parseIsoDate, requiredText } from "../domain/dates";
import { AppError } from "../errors/AppError";
import { Fee } from "../models/Fee";
import { Semester } from "../models/Semester";

export class FeeService {
  constructor(
    private readonly fees: Repository<Fee>,
    private readonly semesters: Repository<Semester>,
  ) {}

  async listBySemester(semesterId: number): Promise<Fee[]> {
    await this.requireSemester(semesterId);
    return this.fees.find({
      where: { semesterId },
      relations: { semester: { academicYear: true } },
      order: { prazo: "ASC", id: "ASC" },
    });
  }

  async getById(id: number): Promise<Fee> {
    const fee = await this.fees.findOne({
      where: { id },
      relations: { semester: { academicYear: true } },
    });
    if (!fee) {
      throw new AppError("Emolumento não encontrado.", 404);
    }
    return fee;
  }

  async create(input: {
    semesterId: number;
    tipo: string;
    valor: string;
    prazo: string;
    obs: string;
  }): Promise<Fee> {
    await this.requireSemester(input.semesterId);
    const fee = this.fees.create({
      semesterId: input.semesterId,
      tipo: requiredText(input.tipo, "tipo"),
      valor: requiredText(input.valor, "valor"),
      prazo: parseIsoDate(input.prazo, "prazo"),
      obs: input.obs.trim(),
    });
    return this.fees.save(fee);
  }

  async update(
    id: number,
    input: { tipo: string; valor: string; prazo: string; obs: string },
  ): Promise<Fee> {
    const fee = await this.getById(id);
    fee.tipo = requiredText(input.tipo, "tipo");
    fee.valor = requiredText(input.valor, "valor");
    fee.prazo = parseIsoDate(input.prazo, "prazo");
    fee.obs = input.obs.trim();
    return this.fees.save(fee);
  }

  async remove(id: number): Promise<Fee> {
    const fee = await this.getById(id);
    await this.fees.remove(fee);
    return fee;
  }

  private async requireSemester(id: number): Promise<Semester> {
    const semester = await this.semesters.findOne({
      where: { id },
      relations: { academicYear: true },
    });
    if (!semester) {
      throw new AppError("Semestre não encontrado.", 404);
    }
    return semester;
  }
}
