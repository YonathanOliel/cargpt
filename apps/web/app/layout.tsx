import type { Metadata, Viewport } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  display: 'swap',
  variable: '--font-heebo',
});

const title = 'CarGPT — אבחון רכב חכם ב-AI';
const description =
  'עוזר AI שמסביר כל תקלה ברכב לפני שאתה מגיע למוסך: אבחון הסתברותי, הערכת מחיר, ורמת דחיפות.';

export const metadata: Metadata = {
  title: { default: title, template: '%s · CarGPT' },
  description,
  applicationName: 'CarGPT',
  keywords: ['אבחון רכב', 'תקלות רכב', 'מוסך', 'נורת מנוע', 'AI', 'הערכת מחיר תיקון'],
  authors: [{ name: 'CarGPT' }],
  metadataBase: new URL('https://cargpt.app'),
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    title,
    description,
    siteName: 'CarGPT',
  },
  twitter: { card: 'summary_large_image', title, description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body>{children}</body>
    </html>
  );
}
