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
import { TerminalIcon } from "lucide-react"


import { navigationData as data } from "@/constants/navigation"
import { useAuth } from "@/context/AuthContext"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  // Use dynamic user data from AuthContext, fallback to static if not logged in
  const userData = user ? {
    name: user.name,
    email: user.email,
    avatar: "/avatars/default.jpg" // Or user.avatar if available
  } : data.user

  return (
    <Sidebar
      variant="sidebar"
      className="border-r border-slate-200 bg-white/70 backdrop-blur-xl [&_[data-sidebar=sidebar]]:bg-transparent"
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-red-50/10 to-transparent pointer-events-none" />

      <SidebarHeader className="relative z-10">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="hover:bg-white/10 group-data-[state=collapsed]:p-0">
              <Link to="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-red-600 text-white">
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
      <SidebarFooter className="relative z-10  bg-white/50">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

