import type { Metadata, Viewport } from 'next';
import { League_Spartan } from 'next/font/google';
import type { ReactNode } from 'react';
import { StoreProvider } from '@/lib/store';
import './globals.css';
import { ReportProblem } from './report-problem';

export const metadata: Metadata = {
  title: 'Kestrel Kids Portal',
  description: 'The right information about each child, for the right people, at the right time.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0b0b0b' };

// The Figma design's typeface. Served with the app, so no request goes to Google from the browser.
const leagueSpartan = League_Spartan({ subsets: ['latin'], weight: ['400', '600', '700'], variable: '--font-league-spartan', display: 'swap' });

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={leagueSpartan.variable}>
      <body>
        <div className="preview-banner" data-testid="preview-banner">
          Presentation version with made-up children. Changes last until the app restarts and never reach the live site.
        </div>
        <StoreProvider>{children}</StoreProvider>
        <ReportProblem />
      </body>
    </html>
  );
}
