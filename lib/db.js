// lib/db.js
//
// Almacenamiento en un único archivo JSON (data/db.json).
//
// IMPORTANTE — límite en Vercel:
// El sistema de archivos de las funciones serverless de Vercel es de solo
// lectura (salvo /tmp, que es efímero y se borra entre invocaciones/despliegues).
// Esto significa que, desplegado en Vercel, cada escritura puede perderse
// en el siguiente "cold start" y los cambios NO son fiables entre visitas.
//
// Esta capa está pensada para:
//   1) Uso local en Termux (funciona perfecto: es un servidor Node real
//      con disco persistente).
//   2) Servir de base para migrar más adelante a un almacenamiento
//      persistente compatible con Vercel (Vercel Blob, Vercel KV o una
//      base de datos como Postgres), sin tener que tocar el resto del
//      código: solo habría que reescribir las funciones de este archivo.
//
// Toda la app llama SOLO a las funciones exportadas aquí abajo, nunca a
// fs directamente desde otras partes — así el día de mañana el cambio
// de almacenamiento queda contenido en este único archivo.

import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

function leerDb() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const inicial = { pacientes: [] };
      fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
      fs.writeFileSync(DB_PATH, JSON.stringify(inicial, null, 2));
      return inicial;
    }
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error leyendo la base de datos JSON:', err);
    return { pacientes: [] };
  }
}

function escribirDb(data) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

export function listarPacientes() {
  return leerDb().pacientes.sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function obtenerPaciente(id) {
  return leerDb().pacientes.find((p) => p.id === id) || null;
}

export function crearPaciente(datos) {
  const db = leerDb();
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
  escribirDb(db);
  return nuevo;
}

export function actualizarPaciente(id, cambios) {
  const db = leerDb();
  const idx = db.pacientes.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  db.pacientes[idx] = { ...db.pacientes[idx], ...cambios };
  escribirDb(db);
  return db.pacientes[idx];
}

export function eliminarPaciente(id) {
  const db = leerDb();
  db.pacientes = db.pacientes.filter((p) => p.id !== id);
  escribirDb(db);
}

export function agregarSesion(pacienteId, sesion) {
  const db = leerDb();
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
  escribirDb(db);
  return paciente;
}
