import { useState, useEffect, useCallback } from "react";
import { fetchSalesSummary, fetchSalesList } from "../services/salesReportService";

/**
 * Manages all state and data fetching for the Sales Reports page.
 */
export function useSalesReports() {
  const [selectedRow, setSelectedRow] = useState(null);

  // Summary data
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Sales list data
  const [salesRows, setSalesRows] = useState([]);
  const [salesMeta, setSalesMeta] = useState(null);
  const [salesLoading, setSalesLoading] = useState(true);
  const [salesError, setSalesError] = useState(null);

  // Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dateError, setDateError] = useState(null);

  // Load summary cards on mount
  useEffect(() => {
    setSummaryLoading(true);
    fetchSalesSummary()
      .then((data) => setSummary(data))
      .catch(() => setSummary(null))
      .finally(() => setSummaryLoading(false));
  }, []);

  // Load sales list
  const loadSales = useCallback((filters = {}) => {
    setSalesLoading(true);
    setSalesError(null);
    fetchSalesList({ ...filters, per_page: 10 })
      .then((data) => {
        setSalesRows(data.data ?? []);
        setSalesMeta(data.meta ?? null);
      })
      .catch((err) => setSalesError(err?.message ?? "Failed to load sales."))
      .finally(() => setSalesLoading(false));
  }, []);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const handleFilter = () => {
    // Validate that end date is not before start date
    if (startDate && endDate && endDate < startDate) {
      setDateError("'To' date cannot be before 'From' date.");
      return;
    }
    setDateError(null);
    const filters = {};
    if (startDate) filters.start_date = startDate;
    if (endDate) filters.end_date = endDate;
    loadSales(filters);
  };

  const handleClearFilter = () => {
    setStartDate("");
    setEndDate("");
    setDateError(null);
    loadSales();
  };

  const handleStartDateChange = (value) => {
    setStartDate(value);
    setDateError(null);
  };

  const handleEndDateChange = (value) => {
    setEndDate(value);
    setDateError(null);
  };

  const handleRowClick = (row, index) => {
    setSelectedRow({ ...row, rowIndex: index });
  };

  const totalAmount = salesRows.reduce((sum, row) => sum + parseFloat(row.total ?? 0), 0);

  const SUMMARY_CARDS = summary
    ? [
        { label: "Daily Sales", amount: Number(summary.daily_sales).toLocaleString("en-PH", { minimumFractionDigits: 2 }), currency: "PHP" },
        { label: "Weekly Sales", amount: Number(summary.weekly_sales).toLocaleString("en-PH", { minimumFractionDigits: 2 }), currency: "PHP" },
        { label: "Monthly Sales", amount: Number(summary.monthly_sales).toLocaleString("en-PH", { minimumFractionDigits: 2 }), currency: "PHP" },
        { label: "Total Transactions", amount: summary.total_transactions?.toLocaleString() },
      ]
    : [];

  return {
    // Row selection
    selectedRow,
    setSelectedRow,
    handleRowClick,
    // Summary
    summary,
    summaryLoading,
    SUMMARY_CARDS,
    // Sales list
    salesRows,
    salesMeta,
    salesLoading,
    salesError,
    totalAmount,
    loadSales,
    // Filters
    startDate,
    endDate,
    dateError,
    handleStartDateChange,
    handleEndDateChange,
    handleFilter,
    handleClearFilter,
  };
}
