'use client'
import { useEffect, useState } from 'react'

interface Order {
  orderId: string
  name: string
  phone: string
  city: string
  address: string
  barrio: string
  apto?: string
  quantity: number
  price: number
  status: string
  createdAt: string
  dropi_product_id: number
}

interface GHFile { name: string; download_url: string }

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders')
        const data = await res.json()
        if (data.recent) {
          const loaded: Order[] = []
          await Promise.all(
            data.recent.map(async (f: GHFile) => {
              const r = await fetch(f.download_url)
              const o: Order = await r.json()
              loaded.push(o)
            })
          )
          loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          setOrders(loaded)
          setTotal(data.count || loaded.length)
        }
      } catch (e) { console.error(e) }
      setLoading(false)
    }
    loadOrders()
  }, [])

  const totalRevenue = orders.reduce((s, o) => s + o.price, 0)

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', color: '#e5e5e5', fontFamily: 'monospace', padding: '24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <span style={{ fontSize: 28 }}>🌿</span>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#C8A550' }}>Bodega Natural · Panel de Pedidos</h1>
            <p style={{ fontSize: 12, color: '#555' }}>bodeganatural.com — actualiza cada visita</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Pedidos', value: total, unit: '' },
            { label: 'Mostrando', value: orders.length, unit: '' },
            { label: 'Ingresos Visibles', value: `$${totalRevenue.toLocaleString('es-CO')}`, unit: 'COP' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#C8A550' }}>{s.value} <span style={{ fontSize: 11, color: '#444' }}>{s.unit}</span></div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>Cargando órdenes...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>Sin órdenes aún. Los pedidos aparecen aquí en tiempo real.</div>
        ) : (
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {['ID','Fecha','Cliente','Ciudad','Tel','Dirección','Qty','Precio','Status'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#555', fontWeight: 600, fontSize: 11, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.orderId} style={{ borderBottom: '1px solid #1f1f1f', background: i % 2 ? '#161616' : '#1a1a1a' }}>
                    <td style={{ padding: '10px 12px', color: '#C8A550', fontWeight: 700, whiteSpace: 'nowrap' }}>{o.orderId}</td>
                    <td style={{ padding: '10px 12px', color: '#555', whiteSpace: 'nowrap' }}>{new Date(o.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{o.name}</td>
                    <td style={{ padding: '10px 12px', color: '#aaa' }}>{o.city}</td>
                    <td style={{ padding: '10px 12px', color: '#aaa' }}>{o.phone}</td>
                    <td style={{ padding: '10px 12px', color: '#888', fontSize: 12 }}>{o.address}{o.barrio ? `, ${o.barrio}` : ''}{o.apto ? ` Apto ${o.apto}` : ''}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{o.quantity}u</td>
                    <td style={{ padding: '10px 12px', color: '#4ade80', fontWeight: 600, whiteSpace: 'nowrap' }}>${o.price.toLocaleString('es-CO')}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ background: o.status === 'pending' ? '#1f2d1a' : '#1a2d2a', color: o.status === 'pending' ? '#4ade80' : '#34d399', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 16, fontSize: 11, color: '#333' }}>
          Dropi Product ID: 1971532 · Pixel: 1047164537662442 · bodeganatural.com
        </div>
      </div>
    </div>
  )
}
