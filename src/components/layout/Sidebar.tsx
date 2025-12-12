import { useState, useEffect } from "react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  AlertCircle,
  MapPin,
  BarChart3,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  List,
  Shield,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ isCollapsed, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const { user, role, logout } = useAuth();
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Get name from user metadata or fetch from profiles
      const metaName = user.user_metadata?.full_name;
      if (metaName) {
        setFullName(metaName);
      } else {
        fetchProfile();
      }
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user.id)
      .maybeSingle();
    
    if (data?.full_name) {
      setFullName(data.full_name);
    }
  };

  const displayName = fullName || user?.email?.split("@")[0] || "User";

  const isAdmin = role === "admin";

  const navItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, showAlways: true },
    { title: "View Issues", url: "/issues", icon: List, showAlways: true },
    { title: "Report Issue", url: "/report", icon: AlertCircle, showForCitizen: true },
    { title: "Issue Map", url: "/map", icon: MapPin, showAlways: true },
    { title: "Analytics", url: "/analytics", icon: BarChart3, showAlways: true },
    { title: "Settings", url: "/settings", icon: Settings, showAlways: true },
  ].filter(item => item.showAlways || (item.showForCitizen && !isAdmin));

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
            {!isCollapsed && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-sidebar-primary-foreground" />
                </div>
                <span className="font-display font-semibold text-lg">CivicReport</span>
              </div>
            )}
            
            {/* Desktop toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden lg:flex text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onToggle}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
            
            {/* Mobile close */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={onMobileClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-200",
                  isCollapsed && "justify-center"
                )}
                activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                onClick={onMobileClose}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="animate-fade-in">{item.title}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-3 border-t border-sidebar-border">
            {!isCollapsed && user && (
              <div className="flex items-center gap-3 px-3 py-2 mb-2 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-sm font-medium text-sidebar-primary-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "text-xs py-0",
                        isAdmin 
                          ? "border-amber-500/50 text-amber-400" 
                          : "border-blue-500/50 text-blue-400"
                      )}
                    >
                      {isAdmin ? <Shield className="w-3 h-3 mr-1" /> : <Users className="w-3 h-3 mr-1" />}
                      {isAdmin ? "Admin" : "Citizen"}
                    </Badge>
                  </div>
                  <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              className={cn(
                "w-full text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-destructive",
                isCollapsed ? "justify-center px-0" : "justify-start"
              )}
              onClick={logout}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="ml-3">Logout</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}
