

import * as ImageManipulator from 'expo-image-manipulator';

export interface ArchivoParaSubir {
  uri: string;
  type: string;
  name: string;
}

/**
 * Convierte una imagen (sin importar su formato original: HEIC, PNG, etc.)
 * a un JPEG válido, y devuelve el objeto listo para adjuntar a un FormData.
 */
export async function prepararFotoParaSubir(
  uri: string,
  nombreArchivo: string = 'foto.jpg',
): Promise<ArchivoParaSubir> {
  try {
    const resultado = await ImageManipulator.manipulateAsync(
      uri,
      
      [{ resize: { width: 1080 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
    );
    return {
      uri: resultado.uri,
      type: 'image/jpeg',
      name: nombreArchivo,
    };
  } catch (err) {
    // Si por algún motivo falla la conversión, devolvemos el original
    // (mejor intentar subir algo que no subir nada)
    return { uri, type: 'image/jpeg', name: nombreArchivo };
  }
}
