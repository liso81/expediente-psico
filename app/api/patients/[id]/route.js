import { NextResponse } from 'next/server';
import { obtenerPaciente, actualizarPaciente, eliminarPaciente } from '../../../../lib/db';

export async function GET(_request, { params }) {
  const paciente = obtenerPaciente(params.id);
  if (!paciente) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
  }
  return NextResponse.json(paciente);
}

export async function PUT(request, { params }) {
  const cambios = await request.json();
  const paciente = actualizarPaciente(params.id, cambios);
  if (!paciente) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
  }
  return NextResponse.json(paciente);
}

export async function DELETE(_request, { params }) {
  eliminarPaciente(params.id);
  return NextResponse.json({ ok: true });
}
