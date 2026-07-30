import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Jabón Kojic Serum 10 - Aclara tu piel en 21 días | Pago al recibir',
  description:
    'Elimina manchas y aclara tu piel en 21 días con el Jabón de Kojic Serum 10. El favorito de las dermatólogas colombianas. Envío gratis y pago contra entrega.',
  keywords:
    'jabón kojic, aclarar piel, manchas oscuras, despigmentante, colombia, pago contra entrega',
  openGraph: {
    title: 'Jabón Kojic Serum 10 - Aclara tu piel en 21 días',
    description:
      'El jabón que más recomiendan las dermatólogas en Colombia. Envío gratis y pago al recibir.',
    type: 'website',
    locale: 'es_CO',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-CO" className={inter.variable}>
      <head>
        {process.env.NEXT_PUBLIC_META_PIXEL_ID && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${process.env.NEXT_PUBLIC_META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </head>
      <body className="bg-[#0a0a0a] text-white font-inter antialiased">
        {children}
      </body>
    </html>
  )
}
