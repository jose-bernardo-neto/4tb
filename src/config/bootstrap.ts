import { AppDataSource, databaseAdapter } from "./data-source";
import { ensureDirectories } from "./paths";
import { User } from "../models/User";
import { SeedService } from "../services/SeedService";

let boot: Promise<void> | null = null;

export function ensureReady(): Promise<void> {
  if (!boot) {
    boot = (async () => {
      ensureDirectories();
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize();
        await databaseAdapter.afterInitialize(AppDataSource);
        await AppDataSource.runMigrations();
        const seed = new SeedService(AppDataSource.getRepository(User));
        await seed.ensureDefaultAdmin();
      }
    })();
  }
  return boot;
}
