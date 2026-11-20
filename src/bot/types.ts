import { PublicCatalogService } from "../services/PublicCatalogService";
import { StudentService } from "../services/StudentService";

export interface BotServices {
  catalog: PublicCatalogService;
  students: StudentService;
}

export type BotReply =
  | { kind: "text"; text: string }
  | { kind: "ptt"; filePath: string }
  | { kind: "image"; filePath: string; caption?: string }
  | { kind: "document"; filePath: string; caption?: string };

export interface BotCommandInput {
  command: string;
  args: string;
  senderContact: string;
}

export interface IBotCommand {
  readonly name: string;
  matches(command: string): boolean;
  execute(services: BotServices, input: BotCommandInput): Promise<BotReply>;
}
