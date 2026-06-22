'use client'

import { useGallery } from '@/context/GalleryContext'

export default function GalleryButton({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open } = useGallery()
  return (
    <button onClick={open} className={className}>
      {children}
    </button>
  )
}
