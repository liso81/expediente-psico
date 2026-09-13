'use client';

import { useState } from 'react';

export default function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = '/dashboard';
      } else {
        setError('Clave incorrecta. Inténtalo de nuevo.');
        setCargando(false);
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.');
      setCargando(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-serif text-2xl mb-1">Expediente</h1>
        <p className="text-sm text-ink/60 mb-8">Acceso a la consulta</p>

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          <div>
            <label className="field-label block mb-1">Clave de acceso</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
          </div>

          {error && <p className="text-sm text-red-700">{error}</p>}

          <button type="submit" className="btn-primary w-full" disabled={cargando}>
            {cargando ? 'Entrando…' : 'Entrar'}
          </button>
        </form>

        <p className="text-xs text-ink/40 mt-6">
          Uso exclusivo del profesional. La información aquí guardada es confidencial.
        </p>
      </div>
    </main>
  );
}
