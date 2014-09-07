module.exports = {
  entry: './lib/index',
  output: {
    filename: 'flight-with-node-properties.js',
    library: 'flightWithNodeProperties',
    libraryTarget: 'umd',
    sourcePrefix: ''
  },
  resolve: {
    alias: {
      'element-properties': '../bower_components/element-properties/element-properties.js'
    }
  }
};
