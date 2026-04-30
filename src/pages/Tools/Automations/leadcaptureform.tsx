import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Check,
  Target,
  SlidersHorizontal,
  FileText,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Loader2,
  CircleCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import api, { grpcApi, type Project } from "@/lib/api"

// ─── Constants & Groups ────────────────────────────────────────────────────────
const organization = "SP_PROMOTERS"

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
]

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
]

const STEPS = [
  { id: 1, title: "STEP 1", label: "FORM BUILDER", icon: Target },
  { id: 2, title: "STEP 2", label: "ROUTING OPTIONS", icon: SlidersHorizontal },
  { id: 3, title: "STEP 3", label: "PREVIEW & SAVE", icon: FileText },
]

// ─── Component ─────────────────────────────────────────────────────────────────
export default function LeadCaptureForm() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const formId = searchParams.get("id")

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)

  // Sheet States
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false)
  const [isReqSheetOpen, setIsReqSheetOpen] = useState(false)
  const [newManualKey, setNewManualKey] = useState("")

  // Options
  const [projects, setProjects] = useState<Project[]>([])

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    source: "",
    campaignName: "",
    subSource: "",
    projectId: "",
    status: "Active",
    selectedContactFields: ["email", "location"] as string[],
    manualContactFields: [] as { key: string }[],
    selectedRequirementFields: ["budget", "interested_projects", "bhk", "parking_needed"] as string[],
    manualRequirementFields: [] as { key: string }[],
    assignedPeople: [] as any[],
  })

  // ── Initial Fetch ──
  useEffect(() => {
    const init = async () => {
      setFetching(true)
      try {
        const projRes = await grpcApi.get(`/projects?organization=${organization}`)
        setProjects(projRes.data.data || [])

        if (formId) {
          const res = await grpcApi.get(`/lead-capture-configs/${formId}`)
          const config = res.data.data
          setFormData({
            name: config.name,
            source: config.source || "",
            campaignName: config.campaignName || "",
            subSource: config.subSource || "",
            projectId: config.projectId || "",
            status: config.status,
            selectedContactFields: config.selected_contact_fields || [],
            manualContactFields: config.manual_contact_fields || [],
            selectedRequirementFields: config.selected_fields || [],
            manualRequirementFields: config.manual_requirements || [],
            assignedPeople: config.assigned_people || [],
          })
        }
      } catch (error) {
        console.error("Initialization failed:", error)
      } finally {
        setFetching(false)
      }
    }
    init()
  }, [formId])

  // ── Handlers ──
  const toggleField = (id: string, type: "contact" | "requirement") => {
    const key = type === "contact" ? "selectedContactFields" : "selectedRequirementFields"
    setFormData((prev) => ({
      ...prev,
      [key]: prev[key].includes(id)
        ? prev[key].filter((f) => f !== id)
        : [...prev[key], id],
    }))
  }

  const addManualField = (type: "contact" | "requirement") => {
    if (!newManualKey.trim()) return
    const key = type === "contact" ? "manualContactFields" : "manualRequirementFields"
    setFormData((prev) => ({
      ...prev,
      [key]: [...(prev[key] as any), { key: newManualKey.trim() }],
    }))
    setNewManualKey("")
  }

  const removeManualField = (index: number, type: "contact" | "requirement") => {
    const key = type === "contact" ? "manualContactFields" : "manualRequirementFields"
    setFormData((prev) => ({
      ...prev,
      [key]: (prev[key] as any).filter((_: any, i: number) => i !== index),
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        organization,
        name: formData.name || `${formData.source} Lead Form`,
        source: formData.source,
        campaign_name: formData.campaignName,
        sub_source: formData.subSource,
        project_id: formData.projectId || null,
        status: formData.status,
        selected_contact_fields: formData.selectedContactFields,
        manual_contact_fields: formData.manualContactFields,
        selected_fields: formData.selectedRequirementFields,
        manual_requirements: formData.manualRequirementFields,
        assigned_people: formData.assignedPeople,
      }

      if (formId) {
        await api.put(`/lead-capture-configs/${formId}`, payload)
      } else {
        await api.post("/lead-capture-configs", payload)
      }

      navigate("/automation/leadcapture")
    } catch (error) {
      alert("Failed to save configuration")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Initializing Repository...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto w-full py-8 px-4 space-y-12">
      {/* ── Stepper ── */}
      <div className="flex items-center justify-center py-8 gap-0 max-w-5xl mx-auto">
        {STEPS.map((step, idx) => {
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center gap-4 relative">
                <div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 border-4 shadow-sm cursor-pointer",
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isActive
                      ? "bg-red-600 border-red-600 text-white scale-110 shadow-lg shadow-red-600/30 ring-4 ring-red-50 dark:ring-red-950/20"
                      : "bg-white dark:bg-zinc-950 border-muted text-muted-foreground"
                  )}
                  onClick={() => isCompleted && setCurrentStep(step.id)}
                >
                  {isCompleted ? <Check className="h-10 w-10" /> : <step.icon className="h-10 w-10" />}
                </div>
                <div className="text-center absolute -bottom-14 whitespace-nowrap">
                  <p className={cn("text-[10px] font-black tracking-widest", isActive ? "text-zinc-900 dark:text-zinc-100" : "text-muted-foreground")}>
                    {step.title}
                  </p>
                  <p className={cn("text-[10px] font-black tracking-widest", isActive ? "text-red-600" : "text-muted-foreground")}>
                    {step.label}
                  </p>
                </div>
              </div>
              
              {idx < STEPS.length - 1 && (
                <div className="w-32 h-1 bg-muted mx-4 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-red-600 transition-all duration-500",
                      isCompleted ? "w-full" : "w-0"
                    )} 
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <main className="">
        {currentStep === 1 && (
          <div className="space-y-0 max-w-5xl mx-auto overflow-hidden border rounded-xl shadow-sm bg-card">
            {/* ── Contact Section ── */}
            <section className="p-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Contact Information</h3>
                </div>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 font-black text-[9px] tracking-widest h-9 shadow-lg shadow-red-600/10"
                  onClick={() => setIsContactSheetOpen(true)}
                >
                  + ADD FIELDS
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Full Name <span className="text-red-500">*</span></Label>
                  <Input disabled placeholder="Enter full name" className="h-14 bg-muted/20 border-muted rounded-xl" />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Phone Number <span className="text-red-500">*</span></Label>
                  <Input disabled placeholder="Enter phone number" className="h-14 bg-muted/20 border-muted rounded-xl" />
                </div>

                {formData.selectedContactFields.map((id) => {
                  const field = CONTACT_FIELD_GROUPS.flatMap(g => g.fields).find(f => f.id === id)
                  if (!field) return null
                  return (
                    <div key={id} className="space-y-3 group relative">
                      <div className="flex items-center justify-between">
                         <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{field.label}</Label>
                         <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-red-600"
                          onClick={() => toggleField(id, "contact")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="relative">
                        <Input disabled placeholder={`Enter ${field.label.toLowerCase()}`} className="h-14 bg-background border-muted rounded-xl" />
                      </div>
                    </div>
                  )
                })}

                {formData.manualContactFields.map((f, idx) => (
                  <div key={`manual-${idx}`} className="space-y-3 group relative">
                    <div className="flex items-center justify-between">
                       <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{f.key}</Label>
                       <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-600"
                        onClick={() => removeManualField(idx, "contact")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Input disabled placeholder={`Enter ${f.key.toLowerCase()}`} className="h-14 bg-background border-muted rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* ── Requirements Section ── */}
            <section className="p-10 space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.3)]" />
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Requirements</h3>
                </div>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white rounded-xl px-6 font-black text-[9px] tracking-widest h-9 shadow-lg shadow-red-600/10"
                  onClick={() => setIsReqSheetOpen(true)}
                >
                  + ADD FIELDS
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {formData.selectedRequirementFields.map((id) => {
                  const field = REQUIREMENT_FIELDS.find(f => f.id === id)
                  if (!field) return null
                  
                  return (
                    <div key={id} className="space-y-4 group relative">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{field.label}</Label>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-red-600"
                          onClick={() => toggleField(id, "requirement")}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>

                      {field.options ? (
                        <div className="flex flex-wrap gap-2">
                          {field.options.map((opt) => (
                            <div 
                              key={opt} 
                              className="h-10 px-4 rounded-xl flex items-center justify-center text-[10px] font-black tracking-widest border bg-muted/5 border-muted/60 text-muted-foreground/80 hover:bg-muted/10 cursor-default transition-all"
                            >
                              {opt}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="relative">
                          <Input disabled placeholder={`e.g. ${field.label.split(' ')[0]}...`} className="h-14 bg-background border-muted rounded-xl" />
                        </div>
                      )}
                    </div>
                  )
                })}
                {formData.manualRequirementFields.map((f, idx) => (
                  <div key={idx} className="space-y-4 group relative">
                    <div className="flex items-center justify-between">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{f.key}</Label>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-red-600"
                        onClick={() => removeManualField(idx, "requirement")}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="relative">
                      <Input disabled placeholder={`Enter ${f.key.toLowerCase()}`} className="h-14 bg-background border-muted rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* ── Acquisition Source Section ── */}
            <section className="p-10 space-y-10">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Acquisition Source</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 pt-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Campaign Name <span className="text-red-600">*</span></Label>
                  <Input 
                    disabled
                    placeholder="Enter campaign name" 
                    value={formData.campaignName}
                    onChange={(e) => setFormData({ ...formData, campaignName: e.target.value })}
                    className="h-14 bg-muted/20 border-muted rounded-xl px-6" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Source <span className="text-red-600">*</span></Label>
                  <Input 
                    disabled
                    placeholder="e.g. Facebook, Google" 
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="h-14 bg-muted/20 border-muted rounded-xl px-6" 
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Sub Source <span className="text-red-600">*</span></Label>
                  <Input 
                    disabled
                    placeholder="e.g. landing-page-v2" 
                    value={formData.subSource}
                    onChange={(e) => setFormData({ ...formData, subSource: e.target.value })}
                    className="h-14 bg-muted/20 border-muted rounded-xl px-6" 
                  />
                </div>
              </div>
            </section>
          </div>
        )}

        {/* --- Steps 2 & 3 --- */}
        {currentStep === 2 && (
          <div className="max-w-5xl mx-auto border rounded-xl shadow-sm bg-card overflow-hidden">
             <section className="p-10 space-y-12">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black">Routing & Project Rules</h2>
                  <p className="text-muted-foreground text-sm">Select where leads should be tracked and form visibility.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Tracking Project</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(v) => setFormData({ ...formData, projectId: v })}
                    >
                      <SelectTrigger className="h-14 rounded-xl bg-background border-muted">
                        <SelectValue placeholder="Select Target Project" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((p) => (
                          <SelectItem key={p._id || p.id} value={p._id || p.id || ""}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v })}
                    >
                      <SelectTrigger className="h-14 rounded-xl bg-background border-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-16 border-2 border-dashed border-muted rounded-xl text-center space-y-6 bg-muted/10">
                  <div className="h-20 w-20 bg-background rounded-full flex items-center justify-center mx-auto border shadow-sm">
                    <SlidersHorizontal className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black">Post-Sales Distribution</h4>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">Automated routing to the Post-Sales and CRM teams will be active soon.</p>
                  </div>
                </div>
             </section>
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-5xl mx-auto border rounded-xl bg-card overflow-hidden">
            <div className="bg-white dark:bg-zinc-950 p-10 border-b flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tighter">FINAL FORM PREVIEW</h2>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1">Validated structure for lead deployment</p>
              </div>
              <div className="flex items-center gap-3 px-6 py-2.5 rounded-xl border-2 border-emerald-500/20 bg-emerald-500/5 text-emerald-600 font-black text-[10px] tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Configuration
              </div>
            </div>

            <div className="p-10 space-y-16">
              {/* --- Contact Preview --- */}
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  <h3 className="text-base font-black text-foreground uppercase tracking-[0.1em]">Contact Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Full Name <span className="text-red-500">*</span></Label>
                    <Input placeholder="Enter full name" className="h-14 bg-background border-muted rounded-xl px-6" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Phone Number <span className="text-red-500">*</span></Label>
                    <Input placeholder="Enter phone number" className="h-14 bg-background border-muted rounded-xl px-6" />
                  </div>
                  {formData.selectedContactFields.map((id) => {
                    const field = CONTACT_FIELD_GROUPS.flatMap(g => g.fields).find(f => f.id === id)
                    return field ? (
                      <div key={id} className="space-y-3">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{field.label}</Label>
                        <Input placeholder={`Enter ${field.label.toLowerCase()}`} className="h-14 bg-background border-muted rounded-xl px-6" />
                      </div>
                    ) : null
                  })}
                  {formData.manualContactFields.map((f, idx) => (
                    <div key={`m-c-${idx}`} className="space-y-3">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{f.key}</Label>
                      <Input placeholder={`Enter ${f.key.toLowerCase()}`} className="h-14 bg-background border-muted rounded-xl px-6" />
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="opacity-50" />

              {/* --- Requirements Preview --- */}
              <section className="space-y-10">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
                  <h3 className="text-base font-black text-foreground uppercase tracking-[0.1em]">Property Requirements</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                  {formData.selectedRequirementFields.map((id) => {
                    const field = REQUIREMENT_FIELDS.find(f => f.id === id)
                    if (!field) return null
                    return (
                      <div key={id} className="space-y-4">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{field.label}</Label>
                        {field.options ? (
                          <div className="flex flex-wrap gap-2">
                            {field.options.map((opt) => (
                              <div key={opt} className="h-10 px-4 rounded-xl flex items-center justify-center text-[10px] font-black tracking-widest border border-muted/60 bg-muted/5 text-muted-foreground/80 hover:bg-muted/10 cursor-pointer transition-all">
                                {opt}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <Input placeholder={`Enter ${field.label.toLowerCase()}`} className="h-14 bg-background border-muted rounded-xl px-6" />
                        )}
                      </div>
                    )
                  })}
                  {formData.manualRequirementFields.map((f, idx) => (
                    <div key={`m-r-${idx}`} className="space-y-3">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{f.key}</Label>
                      <Input placeholder={`Enter ${f.key.toLowerCase()}`} className="h-14 bg-background border-muted rounded-xl px-6" />
                    </div>
                  ))}
                </div>
              </section>

              <Separator className="opacity-50" />

              {/* --- Acquisition Preview --- */}
              <section className="space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Acquisition Source</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="p-6 rounded-xl bg-muted/20 border border-muted space-y-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Campaign</p>
                    <p className="text-xs font-black text-foreground">{formData.campaignName || " "}</p>
                  </div>
                  <div className="p-6 rounded-xl bg-muted/20 border border-muted space-y-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Source</p>
                    <p className="text-xs font-black text-foreground">{formData.source || " "}</p>
                  </div>
                  <div className="p-6 rounded-xl bg-muted/20 border border-muted space-y-2">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">Sub-Source</p>
                    <p className="text-xs font-black text-foreground">{formData.subSource || " "}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div className="flex justify-end gap-4 pt-12 pb-24 max-w-5xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => (currentStep === 1 ? navigate("/automation/leadcapture") : setCurrentStep(currentStep - 1))}
            className="font-black text-[11px] h-12 px-8 rounded-xl bg-muted/50 text-muted-foreground hover:bg-muted"
          >
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>
          <Button
            onClick={() => (currentStep === 3 ? handleSave() : setCurrentStep(currentStep + 1))}
            className="font-black text-[11px] h-12 px-8 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-xl transition-all"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="animate-spin h-4 w-4" />
            ) : currentStep === 3 ? (
              "Deploy Configuration"
            ) : (
              <>
                Next Step <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </main>

      {/* ── Contact Fields Sheet ── */}
      <Sheet open={isContactSheetOpen} onOpenChange={setIsContactSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] p-0 flex flex-col h-full border-l shadow-2xl">
          <SheetHeader className="px-6 py-5 border-b shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
            <SheetTitle className="text-lg font-black tracking-tight">Field Registry</SheetTitle>
            <SheetDescription className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Add data capture fields</SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="prebuilt" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 shrink-0">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-10">
                <TabsTrigger value="prebuilt" className="text-[11px] font-black uppercase tracking-widest h-8">Pre-built</TabsTrigger>
                <TabsTrigger value="manual" className="text-[11px] font-black uppercase tracking-widest h-8">Manual Input</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="prebuilt" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full px-6 pb-10">
                {CONTACT_FIELD_GROUPS.map((group) => (
                  <div key={group.title} className="space-y-3 mb-8">
                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 px-1">{group.title}</h4>
                    <div className="grid gap-2">
                      {group.fields.map((f) => {
                        const isSelected = formData.selectedContactFields.includes(f.id);
                        return (
                          <div
                            key={f.id}
                            className={cn(
                              "flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer group",
                              isSelected
                                ? "border-red-600 bg-red-50/20 dark:bg-red-900/10 shadow-sm"
                                : "border-muted/40 bg-background hover:border-muted-foreground/30"
                            )}
                            onClick={() => toggleField(f.id, "contact")}
                          >
                            <span className={cn("text-[13px] font-bold transition-colors", isSelected ? "text-red-600" : "text-foreground")}>{f.label}</span>
                            {isSelected ? (
                              <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
                                <Check className="h-3 w-3 text-white stroke-[3]" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-muted group-hover:border-muted-foreground/40 transition-colors" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="manual" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full px-6 space-y-6">
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Custom Field Label</Label>
                    <Input 
                      placeholder="e.g. Alternate WhatsApp" 
                      value={newManualKey}
                      onChange={(e) => setNewManualKey(e.target.value)}
                      className="h-12 rounded-xl bg-muted/10 border-muted focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <Button className="w-full h-12 rounded-xl font-black text-[10px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20" onClick={() => addManualField("contact")}>
                    ADD CUSTOM FIELD
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="p-6 border-t mt-auto shrink-0 bg-white dark:bg-zinc-950">
            <Button className="w-full h-12 rounded-xl font-black text-[11px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20" onClick={() => setIsContactSheetOpen(false)}>
              APPLY REGISTRY
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Requirements Fields Sheet ── */}
      <Sheet open={isReqSheetOpen} onOpenChange={setIsReqSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[480px] p-0 flex flex-col h-full border-l shadow-2xl">
          <SheetHeader className="px-6 py-5 border-b shrink-0 bg-zinc-50/50 dark:bg-zinc-900/20">
            <SheetTitle className="text-lg font-black tracking-tight">Data Requirements</SheetTitle>
            <SheetDescription className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Define capture fields</SheetDescription>
          </SheetHeader>
          
          <Tabs defaultValue="prebuilt" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 shrink-0">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg h-10">
                <TabsTrigger value="prebuilt" className="text-[11px] font-black uppercase tracking-widest h-8">Pre-built</TabsTrigger>
                <TabsTrigger value="manual" className="text-[11px] font-black uppercase tracking-widest h-8">Manual Input</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="prebuilt" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full px-6 pb-10">
                <div className="grid gap-2 pt-2">
                  {REQUIREMENT_FIELDS.map((f) => {
                    const isSelected = formData.selectedRequirementFields.includes(f.id);
                    return (
                      <div
                        key={f.id}
                        className={cn(
                          "flex items-center justify-between px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer group",
                          isSelected
                            ? "border-red-600 bg-red-50/20 dark:bg-red-900/10 shadow-sm"
                            : "border-muted/40 bg-background hover:border-muted-foreground/30"
                        )}
                        onClick={() => toggleField(f.id, "requirement")}
                      >
                        <span className={cn("text-[13px] font-bold transition-colors", isSelected ? "text-red-600" : "text-foreground")}>{f.label}</span>
                        {isSelected ? (
                          <div className="h-5 w-5 rounded-full bg-red-600 flex items-center justify-center">
                            <Check className="h-3 w-3 text-white stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted group-hover:border-muted-foreground/40 transition-colors" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="manual" className="flex-1 overflow-hidden m-0">
              <ScrollArea className="h-full px-6 space-y-6">
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Requirement Name</Label>
                    <Input 
                      placeholder="e.g. Possession Date" 
                      value={newManualKey}
                      onChange={(e) => setNewManualKey(e.target.value)}
                      className="h-12 rounded-xl bg-muted/10 border-muted focus:ring-1 focus:ring-red-500"
                    />
                  </div>
                  <Button className="w-full h-12 rounded-xl font-black text-[10px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20" onClick={() => addManualField("requirement")}>
                    ADD CUSTOM REQUIREMENT
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>

          <div className="p-6 border-t mt-auto shrink-0 bg-white dark:bg-zinc-950">
            <Button className="w-full h-12 rounded-xl font-black text-[11px] tracking-widest bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-600/20" onClick={() => setIsReqSheetOpen(false)}>
              SAVE REQUIREMENTS
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
