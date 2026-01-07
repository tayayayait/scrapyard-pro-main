import { useEffect, useMemo, useState } from "react";
import { Search, Filter, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NewBidDialog } from "@/components/dashboard/NewBidDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from "@/contexts/DataProvider";
import { createId } from "@/lib/ids";
import { BidStage, Vehicle, VehicleStatus } from "@/types";

const statusColorMap: Record<string, "muted" | "info" | "success" | "highlight" | "warning"> = {
  입찰진행: "info",
  승인대기: "warning",
  낙찰: "success",
  패찰: "muted",
  작업중: "highlight",
  대기: "muted",
  완료: "success",
};

const STATUS_OPTIONS: Array<VehicleStatus | "all"> = ["all", "입찰진행", "승인대기", "낙찰", "패찰", "작업중", "대기", "완료"];
const STAGE_OPTIONS: Array<BidStage | "all"> = ["all", "견적완료", "승인요청", "낙찰확정", "입찰종료", "견적산정"];

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  return `${value.toLocaleString()}`;
}

export default function BiddingPage() {
  const { vehicles, updateVehicle, appendAuditLog, currentUser } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<VehicleStatus | "all">("all");
  const [stageFilter, setStageFilter] = useState<BidStage | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, stageFilter]);

  const filteredData = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return vehicles.filter((item) => {
      const matchesQuery =
        item.vehicleNumber.toLowerCase().includes(query) ||
        item.vehicleModel.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesStage = stageFilter === "all" || item.stage === stageFilter;
      return matchesQuery && matchesStatus && matchesStage;
    });
  }, [vehicles, searchQuery, statusFilter, stageFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pagedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  const applyAction = (item: Vehicle, status: VehicleStatus, stage: BidStage, action: string) => {
    updateVehicle(item.id, {
      status,
      stage,
      updatedAt: today,
    });
    appendAuditLog({
      id: createId("AUD"),
      actorId: currentUser.id,
      actorName: currentUser.name,
      action,
      entityType: "vehicle",
      entityId: item.id,
      timestamp: new Date().toISOString(),
      metadata: { prevStatus: item.status, nextStatus: status, prevStage: item.stage, nextStage: stage },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">입찰/견적</h1>
          <p className="text-small text-muted-foreground mt-1">차량 입찰 및 가치 산정을 관리합니다.</p>
        </div>
        <NewBidDialog />
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="차량번호, 모델명을 검색하세요.."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={() => setShowFilters((prev) => !prev)}>
            <Filter className="h-4 w-4 mr-2" />
            필터
          </Button>
        </div>
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as VehicleStatus | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "all" ? "전체 상태" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={stageFilter} onValueChange={(val) => setStageFilter(val as BidStage | "all")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="단계 선택" />
              </SelectTrigger>
              <SelectContent>
                {STAGE_OPTIONS.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage === "all" ? "전체 단계" : stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">상태</th>
                <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">차량번호</th>
                <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">엔진</th>
                <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">촉매 등급</th>
                <th className="px-4 py-3 text-right text-small font-medium text-muted-foreground">예상 가격</th>
                <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">단계</th>
                <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">업데이트</th>
                <th className="px-4 py-3 text-center text-small font-medium text-muted-foreground">액션</th>
              </tr>
            </thead>
            <tbody>
              {pagedData.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Badge variant={statusColorMap[item.status] || "muted"}>{item.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium">{item.vehicleNumber}</div>
                      <div className="text-small text-muted-foreground">
                        {item.vehicleModel} ({item.year})
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-small">{item.engineType}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{item.catalystGrade}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {formatCurrency(item.expectedPrice)}
                  </td>
                  <td className="px-4 py-3 text-small">{item.stage}</td>
                  <td className="px-4 py-3 text-small text-muted-foreground tabular-nums">{item.updatedAt}</td>
                  <td className="px-4 py-3 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          disabled={item.status === "승인대기" || item.status === "낙찰" || item.status === "패찰"}
                          onClick={() => applyAction(item, "승인대기", "승인요청", "승인요청")}
                        >
                          승인요청
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={item.status !== "승인대기"}
                          onClick={() => applyAction(item, "입찰진행", "견적완료", "승인처리")}
                        >
                          승인처리
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={item.status === "낙찰"}
                          onClick={() => applyAction(item, "낙찰", "낙찰확정", "낙찰확정")}
                        >
                          낙찰 확정
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={item.status === "패찰"}
                          onClick={() => applyAction(item, "패찰", "입찰종료", "패찰확정")}
                        >
                          패찰 확정
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={item.status !== "낙찰"}
                          onClick={() => applyAction(item, "대기", "입찰종료", "입고대기 전환")}
                        >
                          입고대기 전환
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {pagedData.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground text-small">
                    조건에 맞는 데이터가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-small text-muted-foreground">총 {filteredData.length}건</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              이전
            </Button>
            <span className="text-small text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              다음
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
