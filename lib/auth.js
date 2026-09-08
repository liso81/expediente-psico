// lib/auth.js
//
// Autenticación mínima: una sola contraseña (la del psicólogo/a dueño
// de la consulta), guardada en la variable de entorno APP_PASSWORD.
// No es un sistema multiusuario ni de nivel hospitalario — es una
// puerta de acceso razonable para un consultorio individual.
//
// Si más adelante trabajas con varios terapeutas en la misma consulta,
// esto debería reemplazarse por un sistema real de cuentas (por ejemplo
// NextAuth) con un usuario por profesional y control de acceso por
// expediente, tal como recomienda la normativa (cada terapeuta ve solo
// sus propios pacientes).

import crypto from 'crypto';

const SECRET = process.env.SESSION_SECRET || 'cambia-este-secreto-en-produccion';
export const COOKIE_NAME = 'expediente_session';

export function generarToken() {
  return crypto.createHmac('sha256', SECRET).update('sesion-autenticada').digest('hex');
}

export function tokenValido(token) {
  if (!token) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(generarToken()));
  } catch {
    return false;
  }
}

export function passwordCorrecto(password) {
  const esperado = process.env.APP_PASSWORD || 'cambia-esta-clave';
  return password === esperado;
}
