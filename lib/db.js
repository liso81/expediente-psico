// lib/db.js
//
// Almacenamiento de los datos como un único JSON, guardado en Vercel Blob.
//
// Por qué Vercel Blob y no un archivo local:
// El sistema de archivos de las funciones de Vercel es de solo lectura en
// producción, así que un archivo JSON local (data/db.json) se pierde o
// falla al escribir en cuanto la app corre desplegada — es justo lo que
// causaba que el botón "Guardar" se quedara colgado al dar de alta un
// paciente. Vercel Blob resuelve esto: sigue siendo "un JSON", pero
// guardado de forma persistente en la infraestructura de Vercel en vez
// del disco de la función.
//
// Toda la app llama SOLO a las funciones exportadas aquí abajo.

import { put, list } from '@vercel/blob';

const BLOB_PATHNAME = 'expediente-db.json';

async function leerDb() {
  try {
    const { blobs } = await list({ prefix: BLOB_PATHNAME, limit: 1 });
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
