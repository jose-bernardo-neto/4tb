import { describe, expect, it } from "vitest";
import { durationToMs } from "./auth";

describe("durationToMs", () => {
  it("converte horas e usa 8h como fallback", () => {
    expect(durationToMs("8h")).toBe(8 * 60 * 60 * 1000);
    expect(durationToMs("30m")).toBe(30 * 60 * 1000);
    expect(durationToMs("invalido")).toBe(8 * 60 * 60 * 1000);
  });
});
