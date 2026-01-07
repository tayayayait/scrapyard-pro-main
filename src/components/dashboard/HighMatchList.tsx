import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, ChevronRight } from "lucide-react";

interface MatchItem {
  id: string;
  partName: string;
  vehicleInfo: string;
  matchScore: number;
  orderNumber: string;
  matchedAt: string;
}

interface HighMatchListProps {
  items: MatchItem[];
  onItemClick?: (id: string) => void;
}

export function HighMatchList({ items, onItemClick }: HighMatchListProps) {
  return (
    <div className="bg-card rounded-card shadow-card border border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-highlight" />
            <h3 className="text-h3">고가 매칭</h3>
          </div>
          <Badge variant="highlight">{items.length}</Badge>
        </div>
      </div>
      <div className="divide-y divide-border">
        {items.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-small">
            매칭된 고가 부품이 없습니다
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
                  <span className="font-medium truncate">{item.partName}</span>
                  <Badge variant="highlight" className="text-micro">
                    {item.matchScore}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-small text-muted-foreground">
                  <span className="truncate">{item.vehicleInfo}</span>
                  <span>·</span>
                  <span className="tabular-nums">{item.orderNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-micro whitespace-nowrap">{item.matchedAt}</span>
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
