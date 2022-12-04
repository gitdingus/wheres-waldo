const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: {
    index: './src/index.js',
    admin: './src/admin.js',
  },
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(jpg|jpeg)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.template.html$/i,
        type: 'asset/source',
      }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/template/index.html',
      chunks: ['index'],
      filename: 'index.html',
    }),
    new HtmlWebpackPlugin({
      template: './src/template/admin.html',
      chunks: ['admin'],
      filename: 'admin.html',
    }),
  ],
}