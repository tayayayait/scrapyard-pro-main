import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useData } from "@/contexts/DataProvider";
import { InventoryItem, Task } from "@/types";
import { findMatchesForVehicle } from "@/lib/matcher";
import { toast } from "sonner";
import { createId } from "@/lib/ids";

interface TaskDialogProps {
    vehicleId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DEFAULT_TASKS: Task[] = [
    { id: "t1", name: "외관 검사", completed: false },
    { id: "t2", name: "엔진룸 점검", completed: false },
    { id: "t3", name: "부품 분류", completed: false },
    { id: "t4", name: "사진 촬영", completed: false },
    { id: "t5", name: "최종 확인", completed: false },
];

interface PartInputs {
    engineName: string;
    engineGrade: string;
    catalystName: string;
    catalystGrade: string;
}

export function TaskDialog({ vehicleId, open, onOpenChange }: TaskDialogProps) {
    const { vehicles, updateVehicle, orders, addInventoryItem, appendMatchEvent, appendMatchedVehicle } = useData();
    const vehicle = vehicles.find((v) => v.id === vehicleId);

    const [tasks, setTasks] = useState<Task[]>([]);
    const [inventorySubmitted, setInventorySubmitted] = useState(false);
    const [parts, setParts] = useState<PartInputs>({
        engineName: "엔진 어셈블리",
        engineGrade: "",
        catalystName: "촉매 컨버터",
        catalystGrade: "",
    });

    useEffect(() => {
        if (vehicle) {
            if (!vehicle.tasks || vehicle.tasks.length === 0) {
                setTasks(DEFAULT_TASKS);
            } else {
                setTasks(vehicle.tasks);
            }
            setInventorySubmitted(false);
        }
    }, [vehicle, open]);

    if (!vehicle) return null;

    const completedCount = tasks.filter((t) => t.completed).length;
    const progress = Math.round((completedCount / tasks.length) * 100);

    const handleTaskToggle = (taskId: string) => {
        const newTasks = tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        setTasks(newTasks);

        const newCompletedCount = newTasks.filter((t) => t.completed).length;
        const newProgress = Math.round((newCompletedCount / newTasks.length) * 100);

        let newStatus = vehicle.status;
        if (newProgress === 100) newStatus = "완료";
        else if (newProgress > 0) newStatus = "작업중";

        updateVehicle(vehicle.id, {
            tasks: newTasks,
            progress: newProgress,
            status: newStatus,
        });
    };

    const handleInventorySubmit = () => {
        if (inventorySubmitted) return;
        const today = new Date().toISOString().slice(0, 10);

        const items: InventoryItem[] = [];
        if (parts.engineName.trim()) {
            items.push({
                id: createId("INV"),
                partName: parts.engineName.trim(),
                partType: "엔진",
                vehicleId: vehicle.id,
                vehicleNumber: vehicle.vehicleNumber,
                grade: parts.engineGrade.trim() || undefined,
                status: "재고",
                quantity: 1,
                inboundDate: today,
            });
        }
        if (parts.catalystName.trim()) {
            items.push({
                id: createId("INV"),
                partName: parts.catalystName.trim(),
                partType: "촉매",
                vehicleId: vehicle.id,
                vehicleNumber: vehicle.vehicleNumber,
                grade: parts.catalystGrade.trim() || undefined,
                status: "재고",
                quantity: 1,
                inboundDate: today,
            });
        }

        items.forEach((item) => addInventoryItem(item));
        setInventorySubmitted(true);

        const matches = findMatchesForVehicle(vehicle, orders);
        if (matches.length > 0) {
            matches.forEach((m) => {
                appendMatchEvent({
                    id: createId("MATCH"),
                    orderId: m.orderId,
                    vehicleId: vehicle.id,
                    matchedAt: new Date().toISOString(),
                    details: m.matchDetails,
                });
                appendMatchedVehicle(m.orderId, vehicle.vehicleNumber);
            });
            toast.success(`${matches.length}건의 오더가 매칭되었습니다!`, {
                description: matches.map((m) => m.matchDetails).join(", "),
            });
        } else {
            toast.info("작업 완료 - 매칭된 오더가 없습니다.");
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle>작업 체크리스트 - {vehicle.vehicleNumber}</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-small">
                            <span>진행률</span>
                            <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                    </div>

                    <div className="space-y-4">
                        {tasks.map((task) => (
                            <div key={task.id} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <Checkbox id={task.id} checked={task.completed} onCheckedChange={() => handleTaskToggle(task.id)} />
                                <Label
                                    htmlFor={task.id}
                                    className={`flex-1 cursor-pointer ${task.completed ? "line-through text-muted-foreground" : ""}`}
                                >
                                    {task.name}
                                </Label>
                            </div>
                        ))}
                    </div>

                    {progress === 100 && (
                        <div className="space-y-4 border-t border-border pt-4">
                            <div>
                                <p className="text-small font-medium">실물 부품 정보 입력</p>
                                <p className="text-micro text-muted-foreground mt-1">
                                    작업 완료 후 엔진/촉매 정보 입력 시 재고로 등록됩니다.
                                </p>
                            </div>
                            <div className="grid gap-3">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="engine-name" className="text-right">
                                        엔진
                                    </Label>
                                    <Input
                                        id="engine-name"
                                        value={parts.engineName}
                                        onChange={(e) => setParts((prev) => ({ ...prev, engineName: e.target.value }))}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="engine-grade" className="text-right">
                                        엔진 등급
                                    </Label>
                                    <Input
                                        id="engine-grade"
                                        value={parts.engineGrade}
                                        onChange={(e) => setParts((prev) => ({ ...prev, engineGrade: e.target.value }))}
                                        className="col-span-3"
                                        placeholder="예: A"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="catalyst-name" className="text-right">
                                        촉매
                                    </Label>
                                    <Input
                                        id="catalyst-name"
                                        value={parts.catalystName}
                                        onChange={(e) => setParts((prev) => ({ ...prev, catalystName: e.target.value }))}
                                        className="col-span-3"
                                    />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="catalyst-grade" className="text-right">
                                        촉매 등급
                                    </Label>
                                    <Input
                                        id="catalyst-grade"
                                        value={parts.catalystGrade}
                                        onChange={(e) => setParts((prev) => ({ ...prev, catalystGrade: e.target.value }))}
                                        className="col-span-3"
                                        placeholder="예: A+"
                                    />
                                </div>
                            </div>
                            <Button onClick={handleInventorySubmit} disabled={inventorySubmitted}>
                                {inventorySubmitted ? "재고 등록 완료" : "재고 등록"}
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button onClick={() => onOpenChange(false)}>닫기</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
