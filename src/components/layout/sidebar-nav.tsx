'use client';

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { FileText, LayoutDashboard, Library, Settings, Users } from 'lucide-react';
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
        <Link href="/dashboard" passHref legacyBehavior>
          <SidebarMenuButton isActive={isActive('/dashboard')} tooltip="Tableau de bord">
            <LayoutDashboard />
            Tableau de bord
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/students" passHref legacyBehavior>
          <SidebarMenuButton isActive={isActive('/students')} tooltip="Élèves">
            <Users />
            Élèves
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/ppi" passHref legacyBehavior>
          <SidebarMenuButton isActive={isActive('/ppi')} tooltip="PPI">
            <FileText />
            PPI
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/library" passHref legacyBehavior>
          <SidebarMenuButton isActive={isActive('/library')} tooltip="Bibliothèque">
            <Library />
            Bibliothèque
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <Link href="/settings" passHref legacyBehavior>
          <SidebarMenuButton isActive={isActive('/settings')} tooltip="Paramètres">
            <Settings />
            Paramètres
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
