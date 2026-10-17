import { lazy, Suspense, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import {
  type FinancialMovement,
  type KPIMetrics,
  type MonthlyDataPoint,
} from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);
const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
let financialDataRequest: Promise<FinancialMovement[]> | null = null;

function fetchFinancialData(): Promise<FinancialMovement[]> {
  if (!financialDataRequest) {
    financialDataRequest = fetch(`${API_BASE_URL}/api/metrics`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch financial data: ${response.status}`);
        }
        return response.json();
      })
      .catch((error: unknown) => {
        financialDataRequest = null;
        throw error;
      });
  }

  return financialDataRequest;
}

function ChartLoadingFallback() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-4 xl:grid-cols-2"
    >
      {[0, 1].map((chart) => (
        <Card key={chart} className="border-border/60">
          <CardHeader className="pb-4">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="mt-1 h-3 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[280px] w-full rounded-lg" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function App() {
  const [metrics, setMetrics] = useState<KPIMetrics | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFinancialData()
      .then((movements) => {
        setMetrics(computeKPIs(movements));
        setMonthlyData(computeMonthlyData(movements));
      })
      .catch(() => {
        setError("Could not load financial data. Check the backend API.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main
      aria-busy={loading}
      className="dark min-h-screen bg-background text-foreground"
    >
      <p className="sr-only" role="status">
        {loading ? "Loading financial metrics." : error ? "" : "Financial metrics loaded."}
      </p>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <section aria-label="Key performance indicators">
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-label="Financial charts"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <Suspense fallback={<ChartLoadingFallback />}>
              <IncomeOutcomeChart data={monthlyData} loading={loading} />
              <ProfitPercentChart data={monthlyData} loading={loading} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
