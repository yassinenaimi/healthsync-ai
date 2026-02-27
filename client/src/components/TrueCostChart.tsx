/*
 * TrueCostChart — Interactive Recharts line graph for 12-month cost projections
 * Design: "Ethereal Care" — dark theme charts with cyan/amber gradients
 */

import { useMemo } from "react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart, ReferenceLine,
} from "recharts";
import type { BrowsePlan } from "@/lib/api";
import type { TrueCostEvent } from "@/hooks/useInsuranceEngine";

interface TrueCostChartProps {
  plans: BrowsePlan[];
  events: TrueCostEvent[];
  calculateTrueCost: (plan: BrowsePlan, events: TrueCostEvent[]) => Array<{
    month: number;
    monthLabel: string;
    premium: number;
    outOfPocket: number;
    total: number;
    cumulative: number;
  }>;
}

const planColors = ["#06B6D4", "#3B82F6", "#F59E0B", "#10B981", "#8B5CF6"];

export default function TrueCostChart({ plans, events, calculateTrueCost }: TrueCostChartProps) {
  const chartData = useMemo(() => {
    if (plans.length === 0) return [];

    const allData = plans.map((plan) => calculateTrueCost(plan, events));

    return Array.from({ length: 12 }, (_, i) => {
      const point: Record<string, string | number> = {
        month: allData[0][i].monthLabel,
      };
      plans.forEach((plan, idx) => {
        point[`${plan.provider} - ${plan.plan_name}`] = allData[idx][i].cumulative;
      });
      return point;
    });
  }, [plans, events, calculateTrueCost]);

  const eventMonths = useMemo(() => {
    return events.map((e) => ({
      month: new Date(2025, e.month - 1).toLocaleString("en-CA", { month: "short" }),
      description: e.description,
      amount: e.amount,
    }));
  }, [events]);

  if (plans.length === 0) {
    return (
      <div className="glass-panel p-8 text-center">
        <p className="text-slate-400 text-sm">Select plans to see cost projections</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 sm:p-6">
      <h3 className="font-heading text-lg font-semibold text-white mb-4">12-Month Cost Projection</h3>
      <div className="w-full h-[300px] sm:h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              {plans.map((_, idx) => (
                <linearGradient key={idx} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={planColors[idx % planColors.length]} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={planColors[idx % planColors.length]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}
              axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(15,23,42,0.9)",
                border: "1px solid rgba(6,182,212,0.2)",
                borderRadius: "12px",
                backdropFilter: "blur(20px)",
                padding: "12px",
              }}
              labelStyle={{ color: "#E2E8F0", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}
              itemStyle={{ color: "#CBD5E1", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", fontFamily: "'Inter', sans-serif" }}
              iconType="circle"
              iconSize={8}
            />
            {eventMonths.map((e, i) => (
              <ReferenceLine
                key={i}
                x={e.month}
                stroke="#F59E0B"
                strokeDasharray="4 4"
                strokeOpacity={0.5}
                label={{
                  value: `$${e.amount}`,
                  position: "top",
                  fill: "#F59E0B",
                  fontSize: 10,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              />
            ))}
            {plans.map((plan, idx) => (
              <Area
                key={plan.id}
                type="monotone"
                dataKey={`${plan.provider} - ${plan.plan_name}`}
                stroke={planColors[idx % planColors.length]}
                strokeWidth={2}
                fill={`url(#gradient-${idx})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, fill: "#0F172A" }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Event markers legend */}
      {events.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {events.map((e) => (
            <div key={e.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-[10px] text-amber-300">
                Month {e.month}: {e.description} (${e.amount.toLocaleString()})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
