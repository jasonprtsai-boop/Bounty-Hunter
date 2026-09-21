import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type AdminEventMetricsChartProps = {
  data: Array<Record<string, number | string>>;
};

export function AdminEventMetricsChart({ data }: AdminEventMetricsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="title" tick={{ fontSize: 11 }} />
        <YAxis />
        <Tooltip />
        <Bar dataKey="views" fill="#D3A23A" name="瀏覽" />
        <Bar dataKey="registrations" fill="#B42318" name="報名" />
      </BarChart>
    </ResponsiveContainer>
  );
}
