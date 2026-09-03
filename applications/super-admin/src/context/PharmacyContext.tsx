import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as pharmacyService from '../services/pharmacyService'

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
  fetchPharmacies: () => Promise<void>
  addPharmacy: (pharmacy: Omit<Pharmacy, 'id'>) => Promise<void>
  updatePharmacy: (pharmacy: Pharmacy) => Promise<void>
  deletePharmacy: (id: number) => void
  totalPharmacies: number
  totalActivePharmacies: number
}

const PharmacyContext = createContext<PharmacyContextType | undefined>(undefined)

export const PharmacyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([])

  const fetchPharmacies = useCallback(async () => {
    if (!localStorage.getItem('token')) return
    try {
      const data = await pharmacyService.getPharmacies()
      const rawList = Array.isArray(data) ? data : (data?.data || data?.pharmacies || [])
      if (!Array.isArray(rawList)) {
        console.error('Expected array for pharmacies, got:', data)
        return
      }
      const mapped = rawList.map((p: any) => ({
        id: p.id,
        name: p.pharmacy_name,
        owner: p.admins && p.admins.length > 0 
          ? `${p.admins[0].first_name || ''} ${p.admins[0].last_name || ''}`.trim() 
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
  }, [])

  useEffect(() => {
    fetchPharmacies()
  }, [fetchPharmacies])

  const addPharmacy = async (newPharmacyData: Omit<Pharmacy, 'id'>) => {
    try {
      await pharmacyService.createPharmacy({
        pharmacy_name: newPharmacyData.name,
        location: newPharmacyData.location,
        contact_number: newPharmacyData.contact,
        is_active: newPharmacyData.status === 'Active',
      })
      
      await fetchPharmacies()
    } catch (error) {
      console.error('Error adding pharmacy:', error)
      throw error
    }
  }

  const updatePharmacy = async (updated: Pharmacy) => {
    try {
      await pharmacyService.updatePharmacy(updated.id, {
        pharmacy_name: updated.name,
        location: updated.location,
        contact_number: updated.contact,
        is_active: updated.status === 'Active',
      })
      
      await fetchPharmacies()
    } catch (error) {
      console.error('Error updating pharmacy:', error)
      throw error
    }
  }

  const deletePharmacy = async (id: number) => {
    try {
      await pharmacyService.deletePharmacy(id)
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
        fetchPharmacies,
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
  fetchPharmacies: async () => {},
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
