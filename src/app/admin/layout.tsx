import type { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { LayoutDashboard, Settings, QrCode } from "lucide-react";
import Header from "@/components/dashboard/header";
import Logo from "@/components/logo";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/campaigns", label: "Campaigns", icon: QrCode },
];

const adminUser = {
  name: "Admin User",
  email: "admin@servall.com",
  avatarId: "admin-avatar-1",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav navItems={adminNavItems} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <Header title="Admin Dashboard" user={adminUser} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
