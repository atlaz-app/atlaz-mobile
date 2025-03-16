import { Href } from 'expo-router';

function createHrefObject<T extends Record<string, string>>(
  obj: T,
): {
  [K in keyof T]: Href<string>;
} {
  return obj as any;
}

const rawScreenPath = {
  Auth: '(auth)',
  AuthLogin: '(auth)/login',
  AuthRegistration: '(auth)/registration',

  Dashboard: '(dashboard)',
  DashboardTracker: '(dashboard)/tracker',
  DashboardTrackerPreset: '(dashboard)/tracker/preset',
  DashboardTrackerPresetSaved: '(dashboard)/tracker/preset/saved',
  DashboardTrackerPresetNew: '(dashboard)/tracker/preset/new',
  DashboardTrackerMonitor: '(dashboard)/tracker/monitor',

  DashboardExplorer: '(dashboard)/explorer',
  DashboardStats: '(dashboard)/stats',
  DashboardProfile: '(dashboard)/profile',
} as const;

export const ScreenPath = createHrefObject(rawScreenPath);
