import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

const PIXEL_ID = '1047164537662442'

export const metadata: Metadata = {
  title: 'Bodega Natural — Jabón Kojic Aclarante | Pago al Recibir',
  description: 'Elimina manchas, hiperpigmentación y tono desigual en 30 días. El jabón que Colombia necesitaba. Envío gratis, pago contra entrega.',
  keywords: 'jabón kojic, aclarar piel, manchas oscuras, hiperpigmentación, melasma, colombia, pago contra entrega, bodega natural',
  openGraph: {
    title: 'Bodega Natural — Jabón Kojic Aclarante',
    description: 'Elimina manchas en 30 días. Envío gratis, paga al recibir.',
    type: 'website',
    locale: 'es_CO',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO" className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
              n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
              document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','${PIXEL_ID}');
              fbq('track','PageView');
              fbq('track','ViewContent',{content_name:'Jabón Kojic Serum Aclarante',content_type:'product',value:79900,currency:'COP'});
            `,
          }}
        />
        <noscript>
          <img height="1" width="1" style={{display:'none'}}
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`} alt="" />
        </noscript>
      </head>
      <body className={inter.variable}>
        {children}
      </body>
    </html>
  )
}
