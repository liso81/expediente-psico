export const COOKIE_NAME = 'expediente_session';

export function generarToken() {
  return process.env.SESSION_SECRET || 'cambia-este-secreto-en-produccion';
}

export function tokenValido(token) {
  return !!token && token === generarToken();
}

export function passwordCorrecto(password) {
  const esperado = process.env.APP_PASSWORD || 'cambia-esta-clave';
  return password === esperado;
}
