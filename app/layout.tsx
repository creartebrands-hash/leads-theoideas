import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'theoideas CRM · Panel de Campañas y Leads',
  description: 'Sistema CRM interactivo para gestión y prospección de leads para theoideas.com',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased selection:bg-[var(--pink)] selection:text-white">
        <Navbar />
        <main className="px-4 sm:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
