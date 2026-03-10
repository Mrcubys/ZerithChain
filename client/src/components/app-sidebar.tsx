import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Wallet, Send, ArrowDownLeft, Globe, Shield,
  BookOpen, Activity, ChevronRight,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { useQuery } from "@tanstack/react-query";
import type { NetworkStatus } from "@shared/schema";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Send", url: "/wallet/send", icon: Send },
  { title: "Receive", url: "/wallet/receive", icon: ArrowDownLeft },
  { title: "Explorer", url: "/explorer", icon: Globe },
  { title: "Validators", url: "/validators", icon: Shield },
  { title: "Whitepaper", url: "/whitepaper", icon: BookOpen },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { data: status } = useQuery<NetworkStatus>({
    queryKey: ["/api/network/status"],
    refetchInterval: 5000,
  });

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-black font-display font-black text-xs tracking-tight">ZC</span>
          </div>
          <div>
            <div className="font-display font-bold text-sm text-sidebar-foreground tracking-wide">Zerith Chain</div>
            <div className="text-xs text-muted-foreground">Mainnet</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors ${
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span className="text-sm">{item.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-sidebar-accent-foreground/60" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-4 mx-2 rounded-sm border border-sidebar-border bg-sidebar-accent/50 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Block</span>
            <span className="text-xs font-mono font-medium text-sidebar-foreground" data-testid="sidebar-block-height">
              #{status?.blockHeight?.toLocaleString() ?? "—"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">TPS</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono font-medium text-green-400" data-testid="sidebar-tps">
                {status?.tps?.toLocaleString() ?? "—"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Validators</span>
            <span className="text-xs font-mono font-medium text-sidebar-foreground" data-testid="sidebar-validators">
              {status ? `${status.activeValidators}/${status.totalValidators}` : "—"}
            </span>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="px-4 py-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-green-400" />
          <span className="text-xs text-muted-foreground">All systems operational</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
