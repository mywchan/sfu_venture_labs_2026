import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { StoreProvider } from '@/lib/store';
import './globals.css';
import { ReportProblem } from './report-problem';

export const metadata: Metadata = {
  title: 'Kestrel Kids Portal',
  description: 'The right information about each child, for the right people, at the right time.',
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
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
