import {
  Settings2Icon,
  LayoutDashboard,
  Package,
  Wrench,
  Target
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
      isActive: true,
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
}
