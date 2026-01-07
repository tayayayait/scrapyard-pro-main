import { useMemo, useRef, useState } from "react";
import { Users, FileText, Shield, Upload, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PricingRuleDialog } from "@/components/forms";
import { useData } from "@/contexts/DataProvider";
import { createId } from "@/lib/ids";
import { migrateState, saveState, SCHEMA_VERSION } from "@/lib/storage";
import { PricingRule } from "@/types";

interface AppStateSnapshot {
  vehicles: ReturnType<typeof useData>["vehicles"];
  orders: ReturnType<typeof useData>["orders"];
  pricingRules: ReturnType<typeof useData>["pricingRules"];
  inventory: ReturnType<typeof useData>["inventory"];
  locations: ReturnType<typeof useData>["locations"];
  matchEvents: ReturnType<typeof useData>["matchEvents"];
  auditLogs: ReturnType<typeof useData>["auditLogs"];
  users: ReturnType<typeof useData>["users"];
  currentUser: ReturnType<typeof useData>["currentUser"];
}

interface PersistedPayload<T> {
  version: number;
  savedAt: string;
  data: T;
}

export default function AdminPage() {
  const {
    vehicles,
    orders,
    pricingRules,
    inventory,
    locations,
    matchEvents,
    auditLogs,
    users,
    currentUser,
    addPricingRule,
    updatePricingRule,
    replaceState,
  } = useData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<PricingRule | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const snapshot: AppStateSnapshot = useMemo(
    () => ({
      vehicles,
      orders,
      pricingRules,
      inventory,
      locations,
      matchEvents,
      auditLogs,
      users,
      currentUser,
    }),
    [vehicles, orders, pricingRules, inventory, locations, matchEvents, auditLogs, users, currentUser]
  );

  const handleAddRule = () => {
    setSelectedRule(null);
    setDialogOpen(true);
  };

  const handleEditRule = (rule: PricingRule) => {
    setSelectedRule(rule);
    setDialogOpen(true);
  };

  const handleSaveRule = (values: PricingRule) => {
    if (values.id && pricingRules.some((r) => r.id === values.id)) {
      updatePricingRule(values.id, {
        category: values.category,
        name: values.name,
        code: values.code,
        status: values.status,
        basePrice: values.basePrice,
      });
    } else {
      addPricingRule({
        ...values,
        id: values.id || createId("RULE"),
      });
    }
    setDialogOpen(false);
  };

  const handleExport = () => {
    const payload: PersistedPayload<AppStateSnapshot> = {
      version: SCHEMA_VERSION,
      savedAt: new Date().toISOString(),
      data: snapshot,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `scrapyard-demo-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as PersistedPayload<AppStateSnapshot> | AppStateSnapshot;
      const payload = "data" in parsed ? parsed : { version: SCHEMA_VERSION, savedAt: "", data: parsed };
      const migrated = migrateState<AppStateSnapshot>(payload.version ?? 0, SCHEMA_VERSION, payload.data);
      replaceState(migrated);
      saveState(migrated);
    } catch (error) {
      console.error("Failed to import state", error);
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <PricingRuleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSaveRule}
        initialValue={selectedRule ?? undefined}
        title={selectedRule ? "기준단가 수정" : "기준단가 추가"}
        submitLabel={selectedRule ? "수정" : "추가"}
      />
      <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1">관리자</h1>
          <p className="text-small text-muted-foreground mt-1">시스템 설정 및 권한을 관리합니다</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleImportClick}>
            <Upload className="h-4 w-4 mr-2" />
            가져오기
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            내보내기
          </Button>
        </div>
      </div>

      <Tabs defaultValue="reference" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reference" className="gap-2">
            <FileText className="h-4 w-4" />
            기준데이터
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            사용자/권한
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Shield className="h-4 w-4" />
            감사 로그
          </TabsTrigger>
        </TabsList>

        {/* Reference Data */}
        <TabsContent value="reference" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h2">기준데이터 관리</h2>
            <Button onClick={handleAddRule}>항목 추가</Button>
          </div>
          <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">분류</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">항목명</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">코드</th>
                  <th className="px-4 py-3 text-right text-small font-medium text-muted-foreground">기준단가</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">상태</th>
                  <th className="px-4 py-3 text-right text-small font-medium text-muted-foreground">작업</th>
                </tr>
              </thead>
              <tbody>
                {pricingRules.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-small">{item.category}</td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-small text-muted-foreground font-mono">{item.code}</td>
                    <td className="px-4 py-3 text-right text-small font-mono">
                      {item.basePrice ? `₩${item.basePrice.toLocaleString()}` : "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === "active" ? "success" : "muted"}>
                        {item.status === "active" ? "활성" : "비활성"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEditRule(item)}>
                        수정
                      </Button>
                    </td>
                  </tr>
                ))}
                {pricingRules.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground text-small">
                      등록된 기준데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Users */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h2">사용자/권한 관리</h2>
            <Button disabled>사용자 추가</Button>
          </div>
          <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">이름</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">이메일</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">역할</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{user.name}</td>
                    <td className="px-4 py-3 text-small">{user.email ?? "-"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.status === "active" ? "success" : "muted"}>
                        {user.status === "active" ? "활성" : "비활성"}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-small">
                      등록된 사용자가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        {/* Audit Log */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-h2">감사 로그</h2>
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              내보내기
            </Button>
          </div>
          <div className="bg-card rounded-card shadow-card border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">시간</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">사용자</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">작업</th>
                  <th className="px-4 py-3 text-left text-small font-medium text-muted-foreground">대상</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3 text-small text-muted-foreground font-mono tabular-nums">
                      {log.timestamp}
                    </td>
                    <td className="px-4 py-3 font-medium">{log.actorName ?? log.actorId ?? "-"}</td>
                    <td className="px-4 py-3 text-small">{log.action}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="font-mono">
                        {log.entityType}:{log.entityId}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {auditLogs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-small">
                      로그가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
