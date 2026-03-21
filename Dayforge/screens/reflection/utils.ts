import { Mood } from '@/types';

export const moods: { id: Mood; emoji: string; label: string }[] = [
  { id: 'sad', emoji: '😔', label: 'SAD' },
  { id: 'neutral', emoji: '😐', label: 'NEUTRAL' },
  { id: 'good', emoji: '😊', label: 'GOOD' },
  { id: 'happy', emoji: '✨', label: 'HAPPY' },
];

export function moodEmoji(mood: Mood) {
  switch (mood) {
    case 'sad':
      return '😔';
    case 'neutral':
      return '😐';
    case 'good':
      return '😊';
    case 'happy':
      return '✨';
    default:
      return '😊';
  }
}

export function moodSummary(mood: Mood) {
  switch (mood) {
    case 'sad':
      return 'Soft reset day';
    case 'neutral':
      return 'Steady and grounded';
    case 'good':
      return 'Strong forward motion';
    case 'happy':
      return 'Bright and energized';
    default:
      return 'Steady progress';
  }
}

export function moodVisuals(mood: Mood | null) {
  switch (mood) {
    case 'happy':
      return {
        panelColors: ['rgba(255,188,80,0.28)', 'rgba(124,58,237,0.24)', 'rgba(18,8,45,0.8)'],
        orbA: 'rgba(255,190,92,0.35)',
        orbB: 'rgba(160,87,255,0.34)',
        selectedRing: '#f59e0b',
      } as const;
    case 'good':
      return {
        panelColors: ['rgba(154,96,255,0.3)', 'rgba(88,28,255,0.24)', 'rgba(14,8,35,0.82)'],
        orbA: 'rgba(147,88,255,0.34)',
        orbB: 'rgba(99,102,241,0.3)',
        selectedRing: '#a855f7',
      } as const;
    case 'neutral':
      return {
        panelColors: ['rgba(97,120,160,0.25)', 'rgba(62,74,99,0.2)', 'rgba(13,15,30,0.82)'],
        orbA: 'rgba(113,128,150,0.26)',
        orbB: 'rgba(96,111,135,0.24)',
        selectedRing: '#94a3b8',
      } as const;
    case 'sad':
      return {
        panelColors: ['rgba(58,74,111,0.23)', 'rgba(35,47,72,0.2)', 'rgba(7,10,24,0.86)'],
        orbA: 'rgba(82,102,138,0.24)',
        orbB: 'rgba(56,77,113,0.24)',
        selectedRing: '#60a5fa',
      } as const;
    default:
      return {
        panelColors: ['rgba(122,74,255,0.24)', 'rgba(60,33,130,0.2)', 'rgba(12,6,28,0.82)'],
        orbA: 'rgba(125,86,255,0.26)',
        orbB: 'rgba(89,75,189,0.24)',
        selectedRing: '#8b5cf6',
      } as const;
  }
}
