import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryItem, InventoryStatus } from "@/types";

export type InventoryInValues = Omit<InventoryItem, "id"> & { id?: string };

interface InventoryInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: InventoryInValues) => void;
  initialValue?: Partial<InventoryInValues>;
  title?: string;
  submitLabel?: string;
}

const STATUS_OPTIONS: InventoryStatus[] = ["재고", "예약됨", "출고대기", "출고완료", "폐기"];

const defaultValues: InventoryInValues = {
  partName: "",
  partType: "기타",
  status: "재고",
  quantity: 1,
  inboundDate: new Date().toISOString().slice(0, 10),
  vehicleId: undefined,
  vehicleNumber: "",
  grade: "",
  locationId: undefined,
  locationLabel: "",
  note: "",
};

export function InventoryInDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValue,
  title = "입고 등록",
  submitLabel = "저장",
}: InventoryInDialogProps) {
  const [values, setValues] = useState<InventoryInValues>(defaultValues);

  useEffect(() => {
    if (open) {
      setValues({ ...defaultValues, ...initialValue });
    }
  }, [open, initialValue]);

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inv-part" className="text-right">
              부품명
            </Label>
            <Input
              id="inv-part"
              value={values.partName}
              onChange={(e) => setValues((prev) => ({ ...prev, partName: e.target.value }))}
              className="col-span-3"
              placeholder="예: 촉매 컨버터"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">분류</Label>
            <Select
              value={values.partType}
              onValueChange={(val) => setValues((prev) => ({ ...prev, partType: val as InventoryInValues["partType"] }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="분류 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="엔진">엔진</SelectItem>
                <SelectItem value="촉매">촉매</SelectItem>
                <SelectItem value="기타">기타</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inv-vehicle" className="text-right">
              차량번호
            </Label>
            <Input
              id="inv-vehicle"
              value={values.vehicleNumber ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, vehicleNumber: e.target.value }))}
              className="col-span-3"
              placeholder="예: 12가 3456"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inv-grade" className="text-right">
              등급
            </Label>
            <Input
              id="inv-grade"
              value={values.grade ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, grade: e.target.value }))}
              className="col-span-3"
              placeholder="예: A+"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inv-location" className="text-right">
              로케이션
            </Label>
            <Input
              id="inv-location"
              value={values.locationLabel ?? ""}
              onChange={(e) => setValues((prev) => ({ ...prev, locationLabel: e.target.value }))}
              className="col-span-3"
              placeholder="예: A1-01"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">상태</Label>
            <Select
              value={values.status}
              onValueChange={(val) => setValues((prev) => ({ ...prev, status: val as InventoryStatus }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inv-qty" className="text-right">
              수량
            </Label>
            <Input
              id="inv-qty"
              type="number"
              min={1}
              value={values.quantity}
              onChange={(e) => setValues((prev) => ({ ...prev, quantity: Number(e.target.value || 0) }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="inv-inbound" className="text-right">
              입고일
            </Label>
            <Input
              id="inv-inbound"
              type="date"
              value={values.inboundDate}
              onChange={(e) => setValues((prev) => ({ ...prev, inboundDate: e.target.value }))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>{submitLabel}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
