import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    ChevronLeft, 
    Mail, 
    Phone, 
    Building2, 
    Calendar, 
    Edit, 
    Trash2,
    CheckCircle2,
    Clock,
    DollarSign,
    MoreVertical,
    Send,
    MessageSquare,
    ArrowRight,
    TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const statusColors = {
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
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLead = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/leads/${id}`);
                const data = await response.json();
                setLead(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching lead:", error);
                setLoading(false);
            }
        };
        fetchLead();
    }, [id]);

    if (loading) return <div className="p-6 text-center">Loading Lead Details...</div>;
    if (!lead) return <div className="p-6 text-center text-destructive">Lead not found.</div>;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate("/lead-list")}>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold">
                        {lead.name.charAt(0)}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{lead.name}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[lead.status] || "bg-gray-100 text-gray-700"}`}>
                                {lead.status}
                            </span>
                        </div>
                        <p className="text-muted-foreground flex items-center gap-2 mt-1">
                            <Building2 className="h-4 w-4" /> {lead.company || "Individual"} • <Mail className="h-4 w-4 ml-1" /> {lead.email}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Edit className="h-4 w-4" /> Edit Lead
                    </Button>
                    <Button variant="default" className="gap-2">
                        <MessageSquare className="h-4 w-4" /> Log Activity
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-primary/5 border-primary/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <DollarSign className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Deal Value</p>
                                <p className="text-2xl font-bold text-foreground">${lead.value?.toLocaleString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Source</p>
                                <p className="text-2xl font-bold text-foreground">{lead.source}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-500/10 rounded-lg">
                                <Calendar className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Created On</p>
                                <p className="text-lg font-bold text-foreground">{new Date(lead.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg">
                                <Clock className="h-5 w-5 text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground font-medium">Last Contact</p>
                                <p className="text-lg font-bold text-foreground">2 days ago</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Details Column */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle>Lead Overview</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Contact Phone</p>
                                    <p className="text-foreground font-medium flex items-center gap-2 mt-1">
                                        <Phone className="h-4 w-4 text-muted-foreground" /> {lead.phone || "Not provided"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Agent</p>
                                    <p className="text-foreground font-medium flex items-center gap-2 mt-1">
                                        <div className="h-6 w-6 rounded-full bg-primary text-[10px] text-white flex items-center justify-center font-bold">JD</div>
                                        {lead.assignedTo}
                                    </p>
                                </div>
                            </div>
                            <Separator />
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Internal Notes</p>
                                <p className="text-foreground mt-2 bg-muted/30 p-4 rounded-lg italic">
                                    {lead.notes || "No additional notes provided for this lead."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline / Activity Feed */}
                    <Card className="border-none shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Activity History</CardTitle>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/5">View All</Button>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="relative pl-6 border-l-2 border-muted space-y-8">
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-background" />
                                    <div>
                                        <p className="text-sm font-semibold">Lead Created</p>
                                        <p className="text-xs text-muted-foreground">Successfully added to the CRM via {lead.source}</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(lead.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[31px] top-0 h-4 w-4 rounded-full bg-blue-500 border-4 border-background" />
                                    <div>
                                        <p className="text-sm font-semibold">System Notification</p>
                                        <p className="text-xs text-muted-foreground">Welcome email sent automatically.</p>
                                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(lead.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column */}
                <div className="space-y-6">
                    <Card className="border-none shadow-sm bg-primary text-primary-foreground">
                        <CardHeader>
                            <CardTitle className="text-lg">Next Steps</CardTitle>
                            <CardDescription className="text-primary-foreground/70">Recommended actions for this lead.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button variant="secondary" className="w-full justify-start gap-3">
                                <Phone className="h-4 w-4" /> Schedule Discovery Call
                            </Button>
                            <Button variant="secondary" className="w-full justify-start gap-3">
                                <Send className="h-4 w-4" /> Send Proposal
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">Lead Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold">84/100</div>
                                <div className="h-12 w-12 rounded-full border-4 border-primary border-t-muted animate-spin-slow" />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">Highly likely to convert based on current data.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
