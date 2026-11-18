import { describe, expect, it } from "vitest";
import { isAssignmentType, isImageMime } from "./assignment";

describe("assignment domain", () => {
  it("reconhece tipos válidos", () => {
    expect(isAssignmentType("trabalho")).toBe(true);
    expect(isAssignmentType("prova")).toBe(true);
    expect(isAssignmentType("projeto")).toBe(true);
    expect(isAssignmentType("outro")).toBe(false);
  });

  it("fotos têm preview; PDF não", () => {
    expect(isImageMime("image/png")).toBe(true);
    expect(isImageMime("image/jpeg")).toBe(true);
    expect(isImageMime("application/pdf")).toBe(false);
  });
});
