import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "./StatusBadge";
import { Clock, ChevronRight } from "lucide-react";

interface ApprovalItem {
  id: string;
  vehicleNumber: string;
  requestedBy: string;
  amount: string;
  status: string;
  createdAt: string;
}

interface ApprovalListProps {
  items: ApprovalItem[];
  onItemClick?: (id: string) => void;
}

export function ApprovalList({ items, onItemClick }: ApprovalListProps) {
  return (
    <div className="bg-card rounded-card shadow-card border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-h3">승인 대기</h3>
          <Badge variant="warning">{items.length}</Badge>
        </div>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-small">
            대기 중인 승인 요청이 없습니다
          </div>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">{item.vehicleNumber}</span>
                  <StatusBadge status={item.status} />
                </div>
                <div className="flex items-center gap-2 text-small text-muted-foreground">
                  <span>{item.requestedBy}</span>
                  <span>·</span>
                  <span className="tabular-nums">{item.amount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-micro whitespace-nowrap">{item.createdAt}</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          ))
        )}
      </div>
      {items.length > 0 && (
        <div className="p-3 border-t border-border">
          <Button variant="ghost" className="w-full text-small">
            전체 보기
          </Button>
        </div>
      )}
    </div>
  );
}
