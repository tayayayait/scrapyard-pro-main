import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface TrendChartProps {
  title: string;
  data: Array<{ name: string; value: number; [key: string]: any }>;
  type?: "area" | "bar";
  dataKey?: string;
  className?: string;
}

export function TrendChart({ 
  title, 
  data, 
  type = "area",
  dataKey = "value",
  className 
}: TrendChartProps) {
  return (
    <div className={`bg-card rounded-card shadow-card border border-border p-5 ${className}`}>
      <h3 className="text-h3 mb-4">{title}</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          {type === "area" ? (
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(212, 66%, 17%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(212, 66%, 17%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(218, 14%, 91%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(218, 11%, 46%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(218, 11%, 46%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(218, 14%, 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke="hsl(212, 66%, 17%)" 
                strokeWidth={2}
                fill="url(#colorValue)" 
              />
            </AreaChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(218, 14%, 91%)" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(218, 11%, 46%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="hsl(218, 11%, 46%)" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(218, 14%, 91%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar 
                dataKey={dataKey} 
                fill="hsl(212, 66%, 17%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
