'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PacientePage({ params }) {
  const { id } = params;
  const router = useRouter();
  const [paciente, setPaciente] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [notasVisibles, setNotasVisibles] = useState({});

  useEffect(() => {
    cargar();
  }, [id]);

  async function cargar() {
    setCargando(true);
    const res = await fetch(`/api/patients/${id}`);
    if (res.ok) {
      setPaciente(await res.json());
    }
    setCargando(false);
  }

  async function eliminarPaciente() {
    if (!confirm('¿Eliminar este expediente por completo? Esta acción no se puede deshacer.')) return;
    await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    router.push('/dashboard');
  }

  async function toggleArchivar() {
    await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivado: !paciente.archivado }),
    });
    cargar();
  }

  if (cargando) {
    return <main className="max-w-3xl mx-auto px-4 py-10 text-sm text-ink/50">Cargando…</main>;
  }

  if (!paciente) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-ink/60 mb-4">No se encontró este expediente.</p>
        <Link href="/dashboard" className="text-primary underline">Volver al listado</Link>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/dashboard" className="text-sm text-ink/50 hover:text-ink">← Volver</Link>

      <header className="flex items-start justify-between mt-3 mb-6">
        <div className="flex items-center gap-4">
          <FotoPaciente paciente={paciente} onSubido={cargar} />
          <div>
            <h1 className="font-serif text-2xl">{paciente.nombre}</h1>
            <p className="text-sm text-ink/50">
              {paciente.contacto || 'Sin contacto registrado'}
              {paciente.fechaNacimiento ? ` · nacido/a ${paciente.fechaNacimiento}` : ''}
            </p>
            {paciente.archivado && (
              <span className="inline-block mt-1 text-xs field-label border border-line rounded px-2 py-0.5">
                Archivado
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="flex gap-4 mb-8">
        <button onClick={toggleArchivar} className="text-sm text-ink/50 hover:text-ink underline">
          {paciente.archivado ? 'Desarchivar' : 'Archivar'}
        </button>
        <button onClick={eliminarPaciente} className="text-sm text-red-700/70 hover:text-red-700 underline">
          Eliminar expediente
        </button>
      </div>

      <FichaClinica paciente={paciente} onGuardado={cargar} />

      <DocumentosPaciente paciente={paciente} onSubido={cargar} />

      <NuevaSesionForm pacienteId={id} onGuardado={cargar} />

      <section>
        <h2 className="font-serif text-lg mb-3">Historial de sesiones</h2>
        {(!paciente.sesiones || paciente.sesiones.length === 0) ? (
          <p className="text-sm text-ink/50">Todavía no hay sesiones registradas.</p>
        ) : (
          <ul className="space-y-3">
            {paciente.sesiones.map((s) => (
              <li key={s.id} className="card p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{s.fecha}</span>
                  {s.enfoque && (
                    <span className="text-xs field-label border border-line rounded px-2 py-0.5">
                      {s.enfoque}
                    </span>
                  )}
                </div>

                {s.notaClinica && (
                  <p className="text-sm text-ink/80 whitespace-pre-wrap">{s.notaClinica}</p>
                )}

                {s.notaPrivada && (
                  <div className="mt-3">
                    <button
                      className="text-xs text-privado underline"
                      onClick={() =>
                        setNotasVisibles((v) => ({ ...v, [s.id]: !v[s.id] }))
                      }
                    >
                      {notasVisibles[s.id] ? 'Ocultar nota privada' : '🔒 Ver nota privada'}
                    </button>
                    {notasVisibles[s.id] && (
                      <div className="bg-privado-light border border-privado/20 rounded p-3 mt-2 text-sm text-ink/80 whitespace-pre-wrap">
                        {s.notaPrivada}
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function FotoPaciente({ paciente, onSubido }) {
  const [subiendo, setSubiendo] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('foto', file);
      const res = await fetch(`/api/patients/${paciente.id}/foto`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) onSubido();
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="flex items-center gap-2">
      {paciente.fotoUrl ? (
        <img
          src={paciente.fotoUrl}
          alt=""
          className="w-16 h-16 rounded-full object-cover border border-line"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center text-primary font-serif text-xl">
          {paciente.nombre?.[0]?.toUpperCase() || '?'}
        </div>
      )}
      <div>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className="hidden"
          onChange={handleFile}
        />
        <button
          type="button"
          className="text-xs text-primary underline block"
          onClick={() => inputRef.current?.click()}
          disabled={subiendo}
        >
          {subiendo ? 'Subiendo…' : paciente.fotoUrl ? 'Cambiar foto' : '+ Foto'}
        </button>
      </div>
    </div>
  );
}

function DocumentosPaciente({ paciente, onSubido }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      const res = await fetch(`/api/patients/${paciente.id}/documentos`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        onSubido();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'No se pudo subir el archivo.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setSubiendo(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <section className="card p-5 mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-serif text-lg">Documentos y tests</h2>
        <div>
          <input type="file" ref={inputRef} className="hidden" onChange={handleFile} />
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => inputRef.current?.click()}
            disabled={subiendo}
          >
            {subiendo ? 'Subiendo…' : '+ Subir archivo'}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-700 mb-2">{error}</p>}

      {(!paciente.documentos || paciente.documentos.length === 0) ? (
        <p className="text-sm text-ink/50">Todavía no hay documentos.</p>
      ) : (
        <ul className="space-y-2">
          {paciente.documentos.map((doc) => (
            <li key={doc.id} className="text-sm">
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                {doc.nombre}
              </a>
              <span className="text-xs text-ink/40 ml-2">{doc.subidoEn?.slice(0, 10)}</span>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-ink/40 mt-3">Tamaño máximo por archivo: 4.5 MB.</p>
    </section>
  );
}

function FichaClinica({ paciente, onGuardado }) {
  const [form, setForm] = useState({
    motivoConsulta: paciente.motivoConsulta || '',
    diagnostico: paciente.diagnostico || '',
    objetivosTratamiento: paciente.objetivosTratamiento || '',
    estado: paciente.estado || 'activo',
  });
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
    setGuardado(false);
  }

  async function guardar() {
    setGuardando(true);
    const res = await fetch(`/api/patients/${paciente.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setGuardando(false);
    if (res.ok) {
      setGuardado(true);
      onGuardado();
    }
  }

  return (
    <section className="card p-5 mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg">Ficha clínica</h2>
        <select
          className="input w-auto text-sm"
          value={form.estado}
          onChange={(e) => actualizar('estado', e.target.value)}
        >
          <option value="activo">Activo</option>
          <option value="alta">De alta</option>
        </select>
      </div>

      <div>
        <label className="field-label block mb-1">Motivo de consulta</label>
        <textarea
          className="input"
          rows={2}
          value={form.motivoConsulta}
          onChange={(e) => actualizar('motivoConsulta', e.target.value)}
        />
      </div>

      <div>
        <label className="field-label block mb-1">Diagnóstico</label>
        <input
          className="input"
          value={form.diagnostico}
          onChange={(e) => actualizar('diagnostico', e.target.value)}
        />
      </div>

      <div>
        <label className="field-label block mb-1">Objetivos del tratamiento</label>
        <textarea
          className="input"
          rows={2}
          value={form.objetivosTratamiento}
          onChange={(e) => actualizar('objetivosTratamiento', e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="btn-secondary" onClick={guardar} disabled={guardando}>
          {guardando ? 'Guardando…' : 'Guardar ficha'}
        </button>
        {guardado && <span className="text-sm text-primary">Guardado.</span>}
      </div>
    </section>
  );
}

function NuevaSesionForm({ pacienteId, onGuardado }) {
  const [abierto, setAbierto] = useState(false);
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    enfoque: '',
    notaClinica: '',
    notaPrivada: '',
  });
  const [enviando, setEnviando] = useState(false);

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setEnviando(true);
    const res = await fetch(`/api/patients/${pacienteId}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setEnviando(false);
    if (res.ok) {
      setForm({ fecha: new Date().toISOString().slice(0, 10), enfoque: '', notaClinica: '', notaPrivada: '' });
      setAbierto(false);
      onGuardado();
    }
  }

  if (!abierto) {
    return (
      <button className="btn-primary mb-8" onClick={() => setAbierto(true)}>
        + Registrar sesión
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-8 space-y-4">
      <h2 className="font-serif text-lg">Nueva sesión</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label block mb-1">Fecha</label>
          <input
            type="date"
            className="input"
            value={form.fecha}
            onChange={(e) => actualizar('fecha', e.target.value)}
          />
        </div>
        <div>
          <label className="field-label block mb-1">Enfoque</label>
          <input
            className="input"
            placeholder="p. ej. cognitivo-conductual"
            value={form.enfoque}
            onChange={(e) => actualizar('enfoque', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="field-label block mb-1">Nota clínica (parte formal del expediente)</label>
        <textarea
          className="input"
          rows={3}
          value={form.notaClinica}
          onChange={(e) => actualizar('notaClinica', e.target.value)}
        />
      </div>

      <div>
        <label className="field-label block mb-1 text-privado">
          🔒 Nota privada (uso exclusivo del profesional, no se comparte con el paciente)
        </label>
        <textarea
          className="input"
          rows={3}
          value={form.notaPrivada}
          onChange={(e) => actualizar('notaPrivada', e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar sesión'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => setAbierto(false)}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
