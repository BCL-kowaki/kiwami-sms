import type { Metadata } from 'next'
import Script from 'next/script'
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
        {/* Google Tag (gtag.js) - Google Ads & Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-R0QS0BSSG1"
          strategy="afterInteractive"
        />
        <Script id="google-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-857052394');
            gtag('config', 'G-R0QS0BSSG1');
          `}
        </Script>
        {/* SiTEST (ヒートマップ) */}
        <Script id="sitest-tracking" strategy="afterInteractive">
          {`
            (function (PID) {
              var script = document.createElement("script");
              script.src = "https://tracking.sitest.jp/tag?p=" + PID + "&u=" + encodeURIComponent(location.origin + location.pathname + location.search);
              script.async = true;
              document.head.appendChild(script);
            })("p663c4537de394");
          `}
        </Script>
        <ParticlesBackground />
        {children}
      </body>
    </html>
  )
}
