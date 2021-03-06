flight-paper-button
==============
[![Build Status](https://travis-ci.org/nkzawa/flight-paper-button.svg)](https://travis-ci.org/nkzawa/flight-paper-button)

paper-button component build on top of Flight and [flight-element](https://github.com/nkzawa/flight-element), ported from [the Polymer element](https://github.com/Polymer/paper-button).

```html
<span f-is="paper-button" label="button" raisedButton></span>
```

Alternatively, you can attach the component manually:

```js
FlightPaperButton.attachTo('.paper-button');
```

Once attached, you can interact with the node object directly like Web Components.

```js
var buttonNode = $('.paper-button')[0];

// set label
buttonNode.setAttribute('label', 'foo');

// set z-depth of shadow
buttonNode.z = 2;
```

## Demo

[demo](http://nkzawa.github.io/flight-paper-button/demos/demo.html)

## Browser Support
Chrome, Firefox, Safari, IE 8+ (less styles and animations for legacy browsers, requires [ES5-shim](https://github.com/kriskowal/es5-shim))

## License

MIT
