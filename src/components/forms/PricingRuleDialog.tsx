import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PricingRule } from "@/types";

export type PricingRuleValues = PricingRule;

interface PricingRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PricingRuleValues) => void;
  initialValue?: Partial<PricingRuleValues>;
  title?: string;
  submitLabel?: string;
}

const defaultValues: PricingRuleValues = {
  id: "",
  category: "",
  name: "",
  code: "",
  status: "active",
  basePrice: 0,
};

export function PricingRuleDialog({
  open,
  onOpenChange,
  onSubmit,
  initialValue,
  title = "기준단가 등록",
  submitLabel = "저장",
}: PricingRuleDialogProps) {
  const [values, setValues] = useState<PricingRuleValues>(defaultValues);

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
            <Label htmlFor="rule-category" className="text-right">
              분류
            </Label>
            <Input
              id="rule-category"
              value={values.category}
              onChange={(e) => setValues((prev) => ({ ...prev, category: e.target.value }))}
              className="col-span-3"
              placeholder="예: 촉매등급"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rule-name" className="text-right">
              항목명
            </Label>
            <Input
              id="rule-name"
              value={values.name}
              onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              className="col-span-3"
              placeholder="예: A+ (최상)"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rule-code" className="text-right">
              코드
            </Label>
            <Input
              id="rule-code"
              value={values.code}
              onChange={(e) => setValues((prev) => ({ ...prev, code: e.target.value }))}
              className="col-span-3"
              placeholder="예: GRADE_AP"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">상태</Label>
            <Select
              value={values.status}
              onValueChange={(val) => setValues((prev) => ({ ...prev, status: val as PricingRule["status"] }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="상태 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">활성</SelectItem>
                <SelectItem value="inactive">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rule-price" className="text-right">
              기준단가
            </Label>
            <Input
              id="rule-price"
              type="number"
              min={0}
              value={values.basePrice ?? 0}
              onChange={(e) => setValues((prev) => ({ ...prev, basePrice: Number(e.target.value || 0) }))}
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
