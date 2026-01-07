import { useMemo, useState } from "react";
import { Search, Filter, MapPin, Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { InventoryInDialog, InventoryOutDialog } from "@/components/forms";
import { useData } from "@/contexts/DataProvider";
import { createId } from "@/lib/ids";
import { InventoryItem, InventoryStatus, Location } from "@/types";

const statusBadgeMap: Record<InventoryStatus, "muted" | "info" | "warning" | "success"> = {
  "재고": "success",
  "예약됨": "info",
  "출고대기": "warning",
  "출고완료": "muted",
  "폐기": "muted",
};

function getLocationStatus(capacity: number, currentQty: number): Location["status"] {
  if (capacity <= 0) return "empty";
  if (currentQty <= 0) return "empty";
  if (currentQty >= capacity) return "full";
  return "partial";
}

export default function InventoryPage() {
  const { inventory, locations, addInventoryItem, checkoutInventoryItem } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [inDialogOpen, setInDialogOpen] = useState(false);
  const [outDialogOpen, setOutDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const getLocationColor = (status: string) => {
    switch (status) {
      case "full":
        return "bg-success/20 border-success text-success";
      case "partial":
        return "bg-info/20 border-info text-info";
      case "empty":
        return "bg-muted border-border text-muted-foreground";
      default:
        return "bg-muted border-border";
    }
  };

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const filteredInventory = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return inventory;
    return inventory.filter((item) => {
      return (
        item.partName.toLowerCase().includes(query) ||
        (item.vehicleNumber ?? "").toLowerCase().includes(query) ||
        (item.locationLabel ?? "").toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    });
  }, [inventory, searchQuery]);

  const locationCounts = useMemo(() => {
    return inventory.reduce<Record<string, number>>((acc, item) => {
      const key = item.locationId ?? item.locationLabel ?? "";
      if (!key) return acc;
      acc[key] = (acc[key] ?? 0) + (item.quantity || 0);
      return acc;
    }, {});
  }, [inventory]);

  const derivedLocations = useMemo(() => {
    return locations.map((loc) => {
      const count = locationCounts[loc.id] ?? locationCounts[loc.label] ?? 0;
      return {
        ...loc,
        currentQty: count,
        status: getLocationStatus(loc.capacity, count),
      };
    });
  }, [locations, locationCounts]);

  const selectedLocationLabel = useMemo(() => {
    if (!selectedLocation) return null;
    const found = derivedLocations.find((loc) => loc.id === selectedLocation);
    return found?.label ?? null;
  }, [derivedLocations, selectedLocation]);

  const locationItems = useMemo(() => {
    if (!selectedLocation) return [];
    const location = derivedLocations.find((loc) => loc.id === selectedLocation);
    if (!location) return [];
    return inventory.filter(
      (item) => item.locationId === location.id || item.locationLabel === location.label
    );
  }, [derivedLocations, inventory, selectedLocation]);

  const totalStock = useMemo(
    () => inventory.reduce((sum, item) => sum + (item.quantity || 0), 0),
    [inventory]
  );
  const todayInbound = useMemo(
    () =>
      inventory
        .filter((item) => item.inboundDate === today)
        .reduce((sum, item) => sum + (item.quantity || 0), 0),
    [inventory, today]
  );
  const todayOutbound = useMemo(
    () =>
      inventory
        .filter((item) => item.outboundDate === today)
        .reduce((sum, item) => sum + (item.quantity || 0), 0),
    [inventory, today]
  );
  const outboundPending = useMemo(
    () =>
      inventory.filter((item) => item.status === "출고대기").reduce((sum, item) => sum + (item.quantity || 0), 0),
    [inventory]
  );

  const handleInventoryIn = (values: Omit<InventoryItem, "id"> & { id?: string }) => {
    const location = derivedLocations.find(
      (loc) => loc.label === values.locationLabel || loc.id === values.locationId
    );
    addInventoryItem({
      ...values,
      id: values.id ?? createId("INV"),
      locationId: values.locationId ?? location?.id,
      locationLabel: values.locationLabel || location?.label,
      inboundDate: values.inboundDate || today,
      quantity: values.quantity > 0 ? values.quantity : 1,
    });
    setInDialogOpen(false);
  };

  const handleInventoryOut = ({ id, outboundDate }: { id: string; outboundDate: string }) => {
    checkoutInventoryItem(id, outboundDate);
    setOutDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <InventoryInDialog open={inDialogOpen} onOpenChange={setInDialogOpen} onSubmit={handleInventoryIn} />
      <InventoryOutDialog
        open={outDialogOpen}
        onOpenChange={setOutDialogOpen}
        item={selectedItem}
        onSubmit={handleInventoryOut}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">입출고/재고</h1>
          <p className="text-small text-muted-foreground mt-1">재고 현황과 입출고를 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setInDialogOpen(true)}>
            <ArrowUpDown className="h-4 w-4 mr-2" />
            입고 등록
          </Button>
          <Button onClick={() => setOutDialogOpen(true)} disabled={!selectedItem}>
            <Plus className="h-4 w-4 mr-2" />
            출고 처리
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card rounded-card p-4 shadow-card border border-border">
          <p className="text-small text-muted-foreground">전체 재고</p>
          <p className="text-h2 mt-1">{totalStock}</p>
        </div>
        <div className="bg-card rounded-card p-4 shadow-card border border-border">
          <p className="text-small text-muted-foreground">오늘 입고</p>
          <p className="text-h2 mt-1 text-success">{todayInbound}</p>
        </div>
        <div className="bg-card rounded-card p-4 shadow-card border border-border">
          <p className="text-small text-muted-foreground">오늘 출고</p>
          <p className="text-h2 mt-1 text-info">{todayOutbound}</p>
        </div>
        <div className="bg-card rounded-card p-4 shadow-card border border-border">
          <p className="text-small text-muted-foreground">출고 대기</p>
          <p className="text-h2 mt-1 text-warning">{outboundPending}</p>
        </div>
      </div>

      <Tabs defaultValue="location" className="space-y-4">
        <TabsList>
          <TabsTrigger value="location">로케이션 뷰</TabsTrigger>
          <TabsTrigger value="list">재고 목록</TabsTrigger>
        </TabsList>

        <TabsContent value="location" className="space-y-4">
          {/* Location Grid */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-8">
              <div className="bg-card rounded-card shadow-card border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-h3">로케이션 맵</h3>
                  <div className="flex items-center gap-4 text-micro">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-success/20 border border-success" />
                      <span>가득</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-info/20 border border-info" />
                      <span>부분</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-muted border border-border" />
                      <span>빈칸</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {derivedLocations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={cn(
                        "p-4 rounded-lg border-2 transition-all text-center",
                        getLocationColor(loc.status),
                        selectedLocation === loc.id && "ring-2 ring-ring ring-offset-2"
                      )}
                    >
                      <div className="font-medium">{loc.label}</div>
                      <div className="text-micro mt-1">{loc.currentQty}개</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Location Detail */}
            <div className="col-span-4">
              <div className="bg-card rounded-card shadow-card border border-border p-5">
                <h3 className="text-h3 mb-4">{selectedLocationLabel ? `${selectedLocationLabel} 상세` : "로케이션 선택"}</h3>
                {selectedLocationLabel ? (
                  <div className="space-y-3">
                    {locationItems.length === 0 ? (
                      <p className="text-muted-foreground text-small">선택된 로케이션에 재고가 없습니다.</p>
                    ) : (
                      locationItems.slice(0, 5).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            "p-3 bg-muted/50 rounded-lg w-full text-left hover:bg-muted transition-colors",
                            selectedItem?.id === item.id && "ring-2 ring-ring ring-offset-2"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-small">{item.partName}</span>
                            <Badge variant={statusBadgeMap[item.status]}>{item.status}</Badge>
                          </div>
                          <p className="text-micro text-muted-foreground">{item.vehicleNumber ?? "-"}</p>
                        </button>
                      ))
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-small">
                    로케이션을 선택하면 해당 위치의 재고를 확인할 수 있습니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="부품명, 차량번호 검색..."
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

          {/* Table */}
          <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">부품명</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">차량번호</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">로케이션</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">상태</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">등급</th>
                  <th className="px-4 py-3 text-right text-small font-medium text-muted-foreground">수량</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">입고일</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={cn(
                      "border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer",
                      selectedItem?.id === item.id && "bg-muted/40"
                    )}
                  >
                    <td className="px-4 py-3 font-medium">{item.partName}</td>
                    <td className="px-4 py-3 text-small">{item.vehicleNumber ?? "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-small">{item.locationLabel ?? "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusBadgeMap[item.status]}>{item.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{item.grade ?? "-"}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{item.quantity}</td>
                    <td className="px-4 py-3 text-small text-muted-foreground tabular-nums">{item.inboundDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
