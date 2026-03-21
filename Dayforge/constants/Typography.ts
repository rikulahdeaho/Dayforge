export const Fonts = {
  body: 'Inter',
  heading: 'Manrope',
  mono: 'SpaceMono',
} as const;

export const Type = {
  screenTitle: {
    fontFamily: Fonts.heading,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '800',
  },
  screenTitleCompact: {
    fontFamily: Fonts.heading,
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '700',
  },
  heroTitle: {
    fontFamily: Fonts.heading,
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '700',
  },
  dateMeta: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  metaStrong: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  promptLabel: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  bodySmall: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  bodyStrong: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
  },
  value: {
    fontFamily: Fonts.heading,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700',
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  action: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: 0.35,
  },
} as const;
