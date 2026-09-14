'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarArchivados, setMostrarArchivados] = useState(false);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    cargarPacientes();
  }, []);

  async function cargarPacientes() {
    setCargando(true);
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPacientes(Array.isArray(data) ? data : []);
    setCargando(false);
  }

  async function cerrarSesion() {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  async function archivar(id, archivarValor) {
    await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivado: archivarValor }),
    });
    cargarPacientes();
  }

  async function eliminar(id, nombre) {
    if (!confirm(`¿Eliminar el expediente de ${nombre} por completo? Esta acción no se puede deshacer.`)) return;
    await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    cargarPacientes();
  }

  const visibles = pacientes.filter((p) => (mostrarArchivados ? p.archivado : !p.archivado));
  const filtrados = visibles.filter((p) =>
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

      <div className="flex items-center gap-3 mb-3">
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

      <button
        className="text-sm text-ink/50 underline mb-6"
        onClick={() => setMostrarArchivados((v) => !v)}
      >
        {mostrarArchivados ? '← Ver pacientes activos' : 'Ver pacientes archivados'}
      </button>

      {mostrarForm && (
        <NuevoPacienteForm
          onCreado={() => {
            setMostrarForm(false);
            cargarPacientes();
          }}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {cargando ? (
        <p className="text-sm text-ink/50">Cargando…</p>
      ) : filtrados.length === 0 ? (
        <div className="card p-8 text-center text-sm text-ink/50">
          {mostrarArchivados
            ? 'No hay pacientes archivados.'
            : pacientes.length === 0
            ? 'Todavía no hay pacientes. Da de alta el primero con "+ Nuevo paciente".'
            : 'No hay pacientes que coincidan con la búsqueda.'}
        </div>
      ) : (
        <ul className="space-y-2">
          {filtrados.map((p) => (
            <li key={p.id} className="card flex items-center justify-between px-4 py-3">
              <Link href={`/patients/${p.id}`} className="flex-1 min-w-0 flex items-center gap-3">
                {p.fotoUrl ? (
                  <img src={p.fotoUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-line" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-light flex items-center justify-center text-primary font-serif shrink-0">
                    {p.nombre?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{p.nombre}</p>
                  <p className="text-sm text-ink/50 truncate">{p.motivoConsulta || 'Sin motivo de consulta registrado'}</p>
                </div>
              </Link>
              <div className="flex items-center gap-2 ml-2 shrink-0">
                <button
                  onClick={() => archivar(p.id, !p.archivado)}
                  className="text-lg leading-none text-ink/40 hover:text-ink"
                  title={p.archivado ? 'Desarchivar' : 'Archivar'}
                >
                  {p.archivado ? '📤' : '🗂'}
                </button>
                <button
                  onClick={() => eliminar(p.id, p.nombre)}
                  className="text-lg leading-none text-red-700/50 hover:text-red-700"
                  title="Eliminar"
                >
                  🗑
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function NuevoPacienteForm({ onCreado, onCancelar }) {
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
    try {
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        onCreado();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'No se pudo crear el paciente.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setEnviando(false);
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

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar paciente'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancelar} disabled={enviando}>
          ← Volver
        </button>
      </div>
    </form>
  );
}
