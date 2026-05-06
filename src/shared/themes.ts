export type ThemeId = string;

export interface ThemeDefinition {
  id: ThemeId;
  name: string;
  description: string;
  className: string;
  cssEntry: string;
  enabledByDefault?: boolean;
  contributor?: string;
}

export type ThemeInput = Omit<ThemeDefinition, 'className'> & {
  className?: string;
};

const THEME_ID_PATTERN = /^[a-z][a-z0-9-]*$/;
const themeRegistry = new Map<ThemeId, ThemeDefinition>();

function buildThemeClassName(themeId: ThemeId): string {
  return `github-restyle-theme-${themeId}`;
}

export function defineTheme(theme: ThemeInput): ThemeDefinition {
  return {
    ...theme,
    className: theme.className ?? buildThemeClassName(theme.id),
  };
}

export function registerTheme(theme: ThemeInput): ThemeDefinition {
  if (!THEME_ID_PATTERN.test(theme.id)) {
    throw new Error(`Invalid theme id: ${theme.id}`);
  }

  if (!theme.name.trim()) {
    throw new Error(`Theme ${theme.id} must have a name.`);
  }

  const definition = defineTheme(theme);

  if (themeRegistry.has(definition.id)) {
    throw new Error(`Duplicate theme id: ${definition.id}`);
  }

  themeRegistry.set(definition.id, definition);

  return definition;
}

export function registerThemes(themes: ThemeInput[]): ThemeDefinition[] {
  return themes.map(registerTheme);
}

registerThemes([
  defineTheme({
    id: 'github-default',
    name: 'GitHub Default',
    description: 'Keep GitHub clean and original.',
    className: 'github-restyle-theme-default',
    cssEntry: 'none',
    enabledByDefault: false,
  }),
  defineTheme({
    id: 'vivid-light',
    name: 'Vivid Light',
    description: 'Sticker-like colors, bouncy controls, and playful badges.',
    cssEntry: 'vivid-light',
    enabledByDefault: true,
  }),
]);

export function getThemes(): ThemeDefinition[] {
  return Array.from(themeRegistry.values());
}

export function getDefaultThemeId(): ThemeId {
  return getThemes().find((theme) => theme.enabledByDefault)?.id ?? 'vivid-light';
}

export const DEFAULT_THEME_ID: ThemeId = getDefaultThemeId();

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && themeRegistry.has(value);
}

export function getThemeById(themeId: ThemeId): ThemeDefinition {
  return themeRegistry.get(themeId) ?? getThemeById(getDefaultThemeId());
}

export function getThemeClassNames(): string[] {
  return getThemes().map((theme) => theme.className);
}
