define(function(require) {
  'use strict';

  require('css!./paper-ripple.css');

  var defineComponent = require('flight/lib/component');
  var element = require('flight-element');
  var withNodeProperties = require('./with-node-properties');
  var requestAnimationFrame = require('./requestAnimationFrame').requestAnimationFrame;

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
});
