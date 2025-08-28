
'use client';
import type { ReactNode } from 'react';
import Image from 'next/image';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { Header } from './header';

const AppLogo = () => (
  <div className="flex items-center gap-2 p-2">
    <Image 
      src="/logo_ppimanager.png" 
      alt="PPIManager Logo"
      width={32}
      height={32}
    />
    <span className="text-lg font-semibold tracking-tight">PPIManager</span>
  </div>
);


export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader className="group-data-[collapsible=icon]:-ml-1">
           <AppLogo/>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter>
          <SidebarTrigger className="self-end" />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
