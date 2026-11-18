import { Repository } from "typeorm";
import { parseIsoDate, requiredText } from "../domain/dates";
import { AppError } from "../errors/AppError";
import { Announcement } from "../models/Announcement";
import { Semester } from "../models/Semester";

export class AnnouncementService {
  constructor(
    private readonly announcements: Repository<Announcement>,
    private readonly semesters: Repository<Semester>,
  ) {}

  async listBySemester(semesterId: number): Promise<Announcement[]> {
    await this.requireSemester(semesterId);
    return this.announcements.find({
      where: { semesterId },
      relations: { semester: { academicYear: true } },
      order: { date: "DESC", id: "DESC" },
    });
  }

  async getById(id: number): Promise<Announcement> {
    const announcement = await this.announcements.findOne({
      where: { id },
      relations: { semester: { academicYear: true } },
    });
    if (!announcement) {
      throw new AppError("Comunicado não encontrado.", 404);
    }
    return announcement;
  }

  async create(input: { semesterId: number; title: string; body: string; date: string }): Promise<Announcement> {
    await this.requireSemester(input.semesterId);
    const announcement = this.announcements.create({
      semesterId: input.semesterId,
      title: requiredText(input.title, "título"),
      body: requiredText(input.body, "corpo"),
      date: parseIsoDate(input.date),
    });
    return this.announcements.save(announcement);
  }

  async update(id: number, input: { title: string; body: string; date: string }): Promise<Announcement> {
    const announcement = await this.getById(id);
    announcement.title = requiredText(input.title, "título");
    announcement.body = requiredText(input.body, "corpo");
    announcement.date = parseIsoDate(input.date);
    return this.announcements.save(announcement);
  }

  async remove(id: number): Promise<Announcement> {
    const announcement = await this.getById(id);
    await this.announcements.remove(announcement);
    return announcement;
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
