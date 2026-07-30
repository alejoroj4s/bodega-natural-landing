import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

const PRICE_MAP: Record<number, number> = {
  1: 79900,
  2: 149900,
  3: 199900,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, phone, address, city, quantity } = body

    // Validation
    const errors: string[] = []

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      errors.push('El nombre es requerido (mínimo 2 caracteres)')
    }

    if (!phone || typeof phone !== 'string') {
      errors.push('El número de celular es requerido')
    } else {
      const phoneClean = phone.replace(/\D/g, '')
      if (phoneClean.length < 10) {
        errors.push('El número de celular debe tener al menos 10 dígitos')
      }
    }

    if (!address || typeof address !== 'string' || address.trim().length < 5) {
      errors.push('La dirección de entrega es requerida')
    }

    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      errors.push('La ciudad es requerida')
    }

    const qty = Number(quantity)
    if (!quantity || !Number.isInteger(qty) || qty < 1 || qty > 3) {
      errors.push('La cantidad debe ser 1, 2 o 3 unidades')
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: errors },
        { status: 400 }
      )
    }

    const total_price = PRICE_MAP[qty]

    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          name: name.trim(),
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          quantity: qty,
          total_price,
          product_name: 'Jabón Kojic Serum 10',
          status: 'pending',
        },
      ])
      .select('id')
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Error al guardar el pedido. Por favor intenta de nuevo.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        orderId: data.id,
        message: '¡Pedido confirmado! Te llamaremos en los próximos 30 minutos para confirmar tu entrega.',
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
