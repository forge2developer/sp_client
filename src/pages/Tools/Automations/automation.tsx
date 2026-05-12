import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  FileDown,
  Search,
  SearchX,
  Megaphone,
} from "lucide-react"

interface AutomationCard {
  title: string
  description: string
  icon: any
  colorClass: string
  bgClass: string
  hoverBorder: string
  hoverGradient: string
  path: string
}

// ─── Card Data ─────────────────────────────────────────────────────────────────
const automationCards: AutomationCard[] = [
  {
    title: "Campaigns",
    description: "Manage campaigns for your business.",
    icon: Megaphone,
    colorClass: "text-blue-600 dark:text-blue-400",
    bgClass: "bg-blue-100 dark:bg-blue-900/40",
    hoverBorder: "hover:border-blue-300 dark:hover:border-blue-800",
    hoverGradient: "from-blue-50/50 dark:from-blue-950/20",
    path: "/automation/campaigns",
  },
  {
    title: "Lead Capture Forms",
    description:
      "Create and manage reusable lead capture forms with simple or design editors.",
    icon: FileDown,
    colorClass: "text-red-600 dark:text-red-400",
    bgClass: "bg-red-100 dark:bg-red-900/40",
    hoverBorder: "hover:border-red-300 dark:hover:border-red-800",
    hoverGradient: "from-red-50/50 dark:from-red-950/20",
    path: "/automation/leadcapture",
  },
  /*{
    title: "Email Templates",
    description:
      "Create and manage reusable email templates with simple or design editors.",
    icon: MailPlus,
    colorClass: "text-purple-600 dark:text-purple-400",
    bgClass: "bg-purple-100 dark:bg-purple-900/40",
    hoverBorder: "hover:border-purple-300 dark:hover:border-purple-800",
    hoverGradient: "from-purple-50/50 dark:from-purple-950/20",
    path: "",
  },
  {
    title: "SMS Templates",
    description: "Create and manage reusable SMS templates.",
    icon: MessageCircle,
    colorClass: "text-green-600 dark:text-green-400",
    bgClass: "bg-green-100 dark:bg-green-900/40",
    hoverBorder: "hover:border-green-300 dark:hover:border-green-800",
    hoverGradient: "from-green-50/50 dark:from-green-950/20",
    path: "",
  },
  {
    title: "WhatsApp Templates",
    description: "Create and manage reusable WhatsApp templates.",
    icon: WhatsAppIcon as any,
    colorClass: "text-green-600 dark:text-green-400",
    bgClass: "bg-green-100 dark:bg-green-900/40",
    hoverBorder: "hover:border-green-300 dark:hover:border-green-800",
    hoverGradient: "from-green-50/50 dark:from-green-950/20",
    path: "",
  },
  */
]

// ─── Automation Page Component ─────────────────────────────────────────────────
export default function Automation() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")

  const filteredCards = automationCards.filter(
    (card) =>
      card.title.toLowerCase().includes(search.toLowerCase()) ||
      (card.description || "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 py-4 max-w-[90%] mx-auto w-full">
      {/* ── Search Bar ── */}
      <div className="relative max-w-sm mx-auto w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 bg-input/30 dark:bg-input/50"
        />
      </div>

      {/* ── Card Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-2">
        {filteredCards.map((card, index) => {
          const Icon = card.icon
          return (
            <Card
              key={index}
              className={`group relative overflow-hidden flex flex-col cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${card.hoverBorder}`}
              onClick={() => {
                if (card.path) {
                  navigate(card.path)
                } else {
                  alert(
                    `${card.title}: Please upgrade your plan to access this feature.`
                  )
                }
              }}
            >
              {/* Subtle background gradient on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.hoverGradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
              />
              <CardHeader className="flex flex-row items-start gap-4 pb-2 z-[1] w-full space-y-0">
                <div
                  className={`p-2.5 rounded-lg transition-colors group-hover:bg-background/80 ${card.bgClass} ${card.colorClass}`}
                >
                  <Icon size={24} strokeWidth={2} />
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                    {card.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="z-[1] pb-5 pt-2">
                <CardDescription className="text-sm leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}

        {/* ── No Results ── */}
        {filteredCards.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center h-[40vh] text-center">
            <div className="bg-muted p-6 rounded-2xl shadow-sm mb-4">
              <SearchX className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No Results Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn't find any matching tools. Try adjusting your search
              criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}