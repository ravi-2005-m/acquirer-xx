# ──────────────────────────────────────────────
# AcquirerX Frontend — single-stage build
# ──────────────────────────────────────────────
# Builds the React app and serves it via vite preview.
# Same shape as the backend Dockerfile: install → build → run.

FROM node:20-alpine

WORKDIR /app

# Build-time configuration — accepts the gateway URL from
# docker-compose's `args:` block. Default value lets the image
# build standalone too (useful during local Dockerfile testing).
ARG VITE_API_BASE_URL=http://localhost:9090/api/v1
ARG VITE_APP_NAME=AcquirerX
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_APP_NAME=${VITE_APP_NAME}

# ─── Dependencies layer ─────────────────────
# Copy ONLY package files first so that if source code changes
# but dependencies don't, Docker reuses the cached npm ci layer.
COPY package.json package-lock.json ./
RUN npm ci

# ─── Build layer ────────────────────────────
# Any code change invalidates this layer but NOT the npm ci layer above.
COPY . .
RUN npm run build

# ─── Runtime ────────────────────────────────
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]
