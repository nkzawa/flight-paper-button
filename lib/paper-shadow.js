define(function(require) {
  'use strict';

  require('css!./paper-shadow.css');

  var defineComponent = require('flight/lib/component');
  var element = require('flight-element');
  var withNodeProperties = require('./with-node-properties');

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
});
