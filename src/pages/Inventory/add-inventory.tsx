import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import api, { type Phase, type Plot } from "@/lib/api";

type Step = "basic" | "phases" | "review";

interface ImageFile {
  file: File;
  preview: string;
}

export function AddInventory() {
  const [step, setStep] = useState<Step>("basic");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<ImageFile[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);

  // Corner plot selection mode
  const [cornerSelectMode, setCornerSelectMode] = useState(false);

  // ─── Image Handlers ───────────────────────────────────────────────────────
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageFile[] = [];
    const remaining = 5 - images.length;

    for (let i = 0; i < Math.min(files.length, remaining); i++) {
      const file = files[i];

      // Validate size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        alert(`"${file.name}" exceeds 10MB limit and was skipped.`);
        continue;
      }

      // Validate type
      if (!file.type.startsWith("image/")) {
        alert(`"${file.name}" is not an image and was skipped.`);
        continue;
      }

      newImages.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setImages((prev) => [...prev, ...newImages]);

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
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
    if (count <= 0 || count > 500) {
      alert("Enter a valid number of plots (1-500).");
      return;
    }

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

    // Clear input
    setPlotCountInputs((prev) => ({ ...prev, [phaseIndex]: "" }));
  };

  // ─── Corner Plot Toggle ───────────────────────────────────────────────────
  const toggleCornerPlot = (phaseIndex: number, plotIndex: number) => {
    if (!cornerSelectMode) return;

    setPhases((prev) => {
      const updated = [...prev];
      const phase = { ...updated[phaseIndex] };
      const plots = [...phase.plots];
      plots[plotIndex] = { ...plots[plotIndex], isCorner: !plots[plotIndex].isCorner };
      phase.plots = plots;
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
      formData.append("organization", "SP_PROMOTERS");
      formData.append("phases", JSON.stringify(phases));

      // Attach images
      images.forEach((img) => {
        formData.append("images", img.file);
      });

      await api.post("/projects", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Cleanup previews
      images.forEach((img) => URL.revokeObjectURL(img.preview));

      navigate("/inventory_listing");
    } catch (error: any) {
      console.error("Error creating project:", error);
      alert(error?.response?.data?.message || "Failed to create project.");
    } finally {
      setLoading(false);
    }
  };

  const totalPlots = phases.reduce((acc, p) => acc + p.plots.length, 0);
  const totalCorner = phases.reduce((acc, p) => acc + p.plots.filter((pl) => pl.isCorner).length, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/inventory_listing")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add New Project</h1>
          <p className="text-sm text-muted-foreground">Set up your plotted development project.</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between w-full px-16 relative mb-4">
        <div className="absolute top-1/2 left-16 right-16 h-0.5 bg-muted -translate-y-1/2 z-0" />
        {(["basic", "phases", "review"] as Step[]).map((s, i) => (
          <div key={s} className={`z-10 flex flex-col items-center gap-2 ${step === s ? "text-primary" : "text-muted-foreground"}`}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 bg-background transition-all ${
              step === s ? "border-primary font-bold shadow-md shadow-primary/20 scale-110" : "border-muted"
            }`}>
              {i + 1}
            </div>
            <span className="text-xs font-medium">
              {s === "basic" ? "Basic Info & Images" : s === "phases" ? "Phases & Plots" : "Review & Publish"}
            </span>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          STEP 1: Basic Info + Image Upload
          ═══════════════════════════════════════════════════════════════════════ */}
      {step === "basic" && (
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Project Details
            </CardTitle>
            <CardDescription>Enter the basic information and upload layout images.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name & Location */}
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

            {/* Image Upload */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-semibold">Layout Images</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload up to 5 images (max 10MB each). JPG, PNG, or WebP.
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {images.length} / 5 uploaded
                </Badge>
              </div>

              {/* Image Preview Grid */}
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
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <span className="text-white text-[10px] font-medium truncate block">
                        {img.file.name}
                      </span>
                      <span className="text-white/70 text-[9px]">
                        {(img.file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                    </div>
                  </div>
                ))}

                {/* Add Image Button */}
                {images.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary cursor-pointer"
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

      {/* ═══════════════════════════════════════════════════════════════════════
          STEP 2: Phases & Plots (with corner selection)
          ═══════════════════════════════════════════════════════════════════════ */}
      {step === "phases" && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Layers className="h-5 w-5" /> Phases & Plots
              </h2>
              <Badge variant="secondary">{totalPlots} Total Plots</Badge>
              {totalCorner > 0 && (
                <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                  <CornerDownRight className="h-3 w-3 mr-1" /> {totalCorner} Corner
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={cornerSelectMode ? "default" : "outline"}
                size="sm"
                onClick={() => setCornerSelectMode(!cornerSelectMode)}
                className={cornerSelectMode ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/30" : ""}
              >
                <MousePointer2 className="h-4 w-4 mr-2" />
                {cornerSelectMode ? "Done Selecting" : "Select Corner Plots"}
              </Button>
              <Button variant="outline" size="sm" onClick={addPhase}>
                <Plus className="h-4 w-4 mr-2" /> Add Phase
              </Button>
            </div>
          </div>

          {cornerSelectMode && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-center gap-3 text-amber-800 text-sm">
              <MousePointer2 className="h-5 w-5 flex-shrink-0" />
              <span><strong>Corner Selection Mode:</strong> Click on any plot below to mark or unmark it as a corner plot. Corner plots are highlighted with a golden border.</span>
            </div>
          )}

          {phases.length === 0 && (
            <Card className="border-dashed h-40 flex items-center justify-center">
              <div className="text-center">
                <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No phases defined. Click "Add Phase" to begin.</p>
              </div>
            </Card>
          )}

          {phases.map((phase, phIdx) => (
            <Card key={phIdx} className="shadow-md border-l-4 border-l-primary overflow-hidden">
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
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {phase.plots.length} plots · {phase.plots.filter((p) => p.isCorner).length} corner
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => removePhase(phIdx)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Bulk Plot Input */}
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

                {/* Plots Grid */}
                {phase.plots.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-500/20 border border-green-500/30 inline-block" /> Available</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-500/20 border-2 border-amber-500 inline-block" /> Corner Plot</span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                      {phase.plots.map((plot, plIdx) => (
                        <button
                          key={plot.plotId}
                          onClick={() => toggleCornerPlot(phIdx, plIdx)}
                          className={`h-11 rounded-lg border-2 flex items-center justify-center text-xs font-bold transition-all ${
                            cornerSelectMode ? "cursor-pointer hover:scale-110 hover:shadow-md" : "cursor-default"
                          } ${
                            plot.isCorner
                              ? "bg-amber-500/15 text-amber-700 border-amber-500 shadow-sm shadow-amber-500/20"
                              : "bg-green-500/10 text-green-700 border-green-500/20 hover:border-green-500/40"
                          }`}
                          title={`Plot ${plot.plotNumber}${plot.isCorner ? " (Corner)" : ""}`}
                        >
                          {plot.plotNumber}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {phase.plots.length === 0 && (
                  <div className="p-6 text-center border-2 border-dashed rounded-lg bg-muted/20">
                    <p className="text-muted-foreground text-sm">
                      Enter the number of plots above and click "Generate Plots".
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Navigation */}
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

      {/* ═══════════════════════════════════════════════════════════════════════
          STEP 3: Review & Submit
          ═══════════════════════════════════════════════════════════════════════ */}
      {step === "review" && (
        <Card className="shadow-lg border-primary/10 overflow-hidden">
          <div className="bg-primary/5 p-6 border-b">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" /> Review & Publish
            </h2>
            <p className="text-muted-foreground">Verify your project structure before saving.</p>
          </div>
          <CardContent className="p-6 space-y-8">
            {/* Basic Info Summary */}
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
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs uppercase">Corner Plots</Label>
                <p className="font-bold text-lg text-amber-600">{totalCorner}</p>
              </div>
            </div>

            {/* Images Summary */}
            {images.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-muted-foreground text-xs uppercase mb-3 block">Layout Images</Label>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="h-24 w-36 rounded-lg overflow-hidden flex-shrink-0 border shadow-sm">
                        <img src={img.preview} alt={`Layout ${idx + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Phase Breakdown */}
            <div>
              <Label className="text-muted-foreground text-xs uppercase mb-4 block">Phase Summary</Label>
              <div className="space-y-4">
                {phases.map((phase, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {phase.phaseId}
                      </div>
                      <div>
                        <span className="font-bold">{phase.phaseName}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {phase.plots.filter((p) => p.isCorner).length} corner plots highlighted
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-background font-bold">
                      {phase.plots.length} Plots
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/20 p-6 border-t">
            <Button variant="outline" onClick={() => setStep("phases")}>
              Modify Setup
            </Button>
            <Button onClick={handleSubmit} disabled={loading} size="lg" className="px-8 font-bold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Publish Project
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}