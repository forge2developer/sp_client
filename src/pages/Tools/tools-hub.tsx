import { Link } from "react-router-dom";
import { Zap, Share2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ToolsHub() {
  const options = [
    {
      title: "Automation Hub",
      description: "Manage your marketing automations, including campaigns and lead capture forms, to streamline your lead generation process.",
      icon: <Zap className="h-5 w-5 text-amber-600" />,
      iconBg: "bg-amber-50",
      href: "/automation",
    },
    {
      title: "Third Party Integrations",
      description: "Connect and manage external services and APIs to synchronize your data and extend your application's functionality.",
      icon: <Share2 className="h-5 w-5 text-purple-600" />,
      iconBg: "bg-purple-50",
      href: "/third_party_integrations",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Tools & Integrations</h1>
        <p className="text-muted-foreground">
          Select a tool to automate your workflow or manage integrations.
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
