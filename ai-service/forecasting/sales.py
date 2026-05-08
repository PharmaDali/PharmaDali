from pathlib import Path

from cache.model_cache import ModelCache
from config.settings import SALES_MONTHLY_CONFIG, SALES_WEEKLY_CONFIG
from forecasting.common import forecast_with_cache, top_n


def print_forecast(config) -> None:
    cache = ModelCache(Path(__file__).resolve().parents[1] / "cache")
    _, current_week, next_week, current_pred, next_pred = forecast_with_cache(
        config, cache
    )

    print(f"{config.label.capitalize()} sales forecast")
    if not current_pred.empty:
        print(f"Top 10 sales predictions for {config.label} {current_week.date()}")
        print(top_n(current_pred))
    else:
        print(f"No sales prediction found for {config.label} {current_week.date()}")

    if not next_pred.empty:
        print(f"Top 10 sales predictions for {config.label} {next_week.date()}")
        print(top_n(next_pred))
    else:
        print(f"No sales prediction found for {config.label} {next_week.date()}")


def run():
    print_forecast(SALES_WEEKLY_CONFIG)
    print_forecast(SALES_MONTHLY_CONFIG)


if __name__ == "__main__":
    run()
