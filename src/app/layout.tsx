import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Invoice Generation System',
  description: 'Invoice entry and PDF generation system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-900 text-gray-100">{children}</body>
    </html>
  )
}
