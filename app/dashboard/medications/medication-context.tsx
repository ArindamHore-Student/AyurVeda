"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useToast } from "@/components/ui/use-toast"
import { handleApiError } from '@/lib/utils'

/**
 * Hardcoded medication data for initial state
 */
const hardcodedMedications: Medication[] = [
  {
    id: "1",
    name: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    instructions: "Take in the morning with food",
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)).toISOString(),
    purpose: "Blood pressure management",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    remainingDoses: 25,
    totalDoses: 30,
    color: "#4CAF50",
    category: "Blood Pressure",
    nextDose: "8:00 AM"
  },
  {
    id: "2",
    name: "Metformin",
    dosage: "500mg",
    frequency: "Twice daily",
    instructions: "Take with meals, morning and evening",
    startDate: new Date().toISOString(),
    purpose: "Diabetes management",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    remainingDoses: 42,
    totalDoses: 60,
    color: "#2196F3",
    category: "Diabetes",
    nextDose: "6:00 PM"
  },
  {
    id: "3",
    name: "Atorvastatin",
    dosage: "20mg",
    frequency: "Once daily at bedtime",
    instructions: "Take at night before sleep",
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 5)).toISOString(),
    purpose: "Cholesterol management",
    createdAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    updatedAt: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
    remainingDoses: 28,
    totalDoses: 90,
    color: "#FF9800",
    category: "Cholesterol",
    nextDose: "10:00 PM"
  }
];

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
  const [medications, setMedications] = useState<Medication[]>(hardcodedMedications)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMedications = async () => {
    // Skip API call if we're using hardcoded data
    if (process.env.NODE_ENV === 'production') {
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
    } else {
      // Using hardcoded data in development
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMedications()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addMedication = async (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>): Promise<Medication | null> => {
    if (process.env.NODE_ENV === 'production') {
      // Production code calling the API
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
    } else {
      // Development code using local state
      const newMedication: Medication = {
        id: (medications.length + 1).toString(),
        ...medication,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setMedications(prev => [newMedication, ...prev]);
      
      toast({
        title: 'Success',
        description: 'Medication added successfully',
      });
      
      return newMedication;
    }
  }

  const updateMedication = async (id: string, medication: Partial<Medication>): Promise<Medication | null> => {
    if (process.env.NODE_ENV === 'production') {
      // Production code calling the API
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
    } else {
      // Development code using local state
      const existingMedication = medications.find(med => med.id === id);
      
      if (!existingMedication) {
        toast({
          title: 'Error',
          description: 'Medication not found',
          variant: 'destructive',
        });
        return null;
      }
      
      const updatedMedication: Medication = {
        ...existingMedication,
        ...medication,
        updatedAt: new Date().toISOString()
      };
      
      setMedications(prev => prev.map(med => med.id === id ? updatedMedication : med));
      
      toast({
        title: 'Success',
        description: 'Medication updated successfully',
      });
      
      return updatedMedication;
    }
  }

  const deleteMedication = async (id: string): Promise<boolean> => {
    if (process.env.NODE_ENV === 'production') {
      // Production code calling the API
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
    } else {
      // Development code using local state
      setMedications(prev => prev.filter(med => med.id !== id));
      
      toast({
        title: 'Success',
        description: 'Medication deleted successfully',
      });
      
      return true;
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