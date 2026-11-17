import { useCallback, useEffect, useMemo, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { fetchCustomerOrders } from '@shared/services/orderService'
import { mapApiOrderToViewModel, splitOrdersByTab } from './orderMappers'
import { useOrderSubmission } from '@shared/context/OrderSubmissionContext'

// In-memory module cache for instant display across navigations
let cachedOrdersData = null
const recentlySubmittedOrders = new Map()
const RECENT_SUBMISSION_TTL_MS = 30000

function rememberRecentlySubmittedOrder(mappedOrder) {
  if (!mappedOrder?.id) return
  recentlySubmittedOrders.set(Number(mappedOrder.id), {
    order: mappedOrder,
    savedAt: Date.now(),
  })
}

function mergeWithRecentlySubmittedOrders(mappedOrders) {
  const now = Date.now()
  const existingIds = new Set(mappedOrders.map((o) => Number(o.id)))
  const missingRecent = []

  for (const [id, entry] of recentlySubmittedOrders.entries()) {
    if (now - entry.savedAt > RECENT_SUBMISSION_TTL_MS) {
      recentlySubmittedOrders.delete(id)
      continue
    }
    if (existingIds.has(id)) {
      recentlySubmittedOrders.delete(id)
    } else {
      missingRecent.push(entry.order)
    }
  }

  return missingRecent.length > 0 ? [...missingRecent, ...mappedOrders] : mappedOrders
}

export function upsertCachedCustomerOrder(mappedOrder) {
  if (!mappedOrder?.id || !cachedOrdersData) return
  const exists = cachedOrdersData.some((o) => Number(o.id) === Number(mappedOrder.id))
  if (exists) {
    cachedOrdersData = cachedOrdersData.map((o) =>
      Number(o.id) === Number(mappedOrder.id) ? mappedOrder : o,
    )
  } else {
    cachedOrdersData = [mappedOrder, ...cachedOrdersData]
  }
}

export async function refreshCachedCustomerOrders() {
  try {
    const apiOrders = await fetchCustomerOrders()
    const mapped = mergeWithRecentlySubmittedOrders(apiOrders.map(mapApiOrderToViewModel))
    cachedOrdersData = mapped
    return mapped
  } catch {
    return cachedOrdersData
  }
}

export function useCustomerOrders() {
  const { optimisticOrders, lastSubmittedOrder, clearLastSubmittedOrder } = useOrderSubmission()
  const [orders, setOrders] = useState(() => {
    if (lastSubmittedOrder?.id) {
      const mappedNewOrder = mapApiOrderToViewModel(lastSubmittedOrder)
      rememberRecentlySubmittedOrder(mappedNewOrder)
      const base = cachedOrdersData || []
      const filtered = base.filter((o) => Number(o.id) !== Number(mappedNewOrder.id))
      cachedOrdersData = [mappedNewOrder, ...filtered]
    }
    return cachedOrdersData || []
  })
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
      const mapped = mergeWithRecentlySubmittedOrders(apiOrders.map(mapApiOrderToViewModel))
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

  // When an order is placed and finishes background submission, merge it instantly once and clear
  useEffect(() => {
    if (lastSubmittedOrder?.id) {
      const mappedNewOrder = mapApiOrderToViewModel(lastSubmittedOrder)
      rememberRecentlySubmittedOrder(mappedNewOrder)
      setOrders((prev) => {
        const filtered = prev.filter((o) => Number(o.id) !== Number(mappedNewOrder.id))
        const updated = [mappedNewOrder, ...filtered]
        cachedOrdersData = updated
        return updated
      })
      if (typeof clearLastSubmittedOrder === 'function') {
        clearLastSubmittedOrder()
      }
      loadOrders(true)
    }
  }, [lastSubmittedOrder, clearLastSubmittedOrder, loadOrders])

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

