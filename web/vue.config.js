const path = require('path')

module.exports = {
  configureWebpack: {
    devServer: {
      contentBase: path.join(__dirname, 'dist'),
      writeToDisk: true,
    },
    module: {
      rules: [{
        test: /\.md$/,
        use: [{ loader: "html-loader" }]
      }]
    }
  }
}