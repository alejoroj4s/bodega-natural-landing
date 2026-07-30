'use client'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

declare global { interface Window { fbq?: (...a: unknown[]) => void } }

const fbq = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && window.fbq) window.fbq(...args)
}

const CITIES: Record<string, string> = {
  'Bogotá': 'Cundinamarca', 'Medellín': 'Antioquia', 'Cali': 'Valle del Cauca',
  'Barranquilla': 'Atlántico', 'Cartagena': 'Bolívar', 'Bucaramanga': 'Santander',
  'Pereira': 'Risaralda', 'Manizales': 'Caldas', 'Cúcuta': 'N. de Santander',
  'Ibagué': 'Tolima', 'Santa Marta': 'Magdalena', 'Villavicencio': 'Meta',
  'Pasto': 'Nariño', 'Montería': 'Córdoba', 'Neiva': 'Huila',
  'Armenia': 'Quindío', 'Popayán': 'Cauca', 'Sincelejo': 'Sucre',
  'Valledupar': 'Cesar', 'Tunja': 'Boyacá', 'Florencia': 'Caquetá',
  'Riohacha': 'La Guajira', 'Yopal': 'Casanare', 'Otra ciudad': '',
}

const PACKAGES = [
  { qty: 1, label: '1 unidad', price: 79900, strike: 120000, tag: 'Más popular' },
  { qty: 2, label: '2 unidades', price: 149900, strike: 240000, tag: 'Ahorra $30K' },
  { qty: 3, label: '3 unidades', price: 199900, strike: 360000, tag: 'Mejor valor 🔥' },
]

const REVIEWS = [
  { name: 'Valentina M.', city: 'Bogotá', text: 'En 2 semanas ya vi diferencia. Llevaba 3 años con esas manchas del sol y nada las quitaba. Este jabón es una locura, lo voy a pedir siempre.' },
  { name: 'Andrea C.', city: 'Medellín', text: 'Mi dermatóloga misma me lo recomendó y funciona de verdad. Manchas del embarazo, cicatrices de acné — todo aclaró. Pago al recibir me dio mucha confianza.' },
  { name: 'Katerine R.', city: 'Cali', text: 'Probé de todo: cremas carísimas, tratamientos, remedios caseros. Nada. Con el Kojic en 3 semanas vi lo que no vi en años. 5 estrellas merecidísimas.' },
  { name: 'Diana P.', city: 'Barranquilla', text: 'Yo no creía mucho pero el pago contra entrega me animó a pedir. Llegó en 2 días. Me arrepiento de no haberlo pedido antes, mi piel está irreconocible.' },
  { name: 'Mariana V.', city: 'Bucaramanga', text: 'Lo empecé a usar hace un mes y la diferencia es increíble. Mi esposo me pregunta qué me hice. Solo el jabón Kojic, nada más.' },
  { name: 'Luisa T.', city: 'Cartagena', text: 'Tenía el tono muy desigual por el sol. Con 4 semanas de uso diario ya me ven diferente. El envío gratis y el pago al recibir es lo mejor.' },
]

const FAQ = [
  { q: '¿Cuándo veo resultados?', a: 'La mayoría ve diferencia desde la primera semana. Manchas visiblemente más claras entre la semana 2 y 4. Para resultados completos, úsalo mínimo 30 días seguidos.' },
  { q: '¿Cómo funciona el pago contra entrega?', a: 'Haces tu pedido hoy sin pagar nada. El mensajero llega a tu puerta en 1-3 días, entrega el jabón, y en ese momento pagas en efectivo. Cero riesgo.' },
  { q: '¿Funciona para manchas del embarazo (cloasma)?', a: 'Sí, el ácido kójico es uno de los ingredientes más recomendados para el cloasma. Es seguro durante el embarazo y la lactancia.' },
  { q: '¿Sirve para todo tipo de piel?', a: 'Sí. Piel grasa, seca, mixta y sensible. La fórmula es suave y no reseca. Si tienes piel muy delicada, empieza usándolo solo en las noches.' },
  { q: '¿Qué pasa si no me funciona?', a: 'Garantía de 30 días. Si usas el producto por 30 días y no notas diferencia, te devolvemos el dinero. Nos comprometemos.' },
]

