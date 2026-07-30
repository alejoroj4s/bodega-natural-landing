import { NextRequest, NextResponse } from 'next/server'

const DROPI_EMAIL = 'alejoroj4s@gmail.com'
const DROPI_PASS = 'Dialero.0126*'
const DROPI_PRODUCT_ID = 1971532
const CRON_SECRET = process.env.CRON_SECRET || 'bn-cron-2026'

interface OrderData {
  orderId: string
  name: string
  phone: string
  address: string
  barrio: string
  apto?: string
  city: string
  quantity: number
  price: number
}

async function getDropiToken(): Promise<string> {
  const res = await fetch('https://api-v2.dropi.co/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: DROPI_EMAIL, password: DROPI_PASS }),
  })
  if (!res.ok) throw new Error(`Dropi login failed: ${res.status}`)
  const data = await res.json()
  const token = data?.data?.token || data?.token
  if (!token) throw new Error('No Dropi token in response')
  return token
}

async function createDropiOrder(token: string, order: OrderData) {
  const fullName = order.name.trim()
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.slice(1).join(' ') || firstName

  const phone = String(order.phone).replace(/\D/g, '').replace(/^57/, '')

  const addressFull = [order.address, order.barrio ? `Barrio ${order.barrio}` : '', order.apto ? `Apto ${order.apto}` : '']
    .filter(Boolean).join(', ')

  const payload = {
    products: [{ product_id: DROPI_PRODUCT_ID, quantity: order.quantity }],
    customer: {
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      email: '',
    },
    shipping_address: {
      address: addressFull,
      city: order.city,
      country: 'CO',
      zipcode: '',
    },
    payment_method: 'cash_on_delivery',
    notes: `Pedido Bodega Natural #${order.orderId} — ${order.quantity} unidad(es) — $${order.price.toLocaleString('es-CO')} COP`,
  }

  const res = await fetch('https://api-v2.dropi.co/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  })

  const data = await res.json()
  if (!res.ok) throw new Error(`Dropi order error ${res.status}: ${JSON.stringify(data)}`)
  return data
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as OrderData
  if (!body.orderId) {
    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  }

  try {
    const token = await getDropiToken()
    const result = await createDropiOrder(token, body)
    console.log(`Dropi order created for ${body.orderId}:`, JSON.stringify(result))
    return NextResponse.json({ success: true, dropi: result })
  } catch (err) {
    console.error('Dropi order error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
