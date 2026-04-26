import { ViewStyle } from 'react-native';

export const colors = {
  bg: '#080C18',
  card: '#0F1528',
  cardSm: '#0F1528',
  border: '#1A2240',
  text: '#E2E6F3',
  textMuted: '#94A3C0',
  textSub: '#4A5580',
  gain: '#00D09C',
  loss: '#FF4466',
  amber: '#F59E0B',
  blue: '#6398FF',
  gainBg: 'rgba(0,208,156,0.12)',
  lossBg: 'rgba(255,68,102,0.12)',
  amberBg: 'rgba(245,158,11,0.12)',
  blueBg: 'rgba(99,152,255,0.12)',
  headerBg: '#0B101F',
  activeTabBg: '#1A2647',
  modalOverlay: 'rgba(8,12,24,0.85)',
  modalContent: '#0D1125',
};

export const globalStyles = {
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  } as ViewStyle,
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 14,
  } as ViewStyle,
  cardSm: {
    backgroundColor: colors.cardSm,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
  } as ViewStyle,
};
