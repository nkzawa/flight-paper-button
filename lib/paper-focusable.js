define(function(require) {
  'use strict';

  require('css!./paper-focusable.css');

  var defineComponent = require('flight/lib/component');
  var element = require('flight-element');
  var withNodeProperties = require('flight-with-node-properties');

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
});
