// Maps a tailwind color name to a set of utility classes for consistent subject coloring
const COLOR_MAP: Record<string, { bg: string; bgLight: string; text: string; border: string; dot: string; gradient: string }> = {
  blue: { bg: 'bg-blue-500', bgLight: 'bg-blue-50 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600' },
  green: { bg: 'bg-green-500', bgLight: 'bg-green-50 dark:bg-green-900/30', text: 'text-green-600 dark:text-green-300', border: 'border-green-200 dark:border-green-800', dot: 'bg-green-500', gradient: 'from-green-400 to-green-600' },
  orange: { bg: 'bg-orange-500', bgLight: 'bg-orange-50 dark:bg-orange-900/30', text: 'text-orange-600 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800', dot: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600' },
  purple: { bg: 'bg-purple-500', bgLight: 'bg-purple-50 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600' },
  pink: { bg: 'bg-pink-500', bgLight: 'bg-pink-50 dark:bg-pink-900/30', text: 'text-pink-600 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800', dot: 'bg-pink-500', gradient: 'from-pink-400 to-pink-600' },
  cyan: { bg: 'bg-cyan-500', bgLight: 'bg-cyan-50 dark:bg-cyan-900/30', text: 'text-cyan-600 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800', dot: 'bg-cyan-500', gradient: 'from-cyan-400 to-cyan-600' },
  amber: { bg: 'bg-amber-500', bgLight: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500', gradient: 'from-amber-400 to-amber-600' },
  red: { bg: 'bg-red-500', bgLight: 'bg-red-50 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-300', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500', gradient: 'from-red-400 to-red-600' },
  teal: { bg: 'bg-teal-500', bgLight: 'bg-teal-50 dark:bg-teal-900/30', text: 'text-teal-600 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800', dot: 'bg-teal-500', gradient: 'from-teal-400 to-teal-600' },
  indigo: { bg: 'bg-indigo-500', bgLight: 'bg-indigo-50 dark:bg-indigo-900/30', text: 'text-indigo-600 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800', dot: 'bg-indigo-500', gradient: 'from-indigo-400 to-indigo-600' },
};

export function getSubjectColor(color: string) {
  return COLOR_MAP[color] || COLOR_MAP.blue;
}

export const AVAILABLE_COLORS = ['blue', 'green', 'orange', 'purple', 'pink', 'cyan', 'amber', 'red', 'teal', 'indigo'];

import type { Subject } from '@/lib/types';

export function getSubjectById(subjects: Subject[], id?: string): Subject | undefined {
  if (!id) return undefined;
  return subjects.find((s) => s.id === id);
}

export function getSubjectName(subjects: Subject[], id?: string): string {
  return getSubjectById(subjects, id)?.name || 'General';
}
