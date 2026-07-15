import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CarGPT — אבחון רכב חכם',
  description: 'עוזר AI שמסביר כל תקלה ברכב לפני שאתה מגיע למוסך',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
