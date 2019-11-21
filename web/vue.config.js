module.exports = {
  configureWebpack: {
    module: {
      rules: [{
        test: /\.md$/,
        use: [{ loader: "html-loader" }]
      }]
    }
  }
}