import {
  Settings2Icon,
  LayoutDashboard,
  Package,
  Wrench,
  Target,
  MessageSquareWarning,
  Calendar
} from "lucide-react"

export const navigationData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Lead Directory",
      url: "/lead_hub",
      icon: <Target />,
      items: [
        {
          title: "All Leads",
          url: "/lead-list",
        },
        {
          title: "Lead Form",
          url: "/add-lead",
        },
      ],
    },
    {
      title: "Inventory",
      url: "/inventory_hub",
      icon: <Package />,
      // isActive: true,
      items: [
        {
          title: "Inventory listing",
          url: "/inventory_listing",
        },
        {
          title: "Add inventory",
          url: "/add_inventory",
        },
      ],
    },
    {
      title: "Tools",
      url: "/tools_hub",
      icon: <Wrench />,
      items: [
        {
          title: "Automation",
          url: "/automation",
        },
        {
          title: "Third party Integrations",
          url: "/third_party_integrations",
        },
      ],
    },
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: <BookOpenIcon />,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Settings",
      url: "/general_settings",
      icon: <Settings2Icon />,
      noDropdown: true,
      items: [
        {
          title: "Manage Users",
          url: "/manage_users",
        },
        {
          title: "Import Data",
          url: "/import_data",
        },
      ],
    },
    {
      title: "Reports",
      url: "/report_page",
      icon: <MessageSquareWarning />
    },
    {
      title: "Calendar",
      url: "/calendar_view",
      icon: <Calendar />
    }
  ],
  navSecondary: [
    // {
    //   title: "Support",
    //   url: "#",
    //   icon: <LayoutDashboard />, // Placeholder as icons were inline in sidebar
    // },
    // {
    //   title: "Feedback",
    //   url: "#",
    //   icon: <LayoutDashboard />, // Placeholder
    // },
  ],
  projects: [
    {
      name: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
    }
  ],
  // ─── Hidden Routes for Breadcrumb Generation ─────────────────────────────────
  // These are routes that don't appear in the sidebar but need a defined path
  breadcrumbOverrides: [
    {
      path: "/add-lead",
      label: "Lead Form",
      parent: "/lead_hub",
      isPage: true
    },
    {
      path: "/automation/campaigns",

      label: "Campaigns",
      parent: "/automation",
      isPage: true
    },
    {
      path: "/automation/campaigns/builder",
      label: "Campaign Builder",
      parent: "/automation/campaigns",
      isPage: true
    },
    {
      path: "/automation/leadcapture",
      label: "Lead Capture",
      parent: "/automation",
      isPage: true
    },
    {
      path: "/automation/leadcapture/form",
      label: "Form Builder",
      parent: "/automation/leadcapture",
      isPage: true
    },
    {
      path: "/lead-dashboard",
      label: "Lead Dashboard",
      parent: "/lead-list",
      isPage: true,
      matchStart: true // Matches /lead-dashboard/:id
    },
    {
      path: "/project_showcase",
      label: "Project Showcase",
      parent: "/inventory_listing",
      isPage: true,
      matchStart: true // Matches /project_showcase/:id
    },
    {
      path: "/booking-form",
      label: "Booking Form",
      parent: "/inventory_listing",
      isPage: true
    }
  ]
}
