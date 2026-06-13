import { ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { getInitials } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  Bell,
  CalendarDays,
  BookOpen,
  ClipboardList,
  FileText,
  LogOut,
  User,
  LucideIcon,
  ChevronDown,
} from "lucide-react";
import { MouseEvent } from "react";
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
  const { logout, user } = useAuth();

  const effectiveNavItems = useMemo(() => {
    const requestItem =
      userRole === "doctor"
        ? { title: "Requests", url: "/doctor/requests", icon: Bell }
        : userRole === "laboratory"
        ? { title: "Inbox", url: "/lab/requests", icon: ClipboardList }
        : null;

    if (!requestItem || navItems.some((item) => item.url === requestItem.url)) {
      return navItems;
    }

    return [navItems[0], requestItem, ...navItems.slice(1)];
  }, [navItems, userRole]);

  const isNavItemActive = (url: string) =>
    location.pathname === url ||
    (url !== `/${userRole}/dashboard` && location.pathname.startsWith(`${url}/`));

  const appointmentChildItems = useMemo(() => {
    if (userRole !== "patient") return [];
    const bookItem = effectiveNavItems.find((item) => item.url === "/patient/book");
    const requestsItem = effectiveNavItems.find((item) => item.url === "/patient/requests");
    return [bookItem, requestsItem].filter(Boolean) as NavItem[];
  }, [effectiveNavItems, userRole]);

  const appointmentsParent = useMemo(
    () => effectiveNavItems.find((item) => item.url === "/patient/appointments"),
    [effectiveNavItems],
  );

  const isAppointmentsChildActive = appointmentChildItems.some((item) => isNavItemActive(item.url));
  const isAppointmentsActive =
    isAppointmentsChildActive || (appointmentsParent ? isNavItemActive(appointmentsParent.url) : false);

  const [appointmentsOpen, setAppointmentsOpen] = useState(isAppointmentsChildActive);

  useEffect(() => {
    if (isAppointmentsChildActive) {
      setAppointmentsOpen(true);
    }
  }, [isAppointmentsChildActive]);

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
                  {effectiveNavItems.map((item) => {
                    if (userRole === "patient") {
                      if (item.url === "/patient/book" || item.url === "/patient/requests") {
                        return null;
                      }

                      if (item.url === "/patient/appointments" && appointmentChildItems.length) {
                        return (
                          <Collapsible
                            key="appointments-collapsible"
                            open={appointmentsOpen}
                            onOpenChange={setAppointmentsOpen}
                          >
                            <SidebarMenuItem>
                              <div
                                className={cn(
                                  "flex items-center rounded-md",
                                  isAppointmentsActive && "bg-primary/10 text-primary",
                                )}
                              >
                                <SidebarMenuButton asChild isActive={isAppointmentsActive} tooltip="Appointments">
                                  <NavLink
                                    to={appointmentsParent?.url ?? "/patient/appointments"}
                                    className="flex flex-1 items-center gap-3"
                                    activeClassName="bg-primary/10 text-primary font-medium"
                                  >
                                    <CalendarDays className="h-4 w-4" />
                                    <span>Appointments</span>
                                  </NavLink>
                                </SidebarMenuButton>
                                <CollapsibleTrigger asChild>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label={appointmentsOpen ? "Collapse appointments menu" : "Expand appointments menu"}
                                    className="mr-1 h-7 w-7 shrink-0 rounded-md"
                                    onClick={(event: MouseEvent<HTMLButtonElement>) => event.stopPropagation()}
                                  >
                                    <ChevronDown
                                      className={cn(
                                        "h-4 w-4 transition-transform duration-200",
                                        appointmentsOpen && "rotate-180",
                                      )}
                                    />
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              <CollapsibleContent className="mt-1 overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                                <SidebarMenuSub>
                                  {appointmentChildItems.map((child) => (
                                    <SidebarMenuSubItem key={child.title}>
                                      <SidebarMenuSubButton asChild>
                                        <NavLink
                                          to={child.url}
                                          className="flex items-center gap-3 pl-9"
                                          activeClassName="bg-primary/10 text-primary font-medium"
                                        >
                                          {child.url === "/patient/book" ? (
                                            <BookOpen className="h-4 w-4" />
                                          ) : (
                                            <FileText className="h-4 w-4" />
                                          )}
                                          <span>{child.title}</span>
                                        </NavLink>
                                      </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>
                                  ))}
                                </SidebarMenuSub>
                              </CollapsibleContent>
                            </SidebarMenuItem>
                          </Collapsible>
                        );
                      }
                    }

                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild isActive={isNavItemActive(item.url)} tooltip={item.title}>
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
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatarUrl ?? undefined} alt={userName} />
                <AvatarFallback className={getRoleColor()}>
                  {getInitials(userName) || <UserIcon className="h-5 w-5" />}
                </AvatarFallback>
              </Avatar>
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
