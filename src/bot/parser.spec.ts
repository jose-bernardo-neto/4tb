import { describe, expect, it } from "vitest";
import { endsWithSadEmoji, parseCommand } from "./parser";

describe("parseCommand", () => {
  it("extrai comando simples", () => {
    expect(parseCommand("/professores")).toEqual({ command: "professores", args: "" });
  });

  it("normaliza maiúsculas e espaços", () => {
    expect(parseCommand("  /PROFESSORES  ")).toEqual({ command: "professores", args: "" });
  });

  it("extrai argumentos", () => {
    expect(parseCommand("/comunicados amanhã reunião")).toEqual({
      command: "comunicados",
      args: "amanhã reunião",
    });
  });

  it("preserva o sufixo do comando tarefas-<sigla>", () => {
    expect(parseCommand("/tarefas-AM")).toEqual({ command: "tarefas-am", args: "" });
  });

  it("ignora texto que não começa por /", () => {
    expect(parseCommand("olá pessoal")).toBeNull();
    expect(parseCommand("")).toBeNull();
    expect(parseCommand("   ")).toBeNull();
  });

  it("ignora / sem comando", () => {
    expect(parseCommand("/")).toBeNull();
    expect(parseCommand("/   ")).toBeNull();
  });
});

describe("endsWithSadEmoji", () => {
  it("detecta emoji triste no fim", () => {
    expect(endsWithSadEmoji("que tristeza 😢")).toBe(true);
    expect(endsWithSadEmoji("😭")).toBe(true);
    expect(endsWithSadEmoji("não aguento mais 😢😭")).toBe(true);
  });

  it("tolera espaços no fim", () => {
    expect(endsWithSadEmoji("que tristeza 😢  ")).toBe(true);
  });

  it("não detecta emoji no meio ou início", () => {
    expect(endsWithSadEmoji("😢 estou triste")).toBe(false);
    expect(endsWithSadEmoji("estou 😢 triste")).toBe(false);
  });

  it("ignora outros emojis e texto vazio", () => {
    expect(endsWithSadEmoji("boa 😀")).toBe(false);
    expect(endsWithSadEmoji("")).toBe(false);
    expect(endsWithSadEmoji("   ")).toBe(false);
  });
});
