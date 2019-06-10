var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
const CleanWebpackPlugin = require("clean-webpack-plugin");
var CopyWebpackPlugin = require("copy-webpack-plugin");
var helpers = require("./helpers");

const ENV = process.env.NODE_ENV ? process.env.NODE_ENV : "development";
const isDev                = ENV !== 'production';


module.exports = {
  entry: {
    polyfills: "./demo/polyfills.ts",
    vendor: "./demo/vendor.ts",
    app: "./demo/boot.ts"
  },

  resolve: {
    extensions: [".ts", ".js", ".css", ".scss"]
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        loaders: [
          {
            loader: "ts-loader",
            options: { configFile: helpers.root("tsconfig.json") }
          },
          "angular2-template-loader"
        ],
        exclude: [/node_modules/]
      },
      {
        test: /\.html$/,
        exclude: helpers.root("demo/index.html"),
        loader: "html-loader"
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          { loader: "style-loader", options: { sourceMap: isDev } },
          { loader: "css-loader", options: { sourceMap: isDev } },
          { loader: "sass-loader", options: { sourceMap: isDev } }
        ],
        include: helpers.root("demo", "res")
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          "to-string-loader",
          { loader: "css-loader", options: { sourceMap: isDev } },
          { loader: "sass-loader", options: { sourceMap: isDev } }
        ],
        include: [helpers.root("demo", "ngx-select-demo"), helpers.root("src")]
      }
    ]
  },

  plugins: [
    // Workaround for angular/angular#11580
    new webpack.ContextReplacementPlugin(
      /angular(\\|\/)core(\\|\/)(@angular|esm5)/,
      helpers.root("./demo"), // location of your src
      {} // a map of your routes
    ),

    new CleanWebpackPlugin(helpers.root("dist"), {
      root: helpers.root(),
      verbose: true
    }),

    new webpack.DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV)
    }),

    new HtmlWebpackPlugin({
      template: `demo/index.html`,
      environment: {
        ENV: ENV
      }
    }),

    new CopyWebpackPlugin([
      {
        from: "demo/res/**/*"
      },
      {
        from: "demo/favicon.ico",
        to: "favicon.ico"
      }
    ])
  ]
};
