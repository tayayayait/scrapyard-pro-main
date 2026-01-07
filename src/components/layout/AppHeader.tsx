import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AppHeaderProps {
  title?: string;
}

export function AppHeader({ title }: AppHeaderProps) {
  return (
    <header className="h-header bg-background border-b border-border sticky top-0 z-header">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Title / Breadcrumb */}
        <div className="flex items-center gap-4">
          {title && <h1 className="text-h2">{title}</h1>}
        </div>

        {/* Right: Search, Notifications, User */}
        <div className="flex items-center gap-3">
          {/* Global Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="검색... (/ 키)"
              className="pl-9 w-64 bg-muted border-0"
            />
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
            <span className="sr-only">알림</span>
          </Button>

          {/* User Menu */}
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
            <span className="sr-only">사용자 메뉴</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
