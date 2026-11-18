import bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { AppError } from "../errors/AppError";
import { User } from "../models/User";

export const INVALID_CREDENTIALS = "Credenciais inválidas.";

export class AuthService {
  constructor(private readonly users: Repository<User>) {}

  async login(username: string, password: string): Promise<User> {
    const normalized = username.trim();

    if (!normalized || !password) {
      throw new AppError(INVALID_CREDENTIALS, 401);
    }

    const user = await this.users.findOne({ where: { username: normalized } });
    if (!user) {
      throw new AppError(INVALID_CREDENTIALS, 401);
    }

    const matches = await bcrypt.compare(password, user.passwordHash);
    if (!matches) {
      throw new AppError(INVALID_CREDENTIALS, 401);
    }

    return user;
  }
}
