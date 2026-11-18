import "reflect-metadata";
import { createApp } from "./app";
import { ensureReady } from "./config/bootstrap";
import { env } from "./config/env";

async function bootstrap(): Promise<void> {
  await ensureReady();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`4TB a ouvir em http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
