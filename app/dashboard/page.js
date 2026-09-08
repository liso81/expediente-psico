'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarPacientes();
  }, []);

  async function cargarPacientes() {
    setCargando(true);
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPacientes(data);
    setCargando(false);
  }

  async function cerrarSesion() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  const filtrados = pacientes.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <header className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-2xl">Expediente</h1>
          <p className="text-sm text-ink/60">Consulta psicológica</p>
        </div>
        <button onClick={cerrarSesion} className="text-sm text-ink/50 hover:text-ink">
          Cerrar sesión
        </button>
      </header>

      <div className="flex items-center gap-3 mb-6">
        <input
          className="input"
          placeholder="Buscar paciente por nombre…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        <button className="btn-primary whitespace-nowrap" onClick={() => setMostrarForm((v) => !v)}>
          {mostrarForm ? 'Cancelar' : '+ Nuevo paciente'}
        </button>
      </div>

      {mostrarForm && (
        <NuevoPacienteForm
          onCreado={() => {
            setMostrarForm(false);
            cargarPacientes();
          }}
        />
      )}

      {cargando ? (
        <p className="text-sm text-ink/50">Cargando…</p>
      ) : filtrados.length === 0 ? (
        <div className="card p-8 text-center text-sm text-ink/50">
          {pacientes.length === 0
            ? 'Todavía no hay pacientes. Da de alta el primero con "+ Nuevo paciente".'
            : 'No hay pacientes que coincidan con la búsqueda.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtrados.map((p) => (
            <li key={p.id}>
              <Link
                href={`/patients/${p.id}`}
                className="card flex items-center justify-between px-4 py-3 hover:border-primary transition-colors"
              >
                <div>
                  <p className="font-medium">{p.nombre}</p>
                  <p className="text-sm text-ink/50">{p.motivoConsulta || 'Sin motivo de consulta registrado'}</p>
                </div>
                <span className="text-xs field-label border border-line rounded px-2 py-1">
                  {p.estado === 'alta' ? 'De alta' : 'Activo'}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function NuevoPacienteForm({ onCreado }) {
  const [form, setForm] = useState({
    nombre: '',
    contacto: '',
    fechaNacimiento: '',
    motivoConsulta: '',
    consentimiento: false,
  });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    setEnviando(true);
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setEnviando(false);
    if (res.ok) {
      onCreado();
    } else {
      const data = await res.json();
      setError(data.error || 'No se pudo crear el paciente.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="field-label block mb-1">Nombre completo</label>
          <input
            className="input"
            value={form.nombre}
            onChange={(e) => actualizar('nombre', e.target.value)}
            required
          />
        </div>
        <div>
          <label className="field-label block mb-1">Contacto</label>
          <input
            className="input"
            placeholder="Teléfono o correo"
            value={form.contacto}
            onChange={(e) => actualizar('contacto', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label block mb-1">Fecha de nacimiento</label>
          <input
            type="date"
            className="input"
            value={form.fechaNacimiento}
            onChange={(e) => actualizar('fechaNacimiento', e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="field-label block mb-1">Motivo de consulta</label>
          <textarea
            className="input"
            rows={2}
            value={form.motivoConsulta}
            onChange={(e) => actualizar('motivoConsulta', e.target.value)}
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.consentimiento}
          onChange={(e) => actualizar('consentimiento', e.target.checked)}
        />
        El paciente dio su consentimiento informado para el tratamiento de sus datos.
      </label>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button type="submit" className="btn-primary" disabled={enviando}>
        {enviando ? 'Guardando…' : 'Guardar paciente'}
      </button>
    </form>
  );
}
