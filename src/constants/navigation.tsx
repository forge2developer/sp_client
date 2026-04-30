import {
  BotIcon,
  BookOpenIcon,
  Settings2Icon,
  LayoutDashboard,
  Package
} from "lucide-react"

export const navigationData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
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
    // {
    //   title: "Models",
    //   url: "#",
    //   icon: <BotIcon />,
    //   items: [
    //     {
    //       title: "Genesis",
    //       url: "#",
    //     },
    //     {
    //       title: "Explorer",
    //       url: "#",
    //     },
    //     {
    //       title: "Quantum",
    //       url: "#",
    //     },
    //   ],
    // },
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
      // items: [
      //   {
      //     title: "General",
      //     url: "#",
      //   },
      //   {
      //     title: "Team",
      //     url: "#",
      //   },
      //   {
      //     title: "Billing",
      //     url: "#",
      //   },
      //   {
      //     title: "Limits",
      //     url: "#",
      //   },
      // ],
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
