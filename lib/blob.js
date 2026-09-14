// lib/blob.js
//
// Helper compartido para subir archivos (fotos, documentos, tests) a
// Vercel Blob, usando las mismas variables BLOB2_* que ya usa lib/db.js
// para guardar el JSON de pacientes.

import { put } from '@vercel/blob';

export const blobOptions = {
  token: process.env.BLOB2_READ_WRITE_TOKEN,
  storeId: process.env.BLOB2_STORE_ID,
};

export async function subirArchivo(pathname, contenido, contentType) {
  const blob = await put(pathname, contenido, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
    ...blobOptions,
  });
  return blob.url;
}
