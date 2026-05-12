import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Loader2, ArrowLeft, Calendar as CalendarIcon, Check, Camera, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import api, { grpcApi } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";


const INDUSTRIES = [
  "IT", "ITES/BPO/KPO", "Manufacturing", "Retail Services",
  "Financial Services", "Hospitality", "Real Estate",
  "Medical/Pharmaceuticals", "Media/Entertainment", "Others",
];
const FUNCTIONS = [
  "Software", "Sales & Marketing", "HR/Administration",
  "Finance", "Production", "Legal", "Operations",
  "Business/Self Employed", "Others",
];
const INCOME_RANGES = ["Less than 5 lakh", "5-15 lakh", "15-25 lakh", "25-50 lakh", "50 lakh and above"];
const SOURCES = ["Advertisement", "Company Website", "Referral", "Agent", "Walk In", "Hoarding", "Others"];
const PAYMENT_MODES = ["Own Funds", "Home Loan"];
const PURPOSES = ["Own Use", "Investment", "Others"];
const FACINGS = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];


const INPUT_CLS = "h-8 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-semibold px-4";

function CheckboxOption({ 
  label, 
  checked, 
  onChange,
  showBox = true 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (checked: boolean) => void;
  showBox?: boolean;
}) {
  return (
    <div 
      className={cn(
        "flex items-center gap-2 cursor-pointer group select-none",
        !showBox && "px-3 py-1.5 rounded-full border transition-all",
        !showBox && checked ? "bg-red-50 border-red-200 text-red-600" : !showBox ? "bg-white border-slate-200 text-slate-600 hover:border-slate-300" : ""
      )} 
      onClick={() => onChange(!checked)}
    >
      {showBox && (
        <div className={cn(
          "w-4 h-4 border border-slate-300 rounded flex items-center justify-center transition-all",
          checked ? "bg-red-600 border-red-600 text-white" : "bg-white group-hover:border-red-400"
        )}>
          {checked && <Check className="w-3 h-3 stroke-[4]" />}
        </div>
      )}
      <span className={cn(
        "text-[11px] font-bold transition-colors",
        checked && showBox ? "text-slate-900" : "text-slate-600"
      )}>{label}</span>
    </div>
  );
}

function InlineInput({ 
  label, 
  value, 
  onChange, 
  placeholder = "", 
  className = "" 
}: { 
  label?: string; 
  value: string; 
  onChange: (v: string) => void; 
  placeholder?: string; 
  className?: string 
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {label && <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">{label}</span>}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 bg-transparent border-b border-slate-300 focus:border-red-500 outline-none px-1 py-0.5 text-[11px] font-semibold transition-colors min-w-[80px]"
      />
    </div>
  );
}

function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">{label}{required && <span className="text-red-600 ml-1">*</span>}</Label>
      {children}
    </div>
  );
}

function SectionBar({ label }: { label: string }) {
  return (
    <div className="bg-red-600 text-white px-4 py-2 -mx-8 md:-mx-10">
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</h3>
    </div>
  );
}

