import json
import pickle
import re
from pathlib import Path
from typing import Any


class ModelCache:
    def __init__(self, cache_dir: Path) -> None:
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def _safe_key(self, key: str) -> str:
        cleaned = re.sub(r"[^A-Za-z0-9._-]+", "_", key).strip("_")
        return cleaned or "model"

    def _model_path(self, key: str) -> Path:
        return self.cache_dir / f"{self._safe_key(key)}.pkl"

    def _meta_path(self, key: str) -> Path:
        return self.cache_dir / f"{self._safe_key(key)}.json"

    def load(self, key: str, data_mtime: float) -> Any | None:
        model_path = self._model_path(key)
        meta_path = self._meta_path(key)

        if not model_path.exists() or not meta_path.exists():
            return None

        try:
            meta = json.loads(meta_path.read_text(encoding="utf-8"))
            if meta.get("data_mtime") != data_mtime:
                return None
            with model_path.open("rb") as handle:
                return pickle.load(handle)
        except (OSError, json.JSONDecodeError, pickle.UnpicklingError):
            return None

    def save(self, key: str, model: Any, data_mtime: float) -> None:
        model_path = self._model_path(key)
        meta_path = self._meta_path(key)

        with model_path.open("wb") as handle:
            pickle.dump(model, handle)

        meta = {"data_mtime": data_mtime}
        meta_path.write_text(json.dumps(meta), encoding="utf-8")
