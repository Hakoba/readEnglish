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
  
  // Inject Vuetify and MDI styles into document head since we're not using Shadow DOM
  const styleSheet = document.createElement('style')
  
  // Fix MDI font paths
  const mdiCss = typeof mdiStyles === 'string' ? mdiStyles : ''
  const fixedMdiCss = mdiCss.replace(
    /url\(['"]?([^'"]+)['"]?\)/g,
    (match, path) => {
      if (path.startsWith('data:')) return match
      // Resolve relative path to absolute chrome-extension:// URL
      const absolutePath = new URL(path, chrome.runtime.getURL('node_modules/@mdi/font/css/materialdesignicons.css')).href
      return `url("${absolutePath}")`
    }
  )

  styleSheet.textContent = `
    ${typeof vuetifyStyles === 'string' ? vuetifyStyles : ''}
    ${fixedMdiCss}
    #crxjs-app-container {
      overflow: visible;
    }
    #crxjs-app {
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif;
      pointer-events: none;
      display: block !important;
      overflow: visible;
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
