import { useState, useEffect } from "react";
import { fetchPosProducts } from "../services/posService";

export const useProductSearch = (initialQuery = "") => {
  const [query, setQuery] = useState(initialQuery);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const handler = setTimeout(async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetchPosProducts({ search: query, perPage: 20 });

        if (isMounted) {
          const list = response?.data?.data || response?.data || response || [];
          setProducts(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to search replacement products.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [query]);

  return {
    query,
    setQuery,
    products,
    loading,
    error,
  };
};
