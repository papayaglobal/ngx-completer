var webpackMerge = require("webpack-merge");
var commonConfig = require("./webpack.common.js");
var helpers = require("./helpers");

module.exports = webpackMerge(commonConfig, {
  mode: 'development',
  devtool: "cheap-module-eval-source-map",

  output: {
    path: helpers.root("dist/demo"),
    publicPath: "http://localhost:8080/",
    filename: "[name].js",
    chunkFilename: "[id].chunk.js"
  },
  optimization: {
    noEmitOnErrors: true
  },

  devServer: {
    historyApiFallback: true,
    stats: "minimal",
    hot: true
  }
});
