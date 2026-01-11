
self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from background")

// Proxy fetch requests to avoid CORS issues from content scripts
// We keep payload types minimal and validated without using "as"
chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {

  // Narrow message type
  const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
  if (!isObject(message)) return
  const type = typeof message.type === 'string' ? message.type : ''
  if (type !== 'llm/fetch' && type !== 'translate/fetch') return

  const url = typeof message.url === 'string' ? message.url : ''
  const initRaw = isObject(message.init) ? message.init : undefined
  const method = initRaw && typeof initRaw.method === 'string' ? initRaw.method : 'GET'
  const body = initRaw && typeof initRaw.body === 'string' ? initRaw.body : undefined
  const headers = initRaw && isObject(initRaw.headers)
    ? Object.entries(initRaw.headers).reduce<Record<string, string>>((acc, [k, v]) => {
        if (typeof v === 'string') acc[k.toLowerCase()] = v
        return acc
      }, {})
    : {}

  // Ensure Content-Type is set if body is present
  if (body && !headers['content-type']) {
    headers['content-type'] = 'application/json'
  }

  (async () => {
    try {
      console.log('Background fetch starting:', { type, url, method, headers, bodyLength: body?.length })
      const res = await fetch(url, { 
        method, 
        headers, 
        body,
        mode: 'cors',
        credentials: 'omit'
      })
      const status = res.status
      const ok = res.ok
      console.log('Background fetch response:', { status, ok })
      // Try JSON first, fallback to text
      let data: unknown
      try {
        const text = await res.text()
        try {
          data = JSON.parse(text)
        } catch {
          data = text
        }
      } catch (err) {
        data = null
        console.error('Failed to read response body:', err)
      }
      sendResponse({ ok, status, data })
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      console.error('Background fetch fatal error:', e)
      sendResponse({ ok: false, status: 0, error: msg })
    }
  })()

  // Indicate async response
  return true
})

export {}
