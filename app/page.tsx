'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

const COLOMBIAN_CITIES = [
  'Bogotá',
  'Medellín',
  'Cali',
  'Barranquilla',
  'Cartagena',
  'Cúcuta',
  'Bucaramanga',
  'Pereira',
  'Santa Marta',
  'Ibagué',
  'Manizales',
  'Villavicencio',
  'Pasto',
  'Montería',
  'Neiva',
]

const PRICE_MAP: Record<string, number> = {
  '1': 79900,
  '2': 149900,
  '3': 199900,
}

const FAQ_ITEMS = [
  {
    question: '¿Cómo funciona el pago?',
    answer:
      'Con nosotros el pago es 100% contra entrega. No necesitas tarjeta de crédito ni transferencias anticipadas. El mensajero llega a tu puerta con el producto, tú lo recibes y pagas en efectivo. Así de simple y seguro.',
  },
  {
    question: '¿Cuánto demora la entrega?',
    answer:
      'Hacemos envíos a todo Colombia. El tiempo de entrega es de 1 a 3 días hábiles dependiendo de tu ciudad. Bogotá, Medellín, Cali y ciudades principales tienen entregas más rápidas (1-2 días).',
  },
  {
    question: '¿Sirve para todo tipo de piel?',
    answer:
      'Sí, el Jabón Kojic Serum 10 está formulado para todo tipo de piel: seca, mixta, grasa y sensible. El ácido kójico es un ingrediente natural que aclara sin irritar. Si tienes piel muy sensible, te recomendamos empezar usándolo solo en las noches.',
  },
  {
    question: '¿Qué pasa si no me funciona?',
    answer:
      'Ofrecemos garantía de 21 días. Si usas el producto durante 21 días siguiendo las indicaciones y no ves resultados, te devolvemos tu dinero sin preguntas. Nos comprometemos con tu satisfacción.',
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-[#1f1f1f] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-[#111111] transition-colors duration-200"
      >
        <span className="text-white font-semibold text-base pr-4">{question}</span>
        <span
          className={`text-amber-500 text-2xl font-light transition-transform duration-300 flex-shrink-0 ${
            open ? 'rotate-45' : 'rotate-0'
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-6 pb-5 text-gray-400 text-sm leading-relaxed border-t border-[#1f1f1f]">
          <p className="pt-4">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    quantity: '1',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Ingresa tu nombre completo'
    }
    const phoneClean = formData.phone.replace(/\D/g, '')
    if (!formData.phone.trim() || phoneClean.length < 10) {
      newErrors.phone = 'Ingresa un número de celular válido (10 dígitos)'
    }
    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = 'Ingresa tu dirección completa'
    }
    if (!formData.city) {
      newErrors.city = 'Selecciona tu ciudad'
    }
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setErrors({})

    setLoading(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          city: formData.city,
          quantity: parseInt(formData.quantity),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al procesar el pedido')
      }

      setOrderId(data.orderId)
      setSuccess(true)

      // Fire Meta Pixel Purchase event
      if (typeof window !== 'undefined' && window.fbq) {
        window.fbq('track', 'Purchase', {
          value: PRICE_MAP[formData.quantity] / 100,
          currency: 'COP',
          content_name: 'Jabón Kojic Serum 10',
          content_type: 'product',
          num_items: parseInt(formData.quantity),
        })
      }

      // Scroll to success message
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Error al procesar el pedido. Por favor intenta de nuevo.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const currentPrice = PRICE_MAP[formData.quantity]

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ===== URGENCY BAR ===== */}
      <div className="bg-amber-500 text-black text-center py-3 px-4">
        <p className="text-sm font-bold tracking-wide animate-pulse">
          🔥 ÚLTIMAS 47 UNIDADES — Envío GRATIS — Pago al recibir
        </p>
      </div>

      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-[#0a0a0a] pt-12 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            {/* Text content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-block bg-amber-500/10 border border-amber-500/30 rounded-full px-4 py-1 mb-6">
                <span className="text-amber-400 text-xs font-semibold tracking-wider uppercase">
                  #1 en aclarar manchas — Colombia
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white">
                Elimina manchas y{' '}
                <span className="text-amber-400">aclara tu piel</span> en{' '}
                <span className="text-amber-400">21 días</span> o te devolvemos
                tu dinero
              </h1>

              <p className="text-gray-300 text-lg md:text-xl mb-8 leading-relaxed max-w-2xl">
                El jabón de Kojic que más venden las dermatólogas en Colombia —
                ahora con delivery gratis y pago al recibir
              </p>

              <div className="flex flex-col sm:flex-row gap-4 items-center lg:items-start lg:justify-start justify-center mb-8">
                <button
                  onClick={scrollToForm}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-lg px-10 py-5 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 w-full sm:w-auto"
                >
                  QUIERO MI JABÓN →
                </button>
              </div>

              <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">✓</span> Pago al recibir
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">✓</span> Envío gratis
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">✓</span> Garantía 21 días
                </span>
              </div>
            </div>

            {/* Product image */}
            <div className="flex-shrink-0 relative">
              <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden bg-[#111111] border border-amber-500/20 shadow-2xl shadow-amber-500/10">
                <Image
                  src="https://api.dropi.co/uploads/colombia/products/1971532/17612510181747175179WhatsApp Image 2025-05-13 at 5.24.48 PM.jpeg"
                  alt="Jabón Aclarante Kojic Serum 10 - Elimina manchas naturalmente"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 288px, 384px"
                />
              </div>
              {/* Price badge */}
              <div className="absolute -bottom-4 -right-4 bg-amber-500 text-black rounded-2xl px-4 py-3 text-center shadow-xl">
                <p className="text-xs font-bold line-through opacity-60">$120.000</p>
                <p className="text-xl font-extrabold">$79.900</p>
                <p className="text-xs font-semibold">COP</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== PAIN POINTS ===== */}
      <section className="bg-[#0d0d0d] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white">
            ¿Te identificas con alguno de estos problemas?
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Si marcas una sola, el Jabón Kojic es para ti
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                emoji: '😔',
                text: 'Manchas en la cara que no desaparecen',
                detail: 'Llevas meses o años intentando quitarlas sin éxito',
              },
              {
                emoji: '🌞',
                text: 'Piel apagada y sin luminosidad',
                detail: 'Tu piel no tiene ese brillo natural que desearías',
              },
              {
                emoji: '😤',
                text: 'Acné que deja cicatrices oscuras',
                detail: 'Cada grano que se va deja una marca que te molesta',
              },
              {
                emoji: '💔',
                text: 'Te da pena salir sin maquillaje',
                detail: 'Dependes del maquillaje para cubrir imperfecciones',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 flex items-start gap-4 hover:border-amber-500/40 transition-colors duration-300"
              >
                <span className="text-4xl flex-shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-white font-semibold text-base mb-1">{item.text}</p>
                  <p className="text-gray-500 text-sm">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRODUCT BENEFITS ===== */}
      <section className="bg-[#0a0a0a] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white">
            Por qué el Jabón de Kojic es diferente
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Una fórmula respaldada por dermatólogas y miles de mujeres colombianas
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: '⚗️',
                title: 'Ácido Kójico puro',
                desc: 'Despigmentante natural comprobado clínicamente. Inhibe la producción de melanina para aclarar manchas desde la raíz.',
              },
              {
                icon: '🌙',
                title: 'Uso mañana y noche',
                desc: '30 días de tratamiento completo con una sola barra. Úsalo como tu jabón de limpieza diario y deja actuar.',
              },
              {
                icon: '🌿',
                title: 'Apto para todo tipo de piel',
                desc: 'Fórmula suave y equilibrada. No irrita, no reseca. Incluso apto para piel sensible y durante el embarazo.',
              },
              {
                icon: '✨',
                title: 'Resultados desde la primera semana',
                desc: 'La mayoría de nuestras clientas notan diferencia en 7 días. Al mes 21, las manchas se ven visiblemente más claras.',
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 hover:border-amber-500/40 transition-colors duration-300 group"
              >
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors duration-300">
                  <span className="text-3xl">{benefit.icon}</span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="bg-gradient-to-b from-amber-500/5 to-transparent py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white">
            Así de fácil funciona
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Sin riesgos, sin complicaciones
          </p>

          <div className="flex flex-col md:flex-row gap-6 relative">
            {[
              {
                step: '1',
                title: 'Haz tu pedido aquí (GRATIS)',
                desc: 'Completa el formulario con tu nombre, celular y dirección. Sin tarjetas ni pagos anticipados.',
                icon: '📝',
              },
              {
                step: '2',
                title: 'Lo recibimos en casa en 1-3 días',
                desc: 'Nuestro mensajero lleva tu jabón directo a la puerta de tu casa o apartamento.',
                icon: '🚚',
              },
              {
                step: '3',
                title: 'Paga SOLO cuando lo tengas en tus manos',
                desc: 'Recibes el paquete, lo revisas y pagas en efectivo al mensajero. Cero riesgos.',
                icon: '💵',
              },
            ].map((item, i) => (
              <div key={i} className="flex-1 relative">
                <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 text-center hover:border-amber-500/40 transition-colors duration-300 h-full">
                  <div className="w-16 h-16 bg-amber-500 text-black rounded-full flex items-center justify-center mx-auto mb-4 font-extrabold text-2xl shadow-lg shadow-amber-500/30">
                    {item.step}
                  </div>
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-white font-bold text-base mb-3">{item.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <span className="text-amber-500 text-2xl">›</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={scrollToForm}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-lg px-10 py-5 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
            >
              QUIERO EL MÍO AHORA →
            </button>
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF / TESTIMONIALS ===== */}
      <section className="bg-[#0d0d0d] py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white">
            Mujeres colombianas que ya lo probaron
          </h2>
          <p className="text-gray-400 text-center mb-12 text-lg">
            Más de 2,800 pedidos en los últimos 30 días
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: 'Valentina M.',
                city: 'Bogotá',
                stars: 5,
                comment:
                  'En 2 semanas mis manchas aclararon mucho. No lo podía creer! Lo compré sin esperar nada y quedé enamorada del producto. Definitivamente lo voy a pedir de nuevo.',
                date: 'hace 3 días',
              },
              {
                name: 'Andrea P.',
                city: 'Medellín',
                stars: 5,
                comment:
                  'Mi dermatóloga me lo recomendó y funciona de verdad. Tenía manchas del sol desde hace años y en un mes vi una diferencia enorme. El pago contra entrega me dio mucha confianza para comprarlo.',
                date: 'hace 1 semana',
              },
              {
                name: 'Katerine R.',
                city: 'Cali',
                stars: 5,
                comment:
                  'Lo usé en el embarazo para las manchas del cloasma y fue una maravilla. Es muy suave para la piel y los resultados son increíbles. Mi esposo no lo podía creer cuando vio el cambio.',
                date: 'hace 2 semanas',
              },
            ].map((testimonial, i) => (
              <div
                key={i}
                className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-6 hover:border-amber-500/40 transition-colors duration-300"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: testimonial.stars }).map((_, si) => (
                    <span key={si} className="text-amber-400 text-lg">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">
                  &ldquo;{testimonial.comment}&rdquo;
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-semibold text-sm">{testimonial.name}</p>
                    <p className="text-amber-500 text-xs">{testimonial.city}</p>
                  </div>
                  <p className="text-gray-600 text-xs">{testimonial.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== ORDER FORM ===== */}
      <section
        ref={formRef}
        id="order-form"
        className="bg-[#0a0a0a] py-16 px-4"
      >
        <div className="max-w-2xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-white">
              PIDE HOY —{' '}
              <span className="text-amber-400">PAGA CUANDO LO RECIBAS</span>
            </h2>
            <p className="text-gray-400 text-lg mb-6">
              Completa el formulario y te contactamos en 30 minutos
            </p>

            {/* Price badge */}
            <div className="inline-block bg-[#111111] border border-amber-500/40 rounded-2xl px-8 py-5 mb-6">
              <div className="flex items-center gap-4 justify-center">
                <span className="text-gray-500 line-through text-xl">$120.000</span>
                <div>
                  <span className="text-4xl font-extrabold text-amber-400">
                    $79.900
                  </span>
                  <span className="text-gray-400 text-sm ml-1">COP</span>
                </div>
              </div>
              <p className="text-amber-400 font-bold text-sm mt-1">
                + ENVÍO GRATIS A TODO COLOMBIA
              </p>
            </div>
          </div>

          {success ? (
            /* SUCCESS STATE */
            <div className="bg-[#111111] border border-green-500/40 rounded-3xl p-8 text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">✅</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-4">
                ¡Pedido Confirmado!
              </h3>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                Te llamaremos en los próximos{' '}
                <span className="text-amber-400 font-bold">30 minutos</span> para
                confirmar tu entrega
              </p>
              <div className="bg-[#0a0a0a] rounded-2xl p-4 mb-6 text-left">
                <p className="text-gray-400 text-sm mb-1">Número de pedido:</p>
                <p className="text-amber-400 font-mono font-bold text-sm break-all">
                  {orderId}
                </p>
              </div>
              <p className="text-gray-500 text-sm">
                Guarda tu número de pedido. Te llegará la entrega en{' '}
                <strong className="text-white">1-3 días hábiles</strong>.
              </p>
            </div>
          ) : (
            /* FORM */
            <form
              onSubmit={handleSubmit}
              className="bg-[#111111] border border-[#1f1f1f] rounded-3xl p-6 md:p-8 space-y-5"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Nombre completo <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ej: María Fernanda Gómez"
                  className={`w-full bg-[#0a0a0a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-200 ${
                    errors.name
                      ? 'border-red-500/60'
                      : 'border-[#1f1f1f] focus:border-amber-500/50'
                  }`}
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Número de celular (WhatsApp){' '}
                  <span className="text-amber-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Ej: 3001234567"
                  className={`w-full bg-[#0a0a0a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-200 ${
                    errors.phone
                      ? 'border-red-500/60'
                      : 'border-[#1f1f1f] focus:border-amber-500/50'
                  }`}
                  disabled={loading}
                />
                {errors.phone && (
                  <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Dirección de entrega <span className="text-amber-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Ej: Calle 45 #12-34, Apto 301"
                  className={`w-full bg-[#0a0a0a] border rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-200 ${
                    errors.address
                      ? 'border-red-500/60'
                      : 'border-[#1f1f1f] focus:border-amber-500/50'
                  }`}
                  disabled={loading}
                />
                {errors.address && (
                  <p className="text-red-400 text-xs mt-1">{errors.address}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Ciudad <span className="text-amber-500">*</span>
                </label>
                <select
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className={`w-full bg-[#0a0a0a] border rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-200 appearance-none cursor-pointer ${
                    errors.city
                      ? 'border-red-500/60'
                      : 'border-[#1f1f1f] focus:border-amber-500/50'
                  } ${!formData.city ? 'text-gray-600' : 'text-white'}`}
                  disabled={loading}
                >
                  <option value="" disabled>
                    Selecciona tu ciudad
                  </option>
                  {COLOMBIAN_CITIES.map((city) => (
                    <option key={city} value={city} className="bg-[#111111] text-white">
                      {city}
                    </option>
                  ))}
                </select>
                {errors.city && (
                  <p className="text-red-400 text-xs mt-1">{errors.city}</p>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Cantidad
                </label>
                <select
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full bg-[#0a0a0a] border border-[#1f1f1f] focus:border-amber-500/50 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all duration-200 appearance-none cursor-pointer"
                  disabled={loading}
                >
                  <option value="1" className="bg-[#111111]">
                    1 unidad — $79.900 COP
                  </option>
                  <option value="2" className="bg-[#111111]">
                    2 unidades — $149.900 COP (ahorra $9.900)
                  </option>
                  <option value="3" className="bg-[#111111]">
                    3 unidades — $199.900 COP (ahorra $39.800)
                  </option>
                </select>
                <p className="text-amber-400 text-xs mt-2 font-semibold">
                  Total a pagar:{' '}
                  <span className="text-lg">
                    ${currentPrice.toLocaleString('es-CO')} COP
                  </span>{' '}
                  — al recibir
                </p>
              </div>

              {/* Submit error */}
              {submitError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-black font-extrabold text-lg py-5 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.02] disabled:scale-100 mt-2"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin inline-block"></span>
                    Procesando tu pedido...
                  </span>
                ) : (
                  'CONFIRMAR PEDIDO — PAGO AL RECIBIR 🛒'
                )}
              </button>

              {/* Trust signals */}
              <div className="flex flex-wrap justify-center gap-4 pt-2 text-gray-500 text-xs">
                <span>🔒 100% Seguro</span>
                <span>🚚 Envío Gratis</span>
                <span>💰 Pago al Recibir</span>
                <span>↩️ Garantía 21 días</span>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ===== FAQ SECTION ===== */}
      <section className="bg-[#0d0d0d] py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-4 text-white">
            Preguntas frecuentes
          </h2>
          <p className="text-gray-400 text-center mb-10 text-lg">
            Todo lo que necesitas saber antes de pedir
          </p>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>

          <div className="text-center mt-10">
            <button
              onClick={scrollToForm}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-lg px-10 py-5 rounded-2xl transition-all duration-200 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105"
            >
              PEDIR AHORA — PAGO AL RECIBIR →
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-[#0a0a0a] border-t border-[#1f1f1f] py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-amber-500 font-bold text-lg mb-2">BeautyKojic Colombia</p>
          <p className="text-gray-600 text-sm">
            © 2026 BeautyKojic Colombia | Todos los derechos reservados
          </p>
          <p className="text-gray-700 text-xs mt-3 max-w-lg mx-auto leading-relaxed">
            Los testimonios son experiencias individuales. Los resultados pueden variar
            entre personas. Este producto no diagnostica, trata ni cura enfermedades.
          </p>
        </div>
      </footer>
    </main>
  )
}
