import React, { useState } from 'react';
import { View, Image, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import Icon from './Icon';
import { colors } from '../theme';
import { urlFoto } from '../api';

export interface AvatarImageProps {
  fotoPath?: string | null;
  size?: number;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}


export default function AvatarImage({ fotoPath, size = 56, iconSize, style }: AvatarImageProps) {
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
          source={{ uri: fotoUri as string }}
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
