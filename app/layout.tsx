import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, DM_Sans, JetBrains_Mono } from 'next/font/google';
import PortalApp from '@/components/PortalApp';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-jakarta',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'Rahnuma — Islamic & Family Counselling Portal',
  description:
    'Confidential Islamic religious guidance, verified fatwa repository, online family counselling, and crisis safeguarding portal.',
  openGraph: {
    title: 'Rahnuma — Islamic & Family Counselling Portal',
    description:
      'Confidential Islamic religious guidance, verified fatwa repository, online family counselling, and crisis safeguarding portal.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rahnuma — Islamic & Family Counselling Portal',
    description:
      'Confidential Islamic religious guidance, verified fatwa repository, online family counselling, and crisis safeguarding portal.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${plusJakarta.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased" suppressHydrationWarning>
        <PortalApp>{children}</PortalApp>
      </body>
    </html>
  );
}
