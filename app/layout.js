import './globals.css'

export const metadata = {
  title: 'Raviraj Spring Society',
  description: 'Raviraj Spring Housing Society Portal',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
