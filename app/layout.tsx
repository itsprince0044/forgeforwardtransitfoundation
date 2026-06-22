import type { Metadata } from "next"
import { Inter, Oswald } from "next/font/google"
import { BookingProvider } from "@/context/BookingContext"
import { GalleryProvider } from "@/context/GalleryContext"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

// Oswald — condensed, signage-style display face for a disciplined, military feel.
// Mapped to the --font-display token used by the `font-display` utility.
const oswald = Oswald({
  subsets: ["latin"],
  variable: "--font-oswald",
  weight: ["400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Forge Forward Transit Foundation — Rides for Those Who Serve",
  description:
    "Forge Forward Transit Foundation provides free, safe transportation for active-duty service members and military families. Request a ride or support our mission.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <BookingProvider><GalleryProvider>{children}</GalleryProvider></BookingProvider>
      </body>
    </html>
  )
}
