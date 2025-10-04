import { useEffect, useState } from "react";
const API_BASE = "http://localhost:8001"; // backend running on 8001

export default function App() {
  const [metrics, setMetrics] = useState<any>(null);
  const [err, setErr] = useState<string>("");

  // uploader state
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadErr, setUploadErr] = useState<string>("");
  const [uploadResp, setUploadResp] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE}/metrics/overview`)
      .then(r => r.json())
      .then(setMetrics)
      .catch(e => setErr(String(e)));
  }, []);

  async function doUpload() {
    setUploadErr("");
    setUploadResp(null);
    if (!file) {
      setUploadErr("Please choose a .wav or .mp3 file first.");
      return;
    }
    try {
      setBusy(true);
      const fd = new FormData();
      fd.append("audio", file);
      fd.append("type", "call");
      fd.append("department", "");
      fd.append("complaint", "false");
      const res = await fetch(`${API_BASE}/transcribe`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const json = await res.json();
      setUploadResp(json);
    } catch (e: any) {
      setUploadErr(e.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{fontFamily:"ui-sans-serif", padding:20, color:"#e5e7eb", background:"#111827", minHeight:"100vh"}}>
      <h1 style={{fontSize:24, fontWeight:600, color:"#fff"}}>Manager Dashboard MVP</h1>
      <p>Backend: <code>{API_BASE}</code></p>

      <h2 style={{ marginTop: 16, fontSize: 18, fontWeight: 600, color:"#fff" }}>Metrics</h2>
      {err && <p style={{ color: "crimson" }}>Error: {err}</p>}
      <pre style={{ background: "#1f2937", padding: 12, borderRadius: 8, overflow: "auto", border:"1px solid #374151" }}>
        {metrics ? JSON.stringify(metrics, null, 2) : "Loading…"}
      </pre>

      <h2 style={{ marginTop: 16, fontSize: 18, fontWeight: 600, color:"#fff" }}>Upload & Transcribe (demo)</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        style={{ display: "block", marginTop: 8 }}
      />
      <button
        onClick={doUpload}
        disabled={busy}
        style={{
          marginTop: 8,
          padding: "8px 12px",
          borderRadius: 8,
          border: "1px solid #4b5563",
          background: busy ? "#4b5563" : "#4f46e5",
          color: "white",
          cursor: busy ? "not-allowed" : "pointer"
        }}
      >
        {busy ? "Uploading…" : "Upload"}
      </button>
      {uploadErr && <p style={{ color: "crimson", marginTop: 8 }}>{uploadErr}</p>}
      {uploadResp && (
        <pre style={{ background: "#1f2937", padding: 12, borderRadius: 8, overflow: "auto", marginTop: 8, border:"1px solid #374151" }}>
          {JSON.stringify(uploadResp, null, 2)}
        </pre>
      )}
    </div>
  );
}
