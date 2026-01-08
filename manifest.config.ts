import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
  manifest_version: 3,
  name: pkg.name,
  version: pkg.version,
  permissions: ['storage', 'scripting', 'tabs'],
  icons: {
    48: 'public/logo.png',
  },
  action: {
    default_icon: {
      48: 'public/logo.png',
    },
    default_popup: 'src/popup/index.html',
  },
  content_scripts: [{
    js: ['src/content/main.ts'],
    matches: ['https://novelbin.com/*'],
  }],
  web_accessible_resources: [
    {
      resources: [
        'src/assets/*.svg',
        'public/*.png',
        'node_modules/@mdi/font/fonts/*'
      ],
      matches: ['<all_urls>'],
    },
  ],
})
