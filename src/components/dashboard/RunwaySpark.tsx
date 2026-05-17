"use client";

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function RunwaySpark({
  data,
}: {
  data: { label: string; flow: number }[];
}) {
  return (
    <div className="glass-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Cash flow pulse
          </p>
          <h3 className="text-lg font-semibold">Last movements</h3>
        </div>
      </div>
      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height={224}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="fillFlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--popover))",
              }}
            />
            <Area
              type="monotone"
              dataKey="flow"
              stroke="hsl(var(--primary))"
              fill="url(#fillFlow)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
