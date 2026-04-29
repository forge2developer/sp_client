import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  ChevronRight,
  ChevronDown,
  Loader2,
  ArrowLeft,
  Info,
  User,
  Calendar,
  Phone,
  LayoutGrid,
  CornerDownRight,
  Home,
  ImageIcon,
  Maximize2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import api, { type Project, type Phase, type Plot } from "@/lib/api";

export function ProjectShowcase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const organization = "SP_PROMOTERS";

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${id}?organization=${organization}`);
      const data = response.data.data;
      setProject(data);

      // Auto-select first phase
      if (data.phases?.length > 0) {
        setSelectedPhase(data.phases[0]);
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Button onClick={() => navigate("/inventory_listing")}>Back to Listing</Button>
      </div>
    );
  }

  const layoutImages = project.layoutImages || [];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 p-1 relative">
      {/* Fullscreen Overlay */}
      {fullscreenImage && (
        <div 
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setFullscreenImage(null)}
        >
          <img src={fullscreenImage} alt="Layout Large" className="max-w-full max-h-full object-contain shadow-2xl" />
          <Button variant="ghost" className="absolute top-4 right-4 text-white hover:bg-white/10">x</Button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/inventory_listing")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1 text-primary" /> {project.location}
              </span>
              <Badge variant="outline" className="capitalize">Plotted Development</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">

        {/* Left: Phase Navigator */}
        <Card className="lg:col-span-3 overflow-hidden flex flex-col py-0 border shadow-sm">
          <CardHeader className="py-4 px-4 bg-muted/30 border-b">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-primary" /> Phases
            </CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1 min-h-0">
            <CardContent className="p-2">
              <div className="space-y-2">
                {project.phases?.map((phase) => (
                  <div key={phase.phaseId} className="space-y-1">
                    <button
                      onClick={() => {
                        setSelectedPhase(phase);
                        setSelectedPlot(null);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between text-sm font-medium transition-colors ${
                        selectedPhase?.phaseId === phase.phaseId
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" /> {phase.phaseName}
                      </span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          selectedPhase?.phaseId === phase.phaseId
                            ? "bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30"
                            : ""
                        }`}
                      >
                        {phase.plots.length}
                      </Badge>
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </Card>

        {/* Center: Plot Grid */}
        <Card className="lg:col-span-6 flex flex-col overflow-hidden py-0 border shadow-sm">
          <CardHeader className="py-4 px-4 border-b flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider">
              {selectedPhase?.phaseName || "Select a Phase"} — Plots
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200 text-[10px]">Available</Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200 text-[10px]">Booked</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 text-[10px]">Sold</Badge>
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-300 text-[10px]">
                <CornerDownRight className="h-2.5 w-2.5 mr-0.5" /> Corner
              </Badge>
            </div>
          </CardHeader>
          <ScrollArea type="always" className="flex-1 min-h-0 bg-muted/20">
            <CardContent className="p-6">
              {selectedPhase ? (
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                  {selectedPhase.plots.map((plot) => (
                    <button
                      key={plot.plotId}
                      onClick={() => setSelectedPlot(plot)}
                      className={`aspect-square rounded-xl border-2 p-2 flex flex-col items-center justify-center transition-all relative group shadow-sm ${
                        selectedPlot?.plotId === plot.plotId
                          ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105 z-10"
                          : plot.status === "available"
                          ? "bg-white border-green-500/20 hover:border-green-500/50"
                          : plot.status === "booked"
                          ? "bg-yellow-50 border-yellow-500/20 hover:border-yellow-500/50"
                          : "bg-red-50 border-red-500/20 hover:border-red-500/50"
                      } ${
                        plot.isCorner && selectedPlot?.plotId !== plot.plotId
                          ? "ring-2 ring-amber-400 ring-offset-1"
                          : ""
                      }`}
                    >
                      <Home
                        className={`h-6 w-6 mb-1 ${
                          selectedPlot?.plotId === plot.plotId
                            ? "text-primary-foreground"
                            : plot.status === "available"
                            ? "text-green-500"
                            : plot.status === "booked"
                            ? "text-yellow-600"
                            : "text-red-500"
                        }`}
                      />
                      <span className="text-sm font-black">{plot.plotNumber}</span>
                      {plot.isCorner && selectedPlot?.plotId !== plot.plotId && (
                        <CornerDownRight className="h-3 w-3 text-amber-500 absolute top-1 right-1" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-muted-foreground">
                  <LayoutGrid className="h-12 w-12 mb-4 opacity-20" />
                  <p className="italic">Select a phase from the left panel.</p>
                </div>
              )}
            </CardContent>
            <ScrollBar orientation="vertical" className="w-2 bg-primary/10" />
          </ScrollArea>
        </Card>

        {/* Right: Images & Details Stack */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Layout Images Card */}
          <Card className="overflow-hidden flex flex-col py-0 border shadow-sm flex-shrink-0">
            <CardHeader className="py-3 px-4 bg-muted/50 border-b">
              <CardTitle className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5 text-primary" /> Layout Images
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {layoutImages.length > 0 ? (
                <ScrollArea className="w-full whitespace-nowrap pb-2">
                  <div className="flex gap-3">
                    {layoutImages.map((img, idx) => (
                      <div 
                        key={idx} 
                        className="group relative w-32 aspect-video rounded-lg overflow-hidden border-2 border-muted hover:border-primary transition-all cursor-pointer shadow-sm flex-shrink-0"
                        onClick={() => setFullscreenImage(img)}
                      >
                        <img src={img} alt={`Layout ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" className="h-2 bg-primary/10" />
                </ScrollArea>
              ) : (
                <div className="h-20 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
                  <ImageIcon className="h-6 w-6 mb-1 opacity-20" />
                  <p className="text-[10px] italic">No images available</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plot Details Card - WITHOUT SCROLL */}
          <Card className="flex flex-col border shadow-sm py-0 overflow-visible">
            <CardHeader className="py-3 px-4 bg-primary text-primary-foreground border-b shadow-sm rounded-t-lg">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <Info className="h-3.5 w-3.5" /> Plot Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {selectedPlot ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black">Plot {selectedPlot.plotNumber}</h3>
                    <Badge
                      variant={
                        selectedPlot.status === "available"
                          ? "default"
                          : selectedPlot.status === "booked"
                          ? "secondary"
                          : "destructive"
                      }
                      className="uppercase font-bold tracking-widest text-[9px]"
                    >
                      {selectedPlot.status}
                    </Badge>
                  </div>

                  {selectedPlot.isCorner && (
                    <Badge className="w-fit bg-amber-500/10 text-amber-600 border-amber-500/30 text-[9px]">
                      <CornerDownRight className="h-2.5 w-2.5 mr-0.5" /> Corner Plot
                    </Badge>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/30 p-2 rounded-md border border-muted-foreground/5 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Size</p>
                      <p className="font-semibold text-sm">{selectedPlot.size || "—"} Sqft</p>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-md border border-muted-foreground/5 text-center">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold">Facing</p>
                      <p className="font-semibold text-sm">{selectedPlot.facing || "N/A"}</p>
                    </div>
                  </div>

                 {/* <div className="bg-muted/30 p-3 rounded-md border border-muted-foreground/5 text-center">
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">Price</p>
                    <p className="font-bold text-primary text-lg leading-none mt-1">
                      {selectedPlot.price ? `₹ ${selectedPlot.price.toLocaleString()}` : "On Request"}
                    </p>
                  </div> */}

                  {selectedPlot.bookedBy && (
                    <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/20 shadow-inner text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Lead Name</span>
                        <span className="font-bold">{selectedPlot.bookedBy.leadName}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium">{selectedPlot.bookedBy.phone}</span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2">
                    {selectedPlot.status === "available" ? (
                      <Button className="w-full font-bold h-10 shadow-lg">Book Now</Button>
                    ) : (
                      <Button variant="outline" className="w-full font-bold h-10 text-xs">
                        Manage Booking
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center text-muted-foreground">
                  <Home className="h-10 w-10 mb-3 opacity-20" />
                  <p className="text-xs italic">Select a plot from the grid.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
