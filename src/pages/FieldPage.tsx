import { useMemo, useState } from "react";
import { CheckCircle, Circle, Clock, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { TaskDialog } from "@/components/dashboard/TaskDialog";
import { useData } from "@/contexts/DataProvider";

const statusConfig = {
  "작업중": { badge: "info", icon: Clock },
  "대기": { badge: "muted", icon: Circle },
  "완료": { badge: "success", icon: CheckCircle },
} as const;

export default function FieldPage() {
  const { vehicles } = useData();
  const [isOnline] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const todayTasks = useMemo(
    () => vehicles.filter((v) => v.tasks && v.tasks.length > 0),
    [vehicles]
  );

  const counts = useMemo(() => {
    const working = todayTasks.filter((v) => v.status === "작업중").length;
    const waiting = todayTasks.filter((v) => v.status === "대기").length;
    const done = todayTasks.filter((v) => v.status === "완료").length;
    return { working, waiting, done };
  }, [todayTasks]);

  const handleCardClick = (id: string) => {
    setSelectedVehicleId(id);
    setDialogOpen(true);
  };

  const handleStart = () => {
    if (selectedVehicleId) {
      setDialogOpen(true);
      return;
    }
    const waitingTask = todayTasks.find((v) => v.status === "대기");
    const target = waitingTask ?? todayTasks[0];
    if (!target) return;
    setSelectedVehicleId(target.id);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-20">
      <TaskDialog vehicleId={selectedVehicleId} open={dialogOpen} onOpenChange={setDialogOpen} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">오늘 작업</h1>
          <p className="text-small text-muted-foreground mt-1">
            {new Date().toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "short",
            })}
          </p>
        </div>
        <Badge variant={isOnline ? "success" : "warning"}>{isOnline ? "온라인" : "오프라인"}</Badge>
      </div>

      {/* Task Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-card p-4 shadow-card border border-border text-center">
          <p className="text-h1 text-info">{counts.working}</p>
          <p className="text-micro text-muted-foreground">진행중</p>
        </div>
        <div className="bg-card rounded-card p-4 shadow-card border border-border text-center">
          <p className="text-h1">{counts.waiting}</p>
          <p className="text-micro text-muted-foreground">대기</p>
        </div>
        <div className="bg-card rounded-card p-4 shadow-card border border-border text-center">
          <p className="text-h1 text-success">{counts.done}</p>
          <p className="text-micro text-muted-foreground">완료</p>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {todayTasks.map((task) => {
          const config = statusConfig[task.status as keyof typeof statusConfig];
          const completedCount = task.tasks?.filter((t) => t.completed).length ?? 0;

          return (
            <div
              key={task.id}
              onClick={() => handleCardClick(task.id)}
              className={cn(
                "bg-card rounded-card shadow-card border border-border p-4 transition-shadow hover:shadow-hover cursor-pointer tablet-row",
                task.priority === "high" && "border-l-4 border-l-warning"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{task.vehicleNumber}</span>
                    <Badge variant={config?.badge as "info" | "muted" | "success"}>{task.status}</Badge>
                    {task.priority === "high" && <Badge variant="warning">긴급</Badge>}
                  </div>
                  <p className="text-small text-muted-foreground">{task.vehicleModel}</p>
                </div>
                <div className="text-right">
                  <p className="text-micro text-muted-foreground">담당</p>
                  <p className="text-small font-medium">{task.assignee ?? "-"}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-micro text-muted-foreground">
                    진행률 {completedCount}/{task.tasks?.length ?? 0}
                  </span>
                  <span className="text-micro font-medium">{task.progress ?? 0}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      task.progress === 100 ? "bg-success" : "bg-info"
                    )}
                    style={{ width: `${task.progress ?? 0}%` }}
                  />
                </div>
              </div>

              {/* Task Checklist Preview */}
              <div className="flex flex-wrap gap-2">
                {task.tasks?.map((t) => (
                  <div
                    key={t.id}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1 rounded-full text-micro",
                      t.completed ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {t.completed ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                    {t.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Fixed Bottom Action Bar (for tablet) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border px-4 flex items-center justify-between md:hidden">
        <Button variant="outline" className="flex-1 mr-2" onClick={handleStart}>
          <Camera className="h-4 w-4 mr-2" />
          스캔
        </Button>
        <Button className="flex-1" onClick={handleStart}>
          작업 시작
        </Button>
      </div>
    </div>
  );
}
