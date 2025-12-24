"use client";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon, LayoutDashboard, QrCode, Building, Tag, MapPin } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

const navItemsByRole: Record<string, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/campaigns", label: "Campaigns", icon: QrCode },
    { href: "/admin/branches", label: "Branches", icon: Building },
    { href: "/admin/places", label: "Places", icon: MapPin },
    { href: "/admin/discounts", label: "Discounts", icon: Tag },
  ],
  branch: [
    { href: "/branch", label: "Dashboard", icon: LayoutDashboard },
  ]
}

type SidebarNavProps = {
  role: 'admin' | 'branch';
  className?: string;
};

export function SidebarNav({ role, className }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = navItemsByRole[role] || [];

  return (
    <SidebarMenu className={className}>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={pathname.startsWith(item.href) && (item.href !== '/admin' || pathname === '/admin')}
              tooltip={item.label}
            >
              <item.icon />
              <span>{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
