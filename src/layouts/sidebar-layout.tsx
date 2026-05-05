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

  // ─── Data-Driven Breadcrumb Generator ───
  const getBreadcrumbs = () => {
    const crumbs: { label: string; href?: string; isPage?: boolean }[] = [
      { label: "Home", href: "/dashboard" },
    ]

    if (pathname === "/dashboard") return [{ label: "Dashboard", isPage: true }]

    // 1. Recursive finder to build the path from navigationData
    const buildPath = (path: string): { label: string; href?: string; isPage?: boolean }[] => {
      // Check Sidebar Main Nav
      for (const group of navigationData.navMain) {
        if (group.url === path) return [{ label: group.title, isPage: true }]
        const sub = group.items?.find(i => i.url === path)
        if (sub) return [{ label: group.title, href: group.url }, { label: sub.title, isPage: true }]
      }

      // Check Sidebar Single Items (Projects)
      const proj = navigationData.projects.find(p => p.url === path)
      if (proj) return [{ label: proj.name, isPage: true }]

      // Check Overrides (Complex/Dynamic routes)
      const override = (navigationData as any).breadcrumbOverrides?.find((o: any) => 
        o.matchStart ? path.startsWith(o.path) : path === o.path
      )
      
      if (override) {
        const parentCrumbs = override.parent ? buildPath(override.parent) : []
        // Convert the last parent crumb from isPage to a link if we are adding a child
        if (parentCrumbs.length > 0) {
          const last = parentCrumbs[parentCrumbs.length - 1]
          if (last.isPage) {
            last.isPage = false
            last.href = override.parent
          }
        }
        return [...parentCrumbs, { label: override.label, isPage: override.isPage }]
      }

      return []
    }

    const foundCrumbs = buildPath(pathname)

    // 2. Fallback: Split URL segments if nothing found in navigationData
    if (foundCrumbs.length === 0) {
      const segments = pathname.split("/").filter(Boolean)
      segments.forEach((segment, index) => {
        const isLast = index === segments.length - 1
        crumbs.push({
          label: formatLabel(segment),
          isPage: isLast,
          href: isLast ? undefined : `/${segments.slice(0, index + 1).join("/")}`,
        })
      })
      return crumbs
    }

    return [...crumbs.slice(0, 1), ...foundCrumbs]
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
          {/* <div className="ml-auto">
            <ThemeToggle />
          </div> */}
        </header>
        <div className="flex flex-1 flex-col gap-0 px-3">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
