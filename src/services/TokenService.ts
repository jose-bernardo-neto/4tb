import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "../errors/AppError";

export type AuthPayload = {
  id: number;
  username: string;
};

type JwtPayload = {
  sub: string;
  username: string;
};

export class TokenService {
  sign(user: AuthPayload): string {
    const payload: JwtPayload = {
      sub: String(user.id),
      username: user.username,
    };
    const options: SignOptions = {
      expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    };

    return jwt.sign(payload, env.JWT_SECRET as Secret, options);
  }

  verify(token: string): AuthPayload {
    try {
      const payload = jwt.verify(token, env.JWT_SECRET as Secret) as JwtPayload;
      const id = Number(payload.sub);

      if (!Number.isInteger(id) || !payload.username) {
        throw new AppError("Sessão inválida.", 401);
      }

      return { id, username: payload.username };
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError("Sessão inválida.", 401);
    }
  }
}
