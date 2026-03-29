export interface DyslexAISettings {
  lensMode: {
    enabled: boolean;
    font: "system" | "OpenDyslexic" | "Arial" | "Verdana";
    letterSpacing: number;
    wordSpacing: number;
    lineHeight: number;
    overlayColor: string | null;
    highlightNumbers: boolean;
    numberHighlightColor: string;
  };
  coachMode: {
    enabled: boolean;
    aggressiveness: "gentle" | "balanced" | "thorough";
    apiKey: string;
  };
  blockedDomains: string[];
  onboardingComplete: boolean;
}

export const DEFAULT_SETTINGS: DyslexAISettings = {
  lensMode: {
    enabled: false,
    font: "system",
    letterSpacing: 0,      // 0 = don't override page default
    wordSpacing: 0,        // 0 = don't override page default
    lineHeight: 0,         // 0 = don't override page default
    overlayColor: null,
    highlightNumbers: true,
    numberHighlightColor: "#ffe066",
  },
  coachMode: {
    enabled: false,
    aggressiveness: "balanced",
    apiKey: "",
  },
  blockedDomains: [],
  onboardingComplete: false,
};

export async function getSettings(): Promise<DyslexAISettings> {
  return new Promise((resolve) => {
    chrome.storage.sync.get("dyslexai_settings", (result) => {
      if (result.dyslexai_settings) {
        resolve({ ...DEFAULT_SETTINGS, ...result.dyslexai_settings });
      } else {
        resolve(DEFAULT_SETTINGS);
      }
    });
  });
}

export async function saveSettings(settings: DyslexAISettings): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.set({ dyslexai_settings: settings }, resolve);
  });
}

export async function updateSettings(
  partial: Partial<DyslexAISettings>
): Promise<DyslexAISettings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await saveSettings(updated);
  return updated;
}

export function getApiKey(settings: DyslexAISettings): string {
  return settings.coachMode.apiKey;
}
