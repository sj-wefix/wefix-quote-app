import React, { useMemo, useState } from "react";

const SHEET_WEB_APP_URL = "Ahttps://script.google.com/macros/s/AKfycbyszVcji_ROGPJrXs7qIIvioUGO5RUfOL9DB4PFnyYu_EzLECZfNCTcuH5bK8DubdTgjw/exec";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const makeId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const emptyMaterial = () => ({ id: makeId(), description: "", qty: 1, unit: "each", unitCost: 0, margin: 30 });
const emptyPrelim = () => ({ id: makeId(), description: "", amount: 0, margin: 0 });
const emptyWork = () => ({ id: makeId(), priority: "Recommended", description: "" });

const steps = ["Job Details", "Scope of Works", "Materials", "Labour", "Prelims & Other", "Review & Submit"];

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function withMargin(cost, margin) {
  return cost * (1 + toNumber(margin) / 100);
}

const inputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10";
const smallInputClass = "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-950 outline-none transition focus:border-green-600 focus:ring-4 focus:ring-green-600/10";

function Button({ children, onClick, disabled, variant = "primary" }) {
  const styles = {
    primary: "bg-green-600 text-white hover:bg-green-700 shadow-sm",
    secondary: "border border-green-600 bg-white text-green-700 hover:bg-green-50",
    ghost: "bg-white text-slate-500 hover:bg-slate-50",
    danger: "border border-slate-200 bg-white text-slate-500 hover:bg-red-50 hover:text-red-600",
  };

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`rounded-lg px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]}`}>
      {children}
    </button>
  );
}

