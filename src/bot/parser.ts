const SAD_EMOJIS = new Set(["😢", "😭"]);

export interface ParsedCommand {
  command: string;
  args: string;
}

export function parseCommand(text: string): ParsedCommand | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("/")) {
    return null;
  }

  const match = /^(\S+)(?:\s+([\s\S]*))?$/.exec(trimmed.slice(1));
  if (!match) {
    return null;
  }

  return { command: match[1].toLowerCase(), args: (match[2] ?? "").trim() };
}

export function endsWithSadEmoji(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) {
    return false;
  }
  const chars = Array.from(trimmed);
  return SAD_EMOJIS.has(chars[chars.length - 1]);
}
