import { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { ensureAuthenticated } from "./auth";

function mockRes() {
  const res = {
    redirect: vi.fn(),
  };
  return res as unknown as Response;
}

describe("ensureAuthenticated", () => {
  it("redirecciona ao login quando não há sessão", () => {
    const req = {} as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    ensureAuthenticated(req, res, next);

    expect(res.redirect).toHaveBeenCalledWith("/login");
    expect(next).not.toHaveBeenCalled();
  });

  it("deixa passar a área pública do estudante", () => {
    const req = { path: "/turma/professores" } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    ensureAuthenticated(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });

  it("segue em frente quando há utilizador na request", () => {
    const req = { user: { id: 1, username: "delegado" } } as Request;
    const res = mockRes();
    const next = vi.fn() as unknown as NextFunction;

    ensureAuthenticated(req, res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledOnce();
  });
});
