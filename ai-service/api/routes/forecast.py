from pathlib import Path
from typing import Dict

from fastapi import APIRouter, HTTPException, Query

from api.services.forecast_service import ForecastService
from config.settings import (
    DEMAND_MONTHLY_CONFIG,
    DEMAND_WEEKLY_CONFIG,
    SALES_MONTHLY_CONFIG,
    SALES_WEEKLY_CONFIG,
)

router = APIRouter(prefix="/forecast", tags=["forecast"])
_service = ForecastService(Path(__file__).resolve().parents[2] / "cache")

_CONFIG_MAP = {
    "sales": {
        "weekly": SALES_WEEKLY_CONFIG,
        "monthly": SALES_MONTHLY_CONFIG,
    },
    "demand": {
        "weekly": DEMAND_WEEKLY_CONFIG,
        "monthly": DEMAND_MONTHLY_CONFIG,
    },
}


def _get_config(kind: str, granularity: str):
    configs = _CONFIG_MAP.get(kind)
    if not configs:
        raise HTTPException(status_code=400, detail="Invalid forecast type.")
    config = configs.get(granularity)
    if not config:
        raise HTTPException(status_code=400, detail="Invalid granularity.")
    return config


@router.get("/sales")
async def sales_forecast(
    granularity: str = Query("weekly", pattern="^(weekly|monthly)$"),
    top_n: int = Query(10, ge=1, le=100),
) -> Dict:
    config = _get_config("sales", granularity)
    return _service.generate(config, top_n)


@router.get("/demand")
async def demand_forecast(
    granularity: str = Query("weekly", pattern="^(weekly|monthly)$"),
    top_n: int = Query(10, ge=1, le=100),
) -> Dict:
    config = _get_config("demand", granularity)
    return _service.generate(config, top_n)
