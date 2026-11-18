import { Not, Repository } from "typeorm";
import { normalizeContact } from "../domain/contact";
import { parseCsv } from "../domain/csv";
import { requiredText } from "../domain/dates";
import { AppError } from "../errors/AppError";
import { Student } from "../models/Student";

export type CsvSkip = { line: number; reason: string };
export type CsvImportReport = {
  inserted: number;
  updated: number;
  skipped: CsvSkip[];
};

export class StudentService {
  constructor(private readonly students: Repository<Student>) {}

  list(): Promise<Student[]> {
    return this.students.find({ order: { name: "ASC" } });
  }

  async getById(id: number): Promise<Student> {
    const student = await this.students.findOne({ where: { id } });
    if (!student) {
      throw new AppError("Aluno não encontrado.", 404);
    }
    return student;
  }

  async findByContact(raw: string): Promise<Student | null> {
    const contact = normalizeContact(raw);
    if (!contact) {
      return null;
    }
    return this.students.findOne({ where: { contact } });
  }

  async create(input: { contact: string; np: string; name: string }): Promise<Student> {
    const contact = this.requireContact(input.contact);
    const np = requiredText(input.np, "NP");
    const name = requiredText(input.name, "nome");
    await this.assertUnique(contact, np);
    return this.students.save(this.students.create({ contact, np, name }));
  }

  async update(id: number, input: { contact: string; np: string; name: string }): Promise<Student> {
    const student = await this.getById(id);
    const contact = this.requireContact(input.contact);
    const np = requiredText(input.np, "NP");
    const name = requiredText(input.name, "nome");
    await this.assertUnique(contact, np, student.id);
    student.contact = contact;
    student.np = np;
    student.name = name;
    return this.students.save(student);
  }

  async remove(id: number): Promise<void> {
    const student = await this.getById(id);
    await this.students.remove(student);
  }

  async importCsv(content: string): Promise<CsvImportReport> {
    const rows = parseCsv(content);
    if (!rows.length) {
      throw new AppError("O CSV está vazio.", 400);
    }

    const header = rows[0].map((cell) => cell.trim().toLowerCase());
    const contactIdx = header.indexOf("contato");
    const npIdx = header.indexOf("np");
    const nameIdx = header.indexOf("nome");
    if (contactIdx < 0 || npIdx < 0 || nameIdx < 0) {
      throw new AppError("O CSV deve ter o cabeçalho contato,np,nome.", 400);
    }

    const report: CsvImportReport = { inserted: 0, updated: 0, skipped: [] };

    for (let i = 1; i < rows.length; i += 1) {
      const line = i + 1;
      const row = rows[i];
      const contact = normalizeContact(row[contactIdx] ?? "");
      const np = (row[npIdx] ?? "").trim();
      const name = (row[nameIdx] ?? "").trim();

      if (!contact) {
        report.skipped.push({ line, reason: "contacto inválido" });
        continue;
      }
      if (!np || !name) {
        report.skipped.push({ line, reason: "NP ou nome em falta" });
        continue;
      }

      const byContact = await this.students.findOne({ where: { contact } });
      const byNp = await this.students.findOne({ where: { np } });

      if (byNp && (!byContact || byNp.id !== byContact.id)) {
        report.skipped.push({ line, reason: `NP ${np} já pertence a outro contacto` });
        continue;
      }

      if (byContact) {
        byContact.np = np;
        byContact.name = name;
        await this.students.save(byContact);
        report.updated += 1;
        continue;
      }

      await this.students.save(this.students.create({ contact, np, name }));
      report.inserted += 1;
    }

    return report;
  }

  private requireContact(raw: string): string {
    const contact = normalizeContact(raw);
    if (!contact) {
      throw new AppError("Contacto inválido. Use um número angolano (com ou sem 244).", 400);
    }
    return contact;
  }

  private async assertUnique(contact: string, np: string, exceptId?: number): Promise<void> {
    const sameContact = await this.students.findOne({
      where: exceptId ? { contact, id: Not(exceptId) } : { contact },
    });
    if (sameContact) {
      throw new AppError("Já existe um aluno com esse contacto.", 400);
    }

    const sameNp = await this.students.findOne({
      where: exceptId ? { np, id: Not(exceptId) } : { np },
    });
    if (sameNp) {
      throw new AppError("Já existe um aluno com esse NP.", 400);
    }
  }
}