function BrandLogo({ compact = false }) {
  return (
    <div className="leading-none">
      <div className="flex flex-wrap items-end gap-1">
        <span className={`${compact ? "text-3xl" : "text-5xl"} font-black tracking-tighter text-black`}>WeF</span>
        <span className={`relative ${compact ? "text-3xl" : "text-5xl"} font-black tracking-tighter text-black`}>
          I
          <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-sm bg-green-600" />
        </span>
        <span className={`${compact ? "text-3xl" : "text-5xl"} font-black tracking-tighter text-black`}>X</span>
        <span className={`${compact ? "text-lg" : "text-3xl"} rounded-sm bg-green-600 px-2 py-1 font-black uppercase tracking-tight text-white`}>.Properties</span>
      </div>
      {!compact && <div className="mt-1 text-xs font-black uppercase tracking-wide text-green-700">Putting care into property repair</div>}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Metric({ label, value, highlight = false }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className="text-xs font-medium uppercase text-slate-600">{label}</span>
      <span className={`text-sm font-black ${highlight ? "text-green-600" : "text-slate-950"}`}>{value}</span>
    </div>
  );
}

function Panel({ title, hint, children, action }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-green-50 text-2xl text-green-700">▣</div>
          <div>
            <h2 className="text-2xl font-black text-slate-950">{title}</h2>
            {hint && <p className="mt-1 text-sm text-slate-600">{hint}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className="grid gap-5 p-5 md:p-7">{children}</div>
    </section>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="border-b border-slate-200 py-4 last:border-b-0">
      <div className="mb-1 text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-950">{value}</div>
    </div>
  );
}

export default function MaintenanceQuotePrototype() {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    address: "",
    postcode: "",
    jobNumber: "",
    workItems: [emptyWork()],
    observations: "",
    materials: [emptyMaterial()],
    skilledRate: 250,
    skilledDays: 1,
    skilledOperatives: 1,
    unskilledRate: 160,
    unskilledDays: 0,
    unskilledOperatives: 0,
    labourMargin: 30,
    prelims: [emptyPrelim()],
    vat: true,
    pricingApproach: "Competitive — sharp but commercially safe",
    adminNotes: "",
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const updateWork = (id, field, value) => setForm((p) => ({ ...p, workItems: p.workItems.map((x) => (x.id === id ? { ...x, [field]: value } : x)) }));
  const updateMaterial = (id, field, value) => setForm((p) => ({ ...p, materials: p.materials.map((x) => (x.id === id ? { ...x, [field]: value } : x)) }));
  const updatePrelim = (id, field, value) => setForm((p) => ({ ...p, prelims: p.prelims.map((x) => (x.id === id ? { ...x, [field]: value } : x)) }));

  const totals = useMemo(() => {
    const materialCost = form.materials.reduce((sum, item) => sum + toNumber(item.qty) * toNumber(item.unitCost), 0);
    const materialSell = form.materials.reduce((sum, item) => sum + withMargin(toNumber(item.qty) * toNumber(item.unitCost), item.margin), 0);
    const skilledCost = toNumber(form.skilledRate) * toNumber(form.skilledDays) * toNumber(form.skilledOperatives);
    const unskilledCost = toNumber(form.unskilledRate) * toNumber(form.unskilledDays) * toNumber(form.unskilledOperatives);
    const labourCost = skilledCost + unskilledCost;
    const labourSell = withMargin(labourCost, form.labourMargin);
    const prelimCost = form.prelims.reduce((sum, item) => sum + toNumber(item.amount), 0);
    const prelimSell = form.prelims.reduce((sum, item) => sum + withMargin(toNumber(item.amount), item.margin), 0);
    const subtotal = materialSell + labourSell + prelimSell;
    const vat = form.vat ? subtotal * 0.2 : 0;
    const grandTotal = subtotal + vat;
    const totalCost = materialCost + labourCost + prelimCost;
    const profit = subtotal - totalCost;
    return { materialCost, materialSell, labourCost, labourSell, prelimCost, prelimSell, subtotal, vat, grandTotal, totalCost, profit };
  }, [form]);

  const cleanQuoteData = {
    address: form.address,
    postcode: form.postcode,
    jobNumber: form.jobNumber,
    workItems: form.workItems,
    observations: form.observations,
    materials: form.materials,
    skilledRate: form.skilledRate,
    skilledDays: form.skilledDays,
    skilledOperatives: form.skilledOperatives,
    unskilledRate: form.unskilledRate,
    unskilledDays: form.unskilledDays,
    unskilledOperatives: form.unskilledOperatives,
    labourMargin: form.labourMargin,
    prelims: form.prelims,
    vat: form.vat,
    pricingApproach: form.pricingApproach,
    adminNotes: form.adminNotes,
    totals,
    submittedAt: new Date().toISOString(),
  };

  const payload = JSON.stringify(cleanQuoteData);

  const submitToSheet = async () => {
    if (!form.address.trim()) {
      alert("Please add the property address before submitting.");
      setStep(0);
      return;
    }

    if (SHEET_WEB_APP_URL.includes("REPLACE_WITH")) {
      alert("Google Sheet URL is not set in App.jsx.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new URLSearchParams();
      formData.append("payload", payload);

      await fetch(SHEET_WEB_APP_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      alert("Quote submitted successfully");
    } catch (error) {
      alert("Error submitting quote");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <BrandLogo />
          <Button onClick={() => setStep(5)}>Preview Quote →</Button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <nav className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-0">
          {steps.map((label, index) => {
            const done = index < step;
            const active = index === step;
            return (
              <button key={label} type="button" onClick={() => setStep(index)} className="relative flex flex-col items-center gap-2 py-2 text-center">
                <span className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-black ${active || done ? "border-green-600 bg-green-600 text-white" : "border-slate-300 bg-white text-slate-500"}`}>{index + 1}</span>
                <span className={`text-sm ${active ? "font-black text-slate-950" : done ? "text-green-700" : "text-slate-500"}`}>{label}</span>
                {done && <span className="text-green-600">✓</span>}
              </button>
            );
          })}
        </nav>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-black uppercase text-slate-950">Job Summary</h3>
            <SummaryRow label="Job Number" value={form.jobNumber || "Not entered"} />
            <SummaryRow label="Address" value={form.address || "Not entered"} />

            <div className="mt-5 border-t border-slate-200 pt-4">
              <Metric label="Materials inc margin" value={gbp.format(totals.materialSell)} highlight />
              <Metric label="Labour inc margin" value={gbp.format(totals.labourSell)} highlight />
              <Metric label="Prelims & other" value={gbp.format(totals.prelimSell)} highlight />
            </div>
            <div className="mt-4 border-t border-slate-200 pt-4">
              <Metric label="Subtotal" value={gbp.format(totals.subtotal)} />
              <Metric label="VAT 20%" value={gbp.format(totals.vat)} />
            </div>
            <div className="-mx-5 mt-4 bg-green-600 p-5 text-white">
              <div className="text-xs font-black uppercase">Quote Total Inc VAT</div>
              <div className="mt-2 text-3xl font-black">{gbp.format(totals.grandTotal)}</div>
            </div>
            <div className="pt-5">
              <div className="text-xs uppercase text-slate-500">Est. profit</div>
              <div className="mt-2 text-xl font-black text-green-600">{gbp.format(totals.profit)}</div>
            </div>
          </aside>

          <section className="grid gap-6">
            {step === 0 && (
              <Panel title="Job Details" hint="Keep this lean. This tool sits alongside the CRM, so only property address is essential. Job number can be added if known.">
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Property address"><textarea className={inputClass} rows={3} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Full property address" /></Field>
                  <div className="grid gap-5">
                    <Field label="Job number / CRM reference optional"><input className={inputClass} value={form.jobNumber} onChange={(e) => update("jobNumber", e.target.value)} placeholder="Optional — e.g. JOB-1042" /></Field>
                    <Field label="Postcode optional"><input className={inputClass} value={form.postcode} onChange={(e) => update("postcode", e.target.value)} placeholder="Optional" /></Field>
                  </div>
                </div>
              </Panel>
            )}

            {step === 1 && (
              <Panel title="Scope of Works" hint="Add clear work items. These become the professional scope for the admin team." action={<Button variant="secondary" onClick={() => setForm((p) => ({ ...p, workItems: [...p.workItems, emptyWork()] }))}>+ Add Work Item</Button>}>
                {form.workItems.map((item, index) => (
                  <div key={item.id} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black">Work item {index + 1}</h3>
                      <Button variant="danger" onClick={() => setForm((p) => ({ ...p, workItems: p.workItems.filter((x) => x.id !== item.id) }))}>Remove</Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field label="Priority"><select className={inputClass} value={item.priority} onChange={(e) => updateWork(item.id, "priority", e.target.value)}><option>Essential</option><option>Recommended</option><option>Optional</option><option>Urgent</option></select></Field>
                      <div className="md:col-span-2"><Field label="Description"><textarea className={inputClass} rows={3} value={item.description} onChange={(e) => updateWork(item.id, "description", e.target.value)} placeholder="e.g. Replace 3x cracked slates on front elevation, match existing..." /></Field></div>
                    </div>
                  </div>
                ))}
                <Field label="Additional observations — flagged to customer, not in scope"><textarea className={inputClass} rows={3} value={form.observations} onChange={(e) => update("observations", e.target.value)} /></Field>
              </Panel>
            )}

            {step === 2 && (
              <Panel title="Materials" hint="Add all materials required for this job. Margin is applied per line." action={<Button variant="secondary" onClick={() => setForm((p) => ({ ...p, materials: [...p.materials, emptyMaterial()] }))}>+ Add Material</Button>}>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px] text-left">
                    <thead className="text-xs uppercase text-slate-500">
                      <tr><th className="py-3">Description</th><th>Qty</th><th>Unit</th><th>Unit cost (£)</th><th>Margin (%)</th><th>Line total (£)</th><th /></tr>
                    </thead>
                    <tbody>
                      {form.materials.map((item) => {
                        const lineCost = toNumber(item.qty) * toNumber(item.unitCost);
                        const lineTotal = withMargin(lineCost, item.margin);
                        return (
                          <tr key={item.id} className="border-t border-slate-100">
                            <td className="py-4 pr-4"><input className={smallInputClass} value={item.description} onChange={(e) => updateMaterial(item.id, "description", e.target.value)} placeholder="Item description" /></td>
                            <td className="pr-4"><input className={smallInputClass} type="number" value={item.qty} onChange={(e) => updateMaterial(item.id, "qty", e.target.value)} /></td>
                            <td className="pr-4"><select className={smallInputClass} value={item.unit} onChange={(e) => updateMaterial(item.id, "unit", e.target.value)}><option>each</option><option>m²</option><option>metre</option><option>roll</option><option>box</option><option>day</option></select></td>
                            <td className="pr-4"><input className={smallInputClass} type="number" value={item.unitCost} onChange={(e) => updateMaterial(item.id, "unitCost", e.target.value)} /></td>
                            <td className="pr-4"><input className={smallInputClass} type="number" value={item.margin} onChange={(e) => updateMaterial(item.id, "margin", e.target.value)} /></td>
                            <td className="pr-4 text-sm font-black text-green-600">{gbp.format(lineTotal)}</td>
                            <td><Button variant="danger" onClick={() => setForm((p) => ({ ...p, materials: p.materials.filter((x) => x.id !== item.id) }))}>×</Button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={() => setForm((p) => ({ ...p, materials: [...p.materials, emptyMaterial()] }))} className="rounded-lg border border-dashed border-slate-300 py-4 text-sm font-bold text-green-700 hover:bg-green-50">+ Add Material</button>
                <div className="grid overflow-hidden rounded-xl border border-slate-200 md:grid-cols-3">
                  <div className="p-5 text-center"><div className="text-xs text-slate-500">Materials Cost Ex Margin</div><div className="mt-2 font-black">{gbp.format(totals.materialCost)}</div></div>
                  <div className="border-t border-slate-200 p-5 text-center md:border-l md:border-t-0"><div className="text-xs text-slate-500">Total Margin</div><div className="mt-2 font-black">{gbp.format(totals.materialSell - totals.materialCost)}</div></div>
                  <div className="bg-green-50 p-5 text-center"><div className="text-xs font-bold text-slate-700">Materials Total Inc Margin</div><div className="mt-2 text-xl font-black text-green-600">{gbp.format(totals.materialSell)}</div></div>
                </div>
              </Panel>
            )}

            {step === 3 && (
              <Panel title="Labour" hint="Separate skilled and unskilled labour so admin can see the operational logic, not just the final number.">
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  <Field label="Skilled day rate (£)"><input className={inputClass} type="number" value={form.skilledRate} onChange={(e) => update("skilledRate", e.target.value)} /></Field>
                  <Field label="Skilled operatives"><input className={inputClass} type="number" value={form.skilledOperatives} onChange={(e) => update("skilledOperatives", e.target.value)} /></Field>
                  <Field label="Skilled days"><input className={inputClass} type="number" value={form.skilledDays} onChange={(e) => update("skilledDays", e.target.value)} /></Field>
                  <Field label="Unskilled day rate (£)"><input className={inputClass} type="number" value={form.unskilledRate} onChange={(e) => update("unskilledRate", e.target.value)} /></Field>
                  <Field label="Unskilled operatives"><input className={inputClass} type="number" value={form.unskilledOperatives} onChange={(e) => update("unskilledOperatives", e.target.value)} /></Field>
                  <Field label="Unskilled days"><input className={inputClass} type="number" value={form.unskilledDays} onChange={(e) => update("unskilledDays", e.target.value)} /></Field>
                  <Field label="Labour margin %"><input className={inputClass} type="number" value={form.labourMargin} onChange={(e) => update("labourMargin", e.target.value)} /></Field>
                  <Field label="VAT registered?"><select className={inputClass} value={form.vat ? "yes" : "no"} onChange={(e) => update("vat", e.target.value === "yes")}><option value="yes">Yes — add VAT at 20%</option><option value="no">No VAT</option></select></Field>
                  <Field label="Pricing approach"><select className={inputClass} value={form.pricingApproach} onChange={(e) => update("pricingApproach", e.target.value)}><option>Competitive — sharp but commercially safe</option><option>Standard — normal margin</option><option>Premium — complex / high-risk works</option><option>Cost recovery only</option></select></Field>
                </div>
              </Panel>
            )}

            {step === 4 && (
              <Panel title="Prelims & Other" hint="Use this for scaffolding, parking, permits, access equipment, waste, travel, protection and setup costs." action={<Button variant="secondary" onClick={() => setForm((p) => ({ ...p, prelims: [...p.prelims, emptyPrelim()] }))}>+ Add Prelim</Button>}>
                {form.prelims.map((item) => (
                  <div key={item.id} className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-12">
                    <div className="md:col-span-6"><Field label="Description"><input className={inputClass} value={item.description} onChange={(e) => updatePrelim(item.id, "description", e.target.value)} placeholder="e.g. Waste disposal / scaffold tower / parking" /></Field></div>
                    <div className="md:col-span-2"><Field label="Amount"><input className={inputClass} type="number" value={item.amount} onChange={(e) => updatePrelim(item.id, "amount", e.target.value)} /></Field></div>
                    <div className="md:col-span-2"><Field label="Margin %"><input className={inputClass} type="number" value={item.margin} onChange={(e) => updatePrelim(item.id, "margin", e.target.value)} /></Field></div>
                    <div className="flex items-end justify-between md:col-span-2"><div className="pb-2 text-xl font-black text-green-600">{gbp.format(withMargin(item.amount, item.margin))}</div><Button variant="danger" onClick={() => setForm((p) => ({ ...p, prelims: p.prelims.filter((x) => x.id !== item.id) }))}>×</Button></div>
                  </div>
                ))}
              </Panel>
            )}

            {step === 5 && (
              <Panel title="Review & Submit" hint="Review the quote summary, then submit to the admin spreadsheet.">
                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
                    <SummaryRow label="Job" value={form.jobNumber || "Not entered"} />
                    <SummaryRow label="Address" value={`${form.address || "Not entered"} ${form.postcode || ""}`} />
                    <SummaryRow label="Works" value={`${form.workItems.length} work item(s)`} />
                    <SummaryRow label="Materials" value={`${form.materials.length} line(s)`} />
                    <SummaryRow label="VAT" value={form.vat ? "20% included" : "No VAT"} />
                  </div>
                  <div className="grid gap-3 rounded-xl border border-green-600/20 bg-white p-5">
                    <Metric label="Materials" value={gbp.format(totals.materialSell)} highlight />
                    <Metric label="Labour" value={gbp.format(totals.labourSell)} highlight />
                    <Metric label="Prelims" value={gbp.format(totals.prelimSell)} highlight />
                    <Metric label="Subtotal" value={gbp.format(totals.subtotal)} />
                    <Metric label="VAT" value={gbp.format(totals.vat)} />
                    <div className="rounded-xl bg-green-600 p-4 text-white"><div className="text-xs font-black uppercase">Final quote total</div><div className="text-3xl font-black">{gbp.format(totals.grandTotal)}</div></div>
                  </div>
                </div>
              </Panel>
            )}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <Button variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</Button>
              {step < steps.length - 1 ? <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>Next: {steps[step + 1]} →</Button> : <Button onClick={submitToSheet} disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit to spreadsheet"}</Button>}
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between md:px-8">
          <BrandLogo compact />
          <div className="text-sm text-slate-500 md:text-right">
            <div>© 2024 WeFix Properties</div>
            <div>Professional quotes for property repair</div>
          </div>
        </div>
        <div className="h-2 bg-green-600" />
      </footer>
    </main>
  );
}
