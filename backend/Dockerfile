FROM python:3.12-slim

WORKDIR /app

# Install dependencies first (Docker caches this layer if requirements.txt doesn't change)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
