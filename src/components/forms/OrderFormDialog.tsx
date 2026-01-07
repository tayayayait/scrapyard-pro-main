import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order, OrderStatus } from "@/types";

export type OrderFormValues = Omit<Order, "id" | "matchedVehicles" | "createdAt"> & {
  id?: string;
  matchedVehicles?: string[];
  createdAt?: string;
};

interface OrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: OrderFormValues) => void;
  initialValue?: Partial<OrderFormValues>;
  title?: string;
  submitLabel?: string;
}

const STATUS_OPTIONS: OrderStatus[] = ["대기중", "부분매칭", "매칭완료", "완료"];

const defaultValues: OrderFormValues = {
  partName: "",
  requester: "",
  quantity: 1,
  status: "대기중",
  matchedVehicles: [],
  priority: "normal",
  createdAt: new Date().toISOString().slice(0, 10),
  dueDate: new Date().toISOString().slice(0, 10),
};

export function OrderFormDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValue,
  title = "오더 등록",
  submitLabel = "저장",
}: OrderFormDialogProps) {
  const [values, setValues] = useState<OrderFormValues>(defaultValues);

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
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order-part" className="text-right">
              부품명
            </Label>
            <Input
              id="order-part"
              value={values.partName}
              onChange={(e) => setValues((prev) => ({ ...prev, partName: e.target.value }))}
              className="col-span-3"
              placeholder="예: 촉매 컨버터"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order-requester" className="text-right">
              요청처
            </Label>
            <Input
              id="order-requester"
              value={values.requester}
              onChange={(e) => setValues((prev) => ({ ...prev, requester: e.target.value }))}
              className="col-span-3"
              placeholder="예: A부품상사"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order-quantity" className="text-right">
              수량
            </Label>
            <Input
              id="order-quantity"
              type="number"
              min={1}
              value={values.quantity}
              onChange={(e) => setValues((prev) => ({ ...prev, quantity: Number(e.target.value || 0) }))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">상태</Label>
            <Select
              value={values.status}
              onValueChange={(val) => setValues((prev) => ({ ...prev, status: val as OrderStatus }))}
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
            <Label className="text-right">우선순위</Label>
            <Select
              value={values.priority}
              onValueChange={(val) => setValues((prev) => ({ ...prev, priority: val as "normal" | "high" }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="우선순위 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">일반</SelectItem>
                <SelectItem value="high">긴급</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="order-duedate" className="text-right">
              납기일
            </Label>
            <Input
              id="order-duedate"
              type="date"
              value={values.dueDate}
              onChange={(e) => setValues((prev) => ({ ...prev, dueDate: e.target.value }))}
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
