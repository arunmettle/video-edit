import './globals.css';

export const metadata = {
  title: 'Canva-lite',
  description: 'AUTO-GENERATED minimal app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        {children}
      </body>
    </html>
  );
}
