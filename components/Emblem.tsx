// Forge Forward service emblem — a roundel with a star (excellence),
// twin forward chevrons (rank + "forge forward"), and a route line.
export default function Emblem({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" aria-hidden="true">
      {/* Outer ring */}
      <circle cx="32" cy="32" r="30" fill="#11213A" stroke="#B8860B" strokeWidth="2" />
      <circle cx="32" cy="32" r="25" fill="none" stroke="#B8860B" strokeWidth="1" opacity="0.45" />

      {/* Star — top */}
      <path
        d="M32 11.5l2.4 5.1 5.6.6-4.2 3.8 1.2 5.5L32 29l-5 2.5 1.2-5.5-4.2-3.8 5.6-.6z"
        fill="#D4A017"
      />

      {/* Twin chevrons — forging forward */}
      <path d="M21 38l11-7 11 7" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 45.5l11-7 11 7" stroke="#B8860B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />

      {/* Route dots — connection */}
      <circle cx="24" cy="52" r="1.6" fill="#D4A017" />
      <circle cx="32" cy="52" r="1.6" fill="#FFFFFF" />
      <circle cx="40" cy="52" r="1.6" fill="#D4A017" />
    </svg>
  )
}
