define(function(require) {
  'use strict';

  require('./paper-ripple');
  require('./paper-shadow');
  require('css!./paper-button.css');

  var element = require('flight-element');
  var Focusable = require('./paper-focusable');
  var template = require('text!./paper-button.html');

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
});
