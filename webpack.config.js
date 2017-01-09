var webpack = require('webpack');
var CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  context: __dirname + '/src',
  entry: {
    'js/slidebase': './js/slidebase.js',
    'js/background': './js/background.js',
    'js/popup': './js/popup.js',
    'js/options': './js/options.js',
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: [ /node_modules/, /bower_components/ ],
        loader: 'babel',
        query: {
          presets: [ 'es2015' ]
        }
      },
    ]
  },
  resolve: {
    root: './bower_components',
    moduleDirectories: [ 'node_modules', 'bower_components' ],
  },
  plugins: [
    new webpack.ResolverPlugin(
      new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('.bower.json', [ 'main' ])
    ),
    new webpack.optimize.UglifyJsPlugin(),
    new CopyWebpackPlugin([
      { from: '*.html' },
      { from: 'img/*.png' },
      { from: 'manifest.json' }
    ])
  ]
};
