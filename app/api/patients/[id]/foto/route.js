import { NextResponse } from 'next/server';
import { obtenerPaciente, actualizarPaciente } from '../../../../../lib/db';
import { obtenerUsuarioDeRequest } from '../../../../../lib/auth';
import { subirArchivo } from '../../../../../lib/blob';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const ownerId = obtenerUsuarioDeRequest(request);
  if (!ownerId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });

  const paciente = await obtenerPaciente(params.id, ownerId);
  if (!paciente) {
    return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
  }

  const formData = await request.formData();
  const file = formData.get('foto');
  if (!file) {
    return NextResponse.json({ error: 'No se recibió ninguna foto' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const pathname = `fotos/${params.id}/${Date.now()}-${file.name}`;
  const url = await subirArchivo(pathname, buffer, file.type || 'image/jpeg');

  const actualizado = await actualizarPaciente(params.id, { fotoUrl: url }, ownerId);
  return NextResponse.json(actualizado, { status: 200 });
}
