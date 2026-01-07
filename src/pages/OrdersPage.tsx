import { useMemo, useState } from "react";
import { Search, Filter, Plus, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OrderFormDialog } from "@/components/forms";
import { useData } from "@/contexts/DataProvider";
import { createId } from "@/lib/ids";
import { ORDER_STATUS_TRANSITIONS, Order } from "@/types";

const statusBadgeMap: Record<string, "highlight" | "info" | "muted" | "success"> = {
  "매칭완료": "highlight",
  "부분매칭": "info",
  "대기중": "muted",
  "완료": "success",
};

export default function OrdersPage() {
  const { orders, addOrder, updateOrder } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const weekAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().slice(0, 10);
  }, []);

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter(
      (order) =>
        order.id.toLowerCase().includes(query) ||
        order.partName.toLowerCase().includes(query) ||
        order.requester.toLowerCase().includes(query)
    );
  }, [orders, searchQuery]);

  const stats = useMemo(() => {
    const total = orders.length;
    const waiting = orders.filter((o) => o.status === "대기중").length;
    const matched = orders.filter((o) => o.status === "매칭완료").length;
    const completedThisWeek = orders.filter(
      (o) => o.status === "완료" && o.createdAt >= weekAgo && o.createdAt <= today
    ).length;
    return { total, waiting, matched, completedThisWeek };
  }, [orders, today, weekAgo]);

  const handleCreateClick = () => {
    setSelectedOrder(null);
    setDialogOpen(true);
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const handleSubmit = (values: Partial<Order> & { id?: string }) => {
    const isEdit = !!values.id && orders.some((o) => o.id === values.id);
    if (isEdit && values.id) {
      const current = orders.find((o) => o.id === values.id);
      const nextStatus = (() => {
        if (!current || !values.status || values.status === current.status) return current?.status;
        const allowed = ORDER_STATUS_TRANSITIONS[current.status];
        return allowed.includes(values.status) ? values.status : current.status;
      })();

      updateOrder(values.id, {
        partName: values.partName ?? current?.partName ?? "",
        requester: values.requester ?? current?.requester ?? "",
        quantity: values.quantity ?? current?.quantity ?? 1,
        status: nextStatus ?? current?.status ?? "대기중",
        priority: (values.priority as Order["priority"]) ?? current?.priority ?? "normal",
        dueDate: values.dueDate ?? current?.dueDate ?? today,
      });
    } else {
      const newOrder: Order = {
        id: createId("ORD"),
        partName: values.partName ?? "미정",
        requester: values.requester ?? "미정",
        quantity: values.quantity ?? 1,
        status: (values.status as Order["status"]) ?? "대기중",
        matchedVehicles: values.matchedVehicles ?? [],
        priority: (values.priority as Order["priority"]) ?? "normal",
        createdAt: values.createdAt ?? today,
        dueDate: values.dueDate ?? today,
      };
      addOrder(newOrder);
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <OrderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        initialValue={selectedOrder ?? undefined}
        title={selectedOrder ? "오더 수정" : "신규 오더 등록"}
        submitLabel={selectedOrder ? "수정" : "등록"}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">오더 관리/매칭</h1>
          <p className="text-small text-muted-foreground mt-1">부품 주문과 재고 매칭을 관리합니다</p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          신규 오더 등록
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-card p-4 shadow-card border border-border">
          <p className="text-small text-muted-foreground">전체 오더</p>
          <p className="text-h2 mt-1">{stats.total}</p>
        </div>
        <div className="bg-card rounded-card p-4 shadow-card border border-border">
          <p className="text-small text-muted-foreground">매칭 대기</p>
          <p className="text-h2 mt-1 text-warning">{stats.waiting}</p>
        </div>
        <div className="bg-card rounded-card p-4 shadow-card border border-border">
          <p className="text-small text-muted-foreground">매칭 완료</p>
          <p className="text-h2 mt-1 text-success">{stats.matched}</p>
        </div>
        <div className="bg-card rounded-card p-4 shadow-card border border-border">
          <p className="text-small text-muted-foreground">이번 주 완료</p>
          <p className="text-h2 mt-1">{stats.completedThisWeek}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="오더번호, 부품명, 요청처 검색..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          필터
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            onClick={() => handleOrderClick(order)}
            className="bg-card rounded-card shadow-card border border-border p-5 hover:shadow-hover transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-small text-muted-foreground tabular-nums">{order.id}</span>
                  <Badge variant={statusBadgeMap[order.status]}>{order.status}</Badge>
                  {order.priority === "high" && <Badge variant="warning">긴급</Badge>}
                </div>
                <h3 className="text-h3">{order.partName}</h3>
                <p className="text-small text-muted-foreground mt-1">
                  요청처: {order.requester} · 수량: {order.quantity}개
                </p>
              </div>
              <div className="text-right">
                <p className="text-micro text-muted-foreground">납기일</p>
                <p className="text-small font-medium tabular-nums">{order.dueDate}</p>
              </div>
            </div>

            {order.matchedVehicles.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-small text-muted-foreground">매칭 차량:</span>
                <div className="flex flex-wrap gap-2">
                  {order.matchedVehicles.map((v, i) => (
                    <Badge key={i} variant="outline">
                      {v}
                    </Badge>
                  ))}
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
