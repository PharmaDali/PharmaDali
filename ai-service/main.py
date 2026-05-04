# This is just a test code to demonstrate the use of StatsForecast's AutoARIMA model for time series forecasting.

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsforecast import StatsForecast
from statsforecast.models import AutoARIMA

# ── 1. Generate a sample time series dataset ──────────────────────────────────
# Simulated monthly retail sales data (2020–2023)
np.random.seed(42)
n = 48  # 4 years of monthly data

dates = pd.date_range(start="2020-01-01", periods=n, freq="MS")

# Trend + seasonality + noise
trend = np.linspace(100, 200, n)
seasonality = 30 * np.sin(2 * np.pi * np.arange(n) / 12)
noise = np.random.normal(0, 10, n)
sales = trend + seasonality + noise

# StatsForecast expects a DataFrame with columns: unique_id, ds, y
df = pd.DataFrame({
    "unique_id": "retail_sales",
    "ds": dates,
    "y": sales
})

print("Sample dataset (first 5 rows):")
print(df.head())
print(f"\nDataset shape: {df.shape}")
print(f"Date range: {df['ds'].min().date()} → {df['ds'].max().date()}")

# ── 2. Fit AutoARIMA model ────────────────────────────────────────────────────
model = StatsForecast(
    models=[AutoARIMA(season_length=12)],  # monthly seasonality
    freq="MS",                              # month-start frequency
    n_jobs=-1                               # use all CPU cores
)

model.fit(df)
print("\n✓ AutoARIMA model fitted successfully")

# ── 3. Forecast the next 12 months ───────────────────────────────────────────
horizon = 12
forecast_df = model.predict(h=horizon, level=[80, 95])

print("\nForecast (next 12 months):")
print(forecast_df.to_string(index=False))

# ── 4. Get model summary (fitted ARIMA order) ─────────────────────────────────
# Extract the selected ARIMA order from the fitted model
fitted_model = model.fitted_[0, 0]
print(f"\nSelected ARIMA order: {fitted_model.model_}")

# ── 5. Plot historical data + forecast with confidence intervals ──────────────
fig, ax = plt.subplots(figsize=(12, 5))

# Historical data
ax.plot(df["ds"], df["y"], label="Historical Sales", color="#1D9E75", linewidth=2)

# Forecast
ax.plot(forecast_df["ds"], forecast_df["AutoARIMA"],
        label="Forecast", color="#7F77DD", linewidth=2, linestyle="--")

# Confidence intervals
ax.fill_between(
    forecast_df["ds"],
    forecast_df["AutoARIMA-lo-95"],
    forecast_df["AutoARIMA-hi-95"],
    alpha=0.15, color="#7F77DD", label="95% CI"
)
ax.fill_between(
    forecast_df["ds"],
    forecast_df["AutoARIMA-lo-80"],
    forecast_df["AutoARIMA-hi-80"],
    alpha=0.25, color="#7F77DD", label="80% CI"
)

# Vertical line marking forecast start
ax.axvline(df["ds"].iloc[-1], color="gray", linestyle=":", linewidth=1.5, label="Forecast start")

ax.set_title("AutoARIMA – Retail Sales Forecast", fontsize=14)
ax.set_xlabel("Date")
ax.set_ylabel("Sales")
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig("ai-service/autoarima_forecast.png", dpi=150)
plt.show()
print("\n✓ Plot saved as autoarima_forecast.png")