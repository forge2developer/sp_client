import { Link } from "react-router-dom";
import { Users, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function LeadHub() {
  const options = [
    {
      title: "All Leads",
      description: "Manage your existing pipeline, track lead progress, and view comprehensive activity logs for every contact.",
      icon: <Users className="h-5 w-5 text-blue-600" />,
      iconBg: "bg-blue-50",
      href: "/lead-list",
    },
    {
      title: "Lead Capture Form",
      description: "Manually add new leads to the system when you have direct contact with a potential client.",
      icon: <UserPlus className="h-5 w-5 text-emerald-600" />,
      iconBg: "bg-emerald-50",
      href: "/add-lead",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Lead Directory</h1>
        <p className="text-muted-foreground">
          Select an action to manage your lead lifecycle and capture workflows.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {options.map((option) => (
          <Link key={option.href} to={option.href}>
            <Card className="h-full transition-all hover:border-primary/50 hover:shadow-md border-slate-200">
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
