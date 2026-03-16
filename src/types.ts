export interface DashboardRow {
  date: string;
  dayType: string;
  isWeekend: boolean;
  actual: number | null;
  fixedWork: number | null;
  overtime: number | null;
  breakTime: number | null;
}

export interface DashboardData {
  rows: DashboardRow[];
  generatedAt: string;
}
