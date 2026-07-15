import React, { type ReactNode } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
  type KeyboardTypeOptions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts, type } from '../theme';
import Icon from './Icon';

/* ── Screen: contenedor base con fondo oscuro + safe area + scroll opcional ── */
export interface ScreenProps {
  children?: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function Screen({ children, scroll = true, style, contentStyle }: ScreenProps) {
  const Body = scroll ? ScrollView : View;
  const bodyProps = scroll
    ? { contentContainerStyle: [{ paddingBottom: 40 }, contentStyle], showsVerticalScrollIndicator: false }
    : { style: [{ flex: 1 }, contentStyle] };
  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'left', 'right']}>
      <Body {...(bodyProps as any)}>{children}</Body>
    </SafeAreaView>
  );
}

/* ── PrimaryButton: CTA lima sólido ── */
export interface PrimaryButtonProps {
  label?: string;
  onPress?: () => void;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
}

export function PrimaryButton({ label, onPress, icon, style, textStyle, disabled }: PrimaryButtonProps) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.primaryBtn,
        disabled && { opacity: 0.6 },
        pressed && !disabled && { transform: [{ scale: 0.98 }] },
        style,
      ] as StyleProp<ViewStyle>}
    >
      {!!label && <Text style={[styles.primaryBtnText, textStyle]}>{label}</Text>}
      {!!icon && <Icon name={icon} size={18} color={colors.onPrimaryFixed} />}
    </Pressable>
  );
}

/* ── OutlineButton: borde claro, fondo transparente ── */
export interface OutlineButtonProps {
  label?: string;
  onPress?: () => void;
  icon?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  color?: string;
}

export function OutlineButton({ label, onPress, icon, style, textStyle, color = colors.primary }: OutlineButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.outlineBtn,
        { borderColor: color },
        pressed && { opacity: 0.7 },
        style,
      ] as StyleProp<ViewStyle>}
    >
      {!!label && <Text style={[styles.outlineBtnText, { color }, textStyle]}>{label}</Text>}
      {!!icon && <Icon name={icon} size={18} color={color} />}
    </Pressable>
  );
}

/* ── Field: label + input controlado, con icono opcional a izquierda/derecha ── */
export interface FieldProps {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  keyboardType?: KeyboardTypeOptions;
  style?: StyleProp<ViewStyle>;
  multiline?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  leftIcon,
  rightIcon,
  onRightIconPress,
  keyboardType,
  style,
  multiline,
}: FieldProps) {
  return (
    <View style={[{ gap: 6, marginBottom: 16 }, style]}>
      {!!label && <Text style={styles.fieldLabel}>{label}</Text>}
      <View style={styles.fieldWrap}>
        {!!leftIcon && (
          <Icon name={leftIcon} size={20} color={colors.onSurfaceVariant} style={{ marginLeft: 14 }} />
        )}
        <TextInput
          style={[styles.input, leftIcon ? { paddingLeft: 8 } : null]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="rgba(196,201,172,0.5)"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          multiline={multiline}
        />
        {!!rightIcon && (
          <Pressable onPress={onRightIconPress} style={{ paddingHorizontal: 14 }}>
            <Icon name={rightIcon} size={20} color={colors.onSurfaceVariant} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

/* ── Card: superficie con borde ── */
export interface CardProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/* ── Badge: etiqueta pequeña ── */
export interface BadgeProps {
  label?: string;
  bg?: string;
  color?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({ label, bg = colors.primaryFixed, color = colors.onPrimaryFixed, style, textStyle }: BadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.badgeText, { color }, textStyle]}>{label}</Text>
    </View>
  );
}

/* ── GlowBackground: reemplazo estático de los "glows" difuminados del web
      (en web seguían el mouse; en mobile son ambientales y fijos). ── */
export function GlowBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[styles.glow, { top: -60, left: -80 }]} />
      <View style={[styles.glow, { bottom: -40, right: -80, width: 320, height: 320 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  primaryBtn: {
    backgroundColor: colors.primaryFixed,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    ...type.labelBold,
    color: colors.onPrimaryFixed,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  outlineBtn: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
  },
  outlineBtnText: { ...type.labelBold, textTransform: 'uppercase' },
  fieldLabel: {
    ...type.labelSm,
    color: colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: fonts.interBold,
  },
  fieldWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    color: colors.onSurface,
    fontFamily: fonts.inter,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  card: {
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 12,
    padding: 20,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: fonts.interBold,
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  glow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 999,
    backgroundColor: 'rgba(195,244,0,0.05)',
  },
});

export default Screen;
