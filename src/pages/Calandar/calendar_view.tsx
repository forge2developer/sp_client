import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
    CalendarBody, 
    CalendarDate, 
    CalendarDatePagination, 
    CalendarHeader, 
    CalendarItem, 
    CalendarMonthPicker, 
    CalendarProvider, 
    CalendarYearPicker,
    useCalendarMonth,
    useCalendarYear
} from "@/components/ui/shadcn-io/calendar";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, CalendarClock, CalendarCheck, Check, User, ExternalLink, X } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface MetricValue {
    key: string;
    count: number;
}

interface MetricDay {
    date: string;
    metrics: MetricValue[];
}

interface MetricConfig {
    key: string;
    label: string;
    color: string;
}

interface CalendarData {
    days: MetricDay[];
    config: MetricConfig[];
}

interface LeadDetail {
    id: string;
    name: string;
    phone: string;
    status: string;
    project_name?: string;
    plot_label?: string;
    updatedAt: string;
}

interface UserInfo {
    _id: string;
    name: string;
}

interface ProjectInfo {
    product_id: number;
    name: string;
}

export default function CalendarView() {
    return (
        <CalendarProvider locale="en-US">
            <CalendarContent />
        </CalendarProvider>
    );
}

function CalendarContent() {
    const [month, setMonth] = useCalendarMonth();
    const [year, setYear] = useCalendarYear();
    const [data, setData] = useState<CalendarData | null>(null);
    const [, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
    const [leads, setLeads] = useState<LeadDetail[]>([]);
    const [loadingLeads, setLoadingLeads] = useState(false);
    const [sheetOpen, setSheetOpen] = useState(false);

    // Filter states
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [projects, setProjects] = useState<ProjectInfo[]>([]);
    const [selectedUser, setSelectedUser] = useState<string>("all");
    const [selectedProject, setSelectedProject] = useState<string>("all");

    const fetchFilterData = async () => {
        try {
            const token = localStorage.getItem("token");
            const [usersRes, projectsRes] = await Promise.all([
                axios.get(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/projects`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            
            const userData = usersRes.data?.data;
            const projectData = projectsRes.data?.data;

            setUsers(Array.isArray(userData) ? userData : []);
            setProjects(Array.isArray(projectData) ? projectData : []);
        } catch (error) {
            console.error("Failed to fetch filter data", error);
            setUsers([]);
            setProjects([]);
        }
    };

    useEffect(() => {
        fetchFilterData();
    }, []);

    const fetchMetrics = async () => {
        if (month === undefined || year === undefined) return;
        
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            // Validate month and year to prevent RangeError
            const safeMonth = Math.max(0, Math.min(11, month ?? new Date().getMonth()));
            const safeYear = (year && year > 0) ? year : new Date().getFullYear();
            
            let startDate, endDate;
            try {
                startDate = new Date(safeYear, safeMonth, 1).toISOString();
                endDate = new Date(safeYear, safeMonth + 1, 0).toISOString();
            } catch (dateError) {
                console.error("Date calculation error:", { safeYear, safeMonth }, dateError);
                return;
            }
            
            const response = await axios.get(`${API_URL}/api/dashboard/calendar-metrics`, {
                params: { 
                    startDate, 
                    endDate,
                    userId: selectedUser === "all" ? undefined : selectedUser,
                    projectId: selectedProject === "all" ? undefined : selectedProject
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch calendar metrics", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (month !== undefined && year !== undefined) {
            fetchMetrics();
        }
    }, [month, year, selectedUser, selectedProject]);

    const fetchLeads = async (date: string, metricKey: string) => {
        setLoadingLeads(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_URL}/api/dashboard/leads-by-metric`, {
                params: { 
                    date, 
                    metricKey,
                    userId: selectedUser === "all" ? undefined : selectedUser,
                    projectId: selectedProject === "all" ? undefined : selectedProject
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setLeads(response.data);
        } catch (error) {
            console.error("Failed to fetch leads by metric", error);
        } finally {
            setLoadingLeads(false);
        }
    };

    const handleItemClick = (date: string, metricKey: string) => {
        setSelectedDate(date);
        setSelectedMetric(metricKey);
        setSheetOpen(true);
        fetchLeads(date, metricKey);
    };

    const clearFilters = () => {
        const now = new Date();
        setMonth(now.getMonth() as any);
        setYear(now.getFullYear());
        setSelectedUser("all");
        setSelectedProject("all");
    };

    const isFilterActive = useMemo(() => {
        const now = new Date();
        const monthChanged = month !== now.getMonth();
        const yearChanged = year !== now.getFullYear();
        const userFilterActive = selectedUser !== "all";
        const projectFilterActive = selectedProject !== "all";
        
        return monthChanged || yearChanged || userFilterActive || projectFilterActive;
    }, [month, year, selectedUser, selectedProject]);

    const features = useMemo(() => {
        if (!data) return [];
        return data.days.flatMap(day => {
            const [y, m, d] = day.date.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            
            return day.metrics.map(m => {
                const config = data.config.find(c => c.key === m.key);
                return {
                    id: `${day.date}-${m.key}`,
                    name: `${config?.label || m.key} [${m.count}]`,
                    startAt: date,
                    endAt: date,
                    status: {
                        id: m.key,
                        name: config?.label || m.key,
                        color: config?.color || "#000"
                    }
                };
            });
        });
    }, [data]);

    const stats = useMemo(() => {
        if (!data) return { totalScheduled: 0, totalDone: 0, totalBooked: 0 };
        return {
            totalScheduled: data.days.reduce((acc, day) => acc + (day.metrics.find(m => m.key === 'site_visit_scheduled')?.count || 0), 0),
            totalDone: data.days.reduce((acc, day) => acc + (day.metrics.find(m => m.key === 'site_visit_done')?.count || 0), 0),
            totalBooked: data.days.reduce((acc, day) => acc + (day.metrics.find(m => m.key === 'booked_units')?.count || 0), 0),
        };
    }, [data]);

    return (
        <div className="px-4 space-y-4 py-4">
           

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <CalendarDate>
                    <div className="flex flex-row items-center gap-6 px-4 py-4">
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Month</span>
                            <CalendarMonthPicker className="!h-9 w-44" />
                        </div>
                        
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Year</span>
                            <CalendarYearPicker start={2024} end={2026} className="!h-9 w-44" />
                        </div>

                        <div className="flex flex-row items-center gap-2">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">User</span>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                                <SelectTrigger className="w-44 !h-9 shadow-none border-zinc-200 bg-transparent">
                                    <SelectValue placeholder="All Users" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="max-h-[280px]">
                                        <SelectItem value="all">All Users</SelectItem>
                                        {users.map(u => (
                                            <SelectItem key={u._id} value={u._id}>{u.name}</SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-row items-center gap-2">
                            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Project</span>
                            <Select value={selectedProject} onValueChange={setSelectedProject}>
                                <SelectTrigger className="w-44 !h-9 shadow-none border-zinc-200 bg-transparent">
                                    <SelectValue placeholder="All Projects" />
                                </SelectTrigger>
                                <SelectContent>
                                    <ScrollArea className="max-h-[280px]">
                                        <SelectItem value="all">All Projects</SelectItem>
                                        {projects.map(p => (
                                            <SelectItem key={p.product_id} value={p.product_id.toString()}>{p.name}</SelectItem>
                                        ))}
                                    </ScrollArea>
                                </SelectContent>
                            </Select>
                        </div>

                        {isFilterActive && (
                            <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={clearFilters}
                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                title="Clear filters"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <div className="flex items-center mr-2">
                        <CalendarDatePagination stats={stats} />
                    </div>
                </CalendarDate>
                
                <CalendarHeader />
                
                <CalendarBody features={features}>
                    {({ feature }) => (
                        <div 
                            key={feature.id}
                            onClick={() => {
                                const date = feature.endAt.toISOString().split('T')[0];
                                handleItemClick(date, feature.status.id);
                            }}
                            className="cursor-pointer"
                        >
                            <CalendarItem feature={feature} />
                        </div>
                    )}
                </CalendarBody>
            </div>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetContent className="sm:max-w-md p-0">
                    <ScrollArea className="h-screen p-6 pb-12">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2">
                                {selectedMetric === 'site_visit_scheduled' && <CalendarClock className="h-5 w-5 text-indigo-600" />}
                                {selectedMetric === 'site_visit_done' && <CalendarCheck className="h-5 w-5 text-emerald-600" />}
                                {selectedMetric === 'booked_units' && <Check className="h-5 w-5 text-amber-600" />}
                                <span>
                                    {data?.config.find(c => c.key === selectedMetric)?.label} Details
                                </span>
                            </SheetTitle>
                            <SheetDescription>
                                Showing activities for {selectedDate}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="mt-6 space-y-4">
                            {loadingLeads ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex flex-col gap-2 p-3 border rounded-lg animate-pulse">
                                        <div className="h-4 w-1/3 bg-muted rounded" />
                                        <div className="h-3 w-1/2 bg-muted rounded" />
                                    </div>
                                ))
                            ) : leads.length > 0 ? (
                                leads.map((lead) => (
                                    <div key={lead.id} className="p-3 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-semibold text-sm">{lead.name}</h4>
                                            <Badge variant="outline" className="text-[10px]">
                                                {lead.status}
                                            </Badge>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3" />
                                                {lead.phone}
                                            </div>
                                            {lead.project_name && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3 w-3" />
                                                    {lead.project_name} {lead.plot_label && `(${lead.plot_label})`}
                                                </div>
                                            )}
                                        </div>
                                        <Button variant="ghost" size="sm" className="w-full h-8 text-xs gap-2 mt-2">
                                            View Lead Profile <ExternalLink className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-muted-foreground italic">
                                    No leads found for this metric.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </SheetContent>
            </Sheet>
        </div>
    );
}