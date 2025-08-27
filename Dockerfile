# ---- Base stage ----
FROM node:22-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ---- Dependencies stage ----
FROM base AS deps
RUN npm install --legacy-peer-deps

# ---- Build stage ----
FROM deps AS build
COPY tsconfig*.json ./
COPY src ./src
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine AS prod
WORKDIR /usr/src/app

# Only copy necessary files for runtime
COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

COPY --from=build /usr/src/app/dist ./dist

# Expose your Express port
EXPOSE 3000

# Run the compiled app
CMD ["node", "dist/index.js"]
