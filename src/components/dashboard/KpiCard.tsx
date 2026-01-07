import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label?: string;
    direction: "up" | "down" | "neutral";
  };
  icon?: React.ReactNode;
  className?: string;
}

export function KpiCard({ title, value, subtitle, trend, icon, className }: KpiCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    switch (trend.direction) {
      case "up":
        return <TrendingUp className="h-4 w-4" />;
      case "down":
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return "";
    switch (trend.direction) {
      case "up":
        return "text-success";
      case "down":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div
      className={cn(
        "bg-card rounded-card p-5 shadow-card border border-border transition-shadow hover:shadow-hover",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-small text-muted-foreground mb-1">{title}</p>
          <p className="text-h1 tabular-nums">{value}</p>
          {subtitle && (
            <p className="text-micro text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center text-accent-foreground">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className={cn("flex items-center gap-1 mt-3 text-small", getTrendColor())}>
          {getTrendIcon()}
          <span className="tabular-nums">{trend.value > 0 ? "+" : ""}{trend.value}%</span>
          {trend.label && <span className="text-muted-foreground ml-1">{trend.label}</span>}
        </div>
      )}
    </div>
  );
}
