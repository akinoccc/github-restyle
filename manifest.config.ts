import type { ManifestV3Export } from '@crxjs/vite-plugin';
import packageJson from './package.json';

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'GitHub Restyle',
  version: packageJson.version,
  description: 'Give GitHub a playful new skin, with theme switching built in.',
  permissions: ['storage'],
  icons: {
    16: 'icons/icon-16.png',
    32: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  action: {
    default_title: 'GitHub Restyle',
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'icons/icon-16.png',
      32: 'icons/icon-32.png',
      48: 'icons/icon-48.png',
      128: 'icons/icon-128.png',
    },
  },
  content_scripts: [
    {
      matches: ['https://github.com/*'],
      js: ['src/content/main.ts'],
      run_at: 'document_start',
    },
  ],
};

export default manifest;
