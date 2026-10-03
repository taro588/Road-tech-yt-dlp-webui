FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    wget \
    curl \
    unzip \
    && rm -rf /var/lib/apt/lists/* && \
    wget -q https://github.com/denoland/deno/releases/latest/download/deno-x86_64-unknown-linux-gnu.zip && \
    unzip -q deno-x86_64-unknown-linux-gnu.zip -d /usr/local/bin && \
    rm deno-x86_64-unknown-linux-gnu.zip

COPY backend/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --upgrade yt-dlp

COPY backend/ /app/backend/
COPY config/ /app/config/
COPY backend/static/ /app/static/

RUN mkdir -p /downloads

EXPOSE 8000

ENV CONFIG_PATH=/app/config/config.json
ENV STATIC_DIR=/app/static

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
