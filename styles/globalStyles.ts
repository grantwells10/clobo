import { StyleSheet } from 'react-native';

// Shared color palette
export const Colors = {
  background: '#ffffff',
  text: '#11181C',
  textMuted: '#687076',
  textMutedLight: '#999999',
  accent: '#D4AF37',
  accentDark: '#550000',
  border: '#C7CBD1',
  borderLight: '#E1E4E8',
  borderLighter: '#E6E8EB',
  borderLightest: '#F0F2F4',
  goldBackground: '#FFF9E8',
  goldBackgroundLight: '#FFF1C2',
  placeholder: '#EEEEEE',
  placeholderLight: '#F6F6F6',
} as const;

// Shared component styles
export const globalStyles = StyleSheet.create({
  // Screen containers
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Headers
  header: {
    fontSize: 24,
    color: Colors.text,
    fontFamily: 'Raleway_500Medium',
  },
  headerBold: {
    fontSize: 24,
    color: Colors.text,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    color: Colors.text,
    fontFamily: 'Raleway_700Bold',
    marginBottom: 8,
  },
  sectionTitleSmall: {
    fontSize: 14,
    color: Colors.textMuted,
    fontWeight: '700',
    marginBottom: 8,
  },

  // Cards
  card: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLightest,
  },
  cardLarge: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLighter,
  },

  // Text
  text: {
    color: Colors.text,
  },
  textMuted: {
    color: Colors.textMuted,
  },
  textMutedLight: {
    color: Colors.textMutedLight,
  },
  body: {
    color: Colors.text,
    lineHeight: 22,
  },

  // Buttons
  button: {
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.accentDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.background,
    fontFamily: 'Raleway_500Medium',
    fontSize: 16,
  },
  buttonOutline: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  buttonGoldOutline: {
    backgroundColor: Colors.background,
    borderColor: Colors.accent,
  },
  buttonTextGold: {
    color: Colors.accent,
    fontWeight: '700',
  },

  // Chips/Pills
  chip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  chipActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.goldBackground,
  },
  chipText: {
    color: Colors.text,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillApproved: {
    backgroundColor: Colors.accentDark,
  },
  pillRequested: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillText: {
    fontWeight: '700',
  },
  pillTextLight: {
    color: Colors.background,
  },
  pillTextDark: {
    color: Colors.textMuted,
  },

  // Avatars
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.placeholder,
  },
  avatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.placeholder,
    marginRight: 8,
  },

  // Images
  imagePlaceholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: Colors.placeholder,
  },
  thumbnail: {
    width: 72,
    height: 72,
    borderRadius: 8,
    backgroundColor: Colors.placeholder,
    marginRight: 12,
  },

  // Layout helpers
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyText: {
    color: Colors.textMutedLight,
    padding: 12,
  },
});

