import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calculatePrice } from "@/lib/calculator";
import { useData } from "@/contexts/DataProvider";
import { Vehicle } from "@/types";
import { Plus } from "lucide-react";

export function NewBidDialog() {
    const { addVehicle, pricingRules } = useData();
    const [open, setOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        vehicleNumber: "",
        vehicleModel: "",
        year: new Date().getFullYear().toString(),
        engineType: "2.0 가솔린", // Default
        catalystGrade: "B", // Default
    });

    const [calculatedPrice, setCalculatedPrice] = useState(0);

    // Auto-calculate price when relevant fields change
    useEffect(() => {
        const price = calculatePrice({
            vehicleModel: formData.vehicleModel,
            year: formData.year,
            engineType: formData.engineType,
            catalystGrade: formData.catalystGrade
        }, pricingRules);
        setCalculatedPrice(price);
    }, [formData.vehicleModel, formData.year, formData.engineType, formData.catalystGrade, pricingRules]);

    const handleSubmit = () => {
        const newVehicle: Vehicle = {
            id: Date.now().toString(), // Simple ID generation
            status: "입찰진행",
            vehicleNumber: formData.vehicleNumber,
            vehicleModel: formData.vehicleModel,
            year: formData.year,
            engineType: formData.engineType,
            catalystGrade: formData.catalystGrade,
            expectedPrice: calculatedPrice,
            stage: "견적완료",
            updatedAt: new Date().toISOString().split('T')[0],
            tasks: [],
            progress: 0
        };

        addVehicle(newVehicle);
        setOpen(false);
        // Reset form
        setFormData({
            vehicleNumber: "",
            vehicleModel: "",
            year: new Date().getFullYear().toString(),
            engineType: "2.0 가솔린",
            catalystGrade: "B",
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    신규 입찰 등록
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>신규 차량 입찰 등록</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="number" className="text-right">차량번호</Label>
                        <Input
                            id="number"
                            value={formData.vehicleNumber}
                            onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                            className="col-span-3"
                            placeholder="12가 3456"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="model" className="text-right">모델명</Label>
                        <Input
                            id="model"
                            value={formData.vehicleModel}
                            onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                            className="col-span-3"
                            placeholder="아반떼 CN7"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="year" className="text-right">연식</Label>
                        <Input
                            id="year"
                            type="number"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="engine" className="text-right">엔진</Label>
                        <Select
                            value={formData.engineType}
                            onValueChange={(val) => setFormData({ ...formData, engineType: val })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="엔진 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1.6 가솔린">1.6 가솔린</SelectItem>
                                <SelectItem value="2.0 가솔린">2.0 가솔린</SelectItem>
                                <SelectItem value="2.0 디젤">2.0 디젤</SelectItem>
                                <SelectItem value="3.0 가솔린">3.0 가솔린</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="catalyst" className="text-right">촉매</Label>
                        <Select
                            value={formData.catalystGrade}
                            onValueChange={(val) => setFormData({ ...formData, catalystGrade: val })}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="등급 선택" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A+">A+ (최상)</SelectItem>
                                <SelectItem value="A">A (상)</SelectItem>
                                <SelectItem value="B">B (중)</SelectItem>
                                <SelectItem value="C">C (하)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="bg-muted/50 p-4 rounded-lg mt-2">
                        <div className="flex justify-between items-center">
                            <span className="text-small font-medium">예상 매입가</span>
                            <span className="text-h2 text-primary">
                                ₩{calculatedPrice.toLocaleString()}
                            </span>
                        </div>
                        <p className="text-micro text-muted-foreground text-right mt-1">
                            * 기준 단가 및 가중치가 적용된 금액입니다
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSubmit}>등록하기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
