import { Clock, CalendarDays, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import type { DashboardSummary } from "../../dashboard-data";
import { DEFAULT_EXPECTED_HOURS, formatDiff, formatHM, OVERTIME_LIMIT } from "../../lib";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { SemicircleProgress } from "./SemicircleProgress";
import { Sparkline } from "./Sparkline";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const remainingRequired = summary.remainingDays * DEFAULT_EXPECTED_HOURS - summary.cumulativeDiff;

  // Recent trend: average diff of last 5 working days
  const recentDiffs = summary.dailyRows.filter((r) => r.diff !== null).slice(-5);
  const recentAvg =
    recentDiffs.length > 0
      ? recentDiffs.reduce((sum, r) => sum + r.diff!, 0) / recentDiffs.length
      : 0;

  // Sparkline data: all cumulative diff values
  const sparklineData = summary.dailyRows
    .filter((r) => r.cumulativeDiff !== null)
    .map((r) => r.cumulativeDiff!);

  const TrendIcon = recentAvg > 0.05 ? TrendingUp : recentAvg < -0.05 ? TrendingDown : Minus;
  const trendColor =
    recentAvg > 0.05 ? "text-green-600" : recentAvg < -0.05 ? "text-red-600" : "text-gray-500";
  const trendLabel = recentAvg > 0.05 ? "増加傾向" : recentAvg < -0.05 ? "減少傾向" : "横ばい";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">時間貯金</CardTitle>
          <Clock className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div
                className={`text-2xl font-bold ${summary.cumulativeDiff >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {formatDiff(summary.cumulativeDiff)}
              </div>
              <div className={`flex items-center gap-1 text-xs ${trendColor}`}>
                <TrendIcon className="h-3 w-3" />
                <span>
                  {trendLabel} ({formatDiff(recentAvg)}/日)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {summary.workedDays}日勤務済み / {summary.totalWorkDays}日
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <SemicircleProgress percent={summary.progressPercent} />
              {sparklineData.length >= 2 && <Sparkline data={sparklineData} />}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">残り日数</CardTitle>
          <CalendarDays className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{summary.remainingDays}日</div>
          <p className="text-xs text-gray-500">
            {remainingRequired > 0 ? `必要時間 ${formatHM(remainingRequired)}` : "目標クリア済み"}
          </p>
          {summary.projectedTotal > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              着地予想 {formatHM(summary.projectedTotal)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">1日あたり平均</CardTitle>
          <TrendingUp className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              {summary.workedDays > 0 ? formatHM(summary.avgWorkTime) : "-"}
            </span>
            {summary.workedDays > 0 && summary.avgWorkTime > DEFAULT_EXPECTED_HOURS && (
              <Badge variant="success">余裕あり</Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">
            {summary.remainingDays > 0 && remainingRequired > 0
              ? `目標達成には ${formatHM(remainingRequired / summary.remainingDays)}/日`
              : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">残業</CardTitle>
          <AlertTriangle className="h-4 w-4 text-gray-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatHM(summary.totalOvertime)}</div>
          <div className="mt-1">
            {summary.totalOvertime >= OVERTIME_LIMIT ? (
              <Badge variant="destructive">45時間超過</Badge>
            ) : summary.totalOvertime > OVERTIME_LIMIT * 0.8 ? (
              <Badge variant="warning">注意</Badge>
            ) : (
              <Badge variant="success">正常</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
