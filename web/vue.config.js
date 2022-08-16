const path = require('path')

module.exports = {
  configureWebpack: {
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      writeToDisk: true,
      // proxy all requests to `/api/` and `/doc` for development.
      // this fixes the CORS issue for iframe loading and other requests
      // to the backend
      proxy: {
        '^/api': {
          target: 'http://localhost:5000',
          changeOrigin: true
        },
        '^/doc': {
          target: 'http://localhost:5000',
          changeOrigin: true
        }
      }
    },
    module: {
      rules: [{
        test: /\.md$/,
        use: [{ loader: "html-loader" }]
      }]
    }
  }
}