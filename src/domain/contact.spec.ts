import { describe, expect, it } from "vitest";
import { normalizeContact } from "./contact";

describe("normalizeContact", () => {
  it("aceita vários formatos e grava dígitos com 244", () => {
    expect(normalizeContact("923123456")).toBe("244923123456");
    expect(normalizeContact("+244 923 123 456")).toBe("244923123456");
    expect(normalizeContact("00244923123456")).toBe("244923123456");
    expect(normalizeContact("0923123456")).toBe("244923123456");
    expect(normalizeContact("244923123456")).toBe("244923123456");
  });

  it("rejeita contactos ilegíveis", () => {
    expect(normalizeContact("")).toBeNull();
    expect(normalizeContact("123")).toBeNull();
    expect(normalizeContact("abc")).toBeNull();
  });
});
