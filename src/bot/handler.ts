import { resolveFromRoot } from "../config/paths";
import { AppError } from "../errors/AppError";
import { createCommands } from "./commands";
import { Cooldown } from "./cooldown";
import { endsWithSadEmoji, parseCommand } from "./parser";
import { BotReply, BotServices, IBotCommand } from "./types";

export interface IncomingMessage {
  text: string;
  senderContact: string;
}

export interface MessageHandlerOptions {
  faahPath?: string;
  cooldownMs?: number;
  now?: () => number;
  commands?: IBotCommand[];
}

export class MessageHandler {
  private readonly commands: IBotCommand[];
  private readonly cooldown: Cooldown;
  private readonly faahPath: string;

  constructor(
    private readonly services: BotServices,
    options: MessageHandlerOptions = {},
  ) {
    this.commands = options.commands ?? createCommands();
    this.cooldown = new Cooldown(options.cooldownMs, options.now);
    this.faahPath = options.faahPath ?? resolveFromRoot("./src/public/assets/faah.mp3");
  }

  async handle(message: IncomingMessage): Promise<BotReply | null> {
    if (!this.cooldown.allow(message.senderContact)) {
      return null;
    }

    if (endsWithSadEmoji(message.text)) {
      return { kind: "ptt", filePath: this.faahPath };
    }

    const parsed = parseCommand(message.text);
    if (!parsed) {
      return null;
    }

    const command = this.commands.find((candidate) => candidate.matches(parsed.command));
    if (!command) {
      return null;
    }

    try {
      return await command.execute(this.services, {
        command: parsed.command,
        args: parsed.args,
        senderContact: message.senderContact,
      });
    } catch (err) {
      if (err instanceof AppError) {
        return { kind: "text", text: err.message };
      }
      throw err;
    }
  }
}
