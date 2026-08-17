from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.complaints import router as complaints_router
from routes.ai import router as ai_router


app = FastAPI(
    title="CivilFlow API"
)


# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(complaints_router)
app.include_router(ai_router)


@app.get("/")
def home():
    return {
        "message": "CivilFlow Backend is running!"
    }


@app.get("/health")
def health():
    return {
        "status": "OK"
    }


@app.get("/supabase-test")
def supabase_test():
    return {
        "status": "connected",
        "message": "Supabase client initialized successfully!"
    }