function Stars({ n = 5 }) {
  return <span className="text-amber-400">{'★'.repeat(n)}</span>
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#e8ddd4] rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left bg-white hover:bg-[#FFF9F5] transition-colors">
        <span className="font-semibold text-[#5B2D18] text-sm pr-4">{q}</span>
        <span className="text-[#C8A550] text-xl flex-shrink-0">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="px-5 pb-4 bg-white border-t border-[#f0e8df]">
          <p className="text-gray-600 text-sm leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function Page() {
  const formRef = useRef<HTMLElement>(null)
  const [pkg, setPkg] = useState(0)
  const [form, setForm] = useState({ name: '', phone: '', address: '', barrio: '', apto: '', city: '', dept: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [submitErr, setSubmitErr] = useState('')
  const [stock] = useState(47)
  const [mins, setMins] = useState(14)
  const [secs, setSecs] = useState(37)
  const [viewers] = useState(23)

  useEffect(() => {
    const t = setInterval(() => {
      setSecs(s => {
        if (s === 0) { setMins(m => m > 0 ? m - 1 : 14); return 59 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])

  const goToForm = () => {
    fbq('track', 'InitiateCheckout', { value: PACKAGES[pkg].price, currency: 'COP', num_items: PACKAGES[pkg].qty })
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (k === 'city') setForm(f => ({ ...f, city: v, dept: CITIES[v] || '' }))
    setErrors(e => { const n = { ...e }; delete n[k]; return n })
  }

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.name.trim() || form.name.trim().length < 3) e.name = 'Ingresa tu nombre completo'
    const ph = form.phone.replace(/\D/g, '')
    if (ph.length < 10) e.phone = 'Celular válido de 10 dígitos'
    if (!form.address.trim() || form.address.length < 5) e.address = 'Ingresa tu dirección'
    if (!form.barrio.trim()) e.barrio = 'Ingresa tu barrio'
    if (!form.city) e.city = 'Selecciona tu ciudad'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitErr('')
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, quantity: PACKAGES[pkg].qty, price: PACKAGES[pkg].price }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al procesar')
      setOrderId(data.orderId)
      setSuccess(true)
      fbq('track', 'Purchase', {
        value: PACKAGES[pkg].price,
        currency: 'COP',
        content_name: 'Jabón Kojic Serum Aclarante',
        content_type: 'product',
        num_items: PACKAGES[pkg].qty,
      })
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      setSubmitErr(err instanceof Error ? err.message : 'Error, intenta de nuevo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-inter bg-[#FFF9F5] text-[#1A1A1A]">

      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#5B2D18] text-white text-center py-2.5 px-4 text-xs font-bold tracking-wide">
        🔥 ÚLTIMAS {stock} UNIDADES — Envío GRATIS a toda Colombia — Pago al recibir
      </div>

      {/* HEADER */}
      <header className="bg-white border-b border-[#f0e8df] py-3 px-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <div>
              <p className="font-extrabold text-[#5B2D18] text-lg leading-none">Bodega Natural</p>
              <p className="text-[#C8A550] text-[10px] font-medium tracking-widest uppercase">Cuidado Natural</p>
            </div>
          </div>
          <button onClick={goToForm}
            className="bg-[#CC2B2B] hover:bg-[#b52424] text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all hover:scale-105 shadow-md hidden sm:block">
            Pedir Ahora →
          </button>
          <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer"
            className="sm:hidden bg-[#25D366] text-white font-bold text-sm px-4 py-2 rounded-xl">
            WhatsApp
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-b from-[#FFF9F5] to-white px-4 pt-10 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-[#fff0e6] border border-[#f0c8a0] rounded-full px-4 py-1.5 mb-6">
                <span className="text-[10px] font-bold text-[#8B4513] tracking-widest uppercase">#1 en manchas · Colombia · 2024</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-[#1A1A1A] mb-4">
                ¿Cansada de que las{' '}
                <span className="text-[#CC2B2B]">manchas</span>{' '}
                no se vayan?{' '}
                <span className="text-[#5B2D18]">Esto es lo que necesitas.</span>
              </h1>

              <p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed max-w-lg mx-auto lg:mx-0">
                El <strong>Jabón Kojic Serum Aclarante</strong> elimina manchas del sol, hiperpigmentación, melasma y marcas de acné desde la primera semana. Natural. Comprobado. Sin riesgos.
              </p>

              <div className="flex items-center gap-3 justify-center lg:justify-start mb-6">
                <Stars />
                <span className="text-gray-500 text-sm"><strong className="text-[#1A1A1A]">4.9/5</strong> · +2,800 reseñas</span>
              </div>

              <div className="flex items-center gap-4 justify-center lg:justify-start mb-8">
                <div>
                  <span className="line-through text-gray-400 text-base">$120.000</span>
                  <span className="text-[#CC2B2B] font-extrabold text-4xl ml-2">$79.900</span>
                  <span className="text-gray-500 text-sm ml-1">COP</span>
                </div>
                <span className="bg-[#CC2B2B] text-white text-xs font-bold px-2 py-1 rounded-lg">-33%</span>
              </div>

              <button onClick={goToForm}
                className="bg-[#CC2B2B] hover:bg-[#b52424] text-white font-extrabold text-lg px-10 py-5 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-red-200 w-full sm:w-auto pulse-glow">
                Sí, lo quiero — Pago al Recibir →
              </button>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start mt-5 text-xs text-gray-500">
                <span className="flex items-center gap-1">🚚 Envío gratis</span>
                <span className="flex items-center gap-1">💰 Pagas al recibirlo</span>
                <span className="flex items-center gap-1">✅ Garantía 30 días</span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-shrink-0 relative">
              <div className="relative w-72 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl shadow-[#5B2D18]/20">
                <Image src="/images/hero.jpg" alt="Mujer con piel radiante usando Jabón Kojic Bodega Natural"
                  fill className="object-cover" priority sizes="(max-width: 640px) 288px, 320px" />
              </div>
              {/* Social proof badge */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 border border-[#f0e8df]">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {['💆','🙍','💁'].map((e,i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-[#ffe8d6] flex items-center justify-center text-sm border-2 border-white">{e}</div>
                    ))}
                  </div>
                  <div>
                    <p className="font-bold text-[#1A1A1A] text-xs">{viewers} viendo ahora</p>
                    <p className="text-gray-400 text-[10px]">¡Pide antes que se agote!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-[#5B2D18] text-white py-4 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          {[
            { icon: '💰', t: 'Pago Contra Entrega', s: 'Sin pagar antes' },
            { icon: '🚚', t: 'Envío Gratis', s: 'A toda Colombia' },
            { icon: '⚡', t: 'Entrega en 1-3 días', s: 'Ciudades principales' },
            { icon: '🛡️', t: 'Garantía 30 días', s: 'Sin preguntas' },
          ].map((b, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-2xl">{b.icon}</span>
              <p className="font-bold text-sm">{b.t}</p>
              <p className="text-[#e8c9a0] text-xs">{b.s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PROBLEM SECTION */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#CC2B2B] font-bold text-sm uppercase tracking-widest mb-3">¿Te identificas?</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
              El problema que nadie quiere tener
            </h2>
            <p className="text-gray-500 text-base max-w-xl mx-auto">
              Millones de mujeres en Colombia llevan años luchando contra los mismos problemas
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { e: '😔', h: 'Manchas que no se van', d: 'Manchas del sol, melasma, hiperpigmentación que llevan meses o años sin mejorar' },
              { e: '🎭', h: 'Depender del maquillaje', d: 'No poder salir sin cubrirte la cara porque te da pena que te vean con manchas' },
              { e: '💸', h: 'Gastar en cremas que no funcionan', d: 'Invertir dinero en productos caros que prometen mucho y no dan resultados' },
              { e: '😤', h: 'Marcas de acné imposibles', d: 'Cada vez que se va un grano deja una mancha que tarda meses en desaparecer' },
            ].map((p, i) => (
              <div key={i} className="flex gap-4 bg-[#FFF9F5] border border-[#f0e8df] rounded-2xl p-5 hover:border-[#C8A550] transition-colors">
                <span className="text-4xl flex-shrink-0">{p.e}</span>
                <div>
                  <p className="font-bold text-[#1A1A1A] mb-1">{p.h}</p>
                  <p className="text-gray-500 text-sm leading-relaxed">{p.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE/AFTER */}
      <section className="bg-[#FFF9F5] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#C8A550] font-bold text-sm uppercase tracking-widest mb-3">Resultados Reales</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
              Esto que ves es real. Sin filtros.
            </h2>
            <p className="text-gray-500 text-base">30 días de diferencia con uso diario</p>
          </div>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-[#5B2D18]/15 max-w-2xl mx-auto">
            <Image src="/images/before-after.jpg" alt="Antes y después - transformación real de piel con manchas usando Jabón Kojic Bodega Natural"
              width={800} height={600} className="w-full object-cover" />
            <div className="absolute inset-0 flex">
              <div className="flex-1 flex items-end pb-4 pl-4">
                <span className="bg-white/90 text-[#CC2B2B] font-extrabold text-xs px-3 py-1.5 rounded-full">SEMANA 1</span>
              </div>
              <div className="w-px bg-white/60"></div>
              <div className="flex-1 flex items-end pb-4 pl-4">
                <span className="bg-white/90 text-[#1F5C30] font-extrabold text-xs px-3 py-1.5 rounded-full">SEMANA 4 ✨</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-md mx-auto text-center">
            {[['94%','Notaron diferencia en 14 días'],['98%','Recomendarían el producto'],['30','Días para resultado completo']].map(([n,l],i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#f0e8df]">
                <p className="text-2xl font-extrabold text-[#5B2D18]">{n}</p>
                <p className="text-gray-500 text-xs mt-1 leading-tight">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCT + HOW IT WORKS */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C8A550] font-bold text-sm uppercase tracking-widest mb-3">El Producto</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A]">
              Jabón Kojic Serum Aclarante
            </h2>
            <p className="text-gray-500 text-base mt-3 max-w-xl mx-auto">Fórmula avanzada con Ácido Kójico puro + Vitamina C + Extracto de Cúrcuma</p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
            <div className="flex-shrink-0 relative w-64 h-72 sm:w-72 sm:h-80 rounded-3xl overflow-hidden shadow-xl shadow-[#5B2D18]/15">
              <Image src="/images/product.jpg" alt="Jabón Kojic Serum Aclarante Bodega Natural - ingredientes naturales"
                fill className="object-cover" sizes="288px" />
            </div>
            <div className="flex-1 space-y-5">
              {[
                { icon: '🍄', h: 'Ácido Kójico Puro', d: 'Inhibe la producción de melanina en las células de la piel. Aclara manchas desde la raíz, de adentro hacia afuera.' },
                { icon: '🍋', h: 'Vitamina C Estabilizada', d: 'Potencia el efecto aclarante y da luminosidad inmediata. Tu piel brilla desde el primer uso.' },
                { icon: '🌿', h: 'Extracto de Cúrcuma', d: 'Antiinflamatorio natural. Ayuda con marcas de acné y tono desigual. Potencia el efecto del ácido kójico.' },
                { icon: '💧', h: 'Glicerina Natural', d: 'Hidrata mientras aclara. Sin resecar, sin irritar. Apto para usar todos los días en cara y cuerpo.' },
              ].map((b, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-12 h-12 bg-[#FFF9F5] rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border border-[#f0e8df]">{b.icon}</div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{b.h}</p>
                    <p className="text-gray-500 text-sm leading-relaxed mt-0.5">{b.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LIFESTYLE */}
      <section className="bg-[#FFF9F5] py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[#CC2B2B] font-bold text-sm uppercase tracking-widest mb-3">Tu Rutina</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-4">
              Solo 60 segundos.<br />Mañana y noche.
            </h2>
            <p className="text-gray-600 text-base leading-relaxed mb-6">
              No necesitas una rutina complicada. Solo moja tu cara, aplica el jabón en movimientos circulares por 60 segundos, enjuaga. Eso es todo. Los resultados hablan solos.
            </p>
            <div className="space-y-3">
              {['✅ Sin contener hidroquinona (100% natural)','✅ No irrita, no reseca, no pica','✅ Para cara y cuerpo','✅ Resultados visibles en 7 días'].map((t,i) => (
                <p key={i} className="text-gray-700 text-sm font-medium">{t}</p>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 w-72 h-80 sm:w-80 sm:h-96 rounded-3xl overflow-hidden shadow-xl shadow-[#5B2D18]/15">
            <Image src="/images/lifestyle.jpg" alt="Mujer colombiana usando Jabón Kojic en su rutina de belleza diaria"
              width={400} height={500} className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#C8A550] font-bold text-sm uppercase tracking-widest mb-3">Opiniones</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-2">
              Más de 2,800 mujeres colombianas
            </h2>
            <div className="flex items-center justify-center gap-2">
              <Stars /><Stars /><Stars /><Stars /><Stars />
              <span className="text-gray-500 text-sm font-semibold">4.9 promedio</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-[#FFF9F5] border border-[#f0e8df] rounded-2xl p-5 hover:border-[#C8A550] transition-colors">
                <Stars />
                <p className="text-gray-700 text-sm leading-relaxed mt-3 mb-4 italic">"{r.text}"</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#1A1A1A] text-sm">{r.name}</p>
                    <p className="text-[#C8A550] text-xs">{r.city}</p>
                  </div>
                  <span className="text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">✓ Compra verificada</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ORDER FORM */}
      <section ref={formRef} id="pedir" className="bg-[#FFF9F5] py-16 px-4 border-t border-[#f0e8df]">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[#CC2B2B] font-bold text-sm uppercase tracking-widest mb-2">🔥 Oferta limitada</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] mb-3">
              Pide ahora —{' '}
              <span className="text-[#CC2B2B]">pagas cuando llegue</span>
            </h2>
            <p className="text-gray-500 text-base">Sin tarjeta. Sin adelantos. Puro contra entrega.</p>

            {/* Countdown */}
            <div className="inline-flex items-center gap-3 bg-[#CC2B2B] text-white rounded-2xl px-6 py-3 mt-4">
              <span className="text-sm font-bold">⏱ Oferta expira en:</span>
              <span className="font-extrabold text-xl tabular-nums">{String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}</span>
            </div>

            <div className="flex items-center justify-center gap-2 mt-3 text-[#CC2B2B] text-sm font-bold">
              <span className="w-2 h-2 bg-[#CC2B2B] rounded-full animate-pulse"></span>
              Solo {stock} unidades disponibles
            </div>
          </div>

          {success ? (
            <div className="bg-white border border-green-200 rounded-3xl p-8 text-center shadow-xl">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-extrabold text-[#1F5C30] mb-3">¡Pedido Confirmado!</h3>
              <p className="text-gray-600 mb-5 leading-relaxed">
                Te llamaremos en los próximos <strong className="text-[#5B2D18]">30 minutos</strong> para confirmar tu entrega. Tu jabón llega en <strong>1-3 días hábiles</strong>.
              </p>
              <div className="bg-[#FFF9F5] rounded-2xl p-4 mb-5 text-left">
                <p className="text-gray-400 text-xs mb-1">Número de pedido:</p>
                <p className="text-[#5B2D18] font-mono font-bold text-sm break-all">{orderId}</p>
              </div>
              <a href="https://wa.me/573000000000?text=Hola%2C+acabo+de+hacer+un+pedido+%23{orderId}+y+quiero+confirmarlo" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366] text-white font-bold py-3 px-6 rounded-xl">
                Confirmar por WhatsApp 💬
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-[#f0e8df] rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">

              {/* Package selection */}
              <div>
                <label className="block text-sm font-bold text-[#5B2D18] mb-3">Elige tu paquete:</label>
                <div className="space-y-3">
                  {PACKAGES.map((p, i) => (
                    <button key={i} type="button" onClick={() => setPkg(i)}
                      className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl border-2 transition-all ${pkg === i ? 'border-[#CC2B2B] bg-red-50' : 'border-[#e8ddd4] hover:border-[#C8A550]'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${pkg === i ? 'border-[#CC2B2B]' : 'border-gray-300'}`}>
                          {pkg === i && <div className="w-2.5 h-2.5 rounded-full bg-[#CC2B2B]" />}
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-[#1A1A1A] text-sm">{p.label}</p>
                          <p className="text-gray-400 text-xs line-through">${p.strike.toLocaleString('es-CO')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-[#CC2B2B] text-lg">${p.price.toLocaleString('es-CO')}</p>
                        <span className="text-[10px] font-bold bg-[#CC2B2B] text-white px-2 py-0.5 rounded-full">{p.tag}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-[#5B2D18] mb-2">Nombre completo <span className="text-[#CC2B2B]">*</span></label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                  placeholder="Ej: María Fernanda Gómez"
                  className={`w-full bg-[#FFF9F5] border rounded-xl px-4 py-3.5 text-[#1A1A1A] placeholder-gray-400 transition-all ${errors.name ? 'border-red-400' : 'border-[#e8ddd4]'}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-bold text-[#5B2D18] mb-2">WhatsApp (celular) <span className="text-[#CC2B2B]">*</span></label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-2 bg-[#FFF9F5] border border-[#e8ddd4] rounded-xl px-3 py-3.5 flex-shrink-0">
                    <span className="text-base">🇨🇴</span>
                    <span className="text-gray-600 text-sm font-semibold">+57</span>
                  </div>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    placeholder="3001234567"
                    className={`flex-1 bg-[#FFF9F5] border rounded-xl px-4 py-3.5 text-[#1A1A1A] placeholder-gray-400 transition-all ${errors.phone ? 'border-red-400' : 'border-[#e8ddd4]'}`} />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-bold text-[#5B2D18] mb-2">Ciudad <span className="text-[#CC2B2B]">*</span></label>
                <select value={form.city} onChange={e => set('city', e.target.value)}
                  className={`w-full bg-[#FFF9F5] border rounded-xl px-4 py-3.5 text-[#1A1A1A] transition-all appearance-none ${errors.city ? 'border-red-400' : 'border-[#e8ddd4]'}`}>
                  <option value="">Selecciona tu ciudad</option>
                  {Object.keys(CITIES).map(c => <option key={c} value={c}>{c}{CITIES[c] ? ` — ${CITIES[c]}` : ''}</option>)}
                </select>
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-bold text-[#5B2D18] mb-2">Dirección <span className="text-[#CC2B2B]">*</span></label>
                <input type="text" value={form.address} onChange={e => set('address', e.target.value)}
                  placeholder="Ej: Calle 45 # 12-34"
                  className={`w-full bg-[#FFF9F5] border rounded-xl px-4 py-3.5 text-[#1A1A1A] placeholder-gray-400 transition-all ${errors.address ? 'border-red-400' : 'border-[#e8ddd4]'}`} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
              </div>

              {/* Barrio + Apto */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-[#5B2D18] mb-2">Barrio <span className="text-[#CC2B2B]">*</span></label>
                  <input type="text" value={form.barrio} onChange={e => set('barrio', e.target.value)}
                    placeholder="Ej: Chapinero"
                    className={`w-full bg-[#FFF9F5] border rounded-xl px-4 py-3.5 text-[#1A1A1A] placeholder-gray-400 transition-all ${errors.barrio ? 'border-red-400' : 'border-[#e8ddd4]'}`} />
                  {errors.barrio && <p className="text-red-500 text-xs mt-1">{errors.barrio}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#5B2D18] mb-2">Apto/Edificio</label>
                  <input type="text" value={form.apto} onChange={e => set('apto', e.target.value)}
                    placeholder="Ej: Apto 301"
                    className="w-full bg-[#FFF9F5] border border-[#e8ddd4] rounded-xl px-4 py-3.5 text-[#1A1A1A] placeholder-gray-400 transition-all" />
                </div>
              </div>

              {/* Error */}
              {submitErr && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm">{submitErr}</p>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full bg-[#CC2B2B] hover:bg-[#b52424] disabled:opacity-60 text-white font-extrabold text-lg py-5 rounded-2xl transition-all hover:scale-[1.02] disabled:scale-100 shadow-xl shadow-red-200 pulse-glow">
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Procesando...
                  </span>
                ) : `CONFIRMAR PEDIDO — $${PACKAGES[pkg].price.toLocaleString('es-CO')} COP 🛒`}
              </button>

              <div className="flex flex-wrap justify-center gap-4 text-gray-400 text-xs pt-1">
                <span>🔒 Datos seguros</span>
                <span>🚚 Envío gratis</span>
                <span>💰 Pago al recibir</span>
                <span>↩️ Garantía 30 días</span>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* DELIVERY */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-shrink-0 w-72 h-64 sm:w-80 sm:h-72 rounded-3xl overflow-hidden shadow-xl shadow-[#5B2D18]/10">
            <Image src="/images/delivery.jpg" alt="Entrega a domicilio Bodega Natural pago contra entrega Colombia"
              width={400} height={350} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <p className="text-[#C8A550] font-bold text-sm uppercase tracking-widest mb-3">Así de fácil</p>
            <h2 className="text-3xl font-extrabold text-[#1A1A1A] mb-5">Pedido hoy,<br />en tu puerta en 1-3 días</h2>
            <div className="space-y-4">
              {[
                { n: '1', t: 'Haz tu pedido', d: 'Llena el formulario — sin tarjeta, sin adelantos' },
                { n: '2', t: 'Te confirmamos', d: 'Te llamamos en 30 min para confirmar dirección' },
                { n: '3', t: 'Llega a tu puerta', d: 'El mensajero entrega en 1-3 días hábiles' },
                { n: '4', t: 'Pagas al recibir', d: 'En efectivo, solo cuando tengas el jabón en tus manos' },
              ].map((s, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <div className="w-9 h-9 bg-[#5B2D18] text-white rounded-full flex items-center justify-center font-extrabold flex-shrink-0 text-sm">{s.n}</div>
                  <div>
                    <p className="font-bold text-[#1A1A1A]">{s.t}</p>
                    <p className="text-gray-500 text-sm">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={goToForm} className="mt-8 bg-[#CC2B2B] hover:bg-[#b52424] text-white font-extrabold text-base px-8 py-4 rounded-2xl transition-all hover:scale-105 shadow-lg shadow-red-100">
              Quiero el mío →
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#FFF9F5] py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#C8A550] font-bold text-sm uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-extrabold text-[#1A1A1A]">Preguntas frecuentes</h2>
          </div>
          <div className="space-y-3">
            {FAQ.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
          <div className="text-center mt-10">
            <button onClick={goToForm} className="bg-[#CC2B2B] hover:bg-[#b52424] text-white font-extrabold text-lg px-10 py-5 rounded-2xl transition-all hover:scale-105 shadow-xl shadow-red-100">
              Pedir Ahora — Pago al Recibir →
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#5B2D18] text-white py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-2xl">🌿</span>
            <p className="font-extrabold text-lg">Bodega Natural</p>
          </div>
          <p className="text-[#e8c9a0] text-sm mb-4">Cuidado Natural para la Piel · Colombia</p>
          <p className="text-[#c8a580] text-xs max-w-md mx-auto leading-relaxed">
            Los testimonios son experiencias individuales. Resultados pueden variar. Este producto no diagnostica ni trata enfermedades.
          </p>
          <p className="text-[#9a7060] text-xs mt-4">© 2026 Bodega Natural Colombia</p>
        </div>
      </footer>

      {/* FLOATING WHATSAPP */}
      <a href="https://wa.me/573000000000?text=Hola%2C+quiero+información+sobre+el+Jabón+Kojic+Aclarante"
        target="_blank" rel="noopener noreferrer" className="wa-float">
        <svg viewBox="0 0 24 24" fill="white" width="28" height="28">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.554 4.114 1.523 5.843L.05 23.5l5.798-1.454A11.945 11.945 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.96 0-3.795-.5-5.392-1.38l-.386-.22-3.44.864.92-3.356-.244-.398A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
        </svg>
      </a>

      {/* STICKY MOBILE CTA */}
      <div className="sticky-cta">
        <button onClick={goToForm} className="w-full bg-[#CC2B2B] text-white font-extrabold py-4 rounded-2xl text-base shadow-lg">
          Pedir Ahora — Pago al Recibir 🛒
        </button>
        <p className="text-center text-gray-400 text-xs mt-1">Solo {stock} unidades · Envío gratis</p>
      </div>

    </div>
  )
}
