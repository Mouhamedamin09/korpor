// app/services/notifications.ts

export interface NotificationSettings {
  propertyLaunches: boolean;
  fundLaunches: boolean;
  productUpdates: boolean;
  marketing: boolean;
  investmentUpdates: boolean;
  newsletter: boolean;
  pushNotifications: boolean;
}

// simulate module‐level storage
let _settings: NotificationSettings = {
  propertyLaunches: true,
  fundLaunches: false,
  productUpdates: true,
  marketing: true,
  investmentUpdates: false,
  newsletter: true,
  pushNotifications: true,
};

/**
 * Fetch the current notification settings for this user.
 */
export async function fetchNotificationSettings(
  email: string
): Promise<NotificationSettings> {
  // simulate network delay
  await new Promise((r) => setTimeout(r, 500));
  return { ..._settings };
}

/**
 * Update one or more notification settings for this user.
 * Returns the updated full settings.
 */
export async function updateNotificationSettings(
  email: string,
  changes: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  await new Promise((r) => setTimeout(r, 500));
  _settings = { ..._settings, ...changes };
  return { ..._settings };
}
