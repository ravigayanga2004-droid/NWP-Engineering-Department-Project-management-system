import { describe, expect, it } from "vitest";
import { APP_ROLES, isAppRole } from "./roles";

describe("isAppRole", () => {
  it("accepts every defined role", () => {
    for (const role of APP_ROLES) expect(isAppRole(role)).toBe(true);
  });

  it("rejects unknown values", () => {
    expect(isAppRole("superuser")).toBe(false);
    expect(isAppRole("")).toBe(false);
    expect(isAppRole(undefined)).toBe(false);
  });
});
