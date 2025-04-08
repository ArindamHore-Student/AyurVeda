import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date to a localized string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, options: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
}): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

/**
 * Format a time to a localized string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted time string
 */
export function formatTime(date: Date | string, options: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
}): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', options).format(dateObj)
}

/**
 * Safely handle API errors with a consistent structure
 * @param error - The error object
 * @returns Object with message and status
 */
export function handleApiError(error: unknown): { message: string; status: number } {
  console.error('API Error:', error)
  
  if (error instanceof Error) {
    return {
      message: error.message || 'An unexpected error occurred',
      status: 500
    }
  }
  
  return {
    message: 'An unexpected error occurred',
    status: 500
  }
}

/**
 * Create a debounced function that delays invoking func until after wait milliseconds
 * @param func - Function to debounce
 * @param wait - Number of milliseconds to delay
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  
  return function(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Create a memoized version of a function
 * @param func - Function to memoize
 * @returns Memoized function
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> {
  const cache = new Map<string, ReturnType<T>>()
  
  return function(...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args)
    
    if (cache.has(key)) {
      return cache.get(key) as ReturnType<T>
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }
}
