import { NextResponse } from 'next/server';
import { obtenerPaciente, actualizarPaciente, eliminarPaciente } from '../../../../lib/db';
import { obtenerUsuarioDeRequest } from '../../../../lib/auth';

export async function GET(request, { params }) {
  const ownerId = obtenerUsuarioDeRequest(request);
  if (!ownerId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const paciente = await obtenerPaciente(params.id, ownerId);
  if (!paciente) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
  }
  return NextResponse.json(paciente);
}

export async function PUT(request, { params }) {
  const ownerId = obtenerUsuarioDeRequest(request);
  if (!ownerId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const cambios = await request.json();
  const paciente = await actualizarPaciente(params.id, cambios, ownerId);
  if (!paciente) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
  }
  return NextResponse.json(paciente);
}

export async function DELETE(request, { params }) {
  const ownerId = obtenerUsuarioDeRequest(request);
  if (!ownerId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  await eliminarPaciente(params.id, ownerId);
  return NextResponse.json({ ok: true });
}
