export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        username: string;
      };
    }

    interface Locals {
      appName: string;
      currentPath?: string;
      isProd?: boolean;
      currentUser?: {
        id: number;
        username: string;
      };
      flash?: {
        type: "success" | "error";
        message: string;
      };
    }
  }
}
