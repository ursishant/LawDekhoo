// webpack.config.js
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: process.env.NODE_ENV === "production" ? "production" : "development",

  entry: "./src/index.js",

  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
    publicPath: "/", // for react-router-dom support
    clean: true // clears dist before each build
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // handle both .js and .jsx
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              "@babel/preset-env", // transpile modern JS
              "@babel/preset-react" // transpile JSX
            ]
          }
        }
      },
      {
        test: /\.css$/, // handle CSS imports
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i, // handle images
        type: "asset/resource"
      }
    ]
  },

  resolve: {
    extensions: [".js", ".jsx"] // import without specifying extension
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public", "index.html"),
      inject: "body"
    })
  ],

  devServer: {
    historyApiFallback: true, // for SPA routing
    static: {
      directory: path.join(__dirname, "public")
    },
    port: 3000,
    open: true, // auto-open browser
    hot: true // enable hot reloading
  }
};
