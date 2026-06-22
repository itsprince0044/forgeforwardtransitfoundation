'use client'

import { useBooking } from '@/context/BookingContext'

interface Props {
  className?: string
  children: React.ReactNode
}

export default function BookButton({ className, children }: Props) {
  const { open } = useBooking()
  return (
    <button onClick={open} className={className}>
      {children}
    </button>
  )
}
