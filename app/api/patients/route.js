import { NextResponse } from 'next/server';
import { listarPacientes, crearPaciente } from '../../../lib/db';

export async function GET() {
  const pacientes = await listarPacientes();
  return NextResponse.json(pacientes);
}

export async function POST(request) {
  const datos = await request.json();

  if (!datos.nombre || !datos.nombre.trim()) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 });
  }

  const paciente = await crearPaciente(datos);
  return NextResponse.json(paciente, { status: 201 });
}
