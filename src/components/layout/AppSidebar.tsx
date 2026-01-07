import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Gavel,
  ClipboardCheck,
  FileStack,
  Warehouse,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  id: string;
  label: string;
  route: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: "nav.dashboard", label: "대시보드", route: "/", icon: LayoutDashboard },
  { id: "nav.bidding", label: "입찰/견적", route: "/bidding", icon: Gavel },
  { id: "nav.field", label: "현장(오늘 작업)", route: "/field", icon: ClipboardCheck },
  { id: "nav.orders", label: "오더 관리/매칭", route: "/orders", icon: FileStack },
  { id: "nav.inventory", label: "입출고/재고", route: "/inventory", icon: Warehouse },
  { id: "nav.admin", label: "관리자", route: "/admin", icon: Settings, adminOnly: true },
  { id: "nav.help", label: "도움말/단축키", route: "/help", icon: HelpCircle },
];

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppSidebar({ collapsed, onToggle }: AppSidebarProps) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-header h-screen bg-sidebar border-r border-sidebar-border transition-all duration-200 ease-out flex flex-col",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar"
      )}
    >
      {/* Logo / Header */}
      <div className="h-header flex items-center justify-between px-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-sidebar-foreground">폐차관리</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label={collapsed ? "사이드바 열기" : "사이드바 접기"}
        >
          {collapsed ? <Menu className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto hide-scrollbar">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.route || 
              (item.route !== "/" && location.pathname.startsWith(item.route));

            return (
              <li key={item.id}>
                <NavLink
                  to={item.route}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors touch-target",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary font-medium"
                      : "text-sidebar-foreground",
                    collapsed && "justify-center px-2"
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-micro text-muted-foreground">
            버전 1.0.0
          </div>
        </div>
      )}
    </aside>
  );
}
