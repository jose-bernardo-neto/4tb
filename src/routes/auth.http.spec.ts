import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { AppDataSource } from "../config/data-source";
import { env } from "../config/env";
import { User } from "../models/User";
import { SeedService } from "../services/SeedService";

describe("auth http", () => {
  const app = createApp();

  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    await AppDataSource.runMigrations();
    await new SeedService(AppDataSource.getRepository(User)).ensureDefaultAdmin();
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  it("protege o painel sem cookie", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  it("permite a área do estudante sem autenticação", async () => {
    const res = await request(app).get("/turma");
    expect(res.status).toBe(200);
    expect(res.text).toContain("Área do estudante");
  });

  it("rejeita credenciais inválidas sem revelar o campo", async () => {
    const res = await request(app).post("/login").type("form").send({
      username: "delegado",
      password: "errada",
    });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
    expect(res.headers["set-cookie"]?.join(";") ?? "").not.toContain(`${env.COOKIE_NAME}=`);
  });

  it("inicia sessão e permite o dashboard", async () => {
    const login = await request(app).post("/login").type("form").send({
      username: env.DEFAULT_ADMIN_USER,
      password: env.DEFAULT_ADMIN_PASS,
    });

    expect(login.status).toBe(302);
    expect(login.headers.location).toBe("/");

    const cookies = login.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies!.join(";")).toContain(env.COOKIE_NAME);
    expect(cookies!.join(";").toLowerCase()).toContain("httponly");

    const dashboard = await request(app).get("/").set("Cookie", cookies!);
    expect(dashboard.status).toBe(200);
    expect(dashboard.text).toContain("Início");
  });
});
