define(function(require) {
  'use strict';

  var undefined = void 0;

  var hasAttributeSynch = (function() {
    var element = document.createElement('div');
    element.a = 'b';
    return element.getAttribute('a') === 'b';
  })();


  function property(element, name, options, handler) {
    observeProperty(element, name, options, handler);
    if (options.publish) {
      observeAttribute(element, name, options);
    }
  }

  function polyfil(element) {
    if (!element.setAttribute._polyfilled) {
      var setAttribute = element.setAttribute;
      defineProperty(element, 'setAttribute', function(name, value) {
        changeAttribute(element, name, value, setAttribute);
      });
      element.setAttribute._polyfilled = true;
    }

    if (!element.removeAttribute._polyfilled) {
      var removeAttribute = element.removeAttribute;
      defineProperty(element, 'removeAttribute', function(name) {
        changeAttribute(element, name, null, removeAttribute);
      });
      element.removeAttribute._polyfilled = true;
    }
  }

  function changeAttribute(element, name, value, operation) {
    name = name.toLowerCase();
    var oldValue = element.getAttribute(name);
    operation.call(element, name, value);
    var newValue = element.getAttribute(name);
    if (element.attributeChangedCallback && newValue !== oldValue) {
      element.attributeChangedCallback(name, oldValue, newValue);
    }
  }

  function observeProperty(element, name, options, handler) {
    var value;
    var reflectRequired = hasAttributeSynch && options.publish && element.hasAttribute(name);
    if (reflectRequired) {
      var attr = element.getAttribute(name);
    }

    Object.defineProperty(element, name, {
      get: function() {
        return value;
      },
      set: function(newValue) {
        if (value === newValue) return;

        var oldValue = value;
        value = newValue;

        if (options.reflect) {
          reflectAttribute(element, name, options.serialize(newValue));
        }
        if (handler) {
          handler(name, oldValue, newValue);
        }
      },
      configurable: true
    });

    if (reflectRequired) {
      // put back the attribute
      reflectAttribute(element, name, attr);
    }
  }

  function observeAttribute(element, name, options) {
    var published = element._published;
    if (!published) {
      defineProperty(element, '_published', {});
      published = element._published;
    }

    published[name.toLowerCase()] = {
      name: name,
      deserialize: options.deserialize
    };

    if (!element.attributeChangedCallback) {
      defineProperty(element, 'attributeChangedCallback', function(name, oldValue, newValue) {
        if (name === 'class' || name === 'style') return;

        var definition = published[name];
        if (!definition) return;

        var value = definition.deserialize(newValue);
        if (value !== this[definition.name]) {
          this[definition.name] = value;
        }
      });
    }
  }

  var defineProperty;

  if (hasAttributeSynch) {
    defineProperty = function(element, name, value) {
      // define value as a function not to synch with attribute.
      Object.defineProperty(element, name, {
        get: function() { return value; },
        configurable: true
      });
    };
  } else {
    defineProperty = function(element, name, value) {
      element[name] = value;
    };
  }

  var reflectAttribute;

  if (hasAttributeSynch) {
    reflectAttribute = function(element, name, value) {
      var attrName = name.toUpperCase();
      if (attrName === name) {
        attrName = name.toLowerCase();
      }

      // set the attribute through the property.
      if ('undefined' !== typeof value) {
        element[attrName] = value;
      } else {
        if (attrName in element) {
          delete element[attrName];
        }
      }
    };
  } else {
    reflectAttribute = function(element, name, value) {
      if ('undefined' !== typeof value) {
        element.setAttribute(name, value);
      } else {
        element.removeAttribute(name);
      }
    };
  }

  function serialize(value) {
    switch (typeof value) {
    case 'object':
    case 'function':
    case 'undefined':
      return;
    case 'boolean':
      return value ? '' : undefined;
    default:
      return value;
    }
  }

  function deserialize(value) {
    switch (typeof value) {
    case 'undefined':
      return;
    case 'boolean':
      return value || undefined;
    default:
      return '' === value ? true : value;
    }
  }

  function parseDefinitions(definitions) {
    var parsed = {};

    for (var name in definitions) {
      if ('publish' !== name) {
        parsed[name] = {
          value: definitions[name],
          publish: false,
          reflect: false
        };
        continue;
      }

      var publish = definitions.publish;
      for (var n in publish) {
        var reflect = false;
        var value = publish[n];
        if (value && 'undefined' !== typeof value.value) {
          reflect = !!value.reflect;
          value = value.value;
        }
        parsed[n] = {
          value: value,
          publish: true,
          reflect: reflect
        };
      }
    }

    return parsed;
  }

  return function(element, definitions, options, handler) {
    if ('function' === typeof options) {
      handler = options;
      options = {};
    }

    polyfil(element);

    var _definitions = parseDefinitions(definitions);
    var _serialize = options.serialize || serialize;
    var _deserialize = options.deserialize || deserialize;

    // prepare properties
    for (var name in _definitions) {
      var definition = _definitions[name];
      property(element, name, {
        publish: definition.publish,
        reflect: definition.publish && definition.reflect,
        serialize: _serialize,
        deserialize: _deserialize
      }, handler);
    }

    // assign default values
    for (var name in _definitions) {
      var definition = _definitions[name];
      if (definition.publish && element.hasAttribute(name)) {
        element[name] = _deserialize(element.getAttribute(name));
        continue;
      }

      if ('undefined' === typeof element[name]) {
        element[name] = definition.value;
      }
    }
  };
});
