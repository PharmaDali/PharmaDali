FROM python:3.13-slim

# Install cron daemon
RUN apt-get update \
    && apt-get install -y --no-install-recommends cron \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy application source
COPY . .

# Install crontab for scheduled forecasting jobs
COPY crontab /etc/cron.d/ai-service
RUN chmod 0644 /etc/cron.d/ai-service

# Pre-create the log file so the cron daemon can write to it
RUN touch /var/log/cron.log

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# FastAPI port
EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
