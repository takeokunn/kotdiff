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
    startTime: null,
    endTime: null,
    breakStarts: [],
    breakEnds: [],
    schedule: null,
    ...overrides,
  };
}

function makeData(
  rows: DashboardRow[],
  leaveBalances: DashboardData["leaveBalances"] = [],
): DashboardData {
  return { rows, leaveBalances, generatedAt: "2026-03-16T00:00:00Z" };
}

describe("buildDashboardSummary", () => {
  test("空データ", () => {
    const summary = buildDashboardSummary(makeData([]));
    expect(summary.totalWorkDays).toBe(0);
    expect(summary.workedDays).toBe(0);
    expect(summary.remainingDays).toBe(0);
    expect(summary.totalActual).toBe(0);
    expect(summary.cumulativeDiff).toBe(0);
    expect(summary.dailyRows).toEqual([]);
  });

  test("確定済みの勤務日", () => {
    const summary = buildDashboardSummary(
      makeData([
        makeRow({ date: "03/01（月）", actual: 9, fixedWork: 8, overtime: 1, breakTime: 1 }),
        makeRow({ date: "03/02（火）", actual: 7.5, fixedWork: 8, overtime: 0, breakTime: 1 }),
      ]),
    );
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
    const summary = buildDashboardSummary(
      makeData([
        makeRow({ date: "03/01（土）", isWeekend: true, dayType: "所定休日" }),
        makeRow({ date: "03/02（日）", isWeekend: true, dayType: "法定休日" }),
      ]),
    );
    expect(summary.totalWorkDays).toBe(0);
    expect(summary.workedDays).toBe(0);
  });

  test("未来の勤務日は remainingDays にカウント", () => {
    const summary = buildDashboardSummary(
      makeData([
        makeRow({ date: "03/01（月）", actual: 8, fixedWork: 8 }),
        makeRow({ date: "03/02（火）" }),
        makeRow({ date: "03/03（水）" }),
      ]),
    );
    expect(summary.totalWorkDays).toBe(3);
    expect(summary.workedDays).toBe(1);
    expect(summary.remainingDays).toBe(2);
  });

  test("projectedTotal: 勤務済みの平均から着地を予測", () => {
    const rows = [];
    for (let i = 0; i < 5; i++) {
      rows.push(makeRow({ date: `03/0${i + 1}`, actual: 8.5, fixedWork: 8 }));
    }
    for (let i = 0; i < 10; i++) {
      rows.push(makeRow({ date: `03/${i + 6}` }));
    }
    const summary = buildDashboardSummary(makeData(rows));
    expect(summary.projectedTotal).toBeCloseTo(127.5);
  });

  test("projectedTotal: 0日勤務は0", () => {
    const summary = buildDashboardSummary(
      makeData([makeRow({ date: "03/01" }), makeRow({ date: "03/02" })]),
    );
    expect(summary.projectedTotal).toBe(0);
  });

  test("progressPercent: 実績/期待値の比率", () => {
    const rows = [];
    for (let i = 0; i < 5; i++) {
      rows.push(makeRow({ date: `03/0${i + 1}`, actual: 8.4, fixedWork: 8 }));
    }
    const summary = buildDashboardSummary(makeData(rows));
    expect(summary.progressPercent).toBeCloseTo(105);
  });

  test("progressPercent: 0日は0%", () => {
    const summary = buildDashboardSummary(makeData([]));
    expect(summary.progressPercent).toBe(0);
  });

  test("dailyRows に時刻フィールドがパススルーされる", () => {
    const summary = buildDashboardSummary(
      makeData([
        makeRow({
          date: "03/01",
          actual: 8,
          fixedWork: 8,
          startTime: "9:00",
          endTime: "18:00",
          breakStarts: ["12:00"],
          breakEnds: ["13:00"],
        }),
      ]),
    );
    expect(summary.dailyRows[0].startTime).toBe("9:00");
    expect(summary.dailyRows[0].endTime).toBe("18:00");
    expect(summary.dailyRows[0].breakStarts).toEqual(["12:00"]);
    expect(summary.dailyRows[0].breakEnds).toEqual(["13:00"]);
  });

  test("累積差分が正しく計算される", () => {
    const summary = buildDashboardSummary(
      makeData([
        makeRow({ date: "03/01", actual: 9, fixedWork: 8 }),
        makeRow({ date: "03/02", actual: 7, fixedWork: 8 }),
        makeRow({ date: "03/03", actual: 8.5, fixedWork: 8 }),
      ]),
    );
    expect(summary.dailyRows[0].cumulativeDiff).toBeCloseTo(1);
    expect(summary.dailyRows[1].cumulativeDiff).toBeCloseTo(0);
    expect(summary.dailyRows[2].cumulativeDiff).toBeCloseTo(0.5);
  });

  test("leaveBalances がパススルーされる", () => {
    const leaves = [
      { label: "有休", used: 2, remaining: 8 },
      { label: "代休", used: 1, remaining: 0 },
    ];
    const summary = buildDashboardSummary(makeData([], leaves));
    expect(summary.leaveBalances).toEqual(leaves);
  });

  test("schedule がパススルーされる", () => {
    const summary = buildDashboardSummary(
      makeData([
        makeRow({ date: "03/01", actual: 8, fixedWork: 8, schedule: "複数回休憩" }),
        makeRow({ date: "03/02", schedule: null }),
      ]),
    );
    expect(summary.dailyRows[0].schedule).toBe("複数回休憩");
    expect(summary.dailyRows[1].schedule).toBeNull();
  });
});
