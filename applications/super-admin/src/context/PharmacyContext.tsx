import React, { createContext, useContext, useState, useEffect } from 'react'
import { resolveCoordinates } from '../utils/geocoding'

export interface Pharmacy {
  id: number
  name: string
  owner: string
  location: string
  contact: string
  email?: string
  status: string
  lat?: number
  lng?: number
}

const INITIAL_PHARMACIES: Pharmacy[] = [
  { id: 1, name: 'Landicho Drugstore', owner: 'Abigail Barrion', location: 'Lipa City', contact: '09123456789', status: 'Active', lat: 13.9416, lng: 121.1622 },
  { id: 2, name: 'Puremed Pharmacy', owner: 'Althea Alvarez', location: 'Tanauan City', contact: '09541790778', status: 'Active', lat: 14.0833, lng: 121.1500 },
  { id: 3, name: 'Generika Drugstore', owner: 'Denmar Redondo', location: 'Batangas City', contact: '09171234567', status: 'Inactive', lat: 13.7565, lng: 121.0583 },
  { id: 4, name: 'Mercury Drug', owner: 'James Mercado', location: 'Calamba City', contact: '09987654321', status: 'Active', lat: 14.2141, lng: 121.1656 },
  { id: 5, name: 'Southstar Drug', owner: 'James Orlanes', location: 'Santo Tomas', contact: '09223334444', status: 'Pending', lat: 14.1086, lng: 121.1417 },
]

interface PharmacyContextType {
  pharmacies: Pharmacy[]
  addPharmacy: (pharmacy: Omit<Pharmacy, 'id'>) => Promise<void>
  updatePharmacy: (pharmacy: Pharmacy) => Promise<void>
  deletePharmacy: (id: number) => void
  totalPharmacies: number
  totalActivePharmacies: number
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined)

const STORAGE_KEY = 'pharmadali_pharmacies'

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (error) {
      console.error('Error loading pharmacies from localStorage:', error)
    }
    return INITIAL_PHARMACIES
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(pharmacies))
    } catch (error) {
      console.error('Error saving pharmacies to localStorage:', error)
    }
  }, [pharmacies])

  const addPharmacy = async (newPharmacyData: Omit<Pharmacy, 'id'>) => {
    let { lat, lng } = newPharmacyData
    if (lat === undefined || lng === undefined) {
      const coords = await resolveCoordinates(newPharmacyData.location)
      lat = coords.lat
      lng = coords.lng
    }

    const newPharmacy: Pharmacy = {
      ...newPharmacyData,
      id: Date.now(),
      lat,
      lng,
    }
    setPharmacies((prev) => [newPharmacy, ...prev])
  }

  const updatePharmacy = async (updated: Pharmacy) => {
    let { lat, lng } = updated
    if (lat === undefined || lng === undefined) {
      const coords = await resolveCoordinates(updated.location)
      lat = coords.lat
      lng = coords.lng
    }

    const finalUpdated = { ...updated, lat, lng }
    setPharmacies((prev) => prev.map((p) => (p.id === updated.id ? finalUpdated : p)))
  }

  const deletePharmacy = (id: number) => {
    setPharmacies((prev) => prev.filter((p) => p.id !== id))
  }

  const totalPharmacies = pharmacies.length
  const totalActivePharmacies = pharmacies.filter((p) => p.status === 'Active').length

  return (
    <PharmacyContext.Provider
      value={{
        pharmacies,
        addPharmacy,
        updatePharmacy,
        deletePharmacy,
        totalPharmacies,
        totalActivePharmacies,
      }}
    >
      {children}
    </PharmacyContext.Provider>
  )
}

const DEFAULT_FALLBACK_CONTEXT: PharmacyContextType = {
  pharmacies: INITIAL_PHARMACIES,
  addPharmacy: async () => {},
  updatePharmacy: async () => {},
  deletePharmacy: () => {},
  totalPharmacies: INITIAL_PHARMACIES.length,
  totalActivePharmacies: INITIAL_PHARMACIES.filter((p) => p.status === 'Active').length,
}

export const usePharmacies = () => {
  const context = useContext(PharmacyContext)
  if (!context) {
    console.warn('usePharmacies accessed outside PharmacyProvider, using fallback context.')
    return DEFAULT_FALLBACK_CONTEXT
  }
  return context
}
