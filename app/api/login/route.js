import { NextResponse } from 'next/server';
import { COOKIE_NAME, generarToken, passwordCorrecto } from '../../../lib/auth';

// Evita que esta respuesta se guarde en caché en algún punto intermedio
// (proxy del operador móvil, modo de ahorro de datos, CDN, etc.), lo cual
// podía servir una copia vieja de la respuesta sin la cookie de sesión.
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { password } = await request.json();

  if (!passwordCorrecto(password)) {
    return NextResponse.json({ error: 'Clave incorrecta' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, generarToken(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return res;
}
