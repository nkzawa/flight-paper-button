define(function(require) {
  'use strict';

  var element = require('flight-element');

  describeMixin('lib/with-node-properties', function() {
    beforeEach(function() {
      this.Component = this.Component.mixin(function() {
        this.nodeProperties({
          foo: 1,
          publish: {
            bar: 2,
            baz: {value: 3, reflect: true}
          }
        });
        this.after('initialize', function() {
          this.initializeNodeProperties();
        });
      });
    });

    it('should define properties and attributes', function() {
      setupComponent();

      var node = this.component.node;
      expect(node.foo).to.eql(1);
      expect(node.bar).to.eql(2);
      expect(node.baz).to.eql(3);
      expect(node.getAttribute('foo')).not.to.be.ok();
      expect(node.getAttribute('bar')).not.to.be.ok();
      expect(node.getAttribute('baz')).to.be('3');
    });

    it('should define properties from default attributes', function() {
      this.$node = $('<div foo="4" bar="5" baz="6"/>').appendTo('body');
      this.component = new this.Component().initialize(this.$node, {});

      var node = this.component.node;
      expect(node.foo).to.eql(1);
      expect(node.bar).to.eql(5);
      expect(node.baz).to.eql(6);
      expect(node.getAttribute('foo')).to.be('4');
      expect(node.getAttribute('bar')).to.be('5');
      expect(node.getAttribute('baz')).to.be('6');
    });

    it('should publish properties as attributes', function() {
      setupComponent();

      var node = this.component.node;
      node.setAttribute('foo', 4);
      node.setAttribute('bar', 5);
      node.setAttribute('baz', 6);

      expect(node.foo).to.eql(1);
      expect(node.bar).to.eql(5);
      expect(node.baz).to.eql(6);
      expect(node.getAttribute('foo')).to.be('4');
      expect(node.getAttribute('bar')).to.be('5');
      expect(node.getAttribute('baz')).to.be('6');
    });

    it('should publish properties as attributes', function() {
      setupComponent();

      var node = this.component.node;
      node.foo = 4;
      node.bar = 5;
      node.baz = 6;

      expect(node.foo).to.eql(4);
      expect(node.bar).to.eql(5);
      expect(node.baz).to.eql(6);
      expect(node.getAttribute('foo')).not.to.be.ok();
      expect(node.getAttribute('bar')).not.to.be.ok();
      expect(node.getAttribute('baz')).to.be('6');
    });
  });
});
