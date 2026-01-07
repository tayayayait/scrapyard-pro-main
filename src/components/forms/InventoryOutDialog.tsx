import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InventoryItem } from "@/types";

interface InventoryOutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: InventoryItem | null;
  onSubmit: (payload: { id: string; outboundDate: string }) => void;
  title?: string;
  submitLabel?: string;
}

export function InventoryOutDialog({
  open,
  onOpenChange,
  item,
  onSubmit,
  title = "출고 처리",
  submitLabel = "출고 완료",
}: InventoryOutDialogProps) {
  const [outboundDate, setOutboundDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (open) {
      setOutboundDate(new Date().toISOString().slice(0, 10));
    }
  }, [open]);

  const handleSubmit = () => {
    if (!item) return;
    onSubmit({ id: item.id, outboundDate });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="text-small text-muted-foreground">
            선택된 부품: <span className="text-foreground font-medium">{item?.partName ?? "-"}</span>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="outbound-date" className="text-right">
              출고일
            </Label>
            <Input
              id="outbound-date"
              type="date"
              value={outboundDate}
              onChange={(e) => setOutboundDate(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={!item}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
