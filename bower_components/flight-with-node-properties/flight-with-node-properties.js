(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["flightWithNodeProperties"] = factory();
	else
		root["flightWithNodeProperties"] = factory();
})(this, function() {
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

  var properties = __webpack_require__(1);

  function withNodeProperties() {
    this.nodeProperties = function(props) {
      this.nodePropDef = this.nodePropDef || {};
      this.nodePropDef.publish = this.nodePropDef.publish || {};

      for (var name in props) {
        if ('publish' !== name) {
          this.nodePropDef[name] = props[name];
          delete this.nodePropDef.publish[name];
          continue;
        }

        var publish = props.publish || {};
        for (var n in publish) {
          this.nodePropDef.publish[n] = publish[n];
          delete this.nodePropDef[n];
        }
      }
    };

    this.initializeNodeProperties = function() {
      properties(this.node, this.nodePropDef, function(name, oldValue, newValue) {
        var methodName = name + 'Changed';
        if ('function' === typeof this[methodName]) {
          this[methodName](oldValue, newValue);
        }
      }.bind(this));
    };
  }

  return withNodeProperties;
}.call(exports, __webpack_require__, exports, module), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

(function webpackUniversalModuleDefinition(root, factory) {
	if(true)
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define(factory);
	else if(typeof exports === 'object')
		exports["elementProperties"] = factory();
	else
		root["elementProperties"] = factory();
})(this, function() {
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

(function(window, undefined) {
  'use strict';

  /**
   * detect a browser feature which reflects a value of a property
   * to a corresponding attribute automatically.
   */
  var hasAttributeSynch = (function() {
    var element = document.createElement('div');
    element.a = 'b';
    return element.getAttribute('a') === 'b';
  })();


  function elementProperties(element, definitions, options, handler) {
    if ('function' === typeof options) {
      handler = options;
      options = {};
    }
    options = options || {};

    polyfil(element);

    privateProperty(element, '_reflecting', false);

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
  }

  /**
   * define a extended property.
   */
  function property(element, name, options, handler) {
    observeProperty(element, name, options, handler);
    if (options.publish) {
      observeAttribute(element, name, options);
    }
  }

  /**
   * define a property which is used interally.
   */
  var privateProperty;

  if (hasAttributeSynch) {
    privateProperty = function(element, name, value) {
      // define value as a function not to synch with attribute.
      Object.defineProperty(element, name, {
        get: function() { return value; },
        configurable: true
      });
    };
  } else {
    privateProperty = function(element, name, value) {
      element[name] = value;
    };
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

        if (element._reflecting) {
          element._reflecting = false;
        } else if (options.reflect) {
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

  function polyfil(element) {
    if (!element.setAttribute._polyfilled) {
      var setAttribute = element.setAttribute;
      privateProperty(element, 'setAttribute', function(name, value) {
        changeAttribute(element, name, value, setAttribute);
      });
      element.setAttribute._polyfilled = true;
    }

    if (!element.removeAttribute._polyfilled) {
      var removeAttribute = element.removeAttribute;
      privateProperty(element, 'removeAttribute', function(name) {
        changeAttribute(element, name, null, removeAttribute);
      });
      element.removeAttribute._polyfilled = true;
    }
  }

  function changeAttribute(element, name, value, operation) {
    var lowerName = name.toLowerCase();
    var oldValue = element.getAttribute(lowerName);
    operation.call(element, lowerName, value);

    if (element._reflecting) {
      element._reflecting = false;
      return;
    }

    // HACK: to expose value as attribute for IE8
    if (hasAttributeSynch && 'undefined' !== typeof value && !element.hasAttribute(lowerName)) {
      var definition = element._published[lowerName];
      if (definition && !definition.reflect) {
        reflectAttribute(element, definition.name, value);
        return;
      }
    }

    var newValue = element.getAttribute(lowerName);
    if (element.attributeChangedCallback && newValue !== oldValue) {
      element.attributeChangedCallback(lowerName, oldValue, newValue);
    }
  }

  function observeAttribute(element, name, options) {
    var published = element._published;
    if (!published) {
      privateProperty(element, '_published', {});
      published = element._published;
    }

    published[name.toLowerCase()] = {
      name: name,
      reflect: options.reflect,
      deserialize: options.deserialize
    };

    if (!element.attributeChangedCallback) {
      privateProperty(element, 'attributeChangedCallback', function(lowerName, oldValue, newValue) {
        if (lowerName === 'class' || lowerName === 'style') return;

        var definition = published[lowerName];
        if (!definition) return;

        var value = definition.deserialize(newValue);
        if (value !== this[definition.name]) {
          element._reflecting = true;
          this[definition.name] = value;
        }
      });
    }
  }

  /**
   * reflect a property value to a corresponding attribute.
   */
  var reflectAttribute;

  if (hasAttributeSynch) {
    reflectAttribute = function(element, name, value) {
      var attrName = name.toUpperCase();
      if (attrName === name) {
        attrName = name.toLowerCase();
      }

      if ('undefined' === typeof value && !(attrName in element)) {
        return;
      }

      element._reflecting = true;
      // set the attribute through the property.
      if ('undefined' !== typeof value) {
        element[attrName] = value;
      } else {
        delete element[attrName];
      }
    };
  } else {
    reflectAttribute = function(element, name, value) {
      element._reflecting = true;
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

  /**
   * parse and normalize property definitions.
   */
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

  if (true) {
    module.exports = elementProperties;
  } else {
    // only for tests
    window.elementProperties = elementProperties;
  }
})(window);


/***/ }
/******/ ])
});


/***/ }
/******/ ])
});
