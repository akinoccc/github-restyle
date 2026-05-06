import type { ManifestV3Export } from '@crxjs/vite-plugin';
import packageJson from './package.json';

const manifest: ManifestV3Export = {
  manifest_version: 3,
  name: 'GitHub Restyle',
  version: packageJson.version,
  description: 'Give GitHub a playful new skin, with theme switching built in.',
  permissions: ['storage'],
  action: {
    default_title: 'GitHub Restyle',
    default_popup: 'src/popup/index.html',
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
