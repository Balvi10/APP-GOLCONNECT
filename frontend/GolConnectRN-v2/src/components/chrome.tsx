import React, { type ReactNode } from 'react';
import { View, Text, Pressable, Modal as RNModal, StyleSheet } from 'react-native';
import { colors, fonts, type } from '../theme';
import Icon from './Icon';

/* ── TopBar: barra superior con logo GOLCONNECT, back opcional y acción derecha ── */
export interface TopBarProps {
  onBack?: () => void;
  right?: ReactNode;
  title?: string;
}

export function TopBar({ onBack, right, title = 'GOLCONNECT' }: TopBarProps) {
  return (
    <View style={styles.topbar}>
      <View style={{ width: 40, alignItems: 'flex-start' }}>
        {!!onBack && (
          <Pressable onPress={onBack} hitSlop={8} style={styles.iconBtn}>
            <Icon name="arrow_back" size={24} color={colors.primaryFixed} />
          </Pressable>
        )}
      </View>
      <Text style={styles.logo}>{title}</Text>
      <View style={{ width: 40, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
}

/* ── BottomNav: navegación inferior. variant 'jugador' | 'reclutador'. ── */
interface Tab {
  key: string;
  icon: string;
  label: string;
}

const PLAYER_TABS: Tab[] = [
  { key: 'inicio', icon: 'home', label: 'Inicio' },
  { key: 'search', icon: 'search', label: 'Buscar' },
  { key: 'postulaciones', icon: 'description', label: 'Postulaciones' },
  { key: 'profile', icon: 'person', label: 'Perfil' },
];
const RECRUITER_TABS: Tab[] = [
  { key: 'inicio-reclutador', icon: 'home', label: 'Inicio' },
  { key: 'buscar-reclutador', icon: 'search', label: 'Buscar' },
  { key: 'mis-jugadores-reclutador', icon: 'sports_soccer', label: 'Mis Jugadores' },
  { key: 'perfil-reclutador', icon: 'account_circle', label: 'Perfil' },
];

export interface BottomNavProps {
  active: string;
  onNavigate: (key: string) => void;
  variant?: 'jugador' | 'reclutador';
}

export function BottomNav({ active, onNavigate, variant = 'jugador' }: BottomNavProps) {
  const tabs = variant === 'reclutador' ? RECRUITER_TABS : PLAYER_TABS;
  return (
    <View style={styles.bottomNav}>
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <Pressable
            key={t.key}
            onPress={() => onNavigate(t.key)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Icon name={t.icon} size={24} color={isActive ? colors.onPrimaryFixed : colors.onSurfaceVariant} />
            <Text style={[styles.tabLabel, { color: isActive ? colors.onPrimaryFixed : colors.onSurfaceVariant }]}>
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ── Modal: overlay centrado reutilizable ── */
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  children?: ReactNode;
  maxWidth?: number;
}

export function Modal({ visible, onClose, children, maxWidth = 420 }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalCard, { maxWidth }]} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
    backgroundColor: colors.background,
  },
  logo: {
    fontFamily: fonts.oswaldBold,
    fontSize: 22,
    color: colors.primaryFixed,
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    paddingBottom: 20,
    paddingHorizontal: 8,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
  tab: { alignItems: 'center', gap: 2, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999 },
  tabActive: { backgroundColor: colors.primaryContainer },
  tabLabel: { fontFamily: fonts.interBold, fontSize: 10, letterSpacing: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surfaceContainerHigh,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: 16,
    padding: 24,
  },
});

export default TopBar;
