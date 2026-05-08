import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";

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
const PAYMENT_MODES = ["Own Funds", "Home Loan", "Both"];
const PURPOSES = ["Own Use", "Investment", "Others"];

const INPUT_CLS = "h-11 rounded-md border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-xs font-semibold px-4";

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
    <div className="bg-red-600 text-white px-4 py-2 rounded-sm -mx-8 md:-mx-10">
      <h3 className="text-[11px] font-black uppercase tracking-[0.2em]">{label}</h3>
    </div>
  );
}

export function BookingFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, projectName, phaseName, phaseId, plot } = location.state || {};

  const [submitting, setSubmitting] = useState(false);
  const [bookingType, setBookingType] = useState<"Sales" | "Purchase">("Sales");

  // Applicant 1
  const [a1Name, setA1Name] = useState("");
  const [a1Dob, setA1Dob] = useState("");
  const [a1Relation, setA1Relation] = useState("");
  const [a1Phone, setA1Phone] = useState("");
  const [a1Email, setA1Email] = useState("");
  const [a1Aadhar, setA1Aadhar] = useState("");
  const [a1Pan, setA1Pan] = useState("");
  const [a1House, setA1House] = useState("");
  const [a1Street2, setA1Street2] = useState("");
  const [a1City, setA1City] = useState("");
  const [a1State, setA1State] = useState("");
  const [a1Postal, setA1Postal] = useState("");

  // Co-applicant
  const [a2Name, setA2Name] = useState("");
  const [a2Phone, setA2Phone] = useState("");
  const [a2Email, setA2Email] = useState("");
  const [a2Dob, setA2Dob] = useState("");
  const [a2Relation, setA2Relation] = useState("");
  const [a2Aadhar, setA2Aadhar] = useState("");
  const [a2Pan, setA2Pan] = useState("");
  const [a2House, setA2House] = useState("");
  const [a2Street2, setA2Street2] = useState("");
  const [a2City, setA2City] = useState("");
  const [a2State, setA2State] = useState("");
  const [a2Postal, setA2Postal] = useState("");

  // Professional & Source
  const [industry, setIndustry] = useState("");
  const [industryOther, setIndustryOther] = useState("");
  const [func, setFunc] = useState("");
  const [funcOther, setFuncOther] = useState("");
  const [income, setIncome] = useState("");
  const [source, setSource] = useState("");
  const [sourceOther, setSourceOther] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [purpose, setPurpose] = useState("");
  const [existingCustomer, setExistingCustomer] = useState<"yes" | "no" | "">("");
  const [ownedProject, setOwnedProject] = useState("");
  const [ownedCity, setOwnedCity] = useState("");

  // Booking
  const [totalAmount, setTotalAmount] = useState("");
  const [advanceAmount, setAdvanceAmount] = useState("");
  const [remarks, setRemarks] = useState("");

  if (!plot) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h2 className="text-2xl font-bold">No plot selected</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!a1Name || !a1Phone) return alert("Name and Phone are required.");
    setSubmitting(true);
    try {
      await api.post(`/projects/${projectId}/book`, {
        phaseId, plotId: plot.plotId, leadName: a1Name, phone: a1Phone,
        bookingDetails: {
          type: bookingType,
          applicant: { name: a1Name, dob: a1Dob, relation: a1Relation, phone: a1Phone, email: a1Email, aadhar: a1Aadhar, pan: a1Pan, address: { house: a1House, street2: a1Street2, city: a1City, state: a1State, postal: a1Postal } },
          coApplicant: { name: a2Name, phone: a2Phone, email: a2Email, dob: a2Dob, relation: a2Relation, aadhar: a2Aadhar, pan: a2Pan, address: { house: a2House, street2: a2Street2, city: a2City, state: a2State, postal: a2Postal } },
          professional: { industry, function: func, income },
          source: source === "Others" ? sourceOther : source,
          paymentMode, purpose, existingCustomer, ownedProject, ownedCity,
          totalAmount: totalAmount ? parseFloat(totalAmount) : undefined,
          advanceAmount: advanceAmount ? parseFloat(advanceAmount) : undefined,
          remarks,
        },
      });
      navigate(`/project_showcase/${projectId}`);
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
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Plot Booking Form</h1>
            <p className="text-xs text-muted-foreground mt-0.5">{projectName} · {phaseName} · Plot {plot.plotNumber}{plot.size ? ` · ${plot.size} Sqft` : ""}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-white border border-slate-200 rounded-md shadow-sm overflow-hidden">

            {/* ── Top Info Bar ── */}
            <div className="px-8 md:px-10 py-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <span><strong className="text-foreground">Date:</strong> {new Date().toLocaleDateString("en-IN")}</span>
                <span><strong className="text-foreground">Plot:</strong> {plot.plotNumber}</span>
                <span><strong className="text-foreground">Sq.Ft:</strong> {plot.size || "—"}</span>
                <span><strong className="text-foreground">Facing:</strong> {plot.facing || "N/A"}</span>
                {plot.isCorner && <Badge className="bg-amber-500/10 text-amber-600 border-amber-300 text-[9px]">Corner Plot</Badge>}
              </div>
              <div className="flex gap-2">
                {(["Sales", "Purchase"] as const).map(t => (
                  <button key={t} type="button" onClick={() => setBookingType(t)}
                    className={`h-8 px-5 rounded-md text-[10px] font-black tracking-widest border transition-all ${bookingType === t ? "bg-red-600 border-red-600 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-red-600 hover:text-red-600"}`}
                  >{t.toUpperCase()}</button>
                ))}
              </div>
            </div>

            {/* ═══ TWO-COLUMN APPLICANT SECTION ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-8">
              <SectionBar label="Personal Information (to be filled in block / capital letters only)" />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-0">
                {/* ── LEFT: Primary Applicant ── */}
                <div className="space-y-5 py-4">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-center text-muted-foreground border-b pb-2">Name of the Sole / First Applicant</h4>
                  <Field label="Mr./Mrs./Ms. Full Name" required><Input value={a1Name} onChange={e => setA1Name(e.target.value)} className={INPUT_CLS} required /></Field>
                  <Field label="Date of Birth / Age"><Input type="date" value={a1Dob} onChange={e => setA1Dob(e.target.value)} className={INPUT_CLS} /></Field>
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
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="City"><Input value={a1City} onChange={e => setA1City(e.target.value)} className={INPUT_CLS} /></Field>
                      <Field label="State"><Input value={a1State} onChange={e => setA1State(e.target.value)} className={INPUT_CLS} /></Field>
                      <Field label="Postal Code"><Input value={a1Postal} onChange={e => setA1Postal(e.target.value.replace(/\D/g, ""))} className={INPUT_CLS} /></Field>
                    </div>
                  </div>
                </div>

                {/* ── RIGHT: Co-Applicant ── */}
                <div className="space-y-5 py-4 lg:border-l lg:pl-12 border-slate-100">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground">Name of the Co / Second Applicant</h4>
                  </div>
                  <Field label="Mr./Mrs./Ms. Full Name"><Input value={a2Name} onChange={e => setA2Name(e.target.value)} className={INPUT_CLS} /></Field>
                  <Field label="Date of Birth / Age"><Input type="date" value={a2Dob} onChange={e => setA2Dob(e.target.value)} className={INPUT_CLS} /></Field>
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
                    <div className="grid grid-cols-3 gap-3">
                      <Field label="City"><Input value={a2City} onChange={e => setA2City(e.target.value)} className={INPUT_CLS} /></Field>
                      <Field label="State"><Input value={a2State} onChange={e => setA2State(e.target.value)} className={INPUT_CLS} /></Field>
                      <Field label="Postal Code"><Input value={a2Postal} onChange={e => setA2Postal(e.target.value.replace(/\D/g, ""))} className={INPUT_CLS} /></Field>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ PLOT DETAILS ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-6 border-t border-slate-100">
              <SectionBar label="Plot / Property Details" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Field label="Project Name"><Input value={projectName} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
                <Field label="Plot No."><Input value={plot.plotNumber} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
                <Field label="Sq. Ft."><Input value={plot.size?.toString() || "—"} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
                <Field label="Price (₹)"><Input value={plot.price ? `₹ ${plot.price.toLocaleString("en-IN")}` : "On Request"} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
                <Field label="Facing"><Input value={plot.facing || "N/A"} disabled className={`${INPUT_CLS} bg-slate-100 text-slate-500 cursor-not-allowed`} /></Field>
              </div>
              <Field label="Remarks"><Textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Additional notes..." className="min-h-[70px] rounded-md border-slate-200 bg-slate-50/50 text-xs font-semibold px-4 py-3" /></Field>
            </div>

            {/* ═══ PROFESSIONAL DETAILS ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-6 border-t border-slate-100">
              <SectionBar label="Professional Details" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Industry">
                  <Select value={industry} onValueChange={setIndustry}><SelectTrigger className={INPUT_CLS}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{INDUSTRIES.map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select>
                  {industry === "Others" && <Input value={industryOther} onChange={e => setIndustryOther(e.target.value)} placeholder="If others, please specify" className={`${INPUT_CLS} mt-2`} />}
                </Field>
                <Field label="Function">
                  <Select value={func} onValueChange={setFunc}><SelectTrigger className={INPUT_CLS}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{FUNCTIONS.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent></Select>
                  {func === "Others" && <Input value={funcOther} onChange={e => setFuncOther(e.target.value)} placeholder="If others, please specify" className={`${INPUT_CLS} mt-2`} />}
                </Field>
                <Field label="Annual Income (INR)">
                  <Select value={income} onValueChange={setIncome}><SelectTrigger className={INPUT_CLS}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{INCOME_RANGES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent></Select>
                </Field>
              </div>
            </div>

            {/* ═══ SOURCE & PAYMENT ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-6 border-t border-slate-100">
              <SectionBar label="Source & Payment" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="How did you come to know about this Project?">
                  <Select value={source} onValueChange={setSource}><SelectTrigger className={INPUT_CLS}><SelectValue placeholder="Select source" /></SelectTrigger>
                    <SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
                </Field>
                {source === "Others" && <Field label="If others, please specify"><Input value={sourceOther} onChange={e => setSourceOther(e.target.value)} className={INPUT_CLS} /></Field>}
                <Field label="Existing Customer?">
                  <div className="flex gap-3 pt-1">
                    {(["yes", "no"] as const).map(v => (
                      <button key={v} type="button" onClick={() => setExistingCustomer(v)}
                        className={`h-9 px-5 rounded-md text-[10px] font-black tracking-widest border transition-all ${existingCustomer === v ? "bg-red-600 border-red-600 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-red-600"}`}
                      >{v.toUpperCase()}</button>
                    ))}
                  </div>
                </Field>
                {existingCustomer === "yes" && (
                  <>
                    <Field label="Owned Project Name"><Input value={ownedProject} onChange={e => setOwnedProject(e.target.value)} className={INPUT_CLS} /></Field>
                    <Field label="City"><Input value={ownedCity} onChange={e => setOwnedCity(e.target.value)} className={INPUT_CLS} /></Field>
                  </>
                )}
                <Field label="Mode of Payment / Source">
                  <Select value={paymentMode} onValueChange={setPaymentMode}><SelectTrigger className={INPUT_CLS}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{PAYMENT_MODES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select>
                </Field>
                <Field label="Purpose of Purchase">
                  <Select value={purpose} onValueChange={setPurpose}><SelectTrigger className={INPUT_CLS}><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{PURPOSES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select>
                </Field>
              </div>
            </div>

            {/* ═══ BOOKING AMOUNTS ═══ */}
            <div className="px-8 md:px-10 py-8 space-y-6 border-t border-slate-100">
              <SectionBar label="Booking Summary" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Field label="Total Amount (₹)"><Input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" className={INPUT_CLS} /></Field>
                <Field label="Booking Advance Amount (₹)"><Input type="number" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} placeholder="0.00" className={INPUT_CLS} /></Field>
                <Field label="Balance Amount (₹)">
                  <div className="h-11 rounded-md border border-red-200 bg-red-50 flex items-center px-4">
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
