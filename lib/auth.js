// lib/auth.js
//
// Autenticación con dos usuarios (dos psicólogos), cada uno con su propia
// clave. La cookie de sesión guarda qué usuario inició sesión, para que
// cada quien vea solo sus propios pacientes.
//
// Sigue siendo una autenticación mínima (sin cifrado real — el "token" es
// el id del usuario más el secreto en texto plano). Suficiente para dos
// profesionales de confianza en la misma consulta, no para un sistema
// multiusuario más amplio o con datos más sensibles.

export const COOKIE_NAME = 'expediente_session';

function usuarios() {
  return [
    { id: 'u1', password: process.env.APP_PASSWORD || '' },
    { id: 'u2', password: process.env.APP_PASSWORD_2 || '' },
  ].filter((u) => u.password);
}

function secreto() {
  return process.env.SESSION_SECRET || 'cambia-este-secreto-en-produccion';
}

export function generarTokenParaUsuario(userId) {
  return `${userId}.${secreto()}`;
}

export function usuarioDesdeToken(token) {
  if (!token || !token.includes('.')) return null;
  const [userId, tokenSecreto] = token.split('.');
  if (tokenSecreto !== secreto()) return null;
  const existe = usuarios().some((u) => u.id === userId);
  return existe ? userId : null;
}

export function tokenValido(token) {
  return !!usuarioDesdeToken(token);
}

export function encontrarUsuarioPorPassword(password) {
  const encontrado = usuarios().find((u) => u.password === password);
  return encontrado ? encontrado.id : null;
}

export function obtenerUsuarioDeRequest(request) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return usuarioDesdeToken(token);
}
