"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Link } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { BotIcon, BookOpenIcon, Settings2Icon, LifeBuoyIcon, SendIcon, TerminalIcon, LayoutDashboard, Package, Users } from "lucide-react"


import { navigationData as data } from "@/constants/navigation"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="sidebar"
      className="!border-r-0 bg-white/70 backdrop-blur-xl border-r border-white/20 shadow-xl [&_[data-sidebar=sidebar]]:bg-transparent"
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-red-700/10 via-transparent to-white/10 pointer-events-none" />

      <SidebarHeader className="relative z-10 border-b border-red-500/10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/10 group-data-[state=collapsed]:p-0">
              <Link to="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white shadow-md">
                  <TerminalIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight  group-data-[state=collapsed]:hidden">
                  <span className="truncate font-semibold">SP Promoters</span>
                  <span className="truncate text-xs opacity-90 font-medium">RCSP</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="relative z-10 no-scrollbar">
        <NavProjects projects={data.projects} />
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="relative z-10 border-t border-gray-100 bg-white/50 backdrop-blur-sm">
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

