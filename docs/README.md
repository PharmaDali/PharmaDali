# PharmaDali Repository Features

This document outlines the main features of the PharmaDali repository, which is a full-stack multi-tenant pharmacy platform.

## Core Platform Components
* **Laravel Backend API**: A robust backend powered by Laravel 12 that handles authentication, order processing, cart management, and core pharmacy domain logic.
* **Admin Dashboard**: A React + Vite web application providing comprehensive administrative UI, dashboard features, and an integrated POS (Point of Sale) system with connected thermal printer hardware support.
* **Customer Mobile App**: A React Native (Expo) app providing a seamless shopping and ordering experience for pharmacy customers.
* **Pharmacist Mobile App**: A React Native (Expo) app designed specifically for pharmacist workflows, including inventory management and order fulfillment.
* **Persistent Data & Caching**: Utilizes MySQL for persistent data storage and Redis for session management and caching.

## Demand and Sales Analytics
* **Charts and Metrics Dashboard**: We have transitioned to a data-driven analytics approach, utilizing interactive charts and comprehensive metrics to monitor demand and sales performance. *(Note: AI-based demand and sales forecasting has been removed in favor of this deterministic analytics approach).*

## Intelligent Product Recommendations (Apriori Algorithm)
* **Frequently Bought Together**: The platform implements the Apriori algorithm to analyze historical order data, providing customers with smart "frequently bought together" recommendations.
* **New Customer Safety Protocol**: 
  * If a customer is new to the app and has no order history, the home page will **only recommend supplements and vitamins**. 
  * Sensitive medications (such as antibiotics, injectables, and prescription-only drugs) are strictly excluded from recommendations for new users to prioritize patient safety.

## System Architecture
* **Environment-Driven Configuration**: All front-end applications (admin web, customer mobile, pharmacist mobile) are configured to use environment-driven API URLs.
* **Dockerized Infrastructure**: Core services, including Redis, are orchestrated using Docker Compose for consistent development and deployment environments.
