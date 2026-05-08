from dataclasses import dataclass
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
DATASETS_DIR = BASE_DIR / "datasets"

@dataclass(frozen=True)
class ForecastConfig:
    name: str
    csv_path: Path
    id_column: str = "unique_id"
    season_length: int = 1
    freq: str = "W-TUE"
    resample_freq: str | None = None
    label: str = "week"

DEMAND_WEEKLY_CONFIG = ForecastConfig(
    name="demand-weekly",
    csv_path=DATASETS_DIR / "puremed_forecast_demand_01_01_2026_to_05_03_2026.csv",
    freq="W-TUE",
    season_length=52,
    label="week",
)

DEMAND_MONTHLY_CONFIG = ForecastConfig(
    name="demand-monthly",
    csv_path=DATASETS_DIR / "puremed_forecast_demand_01_01_2026_to_05_03_2026.csv",
    freq="MS",
    resample_freq="MS",
    season_length=12,
    label="month",
)

SALES_WEEKLY_CONFIG = ForecastConfig(
    name="sales-weekly",
    csv_path=DATASETS_DIR / "puremed_forecast_sales_05_03_2024_to_05_03_2026.csv",
    id_column="tenant_id",
    freq="W-TUE",
    season_length=52,
    label="week",
)

SALES_MONTHLY_CONFIG = ForecastConfig(
    name="sales-monthly",
    csv_path=DATASETS_DIR / "puremed_forecast_sales_05_03_2024_to_05_03_2026.csv",
    id_column="tenant_id",
    freq="MS",
    resample_freq="MS",
    season_length=12,
    label="month",
)
