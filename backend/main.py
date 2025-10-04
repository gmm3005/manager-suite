from fastapi import FastAPI, File, Form, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Manager Suite API (MVP)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only; lock down in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

@app.get("/metrics/overview")
def metrics_overview():
    return {
        "totals": {"today": 482, "week": 2910, "mtd": 11234},
        "npsMTD": {"score": 62, "change": 4},
        "topStaff": {"name": "Jordan Reid", "team": "Settlements A", "nps": 81},
        "commonComplaint": {"type": "Billing discrepancy", "count": 324},
        "avgCallTime": {"value": "04:57", "changePct": -13},
        "avgHolds": {"value": 1.2, "changePct": -21},
        "bestDept": {"name": "Tech Support", "nps": 68},
    }

@app.post("/transcribe")
async def transcribe(
    audio: UploadFile = File(...),
    type: str = Form("call"),
    department: str = Form(""),
    complaint: str = Form("false"),
    nps: str = Form(""),
    hold_time_s: str = Form("")
):
    # Minimal validation
    if not audio.filename.lower().endswith((".wav", ".mp3")):
        raise HTTPException(status_code=415, detail="Please upload a .wav or .mp3 file")

    # Fake a transcript result for the demo
    content_head = await audio.read(200)  # read first 200 bytes
    fake_text = "(demo) this is a fake transcript preview for your MVP pipeline"

    # Parse optional ints
    nps_val = int(nps) if nps.isdigit() else None
    hold_val = int(hold_time_s) if hold_time_s.isdigit() else None

    return {
        "file_name": audio.filename,
        "duration_s": 123,
        "type": type,
        "department": department or None,
        "complaint": complaint == "true",
        "nps": nps_val,
        "hold_time_s": hold_val,
        "transcript_text": fake_text,
        "bytes_sampled": len(content_head),
    }
