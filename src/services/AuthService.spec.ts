import bcrypt from "bcryptjs";
import { describe, expect, it, vi } from "vitest";
import { Repository } from "typeorm";
import { AppError } from "../errors/AppError";
import { User } from "../models/User";
import { AuthService, INVALID_CREDENTIALS } from "./AuthService";

function mockUsers(user: User | null): Repository<User> {
  return {
    findOne: vi.fn().mockResolvedValue(user),
  } as unknown as Repository<User>;
}

describe("AuthService", () => {
  it("autentica com utilizador e senha correctos", async () => {
    const user = {
      id: 1,
      username: "delegado",
      passwordHash: await bcrypt.hash("secreta", 4),
    } as User;
    const service = new AuthService(mockUsers(user));

    await expect(service.login("delegado", "secreta")).resolves.toMatchObject({
      id: 1,
      username: "delegado",
    });
  });

  it("falha com a mesma mensagem se o utilizador não existe ou a senha está errada", async () => {
    const user = {
      id: 1,
      username: "delegado",
      passwordHash: await bcrypt.hash("secreta", 4),
    } as User;

    const missing = new AuthService(mockUsers(null));
    const wrongPass = new AuthService(mockUsers(user));

    await expect(missing.login("outro", "secreta")).rejects.toMatchObject({
      message: INVALID_CREDENTIALS,
      statusCode: 401,
    });
    await expect(wrongPass.login("delegado", "errada")).rejects.toMatchObject({
      message: INVALID_CREDENTIALS,
      statusCode: 401,
    });
    await expect(wrongPass.login("", "")).rejects.toBeInstanceOf(AppError);
  });
});
