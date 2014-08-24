define(function(require) {
  'use strict';

  var properties = require('./element-properties');

  function withNodeProperties() {
    this.nodeProperties = function(props) {
      this.nodePropDef = this.nodePropDef || {};
      this.nodePropDef.publish = this.nodePropDef.publish || {};

      for (var name in props) {
        if ('publish' !== name) {
          this.nodePropDef[name] = props[name];
          continue;
        }

        var publish = props.publish || {};
        for (var n in publish) {
          this.nodePropDef.publish[n] = publish[n];
        }
      }
    };

    this.initializeNodeProperties = function() {
      properties(this.node, this.nodePropDef, function(name, oldValue, newValue) {
        var method = this[name + 'Changed'];
        if ('function' === typeof method) {
          method.call(this, oldValue, newValue);
        }
      }.bind(this));
    };
  }

  return withNodeProperties;
});
