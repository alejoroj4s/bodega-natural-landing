'use client'
import { useEffect, useState } from 'react'

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS || 'bn-admin-pablo-2026'

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
}

interface GHFile { name: string; download_url: string }

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [pass, setPass] = useState('')
  const [authErr, setAuthErr] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  const login = (e: React.FormEvent) => {
    e.preventDefault()
    if (pass === ADMIN_PASS) { setAuthed(true); setAuthErr(false) }
    else { setAuthErr(true) }
  }

  useEffect(() => {
    if (!authed) return
    setLoading(true)
    async function load() {
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
    load()
  }, [authed])

  const totalRevenue = orders.reduce((s, o) => s + o.price, 0)

  if (!authed) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
        <form onSubmit={login} style={{ background: '#141414', border: '1px solid #222', borderRadius: 12, padding: 40, width: 320 }}>
          <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 8 }}>🌿</div>
          <p style={{ color: '#C8A550', fontWeight: 700, textAlign: 'center', marginBottom: 4 }}>Bodega Natural</p>
          <p style={{ color: '#444', fontSize: 11, textAlign: 'center', marginBottom: 24 }}>Panel Interno · Solo Pablo</p>
          <input
            type="password"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="Contraseña"
            autoFocus
            style={{ width: '100%', background: '#1a1a1a', border: `1px solid ${authErr ? '#cc2b2b' : '#333'}`, borderRadius: 8, padding: '10px 14px', color: '#e5e5e5', fontSize: 14, boxSizing: 'border-box', marginBottom: 8 }}
          />
          {authErr && <p style={{ color: '#cc2b2b', fontSize: 11, marginBottom: 8 }}>Contraseña incorrecta</p>}
          <button type="submit" style={{ width: '100%', background: '#5B2D18', color: 'white', border: 'none', borderRadius: 8, padding: '10px 0', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
            Entrar
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ background: '#0f0f0f', minHeight: '100vh', color: '#e5e5e5', fontFamily: 'monospace', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28 }}>🌿</span>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#C8A550', margin: 0 }}>Bodega Natural · Órdenes</h1>
              <p style={{ fontSize: 11, color: '#444', margin: 0 }}>bodeganatural.com — uso interno</p>
            </div>
          </div>
          <button onClick={() => setAuthed(false)} style={{ background: 'none', border: '1px solid #333', color: '#555', borderRadius: 6, padding: '4px 12px', cursor: 'pointer', fontSize: 11 }}>
            Salir
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Pedidos', value: total },
            { label: 'Últimos 20', value: orders.length },
            { label: 'Ingresos Visibles', value: `$${totalRevenue.toLocaleString('es-CO')}` },
            { label: 'Ticket Promedio', value: orders.length ? `$${Math.round(totalRevenue / orders.length).toLocaleString('es-CO')}` : '—' },
          ].map(s => (
            <div key={s.label} style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, padding: '14px 18px' }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: '#C8A550' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>Cargando...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#333' }}>Sin órdenes aún.</div>
        ) : (
          <div style={{ background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 8, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #2a2a2a' }}>
                  {['ID','Fecha','Cliente','Ciudad','Teléfono','Dirección completa','Cant','Precio','Estado'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#444', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o.orderId} style={{ borderBottom: '1px solid #1f1f1f', background: i % 2 ? '#161616' : '#1a1a1a' }}>
                    <td style={{ padding: '9px 12px', color: '#C8A550', fontWeight: 700, whiteSpace: 'nowrap' }}>{o.orderId}</td>
                    <td style={{ padding: '9px 12px', color: '#555', whiteSpace: 'nowrap', fontSize: 11 }}>{new Date(o.createdAt).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })}</td>
                    <td style={{ padding: '9px 12px', whiteSpace: 'nowrap' }}>{o.name}</td>
                    <td style={{ padding: '9px 12px', color: '#aaa' }}>{o.city}</td>
                    <td style={{ padding: '9px 12px', color: '#888' }}>{o.phone}</td>
                    <td style={{ padding: '9px 12px', color: '#666', fontSize: 11 }}>{[o.address, o.barrio && `B/ ${o.barrio}`, o.apto && `Apto ${o.apto}`].filter(Boolean).join(' · ')}</td>
                    <td style={{ padding: '9px 12px', textAlign: 'center', color: '#aaa' }}>{o.quantity}u</td>
                    <td style={{ padding: '9px 12px', color: '#4ade80', fontWeight: 700, whiteSpace: 'nowrap' }}>${o.price.toLocaleString('es-CO')}</td>
                    <td style={{ padding: '9px 12px' }}>
                      <span style={{ background: '#1f2d1a', color: '#4ade80', padding: '2px 8px', borderRadius: 4, fontSize: 10 }}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ marginTop: 16, fontSize: 10, color: '#2a2a2a' }}>
          Dropi 1971532 · Pixel 1047164537662442 · Ad Account 861758066915759
        </p>
      </div>
    </div>
  )
}
