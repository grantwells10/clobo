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
  borderForm: '#D0D5DD',
  backgroundLight: '#FAFBFC',
  overlay: 'rgba(0, 0, 0, 0.5)',
  textSecondary: '#666666',
  accentGold: '#DAA520',
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
  sectionTitleLarge: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
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

  // Forms
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: Colors.borderForm,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.text,
  },
  formTextArea: {
    minHeight: 80,
    paddingTop: 10,
    paddingBottom: 10,
  },
  selectInput: {
    borderWidth: 1,
    borderColor: Colors.borderForm,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  selectInputText: {
    fontSize: 14,
  },

  // Modals
  modalBackdrop: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: '85%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLighter,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  closeButton: {
    fontSize: 24,
    color: Colors.textMuted,
    fontWeight: '600',
  },

  // Dropdowns
  dropdown: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.borderForm,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLightest,
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.text,
  },
  checkmark: {
    fontSize: 16,
    color: Colors.accentDark,
    fontWeight: '600',
  },

  // Buttons (additional variants)
  buttonPrimary: {
    backgroundColor: Colors.accentDark,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonPrimaryText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonSecondaryText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },

  // Profile specific
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  profileContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
  },
  avatarLarge: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 16,
    backgroundColor: Colors.placeholder,
  },
  titleLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  locationText: {
    fontSize: 16,
    color: Colors.textMutedLight,
    marginBottom: 24,
    textAlign: 'center',
    fontWeight: '500',
  },
  bodyCentered: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 0,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  statContainer: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textMutedLight,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.accentGold,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabText: {
    fontSize: 32,
    color: Colors.background,
    fontWeight: 'bold',
  },
  listingsSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  listingsGrid: {
    gap: 8,
  },
  gridImage: {
    aspectRatio: 1,
    borderRadius: 8,
  },
  uploadArea: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.borderForm,
    borderRadius: 8,
    paddingVertical: 40,
    alignItems: 'center',
    marginVertical: 12,
    backgroundColor: Colors.backgroundLight,
  },
  uploadIcon: {
    fontSize: 32,
    color: Colors.textMuted,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  uploadSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
});

