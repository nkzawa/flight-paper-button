define(function(require) {
  'use strict';
  // https://github.com/darius/requestAnimationFrame

  // Adapted from https://gist.github.com/paulirish/1579671
  // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
  // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

  // requestAnimationFrame polyfill by Erik Möller.
  // Fixes from Paul Irish, Tino Zijdel, Andrew Mao, Klemen Slavič, Darius Bacon

  // MIT license
  var raf = {};
  raf.requestAnimationFrame = window.requestAnimationFrame;
  raf.cancelAnimationFrame = window.cancelAnimationFrame;

  var vendors = ['moz', 'webkit'];
  for (var i = 0; i < vendors.length && !raf.requestAnimationFrame; ++i) {
    var vp = vendors[i];
    raf.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
    raf.cancelAnimationFrame = window[vp + 'CancelAnimationFrame']
                               || window[vp + 'CancelRequestAnimationFrame'];
  }

  if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) // iOS6 is buggy
      || !raf.requestAnimationFrame || !raf.cancelAnimationFrame) {
    var lastTime = 0;
    raf.requestAnimationFrame = function(callback) {
      var now = new Date().getTime();
      var nextTime = Math.max(lastTime + 16, now);
      return setTimeout(function() {
        callback(lastTime = nextTime);
      }, nextTime - now);
    };

    raf.cancelAnimationFrame = clearTimeout;
  }

  return raf;
});
