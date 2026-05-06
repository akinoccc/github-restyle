import './theme-contributions';
import { getDefaultThemeId, isThemeId, type ThemeId } from './themes';

export interface StorageSchema {
  selectedThemeId: ThemeId;
  enabled: boolean;
}

const STORAGE_DEFAULTS: StorageSchema = {
  selectedThemeId: getDefaultThemeId(),
  enabled: true,
};

const STORAGE_KEYS = ['selectedThemeId', 'enabled'] as const;

export async function getSettings(): Promise<StorageSchema> {
  const result = await chrome.storage.sync.get(STORAGE_KEYS);

  return {
    selectedThemeId: isThemeId(result.selectedThemeId)
      ? result.selectedThemeId
      : STORAGE_DEFAULTS.selectedThemeId,
    enabled:
      typeof result.enabled === 'boolean'
        ? result.enabled
        : STORAGE_DEFAULTS.enabled,
  };
}

export async function updateSettings(settings: Partial<StorageSchema>): Promise<void> {
  await chrome.storage.sync.set(settings);
}

export function onSettingsChanged(callback: (settings: StorageSchema) => void): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ): void => {
    if (areaName !== 'sync') {
      return;
    }

    if (!STORAGE_KEYS.some((key) => key in changes)) {
      return;
    }

    void getSettings().then(callback);
  };

  chrome.storage.onChanged.addListener(listener);

  return () => chrome.storage.onChanged.removeListener(listener);
}
