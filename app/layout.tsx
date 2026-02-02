import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Inter, Roboto_Slab, IBM_Plex_Mono } from 'next/font/google'

// Font configurations
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const robotoSlab = Roboto_Slab({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-roboto-slab',
  display: 'swap',
})

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ATHLOS 2025 - Certificate Portal',
  description: 'Official certificate portal for ATHLOS 2025 Athletic Competition',
  generator: 'Goutham ',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} ${robotoSlab.variable} ${ibmPlexMono.variable} font-sans transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'moss', 'strawberry', 'ocean', 'lavender', 'midnight', 'sunset', 'forest', 'rose', 'amber', 'emerald', 'cobalt', 'violet']}
        >
          <div className="min-h-screen transition-all duration-300">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}