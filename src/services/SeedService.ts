import bcrypt from "bcryptjs";
import { Repository } from "typeorm";
import { env } from "../config/env";
import { User } from "../models/User";

export class SeedService {
  constructor(private readonly users: Repository<User>) {}

  async ensureDefaultAdmin(): Promise<User> {
    const existing = await this.users.findOne({
      where: { username: env.DEFAULT_ADMIN_USER },
    });

    if (existing) {
      return existing;
    }

    const user = this.users.create({
      username: env.DEFAULT_ADMIN_USER,
      passwordHash: await bcrypt.hash(env.DEFAULT_ADMIN_PASS, 10),
    });

    return this.users.save(user);
  }
}
