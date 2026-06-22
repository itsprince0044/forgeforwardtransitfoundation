'use client'

import { createContext, useContext, useState } from 'react'
import BookingModal from '@/components/BookingModal'

interface BookingContextType {
  open: () => void
  close: () => void
}

const BookingContext = createContext<BookingContextType>({
  open: () => {},
  close: () => {},
})

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <BookingContext.Provider value={{ open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </BookingContext.Provider>
  )
}

export function useBooking() {
  return useContext(BookingContext)
}
