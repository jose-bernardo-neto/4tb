import "reflect-metadata";
import { AppDataSource, databaseAdapter } from "../config/data-source";
import { ensureDirectories } from "../config/paths";
import { User } from "../models/User";
import { SeedService } from "../services/SeedService";

async function seed(): Promise<void> {
  ensureDirectories();

  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  await databaseAdapter.afterInitialize(AppDataSource);
  await AppDataSource.runMigrations();

  const service = new SeedService(AppDataSource.getRepository(User));
  const admin = await service.ensureDefaultAdmin();

  console.log(`Conta padrão pronta: ${admin.username}`);
  await AppDataSource.destroy();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
