'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { FileText, LayoutDashboard, Library, Settings, Users, School } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || (path !== '/dashboard' && pathname.startsWith(path));
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/dashboard')} tooltip="Tableau de bord">
          <Link href="/dashboard">
            <LayoutDashboard />
            Tableau de bord
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/students')} tooltip="Élèves">
          <Link href="/students">
            <Users />
            Élèves
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/classes')} tooltip="Classes">
          <Link href="/classes">
            <School />
            Classes
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/ppi')} tooltip="PPI">
          <Link href="/ppi">
            <FileText />
            PPI
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/library')} tooltip="Bibliothèque">
          <Link href="/library">
            <Library />
            Bibliothèque
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/settings')} tooltip="Paramètres">
          <Link href="/settings">
            <Settings />
            Paramètres
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
