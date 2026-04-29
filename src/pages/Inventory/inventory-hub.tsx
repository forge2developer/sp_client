import { Link } from "react-router-dom";
import { ClipboardList, PlusCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function InventoryHub() {
  const options = [
    {
      title: "Inventory Listing",
      description: "View and manage your existing plotted development projects, track plot availability, and handle bookings.",
      icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
      iconBg: "bg-blue-50",
      href: "/inventory_listing",
    },
    {
      title: "Add Inventory",
      description: "Create a new project by defining phases, generating plots, and uploading layout images for your inventory.",
      icon: <PlusCircle className="h-5 w-5 text-emerald-600" />,
      iconBg: "bg-emerald-50",
      href: "/add_inventory",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          Select an action to manage your real estate assets.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
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
  );
}
