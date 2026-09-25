import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { fetchCustomerOrders } from '@shared/services/orderService'
import { mapApiOrderToViewModel, splitOrdersByTab } from './orderMappers'
import { useOrderSubmission } from '@shared/context/OrderSubmissionContext'

// In-memory module cache for instant display across navigations
let cachedOrdersData = null;

export function useCustomerOrders() {
  const { optimisticOrders, lastSubmittedOrder } = useOrderSubmission()
  const [orders, setOrders] = useState(() => cachedOrdersData || [])
  const [loading, setLoading] = useState(() => !cachedOrdersData && (!optimisticOrders || optimisticOrders.length === 0))
  const [errorMessage, setErrorMessage] = useState('')

  const loadOrders = useCallback(async (isSilent = false) => {
    // Only show full loading skeleton if there are no cached or optimistic orders
    if (!isSilent && !cachedOrdersData && (!optimisticOrders || optimisticOrders.length === 0)) {
      setLoading(true)
    }
    setErrorMessage('')

    try {
      const apiOrders = await fetchCustomerOrders()
      const mapped = apiOrders.map(mapApiOrderToViewModel)
      cachedOrdersData = mapped
      setOrders(mapped)
    } catch (error) {
      if (!cachedOrdersData) {
        setOrders([])
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load your orders.')
    } finally {
      setLoading(false)
    }
  }, [optimisticOrders])

  // When an order is placed and finishes background submission, merge it instantly
  useEffect(() => {
    if (lastSubmittedOrder?.id) {
      const mappedNewOrder = mapApiOrderToViewModel(lastSubmittedOrder)
      setOrders((prev) => {
        const filtered = prev.filter((o) => o.id !== mappedNewOrder.id)
        const updated = [mappedNewOrder, ...filtered]
        cachedOrdersData = updated
        return updated
      })
      loadOrders(true)
    }
  }, [lastSubmittedOrder])

  useFocusEffect(
    useCallback(() => {
      const hasExisting = Boolean(cachedOrdersData && cachedOrdersData.length > 0) || (optimisticOrders && optimisticOrders.length > 0)
      loadOrders(hasExisting)

      const intervalId = setInterval(() => {
        loadOrders(true)
      }, 10000)

      return () => clearInterval(intervalId)
    }, [loadOrders, optimisticOrders])
  )

  const grouped = useMemo(() => splitOrdersByTab(orders), [orders])

  return {
    loading: loading && !cachedOrdersData && (!optimisticOrders || optimisticOrders.length === 0),
    errorMessage,
    activeOrders: grouped.active,
    completedOrders: grouped.completed,
    reloadOrders: () => loadOrders(false),
  }
}

