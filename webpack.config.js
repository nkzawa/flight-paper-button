module.exports = {
  entry: './lib/paper-button',
  output: {
    filename: 'flight-paper-button.js',
    library: 'FlightPaperButton',
    libraryTarget: 'umd',
    sourcePrefix: ''
  },
  externals: {
    'flight/lib/component': {
      root: ['flight', 'component'],
      commonjs2: ['flight', 'component'],
      commonjs: ['flight', 'component'],
      amd: 'flight/lib/component'
    },
    'flight-element': {
      root: 'flightElement',
      commonjs2: 'flight-element',
      commonjs: 'flightElement',
      amd: 'flight-element'
    }
  },
  resolveLoader: {
    alias: {
      text$: 'raw',
      css$: 'css'
    }
  },
  module: {
    postLoaders: [
      { test: /\.css$/, loader: 'style' }
    ]
  }
};
