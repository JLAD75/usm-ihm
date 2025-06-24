import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility pour combiner des classes CSS conditionnelles selon le device
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Classes CSS conditionnelles pour mobile/desktop
 */
export const responsiveClasses = {
  // Layout
  container: "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
  
  // Navigation
  nav: {
    desktop: "hidden md:flex md:items-center md:space-x-4",
    mobile: "md:hidden",
  },
  
  // Buttons
  button: {
    mobile: "h-12 px-6 text-base min-w-[120px]", // Plus grands sur mobile
    desktop: "h-10 px-4 text-sm",
  },
  
  // Cards
  card: {
    mobile: "p-4 rounded-lg",
    desktop: "p-6 rounded-xl",
  },
  
  // Tables
  table: {
    container: "overflow-x-auto md:overflow-visible",
    mobile: "block md:table",
    row: "block md:table-row border-b md:border-b-0",
    cell: "block md:table-cell px-4 py-2 md:px-6 md:py-4",
  },
  
  // Modals
  modal: {
    overlay: "fixed inset-0 bg-black/50 flex items-center justify-center p-4",
    content: {
      mobile: "w-full max-w-sm max-h-[90vh] overflow-y-auto",
      desktop: "w-full max-w-2xl max-h-[80vh]",
    },
  },
  
  // Forms
  form: {
    container: "space-y-4 md:space-y-6",
    grid: "grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6",
    input: "h-12 md:h-10 text-base md:text-sm",
  },
  
  // Drag & Drop alternatives
  dragHandle: {
    mobile: "flex md:hidden items-center justify-center w-12 h-12 bg-gray-100 rounded-lg",
    desktop: "hidden md:flex cursor-grab",
  },
  
  // Touch targets (minimum 44px as per Apple HIG)
  touchTarget: "min-h-[44px] min-w-[44px] flex items-center justify-center",
}

/**
 * Detect if drag and drop should be disabled
 */
export function shouldDisableDragDrop(): boolean {
  if (typeof window === 'undefined') return false
  
  // Disable on touch devices
  return 'ontouchstart' in window || 
         navigator.maxTouchPoints > 0 || 
         (navigator as any).msMaxTouchPoints > 0
}

/**
 * Debounce function for resize events
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Mobile-optimized scroll behavior
 */
export const scrollIntoView = (element: Element, behavior: 'smooth' | 'instant' = 'smooth') => {
  element.scrollIntoView({
    behavior,
    block: 'nearest',
    inline: 'nearest'
  })
}
