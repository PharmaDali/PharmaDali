from fastapi import FastAPI

from api.routes.forecast import router as forecast_router

app = FastAPI()
app.include_router(forecast_router)


@app.get("/")
async def root():
    return {"message": "AI service API"}