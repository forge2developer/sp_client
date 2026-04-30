import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Check,
  Target,
  Plus,
  Trash2,
  Settings,
  ListPlus,
  Layers,
  LayoutList,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import api, { grpcApi, type Project } from "@/lib/api"

// ─── Constants ─────────────────────────────────────────────────────────────────
const organization = "SP_PROMOTERS"

const STEPS = [
  { id: 1, title: "Step 1", label: "Campaign Details", icon: Settings },
  { id: 2, title: "Step 2", label: "Configure Sources", icon: ListPlus },
  { id: 3, title: "Step 3", label: "Sub-Sources", icon: Layers },
  { id: 4, title: "Step 4", label: "Final Review", icon: LayoutList },
]

// ─── Types ─────────────────────────────────────────────────────────────────────
type SubSource = {
  subSourceName: string
  project?: {
    projectId: string
  }
}

type SourceConfig = {
  sourceName: string
  subSources: SubSource[]
}

type CampaignConfig = {
  campaignName: string
  project?: {
    projectId: string
  }
  sources: SourceConfig[]
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function CampaignBuilder() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditMode = !!id

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  
  // DB Sources (e.g. Google Ads, Facebook)
  const dbSources = [
    { name: "Google Ads" },
    { name: "Facebook Ads" },
    { name: "Instagram" },
    { name: "Direct Referral" },
    { name: "Offline Marketing" },
    { name: "WhatsApp" },
  ]

  // Form State
  const [campaignConfig, setCampaignConfig] = useState<CampaignConfig>({
    campaignName: "",
    sources: [],
  })

  const [selectedProjectId, setSelectedProjectId] = useState<string>("none")

  // ── Initial Fetch ──
  useEffect(() => {
    const init = async () => {
      setFetching(true)
      try {
        const projRes = await grpcApi.get(`/projects?organization=${organization}`)
        setProjects(projRes.data.data || [])

        if (isEditMode) {
          const res = await grpcApi.get(`/campaigns/${id}`)
          const camp = res.data.data
          setCampaignConfig({
            campaignName: camp.campaignName || "",
            project: camp.project,
            sources: camp.sources || [],
          })
          if (camp.project?.projectId) setSelectedProjectId(camp.project.projectId)
        }
      } catch (error) {
        console.error("Initialization failed:", error)
      } finally {
        setFetching(false)
      }
    }
    init()
  }, [id, isEditMode])

  // ── Handlers ──
  const addSource = () => {
    setCampaignConfig((prev) => ({
      ...prev,
      sources: [...prev.sources, { sourceName: "", subSources: [] }],
    }))
  }

  const updateSource = (index: number, val: string) => {
    setCampaignConfig((prev) => {
      const upd = [...prev.sources]
      upd[index] = { ...upd[index], sourceName: val }
      return { ...prev, sources: upd }
    })
  }

  const removeSource = (index: number) => {
    setCampaignConfig((prev) => {
      const upd = [...prev.sources]
      upd.splice(index, 1)
      return { ...prev, sources: upd }
    })
  }

  const addSubSource = (sourceIndex: number) => {
    setCampaignConfig((prev) => {
      const upd = [...prev.sources]
      upd[sourceIndex] = {
        ...upd[sourceIndex],
        subSources: [...upd[sourceIndex].subSources, { subSourceName: "" }]
      }
      return { ...prev, sources: upd }
    })
  }

  const updateSubSource = (sIdx: number, ssIdx: number, val: string) => {
    setCampaignConfig((prev) => {
      const upd = [...prev.sources]
      upd[sIdx].subSources[ssIdx].subSourceName = val
      return { ...prev, sources: upd }
    })
  }

  const updateSubSourceProject = (sIdx: number, ssIdx: number, val: string) => {
    setCampaignConfig((prev) => {
      const upd = [...prev.sources]
      upd[sIdx].subSources[ssIdx].project = val === "none" ? undefined : { projectId: val }
      return { ...prev, sources: upd }
    })
  }

  const removeSubSource = (sIdx: number, ssIdx: number) => {
    setCampaignConfig((prev) => {
      const upd = [...prev.sources]
      upd[sIdx].subSources.splice(ssIdx, 1)
      return { ...prev, sources: upd }
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const payload = {
        ...campaignConfig,
        organization,
        project: selectedProjectId === "none" ? undefined : { projectId: selectedProjectId },
      }

      if (isEditMode) {
        await api.put(`/campaigns/${id}`, payload)
      } else {
        await api.post("/campaigns", payload)
      }
      navigate("/automation/campaigns")
    } catch (error) {
      alert("Failed to save campaign")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Initializing Campaign Builder...</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto w-full py-8 px-4 space-y-12">
      {/* ── Header ── */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate("/automation/campaigns")} className="rounded-xl h-10 w-10">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{isEditMode ? "Edit Campaign" : "New Campaign Generator"}</h1>
          <p className="text-sm text-muted-foreground">Follow the steps to configure your campaign hierarchy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-12">
        {/* ── Stepper ── */}
        <div className="flex lg:flex-col gap-6 overflow-x-auto pb-4 lg:pb-0 p-4">
          {STEPS.map((step, idx) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex items-center gap-4 min-w-[200px]">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 shrink-0",
                    isCompleted
                      ? "bg-emerald-500 border-emerald-500 text-white"
                      : isActive
                      ? "bg-red-600 border-red-600 text-white scale-110 shadow-lg shadow-red-600/30 ring-4 ring-red-50 dark:ring-red-950/20"
                      : "bg-muted border-muted text-muted-foreground"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                </div>
                <div className="flex flex-col">
                  <span className={cn("text-[10px] font-black tracking-widest", isActive ? "text-foreground" : "text-muted-foreground")}>
                    {step.title}
                  </span>
                  <span className={cn("text-xs font-bold", isActive ? "text-red-600" : "text-muted-foreground")}>
                    {step.label}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Content ── */}
        <div className="">
          <Card className="rounded-3xl border-muted/50 shadow-sm min-h-[500px] flex flex-col">
            <CardContent className="p-10 flex-1">
              
              {/* STEP 1: CAMPAIGN DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-10">
                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase tracking-widest">Campaign Name <span className="text-red-500">*</span></Label>
                    <Input
                      placeholder="e.g. Q4 Summer Launch"
                      value={campaignConfig.campaignName}
                      onChange={(e) => setCampaignConfig({ ...campaignConfig, campaignName: e.target.value })}
                      className="h-14 text-lg rounded-2xl"
                    />
                  </div>

                  <div className="p-8 rounded-3xl border border-blue-100 bg-blue-50/30 dark:bg-blue-900/10 space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                        <AlertCircle className="h-6 w-6 text-white" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-blue-900 dark:text-blue-100">Campaign Project Inheritance</h4>
                        <p className="text-sm text-blue-700/80 leading-relaxed">
                          Selecting a project here will make <strong>ALL</strong> sub-sources inherit it automatically. 
                          Leave as "Universal Project" if you want to assign different projects to specific sub-sources later.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2">
                      <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                        <SelectTrigger className="h-12 bg-background rounded-xl">
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Universal Project (Assign per sub-source)</SelectItem>
                          {projects.map((p) => (
                            <SelectItem key={p._id || p.id} value={p._id || p.id || ""}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: SOURCES */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  {campaignConfig.sources.length === 0 ? (
                    <div className="py-12 border-2 border-dashed rounded-3xl text-center space-y-4">
                      <ListPlus className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                      <div>
                        <h4 className="font-bold">No Sources Added</h4>
                        <p className="text-sm text-muted-foreground">Add top-level sources like Google Ads or Facebook.</p>
                      </div>
                      <Button onClick={addSource} variant="secondary" className="rounded-xl">
                        <Plus className="mr-2 h-4 w-4" /> Add First Source
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaignConfig.sources.map((source, idx) => (
                        <div key={idx} className="group relative flex items-center gap-4 bg-muted/20 p-4 rounded-2xl border border-transparent hover:border-muted-foreground/20 transition-all">
                          <div className="flex-1">
                            <Select value={source.sourceName} onValueChange={(v) => updateSource(idx, v)}>
                              <SelectTrigger className="h-12 bg-background">
                                <SelectValue placeholder="Select Lead Source" />
                              </SelectTrigger>
                              <SelectContent>
                                {dbSources.map(s => (
                                  <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeSource(idx)} className="text-red-500 hover:bg-red-50">
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                      <Button onClick={addSource} variant="ghost" className="w-full h-12 border-2 border-dashed rounded-2xl hover:bg-muted/30">
                        <Plus className="mr-2 h-4 w-4" /> Add Another Source
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: SUB-SOURCES */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <Accordion type="multiple" defaultValue={campaignConfig.sources.map((_, i) => `source-${i}`)} className="space-y-4">
                    {campaignConfig.sources.map((source, sIdx) => (
                      <AccordionItem key={sIdx} value={`source-${sIdx}`} className="border rounded-2xl overflow-hidden shadow-sm">
                        <AccordionTrigger className="px-6 py-4 bg-muted/30 hover:no-underline">
                          <div className="flex items-center justify-between w-full pr-4">
                            <span className="font-bold text-lg">{source.sourceName || `Source ${sIdx + 1}`}</span>
                            <Badge variant="outline" className="rounded-lg">{source.subSources.length} Sub-sources</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="p-6 space-y-4">
                          {source.subSources.map((sub, ssIdx) => (
                            <div key={ssIdx} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background border p-4 rounded-xl relative group">
                              <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase">Sub-Source Name</Label>
                                <Input
                                  placeholder="e.g. landing-page-v2"
                                  value={sub.subSourceName}
                                  onChange={(e) => updateSubSource(sIdx, ssIdx, e.target.value)}
                                  className="h-10"
                                />
                              </div>
                              {selectedProjectId === "none" && (
                                <div className="space-y-2">
                                  <Label className="text-[10px] font-black uppercase">Target Project</Label>
                                  <Select value={sub.project?.projectId || "none"} onValueChange={(v) => updateSubSourceProject(sIdx, ssIdx, v)}>
                                    <SelectTrigger className="h-10">
                                      <SelectValue placeholder="All Projects" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="none">Default Project</SelectItem>
                                      {projects.map((p) => (
                                        <SelectItem key={p._id || p.id} value={p._id || p.id || ""}>{p.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeSubSource(sIdx, ssIdx)}
                                className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-white border shadow-sm text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                          <Button onClick={() => addSubSource(sIdx)} variant="outline" className="w-full h-10 border-dashed rounded-xl">
                            <Plus className="mr-2 h-3 w-3" /> Add Sub-Source to {source.sourceName}
                          </Button>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              )}

              {/* STEP 4: REVIEW */}
              {currentStep === 4 && (
                <div className="space-y-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black">{campaignConfig.campaignName}</h3>
                      <p className="text-sm text-muted-foreground">Hierarchy Review & Validation</p>
                    </div>
                    {selectedProjectId !== "none" && (
                      <Badge className="bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-xl font-bold">
                        Inherit: {projects.find(p => (p._id || p.id) === selectedProjectId)?.name}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-4">
                    {campaignConfig.sources.map((source, sIdx) => (
                      <div key={sIdx} className="rounded-2xl border bg-card overflow-hidden">
                        <div className="bg-muted/30 px-6 py-3 border-b flex items-center justify-between">
                          <span className="font-bold text-sm uppercase tracking-widest text-zinc-600">{source.sourceName}</span>
                          <span className="text-[10px] font-black text-muted-foreground">{source.subSources.length} Sub-sources</span>
                        </div>
                        <div className="divide-y divide-muted/50">
                          {source.subSources.map((sub, ssIdx) => (
                            <div key={ssIdx} className="px-6 py-3 flex items-center justify-between group hover:bg-muted/10 transition-all">
                              <span className="text-sm font-semibold">{sub.subSourceName || "Untitled Sub-source"}</span>
                              {selectedProjectId === "none" && sub.project && (
                                <Badge variant="secondary" className="text-[9px] font-bold">
                                  Project: {projects.find(p => (p._id || p.id) === sub.project?.projectId)?.name}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>

            <div className="p-8 border-t bg-muted/10 flex items-center justify-between rounded-b-3xl">
              <Button
                variant="ghost"
                onClick={() => (currentStep === 1 ? navigate("/automation/campaigns") : setCurrentStep(currentStep - 1))}
                className="font-bold h-12 px-8"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> {currentStep === 1 ? "Cancel" : "Back"}
              </Button>
              <Button
                onClick={() => (currentStep === 4 ? handleSave() : setCurrentStep(currentStep + 1))}
                className="font-black h-12 px-12 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-xl transition-all"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : currentStep === 4 ? (
                  "DEPLOY CAMPAIGN"
                ) : (
                  <>
                    Next<ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
