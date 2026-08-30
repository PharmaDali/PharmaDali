# Restock Predictor Algorithm

## What It Is
The Restock Predictor is an intelligent inventory management module designed to forecast when a product will run out of stock. Instead of relying on manual minimum-stock thresholds, it uses predictive analytics to automatically alert pharmacy staff when it is time to reorder from suppliers.

## How It Works
The system combines three distinct mathematical models to maintain optimal inventory levels:

1. Weighted Moving Average (WMA) for Sales Velocity
To determine the Average Daily Sales (ADS), the algorithm analyzes historical transaction data. It assigns a 60% weight to sales from the last 7 days and a 40% weight to sales from the last 30 days. This ensures the system reacts quickly to sudden demand spikes (such as a seasonal flu outbreak) while maintaining a stable baseline.

2. Adaptive Lead Time via Exponential Smoothing (EMA)
Lead time is the number of days it takes for a supplier to deliver an order. The system tracks this automatically. When an administrator marks an item as "Ordered" and later receives the stock, the system calculates the exact delivery time. It then applies an Exponential Moving Average (70% historical data, 30% recent delivery time) to smoothly adjust the product's expected lead time without overreacting to a single delayed shipment.

3. Dynamic Reorder Point (ROP)
The system continuously calculates the Reorder Point using the standard inventory formula:
Reorder Point = (Average Daily Sales * Adaptive Lead Time) + Safety Stock

When a product's stock drops below this dynamic Reorder Point, the system generates a priority restock alert.

## Why It Fits The System
Pharmacies handle critical healthcare supplies where stockouts can directly impact patient health. Traditional point-of-sale systems require administrators to manually guess and set static minimum stock levels for thousands of products, which quickly becomes inaccurate as demand changes. 

This predictive algorithm fits PharmaDali perfectly because it fully automates inventory management. It dynamically adapts to seasonal illnesses by tracking recent sales velocity and proactively protects the pharmacy against supply chain disruptions by mathematically learning supplier delays.
