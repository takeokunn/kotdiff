import type { DailyRowSummary } from "../../dashboard-data";
import { formatDiff, formatHM } from "../../lib";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

interface DailyTableProps {
  rows: DailyRowSummary[];
}

export function DailyTable({ rows }: DailyTableProps) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="p-6 pb-4">
        <h2 className="font-semibold leading-none tracking-tight">日別勤怠</h2>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>日付</TableHead>
            <TableHead>種別</TableHead>
            <TableHead className="text-right">実績</TableHead>
            <TableHead className="text-right">所定</TableHead>
            <TableHead className="text-right">差分</TableHead>
            <TableHead className="text-right">累積差分</TableHead>
            <TableHead className="text-right">残業</TableHead>
            <TableHead className="text-right">休憩</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.date} className={row.isWeekend ? "bg-gray-50 text-gray-400" : ""}>
              <TableCell className="font-medium">{row.date}</TableCell>
              <TableCell>{row.dayType}</TableCell>
              <TableCell className="text-right">
                {row.actual !== null ? formatHM(row.actual) : "-"}
              </TableCell>
              <TableCell className="text-right">
                {row.expected > 0 ? formatHM(row.expected) : "-"}
              </TableCell>
              <TableCell
                className={`text-right ${row.diff !== null ? (row.diff >= 0 ? "text-green-600" : "text-red-600") : ""}`}
              >
                {row.diff !== null ? formatDiff(row.diff) : "-"}
              </TableCell>
              <TableCell
                className={`text-right font-medium ${row.cumulativeDiff !== null ? (row.cumulativeDiff >= 0 ? "text-green-600" : "text-red-600") : ""}`}
              >
                {row.cumulativeDiff !== null ? formatDiff(row.cumulativeDiff) : "-"}
              </TableCell>
              <TableCell className="text-right">
                {row.overtime !== null ? formatHM(row.overtime) : "-"}
              </TableCell>
              <TableCell className="text-right">
                {row.breakTime !== null ? formatHM(row.breakTime) : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
