import { Keyboard, HelpCircle, Book, MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const shortcuts = [
  { keys: ["Cmd/Ctrl", "S"], action: "현재 양식/초안 저장" },
  { keys: ["/"], action: "전역 검색 포커스" },
  { keys: ["Alt", "Shift", "R"], action: "데이터 새로고침" },
  { keys: ["Alt", "Shift", "A"], action: "일괄 작업 실행" },
  { keys: ["Shift", "Click"], action: "범위 선택 (행)" },
  { keys: ["Ctrl", "Click"], action: "행 선택 토글" },
  { keys: ["Escape"], action: "모달/드로어 닫기" },
  { keys: ["Enter"], action: "편집 커밋 / 다음 단계" },
  { keys: ["Tab"], action: "다음 셀 이동" },
  { keys: ["Arrow Keys"], action: "셀 탐색" },
];

const helpSections = [
  {
    title: "입찰/견적",
    description: "차량 입찰 등록부터 적정가 산출, 승인 요청까지의 전체 프로세스를 관리합니다.",
    icon: "📋",
  },
  {
    title: "현장 작업",
    description: "태블릿 기반의 현장 체크리스트, 사진 촬영, 바코드 스캔 기능을 제공합니다.",
    icon: "🔧",
  },
  {
    title: "오더 매칭",
    description: "고객 주문과 재고를 자동으로 매칭하고 출고를 관리합니다.",
    icon: "🎯",
  },
  {
    title: "재고 관리",
    description: "로케이션 기반 재고 관리와 입출고 처리를 지원합니다.",
    icon: "📦",
  },
];

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-h1">도움말/단축키</h1>
        <p className="text-small text-muted-foreground mt-1">
          시스템 사용법과 단축키를 확인하세요
        </p>
      </div>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            키보드 단축키
          </CardTitle>
          <CardDescription>
            자주 사용하는 기능을 빠르게 실행할 수 있습니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <span className="text-small">{shortcut.action}</span>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, i) => (
                    <span key={i}>
                      <kbd className="px-2 py-1 bg-background border border-border rounded text-micro font-mono">
                        {key}
                      </kbd>
                      {i < shortcut.keys.length - 1 && (
                        <span className="text-muted-foreground mx-1">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            기능 안내
          </CardTitle>
          <CardDescription>
            주요 기능에 대한 간단한 설명입니다
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {helpSections.map((section, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h3 className="font-medium mb-1">{section.title}</h3>
                    <p className="text-small text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Support */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            지원
          </CardTitle>
          <CardDescription>
            추가 도움이 필요하시면 연락해 주세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-small"
            >
              <HelpCircle className="h-4 w-4" />
              FAQ 보기
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="#"
              className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-small"
            >
              <MessageSquare className="h-4 w-4" />
              문의하기
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
