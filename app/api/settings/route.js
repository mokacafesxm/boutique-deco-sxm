import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET : renvoie toutes les settings sous forme { key: value }.
// Si la table n'existe pas encore, on renvoie {} pour que la home
// retombe sur ses valeurs par défaut sans planter.
export async function GET() {
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) return NextResponse.json({})
  const map = {}
  for (const row of data) map[row.key] = row.value
  return NextResponse.json(map)
}

// POST : upsert d'un ensemble de paires { key: value }.
export async function POST(request) {
  const body = await request.json()
  const rows = Object.entries(body).map(([key, value]) => ({
    key,
    value: value == null ? '' : String(value),
  }))
  if (rows.length === 0) return NextResponse.json({ ok: true })
  const { error } = await supabase
    .from('settings')
    .upsert(rows, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
