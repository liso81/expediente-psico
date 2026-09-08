# Expediente — gestión de historiales para consulta psicológica

App mínima (MVP) para llevar el expediente clínico de una consulta individual:
ficha del paciente, notas de sesión separadas de las notas privadas del
terapeuta, y acceso protegido por clave. Hecha con Next.js y almacenamiento
en un archivo JSON.

## Qué incluye

- **Login** con una sola clave (variable `APP_PASSWORD`), pensado para un
  profesional que trabaja solo/a.
- **Ficha clínica** por paciente: motivo de consulta, diagnóstico, objetivos
  del tratamiento, estado (activo / de alta).
- **Historial de sesiones**: cada sesión tiene fecha, enfoque terapéutico,
  una nota clínica (parte formal del expediente) y una nota privada
  separada, visible solo tras pulsar "Ver nota privada" — como recomienda
  la práctica habitual de diferenciar el expediente formal de las notas de
  trabajo del terapeuta.
- Todo el texto y los campos están en español, adaptados al vocabulario de
  la consulta (expediente, ficha, sesión, enfoque).

## Instalación y uso en Termux

```bash
pkg install nodejs git -y
git clone <tu-repositorio>   # o copia esta carpeta al teléfono
cd expediente-psico
npm install
cp .env.example .env.local
# edita .env.local y pon tu propia clave en APP_PASSWORD
npm run dev
```

Abre `http://localhost:3000` en el navegador del teléfono. En Termux,
`npm run dev` deja el servidor corriendo en primer plano; puedes usar
`termux-wake-lock` para que no se apague la pantalla y corte el proceso.

Los datos se guardan en `data/db.json`, dentro de la misma carpeta del
proyecto — es un archivo de texto plano que puedes respaldar copiándolo
(por ejemplo a Google Drive o Syncthing) igual que harías con cualquier
otro documento sensible.

## Despliegue en Vercel — limitación importante

Vercel ejecuta las rutas de la API como funciones "serverless": su sistema
de archivos es de solo lectura en producción (salvo la carpeta `/tmp`, que
se borra entre invocaciones). Esto quiere decir que, tal cual está, **si
despliegas esta app en Vercel los datos guardados en `data/db.json` no son
fiables entre visitas** — pueden desaparecer en cualquier momento.

Toda la lógica de guardado está aislada en un único archivo,
`lib/db.js`, precisamente para que este límite sea fácil de resolver más
adelante sin tocar el resto de la app. Cuando quieras desplegar en serio,
las dos opciones más simples son:

1. **Vercel Blob** (`@vercel/blob`): sigue guardando todo como un único
   JSON, pero en un almacenamiento persistente de Vercel en vez del disco
   local. Es el cambio más parecido a lo que ya tienes.
2. **Una base de datos** (Vercel Postgres, Supabase, etc.): más trabajo de
   migración, pero es lo recomendable si la consulta crece o si en algún
   momento hay más de un terapeuta usando la app.

Mientras tanto, para uso real de un solo profesional, correr la app en
Termux (o en cualquier servidor propio con disco persistente) es la opción
más simple y ya cumple con lo que necesitas.

## Sobre la privacidad y la normativa

Esta app es un punto de partida funcional, no un producto certificado.
Antes de usarla con pacientes reales, ten en cuenta:

- Cambia `APP_PASSWORD` y `SESSION_SECRET` por valores propios y no los
  compartas ni los subas a un repositorio público.
- Si subes el código a GitHub, agrega `data/db.json` a los archivos
  ignorados (ya está en `.gitignore`) para no publicar datos de pacientes.
- La normativa de protección de datos de salud mental (RGPD en España,
  NOM-004/LFPDPPP en México, o la que aplique en tu país) exige cifrado de
  datos sensibles, consentimiento informado documentado y control de
  acceso — esta app cubre el consentimiento y una clave de acceso básica,
  pero no cifra el archivo JSON en disco. Si vas a manejar datos clínicos
  reales de forma continuada, vale la pena migrar a una base de datos con
  cifrado en reposo.

## Estructura del proyecto

```
app/
  login/            página de acceso
  dashboard/        listado y alta de pacientes
  patients/[id]/    ficha clínica + historial de sesiones
  api/              rutas de backend (login, pacientes, sesiones)
lib/
  db.js             toda la lectura/escritura de datos (JSON)
  auth.js           lógica de la clave de acceso
data/
  db.json           los datos en sí
```
