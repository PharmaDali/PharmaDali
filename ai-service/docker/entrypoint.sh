#!/bin/sh
set -e

# Start the cron daemon in the background so scheduled forecasting jobs run
cron

# Start the FastAPI server in the foreground (becomes PID 1 via exec)
exec uvicorn api.main:app --host 0.0.0.0 --port 8000
