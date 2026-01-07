import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "입고대기" | "작업중" | "완료" | "패찰" | "낙찰" | "승인대기" | "승인완료";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

const statusVariantMap: Record<StatusType, "muted" | "info" | "success" | "highlight" | "warning"> = {
  "입고대기": "muted",
  "작업중": "info",
  "완료": "success",
  "패찰": "muted",
  "낙찰": "highlight",
  "승인대기": "warning",
  "승인완료": "success",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusVariantMap[status as StatusType] || "muted";
  
  return (
    <Badge variant={variant} className={cn(className)}>
      {status}
    </Badge>
  );
}
