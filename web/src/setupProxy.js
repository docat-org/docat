const { createProxyMiddleware } = require('http-proxy-middleware')

module.exports = function (app) {
  const backendPort = process.env.BACKEND_PORT || 5000
  const backendHost = process.env.BACKEND_HOST || 'localhost'
  const prefixPath = process.env.REACT_APP_PREFIX_PATH || ''

  app.use(
    `${prefixPath}/api`,
    createProxyMiddleware({
      target: `http://${backendHost}:${backendPort}`,
      changeOrigin: true
    })
  )

  app.use(
    `${prefixPath}/doc`,
    createProxyMiddleware({
      target: `http://${backendHost}:${backendPort}`,
      changeOrigin: true
    })
  )
}
