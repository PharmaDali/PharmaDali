# AutoARIMA Forecasting Project

A time series forecasting project using the **AutoARIMA** model from the `statsforecast` library. Automatically selects the optimal ARIMA order and generates forecasts with confidence intervals.

---

## Prerequisites

- [Python 3.13](https://www.python.org/downloads/) installed

---

## Project Structure

```
autoarima-project/
├── autoarima_demo.py     # Main script
├── requirements.txt      # Python dependencies
├── .gitignore            # Excludes venv and cache files
└── README.md             # This file
```

---

## Setup Instructions


### 1. Create a virtual environment

**Windows:**
```powershell
python -m venv autoarima-env
```

**macOS / Linux:**
```bash
python3.13 -m venv autoarima-env
```

### 2. Activate the virtual environment

**Windows:**
```powershell
autoarima-env\Scripts\activate
```

> If you get a script execution error on Windows, run this first:
> ```powershell
> Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
> ```

**macOS / Linux:**
```bash
source autoarima-env/bin/activate
```

Once activated, your terminal prompt will show `(autoarima-env)`.

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Run the script

```bash
python autoarima_demo.py
```

---

## What the Script Does

- Generates 48 months of synthetic retail sales data (trend + seasonality + noise)
- Fits an **AutoARIMA** model with 12-month seasonal detection
- Forecasts the next **12 months** with 80% and 95% confidence intervals
- Prints the selected ARIMA order (e.g., `ARIMA(1,1,1)(0,1,1)[12]`)
- Saves a forecast plot as `autoarima_forecast.png`

---

## Deactivating the Environment

When you're done working:

```bash
deactivate
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `statsforecast` | AutoARIMA model |
| `pandas` | Data manipulation |
| `numpy` | Numerical operations |
| `matplotlib` | Forecast visualization |

---

## Notes

- The `autoarima-env/` folder is excluded from Git via `.gitignore`. Always recreate it locally using `pip install -r requirements.txt`.
- The `season_length=12` parameter is set for monthly data. Adjust for other frequencies (e.g., `7` for daily, `52` for weekly).