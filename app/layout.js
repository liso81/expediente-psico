import { Fraunces, IBM_Plex_Sans } from 'next/font/google';
import './globals.css';

const display = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
});

const body = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

export const metadata = {
  title: 'Expediente · Consulta psicológica',
  description: 'Gestión de expedientes clínicos para consulta psicológica',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${display.variable} ${body.variable}`}>
      <body className="font-sans bg-paper text-ink min-h-screen">{children}</body>
    </html>
  );
}
