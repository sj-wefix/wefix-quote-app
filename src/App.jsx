import React, { useMemo, useState } from "react";

const gbp = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" });
const makeId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const emptyMaterial = () => ({ id: makeId(), description: "", qty: 1, unit: "each", unitCost: 0, margin: 30 });
const emptyPrelim = () => ({ id: makeId(), description: "", amount: 0, margin: 0 });
const emptyWork = () => ({ id: makeId(), priority: "Recommended", description: "" });

const steps = ["Job Details", "Scope of Works", "Materials", "Labour", "Prelims & Other", "Screenshot Review"];

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
      <div className="whitespace-pre-wrap text-sm font-semibold text-slate-950">{value || "Not entered"}</div>
    </div>
  );
}

function QuoteSection({ title, children }) {
  return (
    <section className="break-inside-avoid rounded-xl border border-slate-200 bg-white p-5">
      <h3 className="mb-4 border-b border-slate-200 pb-3 text-lg font-black text-slate-950">{title}</h3>
      {children}
    </section>
  );
}

function QuoteTable({ headers, children }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>{headers.map((h) => <th key={h} className="px-3 py-3">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export default function MaintenanceQuotePrototype() {
  const [step, setStep] = useState(0);
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

  const printQuote = () => window.print();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } main { background: white !important; } }`}</style>

      <div className="border-b border-slate-200 bg-white no-print">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-8">
          <BrandLogo />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={printQuote}>Print / Save PDF</Button>
            <Button onClick={() => setStep(5)}>Screenshot Review →</Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <nav className="mb-8 grid grid-cols-2 gap-2 md:grid-cols-6 md:gap-0 no-print">
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

        <div className={step === 5 ? "grid gap-6" : "grid gap-6 lg:grid-cols-[280px_1fr]"}>
          {step !== 5 && (
            <aside className="self-start rounded-xl border border-slate-200 bg-white p-5 shadow-sm no-print">
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
          )}

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
                    <thead className="text-xs uppercase text-slate-500"><tr><th className="py-3">Description</th><th>Qty</th><th>Unit</th><th>Unit cost (£)</th><th>Margin (%)</th><th>Line total (£)</th><th /></tr></thead>
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
              <div className="grid gap-5">
                <div className="flex flex-col gap-4 rounded-xl border border-green-200 bg-green-50 p-5 md:flex-row md:items-center md:justify-between no-print">
                  <div>
                    <h2 className="text-xl font-black text-green-900">Screenshot / Email Review</h2>
                    <p className="text-sm text-green-800">This page contains the full quote breakdown. Screenshot this page or use Print / Save PDF, then email it to admin.</p>
                  </div>
                  <Button onClick={printQuote}>Print / Save PDF</Button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-start md:justify-between">
                    <BrandLogo compact />
                    <div className="text-sm text-slate-600 md:text-right">
                      <div className="font-black text-slate-950">Internal Quote Breakdown</div>
                      <div>{new Date().toLocaleDateString("en-GB")}</div>
                    </div>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-2">
                    <QuoteSection title="Job Details">
                      <SummaryRow label="Property Address" value={form.address} />
                      <SummaryRow label="Postcode" value={form.postcode} />
                      <SummaryRow label="Job / CRM Reference" value={form.jobNumber} />
                      <SummaryRow label="Pricing Approach" value={form.pricingApproach} />
                    </QuoteSection>

                    <QuoteSection title="Quote Summary">
                      <Metric label="Materials inc margin" value={gbp.format(totals.materialSell)} highlight />
                      <Metric label="Labour inc margin" value={gbp.format(totals.labourSell)} highlight />
                      <Metric label="Prelims & other" value={gbp.format(totals.prelimSell)} highlight />
                      <div className="my-2 border-t border-slate-200" />
                      <Metric label="Subtotal ex VAT" value={gbp.format(totals.subtotal)} />
                      <Metric label="VAT" value={gbp.format(totals.vat)} />
                      <div className="mt-3 rounded-lg bg-green-600 p-4 text-white">
                        <div className="text-xs font-black uppercase">Total inc VAT</div>
                        <div className="text-3xl font-black">{gbp.format(totals.grandTotal)}</div>
                      </div>
                      <Metric label="Estimated cost" value={gbp.format(totals.totalCost)} />
                      <Metric label="Estimated profit" value={gbp.format(totals.profit)} highlight />
                    </QuoteSection>

                    <QuoteSection title="Scope of Works">
                      <div className="grid gap-3">
                        {form.workItems.map((item, index) => (
                          <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                            <div className="mb-1 text-xs font-black uppercase text-green-700">{index + 1}. {item.priority}</div>
                            <div className="whitespace-pre-wrap text-sm text-slate-900">{item.description || "No description entered"}</div>
                          </div>
                        ))}
                      </div>
                    </QuoteSection>

                    <QuoteSection title="Additional Observations — Not in Scope">
                      <div className="whitespace-pre-wrap rounded-lg bg-amber-50 p-4 text-sm text-slate-900">{form.observations || "No additional observations entered"}</div>
                    </QuoteSection>
                  </div>

                  <div className="mt-5 grid gap-5">
                    <QuoteSection title="Materials Breakdown">
                      <QuoteTable headers={["Description", "Qty", "Unit", "Unit cost", "Margin", "Line total"]}>
                        {form.materials.map((item) => {
                          const lineCost = toNumber(item.qty) * toNumber(item.unitCost);
                          const lineTotal = withMargin(lineCost, item.margin);
                          return (
                            <tr key={item.id} className="border-t border-slate-100">
                              <td className="px-3 py-3">{item.description || "-"}</td>
                              <td className="px-3 py-3">{item.qty}</td>
                              <td className="px-3 py-3">{item.unit}</td>
                              <td className="px-3 py-3">{gbp.format(toNumber(item.unitCost))}</td>
                              <td className="px-3 py-3">{item.margin}%</td>
                              <td className="px-3 py-3 font-black text-green-700">{gbp.format(lineTotal)}</td>
                            </tr>
                          );
                        })}
                      </QuoteTable>
                    </QuoteSection>

                    <div className="grid gap-5 lg:grid-cols-2">
                      <QuoteSection title="Labour Breakdown">
                        <SummaryRow label="Skilled Labour" value={`${form.skilledOperatives} operative(s) × ${form.skilledDays} day(s) @ ${gbp.format(toNumber(form.skilledRate))} / day`} />
                        <SummaryRow label="Unskilled Labour" value={`${form.unskilledOperatives} operative(s) × ${form.unskilledDays} day(s) @ ${gbp.format(toNumber(form.unskilledRate))} / day`} />
                        <SummaryRow label="Labour Margin" value={`${form.labourMargin}%`} />
                        <SummaryRow label="Labour Total Inc Margin" value={gbp.format(totals.labourSell)} />
                      </QuoteSection>

                      <QuoteSection title="Prelims & Other Breakdown">
                        {form.prelims.map((item) => (
                          <SummaryRow key={item.id} label={item.description || "Prelim item"} value={`${gbp.format(toNumber(item.amount))} + ${item.margin}% margin = ${gbp.format(withMargin(item.amount, item.margin))}`} />
                        ))}
                      </QuoteSection>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between no-print">
              <Button variant="secondary" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>← Back</Button>
              {step < steps.length - 1 ? <Button onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>Next: {steps[step + 1]} →</Button> : <Button onClick={printQuote}>Print / Save PDF</Button>}
            </div>
          </section>
        </div>
      </div>

      <footer className="mt-10 border-t border-slate-200 bg-white no-print">
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
