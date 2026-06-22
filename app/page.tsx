import CommandBar from "@/components/CommandBar"
import Navbar from "@/components/Navbar"
import Hero from "@/components/Hero"
import Services from "@/components/Services"
import HowItWorks from "@/components/HowItWorks"
import About from "@/components/About"
import Footer from "@/components/Footer"

export default function HomePage() {
  return (
    <>
      <CommandBar />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Services />
        <HowItWorks />
        <About />
      </main>
      <Footer />
    </>
  )
}
