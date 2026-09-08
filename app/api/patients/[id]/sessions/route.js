import { NextResponse } from 'next/server';
import { agregarSesion } from '../../../../../lib/db';

export async function POST(request, { params }) {
  const datos = await request.json();
  const paciente = agregarSesion(params.id, datos);
  if (!paciente) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
  }
  return NextResponse.json(paciente, { status: 201 });
}
