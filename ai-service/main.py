import sys

from forecasting.demand import run as run_demand
from forecasting.sales import run as run_sales


def main() -> None:
    forecast_type = (sys.argv[1].lower() if len(sys.argv) > 1 else "demand")
    if forecast_type == "demand":
        run_demand()
        return
    if forecast_type == "sales":
        run_sales()
        return

    raise SystemExit("Usage: python main.py [demand|sales]")


if __name__ == "__main__":
    main()