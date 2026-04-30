import { useState, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Building2,
  Layers,
  Save,
  Loader2,
  CheckCircle2,
  X,
  ImagePlus,
  MapPin,
  CornerDownRight,
  MousePointer2,
  Settings2,
  Maximize2,
  LayoutGrid,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuLabel,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import api, { type Phase, type Plot, type Project } from "@/lib/api";

type Step = "basic" | "phases" | "review";

interface ImageFile {
  file?: File;
  preview: string;
  isExisting?: boolean;
}

export function AddInventory() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;

  const [step, setStep] = useState<Step>("basic");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);

  const organization = "SP_PROMOTERS";

  // Selection Modes
  const [cornerSelectMode, setCornerSelectMode] = useState(false);
  const [plotEditMode, setPlotEditMode] = useState(false);
  const [selectedPlots, setSelectedPlots] = useState<Set<string>>(new Set());

  // Bulk Edit Values
  const [bulkSize, setBulkSize] = useState("");
  const [bulkFacing, setBulkFacing] = useState("");

  // Single Edit Modal
  const [editingPlot, setEditingPlot] = useState<{ phIdx: number; plIdx: number; plot: Plot } | null>(null);
  const [singleSize, setSingleSize] = useState("");
  const [singleFacing, setSingleFacing] = useState("");

  // ─── Fetch for Edit Mode ──────────────────────────────────────────────────
  useEffect(() => {
    if (isEditMode && editId) {
      fetchProjectForEdit();
    }
  }, [isEditMode, editId]);

  const fetchProjectForEdit = async () => {
    try {
      setFetching(true);
      const response = await api.get(`/projects/${editId}?organization=${organization}`);
      const p: Project = response.data.data;

      setName(p.name);
      setLocation(p.location);
      setPhases(p.phases || []);

      if (p.layoutImages) {
        setImages(p.layoutImages.map(img => ({ preview: img, isExisting: true })));
      }
    } catch (error) {
      console.error("Error fetching project for edit:", error);
      alert("Failed to load project details for editing.");
    } finally {
      setFetching(false);
    }
  };

  // ─── Image Handlers ───────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    const remaining = 5 - images.length;

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) continue;
      if (!file.type.startsWith("image/")) continue;

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
        isExisting: false
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const img = prev[index];
      if (!img.isExisting) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ─── Phase Handlers ───────────────────────────────────────────────────────
  const addPhase = () => {
    const newPhase: Phase = {
      phaseId: `PH${phases.length + 1}`,
      phaseName: `Phase ${phases.length + 1}`,
      plots: [],
    };
    setPhases((prev) => [...prev, newPhase]);
  };

  const removePhase = (index: number) => {
    setPhases((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePhaseName = (index: number, newName: string) => {
    setPhases((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], phaseName: newName };
      return updated;
    });
  };

  // ─── Bulk Plot Creation ───────────────────────────────────────────────────
  const [plotCountInputs, setPlotCountInputs] = useState<Record<number, string>>({});

  const addBulkPlots = (phaseIndex: number) => {
    const count = parseInt(plotCountInputs[phaseIndex] || "0");
    if (count <= 0 || count > 500) return;

    setPhases((prev) => {
      const updated = [...prev];
      const phase = { ...updated[phaseIndex] };
      const existingCount = phase.plots.length;
      const newPlots: Plot[] = [];

      for (let i = 1; i <= count; i++) {
        const plotNum = existingCount + i;
        newPlots.push({
          plotId: `${phase.phaseId}-P${plotNum}`,
          plotNumber: `${plotNum}`,
          status: "available",
          isCorner: false,
        });
      }

      phase.plots = [...phase.plots, ...newPlots];
      updated[phaseIndex] = phase;
      return updated;
    });
    setPlotCountInputs((prev) => ({ ...prev, [phaseIndex]: "" }));
  };

  // ─── Plot Action Handlers ─────────────────────────────────────────────────
  const handlePlotClick = (phaseIndex: number, plotIndex: number) => {
    const plot = phases[phaseIndex].plots[plotIndex];

    if (cornerSelectMode) {
      setPhases((prev) => {
        const updated = [...prev];
        const ph = { ...updated[phaseIndex] };
        const plots = [...ph.plots];
        plots[plotIndex] = { ...plots[plotIndex], isCorner: !plots[plotIndex].isCorner };
        ph.plots = plots;
        updated[phaseIndex] = ph;
        return updated;
      });
      return;
    }

    if (plotEditMode) {
      setSelectedPlots((prev) => {
        const next = new Set(prev);
        if (next.has(plot.plotId)) next.delete(plot.plotId);
        else next.add(plot.plotId);
        return next;
      });
      return;
    }
  };

  const openSingleEdit = (phIdx: number, plIdx: number, plot: Plot) => {
    setEditingPlot({ phIdx, plIdx, plot });
    setSingleSize(plot.size || "");
    setSingleFacing(plot.facing || "");
  };

  const applySingleDetails = () => {
    if (!editingPlot) return;
    const { phIdx, plIdx } = editingPlot;

    setPhases((prev) => {
      const updated = [...prev];
      const ph = { ...updated[phIdx] };
      const plots = [...ph.plots];
      plots[plIdx] = { ...plots[plIdx], size: singleSize, facing: singleFacing };
      ph.plots = plots;
      updated[phIdx] = ph;
      return updated;
    });

    setEditingPlot(null);
  };

  const applyBulkDetails = () => {
    if (selectedPlots.size === 0) return;

    setPhases((prev) => {
      return prev.map((phase) => ({
        ...phase,
        plots: phase.plots.map((plot) => {
          if (selectedPlots.has(plot.plotId)) {
            return {
              ...plot,
              size: bulkSize || plot.size,
              facing: bulkFacing !== "none" ? bulkFacing : plot.facing,
            };
          }
          return plot;
        }),
      }));
    });

    setSelectedPlots(new Set());
    setBulkSize("");
    setBulkFacing("");
    setPlotEditMode(false);
  };

  const removePlot = (phaseIndex: number, plotIndex: number) => {
    setPhases((prev) => {
      const updated = [...prev];
      const phase = { ...updated[phaseIndex] };
      const remainingPlots = phase.plots.filter((_, i) => i !== plotIndex);

      phase.plots = remainingPlots.map((plot, idx) => {
        const newNum = idx + 1;
        return {
          ...plot,
          plotNumber: `${newNum}`,
          plotId: `${phase.phaseId}-P${newNum}`
        };
      });

      updated[phaseIndex] = phase;
      return updated;
    });
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      formData.append("location", location);
      formData.append("organization", organization);
      formData.append("phases", JSON.stringify(phases));

      const existingImages = images.filter(img => img.isExisting).map(img => img.preview);
      formData.append("existingImages", JSON.stringify(existingImages));

      images.filter(img => !img.isExisting).forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      if (isEditMode) {
        await api.put(`/projects/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/projects", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      images.filter(img => !img.isExisting).forEach((img) => URL.revokeObjectURL(img.preview));
      navigate("/inventory_listing");
    } catch (error: any) {
      console.error("Error saving project:", error);
      alert(error?.response?.data?.message || "Failed to save project.");
    } finally {
      setLoading(false);
    }
  };

  const totalPlots = phases.reduce((acc, p) => acc + p.plots.length, 0);

  if (fetching) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading project details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Edit Dialog */}
      <Dialog open={!!editingPlot} onOpenChange={() => setEditingPlot(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> Edit Plot {editingPlot?.plot.plotNumber}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="size" className="text-right">SQFT</Label>
              <Input
                id="size"
                value={singleSize}
                onChange={(e) => setSingleSize(e.target.value)}
                className="col-span-3"
                placeholder="e.g. 1200"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="facing" className="text-right">FACING</Label>
              <div className="col-span-3">
                <Select value={singleFacing} onValueChange={setSingleFacing}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select facing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="North">North</SelectItem>
                    <SelectItem value="South">South</SelectItem>
                    <SelectItem value="East">East</SelectItem>
                    <SelectItem value="West">West</SelectItem>
                    <SelectItem value="North-East">North-East</SelectItem>
                    <SelectItem value="North-West">North-West</SelectItem>
                    <SelectItem value="South-East">South-East</SelectItem>
                    <SelectItem value="South-West">South-West</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={applySingleDetails} className="w-full font-bold">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/inventory_listing")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isEditMode ? "Edit Project" : "Add New Project"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditMode ? `Update details for ${name}` : "Set up your plotted development project."}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between w-full px-16 relative mb-4">
        <div className="absolute top-5 left-16 right-16 h-0.5 bg-muted -translate-y-1/2 z-0" />
        {(["basic", "phases", "review"] as Step[]).map((s, i) => (
          <div key={s} className={`z-10 flex flex-col items-center gap-2 ${step === s ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 bg-background transition-all ${step === s ? "border-primary font-bold scale-110" : "border-muted"
              }`}>
              {i + 1}
            </div>
            <span className="text-xs font-medium">
              {s === "basic" ? "Basic Info & Images" : s === "phases" ? "Phases & Plots" : "Review & Publish"}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: Basic Info + Image Upload */}
      {step === "basic" && (
        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Project Details
            </CardTitle>
            <CardDescription>Enter the basic information and upload layout images.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Project Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g. Green Valley Phase 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location <span className="text-destructive">*</span></Label>
                <Input
                  id="location"
                  placeholder="e.g. Hyderabad, Shamshabad"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Layout Images</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload up to 5 images (max 10MB each).
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {images.length} / 5 uploaded
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl border-2 overflow-hidden group">
                    <img
                      src={img.preview}
                      alt={`Layout ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => removeImage(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {img.isExisting && (
                      <Badge className="absolute top-1 left-1 bg-primary text-white text-[8px] py-0 px-1">Current</Badge>
                    )}
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-primary/30 hover:border-primary transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
                  >
                    <ImagePlus className="h-8 w-8" />
                    <span className="text-xs font-medium">Add Image</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              onClick={() => setStep("phases")}
              disabled={!name.trim() || !location.trim()}
            >
              Next: Phases & Plots <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* STEP 2: Phases & Plots */}
      {step === "phases" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5" /> Phases & Plots
              </h2>
              <Badge variant="secondary">{totalPlots} Total Plots</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={plotEditMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPlotEditMode(!plotEditMode);
                  setCornerSelectMode(false);
                  setSelectedPlots(new Set());
                }}
                className={plotEditMode ? "bg-primary hover:bg-primary/90 text-white" : ""}
              >
                <Settings2 className="h-4 w-4 mr-2" />
                {plotEditMode ? "Done Editing" : "Bulk Edit Plots"}
              </Button>
              <Button
                variant={cornerSelectMode ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setCornerSelectMode(!cornerSelectMode);
                  setPlotEditMode(false);
                  setSelectedPlots(new Set());
                }}
                className={cornerSelectMode ? "bg-amber-500 hover:bg-amber-600 text-white" : ""}
              >
                <MousePointer2 className="h-4 w-4 mr-2" />
                {cornerSelectMode ? "Done Selecting" : "Select Corner Plots"}
              </Button>
              <Button variant="outline" size="sm" onClick={addPhase}>
                <Plus className="h-4 w-4 mr-2" /> Add Phase
              </Button>
            </div>
          </div>

          {/* Bulk Edit Toolbar */}
          {plotEditMode && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-4 flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px] space-y-2">
                  <Label className="text-xs font-bold uppercase text-primary">Selected Plots: {selectedPlots.size}</Label>
                  <div className="text-sm text-muted-foreground italic">
                    {selectedPlots.size === 0 ? "Click plots below to select them for bulk update." : "Updating size and facing for selected plots."}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-size" className="text-xs font-bold">SIZE (SQFT)</Label>
                  <Input
                    id="bulk-size"
                    placeholder="e.g. 1200"
                    className="h-9 w-32 bg-background"
                    value={bulkSize}
                    onChange={(e) => setBulkSize(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bulk-facing" className="text-xs font-bold">FACING</Label>
                  <Select value={bulkFacing} onValueChange={setBulkFacing}>
                    <SelectTrigger id="bulk-facing" className="h-9 w-32 bg-background">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Keep Same</SelectItem>
                      <SelectItem value="North">North</SelectItem>
                      <SelectItem value="South">South</SelectItem>
                      <SelectItem value="East">East</SelectItem>
                      <SelectItem value="West">West</SelectItem>
                      <SelectItem value="North-East">North-East</SelectItem>
                      <SelectItem value="North-West">North-West</SelectItem>
                      <SelectItem value="South-East">South-East</SelectItem>
                      <SelectItem value="South-West">South-West</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={applyBulkDetails}
                  disabled={selectedPlots.size === 0 || (!bulkSize && !bulkFacing)}
                  className="h-9 font-bold"
                >
                  Apply to {selectedPlots.size} Plots
                </Button>
              </CardContent>
            </Card>
          )}

          {cornerSelectMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 text-amber-800 text-sm">
              <MousePointer2 className="h-5 w-5 flex-shrink-0" />
              <span><strong>Corner Selection Mode:</strong> Click on any plot below to mark or unmark it as a corner plot.</span>
            </div>
          )}

          {phases.map((phase, phIdx) => (
            <Card key={phIdx} className="border-l-4 border-l-primary overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {phase.phaseId}
                    </div>
                    <div className="flex-1 max-w-xs">
                      <Input
                        value={phase.phaseName}
                        onChange={(e) => updatePhaseName(phIdx, e.target.value)}
                        className="font-semibold text-lg h-9 border-transparent hover:border-input focus:border-input"
                      />
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removePhase(phIdx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-lg">
                  <Label className="text-sm font-medium whitespace-nowrap">Number of plots:</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    placeholder="e.g. 50"
                    className="w-32"
                    value={plotCountInputs[phIdx] || ""}
                    onChange={(e) => setPlotCountInputs((prev) => ({ ...prev, [phIdx]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && addBulkPlots(phIdx)}
                  />
                  <Button size="sm" onClick={() => addBulkPlots(phIdx)}>
                    <Plus className="h-4 w-4 mr-1" /> Generate Plots
                  </Button>
                </div>

                <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                  {phase.plots.map((plot, plIdx) => {
                    const isSelected = selectedPlots.has(plot.plotId);
                    return (
                      <ContextMenu key={plot.plotId}>
                        <ContextMenuTrigger asChild>
                          <button
                            onClick={() => handlePlotClick(phIdx, plIdx)}
                            className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-bold transition-all relative group ${cornerSelectMode || plotEditMode ? "cursor-pointer hover:scale-105" : "cursor-default"
                              } ${isSelected
                                ? "bg-primary text-primary-foreground border-primary scale-105 z-10 ring-2 ring-primary ring-offset-2"
                                : plot.isCorner
                                  ? "bg-amber-500/15 text-amber-700 border-amber-500"
                                  : "bg-white text-green-700 border-green-500/20 hover:border-green-500/50"
                              }`}
                          >
                            <span className="text-sm font-black text-foreground/80">{plot.plotNumber}</span>

                            <div className="flex flex-col items-center justify-center gap-1">
                              {plot.size ? (
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border border-red-500/50 bg-red-50/50 text-red-600 ${isSelected ? "bg-white text-red-700" : ""}`}>
                                  {plot.size} sqft
                                </span>
                              ) : (
                                <span className="text-[8px] font-medium opacity-40 uppercase tracking-tighter italic">No Size</span>
                              )}

                              {plot.facing ? (
                                <span className={`text-[9px] font-bold uppercase tracking-wide ${isSelected ? "text-primary-foreground/90" : "text-muted-foreground/80"}`}>
                                  {plot.facing}
                                </span>
                              ) : (
                                <span className="text-[8px] font-medium opacity-30 uppercase tracking-tighter italic">No Facing</span>
                              )}
                            </div>

                            {/* Delete Plot Button (Hover) */}
                            {!cornerSelectMode && !plotEditMode && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePlot(phIdx, plIdx);
                                }}
                                className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 z-20"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-white" />
                              </button>
                            )}
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                          <ContextMenuLabel className="text-xs uppercase tracking-widest text-muted-foreground">Plot {plot.plotNumber}</ContextMenuLabel>
                          <ContextMenuSeparator />
                          <ContextMenuItem onClick={() => openSingleEdit(phIdx, plIdx, plot)}>
                            <Settings2 className="mr-2 h-4 w-4" /> Edit Details
                          </ContextMenuItem>
                          <ContextMenuItem onClick={() => {
                            setPhases((prev) => {
                              const updated = [...prev];
                              const ph = { ...updated[phIdx] };
                              const plots = [...ph.plots];
                              plots[plIdx] = { ...plots[plIdx], isCorner: !plots[plIdx].isCorner };
                              ph.plots = plots;
                              updated[phIdx] = ph;
                              return updated;
                            });
                          }}>
                            <CornerDownRight className="mr-2 h-4 w-4" /> Toggle Corner
                          </ContextMenuItem>
                          <ContextMenuSeparator />
                          <ContextMenuItem className="text-destructive" onClick={() => removePlot(phIdx, plIdx)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Plot
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep("basic")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Basic Info
            </Button>
            <Button onClick={() => setStep("review")} disabled={phases.length === 0 || totalPlots === 0}>
              Review Project <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review & Submit */}
      {step === "review" && (
        <Card className="border-primary/10 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" /> Review & Publish
            </h2>
          </div>
          <CardContent className="p-6 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase">Project Name</Label>
                <p className="font-bold text-lg">{name}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase">Location</Label>
                <p className="font-bold text-lg">{location}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase">Total Plots</Label>
                <p className="font-bold text-lg">{totalPlots}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              {phases.map((phase, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                      {phase.phaseId}
                    </div>
                    <span className="font-bold">{phase.phaseName}</span>
                  </div>
                  <Badge variant="outline" className="bg-background font-bold">
                    {phase.plots.length} Plots
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/20 p-6 border-t">
            <Button variant="outline" onClick={() => setStep("phases")}>
              Modify Setup
            </Button>
            <Button onClick={handleSubmit} disabled={loading} size="lg" className="px-8 font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              {isEditMode ? "Save Changes" : "Publish Project"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}