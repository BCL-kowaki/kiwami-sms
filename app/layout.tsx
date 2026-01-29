import type { Metadata } from 'next'
import './globals.css'
import ParticlesBackground from './components/ParticlesBackground'

export const metadata: Metadata = {
  title: 'Diagnostic SMS Authentication',
  description: 'SMS認証によるレポート閲覧システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <ParticlesBackground />
        {children}
      </body>
    </html>
  )
}