function DatePicker({ date, setDate }: { date: Date | undefined; setDate: (d: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            INPUT_CLS,
            "justify-start text-left font-semibold",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          captionLayout="dropdown"
          fromYear={1900}
          toYear={new Date().getFullYear()}
          disabled={{ after: new Date() }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

export function BookingFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    projectId: initialProjectId, 
    projectName: initialProjectName, 
    phaseName: initialPhaseName, 
    phaseId: initialPhaseId, 
    plot: initialPlot, 
    bookingType: initialBookingType,
    leadName: initialLeadName,
    leadPhone: initialLeadPhone,
    leadEmail: initialLeadEmail
  } = location.state || {};

  // Hide the top selection card only if we already have a project/plot locked in
  const isDirectBooking = !!(initialPlot || initialProjectId);

  const [submitting, setSubmitting] = useState(false);
  const [bookingType, setBookingType] = useState<"Sales" | "Purchase">(initialBookingType || "Sales");

  // Selection state
  const [projects, setProjects] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [plots, setPlots] = useState<any[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId?.toString() || "");
  const [selectedPhaseId, setSelectedPhaseId] = useState(initialPhaseId?.toString() || "");
  const [selectedPlot, setSelectedPlot] = useState<any>(initialPlot || null);
  const [selectedFacing, setSelectedFacing] = useState(initialPlot?.facing || "");
  const [manualPlotNumber, setManualPlotNumber] = useState(initialPlot?.plotNumber || "");
  const [manualSize, setManualSize] = useState(initialPlot?.size || "");
  const [manualPrice, setManualPrice] = useState(initialPlot?.price || "");

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingPhases, setLoadingPhases] = useState(false);
  const [loadingPlots, setLoadingPlots] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      setLoadingProjects(true);
      try {
        const res = await api.get("/projects");
        const data = res.data.data || res.data;
        setProjects(Array.isArray(data) ? data : (data.projects || []));
      } catch (err) {
        console.error("Failed to fetch projects", err);
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setPhases([]);
      setSelectedPhaseId("");
      return;
    }
    const fetchPhases = async () => {
      if (!selectedProjectId) return;
      setLoadingPhases(true);
      try {
        // Strategy 1: Try api.get (common for details)
        const res = await api.get(`/projects/${selectedProjectId}`);
        const data = res.data.data || res.data;
        if (data?.phases) {
          setPhases(data.phases);
          setLoadingPhases(false);
          return;
        }

        // Strategy 2: Try grpcApi (common for list/gateway)
        const gRes = await grpcApi.get(`/projects/${selectedProjectId}`);
        const gData = gRes.data.data || gRes.data;
        if (gData?.phases) {
          setPhases(gData.phases);
        } else {
          setPhases([]);
        }
      } catch (err) {
        console.error("Failed to fetch phases", err);
        setPhases([]);
      } finally {
        setLoadingPhases(false);
      }
    };
    if (!initialPhaseId || selectedProjectId !== initialProjectId) {
        fetchPhases();
    } else {
        // If we have initial data, we might need to fetch the phases anyway to show in dropdown
        fetchPhases();
    }
  }, [selectedProjectId, initialProjectId, initialPhaseId]);

  useEffect(() => {
    if (!selectedPhaseId || !selectedProjectId) {
      setPlots([]);
      if (!initialPlot) setSelectedPlot(null);
      return;
    }
    // Moved to separate useEffect with activePhase dependency
  }, [selectedPhaseId, selectedProjectId, initialPlot]);

  const activeProject = projects.find(p => p.product_id?.toString() === selectedProjectId?.toString());
  const activePhase = phases.find(p => (p.phaseId || p.id || p._id)?.toString() === selectedPhaseId?.toString());

  useEffect(() => {
    if (activePhase && activePhase.plots && activePhase.plots.length > 0) {
      setPlots(activePhase.plots);
    } else if (selectedPhaseId && selectedProjectId) {
        // Only fetch if activePhase doesn't have plots
        fetchPlots();
    } else {
        setPlots([]);
    }
  }, [activePhase, selectedPhaseId, selectedProjectId]);

  const fetchPlots = async () => {
    if (!selectedProjectId || !selectedPhaseId) return;
    setLoadingPlots(true);
    try {
      const res = await api.get(`/projects/${selectedProjectId}/phases/${selectedPhaseId}/inventory`);
      setPlots(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch plots", err);
      setPlots([]);
    } finally {
      setLoadingPlots(false);
    }
  };

  // Applicant 1
  const [a1Name, setA1Name] = useState(initialLeadName);
  const [a1Dob, setA1Dob] = useState<Date | undefined>(undefined);
  const [a1Relation, setA1Relation] = useState("");
  const [a1Phone, setA1Phone] = useState(initialLeadPhone);
  const [a1Email, setA1Email] = useState(initialLeadEmail);
  const [a1Aadhar, setA1Aadhar] = useState("");
  const [a1Pan, setA1Pan] = useState("");
  const [a1House, setA1House] = useState("");
  const [a1Street2, setA1Street2] = useState("");
  const [a1City, setA1City] = useState("");
  const [a1State, setA1State] = useState("");
  const [a1Postal, setA1Postal] = useState("");
  const [a1Landmark, setA1Landmark] = useState("");
  const [a1Country, setA1Country] = useState("");

  // Co-applicant
  const [a2Name, setA2Name] = useState("");
  const [a2Phone, setA2Phone] = useState("");
  const [a2Email, setA2Email] = useState("");
  const [a2Dob, setA2Dob] = useState<Date | undefined>(undefined);
  const [a2Relation, setA2Relation] = useState("");
  const [a2Aadhar, setA2Aadhar] = useState("");
  const [a2Pan, setA2Pan] = useState("");
  const [a2House, setA2House] = useState("");
  const [a2Street2, setA2Street2] = useState("");
  const [a2City, setA2City] = useState("");
  const [a2State, setA2State] = useState("");
  const [a2Postal, setA2Postal] = useState("");
  const [a2Landmark, setA2Landmark] = useState("");
  const [a2Country, setA2Country] = useState("");
  const [a1Image, setA1Image] = useState<string | null>(null);
  const [a2Image, setA2Image] = useState<string | null>(null);

  // Professional & Source
  const [industry, setIndustry] = useState("");
  const [industryOther, setIndustryOther] = useState("");
  const [func, setFunc] = useState("");
  const [funcOther, setFuncOther] = useState("");
  const [income, setIncome] = useState("");
  const [source, setSource] = useState("");
  const [sourceOther, setSourceOther] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [preferredBank, setPreferredBank] = useState("");
  const [purpose, setPurpose] = useState("");
  const [existingCustomer, setExistingCustomer] = useState<"yes" | "no" | "">("");
  const [ownedProject, setOwnedProject] = useState("");
  const [ownedCity, setOwnedCity] = useState("");

  // Booking
  const [totalAmount, setTotalAmount] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (selectedPlot) {
      setSelectedFacing(selectedPlot.facing || "");
      setManualPlotNumber(selectedPlot.plotNumber || "");
      setManualSize(selectedPlot.size || "");
      setManualPrice(selectedPlot.price || "");
    }
  }, [selectedPlot]);

  const resetForm = () => {
    if (!window.confirm("Are you sure you want to clear all form data?")) return;
    
    // Always clear applicant/lead details
    setA1Name(""); setA1Dob(undefined); setA1Relation(""); setA1Phone(""); setA1Email(""); setA1Aadhar(""); setA1Pan(""); setA1House(""); setA1Street2(""); setA1Landmark(""); setA1City(""); setA1State(""); setA1Postal(""); setA1Country("India"); setA1Image(null);
    setA2Name(""); setA2Dob(undefined); setA2Relation(""); setA2Aadhar(""); setA2Pan(""); setA2Phone(""); setA2Email(""); setA2House(""); setA2Street2(""); setA2Landmark(""); setA2City(""); setA2State(""); setA2Postal(""); setA2Country("India"); setA2Image(null);
    setIndustry(""); setIndustryOther(""); setFunc(""); setFuncOther(""); setIncome(""); setSource(""); setSourceOther(""); setPaymentMode(""); setPreferredBank(""); setPurpose(""); setExistingCustomer(""); setOwnedProject(""); setOwnedCity("");
    setTotalAmount(""); setAdvanceAmount(""); setRemarks("");
    
    // Only clear property selection if it wasn't pre-locked (from Inventory/Lead)
    if (!isDirectBooking) {
      setSelectedFacing(""); setManualPlotNumber(""); setManualSize(""); setManualPrice("");
      setSelectedProjectId(""); setSelectedPhaseId(""); setSelectedPlot(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlot && !manualPlotNumber && !selectedFacing) {
      return alert("Please select a plot or provide pre-launch details (Plot No / Facing).");
    }
    if (!a1Name || !a1Phone) return alert("Name and Phone are required.");
    setSubmitting(true);
    try {
      await api.post(`/projects/${selectedProjectId}/book`, {
        phaseId: selectedPhaseId, plotId: selectedPlot?.plotId || selectedPlot?.id || selectedPlot?._id || "pre-launch", leadName: a1Name, phone: a1Phone,
        bookingDetails: {
          type: bookingType,
          facing: selectedFacing,
          plotNumber: manualPlotNumber,
          size: manualSize,
          price: manualPrice,
          applicant: { name: a1Name, dob: a1Dob ? format(a1Dob, "yyyy-MM-dd") : "", relation: a1Relation, phone: a1Phone, email: a1Email, aadhar: a1Aadhar, pan: a1Pan, address: { house: a1House, street2: a1Street2, landmark: a1Landmark, city: a1City, state: a1State, postal: a1Postal, country: a1Country } },
          coApplicant: { name: a2Name, phone: a2Phone, email: a2Email, dob: a2Dob ? format(a2Dob, "yyyy-MM-dd") : "", relation: a2Relation, aadhar: a2Aadhar, pan: a2Pan, address: { house: a2House, street2: a2Street2, landmark: a2Landmark, city: a2City, state: a2State, postal: a2Postal, country: a2Country } },
          professional: { industry, function: func, income },
          source: source === "Others" ? sourceOther : source,
          paymentMode: paymentMode === "Home Loan" ? `Home Loan (${preferredBank})` : paymentMode,
          purpose, existingCustomer, ownedProject, ownedCity,
          totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
          advanceAmount: advanceAmount ? parseFloat(advanceAmount) : undefined,
          remarks,
        },
      });
      navigate(`/project_showcase/${selectedProjectId}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Booking failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 py-6 px-2">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="hover:bg-slate-100 rounded-full"><ArrowLeft className="h-5 w-5" /></Button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">Plot Booking Form</h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Official Documentation</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 flex-1">
            {!isDirectBooking && (
              <>
                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Select Project</Label>
                  <Select value={selectedProjectId || "none"} onValueChange={(v) => { setSelectedProjectId(v === "none" ? "" : v); setSelectedPhaseId(""); setSelectedPlot(null); }}>
                    <SelectTrigger className="w-[200px] h-10 text-xs font-bold bg-slate-50 border-slate-200 focus:bg-white transition-all">
                      <SelectValue placeholder={loadingProjects ? "Loading..." : "Choose Project"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingProjects ? (
                        <div className="flex items-center justify-center p-4"><Loader2 className="h-4 w-4 animate-spin text-red-600" /></div>
                      ) : (
                        <>
                          <SelectItem value="none" className="text-xs font-bold italic text-muted-foreground">None</SelectItem>
                          {projects.map(p => <SelectItem key={p.product_id || p._id} value={p.product_id?.toString()} className="text-xs font-bold">{p.name}</SelectItem>)}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Select Phase</Label>
                  <Select value={selectedPhaseId || "none"} onValueChange={(v) => { setSelectedPhaseId(v === "none" ? "" : v); setSelectedPlot(null); }} disabled={!selectedProjectId || loadingPhases}>
                    <SelectTrigger className="w-[180px] h-10 text-xs font-bold bg-slate-50 border-slate-200 focus:bg-white transition-all">
                      <SelectValue placeholder={loadingPhases ? "Loading..." : "Choose Phase"} />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingPhases ? (
                        <div className="flex items-center justify-center p-4"><Loader2 className="h-4 w-4 animate-spin text-red-600" /></div>
                      ) : (
                        <>
                          <SelectItem value="none" className="text-xs font-bold italic text-muted-foreground">None</SelectItem>
                          {phases.map(p => (
                            <SelectItem 
                              key={p.id || p._id || p.phaseId || p.product_id} 
                              value={(p.id || p._id || p.phaseId || p.product_id)?.toString()} 
                              className="text-xs font-bold"
                            >
                              {p.phaseName}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Select Plot</Label>
                  <Select value={(selectedPlot?.plotId || selectedPlot?.id || selectedPlot?._id)?.toString() || "none"} onValueChange={(v) => setSelectedPlot(v === "none" ? null : plots.find(p => (p.plotId || p.id || p._id)?.toString() === v))} disabled={!selectedPhaseId}>
                    <SelectTrigger className="w-[150px] h-10 text-xs font-bold bg-slate-50 border-slate-200 focus:bg-white transition-all">
                      <SelectValue placeholder="Choose Plot" />
                    </SelectTrigger>
                    <SelectContent>
                      <ScrollArea className="h-60">
                        {loadingPlots ? (
                            <div className="flex items-center justify-center p-4"><Loader2 className="h-4 w-4 animate-spin text-red-600" /></div>
                        ) : (
                            <>
                                <SelectItem value="none" className="text-xs font-bold italic text-muted-foreground">None (Pre-Launch)</SelectItem>
                                {plots.map(p => (
                                <SelectItem key={p.plotId || p.id || p._id} value={(p.plotId || p.id || p._id)?.toString()} className="text-xs font-bold">
                                    Plot {p.plotNumber} {p.size ? `(${p.size} Sq.Ft)` : ""}
                                </SelectItem>
                                ))}
                            </>
                        )}
                      </ScrollArea>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Facing Preference</Label>
                  <Select value={selectedFacing} onValueChange={(v) => setSelectedFacing(v === "none" ? "" : v)}>
                    <SelectTrigger className="w-[140px] h-10 text-xs font-bold bg-slate-50 border-slate-200 focus:bg-white transition-all">
                      <SelectValue placeholder="Select Facing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none" className="text-xs font-bold italic text-muted-foreground">None</SelectItem>
                      {FACINGS.map(f => <SelectItem key={f} value={f} className="text-xs font-bold">{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {!selectedPlot && (
                  <div className="space-y-1">
                    <Label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-1">Manual Sq.Ft</Label>
                    <Input value={manualSize} onChange={e => setManualSize(e.target.value)} className="w-[100px] h-7 text-xs font-bold bg-slate-50 border-slate-200" placeholder="Size" />
                  </div>
                )}
              </>
            )}
            
            <div className="ml-auto flex items-center pt-2">
              <Button type="button" variant="outline" onClick={resetForm} className="h-10 px-4 text-[10px] font-black tracking-widest border-red-200 text-red-600 hover:bg-red-50">CLEAR FORM</Button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">

            {/* ── Top Info Bar ── */}
            <div className="px-8 md:px-10 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span><strong className="text-foreground">Date:</strong> {new Date().toLocaleDateString("en-IN")}</span>
                {selectedPlot || manualPlotNumber || selectedFacing ? (
                  <>
                    <span><strong className="text-foreground">Plot:</strong> {manualPlotNumber || "—"}</span>
                    <span><strong className="text-foreground">Sq.Ft:</strong> {manualSize || "—"}</span>
                    <span><strong className="text-foreground">Facing:</strong> {selectedFacing || "—"}</span>
                    {selectedPlot?.isCorner && <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 text-[9px]">Corner Plot</Badge>}
                  </>
                ) : (
                  <span className="text-red-500 font-bold italic">No selection made yet</span>
                )}
              </div>
              <div className="flex gap-3">
                {(["Sales", "Purchase"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setBookingType(t)}
                    className={`group flex items-center gap-3 h-9 px-5 rounded-md text-[10px] font-black tracking-widest border transition-all ${bookingType === t ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20" : "border-slate-200 bg-white text-slate-500 hover:border-red-600 hover:text-red-600"}`}
                  >
                    <div className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-all ${bookingType === t ? "bg-white border-white text-red-600" : "bg-slate-50 border-slate-200"}`}>
                        {bookingType === t && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* ═══ TWO-COLUMN APPLICANT SECTION ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-8">
              <SectionBar label="Personal Information (to be filled in block / capital letters only)" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">
                {/* ── LEFT: Primary Applicant ── */}
                <div className="space-y-5 py-4">
                  <div className="flex flex-col items-center gap-4 border-b pb-4">
                    <div className="relative group">
                      <div className="w-24 h-28 bg-slate-100 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-red-400 group-hover:bg-red-50">
                        {a1Image ? (
                          <img src={a1Image} alt="Applicant 1" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <User className="h-8 w-8 text-slate-300" />
                            <span className="text-[8px] font-black text-slate-400 mt-2">PHOTO</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setA1Image(URL.createObjectURL(file));
                          }}
                        />
                      </div>
                      {a1Image && (
                        <button 
                          onClick={() => setA1Image(null)}
                          className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:text-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      {!a1Image && (
                        <div className="absolute -bottom-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg shadow-red-600/20">
                          <Camera className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground text-center">Name of the Sole / First Applicant</h4>
                  </div>
                  
                  <Field label="Mr./Mrs./Ms. Full Name" required><Input value={a1Name} onChange={e => setA1Name(e.target.value)} className={INPUT_CLS} required /></Field>
                  <Field label="Date of Birth / Age"><DatePicker date={a1Dob} setDate={setA1Dob} /></Field>
                  <Field label="Son / Daughter / Wife of"><Input value={a1Relation} onChange={e => setA1Relation(e.target.value)} className={INPUT_CLS} /></Field>
                  <Field label="Mobile No." required><Input value={a1Phone} onChange={e => setA1Phone(e.target.value.replace(/\D/g, ""))} className={INPUT_CLS} required /></Field>
                  <Field label="Email Id"><Input type="email" value={a1Email} onChange={e => setA1Email(e.target.value)} className={INPUT_CLS} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Aadhar No."><Input value={a1Aadhar} onChange={e => setA1Aadhar(e.target.value.replace(/\D/g, ""))} className={INPUT_CLS} /></Field>
                    <Field label="Pan No."><Input value={a1Pan} onChange={e => setA1Pan(e.target.value.toUpperCase())} className={INPUT_CLS} maxLength={10} /></Field>
                  </div>
                  <div className="pt-2 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Correspondence Address</p>
                    <Field label="House / Street No."><Input value={a1House} onChange={e => setA1House(e.target.value)} className={INPUT_CLS} /></Field>
                    <Field label="Street 2"><Input value={a1Street2} onChange={e => setA1Street2(e.target.value)} className={INPUT_CLS} /></Field>
                    <Field label="Landmark"><Input value={a1Landmark} onChange={e => setA1Landmark(e.target.value)} className={INPUT_CLS} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="City"><Input value={a1City} onChange={e => setA1City(e.target.value)} className={INPUT_CLS} /></Field>
                      <Field label="State"><Input value={a1State} onChange={e => setA1State(e.target.value)} className={INPUT_CLS} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Postal Code"><Input value={a1Postal} onChange={e => setA1Postal(e.target.value.replace(/\D/g, ""))} className={INPUT_CLS} /></Field>
                      <Field label="Country"><Input value={a1Country} onChange={e => setA1Country(e.target.value)} className={INPUT_CLS} /></Field>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT: Co-Applicant ── */}
                <div className="space-y-5 py-4 lg:border-l lg:pl-12 border-slate-100">
                  <div className="flex flex-col items-center gap-4 border-b pb-4">
                    <div className="relative group">
                      <div className="w-24 h-28 bg-slate-100 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-red-400 group-hover:bg-red-50">
                        {a2Image ? (
                          <img src={a2Image} alt="Applicant 2" className="w-full h-full object-cover" />
                        ) : (
                          <>
                            <User className="h-8 w-8 text-slate-300" />
                            <span className="text-[8px] font-black text-slate-400 mt-2">PHOTO</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setA2Image(URL.createObjectURL(file));
                          }}
                        />
                      </div>
                      {a2Image && (
                        <button 
                          onClick={() => setA2Image(null)}
                          className="absolute -top-2 -right-2 bg-white border border-slate-200 rounded-full p-1 shadow-sm hover:text-red-600 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                      {!a2Image && (
                        <div className="absolute -bottom-2 -right-2 bg-red-600 text-white rounded-full p-1.5 shadow-lg shadow-red-600/20">
                          <Camera className="h-3 w-3" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground text-center">Name of the Co / Second Applicant</h4>
                  </div>
                  
                  <Field label="Mr./Mrs./Ms. Full Name"><Input value={a2Name} onChange={e => setA2Name(e.target.value)} className={INPUT_CLS} /></Field>
                  <Field label="Date of Birth / Age"><DatePicker date={a2Dob} setDate={setA2Dob} /></Field>
                  <Field label="Son / Daughter / Wife of"><Input value={a2Relation} onChange={e => setA2Relation(e.target.value)} className={INPUT_CLS} /></Field>
                  <Field label="Mobile No."><Input value={a2Phone} onChange={e => setA2Phone(e.target.value.replace(/\D/g, ""))} className={INPUT_CLS} /></Field>
                  <Field label="Email Id"><Input type="email" value={a2Email} onChange={e => setA2Email(e.target.value)} className={INPUT_CLS} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Aadhar No."><Input value={a2Aadhar} onChange={e => setA2Aadhar(e.target.value.replace(/\D/g, ""))} className={INPUT_CLS} /></Field>
                    <Field label="Pan No."><Input value={a2Pan} onChange={e => setA2Pan(e.target.value.toUpperCase())} className={INPUT_CLS} maxLength={10} /></Field>
                  </div>
                  <div className="pt-2 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Correspondence Address</p>
                    <Field label="House / Street No."><Input value={a2House} onChange={e => setA2House(e.target.value)} className={INPUT_CLS} /></Field>
                    <Field label="Street 2"><Input value={a2Street2} onChange={e => setA2Street2(e.target.value)} className={INPUT_CLS} /></Field>
                    <Field label="Landmark"><Input value={a2Landmark} onChange={e => setA2Landmark(e.target.value)} className={INPUT_CLS} /></Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="City"><Input value={a2City} onChange={e => setA2City(e.target.value)} className={INPUT_CLS} /></Field>
                      <Field label="State"><Input value={a2State} onChange={e => setA2State(e.target.value)} className={INPUT_CLS} /></Field>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Postal Code"><Input value={a2Postal} onChange={e => setA2Postal(e.target.value.replace(/\D/g, ""))} className={INPUT_CLS} /></Field>
                      <Field label="Country"><Input value={a2Country} onChange={e => setA2Country(e.target.value)} className={INPUT_CLS} /></Field>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ PLOT DETAILS ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-6 border-t border-slate-100">
              <SectionBar label="Plot / Property Details" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Field label="Project Name"><Input value={activeProject?.name || initialProjectName || "—"} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
                <Field label="Plot No."><Input value={manualPlotNumber} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
                <Field label="Sq. Ft."><Input value={manualSize} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
                <Field label="Price (₹)"><Input value={manualPrice ? `₹ ${parseFloat(manualPrice.toString()).toLocaleString("en-IN")}` : "—"} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
                <Field label="Facing">
                  <Select value={selectedFacing} onValueChange={setSelectedFacing} disabled>
                    <SelectTrigger className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {FACINGS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Remarks"><Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Additional notes..." className="min-h-[70px] rounded-md border-slate-200 bg-slate-50/50 text-xs font-semibold px-4 py-3" /></Field>
            </div>

            {/* ═══ PROFESSIONAL DETAILS ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-8 border-t border-slate-100">
              <SectionBar label="Professional Details" />
              
              <div className="space-y-6">
                {/* Industry */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Industry</Label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {INDUSTRIES.filter(i => i !== "Others").map(i => (
                      <CheckboxOption key={i} label={i} checked={industry === i} onChange={() => setIndustry(i)} />
                    ))}
                    <CheckboxOption label="Others" checked={industry === "Others"} onChange={() => setIndustry("Others")} />
                    <InlineInput label="If others, please specify" value={industryOther} onChange={setIndustryOther} className={cn("ml-2 transition-opacity", industry !== "Others" && "opacity-30 pointer-events-none")} />
                  </div>
                </div>

                {/* Function */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Function</Label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {FUNCTIONS.filter(f => f !== "Others").map(f => (
                      <CheckboxOption key={f} label={f} checked={func === f} onChange={() => setFunc(f)} />
                    ))}
                    <CheckboxOption label="Others" checked={func === "Others"} onChange={() => setFunc("Others")} />
                    <InlineInput label="If others, please specify" value={funcOther} onChange={setFuncOther} className={cn("ml-2 transition-opacity", func !== "Others" && "opacity-30 pointer-events-none")} />
                  </div>
                </div>

                {/* Income */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Annual Income (INR)</Label>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {INCOME_RANGES.map(r => (
                      <CheckboxOption key={r} label={r} checked={income === r} onChange={() => setIncome(r)} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ SOURCE & PAYMENT ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-8 border-t border-slate-100">
              <SectionBar label="Source, Payment & Purpose" />
              
              <div className="space-y-8">
                {/* How did you come to know */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">How did you come to know about this Project?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                    {SOURCES.map(s => (
                      <CheckboxOption key={s} label={s} checked={source === s} onChange={() => setSource(s)} />
                    ))}
                    {source === "Others" && (
                      <InlineInput label="If others, Please specify" value={sourceOther} onChange={setSourceOther} className="col-span-full mt-2" />
                    )}
                  </div>
                </div>

                {/* Existing Customer */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Existing RC SPP Customer?</Label>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                    <div className="flex gap-6">
                      <CheckboxOption label="Yes" checked={existingCustomer === "yes"} onChange={() => setExistingCustomer("yes")} />
                      <CheckboxOption label="No" checked={existingCustomer === "no"} onChange={() => setExistingCustomer("no")} />
                    </div>
                    
                    {existingCustomer === "yes" && (
                      <div className="flex flex-wrap items-center gap-6 flex-1">
                        <InlineInput label="If yes, Owned Project Name:" value={ownedProject} onChange={setOwnedProject} className="flex-1" />
                        <InlineInput label="City:" value={ownedCity} onChange={setOwnedCity} className="flex-1" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Mode of Payment & Purpose */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Mode of Payment/Source</Label>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                      <CheckboxOption label="Own Funds" checked={paymentMode === "Own Funds"} onChange={() => setPaymentMode("Own Funds")} />
                      <div className="flex items-center gap-2">
                        <CheckboxOption label="Home Loan" checked={paymentMode === "Home Loan"} onChange={() => setPaymentMode("Home Loan")} />
                        <div className={cn("flex items-center gap-1 transition-opacity", paymentMode !== "Home Loan" && "opacity-30 pointer-events-none")}>
                          <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap ml-2">(Preferred Bank/HFI</span>
                          <input
                            type="text"
                            value={preferredBank}
                            onChange={(e) => setPreferredBank(e.target.value)}
                            className="bg-transparent border-b border-slate-300 focus:border-red-500 outline-none px-1 py-0.5 text-[11px] font-semibold transition-colors w-32"
                          />
                          <span className="text-[11px] font-bold text-slate-700">)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-foreground/70">Purpose of Purchase</Label>
                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                      {PURPOSES.map(p => (
                        <CheckboxOption key={p} label={p} checked={purpose === p} onChange={() => setPurpose(p)} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ BOOKING AMOUNTS ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-6 border-t border-slate-100">
              <SectionBar label="Booking Summary" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Total Amount (₹)"><Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" className={INPUT_CLS} /></Field>
                <Field label="Booking Advance Amount (₹)"><Input type="number" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} placeholder="0.00" className={INPUT_CLS} /></Field>
                <Field label="Balance Amount (₹)">
                  <div className="h-8 rounded-md border border-red-200 bg-red-50 flex items-center px-4">
                    <span className="text-sm font-black text-red-600">₹ {(parseFloat(totalAmount || "0") - parseFloat(advanceAmount || "0")).toLocaleString("en-IN")}</span>
                  </div>
                </Field>
              </div>
            </div>

            {/* ═══ ACTION BAR ═══ */}
            <div className="px-8 md:px-10 py-6 bg-slate-50/80 border-t flex items-center justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => navigate(-1)} className="h-11 px-8 font-black text-[10px] tracking-[0.2em] rounded-md">CANCEL</Button>
              <Button type="submit" disabled={submitting}
                className="bg-red-600 hover:bg-red-700 text-white font-black text-[10px] tracking-[0.2em] h-11 px-12 rounded-md shadow-lg shadow-red-600/20 transition-all flex items-center gap-2">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "CONFIRM BOOKING"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
