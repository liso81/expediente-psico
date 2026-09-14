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
  const file = formData.get('archivo');
  if (!file) {
    return NextResponse.json({ error: 'No se recibió ningún archivo' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const pathname = `documentos/${params.id}/${Date.now()}-${file.name}`;
  const url = await subirArchivo(pathname, buffer, file.type || 'application/octet-stream');

  const documentos = [
    ...(paciente.documentos || []),
    {
      id: `doc_${Date.now()}`,
      nombre: file.name,
      url,
      tipo: file.type || '',
      subidoEn: new Date().toISOString(),
    },
  ];

  const actualizado = await actualizarPaciente(params.id, { documentos }, ownerId);
  return NextResponse.json(actualizado, { status: 201 });
}
