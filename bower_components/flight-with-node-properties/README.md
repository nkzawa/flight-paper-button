flight-with-node-properties
==============
[![Build Status](https://travis-ci.org/nkzawa/flight-with-node-properties.svg)](https://travis-ci.org/nkzawa/flight-with-node-properties)

Flight mixin for defining custom properties and attributes to node.

```js
var withNodeProperties = require('flight-with-node-properties');

return flight.component(withNodeProperties, myButton);

function myButton() {
  this.nodeProperties({
    // publish properties as attributes
    publish: {
      label: 'Default Label',
      // reflect back property value to attribute
      active: { value: false, reflect: true }
    },
    zDepth: 1
  });

  this.labelChanged = function(oldValue, newValue) {
    // called upon the label value changed
  };

  this.after('initialize', function() {
    // initialize node properties.
    this.initializeNodeProperties();

    console.log(this.node.label); // => 'Default Label'
    console.log(this.node.active); // => false
    console.log(this.node.zDepth:); // => 1

    node.setAttribute('label', 'New Label');
    console.log(this.node.label); // => 'New Label'

    node.active = true;
    console.log(this.node.hasAttribute('active')); // => true
  });
}
```

## Installation

```bash
bower install --save flight-with-node-properties
```

## Browser Support
Chrome, Firefox, Safari, IE 8+

## License

MIT
