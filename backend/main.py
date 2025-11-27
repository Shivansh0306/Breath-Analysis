from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io
import os
import sys

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from inference import load_model_file, get_prediction
from utils import create_pdf_report

app = FastAPI()

# CORS
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://breath-analysis.vercel.app",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Models (Lazy loading or startup)
MODELS = {}

@app.on_event("startup")
async def startup_event():
    # Load models if they exist
    model_dir = os.path.join(os.path.dirname(__file__), "models")
    if os.path.exists(model_dir):
        for f in os.listdir(model_dir):
            if f.endswith(".pkl") or f.endswith(".joblib"):
                model_path = os.path.join(model_dir, f)
                model_name = f.split(".")[0]
                try:
                    MODELS[model_name] = load_model_file(model_path)
                    print(f"Loaded model: {model_name}")
                except Exception as e:
                    print(f"Failed to load {model_name}: {e}")

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/api/login")
async def login(request: LoginRequest):
    # Auth removed as per user request
    return {"status": "success", "user": request.username or "Doctor"}

@app.post("/api/predict")
async def predict(file: UploadFile = File(...), model_name: str = "XGBoost"):
    if model_name not in MODELS:
        # Fallback to first available model
        if MODELS:
            model_name = list(MODELS.keys())[0]
        else:
             raise HTTPException(status_code=500, detail="No models loaded")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Basic preprocessing if needed (assuming preprocessed or raw compatible)
        # In a real app, we'd have a preprocessing pipeline here.
        # For now, we assume the CSV matches the model input.
        
        model = MODELS[model_name]
        label, prob = get_prediction(model, df)
        
        return {
            "diagnosis": label,
            "confidence": prob,
            "model_used": model_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ReportRequest(BaseModel):
    patient_name: str
    age: int
    risk_score: float
    prediction: str
    top_features: dict
    model_name: str

@app.post("/api/report")
async def generate_report(request: ReportRequest):
    from fastapi.responses import Response
    try:
        pdf_bytes = create_pdf_report(
            request.patient_name,
            request.age,
            request.risk_score,
            request.prediction,
            request.top_features,
            request.model_name
        )
        return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=report.pdf"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/metrics")
async def get_metrics():
    import json
    metrics_path = os.path.join(os.path.dirname(__file__), "models", "model_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            return json.load(f)
    return {}
