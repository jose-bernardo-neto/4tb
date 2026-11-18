import "reflect-metadata";
import { AppDataSource } from "./config/data-source";
import { createApp } from "./app";
import { env } from "./config/env";
import { ensureDirectories } from "./config/paths";
import { User } from "./models/User";
import { SeedService } from "./services/SeedService";

async function bootstrap(): Promise<void> {
  ensureDirectories();

  await AppDataSource.initialize();
  await AppDataSource.query("PRAGMA journal_mode = WAL;");
  await AppDataSource.query("PRAGMA foreign_keys = ON;");
  await AppDataSource.runMigrations();

  const seedService = new SeedService(AppDataSource.getRepository(User));
  await seedService.ensureDefaultAdmin();

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`4TB a ouvir em http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
