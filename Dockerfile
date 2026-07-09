# Production image: a single container that serves both the API and the React app.
#
# Local development still uses docker-compose.yml (two containers with hot reload).
# This file is only for deployment.

# ---- Stage 1: compile the React app into static files ----
FROM node:20-alpine AS frontend-build

WORKDIR /frontend

# Copy manifests first so Docker can cache the install layer
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# ---- Stage 2: Python backend, which also serves the files built above ----
FROM python:3.12-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

# Bring in only the compiled output from stage 1 — Node itself is left behind
COPY --from=frontend-build /frontend/dist ./static

EXPOSE 8000

# No --reload here: that flag is for development only
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
