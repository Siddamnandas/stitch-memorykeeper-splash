type ClassValue = string | false | null | undefined;

export const cn = (...classes: ClassValue[]): string => classes.filter(Boolean).join(' ');

export const ui = {
  shell: 'mk-shell font-display text-ink dark:text-ink',
  shellInner: 'mk-shell__inner',
  card: 'mk-card rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-surface-muted backdrop-blur-sm border border-border/60 shadow-soft',
  cardMuted: 'mk-card-muted rounded-2xl bg-gradient-to-br from-surface-muted/80 to-surface backdrop-blur-sm border border-border/60 shadow-soft',
  cardTonal: 'mk-card-tonal rounded-2xl bg-gradient-to-br from-primary-muted/40 to-surface backdrop-blur-sm border border-border/60 shadow-soft',
  section: 'mk-section',
  sectionHeader: 'mk-section__header',
  sectionTitle: 'mk-section__title text-2xl font-extrabold',
  divider: 'mk-divider',
  chip: 'mk-chip rounded-full',
  primaryButton: 'mk-button-primary rounded-2xl font-bold text-lg shadow-soft hover:shadow-ring transition-all',
  secondaryButton: 'mk-button-secondary rounded-2xl font-bold text-lg shadow-soft hover:shadow-ring transition-all',
  ghostButton: 'mk-button-ghost rounded-2xl font-bold text-lg transition-all',
  iconButton: 'mk-icon-button rounded-2xl',
};

export const gradients = {
  sunrise: 'bg-gradient-to-br from-primary to-primary-strong',
  twilight: 'bg-gradient-to-r from-accent/80 to-primary/80',
};

export const softText = 'text-ink-muted';

// New design utilities for the updated visual style
export const visualDesign = {
  roundedElements: 'rounded-2xl',
  backdropBlur: 'backdrop-blur-sm',
  cardShadow: 'shadow-soft',
  cardBorder: 'border border-border/60',
  gradientBackground: 'bg-gradient-to-br from-primary/15 via-primary/5 to-surface-muted',
};
