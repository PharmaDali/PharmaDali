import React, { createContext, useContext, useState, useEffect } from 'react'
import { resolveCoordinates } from '../utils/geocoding'
import api from '../shared/api'

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
  pharmacists?: string[]
}

interface PharmacyContextType {
  pharmacies: Pharmacy[]
  addPharmacy: (pharmacy: Omit<Pharmacy, 'id'>) => Promise<void>
  updatePharmacy: (pharmacy: Pharmacy) => Promise<void>
  deletePharmacy: (id: number) => void
  totalPharmacies: number
  totalActivePharmacies: number
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined)

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])

  useEffect(() => {
    fetchPharmacies()
  }, [])

  const fetchPharmacies = async () => {
    try {
      const response = await api.get('/pharmacies')
      const mapped = response.data.map((p: any) => ({
        id: p.id,
        name: p.pharmacy_name,
        owner: p.admins && p.admins.length > 0 
          ? `${p.admins[0].first_name} ${p.admins[0].last_name}` 
          : 'N/A',
        location: p.location,
        contact: p.contact_number,
        email: p.email || '',
        status: p.is_active ? 'Active' : 'Inactive',
        lat: undefined,
        lng: undefined,
        pharmacists: p.pharmacists 
          ? p.pharmacists.filter((ph: any) => ph.pharmacist).map((ph: any) => ph.pharmacist.employee_number)
          : [],
      }))
      setPharmacies(mapped)
    } catch (error) {
      console.error('Error fetching pharmacies:', error)
    }
  }

  const addPharmacy = async (newPharmacyData: Omit<Pharmacy, 'id'>) => {
    // Note: To fully support this, a POST /pharmacies endpoint is needed
    console.warn('addPharmacy requires POST /pharmacies backend integration')
  }

  const updatePharmacy = async (updated: Pharmacy) => {
    // Note: To fully support this, a PUT /pharmacies/{id} endpoint is needed
    console.warn('updatePharmacy requires PUT /pharmacies backend integration')
  }

  const deletePharmacy = async (id: number) => {
    try {
      await api.delete(`/pharmacies/${id}`)
      setPharmacies((prev) => prev.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Error deleting pharmacy:', error)
    }
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
  pharmacies: [],
  addPharmacy: async () => {},
  updatePharmacy: async () => {},
  deletePharmacy: () => {},
  totalPharmacies: 0,
  totalActivePharmacies: 0,
}

export const usePharmacies = () => {
  const context = useContext(PharmacyContext)
  if (!context) {
    console.warn('usePharmacies accessed outside PharmacyProvider, using fallback context.')
    return DEFAULT_FALLBACK_CONTEXT
  }
  return context
}
