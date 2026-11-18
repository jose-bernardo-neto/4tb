import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { env } from "../config/env";
import { User } from "../models/User";
import { SeedService } from "../services/SeedService";
import { AppDataSource } from "../config/data-source";
import { clearAcademicData, setupTestDb, teardownTestDb } from "../test/db";

function firstGroup(html: string, pattern: RegExp, label: string): string {
  const match = html.match(pattern);
  if (!match?.[1]) {
    throw new Error(`Não encontrou ${label}`);
  }
  return match[1];
}

describe("painel e2e", () => {
  const app = createApp();
  const agent = request.agent(app);

  beforeAll(async () => {
    await setupTestDb();
    await new SeedService(AppDataSource.getRepository(User)).ensureDefaultAdmin();
    await clearAcademicData();
  });

  afterAll(async () => {
    await teardownTestDb();
  });

  it("percorre o fluxo crítico do delegado", async () => {
    const login = await agent.post("/login").type("form").send({
      username: env.DEFAULT_ADMIN_USER,
      password: env.DEFAULT_ADMIN_PASS,
    });
    expect(login.status).toBe(302);
    expect(login.headers.location).toBe("/");

    const year = await agent.post("/anos-letivos").type("form").send({ label: "2025/2026" });
    expect(year.status).toBe(302);
    const yearUrl = year.headers.location as string;
    expect(yearUrl).toMatch(/^\/anos-letivos\/\d+$/);

    const yearPage = await agent.get(yearUrl);
    expect(yearPage.status).toBe(200);
    const semesterId = firstGroup(yearPage.text, /\/semestres\/(\d+)\/cadeiras/, "semestre");

    const professor = await agent.post("/professores").type("form").send({
      name: "Ana Silva",
      academicDegree: "Mestre",
      contact: "ana@faculdade.ao",
    });
    expect(professor.status).toBe(302);

    const professorsPage = await agent.get("/professores");
    const professorId = firstGroup(professorsPage.text, /\/professores\/(\d+)/, "professor");

    for (const cadeira of [
      { name: "Análise Matemática", acronym: "AM" },
      { name: "Álgebra Linear", acronym: "AL" },
      { name: "Técnicas de Comunicação", acronym: "TCE" },
    ]) {
      const created = await agent.post(`/semestres/${semesterId}/cadeiras`).type("form").send({
        ...cadeira,
        professorId,
      });
      expect(created.status).toBe(302);
    }

    const activate = await agent.post(`/semestres/${semesterId}/ativar`);
    expect(activate.status).toBe(302);

    const yearAfter = await agent.get(yearUrl);
    expect(yearAfter.text).toContain("activo");

    const cadeirasPage = await agent.get(`/semestres/${semesterId}/cadeiras`);
    const disciplineId = firstGroup(cadeirasPage.text, /\/cadeiras\/(\d+)/, "cadeira");

    const tarefa = await agent.post(`/semestres/${semesterId}/tarefas`).type("form").send({
      disciplineId,
      title: "Lista 1",
      description: "Exercícios",
      type: "trabalho",
      dueDate: "2026-03-10",
    });
    expect(tarefa.status).toBe(302);

    const comunicado = await agent.post(`/semestres/${semesterId}/comunicados`).type("form").send({
      title: "Aviso <script>alert(1)</script>",
      body: "Corpo do comunicado",
      date: "2026-03-01",
    });
    expect(comunicado.status).toBe(302);

    const emolumento = await agent.post(`/semestres/${semesterId}/emolumentos`).type("form").send({
      tipo: "Propina",
      valor: "15000",
      prazo: "2026-03-15",
      obs: "1.ª prestação",
    });
    expect(emolumento.status).toBe(302);

    const csv = "contato,np,nome\n923111222,2026001,Maria Neto\ninvalido,x,Sem Numero\n";
    const imported = await agent
      .post("/alunos/importar")
      .attach("file", Buffer.from(csv), { filename: "alunos.csv", contentType: "text/csv" });
    expect(imported.status).toBe(200);
    expect(imported.text).toContain("Inseridos: 1");
    expect(imported.text).toContain("Maria Neto");

    const aluno = await agent.post("/alunos").type("form").send({
      name: "Paulo Silva",
      np: "2026002",
      contact: "+244 923 333 444",
    });
    expect(aluno.status).toBe(302);

    const alunos = await agent.get("/alunos");
    expect(alunos.text).toContain("Paulo Silva");
    expect(alunos.text).toContain("244923333444");

    const turma = await request(app).get("/turma/comunicados");
    expect(turma.status).toBe(200);
    expect(turma.text).toContain("Aviso");
    expect(turma.text).not.toContain("<script>alert(1)</script>");
    expect(turma.text).toContain("&lt;script&gt;");
  });
});
