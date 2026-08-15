import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Pharmacy {
  id: number
  name: string
  owner: string
  location: string
  contact: string
  email?: string
  status: string
}

const INITIAL_PHARMACIES: Pharmacy[] = [
  { id: 1, name: 'Landicho Drugstore', owner: 'Abigail Barrion', location: 'Lipa City', contact: '09123456789', status: 'Active' },
  { id: 2, name: 'Puremed Pharmacy', owner: 'Althea Alvarez', location: 'Tanauan City', contact: '09541790778', status: 'Active' },
  { id: 3, name: 'Generika Drugstore', owner: 'Denmar Redondo', location: 'Batangas City', contact: '09171234567', status: 'Inactive' },
  { id: 4, name: 'Mercury Drug', owner: 'James Mercado', location: 'Calamba City', contact: '09987654321', status: 'Active' },
  { id: 5, name: 'Southstar Drug', owner: 'James Orlanes', location: 'Santo Tomas', contact: '09223334444', status: 'Pending' },
]

interface PharmacyContextType {
  pharmacies: Pharmacy[]
  addPharmacy: (pharmacy: Omit<Pharmacy, 'id'>) => void
  updatePharmacy: (pharmacy: Pharmacy) => void
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

  const addPharmacy = (newPharmacyData: Omit<Pharmacy, 'id'>) => {
    const newPharmacy: Pharmacy = {
      ...newPharmacyData,
      id: Date.now(),
    }
    setPharmacies((prev) => [newPharmacy, ...prev])
  }

  const updatePharmacy = (updated: Pharmacy) => {
    setPharmacies((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
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

export const usePharmacies = () => {
  const context = useContext(PharmacyContext)
  if (!context) {
    throw new Error('usePharmacies must be used within a PharmacyProvider')
  }
  return context
}
