import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Outlet, useLocation, Link } from "react-router-dom"
import React from "react"
import { ThemeToggle } from "@/components/theme-toggle"

import { navigationData } from "@/constants/navigation"

export default function DashboardLayout() {
  const location = useLocation()
  const pathname = location.pathname

  // Helper to format labels
  const formatLabel = (label: string) => {
    return label
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase())
  }

  // Define breadcrumb structure based on route
  const getBreadcrumbs = () => {
    const crumbs: { label: string; href?: string; isPage?: boolean }[] = [
      { label: "Home", href: "/dashboard" },
    ]

    // 1. Check if it's the dashboard itself
    if (pathname === "/dashboard") {
      crumbs.push({ label: "Dashboard", isPage: true })
      return crumbs
    }

    // 2. Automatic Scan: Check Sidebar "navMain" (Groups with sub-items)
    let found = false
    navigationData.navMain.forEach((group) => {
      const activeSubItem = group.items?.find((sub) => sub.url === pathname)
      if (activeSubItem) {
        crumbs.push({ label: group.title, href: group.url || "#" }) // Parent Category
        crumbs.push({ label: activeSubItem.title, isPage: true }) // Current Page
        found = true
      }
    })

    // 3. Automatic Scan: Check Sidebar "projects" (Single items)
    if (!found) {
      const projectMatch = navigationData.projects.find((p) => p.url === pathname)
      if (projectMatch) {
        crumbs.push({ label: projectMatch.name, isPage: true })
        found = true
      }
    }

    // 4. Dynamic Fallback: If not in sidebar, analyze URL segments
    if (!found) {
      const segments = pathname.split("/").filter(Boolean)
      segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1
        crumbs.push({
          label: formatLabel(segment),
          isPage: isLast,
          href: isLast ? undefined : `/${segments.slice(0, index + 1).join("/")}`,
        })
      })
    }

    return crumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 bg-background px-4">
          <SidebarTrigger className="-ml-1" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                    {crumb.isPage ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href || "#"}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className={index === 0 ? "hidden md:block" : ""} />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

