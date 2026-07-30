import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

const META_TOKEN = process.env.META_ACCESS_TOKEN || 'EAAV7ljzrGg0BSEdDhRVHj6osClXIQLGRtQQk1VWUOaXcQtjAUZAT8khXYOVRirpvZBnEZCfqSqkFc44yyFDsoXqRa5f6n24NJCYzEDunOORZAFrmgKbnCPsMocWG3cbSqRBosBVbJoIIPS5gKlUZBuaSdunYtlCxeAfEs51SlRZCU3NHW4jji67oE4aS6ZCrAZDZD'
const PIXEL_ID = '1047164537662442'
const GH_TOKEN = process.env.GITHUB_TOKEN || ''
const GH_REPO = 'alejoroj4s/bodega-natural-landing'

function hashSHA256(val: string) {
  return crypto.createHash('sha256').update(val.toLowerCase().trim()).digest('hex')
}

async function sendMetaCAPI(order: Record<string, unknown>) {
  try {
    const phone = String(order.phone).replace(/\D/g, '')
    const eventData = {
      data: [{
        event_name: 'Purchase',
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_source_url: 'https://bodeganatural.com',
        user_data: {
          ph: [hashSHA256(`57${phone}`)],
          fn: [hashSHA256(String(order.name).split(' ')[0])],
          ln: [hashSHA256(String(order.name).split(' ').slice(1).join(' ') || '')],
          ct: [hashSHA256(String(order.city).toLowerCase())],
          country: [hashSHA256('co')],
        },
        custom_data: {
          value: order.price,
          currency: 'COP',
          content_name: 'Jabón Kojic Serum Aclarante',
          content_ids: ['KOJIC-SERUM-001'],
          content_type: 'product',
          num_items: order.quantity,
          order_id: order.orderId,
        },
      }],
      test_event_code: process.env.META_TEST_EVENT_CODE || undefined,
    }

    const res = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${META_TOKEN}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(eventData) }
    )
    const result = await res.json()
    console.log('Meta CAPI result:', JSON.stringify(result))
  } catch (err) {
    console.error('Meta CAPI error:', err)
  }
}

async function saveOrderToGitHub(order: Record<string, unknown>) {
  if (!GH_TOKEN) { console.warn('No GitHub token, skipping order save'); return }
  try {
    const timestamp = Date.now()
    const filename = `orders/${timestamp}-${String(order.phone).slice(-4)}.json`
    const content = Buffer.from(JSON.stringify(order, null, 2)).toString('base64')

    const res = await fetch(
      `https://api.github.com/repos/${GH_REPO}/contents/${filename}`,
      {
        method: 'PUT',
        headers: { 'Authorization': `token ${GH_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Pedido #${order.orderId} — ${order.name} — ${order.city}`,
          content,
        }),
      }
    )
    if (!res.ok) {
      const err = await res.json()
      console.error('GitHub save error:', err)
    } else {
      console.log('Order saved to GitHub:', filename)
    }
  } catch (err) {
    console.error('GitHub error:', err)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address, barrio, apto, city, dept, quantity, price } = body

    const errors: string[] = []
    if (!name?.trim() || name.trim().length < 2) errors.push('Nombre requerido')
    const phoneClean = String(phone || '').replace(/\D/g, '')
    if (phoneClean.length < 10) errors.push('Celular válido requerido (10 dígitos)')
    if (!address?.trim() || address.trim().length < 4) errors.push('Dirección requerida')
    if (!barrio?.trim()) errors.push('Barrio requerido')
    if (!city?.trim()) errors.push('Ciudad requerida')

    const qty = Number(quantity)
    if (!qty || qty < 1 || qty > 3) errors.push('Cantidad inválida')

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(', ') }, { status: 400 })
    }

    const orderId = `BN-${Date.now().toString(36).toUpperCase()}`
    const order = {
      orderId,
      name: name.trim(),
      phone: `+57${phoneClean}`,
      address: address.trim(),
      barrio: barrio?.trim() || '',
      apto: apto?.trim() || '',
      city: city.trim(),
      dept: dept?.trim() || '',
      quantity: qty,
      price: price || [79900, 149900, 199900][qty - 1],
      product: 'Jabón Kojic Serum Aclarante',
      dropi_product_id: 1971532,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || '',
    }

    // Save to GitHub (non-blocking)
    saveOrderToGitHub(order).catch(console.error)

    // Send to Meta CAPI (non-blocking)
    sendMetaCAPI(order).catch(console.error)

    // Auto-create Dropi order (non-blocking)
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bodeganatural.com'
    fetch(`${baseUrl}/api/dropi-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-cron-secret': 'bn-cron-2026' },
      body: JSON.stringify(order),
    }).then(r => r.json()).then(d => console.log('Dropi result:', JSON.stringify(d))).catch(console.error)

    console.log('NEW ORDER:', JSON.stringify(order))

    return NextResponse.json({ success: true, orderId }, { status: 201 })
  } catch (err) {
    console.error('Order error:', err)
    return NextResponse.json({ error: 'Error interno, intenta de nuevo' }, { status: 500 })
  }
}

export async function GET() {
  // Simple admin endpoint - returns recent orders from GitHub
  if (!GH_TOKEN) return NextResponse.json({ error: 'No auth' }, { status: 401 })
  try {
    const res = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/orders`,
      { headers: { 'Authorization': `token ${GH_TOKEN}` } })
    if (!res.ok) return NextResponse.json({ orders: [] })
    const files = await res.json()
    if (!Array.isArray(files)) return NextResponse.json({ orders: [] })
    // Return last 20 orders
    const recent = files.slice(-20).reverse()
    return NextResponse.json({ count: files.length, recent: recent.map((f: { name: string; download_url: string }) => ({ name: f.name, url: f.download_url })) })
  } catch {
    return NextResponse.json({ orders: [] })
  }
}
