import type { AppData, Settings } from './types';
import { defaultData } from './sampleData';

const STORAGE_KEY = 'studyflow_data_v1';

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = defaultData();
      saveData(data);
      return data;
    }
    const parsed = JSON.parse(raw) as AppData;
    // Merge settings to handle new fields
    parsed.settings = { ...defaultSettings(), ...parsed.settings };
    return parsed;
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data', e);
  }
}

export function clearData(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function defaultSettings(): Settings {
  return {
    studentName: 'Nayana',
    collegeName: '',
    course: 'Computer Science Engineering',
    semester: '3rd Year',
    theme: 'light',
    startOfWeek: 1,
    timeFormat: '12h',
    notificationsEnabled: true,
    pomodoroStudy: 25,
    pomodoroBreak: 5,
  };
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}
