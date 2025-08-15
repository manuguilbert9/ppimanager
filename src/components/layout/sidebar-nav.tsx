
'use client';

import { useState } from 'react';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { FileText, LayoutDashboard, Library, Settings, Users, School, ClipboardList, Group as GroupIcon, Bot } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiChatBot } from '@/app/(app)/chat/ai-chat-bot';

export function SidebarNav() {
  const pathname = usePathname();
  const [isPilotageOpen, setIsPilotageOpen] = useState(pathname.startsWith('/pilotage') || pathname.startsWith('/groups'));
  const [isChatOpen, setIsChatOpen] = useState(false);

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <>
    <SidebarMenu className="flex-1">
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive('/dashboard', true)} tooltip="Tableau de bord">
          <Link href="/dashboard">
            <LayoutDashboard />
            Tableau de bord
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton 
            isActive={isActive('/pilotage') || isActive('/groups')} 
            tooltip="Pilotage"
            onClick={() => setIsPilotageOpen(prev => !prev)}
        >
            <ClipboardList />
            Pilotage
        </SidebarMenuButton>
        {isPilotageOpen && (
             <SidebarMenuSub>
                <li>
                    <SidebarMenuSubButton asChild isActive={isActive('/pilotage', true)}>
                        <Link href="/pilotage">Suggestions IA</Link>
                    </SidebarMenuSubButton>
                </li>
                <li>
                     <SidebarMenuSubButton asChild isActive={isActive('/groups')}>
                        <Link href="/groups">Groupes de travail</Link>
                    </SidebarMenuSubButton>
                </li>
             </SidebarMenuSub>
        )}
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

    <SidebarMenu>
        <SidebarMenuItem>
            <SidebarMenuButton onClick={() => setIsChatOpen(true)} tooltip="Assistant IA">
                <Bot />
                Assistant IA
            </SidebarMenuButton>
        </SidebarMenuItem>
    </SidebarMenu>
    <AiChatBot open={isChatOpen} onOpenChange={setIsChatOpen} />
    </>
  );
}
