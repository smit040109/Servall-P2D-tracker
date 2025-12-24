
"use client";

import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type LucideIcon, LayoutDashboard, QrCode, Building, Tag, MapPin, Users } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  matcher?: RegExp;
};

const navItemsByRole: Record<string, NavItem[]> = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/campaigns", label: "Campaigns", icon: QrCode, matcher: /^\/admin\/campaigns(\/.*)?$/ },
    { href: "/admin/places", label: "Places", icon: MapPin },
    { href: "/admin/leads", label: "Leads", icon: Users },
    { href: "/admin/branches", label: "Branches", icon: Building },
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

  const isActive = (item: NavItem) => {
    if (item.matcher) {
      return item.matcher.test(pathname);
    }
    return pathname === item.href;
  }

  return (
    <SidebarMenu className={className}>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              isActive={isActive(item)}
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
