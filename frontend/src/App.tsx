import React, { useEffect, useState } from "react";

const API_BASE = ""; // backend in docker-compose

export default function App() {
  return <ManagerDashboardV2 />;
}

function ManagerDashboardV2() {
  const [depthMode, setDepthMode] = useState<"simple" | "deep">("simple");
  const [active, setActive] = useState<"dashboard" | "uploader">("dashboard");

  // Fetch live metrics from backend
  const [metrics, setMetrics] = useState<any | null>(null);
  useEffect(() => {
    fetch(`${API_BASE}/api/metrics/overview`).then(r => r.json()).then(setMetrics).catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Header depthMode={depthMode} setDepthMode={setDepthMode} active={active} setActive={setActive} />
      <main className="mx-auto max-w-7xl px-4 py-6">
        {active === "dashboard" ? (
          metrics ? <Tiles metrics={metrics} depthMode={depthMode} /> : <div>Loading…</div>
        ) : (
          <Uploader />
        )}
      </main>
    </div>
  );
}

function Header({ depthMode, setDepthMode, active, setActive }: any) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button title="Menu" className="h-10 w-10 grid place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-100">☰</button>
          <div className="h-9 w-9 rounded-2xl bg-indigo-600 shadow-sm" />
          <h1 className="text-xl font-semibold tracking-tight">Manager Dashboard</h1>
          <span className="ml-2 text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">V2.1</span>
          <nav className="ml-4 hidden md:flex gap-2">
            <button onClick={() => setActive("dashboard")} className={`px-3 py-1.5 rounded-lg text-sm border ${active === "dashboard" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-300"}`}>Dashboard</button>
            <button onClick={() => setActive("uploader")} className={`px-3 py-1.5 rounded-lg text-sm border ${active === "uploader" ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-300"}`}>Upload & Index</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs">
            <button className={`px-2 py-1 rounded-l-lg border ${depthMode === "simple" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`} onClick={() => setDepthMode("simple")}>Simple</button>
            <button className={`px-2 py-1 rounded-r-lg border ${depthMode === "deep" ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-300"}`} onClick={() => setDepthMode("deep")}>In-depth</button>
          </div>
          <button title="Search" className="h-10 w-10 grid place-items-center rounded-xl border border-slate-200 bg-white hover:bg-slate-100">🔍</button>
        </div>
      </div>
    </header>
  );
}

function Tiles({ metrics, depthMode }: any) {
  return (
    <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Total Calls" subtitle="Today • This week • Month-to-date">
        <div className="flex items-end gap-6">
          <Metric label="Today" value={metrics.totals.today.toLocaleString()} />
          <Metric label="This week" value={metrics.totals.week.toLocaleString()} />
          <Metric label="MTD" value={metrics.totals.mtd.toLocaleString()} />
        </div>
        {depthMode === "deep" && <MiniBars values={[metrics.totals.today, metrics.totals.week/7, metrics.totals.mtd/30]} labels={["T","W avg","M avg"]} />}
      </Card>

      <Card title="NPS (MTD)" subtitle="Customer satisfaction trend">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-semibold">{metrics.npsMTD.score}</div>
          <Trend change={metrics.npsMTD.change} />
        </div>
        {depthMode === "deep" && <MiniLine points={[45, 52, 58, 60, 62]} />}
      </Card>

      <Card title="Top Staff by NPS (MTD)" subtitle="Best performer">
        <div className="text-sm">
          <div className="font-medium">{metrics.topStaff.name}</div>
          <div className="text-slate-500">Team: {metrics.topStaff.team}</div>
          <div className="mt-1 text-slate-700">NPS: <span className="font-semibold">{metrics.topStaff.nps}</span></div>
        </div>
        {depthMode === "deep" && <MiniBars values={[81,72,70,69]} labels={["#1","#2","#3","#4"]} />}
      </Card>

      <Card title="Most Common Complaint (MTD)" subtitle="Type • Count">
        <div className="text-sm">
          <div className="font-medium">{metrics.commonComplaint.type}</div>
          <div className="text-slate-700">Count: <span className="font-semibold">{metrics.commonComplaint.count}</span></div>
        </div>
        {depthMode === "deep" && <MiniBars values={[324,289,201]} labels={["Billing","Login","Delays"]} />}
      </Card>

      <Card title="Average Call Time" subtitle="Month-to-date">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold">{metrics.avgCallTime.value}</div>
          <Trend change={metrics.avgCallTime.changePct} suffix="%" />
        </div>
        {depthMode === "deep" && <MiniLine points={[5.7,5.4,5.3,5.1,4.95,4.9]} />}        
      </Card>

      <Card title="Avg Holds per Call" subtitle="Month-to-date">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold">{metrics.avgHolds.value}</div>
          <Trend change={metrics.avgHolds.changePct} suffix="%" />
        </div>
        {depthMode === "deep" && <MiniLine points={[1.6,1.55,1.4,1.3,1.2]} />}        
      </Card>

      <Card title="Best Department by NPS" subtitle="Ranking">
        <div className="text-sm">
          <div className="font-medium">{metrics.bestDept.name}</div>
          <div className="text-slate-700">NPS: <span className="font-semibold">{metrics.bestDept.nps}</span></div>
        </div>
        {depthMode === "deep" && <MiniBars values={[68,63,59,55]} labels={["Tech","Sett.","Billing","Sales"]} />}
      </Card>
    </section>
  );
}

