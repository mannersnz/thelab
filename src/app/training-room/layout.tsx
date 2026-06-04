import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Training Room Hire — Mahitahi Colab Māpua | The Lab',
  description:
    'Professional ~90m² training room for hire at Mahitahi Colab Māpua. Modern, flexible, and set up for hands-on workshops. From $295/half day. Check availability and enquire online.',
  openGraph: {
    title: 'Training Room Hire — Māpua, Nelson/Tasman',
    description:
      'Flexible workshop space in the heart of Māpua. Perfect for team training, strategy days, and hands-on workshops. From $295/half day.',
    url: 'https://thelab.digitaltempo.nz/training-room',
    siteName: 'The Lab — Digital Tempo',
  },
}

export default function TrainingRoomLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
