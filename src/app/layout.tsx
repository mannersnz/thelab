import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'

export const dynamic = 'force-dynamic'

const dmSans = DM_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'The Lab — Training Room | Digital Tempo',
  description: 'Professional training room for hire at Mahitahi Colab Māpua.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
        {children}
      </body>
    </html>
  )
}
