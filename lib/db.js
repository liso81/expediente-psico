// lib/db.js
//
// Almacenamiento de los datos como un único JSON, guardado en Vercel Blob.
// Cada paciente tiene un propietarioId (qué psicólogo lo dio de alta), así
// que cada usuario ve solo sus propios pacientes. Los pacientes creados
// antes de tener dos usuarios (sin propietarioId) se consideran del
// primer usuario ('u1'), para no perder datos existentes.

import { put, list } from '@vercel/blob';
import { blobOptions } from './blob';

const BLOB_PATHNAME = 'expediente-db.json';

async function leerDb() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1, ...blobOptions });
    if (blobs.length === 0) {
      return { pacientes: [] };
    }
    const res = await fetch(blobs[0].url, { cache: 'no-store' });
    if (!res.ok) return { pacientes: [] };
    return await res.json();
  } catch (err) {
    console.error('Error leyendo la base de datos (Blob):', err);
    return { pacientes: [] };
  }
}

async function escribirDb(data) {
  await put(BLOB_PATHNAME, JSON.stringify(data, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    ...blobOptions,
  });
}

function esDeEstePropietario(paciente, ownerId) {
  return (paciente.propietarioId || 'u1') === ownerId;
}

export async function listarPacientes(ownerId) {
  const db = await leerDb();
  return db.pacientes
    .filter((p) => esDeEstePropietario(p, ownerId))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function obtenerPaciente(id, ownerId) {
  const db = await leerDb();
  const paciente = db.pacientes.find((p) => p.id === id) || null;
  if (!paciente) return null;
  if (ownerId && !esDeEstePropietario(paciente, ownerId)) return null;
  return paciente;
}

export async function crearPaciente(datos, ownerId) {
  const db = await leerDb();
  const nuevo = {
    id: `pac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    propietarioId: ownerId,
    nombre: datos.nombre || '',
    contacto: datos.contacto || '',
    fechaNacimiento: datos.fechaNacimiento || '',
    motivoConsulta: datos.motivoConsulta || '',
    diagnostico: datos.diagnostico || '',
    objetivosTratamiento: datos.objetivosTratamiento || '',
    consentimiento: !!datos.consentimiento,
    estado: 'activo',
    archivado: false,
    fotoUrl: '',
    documentos: [],
    creadoEn: new Date().toISOString(),
    sesiones: [],
  };
  db.pacientes.push(nuevo);
  await escribirDb(db);
  return nuevo;
}

export async function actualizarPaciente(id, cambios, ownerId) {
  const db = await leerDb();
  const idx = db.pacientes.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  if (ownerId && !esDeEstePropietario(db.pacientes[idx], ownerId)) return null;
  db.pacientes[idx] = { ...db.pacientes[idx], ...cambios };
  await escribirDb(db);
  return db.pacientes[idx];
}

export async function eliminarPaciente(id, ownerId) {
  const db = await leerDb();
  const paciente = db.pacientes.find((p) => p.id === id);
  if (!paciente) return;
  if (ownerId && !esDeEstePropietario(paciente, ownerId)) return;
  db.pacientes = db.pacientes.filter((p) => p.id !== id);
  await escribirDb(db);
}

export async function agregarSesion(pacienteId, sesion, ownerId) {
  const db = await leerDb();
  const paciente = db.pacientes.find((p) => p.id === pacienteId);
  if (!paciente) return null;
  if (ownerId && !esDeEstePropietario(paciente, ownerId)) return null;
  const nuevaSesion = {
    id: `ses_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    fecha: sesion.fecha || new Date().toISOString().slice(0, 10),
    enfoque: sesion.enfoque || '',
    notaClinica: sesion.notaClinica || '',
    notaPrivada: sesion.notaPrivada || '',
    creadoEn: new Date().toISOString(),
  };
  paciente.sesiones = paciente.sesiones || [];
  paciente.sesiones.unshift(nuevaSesion);
  await escribirDb(db);
  return paciente;
}
