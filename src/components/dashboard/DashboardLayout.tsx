import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { LogOut, User, LucideIcon } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "patient" | "doctor" | "laboratory";
  userName: string;
  userSubtitle?: string;
  navItems: NavItem[];
  userIcon?: LucideIcon;
}

const DashboardLayout = ({
  children,
  userRole,
  userName,
  userSubtitle,
  navItems,
  userIcon: UserIcon = User,
}: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const getRoleColor = () => {
    switch (userRole) {
      case "doctor":
        return "bg-secondary/20 text-secondary";
      case "laboratory":
        return "bg-secondary/20 text-secondary";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="p-4 border-b border-border">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="TABEEBAK" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gradient">TABEEBAK</span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={location.pathname === item.url}
                        tooltip={item.title}
                      >
                        <NavLink
                          to={item.url}
                          className="flex items-center gap-3"
                          activeClassName="bg-primary/10 text-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${getRoleColor()}`}>
                <UserIcon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{userSubtitle || userRole}</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Top Header */}
          <header className="h-14 border-b border-border bg-card flex items-center justify-between px-4 sticky top-0 z-40">
            <SidebarTrigger />
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 bg-muted/30 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
