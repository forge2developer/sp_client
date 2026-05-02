import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    ChevronLeft,
    Target,
    Plus,
    Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import api, { grpcApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const organization = "SP_PROMOTERS";

const CONTACT_FIELD_GROUPS = [
    {
        title: "Contact Fields",
        fields: [
            { id: "email", label: "Email Address" },
            { id: "location", label: "Current Location" },
            { id: "street_address", label: "Street address" },
            { id: "city", label: "City" },
            { id: "state", label: "State" },
            { id: "province", label: "Province" },
            { id: "country", label: "Country" },
            { id: "post_code", label: "Post code" },
            { id: "zip_code", label: "Zip code" },
        ],
    },
    {
        title: "Demographic Questions",
        fields: [
            { id: "dob", label: "Date of birth" },
            { id: "gender", label: "Gender" },
            { id: "marital_status", label: "Marital status" },
            { id: "relationship_status", label: "Relationship status" },
            { id: "military_status", label: "Military status" },
            { id: "education_level", label: "Education level" },
        ],
    },
    {
        title: "Work Information",
        fields: [
            { id: "job_title", label: "Job title" },
            { id: "work_phone", label: "Work phone number" },
            { id: "work_email", label: "Work email" },
            { id: "company_name", label: "Company name" },
            { id: "website", label: "Website" },
        ],
    },
];

const REQUIREMENT_FIELDS = [
    { id: "budget", label: "Budget Range" },
    { id: "preferred_location", label: "Preferred Location" },
    { id: "preferred_floor", label: "Preferred Floor" },
    { id: "interested_projects", label: "Interested Projects / Types" },
    { id: "sqft", label: "Square Footage" },
    { id: "bhk", label: "Type (BHK)", options: ["1BHK", "2BHK", "3BHK", "4BHK", "5BHK+"] },
    { id: "parking_needed", label: "Parking", options: ["REQUIRED", "NOT REQUIRED"] },
    { id: "furnishing", label: "Furnishing", options: ["FURNISHED", "UNFURNISHED", "SEMI-FURNISHED"] },
    { id: "bathroom_count", label: "Bathroom Count" },
];

export function AddLead() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [configs, setConfigs] = useState<any[]>([]);
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedConfig, setSelectedConfig] = useState<any | null>(null);
    const [isFormView, setIsFormView] = useState(false);
    const [dynamicFormData, setDynamicFormData] = useState<any>({});
    const [configLoading, setConfigLoading] = useState(true);

    // Dynamic Options for dropdowns
    const [availableSources, setAvailableSources] = useState<any[]>([]);
    const [availableSubSources, setAvailableSubSources] = useState<any[]>([]);

    const [projects, setProjects] = useState<any[]>([]);

    React.useEffect(() => {
        const init = async () => {
            setConfigLoading(true);
            try {
                const [configRes, campaignRes, projectRes] = await Promise.all([
                    api.get("/grpc/lead-capture-configs?organization=SP_PROMOTERS"),
                    api.get("/grpc/campaigns?organization=SP_PROMOTERS"),
                    api.get("/grpc/projects?organization=SP_PROMOTERS")
                ]);
                setConfigs(configRes.data.data || []);
                setCampaigns(campaignRes.data.data || []);
                setProjects(projectRes.data.data || []);
            } catch (error) {
                console.error("Initialization error:", error);
            } finally {
                setConfigLoading(false);
            }
        };
        init();
    }, []);

    // Sync available sources when campaign changes
    React.useEffect(() => {
        const campaignName = dynamicFormData.campaign;
        if (!campaignName || campaignName === "none") {
            setAvailableSources([]);
            return;
        }
        const campaignObj = campaigns.find(c => c.campaignName === campaignName);
        setAvailableSources(campaignObj?.sources || []);
    }, [dynamicFormData.campaign, campaigns]);

    // Sync available sub-sources when source changes
    React.useEffect(() => {
        const sourceName = dynamicFormData.source;
        if (!sourceName || sourceName === "none") {
            setAvailableSubSources([]);
            return;
        }
        const sourceObj = availableSources.find(s => s.sourceName === sourceName);
        setAvailableSubSources(sourceObj?.subSources || []);
    }, [dynamicFormData.source, availableSources]);

    const handleConfigClick = (config: any) => {
        setSelectedConfig(config);
        
        // Robust project name lookup
        let projectName = "";
        const targetProjectIds = config.project_ids || [];
        
        if (targetProjectIds.length > 0) {
            const proj = projects.find(p => (p.id || p._id) === targetProjectIds[0]);
            if (proj) projectName = proj.name;
        }

        const initialData: any = {
            campaign: config.campaign_name || config.campaignName || "",
            source: config.source || "",
            sub_source: config.sub_source || config.subSource || "",
            interested_projects: projectName
        };
        
        setDynamicFormData(initialData);
        setIsFormView(true);
    };

    const handleDynamicSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Map project name from interested_projects back to ID if possible
            const selectedProjectObj = projects.find(p => p.name === dynamicFormData.interested_projects);
            const submissionProjectIds = selectedProjectObj 
                ? [selectedProjectObj.id || selectedProjectObj._id] 
                : (Array.isArray(selectedConfig.project_ids) ? selectedConfig.project_ids.filter((id: any) => !!id) : []);

            // Separate core fields from requirement data
            const { name, phone, email, source, sub_source, campaign, ...requirements } = dynamicFormData;

            const payload = {
                name: name || "",
                phone: phone || "",
                email: email || "",
                organization: "SP_PROMOTERS",
                project_ids: submissionProjectIds,
                config_id: selectedConfig.id,
                source: source === "none" ? "Direct" : (source || selectedConfig.source || "Direct"),
                sub_source: sub_source === "none" ? "" : (sub_source || selectedConfig.sub_source || ""),
                campaign: campaign === "none" ? (selectedConfig.name || "Direct") : (campaign || selectedConfig.campaign_name || selectedConfig.name),
                requirement_data: {
                    ...requirements,
                    primary_project: dynamicFormData.interested_projects || ""
                }
            };
            await api.post("/leads", payload);
            setIsFormView(false);
            setDynamicFormData({});
            navigate("/lead-list");
        } catch (error) {
            console.error("Submission error:", error);
            alert("Failed to save lead.");
        } finally {
            setLoading(false);
        }
    };

    if (isFormView && selectedConfig) {
        return (
            <div className="flex flex-col min-h-screen bg-slate-50/30 dark:bg-zinc-950">
                <div className="flex-1 p-8">
                    <div className="max-w-5xl mx-auto">
                        <div className="bg-white dark:bg-zinc-900 rounded-md border border-muted overflow-hidden shadow-sm">
                            <form onSubmit={handleDynamicSubmit} className="divide-y divide-muted">

                                {/* ── Section 1: Contact Information ── */}
                                <div className="p-10 space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Contact Information</h2>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Full Name <span className="text-red-600 ml-1">*</span></Label>
                                            <Input
                                                required
                                                placeholder="Enter full name"
                                                className="h-12 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6"
                                                value={dynamicFormData.name || ""}
                                                onChange={(e) => setDynamicFormData({ ...dynamicFormData, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">Phone Number <span className="text-red-600 ml-1">*</span></Label>
                                            <Input
                                                required
                                                placeholder="Enter phone number"
                                                className="h-12 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6"
                                                value={dynamicFormData.phone || ""}
                                                onChange={(e) => setDynamicFormData({ ...dynamicFormData, phone: e.target.value })}
                                            />
                                        </div>

                                        {/* Standard Selected Contact Fields */}
                                        {selectedConfig.selected_contact_fields?.map((fieldId: string) => {
                                            const field = CONTACT_FIELD_GROUPS.flatMap(g => g.fields).find(f => f.id === fieldId);
                                            const label = field ? field.label : fieldId.replace(/_/g, ' ');
                                            return (
                                                <div key={fieldId} className="space-y-3">
                                                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">
                                                        {label}
                                                    </Label>
                                                    <Input
                                                        placeholder={`Enter ${label.toLowerCase()}`}
                                                        className="h-12 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6"
                                                        value={dynamicFormData[fieldId] || ""}
                                                        onChange={(e) => setDynamicFormData({ ...dynamicFormData, [fieldId]: e.target.value })}
                                                    />
                                                </div>
                                            );
                                        })}

                                        {/* Manual Contact Fields */}
                                        {selectedConfig.manual_contact_fields?.map((f: any, idx: number) => (
                                            <div key={`manual-contact-${idx}`} className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-foreground">{f.key}</Label>
                                                <Input
                                                    placeholder={`Enter ${f.key.toLowerCase()}`}
                                                    className="h-12 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6"
                                                    value={dynamicFormData[f.key] || ""}
                                                    onChange={(e) => setDynamicFormData({ ...dynamicFormData, [f.key]: e.target.value })}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* ── Section 2: Requirements ── */}
                                <div className="p-10 space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                            <h2 className="text-sm font-black uppercase tracking-[0.2em]">Requirements</h2>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                         {/* Standard Selected Requirement Fields */}
                                         {selectedConfig.selected_fields?.map((fieldId: string) => {
                                             const field = REQUIREMENT_FIELDS.find(f => f.id === fieldId);
                                             const label = field ? field.label : fieldId.replace(/_/g, ' ');
                                             
                                             return (
                                                 <div key={fieldId} className="space-y-4">
                                                     <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70 px-1">
                                                         {label}
                                                     </Label>
                                                     {fieldId === "interested_projects" ? (
                                                         (selectedConfig.project_ids && selectedConfig.project_ids.length > 0) ? (
                                                             <Input
                                                                 disabled
                                                                 value={dynamicFormData[fieldId] || "Assigned Project"}
                                                                 className="h-12 rounded-md border-slate-200 bg-slate-100 text-slate-500 text-xs font-black px-6 shadow-sm cursor-not-allowed opacity-80"
                                                             />
                                                         ) : (
                                                             <Select
                                                                 onValueChange={(v) => setDynamicFormData({ ...dynamicFormData, [fieldId]: v })}
                                                                 value={dynamicFormData[fieldId] || ""}
                                                             >
                                                                 <SelectTrigger className="h-12 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6 shadow-sm">
                                                                     <SelectValue placeholder="Select Interested Project" />
                                                                 </SelectTrigger>
                                                                 <SelectContent>
                                                                     {projects.length > 0 ? (
                                                                         projects.map((p) => (
                                                                             <SelectItem key={p.id || p._id} value={p.name}>
                                                                                 {p.name}
                                                                             </SelectItem>
                                                                         ))
                                                                     ) : (
                                                                         <div className="p-4 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                                                                             No projects available
                                                                         </div>
                                                                     )}
                                                                 </SelectContent>
                                                             </Select>
                                                         )
                                                     ) : field?.options ? (
                                                         <div className="flex flex-wrap gap-2">
                                                             {field.options.map((opt) => (
                                                                 <button
                                                                     key={opt}
                                                                     type="button"
                                                                     onClick={() => setDynamicFormData({ ...dynamicFormData, [fieldId]: opt })}
                                                                     className={cn(
                                                                         "h-10 px-6 rounded-md flex items-center justify-center text-[10px] font-black tracking-widest border transition-all duration-300",
                                                                         dynamicFormData[fieldId] === opt
                                                                             ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20 scale-105"
                                                                             : "border-slate-200 bg-white text-slate-500 hover:border-red-600 hover:text-red-600"
                                                                     )}
                                                                 >
                                                                     {opt}
                                                                 </button>
                                                             ))}
                                                         </div>
                                                     ) : (
                                                         <Input
                                                             placeholder={`Enter ${label.toLowerCase()}`}
                                                             className="h-12 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6 shadow-sm"
                                                             value={dynamicFormData[fieldId] || ""}
                                                             onChange={(e) => setDynamicFormData({ ...dynamicFormData, [fieldId]: e.target.value })}
                                                         />
                                                     )}
                                                 </div>
                                             );
                                         })}

                                         {/* Manual Requirement Fields */}
                                         {selectedConfig.manual_requirements?.map((f: any, idx: number) => (
                                             <div key={`manual-req-${idx}`} className="space-y-4">
                                                 <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70 px-1">{f.key}</Label>
                                                 <Input
                                                     placeholder={`Enter ${f.key.toLowerCase()}`}
                                                     className="h-12 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6 shadow-sm"
                                                     value={dynamicFormData[f.key] || ""}
                                                     onChange={(e) => setDynamicFormData({ ...dynamicFormData, [f.key]: e.target.value })}
                                                 />
                                             </div>
                                         ))}

                                         {(!selectedConfig.selected_fields?.length && !selectedConfig.manual_requirements?.length) && (
                                             <div className="col-span-full py-8 px-6 border-2 border-dashed border-slate-100 rounded-md text-center bg-slate-50/30">
                                                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">No custom requirement fields configured</p>
                                             </div>
                                         )}
                                     </div>
                                 </div>

                                {/* ── Section 3: Acquisition Source ── */}
                                <div className="p-10 space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                        <h2 className="text-sm font-black uppercase tracking-[0.2em]">Acquisition Source</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70 px-1">Campaign Name <span className="text-red-600 ml-1">*</span></Label>
                                            <Select
                                                value={dynamicFormData.campaign || ""}
                                                onValueChange={(value) => setDynamicFormData({ ...dynamicFormData, campaign: value })}
                                            >
                                                <SelectTrigger className="h-12 w-full rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6 border shadow-sm">
                                                    <SelectValue placeholder="Select Campaign" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    <SelectItem value="none" className="text-xs font-bold text-muted-foreground/60 italic">Select Campaign</SelectItem>
                                                    {campaigns.map(c => (
                                                        <SelectItem key={c.id} value={c.campaignName} className="text-xs font-bold">
                                                            {c.campaignName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70 px-1">Source <span className="text-red-600 ml-1">*</span></Label>
                                            <Select
                                                value={dynamicFormData.source || ""}
                                                onValueChange={(value) => setDynamicFormData({ ...dynamicFormData, source: value })}
                                                disabled={!dynamicFormData.campaign || dynamicFormData.campaign === "none"}
                                            >
                                                <SelectTrigger className="h-12 w-full rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6 border shadow-sm disabled:opacity-50">
                                                    <SelectValue placeholder="Select Source" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    <SelectItem value="none" className="text-xs font-bold text-muted-foreground/60 italic">Select Source</SelectItem>
                                                    {availableSources.map(s => (
                                                        <SelectItem key={s.uuid || s.sourceName} value={s.sourceName} className="text-xs font-bold">
                                                            {s.sourceName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70 px-1">Sub Source</Label>
                                            <Select
                                                value={dynamicFormData.sub_source || ""}
                                                onValueChange={(value) => setDynamicFormData({ ...dynamicFormData, sub_source: value })}
                                                disabled={!dynamicFormData.source || dynamicFormData.source === "none"}
                                            >
                                                <SelectTrigger className="h-12 w-full rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-bold px-6 border shadow-sm disabled:opacity-50">
                                                    <SelectValue placeholder="Select Sub Source" />
                                                </SelectTrigger>
                                                <SelectContent className="max-h-[300px]">
                                                    <SelectItem value="none" className="text-xs font-bold text-muted-foreground/60 italic">Select Sub Source</SelectItem>
                                                    {availableSubSources.map(ss => (
                                                        <SelectItem key={ss.uuid || ss.subSourceName} value={ss.subSourceName} className="text-xs font-bold">
                                                            {ss.subSourceName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* ── Action Bar ── */}
                                <div className="p-10 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-end gap-4">
                                    <Button type="button" variant="ghost" onClick={() => setIsFormView(false)} className="h-12 px-8 font-black text-[10px] tracking-[0.2em] rounded-md">
                                        CANCEL
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-[0.2em] h-12 px-12 rounded-md shadow-lg shadow-red-600/10 transition-all flex items-center gap-2">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>SUBMIT<ChevronLeft className="h-4 w-4 rotate-180" /></>}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl w-full space-y-4 py-4">
                <div className="flex items-center justify-between ">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-foreground">Add New Lead</h1>
                        <p className="text-muted-foreground text-xs">Select a project template to deploy a new lead entry.</p>
                    </div>
                </div>  

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {configLoading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-48 rounded-md border border-dashed animate-pulse bg-muted/20" />
                        ))
                    ) : configs.length > 0 ? (
                        configs.map((config) => (
                            <div
                                key={config.id}
                                onClick={() => handleConfigClick(config)}
                                className="group cursor-pointer p-8 rounded-xl border border-slate-200 bg-white hover:border-red-600 hover:shadow-2xl hover:shadow-red-600/5 transition-all duration-300 flex items-start gap-6"
                            >
                                <div className="h-14 w-14 rounded-xl bg-red-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors duration-300">
                                    <Target className="h-6 w-6 text-red-600 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-foreground group-hover:text-red-600 transition-colors leading-tight tracking-tighter">
                                        {(() => {
                                            const ids = config.project_ids || [];
                                            if (ids.length === 0) return "Global Project";
                                            if (ids.length > 1) return `${ids.length} Projects`;
                                            const proj = projects.find(p => (p.id || p._id) === ids[0]);
                                            return proj ? proj.name : "Targeted Project";
                                        })()}
                                    </h3>
                                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                                        Deploy the <span className="text-red-600 uppercase tracking-widest text-[10px] ml-1">{config.name}</span> capture template for high-fidelity data entry.
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full p-20 rounded-xl border-2 border-dashed border-muted text-center bg-white/50">
                            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">No active templates found</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-2 italic">Create a configuration in Automations to get started</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
