import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Mail,
    Phone,
    Building2,
    Calendar,
    Clock,
    Send,
    MessageSquare,
    Target,
    ListChecks,
    StickyNote,
    Shuffle,
    ClipboardCheck,
    LayoutGrid,
    ClipboardList
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { grpcApi, type Lead } from "@/lib/api";

// Removed local Lead interface as it's now imported from @/lib/api

interface LeadActivity {
    _id: string;
    type: string;
    content: string;
    user_name: string;
    createdAt: string;
}

const statusColors: Record<string, string> = {
    "New": "bg-blue-100 text-blue-700 border-blue-200",
    "Contacted": "bg-yellow-100 text-yellow-700 border-yellow-200",
    "Qualified": "bg-green-100 text-green-700 border-green-200",
    "Proposal": "bg-purple-100 text-purple-700 border-purple-200",
    "Negotiation": "bg-orange-100 text-orange-700 border-orange-200",
    "Closed Won": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Closed Lost": "bg-red-100 text-red-700 border-red-200",
};

export function LeadDashboard() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [lead, setLead] = useState<Lead | null>(null);
    const [activities, setActivities] = useState<LeadActivity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeadAndActivities = async () => {
            try {
                const [leadRes, activitiesRes] = await Promise.all([
                    grpcApi.get(`/leads/${id}`),
                    grpcApi.get(`/leads/${id}/activities`)
                ]);
                setLead(leadRes.data.data);
                setActivities(activitiesRes.data.data || []);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching lead data:", error);
                setLoading(false);
            }
        };
        if (id) fetchLeadAndActivities();
    }, [id]);

    if (loading) return <div className="p-6 text-center">Loading Lead Details...</div>;
    if (!lead) return <div className="p-6 text-center text-destructive">Lead not found.</div>;

    return (
        <TooltipProvider delayDuration={300}>
            {/* <div className="p-8 max-w-[1600px] mx-auto bg-[#f8f9fa] min-h-screen"> */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
                {/* LEFT COLUMN: LeadSquared-inspired Profile Sidebar */}
                <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-8">
                    {/* DARK PROFILE CARD */}
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
                        <div className="p-6 relative">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 mb-0.5 tracking-tight">{lead.name}</h2>
                                    <p className="text-sm text-red-600 italic font-semibold">Lead Profile</p>
                                </div>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-500 border border-indigo-100/50">
                                            <Shuffle className="h-4.5 w-4.5" />
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Reassign Lead</p>
                                    </TooltipContent>
                                </Tooltip>
                            </div>

                            <div className="space-y-4 mt-6">
                                <div className="flex items-center gap-4 group">
                                    <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center border border-red-100/50">
                                        <Mail className="h-4 w-4 text-red-500" />
                                    </div>
                                    <span className="text-sm text-gray-600 truncate font-semibold">{lead.email}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center border border-red-100/50">
                                        <Phone className="h-4 w-4 text-red-500" />
                                    </div>
                                    <span className="text-sm text-gray-600 font-semibold">{lead.phone || "Not provided"}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-8 rounded-xl bg-red-50 flex items-center justify-center border border-red-100/50">
                                        <Building2 className="h-4 w-4 text-red-500" />
                                    </div>
                                    <span className="text-sm text-gray-600 font-semibold">{lead.company || "Individual"}</span>
                                </div>
                            </div>
                        </div>

                        {/* STATS SECTION */}
                        <div className="grid grid-cols-3 border-t border-gray-100 bg-gray-50/50">
                            <div className="p-4 text-center border-r border-gray-100">
                                <p className="text-sm font-black text-gray-900">{new Date(lead.createdAt).toLocaleDateString()}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mt-1 leading-none">Created</p>
                            </div>
                            <div className="p-4 text-center border-r border-gray-100">
                                <p className="text-sm font-black text-gray-900">{activities.length > 0 ? new Date(activities[0].createdAt).toLocaleDateString() : "None"}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mt-1 leading-none">Active</p>
                            </div>
                            <div className="p-4 text-center">
                                <p className="text-sm font-black text-[#dc2626]">${lead.value?.toLocaleString() || "0"}</p>
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider mt-1 leading-none">Value</p>
                            </div>
                        </div>
                        <div className="p-4 grid grid-cols-4 gap-2 border-t border-gray-100 bg-gray-50/30">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-500 border border-orange-100/50">
                                        <StickyNote className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Add Note</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-500 border border-emerald-100/50">
                                        <Phone className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Make Call</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-500 border border-purple-100/50">
                                        <MessageSquare className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>Send SMS</p></TooltipContent>
                            </Tooltip>

                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-500 border border-teal-100/50 relative">
                                        <ClipboardCheck className="h-4 w-4" />
                                        <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-emerald-500 rounded-full text-[7px] text-white flex items-center justify-center font-bold border-2 border-white">1</span>
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent><p>View Tasks</p></TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* PROPERTIES CARD */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Leads Properties</h3>
                            <ChevronLeft className="h-4 w-4 text-slate-400 rotate-270" />
                        </div>
                        <div className="divide-y divide-gray-50">
                            <div className="grid grid-cols-2 px-5 py-3 items-center hover:bg-gray-50/50 transition-colors">
                                <span className="text-sm font-bold text-slate-400">Owner</span>
                                <span className="text-sm font-black text-slate-700 text-right">{lead.assignedTo || "Unassigned"}</span>
                            </div>
                            <div className="grid grid-cols-2 px-5 py-3 items-center bg-gray-50/30 hover:bg-gray-50/50 transition-colors">
                                <span className="text-sm font-bold text-slate-400">Lead Source</span>
                                <span className="text-sm font-black text-slate-700 text-right">{lead.source || "Direct"}</span>
                            </div>
                            <div className="grid grid-cols-2 px-5 py-3 items-center hover:bg-gray-50/50 transition-colors">
                                <span className="text-sm font-bold text-slate-400">Received On</span>
                                <span className="text-sm font-black text-slate-700 text-right">{new Date(lead.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="grid grid-cols-2 px-5 py-3 items-center bg-gray-50/30 hover:bg-gray-50/50 transition-colors">
                                <span className="text-sm font-bold text-slate-400">Status</span>
                                <Badge className={`ml-auto text-[10px] font-black uppercase px-3 py-0.5 h-5 border-0 ${statusColors[lead.status] || "bg-gray-100 text-gray-700"}`}>
                                    {lead.status}
                                </Badge>
                            </div>
                            <div className="grid grid-cols-2 px-5 py-3 items-center hover:bg-gray-50/50 transition-colors">
                                <span className="text-sm font-bold text-slate-400">Value</span>
                                <span className="text-sm font-black text-slate-700 text-right">${lead.value?.toLocaleString() || "0"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Activity & Content area */}
                <div className="lg:col-span-9 space-y-3">
                    <Tabs defaultValue="timeline" className="w-full">
                        <TabsList className="bg-white p-1.5 rounded-xl border border-gray-100 w-full justify-start h-auto gap-2 p-5 shadow-sm">
                            <TabsTrigger value="timeline" className="rounded-lg px-8 py-4 text-sm font-black data-[state=active]:bg-[#fef2f2] data-[state=active]:text-[#dc2626] transition-all">
                                <Clock className="h-4.5 w-4.5 mr-2" /> Timeline
                            </TabsTrigger>
                            <TabsTrigger value="projects" className="rounded-lg px-8 py-4 text-sm font-black data-[state=active]:bg-[#fef2f2] data-[state=active]:text-[#dc2626] transition-all">
                                <LayoutGrid className="h-4.5 w-4.5 mr-2" /> Projects
                            </TabsTrigger>
                            <TabsTrigger value="requirements" className="rounded-lg px-8 py-4 text-sm font-black data-[state=active]:bg-[#fef2f2] data-[state=active]:text-[#dc2626] transition-all">
                                <ClipboardList className="h-4.5 w-4.5 mr-2" /> Requirements
                            </TabsTrigger>
                            <TabsTrigger value="campaign" className="rounded-lg px-8 py-4 text-sm font-black data-[state=active]:bg-[#fef2f2] data-[state=active]:text-[#dc2626] transition-all">
                                <Target className="h-4.5 w-4.5 mr-2" /> Campaign
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="timeline" className="mt-0 outline-none">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-white">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-black text-gray-900">Activity Timeline</h3>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button size="sm" className="bg-[#dc2626] hover:bg-[#b91c1c] text-white rounded-lg px-4 font-bold text-xs">
                                                    <MessageSquare className="h-3.5 w-3.5 mr-2" /> Log Activity
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="left">
                                                <p>Record new activity</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                </div>
                                <div className="p-8 space-y-8 relative">
                                    <div className="absolute left-[51px] top-8 bottom-8 w-px bg-gray-100"></div>
                                    {activities.length > 0 ? (
                                        activities.map((activity) => (
                                            <div key={activity._id} className="relative flex gap-6 group">
                                                <div className="z-10 h-10 w-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                                                    {activity.type === 'System' ? (
                                                        <Clock className="h-4 w-4 text-blue-500" />
                                                    ) : activity.type === 'Call' ? (
                                                        <Phone className="h-4 w-4 text-emerald-500" />
                                                    ) : (
                                                        <Send className="h-4 w-4 text-[#dc2626]" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col pt-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-black text-gray-900">{activity.type}</span>
                                                        <span className="text-[10px] font-bold text-gray-400">•</span>
                                                        <span className="text-[10px] font-bold text-gray-400">{new Date(activity.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} at {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 font-medium leading-relaxed">{activity.content}</p>
                                                    <div className="flex items-center gap-1.5 mt-2">
                                                        <div className="h-4 w-4 rounded-full bg-gray-200 text-[8px] flex items-center justify-center font-bold text-gray-500 uppercase">
                                                            {activity.user_name?.charAt(0) || "S"}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Logged by {activity.user_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 flex flex-col items-center gap-4">
                                            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
                                                <Calendar className="h-8 w-8 text-gray-200" />
                                            </div>
                                            <p className="text-sm font-bold text-gray-400">No activities recorded yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="projects" className="mt-0 outline-none">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-black text-gray-900 mb-6">Interested Projects</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {lead.interestedProjects?.length ? lead.interestedProjects.map((project, idx) => (
                                        <div key={idx} className="p-5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-4 hover:border-[#dc2626]/30 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                                    <Building2 className="h-5 w-5 text-[#dc2626]" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{project}</p>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Property Listing</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 mt-2">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="sm" variant="outline" className="text-[10px] h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold">Click Booking</Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Start Booking</p></TooltipContent>
                                                </Tooltip>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button size="sm" variant="outline" className="text-[10px] h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold">Site Visit</Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent><p>Schedule Visit</p></TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </div>
                                    )) : (
                                        <>
                                            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                                        <Building2 className="h-5 w-5 text-[#dc2626]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">The Grand Residency</p>
                                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Premium Apartment</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <Button size="sm" variant="outline" className="text-[10px] h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold">Click Booking</Button>
                                                    <Button size="sm" variant="outline" className="text-[10px] h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold">Schedule Visit</Button>
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-lg bg-white shadow-sm flex items-center justify-center">
                                                        <Building2 className="h-5 w-5 text-[#dc2626]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">Green Valley Villas</p>
                                                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">Luxury Villa</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                    <Button size="sm" variant="outline" className="text-[10px] h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold">Click Booking</Button>
                                                    <Button size="sm" variant="outline" className="text-[10px] h-8 border-red-200 text-red-600 hover:bg-red-50 font-bold">Schedule Visit</Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="requirements" className="mt-0 outline-none">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-black text-gray-900 mb-6">Specific Requirements</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Preferred Location</span>
                                            <p className="text-sm font-bold text-gray-700">{lead.requirements?.location || "Downtown / Central Area"}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Budget Range</span>
                                            <p className="text-sm font-bold text-[#dc2626]">{lead.requirements?.budget || "$500,000 - $750,000"}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Property Type</span>
                                            <p className="text-sm font-bold text-gray-700">{lead.requirements?.type || "3 BHK Apartment"}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">Purchase Urgency</span>
                                            <Badge variant="outline" className="w-fit bg-orange-50 text-orange-600 border-orange-100 font-bold uppercase text-[9px] tracking-widest">
                                                {lead.requirements?.urgency || "Immediate (1-3 months)"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <Separator className="my-6" />
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium bg-gray-50 p-4 rounded-xl">
                                    <ListChecks className="h-4 w-4 text-[#dc2626]" />
                                    Lead is looking for a south-facing balcony and high-floor unit.
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="campaign" className="mt-0 outline-none">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-black text-gray-900 mb-6">Campaign Performance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="p-4 rounded-xl bg-[#fef2f2] border border-[#fee2e2] text-center">
                                        <span className="text-[10px] font-black text-[#dc2626] uppercase tracking-wider block mb-1">Response Score</span>
                                        <span className="text-3xl font-black text-[#dc2626]">{lead.campaignResponse?.score || "92"}%</span>
                                    </div>
                                    <div className="md:col-span-2 space-y-4 pt-1">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                            <span className="text-xs font-bold text-gray-500">Active Campaign</span>
                                            <span className="text-xs font-black text-gray-900">{lead.campaign || "Spring Luxury Launch"}</span>
                                        </div>
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                            <span className="text-xs font-bold text-gray-500">Last Interaction</span>
                                            <span className="text-xs font-black text-gray-900">{lead.campaignResponse?.lastAction || "Form Submitted"}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs font-bold text-gray-500">Status</span>
                                            <Badge className="bg-emerald-500 text-white border-0 font-bold uppercase text-[9px] tracking-widest">
                                                {lead.campaignResponse?.status || "Engaged"}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

            //     </div>
            {/* </div> */}
        </TooltipProvider>
    );
}
