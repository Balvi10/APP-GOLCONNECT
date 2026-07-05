// =============================================================================
//  GolConnect — Utilidad de imágenes
//  Las fotos de la galería de iPhone se guardan en formato HEIC por defecto.
//  El backend (y muchos visores en Android/web) no aceptan HEIC, así que
//  SIEMPRE convertimos a JPEG antes de subir cualquier foto de perfil.
// =============================================================================

import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Convierte una imagen (sin importar su formato original: HEIC, PNG, etc.)
 * a un JPEG válido, y devuelve el objeto listo para adjuntar a un FormData.
 *
 * @param {string} uri - URI local de la imagen (ej: la que devuelve ImagePicker)
 * @param {string} nombreArchivo - nombre del archivo a usar en el FormData
 * @returns {Promise<{ uri: string, type: string, name: string }>}
 */
export async function prepararFotoParaSubir(uri, nombreArchivo = 'foto.jpg') {
  try {
    const resultado = await ImageManipulator.manipulateAsync(
      uri,
      // Redimensionar a un ancho máximo de 1080px: las fotos de un iPhone
      // moderno pueden pesar varios MB incluso en JPEG; para un avatar de
      // perfil no hace falta más resolución, y esto evita superar límites
      // de subida (tanto del backend como de PHP) sin pérdida visible.
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    return {
      uri:  resultado.uri,
      type: 'image/jpeg',
      name: nombreArchivo,
    };
  } catch (err) {
    // Si por algún motivo falla la conversión, devolvemos el original
    // (mejor intentar subir algo que no subir nada)
    return { uri, type: 'image/jpeg', name: nombreArchivo };
  }
}
