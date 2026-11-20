import fs from "node:fs";
import qrcode from "qrcode-terminal";
import { Client, LocalAuth, Message, MessageMedia } from "whatsapp-web.js";
import { AppDataSource } from "../config/data-source";
import { resolveFromRoot } from "../config/paths";
import { AcademicYear } from "../models/AcademicYear";
import { Announcement } from "../models/Announcement";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";
import { Fee } from "../models/Fee";
import { Semester } from "../models/Semester";
import { Student } from "../models/Student";
import { Timetable } from "../models/Timetable";
import { PublicCatalogService } from "../services/PublicCatalogService";
import { StudentService } from "../services/StudentService";
import { MessageHandler } from "./handler";
import { BotReply } from "./types";
import { env } from "../config/env";

function createHandler(): MessageHandler {
  const catalog = new PublicCatalogService(
    AppDataSource.getRepository(Semester),
    AppDataSource.getRepository(Discipline),
    AppDataSource.getRepository(Assignment),
    AppDataSource.getRepository(AssignmentAttachment),
    AppDataSource.getRepository(Announcement),
    AppDataSource.getRepository(Fee),
    AppDataSource.getRepository(AcademicYear),
    AppDataSource.getRepository(Timetable),
  );
  const students = new StudentService(AppDataSource.getRepository(Student));
  return new MessageHandler({ catalog, students });
}

async function sendReply(message: Message, reply: BotReply): Promise<void> {
  if (reply.kind === "text") {
    await message.reply(reply.text);
    return;
  }

  if (!fs.existsSync(reply.filePath)) {
    console.warn(`Bot: ficheiro em falta (${reply.filePath}); resposta ignorada.`);
    return;
  }

  const media = MessageMedia.fromFilePath(reply.filePath);
  if (reply.kind === "ptt") {
    await message.reply(media, undefined, { sendAudioAsVoice: true });
    return;
  }
  await message.reply(media, undefined, {
    caption: reply.caption,
    sendMediaAsDocument: reply.kind === "document",
  });
}

async function handleMessage(handler: MessageHandler, message: Message): Promise<void> {
  try {
    if (message.fromMe || !message.from.endsWith("@g.us")) {
      return;
    }
    const reply = await handler.handle({
      text: message.body ?? "",
      senderContact: message.author ?? message.from,
    });
    if (reply) {
      await sendReply(message, reply);
    }
  } catch (err) {
    console.error("Bot: erro ao processar mensagem:", err);
  }
}

export async function startBot(): Promise<void> {
  const handler = createHandler();
  const client = new Client({
    authStrategy: new LocalAuth({ dataPath: resolveFromRoot("./data/wwebjs_auth") }),
    puppeteer: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
  });

  client.on("qr", (qr) => {
    console.log("Bot: faz scan do QR no WhatsApp (Aparelhos ligados → Ligar um aparelho).");
    qrcode.generate(qr, { small: true });
  });
  client.on("ready", () => {
    const num = env.BOT_NUMBER ? ` (${env.BOT_NUMBER})` : "";
    console.log(`Bot WhatsApp ligado.${num}`);
  });
  client.on("auth_failure", (reason) => console.error("Bot: falha de autenticação:", reason));
  client.on("disconnected", (reason) => console.warn("Bot desligado:", reason));
  client.on("message", (message) => {
    void handleMessage(handler, message);
  });

  await client.initialize();
}
