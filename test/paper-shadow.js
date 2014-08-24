define(function(require) {
  'use strict';

  var element = require('flight-element');
  var registry = require('flight/lib/registry');

  function findComponent(el) {
    var info = registry.findInstanceInfoByNode(el[0] || el);
    return info.length ? info[0].instance : null;
  }

  describeComponent('lib/paper-shadow', function() {
    it('should work', function() {
      this.$node = $('<div><div f-is="paper-shadow"/></div>').appendTo('body');

      element.upgradeElement(this.$node);
      var component = findComponent(this.$node.find('[f-is=paper-shadow]'));
      expect(component).to.be.a(this.Component);
    });
  });
});
