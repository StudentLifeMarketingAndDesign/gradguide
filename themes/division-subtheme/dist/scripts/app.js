/**
 * what-input - A global utility for tracking the current input method (mouse, keyboard or touch).
 * @version v4.0.6
 * @link https://github.com/ten1seven/what-input
 * @license MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("whatInput", [], factory);
	else if(typeof exports === 'object')
		exports["whatInput"] = factory();
	else
		root["whatInput"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	module.exports = (function() {

	  /*
	    ---------------
	    Variables
	    ---------------
	  */

	  // cache document.documentElement
	  var docElem = document.documentElement;

	  // last used input type
	  var currentInput = 'initial';

	  // last used input intent
	  var currentIntent = null;

	  // form input types
	  var formInputs = [
	    'input',
	    'select',
	    'textarea'
	  ];

	  // list of modifier keys commonly used with the mouse and
	  // can be safely ignored to prevent false keyboard detection
	  var ignoreMap = [
	    16, // shift
	    17, // control
	    18, // alt
	    91, // Windows key / left Apple cmd
	    93  // Windows menu / right Apple cmd
	  ];

	  // mapping of events to input types
	  var inputMap = {
	    'keyup': 'keyboard',
	    'mousedown': 'mouse',
	    'mousemove': 'mouse',
	    'MSPointerDown': 'pointer',
	    'MSPointerMove': 'pointer',
	    'pointerdown': 'pointer',
	    'pointermove': 'pointer',
	    'touchstart': 'touch'
	  };

	  // array of all used input types
	  var inputTypes = [];

	  // boolean: true if touch buffer timer is running
	  var isBuffering = false;

	  // map of IE 10 pointer events
	  var pointerMap = {
	    2: 'touch',
	    3: 'touch', // treat pen like touch
	    4: 'mouse'
	  };

	  // touch buffer timer
	  var touchTimer = null;


	  /*
	    ---------------
	    Set up
	    ---------------
	  */

	  var setUp = function() {

	    // add correct mouse wheel event mapping to `inputMap`
	    inputMap[detectWheel()] = 'mouse';

	    addListeners();
	    setInput();
	  };


	  /*
	    ---------------
	    Events
	    ---------------
	  */

	  var addListeners = function() {

	    // `pointermove`, `MSPointerMove`, `mousemove` and mouse wheel event binding
	    // can only demonstrate potential, but not actual, interaction
	    // and are treated separately

	    // pointer events (mouse, pen, touch)
	    if (window.PointerEvent) {
	      docElem.addEventListener('pointerdown', updateInput);
	      docElem.addEventListener('pointermove', setIntent);
	    } else if (window.MSPointerEvent) {
	      docElem.addEventListener('MSPointerDown', updateInput);
	      docElem.addEventListener('MSPointerMove', setIntent);
	    } else {

	      // mouse events
	      docElem.addEventListener('mousedown', updateInput);
	      docElem.addEventListener('mousemove', setIntent);

	      // touch events
	      if ('ontouchstart' in window) {
	        docElem.addEventListener('touchstart', touchBuffer);
	      }
	    }

	    // mouse wheel
	    docElem.addEventListener(detectWheel(), setIntent);

	    // keyboard events
	    docElem.addEventListener('keydown', updateInput);
	    docElem.addEventListener('keyup', updateInput);
	  };

	  // checks conditions before updating new input
	  var updateInput = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var eventKey = event.which;
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (
	        currentInput !== value ||
	        currentIntent !== value
	      ) {

	        var activeElem = document.activeElement;
	        var activeInput = (
	          activeElem &&
	          activeElem.nodeName &&
	          formInputs.indexOf(activeElem.nodeName.toLowerCase()) === -1
	        ) ? true : false;

	        if (
	          value === 'touch' ||

	          // ignore mouse modifier keys
	          (value === 'mouse' && ignoreMap.indexOf(eventKey) === -1) ||

	          // don't switch if the current element is a form input
	          (value === 'keyboard' && activeInput)
	        ) {

	          // set the current and catch-all variable
	          currentInput = currentIntent = value;

	          setInput();
	        }
	      }
	    }
	  };

	  // updates the doc and `inputTypes` array with new input
	  var setInput = function() {
	    docElem.setAttribute('data-whatinput', currentInput);
	    docElem.setAttribute('data-whatintent', currentInput);

	    if (inputTypes.indexOf(currentInput) === -1) {
	      inputTypes.push(currentInput);
	      docElem.className += ' whatinput-types-' + currentInput;
	    }
	  };

	  // updates input intent for `mousemove` and `pointermove`
	  var setIntent = function(event) {

	    // only execute if the touch buffer timer isn't running
	    if (!isBuffering) {
	      var value = inputMap[event.type];
	      if (value === 'pointer') value = pointerType(event);

	      if (currentIntent !== value) {
	        currentIntent = value;

	        docElem.setAttribute('data-whatintent', currentIntent);
	      }
	    }
	  };

	  // buffers touch events because they frequently also fire mouse events
	  var touchBuffer = function(event) {

	    // clear the timer if it happens to be running
	    window.clearTimeout(touchTimer);

	    // set the current input
	    updateInput(event);

	    // set the isBuffering to `true`
	    isBuffering = true;

	    // run the timer
	    touchTimer = window.setTimeout(function() {

	      // if the timer runs out, set isBuffering back to `false`
	      isBuffering = false;
	    }, 200);
	  };


	  /*
	    ---------------
	    Utilities
	    ---------------
	  */

	  var pointerType = function(event) {
	   if (typeof event.pointerType === 'number') {
	      return pointerMap[event.pointerType];
	   } else {
	      return (event.pointerType === 'pen') ? 'touch' : event.pointerType; // treat pen like touch
	   }
	  };

	  // detect version of mouse wheel event to use
	  // via https://developer.mozilla.org/en-US/docs/Web/Events/wheel
	  var detectWheel = function() {
	    return 'onwheel' in document.createElement('div') ?
	      'wheel' : // Modern browsers support "wheel"

	      document.onmousewheel !== undefined ?
	        'mousewheel' : // Webkit and IE support at least "mousewheel"
	        'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
	  };


	  /*
	    ---------------
	    Init

	    don't start script unless browser cuts the mustard
	    (also passes if polyfills are used)
	    ---------------
	  */

	  if (
	    'addEventListener' in window &&
	    Array.prototype.indexOf
	  ) {
	    setUp();
	  }


	  /*
	    ---------------
	    API
	    ---------------
	  */

	  return {

	    // returns string: the current input type
	    // opt: 'loose'|'strict'
	    // 'strict' (default): returns the same value as the `data-whatinput` attribute
	    // 'loose': includes `data-whatintent` value if it's more current than `data-whatinput`
	    ask: function(opt) { return (opt === 'loose') ? currentIntent : currentInput; },

	    // returns array: all the detected input types
	    types: function() { return inputTypes; }

	  };

	}());


/***/ }
/******/ ])
});
;
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  "use strict";

  var FOUNDATION_VERSION = '6.3.1';

  // Global Foundation object
  // This is attached to the window, or used as a module for AMD/Browserify
  var Foundation = {
    version: FOUNDATION_VERSION,

    /**
     * Stores initialized plugins.
     */
    _plugins: {},

    /**
     * Stores generated unique ids for plugin instances
     */
    _uuids: [],

    /**
     * Returns a boolean for RTL support
     */
    rtl: function rtl() {
      return $('html').attr('dir') === 'rtl';
    },
    /**
     * Defines a Foundation plugin, adding it to the `Foundation` namespace and the list of plugins to initialize when reflowing.
     * @param {Object} plugin - The constructor of the plugin.
     */
    plugin: function plugin(_plugin, name) {
      // Object key to use when adding to global Foundation object
      // Examples: Foundation.Reveal, Foundation.OffCanvas
      var className = name || functionName(_plugin);
      // Object key to use when storing the plugin, also used to create the identifying data attribute for the plugin
      // Examples: data-reveal, data-off-canvas
      var attrName = hyphenate(className);

      // Add to the Foundation object and the plugins list (for reflowing)
      this._plugins[attrName] = this[className] = _plugin;
    },
    /**
     * @function
     * Populates the _uuids array with pointers to each individual plugin instance.
     * Adds the `zfPlugin` data-attribute to programmatically created plugins to allow use of $(selector).foundation(method) calls.
     * Also fires the initialization event for each plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @param {String} name - the name of the plugin, passed as a camelCased string.
     * @fires Plugin#init
     */
    registerPlugin: function registerPlugin(plugin, name) {
      var pluginName = name ? hyphenate(name) : functionName(plugin.constructor).toLowerCase();
      plugin.uuid = this.GetYoDigits(6, pluginName);

      if (!plugin.$element.attr('data-' + pluginName)) {
        plugin.$element.attr('data-' + pluginName, plugin.uuid);
      }
      if (!plugin.$element.data('zfPlugin')) {
        plugin.$element.data('zfPlugin', plugin);
      }
      /**
       * Fires when the plugin has initialized.
       * @event Plugin#init
       */
      plugin.$element.trigger('init.zf.' + pluginName);

      this._uuids.push(plugin.uuid);

      return;
    },
    /**
     * @function
     * Removes the plugins uuid from the _uuids array.
     * Removes the zfPlugin data attribute, as well as the data-plugin-name attribute.
     * Also fires the destroyed event for the plugin, consolidating repetitive code.
     * @param {Object} plugin - an instance of a plugin, usually `this` in context.
     * @fires Plugin#destroyed
     */
    unregisterPlugin: function unregisterPlugin(plugin) {
      var pluginName = hyphenate(functionName(plugin.$element.data('zfPlugin').constructor));

      this._uuids.splice(this._uuids.indexOf(plugin.uuid), 1);
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin')
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      .trigger('destroyed.zf.' + pluginName);
      for (var prop in plugin) {
        plugin[prop] = null; //clean up script to prep for garbage collection.
      }
      return;
    },

    /**
     * @function
     * Causes one or more active plugins to re-initialize, resetting event listeners, recalculating positions, etc.
     * @param {String} plugins - optional string of an individual plugin key, attained by calling `$(element).data('pluginName')`, or string of a plugin class i.e. `'dropdown'`
     * @default If no argument is passed, reflow all currently active plugins.
     */
    reInit: function reInit(plugins) {
      var isJQ = plugins instanceof $;
      try {
        if (isJQ) {
          plugins.each(function () {
            $(this).data('zfPlugin')._init();
          });
        } else {
          var type = typeof plugins === 'undefined' ? 'undefined' : _typeof(plugins),
              _this = this,
              fns = {
            'object': function object(plgs) {
              plgs.forEach(function (p) {
                p = hyphenate(p);
                $('[data-' + p + ']').foundation('_init');
              });
            },
            'string': function string() {
              plugins = hyphenate(plugins);
              $('[data-' + plugins + ']').foundation('_init');
            },
            'undefined': function undefined() {
              this['object'](Object.keys(_this._plugins));
            }
          };
          fns[type](plugins);
        }
      } catch (err) {
        console.error(err);
      } finally {
        return plugins;
      }
    },

    /**
     * returns a random base-36 uid with namespacing
     * @function
     * @param {Number} length - number of random base-36 digits desired. Increase for more random strings.
     * @param {String} namespace - name of plugin to be incorporated in uid, optional.
     * @default {String} '' - if no plugin name is provided, nothing is appended to the uid.
     * @returns {String} - unique id
     */
    GetYoDigits: function GetYoDigits(length, namespace) {
      length = length || 6;
      return Math.round(Math.pow(36, length + 1) - Math.random() * Math.pow(36, length)).toString(36).slice(1) + (namespace ? '-' + namespace : '');
    },
    /**
     * Initialize plugins on any elements within `elem` (and `elem` itself) that aren't already initialized.
     * @param {Object} elem - jQuery object containing the element to check inside. Also checks the element itself, unless it's the `document` object.
     * @param {String|Array} plugins - A list of plugins to initialize. Leave this out to initialize everything.
     */
    reflow: function reflow(elem, plugins) {

      // If plugins is undefined, just grab everything
      if (typeof plugins === 'undefined') {
        plugins = Object.keys(this._plugins);
      }
      // If plugins is a string, convert it to an array with one item
      else if (typeof plugins === 'string') {
          plugins = [plugins];
        }

      var _this = this;

      // Iterate through each plugin
      $.each(plugins, function (i, name) {
        // Get the current plugin
        var plugin = _this._plugins[name];

        // Localize the search to all elements inside elem, as well as elem itself, unless elem === document
        var $elem = $(elem).find('[data-' + name + ']').addBack('[data-' + name + ']');

        // For each plugin found, initialize it
        $elem.each(function () {
          var $el = $(this),
              opts = {};
          // Don't double-dip on plugins
          if ($el.data('zfPlugin')) {
            console.warn("Tried to initialize " + name + " on an element that already has a Foundation plugin.");
            return;
          }

          if ($el.attr('data-options')) {
            var thing = $el.attr('data-options').split(';').forEach(function (e, i) {
              var opt = e.split(':').map(function (el) {
                return el.trim();
              });
              if (opt[0]) opts[opt[0]] = parseValue(opt[1]);
            });
          }
          try {
            $el.data('zfPlugin', new plugin($(this), opts));
          } catch (er) {
            console.error(er);
          } finally {
            return;
          }
        });
      });
    },
    getFnName: functionName,
    transitionend: function transitionend($elem) {
      var transitions = {
        'transition': 'transitionend',
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'otransitionend'
      };
      var elem = document.createElement('div'),
          end;

      for (var t in transitions) {
        if (typeof elem.style[t] !== 'undefined') {
          end = transitions[t];
        }
      }
      if (end) {
        return end;
      } else {
        end = setTimeout(function () {
          $elem.triggerHandler('transitionend', [$elem]);
        }, 1);
        return 'transitionend';
      }
    }
  };

  Foundation.util = {
    /**
     * Function for applying a debounce effect to a function call.
     * @function
     * @param {Function} func - Function to be called at end of timeout.
     * @param {Number} delay - Time in ms to delay the call of `func`.
     * @returns function
     */
    throttle: function throttle(func, delay) {
      var timer = null;

      return function () {
        var context = this,
            args = arguments;

        if (timer === null) {
          timer = setTimeout(function () {
            func.apply(context, args);
            timer = null;
          }, delay);
        }
      };
    }
  };

  // TODO: consider not making this a jQuery function
  // TODO: need way to reflow vs. re-initialize
  /**
   * The Foundation jQuery method.
   * @param {String|Array} method - An action to perform on the current jQuery object.
   */
  var foundation = function foundation(method) {
    var type = typeof method === 'undefined' ? 'undefined' : _typeof(method),
        $meta = $('meta.foundation-mq'),
        $noJS = $('.no-js');

    if (!$meta.length) {
      $('<meta class="foundation-mq">').appendTo(document.head);
    }
    if ($noJS.length) {
      $noJS.removeClass('no-js');
    }

    if (type === 'undefined') {
      //needs to initialize the Foundation object, or an individual plugin.
      Foundation.MediaQuery._init();
      Foundation.reflow(this);
    } else if (type === 'string') {
      //an individual method to invoke on a plugin or group of plugins
      var args = Array.prototype.slice.call(arguments, 1); //collect all the arguments, if necessary
      var plugClass = this.data('zfPlugin'); //determine the class of plugin

      if (plugClass !== undefined && plugClass[method] !== undefined) {
        //make sure both the class and method exist
        if (this.length === 1) {
          //if there's only one, call it directly.
          plugClass[method].apply(plugClass, args);
        } else {
          this.each(function (i, el) {
            //otherwise loop through the jQuery collection and invoke the method on each
            plugClass[method].apply($(el).data('zfPlugin'), args);
          });
        }
      } else {
        //error for no class or no method
        throw new ReferenceError("We're sorry, '" + method + "' is not an available method for " + (plugClass ? functionName(plugClass) : 'this element') + '.');
      }
    } else {
      //error for invalid argument type
      throw new TypeError('We\'re sorry, ' + type + ' is not a valid parameter. You must use a string representing the method you wish to invoke.');
    }
    return this;
  };

  window.Foundation = Foundation;
  $.fn.foundation = foundation;

  // Polyfill for requestAnimationFrame
  (function () {
    if (!Date.now || !window.Date.now) window.Date.now = Date.now = function () {
      return new Date().getTime();
    };

    var vendors = ['webkit', 'moz'];
    for (var i = 0; i < vendors.length && !window.requestAnimationFrame; ++i) {
      var vp = vendors[i];
      window.requestAnimationFrame = window[vp + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vp + 'CancelAnimationFrame'] || window[vp + 'CancelRequestAnimationFrame'];
    }
    if (/iP(ad|hone|od).*OS 6/.test(window.navigator.userAgent) || !window.requestAnimationFrame || !window.cancelAnimationFrame) {
      var lastTime = 0;
      window.requestAnimationFrame = function (callback) {
        var now = Date.now();
        var nextTime = Math.max(lastTime + 16, now);
        return setTimeout(function () {
          callback(lastTime = nextTime);
        }, nextTime - now);
      };
      window.cancelAnimationFrame = clearTimeout;
    }
    /**
     * Polyfill for performance.now, required by rAF
     */
    if (!window.performance || !window.performance.now) {
      window.performance = {
        start: Date.now(),
        now: function now() {
          return Date.now() - this.start;
        }
      };
    }
  })();
  if (!Function.prototype.bind) {
    Function.prototype.bind = function (oThis) {
      if (typeof this !== 'function') {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
      }

      var aArgs = Array.prototype.slice.call(arguments, 1),
          fToBind = this,
          fNOP = function fNOP() {},
          fBound = function fBound() {
        return fToBind.apply(this instanceof fNOP ? this : oThis, aArgs.concat(Array.prototype.slice.call(arguments)));
      };

      if (this.prototype) {
        // native functions don't have a prototype
        fNOP.prototype = this.prototype;
      }
      fBound.prototype = new fNOP();

      return fBound;
    };
  }
  // Polyfill to get the name of a function in IE9
  function functionName(fn) {
    if (Function.prototype.name === undefined) {
      var funcNameRegex = /function\s([^(]{1,})\(/;
      var results = funcNameRegex.exec(fn.toString());
      return results && results.length > 1 ? results[1].trim() : "";
    } else if (fn.prototype === undefined) {
      return fn.constructor.name;
    } else {
      return fn.prototype.constructor.name;
    }
  }
  function parseValue(str) {
    if ('true' === str) return true;else if ('false' === str) return false;else if (!isNaN(str * 1)) return parseFloat(str);
    return str;
  }
  // Convert PascalCase to kebab-case
  // Thank you: http://stackoverflow.com/a/8955580
  function hyphenate(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }
}(jQuery);
'use strict';

!function ($) {

  Foundation.Box = {
    ImNotTouchingYou: ImNotTouchingYou,
    GetDimensions: GetDimensions,
    GetOffsets: GetOffsets
  };

  /**
   * Compares the dimensions of an element to a container and determines collision events with container.
   * @function
   * @param {jQuery} element - jQuery object to test for collisions.
   * @param {jQuery} parent - jQuery object to use as bounding container.
   * @param {Boolean} lrOnly - set to true to check left and right values only.
   * @param {Boolean} tbOnly - set to true to check top and bottom values only.
   * @default if no parent object passed, detects collisions with `window`.
   * @returns {Boolean} - true if collision free, false if a collision in any direction.
   */
  function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
    var eleDims = GetDimensions(element),
        top,
        bottom,
        left,
        right;

    if (parent) {
      var parDims = GetDimensions(parent);

      bottom = eleDims.offset.top + eleDims.height <= parDims.height + parDims.offset.top;
      top = eleDims.offset.top >= parDims.offset.top;
      left = eleDims.offset.left >= parDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= parDims.width + parDims.offset.left;
    } else {
      bottom = eleDims.offset.top + eleDims.height <= eleDims.windowDims.height + eleDims.windowDims.offset.top;
      top = eleDims.offset.top >= eleDims.windowDims.offset.top;
      left = eleDims.offset.left >= eleDims.windowDims.offset.left;
      right = eleDims.offset.left + eleDims.width <= eleDims.windowDims.width;
    }

    var allDirs = [bottom, top, left, right];

    if (lrOnly) {
      return left === right === true;
    }

    if (tbOnly) {
      return top === bottom === true;
    }

    return allDirs.indexOf(false) === -1;
  };

  /**
   * Uses native methods to return an object of dimension values.
   * @function
   * @param {jQuery || HTML} element - jQuery object or DOM element for which to get the dimensions. Can be any element other that document or window.
   * @returns {Object} - nested object of integer pixel values
   * TODO - if element is window, return only those values.
   */
  function GetDimensions(elem, test) {
    elem = elem.length ? elem[0] : elem;

    if (elem === window || elem === document) {
      throw new Error("I'm sorry, Dave. I'm afraid I can't do that.");
    }

    var rect = elem.getBoundingClientRect(),
        parRect = elem.parentNode.getBoundingClientRect(),
        winRect = document.body.getBoundingClientRect(),
        winY = window.pageYOffset,
        winX = window.pageXOffset;

    return {
      width: rect.width,
      height: rect.height,
      offset: {
        top: rect.top + winY,
        left: rect.left + winX
      },
      parentDims: {
        width: parRect.width,
        height: parRect.height,
        offset: {
          top: parRect.top + winY,
          left: parRect.left + winX
        }
      },
      windowDims: {
        width: winRect.width,
        height: winRect.height,
        offset: {
          top: winY,
          left: winX
        }
      }
    };
  }

  /**
   * Returns an object of top and left integer pixel values for dynamically rendered elements,
   * such as: Tooltip, Reveal, and Dropdown
   * @function
   * @param {jQuery} element - jQuery object for the element being positioned.
   * @param {jQuery} anchor - jQuery object for the element's anchor point.
   * @param {String} position - a string relating to the desired position of the element, relative to it's anchor
   * @param {Number} vOffset - integer pixel value of desired vertical separation between anchor and element.
   * @param {Number} hOffset - integer pixel value of desired horizontal separation between anchor and element.
   * @param {Boolean} isOverflow - if a collision event is detected, sets to true to default the element to full width - any desired offset.
   * TODO alter/rewrite to work with `em` values as well/instead of pixels
   */
  function GetOffsets(element, anchor, position, vOffset, hOffset, isOverflow) {
    var $eleDims = GetDimensions(element),
        $anchorDims = anchor ? GetDimensions(anchor) : null;

    switch (position) {
      case 'top':
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top
        };
        break;
      case 'right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset,
          top: $anchorDims.offset.top
        };
        break;
      case 'center top':
        return {
          left: $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top - ($eleDims.height + vOffset)
        };
        break;
      case 'center bottom':
        return {
          left: isOverflow ? hOffset : $anchorDims.offset.left + $anchorDims.width / 2 - $eleDims.width / 2,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'center left':
        return {
          left: $anchorDims.offset.left - ($eleDims.width + hOffset),
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center right':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset + 1,
          top: $anchorDims.offset.top + $anchorDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'center':
        return {
          left: $eleDims.windowDims.offset.left + $eleDims.windowDims.width / 2 - $eleDims.width / 2,
          top: $eleDims.windowDims.offset.top + $eleDims.windowDims.height / 2 - $eleDims.height / 2
        };
        break;
      case 'reveal':
        return {
          left: ($eleDims.windowDims.width - $eleDims.width) / 2,
          top: $eleDims.windowDims.offset.top + vOffset
        };
      case 'reveal full':
        return {
          left: $eleDims.windowDims.offset.left,
          top: $eleDims.windowDims.offset.top
        };
        break;
      case 'left bottom':
        return {
          left: $anchorDims.offset.left,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      case 'right bottom':
        return {
          left: $anchorDims.offset.left + $anchorDims.width + hOffset - $eleDims.width,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
        break;
      default:
        return {
          left: Foundation.rtl() ? $anchorDims.offset.left - $eleDims.width + $anchorDims.width : $anchorDims.offset.left + hOffset,
          top: $anchorDims.offset.top + $anchorDims.height + vOffset
        };
    }
  }
}(jQuery);
/*******************************************
 *                                         *
 * This util was created by Marius Olbertz *
 * Please thank Marius on GitHub /owlbertz *
 * or the web http://www.mariusolbertz.de/ *
 *                                         *
 ******************************************/

'use strict';

!function ($) {

  var keyCodes = {
    9: 'TAB',
    13: 'ENTER',
    27: 'ESCAPE',
    32: 'SPACE',
    37: 'ARROW_LEFT',
    38: 'ARROW_UP',
    39: 'ARROW_RIGHT',
    40: 'ARROW_DOWN'
  };

  var commands = {};

  var Keyboard = {
    keys: getKeyCodes(keyCodes),

    /**
     * Parses the (keyboard) event and returns a String that represents its key
     * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
     * @param {Event} event - the event generated by the event handler
     * @return String key - String that represents the key pressed
     */
    parseKey: function parseKey(event) {
      var key = keyCodes[event.which || event.keyCode] || String.fromCharCode(event.which).toUpperCase();

      // Remove un-printable characters, e.g. for `fromCharCode` calls for CTRL only events
      key = key.replace(/\W+/, '');

      if (event.shiftKey) key = 'SHIFT_' + key;
      if (event.ctrlKey) key = 'CTRL_' + key;
      if (event.altKey) key = 'ALT_' + key;

      // Remove trailing underscore, in case only modifiers were used (e.g. only `CTRL_ALT`)
      key = key.replace(/_$/, '');

      return key;
    },


    /**
     * Handles the given (keyboard) event
     * @param {Event} event - the event generated by the event handler
     * @param {String} component - Foundation component's name, e.g. Slider or Reveal
     * @param {Objects} functions - collection of functions that are to be executed
     */
    handleKey: function handleKey(event, component, functions) {
      var commandList = commands[component],
          keyCode = this.parseKey(event),
          cmds,
          command,
          fn;

      if (!commandList) return console.warn('Component not defined!');

      if (typeof commandList.ltr === 'undefined') {
        // this component does not differentiate between ltr and rtl
        cmds = commandList; // use plain list
      } else {
        // merge ltr and rtl: if document is rtl, rtl overwrites ltr and vice versa
        if (Foundation.rtl()) cmds = $.extend({}, commandList.ltr, commandList.rtl);else cmds = $.extend({}, commandList.rtl, commandList.ltr);
      }
      command = cmds[keyCode];

      fn = functions[command];
      if (fn && typeof fn === 'function') {
        // execute function  if exists
        var returnValue = fn.apply();
        if (functions.handled || typeof functions.handled === 'function') {
          // execute function when event was handled
          functions.handled(returnValue);
        }
      } else {
        if (functions.unhandled || typeof functions.unhandled === 'function') {
          // execute function when event was not handled
          functions.unhandled();
        }
      }
    },


    /**
     * Finds all focusable elements within the given `$element`
     * @param {jQuery} $element - jQuery object to search within
     * @return {jQuery} $focusable - all focusable elements within `$element`
     */
    findFocusable: function findFocusable($element) {
      if (!$element) {
        return false;
      }
      return $element.find('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]').filter(function () {
        if (!$(this).is(':visible') || $(this).attr('tabindex') < 0) {
          return false;
        } //only have visible elements and those that have a tabindex greater or equal 0
        return true;
      });
    },


    /**
     * Returns the component name name
     * @param {Object} component - Foundation component, e.g. Slider or Reveal
     * @return String componentName
     */

    register: function register(componentName, cmds) {
      commands[componentName] = cmds;
    },


    /**
     * Traps the focus in the given element.
     * @param  {jQuery} $element  jQuery object to trap the foucs into.
     */
    trapFocus: function trapFocus($element) {
      var $focusable = Foundation.Keyboard.findFocusable($element),
          $firstFocusable = $focusable.eq(0),
          $lastFocusable = $focusable.eq(-1);

      $element.on('keydown.zf.trapfocus', function (event) {
        if (event.target === $lastFocusable[0] && Foundation.Keyboard.parseKey(event) === 'TAB') {
          event.preventDefault();
          $firstFocusable.focus();
        } else if (event.target === $firstFocusable[0] && Foundation.Keyboard.parseKey(event) === 'SHIFT_TAB') {
          event.preventDefault();
          $lastFocusable.focus();
        }
      });
    },

    /**
     * Releases the trapped focus from the given element.
     * @param  {jQuery} $element  jQuery object to release the focus for.
     */
    releaseFocus: function releaseFocus($element) {
      $element.off('keydown.zf.trapfocus');
    }
  };

  /*
   * Constants for easier comparing.
   * Can be used like Foundation.parseKey(event) === Foundation.keys.SPACE
   */
  function getKeyCodes(kcs) {
    var k = {};
    for (var kc in kcs) {
      k[kcs[kc]] = kcs[kc];
    }return k;
  }

  Foundation.Keyboard = Keyboard;
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  // Default set of media queries
  var defaultQueries = {
    'default': 'only screen',
    landscape: 'only screen and (orientation: landscape)',
    portrait: 'only screen and (orientation: portrait)',
    retina: 'only screen and (-webkit-min-device-pixel-ratio: 2),' + 'only screen and (min--moz-device-pixel-ratio: 2),' + 'only screen and (-o-min-device-pixel-ratio: 2/1),' + 'only screen and (min-device-pixel-ratio: 2),' + 'only screen and (min-resolution: 192dpi),' + 'only screen and (min-resolution: 2dppx)'
  };

  var MediaQuery = {
    queries: [],

    current: '',

    /**
     * Initializes the media query helper, by extracting the breakpoint list from the CSS and activating the breakpoint watcher.
     * @function
     * @private
     */
    _init: function _init() {
      var self = this;
      var extractedStyles = $('.foundation-mq').css('font-family');
      var namedQueries;

      namedQueries = parseStyleToObject(extractedStyles);

      for (var key in namedQueries) {
        if (namedQueries.hasOwnProperty(key)) {
          self.queries.push({
            name: key,
            value: 'only screen and (min-width: ' + namedQueries[key] + ')'
          });
        }
      }

      this.current = this._getCurrentSize();

      this._watcher();
    },


    /**
     * Checks if the screen is at least as wide as a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it's smaller.
     */
    atLeast: function atLeast(size) {
      var query = this.get(size);

      if (query) {
        return window.matchMedia(query).matches;
      }

      return false;
    },


    /**
     * Checks if the screen matches to a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to check, either 'small only' or 'small'. Omitting 'only' falls back to using atLeast() method.
     * @returns {Boolean} `true` if the breakpoint matches, `false` if it does not.
     */
    is: function is(size) {
      size = size.trim().split(' ');
      if (size.length > 1 && size[1] === 'only') {
        if (size[0] === this._getCurrentSize()) return true;
      } else {
        return this.atLeast(size[0]);
      }
      return false;
    },


    /**
     * Gets the media query of a breakpoint.
     * @function
     * @param {String} size - Name of the breakpoint to get.
     * @returns {String|null} - The media query of the breakpoint, or `null` if the breakpoint doesn't exist.
     */
    get: function get(size) {
      for (var i in this.queries) {
        if (this.queries.hasOwnProperty(i)) {
          var query = this.queries[i];
          if (size === query.name) return query.value;
        }
      }

      return null;
    },


    /**
     * Gets the current breakpoint name by testing every breakpoint and returning the last one to match (the biggest one).
     * @function
     * @private
     * @returns {String} Name of the current breakpoint.
     */
    _getCurrentSize: function _getCurrentSize() {
      var matched;

      for (var i = 0; i < this.queries.length; i++) {
        var query = this.queries[i];

        if (window.matchMedia(query.value).matches) {
          matched = query;
        }
      }

      if ((typeof matched === 'undefined' ? 'undefined' : _typeof(matched)) === 'object') {
        return matched.name;
      } else {
        return matched;
      }
    },


    /**
     * Activates the breakpoint watcher, which fires an event on the window whenever the breakpoint changes.
     * @function
     * @private
     */
    _watcher: function _watcher() {
      var _this = this;

      $(window).on('resize.zf.mediaquery', function () {
        var newSize = _this._getCurrentSize(),
            currentSize = _this.current;

        if (newSize !== currentSize) {
          // Change the current media query
          _this.current = newSize;

          // Broadcast the media query change on the window
          $(window).trigger('changed.zf.mediaquery', [newSize, currentSize]);
        }
      });
    }
  };

  Foundation.MediaQuery = MediaQuery;

  // matchMedia() polyfill - Test a CSS media type/query in JS.
  // Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas, David Knight. Dual MIT/BSD license
  window.matchMedia || (window.matchMedia = function () {
    'use strict';

    // For browsers that support matchMedium api such as IE 9 and webkit

    var styleMedia = window.styleMedia || window.media;

    // For those that don't support matchMedium
    if (!styleMedia) {
      var style = document.createElement('style'),
          script = document.getElementsByTagName('script')[0],
          info = null;

      style.type = 'text/css';
      style.id = 'matchmediajs-test';

      script && script.parentNode && script.parentNode.insertBefore(style, script);

      // 'style.currentStyle' is used by IE <= 8 and 'window.getComputedStyle' for all other browsers
      info = 'getComputedStyle' in window && window.getComputedStyle(style, null) || style.currentStyle;

      styleMedia = {
        matchMedium: function matchMedium(media) {
          var text = '@media ' + media + '{ #matchmediajs-test { width: 1px; } }';

          // 'style.styleSheet' is used by IE <= 8 and 'style.textContent' for all other browsers
          if (style.styleSheet) {
            style.styleSheet.cssText = text;
          } else {
            style.textContent = text;
          }

          // Test if media query is true or false
          return info.width === '1px';
        }
      };
    }

    return function (media) {
      return {
        matches: styleMedia.matchMedium(media || 'all'),
        media: media || 'all'
      };
    };
  }());

  // Thank you: https://github.com/sindresorhus/query-string
  function parseStyleToObject(str) {
    var styleObject = {};

    if (typeof str !== 'string') {
      return styleObject;
    }

    str = str.trim().slice(1, -1); // browsers re-quote string style values

    if (!str) {
      return styleObject;
    }

    styleObject = str.split('&').reduce(function (ret, param) {
      var parts = param.replace(/\+/g, ' ').split('=');
      var key = parts[0];
      var val = parts[1];
      key = decodeURIComponent(key);

      // missing `=` should be `null`:
      // http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
      val = val === undefined ? null : decodeURIComponent(val);

      if (!ret.hasOwnProperty(key)) {
        ret[key] = val;
      } else if (Array.isArray(ret[key])) {
        ret[key].push(val);
      } else {
        ret[key] = [ret[key], val];
      }
      return ret;
    }, {});

    return styleObject;
  }

  Foundation.MediaQuery = MediaQuery;
}(jQuery);
'use strict';

!function ($) {

  /**
   * Motion module.
   * @module foundation.motion
   */

  var initClasses = ['mui-enter', 'mui-leave'];
  var activeClasses = ['mui-enter-active', 'mui-leave-active'];

  var Motion = {
    animateIn: function animateIn(element, animation, cb) {
      animate(true, element, animation, cb);
    },

    animateOut: function animateOut(element, animation, cb) {
      animate(false, element, animation, cb);
    }
  };

  function Move(duration, elem, fn) {
    var anim,
        prog,
        start = null;
    // console.log('called');

    if (duration === 0) {
      fn.apply(elem);
      elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      return;
    }

    function move(ts) {
      if (!start) start = ts;
      // console.log(start, ts);
      prog = ts - start;
      fn.apply(elem);

      if (prog < duration) {
        anim = window.requestAnimationFrame(move, elem);
      } else {
        window.cancelAnimationFrame(anim);
        elem.trigger('finished.zf.animate', [elem]).triggerHandler('finished.zf.animate', [elem]);
      }
    }
    anim = window.requestAnimationFrame(move);
  }

  /**
   * Animates an element in or out using a CSS transition class.
   * @function
   * @private
   * @param {Boolean} isIn - Defines if the animation is in or out.
   * @param {Object} element - jQuery or HTML object to animate.
   * @param {String} animation - CSS class to use.
   * @param {Function} cb - Callback to run when animation is finished.
   */
  function animate(isIn, element, animation, cb) {
    element = $(element).eq(0);

    if (!element.length) return;

    var initClass = isIn ? initClasses[0] : initClasses[1];
    var activeClass = isIn ? activeClasses[0] : activeClasses[1];

    // Set up the animation
    reset();

    element.addClass(animation).css('transition', 'none');

    requestAnimationFrame(function () {
      element.addClass(initClass);
      if (isIn) element.show();
    });

    // Start the animation
    requestAnimationFrame(function () {
      element[0].offsetWidth;
      element.css('transition', '').addClass(activeClass);
    });

    // Clean up the animation when it finishes
    element.one(Foundation.transitionend(element), finish);

    // Hides the element (for out animations), resets the element, and runs a callback
    function finish() {
      if (!isIn) element.hide();
      reset();
      if (cb) cb.apply(element);
    }

    // Resets transitions and removes motion-specific classes
    function reset() {
      element[0].style.transitionDuration = 0;
      element.removeClass(initClass + ' ' + activeClass + ' ' + animation);
    }
  }

  Foundation.Move = Move;
  Foundation.Motion = Motion;
}(jQuery);
'use strict';

!function ($) {

  var Nest = {
    Feather: function Feather(menu) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'zf';

      menu.attr('role', 'menubar');

      var items = menu.find('li').attr({ 'role': 'menuitem' }),
          subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      items.each(function () {
        var $item = $(this),
            $sub = $item.children('ul');

        if ($sub.length) {
          $item.addClass(hasSubClass).attr({
            'aria-haspopup': true,
            'aria-label': $item.children('a:first').text()
          });
          // Note:  Drilldowns behave differently in how they hide, and so need
          // additional attributes.  We should look if this possibly over-generalized
          // utility (Nest) is appropriate when we rework menus in 6.4
          if (type === 'drilldown') {
            $item.attr({ 'aria-expanded': false });
          }

          $sub.addClass('submenu ' + subMenuClass).attr({
            'data-submenu': '',
            'role': 'menu'
          });
          if (type === 'drilldown') {
            $sub.attr({ 'aria-hidden': true });
          }
        }

        if ($item.parent('[data-submenu]').length) {
          $item.addClass('is-submenu-item ' + subItemClass);
        }
      });

      return;
    },
    Burn: function Burn(menu, type) {
      var //items = menu.find('li'),
      subMenuClass = 'is-' + type + '-submenu',
          subItemClass = subMenuClass + '-item',
          hasSubClass = 'is-' + type + '-submenu-parent';

      menu.find('>li, .menu, .menu > li').removeClass(subMenuClass + ' ' + subItemClass + ' ' + hasSubClass + ' is-submenu-item submenu is-active').removeAttr('data-submenu').css('display', '');

      // console.log(      menu.find('.' + subMenuClass + ', .' + subItemClass + ', .has-submenu, .is-submenu-item, .submenu, [data-submenu]')
      //           .removeClass(subMenuClass + ' ' + subItemClass + ' has-submenu is-submenu-item submenu')
      //           .removeAttr('data-submenu'));
      // items.each(function(){
      //   var $item = $(this),
      //       $sub = $item.children('ul');
      //   if($item.parent('[data-submenu]').length){
      //     $item.removeClass('is-submenu-item ' + subItemClass);
      //   }
      //   if($sub.length){
      //     $item.removeClass('has-submenu');
      //     $sub.removeClass('submenu ' + subMenuClass).removeAttr('data-submenu');
      //   }
      // });
    }
  };

  Foundation.Nest = Nest;
}(jQuery);
'use strict';

!function ($) {

  function Timer(elem, options, cb) {
    var _this = this,
        duration = options.duration,
        //options is an object for easily adding features later.
    nameSpace = Object.keys(elem.data())[0] || 'timer',
        remain = -1,
        start,
        timer;

    this.isPaused = false;

    this.restart = function () {
      remain = -1;
      clearTimeout(timer);
      this.start();
    };

    this.start = function () {
      this.isPaused = false;
      // if(!elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      remain = remain <= 0 ? duration : remain;
      elem.data('paused', false);
      start = Date.now();
      timer = setTimeout(function () {
        if (options.infinite) {
          _this.restart(); //rerun the timer.
        }
        if (cb && typeof cb === 'function') {
          cb();
        }
      }, remain);
      elem.trigger('timerstart.zf.' + nameSpace);
    };

    this.pause = function () {
      this.isPaused = true;
      //if(elem.data('paused')){ return false; }//maybe implement this sanity check if used for other things.
      clearTimeout(timer);
      elem.data('paused', true);
      var end = Date.now();
      remain = remain - (end - start);
      elem.trigger('timerpaused.zf.' + nameSpace);
    };
  }

  /**
   * Runs a callback function when images are fully loaded.
   * @param {Object} images - Image(s) to check if loaded.
   * @param {Func} callback - Function to execute when image is fully loaded.
   */
  function onImagesLoaded(images, callback) {
    var self = this,
        unloaded = images.length;

    if (unloaded === 0) {
      callback();
    }

    images.each(function () {
      // Check if image is loaded
      if (this.complete || this.readyState === 4 || this.readyState === 'complete') {
        singleImageLoaded();
      }
      // Force load the image
      else {
          // fix for IE. See https://css-tricks.com/snippets/jquery/fixing-load-in-ie-for-cached-images/
          var src = $(this).attr('src');
          $(this).attr('src', src + (src.indexOf('?') >= 0 ? '&' : '?') + new Date().getTime());
          $(this).one('load', function () {
            singleImageLoaded();
          });
        }
    });

    function singleImageLoaded() {
      unloaded--;
      if (unloaded === 0) {
        callback();
      }
    }
  }

  Foundation.Timer = Timer;
  Foundation.onImagesLoaded = onImagesLoaded;
}(jQuery);
'use strict';

//**************************************************
//**Work inspired by multiple jquery swipe plugins**
//**Done by Yohai Ararat ***************************
//**************************************************
(function ($) {

	$.spotSwipe = {
		version: '1.0.0',
		enabled: 'ontouchstart' in document.documentElement,
		preventDefault: false,
		moveThreshold: 75,
		timeThreshold: 200
	};

	var startPosX,
	    startPosY,
	    startTime,
	    elapsedTime,
	    isMoving = false;

	function onTouchEnd() {
		//  alert(this);
		this.removeEventListener('touchmove', onTouchMove);
		this.removeEventListener('touchend', onTouchEnd);
		isMoving = false;
	}

	function onTouchMove(e) {
		if ($.spotSwipe.preventDefault) {
			e.preventDefault();
		}
		if (isMoving) {
			var x = e.touches[0].pageX;
			var y = e.touches[0].pageY;
			var dx = startPosX - x;
			var dy = startPosY - y;
			var dir;
			elapsedTime = new Date().getTime() - startTime;
			if (Math.abs(dx) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
				dir = dx > 0 ? 'left' : 'right';
			}
			// else if(Math.abs(dy) >= $.spotSwipe.moveThreshold && elapsedTime <= $.spotSwipe.timeThreshold) {
			//   dir = dy > 0 ? 'down' : 'up';
			// }
			if (dir) {
				e.preventDefault();
				onTouchEnd.call(this);
				$(this).trigger('swipe', dir).trigger('swipe' + dir);
			}
		}
	}

	function onTouchStart(e) {
		if (e.touches.length == 1) {
			startPosX = e.touches[0].pageX;
			startPosY = e.touches[0].pageY;
			isMoving = true;
			startTime = new Date().getTime();
			this.addEventListener('touchmove', onTouchMove, false);
			this.addEventListener('touchend', onTouchEnd, false);
		}
	}

	function init() {
		this.addEventListener && this.addEventListener('touchstart', onTouchStart, false);
	}

	function teardown() {
		this.removeEventListener('touchstart', onTouchStart);
	}

	$.event.special.swipe = { setup: init };

	$.each(['left', 'up', 'down', 'right'], function () {
		$.event.special['swipe' + this] = { setup: function setup() {
				$(this).on('swipe', $.noop);
			} };
	});
})(jQuery);
/****************************************************
 * Method for adding psuedo drag events to elements *
 ***************************************************/
!function ($) {
	$.fn.addTouch = function () {
		this.each(function (i, el) {
			$(el).bind('touchstart touchmove touchend touchcancel', function () {
				//we pass the original event object because the jQuery event
				//object is normalized to w3c specs and does not provide the TouchList
				handleTouch(event);
			});
		});

		var handleTouch = function handleTouch(event) {
			var touches = event.changedTouches,
			    first = touches[0],
			    eventTypes = {
				touchstart: 'mousedown',
				touchmove: 'mousemove',
				touchend: 'mouseup'
			},
			    type = eventTypes[event.type],
			    simulatedEvent;

			if ('MouseEvent' in window && typeof window.MouseEvent === 'function') {
				simulatedEvent = new window.MouseEvent(type, {
					'bubbles': true,
					'cancelable': true,
					'screenX': first.screenX,
					'screenY': first.screenY,
					'clientX': first.clientX,
					'clientY': first.clientY
				});
			} else {
				simulatedEvent = document.createEvent('MouseEvent');
				simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0 /*left*/, null);
			}
			first.target.dispatchEvent(simulatedEvent);
		};
	};
}(jQuery);

//**********************************
//**From the jQuery Mobile Library**
//**need to recreate functionality**
//**and try to improve if possible**
//**********************************

/* Removing the jQuery function ****
************************************

(function( $, window, undefined ) {

	var $document = $( document ),
		// supportTouch = $.mobile.support.touch,
		touchStartEvent = 'touchstart'//supportTouch ? "touchstart" : "mousedown",
		touchStopEvent = 'touchend'//supportTouch ? "touchend" : "mouseup",
		touchMoveEvent = 'touchmove'//supportTouch ? "touchmove" : "mousemove";

	// setup new event shortcuts
	$.each( ( "touchstart touchmove touchend " +
		"swipe swipeleft swiperight" ).split( " " ), function( i, name ) {

		$.fn[ name ] = function( fn ) {
			return fn ? this.bind( name, fn ) : this.trigger( name );
		};

		// jQuery < 1.8
		if ( $.attrFn ) {
			$.attrFn[ name ] = true;
		}
	});

	function triggerCustomEvent( obj, eventType, event, bubble ) {
		var originalType = event.type;
		event.type = eventType;
		if ( bubble ) {
			$.event.trigger( event, undefined, obj );
		} else {
			$.event.dispatch.call( obj, event );
		}
		event.type = originalType;
	}

	// also handles taphold

	// Also handles swipeleft, swiperight
	$.event.special.swipe = {

		// More than this horizontal displacement, and we will suppress scrolling.
		scrollSupressionThreshold: 30,

		// More time than this, and it isn't a swipe.
		durationThreshold: 1000,

		// Swipe horizontal displacement must be more than this.
		horizontalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		// Swipe vertical displacement must be less than this.
		verticalDistanceThreshold: window.devicePixelRatio >= 2 ? 15 : 30,

		getLocation: function ( event ) {
			var winPageX = window.pageXOffset,
				winPageY = window.pageYOffset,
				x = event.clientX,
				y = event.clientY;

			if ( event.pageY === 0 && Math.floor( y ) > Math.floor( event.pageY ) ||
				event.pageX === 0 && Math.floor( x ) > Math.floor( event.pageX ) ) {

				// iOS4 clientX/clientY have the value that should have been
				// in pageX/pageY. While pageX/page/ have the value 0
				x = x - winPageX;
				y = y - winPageY;
			} else if ( y < ( event.pageY - winPageY) || x < ( event.pageX - winPageX ) ) {

				// Some Android browsers have totally bogus values for clientX/Y
				// when scrolling/zooming a page. Detectable since clientX/clientY
				// should never be smaller than pageX/pageY minus page scroll
				x = event.pageX - winPageX;
				y = event.pageY - winPageY;
			}

			return {
				x: x,
				y: y
			};
		},

		start: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ],
						origin: $( event.target )
					};
		},

		stop: function( event ) {
			var data = event.originalEvent.touches ?
					event.originalEvent.touches[ 0 ] : event,
				location = $.event.special.swipe.getLocation( data );
			return {
						time: ( new Date() ).getTime(),
						coords: [ location.x, location.y ]
					};
		},

		handleSwipe: function( start, stop, thisObject, origTarget ) {
			if ( stop.time - start.time < $.event.special.swipe.durationThreshold &&
				Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.horizontalDistanceThreshold &&
				Math.abs( start.coords[ 1 ] - stop.coords[ 1 ] ) < $.event.special.swipe.verticalDistanceThreshold ) {
				var direction = start.coords[0] > stop.coords[ 0 ] ? "swipeleft" : "swiperight";

				triggerCustomEvent( thisObject, "swipe", $.Event( "swipe", { target: origTarget, swipestart: start, swipestop: stop }), true );
				triggerCustomEvent( thisObject, direction,$.Event( direction, { target: origTarget, swipestart: start, swipestop: stop } ), true );
				return true;
			}
			return false;

		},

		// This serves as a flag to ensure that at most one swipe event event is
		// in work at any given time
		eventInProgress: false,

		setup: function() {
			var events,
				thisObject = this,
				$this = $( thisObject ),
				context = {};

			// Retrieve the events data for this element and add the swipe context
			events = $.data( this, "mobile-events" );
			if ( !events ) {
				events = { length: 0 };
				$.data( this, "mobile-events", events );
			}
			events.length++;
			events.swipe = context;

			context.start = function( event ) {

				// Bail if we're already working on a swipe event
				if ( $.event.special.swipe.eventInProgress ) {
					return;
				}
				$.event.special.swipe.eventInProgress = true;

				var stop,
					start = $.event.special.swipe.start( event ),
					origTarget = event.target,
					emitted = false;

				context.move = function( event ) {
					if ( !start || event.isDefaultPrevented() ) {
						return;
					}

					stop = $.event.special.swipe.stop( event );
					if ( !emitted ) {
						emitted = $.event.special.swipe.handleSwipe( start, stop, thisObject, origTarget );
						if ( emitted ) {

							// Reset the context to make way for the next swipe event
							$.event.special.swipe.eventInProgress = false;
						}
					}
					// prevent scrolling
					if ( Math.abs( start.coords[ 0 ] - stop.coords[ 0 ] ) > $.event.special.swipe.scrollSupressionThreshold ) {
						event.preventDefault();
					}
				};

				context.stop = function() {
						emitted = true;

						// Reset the context to make way for the next swipe event
						$.event.special.swipe.eventInProgress = false;
						$document.off( touchMoveEvent, context.move );
						context.move = null;
				};

				$document.on( touchMoveEvent, context.move )
					.one( touchStopEvent, context.stop );
			};
			$this.on( touchStartEvent, context.start );
		},

		teardown: function() {
			var events, context;

			events = $.data( this, "mobile-events" );
			if ( events ) {
				context = events.swipe;
				delete events.swipe;
				events.length--;
				if ( events.length === 0 ) {
					$.removeData( this, "mobile-events" );
				}
			}

			if ( context ) {
				if ( context.start ) {
					$( this ).off( touchStartEvent, context.start );
				}
				if ( context.move ) {
					$document.off( touchMoveEvent, context.move );
				}
				if ( context.stop ) {
					$document.off( touchStopEvent, context.stop );
				}
			}
		}
	};
	$.each({
		swipeleft: "swipe.left",
		swiperight: "swipe.right"
	}, function( event, sourceEvent ) {

		$.event.special[ event ] = {
			setup: function() {
				$( this ).bind( sourceEvent, $.noop );
			},
			teardown: function() {
				$( this ).unbind( sourceEvent );
			}
		};
	});
})( jQuery, this );
*/
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

!function ($) {

  var MutationObserver = function () {
    var prefixes = ['WebKit', 'Moz', 'O', 'Ms', ''];
    for (var i = 0; i < prefixes.length; i++) {
      if (prefixes[i] + 'MutationObserver' in window) {
        return window[prefixes[i] + 'MutationObserver'];
      }
    }
    return false;
  }();

  var triggers = function triggers(el, type) {
    el.data(type).split(' ').forEach(function (id) {
      $('#' + id)[type === 'close' ? 'trigger' : 'triggerHandler'](type + '.zf.trigger', [el]);
    });
  };
  // Elements with [data-open] will reveal a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-open]', function () {
    triggers($(this), 'open');
  });

  // Elements with [data-close] will close a plugin that supports it when clicked.
  // If used without a value on [data-close], the event will bubble, allowing it to close a parent component.
  $(document).on('click.zf.trigger', '[data-close]', function () {
    var id = $(this).data('close');
    if (id) {
      triggers($(this), 'close');
    } else {
      $(this).trigger('close.zf.trigger');
    }
  });

  // Elements with [data-toggle] will toggle a plugin that supports it when clicked.
  $(document).on('click.zf.trigger', '[data-toggle]', function () {
    var id = $(this).data('toggle');
    if (id) {
      triggers($(this), 'toggle');
    } else {
      $(this).trigger('toggle.zf.trigger');
    }
  });

  // Elements with [data-closable] will respond to close.zf.trigger events.
  $(document).on('close.zf.trigger', '[data-closable]', function (e) {
    e.stopPropagation();
    var animation = $(this).data('closable');

    if (animation !== '') {
      Foundation.Motion.animateOut($(this), animation, function () {
        $(this).trigger('closed.zf');
      });
    } else {
      $(this).fadeOut().trigger('closed.zf');
    }
  });

  $(document).on('focus.zf.trigger blur.zf.trigger', '[data-toggle-focus]', function () {
    var id = $(this).data('toggle-focus');
    $('#' + id).triggerHandler('toggle.zf.trigger', [$(this)]);
  });

  /**
  * Fires once after all other scripts have loaded
  * @function
  * @private
  */
  $(window).on('load', function () {
    checkListeners();
  });

  function checkListeners() {
    eventsListener();
    resizeListener();
    scrollListener();
    closemeListener();
  }

  //******** only fires this function once on load, if there's something to watch ********
  function closemeListener(pluginName) {
    var yetiBoxes = $('[data-yeti-box]'),
        plugNames = ['dropdown', 'tooltip', 'reveal'];

    if (pluginName) {
      if (typeof pluginName === 'string') {
        plugNames.push(pluginName);
      } else if ((typeof pluginName === 'undefined' ? 'undefined' : _typeof(pluginName)) === 'object' && typeof pluginName[0] === 'string') {
        plugNames.concat(pluginName);
      } else {
        console.error('Plugin names must be strings');
      }
    }
    if (yetiBoxes.length) {
      var listeners = plugNames.map(function (name) {
        return 'closeme.zf.' + name;
      }).join(' ');

      $(window).off(listeners).on(listeners, function (e, pluginId) {
        var plugin = e.namespace.split('.')[0];
        var plugins = $('[data-' + plugin + ']').not('[data-yeti-box="' + pluginId + '"]');

        plugins.each(function () {
          var _this = $(this);

          _this.triggerHandler('close.zf.trigger', [_this]);
        });
      });
    }
  }

  function resizeListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-resize]');
    if ($nodes.length) {
      $(window).off('resize.zf.trigger').on('resize.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('resizeme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a resize event
          $nodes.attr('data-events', "resize");
        }, debounce || 10); //default time to emit resize event
      });
    }
  }

  function scrollListener(debounce) {
    var timer = void 0,
        $nodes = $('[data-scroll]');
    if ($nodes.length) {
      $(window).off('scroll.zf.trigger').on('scroll.zf.trigger', function (e) {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(function () {

          if (!MutationObserver) {
            //fallback for IE 9
            $nodes.each(function () {
              $(this).triggerHandler('scrollme.zf.trigger');
            });
          }
          //trigger all listening elements and signal a scroll event
          $nodes.attr('data-events', "scroll");
        }, debounce || 10); //default time to emit scroll event
      });
    }
  }

  function eventsListener() {
    if (!MutationObserver) {
      return false;
    }
    var nodes = document.querySelectorAll('[data-resize], [data-scroll], [data-mutate]');

    //element callback
    var listeningElementsMutation = function listeningElementsMutation(mutationRecordsList) {
      var $target = $(mutationRecordsList[0].target);

      //trigger the event handler for the element depending on type
      switch (mutationRecordsList[0].type) {

        case "attributes":
          if ($target.attr("data-events") === "scroll" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('scrollme.zf.trigger', [$target, window.pageYOffset]);
          }
          if ($target.attr("data-events") === "resize" && mutationRecordsList[0].attributeName === "data-events") {
            $target.triggerHandler('resizeme.zf.trigger', [$target]);
          }
          if (mutationRecordsList[0].attributeName === "style") {
            $target.closest("[data-mutate]").attr("data-events", "mutate");
            $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          }
          break;

        case "childList":
          $target.closest("[data-mutate]").attr("data-events", "mutate");
          $target.closest("[data-mutate]").triggerHandler('mutateme.zf.trigger', [$target.closest("[data-mutate]")]);
          break;

        default:
          return false;
        //nothing
      }
    };

    if (nodes.length) {
      //for each element that needs to listen for resizing, scrolling, or mutation add a single observer
      for (var i = 0; i <= nodes.length - 1; i++) {
        var elementObserver = new MutationObserver(listeningElementsMutation);
        elementObserver.observe(nodes[i], { attributes: true, childList: true, characterData: false, subtree: true, attributeFilter: ["data-events", "style"] });
      }
    }
  }

  // ------------------------------------

  // [PH]
  // Foundation.CheckWatchers = checkWatchers;
  Foundation.IHearYou = checkListeners;
  // Foundation.ISeeYou = scrollListener;
  // Foundation.IFeelYou = closemeListener;
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Accordion module.
   * @module foundation.accordion
   * @requires foundation.util.keyboard
   * @requires foundation.util.motion
   */

  var Accordion = function () {
    /**
     * Creates a new instance of an accordion.
     * @class
     * @fires Accordion#init
     * @param {jQuery} element - jQuery object to make into an accordion.
     * @param {Object} options - a plain object with settings to override the default options.
     */
    function Accordion(element, options) {
      _classCallCheck(this, Accordion);

      this.$element = element;
      this.options = $.extend({}, Accordion.defaults, this.$element.data(), options);

      this._init();

      Foundation.registerPlugin(this, 'Accordion');
      Foundation.Keyboard.register('Accordion', {
        'ENTER': 'toggle',
        'SPACE': 'toggle',
        'ARROW_DOWN': 'next',
        'ARROW_UP': 'previous'
      });
    }

    /**
     * Initializes the accordion by animating the preset active pane(s).
     * @private
     */


    _createClass(Accordion, [{
      key: '_init',
      value: function _init() {
        var _this2 = this;

        this.$element.attr('role', 'tablist');
        this.$tabs = this.$element.children('[data-accordion-item]');

        this.$tabs.each(function (idx, el) {
          var $el = $(el),
              $content = $el.children('[data-tab-content]'),
              id = $content[0].id || Foundation.GetYoDigits(6, 'accordion'),
              linkId = el.id || id + '-label';

          $el.find('a:first').attr({
            'aria-controls': id,
            'role': 'tab',
            'id': linkId,
            'aria-expanded': false,
            'aria-selected': false
          });

          $content.attr({ 'role': 'tabpanel', 'aria-labelledby': linkId, 'aria-hidden': true, 'id': id });
        });
        var $initActive = this.$element.find('.is-active').children('[data-tab-content]');
        this.firstTimeInit = true;
        if ($initActive.length) {
          this.down($initActive, this.firstTimeInit);
          this.firstTimeInit = false;
        }

        this._checkDeepLink = function () {
          var anchor = window.location.hash;
          //need a hash and a relevant anchor in this tabset
          if (anchor.length) {
            var $link = _this2.$element.find('[href$="' + anchor + '"]'),
                $anchor = $(anchor);

            if ($link.length && $anchor) {
              if (!$link.parent('[data-accordion-item]').hasClass('is-active')) {
                _this2.down($anchor, _this2.firstTimeInit);
                _this2.firstTimeInit = false;
              };

              //roll up a little to show the titles
              if (_this2.options.deepLinkSmudge) {
                var _this = _this2;
                $(window).load(function () {
                  var offset = _this.$element.offset();
                  $('html, body').animate({ scrollTop: offset.top }, _this.options.deepLinkSmudgeDelay);
                });
              }

              /**
                * Fires when the zplugin has deeplinked at pageload
                * @event Accordion#deeplink
                */
              _this2.$element.trigger('deeplink.zf.accordion', [$link, $anchor]);
            }
          }
        };

        //use browser to open a tab, if it exists in this tabset
        if (this.options.deepLink) {
          this._checkDeepLink();
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the accordion.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this;

        this.$tabs.each(function () {
          var $elem = $(this);
          var $tabContent = $elem.children('[data-tab-content]');
          if ($tabContent.length) {
            $elem.children('a').off('click.zf.accordion keydown.zf.accordion').on('click.zf.accordion', function (e) {
              e.preventDefault();
              _this.toggle($tabContent);
            }).on('keydown.zf.accordion', function (e) {
              Foundation.Keyboard.handleKey(e, 'Accordion', {
                toggle: function toggle() {
                  _this.toggle($tabContent);
                },
                next: function next() {
                  var $a = $elem.next().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                previous: function previous() {
                  var $a = $elem.prev().find('a').focus();
                  if (!_this.options.multiExpand) {
                    $a.trigger('click.zf.accordion');
                  }
                },
                handled: function handled() {
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            });
          }
        });
        if (this.options.deepLink) {
          $(window).on('popstate', this._checkDeepLink);
        }
      }

      /**
       * Toggles the selected content pane's open/close state.
       * @param {jQuery} $target - jQuery object of the pane to toggle (`.accordion-content`).
       * @function
       */

    }, {
      key: 'toggle',
      value: function toggle($target) {
        if ($target.parent().hasClass('is-active')) {
          this.up($target);
        } else {
          this.down($target);
        }
        //either replace or update browser history
        if (this.options.deepLink) {
          var anchor = $target.prev('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }
      }

      /**
       * Opens the accordion tab defined by `$target`.
       * @param {jQuery} $target - Accordion pane to open (`.accordion-content`).
       * @param {Boolean} firstTime - flag to determine if reflow should happen.
       * @fires Accordion#down
       * @function
       */

    }, {
      key: 'down',
      value: function down($target, firstTime) {
        var _this3 = this;

        $target.attr('aria-hidden', false).parent('[data-tab-content]').addBack().parent().addClass('is-active');

        if (!this.options.multiExpand && !firstTime) {
          var $currentActive = this.$element.children('.is-active').children('[data-tab-content]');
          if ($currentActive.length) {
            this.up($currentActive.not($target));
          }
        }

        $target.slideDown(this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done opening.
           * @event Accordion#down
           */
          _this3.$element.trigger('down.zf.accordion', [$target]);
        });

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': true,
          'aria-selected': true
        });
      }

      /**
       * Closes the tab defined by `$target`.
       * @param {jQuery} $target - Accordion tab to close (`.accordion-content`).
       * @fires Accordion#up
       * @function
       */

    }, {
      key: 'up',
      value: function up($target) {
        var $aunts = $target.parent().siblings(),
            _this = this;

        if (!this.options.allowAllClosed && !$aunts.hasClass('is-active') || !$target.parent().hasClass('is-active')) {
          return;
        }

        // Foundation.Move(this.options.slideSpeed, $target, function(){
        $target.slideUp(_this.options.slideSpeed, function () {
          /**
           * Fires when the tab is done collapsing up.
           * @event Accordion#up
           */
          _this.$element.trigger('up.zf.accordion', [$target]);
        });
        // });

        $target.attr('aria-hidden', true).parent().removeClass('is-active');

        $('#' + $target.attr('aria-labelledby')).attr({
          'aria-expanded': false,
          'aria-selected': false
        });
      }

      /**
       * Destroys an instance of an accordion.
       * @fires Accordion#destroyed
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('[data-tab-content]').stop(true).slideUp(0).css('display', '');
        this.$element.find('a').off('.zf.accordion');
        if (this.options.deepLink) {
          $(window).off('popstate', this._checkDeepLink);
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Accordion;
  }();

  Accordion.defaults = {
    /**
     * Amount of time to animate the opening of an accordion pane.
     * @option
     * @type {number}
     * @default 250
     */
    slideSpeed: 250,
    /**
     * Allow the accordion to have multiple open panes.
     * @option
     * @type {boolean}
     * @default false
     */
    multiExpand: false,
    /**
     * Allow the accordion to close all panes.
     * @option
     * @type {boolean}
     * @default false
     */
    allowAllClosed: false,
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @type {boolean}
     * @default false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the accordion panel is visible
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @type {number}
     * @default 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open accordion
     * @option
     * @type {boolean}
     * @default false
     */
    updateHistory: false
  };

  // Window exports
  Foundation.plugin(Accordion, 'Accordion');
}(jQuery);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Interchange module.
   * @module foundation.interchange
   * @requires foundation.util.mediaQuery
   * @requires foundation.util.timerAndImageLoader
   */

  var Interchange = function () {
    /**
     * Creates a new instance of Interchange.
     * @class
     * @fires Interchange#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Interchange(element, options) {
      _classCallCheck(this, Interchange);

      this.$element = element;
      this.options = $.extend({}, Interchange.defaults, options);
      this.rules = [];
      this.currentPath = '';

      this._init();
      this._events();

      Foundation.registerPlugin(this, 'Interchange');
    }

    /**
     * Initializes the Interchange plugin and calls functions to get interchange functioning on load.
     * @function
     * @private
     */


    _createClass(Interchange, [{
      key: '_init',
      value: function _init() {
        this._addBreakpoints();
        this._generateRules();
        this._reflow();
      }

      /**
       * Initializes events for Interchange.
       * @function
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this2 = this;

        $(window).on('resize.zf.interchange', Foundation.util.throttle(function () {
          _this2._reflow();
        }, 50));
      }

      /**
       * Calls necessary functions to update Interchange upon DOM change
       * @function
       * @private
       */

    }, {
      key: '_reflow',
      value: function _reflow() {
        var match;

        // Iterate through each rule, but only save the last match
        for (var i in this.rules) {
          if (this.rules.hasOwnProperty(i)) {
            var rule = this.rules[i];
            if (window.matchMedia(rule.query).matches) {
              match = rule;
            }
          }
        }

        if (match) {
          this.replace(match.path);
        }
      }

      /**
       * Gets the Foundation breakpoints and adds them to the Interchange.SPECIAL_QUERIES object.
       * @function
       * @private
       */

    }, {
      key: '_addBreakpoints',
      value: function _addBreakpoints() {
        for (var i in Foundation.MediaQuery.queries) {
          if (Foundation.MediaQuery.queries.hasOwnProperty(i)) {
            var query = Foundation.MediaQuery.queries[i];
            Interchange.SPECIAL_QUERIES[query.name] = query.value;
          }
        }
      }

      /**
       * Checks the Interchange element for the provided media query + content pairings
       * @function
       * @private
       * @param {Object} element - jQuery object that is an Interchange instance
       * @returns {Array} scenarios - Array of objects that have 'mq' and 'path' keys with corresponding keys
       */

    }, {
      key: '_generateRules',
      value: function _generateRules(element) {
        var rulesList = [];
        var rules;

        if (this.options.rules) {
          rules = this.options.rules;
        } else {
          rules = this.$element.data('interchange');
        }

        rules = typeof rules === 'string' ? rules.match(/\[.*?\]/g) : rules;

        for (var i in rules) {
          if (rules.hasOwnProperty(i)) {
            var rule = rules[i].slice(1, -1).split(', ');
            var path = rule.slice(0, -1).join('');
            var query = rule[rule.length - 1];

            if (Interchange.SPECIAL_QUERIES[query]) {
              query = Interchange.SPECIAL_QUERIES[query];
            }

            rulesList.push({
              path: path,
              query: query
            });
          }
        }

        this.rules = rulesList;
      }

      /**
       * Update the `src` property of an image, or change the HTML of a container, to the specified path.
       * @function
       * @param {String} path - Path to the image or HTML partial.
       * @fires Interchange#replaced
       */

    }, {
      key: 'replace',
      value: function replace(path) {
        if (this.currentPath === path) return;

        var _this = this,
            trigger = 'replaced.zf.interchange';

        // Replacing images
        if (this.$element[0].nodeName === 'IMG') {
          this.$element.attr('src', path).on('load', function () {
            _this.currentPath = path;
          }).trigger(trigger);
        }
        // Replacing background images
        else if (path.match(/\.(gif|jpg|jpeg|png|svg|tiff)([?#].*)?/i)) {
            this.$element.css({ 'background-image': 'url(' + path + ')' }).trigger(trigger);
          }
          // Replacing HTML
          else {
              $.get(path, function (response) {
                _this.$element.html(response).trigger(trigger);
                $(response).foundation();
                _this.currentPath = path;
              });
            }

        /**
         * Fires when content in an Interchange element is done being loaded.
         * @event Interchange#replaced
         */
        // this.$element.trigger('replaced.zf.interchange');
      }

      /**
       * Destroys an instance of interchange.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        //TODO this.
      }
    }]);

    return Interchange;
  }();

  /**
   * Default settings for plugin
   */


  Interchange.defaults = {
    /**
     * Rules to be applied to Interchange elements. Set with the `data-interchange` array notation.
     * @option
     * @type {?array}
     * @default null
     */
    rules: null
  };

  Interchange.SPECIAL_QUERIES = {
    'landscape': 'screen and (orientation: landscape)',
    'portrait': 'screen and (orientation: portrait)',
    'retina': 'only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx)'
  };

  // Window exports
  Foundation.plugin(Interchange, 'Interchange');
}(jQuery);
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Tabs module.
   * @module foundation.tabs
   * @requires foundation.util.keyboard
   * @requires foundation.util.timerAndImageLoader if tabs contain images
   */

  var Tabs = function () {
    /**
     * Creates a new instance of tabs.
     * @class
     * @fires Tabs#init
     * @param {jQuery} element - jQuery object to make into tabs.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Tabs(element, options) {
      _classCallCheck(this, Tabs);

      this.$element = element;
      this.options = $.extend({}, Tabs.defaults, this.$element.data(), options);

      this._init();
      Foundation.registerPlugin(this, 'Tabs');
      Foundation.Keyboard.register('Tabs', {
        'ENTER': 'open',
        'SPACE': 'open',
        'ARROW_RIGHT': 'next',
        'ARROW_UP': 'previous',
        'ARROW_DOWN': 'next',
        'ARROW_LEFT': 'previous'
        // 'TAB': 'next',
        // 'SHIFT_TAB': 'previous'
      });
    }

    /**
     * Initializes the tabs by showing and focusing (if autoFocus=true) the preset active tab.
     * @private
     */


    _createClass(Tabs, [{
      key: '_init',
      value: function _init() {
        var _this2 = this;

        var _this = this;

        this.$element.attr({ 'role': 'tablist' });
        this.$tabTitles = this.$element.find('.' + this.options.linkClass);
        this.$tabContent = $('[data-tabs-content="' + this.$element[0].id + '"]');

        this.$tabTitles.each(function () {
          var $elem = $(this),
              $link = $elem.find('a'),
              isActive = $elem.hasClass('' + _this.options.linkActiveClass),
              hash = $link[0].hash.slice(1),
              linkId = $link[0].id ? $link[0].id : hash + '-label',
              $tabContent = $('#' + hash);

          $elem.attr({ 'role': 'presentation' });

          $link.attr({
            'role': 'tab',
            'aria-controls': hash,
            'aria-selected': isActive,
            'id': linkId
          });

          $tabContent.attr({
            'role': 'tabpanel',
            'aria-hidden': !isActive,
            'aria-labelledby': linkId
          });

          if (isActive && _this.options.autoFocus) {
            $(window).load(function () {
              $('html, body').animate({ scrollTop: $elem.offset().top }, _this.options.deepLinkSmudgeDelay, function () {
                $link.focus();
              });
            });
          }
        });
        if (this.options.matchHeight) {
          var $images = this.$tabContent.find('img');

          if ($images.length) {
            Foundation.onImagesLoaded($images, this._setHeight.bind(this));
          } else {
            this._setHeight();
          }
        }

        //current context-bound function to open tabs on page load or history popstate
        this._checkDeepLink = function () {
          var anchor = window.location.hash;
          //need a hash and a relevant anchor in this tabset
          if (anchor.length) {
            var $link = _this2.$element.find('[href$="' + anchor + '"]');
            if ($link.length) {
              _this2.selectTab($(anchor), true);

              //roll up a little to show the titles
              if (_this2.options.deepLinkSmudge) {
                var offset = _this2.$element.offset();
                $('html, body').animate({ scrollTop: offset.top }, _this2.options.deepLinkSmudgeDelay);
              }

              /**
                * Fires when the zplugin has deeplinked at pageload
                * @event Tabs#deeplink
                */
              _this2.$element.trigger('deeplink.zf.tabs', [$link, $(anchor)]);
            }
          }
        };

        //use browser to open a tab, if it exists in this tabset
        if (this.options.deepLink) {
          this._checkDeepLink();
        }

        this._events();
      }

      /**
       * Adds event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        this._addKeyHandler();
        this._addClickHandler();
        this._setHeightMqHandler = null;

        if (this.options.matchHeight) {
          this._setHeightMqHandler = this._setHeight.bind(this);

          $(window).on('changed.zf.mediaquery', this._setHeightMqHandler);
        }

        if (this.options.deepLink) {
          $(window).on('popstate', this._checkDeepLink);
        }
      }

      /**
       * Adds click handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addClickHandler',
      value: function _addClickHandler() {
        var _this = this;

        this.$element.off('click.zf.tabs').on('click.zf.tabs', '.' + this.options.linkClass, function (e) {
          e.preventDefault();
          e.stopPropagation();
          _this._handleTabChange($(this));
        });
      }

      /**
       * Adds keyboard event handlers for items within the tabs.
       * @private
       */

    }, {
      key: '_addKeyHandler',
      value: function _addKeyHandler() {
        var _this = this;

        this.$tabTitles.off('keydown.zf.tabs').on('keydown.zf.tabs', function (e) {
          if (e.which === 9) return;

          var $element = $(this),
              $elements = $element.parent('ul').children('li'),
              $prevElement,
              $nextElement;

          $elements.each(function (i) {
            if ($(this).is($element)) {
              if (_this.options.wrapOnKeys) {
                $prevElement = i === 0 ? $elements.last() : $elements.eq(i - 1);
                $nextElement = i === $elements.length - 1 ? $elements.first() : $elements.eq(i + 1);
              } else {
                $prevElement = $elements.eq(Math.max(0, i - 1));
                $nextElement = $elements.eq(Math.min(i + 1, $elements.length - 1));
              }
              return;
            }
          });

          // handle keyboard event with keyboard util
          Foundation.Keyboard.handleKey(e, 'Tabs', {
            open: function open() {
              $element.find('[role="tab"]').focus();
              _this._handleTabChange($element);
            },
            previous: function previous() {
              $prevElement.find('[role="tab"]').focus();
              _this._handleTabChange($prevElement);
            },
            next: function next() {
              $nextElement.find('[role="tab"]').focus();
              _this._handleTabChange($nextElement);
            },
            handled: function handled() {
              e.stopPropagation();
              e.preventDefault();
            }
          });
        });
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`. Collapses active tab.
       * @param {jQuery} $target - Tab to open.
       * @param {boolean} historyHandled - browser has already handled a history update
       * @fires Tabs#change
       * @function
       */

    }, {
      key: '_handleTabChange',
      value: function _handleTabChange($target, historyHandled) {

        /**
         * Check for active class on target. Collapse if exists.
         */
        if ($target.hasClass('' + this.options.linkActiveClass)) {
          if (this.options.activeCollapse) {
            this._collapseTab($target);

            /**
             * Fires when the zplugin has successfully collapsed tabs.
             * @event Tabs#collapse
             */
            this.$element.trigger('collapse.zf.tabs', [$target]);
          }
          return;
        }

        var $oldTab = this.$element.find('.' + this.options.linkClass + '.' + this.options.linkActiveClass),
            $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        //close old tab
        this._collapseTab($oldTab);

        //open new tab
        this._openTab($target);

        //either replace or update browser history
        if (this.options.deepLink && !historyHandled) {
          var anchor = $target.find('a').attr('href');

          if (this.options.updateHistory) {
            history.pushState({}, '', anchor);
          } else {
            history.replaceState({}, '', anchor);
          }
        }

        /**
         * Fires when the plugin has successfully changed tabs.
         * @event Tabs#change
         */
        this.$element.trigger('change.zf.tabs', [$target, $targetContent]);

        //fire to children a mutation event
        $targetContent.find("[data-mutate]").trigger("mutateme.zf.trigger");
      }

      /**
       * Opens the tab `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_openTab',
      value: function _openTab($target) {
        var $tabLink = $target.find('[role="tab"]'),
            hash = $tabLink[0].hash,
            $targetContent = this.$tabContent.find(hash);

        $target.addClass('' + this.options.linkActiveClass);

        $tabLink.attr({ 'aria-selected': 'true' });

        $targetContent.addClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'false' });
      }

      /**
       * Collapses `$targetContent` defined by `$target`.
       * @param {jQuery} $target - Tab to Open.
       * @function
       */

    }, {
      key: '_collapseTab',
      value: function _collapseTab($target) {
        var $target_anchor = $target.removeClass('' + this.options.linkActiveClass).find('[role="tab"]').attr({ 'aria-selected': 'false' });

        $('#' + $target_anchor.attr('aria-controls')).removeClass('' + this.options.panelActiveClass).attr({ 'aria-hidden': 'true' });
      }

      /**
       * Public method for selecting a content pane to display.
       * @param {jQuery | String} elem - jQuery object or string of the id of the pane to display.
       * @param {boolean} historyHandled - browser has already handled a history update
       * @function
       */

    }, {
      key: 'selectTab',
      value: function selectTab(elem, historyHandled) {
        var idStr;

        if ((typeof elem === 'undefined' ? 'undefined' : _typeof(elem)) === 'object') {
          idStr = elem[0].id;
        } else {
          idStr = elem;
        }

        if (idStr.indexOf('#') < 0) {
          idStr = '#' + idStr;
        }

        var $target = this.$tabTitles.find('[href$="' + idStr + '"]').parent('.' + this.options.linkClass);

        this._handleTabChange($target, historyHandled);
      }
    }, {
      key: '_setHeight',

      /**
       * Sets the height of each panel to the height of the tallest panel.
       * If enabled in options, gets called on media query change.
       * If loading content via external source, can be called directly or with _reflow.
       * If enabled with `data-match-height="true"`, tabs sets to equal height
       * @function
       * @private
       */
      value: function _setHeight() {
        var max = 0,
            _this = this; // Lock down the `this` value for the root tabs object

        this.$tabContent.find('.' + this.options.panelClass).css('height', '').each(function () {

          var panel = $(this),
              isActive = panel.hasClass('' + _this.options.panelActiveClass); // get the options from the parent instead of trying to get them from the child

          if (!isActive) {
            panel.css({ 'visibility': 'hidden', 'display': 'block' });
          }

          var temp = this.getBoundingClientRect().height;

          if (!isActive) {
            panel.css({
              'visibility': '',
              'display': ''
            });
          }

          max = temp > max ? temp : max;
        }).css('height', max + 'px');
      }

      /**
       * Destroys an instance of an tabs.
       * @fires Tabs#destroyed
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.find('.' + this.options.linkClass).off('.zf.tabs').hide().end().find('.' + this.options.panelClass).hide();

        if (this.options.matchHeight) {
          if (this._setHeightMqHandler != null) {
            $(window).off('changed.zf.mediaquery', this._setHeightMqHandler);
          }
        }

        if (this.options.deepLink) {
          $(window).off('popstate', this._checkDeepLink);
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Tabs;
  }();

  Tabs.defaults = {
    /**
     * Allows the window to scroll to content of pane specified by hash anchor
     * @option
     * @type {boolean}
     * @default false
     */
    deepLink: false,

    /**
     * Adjust the deep link scroll to make sure the top of the tab panel is visible
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinkSmudge: false,

    /**
     * Animation time (ms) for the deep link adjustment
     * @option
     * @type {number}
     * @default 300
     */
    deepLinkSmudgeDelay: 300,

    /**
     * Update the browser history with the open tab
     * @option
     * @type {boolean}
     * @default false
     */
    updateHistory: false,

    /**
     * Allows the window to scroll to content of active pane on load if set to true.
     * Not recommended if more than one tab panel per page.
     * @option
     * @type {boolean}
     * @default false
     */
    autoFocus: false,

    /**
     * Allows keyboard input to 'wrap' around the tab links.
     * @option
     * @type {boolean}
     * @default true
     */
    wrapOnKeys: true,

    /**
     * Allows the tab content panes to match heights if set to true.
     * @option
     * @type {boolean}
     * @default false
     */
    matchHeight: false,

    /**
     * Allows active tabs to collapse when clicked.
     * @option
     * @type {boolean}
     * @default false
     */
    activeCollapse: false,

    /**
     * Class applied to `li`'s in tab link list.
     * @option
     * @type {string}
     * @default 'tabs-title'
     */
    linkClass: 'tabs-title',

    /**
     * Class applied to the active `li` in tab link list.
     * @option
     * @type {string}
     * @default 'is-active'
     */
    linkActiveClass: 'is-active',

    /**
     * Class applied to the content containers.
     * @option
     * @type {string}
     * @default 'tabs-panel'
     */
    panelClass: 'tabs-panel',

    /**
     * Class applied to the active content container.
     * @option
     * @type {string}
     * @default 'is-active'
     */
    panelActiveClass: 'is-active'
  };

  // Window exports
  Foundation.plugin(Tabs, 'Tabs');
}(jQuery);
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

(function (global, factory) {
    (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : global.LazyLoad = factory();
})(this, function () {
    'use strict';

    var defaultSettings = {
        elements_selector: "img",
        container: window,
        threshold: 300,
        throttle: 150,
        data_src: "original",
        data_srcset: "originalSet",
        class_loading: "loading",
        class_loaded: "loaded",
        class_error: "error",
        class_initial: "initial",
        skip_invisible: true,
        callback_load: null,
        callback_error: null,
        callback_set: null,
        callback_processed: null
    };

    var isBot = !("onscroll" in window) || /glebot/.test(navigator.userAgent);

    var callCallback = function callCallback(callback, argument) {
        if (callback) {
            callback(argument);
        }
    };

    var getTopOffset = function getTopOffset(element) {
        return element.getBoundingClientRect().top + window.pageYOffset - element.ownerDocument.documentElement.clientTop;
    };

    var isBelowViewport = function isBelowViewport(element, container, threshold) {
        var fold = container === window ? window.innerHeight + window.pageYOffset : getTopOffset(container) + container.offsetHeight;
        return fold <= getTopOffset(element) - threshold;
    };

    var getLeftOffset = function getLeftOffset(element) {
        return element.getBoundingClientRect().left + window.pageXOffset - element.ownerDocument.documentElement.clientLeft;
    };

    var isAtRightOfViewport = function isAtRightOfViewport(element, container, threshold) {
        var documentWidth = window.innerWidth;
        var fold = container === window ? documentWidth + window.pageXOffset : getLeftOffset(container) + documentWidth;
        return fold <= getLeftOffset(element) - threshold;
    };

    var isAboveViewport = function isAboveViewport(element, container, threshold) {
        var fold = container === window ? window.pageYOffset : getTopOffset(container);
        return fold >= getTopOffset(element) + threshold + element.offsetHeight;
    };

    var isAtLeftOfViewport = function isAtLeftOfViewport(element, container, threshold) {
        var fold = container === window ? window.pageXOffset : getLeftOffset(container);
        return fold >= getLeftOffset(element) + threshold + element.offsetWidth;
    };

    var isInsideViewport = function isInsideViewport(element, container, threshold) {
        return !isBelowViewport(element, container, threshold) && !isAboveViewport(element, container, threshold) && !isAtRightOfViewport(element, container, threshold) && !isAtLeftOfViewport(element, container, threshold);
    };

    /* Creates instance and notifies it through the window element */
    var createInstance = function createInstance(classObj, options) {
        var instance = new classObj(options);
        var event = new CustomEvent("LazyLoad::Initialized", { detail: { instance: instance } });
        window.dispatchEvent(event);
    };

    /* Auto initialization of one or more instances of lazyload, depending on the 
        options passed in (plain object or an array) */
    var autoInitialize = function autoInitialize(classObj, options) {
        var optsLength = options.length;
        if (!optsLength) {
            // Plain object
            createInstance(classObj, options);
        } else {
            // Array of objects
            for (var i = 0; i < optsLength; i++) {
                createInstance(classObj, options[i]);
            }
        }
    };

    var setSourcesForPicture = function setSourcesForPicture(element, srcsetDataAttribute) {
        var parent = element.parentElement;
        if (parent.tagName !== "PICTURE") {
            return;
        }
        for (var i = 0; i < parent.children.length; i++) {
            var pictureChild = parent.children[i];
            if (pictureChild.tagName === "SOURCE") {
                var sourceSrcset = pictureChild.dataset[srcsetDataAttribute];
                if (sourceSrcset) {
                    pictureChild.setAttribute("srcset", sourceSrcset);
                }
            }
        }
    };

    var setSources = function setSources(element, srcsetDataAttribute, srcDataAttribute) {
        var tagName = element.tagName;
        var elementSrc = element.dataset[srcDataAttribute];
        if (tagName === "IMG") {
            setSourcesForPicture(element, srcsetDataAttribute);
            var imgSrcset = element.dataset[srcsetDataAttribute];
            if (imgSrcset) {
                element.setAttribute("srcset", imgSrcset);
            }
            if (elementSrc) {
                element.setAttribute("src", elementSrc);
            }
            return;
        }
        if (tagName === "IFRAME") {
            if (elementSrc) {
                element.setAttribute("src", elementSrc);
            }
            return;
        }
        if (elementSrc) {
            element.style.backgroundImage = "url(" + elementSrc + ")";
        }
    };

    /*
     * Constructor
     */

    var LazyLoad = function LazyLoad(instanceSettings) {
        this._settings = _extends({}, defaultSettings, instanceSettings);
        this._queryOriginNode = this._settings.container === window ? document : this._settings.container;

        this._previousLoopTime = 0;
        this._loopTimeout = null;
        this._boundHandleScroll = this.handleScroll.bind(this);

        this._isFirstLoop = true;
        window.addEventListener("resize", this._boundHandleScroll);
        this.update();
    };

    LazyLoad.prototype = {

        /*
         * Private methods
         */

        _reveal: function _reveal(element) {
            var settings = this._settings;

            var errorCallback = function errorCallback() {
                /* As this method is asynchronous, it must be protected against external destroy() calls */
                if (!settings) {
                    return;
                }
                element.removeEventListener("load", loadCallback);
                element.removeEventListener("error", errorCallback);
                element.classList.remove(settings.class_loading);
                element.classList.add(settings.class_error);
                callCallback(settings.callback_error, element);
            };

            var loadCallback = function loadCallback() {
                /* As this method is asynchronous, it must be protected against external destroy() calls */
                if (!settings) {
                    return;
                }
                element.classList.remove(settings.class_loading);
                element.classList.add(settings.class_loaded);
                element.removeEventListener("load", loadCallback);
                element.removeEventListener("error", errorCallback);
                /* Calling LOAD callback */
                callCallback(settings.callback_load, element);
            };

            if (element.tagName === "IMG" || element.tagName === "IFRAME") {
                element.addEventListener("load", loadCallback);
                element.addEventListener("error", errorCallback);
                element.classList.add(settings.class_loading);
            }

            setSources(element, settings.data_srcset, settings.data_src);
            /* Calling SET callback */
            callCallback(settings.callback_set, element);
        },

        _loopThroughElements: function _loopThroughElements() {
            var settings = this._settings,
                elements = this._elements,
                elementsLength = !elements ? 0 : elements.length;
            var i = void 0,
                processedIndexes = [],
                firstLoop = this._isFirstLoop;

            for (i = 0; i < elementsLength; i++) {
                var element = elements[i];
                /* If must skip_invisible and element is invisible, skip it */
                if (settings.skip_invisible && element.offsetParent === null) {
                    continue;
                }

                if (isBot || isInsideViewport(element, settings.container, settings.threshold)) {
                    if (firstLoop) {
                        element.classList.add(settings.class_initial);
                    }
                    /* Start loading the image */
                    this._reveal(element);
                    /* Marking the element as processed. */
                    processedIndexes.push(i);
                    element.dataset.wasProcessed = true;
                }
            }
            /* Removing processed elements from this._elements. */
            while (processedIndexes.length > 0) {
                elements.splice(processedIndexes.pop(), 1);
                /* Calling the end loop callback */
                callCallback(settings.callback_processed, elements.length);
            }
            /* Stop listening to scroll event when 0 elements remains */
            if (elementsLength === 0) {
                this._stopScrollHandler();
            }
            /* Sets isFirstLoop to false */
            if (firstLoop) {
                this._isFirstLoop = false;
            }
        },

        _purgeElements: function _purgeElements() {
            var elements = this._elements,
                elementsLength = elements.length;
            var i = void 0,
                elementsToPurge = [];

            for (i = 0; i < elementsLength; i++) {
                var element = elements[i];
                /* If the element has already been processed, skip it */
                if (element.dataset.wasProcessed) {
                    elementsToPurge.push(i);
                }
            }
            /* Removing elements to purge from this._elements. */
            while (elementsToPurge.length > 0) {
                elements.splice(elementsToPurge.pop(), 1);
            }
        },

        _startScrollHandler: function _startScrollHandler() {
            if (!this._isHandlingScroll) {
                this._isHandlingScroll = true;
                this._settings.container.addEventListener("scroll", this._boundHandleScroll);
            }
        },

        _stopScrollHandler: function _stopScrollHandler() {
            if (this._isHandlingScroll) {
                this._isHandlingScroll = false;
                this._settings.container.removeEventListener("scroll", this._boundHandleScroll);
            }
        },

        /* 
         * Public methods
         */

        handleScroll: function handleScroll() {
            var throttle = this._settings.throttle;

            if (throttle !== 0) {
                var getTime = function getTime() {
                    new Date().getTime();
                };
                var now = getTime();
                var remainingTime = throttle - (now - this._previousLoopTime);
                if (remainingTime <= 0 || remainingTime > throttle) {
                    if (this._loopTimeout) {
                        clearTimeout(this._loopTimeout);
                        this._loopTimeout = null;
                    }
                    this._previousLoopTime = now;
                    this._loopThroughElements();
                } else if (!this._loopTimeout) {
                    this._loopTimeout = setTimeout(function () {
                        this._previousLoopTime = getTime();
                        this._loopTimeout = null;
                        this._loopThroughElements();
                    }.bind(this), remainingTime);
                }
            } else {
                this._loopThroughElements();
            }
        },

        update: function update() {
            // Converts to array the nodeset obtained querying the DOM from _queryOriginNode with elements_selector
            this._elements = Array.prototype.slice.call(this._queryOriginNode.querySelectorAll(this._settings.elements_selector));
            this._purgeElements();
            this._loopThroughElements();
            this._startScrollHandler();
        },

        destroy: function destroy() {
            window.removeEventListener("resize", this._boundHandleScroll);
            if (this._loopTimeout) {
                clearTimeout(this._loopTimeout);
                this._loopTimeout = null;
            }
            this._stopScrollHandler();
            this._elements = null;
            this._queryOriginNode = null;
            this._settings = null;
        }
    };

    /* Automatic instances creation if required (useful for async script loading!) */
    var autoInitOptions = window.lazyLoadOptions;
    if (autoInitOptions) {
        autoInitialize(LazyLoad, autoInitOptions);
    }

    return LazyLoad;
});

"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/*!
 * Flickity PACKAGED v2.0.5
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * http://flickity.metafizzy.co
 * Copyright 2016 Metafizzy
 */

!function (t, e) {
  "function" == typeof define && define.amd ? define("jquery-bridget/jquery-bridget", ["jquery"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("jquery")) : t.jQueryBridget = e(t, t.jQuery);
}(window, function (t, e) {
  "use strict";
  function i(i, o, a) {
    function l(t, e, n) {
      var s,
          o = "$()." + i + '("' + e + '")';return t.each(function (t, l) {
        var h = a.data(l, i);if (!h) return void r(i + " not initialized. Cannot call methods, i.e. " + o);var c = h[e];if (!c || "_" == e.charAt(0)) return void r(o + " is not a valid method");var d = c.apply(h, n);s = void 0 === s ? d : s;
      }), void 0 !== s ? s : t;
    }function h(t, e) {
      t.each(function (t, n) {
        var s = a.data(n, i);s ? (s.option(e), s._init()) : (s = new o(n, e), a.data(n, i, s));
      });
    }a = a || e || t.jQuery, a && (o.prototype.option || (o.prototype.option = function (t) {
      a.isPlainObject(t) && (this.options = a.extend(!0, this.options, t));
    }), a.fn[i] = function (t) {
      if ("string" == typeof t) {
        var e = s.call(arguments, 1);return l(this, t, e);
      }return h(this, t), this;
    }, n(a));
  }function n(t) {
    !t || t && t.bridget || (t.bridget = i);
  }var s = Array.prototype.slice,
      o = t.console,
      r = "undefined" == typeof o ? function () {} : function (t) {
    o.error(t);
  };return n(e || t.jQuery), i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("ev-emitter/ev-emitter", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.EvEmitter = e();
}("undefined" != typeof window ? window : undefined, function () {
  function t() {}var e = t.prototype;return e.on = function (t, e) {
    if (t && e) {
      var i = this._events = this._events || {},
          n = i[t] = i[t] || [];return n.indexOf(e) == -1 && n.push(e), this;
    }
  }, e.once = function (t, e) {
    if (t && e) {
      this.on(t, e);var i = this._onceEvents = this._onceEvents || {},
          n = i[t] = i[t] || {};return n[e] = !0, this;
    }
  }, e.off = function (t, e) {
    var i = this._events && this._events[t];if (i && i.length) {
      var n = i.indexOf(e);return n != -1 && i.splice(n, 1), this;
    }
  }, e.emitEvent = function (t, e) {
    var i = this._events && this._events[t];if (i && i.length) {
      var n = 0,
          s = i[n];e = e || [];for (var o = this._onceEvents && this._onceEvents[t]; s;) {
        var r = o && o[s];r && (this.off(t, s), delete o[s]), s.apply(this, e), n += r ? 0 : 1, s = i[n];
      }return this;
    }
  }, t;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("get-size/get-size", [], function () {
    return e();
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.getSize = e();
}(window, function () {
  "use strict";
  function t(t) {
    var e = parseFloat(t),
        i = t.indexOf("%") == -1 && !isNaN(e);return i && e;
  }function e() {}function i() {
    for (var t = { width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0 }, e = 0; e < h; e++) {
      var i = l[e];t[i] = 0;
    }return t;
  }function n(t) {
    var e = getComputedStyle(t);return e || a("Style returned " + e + ". Are you running this code in a hidden iframe on Firefox? See http://bit.ly/getsizebug1"), e;
  }function s() {
    if (!c) {
      c = !0;var e = document.createElement("div");e.style.width = "200px", e.style.padding = "1px 2px 3px 4px", e.style.borderStyle = "solid", e.style.borderWidth = "1px 2px 3px 4px", e.style.boxSizing = "border-box";var i = document.body || document.documentElement;i.appendChild(e);var s = n(e);o.isBoxSizeOuter = r = 200 == t(s.width), i.removeChild(e);
    }
  }function o(e) {
    if (s(), "string" == typeof e && (e = document.querySelector(e)), e && "object" == (typeof e === "undefined" ? "undefined" : _typeof(e)) && e.nodeType) {
      var o = n(e);if ("none" == o.display) return i();var a = {};a.width = e.offsetWidth, a.height = e.offsetHeight;for (var c = a.isBorderBox = "border-box" == o.boxSizing, d = 0; d < h; d++) {
        var u = l[d],
            f = o[u],
            p = parseFloat(f);a[u] = isNaN(p) ? 0 : p;
      }var v = a.paddingLeft + a.paddingRight,
          g = a.paddingTop + a.paddingBottom,
          m = a.marginLeft + a.marginRight,
          y = a.marginTop + a.marginBottom,
          S = a.borderLeftWidth + a.borderRightWidth,
          E = a.borderTopWidth + a.borderBottomWidth,
          b = c && r,
          x = t(o.width);x !== !1 && (a.width = x + (b ? 0 : v + S));var C = t(o.height);return C !== !1 && (a.height = C + (b ? 0 : g + E)), a.innerWidth = a.width - (v + S), a.innerHeight = a.height - (g + E), a.outerWidth = a.width + m, a.outerHeight = a.height + y, a;
    }
  }var r,
      a = "undefined" == typeof console ? e : function (t) {
    console.error(t);
  },
      l = ["paddingLeft", "paddingRight", "paddingTop", "paddingBottom", "marginLeft", "marginRight", "marginTop", "marginBottom", "borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth"],
      h = l.length,
      c = !1;return o;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("desandro-matches-selector/matches-selector", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : t.matchesSelector = e();
}(window, function () {
  "use strict";
  var t = function () {
    var t = Element.prototype;if (t.matches) return "matches";if (t.matchesSelector) return "matchesSelector";for (var e = ["webkit", "moz", "ms", "o"], i = 0; i < e.length; i++) {
      var n = e[i],
          s = n + "MatchesSelector";if (t[s]) return s;
    }
  }();return function (e, i) {
    return e[t](i);
  };
}), function (t, e) {
  "function" == typeof define && define.amd ? define("fizzy-ui-utils/utils", ["desandro-matches-selector/matches-selector"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("desandro-matches-selector")) : t.fizzyUIUtils = e(t, t.matchesSelector);
}(window, function (t, e) {
  var i = {};i.extend = function (t, e) {
    for (var i in e) {
      t[i] = e[i];
    }return t;
  }, i.modulo = function (t, e) {
    return (t % e + e) % e;
  }, i.makeArray = function (t) {
    var e = [];if (Array.isArray(t)) e = t;else if (t && "number" == typeof t.length) for (var i = 0; i < t.length; i++) {
      e.push(t[i]);
    } else e.push(t);return e;
  }, i.removeFrom = function (t, e) {
    var i = t.indexOf(e);i != -1 && t.splice(i, 1);
  }, i.getParent = function (t, i) {
    for (; t != document.body;) {
      if (t = t.parentNode, e(t, i)) return t;
    }
  }, i.getQueryElement = function (t) {
    return "string" == typeof t ? document.querySelector(t) : t;
  }, i.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, i.filterFindElements = function (t, n) {
    t = i.makeArray(t);var s = [];return t.forEach(function (t) {
      if (t instanceof HTMLElement) {
        if (!n) return void s.push(t);e(t, n) && s.push(t);for (var i = t.querySelectorAll(n), o = 0; o < i.length; o++) {
          s.push(i[o]);
        }
      }
    }), s;
  }, i.debounceMethod = function (t, e, i) {
    var n = t.prototype[e],
        s = e + "Timeout";t.prototype[e] = function () {
      var t = this[s];t && clearTimeout(t);var e = arguments,
          o = this;this[s] = setTimeout(function () {
        n.apply(o, e), delete o[s];
      }, i || 100);
    };
  }, i.docReady = function (t) {
    var e = document.readyState;"complete" == e || "interactive" == e ? setTimeout(t) : document.addEventListener("DOMContentLoaded", t);
  }, i.toDashed = function (t) {
    return t.replace(/(.)([A-Z])/g, function (t, e, i) {
      return e + "-" + i;
    }).toLowerCase();
  };var n = t.console;return i.htmlInit = function (e, s) {
    i.docReady(function () {
      var o = i.toDashed(s),
          r = "data-" + o,
          a = document.querySelectorAll("[" + r + "]"),
          l = document.querySelectorAll(".js-" + o),
          h = i.makeArray(a).concat(i.makeArray(l)),
          c = r + "-options",
          d = t.jQuery;h.forEach(function (t) {
        var i,
            o = t.getAttribute(r) || t.getAttribute(c);try {
          i = o && JSON.parse(o);
        } catch (a) {
          return void (n && n.error("Error parsing " + r + " on " + t.className + ": " + a));
        }var l = new e(t, i);d && d.data(t, s, l);
      });
    });
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/cell", ["get-size/get-size"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("get-size")) : (t.Flickity = t.Flickity || {}, t.Flickity.Cell = e(t, t.getSize));
}(window, function (t, e) {
  function i(t, e) {
    this.element = t, this.parent = e, this.create();
  }var n = i.prototype;return n.create = function () {
    this.element.style.position = "absolute", this.x = 0, this.shift = 0;
  }, n.destroy = function () {
    this.element.style.position = "";var t = this.parent.originSide;this.element.style[t] = "";
  }, n.getSize = function () {
    this.size = e(this.element);
  }, n.setPosition = function (t) {
    this.x = t, this.updateTarget(), this.renderPosition(t);
  }, n.updateTarget = n.setDefaultTarget = function () {
    var t = "left" == this.parent.originSide ? "marginLeft" : "marginRight";this.target = this.x + this.size[t] + this.size.width * this.parent.cellAlign;
  }, n.renderPosition = function (t) {
    var e = this.parent.originSide;this.element.style[e] = this.parent.getPositionValue(t);
  }, n.wrapShift = function (t) {
    this.shift = t, this.renderPosition(this.x + this.parent.slideableWidth * t);
  }, n.remove = function () {
    this.element.parentNode.removeChild(this.element);
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/slide", e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e() : (t.Flickity = t.Flickity || {}, t.Flickity.Slide = e());
}(window, function () {
  "use strict";
  function t(t) {
    this.parent = t, this.isOriginLeft = "left" == t.originSide, this.cells = [], this.outerWidth = 0, this.height = 0;
  }var e = t.prototype;return e.addCell = function (t) {
    if (this.cells.push(t), this.outerWidth += t.size.outerWidth, this.height = Math.max(t.size.outerHeight, this.height), 1 == this.cells.length) {
      this.x = t.x;var e = this.isOriginLeft ? "marginLeft" : "marginRight";this.firstMargin = t.size[e];
    }
  }, e.updateTarget = function () {
    var t = this.isOriginLeft ? "marginRight" : "marginLeft",
        e = this.getLastCell(),
        i = e ? e.size[t] : 0,
        n = this.outerWidth - (this.firstMargin + i);this.target = this.x + this.firstMargin + n * this.parent.cellAlign;
  }, e.getLastCell = function () {
    return this.cells[this.cells.length - 1];
  }, e.select = function () {
    this.changeSelectedClass("add");
  }, e.unselect = function () {
    this.changeSelectedClass("remove");
  }, e.changeSelectedClass = function (t) {
    this.cells.forEach(function (e) {
      e.element.classList[t]("is-selected");
    });
  }, e.getCellElements = function () {
    return this.cells.map(function (t) {
      return t.element;
    });
  }, t;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/animate", ["fizzy-ui-utils/utils"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("fizzy-ui-utils")) : (t.Flickity = t.Flickity || {}, t.Flickity.animatePrototype = e(t, t.fizzyUIUtils));
}(window, function (t, e) {
  var i = t.requestAnimationFrame || t.webkitRequestAnimationFrame,
      n = 0;i || (i = function i(t) {
    var e = new Date().getTime(),
        i = Math.max(0, 16 - (e - n)),
        s = setTimeout(t, i);return n = e + i, s;
  });var s = {};s.startAnimation = function () {
    this.isAnimating || (this.isAnimating = !0, this.restingFrames = 0, this.animate());
  }, s.animate = function () {
    this.applyDragForce(), this.applySelectedAttraction();var t = this.x;if (this.integratePhysics(), this.positionSlider(), this.settle(t), this.isAnimating) {
      var e = this;i(function () {
        e.animate();
      });
    }
  };var o = function () {
    var t = document.documentElement.style;return "string" == typeof t.transform ? "transform" : "WebkitTransform";
  }();return s.positionSlider = function () {
    var t = this.x;this.options.wrapAround && this.cells.length > 1 && (t = e.modulo(t, this.slideableWidth), t -= this.slideableWidth, this.shiftWrapCells(t)), t += this.cursorPosition, t = this.options.rightToLeft && o ? -t : t;var i = this.getPositionValue(t);this.slider.style[o] = this.isAnimating ? "translate3d(" + i + ",0,0)" : "translateX(" + i + ")";var n = this.slides[0];if (n) {
      var s = -this.x - n.target,
          r = s / this.slidesWidth;this.dispatchEvent("scroll", null, [r, s]);
    }
  }, s.positionSliderAtSelected = function () {
    this.cells.length && (this.x = -this.selectedSlide.target, this.positionSlider());
  }, s.getPositionValue = function (t) {
    return this.options.percentPosition ? .01 * Math.round(t / this.size.innerWidth * 1e4) + "%" : Math.round(t) + "px";
  }, s.settle = function (t) {
    this.isPointerDown || Math.round(100 * this.x) != Math.round(100 * t) || this.restingFrames++, this.restingFrames > 2 && (this.isAnimating = !1, delete this.isFreeScrolling, this.positionSlider(), this.dispatchEvent("settle"));
  }, s.shiftWrapCells = function (t) {
    var e = this.cursorPosition + t;this._shiftCells(this.beforeShiftCells, e, -1);var i = this.size.innerWidth - (t + this.slideableWidth + this.cursorPosition);this._shiftCells(this.afterShiftCells, i, 1);
  }, s._shiftCells = function (t, e, i) {
    for (var n = 0; n < t.length; n++) {
      var s = t[n],
          o = e > 0 ? i : 0;s.wrapShift(o), e -= s.size.outerWidth;
    }
  }, s._unshiftCells = function (t) {
    if (t && t.length) for (var e = 0; e < t.length; e++) {
      t[e].wrapShift(0);
    }
  }, s.integratePhysics = function () {
    this.x += this.velocity, this.velocity *= this.getFrictionFactor();
  }, s.applyForce = function (t) {
    this.velocity += t;
  }, s.getFrictionFactor = function () {
    return 1 - this.options[this.isFreeScrolling ? "freeScrollFriction" : "friction"];
  }, s.getRestingPosition = function () {
    return this.x + this.velocity / (1 - this.getFrictionFactor());
  }, s.applyDragForce = function () {
    if (this.isPointerDown) {
      var t = this.dragX - this.x,
          e = t - this.velocity;this.applyForce(e);
    }
  }, s.applySelectedAttraction = function () {
    if (!this.isPointerDown && !this.isFreeScrolling && this.cells.length) {
      var t = this.selectedSlide.target * -1 - this.x,
          e = t * this.options.selectedAttraction;this.applyForce(e);
    }
  }, s;
}), function (t, e) {
  if ("function" == typeof define && define.amd) define("flickity/js/flickity", ["ev-emitter/ev-emitter", "get-size/get-size", "fizzy-ui-utils/utils", "./cell", "./slide", "./animate"], function (i, n, s, o, r, a) {
    return e(t, i, n, s, o, r, a);
  });else if ("object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports) module.exports = e(t, require("ev-emitter"), require("get-size"), require("fizzy-ui-utils"), require("./cell"), require("./slide"), require("./animate"));else {
    var i = t.Flickity;t.Flickity = e(t, t.EvEmitter, t.getSize, t.fizzyUIUtils, i.Cell, i.Slide, i.animatePrototype);
  }
}(window, function (t, e, i, n, s, o, r) {
  function a(t, e) {
    for (t = n.makeArray(t); t.length;) {
      e.appendChild(t.shift());
    }
  }function l(t, e) {
    var i = n.getQueryElement(t);if (!i) return void (d && d.error("Bad element for Flickity: " + (i || t)));if (this.element = i, this.element.flickityGUID) {
      var s = f[this.element.flickityGUID];return s.option(e), s;
    }h && (this.$element = h(this.element)), this.options = n.extend({}, this.constructor.defaults), this.option(e), this._create();
  }var h = t.jQuery,
      c = t.getComputedStyle,
      d = t.console,
      u = 0,
      f = {};l.defaults = { accessibility: !0, cellAlign: "center", freeScrollFriction: .075, friction: .28, namespaceJQueryEvents: !0, percentPosition: !0, resize: !0, selectedAttraction: .025, setGallerySize: !0 }, l.createMethods = [];var p = l.prototype;n.extend(p, e.prototype), p._create = function () {
    var e = this.guid = ++u;this.element.flickityGUID = e, f[e] = this, this.selectedIndex = 0, this.restingFrames = 0, this.x = 0, this.velocity = 0, this.originSide = this.options.rightToLeft ? "right" : "left", this.viewport = document.createElement("div"), this.viewport.className = "flickity-viewport", this._createSlider(), (this.options.resize || this.options.watchCSS) && t.addEventListener("resize", this), l.createMethods.forEach(function (t) {
      this[t]();
    }, this), this.options.watchCSS ? this.watchCSS() : this.activate();
  }, p.option = function (t) {
    n.extend(this.options, t);
  }, p.activate = function () {
    if (!this.isActive) {
      this.isActive = !0, this.element.classList.add("flickity-enabled"), this.options.rightToLeft && this.element.classList.add("flickity-rtl"), this.getSize();var t = this._filterFindCellElements(this.element.children);a(t, this.slider), this.viewport.appendChild(this.slider), this.element.appendChild(this.viewport), this.reloadCells(), this.options.accessibility && (this.element.tabIndex = 0, this.element.addEventListener("keydown", this)), this.emitEvent("activate");var e,
          i = this.options.initialIndex;e = this.isInitActivated ? this.selectedIndex : void 0 !== i && this.cells[i] ? i : 0, this.select(e, !1, !0), this.isInitActivated = !0;
    }
  }, p._createSlider = function () {
    var t = document.createElement("div");t.className = "flickity-slider", t.style[this.originSide] = 0, this.slider = t;
  }, p._filterFindCellElements = function (t) {
    return n.filterFindElements(t, this.options.cellSelector);
  }, p.reloadCells = function () {
    this.cells = this._makeCells(this.slider.children), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize();
  }, p._makeCells = function (t) {
    var e = this._filterFindCellElements(t),
        i = e.map(function (t) {
      return new s(t, this);
    }, this);return i;
  }, p.getLastCell = function () {
    return this.cells[this.cells.length - 1];
  }, p.getLastSlide = function () {
    return this.slides[this.slides.length - 1];
  }, p.positionCells = function () {
    this._sizeCells(this.cells), this._positionCells(0);
  }, p._positionCells = function (t) {
    t = t || 0, this.maxCellHeight = t ? this.maxCellHeight || 0 : 0;var e = 0;if (t > 0) {
      var i = this.cells[t - 1];e = i.x + i.size.outerWidth;
    }for (var n = this.cells.length, s = t; s < n; s++) {
      var o = this.cells[s];o.setPosition(e), e += o.size.outerWidth, this.maxCellHeight = Math.max(o.size.outerHeight, this.maxCellHeight);
    }this.slideableWidth = e, this.updateSlides(), this._containSlides(), this.slidesWidth = n ? this.getLastSlide().target - this.slides[0].target : 0;
  }, p._sizeCells = function (t) {
    t.forEach(function (t) {
      t.getSize();
    });
  }, p.updateSlides = function () {
    if (this.slides = [], this.cells.length) {
      var t = new o(this);this.slides.push(t);var e = "left" == this.originSide,
          i = e ? "marginRight" : "marginLeft",
          n = this._getCanCellFit();this.cells.forEach(function (e, s) {
        if (!t.cells.length) return void t.addCell(e);var r = t.outerWidth - t.firstMargin + (e.size.outerWidth - e.size[i]);n.call(this, s, r) ? t.addCell(e) : (t.updateTarget(), t = new o(this), this.slides.push(t), t.addCell(e));
      }, this), t.updateTarget(), this.updateSelectedSlide();
    }
  }, p._getCanCellFit = function () {
    var t = this.options.groupCells;if (!t) return function () {
      return !1;
    };if ("number" == typeof t) {
      var e = parseInt(t, 10);return function (t) {
        return t % e !== 0;
      };
    }var i = "string" == typeof t && t.match(/^(\d+)%$/),
        n = i ? parseInt(i[1], 10) / 100 : 1;return function (t, e) {
      return e <= (this.size.innerWidth + 1) * n;
    };
  }, p._init = p.reposition = function () {
    this.positionCells(), this.positionSliderAtSelected();
  }, p.getSize = function () {
    this.size = i(this.element), this.setCellAlign(), this.cursorPosition = this.size.innerWidth * this.cellAlign;
  };var v = { center: { left: .5, right: .5 }, left: { left: 0, right: 1 }, right: { right: 0, left: 1 } };return p.setCellAlign = function () {
    var t = v[this.options.cellAlign];this.cellAlign = t ? t[this.originSide] : this.options.cellAlign;
  }, p.setGallerySize = function () {
    if (this.options.setGallerySize) {
      var t = this.options.adaptiveHeight && this.selectedSlide ? this.selectedSlide.height : this.maxCellHeight;this.viewport.style.height = t + "px";
    }
  }, p._getWrapShiftCells = function () {
    if (this.options.wrapAround) {
      this._unshiftCells(this.beforeShiftCells), this._unshiftCells(this.afterShiftCells);var t = this.cursorPosition,
          e = this.cells.length - 1;this.beforeShiftCells = this._getGapCells(t, e, -1), t = this.size.innerWidth - this.cursorPosition, this.afterShiftCells = this._getGapCells(t, 0, 1);
    }
  }, p._getGapCells = function (t, e, i) {
    for (var n = []; t > 0;) {
      var s = this.cells[e];if (!s) break;n.push(s), e += i, t -= s.size.outerWidth;
    }return n;
  }, p._containSlides = function () {
    if (this.options.contain && !this.options.wrapAround && this.cells.length) {
      var t = this.options.rightToLeft,
          e = t ? "marginRight" : "marginLeft",
          i = t ? "marginLeft" : "marginRight",
          n = this.slideableWidth - this.getLastCell().size[i],
          s = n < this.size.innerWidth,
          o = this.cursorPosition + this.cells[0].size[e],
          r = n - this.size.innerWidth * (1 - this.cellAlign);this.slides.forEach(function (t) {
        s ? t.target = n * this.cellAlign : (t.target = Math.max(t.target, o), t.target = Math.min(t.target, r));
      }, this);
    }
  }, p.dispatchEvent = function (t, e, i) {
    var n = e ? [e].concat(i) : i;if (this.emitEvent(t, n), h && this.$element) {
      t += this.options.namespaceJQueryEvents ? ".flickity" : "";var s = t;if (e) {
        var o = h.Event(e);o.type = t, s = o;
      }this.$element.trigger(s, i);
    }
  }, p.select = function (t, e, i) {
    this.isActive && (t = parseInt(t, 10), this._wrapSelect(t), (this.options.wrapAround || e) && (t = n.modulo(t, this.slides.length)), this.slides[t] && (this.selectedIndex = t, this.updateSelectedSlide(), i ? this.positionSliderAtSelected() : this.startAnimation(), this.options.adaptiveHeight && this.setGallerySize(), this.dispatchEvent("select"), this.dispatchEvent("cellSelect")));
  }, p._wrapSelect = function (t) {
    var e = this.slides.length,
        i = this.options.wrapAround && e > 1;if (!i) return t;var s = n.modulo(t, e),
        o = Math.abs(s - this.selectedIndex),
        r = Math.abs(s + e - this.selectedIndex),
        a = Math.abs(s - e - this.selectedIndex);!this.isDragSelect && r < o ? t += e : !this.isDragSelect && a < o && (t -= e), t < 0 ? this.x -= this.slideableWidth : t >= e && (this.x += this.slideableWidth);
  }, p.previous = function (t, e) {
    this.select(this.selectedIndex - 1, t, e);
  }, p.next = function (t, e) {
    this.select(this.selectedIndex + 1, t, e);
  }, p.updateSelectedSlide = function () {
    var t = this.slides[this.selectedIndex];t && (this.unselectSelectedSlide(), this.selectedSlide = t, t.select(), this.selectedCells = t.cells, this.selectedElements = t.getCellElements(), this.selectedCell = t.cells[0], this.selectedElement = this.selectedElements[0]);
  }, p.unselectSelectedSlide = function () {
    this.selectedSlide && this.selectedSlide.unselect();
  }, p.selectCell = function (t, e, i) {
    var n;"number" == typeof t ? n = this.cells[t] : ("string" == typeof t && (t = this.element.querySelector(t)), n = this.getCell(t));for (var s = 0; n && s < this.slides.length; s++) {
      var o = this.slides[s],
          r = o.cells.indexOf(n);if (r != -1) return void this.select(s, e, i);
    }
  }, p.getCell = function (t) {
    for (var e = 0; e < this.cells.length; e++) {
      var i = this.cells[e];if (i.element == t) return i;
    }
  }, p.getCells = function (t) {
    t = n.makeArray(t);var e = [];return t.forEach(function (t) {
      var i = this.getCell(t);i && e.push(i);
    }, this), e;
  }, p.getCellElements = function () {
    return this.cells.map(function (t) {
      return t.element;
    });
  }, p.getParentCell = function (t) {
    var e = this.getCell(t);return e ? e : (t = n.getParent(t, ".flickity-slider > *"), this.getCell(t));
  }, p.getAdjacentCellElements = function (t, e) {
    if (!t) return this.selectedSlide.getCellElements();e = void 0 === e ? this.selectedIndex : e;var i = this.slides.length;if (1 + 2 * t >= i) return this.getCellElements();for (var s = [], o = e - t; o <= e + t; o++) {
      var r = this.options.wrapAround ? n.modulo(o, i) : o,
          a = this.slides[r];a && (s = s.concat(a.getCellElements()));
    }return s;
  }, p.uiChange = function () {
    this.emitEvent("uiChange");
  }, p.childUIPointerDown = function (t) {
    this.emitEvent("childUIPointerDown", [t]);
  }, p.onresize = function () {
    this.watchCSS(), this.resize();
  }, n.debounceMethod(l, "onresize", 150), p.resize = function () {
    if (this.isActive) {
      this.getSize(), this.options.wrapAround && (this.x = n.modulo(this.x, this.slideableWidth)), this.positionCells(), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("resize");var t = this.selectedElements && this.selectedElements[0];this.selectCell(t, !1, !0);
    }
  }, p.watchCSS = function () {
    var t = this.options.watchCSS;if (t) {
      var e = c(this.element, ":after").content;e.indexOf("flickity") != -1 ? this.activate() : this.deactivate();
    }
  }, p.onkeydown = function (t) {
    if (this.options.accessibility && (!document.activeElement || document.activeElement == this.element)) if (37 == t.keyCode) {
      var e = this.options.rightToLeft ? "next" : "previous";this.uiChange(), this[e]();
    } else if (39 == t.keyCode) {
      var i = this.options.rightToLeft ? "previous" : "next";this.uiChange(), this[i]();
    }
  }, p.deactivate = function () {
    this.isActive && (this.element.classList.remove("flickity-enabled"), this.element.classList.remove("flickity-rtl"), this.cells.forEach(function (t) {
      t.destroy();
    }), this.unselectSelectedSlide(), this.element.removeChild(this.viewport), a(this.slider.children, this.element), this.options.accessibility && (this.element.removeAttribute("tabIndex"), this.element.removeEventListener("keydown", this)), this.isActive = !1, this.emitEvent("deactivate"));
  }, p.destroy = function () {
    this.deactivate(), t.removeEventListener("resize", this), this.emitEvent("destroy"), h && this.$element && h.removeData(this.element, "flickity"), delete this.element.flickityGUID, delete f[this.guid];
  }, n.extend(p, r), l.data = function (t) {
    t = n.getQueryElement(t);var e = t && t.flickityGUID;return e && f[e];
  }, n.htmlInit(l, "flickity"), h && h.bridget && h.bridget("flickity", l), l.Cell = s, l;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("unipointer/unipointer", ["ev-emitter/ev-emitter"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("ev-emitter")) : t.Unipointer = e(t, t.EvEmitter);
}(window, function (t, e) {
  function i() {}function n() {}var s = n.prototype = Object.create(e.prototype);s.bindStartEvent = function (t) {
    this._bindStartEvent(t, !0);
  }, s.unbindStartEvent = function (t) {
    this._bindStartEvent(t, !1);
  }, s._bindStartEvent = function (e, i) {
    i = void 0 === i || !!i;var n = i ? "addEventListener" : "removeEventListener";t.navigator.pointerEnabled ? e[n]("pointerdown", this) : t.navigator.msPointerEnabled ? e[n]("MSPointerDown", this) : (e[n]("mousedown", this), e[n]("touchstart", this));
  }, s.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, s.getTouch = function (t) {
    for (var e = 0; e < t.length; e++) {
      var i = t[e];if (i.identifier == this.pointerIdentifier) return i;
    }
  }, s.onmousedown = function (t) {
    var e = t.button;e && 0 !== e && 1 !== e || this._pointerDown(t, t);
  }, s.ontouchstart = function (t) {
    this._pointerDown(t, t.changedTouches[0]);
  }, s.onMSPointerDown = s.onpointerdown = function (t) {
    this._pointerDown(t, t);
  }, s._pointerDown = function (t, e) {
    this.isPointerDown || (this.isPointerDown = !0, this.pointerIdentifier = void 0 !== e.pointerId ? e.pointerId : e.identifier, this.pointerDown(t, e));
  }, s.pointerDown = function (t, e) {
    this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e]);
  };var o = { mousedown: ["mousemove", "mouseup"], touchstart: ["touchmove", "touchend", "touchcancel"], pointerdown: ["pointermove", "pointerup", "pointercancel"], MSPointerDown: ["MSPointerMove", "MSPointerUp", "MSPointerCancel"] };return s._bindPostStartEvents = function (e) {
    if (e) {
      var i = o[e.type];i.forEach(function (e) {
        t.addEventListener(e, this);
      }, this), this._boundPointerEvents = i;
    }
  }, s._unbindPostStartEvents = function () {
    this._boundPointerEvents && (this._boundPointerEvents.forEach(function (e) {
      t.removeEventListener(e, this);
    }, this), delete this._boundPointerEvents);
  }, s.onmousemove = function (t) {
    this._pointerMove(t, t);
  }, s.onMSPointerMove = s.onpointermove = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerMove(t, t);
  }, s.ontouchmove = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerMove(t, e);
  }, s._pointerMove = function (t, e) {
    this.pointerMove(t, e);
  }, s.pointerMove = function (t, e) {
    this.emitEvent("pointerMove", [t, e]);
  }, s.onmouseup = function (t) {
    this._pointerUp(t, t);
  }, s.onMSPointerUp = s.onpointerup = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerUp(t, t);
  }, s.ontouchend = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerUp(t, e);
  }, s._pointerUp = function (t, e) {
    this._pointerDone(), this.pointerUp(t, e);
  }, s.pointerUp = function (t, e) {
    this.emitEvent("pointerUp", [t, e]);
  }, s._pointerDone = function () {
    this.isPointerDown = !1, delete this.pointerIdentifier, this._unbindPostStartEvents(), this.pointerDone();
  }, s.pointerDone = i, s.onMSPointerCancel = s.onpointercancel = function (t) {
    t.pointerId == this.pointerIdentifier && this._pointerCancel(t, t);
  }, s.ontouchcancel = function (t) {
    var e = this.getTouch(t.changedTouches);e && this._pointerCancel(t, e);
  }, s._pointerCancel = function (t, e) {
    this._pointerDone(), this.pointerCancel(t, e);
  }, s.pointerCancel = function (t, e) {
    this.emitEvent("pointerCancel", [t, e]);
  }, n.getPointerPoint = function (t) {
    return { x: t.pageX, y: t.pageY };
  }, n;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("unidragger/unidragger", ["unipointer/unipointer"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("unipointer")) : t.Unidragger = e(t, t.Unipointer);
}(window, function (t, e) {
  function i() {}function n() {}var s = n.prototype = Object.create(e.prototype);s.bindHandles = function () {
    this._bindHandles(!0);
  }, s.unbindHandles = function () {
    this._bindHandles(!1);
  };var o = t.navigator;return s._bindHandles = function (t) {
    t = void 0 === t || !!t;var e;e = o.pointerEnabled ? function (e) {
      e.style.touchAction = t ? "none" : "";
    } : o.msPointerEnabled ? function (e) {
      e.style.msTouchAction = t ? "none" : "";
    } : i;for (var n = t ? "addEventListener" : "removeEventListener", s = 0; s < this.handles.length; s++) {
      var r = this.handles[s];this._bindStartEvent(r, t), e(r), r[n]("click", this);
    }
  }, s.pointerDown = function (t, e) {
    if ("INPUT" == t.target.nodeName && "range" == t.target.type) return this.isPointerDown = !1, void delete this.pointerIdentifier;this._dragPointerDown(t, e);var i = document.activeElement;i && i.blur && i.blur(), this._bindPostStartEvents(t), this.emitEvent("pointerDown", [t, e]);
  }, s._dragPointerDown = function (t, i) {
    this.pointerDownPoint = e.getPointerPoint(i);var n = this.canPreventDefaultOnPointerDown(t, i);n && t.preventDefault();
  }, s.canPreventDefaultOnPointerDown = function (t) {
    return "SELECT" != t.target.nodeName;
  }, s.pointerMove = function (t, e) {
    var i = this._dragPointerMove(t, e);this.emitEvent("pointerMove", [t, e, i]), this._dragMove(t, e, i);
  }, s._dragPointerMove = function (t, i) {
    var n = e.getPointerPoint(i),
        s = { x: n.x - this.pointerDownPoint.x, y: n.y - this.pointerDownPoint.y };return !this.isDragging && this.hasDragStarted(s) && this._dragStart(t, i), s;
  }, s.hasDragStarted = function (t) {
    return Math.abs(t.x) > 3 || Math.abs(t.y) > 3;
  }, s.pointerUp = function (t, e) {
    this.emitEvent("pointerUp", [t, e]), this._dragPointerUp(t, e);
  }, s._dragPointerUp = function (t, e) {
    this.isDragging ? this._dragEnd(t, e) : this._staticClick(t, e);
  }, s._dragStart = function (t, i) {
    this.isDragging = !0, this.dragStartPoint = e.getPointerPoint(i), this.isPreventingClicks = !0, this.dragStart(t, i);
  }, s.dragStart = function (t, e) {
    this.emitEvent("dragStart", [t, e]);
  }, s._dragMove = function (t, e, i) {
    this.isDragging && this.dragMove(t, e, i);
  }, s.dragMove = function (t, e, i) {
    t.preventDefault(), this.emitEvent("dragMove", [t, e, i]);
  }, s._dragEnd = function (t, e) {
    this.isDragging = !1, setTimeout(function () {
      delete this.isPreventingClicks;
    }.bind(this)), this.dragEnd(t, e);
  }, s.dragEnd = function (t, e) {
    this.emitEvent("dragEnd", [t, e]);
  }, s.onclick = function (t) {
    this.isPreventingClicks && t.preventDefault();
  }, s._staticClick = function (t, e) {
    if (!this.isIgnoringMouseUp || "mouseup" != t.type) {
      var i = t.target.nodeName;"INPUT" != i && "TEXTAREA" != i || t.target.focus(), this.staticClick(t, e), "mouseup" != t.type && (this.isIgnoringMouseUp = !0, setTimeout(function () {
        delete this.isIgnoringMouseUp;
      }.bind(this), 400));
    }
  }, s.staticClick = function (t, e) {
    this.emitEvent("staticClick", [t, e]);
  }, n.getPointerPoint = e.getPointerPoint, n;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/drag", ["./flickity", "unidragger/unidragger", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("unidragger"), require("fizzy-ui-utils")) : t.Flickity = e(t, t.Flickity, t.Unidragger, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  function s() {
    return { x: t.pageXOffset, y: t.pageYOffset };
  }n.extend(e.defaults, { draggable: !0, dragThreshold: 3 }), e.createMethods.push("_createDrag");var o = e.prototype;n.extend(o, i.prototype);var r = "createTouch" in document,
      a = !1;o._createDrag = function () {
    this.on("activate", this.bindDrag), this.on("uiChange", this._uiChangeDrag), this.on("childUIPointerDown", this._childUIPointerDownDrag), this.on("deactivate", this.unbindDrag), r && !a && (t.addEventListener("touchmove", function () {}), a = !0);
  }, o.bindDrag = function () {
    this.options.draggable && !this.isDragBound && (this.element.classList.add("is-draggable"), this.handles = [this.viewport], this.bindHandles(), this.isDragBound = !0);
  }, o.unbindDrag = function () {
    this.isDragBound && (this.element.classList.remove("is-draggable"), this.unbindHandles(), delete this.isDragBound);
  }, o._uiChangeDrag = function () {
    delete this.isFreeScrolling;
  }, o._childUIPointerDownDrag = function (t) {
    t.preventDefault(), this.pointerDownFocus(t);
  };var l = { TEXTAREA: !0, INPUT: !0, OPTION: !0 },
      h = { radio: !0, checkbox: !0, button: !0, submit: !0, image: !0, file: !0 };o.pointerDown = function (e, i) {
    var n = l[e.target.nodeName] && !h[e.target.type];if (n) return this.isPointerDown = !1, void delete this.pointerIdentifier;this._dragPointerDown(e, i);var o = document.activeElement;o && o.blur && o != this.element && o != document.body && o.blur(), this.pointerDownFocus(e), this.dragX = this.x, this.viewport.classList.add("is-pointer-down"), this._bindPostStartEvents(e), this.pointerDownScroll = s(), t.addEventListener("scroll", this), this.dispatchEvent("pointerDown", e, [i]);
  };var c = { touchstart: !0, MSPointerDown: !0 },
      d = { INPUT: !0, SELECT: !0 };return o.pointerDownFocus = function (e) {
    if (this.options.accessibility && !c[e.type] && !d[e.target.nodeName]) {
      var i = t.pageYOffset;this.element.focus(), t.pageYOffset != i && t.scrollTo(t.pageXOffset, i);
    }
  }, o.canPreventDefaultOnPointerDown = function (t) {
    var e = "touchstart" == t.type,
        i = t.target.nodeName;return !e && "SELECT" != i;
  }, o.hasDragStarted = function (t) {
    return Math.abs(t.x) > this.options.dragThreshold;
  }, o.pointerUp = function (t, e) {
    delete this.isTouchScrolling, this.viewport.classList.remove("is-pointer-down"), this.dispatchEvent("pointerUp", t, [e]), this._dragPointerUp(t, e);
  }, o.pointerDone = function () {
    t.removeEventListener("scroll", this), delete this.pointerDownScroll;
  }, o.dragStart = function (e, i) {
    this.dragStartPosition = this.x, this.startAnimation(), t.removeEventListener("scroll", this), this.dispatchEvent("dragStart", e, [i]);
  }, o.pointerMove = function (t, e) {
    var i = this._dragPointerMove(t, e);this.dispatchEvent("pointerMove", t, [e, i]), this._dragMove(t, e, i);
  }, o.dragMove = function (t, e, i) {
    t.preventDefault(), this.previousDragX = this.dragX;var n = this.options.rightToLeft ? -1 : 1,
        s = this.dragStartPosition + i.x * n;if (!this.options.wrapAround && this.slides.length) {
      var o = Math.max(-this.slides[0].target, this.dragStartPosition);s = s > o ? .5 * (s + o) : s;var r = Math.min(-this.getLastSlide().target, this.dragStartPosition);s = s < r ? .5 * (s + r) : s;
    }this.dragX = s, this.dragMoveTime = new Date(), this.dispatchEvent("dragMove", t, [e, i]);
  }, o.dragEnd = function (t, e) {
    this.options.freeScroll && (this.isFreeScrolling = !0);var i = this.dragEndRestingSelect();if (this.options.freeScroll && !this.options.wrapAround) {
      var n = this.getRestingPosition();this.isFreeScrolling = -n > this.slides[0].target && -n < this.getLastSlide().target;
    } else this.options.freeScroll || i != this.selectedIndex || (i += this.dragEndBoostSelect());delete this.previousDragX, this.isDragSelect = this.options.wrapAround, this.select(i), delete this.isDragSelect, this.dispatchEvent("dragEnd", t, [e]);
  }, o.dragEndRestingSelect = function () {
    var t = this.getRestingPosition(),
        e = Math.abs(this.getSlideDistance(-t, this.selectedIndex)),
        i = this._getClosestResting(t, e, 1),
        n = this._getClosestResting(t, e, -1),
        s = i.distance < n.distance ? i.index : n.index;return s;
  }, o._getClosestResting = function (t, e, i) {
    for (var n = this.selectedIndex, s = 1 / 0, o = this.options.contain && !this.options.wrapAround ? function (t, e) {
      return t <= e;
    } : function (t, e) {
      return t < e;
    }; o(e, s) && (n += i, s = e, e = this.getSlideDistance(-t, n), null !== e);) {
      e = Math.abs(e);
    }return { distance: s, index: n - i };
  }, o.getSlideDistance = function (t, e) {
    var i = this.slides.length,
        s = this.options.wrapAround && i > 1,
        o = s ? n.modulo(e, i) : e,
        r = this.slides[o];if (!r) return null;var a = s ? this.slideableWidth * Math.floor(e / i) : 0;return t - (r.target + a);
  }, o.dragEndBoostSelect = function () {
    if (void 0 === this.previousDragX || !this.dragMoveTime || new Date() - this.dragMoveTime > 100) return 0;var t = this.getSlideDistance(-this.dragX, this.selectedIndex),
        e = this.previousDragX - this.dragX;return t > 0 && e > 0 ? 1 : t < 0 && e < 0 ? -1 : 0;
  }, o.staticClick = function (t, e) {
    var i = this.getParentCell(t.target),
        n = i && i.element,
        s = i && this.cells.indexOf(i);this.dispatchEvent("staticClick", t, [e, n, s]);
  }, o.onscroll = function () {
    var t = s(),
        e = this.pointerDownScroll.x - t.x,
        i = this.pointerDownScroll.y - t.y;(Math.abs(e) > 3 || Math.abs(i) > 3) && this._pointerDone();
  }, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("tap-listener/tap-listener", ["unipointer/unipointer"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("unipointer")) : t.TapListener = e(t, t.Unipointer);
}(window, function (t, e) {
  function i(t) {
    this.bindTap(t);
  }var n = i.prototype = Object.create(e.prototype);return n.bindTap = function (t) {
    t && (this.unbindTap(), this.tapElement = t, this._bindStartEvent(t, !0));
  }, n.unbindTap = function () {
    this.tapElement && (this._bindStartEvent(this.tapElement, !0), delete this.tapElement);
  }, n.pointerUp = function (i, n) {
    if (!this.isIgnoringMouseUp || "mouseup" != i.type) {
      var s = e.getPointerPoint(n),
          o = this.tapElement.getBoundingClientRect(),
          r = t.pageXOffset,
          a = t.pageYOffset,
          l = s.x >= o.left + r && s.x <= o.right + r && s.y >= o.top + a && s.y <= o.bottom + a;if (l && this.emitEvent("tap", [i, n]), "mouseup" != i.type) {
        this.isIgnoringMouseUp = !0;var h = this;setTimeout(function () {
          delete h.isIgnoringMouseUp;
        }, 400);
      }
    }
  }, n.destroy = function () {
    this.pointerDone(), this.unbindTap();
  }, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/prev-next-button", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  "use strict";
  function s(t, e) {
    this.direction = t, this.parent = e, this._create();
  }function o(t) {
    return "string" == typeof t ? t : "M " + t.x0 + ",50 L " + t.x1 + "," + (t.y1 + 50) + " L " + t.x2 + "," + (t.y2 + 50) + " L " + t.x3 + ",50  L " + t.x2 + "," + (50 - t.y2) + " L " + t.x1 + "," + (50 - t.y1) + " Z";
  }var r = "http://www.w3.org/2000/svg";s.prototype = new i(), s.prototype._create = function () {
    this.isEnabled = !0, this.isPrevious = this.direction == -1;var t = this.parent.options.rightToLeft ? 1 : -1;this.isLeft = this.direction == t;var e = this.element = document.createElement("button");e.className = "flickity-prev-next-button", e.className += this.isPrevious ? " previous" : " next", e.setAttribute("type", "button"), this.disable(), e.setAttribute("aria-label", this.isPrevious ? "previous" : "next");var i = this.createSVG();e.appendChild(i), this.on("tap", this.onTap), this.parent.on("select", this.update.bind(this)), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
  }, s.prototype.activate = function () {
    this.bindTap(this.element), this.element.addEventListener("click", this), this.parent.element.appendChild(this.element);
  }, s.prototype.deactivate = function () {
    this.parent.element.removeChild(this.element), i.prototype.destroy.call(this), this.element.removeEventListener("click", this);
  }, s.prototype.createSVG = function () {
    var t = document.createElementNS(r, "svg");t.setAttribute("viewBox", "0 0 100 100");var e = document.createElementNS(r, "path"),
        i = o(this.parent.options.arrowShape);return e.setAttribute("d", i), e.setAttribute("class", "arrow"), this.isLeft || e.setAttribute("transform", "translate(100, 100) rotate(180) "), t.appendChild(e), t;
  }, s.prototype.onTap = function () {
    if (this.isEnabled) {
      this.parent.uiChange();var t = this.isPrevious ? "previous" : "next";this.parent[t]();
    }
  }, s.prototype.handleEvent = n.handleEvent, s.prototype.onclick = function () {
    var t = document.activeElement;t && t == this.element && this.onTap();
  }, s.prototype.enable = function () {
    this.isEnabled || (this.element.disabled = !1, this.isEnabled = !0);
  }, s.prototype.disable = function () {
    this.isEnabled && (this.element.disabled = !0, this.isEnabled = !1);
  }, s.prototype.update = function () {
    var t = this.parent.slides;if (this.parent.options.wrapAround && t.length > 1) return void this.enable();var e = t.length ? t.length - 1 : 0,
        i = this.isPrevious ? 0 : e,
        n = this.parent.selectedIndex == i ? "disable" : "enable";this[n]();
  }, s.prototype.destroy = function () {
    this.deactivate();
  }, n.extend(e.defaults, { prevNextButtons: !0, arrowShape: { x0: 10, x1: 60, y1: 50, x2: 70, y2: 40, x3: 30 } }), e.createMethods.push("_createPrevNextButtons");var a = e.prototype;return a._createPrevNextButtons = function () {
    this.options.prevNextButtons && (this.prevButton = new s(-1, this), this.nextButton = new s(1, this), this.on("activate", this.activatePrevNextButtons));
  }, a.activatePrevNextButtons = function () {
    this.prevButton.activate(), this.nextButton.activate(), this.on("deactivate", this.deactivatePrevNextButtons);
  }, a.deactivatePrevNextButtons = function () {
    this.prevButton.deactivate(), this.nextButton.deactivate(), this.off("deactivate", this.deactivatePrevNextButtons);
  }, e.PrevNextButton = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/page-dots", ["./flickity", "tap-listener/tap-listener", "fizzy-ui-utils/utils"], function (i, n, s) {
    return e(t, i, n, s);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("tap-listener"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.TapListener, t.fizzyUIUtils);
}(window, function (t, e, i, n) {
  function s(t) {
    this.parent = t, this._create();
  }s.prototype = new i(), s.prototype._create = function () {
    this.holder = document.createElement("ol"), this.holder.className = "flickity-page-dots", this.dots = [], this.on("tap", this.onTap), this.on("pointerDown", this.parent.childUIPointerDown.bind(this.parent));
  }, s.prototype.activate = function () {
    this.setDots(), this.bindTap(this.holder), this.parent.element.appendChild(this.holder);
  }, s.prototype.deactivate = function () {
    this.parent.element.removeChild(this.holder), i.prototype.destroy.call(this);
  }, s.prototype.setDots = function () {
    var t = this.parent.slides.length - this.dots.length;t > 0 ? this.addDots(t) : t < 0 && this.removeDots(-t);
  }, s.prototype.addDots = function (t) {
    for (var e = document.createDocumentFragment(), i = []; t;) {
      var n = document.createElement("li");n.className = "dot", e.appendChild(n), i.push(n), t--;
    }this.holder.appendChild(e), this.dots = this.dots.concat(i);
  }, s.prototype.removeDots = function (t) {
    var e = this.dots.splice(this.dots.length - t, t);e.forEach(function (t) {
      this.holder.removeChild(t);
    }, this);
  }, s.prototype.updateSelected = function () {
    this.selectedDot && (this.selectedDot.className = "dot"), this.dots.length && (this.selectedDot = this.dots[this.parent.selectedIndex], this.selectedDot.className = "dot is-selected");
  }, s.prototype.onTap = function (t) {
    var e = t.target;if ("LI" == e.nodeName) {
      this.parent.uiChange();var i = this.dots.indexOf(e);this.parent.select(i);
    }
  }, s.prototype.destroy = function () {
    this.deactivate();
  }, e.PageDots = s, n.extend(e.defaults, { pageDots: !0 }), e.createMethods.push("_createPageDots");var o = e.prototype;return o._createPageDots = function () {
    this.options.pageDots && (this.pageDots = new s(this), this.on("activate", this.activatePageDots), this.on("select", this.updateSelectedPageDots), this.on("cellChange", this.updatePageDots), this.on("resize", this.updatePageDots), this.on("deactivate", this.deactivatePageDots));
  }, o.activatePageDots = function () {
    this.pageDots.activate();
  }, o.updateSelectedPageDots = function () {
    this.pageDots.updateSelected();
  }, o.updatePageDots = function () {
    this.pageDots.setDots();
  }, o.deactivatePageDots = function () {
    this.pageDots.deactivate();
  }, e.PageDots = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/player", ["ev-emitter/ev-emitter", "fizzy-ui-utils/utils", "./flickity"], function (t, i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(require("ev-emitter"), require("fizzy-ui-utils"), require("./flickity")) : e(t.EvEmitter, t.fizzyUIUtils, t.Flickity);
}(window, function (t, e, i) {
  function n(t) {
    this.parent = t, this.state = "stopped", o && (this.onVisibilityChange = function () {
      this.visibilityChange();
    }.bind(this), this.onVisibilityPlay = function () {
      this.visibilityPlay();
    }.bind(this));
  }var s, o;"hidden" in document ? (s = "hidden", o = "visibilitychange") : "webkitHidden" in document && (s = "webkitHidden", o = "webkitvisibilitychange"), n.prototype = Object.create(t.prototype), n.prototype.play = function () {
    if ("playing" != this.state) {
      var t = document[s];if (o && t) return void document.addEventListener(o, this.onVisibilityPlay);this.state = "playing", o && document.addEventListener(o, this.onVisibilityChange), this.tick();
    }
  }, n.prototype.tick = function () {
    if ("playing" == this.state) {
      var t = this.parent.options.autoPlay;t = "number" == typeof t ? t : 3e3;var e = this;this.clear(), this.timeout = setTimeout(function () {
        e.parent.next(!0), e.tick();
      }, t);
    }
  }, n.prototype.stop = function () {
    this.state = "stopped", this.clear(), o && document.removeEventListener(o, this.onVisibilityChange);
  }, n.prototype.clear = function () {
    clearTimeout(this.timeout);
  }, n.prototype.pause = function () {
    "playing" == this.state && (this.state = "paused", this.clear());
  }, n.prototype.unpause = function () {
    "paused" == this.state && this.play();
  }, n.prototype.visibilityChange = function () {
    var t = document[s];this[t ? "pause" : "unpause"]();
  }, n.prototype.visibilityPlay = function () {
    this.play(), document.removeEventListener(o, this.onVisibilityPlay);
  }, e.extend(i.defaults, { pauseAutoPlayOnHover: !0 }), i.createMethods.push("_createPlayer");var r = i.prototype;return r._createPlayer = function () {
    this.player = new n(this), this.on("activate", this.activatePlayer), this.on("uiChange", this.stopPlayer), this.on("pointerDown", this.stopPlayer), this.on("deactivate", this.deactivatePlayer);
  }, r.activatePlayer = function () {
    this.options.autoPlay && (this.player.play(), this.element.addEventListener("mouseenter", this));
  }, r.playPlayer = function () {
    this.player.play();
  }, r.stopPlayer = function () {
    this.player.stop();
  }, r.pausePlayer = function () {
    this.player.pause();
  }, r.unpausePlayer = function () {
    this.player.unpause();
  }, r.deactivatePlayer = function () {
    this.player.stop(), this.element.removeEventListener("mouseenter", this);
  }, r.onmouseenter = function () {
    this.options.pauseAutoPlayOnHover && (this.player.pause(), this.element.addEventListener("mouseleave", this));
  }, r.onmouseleave = function () {
    this.player.unpause(), this.element.removeEventListener("mouseleave", this);
  }, i.Player = n, i;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/add-remove-cell", ["./flickity", "fizzy-ui-utils/utils"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils);
}(window, function (t, e, i) {
  function n(t) {
    var e = document.createDocumentFragment();return t.forEach(function (t) {
      e.appendChild(t.element);
    }), e;
  }var s = e.prototype;return s.insert = function (t, e) {
    var i = this._makeCells(t);if (i && i.length) {
      var s = this.cells.length;e = void 0 === e ? s : e;var o = n(i),
          r = e == s;if (r) this.slider.appendChild(o);else {
        var a = this.cells[e].element;this.slider.insertBefore(o, a);
      }if (0 === e) this.cells = i.concat(this.cells);else if (r) this.cells = this.cells.concat(i);else {
        var l = this.cells.splice(e, s - e);this.cells = this.cells.concat(i).concat(l);
      }this._sizeCells(i);var h = e > this.selectedIndex ? 0 : i.length;this._cellAddedRemoved(e, h);
    }
  }, s.append = function (t) {
    this.insert(t, this.cells.length);
  }, s.prepend = function (t) {
    this.insert(t, 0);
  }, s.remove = function (t) {
    var e,
        n,
        s = this.getCells(t),
        o = 0,
        r = s.length;for (e = 0; e < r; e++) {
      n = s[e];var a = this.cells.indexOf(n) < this.selectedIndex;o -= a ? 1 : 0;
    }for (e = 0; e < r; e++) {
      n = s[e], n.remove(), i.removeFrom(this.cells, n);
    }s.length && this._cellAddedRemoved(0, o);
  }, s._cellAddedRemoved = function (t, e) {
    e = e || 0, this.selectedIndex += e, this.selectedIndex = Math.max(0, Math.min(this.slides.length - 1, this.selectedIndex)), this.cellChange(t, !0), this.emitEvent("cellAddedRemoved", [t, e]);
  }, s.cellSizeChange = function (t) {
    var e = this.getCell(t);if (e) {
      e.getSize();var i = this.cells.indexOf(e);this.cellChange(i);
    }
  }, s.cellChange = function (t, e) {
    var i = this.slideableWidth;if (this._positionCells(t), this._getWrapShiftCells(), this.setGallerySize(), this.emitEvent("cellChange", [t]), this.options.freeScroll) {
      var n = i - this.slideableWidth;this.x += n * this.cellAlign, this.positionSlider();
    } else e && this.positionSliderAtSelected(), this.select(this.selectedIndex);
  }, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/lazyload", ["./flickity", "fizzy-ui-utils/utils"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("./flickity"), require("fizzy-ui-utils")) : e(t, t.Flickity, t.fizzyUIUtils);
}(window, function (t, e, i) {
  "use strict";
  function n(t) {
    if ("IMG" == t.nodeName && t.getAttribute("data-flickity-lazyload")) return [t];var e = t.querySelectorAll("img[data-flickity-lazyload]");return i.makeArray(e);
  }function s(t, e) {
    this.img = t, this.flickity = e, this.load();
  }e.createMethods.push("_createLazyload");var o = e.prototype;return o._createLazyload = function () {
    this.on("select", this.lazyLoad);
  }, o.lazyLoad = function () {
    var t = this.options.lazyLoad;if (t) {
      var e = "number" == typeof t ? t : 0,
          i = this.getAdjacentCellElements(e),
          o = [];i.forEach(function (t) {
        var e = n(t);o = o.concat(e);
      }), o.forEach(function (t) {
        new s(t, this);
      }, this);
    }
  }, s.prototype.handleEvent = i.handleEvent, s.prototype.load = function () {
    this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.img.getAttribute("data-flickity-lazyload"), this.img.removeAttribute("data-flickity-lazyload");
  }, s.prototype.onload = function (t) {
    this.complete(t, "flickity-lazyloaded");
  }, s.prototype.onerror = function (t) {
    this.complete(t, "flickity-lazyerror");
  }, s.prototype.complete = function (t, e) {
    this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);var i = this.flickity.getParentCell(this.img),
        n = i && i.element;this.flickity.cellSizeChange(n), this.img.classList.add(e), this.flickity.dispatchEvent("lazyLoad", t, n);
  }, e.LazyLoader = s, e;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity/js/index", ["./flickity", "./drag", "./prev-next-button", "./page-dots", "./player", "./add-remove-cell", "./lazyload"], e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports && (module.exports = e(require("./flickity"), require("./drag"), require("./prev-next-button"), require("./page-dots"), require("./player"), require("./add-remove-cell"), require("./lazyload")));
}(window, function (t) {
  return t;
}), function (t, e) {
  "function" == typeof define && define.amd ? define("flickity-as-nav-for/as-nav-for", ["flickity/js/index", "fizzy-ui-utils/utils"], e) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(require("flickity"), require("fizzy-ui-utils")) : t.Flickity = e(t.Flickity, t.fizzyUIUtils);
}(window, function (t, e) {
  function i(t, e, i) {
    return (e - t) * i + t;
  }t.createMethods.push("_createAsNavFor");var n = t.prototype;return n._createAsNavFor = function () {
    this.on("activate", this.activateAsNavFor), this.on("deactivate", this.deactivateAsNavFor), this.on("destroy", this.destroyAsNavFor);var t = this.options.asNavFor;if (t) {
      var e = this;setTimeout(function () {
        e.setNavCompanion(t);
      });
    }
  }, n.setNavCompanion = function (i) {
    i = e.getQueryElement(i);var n = t.data(i);if (n && n != this) {
      this.navCompanion = n;var s = this;this.onNavCompanionSelect = function () {
        s.navCompanionSelect();
      }, n.on("select", this.onNavCompanionSelect), this.on("staticClick", this.onNavStaticClick), this.navCompanionSelect(!0);
    }
  }, n.navCompanionSelect = function (t) {
    if (this.navCompanion) {
      var e = this.navCompanion.selectedCells[0],
          n = this.navCompanion.cells.indexOf(e),
          s = n + this.navCompanion.selectedCells.length - 1,
          o = Math.floor(i(n, s, this.navCompanion.cellAlign));if (this.selectCell(o, !1, t), this.removeNavSelectedElements(), !(o >= this.cells.length)) {
        var r = this.cells.slice(n, s + 1);this.navSelectedElements = r.map(function (t) {
          return t.element;
        }), this.changeNavSelectedClass("add");
      }
    }
  }, n.changeNavSelectedClass = function (t) {
    this.navSelectedElements.forEach(function (e) {
      e.classList[t]("is-nav-selected");
    });
  }, n.activateAsNavFor = function () {
    this.navCompanionSelect(!0);
  }, n.removeNavSelectedElements = function () {
    this.navSelectedElements && (this.changeNavSelectedClass("remove"), delete this.navSelectedElements);
  }, n.onNavStaticClick = function (t, e, i, n) {
    "number" == typeof n && this.navCompanion.selectCell(n);
  }, n.deactivateAsNavFor = function () {
    this.removeNavSelectedElements();
  }, n.destroyAsNavFor = function () {
    this.navCompanion && (this.navCompanion.off("select", this.onNavCompanionSelect), this.off("staticClick", this.onNavStaticClick), delete this.navCompanion);
  }, t;
}), function (t, e) {
  "use strict";
  "function" == typeof define && define.amd ? define("imagesloaded/imagesloaded", ["ev-emitter/ev-emitter"], function (i) {
    return e(t, i);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("ev-emitter")) : t.imagesLoaded = e(t, t.EvEmitter);
}(window, function (t, e) {
  function i(t, e) {
    for (var i in e) {
      t[i] = e[i];
    }return t;
  }function n(t) {
    var e = [];if (Array.isArray(t)) e = t;else if ("number" == typeof t.length) for (var i = 0; i < t.length; i++) {
      e.push(t[i]);
    } else e.push(t);return e;
  }function s(t, e, o) {
    return this instanceof s ? ("string" == typeof t && (t = document.querySelectorAll(t)), this.elements = n(t), this.options = i({}, this.options), "function" == typeof e ? o = e : i(this.options, e), o && this.on("always", o), this.getImages(), a && (this.jqDeferred = new a.Deferred()), void setTimeout(function () {
      this.check();
    }.bind(this))) : new s(t, e, o);
  }function o(t) {
    this.img = t;
  }function r(t, e) {
    this.url = t, this.element = e, this.img = new Image();
  }var a = t.jQuery,
      l = t.console;s.prototype = Object.create(e.prototype), s.prototype.options = {}, s.prototype.getImages = function () {
    this.images = [], this.elements.forEach(this.addElementImages, this);
  }, s.prototype.addElementImages = function (t) {
    "IMG" == t.nodeName && this.addImage(t), this.options.background === !0 && this.addElementBackgroundImages(t);var e = t.nodeType;if (e && h[e]) {
      for (var i = t.querySelectorAll("img"), n = 0; n < i.length; n++) {
        var s = i[n];this.addImage(s);
      }if ("string" == typeof this.options.background) {
        var o = t.querySelectorAll(this.options.background);for (n = 0; n < o.length; n++) {
          var r = o[n];this.addElementBackgroundImages(r);
        }
      }
    }
  };var h = { 1: !0, 9: !0, 11: !0 };return s.prototype.addElementBackgroundImages = function (t) {
    var e = getComputedStyle(t);if (e) for (var i = /url\((['"])?(.*?)\1\)/gi, n = i.exec(e.backgroundImage); null !== n;) {
      var s = n && n[2];s && this.addBackground(s, t), n = i.exec(e.backgroundImage);
    }
  }, s.prototype.addImage = function (t) {
    var e = new o(t);this.images.push(e);
  }, s.prototype.addBackground = function (t, e) {
    var i = new r(t, e);this.images.push(i);
  }, s.prototype.check = function () {
    function t(t, i, n) {
      setTimeout(function () {
        e.progress(t, i, n);
      });
    }var e = this;return this.progressedCount = 0, this.hasAnyBroken = !1, this.images.length ? void this.images.forEach(function (e) {
      e.once("progress", t), e.check();
    }) : void this.complete();
  }, s.prototype.progress = function (t, e, i) {
    this.progressedCount++, this.hasAnyBroken = this.hasAnyBroken || !t.isLoaded, this.emitEvent("progress", [this, t, e]), this.jqDeferred && this.jqDeferred.notify && this.jqDeferred.notify(this, t), this.progressedCount == this.images.length && this.complete(), this.options.debug && l && l.log("progress: " + i, t, e);
  }, s.prototype.complete = function () {
    var t = this.hasAnyBroken ? "fail" : "done";if (this.isComplete = !0, this.emitEvent(t, [this]), this.emitEvent("always", [this]), this.jqDeferred) {
      var e = this.hasAnyBroken ? "reject" : "resolve";this.jqDeferred[e](this);
    }
  }, o.prototype = Object.create(e.prototype), o.prototype.check = function () {
    var t = this.getIsImageComplete();return t ? void this.confirm(0 !== this.img.naturalWidth, "naturalWidth") : (this.proxyImage = new Image(), this.proxyImage.addEventListener("load", this), this.proxyImage.addEventListener("error", this), this.img.addEventListener("load", this), this.img.addEventListener("error", this), void (this.proxyImage.src = this.img.src));
  }, o.prototype.getIsImageComplete = function () {
    return this.img.complete && void 0 !== this.img.naturalWidth;
  }, o.prototype.confirm = function (t, e) {
    this.isLoaded = t, this.emitEvent("progress", [this, this.img, e]);
  }, o.prototype.handleEvent = function (t) {
    var e = "on" + t.type;this[e] && this[e](t);
  }, o.prototype.onload = function () {
    this.confirm(!0, "onload"), this.unbindEvents();
  }, o.prototype.onerror = function () {
    this.confirm(!1, "onerror"), this.unbindEvents();
  }, o.prototype.unbindEvents = function () {
    this.proxyImage.removeEventListener("load", this), this.proxyImage.removeEventListener("error", this), this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
  }, r.prototype = Object.create(o.prototype), r.prototype.check = function () {
    this.img.addEventListener("load", this), this.img.addEventListener("error", this), this.img.src = this.url;var t = this.getIsImageComplete();t && (this.confirm(0 !== this.img.naturalWidth, "naturalWidth"), this.unbindEvents());
  }, r.prototype.unbindEvents = function () {
    this.img.removeEventListener("load", this), this.img.removeEventListener("error", this);
  }, r.prototype.confirm = function (t, e) {
    this.isLoaded = t, this.emitEvent("progress", [this, this.element, e]);
  }, s.makeJQueryPlugin = function (e) {
    e = e || t.jQuery, e && (a = e, a.fn.imagesLoaded = function (t, e) {
      var i = new s(this, t, e);return i.jqDeferred.promise(a(this));
    });
  }, s.makeJQueryPlugin(), s;
}), function (t, e) {
  "function" == typeof define && define.amd ? define(["flickity/js/index", "imagesloaded/imagesloaded"], function (i, n) {
    return e(t, i, n);
  }) : "object" == (typeof module === "undefined" ? "undefined" : _typeof(module)) && module.exports ? module.exports = e(t, require("flickity"), require("imagesloaded")) : t.Flickity = e(t, t.Flickity, t.imagesLoaded);
}(window, function (t, e, i) {
  "use strict";
  e.createMethods.push("_createImagesLoaded");var n = e.prototype;return n._createImagesLoaded = function () {
    this.on("activate", this.imagesLoaded);
  }, n.imagesLoaded = function () {
    function t(t, i) {
      var n = e.getParentCell(i.img);e.cellSizeChange(n && n.element), e.options.freeScroll || e.positionSliderAtSelected();
    }if (this.options.imagesLoaded) {
      var e = this;i(this.slider).on("progress", t);
    }
  }, e;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 * Flickity background lazyload v1.0.0
 * lazyload background cell images
 */

/*jshint browser: true, unused: true, undef: true */

(function (window, factory) {
  // universal module definition
  /*globals define, module, require */
  if (typeof define == 'function' && define.amd) {
    // AMD
    define(['flickity/js/index', 'fizzy-ui-utils/utils'], factory);
  } else if ((typeof module === 'undefined' ? 'undefined' : _typeof(module)) == 'object' && module.exports) {
    // CommonJS
    module.exports = factory(require('flickity'), require('fizzy-ui-utils'));
  } else {
    // browser global
    factory(window.Flickity, window.fizzyUIUtils);
  }
})(window, function factory(Flickity, utils) {
  /*jshint strict: true */
  'use strict';

  Flickity.createMethods.push('_createBgLazyLoad');

  var proto = Flickity.prototype;

  proto._createBgLazyLoad = function () {
    this.on('select', this.bgLazyLoad);
  };

  proto.bgLazyLoad = function () {
    var lazyLoad = this.options.bgLazyLoad;
    if (!lazyLoad) {
      return;
    }

    // get adjacent cells, use lazyLoad option for adjacent count
    var adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
    var cellElems = this.getAdjacentCellElements(adjCount);

    for (var i = 0; i < cellElems.length; i++) {
      var cellElem = cellElems[i];
      this.bgLazyLoadElem(cellElem);
      // select lazy elems in cell
      var children = cellElem.querySelectorAll('[data-flickity-bg-lazyload]');
      for (var j = 0; j < children.length; j++) {
        this.bgLazyLoadElem(children[j]);
      }
    }
  };

  proto.bgLazyLoadElem = function (elem) {
    var attr = elem.getAttribute('data-flickity-bg-lazyload');
    if (attr) {
      new BgLazyLoader(elem, attr, this);
    }
  };

  // -------------------------- LazyBGLoader -------------------------- //

  /**
   * class to handle loading images
   */
  function BgLazyLoader(elem, url, flickity) {
    this.element = elem;
    this.url = url;
    this.img = new Image();
    this.flickity = flickity;
    this.load();
  }

  BgLazyLoader.prototype.handleEvent = utils.handleEvent;

  BgLazyLoader.prototype.load = function () {
    this.img.addEventListener('load', this);
    this.img.addEventListener('error', this);
    // load image
    this.img.src = this.url;
    // remove attr
    this.element.removeAttribute('data-flickity-bg-lazyload');
  };

  BgLazyLoader.prototype.onload = function (event) {
    this.element.style.backgroundImage = 'url(' + this.url + ')';
    this.complete(event, 'flickity-bg-lazyloaded');
  };

  BgLazyLoader.prototype.onerror = function (event) {
    this.complete(event, 'flickity-bg-lazyerror');
  };

  BgLazyLoader.prototype.complete = function (event, className) {
    // unbind events
    this.img.removeEventListener('load', this);
    this.img.removeEventListener('error', this);

    this.element.classList.add(className);
    this.flickity.dispatchEvent('bgLazyLoad', event, this.element);
  };

  // -----  ----- //

  Flickity.BgLazyLoader = BgLazyLoader;

  return Flickity;
});
'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
*  Ajax Autocomplete for jQuery, version 1.2.27
*  (c) 2015 Tomas Kirda
*
*  Ajax Autocomplete for jQuery is freely distributable under the terms of an MIT-style license.
*  For details, see the web site: https://github.com/devbridge/jQuery-Autocomplete
*/

/*jslint  browser: true, white: true, single: true, this: true, multivar: true */
/*global define, window, document, jQuery, exports, require */

// Expose plugin as an AMD module if AMD loader is present:
(function (factory) {
    "use strict";

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else if ((typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object' && typeof require === 'function') {
        // Browserify
        factory(require('jquery'));
    } else {
        // Browser globals
        factory(jQuery);
    }
})(function ($) {
    'use strict';

    var utils = function () {
        return {
            escapeRegExChars: function escapeRegExChars(value) {
                return value.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&");
            },
            createNode: function createNode(containerClass) {
                var div = document.createElement('div');
                div.className = containerClass;
                div.style.position = 'absolute';
                div.style.display = 'none';
                return div;
            }
        };
    }(),
        keys = {
        ESC: 27,
        TAB: 9,
        RETURN: 13,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40
    };

    function Autocomplete(el, options) {
        var noop = $.noop,
            that = this,
            defaults = {
            ajaxSettings: {},
            autoSelectFirst: false,
            appendTo: document.body,
            serviceUrl: null,
            lookup: null,
            onSelect: null,
            width: 'auto',
            minChars: 1,
            maxHeight: 300,
            deferRequestBy: 0,
            params: {},
            formatResult: Autocomplete.formatResult,
            delimiter: null,
            zIndex: 9999,
            type: 'GET',
            noCache: false,
            onSearchStart: noop,
            onSearchComplete: noop,
            onSearchError: noop,
            preserveInput: false,
            containerClass: 'autocomplete-suggestions',
            tabDisabled: false,
            dataType: 'text',
            currentRequest: null,
            triggerSelectOnValidInput: true,
            preventBadQueries: true,
            lookupFilter: function lookupFilter(suggestion, originalQuery, queryLowerCase) {
                return suggestion.value.toLowerCase().indexOf(queryLowerCase) !== -1;
            },
            paramName: 'query',
            transformResult: function transformResult(response) {
                return typeof response === 'string' ? $.parseJSON(response) : response;
            },
            showNoSuggestionNotice: false,
            noSuggestionNotice: 'No results',
            orientation: 'bottom',
            forceFixPosition: false
        };

        // Shared variables:
        that.element = el;
        that.el = $(el);
        that.suggestions = [];
        that.badQueries = [];
        that.selectedIndex = -1;
        that.currentValue = that.element.value;
        that.intervalId = 0;
        that.cachedResponse = {};
        that.onChangeInterval = null;
        that.onChange = null;
        that.isLocal = false;
        that.suggestionsContainer = null;
        that.noSuggestionsContainer = null;
        that.options = $.extend({}, defaults, options);
        that.classes = {
            selected: 'autocomplete-selected',
            suggestion: 'autocomplete-suggestion'
        };
        that.hint = null;
        that.hintValue = '';
        that.selection = null;

        // Initialize and set options:
        that.initialize();
        that.setOptions(options);
    }

    Autocomplete.utils = utils;

    $.Autocomplete = Autocomplete;

    Autocomplete.formatResult = function (suggestion, currentValue) {
        // Do not replace anything if there current value is empty
        if (!currentValue) {
            return suggestion.value;
        }

        var pattern = '(' + utils.escapeRegExChars(currentValue) + ')';

        return suggestion.value.replace(new RegExp(pattern, 'gi'), '<strong>$1<\/strong>').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/&lt;(\/?strong)&gt;/g, '<$1>');
    };

    Autocomplete.prototype = {

        killerFn: null,

        initialize: function initialize() {
            var that = this,
                suggestionSelector = '.' + that.classes.suggestion,
                selected = that.classes.selected,
                options = that.options,
                container;

            // Remove autocomplete attribute to prevent native suggestions:
            that.element.setAttribute('autocomplete', 'off');

            that.killerFn = function (e) {
                if (!$(e.target).closest('.' + that.options.containerClass).length) {
                    that.killSuggestions();
                    that.disableKillerFn();
                }
            };

            // html() deals with many types: htmlString or Element or Array or jQuery
            that.noSuggestionsContainer = $('<div class="autocomplete-no-suggestion"></div>').html(this.options.noSuggestionNotice).get(0);

            that.suggestionsContainer = Autocomplete.utils.createNode(options.containerClass);

            container = $(that.suggestionsContainer);

            container.appendTo(options.appendTo);

            // Only set width if it was provided:
            if (options.width !== 'auto') {
                container.css('width', options.width);
            }

            // Listen for mouse over event on suggestions list:
            container.on('mouseover.autocomplete', suggestionSelector, function () {
                that.activate($(this).data('index'));
            });

            // Deselect active element when mouse leaves suggestions container:
            container.on('mouseout.autocomplete', function () {
                that.selectedIndex = -1;
                container.children('.' + selected).removeClass(selected);
            });

            // Listen for click event on suggestions list:
            container.on('click.autocomplete', suggestionSelector, function () {
                that.select($(this).data('index'));
                return false;
            });

            that.fixPositionCapture = function () {
                if (that.visible) {
                    that.fixPosition();
                }
            };

            $(window).on('resize.autocomplete', that.fixPositionCapture);

            that.el.on('keydown.autocomplete', function (e) {
                that.onKeyPress(e);
            });
            that.el.on('keyup.autocomplete', function (e) {
                that.onKeyUp(e);
            });
            that.el.on('blur.autocomplete', function () {
                that.onBlur();
            });
            that.el.on('focus.autocomplete', function () {
                that.onFocus();
            });
            that.el.on('change.autocomplete', function (e) {
                that.onKeyUp(e);
            });
            that.el.on('input.autocomplete', function (e) {
                that.onKeyUp(e);
            });
        },

        onFocus: function onFocus() {
            var that = this;

            that.fixPosition();

            if (that.el.val().length >= that.options.minChars) {
                that.onValueChange();
            }
        },

        onBlur: function onBlur() {
            this.enableKillerFn();
        },

        abortAjax: function abortAjax() {
            var that = this;
            if (that.currentRequest) {
                that.currentRequest.abort();
                that.currentRequest = null;
            }
        },

        setOptions: function setOptions(suppliedOptions) {
            var that = this,
                options = that.options;

            $.extend(options, suppliedOptions);

            that.isLocal = $.isArray(options.lookup);

            if (that.isLocal) {
                options.lookup = that.verifySuggestionsFormat(options.lookup);
            }

            options.orientation = that.validateOrientation(options.orientation, 'bottom');

            // Adjust height, width and z-index:
            $(that.suggestionsContainer).css({
                'max-height': options.maxHeight + 'px',
                'width': options.width + 'px',
                'z-index': options.zIndex
            });
        },

        clearCache: function clearCache() {
            this.cachedResponse = {};
            this.badQueries = [];
        },

        clear: function clear() {
            this.clearCache();
            this.currentValue = '';
            this.suggestions = [];
        },

        disable: function disable() {
            var that = this;
            that.disabled = true;
            clearInterval(that.onChangeInterval);
            that.abortAjax();
        },

        enable: function enable() {
            this.disabled = false;
        },

        fixPosition: function fixPosition() {
            // Use only when container has already its content

            var that = this,
                $container = $(that.suggestionsContainer),
                containerParent = $container.parent().get(0);
            // Fix position automatically when appended to body.
            // In other cases force parameter must be given.
            if (containerParent !== document.body && !that.options.forceFixPosition) {
                return;
            }
            var siteSearchDiv = $('.site-search');
            // Choose orientation
            var orientation = that.options.orientation,
                containerHeight = $container.outerHeight(),
                height = siteSearchDiv.outerHeight(),
                offset = siteSearchDiv.offset(),
                styles = { 'top': offset.top, 'left': offset.left };

            if (orientation === 'auto') {
                var viewPortHeight = $(window).height(),
                    scrollTop = $(window).scrollTop(),
                    topOverflow = -scrollTop + offset.top - containerHeight,
                    bottomOverflow = scrollTop + viewPortHeight - (offset.top + height + containerHeight);

                orientation = Math.max(topOverflow, bottomOverflow) === topOverflow ? 'top' : 'bottom';
            }

            if (orientation === 'top') {
                styles.top += -containerHeight;
            } else {
                styles.top += height;
            }

            // If container is not positioned to body,
            // correct its position using offset parent offset
            if (containerParent !== document.body) {
                var opacity = $container.css('opacity'),
                    parentOffsetDiff;

                if (!that.visible) {
                    $container.css('opacity', 0).show();
                }

                parentOffsetDiff = $container.offsetParent().offset();
                styles.top -= parentOffsetDiff.top;
                styles.left -= parentOffsetDiff.left;

                if (!that.visible) {
                    $container.css('opacity', opacity).hide();
                }
            }

            if (that.options.width === 'auto') {
                styles.width = siteSearchDiv.outerWidth() + 'px';
            }

            $container.css(styles);
        },

        enableKillerFn: function enableKillerFn() {
            var that = this;
            $(document).on('click.autocomplete', that.killerFn);
        },

        disableKillerFn: function disableKillerFn() {
            var that = this;
            $(document).off('click.autocomplete', that.killerFn);
        },

        killSuggestions: function killSuggestions() {
            var that = this;
            that.stopKillSuggestions();
            that.intervalId = window.setInterval(function () {
                if (that.visible) {
                    // No need to restore value when 
                    // preserveInput === true, 
                    // because we did not change it
                    if (!that.options.preserveInput) {
                        that.el.val(that.currentValue);
                    }

                    that.hide();
                }

                that.stopKillSuggestions();
            }, 50);
        },

        stopKillSuggestions: function stopKillSuggestions() {
            window.clearInterval(this.intervalId);
        },

        isCursorAtEnd: function isCursorAtEnd() {
            var that = this,
                valLength = that.el.val().length,
                selectionStart = that.element.selectionStart,
                range;

            if (typeof selectionStart === 'number') {
                return selectionStart === valLength;
            }
            if (document.selection) {
                range = document.selection.createRange();
                range.moveStart('character', -valLength);
                return valLength === range.text.length;
            }
            return true;
        },

        onKeyPress: function onKeyPress(e) {
            var that = this;

            // If suggestions are hidden and user presses arrow down, display suggestions:
            if (!that.disabled && !that.visible && e.which === keys.DOWN && that.currentValue) {
                that.suggest();
                return;
            }

            if (that.disabled || !that.visible) {
                return;
            }

            switch (e.which) {
                case keys.ESC:
                    that.el.val(that.currentValue);
                    that.hide();
                    break;
                case keys.RIGHT:
                    if (that.hint && that.options.onHint && that.isCursorAtEnd()) {
                        that.selectHint();
                        break;
                    }
                    return;
                case keys.TAB:
                    if (that.hint && that.options.onHint) {
                        that.selectHint();
                        return;
                    }
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    if (that.options.tabDisabled === false) {
                        return;
                    }
                    break;
                case keys.RETURN:
                    if (that.selectedIndex === -1) {
                        that.hide();
                        return;
                    }
                    that.select(that.selectedIndex);
                    break;
                case keys.UP:
                    that.moveUp();
                    break;
                case keys.DOWN:
                    that.moveDown();
                    break;
                default:
                    return;
            }

            // Cancel event if function did not return:
            e.stopImmediatePropagation();
            e.preventDefault();
        },

        onKeyUp: function onKeyUp(e) {
            var that = this;

            if (that.disabled) {
                return;
            }

            switch (e.which) {
                case keys.UP:
                case keys.DOWN:
                    return;
            }

            clearInterval(that.onChangeInterval);

            if (that.currentValue !== that.el.val()) {
                that.findBestHint();
                if (that.options.deferRequestBy > 0) {
                    // Defer lookup in case when value changes very quickly:
                    that.onChangeInterval = setInterval(function () {
                        that.onValueChange();
                    }, that.options.deferRequestBy);
                } else {
                    that.onValueChange();
                }
            }
        },

        onValueChange: function onValueChange() {
            var that = this,
                options = that.options,
                value = that.el.val(),
                query = that.getQuery(value);

            if (that.selection && that.currentValue !== query) {
                that.selection = null;
                (options.onInvalidateSelection || $.noop).call(that.element);
            }

            clearInterval(that.onChangeInterval);
            that.currentValue = value;
            that.selectedIndex = -1;

            // Check existing suggestion for the match before proceeding:
            if (options.triggerSelectOnValidInput && that.isExactMatch(query)) {
                that.select(0);
                return;
            }

            if (query.length < options.minChars) {
                that.hide();
            } else {
                that.getSuggestions(query);
            }
        },

        isExactMatch: function isExactMatch(query) {
            var suggestions = this.suggestions;

            return suggestions.length === 1 && suggestions[0].value.toLowerCase() === query.toLowerCase();
        },

        getQuery: function getQuery(value) {
            var delimiter = this.options.delimiter,
                parts;

            if (!delimiter) {
                return value;
            }
            parts = value.split(delimiter);
            return $.trim(parts[parts.length - 1]);
        },

        getSuggestionsLocal: function getSuggestionsLocal(query) {
            var that = this,
                options = that.options,
                queryLowerCase = query.toLowerCase(),
                filter = options.lookupFilter,
                limit = parseInt(options.lookupLimit, 10),
                data;

            data = {
                suggestions: $.grep(options.lookup, function (suggestion) {
                    return filter(suggestion, query, queryLowerCase);
                })
            };

            if (limit && data.suggestions.length > limit) {
                data.suggestions = data.suggestions.slice(0, limit);
            }

            return data;
        },

        getSuggestions: function getSuggestions(q) {
            var response,
                that = this,
                options = that.options,
                serviceUrl = options.serviceUrl,
                params,
                cacheKey,
                ajaxSettings;

            options.params[options.paramName] = q;
            params = options.ignoreParams ? null : options.params;

            if (options.onSearchStart.call(that.element, options.params) === false) {
                return;
            }

            if ($.isFunction(options.lookup)) {
                options.lookup(q, function (data) {
                    that.suggestions = data.suggestions;
                    that.suggest();
                    options.onSearchComplete.call(that.element, q, data.suggestions);
                });
                return;
            }

            if (that.isLocal) {
                response = that.getSuggestionsLocal(q);
            } else {
                if ($.isFunction(serviceUrl)) {
                    serviceUrl = serviceUrl.call(that.element, q);
                }
                cacheKey = serviceUrl + '?' + $.param(params || {});
                response = that.cachedResponse[cacheKey];
            }

            if (response && $.isArray(response.suggestions)) {
                that.suggestions = response.suggestions;
                that.suggest();
                options.onSearchComplete.call(that.element, q, response.suggestions);
            } else if (!that.isBadQuery(q)) {
                that.abortAjax();

                ajaxSettings = {
                    url: serviceUrl,
                    data: params,
                    type: options.type,
                    dataType: options.dataType
                };

                $.extend(ajaxSettings, options.ajaxSettings);

                that.currentRequest = $.ajax(ajaxSettings).done(function (data) {
                    var result;
                    that.currentRequest = null;
                    result = options.transformResult(data, q);
                    that.processResponse(result, q, cacheKey);
                    options.onSearchComplete.call(that.element, q, result.suggestions);
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    options.onSearchError.call(that.element, q, jqXHR, textStatus, errorThrown);
                });
            } else {
                options.onSearchComplete.call(that.element, q, []);
            }
        },

        isBadQuery: function isBadQuery(q) {
            if (!this.options.preventBadQueries) {
                return false;
            }

            var badQueries = this.badQueries,
                i = badQueries.length;

            while (i--) {
                if (q.indexOf(badQueries[i]) === 0) {
                    return true;
                }
            }

            return false;
        },

        hide: function hide() {
            var that = this,
                container = $(that.suggestionsContainer);

            if ($.isFunction(that.options.onHide) && that.visible) {
                that.options.onHide.call(that.element, container);
            }

            that.visible = false;
            that.selectedIndex = -1;
            clearInterval(that.onChangeInterval);
            $(that.suggestionsContainer).hide();
            that.signalHint(null);
        },

        suggest: function suggest() {
            if (!this.suggestions.length) {
                if (this.options.showNoSuggestionNotice) {
                    this.noSuggestions();
                } else {
                    this.hide();
                }
                return;
            }

            var that = this,
                options = that.options,
                groupBy = options.groupBy,
                formatResult = options.formatResult,
                value = that.getQuery(that.currentValue),
                className = that.classes.suggestion,
                classSelected = that.classes.selected,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer),
                beforeRender = options.beforeRender,
                html = '',
                category,
                formatGroup = function formatGroup(suggestion, index) {
                var currentCategory = suggestion.data[groupBy];

                if (category === currentCategory) {
                    return '';
                }

                category = currentCategory;

                return '<div class="autocomplete-group"><strong>' + category + '</strong></div>';
            };

            if (options.triggerSelectOnValidInput && that.isExactMatch(value)) {
                that.select(0);
                return;
            }

            // Build suggestions inner HTML:
            $.each(that.suggestions, function (i, suggestion) {
                if (groupBy) {
                    html += formatGroup(suggestion, value, i);
                }

                html += '<div class="' + className + '" data-index="' + i + '">' + formatResult(suggestion, value, i) + '</div>';
            });

            this.adjustContainerWidth();

            noSuggestionsContainer.detach();
            container.html(html);

            if ($.isFunction(beforeRender)) {
                beforeRender.call(that.element, container, that.suggestions);
            }

            that.fixPosition();
            container.show();

            // Select first value by default:
            if (options.autoSelectFirst) {
                that.selectedIndex = 0;
                container.scrollTop(0);
                container.children('.' + className).first().addClass(classSelected);
            }

            that.visible = true;
            that.findBestHint();
        },

        noSuggestions: function noSuggestions() {
            var that = this,
                container = $(that.suggestionsContainer),
                noSuggestionsContainer = $(that.noSuggestionsContainer);

            this.adjustContainerWidth();

            // Some explicit steps. Be careful here as it easy to get
            // noSuggestionsContainer removed from DOM if not detached properly.
            noSuggestionsContainer.detach();
            container.empty(); // clean suggestions if any
            container.append(noSuggestionsContainer);

            that.fixPosition();

            container.show();
            that.visible = true;
        },

        adjustContainerWidth: function adjustContainerWidth() {
            var that = this,
                options = that.options,
                width,
                container = $(that.suggestionsContainer);

            // If width is auto, adjust width before displaying suggestions,
            // because if instance was created before input had width, it will be zero.
            // Also it adjusts if input width has changed.
            if (options.width === 'auto') {
                width = that.el.outerWidth();
                container.css('width', width > 0 ? width : 300);
            }
        },

        findBestHint: function findBestHint() {
            var that = this,
                value = that.el.val().toLowerCase(),
                bestMatch = null;

            if (!value) {
                return;
            }

            $.each(that.suggestions, function (i, suggestion) {
                var foundMatch = suggestion.value.toLowerCase().indexOf(value) === 0;
                if (foundMatch) {
                    bestMatch = suggestion;
                }
                return !foundMatch;
            });

            that.signalHint(bestMatch);
        },

        signalHint: function signalHint(suggestion) {
            var hintValue = '',
                that = this;
            if (suggestion) {
                hintValue = that.currentValue + suggestion.value.substr(that.currentValue.length);
            }
            if (that.hintValue !== hintValue) {
                that.hintValue = hintValue;
                that.hint = suggestion;
                (this.options.onHint || $.noop)(hintValue);
            }
        },

        verifySuggestionsFormat: function verifySuggestionsFormat(suggestions) {
            // If suggestions is string array, convert them to supported format:
            if (suggestions.length && typeof suggestions[0] === 'string') {
                return $.map(suggestions, function (value) {
                    return { value: value, data: null };
                });
            }

            return suggestions;
        },

        validateOrientation: function validateOrientation(orientation, fallback) {
            orientation = $.trim(orientation || '').toLowerCase();

            if ($.inArray(orientation, ['auto', 'bottom', 'top']) === -1) {
                orientation = fallback;
            }

            return orientation;
        },

        processResponse: function processResponse(result, originalQuery, cacheKey) {
            var that = this,
                options = that.options;

            result.suggestions = that.verifySuggestionsFormat(result.suggestions);

            // Cache results if cache is not disabled:
            if (!options.noCache) {
                that.cachedResponse[cacheKey] = result;
                if (options.preventBadQueries && !result.suggestions.length) {
                    that.badQueries.push(originalQuery);
                }
            }

            // Return if originalQuery is not matching current query:
            if (originalQuery !== that.getQuery(that.currentValue)) {
                return;
            }

            that.suggestions = result.suggestions;
            that.suggest();
        },

        activate: function activate(index) {
            var that = this,
                activeItem,
                selected = that.classes.selected,
                container = $(that.suggestionsContainer),
                children = container.find('.' + that.classes.suggestion);

            container.find('.' + selected).removeClass(selected);

            that.selectedIndex = index;

            if (that.selectedIndex !== -1 && children.length > that.selectedIndex) {
                activeItem = children.get(that.selectedIndex);
                $(activeItem).addClass(selected);
                return activeItem;
            }

            return null;
        },

        selectHint: function selectHint() {
            var that = this,
                i = $.inArray(that.hint, that.suggestions);

            that.select(i);
        },

        select: function select(i) {
            var that = this;
            that.hide();
            that.onSelect(i);
            that.disableKillerFn();
        },

        moveUp: function moveUp() {
            var that = this;

            if (that.selectedIndex === -1) {
                return;
            }

            if (that.selectedIndex === 0) {
                $(that.suggestionsContainer).children().first().removeClass(that.classes.selected);
                that.selectedIndex = -1;
                that.el.val(that.currentValue);
                that.findBestHint();
                return;
            }

            that.adjustScroll(that.selectedIndex - 1);
        },

        moveDown: function moveDown() {
            var that = this;

            if (that.selectedIndex === that.suggestions.length - 1) {
                return;
            }

            that.adjustScroll(that.selectedIndex + 1);
        },

        adjustScroll: function adjustScroll(index) {
            var that = this,
                activeItem = that.activate(index);

            if (!activeItem) {
                return;
            }

            var offsetTop,
                upperBound,
                lowerBound,
                heightDelta = $(activeItem).outerHeight();

            offsetTop = activeItem.offsetTop;
            upperBound = $(that.suggestionsContainer).scrollTop();
            lowerBound = upperBound + that.options.maxHeight - heightDelta;

            if (offsetTop < upperBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop);
            } else if (offsetTop > lowerBound) {
                $(that.suggestionsContainer).scrollTop(offsetTop - that.options.maxHeight + heightDelta);
            }

            if (!that.options.preserveInput) {
                that.el.val(that.getValue(that.suggestions[index].value));
            }
            that.signalHint(null);
        },

        onSelect: function onSelect(index) {
            var that = this,
                onSelectCallback = that.options.onSelect,
                suggestion = that.suggestions[index];

            that.currentValue = that.getValue(suggestion.value);

            if (that.currentValue !== that.el.val() && !that.options.preserveInput) {
                that.el.val(that.currentValue);
            }

            that.signalHint(null);
            that.suggestions = [];
            that.selection = suggestion;

            if ($.isFunction(onSelectCallback)) {
                onSelectCallback.call(that.element, suggestion);
            }
        },

        getValue: function getValue(value) {
            var that = this,
                delimiter = that.options.delimiter,
                currentValue,
                parts;

            if (!delimiter) {
                return value;
            }

            currentValue = that.currentValue;
            parts = currentValue.split(delimiter);

            if (parts.length === 1) {
                return value;
            }

            return currentValue.substr(0, currentValue.length - parts[parts.length - 1].length) + value;
        },

        dispose: function dispose() {
            var that = this;
            that.el.off('.autocomplete').removeData('autocomplete');
            that.disableKillerFn();
            $(window).off('resize.autocomplete', that.fixPositionCapture);
            $(that.suggestionsContainer).remove();
        }
    };

    // Create chainable jQuery plugin:
    $.fn.autocomplete = $.fn.devbridgeAutocomplete = function (options, args) {
        var dataKey = 'autocomplete';
        // If function invoked without argument return
        // instance of the first matched element:
        if (!arguments.length) {
            return this.first().data(dataKey);
        }

        return this.each(function () {
            var inputElement = $(this),
                instance = inputElement.data(dataKey);

            if (typeof options === 'string') {
                if (instance && typeof instance[options] === 'function') {
                    instance[options](args);
                }
            } else {
                // If instance already exists, destroy it:
                if (instance && instance.dispose) {
                    instance.dispose();
                }
                instance = new Autocomplete(this, options);
                inputElement.data(dataKey, instance);
            }
        });
    };
});
'use strict';

var _$$flickity;

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

$(document).foundation();

var bases = document.getElementsByTagName('base');
var baseHref = null;

if (bases.length > 0) {
	baseHref = bases[0].href;
}
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Lazy Loading Images:
/*-------------------------------------------------*/
/*-------------------------------------------------*/
var myLazyLoad = new LazyLoad({
	// example of options object -> see options section
	elements_selector: ".dp-lazy"
	// throttle: 200,
	// data_src: "src",
	// data_srcset: "srcset",
	// callback_set: function() { /* ... */ }
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Big Carousel (Home Page):
/*-------------------------------------------------*/
/*-------------------------------------------------*/

var $carousel = $('.carousel').flickity((_$$flickity = {
	imagesLoaded: true,
	percentPosition: false,
	selectedAttraction: 0.015,
	friction: 0.3,
	prevNextButtons: false,
	draggable: true,
	autoPlay: true
}, _defineProperty(_$$flickity, 'autoPlay', 8000), _defineProperty(_$$flickity, 'pauseAutoPlayOnHover', false), _defineProperty(_$$flickity, 'bgLazyLoad', true), _defineProperty(_$$flickity, 'pageDots', true), _$$flickity));

var $imgs = $carousel.find('.carousel-cell .cell-bg');
// get transform property
var docStyle = document.documentElement.style;
var transformProp = typeof docStyle.transform == 'string' ? 'transform' : 'WebkitTransform';
// get Flickity instance
var flkty = $carousel.data('flickity');

$carousel.on('scroll.flickity', function () {
	flkty.slides.forEach(function (slide, i) {
		var img = $imgs[i];
		var x = (slide.target + flkty.x) * -1 / 3;
		img.style[transformProp] = 'translateX(' + x + 'px)';
	});
});

$('.carousel-nav-cell').click(function () {
	flkty.stopPlayer();
});

var $gallery = $('.carousel').flickity();

function onLoadeddata(event) {
	var cell = $gallery.flickity('getParentCell', event.target);
	$gallery.flickity('cellSizeChange', cell && cell.element);
}

$gallery.find('video').each(function (i, video) {
	video.play();
	$(video).on('loadeddata', onLoadeddata);
});
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Slideshow block (in content):
/*-------------------------------------------------*/
/*-------------------------------------------------*/
var $slideshow = $('.slideshow').flickity({
	//adaptiveHeight: true,
	imagesLoaded: true,
	lazyLoad: true
});

var slideshowflk = $slideshow.data('flickity');

$slideshow.on('select.flickity', function () {
	console.log('Flickity select ' + slideshowflk.selectedIndex);
	//slideshowflk.reloadCells();
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Start Foundation Orbit Slider:
/*-------------------------------------------------*/
/*-------------------------------------------------*/
// var sliderOptions = {
// 	containerClass: 'slider__slides',
// 	slideClass: 'slider__slide',
// 	nextClass: 'slider__nav--next',
// 	prevClass: 'slider__nav--previous',

// };


// var slider = new Foundation.Orbit($('.slider'), sliderOptions);

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Wrap every iframe in a flex video class to prevent layout breakage
/*-------------------------------------------------*/
/*-------------------------------------------------*/
$('iframe').each(function () {
	$(this).wrap("<div class='flex-video widescreen'></div>");
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Distinguish dropdowns on mobile/desktop:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

$('.nav__item--parent').click(function (event) {
	if (whatInput.ask() === 'touch') {
		// do touch input things
		if (!$(this).hasClass('nav__item--is-hovered')) {
			event.preventDefault();
			$('.nav__item--parent').removeClass('nav__item--is-hovered');
			$(this).toggleClass('nav__item--is-hovered');
		}
	} else if (whatInput.ask() === 'mouse') {
		// do mouse things
	}
});

//If anything in the main content container is clicked, remove faux hover class.
$('#main-content__container').click(function () {
	$('.nav__item').removeClass('nav__item--is-hovered');
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Site Search:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

function toggleSearchClasses() {
	$("body").toggleClass("body--search-active");
	$('.nav-collapse').removeClass('open');
	$('.nav__menu-icon').removeClass('is-clicked');
	$("#nav__menu-icon").removeClass("nav__menu-icon--menu-is-active");
	$("#site-search__form").toggleClass("site-search__form--is-inactive site-search__form--is-active");
	$("#site-search").toggleClass("site-search--is-inactive site-search--is-active");
	$(".header__screen").toggleClass("header__screen--grayscale");
	$(".main-content__container").toggleClass("main-content__container--grayscale");
	$(".nav__wrapper").toggleClass("nav__wrapper--grayscale");
	$(".nav__link--search").toggleClass("nav__link--search-is-active");

	//HACK: wait for 5ms before changing focus. I don't think I need this anymore actually..
	setTimeout(function () {
		$(".nav__wrapper").toggleClass("nav__wrapper--search-is-active");
	}, 5);

	$(".nav").toggleClass("nav--search-is-active");
}

$(".nav__link--search").click(function () {
	toggleSearchClasses();
	if ($("#mobile-nav__wrapper").hasClass("mobile-nav__wrapper--mobile-menu-is-active")) {
		toggleMobileMenuClasses();
		$("#site-search").appendTo('#header').addClass('site-search--mobile');
	}
	document.getElementById("site-search__input").focus();
});

$(".nav__link--search-cancel").click(function () {
	toggleSearchClasses();
	document.getElementById("site-search__input").blur();
});

//When search form is out of focus, deactivate it.
$("#site-search__form").focusout(function () {
	if ($("#site-search__form").hasClass("site-search__form--is-active")) {
		//Comment out the following line if you need to use WebKit/Blink inspector tool on the search (so it doesn't lose focus):
		//toggleSearchClasses();
	}
});

$('input[name="Search"]').autocomplete({
	serviceUrl: baseHref + '/home/autoComplete',
	deferRequestBy: 100,
	triggerSelectOnValidInput: false,
	minChars: 2,
	autoSelectFirst: true,
	type: 'post',
	onSelect: function onSelect(suggestion) {
		$('#site-search__form').submit();
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Mobile Search:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

if (Foundation.MediaQuery.atLeast('medium')) {
	// True if medium or large
	// False if small
	$("#site-search").addClass("site-search--desktop");
} else {
	$("#site-search").addClass("site-search--mobile");
}

$(".nav__toggle--search").click(function () {
	toggleSearchClasses();

	//append our site search div to the header.
	$("#site-search").appendTo('#header').addClass('site-search--mobile');
	document.getElementById("site-search__input").focus();
});

//If we're resizing from mobile to anything else, toggle the mobile search if it's active.
$(window).on('changed.zf.mediaquery', function (event, newSize, oldSize) {

	if (newSize == "medium") {
		//alert('hey');
		$("#site-search").removeClass("site-search--mobile");
		$("#site-search").addClass("site-search--desktop");

		$("#site-search").appendTo("#nav");

		if ($("#site-search").hasClass("site-search--is-active")) {
			// toggleSearchClasses();
		}
	} else if (newSize == "mobile") {
		$("#site-search").appendTo('#header');
		$("#site-search").removeClass("site-search--desktop");
		$("#site-search").addClass("site-search--mobile");
		if ($("#site-search").hasClass("site-search--is-active")) {
			// toggleSearchClasses();
		}
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Mobile Nav:
/*-------------------------------------------------*/
/*-------------------------------------------------*/

/* new stuff added my Brandon - lazy coding */
$('.nav__toggle--menu').on('click', function () {
	$('.nav__menu-icon').toggleClass('is-clicked');
	$("#nav__menu-icon").toggleClass("nav__menu-icon--menu-is-active");
	$('.nav-collapse').toggleClass('open');
});

$('.second-level--open').click(function () {
	$(this).parent().toggleClass('nav__item--opened');
	if ($(this).next().attr('aria-hidden') == 'true') {
		$(this).next().attr('aria-hidden', 'false');
	} else {
		$(this).next().attr('aria-hidden', 'true');
	}

	if ($(this).attr('aria-expanded') == 'false') {
		$(this).attr('aria-expanded', 'true');
	} else {
		$(this).next().attr('aria-expanded', 'false');
	}
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
// Background Video
/*-------------------------------------------------*/
/*-------------------------------------------------*/
$('.backgroundvideo__link').click(function (e) {
	var that = $(this);
	var video = that.data('video');
	var width = $('img', that).width();
	var height = $('img', that).height();
	that.parent().addClass('on');
	that.parent().prepend('<div class="flex-video widescreen"><iframe src="https://www.youtube.com/embed/' + video + '?rel=0&autoplay=1" width="' + width + '" height="' + height + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe></div>');
	that.hide();
	e.preventDefault();
});

/*-------------------------------------------------*/
/*-------------------------------------------------*/
//Automatic full height silder, not working yet..
/*-------------------------------------------------*/
/*-------------------------------------------------*/

// function setDimensions(){
//    var windowsHeight = $(window).height();

//    $('.orbit-container').css('height', windowsHeight + 'px');
//   // $('.orbit-container').css('max-height', windowsHeight + 'px');

//    $('.orbit-slide').css('height', windowsHeight + 'px');
//    $('.orbit-slide').css('max-height', windowsHeight + 'px');
// }

// $(window).resize(function() {
//     setDimensions();
// });

// setDimensions();
$('.gg-event-slider').flickity({
  // options
  cellAlign: 'left',
  contain: true
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24udGFicy5qcyIsImxhenlsb2FkLnRyYW5zcGlsZWQuanMiLCJmbGlja2l0eS5wa2dkLm1pbi5qcyIsImZsaWNraXR5YmctbGF6eWxvYWQuanMiLCJqcXVlcnktYXV0b2NvbXBsZXRlLmpzIiwiYXBwLmpzIl0sIm5hbWVzIjpbIiQiLCJGT1VOREFUSU9OX1ZFUlNJT04iLCJGb3VuZGF0aW9uIiwidmVyc2lvbiIsIl9wbHVnaW5zIiwiX3V1aWRzIiwicnRsIiwiYXR0ciIsInBsdWdpbiIsIm5hbWUiLCJjbGFzc05hbWUiLCJmdW5jdGlvbk5hbWUiLCJhdHRyTmFtZSIsImh5cGhlbmF0ZSIsInJlZ2lzdGVyUGx1Z2luIiwicGx1Z2luTmFtZSIsImNvbnN0cnVjdG9yIiwidG9Mb3dlckNhc2UiLCJ1dWlkIiwiR2V0WW9EaWdpdHMiLCIkZWxlbWVudCIsImRhdGEiLCJ0cmlnZ2VyIiwicHVzaCIsInVucmVnaXN0ZXJQbHVnaW4iLCJzcGxpY2UiLCJpbmRleE9mIiwicmVtb3ZlQXR0ciIsInJlbW92ZURhdGEiLCJwcm9wIiwicmVJbml0IiwicGx1Z2lucyIsImlzSlEiLCJlYWNoIiwiX2luaXQiLCJ0eXBlIiwiX3RoaXMiLCJmbnMiLCJwbGdzIiwiZm9yRWFjaCIsInAiLCJmb3VuZGF0aW9uIiwiT2JqZWN0Iiwia2V5cyIsImVyciIsImNvbnNvbGUiLCJlcnJvciIsImxlbmd0aCIsIm5hbWVzcGFjZSIsIk1hdGgiLCJyb3VuZCIsInBvdyIsInJhbmRvbSIsInRvU3RyaW5nIiwic2xpY2UiLCJyZWZsb3ciLCJlbGVtIiwiaSIsIiRlbGVtIiwiZmluZCIsImFkZEJhY2siLCIkZWwiLCJvcHRzIiwid2FybiIsInRoaW5nIiwic3BsaXQiLCJlIiwib3B0IiwibWFwIiwiZWwiLCJ0cmltIiwicGFyc2VWYWx1ZSIsImVyIiwiZ2V0Rm5OYW1lIiwidHJhbnNpdGlvbmVuZCIsInRyYW5zaXRpb25zIiwiZG9jdW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiZW5kIiwidCIsInN0eWxlIiwic2V0VGltZW91dCIsInRyaWdnZXJIYW5kbGVyIiwidXRpbCIsInRocm90dGxlIiwiZnVuYyIsImRlbGF5IiwidGltZXIiLCJjb250ZXh0IiwiYXJncyIsImFyZ3VtZW50cyIsImFwcGx5IiwibWV0aG9kIiwiJG1ldGEiLCIkbm9KUyIsImFwcGVuZFRvIiwiaGVhZCIsInJlbW92ZUNsYXNzIiwiTWVkaWFRdWVyeSIsIkFycmF5IiwicHJvdG90eXBlIiwiY2FsbCIsInBsdWdDbGFzcyIsInVuZGVmaW5lZCIsIlJlZmVyZW5jZUVycm9yIiwiVHlwZUVycm9yIiwid2luZG93IiwiZm4iLCJEYXRlIiwibm93IiwiZ2V0VGltZSIsInZlbmRvcnMiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJ2cCIsImNhbmNlbEFuaW1hdGlvbkZyYW1lIiwidGVzdCIsIm5hdmlnYXRvciIsInVzZXJBZ2VudCIsImxhc3RUaW1lIiwiY2FsbGJhY2siLCJuZXh0VGltZSIsIm1heCIsImNsZWFyVGltZW91dCIsInBlcmZvcm1hbmNlIiwic3RhcnQiLCJGdW5jdGlvbiIsImJpbmQiLCJvVGhpcyIsImFBcmdzIiwiZlRvQmluZCIsImZOT1AiLCJmQm91bmQiLCJjb25jYXQiLCJmdW5jTmFtZVJlZ2V4IiwicmVzdWx0cyIsImV4ZWMiLCJzdHIiLCJpc05hTiIsInBhcnNlRmxvYXQiLCJyZXBsYWNlIiwialF1ZXJ5IiwiQm94IiwiSW1Ob3RUb3VjaGluZ1lvdSIsIkdldERpbWVuc2lvbnMiLCJHZXRPZmZzZXRzIiwiZWxlbWVudCIsInBhcmVudCIsImxyT25seSIsInRiT25seSIsImVsZURpbXMiLCJ0b3AiLCJib3R0b20iLCJsZWZ0IiwicmlnaHQiLCJwYXJEaW1zIiwib2Zmc2V0IiwiaGVpZ2h0Iiwid2lkdGgiLCJ3aW5kb3dEaW1zIiwiYWxsRGlycyIsIkVycm9yIiwicmVjdCIsImdldEJvdW5kaW5nQ2xpZW50UmVjdCIsInBhclJlY3QiLCJwYXJlbnROb2RlIiwid2luUmVjdCIsImJvZHkiLCJ3aW5ZIiwicGFnZVlPZmZzZXQiLCJ3aW5YIiwicGFnZVhPZmZzZXQiLCJwYXJlbnREaW1zIiwiYW5jaG9yIiwicG9zaXRpb24iLCJ2T2Zmc2V0IiwiaE9mZnNldCIsImlzT3ZlcmZsb3ciLCIkZWxlRGltcyIsIiRhbmNob3JEaW1zIiwia2V5Q29kZXMiLCJjb21tYW5kcyIsIktleWJvYXJkIiwiZ2V0S2V5Q29kZXMiLCJwYXJzZUtleSIsImV2ZW50Iiwia2V5Iiwid2hpY2giLCJrZXlDb2RlIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwidG9VcHBlckNhc2UiLCJzaGlmdEtleSIsImN0cmxLZXkiLCJhbHRLZXkiLCJoYW5kbGVLZXkiLCJjb21wb25lbnQiLCJmdW5jdGlvbnMiLCJjb21tYW5kTGlzdCIsImNtZHMiLCJjb21tYW5kIiwibHRyIiwiZXh0ZW5kIiwicmV0dXJuVmFsdWUiLCJoYW5kbGVkIiwidW5oYW5kbGVkIiwiZmluZEZvY3VzYWJsZSIsImZpbHRlciIsImlzIiwicmVnaXN0ZXIiLCJjb21wb25lbnROYW1lIiwidHJhcEZvY3VzIiwiJGZvY3VzYWJsZSIsIiRmaXJzdEZvY3VzYWJsZSIsImVxIiwiJGxhc3RGb2N1c2FibGUiLCJvbiIsInRhcmdldCIsInByZXZlbnREZWZhdWx0IiwiZm9jdXMiLCJyZWxlYXNlRm9jdXMiLCJvZmYiLCJrY3MiLCJrIiwia2MiLCJkZWZhdWx0UXVlcmllcyIsImxhbmRzY2FwZSIsInBvcnRyYWl0IiwicmV0aW5hIiwicXVlcmllcyIsImN1cnJlbnQiLCJzZWxmIiwiZXh0cmFjdGVkU3R5bGVzIiwiY3NzIiwibmFtZWRRdWVyaWVzIiwicGFyc2VTdHlsZVRvT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCJ2YWx1ZSIsIl9nZXRDdXJyZW50U2l6ZSIsIl93YXRjaGVyIiwiYXRMZWFzdCIsInNpemUiLCJxdWVyeSIsImdldCIsIm1hdGNoTWVkaWEiLCJtYXRjaGVzIiwibWF0Y2hlZCIsIm5ld1NpemUiLCJjdXJyZW50U2l6ZSIsInN0eWxlTWVkaWEiLCJtZWRpYSIsInNjcmlwdCIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwiaW5mbyIsImlkIiwiaW5zZXJ0QmVmb3JlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsImN1cnJlbnRTdHlsZSIsIm1hdGNoTWVkaXVtIiwidGV4dCIsInN0eWxlU2hlZXQiLCJjc3NUZXh0IiwidGV4dENvbnRlbnQiLCJzdHlsZU9iamVjdCIsInJlZHVjZSIsInJldCIsInBhcmFtIiwicGFydHMiLCJ2YWwiLCJkZWNvZGVVUklDb21wb25lbnQiLCJpc0FycmF5IiwiaW5pdENsYXNzZXMiLCJhY3RpdmVDbGFzc2VzIiwiTW90aW9uIiwiYW5pbWF0ZUluIiwiYW5pbWF0aW9uIiwiY2IiLCJhbmltYXRlIiwiYW5pbWF0ZU91dCIsIk1vdmUiLCJkdXJhdGlvbiIsImFuaW0iLCJwcm9nIiwibW92ZSIsInRzIiwiaXNJbiIsImluaXRDbGFzcyIsImFjdGl2ZUNsYXNzIiwicmVzZXQiLCJhZGRDbGFzcyIsInNob3ciLCJvZmZzZXRXaWR0aCIsIm9uZSIsImZpbmlzaCIsImhpZGUiLCJ0cmFuc2l0aW9uRHVyYXRpb24iLCJOZXN0IiwiRmVhdGhlciIsIm1lbnUiLCJpdGVtcyIsInN1Yk1lbnVDbGFzcyIsInN1Ykl0ZW1DbGFzcyIsImhhc1N1YkNsYXNzIiwiJGl0ZW0iLCIkc3ViIiwiY2hpbGRyZW4iLCJCdXJuIiwiVGltZXIiLCJvcHRpb25zIiwibmFtZVNwYWNlIiwicmVtYWluIiwiaXNQYXVzZWQiLCJyZXN0YXJ0IiwiaW5maW5pdGUiLCJwYXVzZSIsIm9uSW1hZ2VzTG9hZGVkIiwiaW1hZ2VzIiwidW5sb2FkZWQiLCJjb21wbGV0ZSIsInJlYWR5U3RhdGUiLCJzaW5nbGVJbWFnZUxvYWRlZCIsInNyYyIsInNwb3RTd2lwZSIsImVuYWJsZWQiLCJkb2N1bWVudEVsZW1lbnQiLCJtb3ZlVGhyZXNob2xkIiwidGltZVRocmVzaG9sZCIsInN0YXJ0UG9zWCIsInN0YXJ0UG9zWSIsInN0YXJ0VGltZSIsImVsYXBzZWRUaW1lIiwiaXNNb3ZpbmciLCJvblRvdWNoRW5kIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9uVG91Y2hNb3ZlIiwieCIsInRvdWNoZXMiLCJwYWdlWCIsInkiLCJwYWdlWSIsImR4IiwiZHkiLCJkaXIiLCJhYnMiLCJvblRvdWNoU3RhcnQiLCJhZGRFdmVudExpc3RlbmVyIiwiaW5pdCIsInRlYXJkb3duIiwic3BlY2lhbCIsInN3aXBlIiwic2V0dXAiLCJub29wIiwiYWRkVG91Y2giLCJoYW5kbGVUb3VjaCIsImNoYW5nZWRUb3VjaGVzIiwiZmlyc3QiLCJldmVudFR5cGVzIiwidG91Y2hzdGFydCIsInRvdWNobW92ZSIsInRvdWNoZW5kIiwic2ltdWxhdGVkRXZlbnQiLCJNb3VzZUV2ZW50Iiwic2NyZWVuWCIsInNjcmVlblkiLCJjbGllbnRYIiwiY2xpZW50WSIsImNyZWF0ZUV2ZW50IiwiaW5pdE1vdXNlRXZlbnQiLCJkaXNwYXRjaEV2ZW50IiwiTXV0YXRpb25PYnNlcnZlciIsInByZWZpeGVzIiwidHJpZ2dlcnMiLCJzdG9wUHJvcGFnYXRpb24iLCJmYWRlT3V0IiwiY2hlY2tMaXN0ZW5lcnMiLCJldmVudHNMaXN0ZW5lciIsInJlc2l6ZUxpc3RlbmVyIiwic2Nyb2xsTGlzdGVuZXIiLCJjbG9zZW1lTGlzdGVuZXIiLCJ5ZXRpQm94ZXMiLCJwbHVnTmFtZXMiLCJsaXN0ZW5lcnMiLCJqb2luIiwicGx1Z2luSWQiLCJub3QiLCJkZWJvdW5jZSIsIiRub2RlcyIsIm5vZGVzIiwicXVlcnlTZWxlY3RvckFsbCIsImxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24iLCJtdXRhdGlvblJlY29yZHNMaXN0IiwiJHRhcmdldCIsImF0dHJpYnV0ZU5hbWUiLCJjbG9zZXN0IiwiZWxlbWVudE9ic2VydmVyIiwib2JzZXJ2ZSIsImF0dHJpYnV0ZXMiLCJjaGlsZExpc3QiLCJjaGFyYWN0ZXJEYXRhIiwic3VidHJlZSIsImF0dHJpYnV0ZUZpbHRlciIsIklIZWFyWW91IiwiQWNjb3JkaW9uIiwiZGVmYXVsdHMiLCIkdGFicyIsImlkeCIsIiRjb250ZW50IiwibGlua0lkIiwiJGluaXRBY3RpdmUiLCJmaXJzdFRpbWVJbml0IiwiZG93biIsIl9jaGVja0RlZXBMaW5rIiwibG9jYXRpb24iLCJoYXNoIiwiJGxpbmsiLCIkYW5jaG9yIiwiaGFzQ2xhc3MiLCJkZWVwTGlua1NtdWRnZSIsImxvYWQiLCJzY3JvbGxUb3AiLCJkZWVwTGlua1NtdWRnZURlbGF5IiwiZGVlcExpbmsiLCJfZXZlbnRzIiwiJHRhYkNvbnRlbnQiLCJ0b2dnbGUiLCJuZXh0IiwiJGEiLCJtdWx0aUV4cGFuZCIsInByZXZpb3VzIiwicHJldiIsInVwIiwidXBkYXRlSGlzdG9yeSIsImhpc3RvcnkiLCJwdXNoU3RhdGUiLCJyZXBsYWNlU3RhdGUiLCJmaXJzdFRpbWUiLCIkY3VycmVudEFjdGl2ZSIsInNsaWRlRG93biIsInNsaWRlU3BlZWQiLCIkYXVudHMiLCJzaWJsaW5ncyIsImFsbG93QWxsQ2xvc2VkIiwic2xpZGVVcCIsInN0b3AiLCJJbnRlcmNoYW5nZSIsInJ1bGVzIiwiY3VycmVudFBhdGgiLCJfYWRkQnJlYWtwb2ludHMiLCJfZ2VuZXJhdGVSdWxlcyIsIl9yZWZsb3ciLCJtYXRjaCIsInJ1bGUiLCJwYXRoIiwiU1BFQ0lBTF9RVUVSSUVTIiwicnVsZXNMaXN0Iiwibm9kZU5hbWUiLCJyZXNwb25zZSIsImh0bWwiLCJUYWJzIiwiJHRhYlRpdGxlcyIsImxpbmtDbGFzcyIsImlzQWN0aXZlIiwibGlua0FjdGl2ZUNsYXNzIiwiYXV0b0ZvY3VzIiwibWF0Y2hIZWlnaHQiLCIkaW1hZ2VzIiwiX3NldEhlaWdodCIsInNlbGVjdFRhYiIsIl9hZGRLZXlIYW5kbGVyIiwiX2FkZENsaWNrSGFuZGxlciIsIl9zZXRIZWlnaHRNcUhhbmRsZXIiLCJfaGFuZGxlVGFiQ2hhbmdlIiwiJGVsZW1lbnRzIiwiJHByZXZFbGVtZW50IiwiJG5leHRFbGVtZW50Iiwid3JhcE9uS2V5cyIsImxhc3QiLCJtaW4iLCJvcGVuIiwiaGlzdG9yeUhhbmRsZWQiLCJhY3RpdmVDb2xsYXBzZSIsIl9jb2xsYXBzZVRhYiIsIiRvbGRUYWIiLCIkdGFiTGluayIsIiR0YXJnZXRDb250ZW50IiwiX29wZW5UYWIiLCJwYW5lbEFjdGl2ZUNsYXNzIiwiJHRhcmdldF9hbmNob3IiLCJpZFN0ciIsInBhbmVsQ2xhc3MiLCJwYW5lbCIsInRlbXAiLCJkZWZpbmUiLCJhbWQiLCJtb2R1bGUiLCJleHBvcnRzIiwicmVxdWlyZSIsImpRdWVyeUJyaWRnZXQiLCJvIiwiYSIsImwiLCJuIiwicyIsImgiLCJyIiwiYyIsImNoYXJBdCIsImQiLCJvcHRpb24iLCJpc1BsYWluT2JqZWN0IiwiYnJpZGdldCIsIkV2RW1pdHRlciIsIm9uY2UiLCJfb25jZUV2ZW50cyIsImVtaXRFdmVudCIsImdldFNpemUiLCJpbm5lcldpZHRoIiwiaW5uZXJIZWlnaHQiLCJvdXRlcldpZHRoIiwib3V0ZXJIZWlnaHQiLCJwYWRkaW5nIiwiYm9yZGVyU3R5bGUiLCJib3JkZXJXaWR0aCIsImJveFNpemluZyIsImFwcGVuZENoaWxkIiwiaXNCb3hTaXplT3V0ZXIiLCJyZW1vdmVDaGlsZCIsInF1ZXJ5U2VsZWN0b3IiLCJub2RlVHlwZSIsImRpc3BsYXkiLCJvZmZzZXRIZWlnaHQiLCJpc0JvcmRlckJveCIsInUiLCJmIiwidiIsInBhZGRpbmdMZWZ0IiwicGFkZGluZ1JpZ2h0IiwiZyIsInBhZGRpbmdUb3AiLCJwYWRkaW5nQm90dG9tIiwibSIsIm1hcmdpbkxlZnQiLCJtYXJnaW5SaWdodCIsIm1hcmdpblRvcCIsIm1hcmdpbkJvdHRvbSIsIlMiLCJib3JkZXJMZWZ0V2lkdGgiLCJib3JkZXJSaWdodFdpZHRoIiwiRSIsImJvcmRlclRvcFdpZHRoIiwiYm9yZGVyQm90dG9tV2lkdGgiLCJiIiwiQyIsIm1hdGNoZXNTZWxlY3RvciIsIkVsZW1lbnQiLCJmaXp6eVVJVXRpbHMiLCJtb2R1bG8iLCJtYWtlQXJyYXkiLCJyZW1vdmVGcm9tIiwiZ2V0UGFyZW50IiwiZ2V0UXVlcnlFbGVtZW50IiwiaGFuZGxlRXZlbnQiLCJmaWx0ZXJGaW5kRWxlbWVudHMiLCJIVE1MRWxlbWVudCIsImRlYm91bmNlTWV0aG9kIiwiZG9jUmVhZHkiLCJ0b0Rhc2hlZCIsImh0bWxJbml0IiwiZ2V0QXR0cmlidXRlIiwiSlNPTiIsInBhcnNlIiwiRmxpY2tpdHkiLCJDZWxsIiwiY3JlYXRlIiwic2hpZnQiLCJkZXN0cm95Iiwib3JpZ2luU2lkZSIsInNldFBvc2l0aW9uIiwidXBkYXRlVGFyZ2V0IiwicmVuZGVyUG9zaXRpb24iLCJzZXREZWZhdWx0VGFyZ2V0IiwiY2VsbEFsaWduIiwiZ2V0UG9zaXRpb25WYWx1ZSIsIndyYXBTaGlmdCIsInNsaWRlYWJsZVdpZHRoIiwicmVtb3ZlIiwiU2xpZGUiLCJpc09yaWdpbkxlZnQiLCJjZWxscyIsImFkZENlbGwiLCJmaXJzdE1hcmdpbiIsImdldExhc3RDZWxsIiwic2VsZWN0IiwiY2hhbmdlU2VsZWN0ZWRDbGFzcyIsInVuc2VsZWN0IiwiY2xhc3NMaXN0IiwiZ2V0Q2VsbEVsZW1lbnRzIiwiYW5pbWF0ZVByb3RvdHlwZSIsIndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSIsInN0YXJ0QW5pbWF0aW9uIiwiaXNBbmltYXRpbmciLCJyZXN0aW5nRnJhbWVzIiwiYXBwbHlEcmFnRm9yY2UiLCJhcHBseVNlbGVjdGVkQXR0cmFjdGlvbiIsImludGVncmF0ZVBoeXNpY3MiLCJwb3NpdGlvblNsaWRlciIsInNldHRsZSIsInRyYW5zZm9ybSIsIndyYXBBcm91bmQiLCJzaGlmdFdyYXBDZWxscyIsImN1cnNvclBvc2l0aW9uIiwicmlnaHRUb0xlZnQiLCJzbGlkZXIiLCJzbGlkZXMiLCJzbGlkZXNXaWR0aCIsInBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCIsInNlbGVjdGVkU2xpZGUiLCJwZXJjZW50UG9zaXRpb24iLCJpc1BvaW50ZXJEb3duIiwiaXNGcmVlU2Nyb2xsaW5nIiwiX3NoaWZ0Q2VsbHMiLCJiZWZvcmVTaGlmdENlbGxzIiwiYWZ0ZXJTaGlmdENlbGxzIiwiX3Vuc2hpZnRDZWxscyIsInZlbG9jaXR5IiwiZ2V0RnJpY3Rpb25GYWN0b3IiLCJhcHBseUZvcmNlIiwiZ2V0UmVzdGluZ1Bvc2l0aW9uIiwiZHJhZ1giLCJzZWxlY3RlZEF0dHJhY3Rpb24iLCJmbGlja2l0eUdVSUQiLCJfY3JlYXRlIiwiYWNjZXNzaWJpbGl0eSIsImZyZWVTY3JvbGxGcmljdGlvbiIsImZyaWN0aW9uIiwibmFtZXNwYWNlSlF1ZXJ5RXZlbnRzIiwicmVzaXplIiwic2V0R2FsbGVyeVNpemUiLCJjcmVhdGVNZXRob2RzIiwiZ3VpZCIsInNlbGVjdGVkSW5kZXgiLCJ2aWV3cG9ydCIsIl9jcmVhdGVTbGlkZXIiLCJ3YXRjaENTUyIsImFjdGl2YXRlIiwiYWRkIiwiX2ZpbHRlckZpbmRDZWxsRWxlbWVudHMiLCJyZWxvYWRDZWxscyIsInRhYkluZGV4IiwiaW5pdGlhbEluZGV4IiwiaXNJbml0QWN0aXZhdGVkIiwiY2VsbFNlbGVjdG9yIiwiX21ha2VDZWxscyIsInBvc2l0aW9uQ2VsbHMiLCJfZ2V0V3JhcFNoaWZ0Q2VsbHMiLCJnZXRMYXN0U2xpZGUiLCJfc2l6ZUNlbGxzIiwiX3Bvc2l0aW9uQ2VsbHMiLCJtYXhDZWxsSGVpZ2h0IiwidXBkYXRlU2xpZGVzIiwiX2NvbnRhaW5TbGlkZXMiLCJfZ2V0Q2FuQ2VsbEZpdCIsInVwZGF0ZVNlbGVjdGVkU2xpZGUiLCJncm91cENlbGxzIiwicGFyc2VJbnQiLCJyZXBvc2l0aW9uIiwic2V0Q2VsbEFsaWduIiwiY2VudGVyIiwiYWRhcHRpdmVIZWlnaHQiLCJfZ2V0R2FwQ2VsbHMiLCJjb250YWluIiwiRXZlbnQiLCJfd3JhcFNlbGVjdCIsImlzRHJhZ1NlbGVjdCIsInVuc2VsZWN0U2VsZWN0ZWRTbGlkZSIsInNlbGVjdGVkQ2VsbHMiLCJzZWxlY3RlZEVsZW1lbnRzIiwic2VsZWN0ZWRDZWxsIiwic2VsZWN0ZWRFbGVtZW50Iiwic2VsZWN0Q2VsbCIsImdldENlbGwiLCJnZXRDZWxscyIsImdldFBhcmVudENlbGwiLCJnZXRBZGphY2VudENlbGxFbGVtZW50cyIsInVpQ2hhbmdlIiwiY2hpbGRVSVBvaW50ZXJEb3duIiwib25yZXNpemUiLCJjb250ZW50IiwiZGVhY3RpdmF0ZSIsIm9ua2V5ZG93biIsImFjdGl2ZUVsZW1lbnQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJVbmlwb2ludGVyIiwiYmluZFN0YXJ0RXZlbnQiLCJfYmluZFN0YXJ0RXZlbnQiLCJ1bmJpbmRTdGFydEV2ZW50IiwicG9pbnRlckVuYWJsZWQiLCJtc1BvaW50ZXJFbmFibGVkIiwiZ2V0VG91Y2giLCJpZGVudGlmaWVyIiwicG9pbnRlcklkZW50aWZpZXIiLCJvbm1vdXNlZG93biIsImJ1dHRvbiIsIl9wb2ludGVyRG93biIsIm9udG91Y2hzdGFydCIsIm9uTVNQb2ludGVyRG93biIsIm9ucG9pbnRlcmRvd24iLCJwb2ludGVySWQiLCJwb2ludGVyRG93biIsIl9iaW5kUG9zdFN0YXJ0RXZlbnRzIiwibW91c2Vkb3duIiwicG9pbnRlcmRvd24iLCJNU1BvaW50ZXJEb3duIiwiX2JvdW5kUG9pbnRlckV2ZW50cyIsIl91bmJpbmRQb3N0U3RhcnRFdmVudHMiLCJvbm1vdXNlbW92ZSIsIl9wb2ludGVyTW92ZSIsIm9uTVNQb2ludGVyTW92ZSIsIm9ucG9pbnRlcm1vdmUiLCJvbnRvdWNobW92ZSIsInBvaW50ZXJNb3ZlIiwib25tb3VzZXVwIiwiX3BvaW50ZXJVcCIsIm9uTVNQb2ludGVyVXAiLCJvbnBvaW50ZXJ1cCIsIm9udG91Y2hlbmQiLCJfcG9pbnRlckRvbmUiLCJwb2ludGVyVXAiLCJwb2ludGVyRG9uZSIsIm9uTVNQb2ludGVyQ2FuY2VsIiwib25wb2ludGVyY2FuY2VsIiwiX3BvaW50ZXJDYW5jZWwiLCJvbnRvdWNoY2FuY2VsIiwicG9pbnRlckNhbmNlbCIsImdldFBvaW50ZXJQb2ludCIsIlVuaWRyYWdnZXIiLCJiaW5kSGFuZGxlcyIsIl9iaW5kSGFuZGxlcyIsInVuYmluZEhhbmRsZXMiLCJ0b3VjaEFjdGlvbiIsIm1zVG91Y2hBY3Rpb24iLCJoYW5kbGVzIiwiX2RyYWdQb2ludGVyRG93biIsImJsdXIiLCJwb2ludGVyRG93blBvaW50IiwiY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duIiwiX2RyYWdQb2ludGVyTW92ZSIsIl9kcmFnTW92ZSIsImlzRHJhZ2dpbmciLCJoYXNEcmFnU3RhcnRlZCIsIl9kcmFnU3RhcnQiLCJfZHJhZ1BvaW50ZXJVcCIsIl9kcmFnRW5kIiwiX3N0YXRpY0NsaWNrIiwiZHJhZ1N0YXJ0UG9pbnQiLCJpc1ByZXZlbnRpbmdDbGlja3MiLCJkcmFnU3RhcnQiLCJkcmFnTW92ZSIsImRyYWdFbmQiLCJvbmNsaWNrIiwiaXNJZ25vcmluZ01vdXNlVXAiLCJzdGF0aWNDbGljayIsImRyYWdnYWJsZSIsImRyYWdUaHJlc2hvbGQiLCJfY3JlYXRlRHJhZyIsImJpbmREcmFnIiwiX3VpQ2hhbmdlRHJhZyIsIl9jaGlsZFVJUG9pbnRlckRvd25EcmFnIiwidW5iaW5kRHJhZyIsImlzRHJhZ0JvdW5kIiwicG9pbnRlckRvd25Gb2N1cyIsIlRFWFRBUkVBIiwiSU5QVVQiLCJPUFRJT04iLCJyYWRpbyIsImNoZWNrYm94Iiwic3VibWl0IiwiaW1hZ2UiLCJmaWxlIiwicG9pbnRlckRvd25TY3JvbGwiLCJTRUxFQ1QiLCJzY3JvbGxUbyIsImlzVG91Y2hTY3JvbGxpbmciLCJkcmFnU3RhcnRQb3NpdGlvbiIsInByZXZpb3VzRHJhZ1giLCJkcmFnTW92ZVRpbWUiLCJmcmVlU2Nyb2xsIiwiZHJhZ0VuZFJlc3RpbmdTZWxlY3QiLCJkcmFnRW5kQm9vc3RTZWxlY3QiLCJnZXRTbGlkZURpc3RhbmNlIiwiX2dldENsb3Nlc3RSZXN0aW5nIiwiZGlzdGFuY2UiLCJpbmRleCIsImZsb29yIiwib25zY3JvbGwiLCJUYXBMaXN0ZW5lciIsImJpbmRUYXAiLCJ1bmJpbmRUYXAiLCJ0YXBFbGVtZW50IiwiZGlyZWN0aW9uIiwieDAiLCJ4MSIsInkxIiwieDIiLCJ5MiIsIngzIiwiaXNFbmFibGVkIiwiaXNQcmV2aW91cyIsImlzTGVmdCIsInNldEF0dHJpYnV0ZSIsImRpc2FibGUiLCJjcmVhdGVTVkciLCJvblRhcCIsInVwZGF0ZSIsImNyZWF0ZUVsZW1lbnROUyIsImFycm93U2hhcGUiLCJlbmFibGUiLCJkaXNhYmxlZCIsInByZXZOZXh0QnV0dG9ucyIsIl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnMiLCJwcmV2QnV0dG9uIiwibmV4dEJ1dHRvbiIsImFjdGl2YXRlUHJldk5leHRCdXR0b25zIiwiZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyIsIlByZXZOZXh0QnV0dG9uIiwiaG9sZGVyIiwiZG90cyIsInNldERvdHMiLCJhZGREb3RzIiwicmVtb3ZlRG90cyIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJ1cGRhdGVTZWxlY3RlZCIsInNlbGVjdGVkRG90IiwiUGFnZURvdHMiLCJwYWdlRG90cyIsIl9jcmVhdGVQYWdlRG90cyIsImFjdGl2YXRlUGFnZURvdHMiLCJ1cGRhdGVTZWxlY3RlZFBhZ2VEb3RzIiwidXBkYXRlUGFnZURvdHMiLCJkZWFjdGl2YXRlUGFnZURvdHMiLCJzdGF0ZSIsIm9uVmlzaWJpbGl0eUNoYW5nZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJvblZpc2liaWxpdHlQbGF5IiwidmlzaWJpbGl0eVBsYXkiLCJwbGF5IiwidGljayIsImF1dG9QbGF5IiwiY2xlYXIiLCJ0aW1lb3V0IiwidW5wYXVzZSIsInBhdXNlQXV0b1BsYXlPbkhvdmVyIiwiX2NyZWF0ZVBsYXllciIsInBsYXllciIsImFjdGl2YXRlUGxheWVyIiwic3RvcFBsYXllciIsImRlYWN0aXZhdGVQbGF5ZXIiLCJwbGF5UGxheWVyIiwicGF1c2VQbGF5ZXIiLCJ1bnBhdXNlUGxheWVyIiwib25tb3VzZWVudGVyIiwib25tb3VzZWxlYXZlIiwiUGxheWVyIiwiaW5zZXJ0IiwiX2NlbGxBZGRlZFJlbW92ZWQiLCJhcHBlbmQiLCJwcmVwZW5kIiwiY2VsbENoYW5nZSIsImNlbGxTaXplQ2hhbmdlIiwiaW1nIiwiZmxpY2tpdHkiLCJfY3JlYXRlTGF6eWxvYWQiLCJsYXp5TG9hZCIsIm9ubG9hZCIsIm9uZXJyb3IiLCJMYXp5TG9hZGVyIiwiX2NyZWF0ZUFzTmF2Rm9yIiwiYWN0aXZhdGVBc05hdkZvciIsImRlYWN0aXZhdGVBc05hdkZvciIsImRlc3Ryb3lBc05hdkZvciIsImFzTmF2Rm9yIiwic2V0TmF2Q29tcGFuaW9uIiwibmF2Q29tcGFuaW9uIiwib25OYXZDb21wYW5pb25TZWxlY3QiLCJuYXZDb21wYW5pb25TZWxlY3QiLCJvbk5hdlN0YXRpY0NsaWNrIiwicmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cyIsIm5hdlNlbGVjdGVkRWxlbWVudHMiLCJjaGFuZ2VOYXZTZWxlY3RlZENsYXNzIiwiaW1hZ2VzTG9hZGVkIiwiZWxlbWVudHMiLCJnZXRJbWFnZXMiLCJqcURlZmVycmVkIiwiRGVmZXJyZWQiLCJjaGVjayIsInVybCIsIkltYWdlIiwiYWRkRWxlbWVudEltYWdlcyIsImFkZEltYWdlIiwiYmFja2dyb3VuZCIsImFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzIiwiYmFja2dyb3VuZEltYWdlIiwiYWRkQmFja2dyb3VuZCIsInByb2dyZXNzIiwicHJvZ3Jlc3NlZENvdW50IiwiaGFzQW55QnJva2VuIiwiaXNMb2FkZWQiLCJub3RpZnkiLCJkZWJ1ZyIsImxvZyIsImlzQ29tcGxldGUiLCJnZXRJc0ltYWdlQ29tcGxldGUiLCJjb25maXJtIiwibmF0dXJhbFdpZHRoIiwicHJveHlJbWFnZSIsInVuYmluZEV2ZW50cyIsIm1ha2VKUXVlcnlQbHVnaW4iLCJwcm9taXNlIiwiX2NyZWF0ZUltYWdlc0xvYWRlZCIsImZhY3RvcnkiLCJ1dGlscyIsInByb3RvIiwiX2NyZWF0ZUJnTGF6eUxvYWQiLCJiZ0xhenlMb2FkIiwiYWRqQ291bnQiLCJjZWxsRWxlbXMiLCJjZWxsRWxlbSIsImJnTGF6eUxvYWRFbGVtIiwiaiIsIkJnTGF6eUxvYWRlciIsImVzY2FwZVJlZ0V4Q2hhcnMiLCJjcmVhdGVOb2RlIiwiY29udGFpbmVyQ2xhc3MiLCJkaXYiLCJFU0MiLCJUQUIiLCJSRVRVUk4iLCJMRUZUIiwiVVAiLCJSSUdIVCIsIkRPV04iLCJBdXRvY29tcGxldGUiLCJ0aGF0IiwiYWpheFNldHRpbmdzIiwiYXV0b1NlbGVjdEZpcnN0Iiwic2VydmljZVVybCIsImxvb2t1cCIsIm9uU2VsZWN0IiwibWluQ2hhcnMiLCJtYXhIZWlnaHQiLCJkZWZlclJlcXVlc3RCeSIsInBhcmFtcyIsImZvcm1hdFJlc3VsdCIsImRlbGltaXRlciIsInpJbmRleCIsIm5vQ2FjaGUiLCJvblNlYXJjaFN0YXJ0Iiwib25TZWFyY2hDb21wbGV0ZSIsIm9uU2VhcmNoRXJyb3IiLCJwcmVzZXJ2ZUlucHV0IiwidGFiRGlzYWJsZWQiLCJkYXRhVHlwZSIsImN1cnJlbnRSZXF1ZXN0IiwidHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCIsInByZXZlbnRCYWRRdWVyaWVzIiwibG9va3VwRmlsdGVyIiwic3VnZ2VzdGlvbiIsIm9yaWdpbmFsUXVlcnkiLCJxdWVyeUxvd2VyQ2FzZSIsInBhcmFtTmFtZSIsInRyYW5zZm9ybVJlc3VsdCIsInBhcnNlSlNPTiIsInNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UiLCJub1N1Z2dlc3Rpb25Ob3RpY2UiLCJvcmllbnRhdGlvbiIsImZvcmNlRml4UG9zaXRpb24iLCJzdWdnZXN0aW9ucyIsImJhZFF1ZXJpZXMiLCJjdXJyZW50VmFsdWUiLCJpbnRlcnZhbElkIiwiY2FjaGVkUmVzcG9uc2UiLCJvbkNoYW5nZUludGVydmFsIiwib25DaGFuZ2UiLCJpc0xvY2FsIiwic3VnZ2VzdGlvbnNDb250YWluZXIiLCJub1N1Z2dlc3Rpb25zQ29udGFpbmVyIiwiY2xhc3NlcyIsInNlbGVjdGVkIiwiaGludCIsImhpbnRWYWx1ZSIsInNlbGVjdGlvbiIsImluaXRpYWxpemUiLCJzZXRPcHRpb25zIiwicGF0dGVybiIsIlJlZ0V4cCIsImtpbGxlckZuIiwic3VnZ2VzdGlvblNlbGVjdG9yIiwiY29udGFpbmVyIiwia2lsbFN1Z2dlc3Rpb25zIiwiZGlzYWJsZUtpbGxlckZuIiwiZml4UG9zaXRpb25DYXB0dXJlIiwidmlzaWJsZSIsImZpeFBvc2l0aW9uIiwib25LZXlQcmVzcyIsIm9uS2V5VXAiLCJvbkJsdXIiLCJvbkZvY3VzIiwib25WYWx1ZUNoYW5nZSIsImVuYWJsZUtpbGxlckZuIiwiYWJvcnRBamF4IiwiYWJvcnQiLCJzdXBwbGllZE9wdGlvbnMiLCJ2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdCIsInZhbGlkYXRlT3JpZW50YXRpb24iLCJjbGVhckNhY2hlIiwiY2xlYXJJbnRlcnZhbCIsIiRjb250YWluZXIiLCJjb250YWluZXJQYXJlbnQiLCJzaXRlU2VhcmNoRGl2IiwiY29udGFpbmVySGVpZ2h0Iiwic3R5bGVzIiwidmlld1BvcnRIZWlnaHQiLCJ0b3BPdmVyZmxvdyIsImJvdHRvbU92ZXJmbG93Iiwib3BhY2l0eSIsInBhcmVudE9mZnNldERpZmYiLCJvZmZzZXRQYXJlbnQiLCJzdG9wS2lsbFN1Z2dlc3Rpb25zIiwic2V0SW50ZXJ2YWwiLCJpc0N1cnNvckF0RW5kIiwidmFsTGVuZ3RoIiwic2VsZWN0aW9uU3RhcnQiLCJyYW5nZSIsImNyZWF0ZVJhbmdlIiwibW92ZVN0YXJ0Iiwic3VnZ2VzdCIsIm9uSGludCIsInNlbGVjdEhpbnQiLCJtb3ZlVXAiLCJtb3ZlRG93biIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsImZpbmRCZXN0SGludCIsImdldFF1ZXJ5Iiwib25JbnZhbGlkYXRlU2VsZWN0aW9uIiwiaXNFeGFjdE1hdGNoIiwiZ2V0U3VnZ2VzdGlvbnMiLCJnZXRTdWdnZXN0aW9uc0xvY2FsIiwibGltaXQiLCJsb29rdXBMaW1pdCIsImdyZXAiLCJxIiwiY2FjaGVLZXkiLCJpZ25vcmVQYXJhbXMiLCJpc0Z1bmN0aW9uIiwiaXNCYWRRdWVyeSIsImFqYXgiLCJkb25lIiwicmVzdWx0IiwicHJvY2Vzc1Jlc3BvbnNlIiwiZmFpbCIsImpxWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwib25IaWRlIiwic2lnbmFsSGludCIsIm5vU3VnZ2VzdGlvbnMiLCJncm91cEJ5IiwiY2xhc3NTZWxlY3RlZCIsImJlZm9yZVJlbmRlciIsImNhdGVnb3J5IiwiZm9ybWF0R3JvdXAiLCJjdXJyZW50Q2F0ZWdvcnkiLCJhZGp1c3RDb250YWluZXJXaWR0aCIsImRldGFjaCIsImVtcHR5IiwiYmVzdE1hdGNoIiwiZm91bmRNYXRjaCIsInN1YnN0ciIsImZhbGxiYWNrIiwiaW5BcnJheSIsImFjdGl2ZUl0ZW0iLCJhZGp1c3RTY3JvbGwiLCJvZmZzZXRUb3AiLCJ1cHBlckJvdW5kIiwibG93ZXJCb3VuZCIsImhlaWdodERlbHRhIiwiZ2V0VmFsdWUiLCJvblNlbGVjdENhbGxiYWNrIiwiZGlzcG9zZSIsImF1dG9jb21wbGV0ZSIsImRldmJyaWRnZUF1dG9jb21wbGV0ZSIsImRhdGFLZXkiLCJpbnB1dEVsZW1lbnQiLCJpbnN0YW5jZSIsImJhc2VzIiwiYmFzZUhyZWYiLCJocmVmIiwibXlMYXp5TG9hZCIsIkxhenlMb2FkIiwiZWxlbWVudHNfc2VsZWN0b3IiLCIkY2Fyb3VzZWwiLCIkaW1ncyIsImRvY1N0eWxlIiwidHJhbnNmb3JtUHJvcCIsImZsa3R5Iiwic2xpZGUiLCJjbGljayIsIiRnYWxsZXJ5Iiwib25Mb2FkZWRkYXRhIiwiY2VsbCIsInZpZGVvIiwiJHNsaWRlc2hvdyIsInNsaWRlc2hvd2ZsayIsIndyYXAiLCJ3aGF0SW5wdXQiLCJhc2siLCJ0b2dnbGVDbGFzcyIsInRvZ2dsZVNlYXJjaENsYXNzZXMiLCJ0b2dnbGVNb2JpbGVNZW51Q2xhc3NlcyIsImdldEVsZW1lbnRCeUlkIiwiZm9jdXNvdXQiLCJvbGRTaXplIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFGLEVBQXNCcTJCLFFBQXRCLENBQStCO0FBQzdCO0FBQ0FqUyxhQUFXLE1BRmtCO0FBRzdCeUYsV0FBUztBQUhvQixDQUEvQiIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIHdoYXQtaW5wdXQgLSBBIGdsb2JhbCB1dGlsaXR5IGZvciB0cmFja2luZyB0aGUgY3VycmVudCBpbnB1dCBtZXRob2QgKG1vdXNlLCBrZXlib2FyZCBvciB0b3VjaCkuXG4gKiBAdmVyc2lvbiB2NC4wLjZcbiAqIEBsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS90ZW4xc2V2ZW4vd2hhdC1pbnB1dFxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFwid2hhdElucHV0XCIsIFtdLCBmYWN0b3J5KTtcblx0ZWxzZSBpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcpXG5cdFx0ZXhwb3J0c1tcIndoYXRJbnB1dFwiXSA9IGZhY3RvcnkoKTtcblx0ZWxzZVxuXHRcdHJvb3RbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbigpIHtcbnJldHVybiAvKioqKioqLyAoZnVuY3Rpb24obW9kdWxlcykgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbi8qKioqKiovIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbi8qKioqKiovIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbi8qKioqKiovIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuXG4vKioqKioqLyBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbi8qKioqKiovIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHRleHBvcnRzOiB7fSxcbi8qKioqKiovIFx0XHRcdGlkOiBtb2R1bGVJZCxcbi8qKioqKiovIFx0XHRcdGxvYWRlZDogZmFsc2Vcbi8qKioqKiovIFx0XHR9O1xuXG4vKioqKioqLyBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4vKioqKioqLyBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbi8qKioqKiovIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4vKioqKioqLyBcdFx0bW9kdWxlLmxvYWRlZCA9IHRydWU7XG5cbi8qKioqKiovIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuLyoqKioqKi8gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbi8qKioqKiovIFx0fVxuXG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4vKioqKioqLyBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cbi8qKioqKiovIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4vKioqKioqLyBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKDApO1xuLyoqKioqKi8gfSlcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4vKioqKioqLyAoW1xuLyogMCAqL1xuLyoqKi8gZnVuY3Rpb24obW9kdWxlLCBleHBvcnRzKSB7XG5cblx0bW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKSB7XG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBWYXJpYWJsZXNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICAvLyBjYWNoZSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblx0ICB2YXIgZG9jRWxlbSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCB0eXBlXG5cdCAgdmFyIGN1cnJlbnRJbnB1dCA9ICdpbml0aWFsJztcblxuXHQgIC8vIGxhc3QgdXNlZCBpbnB1dCBpbnRlbnRcblx0ICB2YXIgY3VycmVudEludGVudCA9IG51bGw7XG5cblx0ICAvLyBmb3JtIGlucHV0IHR5cGVzXG5cdCAgdmFyIGZvcm1JbnB1dHMgPSBbXG5cdCAgICAnaW5wdXQnLFxuXHQgICAgJ3NlbGVjdCcsXG5cdCAgICAndGV4dGFyZWEnXG5cdCAgXTtcblxuXHQgIC8vIGxpc3Qgb2YgbW9kaWZpZXIga2V5cyBjb21tb25seSB1c2VkIHdpdGggdGhlIG1vdXNlIGFuZFxuXHQgIC8vIGNhbiBiZSBzYWZlbHkgaWdub3JlZCB0byBwcmV2ZW50IGZhbHNlIGtleWJvYXJkIGRldGVjdGlvblxuXHQgIHZhciBpZ25vcmVNYXAgPSBbXG5cdCAgICAxNiwgLy8gc2hpZnRcblx0ICAgIDE3LCAvLyBjb250cm9sXG5cdCAgICAxOCwgLy8gYWx0XG5cdCAgICA5MSwgLy8gV2luZG93cyBrZXkgLyBsZWZ0IEFwcGxlIGNtZFxuXHQgICAgOTMgIC8vIFdpbmRvd3MgbWVudSAvIHJpZ2h0IEFwcGxlIGNtZFxuXHQgIF07XG5cblx0ICAvLyBtYXBwaW5nIG9mIGV2ZW50cyB0byBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dE1hcCA9IHtcblx0ICAgICdrZXl1cCc6ICdrZXlib2FyZCcsXG5cdCAgICAnbW91c2Vkb3duJzogJ21vdXNlJyxcblx0ICAgICdtb3VzZW1vdmUnOiAnbW91c2UnLFxuXHQgICAgJ01TUG9pbnRlckRvd24nOiAncG9pbnRlcicsXG5cdCAgICAnTVNQb2ludGVyTW92ZSc6ICdwb2ludGVyJyxcblx0ICAgICdwb2ludGVyZG93bic6ICdwb2ludGVyJyxcblx0ICAgICdwb2ludGVybW92ZSc6ICdwb2ludGVyJyxcblx0ICAgICd0b3VjaHN0YXJ0JzogJ3RvdWNoJ1xuXHQgIH07XG5cblx0ICAvLyBhcnJheSBvZiBhbGwgdXNlZCBpbnB1dCB0eXBlc1xuXHQgIHZhciBpbnB1dFR5cGVzID0gW107XG5cblx0ICAvLyBib29sZWFuOiB0cnVlIGlmIHRvdWNoIGJ1ZmZlciB0aW1lciBpcyBydW5uaW5nXG5cdCAgdmFyIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cblx0ICAvLyBtYXAgb2YgSUUgMTAgcG9pbnRlciBldmVudHNcblx0ICB2YXIgcG9pbnRlck1hcCA9IHtcblx0ICAgIDI6ICd0b3VjaCcsXG5cdCAgICAzOiAndG91Y2gnLCAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICAgNDogJ21vdXNlJ1xuXHQgIH07XG5cblx0ICAvLyB0b3VjaCBidWZmZXIgdGltZXJcblx0ICB2YXIgdG91Y2hUaW1lciA9IG51bGw7XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFNldCB1cFxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBzZXRVcCA9IGZ1bmN0aW9uKCkge1xuXG5cdCAgICAvLyBhZGQgY29ycmVjdCBtb3VzZSB3aGVlbCBldmVudCBtYXBwaW5nIHRvIGBpbnB1dE1hcGBcblx0ICAgIGlucHV0TWFwW2RldGVjdFdoZWVsKCldID0gJ21vdXNlJztcblxuXHQgICAgYWRkTGlzdGVuZXJzKCk7XG5cdCAgICBzZXRJbnB1dCgpO1xuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEV2ZW50c1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBhZGRMaXN0ZW5lcnMgPSBmdW5jdGlvbigpIHtcblxuXHQgICAgLy8gYHBvaW50ZXJtb3ZlYCwgYE1TUG9pbnRlck1vdmVgLCBgbW91c2Vtb3ZlYCBhbmQgbW91c2Ugd2hlZWwgZXZlbnQgYmluZGluZ1xuXHQgICAgLy8gY2FuIG9ubHkgZGVtb25zdHJhdGUgcG90ZW50aWFsLCBidXQgbm90IGFjdHVhbCwgaW50ZXJhY3Rpb25cblx0ICAgIC8vIGFuZCBhcmUgdHJlYXRlZCBzZXBhcmF0ZWx5XG5cblx0ICAgIC8vIHBvaW50ZXIgZXZlbnRzIChtb3VzZSwgcGVuLCB0b3VjaClcblx0ICAgIGlmICh3aW5kb3cuUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcmRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigncG9pbnRlcm1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIGlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQpIHtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJEb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ01TUG9pbnRlck1vdmUnLCBzZXRJbnRlbnQpO1xuXHQgICAgfSBlbHNlIHtcblxuXHQgICAgICAvLyBtb3VzZSBldmVudHNcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWRvd24nLCB1cGRhdGVJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vtb3ZlJywgc2V0SW50ZW50KTtcblxuXHQgICAgICAvLyB0b3VjaCBldmVudHNcblx0ICAgICAgaWYgKCdvbnRvdWNoc3RhcnQnIGluIHdpbmRvdykge1xuXHQgICAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHRvdWNoQnVmZmVyKTtcblx0ICAgICAgfVxuXHQgICAgfVxuXG5cdCAgICAvLyBtb3VzZSB3aGVlbFxuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKGRldGVjdFdoZWVsKCksIHNldEludGVudCk7XG5cblx0ICAgIC8vIGtleWJvYXJkIGV2ZW50c1xuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdrZXl1cCcsIHVwZGF0ZUlucHV0KTtcblx0ICB9O1xuXG5cdCAgLy8gY2hlY2tzIGNvbmRpdGlvbnMgYmVmb3JlIHVwZGF0aW5nIG5ldyBpbnB1dFxuXHQgIHZhciB1cGRhdGVJbnB1dCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcpIHtcblx0ICAgICAgdmFyIGV2ZW50S2V5ID0gZXZlbnQud2hpY2g7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKFxuXHQgICAgICAgIGN1cnJlbnRJbnB1dCAhPT0gdmFsdWUgfHxcblx0ICAgICAgICBjdXJyZW50SW50ZW50ICE9PSB2YWx1ZVxuXHQgICAgICApIHtcblxuXHQgICAgICAgIHZhciBhY3RpdmVFbGVtID0gZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtcblx0ICAgICAgICB2YXIgYWN0aXZlSW5wdXQgPSAoXG5cdCAgICAgICAgICBhY3RpdmVFbGVtICYmXG5cdCAgICAgICAgICBhY3RpdmVFbGVtLm5vZGVOYW1lICYmXG5cdCAgICAgICAgICBmb3JtSW5wdXRzLmluZGV4T2YoYWN0aXZlRWxlbS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKSA9PT0gLTFcblx0ICAgICAgICApID8gdHJ1ZSA6IGZhbHNlO1xuXG5cdCAgICAgICAgaWYgKFxuXHQgICAgICAgICAgdmFsdWUgPT09ICd0b3VjaCcgfHxcblxuXHQgICAgICAgICAgLy8gaWdub3JlIG1vdXNlIG1vZGlmaWVyIGtleXNcblx0ICAgICAgICAgICh2YWx1ZSA9PT0gJ21vdXNlJyAmJiBpZ25vcmVNYXAuaW5kZXhPZihldmVudEtleSkgPT09IC0xKSB8fFxuXG5cdCAgICAgICAgICAvLyBkb24ndCBzd2l0Y2ggaWYgdGhlIGN1cnJlbnQgZWxlbWVudCBpcyBhIGZvcm0gaW5wdXRcblx0ICAgICAgICAgICh2YWx1ZSA9PT0gJ2tleWJvYXJkJyAmJiBhY3RpdmVJbnB1dClcblx0ICAgICAgICApIHtcblxuXHQgICAgICAgICAgLy8gc2V0IHRoZSBjdXJyZW50IGFuZCBjYXRjaC1hbGwgdmFyaWFibGVcblx0ICAgICAgICAgIGN1cnJlbnRJbnB1dCA9IGN1cnJlbnRJbnRlbnQgPSB2YWx1ZTtcblxuXHQgICAgICAgICAgc2V0SW5wdXQoKTtcblx0ICAgICAgICB9XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyB0aGUgZG9jIGFuZCBgaW5wdXRUeXBlc2AgYXJyYXkgd2l0aCBuZXcgaW5wdXRcblx0ICB2YXIgc2V0SW5wdXQgPSBmdW5jdGlvbigpIHtcblx0ICAgIGRvY0VsZW0uc2V0QXR0cmlidXRlKCdkYXRhLXdoYXRpbnB1dCcsIGN1cnJlbnRJbnB1dCk7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudElucHV0KTtcblxuXHQgICAgaWYgKGlucHV0VHlwZXMuaW5kZXhPZihjdXJyZW50SW5wdXQpID09PSAtMSkge1xuXHQgICAgICBpbnB1dFR5cGVzLnB1c2goY3VycmVudElucHV0KTtcblx0ICAgICAgZG9jRWxlbS5jbGFzc05hbWUgKz0gJyB3aGF0aW5wdXQtdHlwZXMtJyArIGN1cnJlbnRJbnB1dDtcblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gdXBkYXRlcyBpbnB1dCBpbnRlbnQgZm9yIGBtb3VzZW1vdmVgIGFuZCBgcG9pbnRlcm1vdmVgXG5cdCAgdmFyIHNldEludGVudCA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIG9ubHkgZXhlY3V0ZSBpZiB0aGUgdG91Y2ggYnVmZmVyIHRpbWVyIGlzbid0IHJ1bm5pbmdcblx0ICAgIGlmICghaXNCdWZmZXJpbmcpIHtcblx0ICAgICAgdmFyIHZhbHVlID0gaW5wdXRNYXBbZXZlbnQudHlwZV07XG5cdCAgICAgIGlmICh2YWx1ZSA9PT0gJ3BvaW50ZXInKSB2YWx1ZSA9IHBvaW50ZXJUeXBlKGV2ZW50KTtcblxuXHQgICAgICBpZiAoY3VycmVudEludGVudCAhPT0gdmFsdWUpIHtcblx0ICAgICAgICBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW50ZW50JywgY3VycmVudEludGVudCk7XG5cdCAgICAgIH1cblx0ICAgIH1cblx0ICB9O1xuXG5cdCAgLy8gYnVmZmVycyB0b3VjaCBldmVudHMgYmVjYXVzZSB0aGV5IGZyZXF1ZW50bHkgYWxzbyBmaXJlIG1vdXNlIGV2ZW50c1xuXHQgIHZhciB0b3VjaEJ1ZmZlciA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cblx0ICAgIC8vIGNsZWFyIHRoZSB0aW1lciBpZiBpdCBoYXBwZW5zIHRvIGJlIHJ1bm5pbmdcblx0ICAgIHdpbmRvdy5jbGVhclRpbWVvdXQodG91Y2hUaW1lcik7XG5cblx0ICAgIC8vIHNldCB0aGUgY3VycmVudCBpbnB1dFxuXHQgICAgdXBkYXRlSW5wdXQoZXZlbnQpO1xuXG5cdCAgICAvLyBzZXQgdGhlIGlzQnVmZmVyaW5nIHRvIGB0cnVlYFxuXHQgICAgaXNCdWZmZXJpbmcgPSB0cnVlO1xuXG5cdCAgICAvLyBydW4gdGhlIHRpbWVyXG5cdCAgICB0b3VjaFRpbWVyID0gd2luZG93LnNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cblx0ICAgICAgLy8gaWYgdGhlIHRpbWVyIHJ1bnMgb3V0LCBzZXQgaXNCdWZmZXJpbmcgYmFjayB0byBgZmFsc2VgXG5cdCAgICAgIGlzQnVmZmVyaW5nID0gZmFsc2U7XG5cdCAgICB9LCAyMDApO1xuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIFV0aWxpdGllc1xuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIHZhciBwb2ludGVyVHlwZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdCAgIGlmICh0eXBlb2YgZXZlbnQucG9pbnRlclR5cGUgPT09ICdudW1iZXInKSB7XG5cdCAgICAgIHJldHVybiBwb2ludGVyTWFwW2V2ZW50LnBvaW50ZXJUeXBlXTtcblx0ICAgfSBlbHNlIHtcblx0ICAgICAgcmV0dXJuIChldmVudC5wb2ludGVyVHlwZSA9PT0gJ3BlbicpID8gJ3RvdWNoJyA6IGV2ZW50LnBvaW50ZXJUeXBlOyAvLyB0cmVhdCBwZW4gbGlrZSB0b3VjaFxuXHQgICB9XG5cdCAgfTtcblxuXHQgIC8vIGRldGVjdCB2ZXJzaW9uIG9mIG1vdXNlIHdoZWVsIGV2ZW50IHRvIHVzZVxuXHQgIC8vIHZpYSBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9FdmVudHMvd2hlZWxcblx0ICB2YXIgZGV0ZWN0V2hlZWwgPSBmdW5jdGlvbigpIHtcblx0ICAgIHJldHVybiAnb253aGVlbCcgaW4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JykgP1xuXHQgICAgICAnd2hlZWwnIDogLy8gTW9kZXJuIGJyb3dzZXJzIHN1cHBvcnQgXCJ3aGVlbFwiXG5cblx0ICAgICAgZG9jdW1lbnQub25tb3VzZXdoZWVsICE9PSB1bmRlZmluZWQgP1xuXHQgICAgICAgICdtb3VzZXdoZWVsJyA6IC8vIFdlYmtpdCBhbmQgSUUgc3VwcG9ydCBhdCBsZWFzdCBcIm1vdXNld2hlZWxcIlxuXHQgICAgICAgICdET01Nb3VzZVNjcm9sbCc7IC8vIGxldCdzIGFzc3VtZSB0aGF0IHJlbWFpbmluZyBicm93c2VycyBhcmUgb2xkZXIgRmlyZWZveFxuXHQgIH07XG5cblxuXHQgIC8qXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAgIEluaXRcblxuXHQgICAgZG9uJ3Qgc3RhcnQgc2NyaXB0IHVubGVzcyBicm93c2VyIGN1dHMgdGhlIG11c3RhcmRcblx0ICAgIChhbHNvIHBhc3NlcyBpZiBwb2x5ZmlsbHMgYXJlIHVzZWQpXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgaWYgKFxuXHQgICAgJ2FkZEV2ZW50TGlzdGVuZXInIGluIHdpbmRvdyAmJlxuXHQgICAgQXJyYXkucHJvdG90eXBlLmluZGV4T2Zcblx0ICApIHtcblx0ICAgIHNldFVwKCk7XG5cdCAgfVxuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBBUElcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICByZXR1cm4ge1xuXG5cdCAgICAvLyByZXR1cm5zIHN0cmluZzogdGhlIGN1cnJlbnQgaW5wdXQgdHlwZVxuXHQgICAgLy8gb3B0OiAnbG9vc2UnfCdzdHJpY3QnXG5cdCAgICAvLyAnc3RyaWN0JyAoZGVmYXVsdCk6IHJldHVybnMgdGhlIHNhbWUgdmFsdWUgYXMgdGhlIGBkYXRhLXdoYXRpbnB1dGAgYXR0cmlidXRlXG5cdCAgICAvLyAnbG9vc2UnOiBpbmNsdWRlcyBgZGF0YS13aGF0aW50ZW50YCB2YWx1ZSBpZiBpdCdzIG1vcmUgY3VycmVudCB0aGFuIGBkYXRhLXdoYXRpbnB1dGBcblx0ICAgIGFzazogZnVuY3Rpb24ob3B0KSB7IHJldHVybiAob3B0ID09PSAnbG9vc2UnKSA/IGN1cnJlbnRJbnRlbnQgOiBjdXJyZW50SW5wdXQ7IH0sXG5cblx0ICAgIC8vIHJldHVybnMgYXJyYXk6IGFsbCB0aGUgZGV0ZWN0ZWQgaW5wdXQgdHlwZXNcblx0ICAgIHR5cGVzOiBmdW5jdGlvbigpIHsgcmV0dXJuIGlucHV0VHlwZXM7IH1cblxuXHQgIH07XG5cblx0fSgpKTtcblxuXG4vKioqLyB9XG4vKioqKioqLyBdKVxufSk7XG47IiwiIWZ1bmN0aW9uKCQpIHtcblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBGT1VOREFUSU9OX1ZFUlNJT04gPSAnNi4zLjEnO1xuXG4vLyBHbG9iYWwgRm91bmRhdGlvbiBvYmplY3Rcbi8vIFRoaXMgaXMgYXR0YWNoZWQgdG8gdGhlIHdpbmRvdywgb3IgdXNlZCBhcyBhIG1vZHVsZSBmb3IgQU1EL0Jyb3dzZXJpZnlcbnZhciBGb3VuZGF0aW9uID0ge1xuICB2ZXJzaW9uOiBGT1VOREFUSU9OX1ZFUlNJT04sXG5cbiAgLyoqXG4gICAqIFN0b3JlcyBpbml0aWFsaXplZCBwbHVnaW5zLlxuICAgKi9cbiAgX3BsdWdpbnM6IHt9LFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgZ2VuZXJhdGVkIHVuaXF1ZSBpZHMgZm9yIHBsdWdpbiBpbnN0YW5jZXNcbiAgICovXG4gIF91dWlkczogW10sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBib29sZWFuIGZvciBSVEwgc3VwcG9ydFxuICAgKi9cbiAgcnRsOiBmdW5jdGlvbigpe1xuICAgIHJldHVybiAkKCdodG1sJykuYXR0cignZGlyJykgPT09ICdydGwnO1xuICB9LFxuICAvKipcbiAgICogRGVmaW5lcyBhIEZvdW5kYXRpb24gcGx1Z2luLCBhZGRpbmcgaXQgdG8gdGhlIGBGb3VuZGF0aW9uYCBuYW1lc3BhY2UgYW5kIHRoZSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZSB3aGVuIHJlZmxvd2luZy5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIFRoZSBjb25zdHJ1Y3RvciBvZiB0aGUgcGx1Z2luLlxuICAgKi9cbiAgcGx1Z2luOiBmdW5jdGlvbihwbHVnaW4sIG5hbWUpIHtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIGFkZGluZyB0byBnbG9iYWwgRm91bmRhdGlvbiBvYmplY3RcbiAgICAvLyBFeGFtcGxlczogRm91bmRhdGlvbi5SZXZlYWwsIEZvdW5kYXRpb24uT2ZmQ2FudmFzXG4gICAgdmFyIGNsYXNzTmFtZSA9IChuYW1lIHx8IGZ1bmN0aW9uTmFtZShwbHVnaW4pKTtcbiAgICAvLyBPYmplY3Qga2V5IHRvIHVzZSB3aGVuIHN0b3JpbmcgdGhlIHBsdWdpbiwgYWxzbyB1c2VkIHRvIGNyZWF0ZSB0aGUgaWRlbnRpZnlpbmcgZGF0YSBhdHRyaWJ1dGUgZm9yIHRoZSBwbHVnaW5cbiAgICAvLyBFeGFtcGxlczogZGF0YS1yZXZlYWwsIGRhdGEtb2ZmLWNhbnZhc1xuICAgIHZhciBhdHRyTmFtZSAgPSBoeXBoZW5hdGUoY2xhc3NOYW1lKTtcblxuICAgIC8vIEFkZCB0byB0aGUgRm91bmRhdGlvbiBvYmplY3QgYW5kIHRoZSBwbHVnaW5zIGxpc3QgKGZvciByZWZsb3dpbmcpXG4gICAgdGhpcy5fcGx1Z2luc1thdHRyTmFtZV0gPSB0aGlzW2NsYXNzTmFtZV0gPSBwbHVnaW47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUG9wdWxhdGVzIHRoZSBfdXVpZHMgYXJyYXkgd2l0aCBwb2ludGVycyB0byBlYWNoIGluZGl2aWR1YWwgcGx1Z2luIGluc3RhbmNlLlxuICAgKiBBZGRzIHRoZSBgemZQbHVnaW5gIGRhdGEtYXR0cmlidXRlIHRvIHByb2dyYW1tYXRpY2FsbHkgY3JlYXRlZCBwbHVnaW5zIHRvIGFsbG93IHVzZSBvZiAkKHNlbGVjdG9yKS5mb3VuZGF0aW9uKG1ldGhvZCkgY2FsbHMuXG4gICAqIEFsc28gZmlyZXMgdGhlIGluaXRpYWxpemF0aW9uIGV2ZW50IGZvciBlYWNoIHBsdWdpbiwgY29uc29saWRhdGluZyByZXBldGl0aXZlIGNvZGUuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBhbiBpbnN0YW5jZSBvZiBhIHBsdWdpbiwgdXN1YWxseSBgdGhpc2AgaW4gY29udGV4dC5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgLSB0aGUgbmFtZSBvZiB0aGUgcGx1Z2luLCBwYXNzZWQgYXMgYSBjYW1lbENhc2VkIHN0cmluZy5cbiAgICogQGZpcmVzIFBsdWdpbiNpbml0XG4gICAqL1xuICByZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IG5hbWUgPyBoeXBoZW5hdGUobmFtZSkgOiBmdW5jdGlvbk5hbWUocGx1Z2luLmNvbnN0cnVjdG9yKS50b0xvd2VyQ2FzZSgpO1xuICAgIHBsdWdpbi51dWlkID0gdGhpcy5HZXRZb0RpZ2l0cyg2LCBwbHVnaW5OYW1lKTtcblxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkpeyBwbHVnaW4uJGVsZW1lbnQuYXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCwgcGx1Z2luLnV1aWQpOyB9XG4gICAgaWYoIXBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicpKXsgcGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJywgcGx1Z2luKTsgfVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgaW5pdGlhbGl6ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNpbml0XG4gICAgICAgICAgICovXG4gICAgcGx1Z2luLiRlbGVtZW50LnRyaWdnZXIoYGluaXQuemYuJHtwbHVnaW5OYW1lfWApO1xuXG4gICAgdGhpcy5fdXVpZHMucHVzaChwbHVnaW4udXVpZCk7XG5cbiAgICByZXR1cm47XG4gIH0sXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogUmVtb3ZlcyB0aGUgcGx1Z2lucyB1dWlkIGZyb20gdGhlIF91dWlkcyBhcnJheS5cbiAgICogUmVtb3ZlcyB0aGUgemZQbHVnaW4gZGF0YSBhdHRyaWJ1dGUsIGFzIHdlbGwgYXMgdGhlIGRhdGEtcGx1Z2luLW5hbWUgYXR0cmlidXRlLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBkZXN0cm95ZWQgZXZlbnQgZm9yIHRoZSBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBmaXJlcyBQbHVnaW4jZGVzdHJveWVkXG4gICAqL1xuICB1bnJlZ2lzdGVyUGx1Z2luOiBmdW5jdGlvbihwbHVnaW4pe1xuICAgIHZhciBwbHVnaW5OYW1lID0gaHlwaGVuYXRlKGZ1bmN0aW9uTmFtZShwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKS5jb25zdHJ1Y3RvcikpO1xuXG4gICAgdGhpcy5fdXVpZHMuc3BsaWNlKHRoaXMuX3V1aWRzLmluZGV4T2YocGx1Z2luLnV1aWQpLCAxKTtcbiAgICBwbHVnaW4uJGVsZW1lbnQucmVtb3ZlQXR0cihgZGF0YS0ke3BsdWdpbk5hbWV9YCkucmVtb3ZlRGF0YSgnemZQbHVnaW4nKVxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgYmVlbiBkZXN0cm95ZWQuXG4gICAgICAgICAgICogQGV2ZW50IFBsdWdpbiNkZXN0cm95ZWRcbiAgICAgICAgICAgKi9cbiAgICAgICAgICAudHJpZ2dlcihgZGVzdHJveWVkLnpmLiR7cGx1Z2luTmFtZX1gKTtcbiAgICBmb3IodmFyIHByb3AgaW4gcGx1Z2luKXtcbiAgICAgIHBsdWdpbltwcm9wXSA9IG51bGw7Ly9jbGVhbiB1cCBzY3JpcHQgdG8gcHJlcCBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uLlxuICAgIH1cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBmdW5jdGlvblxuICAgKiBDYXVzZXMgb25lIG9yIG1vcmUgYWN0aXZlIHBsdWdpbnMgdG8gcmUtaW5pdGlhbGl6ZSwgcmVzZXR0aW5nIGV2ZW50IGxpc3RlbmVycywgcmVjYWxjdWxhdGluZyBwb3NpdGlvbnMsIGV0Yy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IHBsdWdpbnMgLSBvcHRpb25hbCBzdHJpbmcgb2YgYW4gaW5kaXZpZHVhbCBwbHVnaW4ga2V5LCBhdHRhaW5lZCBieSBjYWxsaW5nIGAkKGVsZW1lbnQpLmRhdGEoJ3BsdWdpbk5hbWUnKWAsIG9yIHN0cmluZyBvZiBhIHBsdWdpbiBjbGFzcyBpLmUuIGAnZHJvcGRvd24nYFxuICAgKiBAZGVmYXVsdCBJZiBubyBhcmd1bWVudCBpcyBwYXNzZWQsIHJlZmxvdyBhbGwgY3VycmVudGx5IGFjdGl2ZSBwbHVnaW5zLlxuICAgKi9cbiAgIHJlSW5pdDogZnVuY3Rpb24ocGx1Z2lucyl7XG4gICAgIHZhciBpc0pRID0gcGx1Z2lucyBpbnN0YW5jZW9mICQ7XG4gICAgIHRyeXtcbiAgICAgICBpZihpc0pRKXtcbiAgICAgICAgIHBsdWdpbnMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAkKHRoaXMpLmRhdGEoJ3pmUGx1Z2luJykuX2luaXQoKTtcbiAgICAgICAgIH0pO1xuICAgICAgIH1lbHNle1xuICAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2YgcGx1Z2lucyxcbiAgICAgICAgIF90aGlzID0gdGhpcyxcbiAgICAgICAgIGZucyA9IHtcbiAgICAgICAgICAgJ29iamVjdCc6IGZ1bmN0aW9uKHBsZ3Mpe1xuICAgICAgICAgICAgIHBsZ3MuZm9yRWFjaChmdW5jdGlvbihwKXtcbiAgICAgICAgICAgICAgIHAgPSBoeXBoZW5hdGUocCk7XG4gICAgICAgICAgICAgICAkKCdbZGF0YS0nKyBwICsnXScpLmZvdW5kYXRpb24oJ19pbml0Jyk7XG4gICAgICAgICAgICAgfSk7XG4gICAgICAgICAgIH0sXG4gICAgICAgICAgICdzdHJpbmcnOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgIHBsdWdpbnMgPSBoeXBoZW5hdGUocGx1Z2lucyk7XG4gICAgICAgICAgICAgJCgnW2RhdGEtJysgcGx1Z2lucyArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAndW5kZWZpbmVkJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICB0aGlzWydvYmplY3QnXShPYmplY3Qua2V5cyhfdGhpcy5fcGx1Z2lucykpO1xuICAgICAgICAgICB9XG4gICAgICAgICB9O1xuICAgICAgICAgZm5zW3R5cGVdKHBsdWdpbnMpO1xuICAgICAgIH1cbiAgICAgfWNhdGNoKGVycil7XG4gICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICB9ZmluYWxseXtcbiAgICAgICByZXR1cm4gcGx1Z2lucztcbiAgICAgfVxuICAgfSxcblxuICAvKipcbiAgICogcmV0dXJucyBhIHJhbmRvbSBiYXNlLTM2IHVpZCB3aXRoIG5hbWVzcGFjaW5nXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge051bWJlcn0gbGVuZ3RoIC0gbnVtYmVyIG9mIHJhbmRvbSBiYXNlLTM2IGRpZ2l0cyBkZXNpcmVkLiBJbmNyZWFzZSBmb3IgbW9yZSByYW5kb20gc3RyaW5ncy5cbiAgICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZSAtIG5hbWUgb2YgcGx1Z2luIHRvIGJlIGluY29ycG9yYXRlZCBpbiB1aWQsIG9wdGlvbmFsLlxuICAgKiBAZGVmYXVsdCB7U3RyaW5nfSAnJyAtIGlmIG5vIHBsdWdpbiBuYW1lIGlzIHByb3ZpZGVkLCBub3RoaW5nIGlzIGFwcGVuZGVkIHRvIHRoZSB1aWQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd9IC0gdW5pcXVlIGlkXG4gICAqL1xuICBHZXRZb0RpZ2l0czogZnVuY3Rpb24obGVuZ3RoLCBuYW1lc3BhY2Upe1xuICAgIGxlbmd0aCA9IGxlbmd0aCB8fCA2O1xuICAgIHJldHVybiBNYXRoLnJvdW5kKChNYXRoLnBvdygzNiwgbGVuZ3RoICsgMSkgLSBNYXRoLnJhbmRvbSgpICogTWF0aC5wb3coMzYsIGxlbmd0aCkpKS50b1N0cmluZygzNikuc2xpY2UoMSkgKyAobmFtZXNwYWNlID8gYC0ke25hbWVzcGFjZX1gIDogJycpO1xuICB9LFxuICAvKipcbiAgICogSW5pdGlhbGl6ZSBwbHVnaW5zIG9uIGFueSBlbGVtZW50cyB3aXRoaW4gYGVsZW1gIChhbmQgYGVsZW1gIGl0c2VsZikgdGhhdCBhcmVuJ3QgYWxyZWFkeSBpbml0aWFsaXplZC5cbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW0gLSBqUXVlcnkgb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQgdG8gY2hlY2sgaW5zaWRlLiBBbHNvIGNoZWNrcyB0aGUgZWxlbWVudCBpdHNlbGYsIHVubGVzcyBpdCdzIHRoZSBgZG9jdW1lbnRgIG9iamVjdC5cbiAgICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IHBsdWdpbnMgLSBBIGxpc3Qgb2YgcGx1Z2lucyB0byBpbml0aWFsaXplLiBMZWF2ZSB0aGlzIG91dCB0byBpbml0aWFsaXplIGV2ZXJ5dGhpbmcuXG4gICAqL1xuICByZWZsb3c6IGZ1bmN0aW9uKGVsZW0sIHBsdWdpbnMpIHtcblxuICAgIC8vIElmIHBsdWdpbnMgaXMgdW5kZWZpbmVkLCBqdXN0IGdyYWIgZXZlcnl0aGluZ1xuICAgIGlmICh0eXBlb2YgcGx1Z2lucyA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHBsdWdpbnMgPSBPYmplY3Qua2V5cyh0aGlzLl9wbHVnaW5zKTtcbiAgICB9XG4gICAgLy8gSWYgcGx1Z2lucyBpcyBhIHN0cmluZywgY29udmVydCBpdCB0byBhbiBhcnJheSB3aXRoIG9uZSBpdGVtXG4gICAgZWxzZSBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICdzdHJpbmcnKSB7XG4gICAgICBwbHVnaW5zID0gW3BsdWdpbnNdO1xuICAgIH1cblxuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBwbHVnaW5cbiAgICAkLmVhY2gocGx1Z2lucywgZnVuY3Rpb24oaSwgbmFtZSkge1xuICAgICAgLy8gR2V0IHRoZSBjdXJyZW50IHBsdWdpblxuICAgICAgdmFyIHBsdWdpbiA9IF90aGlzLl9wbHVnaW5zW25hbWVdO1xuXG4gICAgICAvLyBMb2NhbGl6ZSB0aGUgc2VhcmNoIHRvIGFsbCBlbGVtZW50cyBpbnNpZGUgZWxlbSwgYXMgd2VsbCBhcyBlbGVtIGl0c2VsZiwgdW5sZXNzIGVsZW0gPT09IGRvY3VtZW50XG4gICAgICB2YXIgJGVsZW0gPSAkKGVsZW0pLmZpbmQoJ1tkYXRhLScrbmFtZSsnXScpLmFkZEJhY2soJ1tkYXRhLScrbmFtZSsnXScpO1xuXG4gICAgICAvLyBGb3IgZWFjaCBwbHVnaW4gZm91bmQsIGluaXRpYWxpemUgaXRcbiAgICAgICRlbGVtLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgb3B0cyA9IHt9O1xuICAgICAgICAvLyBEb24ndCBkb3VibGUtZGlwIG9uIHBsdWdpbnNcbiAgICAgICAgaWYgKCRlbC5kYXRhKCd6ZlBsdWdpbicpKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiVHJpZWQgdG8gaW5pdGlhbGl6ZSBcIituYW1lK1wiIG9uIGFuIGVsZW1lbnQgdGhhdCBhbHJlYWR5IGhhcyBhIEZvdW5kYXRpb24gcGx1Z2luLlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZigkZWwuYXR0cignZGF0YS1vcHRpb25zJykpe1xuICAgICAgICAgIHZhciB0aGluZyA9ICRlbC5hdHRyKCdkYXRhLW9wdGlvbnMnKS5zcGxpdCgnOycpLmZvckVhY2goZnVuY3Rpb24oZSwgaSl7XG4gICAgICAgICAgICB2YXIgb3B0ID0gZS5zcGxpdCgnOicpLm1hcChmdW5jdGlvbihlbCl7IHJldHVybiBlbC50cmltKCk7IH0pO1xuICAgICAgICAgICAgaWYob3B0WzBdKSBvcHRzW29wdFswXV0gPSBwYXJzZVZhbHVlKG9wdFsxXSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdHJ5e1xuICAgICAgICAgICRlbC5kYXRhKCd6ZlBsdWdpbicsIG5ldyBwbHVnaW4oJCh0aGlzKSwgb3B0cykpO1xuICAgICAgICB9Y2F0Y2goZXIpe1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXIpO1xuICAgICAgICB9ZmluYWxseXtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuICBnZXRGbk5hbWU6IGZ1bmN0aW9uTmFtZSxcbiAgdHJhbnNpdGlvbmVuZDogZnVuY3Rpb24oJGVsZW0pe1xuICAgIHZhciB0cmFuc2l0aW9ucyA9IHtcbiAgICAgICd0cmFuc2l0aW9uJzogJ3RyYW5zaXRpb25lbmQnLFxuICAgICAgJ1dlYmtpdFRyYW5zaXRpb24nOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG4gICAgICAnTW96VHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdPVHJhbnNpdGlvbic6ICdvdHJhbnNpdGlvbmVuZCdcbiAgICB9O1xuICAgIHZhciBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JyksXG4gICAgICAgIGVuZDtcblxuICAgIGZvciAodmFyIHQgaW4gdHJhbnNpdGlvbnMpe1xuICAgICAgaWYgKHR5cGVvZiBlbGVtLnN0eWxlW3RdICE9PSAndW5kZWZpbmVkJyl7XG4gICAgICAgIGVuZCA9IHRyYW5zaXRpb25zW3RdO1xuICAgICAgfVxuICAgIH1cbiAgICBpZihlbmQpe1xuICAgICAgcmV0dXJuIGVuZDtcbiAgICB9ZWxzZXtcbiAgICAgIGVuZCA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgJGVsZW0udHJpZ2dlckhhbmRsZXIoJ3RyYW5zaXRpb25lbmQnLCBbJGVsZW1dKTtcbiAgICAgIH0sIDEpO1xuICAgICAgcmV0dXJuICd0cmFuc2l0aW9uZW5kJztcbiAgICB9XG4gIH1cbn07XG5cbkZvdW5kYXRpb24udXRpbCA9IHtcbiAgLyoqXG4gICAqIEZ1bmN0aW9uIGZvciBhcHBseWluZyBhIGRlYm91bmNlIGVmZmVjdCB0byBhIGZ1bmN0aW9uIGNhbGwuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jIC0gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGF0IGVuZCBvZiB0aW1lb3V0LlxuICAgKiBAcGFyYW0ge051bWJlcn0gZGVsYXkgLSBUaW1lIGluIG1zIHRvIGRlbGF5IHRoZSBjYWxsIG9mIGBmdW5jYC5cbiAgICogQHJldHVybnMgZnVuY3Rpb25cbiAgICovXG4gIHRocm90dGxlOiBmdW5jdGlvbiAoZnVuYywgZGVsYXkpIHtcbiAgICB2YXIgdGltZXIgPSBudWxsO1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjb250ZXh0ID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcblxuICAgICAgaWYgKHRpbWVyID09PSBudWxsKSB7XG4gICAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICB0aW1lciA9IG51bGw7XG4gICAgICAgIH0sIGRlbGF5KTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG59O1xuXG4vLyBUT0RPOiBjb25zaWRlciBub3QgbWFraW5nIHRoaXMgYSBqUXVlcnkgZnVuY3Rpb25cbi8vIFRPRE86IG5lZWQgd2F5IHRvIHJlZmxvdyB2cy4gcmUtaW5pdGlhbGl6ZVxuLyoqXG4gKiBUaGUgRm91bmRhdGlvbiBqUXVlcnkgbWV0aG9kLlxuICogQHBhcmFtIHtTdHJpbmd8QXJyYXl9IG1ldGhvZCAtIEFuIGFjdGlvbiB0byBwZXJmb3JtIG9uIHRoZSBjdXJyZW50IGpRdWVyeSBvYmplY3QuXG4gKi9cbnZhciBmb3VuZGF0aW9uID0gZnVuY3Rpb24obWV0aG9kKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIG1ldGhvZCxcbiAgICAgICRtZXRhID0gJCgnbWV0YS5mb3VuZGF0aW9uLW1xJyksXG4gICAgICAkbm9KUyA9ICQoJy5uby1qcycpO1xuXG4gIGlmKCEkbWV0YS5sZW5ndGgpe1xuICAgICQoJzxtZXRhIGNsYXNzPVwiZm91bmRhdGlvbi1tcVwiPicpLmFwcGVuZFRvKGRvY3VtZW50LmhlYWQpO1xuICB9XG4gIGlmKCRub0pTLmxlbmd0aCl7XG4gICAgJG5vSlMucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG4gIH1cblxuICBpZih0eXBlID09PSAndW5kZWZpbmVkJyl7Ly9uZWVkcyB0byBpbml0aWFsaXplIHRoZSBGb3VuZGF0aW9uIG9iamVjdCwgb3IgYW4gaW5kaXZpZHVhbCBwbHVnaW4uXG4gICAgRm91bmRhdGlvbi5NZWRpYVF1ZXJ5Ll9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWZsb3codGhpcyk7XG4gIH1lbHNlIGlmKHR5cGUgPT09ICdzdHJpbmcnKXsvL2FuIGluZGl2aWR1YWwgbWV0aG9kIHRvIGludm9rZSBvbiBhIHBsdWdpbiBvciBncm91cCBvZiBwbHVnaW5zXG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpOy8vY29sbGVjdCBhbGwgdGhlIGFyZ3VtZW50cywgaWYgbmVjZXNzYXJ5XG4gICAgdmFyIHBsdWdDbGFzcyA9IHRoaXMuZGF0YSgnemZQbHVnaW4nKTsvL2RldGVybWluZSB0aGUgY2xhc3Mgb2YgcGx1Z2luXG5cbiAgICBpZihwbHVnQ2xhc3MgIT09IHVuZGVmaW5lZCAmJiBwbHVnQ2xhc3NbbWV0aG9kXSAhPT0gdW5kZWZpbmVkKXsvL21ha2Ugc3VyZSBib3RoIHRoZSBjbGFzcyBhbmQgbWV0aG9kIGV4aXN0XG4gICAgICBpZih0aGlzLmxlbmd0aCA9PT0gMSl7Ly9pZiB0aGVyZSdzIG9ubHkgb25lLCBjYWxsIGl0IGRpcmVjdGx5LlxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KHBsdWdDbGFzcywgYXJncyk7XG4gICAgICB9ZWxzZXtcbiAgICAgICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksIGVsKXsvL290aGVyd2lzZSBsb29wIHRocm91Z2ggdGhlIGpRdWVyeSBjb2xsZWN0aW9uIGFuZCBpbnZva2UgdGhlIG1ldGhvZCBvbiBlYWNoXG4gICAgICAgICAgcGx1Z0NsYXNzW21ldGhvZF0uYXBwbHkoJChlbCkuZGF0YSgnemZQbHVnaW4nKSwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1lbHNley8vZXJyb3IgZm9yIG5vIGNsYXNzIG9yIG5vIG1ldGhvZFxuICAgICAgdGhyb3cgbmV3IFJlZmVyZW5jZUVycm9yKFwiV2UncmUgc29ycnksICdcIiArIG1ldGhvZCArIFwiJyBpcyBub3QgYW4gYXZhaWxhYmxlIG1ldGhvZCBmb3IgXCIgKyAocGx1Z0NsYXNzID8gZnVuY3Rpb25OYW1lKHBsdWdDbGFzcykgOiAndGhpcyBlbGVtZW50JykgKyAnLicpO1xuICAgIH1cbiAgfWVsc2V7Ly9lcnJvciBmb3IgaW52YWxpZCBhcmd1bWVudCB0eXBlXG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgV2UncmUgc29ycnksICR7dHlwZX0gaXMgbm90IGEgdmFsaWQgcGFyYW1ldGVyLiBZb3UgbXVzdCB1c2UgYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBtZXRob2QgeW91IHdpc2ggdG8gaW52b2tlLmApO1xuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxud2luZG93LkZvdW5kYXRpb24gPSBGb3VuZGF0aW9uO1xuJC5mbi5mb3VuZGF0aW9uID0gZm91bmRhdGlvbjtcblxuLy8gUG9seWZpbGwgZm9yIHJlcXVlc3RBbmltYXRpb25GcmFtZVxuKGZ1bmN0aW9uKCkge1xuICBpZiAoIURhdGUubm93IHx8ICF3aW5kb3cuRGF0ZS5ub3cpXG4gICAgd2luZG93LkRhdGUubm93ID0gRGF0ZS5ub3cgPSBmdW5jdGlvbigpIHsgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpOyB9O1xuXG4gIHZhciB2ZW5kb3JzID0gWyd3ZWJraXQnLCAnbW96J107XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7ICsraSkge1xuICAgICAgdmFyIHZwID0gdmVuZG9yc1tpXTtcbiAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPSB3aW5kb3dbdnArJ1JlcXVlc3RBbmltYXRpb25GcmFtZSddO1xuICAgICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gKHdpbmRvd1t2cCsnQ2FuY2VsQW5pbWF0aW9uRnJhbWUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfHwgd2luZG93W3ZwKydDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXSk7XG4gIH1cbiAgaWYgKC9pUChhZHxob25lfG9kKS4qT1MgNi8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudClcbiAgICB8fCAhd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCAhd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lKSB7XG4gICAgdmFyIGxhc3RUaW1lID0gMDtcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIHZhciBuZXh0VGltZSA9IE1hdGgubWF4KGxhc3RUaW1lICsgMTYsIG5vdyk7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBjYWxsYmFjayhsYXN0VGltZSA9IG5leHRUaW1lKTsgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgbmV4dFRpbWUgLSBub3cpO1xuICAgIH07XG4gICAgd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lID0gY2xlYXJUaW1lb3V0O1xuICB9XG4gIC8qKlxuICAgKiBQb2x5ZmlsbCBmb3IgcGVyZm9ybWFuY2Uubm93LCByZXF1aXJlZCBieSByQUZcbiAgICovXG4gIGlmKCF3aW5kb3cucGVyZm9ybWFuY2UgfHwgIXdpbmRvdy5wZXJmb3JtYW5jZS5ub3cpe1xuICAgIHdpbmRvdy5wZXJmb3JtYW5jZSA9IHtcbiAgICAgIHN0YXJ0OiBEYXRlLm5vdygpLFxuICAgICAgbm93OiBmdW5jdGlvbigpeyByZXR1cm4gRGF0ZS5ub3coKSAtIHRoaXMuc3RhcnQ7IH1cbiAgICB9O1xuICB9XG59KSgpO1xuaWYgKCFGdW5jdGlvbi5wcm90b3R5cGUuYmluZCkge1xuICBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCA9IGZ1bmN0aW9uKG9UaGlzKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAvLyBjbG9zZXN0IHRoaW5nIHBvc3NpYmxlIHRvIHRoZSBFQ01BU2NyaXB0IDVcbiAgICAgIC8vIGludGVybmFsIElzQ2FsbGFibGUgZnVuY3Rpb25cbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Z1bmN0aW9uLnByb3RvdHlwZS5iaW5kIC0gd2hhdCBpcyB0cnlpbmcgdG8gYmUgYm91bmQgaXMgbm90IGNhbGxhYmxlJyk7XG4gICAgfVxuXG4gICAgdmFyIGFBcmdzICAgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpLFxuICAgICAgICBmVG9CaW5kID0gdGhpcyxcbiAgICAgICAgZk5PUCAgICA9IGZ1bmN0aW9uKCkge30sXG4gICAgICAgIGZCb3VuZCAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gZlRvQmluZC5hcHBseSh0aGlzIGluc3RhbmNlb2YgZk5PUFxuICAgICAgICAgICAgICAgICA/IHRoaXNcbiAgICAgICAgICAgICAgICAgOiBvVGhpcyxcbiAgICAgICAgICAgICAgICAgYUFyZ3MuY29uY2F0KEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgfTtcblxuICAgIGlmICh0aGlzLnByb3RvdHlwZSkge1xuICAgICAgLy8gbmF0aXZlIGZ1bmN0aW9ucyBkb24ndCBoYXZlIGEgcHJvdG90eXBlXG4gICAgICBmTk9QLnByb3RvdHlwZSA9IHRoaXMucHJvdG90eXBlO1xuICAgIH1cbiAgICBmQm91bmQucHJvdG90eXBlID0gbmV3IGZOT1AoKTtcblxuICAgIHJldHVybiBmQm91bmQ7XG4gIH07XG59XG4vLyBQb2x5ZmlsbCB0byBnZXQgdGhlIG5hbWUgb2YgYSBmdW5jdGlvbiBpbiBJRTlcbmZ1bmN0aW9uIGZ1bmN0aW9uTmFtZShmbikge1xuICBpZiAoRnVuY3Rpb24ucHJvdG90eXBlLm5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgIHZhciBmdW5jTmFtZVJlZ2V4ID0gL2Z1bmN0aW9uXFxzKFteKF17MSx9KVxcKC87XG4gICAgdmFyIHJlc3VsdHMgPSAoZnVuY05hbWVSZWdleCkuZXhlYygoZm4pLnRvU3RyaW5nKCkpO1xuICAgIHJldHVybiAocmVzdWx0cyAmJiByZXN1bHRzLmxlbmd0aCA+IDEpID8gcmVzdWx0c1sxXS50cmltKCkgOiBcIlwiO1xuICB9XG4gIGVsc2UgaWYgKGZuLnByb3RvdHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcmV0dXJuIGZuLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbiAgZWxzZSB7XG4gICAgcmV0dXJuIGZuLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG59XG5mdW5jdGlvbiBwYXJzZVZhbHVlKHN0cil7XG4gIGlmICgndHJ1ZScgPT09IHN0cikgcmV0dXJuIHRydWU7XG4gIGVsc2UgaWYgKCdmYWxzZScgPT09IHN0cikgcmV0dXJuIGZhbHNlO1xuICBlbHNlIGlmICghaXNOYU4oc3RyICogMSkpIHJldHVybiBwYXJzZUZsb2F0KHN0cik7XG4gIHJldHVybiBzdHI7XG59XG4vLyBDb252ZXJ0IFBhc2NhbENhc2UgdG8ga2ViYWItY2FzZVxuLy8gVGhhbmsgeW91OiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS84OTU1NTgwXG5mdW5jdGlvbiBoeXBoZW5hdGUoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvKFthLXpdKShbQS1aXSkvZywgJyQxLSQyJykudG9Mb3dlckNhc2UoKTtcbn1cblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5Gb3VuZGF0aW9uLkJveCA9IHtcbiAgSW1Ob3RUb3VjaGluZ1lvdTogSW1Ob3RUb3VjaGluZ1lvdSxcbiAgR2V0RGltZW5zaW9uczogR2V0RGltZW5zaW9ucyxcbiAgR2V0T2Zmc2V0czogR2V0T2Zmc2V0c1xufVxuXG4vKipcbiAqIENvbXBhcmVzIHRoZSBkaW1lbnNpb25zIG9mIGFuIGVsZW1lbnQgdG8gYSBjb250YWluZXIgYW5kIGRldGVybWluZXMgY29sbGlzaW9uIGV2ZW50cyB3aXRoIGNvbnRhaW5lci5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHRlc3QgZm9yIGNvbGxpc2lvbnMuXG4gKiBAcGFyYW0ge2pRdWVyeX0gcGFyZW50IC0galF1ZXJ5IG9iamVjdCB0byB1c2UgYXMgYm91bmRpbmcgY29udGFpbmVyLlxuICogQHBhcmFtIHtCb29sZWFufSBsck9ubHkgLSBzZXQgdG8gdHJ1ZSB0byBjaGVjayBsZWZ0IGFuZCByaWdodCB2YWx1ZXMgb25seS5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdGJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgdG9wIGFuZCBib3R0b20gdmFsdWVzIG9ubHkuXG4gKiBAZGVmYXVsdCBpZiBubyBwYXJlbnQgb2JqZWN0IHBhc3NlZCwgZGV0ZWN0cyBjb2xsaXNpb25zIHdpdGggYHdpbmRvd2AuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gLSB0cnVlIGlmIGNvbGxpc2lvbiBmcmVlLCBmYWxzZSBpZiBhIGNvbGxpc2lvbiBpbiBhbnkgZGlyZWN0aW9uLlxuICovXG5mdW5jdGlvbiBJbU5vdFRvdWNoaW5nWW91KGVsZW1lbnQsIHBhcmVudCwgbHJPbmx5LCB0Yk9ubHkpIHtcbiAgdmFyIGVsZURpbXMgPSBHZXREaW1lbnNpb25zKGVsZW1lbnQpLFxuICAgICAgdG9wLCBib3R0b20sIGxlZnQsIHJpZ2h0O1xuXG4gIGlmIChwYXJlbnQpIHtcbiAgICB2YXIgcGFyRGltcyA9IEdldERpbWVuc2lvbnMocGFyZW50KTtcblxuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBwYXJEaW1zLmhlaWdodCArIHBhckRpbXMub2Zmc2V0LnRvcCk7XG4gICAgdG9wICAgID0gKGVsZURpbXMub2Zmc2V0LnRvcCA+PSBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICAgIHJpZ2h0ICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ICsgZWxlRGltcy53aWR0aCA8PSBwYXJEaW1zLndpZHRoICsgcGFyRGltcy5vZmZzZXQubGVmdCk7XG4gIH1cbiAgZWxzZSB7XG4gICAgYm90dG9tID0gKGVsZURpbXMub2Zmc2V0LnRvcCArIGVsZURpbXMuaGVpZ2h0IDw9IGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgKyBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCk7XG4gICAgdG9wICAgID0gKGVsZURpbXMub2Zmc2V0LnRvcCA+PSBlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCk7XG4gICAgbGVmdCAgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gZWxlRGltcy53aW5kb3dEaW1zLndpZHRoKTtcbiAgfVxuXG4gIHZhciBhbGxEaXJzID0gW2JvdHRvbSwgdG9wLCBsZWZ0LCByaWdodF07XG5cbiAgaWYgKGxyT25seSkge1xuICAgIHJldHVybiBsZWZ0ID09PSByaWdodCA9PT0gdHJ1ZTtcbiAgfVxuXG4gIGlmICh0Yk9ubHkpIHtcbiAgICByZXR1cm4gdG9wID09PSBib3R0b20gPT09IHRydWU7XG4gIH1cblxuICByZXR1cm4gYWxsRGlycy5pbmRleE9mKGZhbHNlKSA9PT0gLTE7XG59O1xuXG4vKipcbiAqIFVzZXMgbmF0aXZlIG1ldGhvZHMgdG8gcmV0dXJuIGFuIG9iamVjdCBvZiBkaW1lbnNpb24gdmFsdWVzLlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeSB8fCBIVE1MfSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCBvciBET00gZWxlbWVudCBmb3Igd2hpY2ggdG8gZ2V0IHRoZSBkaW1lbnNpb25zLiBDYW4gYmUgYW55IGVsZW1lbnQgb3RoZXIgdGhhdCBkb2N1bWVudCBvciB3aW5kb3cuXG4gKiBAcmV0dXJucyB7T2JqZWN0fSAtIG5lc3RlZCBvYmplY3Qgb2YgaW50ZWdlciBwaXhlbCB2YWx1ZXNcbiAqIFRPRE8gLSBpZiBlbGVtZW50IGlzIHdpbmRvdywgcmV0dXJuIG9ubHkgdGhvc2UgdmFsdWVzLlxuICovXG5mdW5jdGlvbiBHZXREaW1lbnNpb25zKGVsZW0sIHRlc3Qpe1xuICBlbGVtID0gZWxlbS5sZW5ndGggPyBlbGVtWzBdIDogZWxlbTtcblxuICBpZiAoZWxlbSA9PT0gd2luZG93IHx8IGVsZW0gPT09IGRvY3VtZW50KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiSSdtIHNvcnJ5LCBEYXZlLiBJJ20gYWZyYWlkIEkgY2FuJ3QgZG8gdGhhdC5cIik7XG4gIH1cblxuICB2YXIgcmVjdCA9IGVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICBwYXJSZWN0ID0gZWxlbS5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luUmVjdCA9IGRvY3VtZW50LmJvZHkuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCksXG4gICAgICB3aW5ZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuICAgICAgd2luWCA9IHdpbmRvdy5wYWdlWE9mZnNldDtcblxuICByZXR1cm4ge1xuICAgIHdpZHRoOiByZWN0LndpZHRoLFxuICAgIGhlaWdodDogcmVjdC5oZWlnaHQsXG4gICAgb2Zmc2V0OiB7XG4gICAgICB0b3A6IHJlY3QudG9wICsgd2luWSxcbiAgICAgIGxlZnQ6IHJlY3QubGVmdCArIHdpblhcbiAgICB9LFxuICAgIHBhcmVudERpbXM6IHtcbiAgICAgIHdpZHRoOiBwYXJSZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiBwYXJSZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHBhclJlY3QudG9wICsgd2luWSxcbiAgICAgICAgbGVmdDogcGFyUmVjdC5sZWZ0ICsgd2luWFxuICAgICAgfVxuICAgIH0sXG4gICAgd2luZG93RGltczoge1xuICAgICAgd2lkdGg6IHdpblJlY3Qud2lkdGgsXG4gICAgICBoZWlnaHQ6IHdpblJlY3QuaGVpZ2h0LFxuICAgICAgb2Zmc2V0OiB7XG4gICAgICAgIHRvcDogd2luWSxcbiAgICAgICAgbGVmdDogd2luWFxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYW4gb2JqZWN0IG9mIHRvcCBhbmQgbGVmdCBpbnRlZ2VyIHBpeGVsIHZhbHVlcyBmb3IgZHluYW1pY2FsbHkgcmVuZGVyZWQgZWxlbWVudHMsXG4gKiBzdWNoIGFzOiBUb29sdGlwLCBSZXZlYWwsIGFuZCBEcm9wZG93blxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge2pRdWVyeX0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50IGJlaW5nIHBvc2l0aW9uZWQuXG4gKiBAcGFyYW0ge2pRdWVyeX0gYW5jaG9yIC0galF1ZXJ5IG9iamVjdCBmb3IgdGhlIGVsZW1lbnQncyBhbmNob3IgcG9pbnQuXG4gKiBAcGFyYW0ge1N0cmluZ30gcG9zaXRpb24gLSBhIHN0cmluZyByZWxhdGluZyB0byB0aGUgZGVzaXJlZCBwb3NpdGlvbiBvZiB0aGUgZWxlbWVudCwgcmVsYXRpdmUgdG8gaXQncyBhbmNob3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB2T2Zmc2V0IC0gaW50ZWdlciBwaXhlbCB2YWx1ZSBvZiBkZXNpcmVkIHZlcnRpY2FsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gKiBAcGFyYW0ge051bWJlcn0gaE9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCBob3Jpem9udGFsIHNlcGFyYXRpb24gYmV0d2VlbiBhbmNob3IgYW5kIGVsZW1lbnQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzT3ZlcmZsb3cgLSBpZiBhIGNvbGxpc2lvbiBldmVudCBpcyBkZXRlY3RlZCwgc2V0cyB0byB0cnVlIHRvIGRlZmF1bHQgdGhlIGVsZW1lbnQgdG8gZnVsbCB3aWR0aCAtIGFueSBkZXNpcmVkIG9mZnNldC5cbiAqIFRPRE8gYWx0ZXIvcmV3cml0ZSB0byB3b3JrIHdpdGggYGVtYCB2YWx1ZXMgYXMgd2VsbC9pbnN0ZWFkIG9mIHBpeGVsc1xuICovXG5mdW5jdGlvbiBHZXRPZmZzZXRzKGVsZW1lbnQsIGFuY2hvciwgcG9zaXRpb24sIHZPZmZzZXQsIGhPZmZzZXQsIGlzT3ZlcmZsb3cpIHtcbiAgdmFyICRlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgICRhbmNob3JEaW1zID0gYW5jaG9yID8gR2V0RGltZW5zaW9ucyhhbmNob3IpIDogbnVsbDtcblxuICBzd2l0Y2ggKHBvc2l0aW9uKSB7XG4gICAgY2FzZSAndG9wJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdyaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgdG9wJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgLSAoJGVsZURpbXMuaGVpZ2h0ICsgdk9mZnNldClcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciBib3R0b20nOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogaXNPdmVyZmxvdyA/IGhPZmZzZXQgOiAoKCRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgKCRhbmNob3JEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMikpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgbGVmdCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICgkZWxlRGltcy53aWR0aCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICgkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgKCRhbmNob3JEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHJpZ2h0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0ICsgMSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlcic6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCArICgkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC8gMikpIC0gKCRlbGVEaW1zLndpZHRoIC8gMiksXG4gICAgICAgIHRvcDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LnRvcCArICgkZWxlRGltcy53aW5kb3dEaW1zLmhlaWdodCAvIDIpKSAtICgkZWxlRGltcy5oZWlnaHQgLyAyKVxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmV2ZWFsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICgkZWxlRGltcy53aW5kb3dEaW1zLndpZHRoIC0gJGVsZURpbXMud2lkdGgpIC8gMixcbiAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyB2T2Zmc2V0XG4gICAgICB9XG4gICAgY2FzZSAncmV2ZWFsIGZ1bGwnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3BcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xlZnQgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0LFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0ICsgJGFuY2hvckRpbXMud2lkdGggKyBoT2Zmc2V0IC0gJGVsZURpbXMud2lkdGgsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICRhbmNob3JEaW1zLmhlaWdodCArIHZPZmZzZXRcbiAgICAgIH07XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKEZvdW5kYXRpb24ucnRsKCkgPyAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCAtICRlbGVEaW1zLndpZHRoICsgJGFuY2hvckRpbXMud2lkdGggOiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArIGhPZmZzZXQpLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9XG4gIH1cbn1cblxufShqUXVlcnkpO1xuIiwiLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqXG4gKiBUaGlzIHV0aWwgd2FzIGNyZWF0ZWQgYnkgTWFyaXVzIE9sYmVydHogKlxuICogUGxlYXNlIHRoYW5rIE1hcml1cyBvbiBHaXRIdWIgL293bGJlcnR6ICpcbiAqIG9yIHRoZSB3ZWIgaHR0cDovL3d3dy5tYXJpdXNvbGJlcnR6LmRlLyAqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBrZXlDb2RlcyA9IHtcbiAgOTogJ1RBQicsXG4gIDEzOiAnRU5URVInLFxuICAyNzogJ0VTQ0FQRScsXG4gIDMyOiAnU1BBQ0UnLFxuICAzNzogJ0FSUk9XX0xFRlQnLFxuICAzODogJ0FSUk9XX1VQJyxcbiAgMzk6ICdBUlJPV19SSUdIVCcsXG4gIDQwOiAnQVJST1dfRE9XTidcbn1cblxudmFyIGNvbW1hbmRzID0ge31cblxudmFyIEtleWJvYXJkID0ge1xuICBrZXlzOiBnZXRLZXlDb2RlcyhrZXlDb2RlcyksXG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgKGtleWJvYXJkKSBldmVudCBhbmQgcmV0dXJucyBhIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgaXRzIGtleVxuICAgKiBDYW4gYmUgdXNlZCBsaWtlIEZvdW5kYXRpb24ucGFyc2VLZXkoZXZlbnQpID09PSBGb3VuZGF0aW9uLmtleXMuU1BBQ0VcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEByZXR1cm4gU3RyaW5nIGtleSAtIFN0cmluZyB0aGF0IHJlcHJlc2VudHMgdGhlIGtleSBwcmVzc2VkXG4gICAqL1xuICBwYXJzZUtleShldmVudCkge1xuICAgIHZhciBrZXkgPSBrZXlDb2Rlc1tldmVudC53aGljaCB8fCBldmVudC5rZXlDb2RlXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGV2ZW50LndoaWNoKS50b1VwcGVyQ2FzZSgpO1xuXG4gICAgLy8gUmVtb3ZlIHVuLXByaW50YWJsZSBjaGFyYWN0ZXJzLCBlLmcuIGZvciBgZnJvbUNoYXJDb2RlYCBjYWxscyBmb3IgQ1RSTCBvbmx5IGV2ZW50c1xuICAgIGtleSA9IGtleS5yZXBsYWNlKC9cXFcrLywgJycpO1xuXG4gICAgaWYgKGV2ZW50LnNoaWZ0S2V5KSBrZXkgPSBgU0hJRlRfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuY3RybEtleSkga2V5ID0gYENUUkxfJHtrZXl9YDtcbiAgICBpZiAoZXZlbnQuYWx0S2V5KSBrZXkgPSBgQUxUXyR7a2V5fWA7XG5cbiAgICAvLyBSZW1vdmUgdHJhaWxpbmcgdW5kZXJzY29yZSwgaW4gY2FzZSBvbmx5IG1vZGlmaWVycyB3ZXJlIHVzZWQgKGUuZy4gb25seSBgQ1RSTF9BTFRgKVxuICAgIGtleSA9IGtleS5yZXBsYWNlKC9fJC8sICcnKTtcblxuICAgIHJldHVybiBrZXk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZXMgdGhlIGdpdmVuIChrZXlib2FyZCkgZXZlbnRcbiAgICogQHBhcmFtIHtFdmVudH0gZXZlbnQgLSB0aGUgZXZlbnQgZ2VuZXJhdGVkIGJ5IHRoZSBldmVudCBoYW5kbGVyXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBjb21wb25lbnQgLSBGb3VuZGF0aW9uIGNvbXBvbmVudCdzIG5hbWUsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcGFyYW0ge09iamVjdHN9IGZ1bmN0aW9ucyAtIGNvbGxlY3Rpb24gb2YgZnVuY3Rpb25zIHRoYXQgYXJlIHRvIGJlIGV4ZWN1dGVkXG4gICAqL1xuICBoYW5kbGVLZXkoZXZlbnQsIGNvbXBvbmVudCwgZnVuY3Rpb25zKSB7XG4gICAgdmFyIGNvbW1hbmRMaXN0ID0gY29tbWFuZHNbY29tcG9uZW50XSxcbiAgICAgIGtleUNvZGUgPSB0aGlzLnBhcnNlS2V5KGV2ZW50KSxcbiAgICAgIGNtZHMsXG4gICAgICBjb21tYW5kLFxuICAgICAgZm47XG5cbiAgICBpZiAoIWNvbW1hbmRMaXN0KSByZXR1cm4gY29uc29sZS53YXJuKCdDb21wb25lbnQgbm90IGRlZmluZWQhJyk7XG5cbiAgICBpZiAodHlwZW9mIGNvbW1hbmRMaXN0Lmx0ciA9PT0gJ3VuZGVmaW5lZCcpIHsgLy8gdGhpcyBjb21wb25lbnQgZG9lcyBub3QgZGlmZmVyZW50aWF0ZSBiZXR3ZWVuIGx0ciBhbmQgcnRsXG4gICAgICAgIGNtZHMgPSBjb21tYW5kTGlzdDsgLy8gdXNlIHBsYWluIGxpc3RcbiAgICB9IGVsc2UgeyAvLyBtZXJnZSBsdHIgYW5kIHJ0bDogaWYgZG9jdW1lbnQgaXMgcnRsLCBydGwgb3ZlcndyaXRlcyBsdHIgYW5kIHZpY2UgdmVyc2FcbiAgICAgICAgaWYgKEZvdW5kYXRpb24ucnRsKCkpIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QubHRyLCBjb21tYW5kTGlzdC5ydGwpO1xuXG4gICAgICAgIGVsc2UgY21kcyA9ICQuZXh0ZW5kKHt9LCBjb21tYW5kTGlzdC5ydGwsIGNvbW1hbmRMaXN0Lmx0cik7XG4gICAgfVxuICAgIGNvbW1hbmQgPSBjbWRzW2tleUNvZGVdO1xuXG4gICAgZm4gPSBmdW5jdGlvbnNbY29tbWFuZF07XG4gICAgaWYgKGZuICYmIHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uICBpZiBleGlzdHNcbiAgICAgIHZhciByZXR1cm5WYWx1ZSA9IGZuLmFwcGx5KCk7XG4gICAgICBpZiAoZnVuY3Rpb25zLmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy5oYW5kbGVkKHJldHVyblZhbHVlKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZ1bmN0aW9ucy51bmhhbmRsZWQgfHwgdHlwZW9mIGZ1bmN0aW9ucy51bmhhbmRsZWQgPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiB3aGVuIGV2ZW50IHdhcyBub3QgaGFuZGxlZFxuICAgICAgICAgIGZ1bmN0aW9ucy51bmhhbmRsZWQoKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEZpbmRzIGFsbCBmb2N1c2FibGUgZWxlbWVudHMgd2l0aGluIHRoZSBnaXZlbiBgJGVsZW1lbnRgXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gc2VhcmNoIHdpdGhpblxuICAgKiBAcmV0dXJuIHtqUXVlcnl9ICRmb2N1c2FibGUgLSBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiBgJGVsZW1lbnRgXG4gICAqL1xuICBmaW5kRm9jdXNhYmxlKCRlbGVtZW50KSB7XG4gICAgaWYoISRlbGVtZW50KSB7cmV0dXJuIGZhbHNlOyB9XG4gICAgcmV0dXJuICRlbGVtZW50LmZpbmQoJ2FbaHJlZl0sIGFyZWFbaHJlZl0sIGlucHV0Om5vdChbZGlzYWJsZWRdKSwgc2VsZWN0Om5vdChbZGlzYWJsZWRdKSwgdGV4dGFyZWE6bm90KFtkaXNhYmxlZF0pLCBidXR0b246bm90KFtkaXNhYmxlZF0pLCBpZnJhbWUsIG9iamVjdCwgZW1iZWQsICpbdGFiaW5kZXhdLCAqW2NvbnRlbnRlZGl0YWJsZV0nKS5maWx0ZXIoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISQodGhpcykuaXMoJzp2aXNpYmxlJykgfHwgJCh0aGlzKS5hdHRyKCd0YWJpbmRleCcpIDwgMCkgeyByZXR1cm4gZmFsc2U7IH0gLy9vbmx5IGhhdmUgdmlzaWJsZSBlbGVtZW50cyBhbmQgdGhvc2UgdGhhdCBoYXZlIGEgdGFiaW5kZXggZ3JlYXRlciBvciBlcXVhbCAwXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgY29tcG9uZW50IG5hbWUgbmFtZVxuICAgKiBAcGFyYW0ge09iamVjdH0gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQsIGUuZy4gU2xpZGVyIG9yIFJldmVhbFxuICAgKiBAcmV0dXJuIFN0cmluZyBjb21wb25lbnROYW1lXG4gICAqL1xuXG4gIHJlZ2lzdGVyKGNvbXBvbmVudE5hbWUsIGNtZHMpIHtcbiAgICBjb21tYW5kc1tjb21wb25lbnROYW1lXSA9IGNtZHM7XG4gIH0sICBcblxuICAvKipcbiAgICogVHJhcHMgdGhlIGZvY3VzIGluIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHRyYXAgdGhlIGZvdWNzIGludG8uXG4gICAqL1xuICB0cmFwRm9jdXMoJGVsZW1lbnQpIHtcbiAgICB2YXIgJGZvY3VzYWJsZSA9IEZvdW5kYXRpb24uS2V5Ym9hcmQuZmluZEZvY3VzYWJsZSgkZWxlbWVudCksXG4gICAgICAgICRmaXJzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoMCksXG4gICAgICAgICRsYXN0Rm9jdXNhYmxlID0gJGZvY3VzYWJsZS5lcSgtMSk7XG5cbiAgICAkZWxlbWVudC5vbigna2V5ZG93bi56Zi50cmFwZm9jdXMnLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGxhc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdUQUInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRmaXJzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAoZXZlbnQudGFyZ2V0ID09PSAkZmlyc3RGb2N1c2FibGVbMF0gJiYgRm91bmRhdGlvbi5LZXlib2FyZC5wYXJzZUtleShldmVudCkgPT09ICdTSElGVF9UQUInKSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICRsYXN0Rm9jdXNhYmxlLmZvY3VzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG4gIC8qKlxuICAgKiBSZWxlYXNlcyB0aGUgdHJhcHBlZCBmb2N1cyBmcm9tIHRoZSBnaXZlbiBlbGVtZW50LlxuICAgKiBAcGFyYW0gIHtqUXVlcnl9ICRlbGVtZW50ICBqUXVlcnkgb2JqZWN0IHRvIHJlbGVhc2UgdGhlIGZvY3VzIGZvci5cbiAgICovXG4gIHJlbGVhc2VGb2N1cygkZWxlbWVudCkge1xuICAgICRlbGVtZW50Lm9mZigna2V5ZG93bi56Zi50cmFwZm9jdXMnKTtcbiAgfVxufVxuXG4vKlxuICogQ29uc3RhbnRzIGZvciBlYXNpZXIgY29tcGFyaW5nLlxuICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gKi9cbmZ1bmN0aW9uIGdldEtleUNvZGVzKGtjcykge1xuICB2YXIgayA9IHt9O1xuICBmb3IgKHZhciBrYyBpbiBrY3MpIGtba2NzW2tjXV0gPSBrY3Nba2NdO1xuICByZXR1cm4gaztcbn1cblxuRm91bmRhdGlvbi5LZXlib2FyZCA9IEtleWJvYXJkO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8vIERlZmF1bHQgc2V0IG9mIG1lZGlhIHF1ZXJpZXNcbmNvbnN0IGRlZmF1bHRRdWVyaWVzID0ge1xuICAnZGVmYXVsdCcgOiAnb25seSBzY3JlZW4nLFxuICBsYW5kc2NhcGUgOiAnb25seSBzY3JlZW4gYW5kIChvcmllbnRhdGlvbjogbGFuZHNjYXBlKScsXG4gIHBvcnRyYWl0IDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gIHJldGluYSA6ICdvbmx5IHNjcmVlbiBhbmQgKC13ZWJraXQtbWluLWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAobWluLS1tb3otZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kICgtby1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyLzEpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAxOTJkcGkpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi1yZXNvbHV0aW9uOiAyZHBweCknXG59O1xuXG52YXIgTWVkaWFRdWVyeSA9IHtcbiAgcXVlcmllczogW10sXG5cbiAgY3VycmVudDogJycsXG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBtZWRpYSBxdWVyeSBoZWxwZXIsIGJ5IGV4dHJhY3RpbmcgdGhlIGJyZWFrcG9pbnQgbGlzdCBmcm9tIHRoZSBDU1MgYW5kIGFjdGl2YXRpbmcgdGhlIGJyZWFrcG9pbnQgd2F0Y2hlci5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGV4dHJhY3RlZFN0eWxlcyA9ICQoJy5mb3VuZGF0aW9uLW1xJykuY3NzKCdmb250LWZhbWlseScpO1xuICAgIHZhciBuYW1lZFF1ZXJpZXM7XG5cbiAgICBuYW1lZFF1ZXJpZXMgPSBwYXJzZVN0eWxlVG9PYmplY3QoZXh0cmFjdGVkU3R5bGVzKTtcblxuICAgIGZvciAodmFyIGtleSBpbiBuYW1lZFF1ZXJpZXMpIHtcbiAgICAgIGlmKG5hbWVkUXVlcmllcy5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgIHNlbGYucXVlcmllcy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBrZXksXG4gICAgICAgICAgdmFsdWU6IGBvbmx5IHNjcmVlbiBhbmQgKG1pbi13aWR0aDogJHtuYW1lZFF1ZXJpZXNba2V5XX0pYFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmN1cnJlbnQgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpO1xuXG4gICAgdGhpcy5fd2F0Y2hlcigpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBpcyBhdCBsZWFzdCBhcyB3aWRlIGFzIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjay5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0J3Mgc21hbGxlci5cbiAgICovXG4gIGF0TGVhc3Qoc2l6ZSkge1xuICAgIHZhciBxdWVyeSA9IHRoaXMuZ2V0KHNpemUpO1xuXG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICByZXR1cm4gd2luZG93Lm1hdGNoTWVkaWEocXVlcnkpLm1hdGNoZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgdGhlIHNjcmVlbiBtYXRjaGVzIHRvIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBjaGVjaywgZWl0aGVyICdzbWFsbCBvbmx5JyBvciAnc21hbGwnLiBPbWl0dGluZyAnb25seScgZmFsbHMgYmFjayB0byB1c2luZyBhdExlYXN0KCkgbWV0aG9kLlxuICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gYHRydWVgIGlmIHRoZSBicmVha3BvaW50IG1hdGNoZXMsIGBmYWxzZWAgaWYgaXQgZG9lcyBub3QuXG4gICAqL1xuICBpcyhzaXplKSB7XG4gICAgc2l6ZSA9IHNpemUudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgaWYoc2l6ZS5sZW5ndGggPiAxICYmIHNpemVbMV0gPT09ICdvbmx5Jykge1xuICAgICAgaWYoc2l6ZVswXSA9PT0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSkgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmF0TGVhc3Qoc2l6ZVswXSk7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgbWVkaWEgcXVlcnkgb2YgYSBicmVha3BvaW50LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtTdHJpbmd9IHNpemUgLSBOYW1lIG9mIHRoZSBicmVha3BvaW50IHRvIGdldC5cbiAgICogQHJldHVybnMge1N0cmluZ3xudWxsfSAtIFRoZSBtZWRpYSBxdWVyeSBvZiB0aGUgYnJlYWtwb2ludCwgb3IgYG51bGxgIGlmIHRoZSBicmVha3BvaW50IGRvZXNuJ3QgZXhpc3QuXG4gICAqL1xuICBnZXQoc2l6ZSkge1xuICAgIGZvciAodmFyIGkgaW4gdGhpcy5xdWVyaWVzKSB7XG4gICAgICBpZih0aGlzLnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuICAgICAgICBpZiAoc2l6ZSA9PT0gcXVlcnkubmFtZSkgcmV0dXJuIHF1ZXJ5LnZhbHVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBudWxsO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQgbmFtZSBieSB0ZXN0aW5nIGV2ZXJ5IGJyZWFrcG9pbnQgYW5kIHJldHVybmluZyB0aGUgbGFzdCBvbmUgdG8gbWF0Y2ggKHRoZSBiaWdnZXN0IG9uZSkuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSBOYW1lIG9mIHRoZSBjdXJyZW50IGJyZWFrcG9pbnQuXG4gICAqL1xuICBfZ2V0Q3VycmVudFNpemUoKSB7XG4gICAgdmFyIG1hdGNoZWQ7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucXVlcmllcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHF1ZXJ5ID0gdGhpcy5xdWVyaWVzW2ldO1xuXG4gICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocXVlcnkudmFsdWUpLm1hdGNoZXMpIHtcbiAgICAgICAgbWF0Y2hlZCA9IHF1ZXJ5O1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgbWF0Y2hlZCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIHJldHVybiBtYXRjaGVkLm5hbWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBtYXRjaGVkO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWN0aXZhdGVzIHRoZSBicmVha3BvaW50IHdhdGNoZXIsIHdoaWNoIGZpcmVzIGFuIGV2ZW50IG9uIHRoZSB3aW5kb3cgd2hlbmV2ZXIgdGhlIGJyZWFrcG9pbnQgY2hhbmdlcy5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfd2F0Y2hlcigpIHtcbiAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS56Zi5tZWRpYXF1ZXJ5JywgKCkgPT4ge1xuICAgICAgdmFyIG5ld1NpemUgPSB0aGlzLl9nZXRDdXJyZW50U2l6ZSgpLCBjdXJyZW50U2l6ZSA9IHRoaXMuY3VycmVudDtcblxuICAgICAgaWYgKG5ld1NpemUgIT09IGN1cnJlbnRTaXplKSB7XG4gICAgICAgIC8vIENoYW5nZSB0aGUgY3VycmVudCBtZWRpYSBxdWVyeVxuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXdTaXplO1xuXG4gICAgICAgIC8vIEJyb2FkY2FzdCB0aGUgbWVkaWEgcXVlcnkgY2hhbmdlIG9uIHRoZSB3aW5kb3dcbiAgICAgICAgJCh3aW5kb3cpLnRyaWdnZXIoJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIFtuZXdTaXplLCBjdXJyZW50U2l6ZV0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuXG5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xuXG4vLyBtYXRjaE1lZGlhKCkgcG9seWZpbGwgLSBUZXN0IGEgQ1NTIG1lZGlhIHR5cGUvcXVlcnkgaW4gSlMuXG4vLyBBdXRob3JzICYgY29weXJpZ2h0IChjKSAyMDEyOiBTY290dCBKZWhsLCBQYXVsIElyaXNoLCBOaWNob2xhcyBaYWthcywgRGF2aWQgS25pZ2h0LiBEdWFsIE1JVC9CU0QgbGljZW5zZVxud2luZG93Lm1hdGNoTWVkaWEgfHwgKHdpbmRvdy5tYXRjaE1lZGlhID0gZnVuY3Rpb24oKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBGb3IgYnJvd3NlcnMgdGhhdCBzdXBwb3J0IG1hdGNoTWVkaXVtIGFwaSBzdWNoIGFzIElFIDkgYW5kIHdlYmtpdFxuICB2YXIgc3R5bGVNZWRpYSA9ICh3aW5kb3cuc3R5bGVNZWRpYSB8fCB3aW5kb3cubWVkaWEpO1xuXG4gIC8vIEZvciB0aG9zZSB0aGF0IGRvbid0IHN1cHBvcnQgbWF0Y2hNZWRpdW1cbiAgaWYgKCFzdHlsZU1lZGlhKSB7XG4gICAgdmFyIHN0eWxlICAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzdHlsZScpLFxuICAgIHNjcmlwdCAgICAgID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpWzBdLFxuICAgIGluZm8gICAgICAgID0gbnVsbDtcblxuICAgIHN0eWxlLnR5cGUgID0gJ3RleHQvY3NzJztcbiAgICBzdHlsZS5pZCAgICA9ICdtYXRjaG1lZGlhanMtdGVzdCc7XG5cbiAgICBzY3JpcHQgJiYgc2NyaXB0LnBhcmVudE5vZGUgJiYgc2NyaXB0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHN0eWxlLCBzY3JpcHQpO1xuXG4gICAgLy8gJ3N0eWxlLmN1cnJlbnRTdHlsZScgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnd2luZG93LmdldENvbXB1dGVkU3R5bGUnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICBpbmZvID0gKCdnZXRDb21wdXRlZFN0eWxlJyBpbiB3aW5kb3cpICYmIHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKHN0eWxlLCBudWxsKSB8fCBzdHlsZS5jdXJyZW50U3R5bGU7XG5cbiAgICBzdHlsZU1lZGlhID0ge1xuICAgICAgbWF0Y2hNZWRpdW0obWVkaWEpIHtcbiAgICAgICAgdmFyIHRleHQgPSBgQG1lZGlhICR7bWVkaWF9eyAjbWF0Y2htZWRpYWpzLXRlc3QgeyB3aWR0aDogMXB4OyB9IH1gO1xuXG4gICAgICAgIC8vICdzdHlsZS5zdHlsZVNoZWV0JyBpcyB1c2VkIGJ5IElFIDw9IDggYW5kICdzdHlsZS50ZXh0Q29udGVudCcgZm9yIGFsbCBvdGhlciBicm93c2Vyc1xuICAgICAgICBpZiAoc3R5bGUuc3R5bGVTaGVldCkge1xuICAgICAgICAgIHN0eWxlLnN0eWxlU2hlZXQuY3NzVGV4dCA9IHRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3R5bGUudGV4dENvbnRlbnQgPSB0ZXh0O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGVzdCBpZiBtZWRpYSBxdWVyeSBpcyB0cnVlIG9yIGZhbHNlXG4gICAgICAgIHJldHVybiBpbmZvLndpZHRoID09PSAnMXB4JztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24obWVkaWEpIHtcbiAgICByZXR1cm4ge1xuICAgICAgbWF0Y2hlczogc3R5bGVNZWRpYS5tYXRjaE1lZGl1bShtZWRpYSB8fCAnYWxsJyksXG4gICAgICBtZWRpYTogbWVkaWEgfHwgJ2FsbCdcbiAgICB9O1xuICB9XG59KCkpO1xuXG4vLyBUaGFuayB5b3U6IGh0dHBzOi8vZ2l0aHViLmNvbS9zaW5kcmVzb3JodXMvcXVlcnktc3RyaW5nXG5mdW5jdGlvbiBwYXJzZVN0eWxlVG9PYmplY3Qoc3RyKSB7XG4gIHZhciBzdHlsZU9iamVjdCA9IHt9O1xuXG4gIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBzdHlsZU9iamVjdDtcbiAgfVxuXG4gIHN0ciA9IHN0ci50cmltKCkuc2xpY2UoMSwgLTEpOyAvLyBicm93c2VycyByZS1xdW90ZSBzdHJpbmcgc3R5bGUgdmFsdWVzXG5cbiAgaWYgKCFzdHIpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHlsZU9iamVjdCA9IHN0ci5zcGxpdCgnJicpLnJlZHVjZShmdW5jdGlvbihyZXQsIHBhcmFtKSB7XG4gICAgdmFyIHBhcnRzID0gcGFyYW0ucmVwbGFjZSgvXFwrL2csICcgJykuc3BsaXQoJz0nKTtcbiAgICB2YXIga2V5ID0gcGFydHNbMF07XG4gICAgdmFyIHZhbCA9IHBhcnRzWzFdO1xuICAgIGtleSA9IGRlY29kZVVSSUNvbXBvbmVudChrZXkpO1xuXG4gICAgLy8gbWlzc2luZyBgPWAgc2hvdWxkIGJlIGBudWxsYDpcbiAgICAvLyBodHRwOi8vdzMub3JnL1RSLzIwMTIvV0QtdXJsLTIwMTIwNTI0LyNjb2xsZWN0LXVybC1wYXJhbWV0ZXJzXG4gICAgdmFsID0gdmFsID09PSB1bmRlZmluZWQgPyBudWxsIDogZGVjb2RlVVJJQ29tcG9uZW50KHZhbCk7XG5cbiAgICBpZiAoIXJldC5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICByZXRba2V5XSA9IHZhbDtcbiAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkocmV0W2tleV0pKSB7XG4gICAgICByZXRba2V5XS5wdXNoKHZhbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldFtrZXldID0gW3JldFtrZXldLCB2YWxdO1xuICAgIH1cbiAgICByZXR1cm4gcmV0O1xuICB9LCB7fSk7XG5cbiAgcmV0dXJuIHN0eWxlT2JqZWN0O1xufVxuXG5Gb3VuZGF0aW9uLk1lZGlhUXVlcnkgPSBNZWRpYVF1ZXJ5O1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogTW90aW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5tb3Rpb25cbiAqL1xuXG5jb25zdCBpbml0Q2xhc3NlcyAgID0gWydtdWktZW50ZXInLCAnbXVpLWxlYXZlJ107XG5jb25zdCBhY3RpdmVDbGFzc2VzID0gWydtdWktZW50ZXItYWN0aXZlJywgJ211aS1sZWF2ZS1hY3RpdmUnXTtcblxuY29uc3QgTW90aW9uID0ge1xuICBhbmltYXRlSW46IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKHRydWUsIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpO1xuICB9LFxuXG4gIGFuaW1hdGVPdXQ6IGZ1bmN0aW9uKGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgICBhbmltYXRlKGZhbHNlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNb3ZlKGR1cmF0aW9uLCBlbGVtLCBmbil7XG4gIHZhciBhbmltLCBwcm9nLCBzdGFydCA9IG51bGw7XG4gIC8vIGNvbnNvbGUubG9nKCdjYWxsZWQnKTtcblxuICBpZiAoZHVyYXRpb24gPT09IDApIHtcbiAgICBmbi5hcHBseShlbGVtKTtcbiAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBmdW5jdGlvbiBtb3ZlKHRzKXtcbiAgICBpZighc3RhcnQpIHN0YXJ0ID0gdHM7XG4gICAgLy8gY29uc29sZS5sb2coc3RhcnQsIHRzKTtcbiAgICBwcm9nID0gdHMgLSBzdGFydDtcbiAgICBmbi5hcHBseShlbGVtKTtcblxuICAgIGlmKHByb2cgPCBkdXJhdGlvbil7IGFuaW0gPSB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKG1vdmUsIGVsZW0pOyB9XG4gICAgZWxzZXtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZShhbmltKTtcbiAgICAgIGVsZW0udHJpZ2dlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSkudHJpZ2dlckhhbmRsZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pO1xuICAgIH1cbiAgfVxuICBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlKTtcbn1cblxuLyoqXG4gKiBBbmltYXRlcyBhbiBlbGVtZW50IGluIG9yIG91dCB1c2luZyBhIENTUyB0cmFuc2l0aW9uIGNsYXNzLlxuICogQGZ1bmN0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHtCb29sZWFufSBpc0luIC0gRGVmaW5lcyBpZiB0aGUgYW5pbWF0aW9uIGlzIGluIG9yIG91dC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9yIEhUTUwgb2JqZWN0IHRvIGFuaW1hdGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gYW5pbWF0aW9uIC0gQ1NTIGNsYXNzIHRvIHVzZS5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiIC0gQ2FsbGJhY2sgdG8gcnVuIHdoZW4gYW5pbWF0aW9uIGlzIGZpbmlzaGVkLlxuICovXG5mdW5jdGlvbiBhbmltYXRlKGlzSW4sIGVsZW1lbnQsIGFuaW1hdGlvbiwgY2IpIHtcbiAgZWxlbWVudCA9ICQoZWxlbWVudCkuZXEoMCk7XG5cbiAgaWYgKCFlbGVtZW50Lmxlbmd0aCkgcmV0dXJuO1xuXG4gIHZhciBpbml0Q2xhc3MgPSBpc0luID8gaW5pdENsYXNzZXNbMF0gOiBpbml0Q2xhc3Nlc1sxXTtcbiAgdmFyIGFjdGl2ZUNsYXNzID0gaXNJbiA/IGFjdGl2ZUNsYXNzZXNbMF0gOiBhY3RpdmVDbGFzc2VzWzFdO1xuXG4gIC8vIFNldCB1cCB0aGUgYW5pbWF0aW9uXG4gIHJlc2V0KCk7XG5cbiAgZWxlbWVudFxuICAgIC5hZGRDbGFzcyhhbmltYXRpb24pXG4gICAgLmNzcygndHJhbnNpdGlvbicsICdub25lJyk7XG5cbiAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICBlbGVtZW50LmFkZENsYXNzKGluaXRDbGFzcyk7XG4gICAgaWYgKGlzSW4pIGVsZW1lbnQuc2hvdygpO1xuICB9KTtcblxuICAvLyBTdGFydCB0aGUgYW5pbWF0aW9uXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudFswXS5vZmZzZXRXaWR0aDtcbiAgICBlbGVtZW50XG4gICAgICAuY3NzKCd0cmFuc2l0aW9uJywgJycpXG4gICAgICAuYWRkQ2xhc3MoYWN0aXZlQ2xhc3MpO1xuICB9KTtcblxuICAvLyBDbGVhbiB1cCB0aGUgYW5pbWF0aW9uIHdoZW4gaXQgZmluaXNoZXNcbiAgZWxlbWVudC5vbmUoRm91bmRhdGlvbi50cmFuc2l0aW9uZW5kKGVsZW1lbnQpLCBmaW5pc2gpO1xuXG4gIC8vIEhpZGVzIHRoZSBlbGVtZW50IChmb3Igb3V0IGFuaW1hdGlvbnMpLCByZXNldHMgdGhlIGVsZW1lbnQsIGFuZCBydW5zIGEgY2FsbGJhY2tcbiAgZnVuY3Rpb24gZmluaXNoKCkge1xuICAgIGlmICghaXNJbikgZWxlbWVudC5oaWRlKCk7XG4gICAgcmVzZXQoKTtcbiAgICBpZiAoY2IpIGNiLmFwcGx5KGVsZW1lbnQpO1xuICB9XG5cbiAgLy8gUmVzZXRzIHRyYW5zaXRpb25zIGFuZCByZW1vdmVzIG1vdGlvbi1zcGVjaWZpYyBjbGFzc2VzXG4gIGZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIGVsZW1lbnRbMF0uc3R5bGUudHJhbnNpdGlvbkR1cmF0aW9uID0gMDtcbiAgICBlbGVtZW50LnJlbW92ZUNsYXNzKGAke2luaXRDbGFzc30gJHthY3RpdmVDbGFzc30gJHthbmltYXRpb259YCk7XG4gIH1cbn1cblxuRm91bmRhdGlvbi5Nb3ZlID0gTW92ZTtcbkZvdW5kYXRpb24uTW90aW9uID0gTW90aW9uO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbmNvbnN0IE5lc3QgPSB7XG4gIEZlYXRoZXIobWVudSwgdHlwZSA9ICd6ZicpIHtcbiAgICBtZW51LmF0dHIoJ3JvbGUnLCAnbWVudWJhcicpO1xuXG4gICAgdmFyIGl0ZW1zID0gbWVudS5maW5kKCdsaScpLmF0dHIoeydyb2xlJzogJ21lbnVpdGVtJ30pLFxuICAgICAgICBzdWJNZW51Q2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51YCxcbiAgICAgICAgc3ViSXRlbUNsYXNzID0gYCR7c3ViTWVudUNsYXNzfS1pdGVtYCxcbiAgICAgICAgaGFzU3ViQ2xhc3MgPSBgaXMtJHt0eXBlfS1zdWJtZW51LXBhcmVudGA7XG5cbiAgICBpdGVtcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG5cbiAgICAgIGlmICgkc3ViLmxlbmd0aCkge1xuICAgICAgICAkaXRlbVxuICAgICAgICAgIC5hZGRDbGFzcyhoYXNTdWJDbGFzcylcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnYXJpYS1oYXNwb3B1cCc6IHRydWUsXG4gICAgICAgICAgICAnYXJpYS1sYWJlbCc6ICRpdGVtLmNoaWxkcmVuKCdhOmZpcnN0JykudGV4dCgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gTm90ZTogIERyaWxsZG93bnMgYmVoYXZlIGRpZmZlcmVudGx5IGluIGhvdyB0aGV5IGhpZGUsIGFuZCBzbyBuZWVkXG4gICAgICAgICAgLy8gYWRkaXRpb25hbCBhdHRyaWJ1dGVzLiAgV2Ugc2hvdWxkIGxvb2sgaWYgdGhpcyBwb3NzaWJseSBvdmVyLWdlbmVyYWxpemVkXG4gICAgICAgICAgLy8gdXRpbGl0eSAoTmVzdCkgaXMgYXBwcm9wcmlhdGUgd2hlbiB3ZSByZXdvcmsgbWVudXMgaW4gNi40XG4gICAgICAgICAgaWYodHlwZSA9PT0gJ2RyaWxsZG93bicpIHtcbiAgICAgICAgICAgICRpdGVtLmF0dHIoeydhcmlhLWV4cGFuZGVkJzogZmFsc2V9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgJHN1YlxuICAgICAgICAgIC5hZGRDbGFzcyhgc3VibWVudSAke3N1Yk1lbnVDbGFzc31gKVxuICAgICAgICAgIC5hdHRyKHtcbiAgICAgICAgICAgICdkYXRhLXN1Ym1lbnUnOiAnJyxcbiAgICAgICAgICAgICdyb2xlJzogJ21lbnUnXG4gICAgICAgICAgfSk7XG4gICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgJHN1Yi5hdHRyKHsnYXJpYS1oaWRkZW4nOiB0cnVlfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCRpdGVtLnBhcmVudCgnW2RhdGEtc3VibWVudV0nKS5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW0uYWRkQ2xhc3MoYGlzLXN1Ym1lbnUtaXRlbSAke3N1Ykl0ZW1DbGFzc31gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybjtcbiAgfSxcblxuICBCdXJuKG1lbnUsIHR5cGUpIHtcbiAgICB2YXIgLy9pdGVtcyA9IG1lbnUuZmluZCgnbGknKSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgbWVudVxuICAgICAgLmZpbmQoJz5saSwgLm1lbnUsIC5tZW51ID4gbGknKVxuICAgICAgLnJlbW92ZUNsYXNzKGAke3N1Yk1lbnVDbGFzc30gJHtzdWJJdGVtQ2xhc3N9ICR7aGFzU3ViQ2xhc3N9IGlzLXN1Ym1lbnUtaXRlbSBzdWJtZW51IGlzLWFjdGl2ZWApXG4gICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykuY3NzKCdkaXNwbGF5JywgJycpO1xuXG4gICAgLy8gY29uc29sZS5sb2coICAgICAgbWVudS5maW5kKCcuJyArIHN1Yk1lbnVDbGFzcyArICcsIC4nICsgc3ViSXRlbUNsYXNzICsgJywgLmhhcy1zdWJtZW51LCAuaXMtc3VibWVudS1pdGVtLCAuc3VibWVudSwgW2RhdGEtc3VibWVudV0nKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQ2xhc3Moc3ViTWVudUNsYXNzICsgJyAnICsgc3ViSXRlbUNsYXNzICsgJyBoYXMtc3VibWVudSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudScpXG4gICAgLy8gICAgICAgICAgIC5yZW1vdmVBdHRyKCdkYXRhLXN1Ym1lbnUnKSk7XG4gICAgLy8gaXRlbXMuZWFjaChmdW5jdGlvbigpe1xuICAgIC8vICAgdmFyICRpdGVtID0gJCh0aGlzKSxcbiAgICAvLyAgICAgICAkc3ViID0gJGl0ZW0uY2hpbGRyZW4oJ3VsJyk7XG4gICAgLy8gICBpZigkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKXtcbiAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2lzLXN1Ym1lbnUtaXRlbSAnICsgc3ViSXRlbUNsYXNzKTtcbiAgICAvLyAgIH1cbiAgICAvLyAgIGlmKCRzdWIubGVuZ3RoKXtcbiAgICAvLyAgICAgJGl0ZW0ucmVtb3ZlQ2xhc3MoJ2hhcy1zdWJtZW51Jyk7XG4gICAgLy8gICAgICRzdWIucmVtb3ZlQ2xhc3MoJ3N1Ym1lbnUgJyArIHN1Yk1lbnVDbGFzcykucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51Jyk7XG4gICAgLy8gICB9XG4gICAgLy8gfSk7XG4gIH1cbn1cblxuRm91bmRhdGlvbi5OZXN0ID0gTmVzdDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5mdW5jdGlvbiBUaW1lcihlbGVtLCBvcHRpb25zLCBjYikge1xuICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgZHVyYXRpb24gPSBvcHRpb25zLmR1cmF0aW9uLC8vb3B0aW9ucyBpcyBhbiBvYmplY3QgZm9yIGVhc2lseSBhZGRpbmcgZmVhdHVyZXMgbGF0ZXIuXG4gICAgICBuYW1lU3BhY2UgPSBPYmplY3Qua2V5cyhlbGVtLmRhdGEoKSlbMF0gfHwgJ3RpbWVyJyxcbiAgICAgIHJlbWFpbiA9IC0xLFxuICAgICAgc3RhcnQsXG4gICAgICB0aW1lcjtcblxuICB0aGlzLmlzUGF1c2VkID0gZmFsc2U7XG5cbiAgdGhpcy5yZXN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgcmVtYWluID0gLTE7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICB0aGlzLnN0YXJ0KCk7XG4gIH1cblxuICB0aGlzLnN0YXJ0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuICAgIC8vIGlmKCFlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgcmVtYWluID0gcmVtYWluIDw9IDAgPyBkdXJhdGlvbiA6IHJlbWFpbjtcbiAgICBlbGVtLmRhdGEoJ3BhdXNlZCcsIGZhbHNlKTtcbiAgICBzdGFydCA9IERhdGUubm93KCk7XG4gICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICBpZihvcHRpb25zLmluZmluaXRlKXtcbiAgICAgICAgX3RoaXMucmVzdGFydCgpOy8vcmVydW4gdGhlIHRpbWVyLlxuICAgICAgfVxuICAgICAgaWYgKGNiICYmIHR5cGVvZiBjYiA9PT0gJ2Z1bmN0aW9uJykgeyBjYigpOyB9XG4gICAgfSwgcmVtYWluKTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVyc3RhcnQuemYuJHtuYW1lU3BhY2V9YCk7XG4gIH1cblxuICB0aGlzLnBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pc1BhdXNlZCA9IHRydWU7XG4gICAgLy9pZihlbGVtLmRhdGEoJ3BhdXNlZCcpKXsgcmV0dXJuIGZhbHNlOyB9Ly9tYXliZSBpbXBsZW1lbnQgdGhpcyBzYW5pdHkgY2hlY2sgaWYgdXNlZCBmb3Igb3RoZXIgdGhpbmdzLlxuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCB0cnVlKTtcbiAgICB2YXIgZW5kID0gRGF0ZS5ub3coKTtcbiAgICByZW1haW4gPSByZW1haW4gLSAoZW5kIC0gc3RhcnQpO1xuICAgIGVsZW0udHJpZ2dlcihgdGltZXJwYXVzZWQuemYuJHtuYW1lU3BhY2V9YCk7XG4gIH1cbn1cblxuLyoqXG4gKiBSdW5zIGEgY2FsbGJhY2sgZnVuY3Rpb24gd2hlbiBpbWFnZXMgYXJlIGZ1bGx5IGxvYWRlZC5cbiAqIEBwYXJhbSB7T2JqZWN0fSBpbWFnZXMgLSBJbWFnZShzKSB0byBjaGVjayBpZiBsb2FkZWQuXG4gKiBAcGFyYW0ge0Z1bmN9IGNhbGxiYWNrIC0gRnVuY3Rpb24gdG8gZXhlY3V0ZSB3aGVuIGltYWdlIGlzIGZ1bGx5IGxvYWRlZC5cbiAqL1xuZnVuY3Rpb24gb25JbWFnZXNMb2FkZWQoaW1hZ2VzLCBjYWxsYmFjayl7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICAgIHVubG9hZGVkID0gaW1hZ2VzLmxlbmd0aDtcblxuICBpZiAodW5sb2FkZWQgPT09IDApIHtcbiAgICBjYWxsYmFjaygpO1xuICB9XG5cbiAgaW1hZ2VzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgLy8gQ2hlY2sgaWYgaW1hZ2UgaXMgbG9hZGVkXG4gICAgaWYgKHRoaXMuY29tcGxldGUgfHwgKHRoaXMucmVhZHlTdGF0ZSA9PT0gNCkgfHwgKHRoaXMucmVhZHlTdGF0ZSA9PT0gJ2NvbXBsZXRlJykpIHtcbiAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgfVxuICAgIC8vIEZvcmNlIGxvYWQgdGhlIGltYWdlXG4gICAgZWxzZSB7XG4gICAgICAvLyBmaXggZm9yIElFLiBTZWUgaHR0cHM6Ly9jc3MtdHJpY2tzLmNvbS9zbmlwcGV0cy9qcXVlcnkvZml4aW5nLWxvYWQtaW4taWUtZm9yLWNhY2hlZC1pbWFnZXMvXG4gICAgICB2YXIgc3JjID0gJCh0aGlzKS5hdHRyKCdzcmMnKTtcbiAgICAgICQodGhpcykuYXR0cignc3JjJywgc3JjICsgKHNyYy5pbmRleE9mKCc/JykgPj0gMCA/ICcmJyA6ICc/JykgKyAobmV3IERhdGUoKS5nZXRUaW1lKCkpKTtcbiAgICAgICQodGhpcykub25lKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNpbmdsZUltYWdlTG9hZGVkKCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNpbmdsZUltYWdlTG9hZGVkKCkge1xuICAgIHVubG9hZGVkLS07XG4gICAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgICBjYWxsYmFjaygpO1xuICAgIH1cbiAgfVxufVxuXG5Gb3VuZGF0aW9uLlRpbWVyID0gVGltZXI7XG5Gb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkID0gb25JbWFnZXNMb2FkZWQ7XG5cbn0oalF1ZXJ5KTtcbiIsIi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKipXb3JrIGluc3BpcmVkIGJ5IG11bHRpcGxlIGpxdWVyeSBzd2lwZSBwbHVnaW5zKipcbi8vKipEb25lIGJ5IFlvaGFpIEFyYXJhdCAqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbihmdW5jdGlvbigkKSB7XG5cbiAgJC5zcG90U3dpcGUgPSB7XG4gICAgdmVyc2lvbjogJzEuMC4wJyxcbiAgICBlbmFibGVkOiAnb250b3VjaHN0YXJ0JyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQsXG4gICAgcHJldmVudERlZmF1bHQ6IGZhbHNlLFxuICAgIG1vdmVUaHJlc2hvbGQ6IDc1LFxuICAgIHRpbWVUaHJlc2hvbGQ6IDIwMFxuICB9O1xuXG4gIHZhciAgIHN0YXJ0UG9zWCxcbiAgICAgICAgc3RhcnRQb3NZLFxuICAgICAgICBzdGFydFRpbWUsXG4gICAgICAgIGVsYXBzZWRUaW1lLFxuICAgICAgICBpc01vdmluZyA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIG9uVG91Y2hFbmQoKSB7XG4gICAgLy8gIGFsZXJ0KHRoaXMpO1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUpO1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kKTtcbiAgICBpc01vdmluZyA9IGZhbHNlO1xuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaE1vdmUoZSkge1xuICAgIGlmICgkLnNwb3RTd2lwZS5wcmV2ZW50RGVmYXVsdCkgeyBlLnByZXZlbnREZWZhdWx0KCk7IH1cbiAgICBpZihpc01vdmluZykge1xuICAgICAgdmFyIHggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICB2YXIgeSA9IGUudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgIHZhciBkeCA9IHN0YXJ0UG9zWCAtIHg7XG4gICAgICB2YXIgZHkgPSBzdGFydFBvc1kgLSB5O1xuICAgICAgdmFyIGRpcjtcbiAgICAgIGVsYXBzZWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBzdGFydFRpbWU7XG4gICAgICBpZihNYXRoLmFicyhkeCkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAgIGRpciA9IGR4ID4gMCA/ICdsZWZ0JyA6ICdyaWdodCc7XG4gICAgICB9XG4gICAgICAvLyBlbHNlIGlmKE1hdGguYWJzKGR5KSA+PSAkLnNwb3RTd2lwZS5tb3ZlVGhyZXNob2xkICYmIGVsYXBzZWRUaW1lIDw9ICQuc3BvdFN3aXBlLnRpbWVUaHJlc2hvbGQpIHtcbiAgICAgIC8vICAgZGlyID0gZHkgPiAwID8gJ2Rvd24nIDogJ3VwJztcbiAgICAgIC8vIH1cbiAgICAgIGlmKGRpcikge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIG9uVG91Y2hFbmQuY2FsbCh0aGlzKTtcbiAgICAgICAgJCh0aGlzKS50cmlnZ2VyKCdzd2lwZScsIGRpcikudHJpZ2dlcihgc3dpcGUke2Rpcn1gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBvblRvdWNoU3RhcnQoZSkge1xuICAgIGlmIChlLnRvdWNoZXMubGVuZ3RoID09IDEpIHtcbiAgICAgIHN0YXJ0UG9zWCA9IGUudG91Y2hlc1swXS5wYWdlWDtcbiAgICAgIHN0YXJ0UG9zWSA9IGUudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgIGlzTW92aW5nID0gdHJ1ZTtcbiAgICAgIHN0YXJ0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnLCBvblRvdWNoTW92ZSwgZmFsc2UpO1xuICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIG9uVG91Y2hFbmQsIGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lciAmJiB0aGlzLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQsIGZhbHNlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRlYXJkb3duKCkge1xuICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIG9uVG91Y2hTdGFydCk7XG4gIH1cblxuICAkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7IHNldHVwOiBpbml0IH07XG5cbiAgJC5lYWNoKFsnbGVmdCcsICd1cCcsICdkb3duJywgJ3JpZ2h0J10sIGZ1bmN0aW9uICgpIHtcbiAgICAkLmV2ZW50LnNwZWNpYWxbYHN3aXBlJHt0aGlzfWBdID0geyBzZXR1cDogZnVuY3Rpb24oKXtcbiAgICAgICQodGhpcykub24oJ3N3aXBlJywgJC5ub29wKTtcbiAgICB9IH07XG4gIH0pO1xufSkoalF1ZXJ5KTtcbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiBNZXRob2QgZm9yIGFkZGluZyBwc3VlZG8gZHJhZyBldmVudHMgdG8gZWxlbWVudHMgKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbiFmdW5jdGlvbigkKXtcbiAgJC5mbi5hZGRUb3VjaCA9IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy5lYWNoKGZ1bmN0aW9uKGksZWwpe1xuICAgICAgJChlbCkuYmluZCgndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnLGZ1bmN0aW9uKCl7XG4gICAgICAgIC8vd2UgcGFzcyB0aGUgb3JpZ2luYWwgZXZlbnQgb2JqZWN0IGJlY2F1c2UgdGhlIGpRdWVyeSBldmVudFxuICAgICAgICAvL29iamVjdCBpcyBub3JtYWxpemVkIHRvIHczYyBzcGVjcyBhbmQgZG9lcyBub3QgcHJvdmlkZSB0aGUgVG91Y2hMaXN0XG4gICAgICAgIGhhbmRsZVRvdWNoKGV2ZW50KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgdmFyIGhhbmRsZVRvdWNoID0gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgdmFyIHRvdWNoZXMgPSBldmVudC5jaGFuZ2VkVG91Y2hlcyxcbiAgICAgICAgICBmaXJzdCA9IHRvdWNoZXNbMF0sXG4gICAgICAgICAgZXZlbnRUeXBlcyA9IHtcbiAgICAgICAgICAgIHRvdWNoc3RhcnQ6ICdtb3VzZWRvd24nLFxuICAgICAgICAgICAgdG91Y2htb3ZlOiAnbW91c2Vtb3ZlJyxcbiAgICAgICAgICAgIHRvdWNoZW5kOiAnbW91c2V1cCdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHR5cGUgPSBldmVudFR5cGVzW2V2ZW50LnR5cGVdLFxuICAgICAgICAgIHNpbXVsYXRlZEV2ZW50XG4gICAgICAgIDtcblxuICAgICAgaWYoJ01vdXNlRXZlbnQnIGluIHdpbmRvdyAmJiB0eXBlb2Ygd2luZG93Lk1vdXNlRXZlbnQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQgPSBuZXcgd2luZG93Lk1vdXNlRXZlbnQodHlwZSwge1xuICAgICAgICAgICdidWJibGVzJzogdHJ1ZSxcbiAgICAgICAgICAnY2FuY2VsYWJsZSc6IHRydWUsXG4gICAgICAgICAgJ3NjcmVlblgnOiBmaXJzdC5zY3JlZW5YLFxuICAgICAgICAgICdzY3JlZW5ZJzogZmlyc3Quc2NyZWVuWSxcbiAgICAgICAgICAnY2xpZW50WCc6IGZpcnN0LmNsaWVudFgsXG4gICAgICAgICAgJ2NsaWVudFknOiBmaXJzdC5jbGllbnRZXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQgPSBkb2N1bWVudC5jcmVhdGVFdmVudCgnTW91c2VFdmVudCcpO1xuICAgICAgICBzaW11bGF0ZWRFdmVudC5pbml0TW91c2VFdmVudCh0eXBlLCB0cnVlLCB0cnVlLCB3aW5kb3csIDEsIGZpcnN0LnNjcmVlblgsIGZpcnN0LnNjcmVlblksIGZpcnN0LmNsaWVudFgsIGZpcnN0LmNsaWVudFksIGZhbHNlLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCAwLypsZWZ0Ki8sIG51bGwpO1xuICAgICAgfVxuICAgICAgZmlyc3QudGFyZ2V0LmRpc3BhdGNoRXZlbnQoc2ltdWxhdGVkRXZlbnQpO1xuICAgIH07XG4gIH07XG59KGpRdWVyeSk7XG5cblxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqRnJvbSB0aGUgalF1ZXJ5IE1vYmlsZSBMaWJyYXJ5Kipcbi8vKipuZWVkIHRvIHJlY3JlYXRlIGZ1bmN0aW9uYWxpdHkqKlxuLy8qKmFuZCB0cnkgdG8gaW1wcm92ZSBpZiBwb3NzaWJsZSoqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuLyogUmVtb3ZpbmcgdGhlIGpRdWVyeSBmdW5jdGlvbiAqKioqXG4qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcblxuKGZ1bmN0aW9uKCAkLCB3aW5kb3csIHVuZGVmaW5lZCApIHtcblxuXHR2YXIgJGRvY3VtZW50ID0gJCggZG9jdW1lbnQgKSxcblx0XHQvLyBzdXBwb3J0VG91Y2ggPSAkLm1vYmlsZS5zdXBwb3J0LnRvdWNoLFxuXHRcdHRvdWNoU3RhcnRFdmVudCA9ICd0b3VjaHN0YXJ0Jy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaHN0YXJ0XCIgOiBcIm1vdXNlZG93blwiLFxuXHRcdHRvdWNoU3RvcEV2ZW50ID0gJ3RvdWNoZW5kJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaGVuZFwiIDogXCJtb3VzZXVwXCIsXG5cdFx0dG91Y2hNb3ZlRXZlbnQgPSAndG91Y2htb3ZlJy8vc3VwcG9ydFRvdWNoID8gXCJ0b3VjaG1vdmVcIiA6IFwibW91c2Vtb3ZlXCI7XG5cblx0Ly8gc2V0dXAgbmV3IGV2ZW50IHNob3J0Y3V0c1xuXHQkLmVhY2goICggXCJ0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCBcIiArXG5cdFx0XCJzd2lwZSBzd2lwZWxlZnQgc3dpcGVyaWdodFwiICkuc3BsaXQoIFwiIFwiICksIGZ1bmN0aW9uKCBpLCBuYW1lICkge1xuXG5cdFx0JC5mblsgbmFtZSBdID0gZnVuY3Rpb24oIGZuICkge1xuXHRcdFx0cmV0dXJuIGZuID8gdGhpcy5iaW5kKCBuYW1lLCBmbiApIDogdGhpcy50cmlnZ2VyKCBuYW1lICk7XG5cdFx0fTtcblxuXHRcdC8vIGpRdWVyeSA8IDEuOFxuXHRcdGlmICggJC5hdHRyRm4gKSB7XG5cdFx0XHQkLmF0dHJGblsgbmFtZSBdID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXG5cdGZ1bmN0aW9uIHRyaWdnZXJDdXN0b21FdmVudCggb2JqLCBldmVudFR5cGUsIGV2ZW50LCBidWJibGUgKSB7XG5cdFx0dmFyIG9yaWdpbmFsVHlwZSA9IGV2ZW50LnR5cGU7XG5cdFx0ZXZlbnQudHlwZSA9IGV2ZW50VHlwZTtcblx0XHRpZiAoIGJ1YmJsZSApIHtcblx0XHRcdCQuZXZlbnQudHJpZ2dlciggZXZlbnQsIHVuZGVmaW5lZCwgb2JqICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQuZXZlbnQuZGlzcGF0Y2guY2FsbCggb2JqLCBldmVudCApO1xuXHRcdH1cblx0XHRldmVudC50eXBlID0gb3JpZ2luYWxUeXBlO1xuXHR9XG5cblx0Ly8gYWxzbyBoYW5kbGVzIHRhcGhvbGRcblxuXHQvLyBBbHNvIGhhbmRsZXMgc3dpcGVsZWZ0LCBzd2lwZXJpZ2h0XG5cdCQuZXZlbnQuc3BlY2lhbC5zd2lwZSA9IHtcblxuXHRcdC8vIE1vcmUgdGhhbiB0aGlzIGhvcml6b250YWwgZGlzcGxhY2VtZW50LCBhbmQgd2Ugd2lsbCBzdXBwcmVzcyBzY3JvbGxpbmcuXG5cdFx0c2Nyb2xsU3VwcmVzc2lvblRocmVzaG9sZDogMzAsXG5cblx0XHQvLyBNb3JlIHRpbWUgdGhhbiB0aGlzLCBhbmQgaXQgaXNuJ3QgYSBzd2lwZS5cblx0XHRkdXJhdGlvblRocmVzaG9sZDogMTAwMCxcblxuXHRcdC8vIFN3aXBlIGhvcml6b250YWwgZGlzcGxhY2VtZW50IG11c3QgYmUgbW9yZSB0aGFuIHRoaXMuXG5cdFx0aG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdC8vIFN3aXBlIHZlcnRpY2FsIGRpc3BsYWNlbWVudCBtdXN0IGJlIGxlc3MgdGhhbiB0aGlzLlxuXHRcdHZlcnRpY2FsRGlzdGFuY2VUaHJlc2hvbGQ6IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvID49IDIgPyAxNSA6IDMwLFxuXG5cdFx0Z2V0TG9jYXRpb246IGZ1bmN0aW9uICggZXZlbnQgKSB7XG5cdFx0XHR2YXIgd2luUGFnZVggPSB3aW5kb3cucGFnZVhPZmZzZXQsXG5cdFx0XHRcdHdpblBhZ2VZID0gd2luZG93LnBhZ2VZT2Zmc2V0LFxuXHRcdFx0XHR4ID0gZXZlbnQuY2xpZW50WCxcblx0XHRcdFx0eSA9IGV2ZW50LmNsaWVudFk7XG5cblx0XHRcdGlmICggZXZlbnQucGFnZVkgPT09IDAgJiYgTWF0aC5mbG9vciggeSApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVkgKSB8fFxuXHRcdFx0XHRldmVudC5wYWdlWCA9PT0gMCAmJiBNYXRoLmZsb29yKCB4ICkgPiBNYXRoLmZsb29yKCBldmVudC5wYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIGlPUzQgY2xpZW50WC9jbGllbnRZIGhhdmUgdGhlIHZhbHVlIHRoYXQgc2hvdWxkIGhhdmUgYmVlblxuXHRcdFx0XHQvLyBpbiBwYWdlWC9wYWdlWS4gV2hpbGUgcGFnZVgvcGFnZS8gaGF2ZSB0aGUgdmFsdWUgMFxuXHRcdFx0XHR4ID0geCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0geSAtIHdpblBhZ2VZO1xuXHRcdFx0fSBlbHNlIGlmICggeSA8ICggZXZlbnQucGFnZVkgLSB3aW5QYWdlWSkgfHwgeCA8ICggZXZlbnQucGFnZVggLSB3aW5QYWdlWCApICkge1xuXG5cdFx0XHRcdC8vIFNvbWUgQW5kcm9pZCBicm93c2VycyBoYXZlIHRvdGFsbHkgYm9ndXMgdmFsdWVzIGZvciBjbGllbnRYL1lcblx0XHRcdFx0Ly8gd2hlbiBzY3JvbGxpbmcvem9vbWluZyBhIHBhZ2UuIERldGVjdGFibGUgc2luY2UgY2xpZW50WC9jbGllbnRZXG5cdFx0XHRcdC8vIHNob3VsZCBuZXZlciBiZSBzbWFsbGVyIHRoYW4gcGFnZVgvcGFnZVkgbWludXMgcGFnZSBzY3JvbGxcblx0XHRcdFx0eCA9IGV2ZW50LnBhZ2VYIC0gd2luUGFnZVg7XG5cdFx0XHRcdHkgPSBldmVudC5wYWdlWSAtIHdpblBhZ2VZO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR4OiB4LFxuXHRcdFx0XHR5OiB5XG5cdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdGFydDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXSxcblx0XHRcdFx0XHRcdG9yaWdpbjogJCggZXZlbnQudGFyZ2V0IClcblx0XHRcdFx0XHR9O1xuXHRcdH0sXG5cblx0XHRzdG9wOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0XHR2YXIgZGF0YSA9IGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlcyA/XG5cdFx0XHRcdFx0ZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzWyAwIF0gOiBldmVudCxcblx0XHRcdFx0bG9jYXRpb24gPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZ2V0TG9jYXRpb24oIGRhdGEgKTtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHR0aW1lOiAoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCksXG5cdFx0XHRcdFx0XHRjb29yZHM6IFsgbG9jYXRpb24ueCwgbG9jYXRpb24ueSBdXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0aGFuZGxlU3dpcGU6IGZ1bmN0aW9uKCBzdGFydCwgc3RvcCwgdGhpc09iamVjdCwgb3JpZ1RhcmdldCApIHtcblx0XHRcdGlmICggc3RvcC50aW1lIC0gc3RhcnQudGltZSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5kdXJhdGlvblRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAwIF0gLSBzdG9wLmNvb3Jkc1sgMCBdICkgPiAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaG9yaXpvbnRhbERpc3RhbmNlVGhyZXNob2xkICYmXG5cdFx0XHRcdE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDEgXSAtIHN0b3AuY29vcmRzWyAxIF0gKSA8ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS52ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkICkge1xuXHRcdFx0XHR2YXIgZGlyZWN0aW9uID0gc3RhcnQuY29vcmRzWzBdID4gc3RvcC5jb29yZHNbIDAgXSA/IFwic3dpcGVsZWZ0XCIgOiBcInN3aXBlcmlnaHRcIjtcblxuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIFwic3dpcGVcIiwgJC5FdmVudCggXCJzd2lwZVwiLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9KSwgdHJ1ZSApO1xuXHRcdFx0XHR0cmlnZ2VyQ3VzdG9tRXZlbnQoIHRoaXNPYmplY3QsIGRpcmVjdGlvbiwkLkV2ZW50KCBkaXJlY3Rpb24sIHsgdGFyZ2V0OiBvcmlnVGFyZ2V0LCBzd2lwZXN0YXJ0OiBzdGFydCwgc3dpcGVzdG9wOiBzdG9wIH0gKSwgdHJ1ZSApO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH0sXG5cblx0XHQvLyBUaGlzIHNlcnZlcyBhcyBhIGZsYWcgdG8gZW5zdXJlIHRoYXQgYXQgbW9zdCBvbmUgc3dpcGUgZXZlbnQgZXZlbnQgaXNcblx0XHQvLyBpbiB3b3JrIGF0IGFueSBnaXZlbiB0aW1lXG5cdFx0ZXZlbnRJblByb2dyZXNzOiBmYWxzZSxcblxuXHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdHZhciBldmVudHMsXG5cdFx0XHRcdHRoaXNPYmplY3QgPSB0aGlzLFxuXHRcdFx0XHQkdGhpcyA9ICQoIHRoaXNPYmplY3QgKSxcblx0XHRcdFx0Y29udGV4dCA9IHt9O1xuXG5cdFx0XHQvLyBSZXRyaWV2ZSB0aGUgZXZlbnRzIGRhdGEgZm9yIHRoaXMgZWxlbWVudCBhbmQgYWRkIHRoZSBzd2lwZSBjb250ZXh0XG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoICFldmVudHMgKSB7XG5cdFx0XHRcdGV2ZW50cyA9IHsgbGVuZ3RoOiAwIH07XG5cdFx0XHRcdCQuZGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIsIGV2ZW50cyApO1xuXHRcdFx0fVxuXHRcdFx0ZXZlbnRzLmxlbmd0aCsrO1xuXHRcdFx0ZXZlbnRzLnN3aXBlID0gY29udGV4dDtcblxuXHRcdFx0Y29udGV4dC5zdGFydCA9IGZ1bmN0aW9uKCBldmVudCApIHtcblxuXHRcdFx0XHQvLyBCYWlsIGlmIHdlJ3JlIGFscmVhZHkgd29ya2luZyBvbiBhIHN3aXBlIGV2ZW50XG5cdFx0XHRcdGlmICggJC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IHRydWU7XG5cblx0XHRcdFx0dmFyIHN0b3AsXG5cdFx0XHRcdFx0c3RhcnQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RhcnQoIGV2ZW50ICksXG5cdFx0XHRcdFx0b3JpZ1RhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHRcdFx0XHRlbWl0dGVkID0gZmFsc2U7XG5cblx0XHRcdFx0Y29udGV4dC5tb3ZlID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0XHRcdGlmICggIXN0YXJ0IHx8IGV2ZW50LmlzRGVmYXVsdFByZXZlbnRlZCgpICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHN0b3AgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuc3RvcCggZXZlbnQgKTtcblx0XHRcdFx0XHRpZiAoICFlbWl0dGVkICkge1xuXHRcdFx0XHRcdFx0ZW1pdHRlZCA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5oYW5kbGVTd2lwZSggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKTtcblx0XHRcdFx0XHRcdGlmICggZW1pdHRlZCApIHtcblxuXHRcdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdFx0JC5ldmVudC5zcGVjaWFsLnN3aXBlLmV2ZW50SW5Qcm9ncmVzcyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBwcmV2ZW50IHNjcm9sbGluZ1xuXHRcdFx0XHRcdGlmICggTWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQgKSB7XG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjb250ZXh0LnN0b3AgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXNldCB0aGUgY29udGV4dCB0byBtYWtlIHdheSBmb3IgdGhlIG5leHQgc3dpcGUgZXZlbnRcblx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0XHRcdGNvbnRleHQubW92ZSA9IG51bGw7XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0JGRvY3VtZW50Lm9uKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlIClcblx0XHRcdFx0XHQub25lKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHR9O1xuXHRcdFx0JHRoaXMub24oIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdH0sXG5cblx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLCBjb250ZXh0O1xuXG5cdFx0XHRldmVudHMgPSAkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiICk7XG5cdFx0XHRpZiAoIGV2ZW50cyApIHtcblx0XHRcdFx0Y29udGV4dCA9IGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZGVsZXRlIGV2ZW50cy5zd2lwZTtcblx0XHRcdFx0ZXZlbnRzLmxlbmd0aC0tO1xuXHRcdFx0XHRpZiAoIGV2ZW50cy5sZW5ndGggPT09IDAgKSB7XG5cdFx0XHRcdFx0JC5yZW1vdmVEYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGlmICggY29udGV4dCApIHtcblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0YXJ0ICkge1xuXHRcdFx0XHRcdCQoIHRoaXMgKS5vZmYoIHRvdWNoU3RhcnRFdmVudCwgY29udGV4dC5zdGFydCApO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICggY29udGV4dC5tb3ZlICkge1xuXHRcdFx0XHRcdCRkb2N1bWVudC5vZmYoIHRvdWNoTW92ZUV2ZW50LCBjb250ZXh0Lm1vdmUgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQuc3RvcCApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaFN0b3BFdmVudCwgY29udGV4dC5zdG9wICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdCQuZWFjaCh7XG5cdFx0c3dpcGVsZWZ0OiBcInN3aXBlLmxlZnRcIixcblx0XHRzd2lwZXJpZ2h0OiBcInN3aXBlLnJpZ2h0XCJcblx0fSwgZnVuY3Rpb24oIGV2ZW50LCBzb3VyY2VFdmVudCApIHtcblxuXHRcdCQuZXZlbnQuc3BlY2lhbFsgZXZlbnQgXSA9IHtcblx0XHRcdHNldHVwOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0JCggdGhpcyApLmJpbmQoIHNvdXJjZUV2ZW50LCAkLm5vb3AgKTtcblx0XHRcdH0sXG5cdFx0XHR0ZWFyZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS51bmJpbmQoIHNvdXJjZUV2ZW50ICk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fSk7XG59KSggalF1ZXJ5LCB0aGlzICk7XG4qL1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBNdXRhdGlvbk9ic2VydmVyID0gKGZ1bmN0aW9uICgpIHtcbiAgdmFyIHByZWZpeGVzID0gWydXZWJLaXQnLCAnTW96JywgJ08nLCAnTXMnLCAnJ107XG4gIGZvciAodmFyIGk9MDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGAke3ByZWZpeGVzW2ldfU11dGF0aW9uT2JzZXJ2ZXJgIGluIHdpbmRvdykge1xuICAgICAgcmV0dXJuIHdpbmRvd1tgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYF07XG4gICAgfVxuICB9XG4gIHJldHVybiBmYWxzZTtcbn0oKSk7XG5cbmNvbnN0IHRyaWdnZXJzID0gKGVsLCB0eXBlKSA9PiB7XG4gIGVsLmRhdGEodHlwZSkuc3BsaXQoJyAnKS5mb3JFYWNoKGlkID0+IHtcbiAgICAkKGAjJHtpZH1gKVsgdHlwZSA9PT0gJ2Nsb3NlJyA/ICd0cmlnZ2VyJyA6ICd0cmlnZ2VySGFuZGxlciddKGAke3R5cGV9LnpmLnRyaWdnZXJgLCBbZWxdKTtcbiAgfSk7XG59O1xuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1vcGVuXSB3aWxsIHJldmVhbCBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLW9wZW5dJywgZnVuY3Rpb24oKSB7XG4gIHRyaWdnZXJzKCQodGhpcyksICdvcGVuJyk7XG59KTtcblxuLy8gRWxlbWVudHMgd2l0aCBbZGF0YS1jbG9zZV0gd2lsbCBjbG9zZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbi8vIElmIHVzZWQgd2l0aG91dCBhIHZhbHVlIG9uIFtkYXRhLWNsb3NlXSwgdGhlIGV2ZW50IHdpbGwgYnViYmxlLCBhbGxvd2luZyBpdCB0byBjbG9zZSBhIHBhcmVudCBjb21wb25lbnQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1jbG9zZV0nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCdjbG9zZScpO1xuICBpZiAoaWQpIHtcbiAgICB0cmlnZ2VycygkKHRoaXMpLCAnY2xvc2UnKTtcbiAgfVxuICBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlLnpmLnRyaWdnZXInKTtcbiAgfVxufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtdG9nZ2xlXSB3aWxsIHRvZ2dsZSBhIHBsdWdpbiB0aGF0IHN1cHBvcnRzIGl0IHdoZW4gY2xpY2tlZC5cbiQoZG9jdW1lbnQpLm9uKCdjbGljay56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZV0nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCd0b2dnbGUnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ3RvZ2dsZScpO1xuICB9IGVsc2Uge1xuICAgICQodGhpcykudHJpZ2dlcigndG9nZ2xlLnpmLnRyaWdnZXInKTtcbiAgfVxufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2FibGVdIHdpbGwgcmVzcG9uZCB0byBjbG9zZS56Zi50cmlnZ2VyIGV2ZW50cy5cbiQoZG9jdW1lbnQpLm9uKCdjbG9zZS56Zi50cmlnZ2VyJywgJ1tkYXRhLWNsb3NhYmxlXScsIGZ1bmN0aW9uKGUpe1xuICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICBsZXQgYW5pbWF0aW9uID0gJCh0aGlzKS5kYXRhKCdjbG9zYWJsZScpO1xuXG4gIGlmKGFuaW1hdGlvbiAhPT0gJycpe1xuICAgIEZvdW5kYXRpb24uTW90aW9uLmFuaW1hdGVPdXQoJCh0aGlzKSwgYW5pbWF0aW9uLCBmdW5jdGlvbigpIHtcbiAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2VkLnpmJyk7XG4gICAgfSk7XG4gIH1lbHNle1xuICAgICQodGhpcykuZmFkZU91dCgpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICB9XG59KTtcblxuJChkb2N1bWVudCkub24oJ2ZvY3VzLnpmLnRyaWdnZXIgYmx1ci56Zi50cmlnZ2VyJywgJ1tkYXRhLXRvZ2dsZS1mb2N1c10nLCBmdW5jdGlvbigpIHtcbiAgbGV0IGlkID0gJCh0aGlzKS5kYXRhKCd0b2dnbGUtZm9jdXMnKTtcbiAgJChgIyR7aWR9YCkudHJpZ2dlckhhbmRsZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJywgWyQodGhpcyldKTtcbn0pO1xuXG4vKipcbiogRmlyZXMgb25jZSBhZnRlciBhbGwgb3RoZXIgc2NyaXB0cyBoYXZlIGxvYWRlZFxuKiBAZnVuY3Rpb25cbiogQHByaXZhdGVcbiovXG4kKHdpbmRvdykub24oJ2xvYWQnLCAoKSA9PiB7XG4gIGNoZWNrTGlzdGVuZXJzKCk7XG59KTtcblxuZnVuY3Rpb24gY2hlY2tMaXN0ZW5lcnMoKSB7XG4gIGV2ZW50c0xpc3RlbmVyKCk7XG4gIHJlc2l6ZUxpc3RlbmVyKCk7XG4gIHNjcm9sbExpc3RlbmVyKCk7XG4gIGNsb3NlbWVMaXN0ZW5lcigpO1xufVxuXG4vLyoqKioqKioqIG9ubHkgZmlyZXMgdGhpcyBmdW5jdGlvbiBvbmNlIG9uIGxvYWQsIGlmIHRoZXJlJ3Mgc29tZXRoaW5nIHRvIHdhdGNoICoqKioqKioqXG5mdW5jdGlvbiBjbG9zZW1lTGlzdGVuZXIocGx1Z2luTmFtZSkge1xuICB2YXIgeWV0aUJveGVzID0gJCgnW2RhdGEteWV0aS1ib3hdJyksXG4gICAgICBwbHVnTmFtZXMgPSBbJ2Ryb3Bkb3duJywgJ3Rvb2x0aXAnLCAncmV2ZWFsJ107XG5cbiAgaWYocGx1Z2luTmFtZSl7XG4gICAgaWYodHlwZW9mIHBsdWdpbk5hbWUgPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5wdXNoKHBsdWdpbk5hbWUpO1xuICAgIH1lbHNlIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcGx1Z2luTmFtZVswXSA9PT0gJ3N0cmluZycpe1xuICAgICAgcGx1Z05hbWVzLmNvbmNhdChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZXtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ1BsdWdpbiBuYW1lcyBtdXN0IGJlIHN0cmluZ3MnKTtcbiAgICB9XG4gIH1cbiAgaWYoeWV0aUJveGVzLmxlbmd0aCl7XG4gICAgbGV0IGxpc3RlbmVycyA9IHBsdWdOYW1lcy5tYXAoKG5hbWUpID0+IHtcbiAgICAgIHJldHVybiBgY2xvc2VtZS56Zi4ke25hbWV9YDtcbiAgICB9KS5qb2luKCcgJyk7XG5cbiAgICAkKHdpbmRvdykub2ZmKGxpc3RlbmVycykub24obGlzdGVuZXJzLCBmdW5jdGlvbihlLCBwbHVnaW5JZCl7XG4gICAgICBsZXQgcGx1Z2luID0gZS5uYW1lc3BhY2Uuc3BsaXQoJy4nKVswXTtcbiAgICAgIGxldCBwbHVnaW5zID0gJChgW2RhdGEtJHtwbHVnaW59XWApLm5vdChgW2RhdGEteWV0aS1ib3g9XCIke3BsdWdpbklkfVwiXWApO1xuXG4gICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgbGV0IF90aGlzID0gJCh0aGlzKTtcblxuICAgICAgICBfdGhpcy50cmlnZ2VySGFuZGxlcignY2xvc2UuemYudHJpZ2dlcicsIFtfdGhpc10pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gcmVzaXplTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1yZXNpemVdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Jlc2l6ZS56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRpbWVyKSB7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSByZXNpemUgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJyZXNpemVcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCByZXNpemUgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBzY3JvbGxMaXN0ZW5lcihkZWJvdW5jZSl7XG4gIGxldCB0aW1lcixcbiAgICAgICRub2RlcyA9ICQoJ1tkYXRhLXNjcm9sbF0nKTtcbiAgaWYoJG5vZGVzLmxlbmd0aCl7XG4gICAgJCh3aW5kb3cpLm9mZignc2Nyb2xsLnpmLnRyaWdnZXInKVxuICAgIC5vbignc2Nyb2xsLnpmLnRyaWdnZXInLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmKHRpbWVyKXsgY2xlYXJUaW1lb3V0KHRpbWVyKTsgfVxuXG4gICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcblxuICAgICAgICBpZighTXV0YXRpb25PYnNlcnZlcil7Ly9mYWxsYmFjayBmb3IgSUUgOVxuICAgICAgICAgICRub2Rlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgLy90cmlnZ2VyIGFsbCBsaXN0ZW5pbmcgZWxlbWVudHMgYW5kIHNpZ25hbCBhIHNjcm9sbCBldmVudFxuICAgICAgICAkbm9kZXMuYXR0cignZGF0YS1ldmVudHMnLCBcInNjcm9sbFwiKTtcbiAgICAgIH0sIGRlYm91bmNlIHx8IDEwKTsvL2RlZmF1bHQgdGltZSB0byBlbWl0IHNjcm9sbCBldmVudFxuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIGV2ZW50c0xpc3RlbmVyKCkge1xuICBpZighTXV0YXRpb25PYnNlcnZlcil7IHJldHVybiBmYWxzZTsgfVxuICBsZXQgbm9kZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1yZXNpemVdLCBbZGF0YS1zY3JvbGxdLCBbZGF0YS1tdXRhdGVdJyk7XG5cbiAgLy9lbGVtZW50IGNhbGxiYWNrXG4gIHZhciBsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uID0gZnVuY3Rpb24gKG11dGF0aW9uUmVjb3Jkc0xpc3QpIHtcbiAgICAgIHZhciAkdGFyZ2V0ID0gJChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnRhcmdldCk7XG5cblx0ICAvL3RyaWdnZXIgdGhlIGV2ZW50IGhhbmRsZXIgZm9yIHRoZSBlbGVtZW50IGRlcGVuZGluZyBvbiB0eXBlXG4gICAgICBzd2l0Y2ggKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0udHlwZSkge1xuXG4gICAgICAgIGNhc2UgXCJhdHRyaWJ1dGVzXCI6XG4gICAgICAgICAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInNjcm9sbFwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Njcm9sbG1lLnpmLnRyaWdnZXInLCBbJHRhcmdldCwgd2luZG93LnBhZ2VZT2Zmc2V0XSk7XG5cdFx0ICB9XG5cdFx0ICBpZiAoJHRhcmdldC5hdHRyKFwiZGF0YS1ldmVudHNcIikgPT09IFwicmVzaXplXCIgJiYgbXV0YXRpb25SZWNvcmRzTGlzdFswXS5hdHRyaWJ1dGVOYW1lID09PSBcImRhdGEtZXZlbnRzXCIpIHtcblx0XHQgIFx0JHRhcmdldC50cmlnZ2VySGFuZGxlcigncmVzaXplbWUuemYudHJpZ2dlcicsIFskdGFyZ2V0XSk7XG5cdFx0ICAgfVxuXHRcdCAgaWYgKG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJzdHlsZVwiKSB7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuXHRcdCAgfVxuXHRcdCAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSBcImNoaWxkTGlzdFwiOlxuXHRcdCAgJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKS5hdHRyKFwiZGF0YS1ldmVudHNcIixcIm11dGF0ZVwiKTtcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlckhhbmRsZXIoJ211dGF0ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldC5jbG9zZXN0KFwiW2RhdGEtbXV0YXRlXVwiKV0pO1xuICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAvL25vdGhpbmdcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgaWYgKG5vZGVzLmxlbmd0aCkge1xuICAgICAgLy9mb3IgZWFjaCBlbGVtZW50IHRoYXQgbmVlZHMgdG8gbGlzdGVuIGZvciByZXNpemluZywgc2Nyb2xsaW5nLCBvciBtdXRhdGlvbiBhZGQgYSBzaW5nbGUgb2JzZXJ2ZXJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDw9IG5vZGVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICB2YXIgZWxlbWVudE9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIobGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbik7XG4gICAgICAgIGVsZW1lbnRPYnNlcnZlci5vYnNlcnZlKG5vZGVzW2ldLCB7IGF0dHJpYnV0ZXM6IHRydWUsIGNoaWxkTGlzdDogdHJ1ZSwgY2hhcmFjdGVyRGF0YTogZmFsc2UsIHN1YnRyZWU6IHRydWUsIGF0dHJpYnV0ZUZpbHRlcjogW1wiZGF0YS1ldmVudHNcIiwgXCJzdHlsZVwiXSB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbi8vIFtQSF1cbi8vIEZvdW5kYXRpb24uQ2hlY2tXYXRjaGVycyA9IGNoZWNrV2F0Y2hlcnM7XG5Gb3VuZGF0aW9uLklIZWFyWW91ID0gY2hlY2tMaXN0ZW5lcnM7XG4vLyBGb3VuZGF0aW9uLklTZWVZb3UgPSBzY3JvbGxMaXN0ZW5lcjtcbi8vIEZvdW5kYXRpb24uSUZlZWxZb3UgPSBjbG9zZW1lTGlzdGVuZXI7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBBY2NvcmRpb24gbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmFjY29yZGlvblxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5tb3Rpb25cbiAqL1xuXG5jbGFzcyBBY2NvcmRpb24ge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgQWNjb3JkaW9uI2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byBhbiBhY2NvcmRpb24uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gYSBwbGFpbiBvYmplY3Qgd2l0aCBzZXR0aW5ncyB0byBvdmVycmlkZSB0aGUgZGVmYXVsdCBvcHRpb25zLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBBY2NvcmRpb24uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ0FjY29yZGlvbicpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ0FjY29yZGlvbicsIHtcbiAgICAgICdFTlRFUic6ICd0b2dnbGUnLFxuICAgICAgJ1NQQUNFJzogJ3RvZ2dsZScsXG4gICAgICAnQVJST1dfRE9XTic6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICdwcmV2aW91cydcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgYWNjb3JkaW9uIGJ5IGFuaW1hdGluZyB0aGUgcHJlc2V0IGFjdGl2ZSBwYW5lKHMpLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKCdyb2xlJywgJ3RhYmxpc3QnKTtcbiAgICB0aGlzLiR0YWJzID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJyk7XG5cbiAgICB0aGlzLiR0YWJzLmVhY2goZnVuY3Rpb24oaWR4LCBlbCkge1xuICAgICAgdmFyICRlbCA9ICQoZWwpLFxuICAgICAgICAgICRjb250ZW50ID0gJGVsLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKSxcbiAgICAgICAgICBpZCA9ICRjb250ZW50WzBdLmlkIHx8IEZvdW5kYXRpb24uR2V0WW9EaWdpdHMoNiwgJ2FjY29yZGlvbicpLFxuICAgICAgICAgIGxpbmtJZCA9IGVsLmlkIHx8IGAke2lkfS1sYWJlbGA7XG5cbiAgICAgICRlbC5maW5kKCdhOmZpcnN0JykuYXR0cih7XG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaWQsXG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdpZCc6IGxpbmtJZCxcbiAgICAgICAgJ2FyaWEtZXhwYW5kZWQnOiBmYWxzZSxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgICRjb250ZW50LmF0dHIoeydyb2xlJzogJ3RhYnBhbmVsJywgJ2FyaWEtbGFiZWxsZWRieSc6IGxpbmtJZCwgJ2FyaWEtaGlkZGVuJzogdHJ1ZSwgJ2lkJzogaWR9KTtcbiAgICB9KTtcbiAgICB2YXIgJGluaXRBY3RpdmUgPSB0aGlzLiRlbGVtZW50LmZpbmQoJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgdGhpcy5maXJzdFRpbWVJbml0ID0gdHJ1ZTtcbiAgICBpZigkaW5pdEFjdGl2ZS5sZW5ndGgpe1xuICAgICAgdGhpcy5kb3duKCRpbml0QWN0aXZlLCB0aGlzLmZpcnN0VGltZUluaXQpO1xuICAgICAgdGhpcy5maXJzdFRpbWVJbml0ID0gZmFsc2U7XG4gICAgfVxuXG4gICAgdGhpcy5fY2hlY2tEZWVwTGluayA9ICgpID0+IHtcbiAgICAgIHZhciBhbmNob3IgPSB3aW5kb3cubG9jYXRpb24uaGFzaDtcbiAgICAgIC8vbmVlZCBhIGhhc2ggYW5kIGEgcmVsZXZhbnQgYW5jaG9yIGluIHRoaXMgdGFic2V0XG4gICAgICBpZihhbmNob3IubGVuZ3RoKSB7XG4gICAgICAgIHZhciAkbGluayA9IHRoaXMuJGVsZW1lbnQuZmluZCgnW2hyZWYkPVwiJythbmNob3IrJ1wiXScpLFxuICAgICAgICAkYW5jaG9yID0gJChhbmNob3IpO1xuXG4gICAgICAgIGlmICgkbGluay5sZW5ndGggJiYgJGFuY2hvcikge1xuICAgICAgICAgIGlmICghJGxpbmsucGFyZW50KCdbZGF0YS1hY2NvcmRpb24taXRlbV0nKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgICAgICAgIHRoaXMuZG93bigkYW5jaG9yLCB0aGlzLmZpcnN0VGltZUluaXQpO1xuICAgICAgICAgICAgdGhpcy5maXJzdFRpbWVJbml0ID0gZmFsc2U7XG4gICAgICAgICAgfTtcblxuICAgICAgICAgIC8vcm9sbCB1cCBhIGxpdHRsZSB0byBzaG93IHRoZSB0aXRsZXNcbiAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlKSB7XG4gICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgJCh3aW5kb3cpLmxvYWQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciBvZmZzZXQgPSBfdGhpcy4kZWxlbWVudC5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IG9mZnNldC50b3AgfSwgX3RoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZURlbGF5KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBkZWVwbGlua2VkIGF0IHBhZ2Vsb2FkXG4gICAgICAgICAgICAqIEBldmVudCBBY2NvcmRpb24jZGVlcGxpbmtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkZWVwbGluay56Zi5hY2NvcmRpb24nLCBbJGxpbmssICRhbmNob3JdKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vdXNlIGJyb3dzZXIgdG8gb3BlbiBhIHRhYiwgaWYgaXQgZXhpc3RzIGluIHRoaXMgdGFic2V0XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgdGhpcy5fY2hlY2tEZWVwTGluaygpO1xuICAgIH1cblxuICAgIHRoaXMuX2V2ZW50cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgYWNjb3JkaW9uLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRlbGVtID0gJCh0aGlzKTtcbiAgICAgIHZhciAkdGFiQ29udGVudCA9ICRlbGVtLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICAgIGlmICgkdGFiQ29udGVudC5sZW5ndGgpIHtcbiAgICAgICAgJGVsZW0uY2hpbGRyZW4oJ2EnKS5vZmYoJ2NsaWNrLnpmLmFjY29yZGlvbiBrZXlkb3duLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgICAub24oJ2NsaWNrLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgX3RoaXMudG9nZ2xlKCR0YWJDb250ZW50KTtcbiAgICAgICAgfSkub24oJ2tleWRvd24uemYuYWNjb3JkaW9uJywgZnVuY3Rpb24oZSl7XG4gICAgICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ0FjY29yZGlvbicsIHtcbiAgICAgICAgICAgIHRvZ2dsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbmV4dDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkYSA9ICRlbGVtLm5leHQoKS5maW5kKCdhJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgJGEudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByZXZpb3VzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgdmFyICRhID0gJGVsZW0ucHJldigpLmZpbmQoJ2EnKS5mb2N1cygpO1xuICAgICAgICAgICAgICBpZiAoIV90aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAkYS50cmlnZ2VyKCdjbGljay56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFRvZ2dsZXMgdGhlIHNlbGVjdGVkIGNvbnRlbnQgcGFuZSdzIG9wZW4vY2xvc2Ugc3RhdGUuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0galF1ZXJ5IG9iamVjdCBvZiB0aGUgcGFuZSB0byB0b2dnbGUgKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICB0b2dnbGUoJHRhcmdldCkge1xuICAgIGlmKCR0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICB0aGlzLnVwKCR0YXJnZXQpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmRvd24oJHRhcmdldCk7XG4gICAgfVxuICAgIC8vZWl0aGVyIHJlcGxhY2Ugb3IgdXBkYXRlIGJyb3dzZXIgaGlzdG9yeVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHZhciBhbmNob3IgPSAkdGFyZ2V0LnByZXYoJ2EnKS5hdHRyKCdocmVmJyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBkYXRlSGlzdG9yeSkge1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSBhY2NvcmRpb24gdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIEFjY29yZGlvbiBwYW5lIHRvIG9wZW4gKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQHBhcmFtIHtCb29sZWFufSBmaXJzdFRpbWUgLSBmbGFnIHRvIGRldGVybWluZSBpZiByZWZsb3cgc2hvdWxkIGhhcHBlbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbiNkb3duXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZG93bigkdGFyZ2V0LCBmaXJzdFRpbWUpIHtcbiAgICAkdGFyZ2V0XG4gICAgICAuYXR0cignYXJpYS1oaWRkZW4nLCBmYWxzZSlcbiAgICAgIC5wYXJlbnQoJ1tkYXRhLXRhYi1jb250ZW50XScpXG4gICAgICAuYWRkQmFjaygpXG4gICAgICAucGFyZW50KCkuYWRkQ2xhc3MoJ2lzLWFjdGl2ZScpO1xuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMubXVsdGlFeHBhbmQgJiYgIWZpcnN0VGltZSkge1xuICAgICAgdmFyICRjdXJyZW50QWN0aXZlID0gdGhpcy4kZWxlbWVudC5jaGlsZHJlbignLmlzLWFjdGl2ZScpLmNoaWxkcmVuKCdbZGF0YS10YWItY29udGVudF0nKTtcbiAgICAgIGlmICgkY3VycmVudEFjdGl2ZS5sZW5ndGgpIHtcbiAgICAgICAgdGhpcy51cCgkY3VycmVudEFjdGl2ZS5ub3QoJHRhcmdldCkpO1xuICAgICAgfVxuICAgIH1cblxuICAgICR0YXJnZXQuc2xpZGVEb3duKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAoKSA9PiB7XG4gICAgICAvKipcbiAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHRhYiBpcyBkb25lIG9wZW5pbmcuXG4gICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI2Rvd25cbiAgICAgICAqL1xuICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdkb3duLnpmLmFjY29yZGlvbicsIFskdGFyZ2V0XSk7XG4gICAgfSk7XG5cbiAgICAkKGAjJHskdGFyZ2V0LmF0dHIoJ2FyaWEtbGFiZWxsZWRieScpfWApLmF0dHIoe1xuICAgICAgJ2FyaWEtZXhwYW5kZWQnOiB0cnVlLFxuICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiB0cnVlXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQ2xvc2VzIHRoZSB0YWIgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gQWNjb3JkaW9uIHRhYiB0byBjbG9zZSAoYC5hY2NvcmRpb24tY29udGVudGApLlxuICAgKiBAZmlyZXMgQWNjb3JkaW9uI3VwXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdXAoJHRhcmdldCkge1xuICAgIHZhciAkYXVudHMgPSAkdGFyZ2V0LnBhcmVudCgpLnNpYmxpbmdzKCksXG4gICAgICAgIF90aGlzID0gdGhpcztcblxuICAgIGlmKCghdGhpcy5vcHRpb25zLmFsbG93QWxsQ2xvc2VkICYmICEkYXVudHMuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB8fCAhJHRhcmdldC5wYXJlbnQoKS5oYXNDbGFzcygnaXMtYWN0aXZlJykpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBGb3VuZGF0aW9uLk1vdmUodGhpcy5vcHRpb25zLnNsaWRlU3BlZWQsICR0YXJnZXQsIGZ1bmN0aW9uKCl7XG4gICAgICAkdGFyZ2V0LnNsaWRlVXAoX3RoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBjb2xsYXBzaW5nIHVwLlxuICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI3VwXG4gICAgICAgICAqL1xuICAgICAgICBfdGhpcy4kZWxlbWVudC50cmlnZ2VyKCd1cC56Zi5hY2NvcmRpb24nLCBbJHRhcmdldF0pO1xuICAgICAgfSk7XG4gICAgLy8gfSk7XG5cbiAgICAkdGFyZ2V0LmF0dHIoJ2FyaWEtaGlkZGVuJywgdHJ1ZSlcbiAgICAgICAgICAgLnBhcmVudCgpLnJlbW92ZUNsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgICQoYCMkeyR0YXJnZXQuYXR0cignYXJpYS1sYWJlbGxlZGJ5Jyl9YCkuYXR0cih7XG4gICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFuIGFjY29yZGlvbi5cbiAgICogQGZpcmVzIEFjY29yZGlvbiNkZXN0cm95ZWRcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnW2RhdGEtdGFiLWNvbnRlbnRdJykuc3RvcCh0cnVlKS5zbGlkZVVwKDApLmNzcygnZGlzcGxheScsICcnKTtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2EnKS5vZmYoJy56Zi5hY2NvcmRpb24nKTtcbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cbkFjY29yZGlvbi5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lIHRvIGFuaW1hdGUgdGhlIG9wZW5pbmcgb2YgYW4gYWNjb3JkaW9uIHBhbmUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMjUwXG4gICAqL1xuICBzbGlkZVNwZWVkOiAyNTAsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGhhdmUgbXVsdGlwbGUgb3BlbiBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG11bHRpRXhwYW5kOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93IHRoZSBhY2NvcmRpb24gdG8gY2xvc2UgYWxsIHBhbmVzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgYWxsb3dBbGxDbG9zZWQ6IGZhbHNlLFxuICAvKipcbiAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgcGFuZSBzcGVjaWZpZWQgYnkgaGFzaCBhbmNob3JcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rOiBmYWxzZSxcblxuICAvKipcbiAgICogQWRqdXN0IHRoZSBkZWVwIGxpbmsgc2Nyb2xsIHRvIG1ha2Ugc3VyZSB0aGUgdG9wIG9mIHRoZSBhY2NvcmRpb24gcGFuZWwgaXMgdmlzaWJsZVxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbmltYXRpb24gdGltZSAobXMpIGZvciB0aGUgZGVlcCBsaW5rIGFkanVzdG1lbnRcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAzMDBcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlRGVsYXk6IDMwMCxcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBicm93c2VyIGhpc3Rvcnkgd2l0aCB0aGUgb3BlbiBhY2NvcmRpb25cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHVwZGF0ZUhpc3Rvcnk6IGZhbHNlXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oQWNjb3JkaW9uLCAnQWNjb3JkaW9uJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBJbnRlcmNoYW5nZSBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24uaW50ZXJjaGFuZ2VcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubWVkaWFRdWVyeVxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyXG4gKi9cblxuY2xhc3MgSW50ZXJjaGFuZ2Uge1xuICAvKipcbiAgICogQ3JlYXRlcyBhIG5ldyBpbnN0YW5jZSBvZiBJbnRlcmNoYW5nZS5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBJbnRlcmNoYW5nZSNpbml0XG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBhZGQgdGhlIHRyaWdnZXIgdG8uXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gT3ZlcnJpZGVzIHRvIHRoZSBkZWZhdWx0IHBsdWdpbiBzZXR0aW5ncy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgSW50ZXJjaGFuZ2UuZGVmYXVsdHMsIG9wdGlvbnMpO1xuICAgIHRoaXMucnVsZXMgPSBbXTtcbiAgICB0aGlzLmN1cnJlbnRQYXRoID0gJyc7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgdGhpcy5fZXZlbnRzKCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdJbnRlcmNoYW5nZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSBJbnRlcmNoYW5nZSBwbHVnaW4gYW5kIGNhbGxzIGZ1bmN0aW9ucyB0byBnZXQgaW50ZXJjaGFuZ2UgZnVuY3Rpb25pbmcgb24gbG9hZC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB0aGlzLl9hZGRCcmVha3BvaW50cygpO1xuICAgIHRoaXMuX2dlbmVyYXRlUnVsZXMoKTtcbiAgICB0aGlzLl9yZWZsb3coKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyBldmVudHMgZm9yIEludGVyY2hhbmdlLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYuaW50ZXJjaGFuZ2UnLCBGb3VuZGF0aW9uLnV0aWwudGhyb3R0bGUoKCkgPT4ge1xuICAgICAgdGhpcy5fcmVmbG93KCk7XG4gICAgfSwgNTApKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxscyBuZWNlc3NhcnkgZnVuY3Rpb25zIHRvIHVwZGF0ZSBJbnRlcmNoYW5nZSB1cG9uIERPTSBjaGFuZ2VcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfcmVmbG93KCkge1xuICAgIHZhciBtYXRjaDtcblxuICAgIC8vIEl0ZXJhdGUgdGhyb3VnaCBlYWNoIHJ1bGUsIGJ1dCBvbmx5IHNhdmUgdGhlIGxhc3QgbWF0Y2hcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucnVsZXMpIHtcbiAgICAgIGlmKHRoaXMucnVsZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHJ1bGUgPSB0aGlzLnJ1bGVzW2ldO1xuICAgICAgICBpZiAod2luZG93Lm1hdGNoTWVkaWEocnVsZS5xdWVyeSkubWF0Y2hlcykge1xuICAgICAgICAgIG1hdGNoID0gcnVsZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChtYXRjaCkge1xuICAgICAgdGhpcy5yZXBsYWNlKG1hdGNoLnBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBGb3VuZGF0aW9uIGJyZWFrcG9pbnRzIGFuZCBhZGRzIHRoZW0gdG8gdGhlIEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFUyBvYmplY3QuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEJyZWFrcG9pbnRzKCkge1xuICAgIGZvciAodmFyIGkgaW4gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXMpIHtcbiAgICAgIGlmIChGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcXVlcnkgPSBGb3VuZGF0aW9uLk1lZGlhUXVlcnkucXVlcmllc1tpXTtcbiAgICAgICAgSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTW3F1ZXJ5Lm5hbWVdID0gcXVlcnkudmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIENoZWNrcyB0aGUgSW50ZXJjaGFuZ2UgZWxlbWVudCBmb3IgdGhlIHByb3ZpZGVkIG1lZGlhIHF1ZXJ5ICsgY29udGVudCBwYWlyaW5nc1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRoYXQgaXMgYW4gSW50ZXJjaGFuZ2UgaW5zdGFuY2VcbiAgICogQHJldHVybnMge0FycmF5fSBzY2VuYXJpb3MgLSBBcnJheSBvZiBvYmplY3RzIHRoYXQgaGF2ZSAnbXEnIGFuZCAncGF0aCcga2V5cyB3aXRoIGNvcnJlc3BvbmRpbmcga2V5c1xuICAgKi9cbiAgX2dlbmVyYXRlUnVsZXMoZWxlbWVudCkge1xuICAgIHZhciBydWxlc0xpc3QgPSBbXTtcbiAgICB2YXIgcnVsZXM7XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnJ1bGVzKSB7XG4gICAgICBydWxlcyA9IHRoaXMub3B0aW9ucy5ydWxlcztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBydWxlcyA9IHRoaXMuJGVsZW1lbnQuZGF0YSgnaW50ZXJjaGFuZ2UnKTtcbiAgICB9XG4gICAgXG4gICAgcnVsZXMgPSAgdHlwZW9mIHJ1bGVzID09PSAnc3RyaW5nJyA/IHJ1bGVzLm1hdGNoKC9cXFsuKj9cXF0vZykgOiBydWxlcztcblxuICAgIGZvciAodmFyIGkgaW4gcnVsZXMpIHtcbiAgICAgIGlmKHJ1bGVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBydWxlID0gcnVsZXNbaV0uc2xpY2UoMSwgLTEpLnNwbGl0KCcsICcpO1xuICAgICAgICB2YXIgcGF0aCA9IHJ1bGUuc2xpY2UoMCwgLTEpLmpvaW4oJycpO1xuICAgICAgICB2YXIgcXVlcnkgPSBydWxlW3J1bGUubGVuZ3RoIC0gMV07XG5cbiAgICAgICAgaWYgKEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeV0pIHtcbiAgICAgICAgICBxdWVyeSA9IEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeV07XG4gICAgICAgIH1cblxuICAgICAgICBydWxlc0xpc3QucHVzaCh7XG4gICAgICAgICAgcGF0aDogcGF0aCxcbiAgICAgICAgICBxdWVyeTogcXVlcnlcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5ydWxlcyA9IHJ1bGVzTGlzdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGBzcmNgIHByb3BlcnR5IG9mIGFuIGltYWdlLCBvciBjaGFuZ2UgdGhlIEhUTUwgb2YgYSBjb250YWluZXIsIHRvIHRoZSBzcGVjaWZpZWQgcGF0aC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIC0gUGF0aCB0byB0aGUgaW1hZ2Ugb3IgSFRNTCBwYXJ0aWFsLlxuICAgKiBAZmlyZXMgSW50ZXJjaGFuZ2UjcmVwbGFjZWRcbiAgICovXG4gIHJlcGxhY2UocGF0aCkge1xuICAgIGlmICh0aGlzLmN1cnJlbnRQYXRoID09PSBwYXRoKSByZXR1cm47XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICB0cmlnZ2VyID0gJ3JlcGxhY2VkLnpmLmludGVyY2hhbmdlJztcblxuICAgIC8vIFJlcGxhY2luZyBpbWFnZXNcbiAgICBpZiAodGhpcy4kZWxlbWVudFswXS5ub2RlTmFtZSA9PT0gJ0lNRycpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuYXR0cignc3JjJywgcGF0aCkub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgX3RoaXMuY3VycmVudFBhdGggPSBwYXRoO1xuICAgICAgfSlcbiAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgIH1cbiAgICAvLyBSZXBsYWNpbmcgYmFja2dyb3VuZCBpbWFnZXNcbiAgICBlbHNlIGlmIChwYXRoLm1hdGNoKC9cXC4oZ2lmfGpwZ3xqcGVnfHBuZ3xzdmd8dGlmZikoWz8jXS4qKT8vaSkpIHtcbiAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHsgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcrcGF0aCsnKScgfSlcbiAgICAgICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjaW5nIEhUTUxcbiAgICBlbHNlIHtcbiAgICAgICQuZ2V0KHBhdGgsIGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgIF90aGlzLiRlbGVtZW50Lmh0bWwocmVzcG9uc2UpXG4gICAgICAgICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgICAgICQocmVzcG9uc2UpLmZvdW5kYXRpb24oKTtcbiAgICAgICAgX3RoaXMuY3VycmVudFBhdGggPSBwYXRoO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiBjb250ZW50IGluIGFuIEludGVyY2hhbmdlIGVsZW1lbnQgaXMgZG9uZSBiZWluZyBsb2FkZWQuXG4gICAgICogQGV2ZW50IEludGVyY2hhbmdlI3JlcGxhY2VkXG4gICAgICovXG4gICAgLy8gdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZScpO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGludGVyY2hhbmdlLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgLy9UT0RPIHRoaXMuXG4gIH1cbn1cblxuLyoqXG4gKiBEZWZhdWx0IHNldHRpbmdzIGZvciBwbHVnaW5cbiAqL1xuSW50ZXJjaGFuZ2UuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBSdWxlcyB0byBiZSBhcHBsaWVkIHRvIEludGVyY2hhbmdlIGVsZW1lbnRzLiBTZXQgd2l0aCB0aGUgYGRhdGEtaW50ZXJjaGFuZ2VgIGFycmF5IG5vdGF0aW9uLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHs/YXJyYXl9XG4gICAqIEBkZWZhdWx0IG51bGxcbiAgICovXG4gIHJ1bGVzOiBudWxsXG59O1xuXG5JbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgPSB7XG4gICdsYW5kc2NhcGUnOiAnc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICAncG9ydHJhaXQnOiAnc2NyZWVuIGFuZCAob3JpZW50YXRpb246IHBvcnRyYWl0KScsXG4gICdyZXRpbmEnOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwgb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwgb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEludGVyY2hhbmdlLCAnSW50ZXJjaGFuZ2UnKTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIFRhYnMgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLnRhYnNcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlciBpZiB0YWJzIGNvbnRhaW4gaW1hZ2VzXG4gKi9cblxuY2xhc3MgVGFicyB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIHRhYnMuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgVGFicyNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gdGFicy5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBUYWJzLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnVGFicycpO1xuICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQucmVnaXN0ZXIoJ1RhYnMnLCB7XG4gICAgICAnRU5URVInOiAnb3BlbicsXG4gICAgICAnU1BBQ0UnOiAnb3BlbicsXG4gICAgICAnQVJST1dfUklHSFQnOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfTEVGVCc6ICdwcmV2aW91cydcbiAgICAgIC8vICdUQUInOiAnbmV4dCcsXG4gICAgICAvLyAnU0hJRlRfVEFCJzogJ3ByZXZpb3VzJ1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIHRoZSB0YWJzIGJ5IHNob3dpbmcgYW5kIGZvY3VzaW5nIChpZiBhdXRvRm9jdXM9dHJ1ZSkgdGhlIHByZXNldCBhY3RpdmUgdGFiLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnQuYXR0cih7J3JvbGUnOiAndGFibGlzdCd9KTtcbiAgICB0aGlzLiR0YWJUaXRsZXMgPSB0aGlzLiRlbGVtZW50LmZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCk7XG4gICAgdGhpcy4kdGFiQ29udGVudCA9ICQoYFtkYXRhLXRhYnMtY29udGVudD1cIiR7dGhpcy4kZWxlbWVudFswXS5pZH1cIl1gKTtcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGVsZW0gPSAkKHRoaXMpLFxuICAgICAgICAgICRsaW5rID0gJGVsZW0uZmluZCgnYScpLFxuICAgICAgICAgIGlzQWN0aXZlID0gJGVsZW0uaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgaGFzaCA9ICRsaW5rWzBdLmhhc2guc2xpY2UoMSksXG4gICAgICAgICAgbGlua0lkID0gJGxpbmtbMF0uaWQgPyAkbGlua1swXS5pZCA6IGAke2hhc2h9LWxhYmVsYCxcbiAgICAgICAgICAkdGFiQ29udGVudCA9ICQoYCMke2hhc2h9YCk7XG5cbiAgICAgICRlbGVtLmF0dHIoeydyb2xlJzogJ3ByZXNlbnRhdGlvbid9KTtcblxuICAgICAgJGxpbmsuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYicsXG4gICAgICAgICdhcmlhLWNvbnRyb2xzJzogaGFzaCxcbiAgICAgICAgJ2FyaWEtc2VsZWN0ZWQnOiBpc0FjdGl2ZSxcbiAgICAgICAgJ2lkJzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgJHRhYkNvbnRlbnQuYXR0cih7XG4gICAgICAgICdyb2xlJzogJ3RhYnBhbmVsJyxcbiAgICAgICAgJ2FyaWEtaGlkZGVuJzogIWlzQWN0aXZlLFxuICAgICAgICAnYXJpYS1sYWJlbGxlZGJ5JzogbGlua0lkXG4gICAgICB9KTtcblxuICAgICAgaWYoaXNBY3RpdmUgJiYgX3RoaXMub3B0aW9ucy5hdXRvRm9jdXMpe1xuICAgICAgICAkKHdpbmRvdykubG9hZChmdW5jdGlvbigpIHtcbiAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogJGVsZW0ub2Zmc2V0KCkudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSwgKCkgPT4ge1xuICAgICAgICAgICAgJGxpbmsuZm9jdXMoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgaWYodGhpcy5vcHRpb25zLm1hdGNoSGVpZ2h0KSB7XG4gICAgICB2YXIgJGltYWdlcyA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZCgnaW1nJyk7XG5cbiAgICAgIGlmICgkaW1hZ2VzLmxlbmd0aCkge1xuICAgICAgICBGb3VuZGF0aW9uLm9uSW1hZ2VzTG9hZGVkKCRpbWFnZXMsIHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX3NldEhlaWdodCgpO1xuICAgICAgfVxuICAgIH1cblxuICAgICAvL2N1cnJlbnQgY29udGV4dC1ib3VuZCBmdW5jdGlvbiB0byBvcGVuIHRhYnMgb24gcGFnZSBsb2FkIG9yIGhpc3RvcnkgcG9wc3RhdGVcbiAgICB0aGlzLl9jaGVja0RlZXBMaW5rID0gKCkgPT4ge1xuICAgICAgdmFyIGFuY2hvciA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgICAgLy9uZWVkIGEgaGFzaCBhbmQgYSByZWxldmFudCBhbmNob3IgaW4gdGhpcyB0YWJzZXRcbiAgICAgIGlmKGFuY2hvci5sZW5ndGgpIHtcbiAgICAgICAgdmFyICRsaW5rID0gdGhpcy4kZWxlbWVudC5maW5kKCdbaHJlZiQ9XCInK2FuY2hvcisnXCJdJyk7XG4gICAgICAgIGlmICgkbGluay5sZW5ndGgpIHtcbiAgICAgICAgICB0aGlzLnNlbGVjdFRhYigkKGFuY2hvciksIHRydWUpO1xuXG4gICAgICAgICAgLy9yb2xsIHVwIGEgbGl0dGxlIHRvIHNob3cgdGhlIHRpdGxlc1xuICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2UpIHtcbiAgICAgICAgICAgIHZhciBvZmZzZXQgPSB0aGlzLiRlbGVtZW50Lm9mZnNldCgpO1xuICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoeyBzY3JvbGxUb3A6IG9mZnNldC50b3AgfSwgdGhpcy5vcHRpb25zLmRlZXBMaW5rU211ZGdlRGVsYXkpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBkZWVwbGlua2VkIGF0IHBhZ2Vsb2FkXG4gICAgICAgICAgICAqIEBldmVudCBUYWJzI2RlZXBsaW5rXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2RlZXBsaW5rLnpmLnRhYnMnLCBbJGxpbmssICQoYW5jaG9yKV0pO1xuICAgICAgICAgfVxuICAgICAgIH1cbiAgICAgfVxuXG4gICAgLy91c2UgYnJvd3NlciB0byBvcGVuIGEgdGFiLCBpZiBpdCBleGlzdHMgaW4gdGhpcyB0YWJzZXRcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB0aGlzLl9jaGVja0RlZXBMaW5rKCk7XG4gICAgfVxuXG4gICAgdGhpcy5fZXZlbnRzKCk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2V2ZW50cygpIHtcbiAgICB0aGlzLl9hZGRLZXlIYW5kbGVyKCk7XG4gICAgdGhpcy5fYWRkQ2xpY2tIYW5kbGVyKCk7XG4gICAgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyID0gbnVsbDtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciA9IHRoaXMuX3NldEhlaWdodC5iaW5kKHRoaXMpO1xuXG4gICAgICAkKHdpbmRvdykub24oJ2NoYW5nZWQuemYubWVkaWFxdWVyeScsIHRoaXMuX3NldEhlaWdodE1xSGFuZGxlcik7XG4gICAgfVxuXG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub24oJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgY2xpY2sgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRDbGlja0hhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5vZmYoJ2NsaWNrLnpmLnRhYnMnKVxuICAgICAgLm9uKCdjbGljay56Zi50YWJzJywgYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9YCwgZnVuY3Rpb24oZSl7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkKHRoaXMpKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMga2V5Ym9hcmQgZXZlbnQgaGFuZGxlcnMgZm9yIGl0ZW1zIHdpdGhpbiB0aGUgdGFicy5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRLZXlIYW5kbGVyKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG5cbiAgICB0aGlzLiR0YWJUaXRsZXMub2ZmKCdrZXlkb3duLnpmLnRhYnMnKS5vbigna2V5ZG93bi56Zi50YWJzJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZiAoZS53aGljaCA9PT0gOSkgcmV0dXJuO1xuXG5cbiAgICAgIHZhciAkZWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICRlbGVtZW50cyA9ICRlbGVtZW50LnBhcmVudCgndWwnKS5jaGlsZHJlbignbGknKSxcbiAgICAgICAgJHByZXZFbGVtZW50LFxuICAgICAgICAkbmV4dEVsZW1lbnQ7XG5cbiAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgaWYgKCQodGhpcykuaXMoJGVsZW1lbnQpKSB7XG4gICAgICAgICAgaWYgKF90aGlzLm9wdGlvbnMud3JhcE9uS2V5cykge1xuICAgICAgICAgICAgJHByZXZFbGVtZW50ID0gaSA9PT0gMCA/ICRlbGVtZW50cy5sYXN0KCkgOiAkZWxlbWVudHMuZXEoaS0xKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9IGkgPT09ICRlbGVtZW50cy5sZW5ndGggLTEgPyAkZWxlbWVudHMuZmlyc3QoKSA6ICRlbGVtZW50cy5lcShpKzEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5tYXgoMCwgaS0xKSk7XG4gICAgICAgICAgICAkbmV4dEVsZW1lbnQgPSAkZWxlbWVudHMuZXEoTWF0aC5taW4oaSsxLCAkZWxlbWVudHMubGVuZ3RoLTEpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gaGFuZGxlIGtleWJvYXJkIGV2ZW50IHdpdGgga2V5Ym9hcmQgdXRpbFxuICAgICAgRm91bmRhdGlvbi5LZXlib2FyZC5oYW5kbGVLZXkoZSwgJ1RhYnMnLCB7XG4gICAgICAgIG9wZW46IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRlbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRlbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgcHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRwcmV2RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkcHJldkVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBuZXh0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkbmV4dEVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJG5leHRFbGVtZW50KTtcbiAgICAgICAgfSxcbiAgICAgICAgaGFuZGxlZDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC4gQ29sbGFwc2VzIGFjdGl2ZSB0YWIuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIG9wZW4uXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGlzdG9yeUhhbmRsZWQgLSBicm93c2VyIGhhcyBhbHJlYWR5IGhhbmRsZWQgYSBoaXN0b3J5IHVwZGF0ZVxuICAgKiBAZmlyZXMgVGFicyNjaGFuZ2VcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfaGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQsIGhpc3RvcnlIYW5kbGVkKSB7XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBmb3IgYWN0aXZlIGNsYXNzIG9uIHRhcmdldC4gQ29sbGFwc2UgaWYgZXhpc3RzLlxuICAgICAqL1xuICAgIGlmICgkdGFyZ2V0Lmhhc0NsYXNzKGAke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCkpIHtcbiAgICAgICAgaWYodGhpcy5vcHRpb25zLmFjdGl2ZUNvbGxhcHNlKSB7XG4gICAgICAgICAgICB0aGlzLl9jb2xsYXBzZVRhYigkdGFyZ2V0KTtcblxuICAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNvbGxhcHNlZCB0YWJzLlxuICAgICAgICAgICAgKiBAZXZlbnQgVGFicyNjb2xsYXBzZVxuICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY29sbGFwc2UuemYudGFicycsIFskdGFyZ2V0XSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciAkb2xkVGFiID0gdGhpcy4kZWxlbWVudC5cbiAgICAgICAgICBmaW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfS4ke3RoaXMub3B0aW9ucy5saW5rQWN0aXZlQ2xhc3N9YCksXG4gICAgICAgICAgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAvL2Nsb3NlIG9sZCB0YWJcbiAgICB0aGlzLl9jb2xsYXBzZVRhYigkb2xkVGFiKTtcblxuICAgIC8vb3BlbiBuZXcgdGFiXG4gICAgdGhpcy5fb3BlblRhYigkdGFyZ2V0KTtcblxuICAgIC8vZWl0aGVyIHJlcGxhY2Ugb3IgdXBkYXRlIGJyb3dzZXIgaGlzdG9yeVxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmsgJiYgIWhpc3RvcnlIYW5kbGVkKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5maW5kKCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gdGhlIHBsdWdpbiBoYXMgc3VjY2Vzc2Z1bGx5IGNoYW5nZWQgdGFicy5cbiAgICAgKiBAZXZlbnQgVGFicyNjaGFuZ2VcbiAgICAgKi9cbiAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoJ2NoYW5nZS56Zi50YWJzJywgWyR0YXJnZXQsICR0YXJnZXRDb250ZW50XSk7XG5cbiAgICAvL2ZpcmUgdG8gY2hpbGRyZW4gYSBtdXRhdGlvbiBldmVudFxuICAgICR0YXJnZXRDb250ZW50LmZpbmQoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXIoXCJtdXRhdGVtZS56Zi50cmlnZ2VyXCIpO1xuICB9XG5cbiAgLyoqXG4gICAqIE9wZW5zIHRoZSB0YWIgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gT3Blbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfb3BlblRhYigkdGFyZ2V0KSB7XG4gICAgICB2YXIgJHRhYkxpbmsgPSAkdGFyZ2V0LmZpbmQoJ1tyb2xlPVwidGFiXCJdJyksXG4gICAgICAgICAgaGFzaCA9ICR0YWJMaW5rWzBdLmhhc2gsXG4gICAgICAgICAgJHRhcmdldENvbnRlbnQgPSB0aGlzLiR0YWJDb250ZW50LmZpbmQoaGFzaCk7XG5cbiAgICAgICR0YXJnZXQuYWRkQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKTtcblxuICAgICAgJHRhYkxpbmsuYXR0cih7J2FyaWEtc2VsZWN0ZWQnOiAndHJ1ZSd9KTtcblxuICAgICAgJHRhcmdldENvbnRlbnRcbiAgICAgICAgLmFkZENsYXNzKGAke3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApXG4gICAgICAgIC5hdHRyKHsnYXJpYS1oaWRkZW4nOiAnZmFsc2UnfSk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGAkdGFyZ2V0Q29udGVudGAgZGVmaW5lZCBieSBgJHRhcmdldGAuXG4gICAqIEBwYXJhbSB7alF1ZXJ5fSAkdGFyZ2V0IC0gVGFiIHRvIE9wZW4uXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgX2NvbGxhcHNlVGFiKCR0YXJnZXQpIHtcbiAgICB2YXIgJHRhcmdldF9hbmNob3IgPSAkdGFyZ2V0XG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKVxuICAgICAgLmZpbmQoJ1tyb2xlPVwidGFiXCJdJylcbiAgICAgIC5hdHRyKHsgJ2FyaWEtc2VsZWN0ZWQnOiAnZmFsc2UnIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldF9hbmNob3IuYXR0cignYXJpYS1jb250cm9scycpfWApXG4gICAgICAucmVtb3ZlQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YClcbiAgICAgIC5hdHRyKHsgJ2FyaWEtaGlkZGVuJzogJ3RydWUnIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIFB1YmxpYyBtZXRob2QgZm9yIHNlbGVjdGluZyBhIGNvbnRlbnQgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2pRdWVyeSB8IFN0cmluZ30gZWxlbSAtIGpRdWVyeSBvYmplY3Qgb3Igc3RyaW5nIG9mIHRoZSBpZCBvZiB0aGUgcGFuZSB0byBkaXNwbGF5LlxuICAgKiBAcGFyYW0ge2Jvb2xlYW59IGhpc3RvcnlIYW5kbGVkIC0gYnJvd3NlciBoYXMgYWxyZWFkeSBoYW5kbGVkIGEgaGlzdG9yeSB1cGRhdGVcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBzZWxlY3RUYWIoZWxlbSwgaGlzdG9yeUhhbmRsZWQpIHtcbiAgICB2YXIgaWRTdHI7XG5cbiAgICBpZiAodHlwZW9mIGVsZW0gPT09ICdvYmplY3QnKSB7XG4gICAgICBpZFN0ciA9IGVsZW1bMF0uaWQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlkU3RyID0gZWxlbTtcbiAgICB9XG5cbiAgICBpZiAoaWRTdHIuaW5kZXhPZignIycpIDwgMCkge1xuICAgICAgaWRTdHIgPSBgIyR7aWRTdHJ9YDtcbiAgICB9XG5cbiAgICB2YXIgJHRhcmdldCA9IHRoaXMuJHRhYlRpdGxlcy5maW5kKGBbaHJlZiQ9XCIke2lkU3RyfVwiXWApLnBhcmVudChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcblxuICAgIHRoaXMuX2hhbmRsZVRhYkNoYW5nZSgkdGFyZ2V0LCBoaXN0b3J5SGFuZGxlZCk7XG4gIH07XG4gIC8qKlxuICAgKiBTZXRzIHRoZSBoZWlnaHQgb2YgZWFjaCBwYW5lbCB0byB0aGUgaGVpZ2h0IG9mIHRoZSB0YWxsZXN0IHBhbmVsLlxuICAgKiBJZiBlbmFibGVkIGluIG9wdGlvbnMsIGdldHMgY2FsbGVkIG9uIG1lZGlhIHF1ZXJ5IGNoYW5nZS5cbiAgICogSWYgbG9hZGluZyBjb250ZW50IHZpYSBleHRlcm5hbCBzb3VyY2UsIGNhbiBiZSBjYWxsZWQgZGlyZWN0bHkgb3Igd2l0aCBfcmVmbG93LlxuICAgKiBJZiBlbmFibGVkIHdpdGggYGRhdGEtbWF0Y2gtaGVpZ2h0PVwidHJ1ZVwiYCwgdGFicyBzZXRzIHRvIGVxdWFsIGhlaWdodFxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9zZXRIZWlnaHQoKSB7XG4gICAgdmFyIG1heCA9IDAsXG4gICAgICAgIF90aGlzID0gdGhpczsgLy8gTG9jayBkb3duIHRoZSBgdGhpc2AgdmFsdWUgZm9yIHRoZSByb290IHRhYnMgb2JqZWN0XG5cbiAgICB0aGlzLiR0YWJDb250ZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLnBhbmVsQ2xhc3N9YClcbiAgICAgIC5jc3MoJ2hlaWdodCcsICcnKVxuICAgICAgLmVhY2goZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgdmFyIHBhbmVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIGlzQWN0aXZlID0gcGFuZWwuaGFzQ2xhc3MoYCR7X3RoaXMub3B0aW9ucy5wYW5lbEFjdGl2ZUNsYXNzfWApOyAvLyBnZXQgdGhlIG9wdGlvbnMgZnJvbSB0aGUgcGFyZW50IGluc3RlYWQgb2YgdHJ5aW5nIHRvIGdldCB0aGVtIGZyb20gdGhlIGNoaWxkXG5cbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgICAgIHBhbmVsLmNzcyh7J3Zpc2liaWxpdHknOiAnaGlkZGVuJywgJ2Rpc3BsYXknOiAnYmxvY2snfSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdGVtcCA9IHRoaXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkuaGVpZ2h0O1xuXG4gICAgICAgIGlmICghaXNBY3RpdmUpIHtcbiAgICAgICAgICBwYW5lbC5jc3Moe1xuICAgICAgICAgICAgJ3Zpc2liaWxpdHknOiAnJyxcbiAgICAgICAgICAgICdkaXNwbGF5JzogJydcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1heCA9IHRlbXAgPiBtYXggPyB0ZW1wIDogbWF4O1xuICAgICAgfSlcbiAgICAgIC5jc3MoJ2hlaWdodCcsIGAke21heH1weGApO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIGFuIHRhYnMuXG4gICAqIEBmaXJlcyBUYWJzI2Rlc3Ryb3llZFxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50XG4gICAgICAuZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKVxuICAgICAgLm9mZignLnpmLnRhYnMnKS5oaWRlKCkuZW5kKClcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMucGFuZWxDbGFzc31gKVxuICAgICAgLmhpZGUoKTtcblxuICAgIGlmICh0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIGlmICh0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgIT0gbnVsbCkge1xuICAgICAgICAgJCh3aW5kb3cpLm9mZignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5UYWJzLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogQWxsb3dzIHRoZSB3aW5kb3cgdG8gc2Nyb2xsIHRvIGNvbnRlbnQgb2YgcGFuZSBzcGVjaWZpZWQgYnkgaGFzaCBhbmNob3JcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rOiBmYWxzZSxcblxuICAvKipcbiAgICogQWRqdXN0IHRoZSBkZWVwIGxpbmsgc2Nyb2xsIHRvIG1ha2Ugc3VyZSB0aGUgdG9wIG9mIHRoZSB0YWIgcGFuZWwgaXMgdmlzaWJsZVxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2U6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbmltYXRpb24gdGltZSAobXMpIGZvciB0aGUgZGVlcCBsaW5rIGFkanVzdG1lbnRcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCAzMDBcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlRGVsYXk6IDMwMCxcblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBicm93c2VyIGhpc3Rvcnkgd2l0aCB0aGUgb3BlbiB0YWJcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIHVwZGF0ZUhpc3Rvcnk6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBhY3RpdmUgcGFuZSBvbiBsb2FkIGlmIHNldCB0byB0cnVlLlxuICAgKiBOb3QgcmVjb21tZW5kZWQgaWYgbW9yZSB0aGFuIG9uZSB0YWIgcGFuZWwgcGVyIHBhZ2UuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhdXRvRm9jdXM6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3Mga2V5Ym9hcmQgaW5wdXQgdG8gJ3dyYXAnIGFyb3VuZCB0aGUgdGFiIGxpbmtzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCB0cnVlXG4gICAqL1xuICB3cmFwT25LZXlzOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHRhYiBjb250ZW50IHBhbmVzIHRvIG1hdGNoIGhlaWdodHMgaWYgc2V0IHRvIHRydWUuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtYXRjaEhlaWdodDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBhY3RpdmUgdGFicyB0byBjb2xsYXBzZSB3aGVuIGNsaWNrZWQuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBhY3RpdmVDb2xsYXBzZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gYGxpYCdzIGluIHRhYiBsaW5rIGxpc3QuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ3RhYnMtdGl0bGUnXG4gICAqL1xuICBsaW5rQ2xhc3M6ICd0YWJzLXRpdGxlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYWN0aXZlIGBsaWAgaW4gdGFiIGxpbmsgbGlzdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnaXMtYWN0aXZlJ1xuICAgKi9cbiAgbGlua0FjdGl2ZUNsYXNzOiAnaXMtYWN0aXZlJyxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgY29udGVudCBjb250YWluZXJzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICd0YWJzLXBhbmVsJ1xuICAgKi9cbiAgcGFuZWxDbGFzczogJ3RhYnMtcGFuZWwnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBhY3RpdmUgY29udGVudCBjb250YWluZXIuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2lzLWFjdGl2ZSdcbiAgICovXG4gIHBhbmVsQWN0aXZlQ2xhc3M6ICdpcy1hY3RpdmUnXG59O1xuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oVGFicywgJ1RhYnMnKTtcblxufShqUXVlcnkpO1xuIiwidmFyIF9leHRlbmRzID0gT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbiAodGFyZ2V0KSB7IGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7IHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaV07IGZvciAodmFyIGtleSBpbiBzb3VyY2UpIHsgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzb3VyY2UsIGtleSkpIHsgdGFyZ2V0W2tleV0gPSBzb3VyY2Vba2V5XTsgfSB9IH0gcmV0dXJuIHRhcmdldDsgfTtcblxudmFyIF90eXBlb2YgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIFN5bWJvbC5pdGVyYXRvciA9PT0gXCJzeW1ib2xcIiA/IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIHR5cGVvZiBvYmo7IH0gOiBmdW5jdGlvbiAob2JqKSB7IHJldHVybiBvYmogJiYgdHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIG9iai5jb25zdHJ1Y3RvciA9PT0gU3ltYm9sICYmIG9iaiAhPT0gU3ltYm9sLnByb3RvdHlwZSA/IFwic3ltYm9sXCIgOiB0eXBlb2Ygb2JqOyB9O1xuXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICAgICh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAndW5kZWZpbmVkJyA6IF90eXBlb2YoZXhwb3J0cykpID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDogdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDogZ2xvYmFsLkxhenlMb2FkID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24gKCkge1xuICAgICd1c2Ugc3RyaWN0JztcblxuICAgIHZhciBkZWZhdWx0U2V0dGluZ3MgPSB7XG4gICAgICAgIGVsZW1lbnRzX3NlbGVjdG9yOiBcImltZ1wiLFxuICAgICAgICBjb250YWluZXI6IHdpbmRvdyxcbiAgICAgICAgdGhyZXNob2xkOiAzMDAsXG4gICAgICAgIHRocm90dGxlOiAxNTAsXG4gICAgICAgIGRhdGFfc3JjOiBcIm9yaWdpbmFsXCIsXG4gICAgICAgIGRhdGFfc3Jjc2V0OiBcIm9yaWdpbmFsU2V0XCIsXG4gICAgICAgIGNsYXNzX2xvYWRpbmc6IFwibG9hZGluZ1wiLFxuICAgICAgICBjbGFzc19sb2FkZWQ6IFwibG9hZGVkXCIsXG4gICAgICAgIGNsYXNzX2Vycm9yOiBcImVycm9yXCIsXG4gICAgICAgIGNsYXNzX2luaXRpYWw6IFwiaW5pdGlhbFwiLFxuICAgICAgICBza2lwX2ludmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgY2FsbGJhY2tfbG9hZDogbnVsbCxcbiAgICAgICAgY2FsbGJhY2tfZXJyb3I6IG51bGwsXG4gICAgICAgIGNhbGxiYWNrX3NldDogbnVsbCxcbiAgICAgICAgY2FsbGJhY2tfcHJvY2Vzc2VkOiBudWxsXG4gICAgfTtcblxuICAgIHZhciBpc0JvdCA9ICEoXCJvbnNjcm9sbFwiIGluIHdpbmRvdykgfHwgL2dsZWJvdC8udGVzdChuYXZpZ2F0b3IudXNlckFnZW50KTtcblxuICAgIHZhciBjYWxsQ2FsbGJhY2sgPSBmdW5jdGlvbiBjYWxsQ2FsbGJhY2soY2FsbGJhY2ssIGFyZ3VtZW50KSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2soYXJndW1lbnQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBnZXRUb3BPZmZzZXQgPSBmdW5jdGlvbiBnZXRUb3BPZmZzZXQoZWxlbWVudCkge1xuICAgICAgICByZXR1cm4gZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyB3aW5kb3cucGFnZVlPZmZzZXQgLSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQmVsb3dWaWV3cG9ydCA9IGZ1bmN0aW9uIGlzQmVsb3dWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICB2YXIgZm9sZCA9IGNvbnRhaW5lciA9PT0gd2luZG93ID8gd2luZG93LmlubmVySGVpZ2h0ICsgd2luZG93LnBhZ2VZT2Zmc2V0IDogZ2V0VG9wT2Zmc2V0KGNvbnRhaW5lcikgKyBjb250YWluZXIub2Zmc2V0SGVpZ2h0O1xuICAgICAgICByZXR1cm4gZm9sZCA8PSBnZXRUb3BPZmZzZXQoZWxlbWVudCkgLSB0aHJlc2hvbGQ7XG4gICAgfTtcblxuICAgIHZhciBnZXRMZWZ0T2Zmc2V0ID0gZnVuY3Rpb24gZ2V0TGVmdE9mZnNldChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmxlZnQgKyB3aW5kb3cucGFnZVhPZmZzZXQgLSBlbGVtZW50Lm93bmVyRG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudExlZnQ7XG4gICAgfTtcblxuICAgIHZhciBpc0F0UmlnaHRPZlZpZXdwb3J0ID0gZnVuY3Rpb24gaXNBdFJpZ2h0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICB2YXIgZG9jdW1lbnRXaWR0aCA9IHdpbmRvdy5pbm5lcldpZHRoO1xuICAgICAgICB2YXIgZm9sZCA9IGNvbnRhaW5lciA9PT0gd2luZG93ID8gZG9jdW1lbnRXaWR0aCArIHdpbmRvdy5wYWdlWE9mZnNldCA6IGdldExlZnRPZmZzZXQoY29udGFpbmVyKSArIGRvY3VtZW50V2lkdGg7XG4gICAgICAgIHJldHVybiBmb2xkIDw9IGdldExlZnRPZmZzZXQoZWxlbWVudCkgLSB0aHJlc2hvbGQ7XG4gICAgfTtcblxuICAgIHZhciBpc0Fib3ZlVmlld3BvcnQgPSBmdW5jdGlvbiBpc0Fib3ZlVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgdmFyIGZvbGQgPSBjb250YWluZXIgPT09IHdpbmRvdyA/IHdpbmRvdy5wYWdlWU9mZnNldCA6IGdldFRvcE9mZnNldChjb250YWluZXIpO1xuICAgICAgICByZXR1cm4gZm9sZCA+PSBnZXRUb3BPZmZzZXQoZWxlbWVudCkgKyB0aHJlc2hvbGQgKyBlbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQXRMZWZ0T2ZWaWV3cG9ydCA9IGZ1bmN0aW9uIGlzQXRMZWZ0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICB2YXIgZm9sZCA9IGNvbnRhaW5lciA9PT0gd2luZG93ID8gd2luZG93LnBhZ2VYT2Zmc2V0IDogZ2V0TGVmdE9mZnNldChjb250YWluZXIpO1xuICAgICAgICByZXR1cm4gZm9sZCA+PSBnZXRMZWZ0T2Zmc2V0KGVsZW1lbnQpICsgdGhyZXNob2xkICsgZWxlbWVudC5vZmZzZXRXaWR0aDtcbiAgICB9O1xuXG4gICAgdmFyIGlzSW5zaWRlVmlld3BvcnQgPSBmdW5jdGlvbiBpc0luc2lkZVZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHJldHVybiAhaXNCZWxvd1ZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSAmJiAhaXNBYm92ZVZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSAmJiAhaXNBdFJpZ2h0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkgJiYgIWlzQXRMZWZ0T2ZWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCk7XG4gICAgfTtcblxuICAgIC8qIENyZWF0ZXMgaW5zdGFuY2UgYW5kIG5vdGlmaWVzIGl0IHRocm91Z2ggdGhlIHdpbmRvdyBlbGVtZW50ICovXG4gICAgdmFyIGNyZWF0ZUluc3RhbmNlID0gZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2UoY2xhc3NPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIGluc3RhbmNlID0gbmV3IGNsYXNzT2JqKG9wdGlvbnMpO1xuICAgICAgICB2YXIgZXZlbnQgPSBuZXcgQ3VzdG9tRXZlbnQoXCJMYXp5TG9hZDo6SW5pdGlhbGl6ZWRcIiwgeyBkZXRhaWw6IHsgaW5zdGFuY2U6IGluc3RhbmNlIH0gfSk7XG4gICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbiAgICB9O1xuXG4gICAgLyogQXV0byBpbml0aWFsaXphdGlvbiBvZiBvbmUgb3IgbW9yZSBpbnN0YW5jZXMgb2YgbGF6eWxvYWQsIGRlcGVuZGluZyBvbiB0aGUgXG4gICAgICAgIG9wdGlvbnMgcGFzc2VkIGluIChwbGFpbiBvYmplY3Qgb3IgYW4gYXJyYXkpICovXG4gICAgdmFyIGF1dG9Jbml0aWFsaXplID0gZnVuY3Rpb24gYXV0b0luaXRpYWxpemUoY2xhc3NPYmosIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG9wdHNMZW5ndGggPSBvcHRpb25zLmxlbmd0aDtcbiAgICAgICAgaWYgKCFvcHRzTGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBQbGFpbiBvYmplY3RcbiAgICAgICAgICAgIGNyZWF0ZUluc3RhbmNlKGNsYXNzT2JqLCBvcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIEFycmF5IG9mIG9iamVjdHNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb3B0c0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY3JlYXRlSW5zdGFuY2UoY2xhc3NPYmosIG9wdGlvbnNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXRTb3VyY2VzRm9yUGljdHVyZSA9IGZ1bmN0aW9uIHNldFNvdXJjZXNGb3JQaWN0dXJlKGVsZW1lbnQsIHNyY3NldERhdGFBdHRyaWJ1dGUpIHtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgaWYgKHBhcmVudC50YWdOYW1lICE9PSBcIlBJQ1RVUkVcIikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFyZW50LmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGljdHVyZUNoaWxkID0gcGFyZW50LmNoaWxkcmVuW2ldO1xuICAgICAgICAgICAgaWYgKHBpY3R1cmVDaGlsZC50YWdOYW1lID09PSBcIlNPVVJDRVwiKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNvdXJjZVNyY3NldCA9IHBpY3R1cmVDaGlsZC5kYXRhc2V0W3NyY3NldERhdGFBdHRyaWJ1dGVdO1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VTcmNzZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGljdHVyZUNoaWxkLnNldEF0dHJpYnV0ZShcInNyY3NldFwiLCBzb3VyY2VTcmNzZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICB2YXIgc2V0U291cmNlcyA9IGZ1bmN0aW9uIHNldFNvdXJjZXMoZWxlbWVudCwgc3Jjc2V0RGF0YUF0dHJpYnV0ZSwgc3JjRGF0YUF0dHJpYnV0ZSkge1xuICAgICAgICB2YXIgdGFnTmFtZSA9IGVsZW1lbnQudGFnTmFtZTtcbiAgICAgICAgdmFyIGVsZW1lbnRTcmMgPSBlbGVtZW50LmRhdGFzZXRbc3JjRGF0YUF0dHJpYnV0ZV07XG4gICAgICAgIGlmICh0YWdOYW1lID09PSBcIklNR1wiKSB7XG4gICAgICAgICAgICBzZXRTb3VyY2VzRm9yUGljdHVyZShlbGVtZW50LCBzcmNzZXREYXRhQXR0cmlidXRlKTtcbiAgICAgICAgICAgIHZhciBpbWdTcmNzZXQgPSBlbGVtZW50LmRhdGFzZXRbc3Jjc2V0RGF0YUF0dHJpYnV0ZV07XG4gICAgICAgICAgICBpZiAoaW1nU3Jjc2V0KSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzcmNzZXRcIiwgaW1nU3Jjc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChlbGVtZW50U3JjKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgZWxlbWVudFNyYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRhZ05hbWUgPT09IFwiSUZSQU1FXCIpIHtcbiAgICAgICAgICAgIGlmIChlbGVtZW50U3JjKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgZWxlbWVudFNyYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVsZW1lbnRTcmMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJ1cmwoXCIgKyBlbGVtZW50U3JjICsgXCIpXCI7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLypcbiAgICAgKiBDb25zdHJ1Y3RvclxuICAgICAqL1xuXG4gICAgdmFyIExhenlMb2FkID0gZnVuY3Rpb24gTGF6eUxvYWQoaW5zdGFuY2VTZXR0aW5ncykge1xuICAgICAgICB0aGlzLl9zZXR0aW5ncyA9IF9leHRlbmRzKHt9LCBkZWZhdWx0U2V0dGluZ3MsIGluc3RhbmNlU2V0dGluZ3MpO1xuICAgICAgICB0aGlzLl9xdWVyeU9yaWdpbk5vZGUgPSB0aGlzLl9zZXR0aW5ncy5jb250YWluZXIgPT09IHdpbmRvdyA/IGRvY3VtZW50IDogdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyO1xuXG4gICAgICAgIHRoaXMuX3ByZXZpb3VzTG9vcFRpbWUgPSAwO1xuICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsID0gdGhpcy5oYW5kbGVTY3JvbGwuYmluZCh0aGlzKTtcblxuICAgICAgICB0aGlzLl9pc0ZpcnN0TG9vcCA9IHRydWU7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKTtcbiAgICAgICAgdGhpcy51cGRhdGUoKTtcbiAgICB9O1xuXG4gICAgTGF6eUxvYWQucHJvdG90eXBlID0ge1xuXG4gICAgICAgIC8qXG4gICAgICAgICAqIFByaXZhdGUgbWV0aG9kc1xuICAgICAgICAgKi9cblxuICAgICAgICBfcmV2ZWFsOiBmdW5jdGlvbiBfcmV2ZWFsKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuX3NldHRpbmdzO1xuXG4gICAgICAgICAgICB2YXIgZXJyb3JDYWxsYmFjayA9IGZ1bmN0aW9uIGVycm9yQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgLyogQXMgdGhpcyBtZXRob2QgaXMgYXN5bmNocm9ub3VzLCBpdCBtdXN0IGJlIHByb3RlY3RlZCBhZ2FpbnN0IGV4dGVybmFsIGRlc3Ryb3koKSBjYWxscyAqL1xuICAgICAgICAgICAgICAgIGlmICghc2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGxvYWRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHNldHRpbmdzLmNsYXNzX2xvYWRpbmcpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc19lcnJvcik7XG4gICAgICAgICAgICAgICAgY2FsbENhbGxiYWNrKHNldHRpbmdzLmNhbGxiYWNrX2Vycm9yLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBsb2FkQ2FsbGJhY2sgPSBmdW5jdGlvbiBsb2FkQ2FsbGJhY2soKSB7XG4gICAgICAgICAgICAgICAgLyogQXMgdGhpcyBtZXRob2QgaXMgYXN5bmNocm9ub3VzLCBpdCBtdXN0IGJlIHByb3RlY3RlZCBhZ2FpbnN0IGV4dGVybmFsIGRlc3Ryb3koKSBjYWxscyAqL1xuICAgICAgICAgICAgICAgIGlmICghc2V0dGluZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoc2V0dGluZ3MuY2xhc3NfbG9hZGluZyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzX2xvYWRlZCk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLCBsb2FkQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIC8qIENhbGxpbmcgTE9BRCBjYWxsYmFjayAqL1xuICAgICAgICAgICAgICAgIGNhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19sb2FkLCBlbGVtZW50KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChlbGVtZW50LnRhZ05hbWUgPT09IFwiSU1HXCIgfHwgZWxlbWVudC50YWdOYW1lID09PSBcIklGUkFNRVwiKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLCBsb2FkQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsIGVycm9yQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc19sb2FkaW5nKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2V0U291cmNlcyhlbGVtZW50LCBzZXR0aW5ncy5kYXRhX3NyY3NldCwgc2V0dGluZ3MuZGF0YV9zcmMpO1xuICAgICAgICAgICAgLyogQ2FsbGluZyBTRVQgY2FsbGJhY2sgKi9cbiAgICAgICAgICAgIGNhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19zZXQsIGVsZW1lbnQpO1xuICAgICAgICB9LFxuXG4gICAgICAgIF9sb29wVGhyb3VnaEVsZW1lbnRzOiBmdW5jdGlvbiBfbG9vcFRocm91Z2hFbGVtZW50cygpIHtcbiAgICAgICAgICAgIHZhciBzZXR0aW5ncyA9IHRoaXMuX3NldHRpbmdzLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzID0gdGhpcy5fZWxlbWVudHMsXG4gICAgICAgICAgICAgICAgZWxlbWVudHNMZW5ndGggPSAhZWxlbWVudHMgPyAwIDogZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGkgPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgcHJvY2Vzc2VkSW5kZXhlcyA9IFtdLFxuICAgICAgICAgICAgICAgIGZpcnN0TG9vcCA9IHRoaXMuX2lzRmlyc3RMb29wO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZWxlbWVudHNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgLyogSWYgbXVzdCBza2lwX2ludmlzaWJsZSBhbmQgZWxlbWVudCBpcyBpbnZpc2libGUsIHNraXAgaXQgKi9cbiAgICAgICAgICAgICAgICBpZiAoc2V0dGluZ3Muc2tpcF9pbnZpc2libGUgJiYgZWxlbWVudC5vZmZzZXRQYXJlbnQgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKGlzQm90IHx8IGlzSW5zaWRlVmlld3BvcnQoZWxlbWVudCwgc2V0dGluZ3MuY29udGFpbmVyLCBzZXR0aW5ncy50aHJlc2hvbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaXJzdExvb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChzZXR0aW5ncy5jbGFzc19pbml0aWFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvKiBTdGFydCBsb2FkaW5nIHRoZSBpbWFnZSAqL1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9yZXZlYWwoZWxlbWVudCk7XG4gICAgICAgICAgICAgICAgICAgIC8qIE1hcmtpbmcgdGhlIGVsZW1lbnQgYXMgcHJvY2Vzc2VkLiAqL1xuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzZWRJbmRleGVzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuZGF0YXNldC53YXNQcm9jZXNzZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIFJlbW92aW5nIHByb2Nlc3NlZCBlbGVtZW50cyBmcm9tIHRoaXMuX2VsZW1lbnRzLiAqL1xuICAgICAgICAgICAgd2hpbGUgKHByb2Nlc3NlZEluZGV4ZXMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIGVsZW1lbnRzLnNwbGljZShwcm9jZXNzZWRJbmRleGVzLnBvcCgpLCAxKTtcbiAgICAgICAgICAgICAgICAvKiBDYWxsaW5nIHRoZSBlbmQgbG9vcCBjYWxsYmFjayAqL1xuICAgICAgICAgICAgICAgIGNhbGxDYWxsYmFjayhzZXR0aW5ncy5jYWxsYmFja19wcm9jZXNzZWQsIGVsZW1lbnRzLmxlbmd0aCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBTdG9wIGxpc3RlbmluZyB0byBzY3JvbGwgZXZlbnQgd2hlbiAwIGVsZW1lbnRzIHJlbWFpbnMgKi9cbiAgICAgICAgICAgIGlmIChlbGVtZW50c0xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX3N0b3BTY3JvbGxIYW5kbGVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBTZXRzIGlzRmlyc3RMb29wIHRvIGZhbHNlICovXG4gICAgICAgICAgICBpZiAoZmlyc3RMb29wKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNGaXJzdExvb3AgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfcHVyZ2VFbGVtZW50czogZnVuY3Rpb24gX3B1cmdlRWxlbWVudHMoKSB7XG4gICAgICAgICAgICB2YXIgZWxlbWVudHMgPSB0aGlzLl9lbGVtZW50cyxcbiAgICAgICAgICAgICAgICBlbGVtZW50c0xlbmd0aCA9IGVsZW1lbnRzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBpID0gdm9pZCAwLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzVG9QdXJnZSA9IFtdO1xuXG4gICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZWxlbWVudHNMZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gZWxlbWVudHNbaV07XG4gICAgICAgICAgICAgICAgLyogSWYgdGhlIGVsZW1lbnQgaGFzIGFscmVhZHkgYmVlbiBwcm9jZXNzZWQsIHNraXAgaXQgKi9cbiAgICAgICAgICAgICAgICBpZiAoZWxlbWVudC5kYXRhc2V0Lndhc1Byb2Nlc3NlZCkge1xuICAgICAgICAgICAgICAgICAgICBlbGVtZW50c1RvUHVyZ2UucHVzaChpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKiBSZW1vdmluZyBlbGVtZW50cyB0byBwdXJnZSBmcm9tIHRoaXMuX2VsZW1lbnRzLiAqL1xuICAgICAgICAgICAgd2hpbGUgKGVsZW1lbnRzVG9QdXJnZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuc3BsaWNlKGVsZW1lbnRzVG9QdXJnZS5wb3AoKSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgX3N0YXJ0U2Nyb2xsSGFuZGxlcjogZnVuY3Rpb24gX3N0YXJ0U2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5faXNIYW5kbGluZ1Njcm9sbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2lzSGFuZGxpbmdTY3JvbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lci5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfc3RvcFNjcm9sbEhhbmRsZXI6IGZ1bmN0aW9uIF9zdG9wU2Nyb2xsSGFuZGxlcigpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNIYW5kbGluZ1Njcm9sbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lci5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICAvKiBcbiAgICAgICAgICogUHVibGljIG1ldGhvZHNcbiAgICAgICAgICovXG5cbiAgICAgICAgaGFuZGxlU2Nyb2xsOiBmdW5jdGlvbiBoYW5kbGVTY3JvbGwoKSB7XG4gICAgICAgICAgICB2YXIgdGhyb3R0bGUgPSB0aGlzLl9zZXR0aW5ncy50aHJvdHRsZTtcblxuICAgICAgICAgICAgaWYgKHRocm90dGxlICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdldFRpbWUgPSBmdW5jdGlvbiBnZXRUaW1lKCkge1xuICAgICAgICAgICAgICAgICAgICBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHZhciBub3cgPSBnZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJlbWFpbmluZ1RpbWUgPSB0aHJvdHRsZSAtIChub3cgLSB0aGlzLl9wcmV2aW91c0xvb3BUaW1lKTtcbiAgICAgICAgICAgICAgICBpZiAocmVtYWluaW5nVGltZSA8PSAwIHx8IHJlbWFpbmluZ1RpbWUgPiB0aHJvdHRsZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fbG9vcFRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9sb29wVGltZW91dCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fcHJldmlvdXNMb29wVGltZSA9IG5vdztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuX2xvb3BUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaW1lb3V0ID0gc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcmV2aW91c0xvb3BUaW1lID0gZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgICAgICAgICB9LmJpbmQodGhpcyksIHJlbWFpbmluZ1RpbWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHVwZGF0ZTogZnVuY3Rpb24gdXBkYXRlKCkge1xuICAgICAgICAgICAgLy8gQ29udmVydHMgdG8gYXJyYXkgdGhlIG5vZGVzZXQgb2J0YWluZWQgcXVlcnlpbmcgdGhlIERPTSBmcm9tIF9xdWVyeU9yaWdpbk5vZGUgd2l0aCBlbGVtZW50c19zZWxlY3RvclxuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9xdWVyeU9yaWdpbk5vZGUucXVlcnlTZWxlY3RvckFsbCh0aGlzLl9zZXR0aW5ncy5lbGVtZW50c19zZWxlY3RvcikpO1xuICAgICAgICAgICAgdGhpcy5fcHVyZ2VFbGVtZW50cygpO1xuICAgICAgICAgICAgdGhpcy5fbG9vcFRocm91Z2hFbGVtZW50cygpO1xuICAgICAgICAgICAgdGhpcy5fc3RhcnRTY3JvbGxIYW5kbGVyKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsIHRoaXMuX2JvdW5kSGFuZGxlU2Nyb2xsKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sb29wVGltZW91dCkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9sb29wVGltZW91dCk7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5fc3RvcFNjcm9sbEhhbmRsZXIoKTtcbiAgICAgICAgICAgIHRoaXMuX2VsZW1lbnRzID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZSA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLl9zZXR0aW5ncyA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogQXV0b21hdGljIGluc3RhbmNlcyBjcmVhdGlvbiBpZiByZXF1aXJlZCAodXNlZnVsIGZvciBhc3luYyBzY3JpcHQgbG9hZGluZyEpICovXG4gICAgdmFyIGF1dG9Jbml0T3B0aW9ucyA9IHdpbmRvdy5sYXp5TG9hZE9wdGlvbnM7XG4gICAgaWYgKGF1dG9Jbml0T3B0aW9ucykge1xuICAgICAgICBhdXRvSW5pdGlhbGl6ZShMYXp5TG9hZCwgYXV0b0luaXRPcHRpb25zKTtcbiAgICB9XG5cbiAgICByZXR1cm4gTGF6eUxvYWQ7XG59KTtcbiIsIi8qIVxuICogRmxpY2tpdHkgUEFDS0FHRUQgdjIuMC41XG4gKiBUb3VjaCwgcmVzcG9uc2l2ZSwgZmxpY2thYmxlIGNhcm91c2Vsc1xuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIEZsaWNraXR5IENvbW1lcmNpYWwgTGljZW5zZSBmb3IgY29tbWVyY2lhbCB1c2VcbiAqXG4gKiBodHRwOi8vZmxpY2tpdHkubWV0YWZpenp5LmNvXG4gKiBDb3B5cmlnaHQgMjAxNiBNZXRhZml6enlcbiAqL1xuXG4hZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwianF1ZXJ5LWJyaWRnZXQvanF1ZXJ5LWJyaWRnZXRcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwianF1ZXJ5XCIpKTp0LmpRdWVyeUJyaWRnZXQ9ZSh0LHQualF1ZXJ5KX0od2luZG93LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gaShpLG8sYSl7ZnVuY3Rpb24gbCh0LGUsbil7dmFyIHMsbz1cIiQoKS5cIitpKycoXCInK2UrJ1wiKSc7cmV0dXJuIHQuZWFjaChmdW5jdGlvbih0LGwpe3ZhciBoPWEuZGF0YShsLGkpO2lmKCFoKXJldHVybiB2b2lkIHIoaStcIiBub3QgaW5pdGlhbGl6ZWQuIENhbm5vdCBjYWxsIG1ldGhvZHMsIGkuZS4gXCIrbyk7dmFyIGM9aFtlXTtpZighY3x8XCJfXCI9PWUuY2hhckF0KDApKXJldHVybiB2b2lkIHIobytcIiBpcyBub3QgYSB2YWxpZCBtZXRob2RcIik7dmFyIGQ9Yy5hcHBseShoLG4pO3M9dm9pZCAwPT09cz9kOnN9KSx2b2lkIDAhPT1zP3M6dH1mdW5jdGlvbiBoKHQsZSl7dC5lYWNoKGZ1bmN0aW9uKHQsbil7dmFyIHM9YS5kYXRhKG4saSk7cz8ocy5vcHRpb24oZSkscy5faW5pdCgpKToocz1uZXcgbyhuLGUpLGEuZGF0YShuLGkscykpfSl9YT1hfHxlfHx0LmpRdWVyeSxhJiYoby5wcm90b3R5cGUub3B0aW9ufHwoby5wcm90b3R5cGUub3B0aW9uPWZ1bmN0aW9uKHQpe2EuaXNQbGFpbk9iamVjdCh0KSYmKHRoaXMub3B0aW9ucz1hLmV4dGVuZCghMCx0aGlzLm9wdGlvbnMsdCkpfSksYS5mbltpXT1mdW5jdGlvbih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdCl7dmFyIGU9cy5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gbCh0aGlzLHQsZSl9cmV0dXJuIGgodGhpcyx0KSx0aGlzfSxuKGEpKX1mdW5jdGlvbiBuKHQpeyF0fHx0JiZ0LmJyaWRnZXR8fCh0LmJyaWRnZXQ9aSl9dmFyIHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLG89dC5jb25zb2xlLHI9XCJ1bmRlZmluZWRcIj09dHlwZW9mIG8/ZnVuY3Rpb24oKXt9OmZ1bmN0aW9uKHQpe28uZXJyb3IodCl9O3JldHVybiBuKGV8fHQualF1ZXJ5KSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQuRXZFbWl0dGVyPWUoKX0oXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dGhpcyxmdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt9dmFyIGU9dC5wcm90b3R5cGU7cmV0dXJuIGUub249ZnVuY3Rpb24odCxlKXtpZih0JiZlKXt2YXIgaT10aGlzLl9ldmVudHM9dGhpcy5fZXZlbnRzfHx7fSxuPWlbdF09aVt0XXx8W107cmV0dXJuIG4uaW5kZXhPZihlKT09LTEmJm4ucHVzaChlKSx0aGlzfX0sZS5vbmNlPWZ1bmN0aW9uKHQsZSl7aWYodCYmZSl7dGhpcy5vbih0LGUpO3ZhciBpPXRoaXMuX29uY2VFdmVudHM9dGhpcy5fb25jZUV2ZW50c3x8e30sbj1pW3RdPWlbdF18fHt9O3JldHVybiBuW2VdPSEwLHRoaXN9fSxlLm9mZj1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2V2ZW50cyYmdGhpcy5fZXZlbnRzW3RdO2lmKGkmJmkubGVuZ3RoKXt2YXIgbj1pLmluZGV4T2YoZSk7cmV0dXJuIG4hPS0xJiZpLnNwbGljZShuLDEpLHRoaXN9fSxlLmVtaXRFdmVudD1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2V2ZW50cyYmdGhpcy5fZXZlbnRzW3RdO2lmKGkmJmkubGVuZ3RoKXt2YXIgbj0wLHM9aVtuXTtlPWV8fFtdO2Zvcih2YXIgbz10aGlzLl9vbmNlRXZlbnRzJiZ0aGlzLl9vbmNlRXZlbnRzW3RdO3M7KXt2YXIgcj1vJiZvW3NdO3ImJih0aGlzLm9mZih0LHMpLGRlbGV0ZSBvW3NdKSxzLmFwcGx5KHRoaXMsZSksbis9cj8wOjEscz1pW25dfXJldHVybiB0aGlzfX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImdldC1zaXplL2dldC1zaXplXCIsW10sZnVuY3Rpb24oKXtyZXR1cm4gZSgpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQuZ2V0U2l6ZT1lKCl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dmFyIGU9cGFyc2VGbG9hdCh0KSxpPXQuaW5kZXhPZihcIiVcIik9PS0xJiYhaXNOYU4oZSk7cmV0dXJuIGkmJmV9ZnVuY3Rpb24gZSgpe31mdW5jdGlvbiBpKCl7Zm9yKHZhciB0PXt3aWR0aDowLGhlaWdodDowLGlubmVyV2lkdGg6MCxpbm5lckhlaWdodDowLG91dGVyV2lkdGg6MCxvdXRlckhlaWdodDowfSxlPTA7ZTxoO2UrKyl7dmFyIGk9bFtlXTt0W2ldPTB9cmV0dXJuIHR9ZnVuY3Rpb24gbih0KXt2YXIgZT1nZXRDb21wdXRlZFN0eWxlKHQpO3JldHVybiBlfHxhKFwiU3R5bGUgcmV0dXJuZWQgXCIrZStcIi4gQXJlIHlvdSBydW5uaW5nIHRoaXMgY29kZSBpbiBhIGhpZGRlbiBpZnJhbWUgb24gRmlyZWZveD8gU2VlIGh0dHA6Ly9iaXQubHkvZ2V0c2l6ZWJ1ZzFcIiksZX1mdW5jdGlvbiBzKCl7aWYoIWMpe2M9ITA7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtlLnN0eWxlLndpZHRoPVwiMjAwcHhcIixlLnN0eWxlLnBhZGRpbmc9XCIxcHggMnB4IDNweCA0cHhcIixlLnN0eWxlLmJvcmRlclN0eWxlPVwic29saWRcIixlLnN0eWxlLmJvcmRlcldpZHRoPVwiMXB4IDJweCAzcHggNHB4XCIsZS5zdHlsZS5ib3hTaXppbmc9XCJib3JkZXItYm94XCI7dmFyIGk9ZG9jdW1lbnQuYm9keXx8ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50O2kuYXBwZW5kQ2hpbGQoZSk7dmFyIHM9bihlKTtvLmlzQm94U2l6ZU91dGVyPXI9MjAwPT10KHMud2lkdGgpLGkucmVtb3ZlQ2hpbGQoZSl9fWZ1bmN0aW9uIG8oZSl7aWYocygpLFwic3RyaW5nXCI9PXR5cGVvZiBlJiYoZT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yKGUpKSxlJiZcIm9iamVjdFwiPT10eXBlb2YgZSYmZS5ub2RlVHlwZSl7dmFyIG89bihlKTtpZihcIm5vbmVcIj09by5kaXNwbGF5KXJldHVybiBpKCk7dmFyIGE9e307YS53aWR0aD1lLm9mZnNldFdpZHRoLGEuaGVpZ2h0PWUub2Zmc2V0SGVpZ2h0O2Zvcih2YXIgYz1hLmlzQm9yZGVyQm94PVwiYm9yZGVyLWJveFwiPT1vLmJveFNpemluZyxkPTA7ZDxoO2QrKyl7dmFyIHU9bFtkXSxmPW9bdV0scD1wYXJzZUZsb2F0KGYpO2FbdV09aXNOYU4ocCk/MDpwfXZhciB2PWEucGFkZGluZ0xlZnQrYS5wYWRkaW5nUmlnaHQsZz1hLnBhZGRpbmdUb3ArYS5wYWRkaW5nQm90dG9tLG09YS5tYXJnaW5MZWZ0K2EubWFyZ2luUmlnaHQseT1hLm1hcmdpblRvcCthLm1hcmdpbkJvdHRvbSxTPWEuYm9yZGVyTGVmdFdpZHRoK2EuYm9yZGVyUmlnaHRXaWR0aCxFPWEuYm9yZGVyVG9wV2lkdGgrYS5ib3JkZXJCb3R0b21XaWR0aCxiPWMmJnIseD10KG8ud2lkdGgpO3ghPT0hMSYmKGEud2lkdGg9eCsoYj8wOnYrUykpO3ZhciBDPXQoby5oZWlnaHQpO3JldHVybiBDIT09ITEmJihhLmhlaWdodD1DKyhiPzA6ZytFKSksYS5pbm5lcldpZHRoPWEud2lkdGgtKHYrUyksYS5pbm5lckhlaWdodD1hLmhlaWdodC0oZytFKSxhLm91dGVyV2lkdGg9YS53aWR0aCttLGEub3V0ZXJIZWlnaHQ9YS5oZWlnaHQreSxhfX12YXIgcixhPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBjb25zb2xlP2U6ZnVuY3Rpb24odCl7Y29uc29sZS5lcnJvcih0KX0sbD1bXCJwYWRkaW5nTGVmdFwiLFwicGFkZGluZ1JpZ2h0XCIsXCJwYWRkaW5nVG9wXCIsXCJwYWRkaW5nQm90dG9tXCIsXCJtYXJnaW5MZWZ0XCIsXCJtYXJnaW5SaWdodFwiLFwibWFyZ2luVG9wXCIsXCJtYXJnaW5Cb3R0b21cIixcImJvcmRlckxlZnRXaWR0aFwiLFwiYm9yZGVyUmlnaHRXaWR0aFwiLFwiYm9yZGVyVG9wV2lkdGhcIixcImJvcmRlckJvdHRvbVdpZHRoXCJdLGg9bC5sZW5ndGgsYz0hMTtyZXR1cm4gb30pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvclwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0Lm1hdGNoZXNTZWxlY3Rvcj1lKCl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciB0PWZ1bmN0aW9uKCl7dmFyIHQ9RWxlbWVudC5wcm90b3R5cGU7aWYodC5tYXRjaGVzKXJldHVyblwibWF0Y2hlc1wiO2lmKHQubWF0Y2hlc1NlbGVjdG9yKXJldHVyblwibWF0Y2hlc1NlbGVjdG9yXCI7Zm9yKHZhciBlPVtcIndlYmtpdFwiLFwibW96XCIsXCJtc1wiLFwib1wiXSxpPTA7aTxlLmxlbmd0aDtpKyspe3ZhciBuPWVbaV0scz1uK1wiTWF0Y2hlc1NlbGVjdG9yXCI7aWYodFtzXSlyZXR1cm4gc319KCk7cmV0dXJuIGZ1bmN0aW9uKGUsaSl7cmV0dXJuIGVbdF0oaSl9fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZml6enktdWktdXRpbHMvdXRpbHNcIixbXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3JcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3RvclwiKSk6dC5maXp6eVVJVXRpbHM9ZSh0LHQubWF0Y2hlc1NlbGVjdG9yKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7dmFyIGk9e307aS5leHRlbmQ9ZnVuY3Rpb24odCxlKXtmb3IodmFyIGkgaW4gZSl0W2ldPWVbaV07cmV0dXJuIHR9LGkubW9kdWxvPWZ1bmN0aW9uKHQsZSl7cmV0dXJuKHQlZStlKSVlfSxpLm1ha2VBcnJheT1mdW5jdGlvbih0KXt2YXIgZT1bXTtpZihBcnJheS5pc0FycmF5KHQpKWU9dDtlbHNlIGlmKHQmJlwibnVtYmVyXCI9PXR5cGVvZiB0Lmxlbmd0aClmb3IodmFyIGk9MDtpPHQubGVuZ3RoO2krKyllLnB1c2godFtpXSk7ZWxzZSBlLnB1c2godCk7cmV0dXJuIGV9LGkucmVtb3ZlRnJvbT1mdW5jdGlvbih0LGUpe3ZhciBpPXQuaW5kZXhPZihlKTtpIT0tMSYmdC5zcGxpY2UoaSwxKX0saS5nZXRQYXJlbnQ9ZnVuY3Rpb24odCxpKXtmb3IoO3QhPWRvY3VtZW50LmJvZHk7KWlmKHQ9dC5wYXJlbnROb2RlLGUodCxpKSlyZXR1cm4gdH0saS5nZXRRdWVyeUVsZW1lbnQ9ZnVuY3Rpb24odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQ/ZG9jdW1lbnQucXVlcnlTZWxlY3Rvcih0KTp0fSxpLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0saS5maWx0ZXJGaW5kRWxlbWVudHM9ZnVuY3Rpb24odCxuKXt0PWkubWFrZUFycmF5KHQpO3ZhciBzPVtdO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7aWYodCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KXtpZighbilyZXR1cm4gdm9pZCBzLnB1c2godCk7ZSh0LG4pJiZzLnB1c2godCk7Zm9yKHZhciBpPXQucXVlcnlTZWxlY3RvckFsbChuKSxvPTA7bzxpLmxlbmd0aDtvKyspcy5wdXNoKGlbb10pfX0pLHN9LGkuZGVib3VuY2VNZXRob2Q9ZnVuY3Rpb24odCxlLGkpe3ZhciBuPXQucHJvdG90eXBlW2VdLHM9ZStcIlRpbWVvdXRcIjt0LnByb3RvdHlwZVtlXT1mdW5jdGlvbigpe3ZhciB0PXRoaXNbc107dCYmY2xlYXJUaW1lb3V0KHQpO3ZhciBlPWFyZ3VtZW50cyxvPXRoaXM7dGhpc1tzXT1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7bi5hcHBseShvLGUpLGRlbGV0ZSBvW3NdfSxpfHwxMDApfX0saS5kb2NSZWFkeT1mdW5jdGlvbih0KXt2YXIgZT1kb2N1bWVudC5yZWFkeVN0YXRlO1wiY29tcGxldGVcIj09ZXx8XCJpbnRlcmFjdGl2ZVwiPT1lP3NldFRpbWVvdXQodCk6ZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIix0KX0saS50b0Rhc2hlZD1mdW5jdGlvbih0KXtyZXR1cm4gdC5yZXBsYWNlKC8oLikoW0EtWl0pL2csZnVuY3Rpb24odCxlLGkpe3JldHVybiBlK1wiLVwiK2l9KS50b0xvd2VyQ2FzZSgpfTt2YXIgbj10LmNvbnNvbGU7cmV0dXJuIGkuaHRtbEluaXQ9ZnVuY3Rpb24oZSxzKXtpLmRvY1JlYWR5KGZ1bmN0aW9uKCl7dmFyIG89aS50b0Rhc2hlZChzKSxyPVwiZGF0YS1cIitvLGE9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltcIityK1wiXVwiKSxsPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuanMtXCIrbyksaD1pLm1ha2VBcnJheShhKS5jb25jYXQoaS5tYWtlQXJyYXkobCkpLGM9citcIi1vcHRpb25zXCIsZD10LmpRdWVyeTtoLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGksbz10LmdldEF0dHJpYnV0ZShyKXx8dC5nZXRBdHRyaWJ1dGUoYyk7dHJ5e2k9byYmSlNPTi5wYXJzZShvKX1jYXRjaChhKXtyZXR1cm4gdm9pZChuJiZuLmVycm9yKFwiRXJyb3IgcGFyc2luZyBcIityK1wiIG9uIFwiK3QuY2xhc3NOYW1lK1wiOiBcIithKSl9dmFyIGw9bmV3IGUodCxpKTtkJiZkLmRhdGEodCxzLGwpfSl9KX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2NlbGxcIixbXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJnZXQtc2l6ZVwiKSk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5DZWxsPWUodCx0LmdldFNpemUpKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUpe3RoaXMuZWxlbWVudD10LHRoaXMucGFyZW50PWUsdGhpcy5jcmVhdGUoKX12YXIgbj1pLnByb3RvdHlwZTtyZXR1cm4gbi5jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb249XCJhYnNvbHV0ZVwiLHRoaXMueD0wLHRoaXMuc2hpZnQ9MH0sbi5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uPVwiXCI7dmFyIHQ9dGhpcy5wYXJlbnQub3JpZ2luU2lkZTt0aGlzLmVsZW1lbnQuc3R5bGVbdF09XCJcIn0sbi5nZXRTaXplPWZ1bmN0aW9uKCl7dGhpcy5zaXplPWUodGhpcy5lbGVtZW50KX0sbi5zZXRQb3NpdGlvbj1mdW5jdGlvbih0KXt0aGlzLng9dCx0aGlzLnVwZGF0ZVRhcmdldCgpLHRoaXMucmVuZGVyUG9zaXRpb24odCl9LG4udXBkYXRlVGFyZ2V0PW4uc2V0RGVmYXVsdFRhcmdldD1mdW5jdGlvbigpe3ZhciB0PVwibGVmdFwiPT10aGlzLnBhcmVudC5vcmlnaW5TaWRlP1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIjt0aGlzLnRhcmdldD10aGlzLngrdGhpcy5zaXplW3RdK3RoaXMuc2l6ZS53aWR0aCp0aGlzLnBhcmVudC5jZWxsQWxpZ259LG4ucmVuZGVyUG9zaXRpb249ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5wYXJlbnQub3JpZ2luU2lkZTt0aGlzLmVsZW1lbnQuc3R5bGVbZV09dGhpcy5wYXJlbnQuZ2V0UG9zaXRpb25WYWx1ZSh0KX0sbi53cmFwU2hpZnQ9ZnVuY3Rpb24odCl7dGhpcy5zaGlmdD10LHRoaXMucmVuZGVyUG9zaXRpb24odGhpcy54K3RoaXMucGFyZW50LnNsaWRlYWJsZVdpZHRoKnQpfSxuLnJlbW92ZT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9zbGlkZVwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LlNsaWRlPWUoKSl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dGhpcy5wYXJlbnQ9dCx0aGlzLmlzT3JpZ2luTGVmdD1cImxlZnRcIj09dC5vcmlnaW5TaWRlLHRoaXMuY2VsbHM9W10sdGhpcy5vdXRlcldpZHRoPTAsdGhpcy5oZWlnaHQ9MH12YXIgZT10LnByb3RvdHlwZTtyZXR1cm4gZS5hZGRDZWxsPWZ1bmN0aW9uKHQpe2lmKHRoaXMuY2VsbHMucHVzaCh0KSx0aGlzLm91dGVyV2lkdGgrPXQuc2l6ZS5vdXRlcldpZHRoLHRoaXMuaGVpZ2h0PU1hdGgubWF4KHQuc2l6ZS5vdXRlckhlaWdodCx0aGlzLmhlaWdodCksMT09dGhpcy5jZWxscy5sZW5ndGgpe3RoaXMueD10Lng7dmFyIGU9dGhpcy5pc09yaWdpbkxlZnQ/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiO3RoaXMuZmlyc3RNYXJnaW49dC5zaXplW2VdfX0sZS51cGRhdGVUYXJnZXQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmlzT3JpZ2luTGVmdD9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsZT10aGlzLmdldExhc3RDZWxsKCksaT1lP2Uuc2l6ZVt0XTowLG49dGhpcy5vdXRlcldpZHRoLSh0aGlzLmZpcnN0TWFyZ2luK2kpO3RoaXMudGFyZ2V0PXRoaXMueCt0aGlzLmZpcnN0TWFyZ2luK24qdGhpcy5wYXJlbnQuY2VsbEFsaWdufSxlLmdldExhc3RDZWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHNbdGhpcy5jZWxscy5sZW5ndGgtMV19LGUuc2VsZWN0PWZ1bmN0aW9uKCl7dGhpcy5jaGFuZ2VTZWxlY3RlZENsYXNzKFwiYWRkXCIpfSxlLnVuc2VsZWN0PWZ1bmN0aW9uKCl7dGhpcy5jaGFuZ2VTZWxlY3RlZENsYXNzKFwicmVtb3ZlXCIpfSxlLmNoYW5nZVNlbGVjdGVkQ2xhc3M9ZnVuY3Rpb24odCl7dGhpcy5jZWxscy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UuZWxlbWVudC5jbGFzc0xpc3RbdF0oXCJpcy1zZWxlY3RlZFwiKX0pfSxlLmdldENlbGxFbGVtZW50cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSl9LHR9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9hbmltYXRlXCIsW1wiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuYW5pbWF0ZVByb3RvdHlwZT1lKHQsdC5maXp6eVVJVXRpbHMpKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fHQud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lLG49MDtpfHwoaT1mdW5jdGlvbih0KXt2YXIgZT0obmV3IERhdGUpLmdldFRpbWUoKSxpPU1hdGgubWF4KDAsMTYtKGUtbikpLHM9c2V0VGltZW91dCh0LGkpO3JldHVybiBuPWUraSxzfSk7dmFyIHM9e307cy5zdGFydEFuaW1hdGlvbj1mdW5jdGlvbigpe3RoaXMuaXNBbmltYXRpbmd8fCh0aGlzLmlzQW5pbWF0aW5nPSEwLHRoaXMucmVzdGluZ0ZyYW1lcz0wLHRoaXMuYW5pbWF0ZSgpKX0scy5hbmltYXRlPWZ1bmN0aW9uKCl7dGhpcy5hcHBseURyYWdGb3JjZSgpLHRoaXMuYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb24oKTt2YXIgdD10aGlzLng7aWYodGhpcy5pbnRlZ3JhdGVQaHlzaWNzKCksdGhpcy5wb3NpdGlvblNsaWRlcigpLHRoaXMuc2V0dGxlKHQpLHRoaXMuaXNBbmltYXRpbmcpe3ZhciBlPXRoaXM7aShmdW5jdGlvbigpe2UuYW5pbWF0ZSgpfSl9fTt2YXIgbz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdC50cmFuc2Zvcm0/XCJ0cmFuc2Zvcm1cIjpcIldlYmtpdFRyYW5zZm9ybVwifSgpO3JldHVybiBzLnBvc2l0aW9uU2xpZGVyPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy54O3RoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLmNlbGxzLmxlbmd0aD4xJiYodD1lLm1vZHVsbyh0LHRoaXMuc2xpZGVhYmxlV2lkdGgpLHQtPXRoaXMuc2xpZGVhYmxlV2lkdGgsdGhpcy5zaGlmdFdyYXBDZWxscyh0KSksdCs9dGhpcy5jdXJzb3JQb3NpdGlvbix0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCYmbz8tdDp0O3ZhciBpPXRoaXMuZ2V0UG9zaXRpb25WYWx1ZSh0KTt0aGlzLnNsaWRlci5zdHlsZVtvXT10aGlzLmlzQW5pbWF0aW5nP1widHJhbnNsYXRlM2QoXCIraStcIiwwLDApXCI6XCJ0cmFuc2xhdGVYKFwiK2krXCIpXCI7dmFyIG49dGhpcy5zbGlkZXNbMF07aWYobil7dmFyIHM9LXRoaXMueC1uLnRhcmdldCxyPXMvdGhpcy5zbGlkZXNXaWR0aDt0aGlzLmRpc3BhdGNoRXZlbnQoXCJzY3JvbGxcIixudWxsLFtyLHNdKX19LHMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkPWZ1bmN0aW9uKCl7dGhpcy5jZWxscy5sZW5ndGgmJih0aGlzLng9LXRoaXMuc2VsZWN0ZWRTbGlkZS50YXJnZXQsdGhpcy5wb3NpdGlvblNsaWRlcigpKX0scy5nZXRQb3NpdGlvblZhbHVlPWZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLm9wdGlvbnMucGVyY2VudFBvc2l0aW9uPy4wMSpNYXRoLnJvdW5kKHQvdGhpcy5zaXplLmlubmVyV2lkdGgqMWU0KStcIiVcIjpNYXRoLnJvdW5kKHQpK1wicHhcIn0scy5zZXR0bGU9ZnVuY3Rpb24odCl7dGhpcy5pc1BvaW50ZXJEb3dufHxNYXRoLnJvdW5kKDEwMCp0aGlzLngpIT1NYXRoLnJvdW5kKDEwMCp0KXx8dGhpcy5yZXN0aW5nRnJhbWVzKyssdGhpcy5yZXN0aW5nRnJhbWVzPjImJih0aGlzLmlzQW5pbWF0aW5nPSExLGRlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZyx0aGlzLnBvc2l0aW9uU2xpZGVyKCksdGhpcy5kaXNwYXRjaEV2ZW50KFwic2V0dGxlXCIpKX0scy5zaGlmdFdyYXBDZWxscz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmN1cnNvclBvc2l0aW9uK3Q7dGhpcy5fc2hpZnRDZWxscyh0aGlzLmJlZm9yZVNoaWZ0Q2VsbHMsZSwtMSk7dmFyIGk9dGhpcy5zaXplLmlubmVyV2lkdGgtKHQrdGhpcy5zbGlkZWFibGVXaWR0aCt0aGlzLmN1cnNvclBvc2l0aW9uKTt0aGlzLl9zaGlmdENlbGxzKHRoaXMuYWZ0ZXJTaGlmdENlbGxzLGksMSl9LHMuX3NoaWZ0Q2VsbHM9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcz10W25dLG89ZT4wP2k6MDtzLndyYXBTaGlmdChvKSxlLT1zLnNpemUub3V0ZXJXaWR0aH19LHMuX3Vuc2hpZnRDZWxscz1mdW5jdGlvbih0KXtpZih0JiZ0Lmxlbmd0aClmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl0W2VdLndyYXBTaGlmdCgwKX0scy5pbnRlZ3JhdGVQaHlzaWNzPWZ1bmN0aW9uKCl7dGhpcy54Kz10aGlzLnZlbG9jaXR5LHRoaXMudmVsb2NpdHkqPXRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKX0scy5hcHBseUZvcmNlPWZ1bmN0aW9uKHQpe3RoaXMudmVsb2NpdHkrPXR9LHMuZ2V0RnJpY3Rpb25GYWN0b3I9ZnVuY3Rpb24oKXtyZXR1cm4gMS10aGlzLm9wdGlvbnNbdGhpcy5pc0ZyZWVTY3JvbGxpbmc/XCJmcmVlU2Nyb2xsRnJpY3Rpb25cIjpcImZyaWN0aW9uXCJdfSxzLmdldFJlc3RpbmdQb3NpdGlvbj1mdW5jdGlvbigpe3JldHVybiB0aGlzLngrdGhpcy52ZWxvY2l0eS8oMS10aGlzLmdldEZyaWN0aW9uRmFjdG9yKCkpfSxzLmFwcGx5RHJhZ0ZvcmNlPWZ1bmN0aW9uKCl7aWYodGhpcy5pc1BvaW50ZXJEb3duKXt2YXIgdD10aGlzLmRyYWdYLXRoaXMueCxlPXQtdGhpcy52ZWxvY2l0eTt0aGlzLmFwcGx5Rm9yY2UoZSl9fSxzLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uPWZ1bmN0aW9uKCl7aWYoIXRoaXMuaXNQb2ludGVyRG93biYmIXRoaXMuaXNGcmVlU2Nyb2xsaW5nJiZ0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9dGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldCotMS10aGlzLngsZT10KnRoaXMub3B0aW9ucy5zZWxlY3RlZEF0dHJhY3Rpb247dGhpcy5hcHBseUZvcmNlKGUpfX0sc30pLGZ1bmN0aW9uKHQsZSl7aWYoXCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kKWRlZmluZShcImZsaWNraXR5L2pzL2ZsaWNraXR5XCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIixcIi4vY2VsbFwiLFwiLi9zbGlkZVwiLFwiLi9hbmltYXRlXCJdLGZ1bmN0aW9uKGksbixzLG8scixhKXtyZXR1cm4gZSh0LGksbixzLG8scixhKX0pO2Vsc2UgaWYoXCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHMpbW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpLHJlcXVpcmUoXCJnZXQtc2l6ZVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikscmVxdWlyZShcIi4vY2VsbFwiKSxyZXF1aXJlKFwiLi9zbGlkZVwiKSxyZXF1aXJlKFwiLi9hbmltYXRlXCIpKTtlbHNle3ZhciBpPXQuRmxpY2tpdHk7dC5GbGlja2l0eT1lKHQsdC5FdkVtaXR0ZXIsdC5nZXRTaXplLHQuZml6enlVSVV0aWxzLGkuQ2VsbCxpLlNsaWRlLGkuYW5pbWF0ZVByb3RvdHlwZSl9fSh3aW5kb3csZnVuY3Rpb24odCxlLGksbixzLG8scil7ZnVuY3Rpb24gYSh0LGUpe2Zvcih0PW4ubWFrZUFycmF5KHQpO3QubGVuZ3RoOyllLmFwcGVuZENoaWxkKHQuc2hpZnQoKSl9ZnVuY3Rpb24gbCh0LGUpe3ZhciBpPW4uZ2V0UXVlcnlFbGVtZW50KHQpO2lmKCFpKXJldHVybiB2b2lkKGQmJmQuZXJyb3IoXCJCYWQgZWxlbWVudCBmb3IgRmxpY2tpdHk6IFwiKyhpfHx0KSkpO2lmKHRoaXMuZWxlbWVudD1pLHRoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQpe3ZhciBzPWZbdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRF07cmV0dXJuIHMub3B0aW9uKGUpLHN9aCYmKHRoaXMuJGVsZW1lbnQ9aCh0aGlzLmVsZW1lbnQpKSx0aGlzLm9wdGlvbnM9bi5leHRlbmQoe30sdGhpcy5jb25zdHJ1Y3Rvci5kZWZhdWx0cyksdGhpcy5vcHRpb24oZSksdGhpcy5fY3JlYXRlKCl9dmFyIGg9dC5qUXVlcnksYz10LmdldENvbXB1dGVkU3R5bGUsZD10LmNvbnNvbGUsdT0wLGY9e307bC5kZWZhdWx0cz17YWNjZXNzaWJpbGl0eTohMCxjZWxsQWxpZ246XCJjZW50ZXJcIixmcmVlU2Nyb2xsRnJpY3Rpb246LjA3NSxmcmljdGlvbjouMjgsbmFtZXNwYWNlSlF1ZXJ5RXZlbnRzOiEwLHBlcmNlbnRQb3NpdGlvbjohMCxyZXNpemU6ITAsc2VsZWN0ZWRBdHRyYWN0aW9uOi4wMjUsc2V0R2FsbGVyeVNpemU6ITB9LGwuY3JlYXRlTWV0aG9kcz1bXTt2YXIgcD1sLnByb3RvdHlwZTtuLmV4dGVuZChwLGUucHJvdG90eXBlKSxwLl9jcmVhdGU9ZnVuY3Rpb24oKXt2YXIgZT10aGlzLmd1aWQ9Kyt1O3RoaXMuZWxlbWVudC5mbGlja2l0eUdVSUQ9ZSxmW2VdPXRoaXMsdGhpcy5zZWxlY3RlZEluZGV4PTAsdGhpcy5yZXN0aW5nRnJhbWVzPTAsdGhpcy54PTAsdGhpcy52ZWxvY2l0eT0wLHRoaXMub3JpZ2luU2lkZT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJyaWdodFwiOlwibGVmdFwiLHRoaXMudmlld3BvcnQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSx0aGlzLnZpZXdwb3J0LmNsYXNzTmFtZT1cImZsaWNraXR5LXZpZXdwb3J0XCIsdGhpcy5fY3JlYXRlU2xpZGVyKCksKHRoaXMub3B0aW9ucy5yZXNpemV8fHRoaXMub3B0aW9ucy53YXRjaENTUykmJnQuYWRkRXZlbnRMaXN0ZW5lcihcInJlc2l6ZVwiLHRoaXMpLGwuY3JlYXRlTWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXNbdF0oKX0sdGhpcyksdGhpcy5vcHRpb25zLndhdGNoQ1NTP3RoaXMud2F0Y2hDU1MoKTp0aGlzLmFjdGl2YXRlKCl9LHAub3B0aW9uPWZ1bmN0aW9uKHQpe24uZXh0ZW5kKHRoaXMub3B0aW9ucyx0KX0scC5hY3RpdmF0ZT1mdW5jdGlvbigpe2lmKCF0aGlzLmlzQWN0aXZlKXt0aGlzLmlzQWN0aXZlPSEwLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZmxpY2tpdHktZW5hYmxlZFwiKSx0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQmJnRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZmxpY2tpdHktcnRsXCIpLHRoaXMuZ2V0U2l6ZSgpO3ZhciB0PXRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHModGhpcy5lbGVtZW50LmNoaWxkcmVuKTthKHQsdGhpcy5zbGlkZXIpLHRoaXMudmlld3BvcnQuYXBwZW5kQ2hpbGQodGhpcy5zbGlkZXIpLHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnZpZXdwb3J0KSx0aGlzLnJlbG9hZENlbGxzKCksdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJih0aGlzLmVsZW1lbnQudGFiSW5kZXg9MCx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzKSksdGhpcy5lbWl0RXZlbnQoXCJhY3RpdmF0ZVwiKTt2YXIgZSxpPXRoaXMub3B0aW9ucy5pbml0aWFsSW5kZXg7ZT10aGlzLmlzSW5pdEFjdGl2YXRlZD90aGlzLnNlbGVjdGVkSW5kZXg6dm9pZCAwIT09aSYmdGhpcy5jZWxsc1tpXT9pOjAsdGhpcy5zZWxlY3QoZSwhMSwhMCksdGhpcy5pc0luaXRBY3RpdmF0ZWQ9ITB9fSxwLl9jcmVhdGVTbGlkZXI9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3QuY2xhc3NOYW1lPVwiZmxpY2tpdHktc2xpZGVyXCIsdC5zdHlsZVt0aGlzLm9yaWdpblNpZGVdPTAsdGhpcy5zbGlkZXI9dH0scC5fZmlsdGVyRmluZENlbGxFbGVtZW50cz1mdW5jdGlvbih0KXtyZXR1cm4gbi5maWx0ZXJGaW5kRWxlbWVudHModCx0aGlzLm9wdGlvbnMuY2VsbFNlbGVjdG9yKX0scC5yZWxvYWRDZWxscz1mdW5jdGlvbigpe3RoaXMuY2VsbHM9dGhpcy5fbWFrZUNlbGxzKHRoaXMuc2xpZGVyLmNoaWxkcmVuKSx0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKX0scC5fbWFrZUNlbGxzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHModCksaT1lLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gbmV3IHModCx0aGlzKX0sdGhpcyk7cmV0dXJuIGl9LHAuZ2V0TGFzdENlbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxsc1t0aGlzLmNlbGxzLmxlbmd0aC0xXX0scC5nZXRMYXN0U2xpZGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zbGlkZXNbdGhpcy5zbGlkZXMubGVuZ3RoLTFdfSxwLnBvc2l0aW9uQ2VsbHM9ZnVuY3Rpb24oKXt0aGlzLl9zaXplQ2VsbHModGhpcy5jZWxscyksdGhpcy5fcG9zaXRpb25DZWxscygwKX0scC5fcG9zaXRpb25DZWxscz1mdW5jdGlvbih0KXt0PXR8fDAsdGhpcy5tYXhDZWxsSGVpZ2h0PXQ/dGhpcy5tYXhDZWxsSGVpZ2h0fHwwOjA7dmFyIGU9MDtpZih0PjApe3ZhciBpPXRoaXMuY2VsbHNbdC0xXTtlPWkueCtpLnNpemUub3V0ZXJXaWR0aH1mb3IodmFyIG49dGhpcy5jZWxscy5sZW5ndGgscz10O3M8bjtzKyspe3ZhciBvPXRoaXMuY2VsbHNbc107by5zZXRQb3NpdGlvbihlKSxlKz1vLnNpemUub3V0ZXJXaWR0aCx0aGlzLm1heENlbGxIZWlnaHQ9TWF0aC5tYXgoby5zaXplLm91dGVySGVpZ2h0LHRoaXMubWF4Q2VsbEhlaWdodCl9dGhpcy5zbGlkZWFibGVXaWR0aD1lLHRoaXMudXBkYXRlU2xpZGVzKCksdGhpcy5fY29udGFpblNsaWRlcygpLHRoaXMuc2xpZGVzV2lkdGg9bj90aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldC10aGlzLnNsaWRlc1swXS50YXJnZXQ6MH0scC5fc2l6ZUNlbGxzPWZ1bmN0aW9uKHQpe3QuZm9yRWFjaChmdW5jdGlvbih0KXt0LmdldFNpemUoKX0pfSxwLnVwZGF0ZVNsaWRlcz1mdW5jdGlvbigpe2lmKHRoaXMuc2xpZGVzPVtdLHRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD1uZXcgbyh0aGlzKTt0aGlzLnNsaWRlcy5wdXNoKHQpO3ZhciBlPVwibGVmdFwiPT10aGlzLm9yaWdpblNpZGUsaT1lP1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixuPXRoaXMuX2dldENhbkNlbGxGaXQoKTt0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oZSxzKXtpZighdC5jZWxscy5sZW5ndGgpcmV0dXJuIHZvaWQgdC5hZGRDZWxsKGUpO3ZhciByPXQub3V0ZXJXaWR0aC10LmZpcnN0TWFyZ2luKyhlLnNpemUub3V0ZXJXaWR0aC1lLnNpemVbaV0pO24uY2FsbCh0aGlzLHMscik/dC5hZGRDZWxsKGUpOih0LnVwZGF0ZVRhcmdldCgpLHQ9bmV3IG8odGhpcyksdGhpcy5zbGlkZXMucHVzaCh0KSx0LmFkZENlbGwoZSkpfSx0aGlzKSx0LnVwZGF0ZVRhcmdldCgpLHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpfX0scC5fZ2V0Q2FuQ2VsbEZpdD1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5ncm91cENlbGxzO2lmKCF0KXJldHVybiBmdW5jdGlvbigpe3JldHVybiExfTtpZihcIm51bWJlclwiPT10eXBlb2YgdCl7dmFyIGU9cGFyc2VJbnQodCwxMCk7cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0JWUhPT0wfX12YXIgaT1cInN0cmluZ1wiPT10eXBlb2YgdCYmdC5tYXRjaCgvXihcXGQrKSUkLyksbj1pP3BhcnNlSW50KGlbMV0sMTApLzEwMDoxO3JldHVybiBmdW5jdGlvbih0LGUpe3JldHVybiBlPD0odGhpcy5zaXplLmlubmVyV2lkdGgrMSkqbn19LHAuX2luaXQ9cC5yZXBvc2l0aW9uPWZ1bmN0aW9uKCl7dGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKX0scC5nZXRTaXplPWZ1bmN0aW9uKCl7dGhpcy5zaXplPWkodGhpcy5lbGVtZW50KSx0aGlzLnNldENlbGxBbGlnbigpLHRoaXMuY3Vyc29yUG9zaXRpb249dGhpcy5zaXplLmlubmVyV2lkdGgqdGhpcy5jZWxsQWxpZ259O3ZhciB2PXtjZW50ZXI6e2xlZnQ6LjUscmlnaHQ6LjV9LGxlZnQ6e2xlZnQ6MCxyaWdodDoxfSxyaWdodDp7cmlnaHQ6MCxsZWZ0OjF9fTtyZXR1cm4gcC5zZXRDZWxsQWxpZ249ZnVuY3Rpb24oKXt2YXIgdD12W3RoaXMub3B0aW9ucy5jZWxsQWxpZ25dO3RoaXMuY2VsbEFsaWduPXQ/dFt0aGlzLm9yaWdpblNpZGVdOnRoaXMub3B0aW9ucy5jZWxsQWxpZ259LHAuc2V0R2FsbGVyeVNpemU9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuc2V0R2FsbGVyeVNpemUpe3ZhciB0PXRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCYmdGhpcy5zZWxlY3RlZFNsaWRlP3RoaXMuc2VsZWN0ZWRTbGlkZS5oZWlnaHQ6dGhpcy5tYXhDZWxsSGVpZ2h0O3RoaXMudmlld3BvcnQuc3R5bGUuaGVpZ2h0PXQrXCJweFwifX0scC5fZ2V0V3JhcFNoaWZ0Q2VsbHM9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCl7dGhpcy5fdW5zaGlmdENlbGxzKHRoaXMuYmVmb3JlU2hpZnRDZWxscyksdGhpcy5fdW5zaGlmdENlbGxzKHRoaXMuYWZ0ZXJTaGlmdENlbGxzKTt2YXIgdD10aGlzLmN1cnNvclBvc2l0aW9uLGU9dGhpcy5jZWxscy5sZW5ndGgtMTt0aGlzLmJlZm9yZVNoaWZ0Q2VsbHM9dGhpcy5fZ2V0R2FwQ2VsbHModCxlLC0xKSx0PXRoaXMuc2l6ZS5pbm5lcldpZHRoLXRoaXMuY3Vyc29yUG9zaXRpb24sdGhpcy5hZnRlclNoaWZ0Q2VsbHM9dGhpcy5fZ2V0R2FwQ2VsbHModCwwLDEpfX0scC5fZ2V0R2FwQ2VsbHM9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj1bXTt0PjA7KXt2YXIgcz10aGlzLmNlbGxzW2VdO2lmKCFzKWJyZWFrO24ucHVzaChzKSxlKz1pLHQtPXMuc2l6ZS5vdXRlcldpZHRofXJldHVybiBufSxwLl9jb250YWluU2xpZGVzPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLmNvbnRhaW4mJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCxlPXQ/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLGk9dD9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCIsbj10aGlzLnNsaWRlYWJsZVdpZHRoLXRoaXMuZ2V0TGFzdENlbGwoKS5zaXplW2ldLHM9bjx0aGlzLnNpemUuaW5uZXJXaWR0aCxvPXRoaXMuY3Vyc29yUG9zaXRpb24rdGhpcy5jZWxsc1swXS5zaXplW2VdLHI9bi10aGlzLnNpemUuaW5uZXJXaWR0aCooMS10aGlzLmNlbGxBbGlnbik7dGhpcy5zbGlkZXMuZm9yRWFjaChmdW5jdGlvbih0KXtzP3QudGFyZ2V0PW4qdGhpcy5jZWxsQWxpZ246KHQudGFyZ2V0PU1hdGgubWF4KHQudGFyZ2V0LG8pLHQudGFyZ2V0PU1hdGgubWluKHQudGFyZ2V0LHIpKX0sdGhpcyl9fSxwLmRpc3BhdGNoRXZlbnQ9ZnVuY3Rpb24odCxlLGkpe3ZhciBuPWU/W2VdLmNvbmNhdChpKTppO2lmKHRoaXMuZW1pdEV2ZW50KHQsbiksaCYmdGhpcy4kZWxlbWVudCl7dCs9dGhpcy5vcHRpb25zLm5hbWVzcGFjZUpRdWVyeUV2ZW50cz9cIi5mbGlja2l0eVwiOlwiXCI7dmFyIHM9dDtpZihlKXt2YXIgbz1oLkV2ZW50KGUpO28udHlwZT10LHM9b310aGlzLiRlbGVtZW50LnRyaWdnZXIocyxpKX19LHAuc2VsZWN0PWZ1bmN0aW9uKHQsZSxpKXt0aGlzLmlzQWN0aXZlJiYodD1wYXJzZUludCh0LDEwKSx0aGlzLl93cmFwU2VsZWN0KHQpLCh0aGlzLm9wdGlvbnMud3JhcEFyb3VuZHx8ZSkmJih0PW4ubW9kdWxvKHQsdGhpcy5zbGlkZXMubGVuZ3RoKSksdGhpcy5zbGlkZXNbdF0mJih0aGlzLnNlbGVjdGVkSW5kZXg9dCx0aGlzLnVwZGF0ZVNlbGVjdGVkU2xpZGUoKSxpP3RoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCk6dGhpcy5zdGFydEFuaW1hdGlvbigpLHRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCYmdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZGlzcGF0Y2hFdmVudChcInNlbGVjdFwiKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJjZWxsU2VsZWN0XCIpKSl9LHAuX3dyYXBTZWxlY3Q9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5zbGlkZXMubGVuZ3RoLGk9dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJmU+MTtpZighaSlyZXR1cm4gdDt2YXIgcz1uLm1vZHVsbyh0LGUpLG89TWF0aC5hYnMocy10aGlzLnNlbGVjdGVkSW5kZXgpLHI9TWF0aC5hYnMocytlLXRoaXMuc2VsZWN0ZWRJbmRleCksYT1NYXRoLmFicyhzLWUtdGhpcy5zZWxlY3RlZEluZGV4KTshdGhpcy5pc0RyYWdTZWxlY3QmJnI8bz90Kz1lOiF0aGlzLmlzRHJhZ1NlbGVjdCYmYTxvJiYodC09ZSksdDwwP3RoaXMueC09dGhpcy5zbGlkZWFibGVXaWR0aDp0Pj1lJiYodGhpcy54Kz10aGlzLnNsaWRlYWJsZVdpZHRoKX0scC5wcmV2aW91cz1mdW5jdGlvbih0LGUpe3RoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleC0xLHQsZSl9LHAubmV4dD1mdW5jdGlvbih0LGUpe3RoaXMuc2VsZWN0KHRoaXMuc2VsZWN0ZWRJbmRleCsxLHQsZSl9LHAudXBkYXRlU2VsZWN0ZWRTbGlkZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMuc2xpZGVzW3RoaXMuc2VsZWN0ZWRJbmRleF07dCYmKHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCksdGhpcy5zZWxlY3RlZFNsaWRlPXQsdC5zZWxlY3QoKSx0aGlzLnNlbGVjdGVkQ2VsbHM9dC5jZWxscyx0aGlzLnNlbGVjdGVkRWxlbWVudHM9dC5nZXRDZWxsRWxlbWVudHMoKSx0aGlzLnNlbGVjdGVkQ2VsbD10LmNlbGxzWzBdLHRoaXMuc2VsZWN0ZWRFbGVtZW50PXRoaXMuc2VsZWN0ZWRFbGVtZW50c1swXSl9LHAudW5zZWxlY3RTZWxlY3RlZFNsaWRlPWZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZFNsaWRlJiZ0aGlzLnNlbGVjdGVkU2xpZGUudW5zZWxlY3QoKX0scC5zZWxlY3RDZWxsPWZ1bmN0aW9uKHQsZSxpKXt2YXIgbjtcIm51bWJlclwiPT10eXBlb2YgdD9uPXRoaXMuY2VsbHNbdF06KFwic3RyaW5nXCI9PXR5cGVvZiB0JiYodD10aGlzLmVsZW1lbnQucXVlcnlTZWxlY3Rvcih0KSksbj10aGlzLmdldENlbGwodCkpO2Zvcih2YXIgcz0wO24mJnM8dGhpcy5zbGlkZXMubGVuZ3RoO3MrKyl7dmFyIG89dGhpcy5zbGlkZXNbc10scj1vLmNlbGxzLmluZGV4T2Yobik7aWYociE9LTEpcmV0dXJuIHZvaWQgdGhpcy5zZWxlY3QocyxlLGkpfX0scC5nZXRDZWxsPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dGhpcy5jZWxscy5sZW5ndGg7ZSsrKXt2YXIgaT10aGlzLmNlbGxzW2VdO2lmKGkuZWxlbWVudD09dClyZXR1cm4gaX19LHAuZ2V0Q2VsbHM9ZnVuY3Rpb24odCl7dD1uLm1ha2VBcnJheSh0KTt2YXIgZT1bXTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBpPXRoaXMuZ2V0Q2VsbCh0KTtpJiZlLnB1c2goaSl9LHRoaXMpLGV9LHAuZ2V0Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KX0scC5nZXRQYXJlbnRDZWxsPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0Q2VsbCh0KTtyZXR1cm4gZT9lOih0PW4uZ2V0UGFyZW50KHQsXCIuZmxpY2tpdHktc2xpZGVyID4gKlwiKSx0aGlzLmdldENlbGwodCkpfSxwLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKHQsZSl7aWYoIXQpcmV0dXJuIHRoaXMuc2VsZWN0ZWRTbGlkZS5nZXRDZWxsRWxlbWVudHMoKTtlPXZvaWQgMD09PWU/dGhpcy5zZWxlY3RlZEluZGV4OmU7dmFyIGk9dGhpcy5zbGlkZXMubGVuZ3RoO2lmKDErMip0Pj1pKXJldHVybiB0aGlzLmdldENlbGxFbGVtZW50cygpO2Zvcih2YXIgcz1bXSxvPWUtdDtvPD1lK3Q7bysrKXt2YXIgcj10aGlzLm9wdGlvbnMud3JhcEFyb3VuZD9uLm1vZHVsbyhvLGkpOm8sYT10aGlzLnNsaWRlc1tyXTthJiYocz1zLmNvbmNhdChhLmdldENlbGxFbGVtZW50cygpKSl9cmV0dXJuIHN9LHAudWlDaGFuZ2U9ZnVuY3Rpb24oKXt0aGlzLmVtaXRFdmVudChcInVpQ2hhbmdlXCIpfSxwLmNoaWxkVUlQb2ludGVyRG93bj1mdW5jdGlvbih0KXt0aGlzLmVtaXRFdmVudChcImNoaWxkVUlQb2ludGVyRG93blwiLFt0XSl9LHAub25yZXNpemU9ZnVuY3Rpb24oKXt0aGlzLndhdGNoQ1NTKCksdGhpcy5yZXNpemUoKX0sbi5kZWJvdW5jZU1ldGhvZChsLFwib25yZXNpemVcIiwxNTApLHAucmVzaXplPWZ1bmN0aW9uKCl7aWYodGhpcy5pc0FjdGl2ZSl7dGhpcy5nZXRTaXplKCksdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJih0aGlzLng9bi5tb2R1bG8odGhpcy54LHRoaXMuc2xpZGVhYmxlV2lkdGgpKSx0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmVtaXRFdmVudChcInJlc2l6ZVwiKTt2YXIgdD10aGlzLnNlbGVjdGVkRWxlbWVudHMmJnRoaXMuc2VsZWN0ZWRFbGVtZW50c1swXTt0aGlzLnNlbGVjdENlbGwodCwhMSwhMCl9fSxwLndhdGNoQ1NTPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLndhdGNoQ1NTO2lmKHQpe3ZhciBlPWModGhpcy5lbGVtZW50LFwiOmFmdGVyXCIpLmNvbnRlbnQ7ZS5pbmRleE9mKFwiZmxpY2tpdHlcIikhPS0xP3RoaXMuYWN0aXZhdGUoKTp0aGlzLmRlYWN0aXZhdGUoKX19LHAub25rZXlkb3duPWZ1bmN0aW9uKHQpe2lmKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYoIWRvY3VtZW50LmFjdGl2ZUVsZW1lbnR8fGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ9PXRoaXMuZWxlbWVudCkpaWYoMzc9PXQua2V5Q29kZSl7dmFyIGU9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wibmV4dFwiOlwicHJldmlvdXNcIjt0aGlzLnVpQ2hhbmdlKCksdGhpc1tlXSgpfWVsc2UgaWYoMzk9PXQua2V5Q29kZSl7dmFyIGk9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wicHJldmlvdXNcIjpcIm5leHRcIjt0aGlzLnVpQ2hhbmdlKCksdGhpc1tpXSgpfX0scC5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5pc0FjdGl2ZSYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpY2tpdHktZW5hYmxlZFwiKSx0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZsaWNraXR5LXJ0bFwiKSx0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24odCl7dC5kZXN0cm95KCl9KSx0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpLHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnZpZXdwb3J0KSxhKHRoaXMuc2xpZGVyLmNoaWxkcmVuLHRoaXMuZWxlbWVudCksdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJih0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwidGFiSW5kZXhcIiksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcykpLHRoaXMuaXNBY3RpdmU9ITEsdGhpcy5lbWl0RXZlbnQoXCJkZWFjdGl2YXRlXCIpKX0scC5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCksdC5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcyksdGhpcy5lbWl0RXZlbnQoXCJkZXN0cm95XCIpLGgmJnRoaXMuJGVsZW1lbnQmJmgucmVtb3ZlRGF0YSh0aGlzLmVsZW1lbnQsXCJmbGlja2l0eVwiKSxkZWxldGUgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCxkZWxldGUgZlt0aGlzLmd1aWRdfSxuLmV4dGVuZChwLHIpLGwuZGF0YT1mdW5jdGlvbih0KXt0PW4uZ2V0UXVlcnlFbGVtZW50KHQpO3ZhciBlPXQmJnQuZmxpY2tpdHlHVUlEO3JldHVybiBlJiZmW2VdfSxuLmh0bWxJbml0KGwsXCJmbGlja2l0eVwiKSxoJiZoLmJyaWRnZXQmJmguYnJpZGdldChcImZsaWNraXR5XCIsbCksbC5DZWxsPXMsbH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpKTp0LlVuaXBvaW50ZXI9ZSh0LHQuRXZFbWl0dGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSgpe31mdW5jdGlvbiBuKCl7fXZhciBzPW4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3MuYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24odCl7dGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMCl9LHMudW5iaW5kU3RhcnRFdmVudD1mdW5jdGlvbih0KXt0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCExKX0scy5fYmluZFN0YXJ0RXZlbnQ9ZnVuY3Rpb24oZSxpKXtpPXZvaWQgMD09PWl8fCEhaTt2YXIgbj1pP1wiYWRkRXZlbnRMaXN0ZW5lclwiOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiO3QubmF2aWdhdG9yLnBvaW50ZXJFbmFibGVkP2Vbbl0oXCJwb2ludGVyZG93blwiLHRoaXMpOnQubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQ/ZVtuXShcIk1TUG9pbnRlckRvd25cIix0aGlzKTooZVtuXShcIm1vdXNlZG93blwiLHRoaXMpLGVbbl0oXCJ0b3VjaHN0YXJ0XCIsdGhpcykpfSxzLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0scy5nZXRUb3VjaD1mdW5jdGlvbih0KXtmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl7dmFyIGk9dFtlXTtpZihpLmlkZW50aWZpZXI9PXRoaXMucG9pbnRlcklkZW50aWZpZXIpcmV0dXJuIGl9fSxzLm9ubW91c2Vkb3duPWZ1bmN0aW9uKHQpe3ZhciBlPXQuYnV0dG9uO2UmJjAhPT1lJiYxIT09ZXx8dGhpcy5fcG9pbnRlckRvd24odCx0KX0scy5vbnRvdWNoc3RhcnQ9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlckRvd24odCx0LmNoYW5nZWRUb3VjaGVzWzBdKX0scy5vbk1TUG9pbnRlckRvd249cy5vbnBvaW50ZXJkb3duPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJEb3duKHQsdCl9LHMuX3BvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc1BvaW50ZXJEb3dufHwodGhpcy5pc1BvaW50ZXJEb3duPSEwLHRoaXMucG9pbnRlcklkZW50aWZpZXI9dm9pZCAwIT09ZS5wb2ludGVySWQ/ZS5wb2ludGVySWQ6ZS5pZGVudGlmaWVyLHRoaXMucG9pbnRlckRvd24odCxlKSl9LHMucG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXt0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKHQpLHRoaXMuZW1pdEV2ZW50KFwicG9pbnRlckRvd25cIixbdCxlXSl9O3ZhciBvPXttb3VzZWRvd246W1wibW91c2Vtb3ZlXCIsXCJtb3VzZXVwXCJdLHRvdWNoc3RhcnQ6W1widG91Y2htb3ZlXCIsXCJ0b3VjaGVuZFwiLFwidG91Y2hjYW5jZWxcIl0scG9pbnRlcmRvd246W1wicG9pbnRlcm1vdmVcIixcInBvaW50ZXJ1cFwiLFwicG9pbnRlcmNhbmNlbFwiXSxNU1BvaW50ZXJEb3duOltcIk1TUG9pbnRlck1vdmVcIixcIk1TUG9pbnRlclVwXCIsXCJNU1BvaW50ZXJDYW5jZWxcIl19O3JldHVybiBzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzPWZ1bmN0aW9uKGUpe2lmKGUpe3ZhciBpPW9bZS50eXBlXTtpLmZvckVhY2goZnVuY3Rpb24oZSl7dC5hZGRFdmVudExpc3RlbmVyKGUsdGhpcyl9LHRoaXMpLHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cz1pfX0scy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5fYm91bmRQb2ludGVyRXZlbnRzJiYodGhpcy5fYm91bmRQb2ludGVyRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZSl7dC5yZW1vdmVFdmVudExpc3RlbmVyKGUsdGhpcyl9LHRoaXMpLGRlbGV0ZSB0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMpfSxzLm9ubW91c2Vtb3ZlPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJNb3ZlKHQsdCl9LHMub25NU1BvaW50ZXJNb3ZlPXMub25wb2ludGVybW92ZT1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlck1vdmUodCx0KX0scy5vbnRvdWNobW92ZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJNb3ZlKHQsZSl9LHMuX3BvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dGhpcy5wb2ludGVyTW92ZSh0LGUpfSxzLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyTW92ZVwiLFt0LGVdKX0scy5vbm1vdXNldXA9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlclVwKHQsdCl9LHMub25NU1BvaW50ZXJVcD1zLm9ucG9pbnRlcnVwPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyVXAodCx0KX0scy5vbnRvdWNoZW5kPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlclVwKHQsZSl9LHMuX3BvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuX3BvaW50ZXJEb25lKCksdGhpcy5wb2ludGVyVXAodCxlKX0scy5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJVcFwiLFt0LGVdKX0scy5fcG9pbnRlckRvbmU9ZnVuY3Rpb24oKXt0aGlzLmlzUG9pbnRlckRvd249ITEsZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXIsdGhpcy5fdW5iaW5kUG9zdFN0YXJ0RXZlbnRzKCksdGhpcy5wb2ludGVyRG9uZSgpfSxzLnBvaW50ZXJEb25lPWkscy5vbk1TUG9pbnRlckNhbmNlbD1zLm9ucG9pbnRlcmNhbmNlbD1mdW5jdGlvbih0KXt0LnBvaW50ZXJJZD09dGhpcy5wb2ludGVySWRlbnRpZmllciYmdGhpcy5fcG9pbnRlckNhbmNlbCh0LHQpfSxzLm9udG91Y2hjYW5jZWw9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyQ2FuY2VsKHQsZSl9LHMuX3BvaW50ZXJDYW5jZWw9ZnVuY3Rpb24odCxlKXt0aGlzLl9wb2ludGVyRG9uZSgpLHRoaXMucG9pbnRlckNhbmNlbCh0LGUpfSxzLnBvaW50ZXJDYW5jZWw9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJDYW5jZWxcIixbdCxlXSl9LG4uZ2V0UG9pbnRlclBvaW50PWZ1bmN0aW9uKHQpe3JldHVybnt4OnQucGFnZVgseTp0LnBhZ2VZfX0sbn0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInVuaWRyYWdnZXIvdW5pZHJhZ2dlclwiLFtcInVuaXBvaW50ZXIvdW5pcG9pbnRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJ1bmlwb2ludGVyXCIpKTp0LlVuaWRyYWdnZXI9ZSh0LHQuVW5pcG9pbnRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkoKXt9ZnVuY3Rpb24gbigpe312YXIgcz1uLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtzLmJpbmRIYW5kbGVzPWZ1bmN0aW9uKCl7dGhpcy5fYmluZEhhbmRsZXMoITApfSxzLnVuYmluZEhhbmRsZXM9ZnVuY3Rpb24oKXt0aGlzLl9iaW5kSGFuZGxlcyghMSl9O3ZhciBvPXQubmF2aWdhdG9yO3JldHVybiBzLl9iaW5kSGFuZGxlcz1mdW5jdGlvbih0KXt0PXZvaWQgMD09PXR8fCEhdDt2YXIgZTtlPW8ucG9pbnRlckVuYWJsZWQ/ZnVuY3Rpb24oZSl7ZS5zdHlsZS50b3VjaEFjdGlvbj10P1wibm9uZVwiOlwiXCJ9Om8ubXNQb2ludGVyRW5hYmxlZD9mdW5jdGlvbihlKXtlLnN0eWxlLm1zVG91Y2hBY3Rpb249dD9cIm5vbmVcIjpcIlwifTppO2Zvcih2YXIgbj10P1wiYWRkRXZlbnRMaXN0ZW5lclwiOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiLHM9MDtzPHRoaXMuaGFuZGxlcy5sZW5ndGg7cysrKXt2YXIgcj10aGlzLmhhbmRsZXNbc107dGhpcy5fYmluZFN0YXJ0RXZlbnQocix0KSxlKHIpLHJbbl0oXCJjbGlja1wiLHRoaXMpfX0scy5wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe2lmKFwiSU5QVVRcIj09dC50YXJnZXQubm9kZU5hbWUmJlwicmFuZ2VcIj09dC50YXJnZXQudHlwZSlyZXR1cm4gdGhpcy5pc1BvaW50ZXJEb3duPSExLHZvaWQgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7dGhpcy5fZHJhZ1BvaW50ZXJEb3duKHQsZSk7dmFyIGk9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtpJiZpLmJsdXImJmkuYmx1cigpLHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHModCksdGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyRG93blwiLFt0LGVdKX0scy5fZHJhZ1BvaW50ZXJEb3duPWZ1bmN0aW9uKHQsaSl7dGhpcy5wb2ludGVyRG93blBvaW50PWUuZ2V0UG9pbnRlclBvaW50KGkpO3ZhciBuPXRoaXMuY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duKHQsaSk7biYmdC5wcmV2ZW50RGVmYXVsdCgpfSxzLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bj1mdW5jdGlvbih0KXtyZXR1cm5cIlNFTEVDVFwiIT10LnRhcmdldC5ub2RlTmFtZX0scy5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2RyYWdQb2ludGVyTW92ZSh0LGUpO3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlck1vdmVcIixbdCxlLGldKSx0aGlzLl9kcmFnTW92ZSh0LGUsaSl9LHMuX2RyYWdQb2ludGVyTW92ZT1mdW5jdGlvbih0LGkpe3ZhciBuPWUuZ2V0UG9pbnRlclBvaW50KGkpLHM9e3g6bi54LXRoaXMucG9pbnRlckRvd25Qb2ludC54LHk6bi55LXRoaXMucG9pbnRlckRvd25Qb2ludC55fTtyZXR1cm4hdGhpcy5pc0RyYWdnaW5nJiZ0aGlzLmhhc0RyYWdTdGFydGVkKHMpJiZ0aGlzLl9kcmFnU3RhcnQodCxpKSxzfSxzLmhhc0RyYWdTdGFydGVkPWZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLmFicyh0LngpPjN8fE1hdGguYWJzKHQueSk+M30scy5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJVcFwiLFt0LGVdKSx0aGlzLl9kcmFnUG9pbnRlclVwKHQsZSl9LHMuX2RyYWdQb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmlzRHJhZ2dpbmc/dGhpcy5fZHJhZ0VuZCh0LGUpOnRoaXMuX3N0YXRpY0NsaWNrKHQsZSl9LHMuX2RyYWdTdGFydD1mdW5jdGlvbih0LGkpe3RoaXMuaXNEcmFnZ2luZz0hMCx0aGlzLmRyYWdTdGFydFBvaW50PWUuZ2V0UG9pbnRlclBvaW50KGkpLHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzPSEwLHRoaXMuZHJhZ1N0YXJ0KHQsaSl9LHMuZHJhZ1N0YXJ0PWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJkcmFnU3RhcnRcIixbdCxlXSl9LHMuX2RyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0aGlzLmlzRHJhZ2dpbmcmJnRoaXMuZHJhZ01vdmUodCxlLGkpfSxzLmRyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5lbWl0RXZlbnQoXCJkcmFnTW92ZVwiLFt0LGUsaV0pfSxzLl9kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0RyYWdnaW5nPSExLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc1ByZXZlbnRpbmdDbGlja3N9LmJpbmQodGhpcykpLHRoaXMuZHJhZ0VuZCh0LGUpfSxzLmRyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcImRyYWdFbmRcIixbdCxlXSl9LHMub25jbGljaz1mdW5jdGlvbih0KXt0aGlzLmlzUHJldmVudGluZ0NsaWNrcyYmdC5wcmV2ZW50RGVmYXVsdCgpfSxzLl9zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe2lmKCF0aGlzLmlzSWdub3JpbmdNb3VzZVVwfHxcIm1vdXNldXBcIiE9dC50eXBlKXt2YXIgaT10LnRhcmdldC5ub2RlTmFtZTtcIklOUFVUXCIhPWkmJlwiVEVYVEFSRUFcIiE9aXx8dC50YXJnZXQuZm9jdXMoKSx0aGlzLnN0YXRpY0NsaWNrKHQsZSksXCJtb3VzZXVwXCIhPXQudHlwZSYmKHRoaXMuaXNJZ25vcmluZ01vdXNlVXA9ITAsc2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzSWdub3JpbmdNb3VzZVVwfS5iaW5kKHRoaXMpLDQwMCkpfX0scy5zdGF0aWNDbGljaz1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwic3RhdGljQ2xpY2tcIixbdCxlXSl9LG4uZ2V0UG9pbnRlclBvaW50PWUuZ2V0UG9pbnRlclBvaW50LG59KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9kcmFnXCIsW1wiLi9mbGlja2l0eVwiLFwidW5pZHJhZ2dlci91bmlkcmFnZ2VyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInVuaWRyYWdnZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTp0LkZsaWNraXR5PWUodCx0LkZsaWNraXR5LHQuVW5pZHJhZ2dlcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtmdW5jdGlvbiBzKCl7cmV0dXJue3g6dC5wYWdlWE9mZnNldCx5OnQucGFnZVlPZmZzZXR9fW4uZXh0ZW5kKGUuZGVmYXVsdHMse2RyYWdnYWJsZTohMCxkcmFnVGhyZXNob2xkOjN9KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVEcmFnXCIpO3ZhciBvPWUucHJvdG90eXBlO24uZXh0ZW5kKG8saS5wcm90b3R5cGUpO3ZhciByPVwiY3JlYXRlVG91Y2hcImluIGRvY3VtZW50LGE9ITE7by5fY3JlYXRlRHJhZz1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYmluZERyYWcpLHRoaXMub24oXCJ1aUNoYW5nZVwiLHRoaXMuX3VpQ2hhbmdlRHJhZyksdGhpcy5vbihcImNoaWxkVUlQb2ludGVyRG93blwiLHRoaXMuX2NoaWxkVUlQb2ludGVyRG93bkRyYWcpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy51bmJpbmREcmFnKSxyJiYhYSYmKHQuYWRkRXZlbnRMaXN0ZW5lcihcInRvdWNobW92ZVwiLGZ1bmN0aW9uKCl7fSksYT0hMCl9LG8uYmluZERyYWc9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlJiYhdGhpcy5pc0RyYWdCb3VuZCYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaXMtZHJhZ2dhYmxlXCIpLHRoaXMuaGFuZGxlcz1bdGhpcy52aWV3cG9ydF0sdGhpcy5iaW5kSGFuZGxlcygpLHRoaXMuaXNEcmFnQm91bmQ9ITApfSxvLnVuYmluZERyYWc9ZnVuY3Rpb24oKXt0aGlzLmlzRHJhZ0JvdW5kJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1kcmFnZ2FibGVcIiksdGhpcy51bmJpbmRIYW5kbGVzKCksZGVsZXRlIHRoaXMuaXNEcmFnQm91bmQpfSxvLl91aUNoYW5nZURyYWc9ZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc0ZyZWVTY3JvbGxpbmd9LG8uX2NoaWxkVUlQb2ludGVyRG93bkRyYWc9ZnVuY3Rpb24odCl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucG9pbnRlckRvd25Gb2N1cyh0KX07dmFyIGw9e1RFWFRBUkVBOiEwLElOUFVUOiEwLE9QVElPTjohMH0saD17cmFkaW86ITAsY2hlY2tib3g6ITAsYnV0dG9uOiEwLHN1Ym1pdDohMCxpbWFnZTohMCxmaWxlOiEwfTtvLnBvaW50ZXJEb3duPWZ1bmN0aW9uKGUsaSl7dmFyIG49bFtlLnRhcmdldC5ub2RlTmFtZV0mJiFoW2UudGFyZ2V0LnR5cGVdO2lmKG4pcmV0dXJuIHRoaXMuaXNQb2ludGVyRG93bj0hMSx2b2lkIGRlbGV0ZSB0aGlzLnBvaW50ZXJJZGVudGlmaWVyO3RoaXMuX2RyYWdQb2ludGVyRG93bihlLGkpO3ZhciBvPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7byYmby5ibHVyJiZvIT10aGlzLmVsZW1lbnQmJm8hPWRvY3VtZW50LmJvZHkmJm8uYmx1cigpLHRoaXMucG9pbnRlckRvd25Gb2N1cyhlKSx0aGlzLmRyYWdYPXRoaXMueCx0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5hZGQoXCJpcy1wb2ludGVyLWRvd25cIiksdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyhlKSx0aGlzLnBvaW50ZXJEb3duU2Nyb2xsPXMoKSx0LmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyRG93blwiLGUsW2ldKX07dmFyIGM9e3RvdWNoc3RhcnQ6ITAsTVNQb2ludGVyRG93bjohMH0sZD17SU5QVVQ6ITAsU0VMRUNUOiEwfTtyZXR1cm4gby5wb2ludGVyRG93bkZvY3VzPWZ1bmN0aW9uKGUpe2lmKHRoaXMub3B0aW9ucy5hY2Nlc3NpYmlsaXR5JiYhY1tlLnR5cGVdJiYhZFtlLnRhcmdldC5ub2RlTmFtZV0pe3ZhciBpPXQucGFnZVlPZmZzZXQ7dGhpcy5lbGVtZW50LmZvY3VzKCksdC5wYWdlWU9mZnNldCE9aSYmdC5zY3JvbGxUbyh0LnBhZ2VYT2Zmc2V0LGkpfX0sby5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd249ZnVuY3Rpb24odCl7dmFyIGU9XCJ0b3VjaHN0YXJ0XCI9PXQudHlwZSxpPXQudGFyZ2V0Lm5vZGVOYW1lO3JldHVybiFlJiZcIlNFTEVDVFwiIT1pfSxvLmhhc0RyYWdTdGFydGVkPWZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLmFicyh0LngpPnRoaXMub3B0aW9ucy5kcmFnVGhyZXNob2xkfSxvLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe2RlbGV0ZSB0aGlzLmlzVG91Y2hTY3JvbGxpbmcsdGhpcy52aWV3cG9ydC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtcG9pbnRlci1kb3duXCIpLHRoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJVcFwiLHQsW2VdKSx0aGlzLl9kcmFnUG9pbnRlclVwKHQsZSl9LG8ucG9pbnRlckRvbmU9ZnVuY3Rpb24oKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSxkZWxldGUgdGhpcy5wb2ludGVyRG93blNjcm9sbH0sby5kcmFnU3RhcnQ9ZnVuY3Rpb24oZSxpKXt0aGlzLmRyYWdTdGFydFBvc2l0aW9uPXRoaXMueCx0aGlzLnN0YXJ0QW5pbWF0aW9uKCksdC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ1N0YXJ0XCIsZSxbaV0pfSxvLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKHQsZSk7dGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlck1vdmVcIix0LFtlLGldKSx0aGlzLl9kcmFnTW92ZSh0LGUsaSl9LG8uZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLnByZXZpb3VzRHJhZ1g9dGhpcy5kcmFnWDt2YXIgbj10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/LTE6MSxzPXRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24raS54Km47aWYoIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLnNsaWRlcy5sZW5ndGgpe3ZhciBvPU1hdGgubWF4KC10aGlzLnNsaWRlc1swXS50YXJnZXQsdGhpcy5kcmFnU3RhcnRQb3NpdGlvbik7cz1zPm8/LjUqKHMrbyk6czt2YXIgcj1NYXRoLm1pbigtdGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQsdGhpcy5kcmFnU3RhcnRQb3NpdGlvbik7cz1zPHI/LjUqKHMrcik6c310aGlzLmRyYWdYPXMsdGhpcy5kcmFnTW92ZVRpbWU9bmV3IERhdGUsdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ01vdmVcIix0LFtlLGldKX0sby5kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5vcHRpb25zLmZyZWVTY3JvbGwmJih0aGlzLmlzRnJlZVNjcm9sbGluZz0hMCk7dmFyIGk9dGhpcy5kcmFnRW5kUmVzdGluZ1NlbGVjdCgpO2lmKHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQpe3ZhciBuPXRoaXMuZ2V0UmVzdGluZ1Bvc2l0aW9uKCk7dGhpcy5pc0ZyZWVTY3JvbGxpbmc9LW4+dGhpcy5zbGlkZXNbMF0udGFyZ2V0JiYtbjx0aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldH1lbHNlIHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsfHxpIT10aGlzLnNlbGVjdGVkSW5kZXh8fChpKz10aGlzLmRyYWdFbmRCb29zdFNlbGVjdCgpKTtkZWxldGUgdGhpcy5wcmV2aW91c0RyYWdYLHRoaXMuaXNEcmFnU2VsZWN0PXRoaXMub3B0aW9ucy53cmFwQXJvdW5kLHRoaXMuc2VsZWN0KGkpLGRlbGV0ZSB0aGlzLmlzRHJhZ1NlbGVjdCx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnRW5kXCIsdCxbZV0pfSxvLmRyYWdFbmRSZXN0aW5nU2VsZWN0PWZ1bmN0aW9uKCl7XG52YXIgdD10aGlzLmdldFJlc3RpbmdQb3NpdGlvbigpLGU9TWF0aC5hYnModGhpcy5nZXRTbGlkZURpc3RhbmNlKC10LHRoaXMuc2VsZWN0ZWRJbmRleCkpLGk9dGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcodCxlLDEpLG49dGhpcy5fZ2V0Q2xvc2VzdFJlc3RpbmcodCxlLC0xKSxzPWkuZGlzdGFuY2U8bi5kaXN0YW5jZT9pLmluZGV4Om4uaW5kZXg7cmV0dXJuIHN9LG8uX2dldENsb3Nlc3RSZXN0aW5nPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49dGhpcy5zZWxlY3RlZEluZGV4LHM9MS8wLG89dGhpcy5vcHRpb25zLmNvbnRhaW4mJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZD9mdW5jdGlvbih0LGUpe3JldHVybiB0PD1lfTpmdW5jdGlvbih0LGUpe3JldHVybiB0PGV9O28oZSxzKSYmKG4rPWkscz1lLGU9dGhpcy5nZXRTbGlkZURpc3RhbmNlKC10LG4pLG51bGwhPT1lKTspZT1NYXRoLmFicyhlKTtyZXR1cm57ZGlzdGFuY2U6cyxpbmRleDpuLWl9fSxvLmdldFNsaWRlRGlzdGFuY2U9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLnNsaWRlcy5sZW5ndGgscz10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmaT4xLG89cz9uLm1vZHVsbyhlLGkpOmUscj10aGlzLnNsaWRlc1tvXTtpZighcilyZXR1cm4gbnVsbDt2YXIgYT1zP3RoaXMuc2xpZGVhYmxlV2lkdGgqTWF0aC5mbG9vcihlL2kpOjA7cmV0dXJuIHQtKHIudGFyZ2V0K2EpfSxvLmRyYWdFbmRCb29zdFNlbGVjdD1mdW5jdGlvbigpe2lmKHZvaWQgMD09PXRoaXMucHJldmlvdXNEcmFnWHx8IXRoaXMuZHJhZ01vdmVUaW1lfHxuZXcgRGF0ZS10aGlzLmRyYWdNb3ZlVGltZT4xMDApcmV0dXJuIDA7dmFyIHQ9dGhpcy5nZXRTbGlkZURpc3RhbmNlKC10aGlzLmRyYWdYLHRoaXMuc2VsZWN0ZWRJbmRleCksZT10aGlzLnByZXZpb3VzRHJhZ1gtdGhpcy5kcmFnWDtyZXR1cm4gdD4wJiZlPjA/MTp0PDAmJmU8MD8tMTowfSxvLnN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5nZXRQYXJlbnRDZWxsKHQudGFyZ2V0KSxuPWkmJmkuZWxlbWVudCxzPWkmJnRoaXMuY2VsbHMuaW5kZXhPZihpKTt0aGlzLmRpc3BhdGNoRXZlbnQoXCJzdGF0aWNDbGlja1wiLHQsW2UsbixzXSl9LG8ub25zY3JvbGw9ZnVuY3Rpb24oKXt2YXIgdD1zKCksZT10aGlzLnBvaW50ZXJEb3duU2Nyb2xsLngtdC54LGk9dGhpcy5wb2ludGVyRG93blNjcm9sbC55LXQueTsoTWF0aC5hYnMoZSk+M3x8TWF0aC5hYnMoaSk+MykmJnRoaXMuX3BvaW50ZXJEb25lKCl9LGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsW1widW5pcG9pbnRlci91bmlwb2ludGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcInVuaXBvaW50ZXJcIikpOnQuVGFwTGlzdGVuZXI9ZSh0LHQuVW5pcG9pbnRlcil9KHdpbmRvdyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCl7dGhpcy5iaW5kVGFwKHQpfXZhciBuPWkucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3JldHVybiBuLmJpbmRUYXA9ZnVuY3Rpb24odCl7dCYmKHRoaXMudW5iaW5kVGFwKCksdGhpcy50YXBFbGVtZW50PXQsdGhpcy5fYmluZFN0YXJ0RXZlbnQodCwhMCkpfSxuLnVuYmluZFRhcD1mdW5jdGlvbigpe3RoaXMudGFwRWxlbWVudCYmKHRoaXMuX2JpbmRTdGFydEV2ZW50KHRoaXMudGFwRWxlbWVudCwhMCksZGVsZXRlIHRoaXMudGFwRWxlbWVudCl9LG4ucG9pbnRlclVwPWZ1bmN0aW9uKGksbil7aWYoIXRoaXMuaXNJZ25vcmluZ01vdXNlVXB8fFwibW91c2V1cFwiIT1pLnR5cGUpe3ZhciBzPWUuZ2V0UG9pbnRlclBvaW50KG4pLG89dGhpcy50YXBFbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLHI9dC5wYWdlWE9mZnNldCxhPXQucGFnZVlPZmZzZXQsbD1zLng+PW8ubGVmdCtyJiZzLng8PW8ucmlnaHQrciYmcy55Pj1vLnRvcCthJiZzLnk8PW8uYm90dG9tK2E7aWYobCYmdGhpcy5lbWl0RXZlbnQoXCJ0YXBcIixbaSxuXSksXCJtb3VzZXVwXCIhPWkudHlwZSl7dGhpcy5pc0lnbm9yaW5nTW91c2VVcD0hMDt2YXIgaD10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgaC5pc0lnbm9yaW5nTW91c2VVcH0sNDAwKX19fSxuLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLnBvaW50ZXJEb25lKCksdGhpcy51bmJpbmRUYXAoKX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3ByZXYtbmV4dC1idXR0b25cIixbXCIuL2ZsaWNraXR5XCIsXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInRhcC1saXN0ZW5lclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuVGFwTGlzdGVuZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gcyh0LGUpe3RoaXMuZGlyZWN0aW9uPXQsdGhpcy5wYXJlbnQ9ZSx0aGlzLl9jcmVhdGUoKX1mdW5jdGlvbiBvKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P3Q6XCJNIFwiK3QueDArXCIsNTAgTCBcIit0LngxK1wiLFwiKyh0LnkxKzUwKStcIiBMIFwiK3QueDIrXCIsXCIrKHQueTIrNTApK1wiIEwgXCIrdC54MytcIiw1MCAgTCBcIit0LngyK1wiLFwiKyg1MC10LnkyKStcIiBMIFwiK3QueDErXCIsXCIrKDUwLXQueTEpK1wiIFpcIn12YXIgcj1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCI7cy5wcm90b3R5cGU9bmV3IGkscy5wcm90b3R5cGUuX2NyZWF0ZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkPSEwLHRoaXMuaXNQcmV2aW91cz10aGlzLmRpcmVjdGlvbj09LTE7dmFyIHQ9dGhpcy5wYXJlbnQub3B0aW9ucy5yaWdodFRvTGVmdD8xOi0xO3RoaXMuaXNMZWZ0PXRoaXMuZGlyZWN0aW9uPT10O3ZhciBlPXRoaXMuZWxlbWVudD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYnV0dG9uXCIpO2UuY2xhc3NOYW1lPVwiZmxpY2tpdHktcHJldi1uZXh0LWJ1dHRvblwiLGUuY2xhc3NOYW1lKz10aGlzLmlzUHJldmlvdXM/XCIgcHJldmlvdXNcIjpcIiBuZXh0XCIsZS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJidXR0b25cIiksdGhpcy5kaXNhYmxlKCksZS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsdGhpcy5pc1ByZXZpb3VzP1wicHJldmlvdXNcIjpcIm5leHRcIik7dmFyIGk9dGhpcy5jcmVhdGVTVkcoKTtlLmFwcGVuZENoaWxkKGkpLHRoaXMub24oXCJ0YXBcIix0aGlzLm9uVGFwKSx0aGlzLnBhcmVudC5vbihcInNlbGVjdFwiLHRoaXMudXBkYXRlLmJpbmQodGhpcykpLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKHRoaXMucGFyZW50KSl9LHMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5iaW5kVGFwKHRoaXMuZWxlbWVudCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMpLHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KX0scy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KSxpLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcyksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMpfSxzLnByb3RvdHlwZS5jcmVhdGVTVkc9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMocixcInN2Z1wiKTt0LnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIixcIjAgMCAxMDAgMTAwXCIpO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhyLFwicGF0aFwiKSxpPW8odGhpcy5wYXJlbnQub3B0aW9ucy5hcnJvd1NoYXBlKTtyZXR1cm4gZS5zZXRBdHRyaWJ1dGUoXCJkXCIsaSksZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLFwiYXJyb3dcIiksdGhpcy5pc0xlZnR8fGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsXCJ0cmFuc2xhdGUoMTAwLCAxMDApIHJvdGF0ZSgxODApIFwiKSx0LmFwcGVuZENoaWxkKGUpLHR9LHMucHJvdG90eXBlLm9uVGFwPWZ1bmN0aW9uKCl7aWYodGhpcy5pc0VuYWJsZWQpe3RoaXMucGFyZW50LnVpQ2hhbmdlKCk7dmFyIHQ9dGhpcy5pc1ByZXZpb3VzP1wicHJldmlvdXNcIjpcIm5leHRcIjt0aGlzLnBhcmVudFt0XSgpfX0scy5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9bi5oYW5kbGVFdmVudCxzLnByb3RvdHlwZS5vbmNsaWNrPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDt0JiZ0PT10aGlzLmVsZW1lbnQmJnRoaXMub25UYXAoKX0scy5wcm90b3R5cGUuZW5hYmxlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWR8fCh0aGlzLmVsZW1lbnQuZGlzYWJsZWQ9ITEsdGhpcy5pc0VuYWJsZWQ9ITApfSxzLnByb3RvdHlwZS5kaXNhYmxlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWQmJih0aGlzLmVsZW1lbnQuZGlzYWJsZWQ9ITAsdGhpcy5pc0VuYWJsZWQ9ITEpfSxzLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnBhcmVudC5zbGlkZXM7aWYodGhpcy5wYXJlbnQub3B0aW9ucy53cmFwQXJvdW5kJiZ0Lmxlbmd0aD4xKXJldHVybiB2b2lkIHRoaXMuZW5hYmxlKCk7dmFyIGU9dC5sZW5ndGg/dC5sZW5ndGgtMTowLGk9dGhpcy5pc1ByZXZpb3VzPzA6ZSxuPXRoaXMucGFyZW50LnNlbGVjdGVkSW5kZXg9PWk/XCJkaXNhYmxlXCI6XCJlbmFibGVcIjt0aGlzW25dKCl9LHMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKX0sbi5leHRlbmQoZS5kZWZhdWx0cyx7cHJldk5leHRCdXR0b25zOiEwLGFycm93U2hhcGU6e3gwOjEwLHgxOjYwLHkxOjUwLHgyOjcwLHkyOjQwLHgzOjMwfX0pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVByZXZOZXh0QnV0dG9uc1wiKTt2YXIgYT1lLnByb3RvdHlwZTtyZXR1cm4gYS5fY3JlYXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnByZXZOZXh0QnV0dG9ucyYmKHRoaXMucHJldkJ1dHRvbj1uZXcgcygoLTEpLHRoaXMpLHRoaXMubmV4dEJ1dHRvbj1uZXcgcygxLHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpKX0sYS5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMucHJldkJ1dHRvbi5hY3RpdmF0ZSgpLHRoaXMubmV4dEJ1dHRvbi5hY3RpdmF0ZSgpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zKX0sYS5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5wcmV2QnV0dG9uLmRlYWN0aXZhdGUoKSx0aGlzLm5leHRCdXR0b24uZGVhY3RpdmF0ZSgpLHRoaXMub2ZmKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyl9LGUuUHJldk5leHRCdXR0b249cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcGFnZS1kb3RzXCIsW1wiLi9mbGlja2l0eVwiLFwidGFwLWxpc3RlbmVyL3RhcC1saXN0ZW5lclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ0YXAtbGlzdGVuZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LlRhcExpc3RlbmVyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe2Z1bmN0aW9uIHModCl7dGhpcy5wYXJlbnQ9dCx0aGlzLl9jcmVhdGUoKX1zLnByb3RvdHlwZT1uZXcgaSxzLnByb3RvdHlwZS5fY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5ob2xkZXI9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9sXCIpLHRoaXMuaG9sZGVyLmNsYXNzTmFtZT1cImZsaWNraXR5LXBhZ2UtZG90c1wiLHRoaXMuZG90cz1bXSx0aGlzLm9uKFwidGFwXCIsdGhpcy5vblRhcCksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5wYXJlbnQuY2hpbGRVSVBvaW50ZXJEb3duLmJpbmQodGhpcy5wYXJlbnQpKX0scy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnNldERvdHMoKSx0aGlzLmJpbmRUYXAodGhpcy5ob2xkZXIpLHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5ob2xkZXIpfSxzLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmhvbGRlciksaS5wcm90b3R5cGUuZGVzdHJveS5jYWxsKHRoaXMpfSxzLnByb3RvdHlwZS5zZXREb3RzPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5wYXJlbnQuc2xpZGVzLmxlbmd0aC10aGlzLmRvdHMubGVuZ3RoO3Q+MD90aGlzLmFkZERvdHModCk6dDwwJiZ0aGlzLnJlbW92ZURvdHMoLXQpfSxzLnByb3RvdHlwZS5hZGREb3RzPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT1kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCksaT1bXTt0Oyl7dmFyIG49ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO24uY2xhc3NOYW1lPVwiZG90XCIsZS5hcHBlbmRDaGlsZChuKSxpLnB1c2gobiksdC0tfXRoaXMuaG9sZGVyLmFwcGVuZENoaWxkKGUpLHRoaXMuZG90cz10aGlzLmRvdHMuY29uY2F0KGkpfSxzLnByb3RvdHlwZS5yZW1vdmVEb3RzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZG90cy5zcGxpY2UodGhpcy5kb3RzLmxlbmd0aC10LHQpO2UuZm9yRWFjaChmdW5jdGlvbih0KXt0aGlzLmhvbGRlci5yZW1vdmVDaGlsZCh0KX0sdGhpcyl9LHMucHJvdG90eXBlLnVwZGF0ZVNlbGVjdGVkPWZ1bmN0aW9uKCl7dGhpcy5zZWxlY3RlZERvdCYmKHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lPVwiZG90XCIpLHRoaXMuZG90cy5sZW5ndGgmJih0aGlzLnNlbGVjdGVkRG90PXRoaXMuZG90c1t0aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4XSx0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZT1cImRvdCBpcy1zZWxlY3RlZFwiKX0scy5wcm90b3R5cGUub25UYXA9ZnVuY3Rpb24odCl7dmFyIGU9dC50YXJnZXQ7aWYoXCJMSVwiPT1lLm5vZGVOYW1lKXt0aGlzLnBhcmVudC51aUNoYW5nZSgpO3ZhciBpPXRoaXMuZG90cy5pbmRleE9mKGUpO3RoaXMucGFyZW50LnNlbGVjdChpKX19LHMucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKX0sZS5QYWdlRG90cz1zLG4uZXh0ZW5kKGUuZGVmYXVsdHMse3BhZ2VEb3RzOiEwfSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUGFnZURvdHNcIik7dmFyIG89ZS5wcm90b3R5cGU7cmV0dXJuIG8uX2NyZWF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnBhZ2VEb3RzJiYodGhpcy5wYWdlRG90cz1uZXcgcyh0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUGFnZURvdHMpLHRoaXMub24oXCJzZWxlY3RcIix0aGlzLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHMpLHRoaXMub24oXCJjZWxsQ2hhbmdlXCIsdGhpcy51cGRhdGVQYWdlRG90cyksdGhpcy5vbihcInJlc2l6ZVwiLHRoaXMudXBkYXRlUGFnZURvdHMpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUGFnZURvdHMpKX0sby5hY3RpdmF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5hY3RpdmF0ZSgpfSxvLnVwZGF0ZVNlbGVjdGVkUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLnVwZGF0ZVNlbGVjdGVkKCl9LG8udXBkYXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLnNldERvdHMoKX0sby5kZWFjdGl2YXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLmRlYWN0aXZhdGUoKX0sZS5QYWdlRG90cz1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wbGF5ZXJcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsXCIuL2ZsaWNraXR5XCJdLGZ1bmN0aW9uKHQsaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSk6ZSh0LkV2RW1pdHRlcix0LmZpenp5VUlVdGlscyx0LkZsaWNraXR5KX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQpe3RoaXMucGFyZW50PXQsdGhpcy5zdGF0ZT1cInN0b3BwZWRcIixvJiYodGhpcy5vblZpc2liaWxpdHlDaGFuZ2U9ZnVuY3Rpb24oKXt0aGlzLnZpc2liaWxpdHlDaGFuZ2UoKX0uYmluZCh0aGlzKSx0aGlzLm9uVmlzaWJpbGl0eVBsYXk9ZnVuY3Rpb24oKXt0aGlzLnZpc2liaWxpdHlQbGF5KCl9LmJpbmQodGhpcykpfXZhciBzLG87XCJoaWRkZW5cImluIGRvY3VtZW50PyhzPVwiaGlkZGVuXCIsbz1cInZpc2liaWxpdHljaGFuZ2VcIik6XCJ3ZWJraXRIaWRkZW5cImluIGRvY3VtZW50JiYocz1cIndlYmtpdEhpZGRlblwiLG89XCJ3ZWJraXR2aXNpYmlsaXR5Y2hhbmdlXCIpLG4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUodC5wcm90b3R5cGUpLG4ucHJvdG90eXBlLnBsYXk9ZnVuY3Rpb24oKXtpZihcInBsYXlpbmdcIiE9dGhpcy5zdGF0ZSl7dmFyIHQ9ZG9jdW1lbnRbc107aWYobyYmdClyZXR1cm4gdm9pZCBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlQbGF5KTt0aGlzLnN0YXRlPVwicGxheWluZ1wiLG8mJmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSksdGhpcy50aWNrKCl9fSxuLnByb3RvdHlwZS50aWNrPWZ1bmN0aW9uKCl7aWYoXCJwbGF5aW5nXCI9PXRoaXMuc3RhdGUpe3ZhciB0PXRoaXMucGFyZW50Lm9wdGlvbnMuYXV0b1BsYXk7dD1cIm51bWJlclwiPT10eXBlb2YgdD90OjNlMzt2YXIgZT10aGlzO3RoaXMuY2xlYXIoKSx0aGlzLnRpbWVvdXQ9c2V0VGltZW91dChmdW5jdGlvbigpe2UucGFyZW50Lm5leHQoITApLGUudGljaygpfSx0KX19LG4ucHJvdG90eXBlLnN0b3A9ZnVuY3Rpb24oKXt0aGlzLnN0YXRlPVwic3RvcHBlZFwiLHRoaXMuY2xlYXIoKSxvJiZkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UpfSxuLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe2NsZWFyVGltZW91dCh0aGlzLnRpbWVvdXQpfSxuLnByb3RvdHlwZS5wYXVzZT1mdW5jdGlvbigpe1wicGxheWluZ1wiPT10aGlzLnN0YXRlJiYodGhpcy5zdGF0ZT1cInBhdXNlZFwiLHRoaXMuY2xlYXIoKSl9LG4ucHJvdG90eXBlLnVucGF1c2U9ZnVuY3Rpb24oKXtcInBhdXNlZFwiPT10aGlzLnN0YXRlJiZ0aGlzLnBsYXkoKX0sbi5wcm90b3R5cGUudmlzaWJpbGl0eUNoYW5nZT1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50W3NdO3RoaXNbdD9cInBhdXNlXCI6XCJ1bnBhdXNlXCJdKCl9LG4ucHJvdG90eXBlLnZpc2liaWxpdHlQbGF5PWZ1bmN0aW9uKCl7dGhpcy5wbGF5KCksZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5UGxheSl9LGUuZXh0ZW5kKGkuZGVmYXVsdHMse3BhdXNlQXV0b1BsYXlPbkhvdmVyOiEwfSksaS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUGxheWVyXCIpO3ZhciByPWkucHJvdG90eXBlO3JldHVybiByLl9jcmVhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllcj1uZXcgbih0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUGxheWVyKSx0aGlzLm9uKFwidWlDaGFuZ2VcIix0aGlzLnN0b3BQbGF5ZXIpLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMuc3RvcFBsYXllciksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQbGF5ZXIpfSxyLmFjdGl2YXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmF1dG9QbGF5JiYodGhpcy5wbGF5ZXIucGxheSgpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLHRoaXMpKX0sci5wbGF5UGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIucGxheSgpfSxyLnN0b3BQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5zdG9wKCl9LHIucGF1c2VQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5wYXVzZSgpfSxyLnVucGF1c2VQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci51bnBhdXNlKCl9LHIuZGVhY3RpdmF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnN0b3AoKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIix0aGlzKX0sci5vbm1vdXNlZW50ZXI9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucGF1c2VBdXRvUGxheU9uSG92ZXImJih0aGlzLnBsYXllci5wYXVzZSgpLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLHRoaXMpKX0sci5vbm1vdXNlbGVhdmU9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci51bnBhdXNlKCksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsdGhpcyl9LGkuUGxheWVyPW4saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2FkZC1yZW1vdmUtY2VsbFwiLFtcIi4vZmxpY2tpdHlcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7ZS5hcHBlbmRDaGlsZCh0LmVsZW1lbnQpfSksZX12YXIgcz1lLnByb3RvdHlwZTtyZXR1cm4gcy5pbnNlcnQ9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9tYWtlQ2VsbHModCk7aWYoaSYmaS5sZW5ndGgpe3ZhciBzPXRoaXMuY2VsbHMubGVuZ3RoO2U9dm9pZCAwPT09ZT9zOmU7dmFyIG89bihpKSxyPWU9PXM7aWYocil0aGlzLnNsaWRlci5hcHBlbmRDaGlsZChvKTtlbHNle3ZhciBhPXRoaXMuY2VsbHNbZV0uZWxlbWVudDt0aGlzLnNsaWRlci5pbnNlcnRCZWZvcmUobyxhKX1pZigwPT09ZSl0aGlzLmNlbGxzPWkuY29uY2F0KHRoaXMuY2VsbHMpO2Vsc2UgaWYocil0aGlzLmNlbGxzPXRoaXMuY2VsbHMuY29uY2F0KGkpO2Vsc2V7dmFyIGw9dGhpcy5jZWxscy5zcGxpY2UoZSxzLWUpO3RoaXMuY2VsbHM9dGhpcy5jZWxscy5jb25jYXQoaSkuY29uY2F0KGwpfXRoaXMuX3NpemVDZWxscyhpKTt2YXIgaD1lPnRoaXMuc2VsZWN0ZWRJbmRleD8wOmkubGVuZ3RoO3RoaXMuX2NlbGxBZGRlZFJlbW92ZWQoZSxoKX19LHMuYXBwZW5kPWZ1bmN0aW9uKHQpe3RoaXMuaW5zZXJ0KHQsdGhpcy5jZWxscy5sZW5ndGgpfSxzLnByZXBlbmQ9ZnVuY3Rpb24odCl7dGhpcy5pbnNlcnQodCwwKX0scy5yZW1vdmU9ZnVuY3Rpb24odCl7dmFyIGUsbixzPXRoaXMuZ2V0Q2VsbHModCksbz0wLHI9cy5sZW5ndGg7Zm9yKGU9MDtlPHI7ZSsrKXtuPXNbZV07dmFyIGE9dGhpcy5jZWxscy5pbmRleE9mKG4pPHRoaXMuc2VsZWN0ZWRJbmRleDtvLT1hPzE6MH1mb3IoZT0wO2U8cjtlKyspbj1zW2VdLG4ucmVtb3ZlKCksaS5yZW1vdmVGcm9tKHRoaXMuY2VsbHMsbik7cy5sZW5ndGgmJnRoaXMuX2NlbGxBZGRlZFJlbW92ZWQoMCxvKX0scy5fY2VsbEFkZGVkUmVtb3ZlZD1mdW5jdGlvbih0LGUpe2U9ZXx8MCx0aGlzLnNlbGVjdGVkSW5kZXgrPWUsdGhpcy5zZWxlY3RlZEluZGV4PU1hdGgubWF4KDAsTWF0aC5taW4odGhpcy5zbGlkZXMubGVuZ3RoLTEsdGhpcy5zZWxlY3RlZEluZGV4KSksdGhpcy5jZWxsQ2hhbmdlKHQsITApLHRoaXMuZW1pdEV2ZW50KFwiY2VsbEFkZGVkUmVtb3ZlZFwiLFt0LGVdKX0scy5jZWxsU2l6ZUNoYW5nZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldENlbGwodCk7aWYoZSl7ZS5nZXRTaXplKCk7dmFyIGk9dGhpcy5jZWxscy5pbmRleE9mKGUpO3RoaXMuY2VsbENoYW5nZShpKX19LHMuY2VsbENoYW5nZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuc2xpZGVhYmxlV2lkdGg7aWYodGhpcy5fcG9zaXRpb25DZWxscyh0KSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmVtaXRFdmVudChcImNlbGxDaGFuZ2VcIixbdF0pLHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsKXt2YXIgbj1pLXRoaXMuc2xpZGVhYmxlV2lkdGg7dGhpcy54Kz1uKnRoaXMuY2VsbEFsaWduLHRoaXMucG9zaXRpb25TbGlkZXIoKX1lbHNlIGUmJnRoaXMucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCksdGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4KX0sZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2xhenlsb2FkXCIsW1wiLi9mbGlja2l0eVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbih0KXtpZihcIklNR1wiPT10Lm5vZGVOYW1lJiZ0LmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIikpcmV0dXJuW3RdO3ZhciBlPXQucXVlcnlTZWxlY3RvckFsbChcImltZ1tkYXRhLWZsaWNraXR5LWxhenlsb2FkXVwiKTtyZXR1cm4gaS5tYWtlQXJyYXkoZSl9ZnVuY3Rpb24gcyh0LGUpe3RoaXMuaW1nPXQsdGhpcy5mbGlja2l0eT1lLHRoaXMubG9hZCgpfWUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUxhenlsb2FkXCIpO3ZhciBvPWUucHJvdG90eXBlO3JldHVybiBvLl9jcmVhdGVMYXp5bG9hZD1mdW5jdGlvbigpe3RoaXMub24oXCJzZWxlY3RcIix0aGlzLmxhenlMb2FkKX0sby5sYXp5TG9hZD1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5sYXp5TG9hZDtpZih0KXt2YXIgZT1cIm51bWJlclwiPT10eXBlb2YgdD90OjAsaT10aGlzLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzKGUpLG89W107aS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3ZhciBlPW4odCk7bz1vLmNvbmNhdChlKX0pLG8uZm9yRWFjaChmdW5jdGlvbih0KXtuZXcgcyh0LHRoaXMpfSx0aGlzKX19LHMucHJvdG90eXBlLmhhbmRsZUV2ZW50PWkuaGFuZGxlRXZlbnQscy5wcm90b3R5cGUubG9hZD1mdW5jdGlvbigpe3RoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuc3JjPXRoaXMuaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIiksdGhpcy5pbWcucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKX0scy5wcm90b3R5cGUub25sb2FkPWZ1bmN0aW9uKHQpe3RoaXMuY29tcGxldGUodCxcImZsaWNraXR5LWxhenlsb2FkZWRcIil9LHMucHJvdG90eXBlLm9uZXJyb3I9ZnVuY3Rpb24odCl7dGhpcy5jb21wbGV0ZSh0LFwiZmxpY2tpdHktbGF6eWVycm9yXCIpfSxzLnByb3RvdHlwZS5jb21wbGV0ZT1mdW5jdGlvbih0LGUpe3RoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyk7dmFyIGk9dGhpcy5mbGlja2l0eS5nZXRQYXJlbnRDZWxsKHRoaXMuaW1nKSxuPWkmJmkuZWxlbWVudDt0aGlzLmZsaWNraXR5LmNlbGxTaXplQ2hhbmdlKG4pLHRoaXMuaW1nLmNsYXNzTGlzdC5hZGQoZSksdGhpcy5mbGlja2l0eS5kaXNwYXRjaEV2ZW50KFwibGF6eUxvYWRcIix0LG4pfSxlLkxhenlMb2FkZXI9cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvaW5kZXhcIixbXCIuL2ZsaWNraXR5XCIsXCIuL2RyYWdcIixcIi4vcHJldi1uZXh0LWJ1dHRvblwiLFwiLi9wYWdlLWRvdHNcIixcIi4vcGxheWVyXCIsXCIuL2FkZC1yZW1vdmUtY2VsbFwiLFwiLi9sYXp5bG9hZFwiXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyYmKG1vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcIi4vZHJhZ1wiKSxyZXF1aXJlKFwiLi9wcmV2LW5leHQtYnV0dG9uXCIpLHJlcXVpcmUoXCIuL3BhZ2UtZG90c1wiKSxyZXF1aXJlKFwiLi9wbGF5ZXJcIikscmVxdWlyZShcIi4vYWRkLXJlbW92ZS1jZWxsXCIpLHJlcXVpcmUoXCIuL2xhenlsb2FkXCIpKSl9KHdpbmRvdyxmdW5jdGlvbih0KXtyZXR1cm4gdH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5LWFzLW5hdi1mb3IvYXMtbmF2LWZvclwiLFtcImZsaWNraXR5L2pzL2luZGV4XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCJmbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOnQuRmxpY2tpdHk9ZSh0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUsaSl7cmV0dXJuKGUtdCkqaSt0fXQuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUFzTmF2Rm9yXCIpO3ZhciBuPXQucHJvdG90eXBlO3JldHVybiBuLl9jcmVhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVBc05hdkZvciksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVBc05hdkZvciksdGhpcy5vbihcImRlc3Ryb3lcIix0aGlzLmRlc3Ryb3lBc05hdkZvcik7dmFyIHQ9dGhpcy5vcHRpb25zLmFzTmF2Rm9yO2lmKHQpe3ZhciBlPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2Uuc2V0TmF2Q29tcGFuaW9uKHQpfSl9fSxuLnNldE5hdkNvbXBhbmlvbj1mdW5jdGlvbihpKXtpPWUuZ2V0UXVlcnlFbGVtZW50KGkpO3ZhciBuPXQuZGF0YShpKTtpZihuJiZuIT10aGlzKXt0aGlzLm5hdkNvbXBhbmlvbj1uO3ZhciBzPXRoaXM7dGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdD1mdW5jdGlvbigpe3MubmF2Q29tcGFuaW9uU2VsZWN0KCl9LG4ub24oXCJzZWxlY3RcIix0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0KSx0aGlzLm9uKFwic3RhdGljQ2xpY2tcIix0aGlzLm9uTmF2U3RhdGljQ2xpY2spLHRoaXMubmF2Q29tcGFuaW9uU2VsZWN0KCEwKX19LG4ubmF2Q29tcGFuaW9uU2VsZWN0PWZ1bmN0aW9uKHQpe2lmKHRoaXMubmF2Q29tcGFuaW9uKXt2YXIgZT10aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RlZENlbGxzWzBdLG49dGhpcy5uYXZDb21wYW5pb24uY2VsbHMuaW5kZXhPZihlKSxzPW4rdGhpcy5uYXZDb21wYW5pb24uc2VsZWN0ZWRDZWxscy5sZW5ndGgtMSxvPU1hdGguZmxvb3IoaShuLHMsdGhpcy5uYXZDb21wYW5pb24uY2VsbEFsaWduKSk7aWYodGhpcy5zZWxlY3RDZWxsKG8sITEsdCksdGhpcy5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzKCksIShvPj10aGlzLmNlbGxzLmxlbmd0aCkpe3ZhciByPXRoaXMuY2VsbHMuc2xpY2UobixzKzEpO3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cz1yLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSksdGhpcy5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzKFwiYWRkXCIpfX19LG4uY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcz1mdW5jdGlvbih0KXt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlKXtlLmNsYXNzTGlzdFt0XShcImlzLW5hdi1zZWxlY3RlZFwiKX0pfSxuLmFjdGl2YXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm5hdkNvbXBhbmlvblNlbGVjdCghMCl9LG4ucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cz1mdW5jdGlvbigpe3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cyYmKHRoaXMuY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyhcInJlbW92ZVwiKSxkZWxldGUgdGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzKX0sbi5vbk5hdlN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSxpLG4pe1wibnVtYmVyXCI9PXR5cGVvZiBuJiZ0aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RDZWxsKG4pfSxuLmRlYWN0aXZhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cygpfSxuLmRlc3Ryb3lBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMubmF2Q29tcGFuaW9uJiYodGhpcy5uYXZDb21wYW5pb24ub2ZmKFwic2VsZWN0XCIsdGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdCksdGhpcy5vZmYoXCJzdGF0aWNDbGlja1wiLHRoaXMub25OYXZTdGF0aWNDbGljayksZGVsZXRlIHRoaXMubmF2Q29tcGFuaW9uKX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWRcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSk6dC5pbWFnZXNMb2FkZWQ9ZSh0LHQuRXZFbWl0dGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUpe2Zvcih2YXIgaSBpbiBlKXRbaV09ZVtpXTtyZXR1cm4gdH1mdW5jdGlvbiBuKHQpe3ZhciBlPVtdO2lmKEFycmF5LmlzQXJyYXkodCkpZT10O2Vsc2UgaWYoXCJudW1iZXJcIj09dHlwZW9mIHQubGVuZ3RoKWZvcih2YXIgaT0wO2k8dC5sZW5ndGg7aSsrKWUucHVzaCh0W2ldKTtlbHNlIGUucHVzaCh0KTtyZXR1cm4gZX1mdW5jdGlvbiBzKHQsZSxvKXtyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIHM/KFwic3RyaW5nXCI9PXR5cGVvZiB0JiYodD1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHQpKSx0aGlzLmVsZW1lbnRzPW4odCksdGhpcy5vcHRpb25zPWkoe30sdGhpcy5vcHRpb25zKSxcImZ1bmN0aW9uXCI9PXR5cGVvZiBlP289ZTppKHRoaXMub3B0aW9ucyxlKSxvJiZ0aGlzLm9uKFwiYWx3YXlzXCIsbyksdGhpcy5nZXRJbWFnZXMoKSxhJiYodGhpcy5qcURlZmVycmVkPW5ldyBhLkRlZmVycmVkKSx2b2lkIHNldFRpbWVvdXQoZnVuY3Rpb24oKXt0aGlzLmNoZWNrKCl9LmJpbmQodGhpcykpKTpuZXcgcyh0LGUsbyl9ZnVuY3Rpb24gbyh0KXt0aGlzLmltZz10fWZ1bmN0aW9uIHIodCxlKXt0aGlzLnVybD10LHRoaXMuZWxlbWVudD1lLHRoaXMuaW1nPW5ldyBJbWFnZX12YXIgYT10LmpRdWVyeSxsPXQuY29uc29sZTtzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxzLnByb3RvdHlwZS5vcHRpb25zPXt9LHMucHJvdG90eXBlLmdldEltYWdlcz1mdW5jdGlvbigpe3RoaXMuaW1hZ2VzPVtdLHRoaXMuZWxlbWVudHMuZm9yRWFjaCh0aGlzLmFkZEVsZW1lbnRJbWFnZXMsdGhpcyl9LHMucHJvdG90eXBlLmFkZEVsZW1lbnRJbWFnZXM9ZnVuY3Rpb24odCl7XCJJTUdcIj09dC5ub2RlTmFtZSYmdGhpcy5hZGRJbWFnZSh0KSx0aGlzLm9wdGlvbnMuYmFja2dyb3VuZD09PSEwJiZ0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKHQpO3ZhciBlPXQubm9kZVR5cGU7aWYoZSYmaFtlXSl7Zm9yKHZhciBpPXQucXVlcnlTZWxlY3RvckFsbChcImltZ1wiKSxuPTA7bjxpLmxlbmd0aDtuKyspe3ZhciBzPWlbbl07dGhpcy5hZGRJbWFnZShzKX1pZihcInN0cmluZ1wiPT10eXBlb2YgdGhpcy5vcHRpb25zLmJhY2tncm91bmQpe3ZhciBvPXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCk7Zm9yKG49MDtuPG8ubGVuZ3RoO24rKyl7dmFyIHI9b1tuXTt0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKHIpfX19fTt2YXIgaD17MTohMCw5OiEwLDExOiEwfTtyZXR1cm4gcy5wcm90b3R5cGUuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXM9ZnVuY3Rpb24odCl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZSh0KTtpZihlKWZvcih2YXIgaT0vdXJsXFwoKFsnXCJdKT8oLio/KVxcMVxcKS9naSxuPWkuZXhlYyhlLmJhY2tncm91bmRJbWFnZSk7bnVsbCE9PW47KXt2YXIgcz1uJiZuWzJdO3MmJnRoaXMuYWRkQmFja2dyb3VuZChzLHQpLG49aS5leGVjKGUuYmFja2dyb3VuZEltYWdlKX19LHMucHJvdG90eXBlLmFkZEltYWdlPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBvKHQpO3RoaXMuaW1hZ2VzLnB1c2goZSl9LHMucHJvdG90eXBlLmFkZEJhY2tncm91bmQ9ZnVuY3Rpb24odCxlKXt2YXIgaT1uZXcgcih0LGUpO3RoaXMuaW1hZ2VzLnB1c2goaSl9LHMucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGksbil7c2V0VGltZW91dChmdW5jdGlvbigpe2UucHJvZ3Jlc3ModCxpLG4pfSl9dmFyIGU9dGhpcztyZXR1cm4gdGhpcy5wcm9ncmVzc2VkQ291bnQ9MCx0aGlzLmhhc0FueUJyb2tlbj0hMSx0aGlzLmltYWdlcy5sZW5ndGg/dm9pZCB0aGlzLmltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2Uub25jZShcInByb2dyZXNzXCIsdCksZS5jaGVjaygpfSk6dm9pZCB0aGlzLmNvbXBsZXRlKCl9LHMucHJvdG90eXBlLnByb2dyZXNzPWZ1bmN0aW9uKHQsZSxpKXt0aGlzLnByb2dyZXNzZWRDb3VudCsrLHRoaXMuaGFzQW55QnJva2VuPXRoaXMuaGFzQW55QnJva2VufHwhdC5pc0xvYWRlZCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdCxlXSksdGhpcy5qcURlZmVycmVkJiZ0aGlzLmpxRGVmZXJyZWQubm90aWZ5JiZ0aGlzLmpxRGVmZXJyZWQubm90aWZ5KHRoaXMsdCksdGhpcy5wcm9ncmVzc2VkQ291bnQ9PXRoaXMuaW1hZ2VzLmxlbmd0aCYmdGhpcy5jb21wbGV0ZSgpLHRoaXMub3B0aW9ucy5kZWJ1ZyYmbCYmbC5sb2coXCJwcm9ncmVzczogXCIraSx0LGUpfSxzLnByb3RvdHlwZS5jb21wbGV0ZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMuaGFzQW55QnJva2VuP1wiZmFpbFwiOlwiZG9uZVwiO2lmKHRoaXMuaXNDb21wbGV0ZT0hMCx0aGlzLmVtaXRFdmVudCh0LFt0aGlzXSksdGhpcy5lbWl0RXZlbnQoXCJhbHdheXNcIixbdGhpc10pLHRoaXMuanFEZWZlcnJlZCl7dmFyIGU9dGhpcy5oYXNBbnlCcm9rZW4/XCJyZWplY3RcIjpcInJlc29sdmVcIjt0aGlzLmpxRGVmZXJyZWRbZV0odGhpcyl9fSxvLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxvLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe3ZhciB0PXRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7cmV0dXJuIHQ/dm9pZCB0aGlzLmNvbmZpcm0oMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aCxcIm5hdHVyYWxXaWR0aFwiKToodGhpcy5wcm94eUltYWdlPW5ldyBJbWFnZSx0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx2b2lkKHRoaXMucHJveHlJbWFnZS5zcmM9dGhpcy5pbWcuc3JjKSl9LG8ucHJvdG90eXBlLmdldElzSW1hZ2VDb21wbGV0ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmltZy5jb21wbGV0ZSYmdm9pZCAwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRofSxvLnByb3RvdHlwZS5jb25maXJtPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0xvYWRlZD10LHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0aGlzLmltZyxlXSl9LG8ucHJvdG90eXBlLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0sby5wcm90b3R5cGUub25sb2FkPWZ1bmN0aW9uKCl7dGhpcy5jb25maXJtKCEwLFwib25sb2FkXCIpLHRoaXMudW5iaW5kRXZlbnRzKCl9LG8ucHJvdG90eXBlLm9uZXJyb3I9ZnVuY3Rpb24oKXt0aGlzLmNvbmZpcm0oITEsXCJvbmVycm9yXCIpLHRoaXMudW5iaW5kRXZlbnRzKCl9LG8ucHJvdG90eXBlLnVuYmluZEV2ZW50cz1mdW5jdGlvbigpe3RoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpfSxyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKG8ucHJvdG90eXBlKSxyLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe3RoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuc3JjPXRoaXMudXJsO3ZhciB0PXRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7dCYmKHRoaXMuY29uZmlybSgwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRoLFwibmF0dXJhbFdpZHRoXCIpLHRoaXMudW5iaW5kRXZlbnRzKCkpfSxyLnByb3RvdHlwZS51bmJpbmRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpfSxyLnByb3RvdHlwZS5jb25maXJtPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0xvYWRlZD10LHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0aGlzLmVsZW1lbnQsZV0pfSxzLm1ha2VKUXVlcnlQbHVnaW49ZnVuY3Rpb24oZSl7ZT1lfHx0LmpRdWVyeSxlJiYoYT1lLGEuZm4uaW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKHQsZSl7dmFyIGk9bmV3IHModGhpcyx0LGUpO3JldHVybiBpLmpxRGVmZXJyZWQucHJvbWlzZShhKHRoaXMpKX0pfSxzLm1ha2VKUXVlcnlQbHVnaW4oKSxzfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImZsaWNraXR5L2pzL2luZGV4XCIsXCJpbWFnZXNsb2FkZWQvaW1hZ2VzbG9hZGVkXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJmbGlja2l0eVwiKSxyZXF1aXJlKFwiaW1hZ2VzbG9hZGVkXCIpKTp0LkZsaWNraXR5PWUodCx0LkZsaWNraXR5LHQuaW1hZ2VzTG9hZGVkKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtcInVzZSBzdHJpY3RcIjtlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVJbWFnZXNMb2FkZWRcIik7dmFyIG49ZS5wcm90b3R5cGU7cmV0dXJuIG4uX2NyZWF0ZUltYWdlc0xvYWRlZD1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuaW1hZ2VzTG9hZGVkKX0sbi5pbWFnZXNMb2FkZWQ9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsaSl7dmFyIG49ZS5nZXRQYXJlbnRDZWxsKGkuaW1nKTtlLmNlbGxTaXplQ2hhbmdlKG4mJm4uZWxlbWVudCksZS5vcHRpb25zLmZyZWVTY3JvbGx8fGUucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCl9aWYodGhpcy5vcHRpb25zLmltYWdlc0xvYWRlZCl7dmFyIGU9dGhpcztpKHRoaXMuc2xpZGVyKS5vbihcInByb2dyZXNzXCIsdCl9fSxlfSk7IiwiLyoqXG4gKiBGbGlja2l0eSBiYWNrZ3JvdW5kIGxhenlsb2FkIHYxLjAuMFxuICogbGF6eWxvYWQgYmFja2dyb3VuZCBjZWxsIGltYWdlc1xuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHVudXNlZDogdHJ1ZSwgdW5kZWY6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAnZmxpY2tpdHkvanMvaW5kZXgnLFxuICAgICAgJ2Zpenp5LXVpLXV0aWxzL3V0aWxzJ1xuICAgIF0sIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHJlcXVpcmUoJ2ZsaWNraXR5JyksXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIGZhY3RvcnkoXG4gICAgICB3aW5kb3cuRmxpY2tpdHksXG4gICAgICB3aW5kb3cuZml6enlVSVV0aWxzXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIEZsaWNraXR5LCB1dGlscyApIHtcbi8qanNoaW50IHN0cmljdDogdHJ1ZSAqL1xuJ3VzZSBzdHJpY3QnO1xuXG5GbGlja2l0eS5jcmVhdGVNZXRob2RzLnB1c2goJ19jcmVhdGVCZ0xhenlMb2FkJyk7XG5cbnZhciBwcm90byA9IEZsaWNraXR5LnByb3RvdHlwZTtcblxucHJvdG8uX2NyZWF0ZUJnTGF6eUxvYWQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5vbiggJ3NlbGVjdCcsIHRoaXMuYmdMYXp5TG9hZCApO1xufTtcblxucHJvdG8uYmdMYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICB2YXIgbGF6eUxvYWQgPSB0aGlzLm9wdGlvbnMuYmdMYXp5TG9hZDtcbiAgaWYgKCAhbGF6eUxvYWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gZ2V0IGFkamFjZW50IGNlbGxzLCB1c2UgbGF6eUxvYWQgb3B0aW9uIGZvciBhZGphY2VudCBjb3VudFxuICB2YXIgYWRqQ291bnQgPSB0eXBlb2YgbGF6eUxvYWQgPT0gJ251bWJlcicgPyBsYXp5TG9hZCA6IDA7XG4gIHZhciBjZWxsRWxlbXMgPSB0aGlzLmdldEFkamFjZW50Q2VsbEVsZW1lbnRzKCBhZGpDb3VudCApO1xuXG4gIGZvciAoIHZhciBpPTA7IGkgPCBjZWxsRWxlbXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIGNlbGxFbGVtID0gY2VsbEVsZW1zW2ldO1xuICAgIHRoaXMuYmdMYXp5TG9hZEVsZW0oIGNlbGxFbGVtICk7XG4gICAgLy8gc2VsZWN0IGxhenkgZWxlbXMgaW4gY2VsbFxuICAgIHZhciBjaGlsZHJlbiA9IGNlbGxFbGVtLnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkXScpO1xuICAgIGZvciAoIHZhciBqPTA7IGogPCBjaGlsZHJlbi5sZW5ndGg7IGorKyApIHtcbiAgICAgIHRoaXMuYmdMYXp5TG9hZEVsZW0oIGNoaWxkcmVuW2pdICk7XG4gICAgfVxuICB9XG59O1xuXG5wcm90by5iZ0xhenlMb2FkRWxlbSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgYXR0ciA9IGVsZW0uZ2V0QXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkJyk7XG4gIGlmICggYXR0ciApIHtcbiAgICBuZXcgQmdMYXp5TG9hZGVyKCBlbGVtLCBhdHRyLCB0aGlzICk7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIExhenlCR0xvYWRlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGNsYXNzIHRvIGhhbmRsZSBsb2FkaW5nIGltYWdlc1xuICovXG5mdW5jdGlvbiBCZ0xhenlMb2FkZXIoIGVsZW0sIHVybCwgZmxpY2tpdHkgKSB7XG4gIHRoaXMuZWxlbWVudCA9IGVsZW07XG4gIHRoaXMudXJsID0gdXJsO1xuICB0aGlzLmltZyA9IG5ldyBJbWFnZSgpO1xuICB0aGlzLmZsaWNraXR5ID0gZmxpY2tpdHk7XG4gIHRoaXMubG9hZCgpO1xufVxuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmhhbmRsZUV2ZW50ID0gdXRpbHMuaGFuZGxlRXZlbnQ7XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnbG9hZCcsIHRoaXMgKTtcbiAgdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lciggJ2Vycm9yJywgdGhpcyApO1xuICAvLyBsb2FkIGltYWdlXG4gIHRoaXMuaW1nLnNyYyA9IHRoaXMudXJsO1xuICAvLyByZW1vdmUgYXR0clxuICB0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKCdkYXRhLWZsaWNraXR5LWJnLWxhenlsb2FkJyk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLm9ubG9hZCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5lbGVtZW50LnN0eWxlLmJhY2tncm91bmRJbWFnZSA9ICd1cmwoJyArIHRoaXMudXJsICsgJyknO1xuICB0aGlzLmNvbXBsZXRlKCBldmVudCwgJ2ZsaWNraXR5LWJnLWxhenlsb2FkZWQnICk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLm9uZXJyb3IgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMuY29tcGxldGUoIGV2ZW50LCAnZmxpY2tpdHktYmctbGF6eWVycm9yJyApO1xufTtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5jb21wbGV0ZSA9IGZ1bmN0aW9uKCBldmVudCwgY2xhc3NOYW1lICkge1xuICAvLyB1bmJpbmQgZXZlbnRzXG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG5cbiAgdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoIGNsYXNzTmFtZSApO1xuICB0aGlzLmZsaWNraXR5LmRpc3BhdGNoRXZlbnQoICdiZ0xhenlMb2FkJywgZXZlbnQsIHRoaXMuZWxlbWVudCApO1xufTtcblxuLy8gLS0tLS0gIC0tLS0tIC8vXG5cbkZsaWNraXR5LkJnTGF6eUxvYWRlciA9IEJnTGF6eUxvYWRlcjtcblxucmV0dXJuIEZsaWNraXR5O1xuXG59KSk7XG4iLCIvKipcbiogIEFqYXggQXV0b2NvbXBsZXRlIGZvciBqUXVlcnksIHZlcnNpb24gMS4yLjI3XG4qICAoYykgMjAxNSBUb21hcyBLaXJkYVxuKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSBpcyBmcmVlbHkgZGlzdHJpYnV0YWJsZSB1bmRlciB0aGUgdGVybXMgb2YgYW4gTUlULXN0eWxlIGxpY2Vuc2UuXG4qICBGb3IgZGV0YWlscywgc2VlIHRoZSB3ZWIgc2l0ZTogaHR0cHM6Ly9naXRodWIuY29tL2RldmJyaWRnZS9qUXVlcnktQXV0b2NvbXBsZXRlXG4qL1xuXG4vKmpzbGludCAgYnJvd3NlcjogdHJ1ZSwgd2hpdGU6IHRydWUsIHNpbmdsZTogdHJ1ZSwgdGhpczogdHJ1ZSwgbXVsdGl2YXI6IHRydWUgKi9cbi8qZ2xvYmFsIGRlZmluZSwgd2luZG93LCBkb2N1bWVudCwgalF1ZXJ5LCBleHBvcnRzLCByZXF1aXJlICovXG5cbi8vIEV4cG9zZSBwbHVnaW4gYXMgYW4gQU1EIG1vZHVsZSBpZiBBTUQgbG9hZGVyIGlzIHByZXNlbnQ6XG4oZnVuY3Rpb24gKGZhY3RvcnkpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFsnanF1ZXJ5J10sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIEJyb3dzZXJpZnlcbiAgICAgICAgZmFjdG9yeShyZXF1aXJlKCdqcXVlcnknKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgICAgIGZhY3RvcnkoalF1ZXJ5KTtcbiAgICB9XG59KGZ1bmN0aW9uICgkKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyXG4gICAgICAgIHV0aWxzID0gKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgZXNjYXBlUmVnRXhDaGFyczogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS5yZXBsYWNlKC9bfFxcXFx7fSgpW1xcXV4kKyo/Ll0vZywgXCJcXFxcJCZcIik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjcmVhdGVOb2RlOiBmdW5jdGlvbiAoY29udGFpbmVyQ2xhc3MpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICAgICAgICAgICAgICBkaXYuY2xhc3NOYW1lID0gY29udGFpbmVyQ2xhc3M7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGl2O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0oKSksXG5cbiAgICAgICAga2V5cyA9IHtcbiAgICAgICAgICAgIEVTQzogMjcsXG4gICAgICAgICAgICBUQUI6IDksXG4gICAgICAgICAgICBSRVRVUk46IDEzLFxuICAgICAgICAgICAgTEVGVDogMzcsXG4gICAgICAgICAgICBVUDogMzgsXG4gICAgICAgICAgICBSSUdIVDogMzksXG4gICAgICAgICAgICBET1dOOiA0MFxuICAgICAgICB9O1xuXG4gICAgZnVuY3Rpb24gQXV0b2NvbXBsZXRlKGVsLCBvcHRpb25zKSB7XG4gICAgICAgIHZhciBub29wID0gJC5ub29wLFxuICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M6IHt9LFxuICAgICAgICAgICAgICAgIGF1dG9TZWxlY3RGaXJzdDogZmFsc2UsXG4gICAgICAgICAgICAgICAgYXBwZW5kVG86IGRvY3VtZW50LmJvZHksXG4gICAgICAgICAgICAgICAgc2VydmljZVVybDogbnVsbCxcbiAgICAgICAgICAgICAgICBsb29rdXA6IG51bGwsXG4gICAgICAgICAgICAgICAgb25TZWxlY3Q6IG51bGwsXG4gICAgICAgICAgICAgICAgd2lkdGg6ICdhdXRvJyxcbiAgICAgICAgICAgICAgICBtaW5DaGFyczogMSxcbiAgICAgICAgICAgICAgICBtYXhIZWlnaHQ6IDMwMCxcbiAgICAgICAgICAgICAgICBkZWZlclJlcXVlc3RCeTogMCxcbiAgICAgICAgICAgICAgICBwYXJhbXM6IHt9LFxuICAgICAgICAgICAgICAgIGZvcm1hdFJlc3VsdDogQXV0b2NvbXBsZXRlLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXI6IG51bGwsXG4gICAgICAgICAgICAgICAgekluZGV4OiA5OTk5LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoU3RhcnQ6IG5vb3AsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hDb21wbGV0ZTogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaEVycm9yOiBub29wLFxuICAgICAgICAgICAgICAgIHByZXNlcnZlSW5wdXQ6IGZhbHNlLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckNsYXNzOiAnYXV0b2NvbXBsZXRlLXN1Z2dlc3Rpb25zJyxcbiAgICAgICAgICAgICAgICB0YWJEaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICAgICAgZGF0YVR5cGU6ICd0ZXh0JyxcbiAgICAgICAgICAgICAgICBjdXJyZW50UmVxdWVzdDogbnVsbCxcbiAgICAgICAgICAgICAgICB0cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0OiB0cnVlLFxuICAgICAgICAgICAgICAgIHByZXZlbnRCYWRRdWVyaWVzOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxvb2t1cEZpbHRlcjogZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIG9yaWdpbmFsUXVlcnksIHF1ZXJ5TG93ZXJDYXNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihxdWVyeUxvd2VyQ2FzZSkgIT09IC0xO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFyYW1OYW1lOiAncXVlcnknLFxuICAgICAgICAgICAgICAgIHRyYW5zZm9ybVJlc3VsdDogZnVuY3Rpb24gKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0eXBlb2YgcmVzcG9uc2UgPT09ICdzdHJpbmcnID8gJC5wYXJzZUpTT04ocmVzcG9uc2UpIDogcmVzcG9uc2U7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzaG93Tm9TdWdnZXN0aW9uTm90aWNlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25Ob3RpY2U6ICdObyByZXN1bHRzJyxcbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbjogJ2JvdHRvbScsXG4gICAgICAgICAgICAgICAgZm9yY2VGaXhQb3NpdGlvbjogZmFsc2VcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgLy8gU2hhcmVkIHZhcmlhYmxlczpcbiAgICAgICAgdGhhdC5lbGVtZW50ID0gZWw7XG4gICAgICAgIHRoYXQuZWwgPSAkKGVsKTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IFtdO1xuICAgICAgICB0aGF0LmJhZFF1ZXJpZXMgPSBbXTtcbiAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgIHRoYXQuY3VycmVudFZhbHVlID0gdGhhdC5lbGVtZW50LnZhbHVlO1xuICAgICAgICB0aGF0LmludGVydmFsSWQgPSAwO1xuICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlID0ge307XG4gICAgICAgIHRoYXQub25DaGFuZ2VJbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHRoYXQub25DaGFuZ2UgPSBudWxsO1xuICAgICAgICB0aGF0LmlzTG9jYWwgPSBmYWxzZTtcbiAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9IG51bGw7XG4gICAgICAgIHRoYXQub3B0aW9ucyA9ICQuZXh0ZW5kKHt9LCBkZWZhdWx0cywgb3B0aW9ucyk7XG4gICAgICAgIHRoYXQuY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIHNlbGVjdGVkOiAnYXV0b2NvbXBsZXRlLXNlbGVjdGVkJyxcbiAgICAgICAgICAgIHN1Z2dlc3Rpb246ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbidcbiAgICAgICAgfTtcbiAgICAgICAgdGhhdC5oaW50ID0gbnVsbDtcbiAgICAgICAgdGhhdC5oaW50VmFsdWUgPSAnJztcbiAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuXG4gICAgICAgIC8vIEluaXRpYWxpemUgYW5kIHNldCBvcHRpb25zOlxuICAgICAgICB0aGF0LmluaXRpYWxpemUoKTtcbiAgICAgICAgdGhhdC5zZXRPcHRpb25zKG9wdGlvbnMpO1xuICAgIH1cblxuICAgIEF1dG9jb21wbGV0ZS51dGlscyA9IHV0aWxzO1xuXG4gICAgJC5BdXRvY29tcGxldGUgPSBBdXRvY29tcGxldGU7XG5cbiAgICBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0ID0gZnVuY3Rpb24gKHN1Z2dlc3Rpb24sIGN1cnJlbnRWYWx1ZSkge1xuICAgICAgICAvLyBEbyBub3QgcmVwbGFjZSBhbnl0aGluZyBpZiB0aGVyZSBjdXJyZW50IHZhbHVlIGlzIGVtcHR5XG4gICAgICAgIGlmICghY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdmFyIHBhdHRlcm4gPSAnKCcgKyB1dGlscy5lc2NhcGVSZWdFeENoYXJzKGN1cnJlbnRWYWx1ZSkgKyAnKSc7XG5cbiAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWVcbiAgICAgICAgICAgIC5yZXBsYWNlKG5ldyBSZWdFeHAocGF0dGVybiwgJ2dpJyksICc8c3Ryb25nPiQxPFxcL3N0cm9uZz4nKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAgICAgICAgIC5yZXBsYWNlKC8mbHQ7KFxcLz9zdHJvbmcpJmd0Oy9nLCAnPCQxPicpO1xuICAgIH07XG5cbiAgICBBdXRvY29tcGxldGUucHJvdG90eXBlID0ge1xuXG4gICAgICAgIGtpbGxlckZuOiBudWxsLFxuXG4gICAgICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uU2VsZWN0b3IgPSAnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBzZWxlY3RlZCA9IHRoYXQuY2xhc3Nlcy5zZWxlY3RlZCxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lcjtcblxuICAgICAgICAgICAgLy8gUmVtb3ZlIGF1dG9jb21wbGV0ZSBhdHRyaWJ1dGUgdG8gcHJldmVudCBuYXRpdmUgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICB0aGF0LmVsZW1lbnQuc2V0QXR0cmlidXRlKCdhdXRvY29tcGxldGUnLCAnb2ZmJyk7XG5cbiAgICAgICAgICAgIHRoYXQua2lsbGVyRm4gPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLicgKyB0aGF0Lm9wdGlvbnMuY29udGFpbmVyQ2xhc3MpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmRpc2FibGVLaWxsZXJGbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIC8vIGh0bWwoKSBkZWFscyB3aXRoIG1hbnkgdHlwZXM6IGh0bWxTdHJpbmcgb3IgRWxlbWVudCBvciBBcnJheSBvciBqUXVlcnlcbiAgICAgICAgICAgIHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtbm8tc3VnZ2VzdGlvblwiPjwvZGl2PicpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuaHRtbCh0aGlzLm9wdGlvbnMubm9TdWdnZXN0aW9uTm90aWNlKS5nZXQoMCk7XG5cbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIgPSBBdXRvY29tcGxldGUudXRpbHMuY3JlYXRlTm9kZShvcHRpb25zLmNvbnRhaW5lckNsYXNzKTtcblxuICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmFwcGVuZFRvKG9wdGlvbnMuYXBwZW5kVG8pO1xuXG4gICAgICAgICAgICAvLyBPbmx5IHNldCB3aWR0aCBpZiBpdCB3YXMgcHJvdmlkZWQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCAhPT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNzcygnd2lkdGgnLCBvcHRpb25zLndpZHRoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBtb3VzZSBvdmVyIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3Zlci5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmFjdGl2YXRlKCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gRGVzZWxlY3QgYWN0aXZlIGVsZW1lbnQgd2hlbiBtb3VzZSBsZWF2ZXMgc3VnZ2VzdGlvbnMgY29udGFpbmVyOlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdtb3VzZW91dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgLy8gTGlzdGVuIGZvciBjbGljayBldmVudCBvbiBzdWdnZXN0aW9ucyBsaXN0OlxuICAgICAgICAgICAgY29udGFpbmVyLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCBzdWdnZXN0aW9uU2VsZWN0b3IsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCgkKHRoaXMpLmRhdGEoJ2luZGV4JykpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG5cbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleWRvd24uYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVByZXNzKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2tleXVwLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdibHVyLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkJsdXIoKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdmb2N1cy5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoKSB7IHRoYXQub25Gb2N1cygpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2NoYW5nZS5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignaW5wdXQuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbkZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuZWwudmFsKCkubGVuZ3RoID49IHRoYXQub3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQub25WYWx1ZUNoYW5nZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uQmx1cjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5lbmFibGVLaWxsZXJGbigpO1xuICAgICAgICB9LFxuICAgICAgICBcbiAgICAgICAgYWJvcnRBamF4OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50UmVxdWVzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QuYWJvcnQoKTtcbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBzZXRPcHRpb25zOiBmdW5jdGlvbiAoc3VwcGxpZWRPcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgJC5leHRlbmQob3B0aW9ucywgc3VwcGxpZWRPcHRpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5pc0xvY2FsID0gJC5pc0FycmF5KG9wdGlvbnMubG9va3VwKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChvcHRpb25zLmxvb2t1cCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG9wdGlvbnMub3JpZW50YXRpb24gPSB0aGF0LnZhbGlkYXRlT3JpZW50YXRpb24ob3B0aW9ucy5vcmllbnRhdGlvbiwgJ2JvdHRvbScpO1xuXG4gICAgICAgICAgICAvLyBBZGp1c3QgaGVpZ2h0LCB3aWR0aCBhbmQgei1pbmRleDpcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuY3NzKHtcbiAgICAgICAgICAgICAgICAnbWF4LWhlaWdodCc6IG9wdGlvbnMubWF4SGVpZ2h0ICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnd2lkdGgnOiBvcHRpb25zLndpZHRoICsgJ3B4JyxcbiAgICAgICAgICAgICAgICAnei1pbmRleCc6IG9wdGlvbnMuekluZGV4XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcblxuXG4gICAgICAgIGNsZWFyQ2FjaGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNsZWFyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFyQ2FjaGUoKTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFZhbHVlID0gJyc7XG4gICAgICAgICAgICB0aGlzLnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmFib3J0QWpheCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGVuYWJsZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGZpeFBvc2l0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAvLyBVc2Ugb25seSB3aGVuIGNvbnRhaW5lciBoYXMgYWxyZWFkeSBpdHMgY29udGVudFxuXG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgJGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY29udGFpbmVyUGFyZW50ID0gJGNvbnRhaW5lci5wYXJlbnQoKS5nZXQoMCk7XG4gICAgICAgICAgICAvLyBGaXggcG9zaXRpb24gYXV0b21hdGljYWxseSB3aGVuIGFwcGVuZGVkIHRvIGJvZHkuXG4gICAgICAgICAgICAvLyBJbiBvdGhlciBjYXNlcyBmb3JjZSBwYXJhbWV0ZXIgbXVzdCBiZSBnaXZlbi5cbiAgICAgICAgICAgIGlmIChjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkgJiYgIXRoYXQub3B0aW9ucy5mb3JjZUZpeFBvc2l0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHNpdGVTZWFyY2hEaXYgPSAkKCcuc2l0ZS1zZWFyY2gnKTtcbiAgICAgICAgICAgIC8vIENob29zZSBvcmllbnRhdGlvblxuICAgICAgICAgICAgdmFyIG9yaWVudGF0aW9uID0gdGhhdC5vcHRpb25zLm9yaWVudGF0aW9uLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lckhlaWdodCA9ICRjb250YWluZXIub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBoZWlnaHQgPSBzaXRlU2VhcmNoRGl2Lm91dGVySGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgb2Zmc2V0ID0gc2l0ZVNlYXJjaERpdi5vZmZzZXQoKSxcbiAgICAgICAgICAgICAgICBzdHlsZXMgPSB7ICd0b3AnOiBvZmZzZXQudG9wLCAnbGVmdCc6IG9mZnNldC5sZWZ0IH07XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgdmFyIHZpZXdQb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpLFxuICAgICAgICAgICAgICAgICAgICBzY3JvbGxUb3AgPSAkKHdpbmRvdykuc2Nyb2xsVG9wKCksXG4gICAgICAgICAgICAgICAgICAgIHRvcE92ZXJmbG93ID0gLXNjcm9sbFRvcCArIG9mZnNldC50b3AgLSBjb250YWluZXJIZWlnaHQsXG4gICAgICAgICAgICAgICAgICAgIGJvdHRvbU92ZXJmbG93ID0gc2Nyb2xsVG9wICsgdmlld1BvcnRIZWlnaHQgLSAob2Zmc2V0LnRvcCArIGhlaWdodCArIGNvbnRhaW5lckhlaWdodCk7XG5cbiAgICAgICAgICAgICAgICBvcmllbnRhdGlvbiA9IChNYXRoLm1heCh0b3BPdmVyZmxvdywgYm90dG9tT3ZlcmZsb3cpID09PSB0b3BPdmVyZmxvdykgPyAndG9wJyA6ICdib3R0b20nO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAob3JpZW50YXRpb24gPT09ICd0b3AnKSB7XG4gICAgICAgICAgICAgICAgc3R5bGVzLnRvcCArPSAtY29udGFpbmVySGVpZ2h0O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IGhlaWdodDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgY29udGFpbmVyIGlzIG5vdCBwb3NpdGlvbmVkIHRvIGJvZHksXG4gICAgICAgICAgICAvLyBjb3JyZWN0IGl0cyBwb3NpdGlvbiB1c2luZyBvZmZzZXQgcGFyZW50IG9mZnNldFxuICAgICAgICAgICAgaWYoY29udGFpbmVyUGFyZW50ICE9PSBkb2N1bWVudC5ib2R5KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9wYWNpdHkgPSAkY29udGFpbmVyLmNzcygnb3BhY2l0eScpLFxuICAgICAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRjb250YWluZXIuY3NzKCdvcGFjaXR5JywgMCkuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBwYXJlbnRPZmZzZXREaWZmID0gJGNvbnRhaW5lci5vZmZzZXRQYXJlbnQoKS5vZmZzZXQoKTtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wIC09IHBhcmVudE9mZnNldERpZmYudG9wO1xuICAgICAgICAgICAgICAgIHN0eWxlcy5sZWZ0IC09IHBhcmVudE9mZnNldERpZmYubGVmdDtcblxuICAgICAgICAgICAgICAgIGlmICghdGhhdC52aXNpYmxlKXtcbiAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCBvcGFjaXR5KS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLndpZHRoID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMud2lkdGggPSBzaXRlU2VhcmNoRGl2Lm91dGVyV2lkdGgoKSArICdweCc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRjb250YWluZXIuY3NzKHN0eWxlcyk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlS2lsbGVyRm46IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICQoZG9jdW1lbnQpLm9mZignY2xpY2suYXV0b2NvbXBsZXRlJywgdGhhdC5raWxsZXJGbik7XG4gICAgICAgIH0sXG5cbiAgICAgICAga2lsbFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LnN0b3BLaWxsU3VnZ2VzdGlvbnMoKTtcbiAgICAgICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IHdpbmRvdy5zZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBObyBuZWVkIHRvIHJlc3RvcmUgdmFsdWUgd2hlbiBcbiAgICAgICAgICAgICAgICAgICAgLy8gcHJlc2VydmVJbnB1dCA9PT0gdHJ1ZSwgXG4gICAgICAgICAgICAgICAgICAgIC8vIGJlY2F1c2Ugd2UgZGlkIG5vdCBjaGFuZ2UgaXRcbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0Lm9wdGlvbnMucHJlc2VydmVJbnB1dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN0b3BLaWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5jbGVhckludGVydmFsKHRoaXMuaW50ZXJ2YWxJZCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNDdXJzb3JBdEVuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHZhbExlbmd0aCA9IHRoYXQuZWwudmFsKCkubGVuZ3RoLFxuICAgICAgICAgICAgICAgIHNlbGVjdGlvblN0YXJ0ID0gdGhhdC5lbGVtZW50LnNlbGVjdGlvblN0YXJ0LFxuICAgICAgICAgICAgICAgIHJhbmdlO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHNlbGVjdGlvblN0YXJ0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxlY3Rpb25TdGFydCA9PT0gdmFsTGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbikge1xuICAgICAgICAgICAgICAgIHJhbmdlID0gZG9jdW1lbnQuc2VsZWN0aW9uLmNyZWF0ZVJhbmdlKCk7XG4gICAgICAgICAgICAgICAgcmFuZ2UubW92ZVN0YXJ0KCdjaGFyYWN0ZXInLCAtdmFsTGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsTGVuZ3RoID09PSByYW5nZS50ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIC8vIElmIHN1Z2dlc3Rpb25zIGFyZSBoaWRkZW4gYW5kIHVzZXIgcHJlc3NlcyBhcnJvdyBkb3duLCBkaXNwbGF5IHN1Z2dlc3Rpb25zOlxuICAgICAgICAgICAgaWYgKCF0aGF0LmRpc2FibGVkICYmICF0aGF0LnZpc2libGUgJiYgZS53aGljaCA9PT0ga2V5cy5ET1dOICYmIHRoYXQuY3VycmVudFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCB8fCAhdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzd2l0Y2ggKGUud2hpY2gpIHtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRVNDOlxuICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUklHSFQ6XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LmhpbnQgJiYgdGhhdC5vcHRpb25zLm9uSGludCAmJiB0aGF0LmlzQ3Vyc29yQXRFbmQoKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3RIaW50KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlRBQjpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy50YWJEaXNhYmxlZCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuUkVUVVJOOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVVcCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5tb3ZlRG93bigpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIENhbmNlbCBldmVudCBpZiBmdW5jdGlvbiBkaWQgbm90IHJldHVybjpcbiAgICAgICAgICAgIGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlVcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5VUDpcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuRE9XTjpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRGVmZXIgbG9va3VwIGluIGNhc2Ugd2hlbiB2YWx1ZSBjaGFuZ2VzIHZlcnkgcXVpY2tseTpcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHRoYXQub3B0aW9ucy5kZWZlclJlcXVlc3RCeSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIG9uVmFsdWVDaGFuZ2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHZhbHVlID0gdGhhdC5lbC52YWwoKSxcbiAgICAgICAgICAgICAgICBxdWVyeSA9IHRoYXQuZ2V0UXVlcnkodmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3Rpb24gJiYgdGhhdC5jdXJyZW50VmFsdWUgIT09IHF1ZXJ5KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3Rpb24gPSBudWxsO1xuICAgICAgICAgICAgICAgIChvcHRpb25zLm9uSW52YWxpZGF0ZVNlbGVjdGlvbiB8fCAkLm5vb3ApLmNhbGwodGhhdC5lbGVtZW50KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwpO1xuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBleGlzdGluZyBzdWdnZXN0aW9uIGZvciB0aGUgbWF0Y2ggYmVmb3JlIHByb2NlZWRpbmc6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHF1ZXJ5KSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHF1ZXJ5Lmxlbmd0aCA8IG9wdGlvbnMubWluQ2hhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhhdC5nZXRTdWdnZXN0aW9ucyhxdWVyeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNFeGFjdE1hdGNoOiBmdW5jdGlvbiAocXVlcnkpIHtcbiAgICAgICAgICAgIHZhciBzdWdnZXN0aW9ucyA9IHRoaXMuc3VnZ2VzdGlvbnM7XG5cbiAgICAgICAgICAgIHJldHVybiAoc3VnZ2VzdGlvbnMubGVuZ3RoID09PSAxICYmIHN1Z2dlc3Rpb25zWzBdLnZhbHVlLnRvTG93ZXJDYXNlKCkgPT09IHF1ZXJ5LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFF1ZXJ5OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciBkZWxpbWl0ZXIgPSB0aGlzLm9wdGlvbnMuZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgIHBhcnRzO1xuXG4gICAgICAgICAgICBpZiAoIWRlbGltaXRlcikge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHBhcnRzID0gdmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcbiAgICAgICAgICAgIHJldHVybiAkLnRyaW0ocGFydHNbcGFydHMubGVuZ3RoIC0gMV0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGdldFN1Z2dlc3Rpb25zTG9jYWw6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgcXVlcnlMb3dlckNhc2UgPSBxdWVyeS50b0xvd2VyQ2FzZSgpLFxuICAgICAgICAgICAgICAgIGZpbHRlciA9IG9wdGlvbnMubG9va3VwRmlsdGVyLFxuICAgICAgICAgICAgICAgIGxpbWl0ID0gcGFyc2VJbnQob3B0aW9ucy5sb29rdXBMaW1pdCwgMTApLFxuICAgICAgICAgICAgICAgIGRhdGE7XG5cbiAgICAgICAgICAgIGRhdGEgPSB7XG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbnM6ICQuZ3JlcChvcHRpb25zLmxvb2t1cCwgZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlcihzdWdnZXN0aW9uLCBxdWVyeSwgcXVlcnlMb3dlckNhc2UpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAobGltaXQgJiYgZGF0YS5zdWdnZXN0aW9ucy5sZW5ndGggPiBsaW1pdCkge1xuICAgICAgICAgICAgICAgIGRhdGEuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zLnNsaWNlKDAsIGxpbWl0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnM6IGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICB2YXIgcmVzcG9uc2UsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gb3B0aW9ucy5zZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgIHBhcmFtcyxcbiAgICAgICAgICAgICAgICBjYWNoZUtleSxcbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3M7XG5cbiAgICAgICAgICAgIG9wdGlvbnMucGFyYW1zW29wdGlvbnMucGFyYW1OYW1lXSA9IHE7XG4gICAgICAgICAgICBwYXJhbXMgPSBvcHRpb25zLmlnbm9yZVBhcmFtcyA/IG51bGwgOiBvcHRpb25zLnBhcmFtcztcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMub25TZWFyY2hTdGFydC5jYWxsKHRoYXQuZWxlbWVudCwgb3B0aW9ucy5wYXJhbXMpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvcHRpb25zLmxvb2t1cCkpe1xuICAgICAgICAgICAgICAgIG9wdGlvbnMubG9va3VwKHEsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBkYXRhLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBkYXRhLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmlzTG9jYWwpIHtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuZ2V0U3VnZ2VzdGlvbnNMb2NhbChxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihzZXJ2aWNlVXJsKSkge1xuICAgICAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsID0gc2VydmljZVVybC5jYWxsKHRoYXQuZWxlbWVudCwgcSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhY2hlS2V5ID0gc2VydmljZVVybCArICc/JyArICQucGFyYW0ocGFyYW1zIHx8IHt9KTtcbiAgICAgICAgICAgICAgICByZXNwb25zZSA9IHRoYXQuY2FjaGVkUmVzcG9uc2VbY2FjaGVLZXldO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgJC5pc0FycmF5KHJlc3BvbnNlLnN1Z2dlc3Rpb25zKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSByZXNwb25zZS5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3BvbnNlLnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIXRoYXQuaXNCYWRRdWVyeShxKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XG5cbiAgICAgICAgICAgICAgICBhamF4U2V0dGluZ3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHVybDogc2VydmljZVVybCxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogcGFyYW1zLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBvcHRpb25zLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIGRhdGFUeXBlOiBvcHRpb25zLmRhdGFUeXBlXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICQuZXh0ZW5kKGFqYXhTZXR0aW5ncywgb3B0aW9ucy5hamF4U2V0dGluZ3MpO1xuXG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9ICQuYWpheChhamF4U2V0dGluZ3MpLmRvbmUoZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdDtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IG9wdGlvbnMudHJhbnNmb3JtUmVzdWx0KGRhdGEsIHEpO1xuICAgICAgICAgICAgICAgICAgICB0aGF0LnByb2Nlc3NSZXNwb25zZShyZXN1bHQsIHEsIGNhY2hlS2V5KTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCByZXN1bHQuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pLmZhaWwoZnVuY3Rpb24gKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoRXJyb3IuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGlzQmFkUXVlcnk6IGZ1bmN0aW9uIChxKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgYmFkUXVlcmllcyA9IHRoaXMuYmFkUXVlcmllcyxcbiAgICAgICAgICAgICAgICBpID0gYmFkUXVlcmllcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAocS5pbmRleE9mKGJhZFF1ZXJpZXNbaV0pID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGhpZGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHRoYXQub3B0aW9ucy5vbkhpZGUpICYmIHRoYXQudmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHRoYXQub3B0aW9ucy5vbkhpZGUuY2FsbCh0aGF0LmVsZW1lbnQsIGNvbnRhaW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmhpZGUoKTtcbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgfSxcblxuICAgICAgICBzdWdnZXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuc3VnZ2VzdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93Tm9TdWdnZXN0aW9uTm90aWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubm9TdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGlkZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIGdyb3VwQnkgPSBvcHRpb25zLmdyb3VwQnksXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0ID0gb3B0aW9ucy5mb3JtYXRSZXN1bHQsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSxcbiAgICAgICAgICAgICAgICBjbGFzc05hbWUgPSB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbixcbiAgICAgICAgICAgICAgICBjbGFzc1NlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lciA9ICQodGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBiZWZvcmVSZW5kZXIgPSBvcHRpb25zLmJlZm9yZVJlbmRlcixcbiAgICAgICAgICAgICAgICBodG1sID0gJycsXG4gICAgICAgICAgICAgICAgY2F0ZWdvcnksXG4gICAgICAgICAgICAgICAgZm9ybWF0R3JvdXAgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjdXJyZW50Q2F0ZWdvcnkgPSBzdWdnZXN0aW9uLmRhdGFbZ3JvdXBCeV07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PT0gY3VycmVudENhdGVnb3J5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gY3VycmVudENhdGVnb3J5O1xuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUtZ3JvdXBcIj48c3Ryb25nPicgKyBjYXRlZ29yeSArICc8L3N0cm9uZz48L2Rpdj4nO1xuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy50cmlnZ2VyU2VsZWN0T25WYWxpZElucHV0ICYmIHRoYXQuaXNFeGFjdE1hdGNoKHZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KDApO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQnVpbGQgc3VnZ2VzdGlvbnMgaW5uZXIgSFRNTDpcbiAgICAgICAgICAgICQuZWFjaCh0aGF0LnN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAoaSwgc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGlmIChncm91cEJ5KXtcbiAgICAgICAgICAgICAgICAgICAgaHRtbCArPSBmb3JtYXRHcm91cChzdWdnZXN0aW9uLCB2YWx1ZSwgaSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaHRtbCArPSAnPGRpdiBjbGFzcz1cIicgKyBjbGFzc05hbWUgKyAnXCIgZGF0YS1pbmRleD1cIicgKyBpICsgJ1wiPicgKyBmb3JtYXRSZXN1bHQoc3VnZ2VzdGlvbiwgdmFsdWUsIGkpICsgJzwvZGl2Pic7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhpcy5hZGp1c3RDb250YWluZXJXaWR0aCgpO1xuXG4gICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyLmRldGFjaCgpO1xuICAgICAgICAgICAgY29udGFpbmVyLmh0bWwoaHRtbCk7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24oYmVmb3JlUmVuZGVyKSkge1xuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlci5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyLCB0aGF0LnN1Z2dlc3Rpb25zKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcblxuICAgICAgICAgICAgLy8gU2VsZWN0IGZpcnN0IHZhbHVlIGJ5IGRlZmF1bHQ6XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5hdXRvU2VsZWN0Rmlyc3QpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAwO1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lci5zY3JvbGxUb3AoMCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNoaWxkcmVuKCcuJyArIGNsYXNzTmFtZSkuZmlyc3QoKS5hZGRDbGFzcyhjbGFzc1NlbGVjdGVkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoYXQuZmluZEJlc3RIaW50KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbm9TdWdnZXN0aW9uczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIC8vIFNvbWUgZXhwbGljaXQgc3RlcHMuIEJlIGNhcmVmdWwgaGVyZSBhcyBpdCBlYXN5IHRvIGdldFxuICAgICAgICAgICAgLy8gbm9TdWdnZXN0aW9uc0NvbnRhaW5lciByZW1vdmVkIGZyb20gRE9NIGlmIG5vdCBkZXRhY2hlZCBwcm9wZXJseS5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuZW1wdHkoKTsgLy8gY2xlYW4gc3VnZ2VzdGlvbnMgaWYgYW55XG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kKG5vU3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5zaG93KCk7XG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdENvbnRhaW5lcldpZHRoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHdpZHRoLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIC8vIElmIHdpZHRoIGlzIGF1dG8sIGFkanVzdCB3aWR0aCBiZWZvcmUgZGlzcGxheWluZyBzdWdnZXN0aW9ucyxcbiAgICAgICAgICAgIC8vIGJlY2F1c2UgaWYgaW5zdGFuY2Ugd2FzIGNyZWF0ZWQgYmVmb3JlIGlucHV0IGhhZCB3aWR0aCwgaXQgd2lsbCBiZSB6ZXJvLlxuICAgICAgICAgICAgLy8gQWxzbyBpdCBhZGp1c3RzIGlmIGlucHV0IHdpZHRoIGhhcyBjaGFuZ2VkLlxuICAgICAgICAgICAgaWYgKG9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHdpZHRoID0gdGhhdC5lbC5vdXRlcldpZHRoKCk7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLmNzcygnd2lkdGgnLCB3aWR0aCA+IDAgPyB3aWR0aCA6IDMwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmluZEJlc3RIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gbnVsbDtcblxuICAgICAgICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZvdW5kTWF0Y2ggPSBzdWdnZXN0aW9uLnZhbHVlLnRvTG93ZXJDYXNlKCkuaW5kZXhPZih2YWx1ZSkgPT09IDA7XG4gICAgICAgICAgICAgICAgaWYgKGZvdW5kTWF0Y2gpIHtcbiAgICAgICAgICAgICAgICAgICAgYmVzdE1hdGNoID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICFmb3VuZE1hdGNoO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChiZXN0TWF0Y2gpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNpZ25hbEhpbnQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICB2YXIgaGludFZhbHVlID0gJycsXG4gICAgICAgICAgICAgICAgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICBpZiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgIGhpbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlICsgc3VnZ2VzdGlvbi52YWx1ZS5zdWJzdHIodGhhdC5jdXJyZW50VmFsdWUubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGF0LmhpbnRWYWx1ZSAhPT0gaGludFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50VmFsdWUgPSBoaW50VmFsdWU7XG4gICAgICAgICAgICAgICAgdGhhdC5oaW50ID0gc3VnZ2VzdGlvbjtcbiAgICAgICAgICAgICAgICAodGhpcy5vcHRpb25zLm9uSGludCB8fCAkLm5vb3ApKGhpbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmVyaWZ5U3VnZ2VzdGlvbnNGb3JtYXQ6IGZ1bmN0aW9uIChzdWdnZXN0aW9ucykge1xuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgaXMgc3RyaW5nIGFycmF5LCBjb252ZXJ0IHRoZW0gdG8gc3VwcG9ydGVkIGZvcm1hdDpcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9ucy5sZW5ndGggJiYgdHlwZW9mIHN1Z2dlc3Rpb25zWzBdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAkLm1hcChzdWdnZXN0aW9ucywgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHZhbHVlOiB2YWx1ZSwgZGF0YTogbnVsbCB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbnM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgdmFsaWRhdGVPcmllbnRhdGlvbjogZnVuY3Rpb24ob3JpZW50YXRpb24sIGZhbGxiYWNrKSB7XG4gICAgICAgICAgICBvcmllbnRhdGlvbiA9ICQudHJpbShvcmllbnRhdGlvbiB8fCAnJykudG9Mb3dlckNhc2UoKTtcblxuICAgICAgICAgICAgaWYoJC5pbkFycmF5KG9yaWVudGF0aW9uLCBbJ2F1dG8nLCAnYm90dG9tJywgJ3RvcCddKSA9PT0gLTEpe1xuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gZmFsbGJhY2s7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBvcmllbnRhdGlvbjtcbiAgICAgICAgfSxcblxuICAgICAgICBwcm9jZXNzUmVzcG9uc2U6IGZ1bmN0aW9uIChyZXN1bHQsIG9yaWdpbmFsUXVlcnksIGNhY2hlS2V5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucztcblxuICAgICAgICAgICAgcmVzdWx0LnN1Z2dlc3Rpb25zID0gdGhhdC52ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdChyZXN1bHQuc3VnZ2VzdGlvbnMpO1xuXG4gICAgICAgICAgICAvLyBDYWNoZSByZXN1bHRzIGlmIGNhY2hlIGlzIG5vdCBkaXNhYmxlZDpcbiAgICAgICAgICAgIGlmICghb3B0aW9ucy5ub0NhY2hlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV0gPSByZXN1bHQ7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMucHJldmVudEJhZFF1ZXJpZXMgJiYgIXJlc3VsdC5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5iYWRRdWVyaWVzLnB1c2gob3JpZ2luYWxRdWVyeSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBSZXR1cm4gaWYgb3JpZ2luYWxRdWVyeSBpcyBub3QgbWF0Y2hpbmcgY3VycmVudCBxdWVyeTpcbiAgICAgICAgICAgIGlmIChvcmlnaW5hbFF1ZXJ5ICE9PSB0aGF0LmdldFF1ZXJ5KHRoYXQuY3VycmVudFZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3VsdC5zdWdnZXN0aW9ucztcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFjdGl2YXRlOiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgY2hpbGRyZW4gPSBjb250YWluZXIuZmluZCgnLicgKyB0aGF0LmNsYXNzZXMuc3VnZ2VzdGlvbik7XG5cbiAgICAgICAgICAgIGNvbnRhaW5lci5maW5kKCcuJyArIHNlbGVjdGVkKS5yZW1vdmVDbGFzcyhzZWxlY3RlZCk7XG5cbiAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ICE9PSAtMSAmJiBjaGlsZHJlbi5sZW5ndGggPiB0aGF0LnNlbGVjdGVkSW5kZXgpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVJdGVtID0gY2hpbGRyZW4uZ2V0KHRoYXQuc2VsZWN0ZWRJbmRleCk7XG4gICAgICAgICAgICAgICAgJChhY3RpdmVJdGVtKS5hZGRDbGFzcyhzZWxlY3RlZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFjdGl2ZUl0ZW07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBpID0gJC5pbkFycmF5KHRoYXQuaGludCwgdGhhdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIHRoYXQuc2VsZWN0KGkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHNlbGVjdDogZnVuY3Rpb24gKGkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5vblNlbGVjdChpKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZVVwOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhhdC5zZWxlY3RlZEluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jaGlsZHJlbigpLmZpcnN0KCkucmVtb3ZlQ2xhc3ModGhhdC5jbGFzc2VzLnNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCAtIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG1vdmVEb3duOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09ICh0aGF0LnN1Z2dlc3Rpb25zLmxlbmd0aCAtIDEpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmFkanVzdFNjcm9sbCh0aGF0LnNlbGVjdGVkSW5kZXggKyAxKTtcbiAgICAgICAgfSxcblxuICAgICAgICBhZGp1c3RTY3JvbGw6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSB0aGF0LmFjdGl2YXRlKGluZGV4KTtcblxuICAgICAgICAgICAgaWYgKCFhY3RpdmVJdGVtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgb2Zmc2V0VG9wLFxuICAgICAgICAgICAgICAgIHVwcGVyQm91bmQsXG4gICAgICAgICAgICAgICAgbG93ZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBoZWlnaHREZWx0YSA9ICQoYWN0aXZlSXRlbSkub3V0ZXJIZWlnaHQoKTtcblxuICAgICAgICAgICAgb2Zmc2V0VG9wID0gYWN0aXZlSXRlbS5vZmZzZXRUb3A7XG4gICAgICAgICAgICB1cHBlckJvdW5kID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3AoKTtcbiAgICAgICAgICAgIGxvd2VyQm91bmQgPSB1cHBlckJvdW5kICsgdGhhdC5vcHRpb25zLm1heEhlaWdodCAtIGhlaWdodERlbHRhO1xuXG4gICAgICAgICAgICBpZiAob2Zmc2V0VG9wIDwgdXBwZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKG9mZnNldFRvcCA+IGxvd2VyQm91bmQpIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcChvZmZzZXRUb3AgLSB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0ICsgaGVpZ2h0RGVsdGEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5nZXRWYWx1ZSh0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XS52YWx1ZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uU2VsZWN0OiBmdW5jdGlvbiAoaW5kZXgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrID0gdGhhdC5vcHRpb25zLm9uU2VsZWN0LFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb24gPSB0aGF0LnN1Z2dlc3Rpb25zW2luZGV4XTtcblxuICAgICAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmdldFZhbHVlKHN1Z2dlc3Rpb24udmFsdWUpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5jdXJyZW50VmFsdWUgIT09IHRoYXQuZWwudmFsKCkgJiYgIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5lbC52YWwodGhhdC5jdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IHN1Z2dlc3Rpb247XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24ob25TZWxlY3RDYWxsYmFjaykpIHtcbiAgICAgICAgICAgICAgICBvblNlbGVjdENhbGxiYWNrLmNhbGwodGhhdC5lbGVtZW50LCBzdWdnZXN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBnZXRWYWx1ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgZGVsaW1pdGVyID0gdGhhdC5vcHRpb25zLmRlbGltaXRlcixcbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjdXJyZW50VmFsdWUgPSB0aGF0LmN1cnJlbnRWYWx1ZTtcbiAgICAgICAgICAgIHBhcnRzID0gY3VycmVudFZhbHVlLnNwbGl0KGRlbGltaXRlcik7XG5cbiAgICAgICAgICAgIGlmIChwYXJ0cy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWUuc3Vic3RyKDAsIGN1cnJlbnRWYWx1ZS5sZW5ndGggLSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXS5sZW5ndGgpICsgdmFsdWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZGlzcG9zZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5lbC5vZmYoJy5hdXRvY29tcGxldGUnKS5yZW1vdmVEYXRhKCdhdXRvY29tcGxldGUnKTtcbiAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuYXV0b2NvbXBsZXRlJywgdGhhdC5maXhQb3NpdGlvbkNhcHR1cmUpO1xuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvLyBDcmVhdGUgY2hhaW5hYmxlIGpRdWVyeSBwbHVnaW46XG4gICAgJC5mbi5hdXRvY29tcGxldGUgPSAkLmZuLmRldmJyaWRnZUF1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uIChvcHRpb25zLCBhcmdzKSB7XG4gICAgICAgIHZhciBkYXRhS2V5ID0gJ2F1dG9jb21wbGV0ZSc7XG4gICAgICAgIC8vIElmIGZ1bmN0aW9uIGludm9rZWQgd2l0aG91dCBhcmd1bWVudCByZXR1cm5cbiAgICAgICAgLy8gaW5zdGFuY2Ugb2YgdGhlIGZpcnN0IG1hdGNoZWQgZWxlbWVudDpcbiAgICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5maXJzdCgpLmRhdGEoZGF0YUtleSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBpbnB1dEVsZW1lbnQgPSAkKHRoaXMpLFxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgdHlwZW9mIGluc3RhbmNlW29wdGlvbnNdID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIGluc3RhbmNlW29wdGlvbnNdKGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgaW5zdGFuY2UgYWxyZWFkeSBleGlzdHMsIGRlc3Ryb3kgaXQ6XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbmNlICYmIGluc3RhbmNlLmRpc3Bvc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2UuZGlzcG9zZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpbnN0YW5jZSA9IG5ldyBBdXRvY29tcGxldGUodGhpcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgaW5wdXRFbGVtZW50LmRhdGEoZGF0YUtleSwgaW5zdGFuY2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSkpO1xuIiwiJCgnLmdnLWV2ZW50LXNsaWRlcicpLmZsaWNraXR5KHtcbiAgLy8gb3B0aW9uc1xuICBjZWxsQWxpZ246ICdsZWZ0JyxcbiAgY29udGFpbjogdHJ1ZVxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
