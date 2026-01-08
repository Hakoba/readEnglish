import { createApp } from 'vue'
import App from './views/App.vue'
import vuetify from '@/plugins/vuetify'
import vuetifyStyles from 'vuetify/styles?inline'
import mdiStyles from '@mdi/font/css/materialdesignicons.css?inline'

console.log('[CRXJS] Hello world from content script!')

/**
 * Mount the Vue app to the DOM using Shadow DOM for style isolation.
 */
function mountApp(): void {
  const container = document.createElement('div')
  container.id = 'crxjs-app-container'
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.left = '0'
  container.style.width = '100%'
  container.style.height = '0'
  container.style.pointerEvents = 'none'
  container.style.zIndex = '2147483647'
  container.style.overflow = 'visible'
  
  // Fix MDI font paths
  const mdiCss = typeof mdiStyles === 'string' ? mdiStyles : ''
  const fixedMdiCss = mdiCss.replace(
    /url\(['"]?([^'"]+)['"]?\)/g,
    (match, path) => {
      if (path.startsWith('data:')) return match
      const absolutePath = new URL(path, chrome.runtime.getURL('node_modules/@mdi/font/css/materialdesignicons.css')).href
      return `url("${absolutePath}")`
    }
  )

  const styleSheet = document.createElement('style')
  styleSheet.textContent = `
    #crxjs-app-container {
      pointer-events: none;
    }
    ${typeof vuetifyStyles === 'string' ? vuetifyStyles : ''}
    ${fixedMdiCss}
    #crxjs-app {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
      pointer-events: none;
      display: block !important;
      background: transparent !important;
    }
    #crxjs-app > * {
      pointer-events: auto;
    }
    .nh-highlighted-word {
      background-color: rgba(242, 186, 228, 0.4);
      border-bottom: 2px solid #8B4513;
      border-radius: 2px;
      cursor: help;
    }
    .nh-llm-highlighted-word {
      background-color: rgba(173, 216, 230, 0.4); /* LightBlue */
      border-bottom: 2px solid #4682B4; /* SteelBlue */
      border-radius: 2px;
      cursor: help;
    }
  `
  document.head.appendChild(styleSheet)

  const appRoot = document.createElement('div')
  appRoot.id = 'crxjs-app'
  
  container.appendChild(appRoot)
  document.body.appendChild(container)
  
  const app = createApp(App)
  app.use(vuetify)
  app.mount(appRoot)
}

mountApp()
