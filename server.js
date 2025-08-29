const { createProxyMiddleware } = require('http-proxy-middleware')
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const PORT = process.env.PORT || 3000
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000'

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    const { pathname } = parsedUrl

    // Interceptar requests para API e aplicar timeout customizado
    if (pathname.startsWith('/api/')) {
      // Configurar proxy com timeout longo para API
      const apiProxy = createProxyMiddleware({
        target: BACKEND_URL,
        changeOrigin: true,
        timeout: 600000, // 10 minutos
        proxyTimeout: 600000, // 10 minutos  
        logLevel: 'warn',
        onError: (err, req, res) => {
          console.error('Proxy Error:', err.message)
          if (!res.headersSent) {
            res.statusCode = 504
            res.end('Gateway Timeout - Backend não respondeu em tempo hábil')
          }
        },
        onProxyReq: (proxyReq, req, res) => {
          console.log(`🔄 Proxying ${req.method} ${req.url} -> ${BACKEND_URL}${req.url}`)
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log(`✅ Proxy response ${proxyRes.statusCode} for ${req.url}`)
        }
      })
      
      return apiProxy(req, res)
    }

    // Para todas as outras requests, usar o handler padrão do Next.js
    handle(req, res, parsedUrl)
  })

  server.setTimeout(600000) // 10 minutos timeout para o servidor
  
  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`🚀 Server ready on http://localhost:${PORT}`)
    console.log(`📡 API Proxy configured for ${BACKEND_URL}`)
    console.log(`⏱️  Timeouts set to 10 minutes`)
  })
})