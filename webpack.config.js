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
    },
    'flight-with-node-properties': {
      root: 'FlightWithNodeProperties',
      commonjs2: 'flight-with-node-properties',
      commonjs: 'FlightWithNodeProperties',
      amd: 'flight-with-node-properties'
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
