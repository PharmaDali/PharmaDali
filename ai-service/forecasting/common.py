import warnings
from dataclasses import asdict
from pathlib import Path
from typing import Dict, Tuple

import pandas as pd
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA, Holt

from cache.model_cache import ModelCache
from config.settings import ForecastConfig

REQUIRED_COLUMNS = ["unique_id", "ds", "y"]


def load_and_prepare(csv_path: Path, config: ForecastConfig) -> pd.DataFrame:
    df = pd.read_csv(csv_path)
    if config.id_column != "unique_id":
        df = df.rename(columns={config.id_column: "unique_id"})

    df["ds"] = pd.to_datetime(df["ds"])
    df["y"] = pd.to_numeric(df["y"], errors="coerce")
    df = df.dropna(subset=["ds", "y"])
    missing = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing:
        raise ValueError(f"Missing required columns: {missing}")
    df = df[REQUIRED_COLUMNS]

    df = df.groupby(["unique_id", "ds"], as_index=False).sum()
    if config.resample_freq:
        df = (
            df.set_index("ds")
            .groupby("unique_id")["y"]
            .resample(config.resample_freq)
            .sum()
            .reset_index()
        )
    return df


def build_model(config: ForecastConfig, model) -> StatsForecast:
    return StatsForecast(
        models=[model],
        freq=config.freq,
        n_jobs=1,
    )


def week_labels(last_ds: pd.Timestamp, freq: str) -> Tuple[pd.Timestamp, pd.Timestamp]:
    offset = pd.tseries.frequencies.to_offset(freq)
    current_week = last_ds + offset
    next_week = current_week + offset
    return current_week, next_week


def _select_model(df: pd.DataFrame, config: ForecastConfig) -> Tuple[object, str]:
    """Select AutoARIMA with seasonality only when history is sufficient."""
    n_obs = len(df)
    min_seasonal = 2 * config.season_length
    min_trend = 30

    if config.season_length > 1 and n_obs < min_seasonal:
        warnings.warn(
            f"[{config.name}] Only {n_obs} observations but need at least "
            f"{min_seasonal} (2 × season_length={config.season_length}) for "
            "seasonal pattern detection. Using non-seasonal AutoARIMA "
            "(season_length=1) for a more stable short-history fit.",
            stacklevel=3,
        )
        return AutoARIMA(season_length=1), "arima-sl1"
    if n_obs < min_trend:
        warnings.warn(
            f"[{config.name}] Only {n_obs} observations (recommended ≥{min_trend}). "
            f"Forecast accuracy may be limited.",
            stacklevel=3,
        )
        if config.label == "month":
            return Holt(), "holt"
    return AutoARIMA(season_length=config.season_length), f"arima-sl{config.season_length}"


def forecast_with_cache(
    config: ForecastConfig, cache: ModelCache
) -> Tuple[pd.DataFrame, pd.Timestamp, pd.Timestamp, pd.DataFrame, pd.DataFrame]:
    df = load_and_prepare(config.csv_path, config)
    model_choice, model_key = _select_model(df, config)
    last_ds = df["ds"].max()
    current_week, next_week = week_labels(last_ds, config.freq)
    horizon = 2

    data_mtime = config.csv_path.stat().st_mtime
    cache_key = f"{config.name}-{config.freq}-{model_key}"
    model = cache.load(cache_key, data_mtime)
    if model is None:
        model = build_model(config, model_choice)
        model.fit(df)
        cache.save(cache_key, model, data_mtime)

    forecast = model.predict(h=horizon)
    current_pred = forecast[forecast["ds"] == current_week]
    next_pred = forecast[forecast["ds"] == next_week]

    return df, current_week, next_week, current_pred, next_pred

  
def top_n(df: pd.DataFrame, n: int = 10) -> pd.DataFrame:
    value_cols = [col for col in df.columns if col not in {"unique_id", "ds"}]
    if not value_cols:
        return df.reset_index(drop=True)
    value_col = value_cols[0]
    return df.sort_values(value_col, ascending=False).head(n).reset_index(drop=True)


def build_payload(
    config: ForecastConfig,
    current_week: pd.Timestamp,
    next_week: pd.Timestamp,
    current_pred: pd.DataFrame,
    next_pred: pd.DataFrame,
) -> Dict:
    return {
        "config": asdict(config),
        "current_week": current_week.date().isoformat(),
        "next_week": next_week.date().isoformat(),
        "current": current_pred.to_dict(orient="records"),
        "next": next_pred.to_dict(orient="records"),
    }
