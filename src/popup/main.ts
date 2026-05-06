import { getSettings, updateSettings } from '../shared/storage';
import { getThemeById, getThemes, type ThemeId } from '../shared/themes';
import './styles.css';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Popup root was not found.');
}

const appRoot = app;

function createThemeOption(selectedThemeId: ThemeId, themeId: ThemeId): HTMLLabelElement {
  const theme = getThemeById(themeId);

  const label = document.createElement('label');
  label.className = 'theme-option';

  const input = document.createElement('input');
  input.type = 'radio';
  input.name = 'theme';
  input.value = theme.id;
  input.checked = selectedThemeId === theme.id;
  input.addEventListener('change', () => {
    if (input.checked) {
      void updateSettings({ selectedThemeId: theme.id });
    }
  });

  const text = document.createElement('span');
  text.className = 'theme-option__text';

  const name = document.createElement('strong');
  name.textContent = theme.name;

  const description = document.createElement('small');
  description.textContent = theme.description;

  text.append(name, description);
  label.append(input, text);

  return label;
}

async function render(): Promise<void> {
  const settings = await getSettings();

  appRoot.replaceChildren();

  const shell = document.createElement('section');
  shell.className = 'popup-shell';

  const header = document.createElement('header');
  header.className = 'popup-header';

  const title = document.createElement('h1');
  title.textContent = 'GitHub Restyle';

  const status = document.createElement('span');
  status.className = settings.enabled ? 'status status--on' : 'status';
  status.textContent = settings.enabled ? 'On' : 'Off';

  header.append(title, status);

  const toggleRow = document.createElement('label');
  toggleRow.className = 'toggle-row';

  const toggleText = document.createElement('span');
  toggleText.textContent = 'Enable skin';

  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.checked = settings.enabled;
  toggle.addEventListener('change', () => {
    void updateSettings({ enabled: toggle.checked }).then(render);
  });

  toggleRow.append(toggleText, toggle);

  const themeList = document.createElement('div');
  themeList.className = 'theme-list';

  getThemes().forEach((theme) => {
    themeList.append(createThemeOption(settings.selectedThemeId, theme.id));
  });

  shell.append(header, toggleRow, themeList);
  appRoot.append(shell);
}

void render();
