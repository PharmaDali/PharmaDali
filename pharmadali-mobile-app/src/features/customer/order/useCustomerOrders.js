import { useCallback, useEffect, useMemo, useState } from 'react'
import { fetchCustomerOrders } from '@shared/services/orderService'
import { mapApiOrderToViewModel, splitOrdersByTab } from './orderMappers'

export function useCustomerOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadOrders = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const apiOrders = await fetchCustomerOrders()
      setOrders(apiOrders.map(mapApiOrderToViewModel))
    } catch (error) {
      setOrders([])
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load your orders.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  const grouped = useMemo(() => splitOrdersByTab(orders), [orders])

  return {
    loading,
    errorMessage,
    activeOrders: grouped.active,
    completedOrders: grouped.completed,
    reloadOrders: loadOrders,
  }
}
