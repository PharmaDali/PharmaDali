from pathlib import Path
from typing import Dict

import pandas as pd

from cache.model_cache import ModelCache
from config.settings import ForecastConfig
from forecasting.common import build_payload, forecast_with_cache, top_n


class ForecastService:
    def __init__(self, cache_dir: Path) -> None:
        self._cache = ModelCache(cache_dir)

    def generate(
        self,
        config: ForecastConfig,
        top_n_count: int | None,
        combine_top_n: bool = False,
    ) -> Dict:
        _, current_week, next_week, current_pred, next_pred = forecast_with_cache(
            config, self._cache
        )

        if top_n_count and combine_top_n:
            combined_pred = pd.concat(
                [current_pred, next_pred], ignore_index=True, sort=False
            )
            combined_pred = top_n(combined_pred, top_n_count)
            return build_payload(
                config,
                current_week,
                next_week,
                current_pred,
                next_pred,
                combined_pred=combined_pred,
            )

        if top_n_count:
            current_pred = top_n(current_pred, top_n_count)
            next_pred = top_n(next_pred, top_n_count)

        return build_payload(config, current_week, next_week, current_pred, next_pred)
