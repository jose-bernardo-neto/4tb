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

  if (env.BOT_ENABLED) {
    const { startBot } = await import("./bot/client");
    startBot().catch((err) => console.error("Bot WhatsApp falhou:", err));
  }
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
