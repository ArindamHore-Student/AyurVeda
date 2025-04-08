"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { handleApiError } from '@/lib/utils'

/**
 * Medication Interface
 * Defines the structure of medication data used throughout the application
 */
export interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  instructions?: string
  startDate: string
  endDate?: string
  purpose?: string
  prescriptionId?: string
  createdAt: string
  updatedAt: string
  remainingDoses?: number
  totalDoses?: number
  color?: string
  category?: string
  nextDose?: string
}

interface MedicationContextType {
  medications: Medication[]
  loading: boolean
  error: string | null
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Medication | null>
  updateMedication: (id: string, medication: Partial<Medication>) => Promise<Medication | null>
  deleteMedication: (id: string) => Promise<boolean>
  refreshMedications: () => Promise<void>
}

const MedicationContext = createContext<MedicationContextType | undefined>(undefined)

export function useMedications() {
  const context = useContext(MedicationContext)
  if (context === undefined) {
    throw new Error('useMedications must be used within a MedicationProvider')
  }
  return context
}

interface MedicationProviderProps {
  children: ReactNode
}

export function MedicationProvider({ children }: MedicationProviderProps) {
  const { toast } = useToast()
  const [medications, setMedications] = useState<Medication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMedications = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/medications')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch medications: ${response.status}`)
      }
      
      const data = await response.json()
      setMedications(data)
    } catch (err) {
      console.error('Error fetching medications:', err)
      setError('Failed to load medications')
      toast({
        title: 'Error',
        description: 'Failed to load medications. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication | null> => {
    try {
      const response = await fetch('/api/medications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medication),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to add medication')
      }
      
      const newMedication = await response.json()
      setMedications(prev => [newMedication, ...prev])
      
      toast({
        title: 'Success',
        description: 'Medication added successfully',
      })
      
      return newMedication
    } catch (err) {
      const error = handleApiError(err)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return null
    }
  }

  const updateMedication = async (id: string, medication: Partial<Medication>): Promise<Medication | null> => {
    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(medication),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update medication')
      }
      
      const updatedMedication = await response.json()
      
      setMedications(prev => 
        prev.map(med => med.id === id ? updatedMedication : med)
      )
      
      toast({
        title: 'Success',
        description: 'Medication updated successfully',
      })
      
      return updatedMedication
    } catch (err) {
      const error = handleApiError(err)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return null
    }
  }

  const deleteMedication = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to delete medication')
      }
      
      setMedications(prev => prev.filter(med => med.id !== id))
      
      toast({
        title: 'Success',
        description: 'Medication deleted successfully',
      })
      
      return true
    } catch (err) {
      const error = handleApiError(err)
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
      return false
    }
  }

  const refreshMedications = async (): Promise<void> => {
    await fetchMedications()
  }

  const value = {
    medications,
    loading,
    error,
    addMedication,
    updateMedication,
    deleteMedication,
    refreshMedications,
  }

  return (
    <MedicationContext.Provider value={value}>
      {children}
    </MedicationContext.Provider>
  )
} 