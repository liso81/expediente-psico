import { NextResponse } from 'next/server';
import { listarPacientes, crearPaciente } from '../../../lib/db';
import { obtenerUsuarioDeRequest } from '../../../lib/auth';

export async function GET(request) {
  const ownerId = obtenerUsuarioDeRequest(request);
  if (!ownerId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const pacientes = await listarPacientes(ownerId);
  return NextResponse.json(pacientes);
}

export async function POST(request) {
  const ownerId = obtenerUsuarioDeRequest(request);
  if (!ownerId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const datos = await request.json();
  if (!datos.nombre || !datos.nombre.trim()) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const paciente = await crearPaciente(datos, ownerId);
  return NextResponse.json(paciente, { status: 201 });
}
