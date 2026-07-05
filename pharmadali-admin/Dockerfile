# ---- Stage 1: Build React / Vite App ----
FROM node:20-alpine AS builder

WORKDIR /app

# Declare build-time variables for Vite environment injection
ARG VITE_API_URL
ARG VITE_REVERB_HOST

# Make them available to the Vite build process
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_REVERB_HOST=$VITE_REVERB_HOST

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---- Stage 2: Serve via Nginx ----
FROM nginx:1.27-alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
