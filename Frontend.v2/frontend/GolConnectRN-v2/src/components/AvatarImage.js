import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';
import { urlFoto } from '../api';

/**
 * Avatar con foto real + fallback automático.
 *
 * Problema que resuelve: si la URL de la foto falla (404, red, etc.),
 * <Image> de React Native no dispara ningún fallback visual por sí solo —
 * simplemente queda en blanco (una caja gris vacía), en vez de mostrar el
 * ícono de persona. Este componente escucha el evento onError de <Image>
 * y, si falla, cambia automáticamente al ícono placeholder.
 */
export default function AvatarImage({ fotoPath, size = 56, iconSize, style }) {
  const [fallo, setFallo] = useState(false);

  const fotoUri = urlFoto(fotoPath);
  const mostrarFoto = fotoUri && !fallo;

  return (
    <View
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    >
      {mostrarFoto ? (
        <Image
          source={{ uri: fotoUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          onError={() => setFallo(true)}
        />
      ) : (
        <Icon name="person" size={iconSize ?? Math.round(size * 0.5)} color={colors.onSurfaceVariant} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.surfaceContainerHighest,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});
