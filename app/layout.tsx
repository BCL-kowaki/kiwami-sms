import type { Metadata } from 'next'
import './globals.css'
import ParticlesBackground from './components/ParticlesBackground'

export const metadata: Metadata = {
  title: 'SMSご本人様認証｜超精密！資産運用AI分析ツール「極」｜株式会社投資の"KAWARA"版.com',
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
