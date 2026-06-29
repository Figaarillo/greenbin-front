# syntax=docker/dockerfile:1

# ---------- build stage ----------
FROM node:22-alpine AS build
WORKDIR /app

# Skip husky git hooks during install (no .git inside the image)
ENV HUSKY=0

# pnpm via corepack, version pinned by package.json "packageManager"
RUN corepack enable

# Install deps first for better layer caching
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Build the SSR app (browser + server bundles)
COPY . .
RUN pnpm run build

# ---------- runtime stage ----------
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Keep the app, EXPOSE and Railway's target port all aligned on 8080.
ENV PORT=8080

# The Angular SSR server bundle is self-contained (only Node built-ins are
# external), so only the build output is needed at runtime.
COPY --from=build /app/dist ./dist

EXPOSE 8080
CMD ["node", "dist/greenbin-front/server/server.mjs"]
