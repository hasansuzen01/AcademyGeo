import type { ReactNode } from 'react';

// The locale segment owns <html>, so the root layout only passes children on.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
