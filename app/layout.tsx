import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { StoreProvider } from '@/lib/store';
import './globals.css';

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
          Preview with made-up children. Changes reset when you reload the page.
        </div>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
