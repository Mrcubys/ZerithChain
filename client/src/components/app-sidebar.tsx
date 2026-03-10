import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, Wallet, Send, ArrowDownLeft, Globe, Shield,
  BookOpen, Settings, ChevronRight, Zap, Activity,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarHeader, SidebarFooter,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import type { NetworkStatus } from "@shared/schema";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Wallet", url: "/wallet", icon: Wallet },
  { title: "Send ZTH", url: "/wallet/send", icon: Send },
  { title: "Receive ZTH", url: "/wallet/receive", icon: ArrowDownLeft },
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
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-400 border-2 border-sidebar" />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-sidebar-foreground tracking-wide">ZERITH CHAIN</div>
            <div className="text-xs text-muted-foreground">ZTH Mainnet</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-muted-foreground/70 uppercase tracking-widest px-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, "-")}`}>
                      <Link
                        href={item.url}
                        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive
                            ? "bg-primary/15 text-primary"
                            : "text-sidebar-foreground/70"
                        }`}
                      >
                        <item.icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-primary" : ""}`} />
                        <span className="text-sm font-medium">{item.title}</span>
                        {isActive && <ChevronRight className="w-3 h-3 ml-auto text-primary" />}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-xs text-muted-foreground/70 uppercase tracking-widest px-2">Network</SidebarGroupLabel>
          <SidebarGroupContent className="px-2">
            <div className="rounded-md border border-border/50 bg-card p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Block Height</span>
                <span className="text-xs font-mono font-semibold text-primary" data-testid="sidebar-block-height">
                  #{status?.blockHeight?.toLocaleString() ?? "..."}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">TPS</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-mono font-semibold text-green-400" data-testid="sidebar-tps">
                    {status?.tps?.toLocaleString() ?? "..."}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Validators</span>
                <span className="text-xs font-mono font-semibold text-cyan-400" data-testid="sidebar-validators">
                  {status?.activeValidators ?? "..."}/{status?.totalValidators ?? "..."}
                </span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
          <span className="text-xs text-green-400 font-medium">Network Healthy</span>
          <Badge variant="secondary" className="ml-auto text-xs py-0">
            v1.2.0
          </Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
