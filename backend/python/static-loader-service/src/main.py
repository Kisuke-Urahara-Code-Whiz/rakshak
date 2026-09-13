from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import features, soil

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(soil.router)
app.include_router(features.router)


@app.get("/health", status_code=200)
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("src.main:app", host="127.0.0.1", port=8001, reload=True)