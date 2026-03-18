import type { LeaveBalance } from "./domain/value-objects/LeaveBalance";
export type { LeaveBalance };

export interface DashboardRow {
  readonly date: string;
  readonly dayType: string;
  readonly isWeekend: boolean;
  readonly actual: number | null;
  readonly fixedWork: number | null;
  readonly overtime: number | null;
  readonly breakTime: number | null;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly breakStarts: readonly string[];
  readonly breakEnds: readonly string[];
  readonly schedule: string | null;
  readonly working: boolean;
  readonly nightOvertime: number | null;
}

export interface DashboardData {
  readonly rows: readonly DashboardRow[];
  readonly leaveBalances: readonly LeaveBalance[];
  readonly generatedAt: string;
}
