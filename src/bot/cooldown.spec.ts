import { describe, expect, it } from "vitest";
import { Cooldown } from "./cooldown";

describe("Cooldown", () => {
  it("bloqueia o mesmo utilizador dentro da janela e liberta depois", () => {
    let clock = 0;
    const cooldown = new Cooldown(2000, () => clock);

    expect(cooldown.allow("244923000001")).toBe(true);
    clock = 1999;
    expect(cooldown.allow("244923000001")).toBe(false);
    clock = 2000;
    expect(cooldown.allow("244923000001")).toBe(true);
  });

  it("não mistura utilizadores diferentes", () => {
    let clock = 0;
    const cooldown = new Cooldown(2000, () => clock);

    expect(cooldown.allow("244923000001")).toBe(true);
    expect(cooldown.allow("244923000002")).toBe(true);
    clock = 500;
    expect(cooldown.allow("244923000001")).toBe(false);
    expect(cooldown.allow("244923000002")).toBe(false);
  });

  it("uma tentativa bloqueada não reinicia a janela", () => {
    let clock = 0;
    const cooldown = new Cooldown(2000, () => clock);

    expect(cooldown.allow("a")).toBe(true);
    clock = 1500;
    expect(cooldown.allow("a")).toBe(false);
    clock = 2000;
    expect(cooldown.allow("a")).toBe(true);
  });
});
