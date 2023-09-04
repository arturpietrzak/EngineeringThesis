import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendingChartProps {
  chartData: {
    name: string;
    uv: number;
  }[];
}

export function TrendingChart({ chartData }: TrendingChartProps) {
  return (
    <ResponsiveContainer width={"100%"} height={300}>
      <AreaChart
        data={chartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 40 }}
      >
        <defs>
          <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#339AF0" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#339AF0" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <XAxis dataKey="name" angle={-45} offset={50} textAnchor="end" />
        <YAxis allowDecimals={false} />
        <CartesianGrid opacity={0.3} />
        <Area
          type="monotone"
          dataKey="uv"
          stroke="#339AF0"
          fillOpacity={1}
          fill="url(#colorUv)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
