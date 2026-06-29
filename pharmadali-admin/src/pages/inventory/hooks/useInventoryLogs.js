import { useState, useMemo, useEffect, useCallback } from "react";
import { fetchInventoryLogs } from "../../../services/inventoryService";

export function useInventoryLogs() {
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [dateRange, setDateRange] = useState("");

  const [selectedLog, setSelectedLog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  const loadData = useCallback(async () => {
    setCurrentPage(1);
    setLoading(true);
    try {
      const logsResult = await fetchInventoryLogs({
        search: query || undefined,
        action: actionFilter !== "All" ? actionFilter : undefined,
        date_range: dateRange || undefined,
      });
      setLogs(logsResult);
    } catch (err) {
      console.error("Failed to load inventory logs", err);
    } finally {
      setLoading(false);
    }
  }, [query, actionFilter, dateRange]);

  const handleActionChange = useCallback((val) => {
    setActionFilter(val);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const filteredLogs = logs;

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage)),
    [filteredLogs]
  );

  const paginatedLogs = useMemo(
    () => filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredLogs, currentPage]
  );

  const visiblePageNumbers = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    const endPage = Math.min(totalPages, startPage + 4);
    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  }, [currentPage, totalPages]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage((prev) => Math.min(Math.max(page, 1), totalPages));
  }, [totalPages]);

  const handleRowClick = useCallback((log) => {
    setSelectedLog(log);
    setShowModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setSelectedLog(null);
    setShowModal(false);
  }, []);

  return {
    query,
    setQuery,
    actionFilter,
    handleActionChange,
    dateRange,
    setDateRange,
    selectedLog,
    showModal,
    logs,
    loading,
    currentPage,
    totalPages,
    paginatedLogs,
    visiblePageNumbers,
    loadData,
    handlePageChange,
    handleRowClick,
    handleModalClose,
  };
}
