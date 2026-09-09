// lib/db.js
//
// Almacenamiento de los datos como un único JSON, guardado en Vercel Blob.
//
// Las variables de entorno usan el prefijo BLOB2_ (en vez del nombre por
// defecto BLOB_) porque el proyecto ya tenía otras variables BLOB_* de un
// intento anterior de conexión. Por eso se pasan explícitamente `token` y
// `storeId` en cada llamada, en vez de dejar que el SDK las detecte solo.

import { put, list } from '@vercel/blob';

const BLOB_PATHNAME = 'expediente-db.json';

const blobOptions = {
  token: process.env.BLOB2_READ_WRITE_TOKEN,
  storeId: process.env.BLOB2_STORE_ID,
};

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

export async function listarPacientes() {
  const db = await leerDb();
  return db.pacientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function obtenerPaciente(id) {
  const db = await leerDb();
  return db.pacientes.find((p) => p.id === id) || null;
}

export async function crearPaciente(datos) {
  const db = await leerDb();
  const nuevo = {
    id: `pac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    nombre: datos.nombre || '',
    contacto: datos.contacto || '',
    fechaNacimiento: datos.fechaNacimiento || '',
    motivoConsulta: datos.motivoConsulta || '',
    diagnostico: datos.diagnostico || '',
    objetivosTratamiento: datos.objetivosTratamiento || '',
    consentimiento: !!datos.consentimiento,
    estado: 'activo',
    creadoEn: new Date().toISOString(),
    sesiones: [],
  };
  db.pacientes.push(nuevo);
  await escribirDb(db);
  return nuevo;
}

export async function actualizarPaciente(id, cambios) {
  const db = await leerDb();
  const idx = db.pacientes.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.pacientes[idx] = { ...db.pacientes[idx], ...cambios };
  await escribirDb(db);
  return db.pacientes[idx];
}

export async function eliminarPaciente(id) {
  const db = await leerDb();
  db.pacientes = db.pacientes.filter((p) => p.id !== id);
  await escribirDb(db);
}

export async function agregarSesion(pacienteId, sesion) {
  const db = await leerDb();
  const paciente = db.pacientes.find((p) => p.id === pacienteId);
  if (!paciente) return null;
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
