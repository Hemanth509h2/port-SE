import './globals.css';

export const metadata = {
  title: 'Sharma Engineering',
  description: 'Polycarbonate domes, skylights, canopies, walkways and pre-engineered steel structures.',
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#121417' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body>{children}</body>
    </html>
  );
}
