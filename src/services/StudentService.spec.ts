import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AppDataSource } from "../config/data-source";
import { Student } from "../models/Student";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";
import { StudentService } from "./StudentService";

describe("StudentService", () => {
  let students: StudentService;

  beforeAll(async () => {
    await setupTestDb();
    students = new StudentService(AppDataSource.getRepository(Student));
  });

  beforeEach(async () => {
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("cria, actualiza e resolve pelo contacto normalizado", async () => {
    const created = await students.create({
      name: "Maria Neto",
      np: "2026001",
      contact: "923111222",
    });
    expect(created.contact).toBe("244923111222");

    const found = await students.findByContact("+244 923 111 222");
    expect(found?.np).toBe("2026001");

    await students.update(created.id, {
      name: "Maria N.",
      np: "2026001",
      contact: "244923111222",
    });
    expect((await students.getById(created.id)).name).toBe("Maria N.");
  });

  it("importa CSV saltando linhas inválidas e actualiza pelo contacto", async () => {
    const csv = [
      "contato,np,nome",
      "923111222,2026001,Maria Neto",
      "invalido,2026002,Sem Numero",
      ",2026003,Sem Contacto",
      "+244 923 111 222,2026001,Maria Actualizada",
      "923333444,2026004,Paulo Silva",
    ].join("\n");

    const first = await students.importCsv(csv);
    expect(first.inserted).toBe(2);
    expect(first.updated).toBe(1);
    expect(first.skipped).toHaveLength(2);

    const maria = await students.findByContact("923111222");
    expect(maria?.name).toBe("Maria Actualizada");
    expect(await students.list()).toHaveLength(2);
  });
});
