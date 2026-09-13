# ---- Stage 1: Build React / Vite App ----
FROM node:20-alpine AS builder

WORKDIR /app

# Declare build-time variables for Vite environment injection
ARG VITE_API_BASE_URL
ARG VITE_REVERB_HOST
ARG VITE_REVERB_PORT=443
ARG VITE_REVERB_APP_KEY=pharmadali-app-key

# Make them available to the Vite build process
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_REVERB_HOST=$VITE_REVERB_HOST
ENV VITE_REVERB_PORT=$VITE_REVERB_PORT
ENV VITE_REVERB_APP_KEY=$VITE_REVERB_APP_KEY

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---- Stage 2: Serve via Nginx ----
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
