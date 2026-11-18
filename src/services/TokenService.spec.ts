import { describe, expect, it } from "vitest";
import { AppError } from "../errors/AppError";
import { TokenService } from "./TokenService";

describe("TokenService", () => {
  const tokens = new TokenService();

  it("assina e valida um JWT", () => {
    const token = tokens.sign({ id: 7, username: "delegado" });
    expect(tokens.verify(token)).toEqual({ id: 7, username: "delegado" });
  });

  it("rejeita token inválido", () => {
    expect(() => tokens.verify("nao-e-jwt")).toThrow(AppError);
  });
});
