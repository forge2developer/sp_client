import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { 
  Users,
  CheckCircle2, 
  Package, 
  ShoppingBag, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  MousePointer2,
  Activity,
} from "lucide-react"
import { useState, useMemo } from "react"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const [filter, setFilter] = useState<"today" | "yesterday" | "week" | "month">("week")
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [date, setDate] = useState<{ from: Date | undefined, to: Date | undefined }>(() => {
    const now = new Date()
    const todayEnd = new Date(now.setHours(23, 59, 59, 999))
    const weekStart = new Date(now.setHours(0, 0, 0, 0))
    weekStart.setDate(weekStart.getDate() - 6)
    return { from: weekStart, to: todayEnd }
  })

  const handleFilterChange = (f: "today" | "yesterday" | "week" | "month") => {
    setFilter(f)
    const now = new Date()
    const todayStart = new Date(now.setHours(0, 0, 0, 0))
    const todayEnd = new Date(now.setHours(23, 59, 59, 999))

    if (f === "today") {
      setDate({ from: todayStart, to: todayEnd })
    } else if (f === "yesterday") {
      const yesterdayStart = new Date(todayStart)
      yesterdayStart.setDate(yesterdayStart.getDate() - 1)
      const yesterdayEnd = new Date(todayEnd)
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
      setDate({ from: yesterdayStart, to: yesterdayEnd })
    } else if (f === "week") {
      const weekStart = new Date(todayStart)
      weekStart.setDate(weekStart.getDate() - 6)
      setDate({ from: weekStart, to: todayEnd })
    } else if (f === "month") {
      const monthStart = new Date(todayStart)
      monthStart.setDate(monthStart.getDate() - 29)
      setDate({ from: monthStart, to: todayEnd })
    }
  }

  const formatDate = (d: Date | undefined) => {
    if (!d) return ""
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(d).replace(' at ', ', ')
  }

  const data = useMemo(() => {
    const configs = {
      today: {
        leads: { total: 42, added: 42, converted: 12 },
        ops: { booking: 8, visits: 15, completed: 5 },
        inventory: { total: 400, sold: 5, available: 395 },
        performance: [
          { date: "08:00", leads: 5, visits: 1, bookings: 0 },
          { date: "10:00", leads: 12, visits: 3, bookings: 1 },
          { date: "12:00", leads: 18, visits: 5, bookings: 2 },
          { date: "14:00", leads: 15, visits: 2, bookings: 0 },
          { date: "16:00", leads: 22, visits: 6, bookings: 4 },
          { date: "18:00", leads: 28, visits: 8, bookings: 3 },
          { date: "20:00", leads: 40, visits: 12, bookings: 7 },
        ]
      },
      yesterday: {
        leads: { total: 38, added: 38, converted: 8 },
        ops: { booking: 6, visits: 12, completed: 3 },
        inventory: { total: 400, sold: 3, available: 397 },
        performance: [
          { date: "08:00", leads: 4, visits: 1, bookings: 0 },
          { date: "10:00", leads: 10, visits: 2, bookings: 1 },
          { date: "12:00", leads: 15, visits: 4, bookings: 1 },
          { date: "14:00", leads: 12, visits: 3, bookings: 1 },
          { date: "16:00", leads: 18, visits: 5, bookings: 2 },
          { date: "18:00", leads: 22, visits: 6, bookings: 3 },
          { date: "20:00", leads: 35, visits: 10, bookings: 5 },
        ]
      },
      week: {
        leads: { total: 1284, added: 284, converted: 64 },
        ops: { booking: 54, visits: 86, completed: 42 },
        inventory: { total: 400, sold: 48, available: 352 },
        performance: [
          { date: "Sun", leads: 12, visits: 3, bookings: 1 },
          { date: "Mon", leads: 18, visits: 5, bookings: 2 },
          { date: "Tue", leads: 15, visits: 2, bookings: 0 },
          { date: "Wed", leads: 22, visits: 6, bookings: 4 },
          { date: "Thu", leads: 28, visits: 8, bookings: 3 },
          { date: "Fri", leads: 35, visits: 10, bookings: 5 },
          { date: "Sat", leads: 40, visits: 12, bookings: 7 },
        ]
      },
      month: {
        leads: { total: 5420, added: 1284, converted: 312 },
        ops: { booking: 210, visits: 340, completed: 180 },
        inventory: { total: 400, sold: 184, available: 216 },
        performance: [
          { date: "Week 1", leads: 850, visits: 150, bookings: 50 },
          { date: "Week 2", leads: 950, visits: 180, bookings: 60 },
          { date: "Week 3", leads: 820, visits: 140, bookings: 45 },
          { date: "Week 4", leads: 1100, visits: 210, bookings: 75 },
        ]
      }
    }
    return configs[filter]
  }, [filter])

  const stepX = 1000 / Math.max(1, data.performance.length - 1);

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 pb-20 animate-in fade-in duration-500">
        {/* Dashboard Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-1">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your CRM and inventory status.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
            {(["today", "yesterday", "week", "month"] as const).map((f) => (
              <button
                key={f}
                onClick={() => handleFilterChange(f)}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                  filter === f ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50 hover:text-foreground"
                )}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-3 px-4 min-w-[280px] justify-start text-left font-normal border-muted-foreground/20">
                <CalendarIcon className="size-4 shrink-0" />
                <span className="truncate">
                  {date.from ? (
                    date.to ? (
                      <>
                        {formatDate(date.from)} - {formatDate(date.to)}
                      </>
                    ) : (
                      formatDate(date.from)
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                selected={date}
                onSelect={(range) => range && setDate({ from: range.from, to: range.to })}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Leads Section */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.leads.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-500 font-medium inline-flex items-center gap-0.5">
                <ArrowUpRight className="size-3" /> 20.1%
              </span>{" "}
              from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Added {filter}</CardTitle>
            <MousePointer2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{data.leads.added.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              New leads in selected period
            </p>
          </CardContent>
        </Card>
        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Converted</CardTitle>
            <CheckCircle2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.leads.converted.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((data.leads.converted / (data.leads.added || 1)) * 100).toFixed(1)}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Stats Section */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Activity overview across the {filter} period.</CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:px-6">
            <div className="h-[200px] w-full pt-4 flex items-end gap-2 md:gap-3">
              {data.performance.map((v, i) => {
                const maxLeads = Math.max(...data.performance.map(d => d.leads))
                const h = (v.leads / maxLeads) * 160
                return (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <button 
                        className="flex-1 flex flex-col items-center justify-end gap-2 group cursor-pointer outline-none focus:outline-none"
                        onClick={(e) => e.preventDefault()}
                        onTouchStart={() => {}}
                      >
                        <div 
                          className="w-full max-w-[36px] bg-red-500/15 group-hover:bg-red-600 group-focus:bg-red-600 transition-all duration-500 rounded-t-xl rounded-b-sm relative overflow-hidden shadow-sm" 
                          style={{ height: `${Math.max(h, 4)}px` }}
                        >
                           <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium group-hover:text-red-600 group-focus:text-red-600 transition-colors">{v.date}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-white text-black border shadow-2xl p-3">
                      <div className="flex items-center gap-3">
                        <div className="size-2 rounded-full bg-red-600" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Leads</p>
                          <p className="text-sm font-bold">{v.leads}</p>
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                )
              })}
            </div>
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Lead Split</CardTitle>
            <CardDescription>Source distribution</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center space-y-4">
            {["Direct", "Social", "Search", "Ads"].map((label, i) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{[45, 30, 15, 10][i]}%</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${[45, 30, 15, 10][i]}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Operations Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight px-1">Operations</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase">Bookings</CardDescription>
              <CardTitle className="text-2xl">{data.ops.booking}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-red-600" style={{ width: "65%" }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase">Site Visits</CardDescription>
              <CardTitle className="text-2xl">{data.ops.visits}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500" style={{ width: "42%" }} />
              </div>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-semibold uppercase">Completed</CardDescription>
              <CardTitle className="text-2xl">{data.ops.completed}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="h-1 w-full bg-secondary mt-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: "88%" }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Inventory Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight px-1">Inventory Control</h2>
        
        {/* Inventory Summary Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Total Units</CardTitle>
              <Package className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.inventory.total}</div>
              <p className="text-[10px] text-muted-foreground mt-1"></p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Total Sold</CardTitle>
              <ShoppingBag className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{data.inventory.sold}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Confirmed sales in period</p>
            </CardContent>
          </Card>
          <Card className="sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Total Available</CardTitle>
              <CheckCircle2 className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-500">{data.inventory.available}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Ready for immediate booking</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="size-4 text-green-500" />
                  Inventory Pulse
                </CardTitle>
                <CardDescription>Leads, Visits, and Bookings trend</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <div className="h-[250px] w-full pt-4 relative group" onMouseLeave={() => setHoveredIndex(null)}>
                <svg viewBox="0 0 1000 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map((v) => (
                    <line key={v} x1="0" y1={v} x2="1000" y2={v} stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                  ))}

                  {/* Series 1: Leads (Light Grey) */}
                  <path 
                    d={`M0,${200 - (data.performance[0].leads/Math.max(...data.performance.map(d => d.leads)))*160} ${data.performance.slice(1).map((v, i) => `L${(i+1)*stepX},${200 - (v.leads/Math.max(...data.performance.map(d => d.leads)))*160}`).join(" ")}`} 
                    fill="none" stroke="#e5e7eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000"
                  />
                  {data.performance.map((v, i) => (
                    <circle key={`l-${i}`} cx={i * stepX} cy={200 - (v.leads/Math.max(...data.performance.map(d => d.leads)))*160} r="3" fill="#fff" stroke="#e5e7eb" strokeWidth="2" />
                  ))}

                  {/* Series 2: Visits (Dark Grey) */}
                  <path 
                    d={`M0,${200 - (data.performance[0].visits/Math.max(...data.performance.map(d => d.leads)))*160} ${data.performance.slice(1).map((v, i) => `L${(i+1)*stepX},${200 - (v.visits/Math.max(...data.performance.map(d => d.leads)))*160}`).join(" ")}`} 
                    fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-all duration-1000"
                  />
                  {data.performance.map((v, i) => (
                    <circle key={`v-${i}`} cx={i * stepX} cy={200 - (v.visits/Math.max(...data.performance.map(d => d.leads)))*160} r="3" fill="#fff" stroke="#6b7280" strokeWidth="2" />
                  ))}

                  {/* Series 3: Bookings (Black Dots) */}
                  {data.performance.map((v, i) => (
                    <circle key={`b-${i}`} cx={i * stepX} cy={200 - (v.bookings/Math.max(...data.performance.map(d => d.leads)))*160} r="3" fill="#fff" stroke="#111827" strokeWidth="2" />
                  ))}

                  {/* Hover Hitboxes */}
                  {data.performance.map((v, i) => (
                    <rect 
                      key={`hitbox-${i}`} 
                      x={i * stepX - (stepX / 2)} 
                      y="0" 
                      width={stepX} 
                      height="200" 
                      fill="transparent" 
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredIndex(i)}
                      onClick={() => setHoveredIndex(i)}
                      onTouchStart={(e) => {
                        // Prevent scroll on touch if we're just tapping a point
                        setHoveredIndex(i);
                      }}
                    />
                  ))}
                  
                  {/* Active Vertical Line */}
                  {hoveredIndex !== null && (
                    <line 
                      x1={hoveredIndex * stepX} 
                      y1="0" 
                      x2={hoveredIndex * stepX} 
                      y2="200" 
                      stroke="#ef4444" 
                      strokeWidth="1" 
                      strokeDasharray="4 4" 
                      className="opacity-50 pointer-events-none"
                    />
                  )}
                </svg>

                {/* Custom Absolute Tooltip */}
                {hoveredIndex !== null && (
                  <div 
                    className="absolute z-50 pointer-events-none transition-all duration-200 ease-out"
                    style={{ 
                      left: hoveredIndex === 0 ? '0%' : hoveredIndex === data.performance.length - 1 ? '100%' : `calc(${(hoveredIndex / (data.performance.length - 1)) * 100}% )`,
                      top: '20%',
                      transform: `translate(${hoveredIndex === 0 ? '0%' : hoveredIndex === data.performance.length - 1 ? '-100%' : '-50%'}, -100%)`,
                      marginTop: '-10px'
                    }}
                  >
                    <div className="bg-white text-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl border border-slate-100 flex overflow-hidden min-w-[220px]">
                      {/* Left: Time */}
                      <div className="bg-red-50/80 px-4 py-3 flex items-center justify-center border-r border-red-100">
                        <span className="text-xs font-black text-red-700">{data.performance[hoveredIndex].date}</span>
                      </div>
                      {/* Right: Metrics */}
                      <div className="flex-1 p-3 space-y-2 bg-white">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Leads</span>
                          </div>
                          <span className="text-xs font-black text-slate-700">{data.performance[hoveredIndex].leads}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-slate-500" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Visits</span>
                          </div>
                          <span className="text-xs font-black text-slate-700">{data.performance[hoveredIndex].visits}</span>
                        </div>
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full bg-slate-900" />
                            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Bookings</span>
                          </div>
                          <span className="text-xs font-black text-red-600">{data.performance[hoveredIndex].bookings}</span>
                        </div>
                      </div>
                    </div>
                    {/* Bottom Pointer (SVG) */}
                    <svg className="absolute -bottom-2 -translate-x-1/2 transition-all duration-200" style={{ left: hoveredIndex === 0 ? '24px' : hoveredIndex === data.performance.length - 1 ? 'calc(100% - 24px)' : '50%' }} width="16" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8 8L0 0H16L8 8Z" fill="white" />
                      <path d="M8 8L0 0M16 0L8 8" stroke="#f1f5f9" strokeWidth="1" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Custom Legend */}
              <div className="flex items-center justify-center gap-6 mt-8">
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-1 bg-[#d1d5db] rounded-full" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">Total Leads</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="w-3 h-1 bg-[#4b5563] rounded-full" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">Site Visits</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full border-2 border-[#111827] bg-white" />
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">Bookings</span>
                 </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sales Composition</CardTitle>
              <CardDescription>Stock status ratio</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center pb-8">
              <div className="relative size-32">
                <svg viewBox="0 0 36 36" className="size-full -rotate-90">
                  <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--secondary))" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="16" fill="none" 
                    stroke="rgb(220, 38, 38)" 
                    strokeWidth="3" 
                    strokeDasharray={`${(data.inventory.sold / data.inventory.total) * 100} 100`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold">{((data.inventory.sold / data.inventory.total) * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 w-full text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-red-600" />
                  <span className="text-muted-foreground">Sold ({data.inventory.sold})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-secondary" />
                  <span className="text-muted-foreground">Avail ({data.inventory.available})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </TooltipProvider>
  )
}
