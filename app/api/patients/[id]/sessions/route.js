import { NextResponse } from 'next/server';
import { agregarSesion } from '../../../../../lib/db';
import { obtenerUsuarioDeRequest } from '../../../../../lib/auth';

export async function POST(request, { params }) {
  const ownerId = obtenerUsuarioDeRequest(request);
  if (!ownerId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const datos = await request.json();
  const paciente = await agregarSesion(params.id, datos, ownerId);
  if (!paciente) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
  }
  return NextResponse.json(paciente, { status: 201 });
}
