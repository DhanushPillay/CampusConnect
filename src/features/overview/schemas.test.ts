import { describe, expect, it } from "vitest";
import * as actions from "./actions";

describe("overview", () => {
  it("exposes dashboard stat loaders", () => {
    expect(typeof actions.getAdminStats).toBe("function");
    expect(typeof actions.getTeacherDashboard).toBe("function");
    expect(typeof actions.getStudentDashboard).toBe("function");
  });
});
