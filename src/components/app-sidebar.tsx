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

  // Filter navigation items based on user role
  const filteredNavMain = React.useMemo(() => {
    if (!user) return []

    return data.navMain.map(item => {
      // Filter sub-items
      const filteredItems = item.items?.filter(subItem => {
        const roles = (subItem as any).roles
        if (!roles) return true // Show if no roles specified
        return roles.includes(user.role)
      })

      return {
        ...item,
        items: filteredItems
      }
    }).filter(item => {
      // Also filter the parent item if it has roles or if it's empty after filtering sub-items (if it had items)
      const roles = (item as any).roles
      if (roles && !roles.includes(user.role)) return false
      
      // If item had sub-items but they are all filtered out, we might want to hide the parent too
      // unless the parent itself has a valid URL to navigate to.
      if (item.items && item.items.length === 0 && item.url === "#") return false
      
      return true
    })
  }, [user])

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
        <NavMain items={filteredNavMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter className="relative z-10  bg-white/50">
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}

