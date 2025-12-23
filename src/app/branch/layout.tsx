import type { ReactNode } from "react";
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { LayoutDashboard, Search } from "lucide-react";
import Header from "@/components/dashboard/header";
import Logo from "@/components/logo";

const branchNavItems = [
  { href: "/branch", label: "Dashboard", icon: LayoutDashboard },
];

const branchUser = {
  name: "Branch User",
  email: "branch.koramangala@servall.com",
  avatarId: "user-avatar-1",
};

export default function BranchLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav navItems={branchNavItems} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex flex-col">
          <Header title="Branch Dashboard" user={branchUser} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
