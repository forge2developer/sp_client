import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Mail,
    Building2,
    ArrowUpRight,
    User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { grpcApi, type Lead } from "@/lib/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// Removed local Lead interface as it's now imported from @/lib/api

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
            const response = await grpcApi.get("/leads");
            setLeads(response.data.data || []);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching leads:", error);
            setLoading(false);
        }
    };

    const filteredLeads = leads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            

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
                    <div className="rounded-xl border border-muted overflow-hidden bg-white">
                        <Table>
                            <TableHeader className="bg-gray-900/[0.03]">
                                <TableRow>
                                    <TableHead className="font-medium">Lead Info</TableHead>
                                    <TableHead className="font-medium">Campaign</TableHead>
                                    <TableHead className="font-medium">Source</TableHead>
                                    <TableHead className="font-medium">Sub Source</TableHead>
                                    <TableHead className="font-medium text-nowrap">Received On</TableHead>
                                    <TableHead className="font-medium">Assigned</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            Loading leads...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredLeads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No leads found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLeads.map((lead) => (
                                        <TableRow
                                            key={lead.id || lead._id}
                                            className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                            onClick={() => navigate(`/lead-dashboard/${lead.id || lead._id}`)}
                                        >
                                            {(() => {
                                                const latestResponse = lead.campaign_responses && lead.campaign_responses.length > 0
                                                    ? lead.campaign_responses[lead.campaign_responses.length - 1]
                                                    : null;
                                                return (
                                                    <>
                                                        <TableCell>
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
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {latestResponse?.campaign || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {latestResponse?.source || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {latestResponse?.sub_source || "N/A"}
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground text-nowrap">
                                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-xs">
                                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                    {lead.assignedTo}
                                                </div>
                                            </TableCell>
                                                    </>
                                                );
                                            })()}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
