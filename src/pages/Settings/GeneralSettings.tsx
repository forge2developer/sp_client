import { Card, CardContent } from "@/components/ui/card"
import { Users, FileUp } from "lucide-react"
import { Link } from "react-router-dom"

const settingsOptions = [
  {
    title: "Manage Users",
    description: "Add users, update roles, and manage system permissions.",
    icon: <Users className="h-5 w-5 text-blue-600" />,
    iconBg: "bg-blue-50",
    href: "/manage_users",
  },
  {
    title: "Import Data",
    description: "Bulk import leads and other data into the system.",
    icon: <FileUp className="h-5 w-5 text-emerald-600" />,
    iconBg: "bg-emerald-50",
    href: "/import_data",
  },
]

export default function GeneralSettings() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">General Settings</h1>
        <p className="text-muted-foreground">
          Manage your system configuration and data imports.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsOptions.map((option) => (
          <Link key={option.href} to={option.href}>
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${option.iconBg}`}>
                    {option.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{option.title}</h3>
                </div>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
                  {option.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}