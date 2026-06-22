'use client'

import { createContext, useContext, useState } from 'react'
import GalleryModal from '@/components/GalleryModal'

interface GalleryContextType {
  open: () => void
  close: () => void
}

const GalleryContext = createContext<GalleryContextType>({
  open: () => {},
  close: () => {},
})

export function GalleryProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <GalleryContext.Provider value={{ open: () => setIsOpen(true), close: () => setIsOpen(false) }}>
      {children}
      <GalleryModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </GalleryContext.Provider>
  )
}

export function useGallery() {
  return useContext(GalleryContext)
}
