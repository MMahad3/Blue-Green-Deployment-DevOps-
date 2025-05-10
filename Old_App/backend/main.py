from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

class GestureRequest(BaseModel):
    gesture: str = Field(..., description="The name of the detected gesture")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score between 0 and 1")

app = FastAPI()

# CORS configuration
origins = [
    "*"  # Allow all origins
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/recognize")
async def recognize_gesture(gesture_data: GestureRequest):
    try:
        # Here you could add additional processing or validation of gestures if needed
        return {
            "message": f"Gesture '{gesture_data.gesture}' recognized successfully",
            "gesture": gesture_data.gesture,
            "confidence": gesture_data.confidence
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/favicon.ico")
async def favicon():
    return {"message": "ok"}
