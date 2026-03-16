import { describe, expect, test } from "vitest";
import { buildDashboardSummary } from "./dashboard-data";
import type { DashboardData, DashboardRow } from "./types";

function makeRow(overrides: Partial<DashboardRow> = {}): DashboardRow {
  return {
    date: "01/01（月）",
    dayType: "平日",
    isWeekend: false,
    actual: null,
    fixedWork: null,
    overtime: null,
    breakTime: null,
    ...overrides,
  };
}

describe("buildDashboardSummary", () => {
  test("空データ", () => {
    const data: DashboardData = { rows: [], generatedAt: "2026-03-16T00:00:00Z" };
    const summary = buildDashboardSummary(data);
    expect(summary.totalWorkDays).toBe(0);
    expect(summary.workedDays).toBe(0);
    expect(summary.remainingDays).toBe(0);
    expect(summary.totalActual).toBe(0);
    expect(summary.cumulativeDiff).toBe(0);
    expect(summary.dailyRows).toEqual([]);
  });

  test("確定済みの勤務日", () => {
    const data: DashboardData = {
      rows: [
        makeRow({ date: "03/01（月）", actual: 9, fixedWork: 8, overtime: 1, breakTime: 1 }),
        makeRow({ date: "03/02（火）", actual: 7.5, fixedWork: 8, overtime: 0, breakTime: 1 }),
      ],
      generatedAt: "2026-03-16T00:00:00Z",
    };
    const summary = buildDashboardSummary(data);
    expect(summary.totalWorkDays).toBe(2);
    expect(summary.workedDays).toBe(2);
    expect(summary.remainingDays).toBe(0);
    expect(summary.totalActual).toBeCloseTo(16.5);
    expect(summary.cumulativeDiff).toBeCloseTo(0.5);
    expect(summary.totalOvertime).toBe(1);
    expect(summary.avgWorkTime).toBeCloseTo(8.25);

    expect(summary.dailyRows[0].diff).toBeCloseTo(1);
    expect(summary.dailyRows[0].cumulativeDiff).toBeCloseTo(1);
    expect(summary.dailyRows[1].diff).toBeCloseTo(-0.5);
    expect(summary.dailyRows[1].cumulativeDiff).toBeCloseTo(0.5);
  });

  test("週末は勤務日に含めない", () => {
    const data: DashboardData = {
      rows: [
        makeRow({ date: "03/01（土）", isWeekend: true, dayType: "所定休日" }),
        makeRow({ date: "03/02（日）", isWeekend: true, dayType: "法定休日" }),
      ],
      generatedAt: "2026-03-16T00:00:00Z",
    };
    const summary = buildDashboardSummary(data);
    expect(summary.totalWorkDays).toBe(0);
    expect(summary.workedDays).toBe(0);
  });

  test("未来の勤務日は remainingDays にカウント", () => {
    const data: DashboardData = {
      rows: [
        makeRow({ date: "03/01（月）", actual: 8, fixedWork: 8 }),
        makeRow({ date: "03/02（火）" }),
        makeRow({ date: "03/03（水）" }),
      ],
      generatedAt: "2026-03-16T00:00:00Z",
    };
    const summary = buildDashboardSummary(data);
    expect(summary.totalWorkDays).toBe(3);
    expect(summary.workedDays).toBe(1);
    expect(summary.remainingDays).toBe(2);
  });

  test("累積差分が正しく計算される", () => {
    const data: DashboardData = {
      rows: [
        makeRow({ date: "03/01", actual: 9, fixedWork: 8 }),
        makeRow({ date: "03/02", actual: 7, fixedWork: 8 }),
        makeRow({ date: "03/03", actual: 8.5, fixedWork: 8 }),
      ],
      generatedAt: "2026-03-16T00:00:00Z",
    };
    const summary = buildDashboardSummary(data);
    // +1, -1, +0.5 → cumulative: 1, 0, 0.5
    expect(summary.dailyRows[0].cumulativeDiff).toBeCloseTo(1);
    expect(summary.dailyRows[1].cumulativeDiff).toBeCloseTo(0);
    expect(summary.dailyRows[2].cumulativeDiff).toBeCloseTo(0.5);
  });
});
