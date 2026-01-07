import { useMemo } from "react";
import { Car, Wrench, Package, TrendingUp, Gavel, CheckCircle } from "lucide-react";
import { KpiCard, ApprovalList, HighMatchList, TrendChart } from "@/components/dashboard";
import { useData } from "@/contexts/DataProvider";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getLast7Days(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(toDateString(d));
  }
  return dates;
}

export default function Dashboard() {
  const { vehicles, orders, inventory, matchEvents, pricingRules } = useData();

  const today = useMemo(() => toDateString(new Date()), []);
  const last7Days = useMemo(() => getLast7Days(), []);

  const inboundCounts = useMemo(() => {
    return last7Days.map((date) => ({
      name: date.slice(5),
      value: inventory.filter((item) => item.inboundDate === date).reduce((sum, item) => sum + item.quantity, 0),
    }));
  }, [inventory, last7Days]);

  const revenueTrend = useMemo(() => {
    return last7Days.map((date) => {
      const dayRevenue = vehicles
        .filter((v) => v.status === "낙찰" && v.updatedAt === date)
        .reduce((sum, v) => sum + v.expectedPrice, 0);
      return { name: date.slice(5), value: Math.round(dayRevenue / 1_000_000) };
    });
  }, [vehicles, last7Days]);

  const totalStockToday = useMemo(
    () => inventory.filter((item) => item.inboundDate === today).reduce((sum, item) => sum + item.quantity, 0),
    [inventory, today]
  );
  const workingCount = useMemo(
    () => vehicles.filter((v) => v.status === "작업중").length,
    [vehicles]
  );
  const outboundPending = useMemo(
    () => inventory.filter((item) => item.status === "출고대기").length,
    [inventory]
  );

  const weeklyRevenue = useMemo(
    () =>
      vehicles
        .filter((v) => v.status === "낙찰" && last7Days.includes(v.updatedAt))
        .reduce((sum, v) => sum + v.expectedPrice, 0),
    [vehicles, last7Days]
  );

  const biddingCount = useMemo(
    () => vehicles.filter((v) => v.status === "입찰진행" || v.status === "승인대기").length,
    [vehicles]
  );

  const weeklyWinRate = useMemo(() => {
    const recent = vehicles.filter(
      (v) => (v.status === "낙찰" || v.status === "패찰") && last7Days.includes(v.updatedAt)
    );
    if (recent.length === 0) return 0;
    const wins = recent.filter((v) => v.status === "낙찰").length;
    return Math.round((wins / recent.length) * 100);
  }, [vehicles, last7Days]);

  const kpiData = [
    {
      title: "오늘 입고",
      value: `${totalStockToday}`,
      subtitle: "건",
      icon: <Car className="h-5 w-5" />,
      trend: { value: 0, label: "", direction: "neutral" as const },
    },
    {
      title: "진행 중 작업",
      value: `${workingCount}`,
      subtitle: "건",
      icon: <Wrench className="h-5 w-5" />,
      trend: { value: 0, label: "", direction: "neutral" as const },
    },
    {
      title: "금일 출고 예정",
      value: `${outboundPending}`,
      subtitle: "건",
      icon: <Package className="h-5 w-5" />,
      trend: { value: 0, label: "", direction: "neutral" as const },
    },
    {
      title: "이번 주 매출",
      value: `${formatCurrency(weeklyRevenue)}`,
      subtitle: "",
      icon: <TrendingUp className="h-5 w-5" />,
      trend: { value: 0, label: "", direction: "neutral" as const },
    },
    {
      title: "진행 중 입찰",
      value: `${biddingCount}`,
      subtitle: "건",
      icon: <Gavel className="h-5 w-5" />,
      trend: { value: 0, label: "", direction: "neutral" as const },
    },
    {
      title: "금주 낙찰률",
      value: `${weeklyWinRate}%`,
      subtitle: "",
      icon: <CheckCircle className="h-5 w-5" />,
      trend: { value: 0, label: "", direction: "neutral" as const },
    },
  ];

  const approvalItems = useMemo(
    () =>
      vehicles
        .filter((v) => v.status === "승인대기")
        .slice(0, 5)
        .map((v) => ({
          id: v.id,
          vehicleNumber: v.vehicleNumber,
          requestedBy: v.assignee ?? "-",
          amount: formatCurrency(v.expectedPrice),
          status: v.status,
          createdAt: v.updatedAt,
        })),
    [vehicles]
  );

  const highMatchItems = useMemo(() => {
    const items = matchEvents
      .map((event) => {
        const order = orders.find((o) => o.id === event.orderId);
        const vehicle = vehicles.find((v) => v.id === event.vehicleId);
        const catalystBoost = (() => {
          if (!vehicle?.catalystGrade) return 0;
          const rule = pricingRules.find(
            (r) =>
              r.category === "촉매등급" &&
              (r.name.startsWith(vehicle.catalystGrade) || r.code.includes(vehicle.catalystGrade.replace("+", "P")))
          );
          return rule ? 5 : 0;
        })();
        const base = order?.priority === "high" ? 85 : 70;
        const priceBoost = vehicle ? Math.min(15, Math.round(vehicle.expectedPrice / 500000)) : 0;
        const score = Math.min(99, base + priceBoost + catalystBoost);
        return {
          id: event.id,
          partName: order?.partName ?? "미지정",
          vehicleInfo: vehicle ? `${vehicle.vehicleModel} ${vehicle.year}` : "차량 정보 없음",
          matchScore: event.matchScore ?? score,
          orderNumber: order?.id ?? "-",
          matchedAt: event.matchedAt.slice(0, 10),
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return items.slice(0, 5);
  }, [matchEvents, orders, vehicles, pricingRules]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-h1">대시보드</h1>
        <p className="text-small text-muted-foreground mt-1">오늘의 현황을 한눈에 확인하세요</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiData.map((kpi, index) => (
          <KpiCard
            key={index}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Charts - Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <TrendChart title="주간 입고 추이" data={inboundCounts} type="area" />
          <TrendChart title="주간 매출 추이 (백만원)" data={revenueTrend} type="bar" />
        </div>

        {/* Lists - Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <ApprovalList items={approvalItems} onItemClick={() => undefined} />
          <HighMatchList items={highMatchItems} onItemClick={() => undefined} />
        </div>
      </div>
    </div>
  );
}
