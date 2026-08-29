# Customer Recommendation Algorithm

## What It Is
The Customer Recommendation Algorithm is a data mining feature that powers the cross-selling suggestions in the customer-facing applications. It acts as a digital pharmacist, suggesting complementary products based on historical shopping behaviors.

## How It Works: The Blended Hybrid Strategy
The core of the feature is powered by Market Basket Analysis utilizing the **Apriori Algorithm**, but it employs a "Blended Hybrid Strategy" to ensure customers always see relevant products.

### 1. Market Basket Analysis (The Primary Engine)
* **Data Mining Transactions:** The algorithm periodically scans the database of completed customer orders, treating every checkout as a "basket".
* **Support:** It counts how many times specific combinations of products appear together. If a combination passes a minimum frequency threshold, it is flagged as a valid relationship.
* **Confidence:** The algorithm calculates the probability of a customer buying Product B if they already bought Product A. For example, if 80% of customers who buy Cough Syrup also buy Lozenges, it creates a high-confidence rule linking them.

### 2. Solving the "Cold Start Problem" (The 4 Pools)
Data mining models struggle with brand-new users who have no purchase history (known as the "Cold Start Problem"). To solve this, the algorithm dynamically checks four data pools:
* **Pool A (Product-Level Apriori):** Pure data mining. Directly matches exact products based on past customer behavior.
* **Pool B (Category-Level Apriori):** If exact product data is scarce, the algorithm zooms out to match product categories (e.g., linking the "Cold & Flu" category to "Vitamins").
* **Pool C (Brand Matching):** For non-medicine items (like baby care or cosmetics), the system suggests other products from the same brand.
* **Pool D (Essentials Fallback):** If the customer is completely new with zero history, the system defaults to recommending general health boosters, like Vitamins and Immunity supplements.

## Why It Fits The System
In a pharmacy setting, products are highly complementary. A customer buying antibiotics often needs probiotics; a customer buying allergy medication may also need eye drops. 

Instead of relying on pharmacy administrators to manually link related products in the database, the Apriori algorithm learns these relationships organically from actual customer behavior. Combined with the hybrid fallback strategy, this ensures the PharmaDali ecosystem consistently increases average order value while providing a helpful, personalized shopping experience for every patient, regardless of whether it is their first visit or their fiftieth.
