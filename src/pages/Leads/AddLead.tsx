import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
    ChevronLeft, 
    Save, 
    X, 
    User, 
    Mail, 
    Phone, 
    Building2, 
    Briefcase,
    DollarSign,
    FileText,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";

interface LeadFormData {
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    source: string;
    value: number;
    notes: string;
    assignedTo: string;
}

export function AddLead() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<LeadFormData>({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "New",
        source: "Direct",
        value: 0,
        notes: "",
        assignedTo: "shadcn"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "value" ? parseFloat(value) || 0 : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/leads", formData);
            navigate("/lead-list");
        } catch (error) {
            console.error("Error saving lead:", error);
            alert("Failed to save lead. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Add New Lead</h1>
                    <p className="text-muted-foreground">Fill in the details to create a new potential lead.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <User className="h-4 w-4 text-primary" /> Basic Information
                            </CardTitle>
                            <CardDescription>Primary contact details for this lead.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="name" 
                                        name="name" 
                                        placeholder="e.g. John Doe" 
                                        className="pl-9" 
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="email" 
                                        name="email" 
                                        type="email" 
                                        placeholder="john@example.com" 
                                        className="pl-9" 
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="phone" 
                                        name="phone" 
                                        placeholder="+1 (555) 000-0000" 
                                        className="pl-9"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Business Details */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-primary" /> Business Details
                            </CardTitle>
                            <CardDescription>Company and opportunity information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="company">Company Name</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="company" 
                                        name="company" 
                                        placeholder="Acme Corp" 
                                        className="pl-9"
                                        value={formData.company}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="value">Lead Value ($)</Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        id="value" 
                                        name="value" 
                                        type="number" 
                                        placeholder="0.00" 
                                        className="pl-9"
                                        value={formData.value}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="status">Status</Label>
                                    <select 
                                        id="status" 
                                        name="status"
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={formData.status}
                                        onChange={handleChange}
                                    >
                                        <option value="New">New</option>
                                        <option value="Contacted">Contacted</option>
                                        <option value="Qualified">Qualified</option>
                                        <option value="Proposal">Proposal</option>
                                        <option value="Negotiation">Negotiation</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="source">Source</Label>
                                    <select 
                                        id="source" 
                                        name="source"
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        value={formData.source}
                                        onChange={handleChange}
                                    >
                                        <option value="Direct">Direct</option>
                                        <option value="Referral">Referral</option>
                                        <option value="Website">Website</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="Email Campaign">Email Campaign</option>
                                    </select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes & Additional Info */}
                    <Card className="border-none shadow-sm md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <FileText className="h-4 w-4 text-primary" /> Additional Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes</Label>
                                <textarea 
                                    id="notes" 
                                    name="notes"
                                    placeholder="Add any additional context or requirements here..." 
                                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    value={formData.notes}
                                    onChange={handleChange}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => navigate(-1)} className="gap-2">
                        <X className="h-4 w-4" /> Cancel
                    </Button>
                    <Button type="submit" className="gap-2 px-8" disabled={loading}>
                        <Save className="h-4 w-4" /> {loading ? "Saving..." : "Save Lead"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
