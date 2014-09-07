(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("flight-element"), require("flight")["component"], require("flight-with-node-properties"));
	else if(typeof define === 'function' && define.amd)
		define(["flight-element", "flight/lib/component", "flight-with-node-properties"], factory);
	else if(typeof exports === 'object')
		exports["FlightPaperButton"] = factory(require("flightElement"), require("flight")["component"], require("flightWithNodeProperties"));
	else
		root["FlightPaperButton"] = factory(root["flightElement"], root["flight"]["component"], root["flightWithNodeProperties"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_5__, __WEBPACK_EXTERNAL_MODULE_6__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {
  'use strict';

  __webpack_require__(2);
  __webpack_require__(3);
  __webpack_require__(9);

  var element = __webpack_require__(1);
  var Focusable = __webpack_require__(4);
  var template = __webpack_require__(8);

  return element.registerElement('paper-button', {
    component: Focusable.mixin(paperButton)
  });

  function paperButton() {
    this.attributes({
      shadowContainer: '[f-id=shadow-container]:first',
      shadow: '[f-id=shadow]:first',
      ripple: '[f-id=ripple]:first',
      label: '[f-id=content]:first > span'
    });

    this.nodeProperties({
      publish: {
        label: '',
        raisedButton: {value: false, reflect: true}
      },
      z: 1
    });

    this.after('activeChanged', function() {
      if (this.node.active) {
        // FIXME: remove when paper-ripple can have a default 'down' state.
        if (!this.lastEvent) {
          var rect = this.node.getBoundingClientRect();
          this.lastEvent = {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          }
        }
        var e = $.Event('down');
        e.x = this.lastEvent.x;
        e.y = this.lastEvent.y;
        this.select('ripple').trigger(e);
      } else {
        this.select('ripple').trigger('up');
      }
      this.adjustZ();
    });

    this.after('focusedChanged', function() {
      this.adjustZ();
    });

    this.after('disabledChanged', function() {
      this.adjustZ();
    });

    this.adjustZ = function() {
      if (this.node.focused) {
        this.$node.addClass('paper-shadow-animate-z-1-z-2');
      } else {
        this.$node.removeClass('paper-shadow-animate-z-1-z-2');

        if (this.node.active) {
          this.node.z = 2;
        } else if (this.node.disabled) {
          this.node.z = 0;
        } else {
          this.node.z = 1;
        }
      }
    };

    this.after('downAction', function(e) {
      this.lastEvent = e.originalEvent || e;
    });

    this.labelChanged = function() {
      this.$node.attr('aria-label', this.node.label);
      this.select('label').text(this.node.label).toggle(!!this.node.label);
    };

    this.raisedButtonChanged = function() {
      this.select('shadowContainer').toggle(!!this.node.raisedButton);
    };

    this.zChanged = function() {
      this.select('shadow')[0].z = this.node.z;
    };

    this.after('initialize', function() {
      this.$node.attr('paper-button', '');
      this.renderContent(template);
      this.initializeNodeProperties();
    });
  }
}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {
  'use strict';

  __webpack_require__(11);

  var defineComponent = __webpack_require__(5);
  var element = __webpack_require__(1);
  var withNodeProperties = __webpack_require__(6);
  var requestAnimationFrame = __webpack_require__(7).requestAnimationFrame;

  var hasCanvas = (function() {
    var canvas = document.createElement('canvas');
    return !!(canvas.getContext && canvas.getContext('2d'));
  })();

  var waveMaxRadius = 150;
  //
  // INK EQUATIONS
  //
  function waveRadiusFn(touchDownMs, touchUpMs, anim) {
    // Convert from ms to s.
    var touchDown = touchDownMs / 1000;
    var touchUp = touchUpMs / 1000;
    var totalElapsed = touchDown + touchUp;
    var ww = anim.width, hh = anim.height;
    // use diagonal size of container to avoid floating point math sadness
    var waveRadius = Math.min(Math.sqrt(ww * ww + hh * hh), waveMaxRadius) * 1.1 + 5;
    var duration = 1.1 - .2 * (waveRadius / waveMaxRadius);
    var tt = (totalElapsed / duration);

    var size = waveRadius * (1 - Math.pow(80, -tt));
    return Math.abs(size);
  }

  function waveOpacityFn(td, tu, anim) {
    // Convert from ms to s.
    var touchDown = td / 1000;
    var touchUp = tu / 1000;
    var totalElapsed = touchDown + touchUp;

    if (tu <= 0) {  // before touch up
      return anim.initialOpacity;
    }
    return Math.max(0, anim.initialOpacity - touchUp * anim.opacityDecayVelocity);
  }

  function waveOuterOpacityFn(td, tu, anim) {
    // Convert from ms to s.
    var touchDown = td / 1000;
    var touchUp = tu / 1000;

    // Linear increase in background opacity, capped at the opacity
    // of the wavefront (waveOpacity).
    var outerOpacity = touchDown * 0.3;
    var waveOpacity = waveOpacityFn(td, tu, anim);
    return Math.max(0, Math.min(outerOpacity, waveOpacity));
  }

  // Determines whether the wave should be completely removed.
  function waveDidFinish(wave, radius, anim) {
    var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);
    // If the wave opacity is 0 and the radius exceeds the bounds
    // of the element, then this is finished.
    if (waveOpacity < 0.01 && radius >= Math.min(wave.maxRadius, waveMaxRadius)) {
      return true;
    }
    return false;
  };

  function waveAtMaximum(wave, radius, anim) {
    var waveOpacity = waveOpacityFn(wave.tDown, wave.tUp, anim);
    if (waveOpacity >= anim.initialOpacity && radius >= Math.min(wave.maxRadius, waveMaxRadius)) {
      return true;
    }
    return false;
  }

  //
  // DRAWING
  //
  function drawRipple(ctx, x, y, radius, innerColor, outerColor) {
    if (outerColor) {
      ctx.fillStyle = outerColor;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = innerColor;
    ctx.fill();
  }

  //
  // SETUP
  //
  function createWave(elem) {
    var fgColor = $(elem).css('color');

    var wave = {
      waveColor: fgColor,
      maxRadius: 0,
      isMouseDown: false,
      mouseDownStart: 0.0,
      mouseUpStart: 0.0,
      tDown: 0,
      tUp: 0
    };
    return wave;
  }

  function removeWaveFromScope(scope, wave) {
    if (scope.waves) {
      var pos = scope.waves.indexOf(wave);
      scope.waves.splice(pos, 1);
    }
  };

  // Shortcuts.
  var pow = Math.pow;
  var now = Date.now;
  if (window.performance && performance.now) {
    now = performance.now.bind(performance);
  }

  function cssColorWithAlpha(cssColor, alpha) {
      var parts = cssColor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
      if (typeof alpha == 'undefined') {
          alpha = 1;
      }
      if (!parts) {
        return 'rgba(255, 255, 255, ' + alpha + ')';
      }
      return 'rgba(' + parts[1] + ', ' + parts[2] + ', ' + parts[3] + ', ' + alpha + ')';
  }

  function dist(p1, p2) {
    return Math.sqrt(pow(p1.x - p2.x, 2) + pow(p1.y - p2.y, 2));
  }

  function distanceFromPointToFurthestCorner(point, size) {
    var tl_d = dist(point, {x: 0, y: 0});
    var tr_d = dist(point, {x: size.w, y: 0});
    var bl_d = dist(point, {x: 0, y: size.h});
    var br_d = dist(point, {x: size.w, y: size.h});
    return Math.max(tl_d, tr_d, bl_d, br_d);
  }

  return element.registerElement('paper-ripple', {
    component: defineComponent(withNodeProperties, paperRipple)
  });

  function paperRipple() {
    this.nodeProperties({
      publish: {
        initialOpacity: 0.25,
        opacityDecayVelocity: 0.8
      },
      backgroundFill: true,
      pixelDensity: 2
    });

    this.setupCanvas = function() {
      this.canvas.setAttribute('width', this.canvas.clientWidth * this.node.pixelDensity + 'px');
      this.canvas.setAttribute('height', this.canvas.clientHeight * this.node.pixelDensity + 'px');
      var ctx = this.canvas.getContext('2d');
      ctx.scale(this.node.pixelDensity, this.node.pixelDensity);
      if (!this._loop) {
        this._loop = this.animate.bind(this, ctx);
      }
    };

    this.downAction = function(e) {
      e = e.originalEvent || e;
      this.setupCanvas();
      var wave = createWave(this.canvas);

      this.cancelled = false;
      wave.isMouseDown = true;
      wave.tDown = 0.0;
      wave.tUp = 0.0;
      wave.mouseUpStart = 0.0;
      wave.mouseDownStart = now();

      var width = this.canvas.width / 2; // Retina canvas
      var height = this.canvas.height / 2;
      var rect = this.node.getBoundingClientRect();
      var touchX = e.x - rect.left;
      var touchY = e.y - rect.top;

      wave.startPosition = {x:touchX, y:touchY};

      if (this.$node.hasClass("recenteringTouch")) {
        wave.endPosition = {x: width / 2,  y: height / 2};
        wave.slideDistance = dist(wave.startPosition, wave.endPosition);
      }
      wave.containerSize = Math.max(width, height);
      wave.maxRadius = distanceFromPointToFurthestCorner(wave.startPosition, {w: width, h: height});
      this.waves.push(wave);
      requestAnimationFrame(this._loop);
    };

    this.upAction = function() {
      for (var i = 0; i < this.waves.length; i++) {
        // Declare the next wave that has mouse down to be mouse'ed up.
        var wave = this.waves[i];
        if (wave.isMouseDown) {
          wave.isMouseDown = false
          wave.mouseUpStart = now();
          wave.mouseDownStart = 0;
          wave.tUp = 0.0;
          break;
        }
      }
      this._loop && requestAnimationFrame(this._loop);
    };

    this.cancel = function() {
      this.cancelled = true;
    },

    this.animate = function(ctx) {
      var shouldRenderNextFrame = false;

      // Clear the canvas
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      var deleteTheseWaves = [];
      // The oldest wave's touch down duration
      var longestTouchDownDuration = 0;
      var longestTouchUpDuration = 0;
      // Save the last known wave color
      var lastWaveColor = null;
      // wave animation values
      var anim = {
        initialOpacity: this.node.initialOpacity,
        opacityDecayVelocity: this.node.opacityDecayVelocity,
        height: ctx.canvas.height,
        width: ctx.canvas.width
      }

      for (var i = 0; i < this.waves.length; i++) {
        var wave = this.waves[i];

        if (wave.mouseDownStart > 0) {
          wave.tDown = now() - wave.mouseDownStart;
        }
        if (wave.mouseUpStart > 0) {
          wave.tUp = now() - wave.mouseUpStart;
        }

        // Determine how long the touch has been up or down.
        var tUp = wave.tUp;
        var tDown = wave.tDown;
        longestTouchDownDuration = Math.max(longestTouchDownDuration, tDown);
        longestTouchUpDuration = Math.max(longestTouchUpDuration, tUp);

        // Obtain the instantenous size and alpha of the ripple.
        var radius = waveRadiusFn(tDown, tUp, anim);
        var waveAlpha =  waveOpacityFn(tDown, tUp, anim);
        var waveColor = cssColorWithAlpha(wave.waveColor, waveAlpha);
        lastWaveColor = wave.waveColor;

        // Position of the ripple.
        var x = wave.startPosition.x;
        var y = wave.startPosition.y;

        // Ripple gravitational pull to the center of the canvas.
        if (wave.endPosition) {

          // This translates from the origin to the center of the view  based on the max dimension of  
          var translateFraction = Math.min(1, radius / wave.containerSize * 2 / Math.sqrt(2) );

          x += translateFraction * (wave.endPosition.x - wave.startPosition.x);
          y += translateFraction * (wave.endPosition.y - wave.startPosition.y);
        }

        // If we do a background fill fade too, work out the correct color.
        var bgFillColor = null;
        if (this.node.backgroundFill) {
          var bgFillAlpha = waveOuterOpacityFn(tDown, tUp, anim);
          bgFillColor = cssColorWithAlpha(wave.waveColor, bgFillAlpha);
        }

        // Draw the ripple.
        drawRipple(ctx, x, y, radius, waveColor, bgFillColor);

        // Determine whether there is any more rendering to be done.
        var maximumWave = waveAtMaximum(wave, radius, anim);
        var waveDissipated = waveDidFinish(wave, radius, anim);
        var shouldKeepWave = !waveDissipated || maximumWave;
        var shouldRenderWaveAgain = !waveDissipated && !maximumWave;
        shouldRenderNextFrame = shouldRenderNextFrame || shouldRenderWaveAgain;
        if (!shouldKeepWave || this.cancelled) {
          deleteTheseWaves.push(wave);
        }
      };

      if (shouldRenderNextFrame) {
        requestAnimationFrame(this._loop);
      }

      for (var i = 0; i < deleteTheseWaves.length; ++i) {
        var wave = deleteTheseWaves[i];
        removeWaveFromScope(this, wave);
      }

      if (!this.waves.length) {
        // If there is nothing to draw, clear any drawn waves now because
        // we're not going to get another requestAnimationFrame any more.
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        this._loop = null;
      }
    };

    this.after('initialize', function() {
      this.$node.attr('paper-ripple', '');
      this.waves = [];

      if (hasCanvas) {
        // create the canvas element manually because ios
        // does not render the canvas element if it is not created in the
        // main document (component templates are created in a
        // different document). See:
        // https://bugs.webkit.org/show_bug.cgi?id=109073.
        if (!this.canvas) {
          var canvas = document.createElement('canvas');
          this.$node.append(canvas);
          this.canvas = canvas;
        }

        this.on('touchstart mousedown pointerdown', 'down');
        this.on('touchend mouseup pointerup', 'up');
        this.on('down', this.downAction);
        this.on('up', this.upAction);
      }

      this.initializeNodeProperties();
    });
  }
}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {
  'use strict';

  __webpack_require__(13);

  var defineComponent = __webpack_require__(5);
  var element = __webpack_require__(1);
  var withNodeProperties = __webpack_require__(6);

  return element.registerElement('paper-shadow', {
    component: defineComponent(withNodeProperties, paperShadow)
  });

  function paperShadow() {
    this.nodeProperties({
      publish: {
        target: {value: null, reflect: true},
        z: {value: 1, reflect: true},
        animated: {value: false, reflect: true},
        hasPosition: {value: false}
      }
    });

    this.targetChanged = function(old) {
      if (this.node.target && 'string' === typeof this.node.target) {
        this.node.target = $(this.node.target)[0];
        return;
      }

      if (!this.node.target) {
        // If no target is bound at attach, default the target to the parent
        // element or host.
        var target;
        if (!this.node.parentElement && this.node.parentNode) {
          target = this.node.parentNode;
        } else if (this.node.parentElement && this.node.parentElement !== document.body) {
          target = this.node.parentElement;
        }
        if (target) {
          this.node.target = target;
          return;
        }
      }

      if (old) {
        this.removeShadow(old);
      }
      if (this.node.target) {
        this.addShadow(this.node.target);
      }
    };

    this.zChanged = function(old) {
      if (this.node.target && this.node.target._paperShadow) {
        var shadow = this.node.target._paperShadow;
        ['top', 'bottom'].forEach(function(s) {
          var $shadow = $(shadow[s]);
          $shadow.removeClass('paper-shadow-' + s + '-z-' + old)
          $shadow.addClass('paper-shadow-' + s + '-z-' + this.node.z);
        }.bind(this));
      }
    };

    this.animatedChanged = function(old) {
      if (this.node.target && this.node.target._paperShadow) {
        var shadow = this.node.target._paperShadow;
        ['top', 'bottom'].forEach(function(s) {
          var $shadow = $(shadow[s]);
          if (this.node.animated) {
            $shadow.addClass('paper-shadow-animated');
          } else {
            $shadow.removeClass('paper-shadow-animated');
          }
        }.bind(this));
      }
    };

    this.addShadow = function(node) {
      if (node._paperShadow) {
        return;
      }

      if (!this.node.hasPosition && $(node).css('position') === 'static') {
        node.style.position = 'relative';
      }
      node.style.overflow = 'visible';

      // Both the top and bottom shadows are children of the target, so
      // it does not affect the classes and CSS properties of the target.
      ['top', 'bottom'].forEach(function(s) {
        var inner = (node._paperShadow && node._paperShadow[s]) || document.createElement('div');
        var $inner = $(inner);
        $inner.addClass('paper-shadow');
        $inner.addClass('paper-shadow-' + s + '-z-' + this.z);
        if (this.node.animated) {
          $inner.addClass('paper-shadow-animated');
        }

        if (node.shadowRoot) {
          node.shadowRoot.insertBefore(inner, node.shadowRoot.firstChild);
        } else {
          node.insertBefore(inner, node.firstChild);
        }

        node._paperShadow = node._paperShadow || {};
        node._paperShadow[s] = inner;
      }.bind(this));

    };

    this.removeShadow = function(node) {
      if (!node._paperShadow) {
        return;
      }

      ['top', 'bottom'].forEach(function(s) {
        node._paperShadow[s].remove();
      });
      node._paperShadow = null;

      node.style.position = null;
    };

    this.after('initialize', function() {
      this.$node.attr('paper-shadow', '');
      this.initializeNodeProperties();
    });
  }
}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {
  'use strict';

  __webpack_require__(15);

  var defineComponent = __webpack_require__(5);
  var element = __webpack_require__(1);
  var withNodeProperties = __webpack_require__(6);

  return element.registerElement('paper-focusable', {
    component: defineComponent(withNodeProperties, paperFocusable)
  });

  function paperFocusable() {
    this.nodeProperties({
      publish: {
        active: {value: false, reflect: true},
        focused: {value: false, reflect: true},
        pressed: {value: false, reflect: true},
        disabled: {value: false, reflect: true},
        isToggle: {value: false, reflect: false}
      }
    });

    this.downAction = function(e) {
      this.node.pressed = true;
      this.node.focused = false;

      if (this.isToggle) {
        this.node.active = !this.node.active;
      } else {
        this.node.active = true;
      }
    };

    this.upAction = function() {
      this.node.pressed = false;

      if (!this.node.isToggle) {
        this.node.active = false;
      }
    };

    this.contextMenuAction = function(e) {
      // Note that upAction may fire _again_ on the actual up event.
      this.upAction(e);
      this.focusAction();
    };

    this.blurAction = function() {
      this.node.focused = false;
    };

    this.focusAction = function() {
      if (!this.node.pressed) {
        // Only render the "focused" state if the element gains focus due to
        // keyboard navigation.
        this.node.focused = true;
      }
    };

    this.disabledChanged = function() {
      if (this.node.disabled) {
        this.$node.attr('disabled', '');
        this.$node.removeAttr('tabindex');
      } else {
        this.$node.removeAttr('disabled', '');
        this.$node.attr('tabindex', 0);
      }
    };

    this.after('initialize', function() {
      this.$node.attr('paper-focusable', '');

      ['touchstart', 'mousedown', 'pointerdown', 'down'].forEach(function(type) {
        this.on(type, this.downAction);
      }, this);

      ['touchend', 'mouseup', 'pointerup', 'up'].forEach(function(type) {
        this.on(type, this.upAction);
      }, this);

      this.on('focus', this.focusAction);
      this.on('blur', this.blurAction);
      this.on('contextmenu', this.contextMenuAction);
    });
  }
}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __WEBPACK_EXTERNAL_MODULE_5__;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

module.exports = __WEBPACK_EXTERNAL_MODULE_6__;

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = function(require) {
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
}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

module.exports = "<div f-id=\"shadow-container\" style=\"display:none\">\n  <div f-is=\"paper-shadow\" f-id=\"shadow\" animated></div>\n</div>\n\n<div f-id=\"clip\">\n  <div f-is=\"paper-ripple\" f-id=\"ripple\"></div>\n  <div f-id=\"content\">\n    <span style=\"display:none\"></span>\n  </div>\n</div>\n"

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag
var update = __webpack_require__(17)(
	__webpack_require__(10)
);
// Hot Module Replacement
if(false) {
	module.hot.accept("!!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/node_modules/css-loader/index.js!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/lib/paper-button.css", function() {
		update(require("!!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/node_modules/css-loader/index.js!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/lib/paper-button.css"));
	});
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

module.exports =
	"[paper-button] {\n  display: inline-block;\n  position: relative;\n  border: 0;\n  background: transparent;\n  text-align: center;\n  font: inherit;\n  text-transform: uppercase;\n  outline: none;\n  border-radius: 3px;\n  -webkit-user-select: none;\n  user-select: none;\n  cursor: pointer;\n}\n\n[paper-button].hover:hover {\n  background: #e4e4e4;\n}\n\n[paper-button][raisedButton] {\n  background: #dfdfdf;\n}\n\n[paper-button][raisedButton].hover:hover {\n  background: #d6d6d6;\n}\n\n[paper-button][disabled] {\n  background: #eaeaea !important;\n  color: #a8a8a8 !important;\n  cursor: auto;\n}\n\n[paper-button] [f-id=shadow-container] {\n  border-radius: inherit;\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n}\n\n[paper-button] [f-id=clip] {\n  position: relative;\n  border-radius: inherit;\n  overflow: hidden;\n}\n\n[paper-button] [f-id=ripple] {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  color: #d1d1d1;\n  pointer-events: none;\n}\n\n[paper-button][raisedButton] [f-id=ripple] {\n  color: #cecece;\n}\n\n[paper-button] [f-id=ripple] canvas {\n  top: 0;\n  left: 0;\n}\n\n[paper-button] [f-id=content] {\n  /* needed to position the ink behind the content */\n  position: relative;\n}\n\n[paper-button] [f-id=content] > span {\n  display: inline-block;\n  margin: 0.5em;\n}\n";

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag
var update = __webpack_require__(17)(
	__webpack_require__(12)
);
// Hot Module Replacement
if(false) {
	module.hot.accept("!!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/node_modules/css-loader/index.js!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/lib/paper-ripple.css", function() {
		update(require("!!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/node_modules/css-loader/index.js!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/lib/paper-ripple.css"));
	});
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

module.exports =
	"[paper-ripple] {\n  display: block;\n  position: relative;\n}\n\n[paper-ripple] > canvas {\n  pointer-events: none;\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n\n[paper-ripple].circle > canvas {\n  border-radius: 50%;\n}\n";

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag
var update = __webpack_require__(17)(
	__webpack_require__(14)
);
// Hot Module Replacement
if(false) {
	module.hot.accept("!!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/node_modules/css-loader/index.js!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/lib/paper-shadow.css", function() {
		update(require("!!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/node_modules/css-loader/index.js!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/lib/paper-shadow.css"));
	});
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

module.exports =
	".paper-shadow {\n  position: absolute;\n  top: 0;\n  left: 0;\n  bottom: 0;\n  right: 0;\n  border-radius: inherit;\n  pointer-events: none;\n}\n\n.paper-shadow-animated.paper-shadow {\n  transition: box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);\n}\n\n.paper-shadow-top-z-1 {\n  box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.16);\n}\n\n.paper-shadow-bottom-z-1 {\n  box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);\n}\n\n.paper-shadow-top-z-2 {\n  box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.19);\n}\n\n.paper-shadow-bottom-z-2 {\n  box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.2);\n}\n\n.paper-shadow-top-z-3 {\n  box-shadow: 0 17px 50px 0 rgba(0, 0, 0, 0.19);\n}\n\n.paper-shadow-bottom-z-3 {\n  box-shadow: 0 12px 15px 0 rgba(0, 0, 0, 0.24);\n}\n\n.paper-shadow-top-z-4 {\n  box-shadow: 0 25px 55px 0 rgba(0, 0, 0, 0.21);\n}\n\n.paper-shadow-bottom-z-4 {\n  box-shadow: 0 16px 28px 0 rgba(0, 0, 0, 0.22);\n}\n\n.paper-shadow-top-z-5 {\n  box-shadow: 0 40px 77px 0 rgba(0, 0, 0, 0.22);\n}\n\n.paper-shadow-bottom-z-5 {\n  box-shadow: 0 27px 24px 0 rgba(0, 0, 0, 0.2);\n}\n\n.paper-shadow-animate-z-1-z-2.paper-shadow-top {\n  -webkit-transition: none;\n  -webkit-animation: animate-shadow-top-z-1-z-2 0.7s infinite alternate;\n}\n\n.paper-shadow-animate-z-1-z-2 .paper-shadow-bottom {\n  -webkit-transition: none;\n  -webkit-animation: animate-shadow-bottom-z-1-z-2 0.7s infinite alternate;\n}\n\n@-webkit-keyframes animate-shadow-top-z-1-z-2 {\n  0% {\n    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.16);\n  }\n  100% {\n    box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.19);\n  }\n}\n\n@-webkit-keyframes animate-shadow-bottom-z-1-z-2 {\n  0% {\n    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);\n  }\n  100% {\n    box-shadow: 0 8px 17px 0 rgba(0, 0, 0, 0.2);\n  }\n}\n";

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag
var update = __webpack_require__(17)(
	__webpack_require__(16)
);
// Hot Module Replacement
if(false) {
	module.hot.accept("!!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/node_modules/css-loader/index.js!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/lib/paper-focusable.css", function() {
		update(require("!!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/node_modules/css-loader/index.js!/Users/NaoyukiKanezawa/github.com/nkzawa/flight-paper-button/lib/paper-focusable.css"));
	});
	module.hot.dispose(function() { update(); });
}

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

module.exports =
	"[paper-focusable][disabled] {\n  pointer-events: none;\n}\n";

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
module.exports = function addStyle(cssCode) {
	if(false) {
		if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}
	var styleElement = document.createElement("style"),
		head = document.head || document.getElementsByTagName("head")[0];
	styleElement.type = "text/css";
	head.appendChild(styleElement);
	if (styleElement.styleSheet) {
		styleElement.styleSheet.cssText = cssCode;
	} else {
		styleElement.appendChild(document.createTextNode(cssCode));
	}
	if(false) {
		return function(cssCode) {
			if(typeof cssCode === "string") {
				if (styleElement.styleSheet) {
					styleElement.styleSheet.cssText = cssCode;
				} else {
					styleElement.childNodes[0].nodeValue = cssCode;
				}
			} else {
				dispose();
			}
		};
	} else {
		// For the useable API, provide a function to remove the stylesheet.
		return dispose;
	}

	function dispose() {
		head.removeChild(styleElement);
	}
};


/***/ }
/******/ ])
});
