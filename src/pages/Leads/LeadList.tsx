import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
    Plus, 
    Search, 
    Filter, 
    MoreHorizontal, 
    Phone, 
    Mail, 
    Building2, 
    ArrowUpRight,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // I'll implement a simple Badge if missing or use span

interface Lead {
    _id: string;
    name: string;
    email: string;
    company?: string;
    status: string;
    value?: number;
    assignedTo: string;
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

export function LeadList() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/leads");
            const data = await response.json();
            setLeads(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leads:", error);
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter(lead => 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Lead Management</h1>
                    <p className="text-muted-foreground mt-1">Manage and track your potential customers.</p>
                </div>
                <Button onClick={() => navigate("/add-lead")} className="gap-2">
                    <Plus className="h-4 w-4" /> Add New Lead
                </Button>
            </div>

            <Card className="border-none shadow-sm bg-card">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search leads by name, company, or email..." 
                                className="pl-9 bg-background/50 border-muted"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="gap-2">
                            <Filter className="h-4 w-4" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-muted overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-muted-foreground border-b border-muted">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Lead Info</th>
                                    <th className="px-4 py-3 text-left font-medium">Company</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Value</th>
                                    <th className="px-4 py-3 text-left font-medium">Assigned</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-muted">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                            Loading leads...
                                        </td>
                                    </tr>
                                ) : filteredLeads.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                                            No leads found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <tr 
                                            key={lead._id} 
                                            className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/lead-dashboard/${lead._id}`)}
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                                                            {lead.name}
                                                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </div>
                                                        <div className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                                            <Mail className="h-3 w-3" /> {lead.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-muted-foreground">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {lead.company || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[lead.status] || "bg-gray-100 text-gray-700"}`}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 font-medium text-foreground">
                                                ${lead.value?.toLocaleString() || "0"}
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2 text-xs">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {lead.assignedTo}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => {
                                                    e.stopPropagation();
                                                    // Handle actions
                                                }}>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
