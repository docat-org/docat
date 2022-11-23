const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  const backendPort = process.env.BACKEND_PORT || 5000;
  const backendHost = process.env.BACKEND_HOST || "localhost";

  app.use(
    "/api",
    createProxyMiddleware({
      target: `http://${backendHost}:${backendPort}`,
      changeOrigin: true,
    })
  );

  app.use(
    "/doc",
    createProxyMiddleware({
      target: `http://${backendHost}:${backendPort}`,
      changeOrigin: true,
    })
  );
};
