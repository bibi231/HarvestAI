# HarvestAI server — container image for Google Cloud Run (or any Docker host).
# The Playwright base image ships Chromium + every OS dependency, so the
# scraping code runs without an extra `playwright install` step.
FROM mcr.microsoft.com/playwright:v1.49.0-jammy

WORKDIR /app

# Install dependencies first (lockfile present → reproducible, cache-friendly).
COPY package.json package-lock.json ./
RUN npm ci

# Build TypeScript -> dist/
COPY . .
RUN npm run build

ENV NODE_ENV=production
# Cloud Run injects PORT (defaults to 8080); the app already reads process.env.PORT.
EXPOSE 8080
CMD ["node", "dist/index.js"]