function Card({ title, subtitle, children }: any) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-base font-semibold">{title}</h3>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
        <button className="text-xs px-2 py-1 rounded-lg border border-slate-300 hover:bg-slate-100">Customize</button>
      </div>
      <div>{children}</div>
    </div>
  );
}

function Metric({ label, value }: any) {
  return (
    <div>
      <div className="text-2xl font-semibold leading-none">{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}

function Trend({ change, suffix = "" }: any) {
  const up = Number(change) >= 0;
  return (
    <div className={`${up ? "text-emerald-600" : "text-rose-600"} text-sm font-medium`}> 
      {up ? "▲" : "▼"} {Math.abs(Number(change))}{suffix}
    </div>
  );
}

// Tiny “chart-ish” UI blocks (no chart lib)
function MiniBars({ values, labels }: any) {
  const max = Math.max(...values);
  return (
    <div className="mt-4 grid grid-cols-6 gap-2 items-end">
      {values.map((v: number, i: number) => (
        <div key={i} className="col-span-2">
          <div className="h-20 w-full bg-slate-100 rounded-lg overflow-hidden">
            <div className="bg-indigo-600 w-full" style={{ height: `${(v / max) * 100}%` }} />
          </div>
          <div className="text-[10px] text-slate-500 mt-1 text-center">{labels?.[i] ?? i + 1}</div>
        </div>
      ))}
    </div>
  );
}

function MiniLine({ points }: any) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const pct = ((points[points.length - 1] - min) / (max - min || 1)) * 100;
  return (
    <div className="mt-4 h-8 w-full rounded-lg bg-gradient-to-r from-slate-200 to-indigo-500" style={{ backgroundSize: `${pct}% 100%`, backgroundRepeat: "no-repeat" }} />
  );
}

// --- Uploader wired to FastAPI ---
function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState("call");
  const [department, setDepartment] = useState("");
  const [complaint, setComplaint] = useState("no");
  const [nps, setNps] = useState("");
  const [hold, setHold] = useState("");
  const [busy, setBusy] = useState(false);
  const [resp, setResp] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setResp(null);
    if (!file) { setErr("Please select an audio file (.wav/.mp3)"); return; }
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("audio", file);
      fd.append("type", type);
      if (department) fd.append("department", department);
      fd.append("complaint", complaint === "yes" ? "true" : "false");
      if (nps) fd.append("nps", nps);
      if (hold) fd.append("hold_time_s", hold);

      const res = await fetch(`${API_BASE}/api/transcribe`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setResp(json);
    } catch (e: any) {
      setErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Upload call/chat and index</h2>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="col-span-2 border rounded-lg p-2 text-sm" />
        <select value={type} onChange={(e) => setType(e.target.value)} className="border rounded-lg p-2 text-sm">
          <option value="call">Call</option>
          <option value="chat">Chat</option>
        </select>
        <input value={department} onChange={(e)=>setDepartment(e.target.value)} placeholder="Department" className="border rounded-lg p-2 text-sm" />
        <select value={complaint} onChange={(e)=>setComplaint(e.target.value)} className="border rounded-lg p-2 text-sm">
          <option value="no">Complaint raised? No</option>
          <option value="yes">Complaint raised? Yes</option>
        </select>
        <input value={nps} onChange={(e)=>setNps(e.target.value)} placeholder="NPS (0–10)" className="border rounded-lg p-2 text-sm" />
        <input value={hold} onChange={(e)=>setHold(e.target.value)} placeholder="Hold time (seconds)" className="border rounded-lg p-2 text-sm" />
        <div className="col-span-2 flex items-center gap-3">
          <button disabled={busy} className={`px-4 py-2 rounded-xl text-sm shadow ${busy ? "bg-slate-300 text-slate-600" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
            {busy ? "Uploading…" : "Upload & Transcribe"}
          </button>
          {err && <span className="text-rose-600 text-sm">{err}</span>}
        </div>
      </form>

      {resp && (
        <div className="mt-6 border rounded-xl p-4 bg-slate-50">
          <div className="text-sm font-semibold mb-2">Indexed Result</div>
          <div className="text-xs text-slate-600">File: {resp.file_name}</div>
          <div className="text-xs text-slate-600">Duration: {resp.duration_s}s • Type: {resp.type} • Dept: {resp.department || "—"}</div>
          <div className="text-xs text-slate-600">Complaint: {String(resp.complaint)} • NPS: {resp.nps ?? "—"} • Hold(s): {resp.hold_time_s ?? "—"}</div>
          <div className="mt-3 text-sm"><span className="font-medium">Transcript (first 160 chars):</span> {String(resp.transcript_text || "").slice(0,160)}{String(resp.transcript_text || "").length>160?"…":""}</div>
          <pre className="mt-3 text-[11px] leading-5 bg-white border rounded-lg p-3 overflow-auto max-h-64">{JSON.stringify(resp, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
