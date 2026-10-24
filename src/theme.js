import { Platform } from 'react-native';

export const colors = {
  yellow: '#F5B400',
  orange: '#F5A000',
  ink: '#1F2933',
  text: '#2C333A',
  muted: '#8B95A1',
  faint: '#9AA3AF',
  bg: '#F4F6F8',
  canvas: '#E7E9EE',
  card: '#FFFFFF',
  cream: '#FFF4CC',
  dot: '#F5C400',
  mint: '#3DDC97',
  green: '#22C55E',
  danger: '#FF7A7A',
  slate: '#3E4C59',
  heart: '#E23D3D',
  purple: '#6C5CE7',
  flame: '#FF8A34',
  blue: '#5B8DEF',
  line: '#E6E8EC',
  pill: '#F2F3F5',
  avatar: '#D6E6FF',
  avatarIcon: '#2F6BFF',
  stat: '#F4F5F7',
};

export const fonts = {
  regular: 'Nunito_400Regular',
  semibold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extra: 'Nunito_800ExtraBold',
  serif: 'PlayfairDisplay_700Bold',
};

export const cardShadow = Platform.select({
  web: {
    boxShadow: '0 8px 24px rgba(31, 41, 51, 0.08)',
  },
  default: {
    shadowColor: '#1F2933',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
});
