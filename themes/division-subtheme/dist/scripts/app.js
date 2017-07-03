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
      plugin.$element.removeAttr('data-' + pluginName).removeData('zfPlugin'
      /**
       * Fires when the plugin has been destroyed.
       * @event Plugin#destroyed
       */
      ).trigger('destroyed.zf.' + pluginName);
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
  };function ImNotTouchingYou(element, parent, lrOnly, tbOnly) {
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

!function ($) {

  /**
   * Magellan module.
   * @module foundation.magellan
   */

  var Magellan = function () {
    /**
     * Creates a new instance of Magellan.
     * @class
     * @fires Magellan#init
     * @param {Object} element - jQuery object to add the trigger to.
     * @param {Object} options - Overrides to the default plugin settings.
     */
    function Magellan(element, options) {
      _classCallCheck(this, Magellan);

      this.$element = element;
      this.options = $.extend({}, Magellan.defaults, this.$element.data(), options);

      this._init();
      this.calcPoints();

      Foundation.registerPlugin(this, 'Magellan');
    }

    /**
     * Initializes the Magellan plugin and calls functions to get equalizer functioning on load.
     * @private
     */


    _createClass(Magellan, [{
      key: '_init',
      value: function _init() {
        var id = this.$element[0].id || Foundation.GetYoDigits(6, 'magellan');
        var _this = this;
        this.$targets = $('[data-magellan-target]');
        this.$links = this.$element.find('a');
        this.$element.attr({
          'data-resize': id,
          'data-scroll': id,
          'id': id
        });
        this.$active = $();
        this.scrollPos = parseInt(window.pageYOffset, 10);

        this._events();
      }

      /**
       * Calculates an array of pixel values that are the demarcation lines between locations on the page.
       * Can be invoked if new elements are added or the size of a location changes.
       * @function
       */

    }, {
      key: 'calcPoints',
      value: function calcPoints() {
        var _this = this,
            body = document.body,
            html = document.documentElement;

        this.points = [];
        this.winHeight = Math.round(Math.max(window.innerHeight, html.clientHeight));
        this.docHeight = Math.round(Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight));

        this.$targets.each(function () {
          var $tar = $(this),
              pt = Math.round($tar.offset().top - _this.options.threshold);
          $tar.targetPoint = pt;
          _this.points.push(pt);
        });
      }

      /**
       * Initializes events for Magellan.
       * @private
       */

    }, {
      key: '_events',
      value: function _events() {
        var _this = this,
            $body = $('html, body'),
            opts = {
          duration: _this.options.animationDuration,
          easing: _this.options.animationEasing
        };
        $(window).one('load', function () {
          if (_this.options.deepLinking) {
            if (location.hash) {
              _this.scrollToLoc(location.hash);
            }
          }
          _this.calcPoints();
          _this._updateActive();
        });

        this.$element.on({
          'resizeme.zf.trigger': this.reflow.bind(this),
          'scrollme.zf.trigger': this._updateActive.bind(this)
        }).on('click.zf.magellan', 'a[href^="#"]', function (e) {
          e.preventDefault();
          var arrival = this.getAttribute('href');
          _this.scrollToLoc(arrival);
        });
        $(window).on('popstate', function (e) {
          if (_this.options.deepLinking) {
            _this.scrollToLoc(window.location.hash);
          }
        });
      }

      /**
       * Function to scroll to a given location on the page.
       * @param {String} loc - a properly formatted jQuery id selector. Example: '#foo'
       * @function
       */

    }, {
      key: 'scrollToLoc',
      value: function scrollToLoc(loc) {
        // Do nothing if target does not exist to prevent errors
        if (!$(loc).length) {
          return false;
        }
        this._inTransition = true;
        var _this = this,
            scrollPos = Math.round($(loc).offset().top - this.options.threshold / 2 - this.options.barOffset);

        $('html, body').stop(true).animate({ scrollTop: scrollPos }, this.options.animationDuration, this.options.animationEasing, function () {
          _this._inTransition = false;_this._updateActive();
        });
      }

      /**
       * Calls necessary functions to update Magellan upon DOM change
       * @function
       */

    }, {
      key: 'reflow',
      value: function reflow() {
        this.calcPoints();
        this._updateActive();
      }

      /**
       * Updates the visibility of an active location link, and updates the url hash for the page, if deepLinking enabled.
       * @private
       * @function
       * @fires Magellan#update
       */

    }, {
      key: '_updateActive',
      value: function _updateActive() /*evt, elem, scrollPos*/{
        if (this._inTransition) {
          return;
        }
        var winPos = /*scrollPos ||*/parseInt(window.pageYOffset, 10),
            curIdx;

        if (winPos + this.winHeight === this.docHeight) {
          curIdx = this.points.length - 1;
        } else if (winPos < this.points[0]) {
          curIdx = undefined;
        } else {
          var isDown = this.scrollPos < winPos,
              _this = this,
              curVisible = this.points.filter(function (p, i) {
            return isDown ? p - _this.options.barOffset <= winPos : p - _this.options.barOffset - _this.options.threshold <= winPos;
          });
          curIdx = curVisible.length ? curVisible.length - 1 : 0;
        }

        this.$active.removeClass(this.options.activeClass);
        this.$active = this.$links.filter('[href="#' + this.$targets.eq(curIdx).data('magellan-target') + '"]').addClass(this.options.activeClass);

        if (this.options.deepLinking) {
          var hash = "";
          if (curIdx != undefined) {
            hash = this.$active[0].getAttribute('href');
          }
          if (hash !== window.location.hash) {
            if (window.history.pushState) {
              window.history.pushState(null, null, hash);
            } else {
              window.location.hash = hash;
            }
          }
        }

        this.scrollPos = winPos;
        /**
         * Fires when magellan is finished updating to the new active element.
         * @event Magellan#update
         */
        this.$element.trigger('update.zf.magellan', [this.$active]);
      }

      /**
       * Destroys an instance of Magellan and resets the url of the window.
       * @function
       */

    }, {
      key: 'destroy',
      value: function destroy() {
        this.$element.off('.zf.trigger .zf.magellan').find('.' + this.options.activeClass).removeClass(this.options.activeClass);

        if (this.options.deepLinking) {
          var hash = this.$active[0].getAttribute('href');
          window.location.hash.replace(hash, '');
        }

        Foundation.unregisterPlugin(this);
      }
    }]);

    return Magellan;
  }();

  /**
   * Default settings for plugin
   */


  Magellan.defaults = {
    /**
     * Amount of time, in ms, the animated scrolling should take between locations.
     * @option
     * @type {number}
     * @default 500
     */
    animationDuration: 500,
    /**
     * Animation style to use when scrolling between locations. Can be `'swing'` or `'linear'`.
     * @option
     * @type {string}
     * @default 'linear'
     * @see {@link https://api.jquery.com/animate|Jquery animate}
     */
    animationEasing: 'linear',
    /**
     * Number of pixels to use as a marker for location changes.
     * @option
     * @type {number}
     * @default 50
     */
    threshold: 50,
    /**
     * Class applied to the active locations link on the magellan container.
     * @option
     * @type {string}
     * @default 'active'
     */
    activeClass: 'active',
    /**
     * Allows the script to manipulate the url of the current page, and if supported, alter the history.
     * @option
     * @type {boolean}
     * @default false
     */
    deepLinking: false,
    /**
     * Number of pixels to offset the scroll of the page on item click if using a sticky nav bar.
     * @option
     * @type {number}
     * @default 0
     */
    barOffset: 0

    // Window exports
  };Foundation.plugin(Magellan, 'Magellan');
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
}

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
);$('iframe').each(function () {
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

$('input#site-search__input').autocomplete({
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndoYXQtaW5wdXQuanMiLCJmb3VuZGF0aW9uLmNvcmUuanMiLCJmb3VuZGF0aW9uLnV0aWwuYm94LmpzIiwiZm91bmRhdGlvbi51dGlsLmtleWJvYXJkLmpzIiwiZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnkuanMiLCJmb3VuZGF0aW9uLnV0aWwubW90aW9uLmpzIiwiZm91bmRhdGlvbi51dGlsLm5lc3QuanMiLCJmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlci5qcyIsImZvdW5kYXRpb24udXRpbC50b3VjaC5qcyIsImZvdW5kYXRpb24udXRpbC50cmlnZ2Vycy5qcyIsImZvdW5kYXRpb24uYWNjb3JkaW9uLmpzIiwiZm91bmRhdGlvbi5pbnRlcmNoYW5nZS5qcyIsImZvdW5kYXRpb24ubWFnZWxsYW4uanMiLCJmb3VuZGF0aW9uLnRhYnMuanMiLCJsYXp5bG9hZC50cmFuc3BpbGVkLmpzIiwiZmxpY2tpdHkucGtnZC5taW4uanMiLCJmbGlja2l0eWJnLWxhenlsb2FkLmpzIiwianF1ZXJ5LWF1dG9jb21wbGV0ZS5qcyIsImFwcC5qcyJdLCJuYW1lcyI6WyIkIiwiRk9VTkRBVElPTl9WRVJTSU9OIiwiRm91bmRhdGlvbiIsInZlcnNpb24iLCJfcGx1Z2lucyIsIl91dWlkcyIsInJ0bCIsImF0dHIiLCJwbHVnaW4iLCJuYW1lIiwiY2xhc3NOYW1lIiwiZnVuY3Rpb25OYW1lIiwiYXR0ck5hbWUiLCJoeXBoZW5hdGUiLCJyZWdpc3RlclBsdWdpbiIsInBsdWdpbk5hbWUiLCJjb25zdHJ1Y3RvciIsInRvTG93ZXJDYXNlIiwidXVpZCIsIkdldFlvRGlnaXRzIiwiJGVsZW1lbnQiLCJkYXRhIiwidHJpZ2dlciIsInB1c2giLCJ1bnJlZ2lzdGVyUGx1Z2luIiwic3BsaWNlIiwiaW5kZXhPZiIsInJlbW92ZUF0dHIiLCJyZW1vdmVEYXRhIiwicHJvcCIsInJlSW5pdCIsInBsdWdpbnMiLCJpc0pRIiwiZWFjaCIsIl9pbml0IiwidHlwZSIsIl90aGlzIiwiZm5zIiwicGxncyIsImZvckVhY2giLCJwIiwiZm91bmRhdGlvbiIsIk9iamVjdCIsImtleXMiLCJlcnIiLCJjb25zb2xlIiwiZXJyb3IiLCJsZW5ndGgiLCJuYW1lc3BhY2UiLCJNYXRoIiwicm91bmQiLCJwb3ciLCJyYW5kb20iLCJ0b1N0cmluZyIsInNsaWNlIiwicmVmbG93IiwiZWxlbSIsImkiLCIkZWxlbSIsImZpbmQiLCJhZGRCYWNrIiwiJGVsIiwib3B0cyIsIndhcm4iLCJ0aGluZyIsInNwbGl0IiwiZSIsIm9wdCIsIm1hcCIsImVsIiwidHJpbSIsInBhcnNlVmFsdWUiLCJlciIsImdldEZuTmFtZSIsInRyYW5zaXRpb25lbmQiLCJ0cmFuc2l0aW9ucyIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImVuZCIsInQiLCJzdHlsZSIsInNldFRpbWVvdXQiLCJ0cmlnZ2VySGFuZGxlciIsInV0aWwiLCJ0aHJvdHRsZSIsImZ1bmMiLCJkZWxheSIsInRpbWVyIiwiY29udGV4dCIsImFyZ3MiLCJhcmd1bWVudHMiLCJhcHBseSIsIm1ldGhvZCIsIiRtZXRhIiwiJG5vSlMiLCJhcHBlbmRUbyIsImhlYWQiLCJyZW1vdmVDbGFzcyIsIk1lZGlhUXVlcnkiLCJBcnJheSIsInByb3RvdHlwZSIsImNhbGwiLCJwbHVnQ2xhc3MiLCJ1bmRlZmluZWQiLCJSZWZlcmVuY2VFcnJvciIsIlR5cGVFcnJvciIsIndpbmRvdyIsImZuIiwiRGF0ZSIsIm5vdyIsImdldFRpbWUiLCJ2ZW5kb3JzIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwidnAiLCJjYW5jZWxBbmltYXRpb25GcmFtZSIsInRlc3QiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJsYXN0VGltZSIsImNhbGxiYWNrIiwibmV4dFRpbWUiLCJtYXgiLCJjbGVhclRpbWVvdXQiLCJwZXJmb3JtYW5jZSIsInN0YXJ0IiwiRnVuY3Rpb24iLCJiaW5kIiwib1RoaXMiLCJhQXJncyIsImZUb0JpbmQiLCJmTk9QIiwiZkJvdW5kIiwiY29uY2F0IiwiZnVuY05hbWVSZWdleCIsInJlc3VsdHMiLCJleGVjIiwic3RyIiwiaXNOYU4iLCJwYXJzZUZsb2F0IiwicmVwbGFjZSIsImpRdWVyeSIsIkJveCIsIkltTm90VG91Y2hpbmdZb3UiLCJHZXREaW1lbnNpb25zIiwiR2V0T2Zmc2V0cyIsImVsZW1lbnQiLCJwYXJlbnQiLCJsck9ubHkiLCJ0Yk9ubHkiLCJlbGVEaW1zIiwidG9wIiwiYm90dG9tIiwibGVmdCIsInJpZ2h0IiwicGFyRGltcyIsIm9mZnNldCIsImhlaWdodCIsIndpZHRoIiwid2luZG93RGltcyIsImFsbERpcnMiLCJFcnJvciIsInJlY3QiLCJnZXRCb3VuZGluZ0NsaWVudFJlY3QiLCJwYXJSZWN0IiwicGFyZW50Tm9kZSIsIndpblJlY3QiLCJib2R5Iiwid2luWSIsInBhZ2VZT2Zmc2V0Iiwid2luWCIsInBhZ2VYT2Zmc2V0IiwicGFyZW50RGltcyIsImFuY2hvciIsInBvc2l0aW9uIiwidk9mZnNldCIsImhPZmZzZXQiLCJpc092ZXJmbG93IiwiJGVsZURpbXMiLCIkYW5jaG9yRGltcyIsImtleUNvZGVzIiwiY29tbWFuZHMiLCJLZXlib2FyZCIsImdldEtleUNvZGVzIiwicGFyc2VLZXkiLCJldmVudCIsImtleSIsIndoaWNoIiwia2V5Q29kZSIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsInRvVXBwZXJDYXNlIiwic2hpZnRLZXkiLCJjdHJsS2V5IiwiYWx0S2V5IiwiaGFuZGxlS2V5IiwiY29tcG9uZW50IiwiZnVuY3Rpb25zIiwiY29tbWFuZExpc3QiLCJjbWRzIiwiY29tbWFuZCIsImx0ciIsImV4dGVuZCIsInJldHVyblZhbHVlIiwiaGFuZGxlZCIsInVuaGFuZGxlZCIsImZpbmRGb2N1c2FibGUiLCJmaWx0ZXIiLCJpcyIsInJlZ2lzdGVyIiwiY29tcG9uZW50TmFtZSIsInRyYXBGb2N1cyIsIiRmb2N1c2FibGUiLCIkZmlyc3RGb2N1c2FibGUiLCJlcSIsIiRsYXN0Rm9jdXNhYmxlIiwib24iLCJ0YXJnZXQiLCJwcmV2ZW50RGVmYXVsdCIsImZvY3VzIiwicmVsZWFzZUZvY3VzIiwib2ZmIiwia2NzIiwiayIsImtjIiwiZGVmYXVsdFF1ZXJpZXMiLCJsYW5kc2NhcGUiLCJwb3J0cmFpdCIsInJldGluYSIsInF1ZXJpZXMiLCJjdXJyZW50Iiwic2VsZiIsImV4dHJhY3RlZFN0eWxlcyIsImNzcyIsIm5hbWVkUXVlcmllcyIsInBhcnNlU3R5bGVUb09iamVjdCIsImhhc093blByb3BlcnR5IiwidmFsdWUiLCJfZ2V0Q3VycmVudFNpemUiLCJfd2F0Y2hlciIsImF0TGVhc3QiLCJzaXplIiwicXVlcnkiLCJnZXQiLCJtYXRjaE1lZGlhIiwibWF0Y2hlcyIsIm1hdGNoZWQiLCJuZXdTaXplIiwiY3VycmVudFNpemUiLCJzdHlsZU1lZGlhIiwibWVkaWEiLCJzY3JpcHQiLCJnZXRFbGVtZW50c0J5VGFnTmFtZSIsImluZm8iLCJpZCIsImluc2VydEJlZm9yZSIsImdldENvbXB1dGVkU3R5bGUiLCJjdXJyZW50U3R5bGUiLCJtYXRjaE1lZGl1bSIsInRleHQiLCJzdHlsZVNoZWV0IiwiY3NzVGV4dCIsInRleHRDb250ZW50Iiwic3R5bGVPYmplY3QiLCJyZWR1Y2UiLCJyZXQiLCJwYXJhbSIsInBhcnRzIiwidmFsIiwiZGVjb2RlVVJJQ29tcG9uZW50IiwiaXNBcnJheSIsImluaXRDbGFzc2VzIiwiYWN0aXZlQ2xhc3NlcyIsIk1vdGlvbiIsImFuaW1hdGVJbiIsImFuaW1hdGlvbiIsImNiIiwiYW5pbWF0ZSIsImFuaW1hdGVPdXQiLCJNb3ZlIiwiZHVyYXRpb24iLCJhbmltIiwicHJvZyIsIm1vdmUiLCJ0cyIsImlzSW4iLCJpbml0Q2xhc3MiLCJhY3RpdmVDbGFzcyIsInJlc2V0IiwiYWRkQ2xhc3MiLCJzaG93Iiwib2Zmc2V0V2lkdGgiLCJvbmUiLCJmaW5pc2giLCJoaWRlIiwidHJhbnNpdGlvbkR1cmF0aW9uIiwiTmVzdCIsIkZlYXRoZXIiLCJtZW51IiwiaXRlbXMiLCJzdWJNZW51Q2xhc3MiLCJzdWJJdGVtQ2xhc3MiLCJoYXNTdWJDbGFzcyIsIiRpdGVtIiwiJHN1YiIsImNoaWxkcmVuIiwiQnVybiIsIlRpbWVyIiwib3B0aW9ucyIsIm5hbWVTcGFjZSIsInJlbWFpbiIsImlzUGF1c2VkIiwicmVzdGFydCIsImluZmluaXRlIiwicGF1c2UiLCJvbkltYWdlc0xvYWRlZCIsImltYWdlcyIsInVubG9hZGVkIiwiY29tcGxldGUiLCJyZWFkeVN0YXRlIiwic2luZ2xlSW1hZ2VMb2FkZWQiLCJzcmMiLCJzcG90U3dpcGUiLCJlbmFibGVkIiwiZG9jdW1lbnRFbGVtZW50IiwibW92ZVRocmVzaG9sZCIsInRpbWVUaHJlc2hvbGQiLCJzdGFydFBvc1giLCJzdGFydFBvc1kiLCJzdGFydFRpbWUiLCJlbGFwc2VkVGltZSIsImlzTW92aW5nIiwib25Ub3VjaEVuZCIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvblRvdWNoTW92ZSIsIngiLCJ0b3VjaGVzIiwicGFnZVgiLCJ5IiwicGFnZVkiLCJkeCIsImR5IiwiZGlyIiwiYWJzIiwib25Ub3VjaFN0YXJ0IiwiYWRkRXZlbnRMaXN0ZW5lciIsImluaXQiLCJ0ZWFyZG93biIsInNwZWNpYWwiLCJzd2lwZSIsInNldHVwIiwibm9vcCIsImFkZFRvdWNoIiwiaGFuZGxlVG91Y2giLCJjaGFuZ2VkVG91Y2hlcyIsImZpcnN0IiwiZXZlbnRUeXBlcyIsInRvdWNoc3RhcnQiLCJ0b3VjaG1vdmUiLCJ0b3VjaGVuZCIsInNpbXVsYXRlZEV2ZW50IiwiTW91c2VFdmVudCIsInNjcmVlblgiLCJzY3JlZW5ZIiwiY2xpZW50WCIsImNsaWVudFkiLCJjcmVhdGVFdmVudCIsImluaXRNb3VzZUV2ZW50IiwiZGlzcGF0Y2hFdmVudCIsIk11dGF0aW9uT2JzZXJ2ZXIiLCJwcmVmaXhlcyIsInRyaWdnZXJzIiwic3RvcFByb3BhZ2F0aW9uIiwiZmFkZU91dCIsImNoZWNrTGlzdGVuZXJzIiwiZXZlbnRzTGlzdGVuZXIiLCJyZXNpemVMaXN0ZW5lciIsInNjcm9sbExpc3RlbmVyIiwiY2xvc2VtZUxpc3RlbmVyIiwieWV0aUJveGVzIiwicGx1Z05hbWVzIiwibGlzdGVuZXJzIiwiam9pbiIsInBsdWdpbklkIiwibm90IiwiZGVib3VuY2UiLCIkbm9kZXMiLCJub2RlcyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJsaXN0ZW5pbmdFbGVtZW50c011dGF0aW9uIiwibXV0YXRpb25SZWNvcmRzTGlzdCIsIiR0YXJnZXQiLCJhdHRyaWJ1dGVOYW1lIiwiY2xvc2VzdCIsImVsZW1lbnRPYnNlcnZlciIsIm9ic2VydmUiLCJhdHRyaWJ1dGVzIiwiY2hpbGRMaXN0IiwiY2hhcmFjdGVyRGF0YSIsInN1YnRyZWUiLCJhdHRyaWJ1dGVGaWx0ZXIiLCJJSGVhcllvdSIsIkFjY29yZGlvbiIsImRlZmF1bHRzIiwiJHRhYnMiLCJpZHgiLCIkY29udGVudCIsImxpbmtJZCIsIiRpbml0QWN0aXZlIiwiZmlyc3RUaW1lSW5pdCIsImRvd24iLCJfY2hlY2tEZWVwTGluayIsImxvY2F0aW9uIiwiaGFzaCIsIiRsaW5rIiwiJGFuY2hvciIsImhhc0NsYXNzIiwiZGVlcExpbmtTbXVkZ2UiLCJsb2FkIiwic2Nyb2xsVG9wIiwiZGVlcExpbmtTbXVkZ2VEZWxheSIsImRlZXBMaW5rIiwiX2V2ZW50cyIsIiR0YWJDb250ZW50IiwidG9nZ2xlIiwibmV4dCIsIiRhIiwibXVsdGlFeHBhbmQiLCJwcmV2aW91cyIsInByZXYiLCJ1cCIsInVwZGF0ZUhpc3RvcnkiLCJoaXN0b3J5IiwicHVzaFN0YXRlIiwicmVwbGFjZVN0YXRlIiwiZmlyc3RUaW1lIiwiJGN1cnJlbnRBY3RpdmUiLCJzbGlkZURvd24iLCJzbGlkZVNwZWVkIiwiJGF1bnRzIiwic2libGluZ3MiLCJhbGxvd0FsbENsb3NlZCIsInNsaWRlVXAiLCJzdG9wIiwiSW50ZXJjaGFuZ2UiLCJydWxlcyIsImN1cnJlbnRQYXRoIiwiX2FkZEJyZWFrcG9pbnRzIiwiX2dlbmVyYXRlUnVsZXMiLCJfcmVmbG93IiwibWF0Y2giLCJydWxlIiwicGF0aCIsIlNQRUNJQUxfUVVFUklFUyIsInJ1bGVzTGlzdCIsIm5vZGVOYW1lIiwicmVzcG9uc2UiLCJodG1sIiwiTWFnZWxsYW4iLCJjYWxjUG9pbnRzIiwiJHRhcmdldHMiLCIkbGlua3MiLCIkYWN0aXZlIiwic2Nyb2xsUG9zIiwicGFyc2VJbnQiLCJwb2ludHMiLCJ3aW5IZWlnaHQiLCJpbm5lckhlaWdodCIsImNsaWVudEhlaWdodCIsImRvY0hlaWdodCIsInNjcm9sbEhlaWdodCIsIm9mZnNldEhlaWdodCIsIiR0YXIiLCJwdCIsInRocmVzaG9sZCIsInRhcmdldFBvaW50IiwiJGJvZHkiLCJhbmltYXRpb25EdXJhdGlvbiIsImVhc2luZyIsImFuaW1hdGlvbkVhc2luZyIsImRlZXBMaW5raW5nIiwic2Nyb2xsVG9Mb2MiLCJfdXBkYXRlQWN0aXZlIiwiYXJyaXZhbCIsImdldEF0dHJpYnV0ZSIsImxvYyIsIl9pblRyYW5zaXRpb24iLCJiYXJPZmZzZXQiLCJ3aW5Qb3MiLCJjdXJJZHgiLCJpc0Rvd24iLCJjdXJWaXNpYmxlIiwiVGFicyIsIiR0YWJUaXRsZXMiLCJsaW5rQ2xhc3MiLCJpc0FjdGl2ZSIsImxpbmtBY3RpdmVDbGFzcyIsImF1dG9Gb2N1cyIsIm1hdGNoSGVpZ2h0IiwiJGltYWdlcyIsIl9zZXRIZWlnaHQiLCJzZWxlY3RUYWIiLCJfYWRkS2V5SGFuZGxlciIsIl9hZGRDbGlja0hhbmRsZXIiLCJfc2V0SGVpZ2h0TXFIYW5kbGVyIiwiX2hhbmRsZVRhYkNoYW5nZSIsIiRlbGVtZW50cyIsIiRwcmV2RWxlbWVudCIsIiRuZXh0RWxlbWVudCIsIndyYXBPbktleXMiLCJsYXN0IiwibWluIiwib3BlbiIsImhpc3RvcnlIYW5kbGVkIiwiYWN0aXZlQ29sbGFwc2UiLCJfY29sbGFwc2VUYWIiLCIkb2xkVGFiIiwiJHRhYkxpbmsiLCIkdGFyZ2V0Q29udGVudCIsIl9vcGVuVGFiIiwicGFuZWxBY3RpdmVDbGFzcyIsIiR0YXJnZXRfYW5jaG9yIiwiaWRTdHIiLCJwYW5lbENsYXNzIiwicGFuZWwiLCJ0ZW1wIiwiZGVmaW5lIiwiYW1kIiwibW9kdWxlIiwiZXhwb3J0cyIsInJlcXVpcmUiLCJqUXVlcnlCcmlkZ2V0IiwibyIsImEiLCJsIiwibiIsInMiLCJoIiwiciIsImMiLCJjaGFyQXQiLCJkIiwib3B0aW9uIiwiaXNQbGFpbk9iamVjdCIsImJyaWRnZXQiLCJFdkVtaXR0ZXIiLCJvbmNlIiwiX29uY2VFdmVudHMiLCJlbWl0RXZlbnQiLCJnZXRTaXplIiwiaW5uZXJXaWR0aCIsIm91dGVyV2lkdGgiLCJvdXRlckhlaWdodCIsInBhZGRpbmciLCJib3JkZXJTdHlsZSIsImJvcmRlcldpZHRoIiwiYm94U2l6aW5nIiwiYXBwZW5kQ2hpbGQiLCJpc0JveFNpemVPdXRlciIsInJlbW92ZUNoaWxkIiwicXVlcnlTZWxlY3RvciIsIm5vZGVUeXBlIiwiZGlzcGxheSIsImlzQm9yZGVyQm94IiwidSIsImYiLCJ2IiwicGFkZGluZ0xlZnQiLCJwYWRkaW5nUmlnaHQiLCJnIiwicGFkZGluZ1RvcCIsInBhZGRpbmdCb3R0b20iLCJtIiwibWFyZ2luTGVmdCIsIm1hcmdpblJpZ2h0IiwibWFyZ2luVG9wIiwibWFyZ2luQm90dG9tIiwiUyIsImJvcmRlckxlZnRXaWR0aCIsImJvcmRlclJpZ2h0V2lkdGgiLCJFIiwiYm9yZGVyVG9wV2lkdGgiLCJib3JkZXJCb3R0b21XaWR0aCIsImIiLCJDIiwibWF0Y2hlc1NlbGVjdG9yIiwiRWxlbWVudCIsImZpenp5VUlVdGlscyIsIm1vZHVsbyIsIm1ha2VBcnJheSIsInJlbW92ZUZyb20iLCJnZXRQYXJlbnQiLCJnZXRRdWVyeUVsZW1lbnQiLCJoYW5kbGVFdmVudCIsImZpbHRlckZpbmRFbGVtZW50cyIsIkhUTUxFbGVtZW50IiwiZGVib3VuY2VNZXRob2QiLCJkb2NSZWFkeSIsInRvRGFzaGVkIiwiaHRtbEluaXQiLCJKU09OIiwicGFyc2UiLCJGbGlja2l0eSIsIkNlbGwiLCJjcmVhdGUiLCJzaGlmdCIsImRlc3Ryb3kiLCJvcmlnaW5TaWRlIiwic2V0UG9zaXRpb24iLCJ1cGRhdGVUYXJnZXQiLCJyZW5kZXJQb3NpdGlvbiIsInNldERlZmF1bHRUYXJnZXQiLCJjZWxsQWxpZ24iLCJnZXRQb3NpdGlvblZhbHVlIiwid3JhcFNoaWZ0Iiwic2xpZGVhYmxlV2lkdGgiLCJyZW1vdmUiLCJTbGlkZSIsImlzT3JpZ2luTGVmdCIsImNlbGxzIiwiYWRkQ2VsbCIsImZpcnN0TWFyZ2luIiwiZ2V0TGFzdENlbGwiLCJzZWxlY3QiLCJjaGFuZ2VTZWxlY3RlZENsYXNzIiwidW5zZWxlY3QiLCJjbGFzc0xpc3QiLCJnZXRDZWxsRWxlbWVudHMiLCJhbmltYXRlUHJvdG90eXBlIiwid2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwic3RhcnRBbmltYXRpb24iLCJpc0FuaW1hdGluZyIsInJlc3RpbmdGcmFtZXMiLCJhcHBseURyYWdGb3JjZSIsImFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uIiwiaW50ZWdyYXRlUGh5c2ljcyIsInBvc2l0aW9uU2xpZGVyIiwic2V0dGxlIiwidHJhbnNmb3JtIiwid3JhcEFyb3VuZCIsInNoaWZ0V3JhcENlbGxzIiwiY3Vyc29yUG9zaXRpb24iLCJyaWdodFRvTGVmdCIsInNsaWRlciIsInNsaWRlcyIsInNsaWRlc1dpZHRoIiwicG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkIiwic2VsZWN0ZWRTbGlkZSIsInBlcmNlbnRQb3NpdGlvbiIsImlzUG9pbnRlckRvd24iLCJpc0ZyZWVTY3JvbGxpbmciLCJfc2hpZnRDZWxscyIsImJlZm9yZVNoaWZ0Q2VsbHMiLCJhZnRlclNoaWZ0Q2VsbHMiLCJfdW5zaGlmdENlbGxzIiwidmVsb2NpdHkiLCJnZXRGcmljdGlvbkZhY3RvciIsImFwcGx5Rm9yY2UiLCJnZXRSZXN0aW5nUG9zaXRpb24iLCJkcmFnWCIsInNlbGVjdGVkQXR0cmFjdGlvbiIsImZsaWNraXR5R1VJRCIsIl9jcmVhdGUiLCJhY2Nlc3NpYmlsaXR5IiwiZnJlZVNjcm9sbEZyaWN0aW9uIiwiZnJpY3Rpb24iLCJuYW1lc3BhY2VKUXVlcnlFdmVudHMiLCJyZXNpemUiLCJzZXRHYWxsZXJ5U2l6ZSIsImNyZWF0ZU1ldGhvZHMiLCJndWlkIiwic2VsZWN0ZWRJbmRleCIsInZpZXdwb3J0IiwiX2NyZWF0ZVNsaWRlciIsIndhdGNoQ1NTIiwiYWN0aXZhdGUiLCJhZGQiLCJfZmlsdGVyRmluZENlbGxFbGVtZW50cyIsInJlbG9hZENlbGxzIiwidGFiSW5kZXgiLCJpbml0aWFsSW5kZXgiLCJpc0luaXRBY3RpdmF0ZWQiLCJjZWxsU2VsZWN0b3IiLCJfbWFrZUNlbGxzIiwicG9zaXRpb25DZWxscyIsIl9nZXRXcmFwU2hpZnRDZWxscyIsImdldExhc3RTbGlkZSIsIl9zaXplQ2VsbHMiLCJfcG9zaXRpb25DZWxscyIsIm1heENlbGxIZWlnaHQiLCJ1cGRhdGVTbGlkZXMiLCJfY29udGFpblNsaWRlcyIsIl9nZXRDYW5DZWxsRml0IiwidXBkYXRlU2VsZWN0ZWRTbGlkZSIsImdyb3VwQ2VsbHMiLCJyZXBvc2l0aW9uIiwic2V0Q2VsbEFsaWduIiwiY2VudGVyIiwiYWRhcHRpdmVIZWlnaHQiLCJfZ2V0R2FwQ2VsbHMiLCJjb250YWluIiwiRXZlbnQiLCJfd3JhcFNlbGVjdCIsImlzRHJhZ1NlbGVjdCIsInVuc2VsZWN0U2VsZWN0ZWRTbGlkZSIsInNlbGVjdGVkQ2VsbHMiLCJzZWxlY3RlZEVsZW1lbnRzIiwic2VsZWN0ZWRDZWxsIiwic2VsZWN0ZWRFbGVtZW50Iiwic2VsZWN0Q2VsbCIsImdldENlbGwiLCJnZXRDZWxscyIsImdldFBhcmVudENlbGwiLCJnZXRBZGphY2VudENlbGxFbGVtZW50cyIsInVpQ2hhbmdlIiwiY2hpbGRVSVBvaW50ZXJEb3duIiwib25yZXNpemUiLCJjb250ZW50IiwiZGVhY3RpdmF0ZSIsIm9ua2V5ZG93biIsImFjdGl2ZUVsZW1lbnQiLCJyZW1vdmVBdHRyaWJ1dGUiLCJVbmlwb2ludGVyIiwiYmluZFN0YXJ0RXZlbnQiLCJfYmluZFN0YXJ0RXZlbnQiLCJ1bmJpbmRTdGFydEV2ZW50IiwicG9pbnRlckVuYWJsZWQiLCJtc1BvaW50ZXJFbmFibGVkIiwiZ2V0VG91Y2giLCJpZGVudGlmaWVyIiwicG9pbnRlcklkZW50aWZpZXIiLCJvbm1vdXNlZG93biIsImJ1dHRvbiIsIl9wb2ludGVyRG93biIsIm9udG91Y2hzdGFydCIsIm9uTVNQb2ludGVyRG93biIsIm9ucG9pbnRlcmRvd24iLCJwb2ludGVySWQiLCJwb2ludGVyRG93biIsIl9iaW5kUG9zdFN0YXJ0RXZlbnRzIiwibW91c2Vkb3duIiwicG9pbnRlcmRvd24iLCJNU1BvaW50ZXJEb3duIiwiX2JvdW5kUG9pbnRlckV2ZW50cyIsIl91bmJpbmRQb3N0U3RhcnRFdmVudHMiLCJvbm1vdXNlbW92ZSIsIl9wb2ludGVyTW92ZSIsIm9uTVNQb2ludGVyTW92ZSIsIm9ucG9pbnRlcm1vdmUiLCJvbnRvdWNobW92ZSIsInBvaW50ZXJNb3ZlIiwib25tb3VzZXVwIiwiX3BvaW50ZXJVcCIsIm9uTVNQb2ludGVyVXAiLCJvbnBvaW50ZXJ1cCIsIm9udG91Y2hlbmQiLCJfcG9pbnRlckRvbmUiLCJwb2ludGVyVXAiLCJwb2ludGVyRG9uZSIsIm9uTVNQb2ludGVyQ2FuY2VsIiwib25wb2ludGVyY2FuY2VsIiwiX3BvaW50ZXJDYW5jZWwiLCJvbnRvdWNoY2FuY2VsIiwicG9pbnRlckNhbmNlbCIsImdldFBvaW50ZXJQb2ludCIsIlVuaWRyYWdnZXIiLCJiaW5kSGFuZGxlcyIsIl9iaW5kSGFuZGxlcyIsInVuYmluZEhhbmRsZXMiLCJ0b3VjaEFjdGlvbiIsIm1zVG91Y2hBY3Rpb24iLCJoYW5kbGVzIiwiX2RyYWdQb2ludGVyRG93biIsImJsdXIiLCJwb2ludGVyRG93blBvaW50IiwiY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duIiwiX2RyYWdQb2ludGVyTW92ZSIsIl9kcmFnTW92ZSIsImlzRHJhZ2dpbmciLCJoYXNEcmFnU3RhcnRlZCIsIl9kcmFnU3RhcnQiLCJfZHJhZ1BvaW50ZXJVcCIsIl9kcmFnRW5kIiwiX3N0YXRpY0NsaWNrIiwiZHJhZ1N0YXJ0UG9pbnQiLCJpc1ByZXZlbnRpbmdDbGlja3MiLCJkcmFnU3RhcnQiLCJkcmFnTW92ZSIsImRyYWdFbmQiLCJvbmNsaWNrIiwiaXNJZ25vcmluZ01vdXNlVXAiLCJzdGF0aWNDbGljayIsImRyYWdnYWJsZSIsImRyYWdUaHJlc2hvbGQiLCJfY3JlYXRlRHJhZyIsImJpbmREcmFnIiwiX3VpQ2hhbmdlRHJhZyIsIl9jaGlsZFVJUG9pbnRlckRvd25EcmFnIiwidW5iaW5kRHJhZyIsImlzRHJhZ0JvdW5kIiwicG9pbnRlckRvd25Gb2N1cyIsIlRFWFRBUkVBIiwiSU5QVVQiLCJPUFRJT04iLCJyYWRpbyIsImNoZWNrYm94Iiwic3VibWl0IiwiaW1hZ2UiLCJmaWxlIiwicG9pbnRlckRvd25TY3JvbGwiLCJTRUxFQ1QiLCJzY3JvbGxUbyIsImlzVG91Y2hTY3JvbGxpbmciLCJkcmFnU3RhcnRQb3NpdGlvbiIsInByZXZpb3VzRHJhZ1giLCJkcmFnTW92ZVRpbWUiLCJmcmVlU2Nyb2xsIiwiZHJhZ0VuZFJlc3RpbmdTZWxlY3QiLCJkcmFnRW5kQm9vc3RTZWxlY3QiLCJnZXRTbGlkZURpc3RhbmNlIiwiX2dldENsb3Nlc3RSZXN0aW5nIiwiZGlzdGFuY2UiLCJpbmRleCIsImZsb29yIiwib25zY3JvbGwiLCJUYXBMaXN0ZW5lciIsImJpbmRUYXAiLCJ1bmJpbmRUYXAiLCJ0YXBFbGVtZW50IiwiZGlyZWN0aW9uIiwieDAiLCJ4MSIsInkxIiwieDIiLCJ5MiIsIngzIiwiaXNFbmFibGVkIiwiaXNQcmV2aW91cyIsImlzTGVmdCIsInNldEF0dHJpYnV0ZSIsImRpc2FibGUiLCJjcmVhdGVTVkciLCJvblRhcCIsInVwZGF0ZSIsImNyZWF0ZUVsZW1lbnROUyIsImFycm93U2hhcGUiLCJlbmFibGUiLCJkaXNhYmxlZCIsInByZXZOZXh0QnV0dG9ucyIsIl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnMiLCJwcmV2QnV0dG9uIiwibmV4dEJ1dHRvbiIsImFjdGl2YXRlUHJldk5leHRCdXR0b25zIiwiZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyIsIlByZXZOZXh0QnV0dG9uIiwiaG9sZGVyIiwiZG90cyIsInNldERvdHMiLCJhZGREb3RzIiwicmVtb3ZlRG90cyIsImNyZWF0ZURvY3VtZW50RnJhZ21lbnQiLCJ1cGRhdGVTZWxlY3RlZCIsInNlbGVjdGVkRG90IiwiUGFnZURvdHMiLCJwYWdlRG90cyIsIl9jcmVhdGVQYWdlRG90cyIsImFjdGl2YXRlUGFnZURvdHMiLCJ1cGRhdGVTZWxlY3RlZFBhZ2VEb3RzIiwidXBkYXRlUGFnZURvdHMiLCJkZWFjdGl2YXRlUGFnZURvdHMiLCJzdGF0ZSIsIm9uVmlzaWJpbGl0eUNoYW5nZSIsInZpc2liaWxpdHlDaGFuZ2UiLCJvblZpc2liaWxpdHlQbGF5IiwidmlzaWJpbGl0eVBsYXkiLCJwbGF5IiwidGljayIsImF1dG9QbGF5IiwiY2xlYXIiLCJ0aW1lb3V0IiwidW5wYXVzZSIsInBhdXNlQXV0b1BsYXlPbkhvdmVyIiwiX2NyZWF0ZVBsYXllciIsInBsYXllciIsImFjdGl2YXRlUGxheWVyIiwic3RvcFBsYXllciIsImRlYWN0aXZhdGVQbGF5ZXIiLCJwbGF5UGxheWVyIiwicGF1c2VQbGF5ZXIiLCJ1bnBhdXNlUGxheWVyIiwib25tb3VzZWVudGVyIiwib25tb3VzZWxlYXZlIiwiUGxheWVyIiwiaW5zZXJ0IiwiX2NlbGxBZGRlZFJlbW92ZWQiLCJhcHBlbmQiLCJwcmVwZW5kIiwiY2VsbENoYW5nZSIsImNlbGxTaXplQ2hhbmdlIiwiaW1nIiwiZmxpY2tpdHkiLCJfY3JlYXRlTGF6eWxvYWQiLCJsYXp5TG9hZCIsIm9ubG9hZCIsIm9uZXJyb3IiLCJMYXp5TG9hZGVyIiwiX2NyZWF0ZUFzTmF2Rm9yIiwiYWN0aXZhdGVBc05hdkZvciIsImRlYWN0aXZhdGVBc05hdkZvciIsImRlc3Ryb3lBc05hdkZvciIsImFzTmF2Rm9yIiwic2V0TmF2Q29tcGFuaW9uIiwibmF2Q29tcGFuaW9uIiwib25OYXZDb21wYW5pb25TZWxlY3QiLCJuYXZDb21wYW5pb25TZWxlY3QiLCJvbk5hdlN0YXRpY0NsaWNrIiwicmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cyIsIm5hdlNlbGVjdGVkRWxlbWVudHMiLCJjaGFuZ2VOYXZTZWxlY3RlZENsYXNzIiwiaW1hZ2VzTG9hZGVkIiwiZWxlbWVudHMiLCJnZXRJbWFnZXMiLCJqcURlZmVycmVkIiwiRGVmZXJyZWQiLCJjaGVjayIsInVybCIsIkltYWdlIiwiYWRkRWxlbWVudEltYWdlcyIsImFkZEltYWdlIiwiYmFja2dyb3VuZCIsImFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzIiwiYmFja2dyb3VuZEltYWdlIiwiYWRkQmFja2dyb3VuZCIsInByb2dyZXNzIiwicHJvZ3Jlc3NlZENvdW50IiwiaGFzQW55QnJva2VuIiwiaXNMb2FkZWQiLCJub3RpZnkiLCJkZWJ1ZyIsImxvZyIsImlzQ29tcGxldGUiLCJnZXRJc0ltYWdlQ29tcGxldGUiLCJjb25maXJtIiwibmF0dXJhbFdpZHRoIiwicHJveHlJbWFnZSIsInVuYmluZEV2ZW50cyIsIm1ha2VKUXVlcnlQbHVnaW4iLCJwcm9taXNlIiwiX2NyZWF0ZUltYWdlc0xvYWRlZCIsImZhY3RvcnkiLCJ1dGlscyIsInByb3RvIiwiX2NyZWF0ZUJnTGF6eUxvYWQiLCJiZ0xhenlMb2FkIiwiYWRqQ291bnQiLCJjZWxsRWxlbXMiLCJjZWxsRWxlbSIsImJnTGF6eUxvYWRFbGVtIiwiaiIsIkJnTGF6eUxvYWRlciIsImVzY2FwZVJlZ0V4Q2hhcnMiLCJjcmVhdGVOb2RlIiwiY29udGFpbmVyQ2xhc3MiLCJkaXYiLCJFU0MiLCJUQUIiLCJSRVRVUk4iLCJMRUZUIiwiVVAiLCJSSUdIVCIsIkRPV04iLCJBdXRvY29tcGxldGUiLCJ0aGF0IiwiYWpheFNldHRpbmdzIiwiYXV0b1NlbGVjdEZpcnN0Iiwic2VydmljZVVybCIsImxvb2t1cCIsIm9uU2VsZWN0IiwibWluQ2hhcnMiLCJtYXhIZWlnaHQiLCJkZWZlclJlcXVlc3RCeSIsInBhcmFtcyIsImZvcm1hdFJlc3VsdCIsImRlbGltaXRlciIsInpJbmRleCIsIm5vQ2FjaGUiLCJvblNlYXJjaFN0YXJ0Iiwib25TZWFyY2hDb21wbGV0ZSIsIm9uU2VhcmNoRXJyb3IiLCJwcmVzZXJ2ZUlucHV0IiwidGFiRGlzYWJsZWQiLCJkYXRhVHlwZSIsImN1cnJlbnRSZXF1ZXN0IiwidHJpZ2dlclNlbGVjdE9uVmFsaWRJbnB1dCIsInByZXZlbnRCYWRRdWVyaWVzIiwibG9va3VwRmlsdGVyIiwic3VnZ2VzdGlvbiIsIm9yaWdpbmFsUXVlcnkiLCJxdWVyeUxvd2VyQ2FzZSIsInBhcmFtTmFtZSIsInRyYW5zZm9ybVJlc3VsdCIsInBhcnNlSlNPTiIsInNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UiLCJub1N1Z2dlc3Rpb25Ob3RpY2UiLCJvcmllbnRhdGlvbiIsImZvcmNlRml4UG9zaXRpb24iLCJzdWdnZXN0aW9ucyIsImJhZFF1ZXJpZXMiLCJjdXJyZW50VmFsdWUiLCJpbnRlcnZhbElkIiwiY2FjaGVkUmVzcG9uc2UiLCJvbkNoYW5nZUludGVydmFsIiwib25DaGFuZ2UiLCJpc0xvY2FsIiwic3VnZ2VzdGlvbnNDb250YWluZXIiLCJub1N1Z2dlc3Rpb25zQ29udGFpbmVyIiwiY2xhc3NlcyIsInNlbGVjdGVkIiwiaGludCIsImhpbnRWYWx1ZSIsInNlbGVjdGlvbiIsImluaXRpYWxpemUiLCJzZXRPcHRpb25zIiwicGF0dGVybiIsIlJlZ0V4cCIsImtpbGxlckZuIiwic3VnZ2VzdGlvblNlbGVjdG9yIiwiY29udGFpbmVyIiwia2lsbFN1Z2dlc3Rpb25zIiwiZGlzYWJsZUtpbGxlckZuIiwiZml4UG9zaXRpb25DYXB0dXJlIiwidmlzaWJsZSIsImZpeFBvc2l0aW9uIiwib25LZXlQcmVzcyIsIm9uS2V5VXAiLCJvbkJsdXIiLCJvbkZvY3VzIiwib25WYWx1ZUNoYW5nZSIsImVuYWJsZUtpbGxlckZuIiwiYWJvcnRBamF4IiwiYWJvcnQiLCJzdXBwbGllZE9wdGlvbnMiLCJ2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdCIsInZhbGlkYXRlT3JpZW50YXRpb24iLCJjbGVhckNhY2hlIiwiY2xlYXJJbnRlcnZhbCIsIiRjb250YWluZXIiLCJjb250YWluZXJQYXJlbnQiLCJzaXRlU2VhcmNoRGl2IiwiY29udGFpbmVySGVpZ2h0Iiwic3R5bGVzIiwidmlld1BvcnRIZWlnaHQiLCJ0b3BPdmVyZmxvdyIsImJvdHRvbU92ZXJmbG93Iiwib3BhY2l0eSIsInBhcmVudE9mZnNldERpZmYiLCJvZmZzZXRQYXJlbnQiLCJzdG9wS2lsbFN1Z2dlc3Rpb25zIiwic2V0SW50ZXJ2YWwiLCJpc0N1cnNvckF0RW5kIiwidmFsTGVuZ3RoIiwic2VsZWN0aW9uU3RhcnQiLCJyYW5nZSIsImNyZWF0ZVJhbmdlIiwibW92ZVN0YXJ0Iiwic3VnZ2VzdCIsIm9uSGludCIsInNlbGVjdEhpbnQiLCJtb3ZlVXAiLCJtb3ZlRG93biIsInN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbiIsImZpbmRCZXN0SGludCIsImdldFF1ZXJ5Iiwib25JbnZhbGlkYXRlU2VsZWN0aW9uIiwiaXNFeGFjdE1hdGNoIiwiZ2V0U3VnZ2VzdGlvbnMiLCJnZXRTdWdnZXN0aW9uc0xvY2FsIiwibGltaXQiLCJsb29rdXBMaW1pdCIsImdyZXAiLCJxIiwiY2FjaGVLZXkiLCJpZ25vcmVQYXJhbXMiLCJpc0Z1bmN0aW9uIiwiaXNCYWRRdWVyeSIsImFqYXgiLCJkb25lIiwicmVzdWx0IiwicHJvY2Vzc1Jlc3BvbnNlIiwiZmFpbCIsImpxWEhSIiwidGV4dFN0YXR1cyIsImVycm9yVGhyb3duIiwib25IaWRlIiwic2lnbmFsSGludCIsIm5vU3VnZ2VzdGlvbnMiLCJncm91cEJ5IiwiY2xhc3NTZWxlY3RlZCIsImJlZm9yZVJlbmRlciIsImNhdGVnb3J5IiwiZm9ybWF0R3JvdXAiLCJjdXJyZW50Q2F0ZWdvcnkiLCJhZGp1c3RDb250YWluZXJXaWR0aCIsImRldGFjaCIsImVtcHR5IiwiYmVzdE1hdGNoIiwiZm91bmRNYXRjaCIsInN1YnN0ciIsImZhbGxiYWNrIiwiaW5BcnJheSIsImFjdGl2ZUl0ZW0iLCJhZGp1c3RTY3JvbGwiLCJvZmZzZXRUb3AiLCJ1cHBlckJvdW5kIiwibG93ZXJCb3VuZCIsImhlaWdodERlbHRhIiwiZ2V0VmFsdWUiLCJvblNlbGVjdENhbGxiYWNrIiwiZGlzcG9zZSIsImF1dG9jb21wbGV0ZSIsImRldmJyaWRnZUF1dG9jb21wbGV0ZSIsImRhdGFLZXkiLCJpbnB1dEVsZW1lbnQiLCJpbnN0YW5jZSIsImJhc2VzIiwiYmFzZUhyZWYiLCJocmVmIiwibXlMYXp5TG9hZCIsIkxhenlMb2FkIiwiZWxlbWVudHNfc2VsZWN0b3IiLCIkY2Fyb3VzZWwiLCIkaW1ncyIsImRvY1N0eWxlIiwidHJhbnNmb3JtUHJvcCIsImZsa3R5Iiwic2xpZGUiLCJjbGljayIsIiRnYWxsZXJ5Iiwib25Mb2FkZWRkYXRhIiwiY2VsbCIsInZpZGVvIiwiJHNsaWRlc2hvdyIsInNsaWRlc2hvd2ZsayIsIndyYXAiLCJ3aGF0SW5wdXQiLCJhc2siLCJ0b2dnbGVDbGFzcyIsInRvZ2dsZVNlYXJjaENsYXNzZXMiLCJ0b2dnbGVNb2JpbGVNZW51Q2xhc3NlcyIsImdldEVsZW1lbnRCeUlkIiwiZm9jdXNvdXQiLCJvbGRTaXplIl0sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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QSxLQUFJd0ksUUFBUTdKLEVBQUUsS0FBRixFQUFTMjhCLElBQVQsRUFBZTl5QixLQUFmLEVBQVo7QUFDQSxLQUFJRCxTQUFTNUosRUFBRSxLQUFGLEVBQVMyOEIsSUFBVCxFQUFlL3lCLE1BQWYsRUFBYjtBQUNBK3lCLE1BQUt6ekIsTUFBTCxHQUFjOEksUUFBZCxDQUF1QixJQUF2QjtBQUNBMnFCLE1BQUt6ekIsTUFBTCxHQUFjNnVCLE9BQWQsQ0FBc0IsbUZBQW1Gb1AsS0FBbkYsR0FBMkYsNEJBQTNGLEdBQTBIdDlCLEtBQTFILEdBQWtJLFlBQWxJLEdBQWlKRCxNQUFqSixHQUEwSiw0RkFBaEw7QUFDQSt5QixNQUFLdHFCLElBQUw7QUFDQW5PLEdBQUV1SixjQUFGO0FBQ0EsQ0FURDs7QUFhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBblVBek4sRUFBRSxrQkFBRixFQUFzQm00QixRQUF0QixDQUErQjtBQUM3QjtBQUNBaFMsYUFBVyxNQUZrQjtBQUc3QndGLFdBQVM7QUFIb0IsQ0FBL0IiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiB3aGF0LWlucHV0IC0gQSBnbG9iYWwgdXRpbGl0eSBmb3IgdHJhY2tpbmcgdGhlIGN1cnJlbnQgaW5wdXQgbWV0aG9kIChtb3VzZSwga2V5Ym9hcmQgb3IgdG91Y2gpLlxuICogQHZlcnNpb24gdjQuMC42XG4gKiBAbGluayBodHRwczovL2dpdGh1Yi5jb20vdGVuMXNldmVuL3doYXQtaW5wdXRcbiAqIEBsaWNlbnNlIE1JVFxuICovXG4oZnVuY3Rpb24gd2VicGFja1VuaXZlcnNhbE1vZHVsZURlZmluaXRpb24ocm9vdCwgZmFjdG9yeSkge1xuXHRpZih0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSA9PT0gJ29iamVjdCcpXG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG5cdGVsc2UgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKVxuXHRcdGRlZmluZShcIndoYXRJbnB1dFwiLCBbXSwgZmFjdG9yeSk7XG5cdGVsc2UgaWYodHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnKVxuXHRcdGV4cG9ydHNbXCJ3aGF0SW5wdXRcIl0gPSBmYWN0b3J5KCk7XG5cdGVsc2Vcblx0XHRyb290W1wid2hhdElucHV0XCJdID0gZmFjdG9yeSgpO1xufSkodGhpcywgZnVuY3Rpb24oKSB7XG5yZXR1cm4gLyoqKioqKi8gKGZ1bmN0aW9uKG1vZHVsZXMpIHsgLy8gd2VicGFja0Jvb3RzdHJhcFxuLyoqKioqKi8gXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4vKioqKioqLyBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbi8qKioqKiovIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbi8qKioqKiovIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pXG4vKioqKioqLyBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge30sXG4vKioqKioqLyBcdFx0XHRpZDogbW9kdWxlSWQsXG4vKioqKioqLyBcdFx0XHRsb2FkZWQ6IGZhbHNlXG4vKioqKioqLyBcdFx0fTtcblxuLyoqKioqKi8gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuLyoqKioqKi8gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4vKioqKioqLyBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuLyoqKioqKi8gXHRcdG1vZHVsZS5sb2FkZWQgPSB0cnVlO1xuXG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cblxuXG4vKioqKioqLyBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4vKioqKioqLyBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbi8qKioqKiovIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbi8qKioqKiovIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuLyoqKioqKi8gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuLyoqKioqKi8gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG4vKioqKioqLyBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuLyoqKioqKi8gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcbi8qKioqKiovIH0pXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gKFtcbi8qIDAgKi9cbi8qKiovIGZ1bmN0aW9uKG1vZHVsZSwgZXhwb3J0cykge1xuXG5cdG1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCkge1xuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgVmFyaWFibGVzXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgLy8gY2FjaGUgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50XG5cdCAgdmFyIGRvY0VsZW0gPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgdHlwZVxuXHQgIHZhciBjdXJyZW50SW5wdXQgPSAnaW5pdGlhbCc7XG5cblx0ICAvLyBsYXN0IHVzZWQgaW5wdXQgaW50ZW50XG5cdCAgdmFyIGN1cnJlbnRJbnRlbnQgPSBudWxsO1xuXG5cdCAgLy8gZm9ybSBpbnB1dCB0eXBlc1xuXHQgIHZhciBmb3JtSW5wdXRzID0gW1xuXHQgICAgJ2lucHV0Jyxcblx0ICAgICdzZWxlY3QnLFxuXHQgICAgJ3RleHRhcmVhJ1xuXHQgIF07XG5cblx0ICAvLyBsaXN0IG9mIG1vZGlmaWVyIGtleXMgY29tbW9ubHkgdXNlZCB3aXRoIHRoZSBtb3VzZSBhbmRcblx0ICAvLyBjYW4gYmUgc2FmZWx5IGlnbm9yZWQgdG8gcHJldmVudCBmYWxzZSBrZXlib2FyZCBkZXRlY3Rpb25cblx0ICB2YXIgaWdub3JlTWFwID0gW1xuXHQgICAgMTYsIC8vIHNoaWZ0XG5cdCAgICAxNywgLy8gY29udHJvbFxuXHQgICAgMTgsIC8vIGFsdFxuXHQgICAgOTEsIC8vIFdpbmRvd3Mga2V5IC8gbGVmdCBBcHBsZSBjbWRcblx0ICAgIDkzICAvLyBXaW5kb3dzIG1lbnUgLyByaWdodCBBcHBsZSBjbWRcblx0ICBdO1xuXG5cdCAgLy8gbWFwcGluZyBvZiBldmVudHMgdG8gaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRNYXAgPSB7XG5cdCAgICAna2V5dXAnOiAna2V5Ym9hcmQnLFxuXHQgICAgJ21vdXNlZG93bic6ICdtb3VzZScsXG5cdCAgICAnbW91c2Vtb3ZlJzogJ21vdXNlJyxcblx0ICAgICdNU1BvaW50ZXJEb3duJzogJ3BvaW50ZXInLFxuXHQgICAgJ01TUG9pbnRlck1vdmUnOiAncG9pbnRlcicsXG5cdCAgICAncG9pbnRlcmRvd24nOiAncG9pbnRlcicsXG5cdCAgICAncG9pbnRlcm1vdmUnOiAncG9pbnRlcicsXG5cdCAgICAndG91Y2hzdGFydCc6ICd0b3VjaCdcblx0ICB9O1xuXG5cdCAgLy8gYXJyYXkgb2YgYWxsIHVzZWQgaW5wdXQgdHlwZXNcblx0ICB2YXIgaW5wdXRUeXBlcyA9IFtdO1xuXG5cdCAgLy8gYm9vbGVhbjogdHJ1ZSBpZiB0b3VjaCBidWZmZXIgdGltZXIgaXMgcnVubmluZ1xuXHQgIHZhciBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXG5cdCAgLy8gbWFwIG9mIElFIDEwIHBvaW50ZXIgZXZlbnRzXG5cdCAgdmFyIHBvaW50ZXJNYXAgPSB7XG5cdCAgICAyOiAndG91Y2gnLFxuXHQgICAgMzogJ3RvdWNoJywgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgIDQ6ICdtb3VzZSdcblx0ICB9O1xuXG5cdCAgLy8gdG91Y2ggYnVmZmVyIHRpbWVyXG5cdCAgdmFyIHRvdWNoVGltZXIgPSBudWxsO1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBTZXQgdXBcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgc2V0VXAgPSBmdW5jdGlvbigpIHtcblxuXHQgICAgLy8gYWRkIGNvcnJlY3QgbW91c2Ugd2hlZWwgZXZlbnQgbWFwcGluZyB0byBgaW5wdXRNYXBgXG5cdCAgICBpbnB1dE1hcFtkZXRlY3RXaGVlbCgpXSA9ICdtb3VzZSc7XG5cblx0ICAgIGFkZExpc3RlbmVycygpO1xuXHQgICAgc2V0SW5wdXQoKTtcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBFdmVudHNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgYWRkTGlzdGVuZXJzID0gZnVuY3Rpb24oKSB7XG5cblx0ICAgIC8vIGBwb2ludGVybW92ZWAsIGBNU1BvaW50ZXJNb3ZlYCwgYG1vdXNlbW92ZWAgYW5kIG1vdXNlIHdoZWVsIGV2ZW50IGJpbmRpbmdcblx0ICAgIC8vIGNhbiBvbmx5IGRlbW9uc3RyYXRlIHBvdGVudGlhbCwgYnV0IG5vdCBhY3R1YWwsIGludGVyYWN0aW9uXG5cdCAgICAvLyBhbmQgYXJlIHRyZWF0ZWQgc2VwYXJhdGVseVxuXG5cdCAgICAvLyBwb2ludGVyIGV2ZW50cyAobW91c2UsIHBlbiwgdG91Y2gpXG5cdCAgICBpZiAod2luZG93LlBvaW50ZXJFdmVudCkge1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3BvaW50ZXJtb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSBpZiAod2luZG93Lk1TUG9pbnRlckV2ZW50KSB7XG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignTVNQb2ludGVyRG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgICAgZG9jRWxlbS5hZGRFdmVudExpc3RlbmVyKCdNU1BvaW50ZXJNb3ZlJywgc2V0SW50ZW50KTtcblx0ICAgIH0gZWxzZSB7XG5cblx0ICAgICAgLy8gbW91c2UgZXZlbnRzXG5cdCAgICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgdXBkYXRlSW5wdXQpO1xuXHQgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbW92ZScsIHNldEludGVudCk7XG5cblx0ICAgICAgLy8gdG91Y2ggZXZlbnRzXG5cdCAgICAgIGlmICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpIHtcblx0ICAgICAgICBkb2NFbGVtLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCB0b3VjaEJ1ZmZlcik7XG5cdCAgICAgIH1cblx0ICAgIH1cblxuXHQgICAgLy8gbW91c2Ugd2hlZWxcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcihkZXRlY3RXaGVlbCgpLCBzZXRJbnRlbnQpO1xuXG5cdCAgICAvLyBrZXlib2FyZCBldmVudHNcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIHVwZGF0ZUlucHV0KTtcblx0ICAgIGRvY0VsZW0uYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCB1cGRhdGVJbnB1dCk7XG5cdCAgfTtcblxuXHQgIC8vIGNoZWNrcyBjb25kaXRpb25zIGJlZm9yZSB1cGRhdGluZyBuZXcgaW5wdXRcblx0ICB2YXIgdXBkYXRlSW5wdXQgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciBldmVudEtleSA9IGV2ZW50LndoaWNoO1xuXHQgICAgICB2YXIgdmFsdWUgPSBpbnB1dE1hcFtldmVudC50eXBlXTtcblx0ICAgICAgaWYgKHZhbHVlID09PSAncG9pbnRlcicpIHZhbHVlID0gcG9pbnRlclR5cGUoZXZlbnQpO1xuXG5cdCAgICAgIGlmIChcblx0ICAgICAgICBjdXJyZW50SW5wdXQgIT09IHZhbHVlIHx8XG5cdCAgICAgICAgY3VycmVudEludGVudCAhPT0gdmFsdWVcblx0ICAgICAgKSB7XG5cblx0ICAgICAgICB2YXIgYWN0aXZlRWxlbSA9IGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7XG5cdCAgICAgICAgdmFyIGFjdGl2ZUlucHV0ID0gKFxuXHQgICAgICAgICAgYWN0aXZlRWxlbSAmJlxuXHQgICAgICAgICAgYWN0aXZlRWxlbS5ub2RlTmFtZSAmJlxuXHQgICAgICAgICAgZm9ybUlucHV0cy5pbmRleE9mKGFjdGl2ZUVsZW0ubm9kZU5hbWUudG9Mb3dlckNhc2UoKSkgPT09IC0xXG5cdCAgICAgICAgKSA/IHRydWUgOiBmYWxzZTtcblxuXHQgICAgICAgIGlmIChcblx0ICAgICAgICAgIHZhbHVlID09PSAndG91Y2gnIHx8XG5cblx0ICAgICAgICAgIC8vIGlnbm9yZSBtb3VzZSBtb2RpZmllciBrZXlzXG5cdCAgICAgICAgICAodmFsdWUgPT09ICdtb3VzZScgJiYgaWdub3JlTWFwLmluZGV4T2YoZXZlbnRLZXkpID09PSAtMSkgfHxcblxuXHQgICAgICAgICAgLy8gZG9uJ3Qgc3dpdGNoIGlmIHRoZSBjdXJyZW50IGVsZW1lbnQgaXMgYSBmb3JtIGlucHV0XG5cdCAgICAgICAgICAodmFsdWUgPT09ICdrZXlib2FyZCcgJiYgYWN0aXZlSW5wdXQpXG5cdCAgICAgICAgKSB7XG5cblx0ICAgICAgICAgIC8vIHNldCB0aGUgY3VycmVudCBhbmQgY2F0Y2gtYWxsIHZhcmlhYmxlXG5cdCAgICAgICAgICBjdXJyZW50SW5wdXQgPSBjdXJyZW50SW50ZW50ID0gdmFsdWU7XG5cblx0ICAgICAgICAgIHNldElucHV0KCk7XG5cdCAgICAgICAgfVxuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgdGhlIGRvYyBhbmQgYGlucHV0VHlwZXNgIGFycmF5IHdpdGggbmV3IGlucHV0XG5cdCAgdmFyIHNldElucHV0ID0gZnVuY3Rpb24oKSB7XG5cdCAgICBkb2NFbGVtLnNldEF0dHJpYnV0ZSgnZGF0YS13aGF0aW5wdXQnLCBjdXJyZW50SW5wdXQpO1xuXHQgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnB1dCk7XG5cblx0ICAgIGlmIChpbnB1dFR5cGVzLmluZGV4T2YoY3VycmVudElucHV0KSA9PT0gLTEpIHtcblx0ICAgICAgaW5wdXRUeXBlcy5wdXNoKGN1cnJlbnRJbnB1dCk7XG5cdCAgICAgIGRvY0VsZW0uY2xhc3NOYW1lICs9ICcgd2hhdGlucHV0LXR5cGVzLScgKyBjdXJyZW50SW5wdXQ7XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIHVwZGF0ZXMgaW5wdXQgaW50ZW50IGZvciBgbW91c2Vtb3ZlYCBhbmQgYHBvaW50ZXJtb3ZlYFxuXHQgIHZhciBzZXRJbnRlbnQgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBvbmx5IGV4ZWN1dGUgaWYgdGhlIHRvdWNoIGJ1ZmZlciB0aW1lciBpc24ndCBydW5uaW5nXG5cdCAgICBpZiAoIWlzQnVmZmVyaW5nKSB7XG5cdCAgICAgIHZhciB2YWx1ZSA9IGlucHV0TWFwW2V2ZW50LnR5cGVdO1xuXHQgICAgICBpZiAodmFsdWUgPT09ICdwb2ludGVyJykgdmFsdWUgPSBwb2ludGVyVHlwZShldmVudCk7XG5cblx0ICAgICAgaWYgKGN1cnJlbnRJbnRlbnQgIT09IHZhbHVlKSB7XG5cdCAgICAgICAgY3VycmVudEludGVudCA9IHZhbHVlO1xuXG5cdCAgICAgICAgZG9jRWxlbS5zZXRBdHRyaWJ1dGUoJ2RhdGEtd2hhdGludGVudCcsIGN1cnJlbnRJbnRlbnQpO1xuXHQgICAgICB9XG5cdCAgICB9XG5cdCAgfTtcblxuXHQgIC8vIGJ1ZmZlcnMgdG91Y2ggZXZlbnRzIGJlY2F1c2UgdGhleSBmcmVxdWVudGx5IGFsc28gZmlyZSBtb3VzZSBldmVudHNcblx0ICB2YXIgdG91Y2hCdWZmZXIgPSBmdW5jdGlvbihldmVudCkge1xuXG5cdCAgICAvLyBjbGVhciB0aGUgdGltZXIgaWYgaXQgaGFwcGVucyB0byBiZSBydW5uaW5nXG5cdCAgICB3aW5kb3cuY2xlYXJUaW1lb3V0KHRvdWNoVGltZXIpO1xuXG5cdCAgICAvLyBzZXQgdGhlIGN1cnJlbnQgaW5wdXRcblx0ICAgIHVwZGF0ZUlucHV0KGV2ZW50KTtcblxuXHQgICAgLy8gc2V0IHRoZSBpc0J1ZmZlcmluZyB0byBgdHJ1ZWBcblx0ICAgIGlzQnVmZmVyaW5nID0gdHJ1ZTtcblxuXHQgICAgLy8gcnVuIHRoZSB0aW1lclxuXHQgICAgdG91Y2hUaW1lciA9IHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXG5cdCAgICAgIC8vIGlmIHRoZSB0aW1lciBydW5zIG91dCwgc2V0IGlzQnVmZmVyaW5nIGJhY2sgdG8gYGZhbHNlYFxuXHQgICAgICBpc0J1ZmZlcmluZyA9IGZhbHNlO1xuXHQgICAgfSwgMjAwKTtcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBVdGlsaXRpZXNcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICovXG5cblx0ICB2YXIgcG9pbnRlclR5cGUgPSBmdW5jdGlvbihldmVudCkge1xuXHQgICBpZiAodHlwZW9mIGV2ZW50LnBvaW50ZXJUeXBlID09PSAnbnVtYmVyJykge1xuXHQgICAgICByZXR1cm4gcG9pbnRlck1hcFtldmVudC5wb2ludGVyVHlwZV07XG5cdCAgIH0gZWxzZSB7XG5cdCAgICAgIHJldHVybiAoZXZlbnQucG9pbnRlclR5cGUgPT09ICdwZW4nKSA/ICd0b3VjaCcgOiBldmVudC5wb2ludGVyVHlwZTsgLy8gdHJlYXQgcGVuIGxpa2UgdG91Y2hcblx0ICAgfVxuXHQgIH07XG5cblx0ICAvLyBkZXRlY3QgdmVyc2lvbiBvZiBtb3VzZSB3aGVlbCBldmVudCB0byB1c2Vcblx0ICAvLyB2aWEgaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvRXZlbnRzL3doZWVsXG5cdCAgdmFyIGRldGVjdFdoZWVsID0gZnVuY3Rpb24oKSB7XG5cdCAgICByZXR1cm4gJ29ud2hlZWwnIGluIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpID9cblx0ICAgICAgJ3doZWVsJyA6IC8vIE1vZGVybiBicm93c2VycyBzdXBwb3J0IFwid2hlZWxcIlxuXG5cdCAgICAgIGRvY3VtZW50Lm9ubW91c2V3aGVlbCAhPT0gdW5kZWZpbmVkID9cblx0ICAgICAgICAnbW91c2V3aGVlbCcgOiAvLyBXZWJraXQgYW5kIElFIHN1cHBvcnQgYXQgbGVhc3QgXCJtb3VzZXdoZWVsXCJcblx0ICAgICAgICAnRE9NTW91c2VTY3JvbGwnOyAvLyBsZXQncyBhc3N1bWUgdGhhdCByZW1haW5pbmcgYnJvd3NlcnMgYXJlIG9sZGVyIEZpcmVmb3hcblx0ICB9O1xuXG5cblx0ICAvKlxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgICBJbml0XG5cblx0ICAgIGRvbid0IHN0YXJ0IHNjcmlwdCB1bmxlc3MgYnJvd3NlciBjdXRzIHRoZSBtdXN0YXJkXG5cdCAgICAoYWxzbyBwYXNzZXMgaWYgcG9seWZpbGxzIGFyZSB1c2VkKVxuXHQgICAgLS0tLS0tLS0tLS0tLS0tXG5cdCAgKi9cblxuXHQgIGlmIChcblx0ICAgICdhZGRFdmVudExpc3RlbmVyJyBpbiB3aW5kb3cgJiZcblx0ICAgIEFycmF5LnByb3RvdHlwZS5pbmRleE9mXG5cdCAgKSB7XG5cdCAgICBzZXRVcCgpO1xuXHQgIH1cblxuXG5cdCAgLypcblx0ICAgIC0tLS0tLS0tLS0tLS0tLVxuXHQgICAgQVBJXG5cdCAgICAtLS0tLS0tLS0tLS0tLS1cblx0ICAqL1xuXG5cdCAgcmV0dXJuIHtcblxuXHQgICAgLy8gcmV0dXJucyBzdHJpbmc6IHRoZSBjdXJyZW50IGlucHV0IHR5cGVcblx0ICAgIC8vIG9wdDogJ2xvb3NlJ3wnc3RyaWN0J1xuXHQgICAgLy8gJ3N0cmljdCcgKGRlZmF1bHQpOiByZXR1cm5zIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBgZGF0YS13aGF0aW5wdXRgIGF0dHJpYnV0ZVxuXHQgICAgLy8gJ2xvb3NlJzogaW5jbHVkZXMgYGRhdGEtd2hhdGludGVudGAgdmFsdWUgaWYgaXQncyBtb3JlIGN1cnJlbnQgdGhhbiBgZGF0YS13aGF0aW5wdXRgXG5cdCAgICBhc2s6IGZ1bmN0aW9uKG9wdCkgeyByZXR1cm4gKG9wdCA9PT0gJ2xvb3NlJykgPyBjdXJyZW50SW50ZW50IDogY3VycmVudElucHV0OyB9LFxuXG5cdCAgICAvLyByZXR1cm5zIGFycmF5OiBhbGwgdGhlIGRldGVjdGVkIGlucHV0IHR5cGVzXG5cdCAgICB0eXBlczogZnVuY3Rpb24oKSB7IHJldHVybiBpbnB1dFR5cGVzOyB9XG5cblx0ICB9O1xuXG5cdH0oKSk7XG5cblxuLyoqKi8gfVxuLyoqKioqKi8gXSlcbn0pO1xuOyIsIiFmdW5jdGlvbigkKSB7XG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgRk9VTkRBVElPTl9WRVJTSU9OID0gJzYuMy4xJztcblxuLy8gR2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4vLyBUaGlzIGlzIGF0dGFjaGVkIHRvIHRoZSB3aW5kb3csIG9yIHVzZWQgYXMgYSBtb2R1bGUgZm9yIEFNRC9Ccm93c2VyaWZ5XG52YXIgRm91bmRhdGlvbiA9IHtcbiAgdmVyc2lvbjogRk9VTkRBVElPTl9WRVJTSU9OLFxuXG4gIC8qKlxuICAgKiBTdG9yZXMgaW5pdGlhbGl6ZWQgcGx1Z2lucy5cbiAgICovXG4gIF9wbHVnaW5zOiB7fSxcblxuICAvKipcbiAgICogU3RvcmVzIGdlbmVyYXRlZCB1bmlxdWUgaWRzIGZvciBwbHVnaW4gaW5zdGFuY2VzXG4gICAqL1xuICBfdXVpZHM6IFtdLFxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGEgYm9vbGVhbiBmb3IgUlRMIHN1cHBvcnRcbiAgICovXG4gIHJ0bDogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gJCgnaHRtbCcpLmF0dHIoJ2RpcicpID09PSAncnRsJztcbiAgfSxcbiAgLyoqXG4gICAqIERlZmluZXMgYSBGb3VuZGF0aW9uIHBsdWdpbiwgYWRkaW5nIGl0IHRvIHRoZSBgRm91bmRhdGlvbmAgbmFtZXNwYWNlIGFuZCB0aGUgbGlzdCBvZiBwbHVnaW5zIHRvIGluaXRpYWxpemUgd2hlbiByZWZsb3dpbmcuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBwbHVnaW4gLSBUaGUgY29uc3RydWN0b3Igb2YgdGhlIHBsdWdpbi5cbiAgICovXG4gIHBsdWdpbjogZnVuY3Rpb24ocGx1Z2luLCBuYW1lKSB7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBhZGRpbmcgdG8gZ2xvYmFsIEZvdW5kYXRpb24gb2JqZWN0XG4gICAgLy8gRXhhbXBsZXM6IEZvdW5kYXRpb24uUmV2ZWFsLCBGb3VuZGF0aW9uLk9mZkNhbnZhc1xuICAgIHZhciBjbGFzc05hbWUgPSAobmFtZSB8fCBmdW5jdGlvbk5hbWUocGx1Z2luKSk7XG4gICAgLy8gT2JqZWN0IGtleSB0byB1c2Ugd2hlbiBzdG9yaW5nIHRoZSBwbHVnaW4sIGFsc28gdXNlZCB0byBjcmVhdGUgdGhlIGlkZW50aWZ5aW5nIGRhdGEgYXR0cmlidXRlIGZvciB0aGUgcGx1Z2luXG4gICAgLy8gRXhhbXBsZXM6IGRhdGEtcmV2ZWFsLCBkYXRhLW9mZi1jYW52YXNcbiAgICB2YXIgYXR0ck5hbWUgID0gaHlwaGVuYXRlKGNsYXNzTmFtZSk7XG5cbiAgICAvLyBBZGQgdG8gdGhlIEZvdW5kYXRpb24gb2JqZWN0IGFuZCB0aGUgcGx1Z2lucyBsaXN0IChmb3IgcmVmbG93aW5nKVxuICAgIHRoaXMuX3BsdWdpbnNbYXR0ck5hbWVdID0gdGhpc1tjbGFzc05hbWVdID0gcGx1Z2luO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFBvcHVsYXRlcyB0aGUgX3V1aWRzIGFycmF5IHdpdGggcG9pbnRlcnMgdG8gZWFjaCBpbmRpdmlkdWFsIHBsdWdpbiBpbnN0YW5jZS5cbiAgICogQWRkcyB0aGUgYHpmUGx1Z2luYCBkYXRhLWF0dHJpYnV0ZSB0byBwcm9ncmFtbWF0aWNhbGx5IGNyZWF0ZWQgcGx1Z2lucyB0byBhbGxvdyB1c2Ugb2YgJChzZWxlY3RvcikuZm91bmRhdGlvbihtZXRob2QpIGNhbGxzLlxuICAgKiBBbHNvIGZpcmVzIHRoZSBpbml0aWFsaXphdGlvbiBldmVudCBmb3IgZWFjaCBwbHVnaW4sIGNvbnNvbGlkYXRpbmcgcmVwZXRpdGl2ZSBjb2RlLlxuICAgKiBAcGFyYW0ge09iamVjdH0gcGx1Z2luIC0gYW4gaW5zdGFuY2Ugb2YgYSBwbHVnaW4sIHVzdWFsbHkgYHRoaXNgIGluIGNvbnRleHQuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gdGhlIG5hbWUgb2YgdGhlIHBsdWdpbiwgcGFzc2VkIGFzIGEgY2FtZWxDYXNlZCBzdHJpbmcuXG4gICAqIEBmaXJlcyBQbHVnaW4jaW5pdFxuICAgKi9cbiAgcmVnaXN0ZXJQbHVnaW46IGZ1bmN0aW9uKHBsdWdpbiwgbmFtZSl7XG4gICAgdmFyIHBsdWdpbk5hbWUgPSBuYW1lID8gaHlwaGVuYXRlKG5hbWUpIDogZnVuY3Rpb25OYW1lKHBsdWdpbi5jb25zdHJ1Y3RvcikudG9Mb3dlckNhc2UoKTtcbiAgICBwbHVnaW4udXVpZCA9IHRoaXMuR2V0WW9EaWdpdHMoNiwgcGx1Z2luTmFtZSk7XG5cbiAgICBpZighcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApKXsgcGx1Z2luLiRlbGVtZW50LmF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWAsIHBsdWdpbi51dWlkKTsgfVxuICAgIGlmKCFwbHVnaW4uJGVsZW1lbnQuZGF0YSgnemZQbHVnaW4nKSl7IHBsdWdpbi4kZWxlbWVudC5kYXRhKCd6ZlBsdWdpbicsIHBsdWdpbik7IH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGluaXRpYWxpemVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jaW5pdFxuICAgICAgICAgICAqL1xuICAgIHBsdWdpbi4kZWxlbWVudC50cmlnZ2VyKGBpbml0LnpmLiR7cGx1Z2luTmFtZX1gKTtcblxuICAgIHRoaXMuX3V1aWRzLnB1c2gocGx1Z2luLnV1aWQpO1xuXG4gICAgcmV0dXJuO1xuICB9LFxuICAvKipcbiAgICogQGZ1bmN0aW9uXG4gICAqIFJlbW92ZXMgdGhlIHBsdWdpbnMgdXVpZCBmcm9tIHRoZSBfdXVpZHMgYXJyYXkuXG4gICAqIFJlbW92ZXMgdGhlIHpmUGx1Z2luIGRhdGEgYXR0cmlidXRlLCBhcyB3ZWxsIGFzIHRoZSBkYXRhLXBsdWdpbi1uYW1lIGF0dHJpYnV0ZS5cbiAgICogQWxzbyBmaXJlcyB0aGUgZGVzdHJveWVkIGV2ZW50IGZvciB0aGUgcGx1Z2luLCBjb25zb2xpZGF0aW5nIHJlcGV0aXRpdmUgY29kZS5cbiAgICogQHBhcmFtIHtPYmplY3R9IHBsdWdpbiAtIGFuIGluc3RhbmNlIG9mIGEgcGx1Z2luLCB1c3VhbGx5IGB0aGlzYCBpbiBjb250ZXh0LlxuICAgKiBAZmlyZXMgUGx1Z2luI2Rlc3Ryb3llZFxuICAgKi9cbiAgdW5yZWdpc3RlclBsdWdpbjogZnVuY3Rpb24ocGx1Z2luKXtcbiAgICB2YXIgcGx1Z2luTmFtZSA9IGh5cGhlbmF0ZShmdW5jdGlvbk5hbWUocGx1Z2luLiRlbGVtZW50LmRhdGEoJ3pmUGx1Z2luJykuY29uc3RydWN0b3IpKTtcblxuICAgIHRoaXMuX3V1aWRzLnNwbGljZSh0aGlzLl91dWlkcy5pbmRleE9mKHBsdWdpbi51dWlkKSwgMSk7XG4gICAgcGx1Z2luLiRlbGVtZW50LnJlbW92ZUF0dHIoYGRhdGEtJHtwbHVnaW5OYW1lfWApLnJlbW92ZURhdGEoJ3pmUGx1Z2luJylcbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSBwbHVnaW4gaGFzIGJlZW4gZGVzdHJveWVkLlxuICAgICAgICAgICAqIEBldmVudCBQbHVnaW4jZGVzdHJveWVkXG4gICAgICAgICAgICovXG4gICAgICAgICAgLnRyaWdnZXIoYGRlc3Ryb3llZC56Zi4ke3BsdWdpbk5hbWV9YCk7XG4gICAgZm9yKHZhciBwcm9wIGluIHBsdWdpbil7XG4gICAgICBwbHVnaW5bcHJvcF0gPSBudWxsOy8vY2xlYW4gdXAgc2NyaXB0IHRvIHByZXAgZm9yIGdhcmJhZ2UgY29sbGVjdGlvbi5cbiAgICB9XG4gICAgcmV0dXJuO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZnVuY3Rpb25cbiAgICogQ2F1c2VzIG9uZSBvciBtb3JlIGFjdGl2ZSBwbHVnaW5zIHRvIHJlLWluaXRpYWxpemUsIHJlc2V0dGluZyBldmVudCBsaXN0ZW5lcnMsIHJlY2FsY3VsYXRpbmcgcG9zaXRpb25zLCBldGMuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBwbHVnaW5zIC0gb3B0aW9uYWwgc3RyaW5nIG9mIGFuIGluZGl2aWR1YWwgcGx1Z2luIGtleSwgYXR0YWluZWQgYnkgY2FsbGluZyBgJChlbGVtZW50KS5kYXRhKCdwbHVnaW5OYW1lJylgLCBvciBzdHJpbmcgb2YgYSBwbHVnaW4gY2xhc3MgaS5lLiBgJ2Ryb3Bkb3duJ2BcbiAgICogQGRlZmF1bHQgSWYgbm8gYXJndW1lbnQgaXMgcGFzc2VkLCByZWZsb3cgYWxsIGN1cnJlbnRseSBhY3RpdmUgcGx1Z2lucy5cbiAgICovXG4gICByZUluaXQ6IGZ1bmN0aW9uKHBsdWdpbnMpe1xuICAgICB2YXIgaXNKUSA9IHBsdWdpbnMgaW5zdGFuY2VvZiAkO1xuICAgICB0cnl7XG4gICAgICAgaWYoaXNKUSl7XG4gICAgICAgICBwbHVnaW5zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgJCh0aGlzKS5kYXRhKCd6ZlBsdWdpbicpLl9pbml0KCk7XG4gICAgICAgICB9KTtcbiAgICAgICB9ZWxzZXtcbiAgICAgICAgIHZhciB0eXBlID0gdHlwZW9mIHBsdWdpbnMsXG4gICAgICAgICBfdGhpcyA9IHRoaXMsXG4gICAgICAgICBmbnMgPSB7XG4gICAgICAgICAgICdvYmplY3QnOiBmdW5jdGlvbihwbGdzKXtcbiAgICAgICAgICAgICBwbGdzLmZvckVhY2goZnVuY3Rpb24ocCl7XG4gICAgICAgICAgICAgICBwID0gaHlwaGVuYXRlKHApO1xuICAgICAgICAgICAgICAgJCgnW2RhdGEtJysgcCArJ10nKS5mb3VuZGF0aW9uKCdfaW5pdCcpO1xuICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICB9LFxuICAgICAgICAgICAnc3RyaW5nJzogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICBwbHVnaW5zID0gaHlwaGVuYXRlKHBsdWdpbnMpO1xuICAgICAgICAgICAgICQoJ1tkYXRhLScrIHBsdWdpbnMgKyddJykuZm91bmRhdGlvbignX2luaXQnKTtcbiAgICAgICAgICAgfSxcbiAgICAgICAgICAgJ3VuZGVmaW5lZCc6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgdGhpc1snb2JqZWN0J10oT2JqZWN0LmtleXMoX3RoaXMuX3BsdWdpbnMpKTtcbiAgICAgICAgICAgfVxuICAgICAgICAgfTtcbiAgICAgICAgIGZuc1t0eXBlXShwbHVnaW5zKTtcbiAgICAgICB9XG4gICAgIH1jYXRjaChlcnIpe1xuICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgfWZpbmFsbHl7XG4gICAgICAgcmV0dXJuIHBsdWdpbnM7XG4gICAgIH1cbiAgIH0sXG5cbiAgLyoqXG4gICAqIHJldHVybnMgYSByYW5kb20gYmFzZS0zNiB1aWQgd2l0aCBuYW1lc3BhY2luZ1xuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGxlbmd0aCAtIG51bWJlciBvZiByYW5kb20gYmFzZS0zNiBkaWdpdHMgZGVzaXJlZC4gSW5jcmVhc2UgZm9yIG1vcmUgcmFuZG9tIHN0cmluZ3MuXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2UgLSBuYW1lIG9mIHBsdWdpbiB0byBiZSBpbmNvcnBvcmF0ZWQgaW4gdWlkLCBvcHRpb25hbC5cbiAgICogQGRlZmF1bHQge1N0cmluZ30gJycgLSBpZiBubyBwbHVnaW4gbmFtZSBpcyBwcm92aWRlZCwgbm90aGluZyBpcyBhcHBlbmRlZCB0byB0aGUgdWlkLlxuICAgKiBAcmV0dXJucyB7U3RyaW5nfSAtIHVuaXF1ZSBpZFxuICAgKi9cbiAgR2V0WW9EaWdpdHM6IGZ1bmN0aW9uKGxlbmd0aCwgbmFtZXNwYWNlKXtcbiAgICBsZW5ndGggPSBsZW5ndGggfHwgNjtcbiAgICByZXR1cm4gTWF0aC5yb3VuZCgoTWF0aC5wb3coMzYsIGxlbmd0aCArIDEpIC0gTWF0aC5yYW5kb20oKSAqIE1hdGgucG93KDM2LCBsZW5ndGgpKSkudG9TdHJpbmcoMzYpLnNsaWNlKDEpICsgKG5hbWVzcGFjZSA/IGAtJHtuYW1lc3BhY2V9YCA6ICcnKTtcbiAgfSxcbiAgLyoqXG4gICAqIEluaXRpYWxpemUgcGx1Z2lucyBvbiBhbnkgZWxlbWVudHMgd2l0aGluIGBlbGVtYCAoYW5kIGBlbGVtYCBpdHNlbGYpIHRoYXQgYXJlbid0IGFscmVhZHkgaW5pdGlhbGl6ZWQuXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtIC0galF1ZXJ5IG9iamVjdCBjb250YWluaW5nIHRoZSBlbGVtZW50IHRvIGNoZWNrIGluc2lkZS4gQWxzbyBjaGVja3MgdGhlIGVsZW1lbnQgaXRzZWxmLCB1bmxlc3MgaXQncyB0aGUgYGRvY3VtZW50YCBvYmplY3QuXG4gICAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBwbHVnaW5zIC0gQSBsaXN0IG9mIHBsdWdpbnMgdG8gaW5pdGlhbGl6ZS4gTGVhdmUgdGhpcyBvdXQgdG8gaW5pdGlhbGl6ZSBldmVyeXRoaW5nLlxuICAgKi9cbiAgcmVmbG93OiBmdW5jdGlvbihlbGVtLCBwbHVnaW5zKSB7XG5cbiAgICAvLyBJZiBwbHVnaW5zIGlzIHVuZGVmaW5lZCwganVzdCBncmFiIGV2ZXJ5dGhpbmdcbiAgICBpZiAodHlwZW9mIHBsdWdpbnMgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBwbHVnaW5zID0gT2JqZWN0LmtleXModGhpcy5fcGx1Z2lucyk7XG4gICAgfVxuICAgIC8vIElmIHBsdWdpbnMgaXMgYSBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYW4gYXJyYXkgd2l0aCBvbmUgaXRlbVxuICAgIGVsc2UgaWYgKHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJykge1xuICAgICAgcGx1Z2lucyA9IFtwbHVnaW5zXTtcbiAgICB9XG5cbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgLy8gSXRlcmF0ZSB0aHJvdWdoIGVhY2ggcGx1Z2luXG4gICAgJC5lYWNoKHBsdWdpbnMsIGZ1bmN0aW9uKGksIG5hbWUpIHtcbiAgICAgIC8vIEdldCB0aGUgY3VycmVudCBwbHVnaW5cbiAgICAgIHZhciBwbHVnaW4gPSBfdGhpcy5fcGx1Z2luc1tuYW1lXTtcblxuICAgICAgLy8gTG9jYWxpemUgdGhlIHNlYXJjaCB0byBhbGwgZWxlbWVudHMgaW5zaWRlIGVsZW0sIGFzIHdlbGwgYXMgZWxlbSBpdHNlbGYsIHVubGVzcyBlbGVtID09PSBkb2N1bWVudFxuICAgICAgdmFyICRlbGVtID0gJChlbGVtKS5maW5kKCdbZGF0YS0nK25hbWUrJ10nKS5hZGRCYWNrKCdbZGF0YS0nK25hbWUrJ10nKTtcblxuICAgICAgLy8gRm9yIGVhY2ggcGx1Z2luIGZvdW5kLCBpbml0aWFsaXplIGl0XG4gICAgICAkZWxlbS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgJGVsID0gJCh0aGlzKSxcbiAgICAgICAgICAgIG9wdHMgPSB7fTtcbiAgICAgICAgLy8gRG9uJ3QgZG91YmxlLWRpcCBvbiBwbHVnaW5zXG4gICAgICAgIGlmICgkZWwuZGF0YSgnemZQbHVnaW4nKSkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIlRyaWVkIHRvIGluaXRpYWxpemUgXCIrbmFtZStcIiBvbiBhbiBlbGVtZW50IHRoYXQgYWxyZWFkeSBoYXMgYSBGb3VuZGF0aW9uIHBsdWdpbi5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYoJGVsLmF0dHIoJ2RhdGEtb3B0aW9ucycpKXtcbiAgICAgICAgICB2YXIgdGhpbmcgPSAkZWwuYXR0cignZGF0YS1vcHRpb25zJykuc3BsaXQoJzsnKS5mb3JFYWNoKGZ1bmN0aW9uKGUsIGkpe1xuICAgICAgICAgICAgdmFyIG9wdCA9IGUuc3BsaXQoJzonKS5tYXAoZnVuY3Rpb24oZWwpeyByZXR1cm4gZWwudHJpbSgpOyB9KTtcbiAgICAgICAgICAgIGlmKG9wdFswXSkgb3B0c1tvcHRbMF1dID0gcGFyc2VWYWx1ZShvcHRbMV0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRyeXtcbiAgICAgICAgICAkZWwuZGF0YSgnemZQbHVnaW4nLCBuZXcgcGx1Z2luKCQodGhpcyksIG9wdHMpKTtcbiAgICAgICAgfWNhdGNoKGVyKXtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVyKTtcbiAgICAgICAgfWZpbmFsbHl7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcbiAgZ2V0Rm5OYW1lOiBmdW5jdGlvbk5hbWUsXG4gIHRyYW5zaXRpb25lbmQ6IGZ1bmN0aW9uKCRlbGVtKXtcbiAgICB2YXIgdHJhbnNpdGlvbnMgPSB7XG4gICAgICAndHJhbnNpdGlvbic6ICd0cmFuc2l0aW9uZW5kJyxcbiAgICAgICdXZWJraXRUcmFuc2l0aW9uJzogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICAgICAgJ01velRyYW5zaXRpb24nOiAndHJhbnNpdGlvbmVuZCcsXG4gICAgICAnT1RyYW5zaXRpb24nOiAnb3RyYW5zaXRpb25lbmQnXG4gICAgfTtcbiAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICBlbmQ7XG5cbiAgICBmb3IgKHZhciB0IGluIHRyYW5zaXRpb25zKXtcbiAgICAgIGlmICh0eXBlb2YgZWxlbS5zdHlsZVt0XSAhPT0gJ3VuZGVmaW5lZCcpe1xuICAgICAgICBlbmQgPSB0cmFuc2l0aW9uc1t0XTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoZW5kKXtcbiAgICAgIHJldHVybiBlbmQ7XG4gICAgfWVsc2V7XG4gICAgICBlbmQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICRlbGVtLnRyaWdnZXJIYW5kbGVyKCd0cmFuc2l0aW9uZW5kJywgWyRlbGVtXSk7XG4gICAgICB9LCAxKTtcbiAgICAgIHJldHVybiAndHJhbnNpdGlvbmVuZCc7XG4gICAgfVxuICB9XG59O1xuXG5Gb3VuZGF0aW9uLnV0aWwgPSB7XG4gIC8qKlxuICAgKiBGdW5jdGlvbiBmb3IgYXBwbHlpbmcgYSBkZWJvdW5jZSBlZmZlY3QgdG8gYSBmdW5jdGlvbiBjYWxsLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuYyAtIEZ1bmN0aW9uIHRvIGJlIGNhbGxlZCBhdCBlbmQgb2YgdGltZW91dC5cbiAgICogQHBhcmFtIHtOdW1iZXJ9IGRlbGF5IC0gVGltZSBpbiBtcyB0byBkZWxheSB0aGUgY2FsbCBvZiBgZnVuY2AuXG4gICAqIEByZXR1cm5zIGZ1bmN0aW9uXG4gICAqL1xuICB0aHJvdHRsZTogZnVuY3Rpb24gKGZ1bmMsIGRlbGF5KSB7XG4gICAgdmFyIHRpbWVyID0gbnVsbDtcblxuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICAgIGlmICh0aW1lciA9PT0gbnVsbCkge1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgdGltZXIgPSBudWxsO1xuICAgICAgICB9LCBkZWxheSk7XG4gICAgICB9XG4gICAgfTtcbiAgfVxufTtcblxuLy8gVE9ETzogY29uc2lkZXIgbm90IG1ha2luZyB0aGlzIGEgalF1ZXJ5IGZ1bmN0aW9uXG4vLyBUT0RPOiBuZWVkIHdheSB0byByZWZsb3cgdnMuIHJlLWluaXRpYWxpemVcbi8qKlxuICogVGhlIEZvdW5kYXRpb24galF1ZXJ5IG1ldGhvZC5cbiAqIEBwYXJhbSB7U3RyaW5nfEFycmF5fSBtZXRob2QgLSBBbiBhY3Rpb24gdG8gcGVyZm9ybSBvbiB0aGUgY3VycmVudCBqUXVlcnkgb2JqZWN0LlxuICovXG52YXIgZm91bmRhdGlvbiA9IGZ1bmN0aW9uKG1ldGhvZCkge1xuICB2YXIgdHlwZSA9IHR5cGVvZiBtZXRob2QsXG4gICAgICAkbWV0YSA9ICQoJ21ldGEuZm91bmRhdGlvbi1tcScpLFxuICAgICAgJG5vSlMgPSAkKCcubm8tanMnKTtcblxuICBpZighJG1ldGEubGVuZ3RoKXtcbiAgICAkKCc8bWV0YSBjbGFzcz1cImZvdW5kYXRpb24tbXFcIj4nKS5hcHBlbmRUbyhkb2N1bWVudC5oZWFkKTtcbiAgfVxuICBpZigkbm9KUy5sZW5ndGgpe1xuICAgICRub0pTLnJlbW92ZUNsYXNzKCduby1qcycpO1xuICB9XG5cbiAgaWYodHlwZSA9PT0gJ3VuZGVmaW5lZCcpey8vbmVlZHMgdG8gaW5pdGlhbGl6ZSB0aGUgRm91bmRhdGlvbiBvYmplY3QsIG9yIGFuIGluZGl2aWR1YWwgcGx1Z2luLlxuICAgIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5faW5pdCgpO1xuICAgIEZvdW5kYXRpb24ucmVmbG93KHRoaXMpO1xuICB9ZWxzZSBpZih0eXBlID09PSAnc3RyaW5nJyl7Ly9hbiBpbmRpdmlkdWFsIG1ldGhvZCB0byBpbnZva2Ugb24gYSBwbHVnaW4gb3IgZ3JvdXAgb2YgcGx1Z2luc1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTsvL2NvbGxlY3QgYWxsIHRoZSBhcmd1bWVudHMsIGlmIG5lY2Vzc2FyeVxuICAgIHZhciBwbHVnQ2xhc3MgPSB0aGlzLmRhdGEoJ3pmUGx1Z2luJyk7Ly9kZXRlcm1pbmUgdGhlIGNsYXNzIG9mIHBsdWdpblxuXG4gICAgaWYocGx1Z0NsYXNzICE9PSB1bmRlZmluZWQgJiYgcGx1Z0NsYXNzW21ldGhvZF0gIT09IHVuZGVmaW5lZCl7Ly9tYWtlIHN1cmUgYm90aCB0aGUgY2xhc3MgYW5kIG1ldGhvZCBleGlzdFxuICAgICAgaWYodGhpcy5sZW5ndGggPT09IDEpey8vaWYgdGhlcmUncyBvbmx5IG9uZSwgY2FsbCBpdCBkaXJlY3RseS5cbiAgICAgICAgICBwbHVnQ2xhc3NbbWV0aG9kXS5hcHBseShwbHVnQ2xhc3MsIGFyZ3MpO1xuICAgICAgfWVsc2V7XG4gICAgICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLCBlbCl7Ly9vdGhlcndpc2UgbG9vcCB0aHJvdWdoIHRoZSBqUXVlcnkgY29sbGVjdGlvbiBhbmQgaW52b2tlIHRoZSBtZXRob2Qgb24gZWFjaFxuICAgICAgICAgIHBsdWdDbGFzc1ttZXRob2RdLmFwcGx5KCQoZWwpLmRhdGEoJ3pmUGx1Z2luJyksIGFyZ3MpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9ZWxzZXsvL2Vycm9yIGZvciBubyBjbGFzcyBvciBubyBtZXRob2RcbiAgICAgIHRocm93IG5ldyBSZWZlcmVuY2VFcnJvcihcIldlJ3JlIHNvcnJ5LCAnXCIgKyBtZXRob2QgKyBcIicgaXMgbm90IGFuIGF2YWlsYWJsZSBtZXRob2QgZm9yIFwiICsgKHBsdWdDbGFzcyA/IGZ1bmN0aW9uTmFtZShwbHVnQ2xhc3MpIDogJ3RoaXMgZWxlbWVudCcpICsgJy4nKTtcbiAgICB9XG4gIH1lbHNley8vZXJyb3IgZm9yIGludmFsaWQgYXJndW1lbnQgdHlwZVxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFdlJ3JlIHNvcnJ5LCAke3R5cGV9IGlzIG5vdCBhIHZhbGlkIHBhcmFtZXRlci4gWW91IG11c3QgdXNlIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgbWV0aG9kIHlvdSB3aXNoIHRvIGludm9rZS5gKTtcbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbndpbmRvdy5Gb3VuZGF0aW9uID0gRm91bmRhdGlvbjtcbiQuZm4uZm91bmRhdGlvbiA9IGZvdW5kYXRpb247XG5cbi8vIFBvbHlmaWxsIGZvciByZXF1ZXN0QW5pbWF0aW9uRnJhbWVcbihmdW5jdGlvbigpIHtcbiAgaWYgKCFEYXRlLm5vdyB8fCAhd2luZG93LkRhdGUubm93KVxuICAgIHdpbmRvdy5EYXRlLm5vdyA9IERhdGUubm93ID0gZnVuY3Rpb24oKSB7IHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTsgfTtcblxuICB2YXIgdmVuZG9ycyA9IFsnd2Via2l0JywgJ21veiddO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHZlbmRvcnMubGVuZ3RoICYmICF3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lOyArK2kpIHtcbiAgICAgIHZhciB2cCA9IHZlbmRvcnNbaV07XG4gICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gd2luZG93W3ZwKydSZXF1ZXN0QW5pbWF0aW9uRnJhbWUnXTtcbiAgICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9ICh3aW5kb3dbdnArJ0NhbmNlbEFuaW1hdGlvbkZyYW1lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHx8IHdpbmRvd1t2cCsnQ2FuY2VsUmVxdWVzdEFuaW1hdGlvbkZyYW1lJ10pO1xuICB9XG4gIGlmICgvaVAoYWR8aG9uZXxvZCkuKk9TIDYvLnRlc3Qod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQpXG4gICAgfHwgIXdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgIXdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSkge1xuICAgIHZhciBsYXN0VGltZSA9IDA7XG4gICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBub3cgPSBEYXRlLm5vdygpO1xuICAgICAgICB2YXIgbmV4dFRpbWUgPSBNYXRoLm1heChsYXN0VGltZSArIDE2LCBub3cpO1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpIHsgY2FsbGJhY2sobGFzdFRpbWUgPSBuZXh0VGltZSk7IH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG5leHRUaW1lIC0gbm93KTtcbiAgICB9O1xuICAgIHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZSA9IGNsZWFyVGltZW91dDtcbiAgfVxuICAvKipcbiAgICogUG9seWZpbGwgZm9yIHBlcmZvcm1hbmNlLm5vdywgcmVxdWlyZWQgYnkgckFGXG4gICAqL1xuICBpZighd2luZG93LnBlcmZvcm1hbmNlIHx8ICF3aW5kb3cucGVyZm9ybWFuY2Uubm93KXtcbiAgICB3aW5kb3cucGVyZm9ybWFuY2UgPSB7XG4gICAgICBzdGFydDogRGF0ZS5ub3coKSxcbiAgICAgIG5vdzogZnVuY3Rpb24oKXsgcmV0dXJuIERhdGUubm93KCkgLSB0aGlzLnN0YXJ0OyB9XG4gICAgfTtcbiAgfVxufSkoKTtcbmlmICghRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQpIHtcbiAgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQgPSBmdW5jdGlvbihvVGhpcykge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgLy8gY2xvc2VzdCB0aGluZyBwb3NzaWJsZSB0byB0aGUgRUNNQVNjcmlwdCA1XG4gICAgICAvLyBpbnRlcm5hbCBJc0NhbGxhYmxlIGZ1bmN0aW9uXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGdW5jdGlvbi5wcm90b3R5cGUuYmluZCAtIHdoYXQgaXMgdHJ5aW5nIHRvIGJlIGJvdW5kIGlzIG5vdCBjYWxsYWJsZScpO1xuICAgIH1cblxuICAgIHZhciBhQXJncyAgID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSxcbiAgICAgICAgZlRvQmluZCA9IHRoaXMsXG4gICAgICAgIGZOT1AgICAgPSBmdW5jdGlvbigpIHt9LFxuICAgICAgICBmQm91bmQgID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuIGZUb0JpbmQuYXBwbHkodGhpcyBpbnN0YW5jZW9mIGZOT1BcbiAgICAgICAgICAgICAgICAgPyB0aGlzXG4gICAgICAgICAgICAgICAgIDogb1RoaXMsXG4gICAgICAgICAgICAgICAgIGFBcmdzLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgICAgIH07XG5cbiAgICBpZiAodGhpcy5wcm90b3R5cGUpIHtcbiAgICAgIC8vIG5hdGl2ZSBmdW5jdGlvbnMgZG9uJ3QgaGF2ZSBhIHByb3RvdHlwZVxuICAgICAgZk5PUC5wcm90b3R5cGUgPSB0aGlzLnByb3RvdHlwZTtcbiAgICB9XG4gICAgZkJvdW5kLnByb3RvdHlwZSA9IG5ldyBmTk9QKCk7XG5cbiAgICByZXR1cm4gZkJvdW5kO1xuICB9O1xufVxuLy8gUG9seWZpbGwgdG8gZ2V0IHRoZSBuYW1lIG9mIGEgZnVuY3Rpb24gaW4gSUU5XG5mdW5jdGlvbiBmdW5jdGlvbk5hbWUoZm4pIHtcbiAgaWYgKEZ1bmN0aW9uLnByb3RvdHlwZS5uYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICB2YXIgZnVuY05hbWVSZWdleCA9IC9mdW5jdGlvblxccyhbXihdezEsfSlcXCgvO1xuICAgIHZhciByZXN1bHRzID0gKGZ1bmNOYW1lUmVnZXgpLmV4ZWMoKGZuKS50b1N0cmluZygpKTtcbiAgICByZXR1cm4gKHJlc3VsdHMgJiYgcmVzdWx0cy5sZW5ndGggPiAxKSA/IHJlc3VsdHNbMV0udHJpbSgpIDogXCJcIjtcbiAgfVxuICBlbHNlIGlmIChmbi5wcm90b3R5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBmbi5jb25zdHJ1Y3Rvci5uYW1lO1xuICB9XG4gIGVsc2Uge1xuICAgIHJldHVybiBmbi5wcm90b3R5cGUuY29uc3RydWN0b3IubmFtZTtcbiAgfVxufVxuZnVuY3Rpb24gcGFyc2VWYWx1ZShzdHIpe1xuICBpZiAoJ3RydWUnID09PSBzdHIpIHJldHVybiB0cnVlO1xuICBlbHNlIGlmICgnZmFsc2UnID09PSBzdHIpIHJldHVybiBmYWxzZTtcbiAgZWxzZSBpZiAoIWlzTmFOKHN0ciAqIDEpKSByZXR1cm4gcGFyc2VGbG9hdChzdHIpO1xuICByZXR1cm4gc3RyO1xufVxuLy8gQ29udmVydCBQYXNjYWxDYXNlIHRvIGtlYmFiLWNhc2Vcbi8vIFRoYW5rIHlvdTogaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvODk1NTU4MFxuZnVuY3Rpb24gaHlwaGVuYXRlKHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoLyhbYS16XSkoW0EtWl0pL2csICckMS0kMicpLnRvTG93ZXJDYXNlKCk7XG59XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuRm91bmRhdGlvbi5Cb3ggPSB7XG4gIEltTm90VG91Y2hpbmdZb3U6IEltTm90VG91Y2hpbmdZb3UsXG4gIEdldERpbWVuc2lvbnM6IEdldERpbWVuc2lvbnMsXG4gIEdldE9mZnNldHM6IEdldE9mZnNldHNcbn1cblxuLyoqXG4gKiBDb21wYXJlcyB0aGUgZGltZW5zaW9ucyBvZiBhbiBlbGVtZW50IHRvIGEgY29udGFpbmVyIGFuZCBkZXRlcm1pbmVzIGNvbGxpc2lvbiBldmVudHMgd2l0aCBjb250YWluZXIuXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byB0ZXN0IGZvciBjb2xsaXNpb25zLlxuICogQHBhcmFtIHtqUXVlcnl9IHBhcmVudCAtIGpRdWVyeSBvYmplY3QgdG8gdXNlIGFzIGJvdW5kaW5nIGNvbnRhaW5lci5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbHJPbmx5IC0gc2V0IHRvIHRydWUgdG8gY2hlY2sgbGVmdCBhbmQgcmlnaHQgdmFsdWVzIG9ubHkuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRiT25seSAtIHNldCB0byB0cnVlIHRvIGNoZWNrIHRvcCBhbmQgYm90dG9tIHZhbHVlcyBvbmx5LlxuICogQGRlZmF1bHQgaWYgbm8gcGFyZW50IG9iamVjdCBwYXNzZWQsIGRldGVjdHMgY29sbGlzaW9ucyB3aXRoIGB3aW5kb3dgLlxuICogQHJldHVybnMge0Jvb2xlYW59IC0gdHJ1ZSBpZiBjb2xsaXNpb24gZnJlZSwgZmFsc2UgaWYgYSBjb2xsaXNpb24gaW4gYW55IGRpcmVjdGlvbi5cbiAqL1xuZnVuY3Rpb24gSW1Ob3RUb3VjaGluZ1lvdShlbGVtZW50LCBwYXJlbnQsIGxyT25seSwgdGJPbmx5KSB7XG4gIHZhciBlbGVEaW1zID0gR2V0RGltZW5zaW9ucyhlbGVtZW50KSxcbiAgICAgIHRvcCwgYm90dG9tLCBsZWZ0LCByaWdodDtcblxuICBpZiAocGFyZW50KSB7XG4gICAgdmFyIHBhckRpbXMgPSBHZXREaW1lbnNpb25zKHBhcmVudCk7XG5cbiAgICBib3R0b20gPSAoZWxlRGltcy5vZmZzZXQudG9wICsgZWxlRGltcy5oZWlnaHQgPD0gcGFyRGltcy5oZWlnaHQgKyBwYXJEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gcGFyRGltcy5vZmZzZXQudG9wKTtcbiAgICBsZWZ0ICAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCA+PSBwYXJEaW1zLm9mZnNldC5sZWZ0KTtcbiAgICByaWdodCAgPSAoZWxlRGltcy5vZmZzZXQubGVmdCArIGVsZURpbXMud2lkdGggPD0gcGFyRGltcy53aWR0aCArIHBhckRpbXMub2Zmc2V0LmxlZnQpO1xuICB9XG4gIGVsc2Uge1xuICAgIGJvdHRvbSA9IChlbGVEaW1zLm9mZnNldC50b3AgKyBlbGVEaW1zLmhlaWdodCA8PSBlbGVEaW1zLndpbmRvd0RpbXMuaGVpZ2h0ICsgZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIHRvcCAgICA9IChlbGVEaW1zLm9mZnNldC50b3AgPj0gZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3ApO1xuICAgIGxlZnQgICA9IChlbGVEaW1zLm9mZnNldC5sZWZ0ID49IGVsZURpbXMud2luZG93RGltcy5vZmZzZXQubGVmdCk7XG4gICAgcmlnaHQgID0gKGVsZURpbXMub2Zmc2V0LmxlZnQgKyBlbGVEaW1zLndpZHRoIDw9IGVsZURpbXMud2luZG93RGltcy53aWR0aCk7XG4gIH1cblxuICB2YXIgYWxsRGlycyA9IFtib3R0b20sIHRvcCwgbGVmdCwgcmlnaHRdO1xuXG4gIGlmIChsck9ubHkpIHtcbiAgICByZXR1cm4gbGVmdCA9PT0gcmlnaHQgPT09IHRydWU7XG4gIH1cblxuICBpZiAodGJPbmx5KSB7XG4gICAgcmV0dXJuIHRvcCA9PT0gYm90dG9tID09PSB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIGFsbERpcnMuaW5kZXhPZihmYWxzZSkgPT09IC0xO1xufTtcblxuLyoqXG4gKiBVc2VzIG5hdGl2ZSBtZXRob2RzIHRvIHJldHVybiBhbiBvYmplY3Qgb2YgZGltZW5zaW9uIHZhbHVlcy5cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnkgfHwgSFRNTH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3Qgb3IgRE9NIGVsZW1lbnQgZm9yIHdoaWNoIHRvIGdldCB0aGUgZGltZW5zaW9ucy4gQ2FuIGJlIGFueSBlbGVtZW50IG90aGVyIHRoYXQgZG9jdW1lbnQgb3Igd2luZG93LlxuICogQHJldHVybnMge09iamVjdH0gLSBuZXN0ZWQgb2JqZWN0IG9mIGludGVnZXIgcGl4ZWwgdmFsdWVzXG4gKiBUT0RPIC0gaWYgZWxlbWVudCBpcyB3aW5kb3csIHJldHVybiBvbmx5IHRob3NlIHZhbHVlcy5cbiAqL1xuZnVuY3Rpb24gR2V0RGltZW5zaW9ucyhlbGVtLCB0ZXN0KXtcbiAgZWxlbSA9IGVsZW0ubGVuZ3RoID8gZWxlbVswXSA6IGVsZW07XG5cbiAgaWYgKGVsZW0gPT09IHdpbmRvdyB8fCBlbGVtID09PSBkb2N1bWVudCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIkknbSBzb3JyeSwgRGF2ZS4gSSdtIGFmcmFpZCBJIGNhbid0IGRvIHRoYXQuXCIpO1xuICB9XG5cbiAgdmFyIHJlY3QgPSBlbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgcGFyUmVjdCA9IGVsZW0ucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgIHdpblJlY3QgPSBkb2N1bWVudC5ib2R5LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLFxuICAgICAgd2luWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcbiAgICAgIHdpblggPSB3aW5kb3cucGFnZVhPZmZzZXQ7XG5cbiAgcmV0dXJuIHtcbiAgICB3aWR0aDogcmVjdC53aWR0aCxcbiAgICBoZWlnaHQ6IHJlY3QuaGVpZ2h0LFxuICAgIG9mZnNldDoge1xuICAgICAgdG9wOiByZWN0LnRvcCArIHdpblksXG4gICAgICBsZWZ0OiByZWN0LmxlZnQgKyB3aW5YXG4gICAgfSxcbiAgICBwYXJlbnREaW1zOiB7XG4gICAgICB3aWR0aDogcGFyUmVjdC53aWR0aCxcbiAgICAgIGhlaWdodDogcGFyUmVjdC5oZWlnaHQsXG4gICAgICBvZmZzZXQ6IHtcbiAgICAgICAgdG9wOiBwYXJSZWN0LnRvcCArIHdpblksXG4gICAgICAgIGxlZnQ6IHBhclJlY3QubGVmdCArIHdpblhcbiAgICAgIH1cbiAgICB9LFxuICAgIHdpbmRvd0RpbXM6IHtcbiAgICAgIHdpZHRoOiB3aW5SZWN0LndpZHRoLFxuICAgICAgaGVpZ2h0OiB3aW5SZWN0LmhlaWdodCxcbiAgICAgIG9mZnNldDoge1xuICAgICAgICB0b3A6IHdpblksXG4gICAgICAgIGxlZnQ6IHdpblhcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGFuIG9iamVjdCBvZiB0b3AgYW5kIGxlZnQgaW50ZWdlciBwaXhlbCB2YWx1ZXMgZm9yIGR5bmFtaWNhbGx5IHJlbmRlcmVkIGVsZW1lbnRzLFxuICogc3VjaCBhczogVG9vbHRpcCwgUmV2ZWFsLCBhbmQgRHJvcGRvd25cbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IGZvciB0aGUgZWxlbWVudCBiZWluZyBwb3NpdGlvbmVkLlxuICogQHBhcmFtIHtqUXVlcnl9IGFuY2hvciAtIGpRdWVyeSBvYmplY3QgZm9yIHRoZSBlbGVtZW50J3MgYW5jaG9yIHBvaW50LlxuICogQHBhcmFtIHtTdHJpbmd9IHBvc2l0aW9uIC0gYSBzdHJpbmcgcmVsYXRpbmcgdG8gdGhlIGRlc2lyZWQgcG9zaXRpb24gb2YgdGhlIGVsZW1lbnQsIHJlbGF0aXZlIHRvIGl0J3MgYW5jaG9yXG4gKiBAcGFyYW0ge051bWJlcn0gdk9mZnNldCAtIGludGVnZXIgcGl4ZWwgdmFsdWUgb2YgZGVzaXJlZCB2ZXJ0aWNhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtOdW1iZXJ9IGhPZmZzZXQgLSBpbnRlZ2VyIHBpeGVsIHZhbHVlIG9mIGRlc2lyZWQgaG9yaXpvbnRhbCBzZXBhcmF0aW9uIGJldHdlZW4gYW5jaG9yIGFuZCBlbGVtZW50LlxuICogQHBhcmFtIHtCb29sZWFufSBpc092ZXJmbG93IC0gaWYgYSBjb2xsaXNpb24gZXZlbnQgaXMgZGV0ZWN0ZWQsIHNldHMgdG8gdHJ1ZSB0byBkZWZhdWx0IHRoZSBlbGVtZW50IHRvIGZ1bGwgd2lkdGggLSBhbnkgZGVzaXJlZCBvZmZzZXQuXG4gKiBUT0RPIGFsdGVyL3Jld3JpdGUgdG8gd29yayB3aXRoIGBlbWAgdmFsdWVzIGFzIHdlbGwvaW5zdGVhZCBvZiBwaXhlbHNcbiAqL1xuZnVuY3Rpb24gR2V0T2Zmc2V0cyhlbGVtZW50LCBhbmNob3IsIHBvc2l0aW9uLCB2T2Zmc2V0LCBoT2Zmc2V0LCBpc092ZXJmbG93KSB7XG4gIHZhciAkZWxlRGltcyA9IEdldERpbWVuc2lvbnMoZWxlbWVudCksXG4gICAgICAkYW5jaG9yRGltcyA9IGFuY2hvciA/IEdldERpbWVuc2lvbnMoYW5jaG9yKSA6IG51bGw7XG5cbiAgc3dpdGNoIChwb3NpdGlvbikge1xuICAgIGNhc2UgJ3RvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoRm91bmRhdGlvbi5ydGwoKSA/ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gJGVsZURpbXMud2lkdGggKyAkYW5jaG9yRGltcy53aWR0aCA6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRhbmNob3JEaW1zLm9mZnNldC5sZWZ0IC0gKCRlbGVEaW1zLndpZHRoICsgaE9mZnNldCksXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmlnaHQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAkYW5jaG9yRGltcy53aWR0aCArIGhPZmZzZXQsXG4gICAgICAgIHRvcDogJGFuY2hvckRpbXMub2Zmc2V0LnRvcFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIHRvcCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyAoJGFuY2hvckRpbXMud2lkdGggLyAyKSkgLSAoJGVsZURpbXMud2lkdGggLyAyKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wIC0gKCRlbGVEaW1zLmhlaWdodCArIHZPZmZzZXQpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXIgYm90dG9tJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IGlzT3ZlcmZsb3cgPyBoT2Zmc2V0IDogKCgkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICgkYW5jaG9yRGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpKSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnY2VudGVyIGxlZnQnOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAoJGVsZURpbXMud2lkdGggKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAoJGFuY2hvckRpbXMub2Zmc2V0LnRvcCArICgkYW5jaG9yRGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2NlbnRlciByaWdodCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCArIDEsXG4gICAgICAgIHRvcDogKCRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAoJGFuY2hvckRpbXMuaGVpZ2h0IC8gMikpIC0gKCRlbGVEaW1zLmhlaWdodCAvIDIpXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdjZW50ZXInOlxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbGVmdDogKCRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQgKyAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAvIDIpKSAtICgkZWxlRGltcy53aWR0aCAvIDIpLFxuICAgICAgICB0b3A6ICgkZWxlRGltcy53aW5kb3dEaW1zLm9mZnNldC50b3AgKyAoJGVsZURpbXMud2luZG93RGltcy5oZWlnaHQgLyAyKSkgLSAoJGVsZURpbXMuaGVpZ2h0IC8gMilcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JldmVhbCc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAoJGVsZURpbXMud2luZG93RGltcy53aWR0aCAtICRlbGVEaW1zLndpZHRoKSAvIDIsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wICsgdk9mZnNldFxuICAgICAgfVxuICAgIGNhc2UgJ3JldmVhbCBmdWxsJzpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6ICRlbGVEaW1zLndpbmRvd0RpbXMub2Zmc2V0LmxlZnQsXG4gICAgICAgIHRvcDogJGVsZURpbXMud2luZG93RGltcy5vZmZzZXQudG9wXG4gICAgICB9XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0IGJvdHRvbSc6XG4gICAgICByZXR1cm4ge1xuICAgICAgICBsZWZ0OiAkYW5jaG9yRGltcy5vZmZzZXQubGVmdCArICRhbmNob3JEaW1zLndpZHRoICsgaE9mZnNldCAtICRlbGVEaW1zLndpZHRoLFxuICAgICAgICB0b3A6ICRhbmNob3JEaW1zLm9mZnNldC50b3AgKyAkYW5jaG9yRGltcy5oZWlnaHQgKyB2T2Zmc2V0XG4gICAgICB9O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGxlZnQ6IChGb3VuZGF0aW9uLnJ0bCgpID8gJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgLSAkZWxlRGltcy53aWR0aCArICRhbmNob3JEaW1zLndpZHRoIDogJGFuY2hvckRpbXMub2Zmc2V0LmxlZnQgKyBoT2Zmc2V0KSxcbiAgICAgICAgdG9wOiAkYW5jaG9yRGltcy5vZmZzZXQudG9wICsgJGFuY2hvckRpbXMuaGVpZ2h0ICsgdk9mZnNldFxuICAgICAgfVxuICB9XG59XG5cbn0oalF1ZXJ5KTtcbiIsIi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKlxuICogVGhpcyB1dGlsIHdhcyBjcmVhdGVkIGJ5IE1hcml1cyBPbGJlcnR6ICpcbiAqIFBsZWFzZSB0aGFuayBNYXJpdXMgb24gR2l0SHViIC9vd2xiZXJ0eiAqXG4gKiBvciB0aGUgd2ViIGh0dHA6Ly93d3cubWFyaXVzb2xiZXJ0ei5kZS8gKlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3Qga2V5Q29kZXMgPSB7XG4gIDk6ICdUQUInLFxuICAxMzogJ0VOVEVSJyxcbiAgMjc6ICdFU0NBUEUnLFxuICAzMjogJ1NQQUNFJyxcbiAgMzc6ICdBUlJPV19MRUZUJyxcbiAgMzg6ICdBUlJPV19VUCcsXG4gIDM5OiAnQVJST1dfUklHSFQnLFxuICA0MDogJ0FSUk9XX0RPV04nXG59XG5cbnZhciBjb21tYW5kcyA9IHt9XG5cbnZhciBLZXlib2FyZCA9IHtcbiAga2V5czogZ2V0S2V5Q29kZXMoa2V5Q29kZXMpLFxuXG4gIC8qKlxuICAgKiBQYXJzZXMgdGhlIChrZXlib2FyZCkgZXZlbnQgYW5kIHJldHVybnMgYSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIGl0cyBrZXlcbiAgICogQ2FuIGJlIHVzZWQgbGlrZSBGb3VuZGF0aW9uLnBhcnNlS2V5KGV2ZW50KSA9PT0gRm91bmRhdGlvbi5rZXlzLlNQQUNFXG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcmV0dXJuIFN0cmluZyBrZXkgLSBTdHJpbmcgdGhhdCByZXByZXNlbnRzIHRoZSBrZXkgcHJlc3NlZFxuICAgKi9cbiAgcGFyc2VLZXkoZXZlbnQpIHtcbiAgICB2YXIga2V5ID0ga2V5Q29kZXNbZXZlbnQud2hpY2ggfHwgZXZlbnQua2V5Q29kZV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShldmVudC53aGljaCkudG9VcHBlckNhc2UoKTtcblxuICAgIC8vIFJlbW92ZSB1bi1wcmludGFibGUgY2hhcmFjdGVycywgZS5nLiBmb3IgYGZyb21DaGFyQ29kZWAgY2FsbHMgZm9yIENUUkwgb25seSBldmVudHNcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXFxXKy8sICcnKTtcblxuICAgIGlmIChldmVudC5zaGlmdEtleSkga2V5ID0gYFNISUZUXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmN0cmxLZXkpIGtleSA9IGBDVFJMXyR7a2V5fWA7XG4gICAgaWYgKGV2ZW50LmFsdEtleSkga2V5ID0gYEFMVF8ke2tleX1gO1xuXG4gICAgLy8gUmVtb3ZlIHRyYWlsaW5nIHVuZGVyc2NvcmUsIGluIGNhc2Ugb25seSBtb2RpZmllcnMgd2VyZSB1c2VkIChlLmcuIG9ubHkgYENUUkxfQUxUYClcbiAgICBrZXkgPSBrZXkucmVwbGFjZSgvXyQvLCAnJyk7XG5cbiAgICByZXR1cm4ga2V5O1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIHRoZSBnaXZlbiAoa2V5Ym9hcmQpIGV2ZW50XG4gICAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gdGhlIGV2ZW50IGdlbmVyYXRlZCBieSB0aGUgZXZlbnQgaGFuZGxlclxuICAgKiBAcGFyYW0ge1N0cmluZ30gY29tcG9uZW50IC0gRm91bmRhdGlvbiBjb21wb25lbnQncyBuYW1lLCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHBhcmFtIHtPYmplY3RzfSBmdW5jdGlvbnMgLSBjb2xsZWN0aW9uIG9mIGZ1bmN0aW9ucyB0aGF0IGFyZSB0byBiZSBleGVjdXRlZFxuICAgKi9cbiAgaGFuZGxlS2V5KGV2ZW50LCBjb21wb25lbnQsIGZ1bmN0aW9ucykge1xuICAgIHZhciBjb21tYW5kTGlzdCA9IGNvbW1hbmRzW2NvbXBvbmVudF0sXG4gICAgICBrZXlDb2RlID0gdGhpcy5wYXJzZUtleShldmVudCksXG4gICAgICBjbWRzLFxuICAgICAgY29tbWFuZCxcbiAgICAgIGZuO1xuXG4gICAgaWYgKCFjb21tYW5kTGlzdCkgcmV0dXJuIGNvbnNvbGUud2FybignQ29tcG9uZW50IG5vdCBkZWZpbmVkIScpO1xuXG4gICAgaWYgKHR5cGVvZiBjb21tYW5kTGlzdC5sdHIgPT09ICd1bmRlZmluZWQnKSB7IC8vIHRoaXMgY29tcG9uZW50IGRvZXMgbm90IGRpZmZlcmVudGlhdGUgYmV0d2VlbiBsdHIgYW5kIHJ0bFxuICAgICAgICBjbWRzID0gY29tbWFuZExpc3Q7IC8vIHVzZSBwbGFpbiBsaXN0XG4gICAgfSBlbHNlIHsgLy8gbWVyZ2UgbHRyIGFuZCBydGw6IGlmIGRvY3VtZW50IGlzIHJ0bCwgcnRsIG92ZXJ3cml0ZXMgbHRyIGFuZCB2aWNlIHZlcnNhXG4gICAgICAgIGlmIChGb3VuZGF0aW9uLnJ0bCgpKSBjbWRzID0gJC5leHRlbmQoe30sIGNvbW1hbmRMaXN0Lmx0ciwgY29tbWFuZExpc3QucnRsKTtcblxuICAgICAgICBlbHNlIGNtZHMgPSAkLmV4dGVuZCh7fSwgY29tbWFuZExpc3QucnRsLCBjb21tYW5kTGlzdC5sdHIpO1xuICAgIH1cbiAgICBjb21tYW5kID0gY21kc1trZXlDb2RlXTtcblxuICAgIGZuID0gZnVuY3Rpb25zW2NvbW1hbmRdO1xuICAgIGlmIChmbiAmJiB0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHsgLy8gZXhlY3V0ZSBmdW5jdGlvbiAgaWYgZXhpc3RzXG4gICAgICB2YXIgcmV0dXJuVmFsdWUgPSBmbi5hcHBseSgpO1xuICAgICAgaWYgKGZ1bmN0aW9ucy5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMuaGFuZGxlZCA9PT0gJ2Z1bmN0aW9uJykgeyAvLyBleGVjdXRlIGZ1bmN0aW9uIHdoZW4gZXZlbnQgd2FzIGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMuaGFuZGxlZChyZXR1cm5WYWx1ZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChmdW5jdGlvbnMudW5oYW5kbGVkIHx8IHR5cGVvZiBmdW5jdGlvbnMudW5oYW5kbGVkID09PSAnZnVuY3Rpb24nKSB7IC8vIGV4ZWN1dGUgZnVuY3Rpb24gd2hlbiBldmVudCB3YXMgbm90IGhhbmRsZWRcbiAgICAgICAgICBmdW5jdGlvbnMudW5oYW5kbGVkKCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBGaW5kcyBhbGwgZm9jdXNhYmxlIGVsZW1lbnRzIHdpdGhpbiB0aGUgZ2l2ZW4gYCRlbGVtZW50YFxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIHNlYXJjaCB3aXRoaW5cbiAgICogQHJldHVybiB7alF1ZXJ5fSAkZm9jdXNhYmxlIC0gYWxsIGZvY3VzYWJsZSBlbGVtZW50cyB3aXRoaW4gYCRlbGVtZW50YFxuICAgKi9cbiAgZmluZEZvY3VzYWJsZSgkZWxlbWVudCkge1xuICAgIGlmKCEkZWxlbWVudCkge3JldHVybiBmYWxzZTsgfVxuICAgIHJldHVybiAkZWxlbWVudC5maW5kKCdhW2hyZWZdLCBhcmVhW2hyZWZdLCBpbnB1dDpub3QoW2Rpc2FibGVkXSksIHNlbGVjdDpub3QoW2Rpc2FibGVkXSksIHRleHRhcmVhOm5vdChbZGlzYWJsZWRdKSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaWZyYW1lLCBvYmplY3QsIGVtYmVkLCAqW3RhYmluZGV4XSwgKltjb250ZW50ZWRpdGFibGVdJykuZmlsdGVyKGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkKHRoaXMpLmlzKCc6dmlzaWJsZScpIHx8ICQodGhpcykuYXR0cigndGFiaW5kZXgnKSA8IDApIHsgcmV0dXJuIGZhbHNlOyB9IC8vb25seSBoYXZlIHZpc2libGUgZWxlbWVudHMgYW5kIHRob3NlIHRoYXQgaGF2ZSBhIHRhYmluZGV4IGdyZWF0ZXIgb3IgZXF1YWwgMFxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGNvbXBvbmVudCBuYW1lIG5hbWVcbiAgICogQHBhcmFtIHtPYmplY3R9IGNvbXBvbmVudCAtIEZvdW5kYXRpb24gY29tcG9uZW50LCBlLmcuIFNsaWRlciBvciBSZXZlYWxcbiAgICogQHJldHVybiBTdHJpbmcgY29tcG9uZW50TmFtZVxuICAgKi9cblxuICByZWdpc3Rlcihjb21wb25lbnROYW1lLCBjbWRzKSB7XG4gICAgY29tbWFuZHNbY29tcG9uZW50TmFtZV0gPSBjbWRzO1xuICB9LCAgXG5cbiAgLyoqXG4gICAqIFRyYXBzIHRoZSBmb2N1cyBpbiB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byB0cmFwIHRoZSBmb3VjcyBpbnRvLlxuICAgKi9cbiAgdHJhcEZvY3VzKCRlbGVtZW50KSB7XG4gICAgdmFyICRmb2N1c2FibGUgPSBGb3VuZGF0aW9uLktleWJvYXJkLmZpbmRGb2N1c2FibGUoJGVsZW1lbnQpLFxuICAgICAgICAkZmlyc3RGb2N1c2FibGUgPSAkZm9jdXNhYmxlLmVxKDApLFxuICAgICAgICAkbGFzdEZvY3VzYWJsZSA9ICRmb2N1c2FibGUuZXEoLTEpO1xuXG4gICAgJGVsZW1lbnQub24oJ2tleWRvd24uemYudHJhcGZvY3VzJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGlmIChldmVudC50YXJnZXQgPT09ICRsYXN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkZmlyc3RGb2N1c2FibGUuZm9jdXMoKTtcbiAgICAgIH1cbiAgICAgIGVsc2UgaWYgKGV2ZW50LnRhcmdldCA9PT0gJGZpcnN0Rm9jdXNhYmxlWzBdICYmIEZvdW5kYXRpb24uS2V5Ym9hcmQucGFyc2VLZXkoZXZlbnQpID09PSAnU0hJRlRfVEFCJykge1xuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAkbGFzdEZvY3VzYWJsZS5mb2N1cygpO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuICAvKipcbiAgICogUmVsZWFzZXMgdGhlIHRyYXBwZWQgZm9jdXMgZnJvbSB0aGUgZ2l2ZW4gZWxlbWVudC5cbiAgICogQHBhcmFtICB7alF1ZXJ5fSAkZWxlbWVudCAgalF1ZXJ5IG9iamVjdCB0byByZWxlYXNlIHRoZSBmb2N1cyBmb3IuXG4gICAqL1xuICByZWxlYXNlRm9jdXMoJGVsZW1lbnQpIHtcbiAgICAkZWxlbWVudC5vZmYoJ2tleWRvd24uemYudHJhcGZvY3VzJyk7XG4gIH1cbn1cblxuLypcbiAqIENvbnN0YW50cyBmb3IgZWFzaWVyIGNvbXBhcmluZy5cbiAqIENhbiBiZSB1c2VkIGxpa2UgRm91bmRhdGlvbi5wYXJzZUtleShldmVudCkgPT09IEZvdW5kYXRpb24ua2V5cy5TUEFDRVxuICovXG5mdW5jdGlvbiBnZXRLZXlDb2RlcyhrY3MpIHtcbiAgdmFyIGsgPSB7fTtcbiAgZm9yICh2YXIga2MgaW4ga2NzKSBrW2tjc1trY11dID0ga2NzW2tjXTtcbiAgcmV0dXJuIGs7XG59XG5cbkZvdW5kYXRpb24uS2V5Ym9hcmQgPSBLZXlib2FyZDtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vLyBEZWZhdWx0IHNldCBvZiBtZWRpYSBxdWVyaWVzXG5jb25zdCBkZWZhdWx0UXVlcmllcyA9IHtcbiAgJ2RlZmF1bHQnIDogJ29ubHkgc2NyZWVuJyxcbiAgbGFuZHNjYXBlIDogJ29ubHkgc2NyZWVuIGFuZCAob3JpZW50YXRpb246IGxhbmRzY2FwZSknLFxuICBwb3J0cmFpdCA6ICdvbmx5IHNjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICByZXRpbmEgOiAnb25seSBzY3JlZW4gYW5kICgtd2Via2l0LW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCcgK1xuICAgICdvbmx5IHNjcmVlbiBhbmQgKG1pbi0tbW96LWRldmljZS1waXhlbC1yYXRpbzogMiksJyArXG4gICAgJ29ubHkgc2NyZWVuIGFuZCAoLW8tbWluLWRldmljZS1waXhlbC1yYXRpbzogMi8xKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMTkyZHBpKSwnICtcbiAgICAnb25seSBzY3JlZW4gYW5kIChtaW4tcmVzb2x1dGlvbjogMmRwcHgpJ1xufTtcblxudmFyIE1lZGlhUXVlcnkgPSB7XG4gIHF1ZXJpZXM6IFtdLFxuXG4gIGN1cnJlbnQ6ICcnLFxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgbWVkaWEgcXVlcnkgaGVscGVyLCBieSBleHRyYWN0aW5nIHRoZSBicmVha3BvaW50IGxpc3QgZnJvbSB0aGUgQ1NTIGFuZCBhY3RpdmF0aW5nIHRoZSBicmVha3BvaW50IHdhdGNoZXIuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBleHRyYWN0ZWRTdHlsZXMgPSAkKCcuZm91bmRhdGlvbi1tcScpLmNzcygnZm9udC1mYW1pbHknKTtcbiAgICB2YXIgbmFtZWRRdWVyaWVzO1xuXG4gICAgbmFtZWRRdWVyaWVzID0gcGFyc2VTdHlsZVRvT2JqZWN0KGV4dHJhY3RlZFN0eWxlcyk7XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbmFtZWRRdWVyaWVzKSB7XG4gICAgICBpZihuYW1lZFF1ZXJpZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBzZWxmLnF1ZXJpZXMucHVzaCh7XG4gICAgICAgICAgbmFtZToga2V5LFxuICAgICAgICAgIHZhbHVlOiBgb25seSBzY3JlZW4gYW5kIChtaW4td2lkdGg6ICR7bmFtZWRRdWVyaWVzW2tleV19KWBcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5jdXJyZW50ID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKTtcblxuICAgIHRoaXMuX3dhdGNoZXIoKTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gaXMgYXQgbGVhc3QgYXMgd2lkZSBhcyBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2suXG4gICAqIEByZXR1cm5zIHtCb29sZWFufSBgdHJ1ZWAgaWYgdGhlIGJyZWFrcG9pbnQgbWF0Y2hlcywgYGZhbHNlYCBpZiBpdCdzIHNtYWxsZXIuXG4gICAqL1xuICBhdExlYXN0KHNpemUpIHtcbiAgICB2YXIgcXVlcnkgPSB0aGlzLmdldChzaXplKTtcblxuICAgIGlmIChxdWVyeSkge1xuICAgICAgcmV0dXJuIHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5KS5tYXRjaGVzO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2tzIGlmIHRoZSBzY3JlZW4gbWF0Y2hlcyB0byBhIGJyZWFrcG9pbnQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gc2l6ZSAtIE5hbWUgb2YgdGhlIGJyZWFrcG9pbnQgdG8gY2hlY2ssIGVpdGhlciAnc21hbGwgb25seScgb3IgJ3NtYWxsJy4gT21pdHRpbmcgJ29ubHknIGZhbGxzIGJhY2sgdG8gdXNpbmcgYXRMZWFzdCgpIG1ldGhvZC5cbiAgICogQHJldHVybnMge0Jvb2xlYW59IGB0cnVlYCBpZiB0aGUgYnJlYWtwb2ludCBtYXRjaGVzLCBgZmFsc2VgIGlmIGl0IGRvZXMgbm90LlxuICAgKi9cbiAgaXMoc2l6ZSkge1xuICAgIHNpemUgPSBzaXplLnRyaW0oKS5zcGxpdCgnICcpO1xuICAgIGlmKHNpemUubGVuZ3RoID4gMSAmJiBzaXplWzFdID09PSAnb25seScpIHtcbiAgICAgIGlmKHNpemVbMF0gPT09IHRoaXMuX2dldEN1cnJlbnRTaXplKCkpIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5hdExlYXN0KHNpemVbMF0pO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIG1lZGlhIHF1ZXJ5IG9mIGEgYnJlYWtwb2ludC5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gTmFtZSBvZiB0aGUgYnJlYWtwb2ludCB0byBnZXQuXG4gICAqIEByZXR1cm5zIHtTdHJpbmd8bnVsbH0gLSBUaGUgbWVkaWEgcXVlcnkgb2YgdGhlIGJyZWFrcG9pbnQsIG9yIGBudWxsYCBpZiB0aGUgYnJlYWtwb2ludCBkb2Vzbid0IGV4aXN0LlxuICAgKi9cbiAgZ2V0KHNpemUpIHtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMucXVlcmllcykge1xuICAgICAgaWYodGhpcy5xdWVyaWVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcbiAgICAgICAgaWYgKHNpemUgPT09IHF1ZXJ5Lm5hbWUpIHJldHVybiBxdWVyeS52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfSxcblxuICAvKipcbiAgICogR2V0cyB0aGUgY3VycmVudCBicmVha3BvaW50IG5hbWUgYnkgdGVzdGluZyBldmVyeSBicmVha3BvaW50IGFuZCByZXR1cm5pbmcgdGhlIGxhc3Qgb25lIHRvIG1hdGNoICh0aGUgYmlnZ2VzdCBvbmUpLlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICogQHJldHVybnMge1N0cmluZ30gTmFtZSBvZiB0aGUgY3VycmVudCBicmVha3BvaW50LlxuICAgKi9cbiAgX2dldEN1cnJlbnRTaXplKCkge1xuICAgIHZhciBtYXRjaGVkO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnF1ZXJpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBxdWVyeSA9IHRoaXMucXVlcmllc1tpXTtcblxuICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHF1ZXJ5LnZhbHVlKS5tYXRjaGVzKSB7XG4gICAgICAgIG1hdGNoZWQgPSBxdWVyeTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodHlwZW9mIG1hdGNoZWQgPT09ICdvYmplY3QnKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZC5uYW1lO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbWF0Y2hlZDtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIEFjdGl2YXRlcyB0aGUgYnJlYWtwb2ludCB3YXRjaGVyLCB3aGljaCBmaXJlcyBhbiBldmVudCBvbiB0aGUgd2luZG93IHdoZW5ldmVyIHRoZSBicmVha3BvaW50IGNoYW5nZXMuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3dhdGNoZXIoKSB7XG4gICAgJCh3aW5kb3cpLm9uKCdyZXNpemUuemYubWVkaWFxdWVyeScsICgpID0+IHtcbiAgICAgIHZhciBuZXdTaXplID0gdGhpcy5fZ2V0Q3VycmVudFNpemUoKSwgY3VycmVudFNpemUgPSB0aGlzLmN1cnJlbnQ7XG5cbiAgICAgIGlmIChuZXdTaXplICE9PSBjdXJyZW50U2l6ZSkge1xuICAgICAgICAvLyBDaGFuZ2UgdGhlIGN1cnJlbnQgbWVkaWEgcXVlcnlcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gbmV3U2l6ZTtcblxuICAgICAgICAvLyBCcm9hZGNhc3QgdGhlIG1lZGlhIHF1ZXJ5IGNoYW5nZSBvbiB0aGUgd2luZG93XG4gICAgICAgICQod2luZG93KS50cmlnZ2VyKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCBbbmV3U2l6ZSwgY3VycmVudFNpemVdKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxufTtcblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxuLy8gbWF0Y2hNZWRpYSgpIHBvbHlmaWxsIC0gVGVzdCBhIENTUyBtZWRpYSB0eXBlL3F1ZXJ5IGluIEpTLlxuLy8gQXV0aG9ycyAmIGNvcHlyaWdodCAoYykgMjAxMjogU2NvdHQgSmVobCwgUGF1bCBJcmlzaCwgTmljaG9sYXMgWmFrYXMsIERhdmlkIEtuaWdodC4gRHVhbCBNSVQvQlNEIGxpY2Vuc2VcbndpbmRvdy5tYXRjaE1lZGlhIHx8ICh3aW5kb3cubWF0Y2hNZWRpYSA9IGZ1bmN0aW9uKCkge1xuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gRm9yIGJyb3dzZXJzIHRoYXQgc3VwcG9ydCBtYXRjaE1lZGl1bSBhcGkgc3VjaCBhcyBJRSA5IGFuZCB3ZWJraXRcbiAgdmFyIHN0eWxlTWVkaWEgPSAod2luZG93LnN0eWxlTWVkaWEgfHwgd2luZG93Lm1lZGlhKTtcblxuICAvLyBGb3IgdGhvc2UgdGhhdCBkb24ndCBzdXBwb3J0IG1hdGNoTWVkaXVtXG4gIGlmICghc3R5bGVNZWRpYSkge1xuICAgIHZhciBzdHlsZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3R5bGUnKSxcbiAgICBzY3JpcHQgICAgICA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXSxcbiAgICBpbmZvICAgICAgICA9IG51bGw7XG5cbiAgICBzdHlsZS50eXBlICA9ICd0ZXh0L2Nzcyc7XG4gICAgc3R5bGUuaWQgICAgPSAnbWF0Y2htZWRpYWpzLXRlc3QnO1xuXG4gICAgc2NyaXB0ICYmIHNjcmlwdC5wYXJlbnROb2RlICYmIHNjcmlwdC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShzdHlsZSwgc2NyaXB0KTtcblxuICAgIC8vICdzdHlsZS5jdXJyZW50U3R5bGUnIGlzIHVzZWQgYnkgSUUgPD0gOCBhbmQgJ3dpbmRvdy5nZXRDb21wdXRlZFN0eWxlJyBmb3IgYWxsIG90aGVyIGJyb3dzZXJzXG4gICAgaW5mbyA9ICgnZ2V0Q29tcHV0ZWRTdHlsZScgaW4gd2luZG93KSAmJiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShzdHlsZSwgbnVsbCkgfHwgc3R5bGUuY3VycmVudFN0eWxlO1xuXG4gICAgc3R5bGVNZWRpYSA9IHtcbiAgICAgIG1hdGNoTWVkaXVtKG1lZGlhKSB7XG4gICAgICAgIHZhciB0ZXh0ID0gYEBtZWRpYSAke21lZGlhfXsgI21hdGNobWVkaWFqcy10ZXN0IHsgd2lkdGg6IDFweDsgfSB9YDtcblxuICAgICAgICAvLyAnc3R5bGUuc3R5bGVTaGVldCcgaXMgdXNlZCBieSBJRSA8PSA4IGFuZCAnc3R5bGUudGV4dENvbnRlbnQnIGZvciBhbGwgb3RoZXIgYnJvd3NlcnNcbiAgICAgICAgaWYgKHN0eWxlLnN0eWxlU2hlZXQpIHtcbiAgICAgICAgICBzdHlsZS5zdHlsZVNoZWV0LmNzc1RleHQgPSB0ZXh0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0eWxlLnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRlc3QgaWYgbWVkaWEgcXVlcnkgaXMgdHJ1ZSBvciBmYWxzZVxuICAgICAgICByZXR1cm4gaW5mby53aWR0aCA9PT0gJzFweCc7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG1lZGlhKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1hdGNoZXM6IHN0eWxlTWVkaWEubWF0Y2hNZWRpdW0obWVkaWEgfHwgJ2FsbCcpLFxuICAgICAgbWVkaWE6IG1lZGlhIHx8ICdhbGwnXG4gICAgfTtcbiAgfVxufSgpKTtcblxuLy8gVGhhbmsgeW91OiBodHRwczovL2dpdGh1Yi5jb20vc2luZHJlc29yaHVzL3F1ZXJ5LXN0cmluZ1xuZnVuY3Rpb24gcGFyc2VTdHlsZVRvT2JqZWN0KHN0cikge1xuICB2YXIgc3R5bGVPYmplY3QgPSB7fTtcblxuICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gc3R5bGVPYmplY3Q7XG4gIH1cblxuICBzdHIgPSBzdHIudHJpbSgpLnNsaWNlKDEsIC0xKTsgLy8gYnJvd3NlcnMgcmUtcXVvdGUgc3RyaW5nIHN0eWxlIHZhbHVlc1xuXG4gIGlmICghc3RyKSB7XG4gICAgcmV0dXJuIHN0eWxlT2JqZWN0O1xuICB9XG5cbiAgc3R5bGVPYmplY3QgPSBzdHIuc3BsaXQoJyYnKS5yZWR1Y2UoZnVuY3Rpb24ocmV0LCBwYXJhbSkge1xuICAgIHZhciBwYXJ0cyA9IHBhcmFtLnJlcGxhY2UoL1xcKy9nLCAnICcpLnNwbGl0KCc9Jyk7XG4gICAgdmFyIGtleSA9IHBhcnRzWzBdO1xuICAgIHZhciB2YWwgPSBwYXJ0c1sxXTtcbiAgICBrZXkgPSBkZWNvZGVVUklDb21wb25lbnQoa2V5KTtcblxuICAgIC8vIG1pc3NpbmcgYD1gIHNob3VsZCBiZSBgbnVsbGA6XG4gICAgLy8gaHR0cDovL3czLm9yZy9UUi8yMDEyL1dELXVybC0yMDEyMDUyNC8jY29sbGVjdC11cmwtcGFyYW1ldGVyc1xuICAgIHZhbCA9IHZhbCA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IGRlY29kZVVSSUNvbXBvbmVudCh2YWwpO1xuXG4gICAgaWYgKCFyZXQuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgcmV0W2tleV0gPSB2YWw7XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KHJldFtrZXldKSkge1xuICAgICAgcmV0W2tleV0ucHVzaCh2YWwpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXRba2V5XSA9IFtyZXRba2V5XSwgdmFsXTtcbiAgICB9XG4gICAgcmV0dXJuIHJldDtcbiAgfSwge30pO1xuXG4gIHJldHVybiBzdHlsZU9iamVjdDtcbn1cblxuRm91bmRhdGlvbi5NZWRpYVF1ZXJ5ID0gTWVkaWFRdWVyeTtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG4vKipcbiAqIE1vdGlvbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubW90aW9uXG4gKi9cblxuY29uc3QgaW5pdENsYXNzZXMgICA9IFsnbXVpLWVudGVyJywgJ211aS1sZWF2ZSddO1xuY29uc3QgYWN0aXZlQ2xhc3NlcyA9IFsnbXVpLWVudGVyLWFjdGl2ZScsICdtdWktbGVhdmUtYWN0aXZlJ107XG5cbmNvbnN0IE1vdGlvbiA9IHtcbiAgYW5pbWF0ZUluOiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZSh0cnVlLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKTtcbiAgfSxcblxuICBhbmltYXRlT3V0OiBmdW5jdGlvbihlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gICAgYW5pbWF0ZShmYWxzZSwgZWxlbWVudCwgYW5pbWF0aW9uLCBjYik7XG4gIH1cbn1cblxuZnVuY3Rpb24gTW92ZShkdXJhdGlvbiwgZWxlbSwgZm4pe1xuICB2YXIgYW5pbSwgcHJvZywgc3RhcnQgPSBudWxsO1xuICAvLyBjb25zb2xlLmxvZygnY2FsbGVkJyk7XG5cbiAgaWYgKGR1cmF0aW9uID09PSAwKSB7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG4gICAgZWxlbS50cmlnZ2VyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKS50cmlnZ2VySGFuZGxlcignZmluaXNoZWQuemYuYW5pbWF0ZScsIFtlbGVtXSk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZnVuY3Rpb24gbW92ZSh0cyl7XG4gICAgaWYoIXN0YXJ0KSBzdGFydCA9IHRzO1xuICAgIC8vIGNvbnNvbGUubG9nKHN0YXJ0LCB0cyk7XG4gICAgcHJvZyA9IHRzIC0gc3RhcnQ7XG4gICAgZm4uYXBwbHkoZWxlbSk7XG5cbiAgICBpZihwcm9nIDwgZHVyYXRpb24peyBhbmltID0gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShtb3ZlLCBlbGVtKTsgfVxuICAgIGVsc2V7XG4gICAgICB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUoYW5pbSk7XG4gICAgICBlbGVtLnRyaWdnZXIoJ2ZpbmlzaGVkLnpmLmFuaW1hdGUnLCBbZWxlbV0pLnRyaWdnZXJIYW5kbGVyKCdmaW5pc2hlZC56Zi5hbmltYXRlJywgW2VsZW1dKTtcbiAgICB9XG4gIH1cbiAgYW5pbSA9IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUobW92ZSk7XG59XG5cbi8qKlxuICogQW5pbWF0ZXMgYW4gZWxlbWVudCBpbiBvciBvdXQgdXNpbmcgYSBDU1MgdHJhbnNpdGlvbiBjbGFzcy5cbiAqIEBmdW5jdGlvblxuICogQHByaXZhdGVcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbiAtIERlZmluZXMgaWYgdGhlIGFuaW1hdGlvbiBpcyBpbiBvciBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvciBIVE1MIG9iamVjdCB0byBhbmltYXRlLlxuICogQHBhcmFtIHtTdHJpbmd9IGFuaW1hdGlvbiAtIENTUyBjbGFzcyB0byB1c2UuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYiAtIENhbGxiYWNrIHRvIHJ1biB3aGVuIGFuaW1hdGlvbiBpcyBmaW5pc2hlZC5cbiAqL1xuZnVuY3Rpb24gYW5pbWF0ZShpc0luLCBlbGVtZW50LCBhbmltYXRpb24sIGNiKSB7XG4gIGVsZW1lbnQgPSAkKGVsZW1lbnQpLmVxKDApO1xuXG4gIGlmICghZWxlbWVudC5sZW5ndGgpIHJldHVybjtcblxuICB2YXIgaW5pdENsYXNzID0gaXNJbiA/IGluaXRDbGFzc2VzWzBdIDogaW5pdENsYXNzZXNbMV07XG4gIHZhciBhY3RpdmVDbGFzcyA9IGlzSW4gPyBhY3RpdmVDbGFzc2VzWzBdIDogYWN0aXZlQ2xhc3Nlc1sxXTtcblxuICAvLyBTZXQgdXAgdGhlIGFuaW1hdGlvblxuICByZXNldCgpO1xuXG4gIGVsZW1lbnRcbiAgICAuYWRkQ2xhc3MoYW5pbWF0aW9uKVxuICAgIC5jc3MoJ3RyYW5zaXRpb24nLCAnbm9uZScpO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgZWxlbWVudC5hZGRDbGFzcyhpbml0Q2xhc3MpO1xuICAgIGlmIChpc0luKSBlbGVtZW50LnNob3coKTtcbiAgfSk7XG5cbiAgLy8gU3RhcnQgdGhlIGFuaW1hdGlvblxuICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUoKCkgPT4ge1xuICAgIGVsZW1lbnRbMF0ub2Zmc2V0V2lkdGg7XG4gICAgZWxlbWVudFxuICAgICAgLmNzcygndHJhbnNpdGlvbicsICcnKVxuICAgICAgLmFkZENsYXNzKGFjdGl2ZUNsYXNzKTtcbiAgfSk7XG5cbiAgLy8gQ2xlYW4gdXAgdGhlIGFuaW1hdGlvbiB3aGVuIGl0IGZpbmlzaGVzXG4gIGVsZW1lbnQub25lKEZvdW5kYXRpb24udHJhbnNpdGlvbmVuZChlbGVtZW50KSwgZmluaXNoKTtcblxuICAvLyBIaWRlcyB0aGUgZWxlbWVudCAoZm9yIG91dCBhbmltYXRpb25zKSwgcmVzZXRzIHRoZSBlbGVtZW50LCBhbmQgcnVucyBhIGNhbGxiYWNrXG4gIGZ1bmN0aW9uIGZpbmlzaCgpIHtcbiAgICBpZiAoIWlzSW4pIGVsZW1lbnQuaGlkZSgpO1xuICAgIHJlc2V0KCk7XG4gICAgaWYgKGNiKSBjYi5hcHBseShlbGVtZW50KTtcbiAgfVxuXG4gIC8vIFJlc2V0cyB0cmFuc2l0aW9ucyBhbmQgcmVtb3ZlcyBtb3Rpb24tc3BlY2lmaWMgY2xhc3Nlc1xuICBmdW5jdGlvbiByZXNldCgpIHtcbiAgICBlbGVtZW50WzBdLnN0eWxlLnRyYW5zaXRpb25EdXJhdGlvbiA9IDA7XG4gICAgZWxlbWVudC5yZW1vdmVDbGFzcyhgJHtpbml0Q2xhc3N9ICR7YWN0aXZlQ2xhc3N9ICR7YW5pbWF0aW9ufWApO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTW92ZSA9IE1vdmU7XG5Gb3VuZGF0aW9uLk1vdGlvbiA9IE1vdGlvbjtcblxufShqUXVlcnkpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4hZnVuY3Rpb24oJCkge1xuXG5jb25zdCBOZXN0ID0ge1xuICBGZWF0aGVyKG1lbnUsIHR5cGUgPSAnemYnKSB7XG4gICAgbWVudS5hdHRyKCdyb2xlJywgJ21lbnViYXInKTtcblxuICAgIHZhciBpdGVtcyA9IG1lbnUuZmluZCgnbGknKS5hdHRyKHsncm9sZSc6ICdtZW51aXRlbSd9KSxcbiAgICAgICAgc3ViTWVudUNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudWAsXG4gICAgICAgIHN1Ykl0ZW1DbGFzcyA9IGAke3N1Yk1lbnVDbGFzc30taXRlbWAsXG4gICAgICAgIGhhc1N1YkNsYXNzID0gYGlzLSR7dHlwZX0tc3VibWVudS1wYXJlbnRgO1xuXG4gICAgaXRlbXMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuXG4gICAgICBpZiAoJHN1Yi5sZW5ndGgpIHtcbiAgICAgICAgJGl0ZW1cbiAgICAgICAgICAuYWRkQ2xhc3MoaGFzU3ViQ2xhc3MpXG4gICAgICAgICAgLmF0dHIoe1xuICAgICAgICAgICAgJ2FyaWEtaGFzcG9wdXAnOiB0cnVlLFxuICAgICAgICAgICAgJ2FyaWEtbGFiZWwnOiAkaXRlbS5jaGlsZHJlbignYTpmaXJzdCcpLnRleHQoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIE5vdGU6ICBEcmlsbGRvd25zIGJlaGF2ZSBkaWZmZXJlbnRseSBpbiBob3cgdGhleSBoaWRlLCBhbmQgc28gbmVlZFxuICAgICAgICAgIC8vIGFkZGl0aW9uYWwgYXR0cmlidXRlcy4gIFdlIHNob3VsZCBsb29rIGlmIHRoaXMgcG9zc2libHkgb3Zlci1nZW5lcmFsaXplZFxuICAgICAgICAgIC8vIHV0aWxpdHkgKE5lc3QpIGlzIGFwcHJvcHJpYXRlIHdoZW4gd2UgcmV3b3JrIG1lbnVzIGluIDYuNFxuICAgICAgICAgIGlmKHR5cGUgPT09ICdkcmlsbGRvd24nKSB7XG4gICAgICAgICAgICAkaXRlbS5hdHRyKHsnYXJpYS1leHBhbmRlZCc6IGZhbHNlfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICRzdWJcbiAgICAgICAgICAuYWRkQ2xhc3MoYHN1Ym1lbnUgJHtzdWJNZW51Q2xhc3N9YClcbiAgICAgICAgICAuYXR0cih7XG4gICAgICAgICAgICAnZGF0YS1zdWJtZW51JzogJycsXG4gICAgICAgICAgICAncm9sZSc6ICdtZW51J1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZih0eXBlID09PSAnZHJpbGxkb3duJykge1xuICAgICAgICAgICRzdWIuYXR0cih7J2FyaWEtaGlkZGVuJzogdHJ1ZX0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICgkaXRlbS5wYXJlbnQoJ1tkYXRhLXN1Ym1lbnVdJykubGVuZ3RoKSB7XG4gICAgICAgICRpdGVtLmFkZENsYXNzKGBpcy1zdWJtZW51LWl0ZW0gJHtzdWJJdGVtQ2xhc3N9YCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm47XG4gIH0sXG5cbiAgQnVybihtZW51LCB0eXBlKSB7XG4gICAgdmFyIC8vaXRlbXMgPSBtZW51LmZpbmQoJ2xpJyksXG4gICAgICAgIHN1Yk1lbnVDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnVgLFxuICAgICAgICBzdWJJdGVtQ2xhc3MgPSBgJHtzdWJNZW51Q2xhc3N9LWl0ZW1gLFxuICAgICAgICBoYXNTdWJDbGFzcyA9IGBpcy0ke3R5cGV9LXN1Ym1lbnUtcGFyZW50YDtcblxuICAgIG1lbnVcbiAgICAgIC5maW5kKCc+bGksIC5tZW51LCAubWVudSA+IGxpJylcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHtzdWJNZW51Q2xhc3N9ICR7c3ViSXRlbUNsYXNzfSAke2hhc1N1YkNsYXNzfSBpcy1zdWJtZW51LWl0ZW0gc3VibWVudSBpcy1hY3RpdmVgKVxuICAgICAgLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpLmNzcygnZGlzcGxheScsICcnKTtcblxuICAgIC8vIGNvbnNvbGUubG9nKCAgICAgIG1lbnUuZmluZCgnLicgKyBzdWJNZW51Q2xhc3MgKyAnLCAuJyArIHN1Ykl0ZW1DbGFzcyArICcsIC5oYXMtc3VibWVudSwgLmlzLXN1Ym1lbnUtaXRlbSwgLnN1Ym1lbnUsIFtkYXRhLXN1Ym1lbnVdJylcbiAgICAvLyAgICAgICAgICAgLnJlbW92ZUNsYXNzKHN1Yk1lbnVDbGFzcyArICcgJyArIHN1Ykl0ZW1DbGFzcyArICcgaGFzLXN1Ym1lbnUgaXMtc3VibWVudS1pdGVtIHN1Ym1lbnUnKVxuICAgIC8vICAgICAgICAgICAucmVtb3ZlQXR0cignZGF0YS1zdWJtZW51JykpO1xuICAgIC8vIGl0ZW1zLmVhY2goZnVuY3Rpb24oKXtcbiAgICAvLyAgIHZhciAkaXRlbSA9ICQodGhpcyksXG4gICAgLy8gICAgICAgJHN1YiA9ICRpdGVtLmNoaWxkcmVuKCd1bCcpO1xuICAgIC8vICAgaWYoJGl0ZW0ucGFyZW50KCdbZGF0YS1zdWJtZW51XScpLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdpcy1zdWJtZW51LWl0ZW0gJyArIHN1Ykl0ZW1DbGFzcyk7XG4gICAgLy8gICB9XG4gICAgLy8gICBpZigkc3ViLmxlbmd0aCl7XG4gICAgLy8gICAgICRpdGVtLnJlbW92ZUNsYXNzKCdoYXMtc3VibWVudScpO1xuICAgIC8vICAgICAkc3ViLnJlbW92ZUNsYXNzKCdzdWJtZW51ICcgKyBzdWJNZW51Q2xhc3MpLnJlbW92ZUF0dHIoJ2RhdGEtc3VibWVudScpO1xuICAgIC8vICAgfVxuICAgIC8vIH0pO1xuICB9XG59XG5cbkZvdW5kYXRpb24uTmVzdCA9IE5lc3Q7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuZnVuY3Rpb24gVGltZXIoZWxlbSwgb3B0aW9ucywgY2IpIHtcbiAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgIGR1cmF0aW9uID0gb3B0aW9ucy5kdXJhdGlvbiwvL29wdGlvbnMgaXMgYW4gb2JqZWN0IGZvciBlYXNpbHkgYWRkaW5nIGZlYXR1cmVzIGxhdGVyLlxuICAgICAgbmFtZVNwYWNlID0gT2JqZWN0LmtleXMoZWxlbS5kYXRhKCkpWzBdIHx8ICd0aW1lcicsXG4gICAgICByZW1haW4gPSAtMSxcbiAgICAgIHN0YXJ0LFxuICAgICAgdGltZXI7XG5cbiAgdGhpcy5pc1BhdXNlZCA9IGZhbHNlO1xuXG4gIHRoaXMucmVzdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHJlbWFpbiA9IC0xO1xuICAgIGNsZWFyVGltZW91dCh0aW1lcik7XG4gICAgdGhpcy5zdGFydCgpO1xuICB9XG5cbiAgdGhpcy5zdGFydCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSBmYWxzZTtcbiAgICAvLyBpZighZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHJlbWFpbiA9IHJlbWFpbiA8PSAwID8gZHVyYXRpb24gOiByZW1haW47XG4gICAgZWxlbS5kYXRhKCdwYXVzZWQnLCBmYWxzZSk7XG4gICAgc3RhcnQgPSBEYXRlLm5vdygpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgaWYob3B0aW9ucy5pbmZpbml0ZSl7XG4gICAgICAgIF90aGlzLnJlc3RhcnQoKTsvL3JlcnVuIHRoZSB0aW1lci5cbiAgICAgIH1cbiAgICAgIGlmIChjYiAmJiB0eXBlb2YgY2IgPT09ICdmdW5jdGlvbicpIHsgY2IoKTsgfVxuICAgIH0sIHJlbWFpbik7XG4gICAgZWxlbS50cmlnZ2VyKGB0aW1lcnN0YXJ0LnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG5cbiAgdGhpcy5wYXVzZSA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaXNQYXVzZWQgPSB0cnVlO1xuICAgIC8vaWYoZWxlbS5kYXRhKCdwYXVzZWQnKSl7IHJldHVybiBmYWxzZTsgfS8vbWF5YmUgaW1wbGVtZW50IHRoaXMgc2FuaXR5IGNoZWNrIGlmIHVzZWQgZm9yIG90aGVyIHRoaW5ncy5cbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIGVsZW0uZGF0YSgncGF1c2VkJywgdHJ1ZSk7XG4gICAgdmFyIGVuZCA9IERhdGUubm93KCk7XG4gICAgcmVtYWluID0gcmVtYWluIC0gKGVuZCAtIHN0YXJ0KTtcbiAgICBlbGVtLnRyaWdnZXIoYHRpbWVycGF1c2VkLnpmLiR7bmFtZVNwYWNlfWApO1xuICB9XG59XG5cbi8qKlxuICogUnVucyBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gaW1hZ2VzIGFyZSBmdWxseSBsb2FkZWQuXG4gKiBAcGFyYW0ge09iamVjdH0gaW1hZ2VzIC0gSW1hZ2UocykgdG8gY2hlY2sgaWYgbG9hZGVkLlxuICogQHBhcmFtIHtGdW5jfSBjYWxsYmFjayAtIEZ1bmN0aW9uIHRvIGV4ZWN1dGUgd2hlbiBpbWFnZSBpcyBmdWxseSBsb2FkZWQuXG4gKi9cbmZ1bmN0aW9uIG9uSW1hZ2VzTG9hZGVkKGltYWdlcywgY2FsbGJhY2spe1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICB1bmxvYWRlZCA9IGltYWdlcy5sZW5ndGg7XG5cbiAgaWYgKHVubG9hZGVkID09PSAwKSB7XG4gICAgY2FsbGJhY2soKTtcbiAgfVxuXG4gIGltYWdlcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIC8vIENoZWNrIGlmIGltYWdlIGlzIGxvYWRlZFxuICAgIGlmICh0aGlzLmNvbXBsZXRlIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09IDQpIHx8ICh0aGlzLnJlYWR5U3RhdGUgPT09ICdjb21wbGV0ZScpKSB7XG4gICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgIH1cbiAgICAvLyBGb3JjZSBsb2FkIHRoZSBpbWFnZVxuICAgIGVsc2Uge1xuICAgICAgLy8gZml4IGZvciBJRS4gU2VlIGh0dHBzOi8vY3NzLXRyaWNrcy5jb20vc25pcHBldHMvanF1ZXJ5L2ZpeGluZy1sb2FkLWluLWllLWZvci1jYWNoZWQtaW1hZ2VzL1xuICAgICAgdmFyIHNyYyA9ICQodGhpcykuYXR0cignc3JjJyk7XG4gICAgICAkKHRoaXMpLmF0dHIoJ3NyYycsIHNyYyArIChzcmMuaW5kZXhPZignPycpID49IDAgPyAnJicgOiAnPycpICsgKG5ldyBEYXRlKCkuZ2V0VGltZSgpKSk7XG4gICAgICAkKHRoaXMpLm9uZSgnbG9hZCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBzaW5nbGVJbWFnZUxvYWRlZCgpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBzaW5nbGVJbWFnZUxvYWRlZCgpIHtcbiAgICB1bmxvYWRlZC0tO1xuICAgIGlmICh1bmxvYWRlZCA9PT0gMCkge1xuICAgICAgY2FsbGJhY2soKTtcbiAgICB9XG4gIH1cbn1cblxuRm91bmRhdGlvbi5UaW1lciA9IFRpbWVyO1xuRm91bmRhdGlvbi5vbkltYWdlc0xvYWRlZCA9IG9uSW1hZ2VzTG9hZGVkO1xuXG59KGpRdWVyeSk7XG4iLCIvLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqV29yayBpbnNwaXJlZCBieSBtdWx0aXBsZSBqcXVlcnkgc3dpcGUgcGx1Z2lucyoqXG4vLyoqRG9uZSBieSBZb2hhaSBBcmFyYXQgKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4oZnVuY3Rpb24oJCkge1xuXG4gICQuc3BvdFN3aXBlID0ge1xuICAgIHZlcnNpb246ICcxLjAuMCcsXG4gICAgZW5hYmxlZDogJ29udG91Y2hzdGFydCcgaW4gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LFxuICAgIHByZXZlbnREZWZhdWx0OiBmYWxzZSxcbiAgICBtb3ZlVGhyZXNob2xkOiA3NSxcbiAgICB0aW1lVGhyZXNob2xkOiAyMDBcbiAgfTtcblxuICB2YXIgICBzdGFydFBvc1gsXG4gICAgICAgIHN0YXJ0UG9zWSxcbiAgICAgICAgc3RhcnRUaW1lLFxuICAgICAgICBlbGFwc2VkVGltZSxcbiAgICAgICAgaXNNb3ZpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBvblRvdWNoRW5kKCkge1xuICAgIC8vICBhbGVydCh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIG9uVG91Y2hNb3ZlKTtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG4gICAgaXNNb3ZpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9uVG91Y2hNb3ZlKGUpIHtcbiAgICBpZiAoJC5zcG90U3dpcGUucHJldmVudERlZmF1bHQpIHsgZS5wcmV2ZW50RGVmYXVsdCgpOyB9XG4gICAgaWYoaXNNb3ZpbmcpIHtcbiAgICAgIHZhciB4ID0gZS50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgdmFyIHkgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICB2YXIgZHggPSBzdGFydFBvc1ggLSB4O1xuICAgICAgdmFyIGR5ID0gc3RhcnRQb3NZIC0geTtcbiAgICAgIHZhciBkaXI7XG4gICAgICBlbGFwc2VkVGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gc3RhcnRUaW1lO1xuICAgICAgaWYoTWF0aC5hYnMoZHgpID49ICQuc3BvdFN3aXBlLm1vdmVUaHJlc2hvbGQgJiYgZWxhcHNlZFRpbWUgPD0gJC5zcG90U3dpcGUudGltZVRocmVzaG9sZCkge1xuICAgICAgICBkaXIgPSBkeCA+IDAgPyAnbGVmdCcgOiAncmlnaHQnO1xuICAgICAgfVxuICAgICAgLy8gZWxzZSBpZihNYXRoLmFicyhkeSkgPj0gJC5zcG90U3dpcGUubW92ZVRocmVzaG9sZCAmJiBlbGFwc2VkVGltZSA8PSAkLnNwb3RTd2lwZS50aW1lVGhyZXNob2xkKSB7XG4gICAgICAvLyAgIGRpciA9IGR5ID4gMCA/ICdkb3duJyA6ICd1cCc7XG4gICAgICAvLyB9XG4gICAgICBpZihkaXIpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBvblRvdWNoRW5kLmNhbGwodGhpcyk7XG4gICAgICAgICQodGhpcykudHJpZ2dlcignc3dpcGUnLCBkaXIpLnRyaWdnZXIoYHN3aXBlJHtkaXJ9YCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KGUpIHtcbiAgICBpZiAoZS50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG4gICAgICBzdGFydFBvc1ggPSBlLnRvdWNoZXNbMF0ucGFnZVg7XG4gICAgICBzdGFydFBvc1kgPSBlLnRvdWNoZXNbMF0ucGFnZVk7XG4gICAgICBpc01vdmluZyA9IHRydWU7XG4gICAgICBzdGFydFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgb25Ub3VjaE1vdmUsIGZhbHNlKTtcbiAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kLCBmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIgJiYgdGhpcy5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0LCBmYWxzZSk7XG4gIH1cblxuICBmdW5jdGlvbiB0ZWFyZG93bigpIHtcbiAgICB0aGlzLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBvblRvdWNoU3RhcnQpO1xuICB9XG5cbiAgJC5ldmVudC5zcGVjaWFsLnN3aXBlID0geyBzZXR1cDogaW5pdCB9O1xuXG4gICQuZWFjaChbJ2xlZnQnLCAndXAnLCAnZG93bicsICdyaWdodCddLCBmdW5jdGlvbiAoKSB7XG4gICAgJC5ldmVudC5zcGVjaWFsW2Bzd2lwZSR7dGhpc31gXSA9IHsgc2V0dXA6IGZ1bmN0aW9uKCl7XG4gICAgICAkKHRoaXMpLm9uKCdzd2lwZScsICQubm9vcCk7XG4gICAgfSB9O1xuICB9KTtcbn0pKGpRdWVyeSk7XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICogTWV0aG9kIGZvciBhZGRpbmcgcHN1ZWRvIGRyYWcgZXZlbnRzIHRvIGVsZW1lbnRzICpcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG4hZnVuY3Rpb24oJCl7XG4gICQuZm4uYWRkVG91Y2ggPSBmdW5jdGlvbigpe1xuICAgIHRoaXMuZWFjaChmdW5jdGlvbihpLGVsKXtcbiAgICAgICQoZWwpLmJpbmQoJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJyxmdW5jdGlvbigpe1xuICAgICAgICAvL3dlIHBhc3MgdGhlIG9yaWdpbmFsIGV2ZW50IG9iamVjdCBiZWNhdXNlIHRoZSBqUXVlcnkgZXZlbnRcbiAgICAgICAgLy9vYmplY3QgaXMgbm9ybWFsaXplZCB0byB3M2Mgc3BlY3MgYW5kIGRvZXMgbm90IHByb3ZpZGUgdGhlIFRvdWNoTGlzdFxuICAgICAgICBoYW5kbGVUb3VjaChldmVudCk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIHZhciBoYW5kbGVUb3VjaCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgIHZhciB0b3VjaGVzID0gZXZlbnQuY2hhbmdlZFRvdWNoZXMsXG4gICAgICAgICAgZmlyc3QgPSB0b3VjaGVzWzBdLFxuICAgICAgICAgIGV2ZW50VHlwZXMgPSB7XG4gICAgICAgICAgICB0b3VjaHN0YXJ0OiAnbW91c2Vkb3duJyxcbiAgICAgICAgICAgIHRvdWNobW92ZTogJ21vdXNlbW92ZScsXG4gICAgICAgICAgICB0b3VjaGVuZDogJ21vdXNldXAnXG4gICAgICAgICAgfSxcbiAgICAgICAgICB0eXBlID0gZXZlbnRUeXBlc1tldmVudC50eXBlXSxcbiAgICAgICAgICBzaW11bGF0ZWRFdmVudFxuICAgICAgICA7XG5cbiAgICAgIGlmKCdNb3VzZUV2ZW50JyBpbiB3aW5kb3cgJiYgdHlwZW9mIHdpbmRvdy5Nb3VzZUV2ZW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gbmV3IHdpbmRvdy5Nb3VzZUV2ZW50KHR5cGUsIHtcbiAgICAgICAgICAnYnViYmxlcyc6IHRydWUsXG4gICAgICAgICAgJ2NhbmNlbGFibGUnOiB0cnVlLFxuICAgICAgICAgICdzY3JlZW5YJzogZmlyc3Quc2NyZWVuWCxcbiAgICAgICAgICAnc2NyZWVuWSc6IGZpcnN0LnNjcmVlblksXG4gICAgICAgICAgJ2NsaWVudFgnOiBmaXJzdC5jbGllbnRYLFxuICAgICAgICAgICdjbGllbnRZJzogZmlyc3QuY2xpZW50WVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNpbXVsYXRlZEV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ01vdXNlRXZlbnQnKTtcbiAgICAgICAgc2ltdWxhdGVkRXZlbnQuaW5pdE1vdXNlRXZlbnQodHlwZSwgdHJ1ZSwgdHJ1ZSwgd2luZG93LCAxLCBmaXJzdC5zY3JlZW5YLCBmaXJzdC5zY3JlZW5ZLCBmaXJzdC5jbGllbnRYLCBmaXJzdC5jbGllbnRZLCBmYWxzZSwgZmFsc2UsIGZhbHNlLCBmYWxzZSwgMC8qbGVmdCovLCBudWxsKTtcbiAgICAgIH1cbiAgICAgIGZpcnN0LnRhcmdldC5kaXNwYXRjaEV2ZW50KHNpbXVsYXRlZEV2ZW50KTtcbiAgICB9O1xuICB9O1xufShqUXVlcnkpO1xuXG5cbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuLy8qKkZyb20gdGhlIGpRdWVyeSBNb2JpbGUgTGlicmFyeSoqXG4vLyoqbmVlZCB0byByZWNyZWF0ZSBmdW5jdGlvbmFsaXR5Kipcbi8vKiphbmQgdHJ5IHRvIGltcHJvdmUgaWYgcG9zc2libGUqKlxuLy8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbi8qIFJlbW92aW5nIHRoZSBqUXVlcnkgZnVuY3Rpb24gKioqKlxuKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG5cbihmdW5jdGlvbiggJCwgd2luZG93LCB1bmRlZmluZWQgKSB7XG5cblx0dmFyICRkb2N1bWVudCA9ICQoIGRvY3VtZW50ICksXG5cdFx0Ly8gc3VwcG9ydFRvdWNoID0gJC5tb2JpbGUuc3VwcG9ydC50b3VjaCxcblx0XHR0b3VjaFN0YXJ0RXZlbnQgPSAndG91Y2hzdGFydCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hzdGFydFwiIDogXCJtb3VzZWRvd25cIixcblx0XHR0b3VjaFN0b3BFdmVudCA9ICd0b3VjaGVuZCcvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2hlbmRcIiA6IFwibW91c2V1cFwiLFxuXHRcdHRvdWNoTW92ZUV2ZW50ID0gJ3RvdWNobW92ZScvL3N1cHBvcnRUb3VjaCA/IFwidG91Y2htb3ZlXCIgOiBcIm1vdXNlbW92ZVwiO1xuXG5cdC8vIHNldHVwIG5ldyBldmVudCBzaG9ydGN1dHNcblx0JC5lYWNoKCAoIFwidG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgXCIgK1xuXHRcdFwic3dpcGUgc3dpcGVsZWZ0IHN3aXBlcmlnaHRcIiApLnNwbGl0KCBcIiBcIiApLCBmdW5jdGlvbiggaSwgbmFtZSApIHtcblxuXHRcdCQuZm5bIG5hbWUgXSA9IGZ1bmN0aW9uKCBmbiApIHtcblx0XHRcdHJldHVybiBmbiA/IHRoaXMuYmluZCggbmFtZSwgZm4gKSA6IHRoaXMudHJpZ2dlciggbmFtZSApO1xuXHRcdH07XG5cblx0XHQvLyBqUXVlcnkgPCAxLjhcblx0XHRpZiAoICQuYXR0ckZuICkge1xuXHRcdFx0JC5hdHRyRm5bIG5hbWUgXSA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblxuXHRmdW5jdGlvbiB0cmlnZ2VyQ3VzdG9tRXZlbnQoIG9iaiwgZXZlbnRUeXBlLCBldmVudCwgYnViYmxlICkge1xuXHRcdHZhciBvcmlnaW5hbFR5cGUgPSBldmVudC50eXBlO1xuXHRcdGV2ZW50LnR5cGUgPSBldmVudFR5cGU7XG5cdFx0aWYgKCBidWJibGUgKSB7XG5cdFx0XHQkLmV2ZW50LnRyaWdnZXIoIGV2ZW50LCB1bmRlZmluZWQsIG9iaiApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQkLmV2ZW50LmRpc3BhdGNoLmNhbGwoIG9iaiwgZXZlbnQgKTtcblx0XHR9XG5cdFx0ZXZlbnQudHlwZSA9IG9yaWdpbmFsVHlwZTtcblx0fVxuXG5cdC8vIGFsc28gaGFuZGxlcyB0YXBob2xkXG5cblx0Ly8gQWxzbyBoYW5kbGVzIHN3aXBlbGVmdCwgc3dpcGVyaWdodFxuXHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUgPSB7XG5cblx0XHQvLyBNb3JlIHRoYW4gdGhpcyBob3Jpem9udGFsIGRpc3BsYWNlbWVudCwgYW5kIHdlIHdpbGwgc3VwcHJlc3Mgc2Nyb2xsaW5nLlxuXHRcdHNjcm9sbFN1cHJlc3Npb25UaHJlc2hvbGQ6IDMwLFxuXG5cdFx0Ly8gTW9yZSB0aW1lIHRoYW4gdGhpcywgYW5kIGl0IGlzbid0IGEgc3dpcGUuXG5cdFx0ZHVyYXRpb25UaHJlc2hvbGQ6IDEwMDAsXG5cblx0XHQvLyBTd2lwZSBob3Jpem9udGFsIGRpc3BsYWNlbWVudCBtdXN0IGJlIG1vcmUgdGhhbiB0aGlzLlxuXHRcdGhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZDogd2luZG93LmRldmljZVBpeGVsUmF0aW8gPj0gMiA/IDE1IDogMzAsXG5cblx0XHQvLyBTd2lwZSB2ZXJ0aWNhbCBkaXNwbGFjZW1lbnQgbXVzdCBiZSBsZXNzIHRoYW4gdGhpcy5cblx0XHR2ZXJ0aWNhbERpc3RhbmNlVGhyZXNob2xkOiB3aW5kb3cuZGV2aWNlUGl4ZWxSYXRpbyA+PSAyID8gMTUgOiAzMCxcblxuXHRcdGdldExvY2F0aW9uOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdFx0dmFyIHdpblBhZ2VYID0gd2luZG93LnBhZ2VYT2Zmc2V0LFxuXHRcdFx0XHR3aW5QYWdlWSA9IHdpbmRvdy5wYWdlWU9mZnNldCxcblx0XHRcdFx0eCA9IGV2ZW50LmNsaWVudFgsXG5cdFx0XHRcdHkgPSBldmVudC5jbGllbnRZO1xuXG5cdFx0XHRpZiAoIGV2ZW50LnBhZ2VZID09PSAwICYmIE1hdGguZmxvb3IoIHkgKSA+IE1hdGguZmxvb3IoIGV2ZW50LnBhZ2VZICkgfHxcblx0XHRcdFx0ZXZlbnQucGFnZVggPT09IDAgJiYgTWF0aC5mbG9vciggeCApID4gTWF0aC5mbG9vciggZXZlbnQucGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBpT1M0IGNsaWVudFgvY2xpZW50WSBoYXZlIHRoZSB2YWx1ZSB0aGF0IHNob3VsZCBoYXZlIGJlZW5cblx0XHRcdFx0Ly8gaW4gcGFnZVgvcGFnZVkuIFdoaWxlIHBhZ2VYL3BhZ2UvIGhhdmUgdGhlIHZhbHVlIDBcblx0XHRcdFx0eCA9IHggLSB3aW5QYWdlWDtcblx0XHRcdFx0eSA9IHkgLSB3aW5QYWdlWTtcblx0XHRcdH0gZWxzZSBpZiAoIHkgPCAoIGV2ZW50LnBhZ2VZIC0gd2luUGFnZVkpIHx8IHggPCAoIGV2ZW50LnBhZ2VYIC0gd2luUGFnZVggKSApIHtcblxuXHRcdFx0XHQvLyBTb21lIEFuZHJvaWQgYnJvd3NlcnMgaGF2ZSB0b3RhbGx5IGJvZ3VzIHZhbHVlcyBmb3IgY2xpZW50WC9ZXG5cdFx0XHRcdC8vIHdoZW4gc2Nyb2xsaW5nL3pvb21pbmcgYSBwYWdlLiBEZXRlY3RhYmxlIHNpbmNlIGNsaWVudFgvY2xpZW50WVxuXHRcdFx0XHQvLyBzaG91bGQgbmV2ZXIgYmUgc21hbGxlciB0aGFuIHBhZ2VYL3BhZ2VZIG1pbnVzIHBhZ2Ugc2Nyb2xsXG5cdFx0XHRcdHggPSBldmVudC5wYWdlWCAtIHdpblBhZ2VYO1xuXHRcdFx0XHR5ID0gZXZlbnQucGFnZVkgLSB3aW5QYWdlWTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0eDogeCxcblx0XHRcdFx0eTogeVxuXHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RhcnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHZhciBkYXRhID0gZXZlbnQub3JpZ2luYWxFdmVudC50b3VjaGVzID9cblx0XHRcdFx0XHRldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXNbIDAgXSA6IGV2ZW50LFxuXHRcdFx0XHRsb2NhdGlvbiA9ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5nZXRMb2NhdGlvbiggZGF0YSApO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdHRpbWU6ICggbmV3IERhdGUoKSApLmdldFRpbWUoKSxcblx0XHRcdFx0XHRcdGNvb3JkczogWyBsb2NhdGlvbi54LCBsb2NhdGlvbi55IF0sXG5cdFx0XHRcdFx0XHRvcmlnaW46ICQoIGV2ZW50LnRhcmdldCApXG5cdFx0XHRcdFx0fTtcblx0XHR9LFxuXG5cdFx0c3RvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdFx0dmFyIGRhdGEgPSBldmVudC5vcmlnaW5hbEV2ZW50LnRvdWNoZXMgP1xuXHRcdFx0XHRcdGV2ZW50Lm9yaWdpbmFsRXZlbnQudG91Y2hlc1sgMCBdIDogZXZlbnQsXG5cdFx0XHRcdGxvY2F0aW9uID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmdldExvY2F0aW9uKCBkYXRhICk7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGltZTogKCBuZXcgRGF0ZSgpICkuZ2V0VGltZSgpLFxuXHRcdFx0XHRcdFx0Y29vcmRzOiBbIGxvY2F0aW9uLngsIGxvY2F0aW9uLnkgXVxuXHRcdFx0XHRcdH07XG5cdFx0fSxcblxuXHRcdGhhbmRsZVN3aXBlOiBmdW5jdGlvbiggc3RhcnQsIHN0b3AsIHRoaXNPYmplY3QsIG9yaWdUYXJnZXQgKSB7XG5cdFx0XHRpZiAoIHN0b3AudGltZSAtIHN0YXJ0LnRpbWUgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZHVyYXRpb25UaHJlc2hvbGQgJiZcblx0XHRcdFx0TWF0aC5hYnMoIHN0YXJ0LmNvb3Jkc1sgMCBdIC0gc3RvcC5jb29yZHNbIDAgXSApID4gJC5ldmVudC5zcGVjaWFsLnN3aXBlLmhvcml6b250YWxEaXN0YW5jZVRocmVzaG9sZCAmJlxuXHRcdFx0XHRNYXRoLmFicyggc3RhcnQuY29vcmRzWyAxIF0gLSBzdG9wLmNvb3Jkc1sgMSBdICkgPCAkLmV2ZW50LnNwZWNpYWwuc3dpcGUudmVydGljYWxEaXN0YW5jZVRocmVzaG9sZCApIHtcblx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IHN0YXJ0LmNvb3Jkc1swXSA+IHN0b3AuY29vcmRzWyAwIF0gPyBcInN3aXBlbGVmdFwiIDogXCJzd2lwZXJpZ2h0XCI7XG5cblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBcInN3aXBlXCIsICQuRXZlbnQoIFwic3dpcGVcIiwgeyB0YXJnZXQ6IG9yaWdUYXJnZXQsIHN3aXBlc3RhcnQ6IHN0YXJ0LCBzd2lwZXN0b3A6IHN0b3AgfSksIHRydWUgKTtcblx0XHRcdFx0dHJpZ2dlckN1c3RvbUV2ZW50KCB0aGlzT2JqZWN0LCBkaXJlY3Rpb24sJC5FdmVudCggZGlyZWN0aW9uLCB7IHRhcmdldDogb3JpZ1RhcmdldCwgc3dpcGVzdGFydDogc3RhcnQsIHN3aXBlc3RvcDogc3RvcCB9ICksIHRydWUgKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHR9LFxuXG5cdFx0Ly8gVGhpcyBzZXJ2ZXMgYXMgYSBmbGFnIHRvIGVuc3VyZSB0aGF0IGF0IG1vc3Qgb25lIHN3aXBlIGV2ZW50IGV2ZW50IGlzXG5cdFx0Ly8gaW4gd29yayBhdCBhbnkgZ2l2ZW4gdGltZVxuXHRcdGV2ZW50SW5Qcm9ncmVzczogZmFsc2UsXG5cblx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHR2YXIgZXZlbnRzLFxuXHRcdFx0XHR0aGlzT2JqZWN0ID0gdGhpcyxcblx0XHRcdFx0JHRoaXMgPSAkKCB0aGlzT2JqZWN0ICksXG5cdFx0XHRcdGNvbnRleHQgPSB7fTtcblxuXHRcdFx0Ly8gUmV0cmlldmUgdGhlIGV2ZW50cyBkYXRhIGZvciB0aGlzIGVsZW1lbnQgYW5kIGFkZCB0aGUgc3dpcGUgY29udGV4dFxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCAhZXZlbnRzICkge1xuXHRcdFx0XHRldmVudHMgPSB7IGxlbmd0aDogMCB9O1xuXHRcdFx0XHQkLmRhdGEoIHRoaXMsIFwibW9iaWxlLWV2ZW50c1wiLCBldmVudHMgKTtcblx0XHRcdH1cblx0XHRcdGV2ZW50cy5sZW5ndGgrKztcblx0XHRcdGV2ZW50cy5zd2lwZSA9IGNvbnRleHQ7XG5cblx0XHRcdGNvbnRleHQuc3RhcnQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG5cblx0XHRcdFx0Ly8gQmFpbCBpZiB3ZSdyZSBhbHJlYWR5IHdvcmtpbmcgb24gYSBzd2lwZSBldmVudFxuXHRcdFx0XHRpZiAoICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgKSB7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSB0cnVlO1xuXG5cdFx0XHRcdHZhciBzdG9wLFxuXHRcdFx0XHRcdHN0YXJ0ID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0YXJ0KCBldmVudCApLFxuXHRcdFx0XHRcdG9yaWdUYXJnZXQgPSBldmVudC50YXJnZXQsXG5cdFx0XHRcdFx0ZW1pdHRlZCA9IGZhbHNlO1xuXG5cdFx0XHRcdGNvbnRleHQubW92ZSA9IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdFx0XHRpZiAoICFzdGFydCB8fCBldmVudC5pc0RlZmF1bHRQcmV2ZW50ZWQoKSApIHtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRzdG9wID0gJC5ldmVudC5zcGVjaWFsLnN3aXBlLnN0b3AoIGV2ZW50ICk7XG5cdFx0XHRcdFx0aWYgKCAhZW1pdHRlZCApIHtcblx0XHRcdFx0XHRcdGVtaXR0ZWQgPSAkLmV2ZW50LnNwZWNpYWwuc3dpcGUuaGFuZGxlU3dpcGUoIHN0YXJ0LCBzdG9wLCB0aGlzT2JqZWN0LCBvcmlnVGFyZ2V0ICk7XG5cdFx0XHRcdFx0XHRpZiAoIGVtaXR0ZWQgKSB7XG5cblx0XHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHRcdCQuZXZlbnQuc3BlY2lhbC5zd2lwZS5ldmVudEluUHJvZ3Jlc3MgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHJldmVudCBzY3JvbGxpbmdcblx0XHRcdFx0XHRpZiAoIE1hdGguYWJzKCBzdGFydC5jb29yZHNbIDAgXSAtIHN0b3AuY29vcmRzWyAwIF0gKSA+ICQuZXZlbnQuc3BlY2lhbC5zd2lwZS5zY3JvbGxTdXByZXNzaW9uVGhyZXNob2xkICkge1xuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdFx0Y29udGV4dC5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRlbWl0dGVkID0gdHJ1ZTtcblxuXHRcdFx0XHRcdFx0Ly8gUmVzZXQgdGhlIGNvbnRleHQgdG8gbWFrZSB3YXkgZm9yIHRoZSBuZXh0IHN3aXBlIGV2ZW50XG5cdFx0XHRcdFx0XHQkLmV2ZW50LnNwZWNpYWwuc3dpcGUuZXZlbnRJblByb2dyZXNzID0gZmFsc2U7XG5cdFx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdFx0XHRjb250ZXh0Lm1vdmUgPSBudWxsO1xuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdCRkb2N1bWVudC5vbiggdG91Y2hNb3ZlRXZlbnQsIGNvbnRleHQubW92ZSApXG5cdFx0XHRcdFx0Lm9uZSggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0fTtcblx0XHRcdCR0aGlzLm9uKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHR9LFxuXG5cdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFyIGV2ZW50cywgY29udGV4dDtcblxuXHRcdFx0ZXZlbnRzID0gJC5kYXRhKCB0aGlzLCBcIm1vYmlsZS1ldmVudHNcIiApO1xuXHRcdFx0aWYgKCBldmVudHMgKSB7XG5cdFx0XHRcdGNvbnRleHQgPSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGRlbGV0ZSBldmVudHMuc3dpcGU7XG5cdFx0XHRcdGV2ZW50cy5sZW5ndGgtLTtcblx0XHRcdFx0aWYgKCBldmVudHMubGVuZ3RoID09PSAwICkge1xuXHRcdFx0XHRcdCQucmVtb3ZlRGF0YSggdGhpcywgXCJtb2JpbGUtZXZlbnRzXCIgKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIGNvbnRleHQgKSB7XG5cdFx0XHRcdGlmICggY29udGV4dC5zdGFydCApIHtcblx0XHRcdFx0XHQkKCB0aGlzICkub2ZmKCB0b3VjaFN0YXJ0RXZlbnQsIGNvbnRleHQuc3RhcnQgKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIGNvbnRleHQubW92ZSApIHtcblx0XHRcdFx0XHQkZG9jdW1lbnQub2ZmKCB0b3VjaE1vdmVFdmVudCwgY29udGV4dC5tb3ZlICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCBjb250ZXh0LnN0b3AgKSB7XG5cdFx0XHRcdFx0JGRvY3VtZW50Lm9mZiggdG91Y2hTdG9wRXZlbnQsIGNvbnRleHQuc3RvcCApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHQkLmVhY2goe1xuXHRcdHN3aXBlbGVmdDogXCJzd2lwZS5sZWZ0XCIsXG5cdFx0c3dpcGVyaWdodDogXCJzd2lwZS5yaWdodFwiXG5cdH0sIGZ1bmN0aW9uKCBldmVudCwgc291cmNlRXZlbnQgKSB7XG5cblx0XHQkLmV2ZW50LnNwZWNpYWxbIGV2ZW50IF0gPSB7XG5cdFx0XHRzZXR1cDogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQoIHRoaXMgKS5iaW5kKCBzb3VyY2VFdmVudCwgJC5ub29wICk7XG5cdFx0XHR9LFxuXHRcdFx0dGVhcmRvd246IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKCB0aGlzICkudW5iaW5kKCBzb3VyY2VFdmVudCApO1xuXHRcdFx0fVxuXHRcdH07XG5cdH0pO1xufSkoIGpRdWVyeSwgdGhpcyApO1xuKi9cbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuY29uc3QgTXV0YXRpb25PYnNlcnZlciA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBwcmVmaXhlcyA9IFsnV2ViS2l0JywgJ01veicsICdPJywgJ01zJywgJyddO1xuICBmb3IgKHZhciBpPTA7IGkgPCBwcmVmaXhlcy5sZW5ndGg7IGkrKykge1xuICAgIGlmIChgJHtwcmVmaXhlc1tpXX1NdXRhdGlvbk9ic2VydmVyYCBpbiB3aW5kb3cpIHtcbiAgICAgIHJldHVybiB3aW5kb3dbYCR7cHJlZml4ZXNbaV19TXV0YXRpb25PYnNlcnZlcmBdO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmFsc2U7XG59KCkpO1xuXG5jb25zdCB0cmlnZ2VycyA9IChlbCwgdHlwZSkgPT4ge1xuICBlbC5kYXRhKHR5cGUpLnNwbGl0KCcgJykuZm9yRWFjaChpZCA9PiB7XG4gICAgJChgIyR7aWR9YClbIHR5cGUgPT09ICdjbG9zZScgPyAndHJpZ2dlcicgOiAndHJpZ2dlckhhbmRsZXInXShgJHt0eXBlfS56Zi50cmlnZ2VyYCwgW2VsXSk7XG4gIH0pO1xufTtcbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtb3Blbl0gd2lsbCByZXZlYWwgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS1vcGVuXScsIGZ1bmN0aW9uKCkge1xuICB0cmlnZ2VycygkKHRoaXMpLCAnb3BlbicpO1xufSk7XG5cbi8vIEVsZW1lbnRzIHdpdGggW2RhdGEtY2xvc2VdIHdpbGwgY2xvc2UgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4vLyBJZiB1c2VkIHdpdGhvdXQgYSB2YWx1ZSBvbiBbZGF0YS1jbG9zZV0sIHRoZSBldmVudCB3aWxsIGJ1YmJsZSwgYWxsb3dpbmcgaXQgdG8gY2xvc2UgYSBwYXJlbnQgY29tcG9uZW50LlxuJChkb2N1bWVudCkub24oJ2NsaWNrLnpmLnRyaWdnZXInLCAnW2RhdGEtY2xvc2VdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgnY2xvc2UnKTtcbiAgaWYgKGlkKSB7XG4gICAgdHJpZ2dlcnMoJCh0aGlzKSwgJ2Nsb3NlJyk7XG4gIH1cbiAgZWxzZSB7XG4gICAgJCh0aGlzKS50cmlnZ2VyKCdjbG9zZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLXRvZ2dsZV0gd2lsbCB0b2dnbGUgYSBwbHVnaW4gdGhhdCBzdXBwb3J0cyBpdCB3aGVuIGNsaWNrZWQuXG4kKGRvY3VtZW50KS5vbignY2xpY2suemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGVdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlJyk7XG4gIGlmIChpZCkge1xuICAgIHRyaWdnZXJzKCQodGhpcyksICd0b2dnbGUnKTtcbiAgfSBlbHNlIHtcbiAgICAkKHRoaXMpLnRyaWdnZXIoJ3RvZ2dsZS56Zi50cmlnZ2VyJyk7XG4gIH1cbn0pO1xuXG4vLyBFbGVtZW50cyB3aXRoIFtkYXRhLWNsb3NhYmxlXSB3aWxsIHJlc3BvbmQgdG8gY2xvc2UuemYudHJpZ2dlciBldmVudHMuXG4kKGRvY3VtZW50KS5vbignY2xvc2UuemYudHJpZ2dlcicsICdbZGF0YS1jbG9zYWJsZV0nLCBmdW5jdGlvbihlKXtcbiAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgbGV0IGFuaW1hdGlvbiA9ICQodGhpcykuZGF0YSgnY2xvc2FibGUnKTtcblxuICBpZihhbmltYXRpb24gIT09ICcnKXtcbiAgICBGb3VuZGF0aW9uLk1vdGlvbi5hbmltYXRlT3V0KCQodGhpcyksIGFuaW1hdGlvbiwgZnVuY3Rpb24oKSB7XG4gICAgICAkKHRoaXMpLnRyaWdnZXIoJ2Nsb3NlZC56ZicpO1xuICAgIH0pO1xuICB9ZWxzZXtcbiAgICAkKHRoaXMpLmZhZGVPdXQoKS50cmlnZ2VyKCdjbG9zZWQuemYnKTtcbiAgfVxufSk7XG5cbiQoZG9jdW1lbnQpLm9uKCdmb2N1cy56Zi50cmlnZ2VyIGJsdXIuemYudHJpZ2dlcicsICdbZGF0YS10b2dnbGUtZm9jdXNdJywgZnVuY3Rpb24oKSB7XG4gIGxldCBpZCA9ICQodGhpcykuZGF0YSgndG9nZ2xlLWZvY3VzJyk7XG4gICQoYCMke2lkfWApLnRyaWdnZXJIYW5kbGVyKCd0b2dnbGUuemYudHJpZ2dlcicsIFskKHRoaXMpXSk7XG59KTtcblxuLyoqXG4qIEZpcmVzIG9uY2UgYWZ0ZXIgYWxsIG90aGVyIHNjcmlwdHMgaGF2ZSBsb2FkZWRcbiogQGZ1bmN0aW9uXG4qIEBwcml2YXRlXG4qL1xuJCh3aW5kb3cpLm9uKCdsb2FkJywgKCkgPT4ge1xuICBjaGVja0xpc3RlbmVycygpO1xufSk7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXJzKCkge1xuICBldmVudHNMaXN0ZW5lcigpO1xuICByZXNpemVMaXN0ZW5lcigpO1xuICBzY3JvbGxMaXN0ZW5lcigpO1xuICBjbG9zZW1lTGlzdGVuZXIoKTtcbn1cblxuLy8qKioqKioqKiBvbmx5IGZpcmVzIHRoaXMgZnVuY3Rpb24gb25jZSBvbiBsb2FkLCBpZiB0aGVyZSdzIHNvbWV0aGluZyB0byB3YXRjaCAqKioqKioqKlxuZnVuY3Rpb24gY2xvc2VtZUxpc3RlbmVyKHBsdWdpbk5hbWUpIHtcbiAgdmFyIHlldGlCb3hlcyA9ICQoJ1tkYXRhLXlldGktYm94XScpLFxuICAgICAgcGx1Z05hbWVzID0gWydkcm9wZG93bicsICd0b29sdGlwJywgJ3JldmVhbCddO1xuXG4gIGlmKHBsdWdpbk5hbWUpe1xuICAgIGlmKHR5cGVvZiBwbHVnaW5OYW1lID09PSAnc3RyaW5nJyl7XG4gICAgICBwbHVnTmFtZXMucHVzaChwbHVnaW5OYW1lKTtcbiAgICB9ZWxzZSBpZih0eXBlb2YgcGx1Z2luTmFtZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHBsdWdpbk5hbWVbMF0gPT09ICdzdHJpbmcnKXtcbiAgICAgIHBsdWdOYW1lcy5jb25jYXQocGx1Z2luTmFtZSk7XG4gICAgfWVsc2V7XG4gICAgICBjb25zb2xlLmVycm9yKCdQbHVnaW4gbmFtZXMgbXVzdCBiZSBzdHJpbmdzJyk7XG4gICAgfVxuICB9XG4gIGlmKHlldGlCb3hlcy5sZW5ndGgpe1xuICAgIGxldCBsaXN0ZW5lcnMgPSBwbHVnTmFtZXMubWFwKChuYW1lKSA9PiB7XG4gICAgICByZXR1cm4gYGNsb3NlbWUuemYuJHtuYW1lfWA7XG4gICAgfSkuam9pbignICcpO1xuXG4gICAgJCh3aW5kb3cpLm9mZihsaXN0ZW5lcnMpLm9uKGxpc3RlbmVycywgZnVuY3Rpb24oZSwgcGx1Z2luSWQpe1xuICAgICAgbGV0IHBsdWdpbiA9IGUubmFtZXNwYWNlLnNwbGl0KCcuJylbMF07XG4gICAgICBsZXQgcGx1Z2lucyA9ICQoYFtkYXRhLSR7cGx1Z2lufV1gKS5ub3QoYFtkYXRhLXlldGktYm94PVwiJHtwbHVnaW5JZH1cIl1gKTtcblxuICAgICAgcGx1Z2lucy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICAgIGxldCBfdGhpcyA9ICQodGhpcyk7XG5cbiAgICAgICAgX3RoaXMudHJpZ2dlckhhbmRsZXIoJ2Nsb3NlLnpmLnRyaWdnZXInLCBbX3RoaXNdKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlc2l6ZUxpc3RlbmVyKGRlYm91bmNlKXtcbiAgbGV0IHRpbWVyLFxuICAgICAgJG5vZGVzID0gJCgnW2RhdGEtcmVzaXplXScpO1xuICBpZigkbm9kZXMubGVuZ3RoKXtcbiAgICAkKHdpbmRvdykub2ZmKCdyZXNpemUuemYudHJpZ2dlcicpXG4gICAgLm9uKCdyZXNpemUuemYudHJpZ2dlcicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICh0aW1lcikgeyBjbGVhclRpbWVvdXQodGltZXIpOyB9XG5cbiAgICAgIHRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgIGlmKCFNdXRhdGlvbk9ic2VydmVyKXsvL2ZhbGxiYWNrIGZvciBJRSA5XG4gICAgICAgICAgJG5vZGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAvL3RyaWdnZXIgYWxsIGxpc3RlbmluZyBlbGVtZW50cyBhbmQgc2lnbmFsIGEgcmVzaXplIGV2ZW50XG4gICAgICAgICRub2Rlcy5hdHRyKCdkYXRhLWV2ZW50cycsIFwicmVzaXplXCIpO1xuICAgICAgfSwgZGVib3VuY2UgfHwgMTApOy8vZGVmYXVsdCB0aW1lIHRvIGVtaXQgcmVzaXplIGV2ZW50XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gc2Nyb2xsTGlzdGVuZXIoZGVib3VuY2Upe1xuICBsZXQgdGltZXIsXG4gICAgICAkbm9kZXMgPSAkKCdbZGF0YS1zY3JvbGxdJyk7XG4gIGlmKCRub2Rlcy5sZW5ndGgpe1xuICAgICQod2luZG93KS5vZmYoJ3Njcm9sbC56Zi50cmlnZ2VyJylcbiAgICAub24oJ3Njcm9sbC56Zi50cmlnZ2VyJywgZnVuY3Rpb24oZSl7XG4gICAgICBpZih0aW1lcil7IGNsZWFyVGltZW91dCh0aW1lcik7IH1cblxuICAgICAgdGltZXIgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpey8vZmFsbGJhY2sgZm9yIElFIDlcbiAgICAgICAgICAkbm9kZXMuZWFjaChmdW5jdGlvbigpe1xuICAgICAgICAgICAgJCh0aGlzKS50cmlnZ2VySGFuZGxlcignc2Nyb2xsbWUuemYudHJpZ2dlcicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIC8vdHJpZ2dlciBhbGwgbGlzdGVuaW5nIGVsZW1lbnRzIGFuZCBzaWduYWwgYSBzY3JvbGwgZXZlbnRcbiAgICAgICAgJG5vZGVzLmF0dHIoJ2RhdGEtZXZlbnRzJywgXCJzY3JvbGxcIik7XG4gICAgICB9LCBkZWJvdW5jZSB8fCAxMCk7Ly9kZWZhdWx0IHRpbWUgdG8gZW1pdCBzY3JvbGwgZXZlbnRcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudHNMaXN0ZW5lcigpIHtcbiAgaWYoIU11dGF0aW9uT2JzZXJ2ZXIpeyByZXR1cm4gZmFsc2U7IH1cbiAgbGV0IG5vZGVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtcmVzaXplXSwgW2RhdGEtc2Nyb2xsXSwgW2RhdGEtbXV0YXRlXScpO1xuXG4gIC8vZWxlbWVudCBjYWxsYmFja1xuICB2YXIgbGlzdGVuaW5nRWxlbWVudHNNdXRhdGlvbiA9IGZ1bmN0aW9uIChtdXRhdGlvblJlY29yZHNMaXN0KSB7XG4gICAgICB2YXIgJHRhcmdldCA9ICQobXV0YXRpb25SZWNvcmRzTGlzdFswXS50YXJnZXQpO1xuXG5cdCAgLy90cmlnZ2VyIHRoZSBldmVudCBoYW5kbGVyIGZvciB0aGUgZWxlbWVudCBkZXBlbmRpbmcgb24gdHlwZVxuICAgICAgc3dpdGNoIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLnR5cGUpIHtcblxuICAgICAgICBjYXNlIFwiYXR0cmlidXRlc1wiOlxuICAgICAgICAgIGlmICgkdGFyZ2V0LmF0dHIoXCJkYXRhLWV2ZW50c1wiKSA9PT0gXCJzY3JvbGxcIiAmJiBtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwiZGF0YS1ldmVudHNcIikge1xuXHRcdCAgXHQkdGFyZ2V0LnRyaWdnZXJIYW5kbGVyKCdzY3JvbGxtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQsIHdpbmRvdy5wYWdlWU9mZnNldF0pO1xuXHRcdCAgfVxuXHRcdCAgaWYgKCR0YXJnZXQuYXR0cihcImRhdGEtZXZlbnRzXCIpID09PSBcInJlc2l6ZVwiICYmIG11dGF0aW9uUmVjb3Jkc0xpc3RbMF0uYXR0cmlidXRlTmFtZSA9PT0gXCJkYXRhLWV2ZW50c1wiKSB7XG5cdFx0ICBcdCR0YXJnZXQudHJpZ2dlckhhbmRsZXIoJ3Jlc2l6ZW1lLnpmLnRyaWdnZXInLCBbJHRhcmdldF0pO1xuXHRcdCAgIH1cblx0XHQgIGlmIChtdXRhdGlvblJlY29yZHNMaXN0WzBdLmF0dHJpYnV0ZU5hbWUgPT09IFwic3R5bGVcIikge1xuXHRcdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLmF0dHIoXCJkYXRhLWV2ZW50c1wiLFwibXV0YXRlXCIpO1xuXHRcdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcblx0XHQgIH1cblx0XHQgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJjaGlsZExpc3RcIjpcblx0XHQgICR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIikuYXR0cihcImRhdGEtZXZlbnRzXCIsXCJtdXRhdGVcIik7XG5cdFx0ICAkdGFyZ2V0LmNsb3Nlc3QoXCJbZGF0YS1tdXRhdGVdXCIpLnRyaWdnZXJIYW5kbGVyKCdtdXRhdGVtZS56Zi50cmlnZ2VyJywgWyR0YXJnZXQuY2xvc2VzdChcIltkYXRhLW11dGF0ZV1cIildKTtcbiAgICAgICAgICBicmVhaztcblxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgLy9ub3RoaW5nXG4gICAgICB9XG4gICAgfTtcblxuICAgIGlmIChub2Rlcy5sZW5ndGgpIHtcbiAgICAgIC8vZm9yIGVhY2ggZWxlbWVudCB0aGF0IG5lZWRzIHRvIGxpc3RlbiBmb3IgcmVzaXppbmcsIHNjcm9sbGluZywgb3IgbXV0YXRpb24gYWRkIGEgc2luZ2xlIG9ic2VydmVyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8PSBub2Rlcy5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgdmFyIGVsZW1lbnRPYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGxpc3RlbmluZ0VsZW1lbnRzTXV0YXRpb24pO1xuICAgICAgICBlbGVtZW50T2JzZXJ2ZXIub2JzZXJ2ZShub2Rlc1tpXSwgeyBhdHRyaWJ1dGVzOiB0cnVlLCBjaGlsZExpc3Q6IHRydWUsIGNoYXJhY3RlckRhdGE6IGZhbHNlLCBzdWJ0cmVlOiB0cnVlLCBhdHRyaWJ1dGVGaWx0ZXI6IFtcImRhdGEtZXZlbnRzXCIsIFwic3R5bGVcIl0gfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4vLyBbUEhdXG4vLyBGb3VuZGF0aW9uLkNoZWNrV2F0Y2hlcnMgPSBjaGVja1dhdGNoZXJzO1xuRm91bmRhdGlvbi5JSGVhcllvdSA9IGNoZWNrTGlzdGVuZXJzO1xuLy8gRm91bmRhdGlvbi5JU2VlWW91ID0gc2Nyb2xsTGlzdGVuZXI7XG4vLyBGb3VuZGF0aW9uLklGZWVsWW91ID0gY2xvc2VtZUxpc3RlbmVyO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogQWNjb3JkaW9uIG1vZHVsZS5cbiAqIEBtb2R1bGUgZm91bmRhdGlvbi5hY2NvcmRpb25cbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwua2V5Ym9hcmRcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwubW90aW9uXG4gKi9cblxuY2xhc3MgQWNjb3JkaW9uIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgYW4gYWNjb3JkaW9uLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIEFjY29yZGlvbiNpbml0XG4gICAqIEBwYXJhbSB7alF1ZXJ5fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0byBtYWtlIGludG8gYW4gYWNjb3JkaW9uLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIGEgcGxhaW4gb2JqZWN0IHdpdGggc2V0dGluZ3MgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucy5cbiAgICovXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLiRlbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLm9wdGlvbnMgPSAkLmV4dGVuZCh7fSwgQWNjb3JkaW9uLmRlZmF1bHRzLCB0aGlzLiRlbGVtZW50LmRhdGEoKSwgb3B0aW9ucyk7XG5cbiAgICB0aGlzLl9pbml0KCk7XG5cbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdBY2NvcmRpb24nKTtcbiAgICBGb3VuZGF0aW9uLktleWJvYXJkLnJlZ2lzdGVyKCdBY2NvcmRpb24nLCB7XG4gICAgICAnRU5URVInOiAndG9nZ2xlJyxcbiAgICAgICdTUEFDRSc6ICd0b2dnbGUnLFxuICAgICAgJ0FSUk9XX0RPV04nOiAnbmV4dCcsXG4gICAgICAnQVJST1dfVVAnOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIGFjY29yZGlvbiBieSBhbmltYXRpbmcgdGhlIHByZXNldCBhY3RpdmUgcGFuZShzKS5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHRoaXMuJGVsZW1lbnQuYXR0cigncm9sZScsICd0YWJsaXN0Jyk7XG4gICAgdGhpcy4kdGFicyA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJ1tkYXRhLWFjY29yZGlvbi1pdGVtXScpO1xuXG4gICAgdGhpcy4kdGFicy5lYWNoKGZ1bmN0aW9uKGlkeCwgZWwpIHtcbiAgICAgIHZhciAkZWwgPSAkKGVsKSxcbiAgICAgICAgICAkY29udGVudCA9ICRlbC5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyksXG4gICAgICAgICAgaWQgPSAkY29udGVudFswXS5pZCB8fCBGb3VuZGF0aW9uLkdldFlvRGlnaXRzKDYsICdhY2NvcmRpb24nKSxcbiAgICAgICAgICBsaW5rSWQgPSBlbC5pZCB8fCBgJHtpZH0tbGFiZWxgO1xuXG4gICAgICAkZWwuZmluZCgnYTpmaXJzdCcpLmF0dHIoe1xuICAgICAgICAnYXJpYS1jb250cm9scyc6IGlkLFxuICAgICAgICAncm9sZSc6ICd0YWInLFxuICAgICAgICAnaWQnOiBsaW5rSWQsXG4gICAgICAgICdhcmlhLWV4cGFuZGVkJzogZmFsc2UsXG4gICAgICAgICdhcmlhLXNlbGVjdGVkJzogZmFsc2VcbiAgICAgIH0pO1xuXG4gICAgICAkY29udGVudC5hdHRyKHsncm9sZSc6ICd0YWJwYW5lbCcsICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWQsICdhcmlhLWhpZGRlbic6IHRydWUsICdpZCc6IGlkfSk7XG4gICAgfSk7XG4gICAgdmFyICRpbml0QWN0aXZlID0gdGhpcy4kZWxlbWVudC5maW5kKCcuaXMtYWN0aXZlJykuY2hpbGRyZW4oJ1tkYXRhLXRhYi1jb250ZW50XScpO1xuICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IHRydWU7XG4gICAgaWYoJGluaXRBY3RpdmUubGVuZ3RoKXtcbiAgICAgIHRoaXMuZG93bigkaW5pdEFjdGl2ZSwgdGhpcy5maXJzdFRpbWVJbml0KTtcbiAgICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRoaXMuX2NoZWNrRGVlcExpbmsgPSAoKSA9PiB7XG4gICAgICB2YXIgYW5jaG9yID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAvL25lZWQgYSBoYXNoIGFuZCBhIHJlbGV2YW50IGFuY2hvciBpbiB0aGlzIHRhYnNldFxuICAgICAgaWYoYW5jaG9yLmxlbmd0aCkge1xuICAgICAgICB2YXIgJGxpbmsgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tocmVmJD1cIicrYW5jaG9yKydcIl0nKSxcbiAgICAgICAgJGFuY2hvciA9ICQoYW5jaG9yKTtcblxuICAgICAgICBpZiAoJGxpbmsubGVuZ3RoICYmICRhbmNob3IpIHtcbiAgICAgICAgICBpZiAoISRsaW5rLnBhcmVudCgnW2RhdGEtYWNjb3JkaW9uLWl0ZW1dJykuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICAgICAgICB0aGlzLmRvd24oJGFuY2hvciwgdGhpcy5maXJzdFRpbWVJbml0KTtcbiAgICAgICAgICAgIHRoaXMuZmlyc3RUaW1lSW5pdCA9IGZhbHNlO1xuICAgICAgICAgIH07XG5cbiAgICAgICAgICAvL3JvbGwgdXAgYSBsaXR0bGUgdG8gc2hvdyB0aGUgdGl0bGVzXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZSkge1xuICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgb2Zmc2V0ID0gX3RoaXMuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiBvZmZzZXQudG9wIH0sIF90aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgenBsdWdpbiBoYXMgZGVlcGxpbmtlZCBhdCBwYWdlbG9hZFxuICAgICAgICAgICAgKiBAZXZlbnQgQWNjb3JkaW9uI2RlZXBsaW5rXG4gICAgICAgICAgICAqL1xuICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZGVlcGxpbmsuemYuYWNjb3JkaW9uJywgWyRsaW5rLCAkYW5jaG9yXSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvL3VzZSBicm93c2VyIHRvIG9wZW4gYSB0YWIsIGlmIGl0IGV4aXN0cyBpbiB0aGlzIHRhYnNldFxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHRoaXMuX2NoZWNrRGVlcExpbmsoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIGFjY29yZGlvbi5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9ldmVudHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYnMuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyk7XG4gICAgICB2YXIgJHRhYkNvbnRlbnQgPSAkZWxlbS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJHRhYkNvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgICRlbGVtLmNoaWxkcmVuKCdhJykub2ZmKCdjbGljay56Zi5hY2NvcmRpb24ga2V5ZG93bi56Zi5hY2NvcmRpb24nKVxuICAgICAgICAgICAgICAgLm9uKCdjbGljay56Zi5hY2NvcmRpb24nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgIF90aGlzLnRvZ2dsZSgkdGFiQ29udGVudCk7XG4gICAgICAgIH0pLm9uKCdrZXlkb3duLnpmLmFjY29yZGlvbicsIGZ1bmN0aW9uKGUpe1xuICAgICAgICAgIEZvdW5kYXRpb24uS2V5Ym9hcmQuaGFuZGxlS2V5KGUsICdBY2NvcmRpb24nLCB7XG4gICAgICAgICAgICB0b2dnbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBfdGhpcy50b2dnbGUoJHRhYkNvbnRlbnQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICB2YXIgJGEgPSAkZWxlbS5uZXh0KCkuZmluZCgnYScpLmZvY3VzKCk7XG4gICAgICAgICAgICAgIGlmICghX3RoaXMub3B0aW9ucy5tdWx0aUV4cGFuZCkge1xuICAgICAgICAgICAgICAgICRhLnRyaWdnZXIoJ2NsaWNrLnpmLmFjY29yZGlvbicpXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHZhciAkYSA9ICRlbGVtLnByZXYoKS5maW5kKCdhJykuZm9jdXMoKTtcbiAgICAgICAgICAgICAgaWYgKCFfdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgJGEudHJpZ2dlcignY2xpY2suemYuYWNjb3JkaW9uJylcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGluaykge1xuICAgICAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBUb2dnbGVzIHRoZSBzZWxlY3RlZCBjb250ZW50IHBhbmUncyBvcGVuL2Nsb3NlIHN0YXRlLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIGpRdWVyeSBvYmplY3Qgb2YgdGhlIHBhbmUgdG8gdG9nZ2xlIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgdG9nZ2xlKCR0YXJnZXQpIHtcbiAgICBpZigkdGFyZ2V0LnBhcmVudCgpLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkge1xuICAgICAgdGhpcy51cCgkdGFyZ2V0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5kb3duKCR0YXJnZXQpO1xuICAgIH1cbiAgICAvL2VpdGhlciByZXBsYWNlIG9yIHVwZGF0ZSBicm93c2VyIGhpc3RvcnlcbiAgICBpZiAodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICB2YXIgYW5jaG9yID0gJHRhcmdldC5wcmV2KCdhJykuYXR0cignaHJlZicpO1xuXG4gICAgICBpZiAodGhpcy5vcHRpb25zLnVwZGF0ZUhpc3RvcnkpIHtcbiAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUoe30sICcnLCBhbmNob3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBPcGVucyB0aGUgYWNjb3JkaW9uIHRhYiBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBBY2NvcmRpb24gcGFuZSB0byBvcGVuIChgLmFjY29yZGlvbi1jb250ZW50YCkuXG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gZmlyc3RUaW1lIC0gZmxhZyB0byBkZXRlcm1pbmUgaWYgcmVmbG93IHNob3VsZCBoYXBwZW4uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZG93blxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRvd24oJHRhcmdldCwgZmlyc3RUaW1lKSB7XG4gICAgJHRhcmdldFxuICAgICAgLmF0dHIoJ2FyaWEtaGlkZGVuJywgZmFsc2UpXG4gICAgICAucGFyZW50KCdbZGF0YS10YWItY29udGVudF0nKVxuICAgICAgLmFkZEJhY2soKVxuICAgICAgLnBhcmVudCgpLmFkZENsYXNzKCdpcy1hY3RpdmUnKTtcblxuICAgIGlmICghdGhpcy5vcHRpb25zLm11bHRpRXhwYW5kICYmICFmaXJzdFRpbWUpIHtcbiAgICAgIHZhciAkY3VycmVudEFjdGl2ZSA9IHRoaXMuJGVsZW1lbnQuY2hpbGRyZW4oJy5pcy1hY3RpdmUnKS5jaGlsZHJlbignW2RhdGEtdGFiLWNvbnRlbnRdJyk7XG4gICAgICBpZiAoJGN1cnJlbnRBY3RpdmUubGVuZ3RoKSB7XG4gICAgICAgIHRoaXMudXAoJGN1cnJlbnRBY3RpdmUubm90KCR0YXJnZXQpKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkdGFyZ2V0LnNsaWRlRG93bih0aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgKCkgPT4ge1xuICAgICAgLyoqXG4gICAgICAgKiBGaXJlcyB3aGVuIHRoZSB0YWIgaXMgZG9uZSBvcGVuaW5nLlxuICAgICAgICogQGV2ZW50IEFjY29yZGlvbiNkb3duXG4gICAgICAgKi9cbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZG93bi56Zi5hY2NvcmRpb24nLCBbJHRhcmdldF0pO1xuICAgIH0pO1xuXG4gICAgJChgIyR7JHRhcmdldC5hdHRyKCdhcmlhLWxhYmVsbGVkYnknKX1gKS5hdHRyKHtcbiAgICAgICdhcmlhLWV4cGFuZGVkJzogdHJ1ZSxcbiAgICAgICdhcmlhLXNlbGVjdGVkJzogdHJ1ZVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIENsb3NlcyB0aGUgdGFiIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIEFjY29yZGlvbiB0YWIgdG8gY2xvc2UgKGAuYWNjb3JkaW9uLWNvbnRlbnRgKS5cbiAgICogQGZpcmVzIEFjY29yZGlvbiN1cFxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHVwKCR0YXJnZXQpIHtcbiAgICB2YXIgJGF1bnRzID0gJHRhcmdldC5wYXJlbnQoKS5zaWJsaW5ncygpLFxuICAgICAgICBfdGhpcyA9IHRoaXM7XG5cbiAgICBpZigoIXRoaXMub3B0aW9ucy5hbGxvd0FsbENsb3NlZCAmJiAhJGF1bnRzLmhhc0NsYXNzKCdpcy1hY3RpdmUnKSkgfHwgISR0YXJnZXQucGFyZW50KCkuaGFzQ2xhc3MoJ2lzLWFjdGl2ZScpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRm91bmRhdGlvbi5Nb3ZlKHRoaXMub3B0aW9ucy5zbGlkZVNwZWVkLCAkdGFyZ2V0LCBmdW5jdGlvbigpe1xuICAgICAgJHRhcmdldC5zbGlkZVVwKF90aGlzLm9wdGlvbnMuc2xpZGVTcGVlZCwgZnVuY3Rpb24gKCkge1xuICAgICAgICAvKipcbiAgICAgICAgICogRmlyZXMgd2hlbiB0aGUgdGFiIGlzIGRvbmUgY29sbGFwc2luZyB1cC5cbiAgICAgICAgICogQGV2ZW50IEFjY29yZGlvbiN1cFxuICAgICAgICAgKi9cbiAgICAgICAgX3RoaXMuJGVsZW1lbnQudHJpZ2dlcigndXAuemYuYWNjb3JkaW9uJywgWyR0YXJnZXRdKTtcbiAgICAgIH0pO1xuICAgIC8vIH0pO1xuXG4gICAgJHRhcmdldC5hdHRyKCdhcmlhLWhpZGRlbicsIHRydWUpXG4gICAgICAgICAgIC5wYXJlbnQoKS5yZW1vdmVDbGFzcygnaXMtYWN0aXZlJyk7XG5cbiAgICAkKGAjJHskdGFyZ2V0LmF0dHIoJ2FyaWEtbGFiZWxsZWRieScpfWApLmF0dHIoe1xuICAgICAnYXJpYS1leHBhbmRlZCc6IGZhbHNlLFxuICAgICAnYXJpYS1zZWxlY3RlZCc6IGZhbHNlXG4gICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBhbiBhY2NvcmRpb24uXG4gICAqIEBmaXJlcyBBY2NvcmRpb24jZGVzdHJveWVkXG4gICAqIEBmdW5jdGlvblxuICAgKi9cbiAgZGVzdHJveSgpIHtcbiAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ1tkYXRhLXRhYi1jb250ZW50XScpLnN0b3AodHJ1ZSkuc2xpZGVVcCgwKS5jc3MoJ2Rpc3BsYXknLCAnJyk7XG4gICAgdGhpcy4kZWxlbWVudC5maW5kKCdhJykub2ZmKCcuemYuYWNjb3JkaW9uJyk7XG4gICAgaWYodGhpcy5vcHRpb25zLmRlZXBMaW5rKSB7XG4gICAgICAkKHdpbmRvdykub2ZmKCdwb3BzdGF0ZScsIHRoaXMuX2NoZWNrRGVlcExpbmspO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG5BY2NvcmRpb24uZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbW91bnQgb2YgdGltZSB0byBhbmltYXRlIHRoZSBvcGVuaW5nIG9mIGFuIGFjY29yZGlvbiBwYW5lLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDI1MFxuICAgKi9cbiAgc2xpZGVTcGVlZDogMjUwLFxuICAvKipcbiAgICogQWxsb3cgdGhlIGFjY29yZGlvbiB0byBoYXZlIG11bHRpcGxlIG9wZW4gcGFuZXMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBtdWx0aUV4cGFuZDogZmFsc2UsXG4gIC8qKlxuICAgKiBBbGxvdyB0aGUgYWNjb3JkaW9uIHRvIGNsb3NlIGFsbCBwYW5lcy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGFsbG93QWxsQ2xvc2VkOiBmYWxzZSxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIHBhbmUgc3BlY2lmaWVkIGJ5IGhhc2ggYW5jaG9yXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGluazogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFkanVzdCB0aGUgZGVlcCBsaW5rIHNjcm9sbCB0byBtYWtlIHN1cmUgdGhlIHRvcCBvZiB0aGUgYWNjb3JkaW9uIHBhbmVsIGlzIHZpc2libGVcbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5rU211ZGdlOiBmYWxzZSxcblxuICAvKipcbiAgICogQW5pbWF0aW9uIHRpbWUgKG1zKSBmb3IgdGhlIGRlZXAgbGluayBhZGp1c3RtZW50XG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge251bWJlcn1cbiAgICogQGRlZmF1bHQgMzAwXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZURlbGF5OiAzMDAsXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSB0aGUgYnJvd3NlciBoaXN0b3J5IHdpdGggdGhlIG9wZW4gYWNjb3JkaW9uXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICB1cGRhdGVIaXN0b3J5OiBmYWxzZVxufTtcblxuLy8gV2luZG93IGV4cG9ydHNcbkZvdW5kYXRpb24ucGx1Z2luKEFjY29yZGlvbiwgJ0FjY29yZGlvbicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogSW50ZXJjaGFuZ2UgbW9kdWxlLlxuICogQG1vZHVsZSBmb3VuZGF0aW9uLmludGVyY2hhbmdlXG4gKiBAcmVxdWlyZXMgZm91bmRhdGlvbi51dGlsLm1lZGlhUXVlcnlcbiAqIEByZXF1aXJlcyBmb3VuZGF0aW9uLnV0aWwudGltZXJBbmRJbWFnZUxvYWRlclxuICovXG5cbmNsYXNzIEludGVyY2hhbmdlIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgSW50ZXJjaGFuZ2UuXG4gICAqIEBjbGFzc1xuICAgKiBAZmlyZXMgSW50ZXJjaGFuZ2UjaW5pdFxuICAgKiBAcGFyYW0ge09iamVjdH0gZWxlbWVudCAtIGpRdWVyeSBvYmplY3QgdG8gYWRkIHRoZSB0cmlnZ2VyIHRvLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIEludGVyY2hhbmdlLmRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICB0aGlzLnJ1bGVzID0gW107XG4gICAgdGhpcy5jdXJyZW50UGF0aCA9ICcnO1xuXG4gICAgdGhpcy5faW5pdCgpO1xuICAgIHRoaXMuX2V2ZW50cygpO1xuXG4gICAgRm91bmRhdGlvbi5yZWdpc3RlclBsdWdpbih0aGlzLCAnSW50ZXJjaGFuZ2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJbml0aWFsaXplcyB0aGUgSW50ZXJjaGFuZ2UgcGx1Z2luIGFuZCBjYWxscyBmdW5jdGlvbnMgdG8gZ2V0IGludGVyY2hhbmdlIGZ1bmN0aW9uaW5nIG9uIGxvYWQuXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2luaXQoKSB7XG4gICAgdGhpcy5fYWRkQnJlYWtwb2ludHMoKTtcbiAgICB0aGlzLl9nZW5lcmF0ZVJ1bGVzKCk7XG4gICAgdGhpcy5fcmVmbG93KCk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgZXZlbnRzIGZvciBJbnRlcmNoYW5nZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgICQod2luZG93KS5vbigncmVzaXplLnpmLmludGVyY2hhbmdlJywgRm91bmRhdGlvbi51dGlsLnRocm90dGxlKCgpID0+IHtcbiAgICAgIHRoaXMuX3JlZmxvdygpO1xuICAgIH0sIDUwKSk7XG4gIH1cblxuICAvKipcbiAgICogQ2FsbHMgbmVjZXNzYXJ5IGZ1bmN0aW9ucyB0byB1cGRhdGUgSW50ZXJjaGFuZ2UgdXBvbiBET00gY2hhbmdlXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3JlZmxvdygpIHtcbiAgICB2YXIgbWF0Y2g7XG5cbiAgICAvLyBJdGVyYXRlIHRocm91Z2ggZWFjaCBydWxlLCBidXQgb25seSBzYXZlIHRoZSBsYXN0IG1hdGNoXG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLnJ1bGVzKSB7XG4gICAgICBpZih0aGlzLnJ1bGVzLmhhc093blByb3BlcnR5KGkpKSB7XG4gICAgICAgIHZhciBydWxlID0gdGhpcy5ydWxlc1tpXTtcbiAgICAgICAgaWYgKHdpbmRvdy5tYXRjaE1lZGlhKHJ1bGUucXVlcnkpLm1hdGNoZXMpIHtcbiAgICAgICAgICBtYXRjaCA9IHJ1bGU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAobWF0Y2gpIHtcbiAgICAgIHRoaXMucmVwbGFjZShtYXRjaC5wYXRoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgRm91bmRhdGlvbiBicmVha3BvaW50cyBhbmQgYWRkcyB0aGVtIHRvIHRoZSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVMgb2JqZWN0LlxuICAgKiBAZnVuY3Rpb25cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9hZGRCcmVha3BvaW50cygpIHtcbiAgICBmb3IgKHZhciBpIGluIEZvdW5kYXRpb24uTWVkaWFRdWVyeS5xdWVyaWVzKSB7XG4gICAgICBpZiAoRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXMuaGFzT3duUHJvcGVydHkoaSkpIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gRm91bmRhdGlvbi5NZWRpYVF1ZXJ5LnF1ZXJpZXNbaV07XG4gICAgICAgIEludGVyY2hhbmdlLlNQRUNJQUxfUVVFUklFU1txdWVyeS5uYW1lXSA9IHF1ZXJ5LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgdGhlIEludGVyY2hhbmdlIGVsZW1lbnQgZm9yIHRoZSBwcm92aWRlZCBtZWRpYSBxdWVyeSArIGNvbnRlbnQgcGFpcmluZ3NcbiAgICogQGZ1bmN0aW9uXG4gICAqIEBwcml2YXRlXG4gICAqIEBwYXJhbSB7T2JqZWN0fSBlbGVtZW50IC0galF1ZXJ5IG9iamVjdCB0aGF0IGlzIGFuIEludGVyY2hhbmdlIGluc3RhbmNlXG4gICAqIEByZXR1cm5zIHtBcnJheX0gc2NlbmFyaW9zIC0gQXJyYXkgb2Ygb2JqZWN0cyB0aGF0IGhhdmUgJ21xJyBhbmQgJ3BhdGgnIGtleXMgd2l0aCBjb3JyZXNwb25kaW5nIGtleXNcbiAgICovXG4gIF9nZW5lcmF0ZVJ1bGVzKGVsZW1lbnQpIHtcbiAgICB2YXIgcnVsZXNMaXN0ID0gW107XG4gICAgdmFyIHJ1bGVzO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5ydWxlcykge1xuICAgICAgcnVsZXMgPSB0aGlzLm9wdGlvbnMucnVsZXM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcnVsZXMgPSB0aGlzLiRlbGVtZW50LmRhdGEoJ2ludGVyY2hhbmdlJyk7XG4gICAgfVxuICAgIFxuICAgIHJ1bGVzID0gIHR5cGVvZiBydWxlcyA9PT0gJ3N0cmluZycgPyBydWxlcy5tYXRjaCgvXFxbLio/XFxdL2cpIDogcnVsZXM7XG5cbiAgICBmb3IgKHZhciBpIGluIHJ1bGVzKSB7XG4gICAgICBpZihydWxlcy5oYXNPd25Qcm9wZXJ0eShpKSkge1xuICAgICAgICB2YXIgcnVsZSA9IHJ1bGVzW2ldLnNsaWNlKDEsIC0xKS5zcGxpdCgnLCAnKTtcbiAgICAgICAgdmFyIHBhdGggPSBydWxlLnNsaWNlKDAsIC0xKS5qb2luKCcnKTtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gcnVsZVtydWxlLmxlbmd0aCAtIDFdO1xuXG4gICAgICAgIGlmIChJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldKSB7XG4gICAgICAgICAgcXVlcnkgPSBJbnRlcmNoYW5nZS5TUEVDSUFMX1FVRVJJRVNbcXVlcnldO1xuICAgICAgICB9XG5cbiAgICAgICAgcnVsZXNMaXN0LnB1c2goe1xuICAgICAgICAgIHBhdGg6IHBhdGgsXG4gICAgICAgICAgcXVlcnk6IHF1ZXJ5XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMucnVsZXMgPSBydWxlc0xpc3Q7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlIHRoZSBgc3JjYCBwcm9wZXJ0eSBvZiBhbiBpbWFnZSwgb3IgY2hhbmdlIHRoZSBIVE1MIG9mIGEgY29udGFpbmVyLCB0byB0aGUgc3BlY2lmaWVkIHBhdGguXG4gICAqIEBmdW5jdGlvblxuICAgKiBAcGFyYW0ge1N0cmluZ30gcGF0aCAtIFBhdGggdG8gdGhlIGltYWdlIG9yIEhUTUwgcGFydGlhbC5cbiAgICogQGZpcmVzIEludGVyY2hhbmdlI3JlcGxhY2VkXG4gICAqL1xuICByZXBsYWNlKHBhdGgpIHtcbiAgICBpZiAodGhpcy5jdXJyZW50UGF0aCA9PT0gcGF0aCkgcmV0dXJuO1xuXG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgdHJpZ2dlciA9ICdyZXBsYWNlZC56Zi5pbnRlcmNoYW5nZSc7XG5cbiAgICAvLyBSZXBsYWNpbmcgaW1hZ2VzXG4gICAgaWYgKHRoaXMuJGVsZW1lbnRbMF0ubm9kZU5hbWUgPT09ICdJTUcnKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmF0dHIoJ3NyYycsIHBhdGgpLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pXG4gICAgICAudHJpZ2dlcih0cmlnZ2VyKTtcbiAgICB9XG4gICAgLy8gUmVwbGFjaW5nIGJhY2tncm91bmQgaW1hZ2VzXG4gICAgZWxzZSBpZiAocGF0aC5tYXRjaCgvXFwuKGdpZnxqcGd8anBlZ3xwbmd8c3ZnfHRpZmYpKFs/I10uKik/L2kpKSB7XG4gICAgICB0aGlzLiRlbGVtZW50LmNzcyh7ICdiYWNrZ3JvdW5kLWltYWdlJzogJ3VybCgnK3BhdGgrJyknIH0pXG4gICAgICAgICAgLnRyaWdnZXIodHJpZ2dlcik7XG4gICAgfVxuICAgIC8vIFJlcGxhY2luZyBIVE1MXG4gICAgZWxzZSB7XG4gICAgICAkLmdldChwYXRoLCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICBfdGhpcy4kZWxlbWVudC5odG1sKHJlc3BvbnNlKVxuICAgICAgICAgICAgIC50cmlnZ2VyKHRyaWdnZXIpO1xuICAgICAgICAkKHJlc3BvbnNlKS5mb3VuZGF0aW9uKCk7XG4gICAgICAgIF90aGlzLmN1cnJlbnRQYXRoID0gcGF0aDtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpcmVzIHdoZW4gY29udGVudCBpbiBhbiBJbnRlcmNoYW5nZSBlbGVtZW50IGlzIGRvbmUgYmVpbmcgbG9hZGVkLlxuICAgICAqIEBldmVudCBJbnRlcmNoYW5nZSNyZXBsYWNlZFxuICAgICAqL1xuICAgIC8vIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigncmVwbGFjZWQuemYuaW50ZXJjaGFuZ2UnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXN0cm95cyBhbiBpbnN0YW5jZSBvZiBpbnRlcmNoYW5nZS5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIC8vVE9ETyB0aGlzLlxuICB9XG59XG5cbi8qKlxuICogRGVmYXVsdCBzZXR0aW5ncyBmb3IgcGx1Z2luXG4gKi9cbkludGVyY2hhbmdlLmRlZmF1bHRzID0ge1xuICAvKipcbiAgICogUnVsZXMgdG8gYmUgYXBwbGllZCB0byBJbnRlcmNoYW5nZSBlbGVtZW50cy4gU2V0IHdpdGggdGhlIGBkYXRhLWludGVyY2hhbmdlYCBhcnJheSBub3RhdGlvbi5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7P2FycmF5fVxuICAgKiBAZGVmYXVsdCBudWxsXG4gICAqL1xuICBydWxlczogbnVsbFxufTtcblxuSW50ZXJjaGFuZ2UuU1BFQ0lBTF9RVUVSSUVTID0ge1xuICAnbGFuZHNjYXBlJzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBsYW5kc2NhcGUpJyxcbiAgJ3BvcnRyYWl0JzogJ3NjcmVlbiBhbmQgKG9yaWVudGF0aW9uOiBwb3J0cmFpdCknLFxuICAncmV0aW5hJzogJ29ubHkgc2NyZWVuIGFuZCAoLXdlYmtpdC1taW4tZGV2aWNlLXBpeGVsLXJhdGlvOiAyKSwgb25seSBzY3JlZW4gYW5kIChtaW4tLW1vei1kZXZpY2UtcGl4ZWwtcmF0aW86IDIpLCBvbmx5IHNjcmVlbiBhbmQgKC1vLW1pbi1kZXZpY2UtcGl4ZWwtcmF0aW86IDIvMSksIG9ubHkgc2NyZWVuIGFuZCAobWluLWRldmljZS1waXhlbC1yYXRpbzogMiksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDE5MmRwaSksIG9ubHkgc2NyZWVuIGFuZCAobWluLXJlc29sdXRpb246IDJkcHB4KSdcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihJbnRlcmNoYW5nZSwgJ0ludGVyY2hhbmdlJyk7XG5cbn0oalF1ZXJ5KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuIWZ1bmN0aW9uKCQpIHtcblxuLyoqXG4gKiBNYWdlbGxhbiBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24ubWFnZWxsYW5cbiAqL1xuXG5jbGFzcyBNYWdlbGxhbiB7XG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGluc3RhbmNlIG9mIE1hZ2VsbGFuLlxuICAgKiBAY2xhc3NcbiAgICogQGZpcmVzIE1hZ2VsbGFuI2luaXRcbiAgICogQHBhcmFtIHtPYmplY3R9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIGFkZCB0aGUgdHJpZ2dlciB0by5cbiAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgLSBPdmVycmlkZXMgdG8gdGhlIGRlZmF1bHQgcGx1Z2luIHNldHRpbmdzLlxuICAgKi9cbiAgY29uc3RydWN0b3IoZWxlbWVudCwgb3B0aW9ucykge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBlbGVtZW50O1xuICAgIHRoaXMub3B0aW9ucyAgPSAkLmV4dGVuZCh7fSwgTWFnZWxsYW4uZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICB0aGlzLmNhbGNQb2ludHMoKTtcblxuICAgIEZvdW5kYXRpb24ucmVnaXN0ZXJQbHVnaW4odGhpcywgJ01hZ2VsbGFuJyk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIE1hZ2VsbGFuIHBsdWdpbiBhbmQgY2FsbHMgZnVuY3Rpb25zIHRvIGdldCBlcXVhbGl6ZXIgZnVuY3Rpb25pbmcgb24gbG9hZC5cbiAgICogQHByaXZhdGVcbiAgICovXG4gIF9pbml0KCkge1xuICAgIHZhciBpZCA9IHRoaXMuJGVsZW1lbnRbMF0uaWQgfHwgRm91bmRhdGlvbi5HZXRZb0RpZ2l0cyg2LCAnbWFnZWxsYW4nKTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgIHRoaXMuJHRhcmdldHMgPSAkKCdbZGF0YS1tYWdlbGxhbi10YXJnZXRdJyk7XG4gICAgdGhpcy4kbGlua3MgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ2EnKTtcbiAgICB0aGlzLiRlbGVtZW50LmF0dHIoe1xuICAgICAgJ2RhdGEtcmVzaXplJzogaWQsXG4gICAgICAnZGF0YS1zY3JvbGwnOiBpZCxcbiAgICAgICdpZCc6IGlkXG4gICAgfSk7XG4gICAgdGhpcy4kYWN0aXZlID0gJCgpO1xuICAgIHRoaXMuc2Nyb2xsUG9zID0gcGFyc2VJbnQod2luZG93LnBhZ2VZT2Zmc2V0LCAxMCk7XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGVzIGFuIGFycmF5IG9mIHBpeGVsIHZhbHVlcyB0aGF0IGFyZSB0aGUgZGVtYXJjYXRpb24gbGluZXMgYmV0d2VlbiBsb2NhdGlvbnMgb24gdGhlIHBhZ2UuXG4gICAqIENhbiBiZSBpbnZva2VkIGlmIG5ldyBlbGVtZW50cyBhcmUgYWRkZWQgb3IgdGhlIHNpemUgb2YgYSBsb2NhdGlvbiBjaGFuZ2VzLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGNhbGNQb2ludHMoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcyxcbiAgICAgICAgYm9keSA9IGRvY3VtZW50LmJvZHksXG4gICAgICAgIGh0bWwgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7XG5cbiAgICB0aGlzLnBvaW50cyA9IFtdO1xuICAgIHRoaXMud2luSGVpZ2h0ID0gTWF0aC5yb3VuZChNYXRoLm1heCh3aW5kb3cuaW5uZXJIZWlnaHQsIGh0bWwuY2xpZW50SGVpZ2h0KSk7XG4gICAgdGhpcy5kb2NIZWlnaHQgPSBNYXRoLnJvdW5kKE1hdGgubWF4KGJvZHkuc2Nyb2xsSGVpZ2h0LCBib2R5Lm9mZnNldEhlaWdodCwgaHRtbC5jbGllbnRIZWlnaHQsIGh0bWwuc2Nyb2xsSGVpZ2h0LCBodG1sLm9mZnNldEhlaWdodCkpO1xuXG4gICAgdGhpcy4kdGFyZ2V0cy5lYWNoKGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJHRhciA9ICQodGhpcyksXG4gICAgICAgICAgcHQgPSBNYXRoLnJvdW5kKCR0YXIub2Zmc2V0KCkudG9wIC0gX3RoaXMub3B0aW9ucy50aHJlc2hvbGQpO1xuICAgICAgJHRhci50YXJnZXRQb2ludCA9IHB0O1xuICAgICAgX3RoaXMucG9pbnRzLnB1c2gocHQpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEluaXRpYWxpemVzIGV2ZW50cyBmb3IgTWFnZWxsYW4uXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHZhciBfdGhpcyA9IHRoaXMsXG4gICAgICAgICRib2R5ID0gJCgnaHRtbCwgYm9keScpLFxuICAgICAgICBvcHRzID0ge1xuICAgICAgICAgIGR1cmF0aW9uOiBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkR1cmF0aW9uLFxuICAgICAgICAgIGVhc2luZzogICBfdGhpcy5vcHRpb25zLmFuaW1hdGlvbkVhc2luZ1xuICAgICAgICB9O1xuICAgICQod2luZG93KS5vbmUoJ2xvYWQnLCBmdW5jdGlvbigpe1xuICAgICAgaWYoX3RoaXMub3B0aW9ucy5kZWVwTGlua2luZyl7XG4gICAgICAgIGlmKGxvY2F0aW9uLmhhc2gpe1xuICAgICAgICAgIF90aGlzLnNjcm9sbFRvTG9jKGxvY2F0aW9uLmhhc2gpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBfdGhpcy5jYWxjUG9pbnRzKCk7XG4gICAgICBfdGhpcy5fdXBkYXRlQWN0aXZlKCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLiRlbGVtZW50Lm9uKHtcbiAgICAgICdyZXNpemVtZS56Zi50cmlnZ2VyJzogdGhpcy5yZWZsb3cuYmluZCh0aGlzKSxcbiAgICAgICdzY3JvbGxtZS56Zi50cmlnZ2VyJzogdGhpcy5fdXBkYXRlQWN0aXZlLmJpbmQodGhpcylcbiAgICB9KS5vbignY2xpY2suemYubWFnZWxsYW4nLCAnYVtocmVmXj1cIiNcIl0nLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgdmFyIGFycml2YWwgICA9IHRoaXMuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG4gICAgICAgIF90aGlzLnNjcm9sbFRvTG9jKGFycml2YWwpO1xuICAgICAgfSk7XG4gICAgJCh3aW5kb3cpLm9uKCdwb3BzdGF0ZScsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmKF90aGlzLm9wdGlvbnMuZGVlcExpbmtpbmcpIHtcbiAgICAgICAgX3RoaXMuc2Nyb2xsVG9Mb2Mod2luZG93LmxvY2F0aW9uLmhhc2gpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEZ1bmN0aW9uIHRvIHNjcm9sbCB0byBhIGdpdmVuIGxvY2F0aW9uIG9uIHRoZSBwYWdlLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbG9jIC0gYSBwcm9wZXJseSBmb3JtYXR0ZWQgalF1ZXJ5IGlkIHNlbGVjdG9yLiBFeGFtcGxlOiAnI2ZvbydcbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBzY3JvbGxUb0xvYyhsb2MpIHtcbiAgICAvLyBEbyBub3RoaW5nIGlmIHRhcmdldCBkb2VzIG5vdCBleGlzdCB0byBwcmV2ZW50IGVycm9yc1xuICAgIGlmICghJChsb2MpLmxlbmd0aCkge3JldHVybiBmYWxzZTt9XG4gICAgdGhpcy5faW5UcmFuc2l0aW9uID0gdHJ1ZTtcbiAgICB2YXIgX3RoaXMgPSB0aGlzLFxuICAgICAgICBzY3JvbGxQb3MgPSBNYXRoLnJvdW5kKCQobG9jKS5vZmZzZXQoKS50b3AgLSB0aGlzLm9wdGlvbnMudGhyZXNob2xkIC8gMiAtIHRoaXMub3B0aW9ucy5iYXJPZmZzZXQpO1xuXG4gICAgJCgnaHRtbCwgYm9keScpLnN0b3AodHJ1ZSkuYW5pbWF0ZShcbiAgICAgIHsgc2Nyb2xsVG9wOiBzY3JvbGxQb3MgfSxcbiAgICAgIHRoaXMub3B0aW9ucy5hbmltYXRpb25EdXJhdGlvbixcbiAgICAgIHRoaXMub3B0aW9ucy5hbmltYXRpb25FYXNpbmcsXG4gICAgICBmdW5jdGlvbigpIHtfdGhpcy5faW5UcmFuc2l0aW9uID0gZmFsc2U7IF90aGlzLl91cGRhdGVBY3RpdmUoKX1cbiAgICApO1xuICB9XG5cbiAgLyoqXG4gICAqIENhbGxzIG5lY2Vzc2FyeSBmdW5jdGlvbnMgdG8gdXBkYXRlIE1hZ2VsbGFuIHVwb24gRE9NIGNoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHJlZmxvdygpIHtcbiAgICB0aGlzLmNhbGNQb2ludHMoKTtcbiAgICB0aGlzLl91cGRhdGVBY3RpdmUoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSB2aXNpYmlsaXR5IG9mIGFuIGFjdGl2ZSBsb2NhdGlvbiBsaW5rLCBhbmQgdXBkYXRlcyB0aGUgdXJsIGhhc2ggZm9yIHRoZSBwYWdlLCBpZiBkZWVwTGlua2luZyBlbmFibGVkLlxuICAgKiBAcHJpdmF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICogQGZpcmVzIE1hZ2VsbGFuI3VwZGF0ZVxuICAgKi9cbiAgX3VwZGF0ZUFjdGl2ZSgvKmV2dCwgZWxlbSwgc2Nyb2xsUG9zKi8pIHtcbiAgICBpZih0aGlzLl9pblRyYW5zaXRpb24pIHtyZXR1cm47fVxuICAgIHZhciB3aW5Qb3MgPSAvKnNjcm9sbFBvcyB8fCovIHBhcnNlSW50KHdpbmRvdy5wYWdlWU9mZnNldCwgMTApLFxuICAgICAgICBjdXJJZHg7XG5cbiAgICBpZih3aW5Qb3MgKyB0aGlzLndpbkhlaWdodCA9PT0gdGhpcy5kb2NIZWlnaHQpeyBjdXJJZHggPSB0aGlzLnBvaW50cy5sZW5ndGggLSAxOyB9XG4gICAgZWxzZSBpZih3aW5Qb3MgPCB0aGlzLnBvaW50c1swXSl7IGN1cklkeCA9IHVuZGVmaW5lZDsgfVxuICAgIGVsc2V7XG4gICAgICB2YXIgaXNEb3duID0gdGhpcy5zY3JvbGxQb3MgPCB3aW5Qb3MsXG4gICAgICAgICAgX3RoaXMgPSB0aGlzLFxuICAgICAgICAgIGN1clZpc2libGUgPSB0aGlzLnBvaW50cy5maWx0ZXIoZnVuY3Rpb24ocCwgaSl7XG4gICAgICAgICAgICByZXR1cm4gaXNEb3duID8gcCAtIF90aGlzLm9wdGlvbnMuYmFyT2Zmc2V0IDw9IHdpblBvcyA6IHAgLSBfdGhpcy5vcHRpb25zLmJhck9mZnNldCAtIF90aGlzLm9wdGlvbnMudGhyZXNob2xkIDw9IHdpblBvcztcbiAgICAgICAgICB9KTtcbiAgICAgIGN1cklkeCA9IGN1clZpc2libGUubGVuZ3RoID8gY3VyVmlzaWJsZS5sZW5ndGggLSAxIDogMDtcbiAgICB9XG5cbiAgICB0aGlzLiRhY3RpdmUucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcbiAgICB0aGlzLiRhY3RpdmUgPSB0aGlzLiRsaW5rcy5maWx0ZXIoJ1tocmVmPVwiIycgKyB0aGlzLiR0YXJnZXRzLmVxKGN1cklkeCkuZGF0YSgnbWFnZWxsYW4tdGFyZ2V0JykgKyAnXCJdJykuYWRkQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcblxuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGlua2luZyl7XG4gICAgICB2YXIgaGFzaCA9IFwiXCI7XG4gICAgICBpZihjdXJJZHggIT0gdW5kZWZpbmVkKXtcbiAgICAgICAgaGFzaCA9IHRoaXMuJGFjdGl2ZVswXS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgIH1cbiAgICAgIGlmKGhhc2ggIT09IHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgIGlmKHdpbmRvdy5oaXN0b3J5LnB1c2hTdGF0ZSl7XG4gICAgICAgICAgd2luZG93Lmhpc3RvcnkucHVzaFN0YXRlKG51bGwsIG51bGwsIGhhc2gpO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaGFzaCA9IGhhc2g7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnNjcm9sbFBvcyA9IHdpblBvcztcbiAgICAvKipcbiAgICAgKiBGaXJlcyB3aGVuIG1hZ2VsbGFuIGlzIGZpbmlzaGVkIHVwZGF0aW5nIHRvIHRoZSBuZXcgYWN0aXZlIGVsZW1lbnQuXG4gICAgICogQGV2ZW50IE1hZ2VsbGFuI3VwZGF0ZVxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcigndXBkYXRlLnpmLm1hZ2VsbGFuJywgW3RoaXMuJGFjdGl2ZV0pO1xuICB9XG5cbiAgLyoqXG4gICAqIERlc3Ryb3lzIGFuIGluc3RhbmNlIG9mIE1hZ2VsbGFuIGFuZCByZXNldHMgdGhlIHVybCBvZiB0aGUgd2luZG93LlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIGRlc3Ryb3koKSB7XG4gICAgdGhpcy4kZWxlbWVudC5vZmYoJy56Zi50cmlnZ2VyIC56Zi5tYWdlbGxhbicpXG4gICAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMuYWN0aXZlQ2xhc3N9YCkucmVtb3ZlQ2xhc3ModGhpcy5vcHRpb25zLmFjdGl2ZUNsYXNzKTtcblxuICAgIGlmKHRoaXMub3B0aW9ucy5kZWVwTGlua2luZyl7XG4gICAgICB2YXIgaGFzaCA9IHRoaXMuJGFjdGl2ZVswXS5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoaGFzaCwgJycpO1xuICAgIH1cblxuICAgIEZvdW5kYXRpb24udW5yZWdpc3RlclBsdWdpbih0aGlzKTtcbiAgfVxufVxuXG4vKipcbiAqIERlZmF1bHQgc2V0dGluZ3MgZm9yIHBsdWdpblxuICovXG5NYWdlbGxhbi5kZWZhdWx0cyA9IHtcbiAgLyoqXG4gICAqIEFtb3VudCBvZiB0aW1lLCBpbiBtcywgdGhlIGFuaW1hdGVkIHNjcm9sbGluZyBzaG91bGQgdGFrZSBiZXR3ZWVuIGxvY2F0aW9ucy5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7bnVtYmVyfVxuICAgKiBAZGVmYXVsdCA1MDBcbiAgICovXG4gIGFuaW1hdGlvbkR1cmF0aW9uOiA1MDAsXG4gIC8qKlxuICAgKiBBbmltYXRpb24gc3R5bGUgdG8gdXNlIHdoZW4gc2Nyb2xsaW5nIGJldHdlZW4gbG9jYXRpb25zLiBDYW4gYmUgYCdzd2luZydgIG9yIGAnbGluZWFyJ2AuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2xpbmVhcidcbiAgICogQHNlZSB7QGxpbmsgaHR0cHM6Ly9hcGkuanF1ZXJ5LmNvbS9hbmltYXRlfEpxdWVyeSBhbmltYXRlfVxuICAgKi9cbiAgYW5pbWF0aW9uRWFzaW5nOiAnbGluZWFyJyxcbiAgLyoqXG4gICAqIE51bWJlciBvZiBwaXhlbHMgdG8gdXNlIGFzIGEgbWFya2VyIGZvciBsb2NhdGlvbiBjaGFuZ2VzLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDUwXG4gICAqL1xuICB0aHJlc2hvbGQ6IDUwLFxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byB0aGUgYWN0aXZlIGxvY2F0aW9ucyBsaW5rIG9uIHRoZSBtYWdlbGxhbiBjb250YWluZXIuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ2FjdGl2ZSdcbiAgICovXG4gIGFjdGl2ZUNsYXNzOiAnYWN0aXZlJyxcbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgc2NyaXB0IHRvIG1hbmlwdWxhdGUgdGhlIHVybCBvZiB0aGUgY3VycmVudCBwYWdlLCBhbmQgaWYgc3VwcG9ydGVkLCBhbHRlciB0aGUgaGlzdG9yeS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGRlZXBMaW5raW5nOiBmYWxzZSxcbiAgLyoqXG4gICAqIE51bWJlciBvZiBwaXhlbHMgdG8gb2Zmc2V0IHRoZSBzY3JvbGwgb2YgdGhlIHBhZ2Ugb24gaXRlbSBjbGljayBpZiB1c2luZyBhIHN0aWNreSBuYXYgYmFyLlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDBcbiAgICovXG4gIGJhck9mZnNldDogMFxufVxuXG4vLyBXaW5kb3cgZXhwb3J0c1xuRm91bmRhdGlvbi5wbHVnaW4oTWFnZWxsYW4sICdNYWdlbGxhbicpO1xuXG59KGpRdWVyeSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbiFmdW5jdGlvbigkKSB7XG5cbi8qKlxuICogVGFicyBtb2R1bGUuXG4gKiBAbW9kdWxlIGZvdW5kYXRpb24udGFic1xuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC5rZXlib2FyZFxuICogQHJlcXVpcmVzIGZvdW5kYXRpb24udXRpbC50aW1lckFuZEltYWdlTG9hZGVyIGlmIHRhYnMgY29udGFpbiBpbWFnZXNcbiAqL1xuXG5jbGFzcyBUYWJzIHtcbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2Ugb2YgdGFicy5cbiAgICogQGNsYXNzXG4gICAqIEBmaXJlcyBUYWJzI2luaXRcbiAgICogQHBhcmFtIHtqUXVlcnl9IGVsZW1lbnQgLSBqUXVlcnkgb2JqZWN0IHRvIG1ha2UgaW50byB0YWJzLlxuICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucyAtIE92ZXJyaWRlcyB0byB0aGUgZGVmYXVsdCBwbHVnaW4gc2V0dGluZ3MuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy4kZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5vcHRpb25zID0gJC5leHRlbmQoe30sIFRhYnMuZGVmYXVsdHMsIHRoaXMuJGVsZW1lbnQuZGF0YSgpLCBvcHRpb25zKTtcblxuICAgIHRoaXMuX2luaXQoKTtcbiAgICBGb3VuZGF0aW9uLnJlZ2lzdGVyUGx1Z2luKHRoaXMsICdUYWJzJyk7XG4gICAgRm91bmRhdGlvbi5LZXlib2FyZC5yZWdpc3RlcignVGFicycsIHtcbiAgICAgICdFTlRFUic6ICdvcGVuJyxcbiAgICAgICdTUEFDRSc6ICdvcGVuJyxcbiAgICAgICdBUlJPV19SSUdIVCc6ICduZXh0JyxcbiAgICAgICdBUlJPV19VUCc6ICdwcmV2aW91cycsXG4gICAgICAnQVJST1dfRE9XTic6ICduZXh0JyxcbiAgICAgICdBUlJPV19MRUZUJzogJ3ByZXZpb3VzJ1xuICAgICAgLy8gJ1RBQic6ICduZXh0JyxcbiAgICAgIC8vICdTSElGVF9UQUInOiAncHJldmlvdXMnXG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSW5pdGlhbGl6ZXMgdGhlIHRhYnMgYnkgc2hvd2luZyBhbmQgZm9jdXNpbmcgKGlmIGF1dG9Gb2N1cz10cnVlKSB0aGUgcHJlc2V0IGFjdGl2ZSB0YWIuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfaW5pdCgpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kZWxlbWVudC5hdHRyKHsncm9sZSc6ICd0YWJsaXN0J30pO1xuICAgIHRoaXMuJHRhYlRpdGxlcyA9IHRoaXMuJGVsZW1lbnQuZmluZChgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gKTtcbiAgICB0aGlzLiR0YWJDb250ZW50ID0gJChgW2RhdGEtdGFicy1jb250ZW50PVwiJHt0aGlzLiRlbGVtZW50WzBdLmlkfVwiXWApO1xuXG4gICAgdGhpcy4kdGFiVGl0bGVzLmVhY2goZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkZWxlbSA9ICQodGhpcyksXG4gICAgICAgICAgJGxpbmsgPSAkZWxlbS5maW5kKCdhJyksXG4gICAgICAgICAgaXNBY3RpdmUgPSAkZWxlbS5oYXNDbGFzcyhgJHtfdGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSxcbiAgICAgICAgICBoYXNoID0gJGxpbmtbMF0uaGFzaC5zbGljZSgxKSxcbiAgICAgICAgICBsaW5rSWQgPSAkbGlua1swXS5pZCA/ICRsaW5rWzBdLmlkIDogYCR7aGFzaH0tbGFiZWxgLFxuICAgICAgICAgICR0YWJDb250ZW50ID0gJChgIyR7aGFzaH1gKTtcblxuICAgICAgJGVsZW0uYXR0cih7J3JvbGUnOiAncHJlc2VudGF0aW9uJ30pO1xuXG4gICAgICAkbGluay5hdHRyKHtcbiAgICAgICAgJ3JvbGUnOiAndGFiJyxcbiAgICAgICAgJ2FyaWEtY29udHJvbHMnOiBoYXNoLFxuICAgICAgICAnYXJpYS1zZWxlY3RlZCc6IGlzQWN0aXZlLFxuICAgICAgICAnaWQnOiBsaW5rSWRcbiAgICAgIH0pO1xuXG4gICAgICAkdGFiQ29udGVudC5hdHRyKHtcbiAgICAgICAgJ3JvbGUnOiAndGFicGFuZWwnLFxuICAgICAgICAnYXJpYS1oaWRkZW4nOiAhaXNBY3RpdmUsXG4gICAgICAgICdhcmlhLWxhYmVsbGVkYnknOiBsaW5rSWRcbiAgICAgIH0pO1xuXG4gICAgICBpZihpc0FjdGl2ZSAmJiBfdGhpcy5vcHRpb25zLmF1dG9Gb2N1cyl7XG4gICAgICAgICQod2luZG93KS5sb2FkKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQoJ2h0bWwsIGJvZHknKS5hbmltYXRlKHsgc2Nyb2xsVG9wOiAkZWxlbS5vZmZzZXQoKS50b3AgfSwgX3RoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZURlbGF5LCAoKSA9PiB7XG4gICAgICAgICAgICAkbGluay5mb2N1cygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICBpZih0aGlzLm9wdGlvbnMubWF0Y2hIZWlnaHQpIHtcbiAgICAgIHZhciAkaW1hZ2VzID0gdGhpcy4kdGFiQ29udGVudC5maW5kKCdpbWcnKTtcblxuICAgICAgaWYgKCRpbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgIEZvdW5kYXRpb24ub25JbWFnZXNMb2FkZWQoJGltYWdlcywgdGhpcy5fc2V0SGVpZ2h0LmJpbmQodGhpcykpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fc2V0SGVpZ2h0KCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgIC8vY3VycmVudCBjb250ZXh0LWJvdW5kIGZ1bmN0aW9uIHRvIG9wZW4gdGFicyBvbiBwYWdlIGxvYWQgb3IgaGlzdG9yeSBwb3BzdGF0ZVxuICAgIHRoaXMuX2NoZWNrRGVlcExpbmsgPSAoKSA9PiB7XG4gICAgICB2YXIgYW5jaG9yID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgICAvL25lZWQgYSBoYXNoIGFuZCBhIHJlbGV2YW50IGFuY2hvciBpbiB0aGlzIHRhYnNldFxuICAgICAgaWYoYW5jaG9yLmxlbmd0aCkge1xuICAgICAgICB2YXIgJGxpbmsgPSB0aGlzLiRlbGVtZW50LmZpbmQoJ1tocmVmJD1cIicrYW5jaG9yKydcIl0nKTtcbiAgICAgICAgaWYgKCRsaW5rLmxlbmd0aCkge1xuICAgICAgICAgIHRoaXMuc2VsZWN0VGFiKCQoYW5jaG9yKSwgdHJ1ZSk7XG5cbiAgICAgICAgICAvL3JvbGwgdXAgYSBsaXR0bGUgdG8gc2hvdyB0aGUgdGl0bGVzXG4gICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGlua1NtdWRnZSkge1xuICAgICAgICAgICAgdmFyIG9mZnNldCA9IHRoaXMuJGVsZW1lbnQub2Zmc2V0KCk7XG4gICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7IHNjcm9sbFRvcDogb2Zmc2V0LnRvcCB9LCB0aGlzLm9wdGlvbnMuZGVlcExpbmtTbXVkZ2VEZWxheSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICAqIEZpcmVzIHdoZW4gdGhlIHpwbHVnaW4gaGFzIGRlZXBsaW5rZWQgYXQgcGFnZWxvYWRcbiAgICAgICAgICAgICogQGV2ZW50IFRhYnMjZGVlcGxpbmtcbiAgICAgICAgICAgICovXG4gICAgICAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignZGVlcGxpbmsuemYudGFicycsIFskbGluaywgJChhbmNob3IpXSk7XG4gICAgICAgICB9XG4gICAgICAgfVxuICAgICB9XG5cbiAgICAvL3VzZSBicm93c2VyIHRvIG9wZW4gYSB0YWIsIGlmIGl0IGV4aXN0cyBpbiB0aGlzIHRhYnNldFxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgIHRoaXMuX2NoZWNrRGVlcExpbmsoKTtcbiAgICB9XG5cbiAgICB0aGlzLl9ldmVudHMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGV2ZW50IGhhbmRsZXJzIGZvciBpdGVtcyB3aXRoaW4gdGhlIHRhYnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBfZXZlbnRzKCkge1xuICAgIHRoaXMuX2FkZEtleUhhbmRsZXIoKTtcbiAgICB0aGlzLl9hZGRDbGlja0hhbmRsZXIoKTtcbiAgICB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIgPSBudWxsO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyID0gdGhpcy5fc2V0SGVpZ2h0LmJpbmQodGhpcyk7XG5cbiAgICAgICQod2luZG93KS5vbignY2hhbmdlZC56Zi5tZWRpYXF1ZXJ5JywgdGhpcy5fc2V0SGVpZ2h0TXFIYW5kbGVyKTtcbiAgICB9XG5cbiAgICBpZih0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vbigncG9wc3RhdGUnLCB0aGlzLl9jaGVja0RlZXBMaW5rKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBjbGljayBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZENsaWNrSGFuZGxlcigpIHtcbiAgICB2YXIgX3RoaXMgPSB0aGlzO1xuXG4gICAgdGhpcy4kZWxlbWVudFxuICAgICAgLm9mZignY2xpY2suemYudGFicycpXG4gICAgICAub24oJ2NsaWNrLnpmLnRhYnMnLCBgLiR7dGhpcy5vcHRpb25zLmxpbmtDbGFzc31gLCBmdW5jdGlvbihlKXtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCQodGhpcykpO1xuICAgICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkcyBrZXlib2FyZCBldmVudCBoYW5kbGVycyBmb3IgaXRlbXMgd2l0aGluIHRoZSB0YWJzLlxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX2FkZEtleUhhbmRsZXIoKSB7XG4gICAgdmFyIF90aGlzID0gdGhpcztcblxuICAgIHRoaXMuJHRhYlRpdGxlcy5vZmYoJ2tleWRvd24uemYudGFicycpLm9uKCdrZXlkb3duLnpmLnRhYnMnLCBmdW5jdGlvbihlKXtcbiAgICAgIGlmIChlLndoaWNoID09PSA5KSByZXR1cm47XG5cblxuICAgICAgdmFyICRlbGVtZW50ID0gJCh0aGlzKSxcbiAgICAgICAgJGVsZW1lbnRzID0gJGVsZW1lbnQucGFyZW50KCd1bCcpLmNoaWxkcmVuKCdsaScpLFxuICAgICAgICAkcHJldkVsZW1lbnQsXG4gICAgICAgICRuZXh0RWxlbWVudDtcblxuICAgICAgJGVsZW1lbnRzLmVhY2goZnVuY3Rpb24oaSkge1xuICAgICAgICBpZiAoJCh0aGlzKS5pcygkZWxlbWVudCkpIHtcbiAgICAgICAgICBpZiAoX3RoaXMub3B0aW9ucy53cmFwT25LZXlzKSB7XG4gICAgICAgICAgICAkcHJldkVsZW1lbnQgPSBpID09PSAwID8gJGVsZW1lbnRzLmxhc3QoKSA6ICRlbGVtZW50cy5lcShpLTEpO1xuICAgICAgICAgICAgJG5leHRFbGVtZW50ID0gaSA9PT0gJGVsZW1lbnRzLmxlbmd0aCAtMSA/ICRlbGVtZW50cy5maXJzdCgpIDogJGVsZW1lbnRzLmVxKGkrMSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRwcmV2RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1heCgwLCBpLTEpKTtcbiAgICAgICAgICAgICRuZXh0RWxlbWVudCA9ICRlbGVtZW50cy5lcShNYXRoLm1pbihpKzEsICRlbGVtZW50cy5sZW5ndGgtMSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBoYW5kbGUga2V5Ym9hcmQgZXZlbnQgd2l0aCBrZXlib2FyZCB1dGlsXG4gICAgICBGb3VuZGF0aW9uLktleWJvYXJkLmhhbmRsZUtleShlLCAnVGFicycsIHtcbiAgICAgICAgb3BlbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJGVsZW1lbnQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKS5mb2N1cygpO1xuICAgICAgICAgIF90aGlzLl9oYW5kbGVUYWJDaGFuZ2UoJGVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBwcmV2aW91czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHByZXZFbGVtZW50LmZpbmQoJ1tyb2xlPVwidGFiXCJdJykuZm9jdXMoKTtcbiAgICAgICAgICBfdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCRwcmV2RWxlbWVudCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRuZXh0RWxlbWVudC5maW5kKCdbcm9sZT1cInRhYlwiXScpLmZvY3VzKCk7XG4gICAgICAgICAgX3RoaXMuX2hhbmRsZVRhYkNoYW5nZSgkbmV4dEVsZW1lbnQpO1xuICAgICAgICB9LFxuICAgICAgICBoYW5kbGVkOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIHRhYiBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLiBDb2xsYXBzZXMgYWN0aXZlIHRhYi5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gb3Blbi5cbiAgICogQHBhcmFtIHtib29sZWFufSBoaXN0b3J5SGFuZGxlZCAtIGJyb3dzZXIgaGFzIGFscmVhZHkgaGFuZGxlZCBhIGhpc3RvcnkgdXBkYXRlXG4gICAqIEBmaXJlcyBUYWJzI2NoYW5nZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9oYW5kbGVUYWJDaGFuZ2UoJHRhcmdldCwgaGlzdG9yeUhhbmRsZWQpIHtcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGZvciBhY3RpdmUgY2xhc3Mgb24gdGFyZ2V0LiBDb2xsYXBzZSBpZiBleGlzdHMuXG4gICAgICovXG4gICAgaWYgKCR0YXJnZXQuaGFzQ2xhc3MoYCR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSkge1xuICAgICAgICBpZih0aGlzLm9wdGlvbnMuYWN0aXZlQ29sbGFwc2UpIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbGxhcHNlVGFiKCR0YXJnZXQpO1xuXG4gICAgICAgICAgIC8qKlxuICAgICAgICAgICAgKiBGaXJlcyB3aGVuIHRoZSB6cGx1Z2luIGhhcyBzdWNjZXNzZnVsbHkgY29sbGFwc2VkIHRhYnMuXG4gICAgICAgICAgICAqIEBldmVudCBUYWJzI2NvbGxhcHNlXG4gICAgICAgICAgICAqL1xuICAgICAgICAgICAgdGhpcy4kZWxlbWVudC50cmlnZ2VyKCdjb2xsYXBzZS56Zi50YWJzJywgWyR0YXJnZXRdKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyICRvbGRUYWIgPSB0aGlzLiRlbGVtZW50LlxuICAgICAgICAgIGZpbmQoYC4ke3RoaXMub3B0aW9ucy5saW5rQ2xhc3N9LiR7dGhpcy5vcHRpb25zLmxpbmtBY3RpdmVDbGFzc31gKSxcbiAgICAgICAgICAkdGFiTGluayA9ICR0YXJnZXQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKSxcbiAgICAgICAgICBoYXNoID0gJHRhYkxpbmtbMF0uaGFzaCxcbiAgICAgICAgICAkdGFyZ2V0Q29udGVudCA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZChoYXNoKTtcblxuICAgIC8vY2xvc2Ugb2xkIHRhYlxuICAgIHRoaXMuX2NvbGxhcHNlVGFiKCRvbGRUYWIpO1xuXG4gICAgLy9vcGVuIG5ldyB0YWJcbiAgICB0aGlzLl9vcGVuVGFiKCR0YXJnZXQpO1xuXG4gICAgLy9laXRoZXIgcmVwbGFjZSBvciB1cGRhdGUgYnJvd3NlciBoaXN0b3J5XG4gICAgaWYgKHRoaXMub3B0aW9ucy5kZWVwTGluayAmJiAhaGlzdG9yeUhhbmRsZWQpIHtcbiAgICAgIHZhciBhbmNob3IgPSAkdGFyZ2V0LmZpbmQoJ2EnKS5hdHRyKCdocmVmJyk7XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMudXBkYXRlSGlzdG9yeSkge1xuICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZSh7fSwgJycsIGFuY2hvcik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmlyZXMgd2hlbiB0aGUgcGx1Z2luIGhhcyBzdWNjZXNzZnVsbHkgY2hhbmdlZCB0YWJzLlxuICAgICAqIEBldmVudCBUYWJzI2NoYW5nZVxuICAgICAqL1xuICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlcignY2hhbmdlLnpmLnRhYnMnLCBbJHRhcmdldCwgJHRhcmdldENvbnRlbnRdKTtcblxuICAgIC8vZmlyZSB0byBjaGlsZHJlbiBhIG11dGF0aW9uIGV2ZW50XG4gICAgJHRhcmdldENvbnRlbnQuZmluZChcIltkYXRhLW11dGF0ZV1cIikudHJpZ2dlcihcIm11dGF0ZW1lLnpmLnRyaWdnZXJcIik7XG4gIH1cblxuICAvKipcbiAgICogT3BlbnMgdGhlIHRhYiBgJHRhcmdldENvbnRlbnRgIGRlZmluZWQgYnkgYCR0YXJnZXRgLlxuICAgKiBAcGFyYW0ge2pRdWVyeX0gJHRhcmdldCAtIFRhYiB0byBPcGVuLlxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIF9vcGVuVGFiKCR0YXJnZXQpIHtcbiAgICAgIHZhciAkdGFiTGluayA9ICR0YXJnZXQuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKSxcbiAgICAgICAgICBoYXNoID0gJHRhYkxpbmtbMF0uaGFzaCxcbiAgICAgICAgICAkdGFyZ2V0Q29udGVudCA9IHRoaXMuJHRhYkNvbnRlbnQuZmluZChoYXNoKTtcblxuICAgICAgJHRhcmdldC5hZGRDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApO1xuXG4gICAgICAkdGFiTGluay5hdHRyKHsnYXJpYS1zZWxlY3RlZCc6ICd0cnVlJ30pO1xuXG4gICAgICAkdGFyZ2V0Q29udGVudFxuICAgICAgICAuYWRkQ2xhc3MoYCR7dGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YClcbiAgICAgICAgLmF0dHIoeydhcmlhLWhpZGRlbic6ICdmYWxzZSd9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb2xsYXBzZXMgYCR0YXJnZXRDb250ZW50YCBkZWZpbmVkIGJ5IGAkdGFyZ2V0YC5cbiAgICogQHBhcmFtIHtqUXVlcnl9ICR0YXJnZXQgLSBUYWIgdG8gT3Blbi5cbiAgICogQGZ1bmN0aW9uXG4gICAqL1xuICBfY29sbGFwc2VUYWIoJHRhcmdldCkge1xuICAgIHZhciAkdGFyZ2V0X2FuY2hvciA9ICR0YXJnZXRcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMubGlua0FjdGl2ZUNsYXNzfWApXG4gICAgICAuZmluZCgnW3JvbGU9XCJ0YWJcIl0nKVxuICAgICAgLmF0dHIoeyAnYXJpYS1zZWxlY3RlZCc6ICdmYWxzZScgfSk7XG5cbiAgICAkKGAjJHskdGFyZ2V0X2FuY2hvci5hdHRyKCdhcmlhLWNvbnRyb2xzJyl9YClcbiAgICAgIC5yZW1vdmVDbGFzcyhgJHt0aGlzLm9wdGlvbnMucGFuZWxBY3RpdmVDbGFzc31gKVxuICAgICAgLmF0dHIoeyAnYXJpYS1oaWRkZW4nOiAndHJ1ZScgfSk7XG4gIH1cblxuICAvKipcbiAgICogUHVibGljIG1ldGhvZCBmb3Igc2VsZWN0aW5nIGEgY29udGVudCBwYW5lIHRvIGRpc3BsYXkuXG4gICAqIEBwYXJhbSB7alF1ZXJ5IHwgU3RyaW5nfSBlbGVtIC0galF1ZXJ5IG9iamVjdCBvciBzdHJpbmcgb2YgdGhlIGlkIG9mIHRoZSBwYW5lIHRvIGRpc3BsYXkuXG4gICAqIEBwYXJhbSB7Ym9vbGVhbn0gaGlzdG9yeUhhbmRsZWQgLSBicm93c2VyIGhhcyBhbHJlYWR5IGhhbmRsZWQgYSBoaXN0b3J5IHVwZGF0ZVxuICAgKiBAZnVuY3Rpb25cbiAgICovXG4gIHNlbGVjdFRhYihlbGVtLCBoaXN0b3J5SGFuZGxlZCkge1xuICAgIHZhciBpZFN0cjtcblxuICAgIGlmICh0eXBlb2YgZWxlbSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlkU3RyID0gZWxlbVswXS5pZDtcbiAgICB9IGVsc2Uge1xuICAgICAgaWRTdHIgPSBlbGVtO1xuICAgIH1cblxuICAgIGlmIChpZFN0ci5pbmRleE9mKCcjJykgPCAwKSB7XG4gICAgICBpZFN0ciA9IGAjJHtpZFN0cn1gO1xuICAgIH1cblxuICAgIHZhciAkdGFyZ2V0ID0gdGhpcy4kdGFiVGl0bGVzLmZpbmQoYFtocmVmJD1cIiR7aWRTdHJ9XCJdYCkucGFyZW50KGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApO1xuXG4gICAgdGhpcy5faGFuZGxlVGFiQ2hhbmdlKCR0YXJnZXQsIGhpc3RvcnlIYW5kbGVkKTtcbiAgfTtcbiAgLyoqXG4gICAqIFNldHMgdGhlIGhlaWdodCBvZiBlYWNoIHBhbmVsIHRvIHRoZSBoZWlnaHQgb2YgdGhlIHRhbGxlc3QgcGFuZWwuXG4gICAqIElmIGVuYWJsZWQgaW4gb3B0aW9ucywgZ2V0cyBjYWxsZWQgb24gbWVkaWEgcXVlcnkgY2hhbmdlLlxuICAgKiBJZiBsb2FkaW5nIGNvbnRlbnQgdmlhIGV4dGVybmFsIHNvdXJjZSwgY2FuIGJlIGNhbGxlZCBkaXJlY3RseSBvciB3aXRoIF9yZWZsb3cuXG4gICAqIElmIGVuYWJsZWQgd2l0aCBgZGF0YS1tYXRjaC1oZWlnaHQ9XCJ0cnVlXCJgLCB0YWJzIHNldHMgdG8gZXF1YWwgaGVpZ2h0XG4gICAqIEBmdW5jdGlvblxuICAgKiBAcHJpdmF0ZVxuICAgKi9cbiAgX3NldEhlaWdodCgpIHtcbiAgICB2YXIgbWF4ID0gMCxcbiAgICAgICAgX3RoaXMgPSB0aGlzOyAvLyBMb2NrIGRvd24gdGhlIGB0aGlzYCB2YWx1ZSBmb3IgdGhlIHJvb3QgdGFicyBvYmplY3RcblxuICAgIHRoaXMuJHRhYkNvbnRlbnRcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMucGFuZWxDbGFzc31gKVxuICAgICAgLmNzcygnaGVpZ2h0JywgJycpXG4gICAgICAuZWFjaChmdW5jdGlvbigpIHtcblxuICAgICAgICB2YXIgcGFuZWwgPSAkKHRoaXMpLFxuICAgICAgICAgICAgaXNBY3RpdmUgPSBwYW5lbC5oYXNDbGFzcyhgJHtfdGhpcy5vcHRpb25zLnBhbmVsQWN0aXZlQ2xhc3N9YCk7IC8vIGdldCB0aGUgb3B0aW9ucyBmcm9tIHRoZSBwYXJlbnQgaW5zdGVhZCBvZiB0cnlpbmcgdG8gZ2V0IHRoZW0gZnJvbSB0aGUgY2hpbGRcblxuICAgICAgICBpZiAoIWlzQWN0aXZlKSB7XG4gICAgICAgICAgcGFuZWwuY3NzKHsndmlzaWJpbGl0eSc6ICdoaWRkZW4nLCAnZGlzcGxheSc6ICdibG9jayd9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZW1wID0gdGhpcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG5cbiAgICAgICAgaWYgKCFpc0FjdGl2ZSkge1xuICAgICAgICAgIHBhbmVsLmNzcyh7XG4gICAgICAgICAgICAndmlzaWJpbGl0eSc6ICcnLFxuICAgICAgICAgICAgJ2Rpc3BsYXknOiAnJ1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgbWF4ID0gdGVtcCA+IG1heCA/IHRlbXAgOiBtYXg7XG4gICAgICB9KVxuICAgICAgLmNzcygnaGVpZ2h0JywgYCR7bWF4fXB4YCk7XG4gIH1cblxuICAvKipcbiAgICogRGVzdHJveXMgYW4gaW5zdGFuY2Ugb2YgYW4gdGFicy5cbiAgICogQGZpcmVzIFRhYnMjZGVzdHJveWVkXG4gICAqL1xuICBkZXN0cm95KCkge1xuICAgIHRoaXMuJGVsZW1lbnRcbiAgICAgIC5maW5kKGAuJHt0aGlzLm9wdGlvbnMubGlua0NsYXNzfWApXG4gICAgICAub2ZmKCcuemYudGFicycpLmhpZGUoKS5lbmQoKVxuICAgICAgLmZpbmQoYC4ke3RoaXMub3B0aW9ucy5wYW5lbENsYXNzfWApXG4gICAgICAuaGlkZSgpO1xuXG4gICAgaWYgKHRoaXMub3B0aW9ucy5tYXRjaEhlaWdodCkge1xuICAgICAgaWYgKHRoaXMuX3NldEhlaWdodE1xSGFuZGxlciAhPSBudWxsKSB7XG4gICAgICAgICAkKHdpbmRvdykub2ZmKCdjaGFuZ2VkLnpmLm1lZGlhcXVlcnknLCB0aGlzLl9zZXRIZWlnaHRNcUhhbmRsZXIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLm9wdGlvbnMuZGVlcExpbmspIHtcbiAgICAgICQod2luZG93KS5vZmYoJ3BvcHN0YXRlJywgdGhpcy5fY2hlY2tEZWVwTGluayk7XG4gICAgfVxuXG4gICAgRm91bmRhdGlvbi51bnJlZ2lzdGVyUGx1Z2luKHRoaXMpO1xuICB9XG59XG5cblRhYnMuZGVmYXVsdHMgPSB7XG4gIC8qKlxuICAgKiBBbGxvd3MgdGhlIHdpbmRvdyB0byBzY3JvbGwgdG8gY29udGVudCBvZiBwYW5lIHNwZWNpZmllZCBieSBoYXNoIGFuY2hvclxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgZGVlcExpbms6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBBZGp1c3QgdGhlIGRlZXAgbGluayBzY3JvbGwgdG8gbWFrZSBzdXJlIHRoZSB0b3Agb2YgdGhlIHRhYiBwYW5lbCBpcyB2aXNpYmxlXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IGZhbHNlXG4gICAqL1xuICBkZWVwTGlua1NtdWRnZTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFuaW1hdGlvbiB0aW1lIChtcykgZm9yIHRoZSBkZWVwIGxpbmsgYWRqdXN0bWVudFxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtudW1iZXJ9XG4gICAqIEBkZWZhdWx0IDMwMFxuICAgKi9cbiAgZGVlcExpbmtTbXVkZ2VEZWxheTogMzAwLFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgdGhlIGJyb3dzZXIgaGlzdG9yeSB3aXRoIHRoZSBvcGVuIHRhYlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgKi9cbiAgdXBkYXRlSGlzdG9yeTogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgd2luZG93IHRvIHNjcm9sbCB0byBjb250ZW50IG9mIGFjdGl2ZSBwYW5lIG9uIGxvYWQgaWYgc2V0IHRvIHRydWUuXG4gICAqIE5vdCByZWNvbW1lbmRlZCBpZiBtb3JlIHRoYW4gb25lIHRhYiBwYW5lbCBwZXIgcGFnZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGF1dG9Gb2N1czogZmFsc2UsXG5cbiAgLyoqXG4gICAqIEFsbG93cyBrZXlib2FyZCBpbnB1dCB0byAnd3JhcCcgYXJvdW5kIHRoZSB0YWIgbGlua3MuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqIEBkZWZhdWx0IHRydWVcbiAgICovXG4gIHdyYXBPbktleXM6IHRydWUsXG5cbiAgLyoqXG4gICAqIEFsbG93cyB0aGUgdGFiIGNvbnRlbnQgcGFuZXMgdG8gbWF0Y2ggaGVpZ2h0cyBpZiBzZXQgdG8gdHJ1ZS5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIG1hdGNoSGVpZ2h0OiBmYWxzZSxcblxuICAvKipcbiAgICogQWxsb3dzIGFjdGl2ZSB0YWJzIHRvIGNvbGxhcHNlIHdoZW4gY2xpY2tlZC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICogQGRlZmF1bHQgZmFsc2VcbiAgICovXG4gIGFjdGl2ZUNvbGxhcHNlOiBmYWxzZSxcblxuICAvKipcbiAgICogQ2xhc3MgYXBwbGllZCB0byBgbGlgJ3MgaW4gdGFiIGxpbmsgbGlzdC5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAndGFicy10aXRsZSdcbiAgICovXG4gIGxpbmtDbGFzczogJ3RhYnMtdGl0bGUnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBhY3RpdmUgYGxpYCBpbiB0YWIgbGluayBsaXN0LlxuICAgKiBAb3B0aW9uXG4gICAqIEB0eXBlIHtzdHJpbmd9XG4gICAqIEBkZWZhdWx0ICdpcy1hY3RpdmUnXG4gICAqL1xuICBsaW5rQWN0aXZlQ2xhc3M6ICdpcy1hY3RpdmUnLFxuXG4gIC8qKlxuICAgKiBDbGFzcyBhcHBsaWVkIHRvIHRoZSBjb250ZW50IGNvbnRhaW5lcnMuXG4gICAqIEBvcHRpb25cbiAgICogQHR5cGUge3N0cmluZ31cbiAgICogQGRlZmF1bHQgJ3RhYnMtcGFuZWwnXG4gICAqL1xuICBwYW5lbENsYXNzOiAndGFicy1wYW5lbCcsXG5cbiAgLyoqXG4gICAqIENsYXNzIGFwcGxpZWQgdG8gdGhlIGFjdGl2ZSBjb250ZW50IGNvbnRhaW5lci5cbiAgICogQG9wdGlvblxuICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgKiBAZGVmYXVsdCAnaXMtYWN0aXZlJ1xuICAgKi9cbiAgcGFuZWxBY3RpdmVDbGFzczogJ2lzLWFjdGl2ZSdcbn07XG5cbi8vIFdpbmRvdyBleHBvcnRzXG5Gb3VuZGF0aW9uLnBsdWdpbihUYWJzLCAnVGFicycpO1xuXG59KGpRdWVyeSk7XG4iLCJ2YXIgX2V4dGVuZHMgPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uICh0YXJnZXQpIHsgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHsgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpXTsgZm9yICh2YXIga2V5IGluIHNvdXJjZSkgeyBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHNvdXJjZSwga2V5KSkgeyB0YXJnZXRba2V5XSA9IHNvdXJjZVtrZXldOyB9IH0gfSByZXR1cm4gdGFyZ2V0OyB9O1xuXG52YXIgX3R5cGVvZiA9IHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgU3ltYm9sLml0ZXJhdG9yID09PSBcInN5bWJvbFwiID8gZnVuY3Rpb24gKG9iaikgeyByZXR1cm4gdHlwZW9mIG9iajsgfSA6IGZ1bmN0aW9uIChvYmopIHsgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7IH07XG5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gICAgKHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICd1bmRlZmluZWQnIDogX3R5cGVvZihleHBvcnRzKSkgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOiB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOiBnbG9iYWwuTGF6eUxvYWQgPSBmYWN0b3J5KCk7XG59KSh0aGlzLCBmdW5jdGlvbiAoKSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuXG4gICAgdmFyIGRlZmF1bHRTZXR0aW5ncyA9IHtcbiAgICAgICAgZWxlbWVudHNfc2VsZWN0b3I6IFwiaW1nXCIsXG4gICAgICAgIGNvbnRhaW5lcjogd2luZG93LFxuICAgICAgICB0aHJlc2hvbGQ6IDMwMCxcbiAgICAgICAgdGhyb3R0bGU6IDE1MCxcbiAgICAgICAgZGF0YV9zcmM6IFwib3JpZ2luYWxcIixcbiAgICAgICAgZGF0YV9zcmNzZXQ6IFwib3JpZ2luYWxTZXRcIixcbiAgICAgICAgY2xhc3NfbG9hZGluZzogXCJsb2FkaW5nXCIsXG4gICAgICAgIGNsYXNzX2xvYWRlZDogXCJsb2FkZWRcIixcbiAgICAgICAgY2xhc3NfZXJyb3I6IFwiZXJyb3JcIixcbiAgICAgICAgY2xhc3NfaW5pdGlhbDogXCJpbml0aWFsXCIsXG4gICAgICAgIHNraXBfaW52aXNpYmxlOiB0cnVlLFxuICAgICAgICBjYWxsYmFja19sb2FkOiBudWxsLFxuICAgICAgICBjYWxsYmFja19lcnJvcjogbnVsbCxcbiAgICAgICAgY2FsbGJhY2tfc2V0OiBudWxsLFxuICAgICAgICBjYWxsYmFja19wcm9jZXNzZWQ6IG51bGxcbiAgICB9O1xuXG4gICAgdmFyIGlzQm90ID0gIShcIm9uc2Nyb2xsXCIgaW4gd2luZG93KSB8fCAvZ2xlYm90Ly50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG4gICAgdmFyIGNhbGxDYWxsYmFjayA9IGZ1bmN0aW9uIGNhbGxDYWxsYmFjayhjYWxsYmFjaywgYXJndW1lbnQpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhhcmd1bWVudCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIGdldFRvcE9mZnNldCA9IGZ1bmN0aW9uIGdldFRvcE9mZnNldChlbGVtZW50KSB7XG4gICAgICAgIHJldHVybiBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCArIHdpbmRvdy5wYWdlWU9mZnNldCAtIGVsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50VG9wO1xuICAgIH07XG5cbiAgICB2YXIgaXNCZWxvd1ZpZXdwb3J0ID0gZnVuY3Rpb24gaXNCZWxvd1ZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHZhciBmb2xkID0gY29udGFpbmVyID09PSB3aW5kb3cgPyB3aW5kb3cuaW5uZXJIZWlnaHQgKyB3aW5kb3cucGFnZVlPZmZzZXQgOiBnZXRUb3BPZmZzZXQoY29udGFpbmVyKSArIGNvbnRhaW5lci5vZmZzZXRIZWlnaHQ7XG4gICAgICAgIHJldHVybiBmb2xkIDw9IGdldFRvcE9mZnNldChlbGVtZW50KSAtIHRocmVzaG9sZDtcbiAgICB9O1xuXG4gICAgdmFyIGdldExlZnRPZmZzZXQgPSBmdW5jdGlvbiBnZXRMZWZ0T2Zmc2V0KGVsZW1lbnQpIHtcbiAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdCArIHdpbmRvdy5wYWdlWE9mZnNldCAtIGVsZW1lbnQub3duZXJEb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50TGVmdDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQXRSaWdodE9mVmlld3BvcnQgPSBmdW5jdGlvbiBpc0F0UmlnaHRPZlZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHZhciBkb2N1bWVudFdpZHRoID0gd2luZG93LmlubmVyV2lkdGg7XG4gICAgICAgIHZhciBmb2xkID0gY29udGFpbmVyID09PSB3aW5kb3cgPyBkb2N1bWVudFdpZHRoICsgd2luZG93LnBhZ2VYT2Zmc2V0IDogZ2V0TGVmdE9mZnNldChjb250YWluZXIpICsgZG9jdW1lbnRXaWR0aDtcbiAgICAgICAgcmV0dXJuIGZvbGQgPD0gZ2V0TGVmdE9mZnNldChlbGVtZW50KSAtIHRocmVzaG9sZDtcbiAgICB9O1xuXG4gICAgdmFyIGlzQWJvdmVWaWV3cG9ydCA9IGZ1bmN0aW9uIGlzQWJvdmVWaWV3cG9ydChlbGVtZW50LCBjb250YWluZXIsIHRocmVzaG9sZCkge1xuICAgICAgICB2YXIgZm9sZCA9IGNvbnRhaW5lciA9PT0gd2luZG93ID8gd2luZG93LnBhZ2VZT2Zmc2V0IDogZ2V0VG9wT2Zmc2V0KGNvbnRhaW5lcik7XG4gICAgICAgIHJldHVybiBmb2xkID49IGdldFRvcE9mZnNldChlbGVtZW50KSArIHRocmVzaG9sZCArIGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgIH07XG5cbiAgICB2YXIgaXNBdExlZnRPZlZpZXdwb3J0ID0gZnVuY3Rpb24gaXNBdExlZnRPZlZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSB7XG4gICAgICAgIHZhciBmb2xkID0gY29udGFpbmVyID09PSB3aW5kb3cgPyB3aW5kb3cucGFnZVhPZmZzZXQgOiBnZXRMZWZ0T2Zmc2V0KGNvbnRhaW5lcik7XG4gICAgICAgIHJldHVybiBmb2xkID49IGdldExlZnRPZmZzZXQoZWxlbWVudCkgKyB0aHJlc2hvbGQgKyBlbGVtZW50Lm9mZnNldFdpZHRoO1xuICAgIH07XG5cbiAgICB2YXIgaXNJbnNpZGVWaWV3cG9ydCA9IGZ1bmN0aW9uIGlzSW5zaWRlVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpIHtcbiAgICAgICAgcmV0dXJuICFpc0JlbG93Vmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpICYmICFpc0Fib3ZlVmlld3BvcnQoZWxlbWVudCwgY29udGFpbmVyLCB0aHJlc2hvbGQpICYmICFpc0F0UmlnaHRPZlZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKSAmJiAhaXNBdExlZnRPZlZpZXdwb3J0KGVsZW1lbnQsIGNvbnRhaW5lciwgdGhyZXNob2xkKTtcbiAgICB9O1xuXG4gICAgLyogQ3JlYXRlcyBpbnN0YW5jZSBhbmQgbm90aWZpZXMgaXQgdGhyb3VnaCB0aGUgd2luZG93IGVsZW1lbnQgKi9cbiAgICB2YXIgY3JlYXRlSW5zdGFuY2UgPSBmdW5jdGlvbiBjcmVhdGVJbnN0YW5jZShjbGFzc09iaiwgb3B0aW9ucykge1xuICAgICAgICB2YXIgaW5zdGFuY2UgPSBuZXcgY2xhc3NPYmoob3B0aW9ucyk7XG4gICAgICAgIHZhciBldmVudCA9IG5ldyBDdXN0b21FdmVudChcIkxhenlMb2FkOjpJbml0aWFsaXplZFwiLCB7IGRldGFpbDogeyBpbnN0YW5jZTogaW5zdGFuY2UgfSB9KTtcbiAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoZXZlbnQpO1xuICAgIH07XG5cbiAgICAvKiBBdXRvIGluaXRpYWxpemF0aW9uIG9mIG9uZSBvciBtb3JlIGluc3RhbmNlcyBvZiBsYXp5bG9hZCwgZGVwZW5kaW5nIG9uIHRoZSBcbiAgICAgICAgb3B0aW9ucyBwYXNzZWQgaW4gKHBsYWluIG9iamVjdCBvciBhbiBhcnJheSkgKi9cbiAgICB2YXIgYXV0b0luaXRpYWxpemUgPSBmdW5jdGlvbiBhdXRvSW5pdGlhbGl6ZShjbGFzc09iaiwgb3B0aW9ucykge1xuICAgICAgICB2YXIgb3B0c0xlbmd0aCA9IG9wdGlvbnMubGVuZ3RoO1xuICAgICAgICBpZiAoIW9wdHNMZW5ndGgpIHtcbiAgICAgICAgICAgIC8vIFBsYWluIG9iamVjdFxuICAgICAgICAgICAgY3JlYXRlSW5zdGFuY2UoY2xhc3NPYmosIG9wdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gQXJyYXkgb2Ygb2JqZWN0c1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBvcHRzTGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVJbnN0YW5jZShjbGFzc09iaiwgb3B0aW9uc1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdmFyIHNldFNvdXJjZXNGb3JQaWN0dXJlID0gZnVuY3Rpb24gc2V0U291cmNlc0ZvclBpY3R1cmUoZWxlbWVudCwgc3Jjc2V0RGF0YUF0dHJpYnV0ZSkge1xuICAgICAgICB2YXIgcGFyZW50ID0gZWxlbWVudC5wYXJlbnRFbGVtZW50O1xuICAgICAgICBpZiAocGFyZW50LnRhZ05hbWUgIT09IFwiUElDVFVSRVwiKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJlbnQuY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwaWN0dXJlQ2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5baV07XG4gICAgICAgICAgICBpZiAocGljdHVyZUNoaWxkLnRhZ05hbWUgPT09IFwiU09VUkNFXCIpIHtcbiAgICAgICAgICAgICAgICB2YXIgc291cmNlU3Jjc2V0ID0gcGljdHVyZUNoaWxkLmRhdGFzZXRbc3Jjc2V0RGF0YUF0dHJpYnV0ZV07XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZVNyY3NldCkge1xuICAgICAgICAgICAgICAgICAgICBwaWN0dXJlQ2hpbGQuc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsIHNvdXJjZVNyY3NldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHZhciBzZXRTb3VyY2VzID0gZnVuY3Rpb24gc2V0U291cmNlcyhlbGVtZW50LCBzcmNzZXREYXRhQXR0cmlidXRlLCBzcmNEYXRhQXR0cmlidXRlKSB7XG4gICAgICAgIHZhciB0YWdOYW1lID0gZWxlbWVudC50YWdOYW1lO1xuICAgICAgICB2YXIgZWxlbWVudFNyYyA9IGVsZW1lbnQuZGF0YXNldFtzcmNEYXRhQXR0cmlidXRlXTtcbiAgICAgICAgaWYgKHRhZ05hbWUgPT09IFwiSU1HXCIpIHtcbiAgICAgICAgICAgIHNldFNvdXJjZXNGb3JQaWN0dXJlKGVsZW1lbnQsIHNyY3NldERhdGFBdHRyaWJ1dGUpO1xuICAgICAgICAgICAgdmFyIGltZ1NyY3NldCA9IGVsZW1lbnQuZGF0YXNldFtzcmNzZXREYXRhQXR0cmlidXRlXTtcbiAgICAgICAgICAgIGlmIChpbWdTcmNzZXQpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcInNyY3NldFwiLCBpbWdTcmNzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGVsZW1lbnRTcmMpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcInNyY1wiLCBlbGVtZW50U3JjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGFnTmFtZSA9PT0gXCJJRlJBTUVcIikge1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRTcmMpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnNldEF0dHJpYnV0ZShcInNyY1wiLCBlbGVtZW50U3JjKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZWxlbWVudFNyYykge1xuICAgICAgICAgICAgZWxlbWVudC5zdHlsZS5iYWNrZ3JvdW5kSW1hZ2UgPSBcInVybChcIiArIGVsZW1lbnRTcmMgKyBcIilcIjtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKlxuICAgICAqIENvbnN0cnVjdG9yXG4gICAgICovXG5cbiAgICB2YXIgTGF6eUxvYWQgPSBmdW5jdGlvbiBMYXp5TG9hZChpbnN0YW5jZVNldHRpbmdzKSB7XG4gICAgICAgIHRoaXMuX3NldHRpbmdzID0gX2V4dGVuZHMoe30sIGRlZmF1bHRTZXR0aW5ncywgaW5zdGFuY2VTZXR0aW5ncyk7XG4gICAgICAgIHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZSA9IHRoaXMuX3NldHRpbmdzLmNvbnRhaW5lciA9PT0gd2luZG93ID8gZG9jdW1lbnQgOiB0aGlzLl9zZXR0aW5ncy5jb250YWluZXI7XG5cbiAgICAgICAgdGhpcy5fcHJldmlvdXNMb29wVGltZSA9IDA7XG4gICAgICAgIHRoaXMuX2xvb3BUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwgPSB0aGlzLmhhbmRsZVNjcm9sbC5iaW5kKHRoaXMpO1xuXG4gICAgICAgIHRoaXMuX2lzRmlyc3RMb29wID0gdHJ1ZTtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwpO1xuICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgIH07XG5cbiAgICBMYXp5TG9hZC5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAgLypcbiAgICAgICAgICogUHJpdmF0ZSBtZXRob2RzXG4gICAgICAgICAqL1xuXG4gICAgICAgIF9yZXZlYWw6IGZ1bmN0aW9uIF9yZXZlYWwoZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5fc2V0dGluZ3M7XG5cbiAgICAgICAgICAgIHZhciBlcnJvckNhbGxiYWNrID0gZnVuY3Rpb24gZXJyb3JDYWxsYmFjaygpIHtcbiAgICAgICAgICAgICAgICAvKiBBcyB0aGlzIG1ldGhvZCBpcyBhc3luY2hyb25vdXMsIGl0IG11c3QgYmUgcHJvdGVjdGVkIGFnYWluc3QgZXh0ZXJuYWwgZGVzdHJveSgpIGNhbGxzICovXG4gICAgICAgICAgICAgICAgaWYgKCFzZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIiwgbG9hZENhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLCBlcnJvckNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoc2V0dGluZ3MuY2xhc3NfbG9hZGluZyk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzX2Vycm9yKTtcbiAgICAgICAgICAgICAgICBjYWxsQ2FsbGJhY2soc2V0dGluZ3MuY2FsbGJhY2tfZXJyb3IsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIGxvYWRDYWxsYmFjayA9IGZ1bmN0aW9uIGxvYWRDYWxsYmFjaygpIHtcbiAgICAgICAgICAgICAgICAvKiBBcyB0aGlzIG1ldGhvZCBpcyBhc3luY2hyb25vdXMsIGl0IG11c3QgYmUgcHJvdGVjdGVkIGFnYWluc3QgZXh0ZXJuYWwgZGVzdHJveSgpIGNhbGxzICovXG4gICAgICAgICAgICAgICAgaWYgKCFzZXR0aW5ncykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShzZXR0aW5ncy5jbGFzc19sb2FkaW5nKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmNsYXNzTGlzdC5hZGQoc2V0dGluZ3MuY2xhc3NfbG9hZGVkKTtcbiAgICAgICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGxvYWRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgLyogQ2FsbGluZyBMT0FEIGNhbGxiYWNrICovXG4gICAgICAgICAgICAgICAgY2FsbENhbGxiYWNrKHNldHRpbmdzLmNhbGxiYWNrX2xvYWQsIGVsZW1lbnQpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQudGFnTmFtZSA9PT0gXCJJTUdcIiB8fCBlbGVtZW50LnRhZ05hbWUgPT09IFwiSUZSQU1FXCIpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsIGxvYWRDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIiwgZXJyb3JDYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzX2xvYWRpbmcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZXRTb3VyY2VzKGVsZW1lbnQsIHNldHRpbmdzLmRhdGFfc3Jjc2V0LCBzZXR0aW5ncy5kYXRhX3NyYyk7XG4gICAgICAgICAgICAvKiBDYWxsaW5nIFNFVCBjYWxsYmFjayAqL1xuICAgICAgICAgICAgY2FsbENhbGxiYWNrKHNldHRpbmdzLmNhbGxiYWNrX3NldCwgZWxlbWVudCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgX2xvb3BUaHJvdWdoRWxlbWVudHM6IGZ1bmN0aW9uIF9sb29wVGhyb3VnaEVsZW1lbnRzKCkge1xuICAgICAgICAgICAgdmFyIHNldHRpbmdzID0gdGhpcy5fc2V0dGluZ3MsXG4gICAgICAgICAgICAgICAgZWxlbWVudHMgPSB0aGlzLl9lbGVtZW50cyxcbiAgICAgICAgICAgICAgICBlbGVtZW50c0xlbmd0aCA9ICFlbGVtZW50cyA/IDAgOiBlbGVtZW50cy5sZW5ndGg7XG4gICAgICAgICAgICB2YXIgaSA9IHZvaWQgMCxcbiAgICAgICAgICAgICAgICBwcm9jZXNzZWRJbmRleGVzID0gW10sXG4gICAgICAgICAgICAgICAgZmlyc3RMb29wID0gdGhpcy5faXNGaXJzdExvb3A7XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBlbGVtZW50c0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICAgICAgICAgICAgICAvKiBJZiBtdXN0IHNraXBfaW52aXNpYmxlIGFuZCBlbGVtZW50IGlzIGludmlzaWJsZSwgc2tpcCBpdCAqL1xuICAgICAgICAgICAgICAgIGlmIChzZXR0aW5ncy5za2lwX2ludmlzaWJsZSAmJiBlbGVtZW50Lm9mZnNldFBhcmVudCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoaXNCb3QgfHwgaXNJbnNpZGVWaWV3cG9ydChlbGVtZW50LCBzZXR0aW5ncy5jb250YWluZXIsIHNldHRpbmdzLnRocmVzaG9sZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpcnN0TG9vcCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QuYWRkKHNldHRpbmdzLmNsYXNzX2luaXRpYWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8qIFN0YXJ0IGxvYWRpbmcgdGhlIGltYWdlICovXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3JldmVhbChlbGVtZW50KTtcbiAgICAgICAgICAgICAgICAgICAgLyogTWFya2luZyB0aGUgZWxlbWVudCBhcyBwcm9jZXNzZWQuICovXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NlZEluZGV4ZXMucHVzaChpKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5kYXRhc2V0Lndhc1Byb2Nlc3NlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogUmVtb3ZpbmcgcHJvY2Vzc2VkIGVsZW1lbnRzIGZyb20gdGhpcy5fZWxlbWVudHMuICovXG4gICAgICAgICAgICB3aGlsZSAocHJvY2Vzc2VkSW5kZXhlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgZWxlbWVudHMuc3BsaWNlKHByb2Nlc3NlZEluZGV4ZXMucG9wKCksIDEpO1xuICAgICAgICAgICAgICAgIC8qIENhbGxpbmcgdGhlIGVuZCBsb29wIGNhbGxiYWNrICovXG4gICAgICAgICAgICAgICAgY2FsbENhbGxiYWNrKHNldHRpbmdzLmNhbGxiYWNrX3Byb2Nlc3NlZCwgZWxlbWVudHMubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIFN0b3AgbGlzdGVuaW5nIHRvIHNjcm9sbCBldmVudCB3aGVuIDAgZWxlbWVudHMgcmVtYWlucyAqL1xuICAgICAgICAgICAgaWYgKGVsZW1lbnRzTGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc3RvcFNjcm9sbEhhbmRsZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIFNldHMgaXNGaXJzdExvb3AgdG8gZmFsc2UgKi9cbiAgICAgICAgICAgIGlmIChmaXJzdExvb3ApIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0ZpcnN0TG9vcCA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9wdXJnZUVsZW1lbnRzOiBmdW5jdGlvbiBfcHVyZ2VFbGVtZW50cygpIHtcbiAgICAgICAgICAgIHZhciBlbGVtZW50cyA9IHRoaXMuX2VsZW1lbnRzLFxuICAgICAgICAgICAgICAgIGVsZW1lbnRzTGVuZ3RoID0gZWxlbWVudHMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGkgPSB2b2lkIDAsXG4gICAgICAgICAgICAgICAgZWxlbWVudHNUb1B1cmdlID0gW107XG5cbiAgICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBlbGVtZW50c0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVsZW1lbnQgPSBlbGVtZW50c1tpXTtcbiAgICAgICAgICAgICAgICAvKiBJZiB0aGUgZWxlbWVudCBoYXMgYWxyZWFkeSBiZWVuIHByb2Nlc3NlZCwgc2tpcCBpdCAqL1xuICAgICAgICAgICAgICAgIGlmIChlbGVtZW50LmRhdGFzZXQud2FzUHJvY2Vzc2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIGVsZW1lbnRzVG9QdXJnZS5wdXNoKGkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIFJlbW92aW5nIGVsZW1lbnRzIHRvIHB1cmdlIGZyb20gdGhpcy5fZWxlbWVudHMuICovXG4gICAgICAgICAgICB3aGlsZSAoZWxlbWVudHNUb1B1cmdlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50cy5zcGxpY2UoZWxlbWVudHNUb1B1cmdlLnBvcCgpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBfc3RhcnRTY3JvbGxIYW5kbGVyOiBmdW5jdGlvbiBfc3RhcnRTY3JvbGxIYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNIYW5kbGluZ1Njcm9sbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyLmFkZEV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIF9zdG9wU2Nyb2xsSGFuZGxlcjogZnVuY3Rpb24gX3N0b3BTY3JvbGxIYW5kbGVyKCkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2lzSGFuZGxpbmdTY3JvbGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9pc0hhbmRsaW5nU2Nyb2xsID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2V0dGluZ3MuY29udGFpbmVyLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIiwgdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIC8qIFxuICAgICAgICAgKiBQdWJsaWMgbWV0aG9kc1xuICAgICAgICAgKi9cblxuICAgICAgICBoYW5kbGVTY3JvbGw6IGZ1bmN0aW9uIGhhbmRsZVNjcm9sbCgpIHtcbiAgICAgICAgICAgIHZhciB0aHJvdHRsZSA9IHRoaXMuX3NldHRpbmdzLnRocm90dGxlO1xuXG4gICAgICAgICAgICBpZiAodGhyb3R0bGUgIT09IDApIHtcbiAgICAgICAgICAgICAgICB2YXIgZ2V0VGltZSA9IGZ1bmN0aW9uIGdldFRpbWUoKSB7XG4gICAgICAgICAgICAgICAgICAgIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdmFyIG5vdyA9IGdldFRpbWUoKTtcbiAgICAgICAgICAgICAgICB2YXIgcmVtYWluaW5nVGltZSA9IHRocm90dGxlIC0gKG5vdyAtIHRoaXMuX3ByZXZpb3VzTG9vcFRpbWUpO1xuICAgICAgICAgICAgICAgIGlmIChyZW1haW5pbmdUaW1lIDw9IDAgfHwgcmVtYWluaW5nVGltZSA+IHRocm90dGxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLl9sb29wVGltZW91dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2xvb3BUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2xvb3BUaW1lb3V0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcmV2aW91c0xvb3BUaW1lID0gbm93O1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICghdGhpcy5fbG9vcFRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fbG9vcFRpbWVvdXQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ByZXZpb3VzTG9vcFRpbWUgPSBnZXRUaW1lKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCk7XG4gICAgICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgcmVtYWluaW5nVGltZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgdXBkYXRlOiBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgICAgICAvLyBDb252ZXJ0cyB0byBhcnJheSB0aGUgbm9kZXNldCBvYnRhaW5lZCBxdWVyeWluZyB0aGUgRE9NIGZyb20gX3F1ZXJ5T3JpZ2luTm9kZSB3aXRoIGVsZW1lbnRzX3NlbGVjdG9yXG4gICAgICAgICAgICB0aGlzLl9lbGVtZW50cyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX3F1ZXJ5T3JpZ2luTm9kZS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuX3NldHRpbmdzLmVsZW1lbnRzX3NlbGVjdG9yKSk7XG4gICAgICAgICAgICB0aGlzLl9wdXJnZUVsZW1lbnRzKCk7XG4gICAgICAgICAgICB0aGlzLl9sb29wVGhyb3VnaEVsZW1lbnRzKCk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFNjcm9sbEhhbmRsZXIoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBkZXN0cm95OiBmdW5jdGlvbiBkZXN0cm95KCkge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgdGhpcy5fYm91bmRIYW5kbGVTY3JvbGwpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xvb3BUaW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX2xvb3BUaW1lb3V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLl9sb29wVGltZW91dCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9zdG9wU2Nyb2xsSGFuZGxlcigpO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudHMgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5fcXVlcnlPcmlnaW5Ob2RlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuX3NldHRpbmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBBdXRvbWF0aWMgaW5zdGFuY2VzIGNyZWF0aW9uIGlmIHJlcXVpcmVkICh1c2VmdWwgZm9yIGFzeW5jIHNjcmlwdCBsb2FkaW5nISkgKi9cbiAgICB2YXIgYXV0b0luaXRPcHRpb25zID0gd2luZG93LmxhenlMb2FkT3B0aW9ucztcbiAgICBpZiAoYXV0b0luaXRPcHRpb25zKSB7XG4gICAgICAgIGF1dG9Jbml0aWFsaXplKExhenlMb2FkLCBhdXRvSW5pdE9wdGlvbnMpO1xuICAgIH1cblxuICAgIHJldHVybiBMYXp5TG9hZDtcbn0pO1xuIiwiLyohXG4gKiBGbGlja2l0eSBQQUNLQUdFRCB2Mi4wLjVcbiAqIFRvdWNoLCByZXNwb25zaXZlLCBmbGlja2FibGUgY2Fyb3VzZWxzXG4gKlxuICogTGljZW5zZWQgR1BMdjMgZm9yIG9wZW4gc291cmNlIHVzZVxuICogb3IgRmxpY2tpdHkgQ29tbWVyY2lhbCBMaWNlbnNlIGZvciBjb21tZXJjaWFsIHVzZVxuICpcbiAqIGh0dHA6Ly9mbGlja2l0eS5tZXRhZml6enkuY29cbiAqIENvcHlyaWdodCAyMDE2IE1ldGFmaXp6eVxuICovXG5cbiFmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJqcXVlcnktYnJpZGdldC9qcXVlcnktYnJpZGdldFwiLFtcImpxdWVyeVwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJqcXVlcnlcIikpOnQualF1ZXJ5QnJpZGdldD1lKHQsdC5qUXVlcnkpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBpKGksbyxhKXtmdW5jdGlvbiBsKHQsZSxuKXt2YXIgcyxvPVwiJCgpLlwiK2krJyhcIicrZSsnXCIpJztyZXR1cm4gdC5lYWNoKGZ1bmN0aW9uKHQsbCl7dmFyIGg9YS5kYXRhKGwsaSk7aWYoIWgpcmV0dXJuIHZvaWQgcihpK1wiIG5vdCBpbml0aWFsaXplZC4gQ2Fubm90IGNhbGwgbWV0aG9kcywgaS5lLiBcIitvKTt2YXIgYz1oW2VdO2lmKCFjfHxcIl9cIj09ZS5jaGFyQXQoMCkpcmV0dXJuIHZvaWQgcihvK1wiIGlzIG5vdCBhIHZhbGlkIG1ldGhvZFwiKTt2YXIgZD1jLmFwcGx5KGgsbik7cz12b2lkIDA9PT1zP2Q6c30pLHZvaWQgMCE9PXM/czp0fWZ1bmN0aW9uIGgodCxlKXt0LmVhY2goZnVuY3Rpb24odCxuKXt2YXIgcz1hLmRhdGEobixpKTtzPyhzLm9wdGlvbihlKSxzLl9pbml0KCkpOihzPW5ldyBvKG4sZSksYS5kYXRhKG4saSxzKSl9KX1hPWF8fGV8fHQualF1ZXJ5LGEmJihvLnByb3RvdHlwZS5vcHRpb258fChvLnByb3RvdHlwZS5vcHRpb249ZnVuY3Rpb24odCl7YS5pc1BsYWluT2JqZWN0KHQpJiYodGhpcy5vcHRpb25zPWEuZXh0ZW5kKCEwLHRoaXMub3B0aW9ucyx0KSl9KSxhLmZuW2ldPWZ1bmN0aW9uKHQpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiB0KXt2YXIgZT1zLmNhbGwoYXJndW1lbnRzLDEpO3JldHVybiBsKHRoaXMsdCxlKX1yZXR1cm4gaCh0aGlzLHQpLHRoaXN9LG4oYSkpfWZ1bmN0aW9uIG4odCl7IXR8fHQmJnQuYnJpZGdldHx8KHQuYnJpZGdldD1pKX12YXIgcz1BcnJheS5wcm90b3R5cGUuc2xpY2Usbz10LmNvbnNvbGUscj1cInVuZGVmaW5lZFwiPT10eXBlb2Ygbz9mdW5jdGlvbigpe306ZnVuY3Rpb24odCl7by5lcnJvcih0KX07cmV0dXJuIG4oZXx8dC5qUXVlcnkpLGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5FdkVtaXR0ZXI9ZSgpfShcInVuZGVmaW5lZFwiIT10eXBlb2Ygd2luZG93P3dpbmRvdzp0aGlzLGZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe312YXIgZT10LnByb3RvdHlwZTtyZXR1cm4gZS5vbj1mdW5jdGlvbih0LGUpe2lmKHQmJmUpe3ZhciBpPXRoaXMuX2V2ZW50cz10aGlzLl9ldmVudHN8fHt9LG49aVt0XT1pW3RdfHxbXTtyZXR1cm4gbi5pbmRleE9mKGUpPT0tMSYmbi5wdXNoKGUpLHRoaXN9fSxlLm9uY2U9ZnVuY3Rpb24odCxlKXtpZih0JiZlKXt0aGlzLm9uKHQsZSk7dmFyIGk9dGhpcy5fb25jZUV2ZW50cz10aGlzLl9vbmNlRXZlbnRzfHx7fSxuPWlbdF09aVt0XXx8e307cmV0dXJuIG5bZV09ITAsdGhpc319LGUub2ZmPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZXZlbnRzJiZ0aGlzLl9ldmVudHNbdF07aWYoaSYmaS5sZW5ndGgpe3ZhciBuPWkuaW5kZXhPZihlKTtyZXR1cm4gbiE9LTEmJmkuc3BsaWNlKG4sMSksdGhpc319LGUuZW1pdEV2ZW50PWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZXZlbnRzJiZ0aGlzLl9ldmVudHNbdF07aWYoaSYmaS5sZW5ndGgpe3ZhciBuPTAscz1pW25dO2U9ZXx8W107Zm9yKHZhciBvPXRoaXMuX29uY2VFdmVudHMmJnRoaXMuX29uY2VFdmVudHNbdF07czspe3ZhciByPW8mJm9bc107ciYmKHRoaXMub2ZmKHQscyksZGVsZXRlIG9bc10pLHMuYXBwbHkodGhpcyxlKSxuKz1yPzA6MSxzPWlbbl19cmV0dXJuIHRoaXN9fSx0fSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZ2V0LXNpemUvZ2V0LXNpemVcIixbXSxmdW5jdGlvbigpe3JldHVybiBlKCl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5nZXRTaXplPWUoKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt2YXIgZT1wYXJzZUZsb2F0KHQpLGk9dC5pbmRleE9mKFwiJVwiKT09LTEmJiFpc05hTihlKTtyZXR1cm4gaSYmZX1mdW5jdGlvbiBlKCl7fWZ1bmN0aW9uIGkoKXtmb3IodmFyIHQ9e3dpZHRoOjAsaGVpZ2h0OjAsaW5uZXJXaWR0aDowLGlubmVySGVpZ2h0OjAsb3V0ZXJXaWR0aDowLG91dGVySGVpZ2h0OjB9LGU9MDtlPGg7ZSsrKXt2YXIgaT1sW2VdO3RbaV09MH1yZXR1cm4gdH1mdW5jdGlvbiBuKHQpe3ZhciBlPWdldENvbXB1dGVkU3R5bGUodCk7cmV0dXJuIGV8fGEoXCJTdHlsZSByZXR1cm5lZCBcIitlK1wiLiBBcmUgeW91IHJ1bm5pbmcgdGhpcyBjb2RlIGluIGEgaGlkZGVuIGlmcmFtZSBvbiBGaXJlZm94PyBTZWUgaHR0cDovL2JpdC5seS9nZXRzaXplYnVnMVwiKSxlfWZ1bmN0aW9uIHMoKXtpZighYyl7Yz0hMDt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2Uuc3R5bGUud2lkdGg9XCIyMDBweFwiLGUuc3R5bGUucGFkZGluZz1cIjFweCAycHggM3B4IDRweFwiLGUuc3R5bGUuYm9yZGVyU3R5bGU9XCJzb2xpZFwiLGUuc3R5bGUuYm9yZGVyV2lkdGg9XCIxcHggMnB4IDNweCA0cHhcIixlLnN0eWxlLmJveFNpemluZz1cImJvcmRlci1ib3hcIjt2YXIgaT1kb2N1bWVudC5ib2R5fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7aS5hcHBlbmRDaGlsZChlKTt2YXIgcz1uKGUpO28uaXNCb3hTaXplT3V0ZXI9cj0yMDA9PXQocy53aWR0aCksaS5yZW1vdmVDaGlsZChlKX19ZnVuY3Rpb24gbyhlKXtpZihzKCksXCJzdHJpbmdcIj09dHlwZW9mIGUmJihlPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZSkpLGUmJlwib2JqZWN0XCI9PXR5cGVvZiBlJiZlLm5vZGVUeXBlKXt2YXIgbz1uKGUpO2lmKFwibm9uZVwiPT1vLmRpc3BsYXkpcmV0dXJuIGkoKTt2YXIgYT17fTthLndpZHRoPWUub2Zmc2V0V2lkdGgsYS5oZWlnaHQ9ZS5vZmZzZXRIZWlnaHQ7Zm9yKHZhciBjPWEuaXNCb3JkZXJCb3g9XCJib3JkZXItYm94XCI9PW8uYm94U2l6aW5nLGQ9MDtkPGg7ZCsrKXt2YXIgdT1sW2RdLGY9b1t1XSxwPXBhcnNlRmxvYXQoZik7YVt1XT1pc05hTihwKT8wOnB9dmFyIHY9YS5wYWRkaW5nTGVmdCthLnBhZGRpbmdSaWdodCxnPWEucGFkZGluZ1RvcCthLnBhZGRpbmdCb3R0b20sbT1hLm1hcmdpbkxlZnQrYS5tYXJnaW5SaWdodCx5PWEubWFyZ2luVG9wK2EubWFyZ2luQm90dG9tLFM9YS5ib3JkZXJMZWZ0V2lkdGgrYS5ib3JkZXJSaWdodFdpZHRoLEU9YS5ib3JkZXJUb3BXaWR0aCthLmJvcmRlckJvdHRvbVdpZHRoLGI9YyYmcix4PXQoby53aWR0aCk7eCE9PSExJiYoYS53aWR0aD14KyhiPzA6ditTKSk7dmFyIEM9dChvLmhlaWdodCk7cmV0dXJuIEMhPT0hMSYmKGEuaGVpZ2h0PUMrKGI/MDpnK0UpKSxhLmlubmVyV2lkdGg9YS53aWR0aC0oditTKSxhLmlubmVySGVpZ2h0PWEuaGVpZ2h0LShnK0UpLGEub3V0ZXJXaWR0aD1hLndpZHRoK20sYS5vdXRlckhlaWdodD1hLmhlaWdodCt5LGF9fXZhciByLGE9XCJ1bmRlZmluZWRcIj09dHlwZW9mIGNvbnNvbGU/ZTpmdW5jdGlvbih0KXtjb25zb2xlLmVycm9yKHQpfSxsPVtcInBhZGRpbmdMZWZ0XCIsXCJwYWRkaW5nUmlnaHRcIixcInBhZGRpbmdUb3BcIixcInBhZGRpbmdCb3R0b21cIixcIm1hcmdpbkxlZnRcIixcIm1hcmdpblJpZ2h0XCIsXCJtYXJnaW5Ub3BcIixcIm1hcmdpbkJvdHRvbVwiLFwiYm9yZGVyTGVmdFdpZHRoXCIsXCJib3JkZXJSaWdodFdpZHRoXCIsXCJib3JkZXJUb3BXaWR0aFwiLFwiYm9yZGVyQm90dG9tV2lkdGhcIl0saD1sLmxlbmd0aCxjPSExO3JldHVybiBvfSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZGVzYW5kcm8tbWF0Y2hlcy1zZWxlY3Rvci9tYXRjaGVzLXNlbGVjdG9yXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQubWF0Y2hlc1NlbGVjdG9yPWUoKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7dmFyIHQ9ZnVuY3Rpb24oKXt2YXIgdD1FbGVtZW50LnByb3RvdHlwZTtpZih0Lm1hdGNoZXMpcmV0dXJuXCJtYXRjaGVzXCI7aWYodC5tYXRjaGVzU2VsZWN0b3IpcmV0dXJuXCJtYXRjaGVzU2VsZWN0b3JcIjtmb3IodmFyIGU9W1wid2Via2l0XCIsXCJtb3pcIixcIm1zXCIsXCJvXCJdLGk9MDtpPGUubGVuZ3RoO2krKyl7dmFyIG49ZVtpXSxzPW4rXCJNYXRjaGVzU2VsZWN0b3JcIjtpZih0W3NdKXJldHVybiBzfX0oKTtyZXR1cm4gZnVuY3Rpb24oZSxpKXtyZXR1cm4gZVt0XShpKX19KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFtcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yXCIpKTp0LmZpenp5VUlVdGlscz1lKHQsdC5tYXRjaGVzU2VsZWN0b3IpfSh3aW5kb3csZnVuY3Rpb24odCxlKXt2YXIgaT17fTtpLmV4dGVuZD1mdW5jdGlvbih0LGUpe2Zvcih2YXIgaSBpbiBlKXRbaV09ZVtpXTtyZXR1cm4gdH0saS5tb2R1bG89ZnVuY3Rpb24odCxlKXtyZXR1cm4odCVlK2UpJWV9LGkubWFrZUFycmF5PWZ1bmN0aW9uKHQpe3ZhciBlPVtdO2lmKEFycmF5LmlzQXJyYXkodCkpZT10O2Vsc2UgaWYodCYmXCJudW1iZXJcIj09dHlwZW9mIHQubGVuZ3RoKWZvcih2YXIgaT0wO2k8dC5sZW5ndGg7aSsrKWUucHVzaCh0W2ldKTtlbHNlIGUucHVzaCh0KTtyZXR1cm4gZX0saS5yZW1vdmVGcm9tPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5pbmRleE9mKGUpO2khPS0xJiZ0LnNwbGljZShpLDEpfSxpLmdldFBhcmVudD1mdW5jdGlvbih0LGkpe2Zvcig7dCE9ZG9jdW1lbnQuYm9keTspaWYodD10LnBhcmVudE5vZGUsZSh0LGkpKXJldHVybiB0fSxpLmdldFF1ZXJ5RWxlbWVudD1mdW5jdGlvbih0KXtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdD9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKHQpOnR9LGkuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxpLmZpbHRlckZpbmRFbGVtZW50cz1mdW5jdGlvbih0LG4pe3Q9aS5tYWtlQXJyYXkodCk7dmFyIHM9W107cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXtpZih0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpe2lmKCFuKXJldHVybiB2b2lkIHMucHVzaCh0KTtlKHQsbikmJnMucHVzaCh0KTtmb3IodmFyIGk9dC5xdWVyeVNlbGVjdG9yQWxsKG4pLG89MDtvPGkubGVuZ3RoO28rKylzLnB1c2goaVtvXSl9fSksc30saS5kZWJvdW5jZU1ldGhvZD1mdW5jdGlvbih0LGUsaSl7dmFyIG49dC5wcm90b3R5cGVbZV0scz1lK1wiVGltZW91dFwiO3QucHJvdG90eXBlW2VdPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpc1tzXTt0JiZjbGVhclRpbWVvdXQodCk7dmFyIGU9YXJndW1lbnRzLG89dGhpczt0aGlzW3NdPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtuLmFwcGx5KG8sZSksZGVsZXRlIG9bc119LGl8fDEwMCl9fSxpLmRvY1JlYWR5PWZ1bmN0aW9uKHQpe3ZhciBlPWRvY3VtZW50LnJlYWR5U3RhdGU7XCJjb21wbGV0ZVwiPT1lfHxcImludGVyYWN0aXZlXCI9PWU/c2V0VGltZW91dCh0KTpkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLHQpfSxpLnRvRGFzaGVkPWZ1bmN0aW9uKHQpe3JldHVybiB0LnJlcGxhY2UoLyguKShbQS1aXSkvZyxmdW5jdGlvbih0LGUsaSl7cmV0dXJuIGUrXCItXCIraX0pLnRvTG93ZXJDYXNlKCl9O3ZhciBuPXQuY29uc29sZTtyZXR1cm4gaS5odG1sSW5pdD1mdW5jdGlvbihlLHMpe2kuZG9jUmVhZHkoZnVuY3Rpb24oKXt2YXIgbz1pLnRvRGFzaGVkKHMpLHI9XCJkYXRhLVwiK28sYT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW1wiK3IrXCJdXCIpLGw9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1cIitvKSxoPWkubWFrZUFycmF5KGEpLmNvbmNhdChpLm1ha2VBcnJheShsKSksYz1yK1wiLW9wdGlvbnNcIixkPXQualF1ZXJ5O2guZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgaSxvPXQuZ2V0QXR0cmlidXRlKHIpfHx0LmdldEF0dHJpYnV0ZShjKTt0cnl7aT1vJiZKU09OLnBhcnNlKG8pfWNhdGNoKGEpe3JldHVybiB2b2lkKG4mJm4uZXJyb3IoXCJFcnJvciBwYXJzaW5nIFwiK3IrXCIgb24gXCIrdC5jbGFzc05hbWUrXCI6IFwiK2EpKX12YXIgbD1uZXcgZSh0LGkpO2QmJmQuZGF0YSh0LHMsbCl9KX0pfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvY2VsbFwiLFtcImdldC1zaXplL2dldC1zaXplXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImdldC1zaXplXCIpKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LkNlbGw9ZSh0LHQuZ2V0U2l6ZSkpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSl7dGhpcy5lbGVtZW50PXQsdGhpcy5wYXJlbnQ9ZSx0aGlzLmNyZWF0ZSgpfXZhciBuPWkucHJvdG90eXBlO3JldHVybiBuLmNyZWF0ZT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbj1cImFic29sdXRlXCIsdGhpcy54PTAsdGhpcy5zaGlmdD0wfSxuLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmVsZW1lbnQuc3R5bGUucG9zaXRpb249XCJcIjt2YXIgdD10aGlzLnBhcmVudC5vcmlnaW5TaWRlO3RoaXMuZWxlbWVudC5zdHlsZVt0XT1cIlwifSxuLmdldFNpemU9ZnVuY3Rpb24oKXt0aGlzLnNpemU9ZSh0aGlzLmVsZW1lbnQpfSxuLnNldFBvc2l0aW9uPWZ1bmN0aW9uKHQpe3RoaXMueD10LHRoaXMudXBkYXRlVGFyZ2V0KCksdGhpcy5yZW5kZXJQb3NpdGlvbih0KX0sbi51cGRhdGVUYXJnZXQ9bi5zZXREZWZhdWx0VGFyZ2V0PWZ1bmN0aW9uKCl7dmFyIHQ9XCJsZWZ0XCI9PXRoaXMucGFyZW50Lm9yaWdpblNpZGU/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiO3RoaXMudGFyZ2V0PXRoaXMueCt0aGlzLnNpemVbdF0rdGhpcy5zaXplLndpZHRoKnRoaXMucGFyZW50LmNlbGxBbGlnbn0sbi5yZW5kZXJQb3NpdGlvbj1mdW5jdGlvbih0KXt2YXIgZT10aGlzLnBhcmVudC5vcmlnaW5TaWRlO3RoaXMuZWxlbWVudC5zdHlsZVtlXT10aGlzLnBhcmVudC5nZXRQb3NpdGlvblZhbHVlKHQpfSxuLndyYXBTaGlmdD1mdW5jdGlvbih0KXt0aGlzLnNoaWZ0PXQsdGhpcy5yZW5kZXJQb3NpdGlvbih0aGlzLngrdGhpcy5wYXJlbnQuc2xpZGVhYmxlV2lkdGgqdCl9LG4ucmVtb3ZlPWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KX0saX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3NsaWRlXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuU2xpZGU9ZSgpKX0od2luZG93LGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXt0aGlzLnBhcmVudD10LHRoaXMuaXNPcmlnaW5MZWZ0PVwibGVmdFwiPT10Lm9yaWdpblNpZGUsdGhpcy5jZWxscz1bXSx0aGlzLm91dGVyV2lkdGg9MCx0aGlzLmhlaWdodD0wfXZhciBlPXQucHJvdG90eXBlO3JldHVybiBlLmFkZENlbGw9ZnVuY3Rpb24odCl7aWYodGhpcy5jZWxscy5wdXNoKHQpLHRoaXMub3V0ZXJXaWR0aCs9dC5zaXplLm91dGVyV2lkdGgsdGhpcy5oZWlnaHQ9TWF0aC5tYXgodC5zaXplLm91dGVySGVpZ2h0LHRoaXMuaGVpZ2h0KSwxPT10aGlzLmNlbGxzLmxlbmd0aCl7dGhpcy54PXQueDt2YXIgZT10aGlzLmlzT3JpZ2luTGVmdD9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCI7dGhpcy5maXJzdE1hcmdpbj10LnNpemVbZV19fSxlLnVwZGF0ZVRhcmdldD1mdW5jdGlvbigpe3ZhciB0PXRoaXMuaXNPcmlnaW5MZWZ0P1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixlPXRoaXMuZ2V0TGFzdENlbGwoKSxpPWU/ZS5zaXplW3RdOjAsbj10aGlzLm91dGVyV2lkdGgtKHRoaXMuZmlyc3RNYXJnaW4raSk7dGhpcy50YXJnZXQ9dGhpcy54K3RoaXMuZmlyc3RNYXJnaW4rbip0aGlzLnBhcmVudC5jZWxsQWxpZ259LGUuZ2V0TGFzdENlbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxsc1t0aGlzLmNlbGxzLmxlbmd0aC0xXX0sZS5zZWxlY3Q9ZnVuY3Rpb24oKXt0aGlzLmNoYW5nZVNlbGVjdGVkQ2xhc3MoXCJhZGRcIil9LGUudW5zZWxlY3Q9ZnVuY3Rpb24oKXt0aGlzLmNoYW5nZVNlbGVjdGVkQ2xhc3MoXCJyZW1vdmVcIil9LGUuY2hhbmdlU2VsZWN0ZWRDbGFzcz1mdW5jdGlvbih0KXt0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5lbGVtZW50LmNsYXNzTGlzdFt0XShcImlzLXNlbGVjdGVkXCIpfSl9LGUuZ2V0Q2VsbEVsZW1lbnRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHMubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2FuaW1hdGVcIixbXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6KHQuRmxpY2tpdHk9dC5GbGlja2l0eXx8e30sdC5GbGlja2l0eS5hbmltYXRlUHJvdG90eXBlPWUodCx0LmZpenp5VUlVdGlscykpfSh3aW5kb3csZnVuY3Rpb24odCxlKXt2YXIgaT10LnJlcXVlc3RBbmltYXRpb25GcmFtZXx8dC53ZWJraXRSZXF1ZXN0QW5pbWF0aW9uRnJhbWUsbj0wO2l8fChpPWZ1bmN0aW9uKHQpe3ZhciBlPShuZXcgRGF0ZSkuZ2V0VGltZSgpLGk9TWF0aC5tYXgoMCwxNi0oZS1uKSkscz1zZXRUaW1lb3V0KHQsaSk7cmV0dXJuIG49ZStpLHN9KTt2YXIgcz17fTtzLnN0YXJ0QW5pbWF0aW9uPWZ1bmN0aW9uKCl7dGhpcy5pc0FuaW1hdGluZ3x8KHRoaXMuaXNBbmltYXRpbmc9ITAsdGhpcy5yZXN0aW5nRnJhbWVzPTAsdGhpcy5hbmltYXRlKCkpfSxzLmFuaW1hdGU9ZnVuY3Rpb24oKXt0aGlzLmFwcGx5RHJhZ0ZvcmNlKCksdGhpcy5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbigpO3ZhciB0PXRoaXMueDtpZih0aGlzLmludGVncmF0ZVBoeXNpY3MoKSx0aGlzLnBvc2l0aW9uU2xpZGVyKCksdGhpcy5zZXR0bGUodCksdGhpcy5pc0FuaW1hdGluZyl7dmFyIGU9dGhpcztpKGZ1bmN0aW9uKCl7ZS5hbmltYXRlKCl9KX19O3ZhciBvPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnN0eWxlO3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0LnRyYW5zZm9ybT9cInRyYW5zZm9ybVwiOlwiV2Via2l0VHJhbnNmb3JtXCJ9KCk7cmV0dXJuIHMucG9zaXRpb25TbGlkZXI9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLng7dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuY2VsbHMubGVuZ3RoPjEmJih0PWUubW9kdWxvKHQsdGhpcy5zbGlkZWFibGVXaWR0aCksdC09dGhpcy5zbGlkZWFibGVXaWR0aCx0aGlzLnNoaWZ0V3JhcENlbGxzKHQpKSx0Kz10aGlzLmN1cnNvclBvc2l0aW9uLHQ9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0JiZvPy10OnQ7dmFyIGk9dGhpcy5nZXRQb3NpdGlvblZhbHVlKHQpO3RoaXMuc2xpZGVyLnN0eWxlW29dPXRoaXMuaXNBbmltYXRpbmc/XCJ0cmFuc2xhdGUzZChcIitpK1wiLDAsMClcIjpcInRyYW5zbGF0ZVgoXCIraStcIilcIjt2YXIgbj10aGlzLnNsaWRlc1swXTtpZihuKXt2YXIgcz0tdGhpcy54LW4udGFyZ2V0LHI9cy90aGlzLnNsaWRlc1dpZHRoO3RoaXMuZGlzcGF0Y2hFdmVudChcInNjcm9sbFwiLG51bGwsW3Isc10pfX0scy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQ9ZnVuY3Rpb24oKXt0aGlzLmNlbGxzLmxlbmd0aCYmKHRoaXMueD0tdGhpcy5zZWxlY3RlZFNsaWRlLnRhcmdldCx0aGlzLnBvc2l0aW9uU2xpZGVyKCkpfSxzLmdldFBvc2l0aW9uVmFsdWU9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMub3B0aW9ucy5wZXJjZW50UG9zaXRpb24/LjAxKk1hdGgucm91bmQodC90aGlzLnNpemUuaW5uZXJXaWR0aCoxZTQpK1wiJVwiOk1hdGgucm91bmQodCkrXCJweFwifSxzLnNldHRsZT1mdW5jdGlvbih0KXt0aGlzLmlzUG9pbnRlckRvd258fE1hdGgucm91bmQoMTAwKnRoaXMueCkhPU1hdGgucm91bmQoMTAwKnQpfHx0aGlzLnJlc3RpbmdGcmFtZXMrKyx0aGlzLnJlc3RpbmdGcmFtZXM+MiYmKHRoaXMuaXNBbmltYXRpbmc9ITEsZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nLHRoaXMucG9zaXRpb25TbGlkZXIoKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJzZXR0bGVcIikpfSxzLnNoaWZ0V3JhcENlbGxzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuY3Vyc29yUG9zaXRpb24rdDt0aGlzLl9zaGlmdENlbGxzKHRoaXMuYmVmb3JlU2hpZnRDZWxscyxlLC0xKTt2YXIgaT10aGlzLnNpemUuaW5uZXJXaWR0aC0odCt0aGlzLnNsaWRlYWJsZVdpZHRoK3RoaXMuY3Vyc29yUG9zaXRpb24pO3RoaXMuX3NoaWZ0Q2VsbHModGhpcy5hZnRlclNoaWZ0Q2VsbHMsaSwxKX0scy5fc2hpZnRDZWxscz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPTA7bjx0Lmxlbmd0aDtuKyspe3ZhciBzPXRbbl0sbz1lPjA/aTowO3Mud3JhcFNoaWZ0KG8pLGUtPXMuc2l6ZS5vdXRlcldpZHRofX0scy5fdW5zaGlmdENlbGxzPWZ1bmN0aW9uKHQpe2lmKHQmJnQubGVuZ3RoKWZvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXRbZV0ud3JhcFNoaWZ0KDApfSxzLmludGVncmF0ZVBoeXNpY3M9ZnVuY3Rpb24oKXt0aGlzLngrPXRoaXMudmVsb2NpdHksdGhpcy52ZWxvY2l0eSo9dGhpcy5nZXRGcmljdGlvbkZhY3RvcigpfSxzLmFwcGx5Rm9yY2U9ZnVuY3Rpb24odCl7dGhpcy52ZWxvY2l0eSs9dH0scy5nZXRGcmljdGlvbkZhY3Rvcj1mdW5jdGlvbigpe3JldHVybiAxLXRoaXMub3B0aW9uc1t0aGlzLmlzRnJlZVNjcm9sbGluZz9cImZyZWVTY3JvbGxGcmljdGlvblwiOlwiZnJpY3Rpb25cIl19LHMuZ2V0UmVzdGluZ1Bvc2l0aW9uPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMueCt0aGlzLnZlbG9jaXR5LygxLXRoaXMuZ2V0RnJpY3Rpb25GYWN0b3IoKSl9LHMuYXBwbHlEcmFnRm9yY2U9ZnVuY3Rpb24oKXtpZih0aGlzLmlzUG9pbnRlckRvd24pe3ZhciB0PXRoaXMuZHJhZ1gtdGhpcy54LGU9dC10aGlzLnZlbG9jaXR5O3RoaXMuYXBwbHlGb3JjZShlKX19LHMuYXBwbHlTZWxlY3RlZEF0dHJhY3Rpb249ZnVuY3Rpb24oKXtpZighdGhpcy5pc1BvaW50ZXJEb3duJiYhdGhpcy5pc0ZyZWVTY3JvbGxpbmcmJnRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD10aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0Ki0xLXRoaXMueCxlPXQqdGhpcy5vcHRpb25zLnNlbGVjdGVkQXR0cmFjdGlvbjt0aGlzLmFwcGx5Rm9yY2UoZSl9fSxzfSksZnVuY3Rpb24odCxlKXtpZihcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQpZGVmaW5lKFwiZmxpY2tpdHkvanMvZmxpY2tpdHlcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIixcImdldC1zaXplL2dldC1zaXplXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFwiLi9jZWxsXCIsXCIuL3NsaWRlXCIsXCIuL2FuaW1hdGVcIl0sZnVuY3Rpb24oaSxuLHMsbyxyLGEpe3JldHVybiBlKHQsaSxuLHMsbyxyLGEpfSk7ZWxzZSBpZihcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyltb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikscmVxdWlyZShcImdldC1zaXplXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSxyZXF1aXJlKFwiLi9jZWxsXCIpLHJlcXVpcmUoXCIuL3NsaWRlXCIpLHJlcXVpcmUoXCIuL2FuaW1hdGVcIikpO2Vsc2V7dmFyIGk9dC5GbGlja2l0eTt0LkZsaWNraXR5PWUodCx0LkV2RW1pdHRlcix0LmdldFNpemUsdC5maXp6eVVJVXRpbHMsaS5DZWxsLGkuU2xpZGUsaS5hbmltYXRlUHJvdG90eXBlKX19KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuLHMsbyxyKXtmdW5jdGlvbiBhKHQsZSl7Zm9yKHQ9bi5tYWtlQXJyYXkodCk7dC5sZW5ndGg7KWUuYXBwZW5kQ2hpbGQodC5zaGlmdCgpKX1mdW5jdGlvbiBsKHQsZSl7dmFyIGk9bi5nZXRRdWVyeUVsZW1lbnQodCk7aWYoIWkpcmV0dXJuIHZvaWQoZCYmZC5lcnJvcihcIkJhZCBlbGVtZW50IGZvciBGbGlja2l0eTogXCIrKGl8fHQpKSk7aWYodGhpcy5lbGVtZW50PWksdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCl7dmFyIHM9Zlt0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEXTtyZXR1cm4gcy5vcHRpb24oZSksc31oJiYodGhpcy4kZWxlbWVudD1oKHRoaXMuZWxlbWVudCkpLHRoaXMub3B0aW9ucz1uLmV4dGVuZCh7fSx0aGlzLmNvbnN0cnVjdG9yLmRlZmF1bHRzKSx0aGlzLm9wdGlvbihlKSx0aGlzLl9jcmVhdGUoKX12YXIgaD10LmpRdWVyeSxjPXQuZ2V0Q29tcHV0ZWRTdHlsZSxkPXQuY29uc29sZSx1PTAsZj17fTtsLmRlZmF1bHRzPXthY2Nlc3NpYmlsaXR5OiEwLGNlbGxBbGlnbjpcImNlbnRlclwiLGZyZWVTY3JvbGxGcmljdGlvbjouMDc1LGZyaWN0aW9uOi4yOCxuYW1lc3BhY2VKUXVlcnlFdmVudHM6ITAscGVyY2VudFBvc2l0aW9uOiEwLHJlc2l6ZTohMCxzZWxlY3RlZEF0dHJhY3Rpb246LjAyNSxzZXRHYWxsZXJ5U2l6ZTohMH0sbC5jcmVhdGVNZXRob2RzPVtdO3ZhciBwPWwucHJvdG90eXBlO24uZXh0ZW5kKHAsZS5wcm90b3R5cGUpLHAuX2NyZWF0ZT1mdW5jdGlvbigpe3ZhciBlPXRoaXMuZ3VpZD0rK3U7dGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRD1lLGZbZV09dGhpcyx0aGlzLnNlbGVjdGVkSW5kZXg9MCx0aGlzLnJlc3RpbmdGcmFtZXM9MCx0aGlzLng9MCx0aGlzLnZlbG9jaXR5PTAsdGhpcy5vcmlnaW5TaWRlPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cInJpZ2h0XCI6XCJsZWZ0XCIsdGhpcy52aWV3cG9ydD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLHRoaXMudmlld3BvcnQuY2xhc3NOYW1lPVwiZmxpY2tpdHktdmlld3BvcnRcIix0aGlzLl9jcmVhdGVTbGlkZXIoKSwodGhpcy5vcHRpb25zLnJlc2l6ZXx8dGhpcy5vcHRpb25zLndhdGNoQ1NTKSYmdC5hZGRFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcyksbC5jcmVhdGVNZXRob2RzLmZvckVhY2goZnVuY3Rpb24odCl7dGhpc1t0XSgpfSx0aGlzKSx0aGlzLm9wdGlvbnMud2F0Y2hDU1M/dGhpcy53YXRjaENTUygpOnRoaXMuYWN0aXZhdGUoKX0scC5vcHRpb249ZnVuY3Rpb24odCl7bi5leHRlbmQodGhpcy5vcHRpb25zLHQpfSxwLmFjdGl2YXRlPWZ1bmN0aW9uKCl7aWYoIXRoaXMuaXNBY3RpdmUpe3RoaXMuaXNBY3RpdmU9ITAsdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJmbGlja2l0eS1lbmFibGVkXCIpLHRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCYmdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJmbGlja2l0eS1ydGxcIiksdGhpcy5nZXRTaXplKCk7dmFyIHQ9dGhpcy5fZmlsdGVyRmluZENlbGxFbGVtZW50cyh0aGlzLmVsZW1lbnQuY2hpbGRyZW4pO2EodCx0aGlzLnNsaWRlciksdGhpcy52aWV3cG9ydC5hcHBlbmRDaGlsZCh0aGlzLnNsaWRlciksdGhpcy5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMudmlld3BvcnQpLHRoaXMucmVsb2FkQ2VsbHMoKSx0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKHRoaXMuZWxlbWVudC50YWJJbmRleD0wLHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLHRoaXMpKSx0aGlzLmVtaXRFdmVudChcImFjdGl2YXRlXCIpO3ZhciBlLGk9dGhpcy5vcHRpb25zLmluaXRpYWxJbmRleDtlPXRoaXMuaXNJbml0QWN0aXZhdGVkP3RoaXMuc2VsZWN0ZWRJbmRleDp2b2lkIDAhPT1pJiZ0aGlzLmNlbGxzW2ldP2k6MCx0aGlzLnNlbGVjdChlLCExLCEwKSx0aGlzLmlzSW5pdEFjdGl2YXRlZD0hMH19LHAuX2NyZWF0ZVNsaWRlcj1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dC5jbGFzc05hbWU9XCJmbGlja2l0eS1zbGlkZXJcIix0LnN0eWxlW3RoaXMub3JpZ2luU2lkZV09MCx0aGlzLnNsaWRlcj10fSxwLl9maWx0ZXJGaW5kQ2VsbEVsZW1lbnRzPWZ1bmN0aW9uKHQpe3JldHVybiBuLmZpbHRlckZpbmRFbGVtZW50cyh0LHRoaXMub3B0aW9ucy5jZWxsU2VsZWN0b3IpfSxwLnJlbG9hZENlbGxzPWZ1bmN0aW9uKCl7dGhpcy5jZWxscz10aGlzLl9tYWtlQ2VsbHModGhpcy5zbGlkZXIuY2hpbGRyZW4pLHRoaXMucG9zaXRpb25DZWxscygpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpfSxwLl9tYWtlQ2VsbHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5fZmlsdGVyRmluZENlbGxFbGVtZW50cyh0KSxpPWUubWFwKGZ1bmN0aW9uKHQpe3JldHVybiBuZXcgcyh0LHRoaXMpfSx0aGlzKTtyZXR1cm4gaX0scC5nZXRMYXN0Q2VsbD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzW3RoaXMuY2VsbHMubGVuZ3RoLTFdfSxwLmdldExhc3RTbGlkZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnNsaWRlc1t0aGlzLnNsaWRlcy5sZW5ndGgtMV19LHAucG9zaXRpb25DZWxscz1mdW5jdGlvbigpe3RoaXMuX3NpemVDZWxscyh0aGlzLmNlbGxzKSx0aGlzLl9wb3NpdGlvbkNlbGxzKDApfSxwLl9wb3NpdGlvbkNlbGxzPWZ1bmN0aW9uKHQpe3Q9dHx8MCx0aGlzLm1heENlbGxIZWlnaHQ9dD90aGlzLm1heENlbGxIZWlnaHR8fDA6MDt2YXIgZT0wO2lmKHQ+MCl7dmFyIGk9dGhpcy5jZWxsc1t0LTFdO2U9aS54K2kuc2l6ZS5vdXRlcldpZHRofWZvcih2YXIgbj10aGlzLmNlbGxzLmxlbmd0aCxzPXQ7czxuO3MrKyl7dmFyIG89dGhpcy5jZWxsc1tzXTtvLnNldFBvc2l0aW9uKGUpLGUrPW8uc2l6ZS5vdXRlcldpZHRoLHRoaXMubWF4Q2VsbEhlaWdodD1NYXRoLm1heChvLnNpemUub3V0ZXJIZWlnaHQsdGhpcy5tYXhDZWxsSGVpZ2h0KX10aGlzLnNsaWRlYWJsZVdpZHRoPWUsdGhpcy51cGRhdGVTbGlkZXMoKSx0aGlzLl9jb250YWluU2xpZGVzKCksdGhpcy5zbGlkZXNXaWR0aD1uP3RoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0LXRoaXMuc2xpZGVzWzBdLnRhcmdldDowfSxwLl9zaXplQ2VsbHM9ZnVuY3Rpb24odCl7dC5mb3JFYWNoKGZ1bmN0aW9uKHQpe3QuZ2V0U2l6ZSgpfSl9LHAudXBkYXRlU2xpZGVzPWZ1bmN0aW9uKCl7aWYodGhpcy5zbGlkZXM9W10sdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PW5ldyBvKHRoaXMpO3RoaXMuc2xpZGVzLnB1c2godCk7dmFyIGU9XCJsZWZ0XCI9PXRoaXMub3JpZ2luU2lkZSxpPWU/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLG49dGhpcy5fZ2V0Q2FuQ2VsbEZpdCgpO3RoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbihlLHMpe2lmKCF0LmNlbGxzLmxlbmd0aClyZXR1cm4gdm9pZCB0LmFkZENlbGwoZSk7dmFyIHI9dC5vdXRlcldpZHRoLXQuZmlyc3RNYXJnaW4rKGUuc2l6ZS5vdXRlcldpZHRoLWUuc2l6ZVtpXSk7bi5jYWxsKHRoaXMscyxyKT90LmFkZENlbGwoZSk6KHQudXBkYXRlVGFyZ2V0KCksdD1uZXcgbyh0aGlzKSx0aGlzLnNsaWRlcy5wdXNoKHQpLHQuYWRkQ2VsbChlKSl9LHRoaXMpLHQudXBkYXRlVGFyZ2V0KCksdGhpcy51cGRhdGVTZWxlY3RlZFNsaWRlKCl9fSxwLl9nZXRDYW5DZWxsRml0PWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLmdyb3VwQ2VsbHM7aWYoIXQpcmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuITF9O2lmKFwibnVtYmVyXCI9PXR5cGVvZiB0KXt2YXIgZT1wYXJzZUludCh0LDEwKTtyZXR1cm4gZnVuY3Rpb24odCl7cmV0dXJuIHQlZSE9PTB9fXZhciBpPVwic3RyaW5nXCI9PXR5cGVvZiB0JiZ0Lm1hdGNoKC9eKFxcZCspJSQvKSxuPWk/cGFyc2VJbnQoaVsxXSwxMCkvMTAwOjE7cmV0dXJuIGZ1bmN0aW9uKHQsZSl7cmV0dXJuIGU8PSh0aGlzLnNpemUuaW5uZXJXaWR0aCsxKSpufX0scC5faW5pdD1wLnJlcG9zaXRpb249ZnVuY3Rpb24oKXt0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpfSxwLmdldFNpemU9ZnVuY3Rpb24oKXt0aGlzLnNpemU9aSh0aGlzLmVsZW1lbnQpLHRoaXMuc2V0Q2VsbEFsaWduKCksdGhpcy5jdXJzb3JQb3NpdGlvbj10aGlzLnNpemUuaW5uZXJXaWR0aCp0aGlzLmNlbGxBbGlnbn07dmFyIHY9e2NlbnRlcjp7bGVmdDouNSxyaWdodDouNX0sbGVmdDp7bGVmdDowLHJpZ2h0OjF9LHJpZ2h0OntyaWdodDowLGxlZnQ6MX19O3JldHVybiBwLnNldENlbGxBbGlnbj1mdW5jdGlvbigpe3ZhciB0PXZbdGhpcy5vcHRpb25zLmNlbGxBbGlnbl07dGhpcy5jZWxsQWxpZ249dD90W3RoaXMub3JpZ2luU2lkZV06dGhpcy5vcHRpb25zLmNlbGxBbGlnbn0scC5zZXRHYWxsZXJ5U2l6ZT1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy5zZXRHYWxsZXJ5U2l6ZSl7dmFyIHQ9dGhpcy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0JiZ0aGlzLnNlbGVjdGVkU2xpZGU/dGhpcy5zZWxlY3RlZFNsaWRlLmhlaWdodDp0aGlzLm1heENlbGxIZWlnaHQ7dGhpcy52aWV3cG9ydC5zdHlsZS5oZWlnaHQ9dCtcInB4XCJ9fSxwLl9nZXRXcmFwU2hpZnRDZWxscz1mdW5jdGlvbigpe2lmKHRoaXMub3B0aW9ucy53cmFwQXJvdW5kKXt0aGlzLl91bnNoaWZ0Q2VsbHModGhpcy5iZWZvcmVTaGlmdENlbGxzKSx0aGlzLl91bnNoaWZ0Q2VsbHModGhpcy5hZnRlclNoaWZ0Q2VsbHMpO3ZhciB0PXRoaXMuY3Vyc29yUG9zaXRpb24sZT10aGlzLmNlbGxzLmxlbmd0aC0xO3RoaXMuYmVmb3JlU2hpZnRDZWxscz10aGlzLl9nZXRHYXBDZWxscyh0LGUsLTEpLHQ9dGhpcy5zaXplLmlubmVyV2lkdGgtdGhpcy5jdXJzb3JQb3NpdGlvbix0aGlzLmFmdGVyU2hpZnRDZWxscz10aGlzLl9nZXRHYXBDZWxscyh0LDAsMSl9fSxwLl9nZXRHYXBDZWxscz1mdW5jdGlvbih0LGUsaSl7Zm9yKHZhciBuPVtdO3Q+MDspe3ZhciBzPXRoaXMuY2VsbHNbZV07aWYoIXMpYnJlYWs7bi5wdXNoKHMpLGUrPWksdC09cy5zaXplLm91dGVyV2lkdGh9cmV0dXJuIG59LHAuX2NvbnRhaW5TbGlkZXM9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuY29udGFpbiYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLmNlbGxzLmxlbmd0aCl7dmFyIHQ9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0LGU9dD9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsaT10P1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIixuPXRoaXMuc2xpZGVhYmxlV2lkdGgtdGhpcy5nZXRMYXN0Q2VsbCgpLnNpemVbaV0scz1uPHRoaXMuc2l6ZS5pbm5lcldpZHRoLG89dGhpcy5jdXJzb3JQb3NpdGlvbit0aGlzLmNlbGxzWzBdLnNpemVbZV0scj1uLXRoaXMuc2l6ZS5pbm5lcldpZHRoKigxLXRoaXMuY2VsbEFsaWduKTt0aGlzLnNsaWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3M/dC50YXJnZXQ9bip0aGlzLmNlbGxBbGlnbjoodC50YXJnZXQ9TWF0aC5tYXgodC50YXJnZXQsbyksdC50YXJnZXQ9TWF0aC5taW4odC50YXJnZXQscikpfSx0aGlzKX19LHAuZGlzcGF0Y2hFdmVudD1mdW5jdGlvbih0LGUsaSl7dmFyIG49ZT9bZV0uY29uY2F0KGkpOmk7aWYodGhpcy5lbWl0RXZlbnQodCxuKSxoJiZ0aGlzLiRlbGVtZW50KXt0Kz10aGlzLm9wdGlvbnMubmFtZXNwYWNlSlF1ZXJ5RXZlbnRzP1wiLmZsaWNraXR5XCI6XCJcIjt2YXIgcz10O2lmKGUpe3ZhciBvPWguRXZlbnQoZSk7by50eXBlPXQscz1vfXRoaXMuJGVsZW1lbnQudHJpZ2dlcihzLGkpfX0scC5zZWxlY3Q9ZnVuY3Rpb24odCxlLGkpe3RoaXMuaXNBY3RpdmUmJih0PXBhcnNlSW50KHQsMTApLHRoaXMuX3dyYXBTZWxlY3QodCksKHRoaXMub3B0aW9ucy53cmFwQXJvdW5kfHxlKSYmKHQ9bi5tb2R1bG8odCx0aGlzLnNsaWRlcy5sZW5ndGgpKSx0aGlzLnNsaWRlc1t0XSYmKHRoaXMuc2VsZWN0ZWRJbmRleD10LHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpLGk/dGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKTp0aGlzLnN0YXJ0QW5pbWF0aW9uKCksdGhpcy5vcHRpb25zLmFkYXB0aXZlSGVpZ2h0JiZ0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5kaXNwYXRjaEV2ZW50KFwic2VsZWN0XCIpLHRoaXMuZGlzcGF0Y2hFdmVudChcImNlbGxTZWxlY3RcIikpKX0scC5fd3JhcFNlbGVjdD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLnNsaWRlcy5sZW5ndGgsaT10aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmZT4xO2lmKCFpKXJldHVybiB0O3ZhciBzPW4ubW9kdWxvKHQsZSksbz1NYXRoLmFicyhzLXRoaXMuc2VsZWN0ZWRJbmRleCkscj1NYXRoLmFicyhzK2UtdGhpcy5zZWxlY3RlZEluZGV4KSxhPU1hdGguYWJzKHMtZS10aGlzLnNlbGVjdGVkSW5kZXgpOyF0aGlzLmlzRHJhZ1NlbGVjdCYmcjxvP3QrPWU6IXRoaXMuaXNEcmFnU2VsZWN0JiZhPG8mJih0LT1lKSx0PDA/dGhpcy54LT10aGlzLnNsaWRlYWJsZVdpZHRoOnQ+PWUmJih0aGlzLngrPXRoaXMuc2xpZGVhYmxlV2lkdGgpfSxwLnByZXZpb3VzPWZ1bmN0aW9uKHQsZSl7dGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4LTEsdCxlKX0scC5uZXh0PWZ1bmN0aW9uKHQsZSl7dGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4KzEsdCxlKX0scC51cGRhdGVTZWxlY3RlZFNsaWRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5zbGlkZXNbdGhpcy5zZWxlY3RlZEluZGV4XTt0JiYodGhpcy51bnNlbGVjdFNlbGVjdGVkU2xpZGUoKSx0aGlzLnNlbGVjdGVkU2xpZGU9dCx0LnNlbGVjdCgpLHRoaXMuc2VsZWN0ZWRDZWxscz10LmNlbGxzLHRoaXMuc2VsZWN0ZWRFbGVtZW50cz10LmdldENlbGxFbGVtZW50cygpLHRoaXMuc2VsZWN0ZWRDZWxsPXQuY2VsbHNbMF0sdGhpcy5zZWxlY3RlZEVsZW1lbnQ9dGhpcy5zZWxlY3RlZEVsZW1lbnRzWzBdKX0scC51bnNlbGVjdFNlbGVjdGVkU2xpZGU9ZnVuY3Rpb24oKXt0aGlzLnNlbGVjdGVkU2xpZGUmJnRoaXMuc2VsZWN0ZWRTbGlkZS51bnNlbGVjdCgpfSxwLnNlbGVjdENlbGw9ZnVuY3Rpb24odCxlLGkpe3ZhciBuO1wibnVtYmVyXCI9PXR5cGVvZiB0P249dGhpcy5jZWxsc1t0XTooXCJzdHJpbmdcIj09dHlwZW9mIHQmJih0PXRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHQpKSxuPXRoaXMuZ2V0Q2VsbCh0KSk7Zm9yKHZhciBzPTA7biYmczx0aGlzLnNsaWRlcy5sZW5ndGg7cysrKXt2YXIgbz10aGlzLnNsaWRlc1tzXSxyPW8uY2VsbHMuaW5kZXhPZihuKTtpZihyIT0tMSlyZXR1cm4gdm9pZCB0aGlzLnNlbGVjdChzLGUsaSl9fSxwLmdldENlbGw9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0aGlzLmNlbGxzLmxlbmd0aDtlKyspe3ZhciBpPXRoaXMuY2VsbHNbZV07aWYoaS5lbGVtZW50PT10KXJldHVybiBpfX0scC5nZXRDZWxscz1mdW5jdGlvbih0KXt0PW4ubWFrZUFycmF5KHQpO3ZhciBlPVtdO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGk9dGhpcy5nZXRDZWxsKHQpO2kmJmUucHVzaChpKX0sdGhpcyksZX0scC5nZXRDZWxsRWxlbWVudHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pfSxwLmdldFBhcmVudENlbGw9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRDZWxsKHQpO3JldHVybiBlP2U6KHQ9bi5nZXRQYXJlbnQodCxcIi5mbGlja2l0eS1zbGlkZXIgPiAqXCIpLHRoaXMuZ2V0Q2VsbCh0KSl9LHAuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHM9ZnVuY3Rpb24odCxlKXtpZighdClyZXR1cm4gdGhpcy5zZWxlY3RlZFNsaWRlLmdldENlbGxFbGVtZW50cygpO2U9dm9pZCAwPT09ZT90aGlzLnNlbGVjdGVkSW5kZXg6ZTt2YXIgaT10aGlzLnNsaWRlcy5sZW5ndGg7aWYoMSsyKnQ+PWkpcmV0dXJuIHRoaXMuZ2V0Q2VsbEVsZW1lbnRzKCk7Zm9yKHZhciBzPVtdLG89ZS10O288PWUrdDtvKyspe3ZhciByPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kP24ubW9kdWxvKG8saSk6byxhPXRoaXMuc2xpZGVzW3JdO2EmJihzPXMuY29uY2F0KGEuZ2V0Q2VsbEVsZW1lbnRzKCkpKX1yZXR1cm4gc30scC51aUNoYW5nZT1mdW5jdGlvbigpe3RoaXMuZW1pdEV2ZW50KFwidWlDaGFuZ2VcIil9LHAuY2hpbGRVSVBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3RoaXMuZW1pdEV2ZW50KFwiY2hpbGRVSVBvaW50ZXJEb3duXCIsW3RdKX0scC5vbnJlc2l6ZT1mdW5jdGlvbigpe3RoaXMud2F0Y2hDU1MoKSx0aGlzLnJlc2l6ZSgpfSxuLmRlYm91bmNlTWV0aG9kKGwsXCJvbnJlc2l6ZVwiLDE1MCkscC5yZXNpemU9ZnVuY3Rpb24oKXtpZih0aGlzLmlzQWN0aXZlKXt0aGlzLmdldFNpemUoKSx0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmKHRoaXMueD1uLm1vZHVsbyh0aGlzLngsdGhpcy5zbGlkZWFibGVXaWR0aCkpLHRoaXMucG9zaXRpb25DZWxscygpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZW1pdEV2ZW50KFwicmVzaXplXCIpO3ZhciB0PXRoaXMuc2VsZWN0ZWRFbGVtZW50cyYmdGhpcy5zZWxlY3RlZEVsZW1lbnRzWzBdO3RoaXMuc2VsZWN0Q2VsbCh0LCExLCEwKX19LHAud2F0Y2hDU1M9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMud2F0Y2hDU1M7aWYodCl7dmFyIGU9Yyh0aGlzLmVsZW1lbnQsXCI6YWZ0ZXJcIikuY29udGVudDtlLmluZGV4T2YoXCJmbGlja2l0eVwiKSE9LTE/dGhpcy5hY3RpdmF0ZSgpOnRoaXMuZGVhY3RpdmF0ZSgpfX0scC5vbmtleWRvd249ZnVuY3Rpb24odCl7aWYodGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJighZG9jdW1lbnQuYWN0aXZlRWxlbWVudHx8ZG9jdW1lbnQuYWN0aXZlRWxlbWVudD09dGhpcy5lbGVtZW50KSlpZigzNz09dC5rZXlDb2RlKXt2YXIgZT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJuZXh0XCI6XCJwcmV2aW91c1wiO3RoaXMudWlDaGFuZ2UoKSx0aGlzW2VdKCl9ZWxzZSBpZigzOT09dC5rZXlDb2RlKXt2YXIgaT10aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQ/XCJwcmV2aW91c1wiOlwibmV4dFwiO3RoaXMudWlDaGFuZ2UoKSx0aGlzW2ldKCl9fSxwLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLmlzQWN0aXZlJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmbGlja2l0eS1lbmFibGVkXCIpLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpY2tpdHktcnRsXCIpLHRoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbih0KXt0LmRlc3Ryb3koKX0pLHRoaXMudW5zZWxlY3RTZWxlY3RlZFNsaWRlKCksdGhpcy5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMudmlld3BvcnQpLGEodGhpcy5zbGlkZXIuY2hpbGRyZW4sdGhpcy5lbGVtZW50KSx0aGlzLm9wdGlvbnMuYWNjZXNzaWJpbGl0eSYmKHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoXCJ0YWJJbmRleFwiKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzKSksdGhpcy5pc0FjdGl2ZT0hMSx0aGlzLmVtaXRFdmVudChcImRlYWN0aXZhdGVcIikpfSxwLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmRlYWN0aXZhdGUoKSx0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzKSx0aGlzLmVtaXRFdmVudChcImRlc3Ryb3lcIiksaCYmdGhpcy4kZWxlbWVudCYmaC5yZW1vdmVEYXRhKHRoaXMuZWxlbWVudCxcImZsaWNraXR5XCIpLGRlbGV0ZSB0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlELGRlbGV0ZSBmW3RoaXMuZ3VpZF19LG4uZXh0ZW5kKHAsciksbC5kYXRhPWZ1bmN0aW9uKHQpe3Q9bi5nZXRRdWVyeUVsZW1lbnQodCk7dmFyIGU9dCYmdC5mbGlja2l0eUdVSUQ7cmV0dXJuIGUmJmZbZV19LG4uaHRtbEluaXQobCxcImZsaWNraXR5XCIpLGgmJmguYnJpZGdldCYmaC5icmlkZ2V0KFwiZmxpY2tpdHlcIixsKSxsLkNlbGw9cyxsfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidW5pcG9pbnRlci91bmlwb2ludGVyXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikpOnQuVW5pcG9pbnRlcj1lKHQsdC5FdkVtaXR0ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7fWZ1bmN0aW9uIG4oKXt9dmFyIHM9bi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cy5iaW5kU3RhcnRFdmVudD1mdW5jdGlvbih0KXt0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCEwKX0scy51bmJpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKHQpe3RoaXMuX2JpbmRTdGFydEV2ZW50KHQsITEpfSxzLl9iaW5kU3RhcnRFdmVudD1mdW5jdGlvbihlLGkpe2k9dm9pZCAwPT09aXx8ISFpO3ZhciBuPWk/XCJhZGRFdmVudExpc3RlbmVyXCI6XCJyZW1vdmVFdmVudExpc3RlbmVyXCI7dC5uYXZpZ2F0b3IucG9pbnRlckVuYWJsZWQ/ZVtuXShcInBvaW50ZXJkb3duXCIsdGhpcyk6dC5uYXZpZ2F0b3IubXNQb2ludGVyRW5hYmxlZD9lW25dKFwiTVNQb2ludGVyRG93blwiLHRoaXMpOihlW25dKFwibW91c2Vkb3duXCIsdGhpcyksZVtuXShcInRvdWNoc3RhcnRcIix0aGlzKSl9LHMuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxzLmdldFRvdWNoPWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKXt2YXIgaT10W2VdO2lmKGkuaWRlbnRpZmllcj09dGhpcy5wb2ludGVySWRlbnRpZmllcilyZXR1cm4gaX19LHMub25tb3VzZWRvd249ZnVuY3Rpb24odCl7dmFyIGU9dC5idXR0b247ZSYmMCE9PWUmJjEhPT1lfHx0aGlzLl9wb2ludGVyRG93bih0LHQpfSxzLm9udG91Y2hzdGFydD1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyRG93bih0LHQuY2hhbmdlZFRvdWNoZXNbMF0pfSxzLm9uTVNQb2ludGVyRG93bj1zLm9ucG9pbnRlcmRvd249ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlckRvd24odCx0KX0scy5fcG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXt0aGlzLmlzUG9pbnRlckRvd258fCh0aGlzLmlzUG9pbnRlckRvd249ITAsdGhpcy5wb2ludGVySWRlbnRpZmllcj12b2lkIDAhPT1lLnBvaW50ZXJJZD9lLnBvaW50ZXJJZDplLmlkZW50aWZpZXIsdGhpcy5wb2ludGVyRG93bih0LGUpKX0scy5wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe3RoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHModCksdGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyRG93blwiLFt0LGVdKX07dmFyIG89e21vdXNlZG93bjpbXCJtb3VzZW1vdmVcIixcIm1vdXNldXBcIl0sdG91Y2hzdGFydDpbXCJ0b3VjaG1vdmVcIixcInRvdWNoZW5kXCIsXCJ0b3VjaGNhbmNlbFwiXSxwb2ludGVyZG93bjpbXCJwb2ludGVybW92ZVwiLFwicG9pbnRlcnVwXCIsXCJwb2ludGVyY2FuY2VsXCJdLE1TUG9pbnRlckRvd246W1wiTVNQb2ludGVyTW92ZVwiLFwiTVNQb2ludGVyVXBcIixcIk1TUG9pbnRlckNhbmNlbFwiXX07cmV0dXJuIHMuX2JpbmRQb3N0U3RhcnRFdmVudHM9ZnVuY3Rpb24oZSl7aWYoZSl7dmFyIGk9b1tlLnR5cGVdO2kuZm9yRWFjaChmdW5jdGlvbihlKXt0LmFkZEV2ZW50TGlzdGVuZXIoZSx0aGlzKX0sdGhpcyksdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzPWl9fSxzLl91bmJpbmRQb3N0U3RhcnRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMmJih0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHMuZm9yRWFjaChmdW5jdGlvbihlKXt0LnJlbW92ZUV2ZW50TGlzdGVuZXIoZSx0aGlzKX0sdGhpcyksZGVsZXRlIHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyl9LHMub25tb3VzZW1vdmU9ZnVuY3Rpb24odCl7dGhpcy5fcG9pbnRlck1vdmUodCx0KX0scy5vbk1TUG9pbnRlck1vdmU9cy5vbnBvaW50ZXJtb3ZlPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyTW92ZSh0LHQpfSxzLm9udG91Y2htb3ZlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlck1vdmUodCxlKX0scy5fcG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt0aGlzLnBvaW50ZXJNb3ZlKHQsZSl9LHMucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJNb3ZlXCIsW3QsZV0pfSxzLm9ubW91c2V1cD1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyVXAodCx0KX0scy5vbk1TUG9pbnRlclVwPXMub25wb2ludGVydXA9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJVcCh0LHQpfSxzLm9udG91Y2hlbmQ9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyVXAodCxlKX0scy5fcG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7dGhpcy5fcG9pbnRlckRvbmUoKSx0aGlzLnBvaW50ZXJVcCh0LGUpfSxzLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlclVwXCIsW3QsZV0pfSxzLl9wb2ludGVyRG9uZT1mdW5jdGlvbigpe3RoaXMuaXNQb2ludGVyRG93bj0hMSxkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcix0aGlzLl91bmJpbmRQb3N0U3RhcnRFdmVudHMoKSx0aGlzLnBvaW50ZXJEb25lKCl9LHMucG9pbnRlckRvbmU9aSxzLm9uTVNQb2ludGVyQ2FuY2VsPXMub25wb2ludGVyY2FuY2VsPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyQ2FuY2VsKHQsdCl9LHMub250b3VjaGNhbmNlbD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJDYW5jZWwodCxlKX0scy5fcG9pbnRlckNhbmNlbD1mdW5jdGlvbih0LGUpe3RoaXMuX3BvaW50ZXJEb25lKCksdGhpcy5wb2ludGVyQ2FuY2VsKHQsZSl9LHMucG9pbnRlckNhbmNlbD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlckNhbmNlbFwiLFt0LGVdKX0sbi5nZXRQb2ludGVyUG9pbnQ9ZnVuY3Rpb24odCl7cmV0dXJue3g6dC5wYWdlWCx5OnQucGFnZVl9fSxufSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidW5pZHJhZ2dlci91bmlkcmFnZ2VyXCIsW1widW5pcG9pbnRlci91bmlwb2ludGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcInVuaXBvaW50ZXJcIikpOnQuVW5pZHJhZ2dlcj1lKHQsdC5Vbmlwb2ludGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSgpe31mdW5jdGlvbiBuKCl7fXZhciBzPW4ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpO3MuYmluZEhhbmRsZXM9ZnVuY3Rpb24oKXt0aGlzLl9iaW5kSGFuZGxlcyghMCl9LHMudW5iaW5kSGFuZGxlcz1mdW5jdGlvbigpe3RoaXMuX2JpbmRIYW5kbGVzKCExKX07dmFyIG89dC5uYXZpZ2F0b3I7cmV0dXJuIHMuX2JpbmRIYW5kbGVzPWZ1bmN0aW9uKHQpe3Q9dm9pZCAwPT09dHx8ISF0O3ZhciBlO2U9by5wb2ludGVyRW5hYmxlZD9mdW5jdGlvbihlKXtlLnN0eWxlLnRvdWNoQWN0aW9uPXQ/XCJub25lXCI6XCJcIn06by5tc1BvaW50ZXJFbmFibGVkP2Z1bmN0aW9uKGUpe2Uuc3R5bGUubXNUb3VjaEFjdGlvbj10P1wibm9uZVwiOlwiXCJ9Omk7Zm9yKHZhciBuPXQ/XCJhZGRFdmVudExpc3RlbmVyXCI6XCJyZW1vdmVFdmVudExpc3RlbmVyXCIscz0wO3M8dGhpcy5oYW5kbGVzLmxlbmd0aDtzKyspe3ZhciByPXRoaXMuaGFuZGxlc1tzXTt0aGlzLl9iaW5kU3RhcnRFdmVudChyLHQpLGUocikscltuXShcImNsaWNrXCIsdGhpcyl9fSxzLnBvaW50ZXJEb3duPWZ1bmN0aW9uKHQsZSl7aWYoXCJJTlBVVFwiPT10LnRhcmdldC5ub2RlTmFtZSYmXCJyYW5nZVwiPT10LnRhcmdldC50eXBlKXJldHVybiB0aGlzLmlzUG9pbnRlckRvd249ITEsdm9pZCBkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcjt0aGlzLl9kcmFnUG9pbnRlckRvd24odCxlKTt2YXIgaT1kb2N1bWVudC5hY3RpdmVFbGVtZW50O2kmJmkuYmx1ciYmaS5ibHVyKCksdGhpcy5fYmluZFBvc3RTdGFydEV2ZW50cyh0KSx0aGlzLmVtaXRFdmVudChcInBvaW50ZXJEb3duXCIsW3QsZV0pfSxzLl9kcmFnUG9pbnRlckRvd249ZnVuY3Rpb24odCxpKXt0aGlzLnBvaW50ZXJEb3duUG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQoaSk7dmFyIG49dGhpcy5jYW5QcmV2ZW50RGVmYXVsdE9uUG9pbnRlckRvd24odCxpKTtuJiZ0LnByZXZlbnREZWZhdWx0KCl9LHMuY2FuUHJldmVudERlZmF1bHRPblBvaW50ZXJEb3duPWZ1bmN0aW9uKHQpe3JldHVyblwiU0VMRUNUXCIhPXQudGFyZ2V0Lm5vZGVOYW1lfSxzLnBvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fZHJhZ1BvaW50ZXJNb3ZlKHQsZSk7dGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyTW92ZVwiLFt0LGUsaV0pLHRoaXMuX2RyYWdNb3ZlKHQsZSxpKX0scy5fZHJhZ1BvaW50ZXJNb3ZlPWZ1bmN0aW9uKHQsaSl7dmFyIG49ZS5nZXRQb2ludGVyUG9pbnQoaSkscz17eDpuLngtdGhpcy5wb2ludGVyRG93blBvaW50LngseTpuLnktdGhpcy5wb2ludGVyRG93blBvaW50Lnl9O3JldHVybiF0aGlzLmlzRHJhZ2dpbmcmJnRoaXMuaGFzRHJhZ1N0YXJ0ZWQocykmJnRoaXMuX2RyYWdTdGFydCh0LGkpLHN9LHMuaGFzRHJhZ1N0YXJ0ZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguYWJzKHQueCk+M3x8TWF0aC5hYnModC55KT4zfSxzLnBvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlclVwXCIsW3QsZV0pLHRoaXMuX2RyYWdQb2ludGVyVXAodCxlKX0scy5fZHJhZ1BvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuaXNEcmFnZ2luZz90aGlzLl9kcmFnRW5kKHQsZSk6dGhpcy5fc3RhdGljQ2xpY2sodCxlKX0scy5fZHJhZ1N0YXJ0PWZ1bmN0aW9uKHQsaSl7dGhpcy5pc0RyYWdnaW5nPSEwLHRoaXMuZHJhZ1N0YXJ0UG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQoaSksdGhpcy5pc1ByZXZlbnRpbmdDbGlja3M9ITAsdGhpcy5kcmFnU3RhcnQodCxpKX0scy5kcmFnU3RhcnQ9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcImRyYWdTdGFydFwiLFt0LGVdKX0scy5fZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3RoaXMuaXNEcmFnZ2luZyYmdGhpcy5kcmFnTW92ZSh0LGUsaSl9LHMuZHJhZ01vdmU9ZnVuY3Rpb24odCxlLGkpe3QucHJldmVudERlZmF1bHQoKSx0aGlzLmVtaXRFdmVudChcImRyYWdNb3ZlXCIsW3QsZSxpXSl9LHMuX2RyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLmlzRHJhZ2dpbmc9ITEsc2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzUHJldmVudGluZ0NsaWNrc30uYmluZCh0aGlzKSksdGhpcy5kcmFnRW5kKHQsZSl9LHMuZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwiZHJhZ0VuZFwiLFt0LGVdKX0scy5vbmNsaWNrPWZ1bmN0aW9uKHQpe3RoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzJiZ0LnByZXZlbnREZWZhdWx0KCl9LHMuX3N0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7aWYoIXRoaXMuaXNJZ25vcmluZ01vdXNlVXB8fFwibW91c2V1cFwiIT10LnR5cGUpe3ZhciBpPXQudGFyZ2V0Lm5vZGVOYW1lO1wiSU5QVVRcIiE9aSYmXCJURVhUQVJFQVwiIT1pfHx0LnRhcmdldC5mb2N1cygpLHRoaXMuc3RhdGljQ2xpY2sodCxlKSxcIm1vdXNldXBcIiE9dC50eXBlJiYodGhpcy5pc0lnbm9yaW5nTW91c2VVcD0hMCxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNJZ25vcmluZ01vdXNlVXB9LmJpbmQodGhpcyksNDAwKSl9fSxzLnN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJzdGF0aWNDbGlja1wiLFt0LGVdKX0sbi5nZXRQb2ludGVyUG9pbnQ9ZS5nZXRQb2ludGVyUG9pbnQsbn0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL2RyYWdcIixbXCIuL2ZsaWNraXR5XCIsXCJ1bmlkcmFnZ2VyL3VuaWRyYWdnZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidW5pZHJhZ2dlclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOnQuRmxpY2tpdHk9ZSh0LHQuRmxpY2tpdHksdC5VbmlkcmFnZ2VyLHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4pe2Z1bmN0aW9uIHMoKXtyZXR1cm57eDp0LnBhZ2VYT2Zmc2V0LHk6dC5wYWdlWU9mZnNldH19bi5leHRlbmQoZS5kZWZhdWx0cyx7ZHJhZ2dhYmxlOiEwLGRyYWdUaHJlc2hvbGQ6M30pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZURyYWdcIik7dmFyIG89ZS5wcm90b3R5cGU7bi5leHRlbmQobyxpLnByb3RvdHlwZSk7dmFyIHI9XCJjcmVhdGVUb3VjaFwiaW4gZG9jdW1lbnQsYT0hMTtvLl9jcmVhdGVEcmFnPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5iaW5kRHJhZyksdGhpcy5vbihcInVpQ2hhbmdlXCIsdGhpcy5fdWlDaGFuZ2VEcmFnKSx0aGlzLm9uKFwiY2hpbGRVSVBvaW50ZXJEb3duXCIsdGhpcy5fY2hpbGRVSVBvaW50ZXJEb3duRHJhZyksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLnVuYmluZERyYWcpLHImJiFhJiYodC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsZnVuY3Rpb24oKXt9KSxhPSEwKX0sby5iaW5kRHJhZz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5kcmFnZ2FibGUmJiF0aGlzLmlzRHJhZ0JvdW5kJiYodGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoXCJpcy1kcmFnZ2FibGVcIiksdGhpcy5oYW5kbGVzPVt0aGlzLnZpZXdwb3J0XSx0aGlzLmJpbmRIYW5kbGVzKCksdGhpcy5pc0RyYWdCb3VuZD0hMCl9LG8udW5iaW5kRHJhZz1mdW5jdGlvbigpe3RoaXMuaXNEcmFnQm91bmQmJih0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImlzLWRyYWdnYWJsZVwiKSx0aGlzLnVuYmluZEhhbmRsZXMoKSxkZWxldGUgdGhpcy5pc0RyYWdCb3VuZCl9LG8uX3VpQ2hhbmdlRHJhZz1mdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZ30sby5fY2hpbGRVSVBvaW50ZXJEb3duRHJhZz1mdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wb2ludGVyRG93bkZvY3VzKHQpfTt2YXIgbD17VEVYVEFSRUE6ITAsSU5QVVQ6ITAsT1BUSU9OOiEwfSxoPXtyYWRpbzohMCxjaGVja2JveDohMCxidXR0b246ITAsc3VibWl0OiEwLGltYWdlOiEwLGZpbGU6ITB9O28ucG9pbnRlckRvd249ZnVuY3Rpb24oZSxpKXt2YXIgbj1sW2UudGFyZ2V0Lm5vZGVOYW1lXSYmIWhbZS50YXJnZXQudHlwZV07aWYobilyZXR1cm4gdGhpcy5pc1BvaW50ZXJEb3duPSExLHZvaWQgZGVsZXRlIHRoaXMucG9pbnRlcklkZW50aWZpZXI7dGhpcy5fZHJhZ1BvaW50ZXJEb3duKGUsaSk7dmFyIG89ZG9jdW1lbnQuYWN0aXZlRWxlbWVudDtvJiZvLmJsdXImJm8hPXRoaXMuZWxlbWVudCYmbyE9ZG9jdW1lbnQuYm9keSYmby5ibHVyKCksdGhpcy5wb2ludGVyRG93bkZvY3VzKGUpLHRoaXMuZHJhZ1g9dGhpcy54LHRoaXMudmlld3BvcnQuY2xhc3NMaXN0LmFkZChcImlzLXBvaW50ZXItZG93blwiKSx0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKGUpLHRoaXMucG9pbnRlckRvd25TY3JvbGw9cygpLHQuYWRkRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLHRoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJEb3duXCIsZSxbaV0pfTt2YXIgYz17dG91Y2hzdGFydDohMCxNU1BvaW50ZXJEb3duOiEwfSxkPXtJTlBVVDohMCxTRUxFQ1Q6ITB9O3JldHVybiBvLnBvaW50ZXJEb3duRm9jdXM9ZnVuY3Rpb24oZSl7aWYodGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJiFjW2UudHlwZV0mJiFkW2UudGFyZ2V0Lm5vZGVOYW1lXSl7dmFyIGk9dC5wYWdlWU9mZnNldDt0aGlzLmVsZW1lbnQuZm9jdXMoKSx0LnBhZ2VZT2Zmc2V0IT1pJiZ0LnNjcm9sbFRvKHQucGFnZVhPZmZzZXQsaSl9fSxvLmNhblByZXZlbnREZWZhdWx0T25Qb2ludGVyRG93bj1mdW5jdGlvbih0KXt2YXIgZT1cInRvdWNoc3RhcnRcIj09dC50eXBlLGk9dC50YXJnZXQubm9kZU5hbWU7cmV0dXJuIWUmJlwiU0VMRUNUXCIhPWl9LG8uaGFzRHJhZ1N0YXJ0ZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguYWJzKHQueCk+dGhpcy5vcHRpb25zLmRyYWdUaHJlc2hvbGR9LG8ucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7ZGVsZXRlIHRoaXMuaXNUb3VjaFNjcm9sbGluZyx0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1wb2ludGVyLWRvd25cIiksdGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlclVwXCIsdCxbZV0pLHRoaXMuX2RyYWdQb2ludGVyVXAodCxlKX0sby5wb2ludGVyRG9uZT1mdW5jdGlvbigpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLGRlbGV0ZSB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsfSxvLmRyYWdTdGFydD1mdW5jdGlvbihlLGkpe3RoaXMuZHJhZ1N0YXJ0UG9zaXRpb249dGhpcy54LHRoaXMuc3RhcnRBbmltYXRpb24oKSx0LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJzY3JvbGxcIix0aGlzKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnU3RhcnRcIixlLFtpXSl9LG8ucG9pbnRlck1vdmU9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLl9kcmFnUG9pbnRlck1vdmUodCxlKTt0aGlzLmRpc3BhdGNoRXZlbnQoXCJwb2ludGVyTW92ZVwiLHQsW2UsaV0pLHRoaXMuX2RyYWdNb3ZlKHQsZSxpKX0sby5kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMucHJldmlvdXNEcmFnWD10aGlzLmRyYWdYO3ZhciBuPXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD8tMToxLHM9dGhpcy5kcmFnU3RhcnRQb3NpdGlvbitpLngqbjtpZighdGhpcy5vcHRpb25zLndyYXBBcm91bmQmJnRoaXMuc2xpZGVzLmxlbmd0aCl7dmFyIG89TWF0aC5tYXgoLXRoaXMuc2xpZGVzWzBdLnRhcmdldCx0aGlzLmRyYWdTdGFydFBvc2l0aW9uKTtzPXM+bz8uNSoocytvKTpzO3ZhciByPU1hdGgubWluKC10aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldCx0aGlzLmRyYWdTdGFydFBvc2l0aW9uKTtzPXM8cj8uNSoocytyKTpzfXRoaXMuZHJhZ1g9cyx0aGlzLmRyYWdNb3ZlVGltZT1uZXcgRGF0ZSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnTW92ZVwiLHQsW2UsaV0pfSxvLmRyYWdFbmQ9ZnVuY3Rpb24odCxlKXt0aGlzLm9wdGlvbnMuZnJlZVNjcm9sbCYmKHRoaXMuaXNGcmVlU2Nyb2xsaW5nPSEwKTt2YXIgaT10aGlzLmRyYWdFbmRSZXN0aW5nU2VsZWN0KCk7aWYodGhpcy5vcHRpb25zLmZyZWVTY3JvbGwmJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCl7dmFyIG49dGhpcy5nZXRSZXN0aW5nUG9zaXRpb24oKTt0aGlzLmlzRnJlZVNjcm9sbGluZz0tbj50aGlzLnNsaWRlc1swXS50YXJnZXQmJi1uPHRoaXMuZ2V0TGFzdFNsaWRlKCkudGFyZ2V0fWVsc2UgdGhpcy5vcHRpb25zLmZyZWVTY3JvbGx8fGkhPXRoaXMuc2VsZWN0ZWRJbmRleHx8KGkrPXRoaXMuZHJhZ0VuZEJvb3N0U2VsZWN0KCkpO2RlbGV0ZSB0aGlzLnByZXZpb3VzRHJhZ1gsdGhpcy5pc0RyYWdTZWxlY3Q9dGhpcy5vcHRpb25zLndyYXBBcm91bmQsdGhpcy5zZWxlY3QoaSksZGVsZXRlIHRoaXMuaXNEcmFnU2VsZWN0LHRoaXMuZGlzcGF0Y2hFdmVudChcImRyYWdFbmRcIix0LFtlXSl9LG8uZHJhZ0VuZFJlc3RpbmdTZWxlY3Q9ZnVuY3Rpb24oKXtcbnZhciB0PXRoaXMuZ2V0UmVzdGluZ1Bvc2l0aW9uKCksZT1NYXRoLmFicyh0aGlzLmdldFNsaWRlRGlzdGFuY2UoLXQsdGhpcy5zZWxlY3RlZEluZGV4KSksaT10aGlzLl9nZXRDbG9zZXN0UmVzdGluZyh0LGUsMSksbj10aGlzLl9nZXRDbG9zZXN0UmVzdGluZyh0LGUsLTEpLHM9aS5kaXN0YW5jZTxuLmRpc3RhbmNlP2kuaW5kZXg6bi5pbmRleDtyZXR1cm4gc30sby5fZ2V0Q2xvc2VzdFJlc3Rpbmc9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj10aGlzLnNlbGVjdGVkSW5kZXgscz0xLzAsbz10aGlzLm9wdGlvbnMuY29udGFpbiYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kP2Z1bmN0aW9uKHQsZSl7cmV0dXJuIHQ8PWV9OmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQ8ZX07byhlLHMpJiYobis9aSxzPWUsZT10aGlzLmdldFNsaWRlRGlzdGFuY2UoLXQsbiksbnVsbCE9PWUpOyllPU1hdGguYWJzKGUpO3JldHVybntkaXN0YW5jZTpzLGluZGV4Om4taX19LG8uZ2V0U2xpZGVEaXN0YW5jZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuc2xpZGVzLmxlbmd0aCxzPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZpPjEsbz1zP24ubW9kdWxvKGUsaSk6ZSxyPXRoaXMuc2xpZGVzW29dO2lmKCFyKXJldHVybiBudWxsO3ZhciBhPXM/dGhpcy5zbGlkZWFibGVXaWR0aCpNYXRoLmZsb29yKGUvaSk6MDtyZXR1cm4gdC0oci50YXJnZXQrYSl9LG8uZHJhZ0VuZEJvb3N0U2VsZWN0PWZ1bmN0aW9uKCl7aWYodm9pZCAwPT09dGhpcy5wcmV2aW91c0RyYWdYfHwhdGhpcy5kcmFnTW92ZVRpbWV8fG5ldyBEYXRlLXRoaXMuZHJhZ01vdmVUaW1lPjEwMClyZXR1cm4gMDt2YXIgdD10aGlzLmdldFNsaWRlRGlzdGFuY2UoLXRoaXMuZHJhZ1gsdGhpcy5zZWxlY3RlZEluZGV4KSxlPXRoaXMucHJldmlvdXNEcmFnWC10aGlzLmRyYWdYO3JldHVybiB0PjAmJmU+MD8xOnQ8MCYmZTwwPy0xOjB9LG8uc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLmdldFBhcmVudENlbGwodC50YXJnZXQpLG49aSYmaS5lbGVtZW50LHM9aSYmdGhpcy5jZWxscy5pbmRleE9mKGkpO3RoaXMuZGlzcGF0Y2hFdmVudChcInN0YXRpY0NsaWNrXCIsdCxbZSxuLHNdKX0sby5vbnNjcm9sbD1mdW5jdGlvbigpe3ZhciB0PXMoKSxlPXRoaXMucG9pbnRlckRvd25TY3JvbGwueC10LngsaT10aGlzLnBvaW50ZXJEb3duU2Nyb2xsLnktdC55OyhNYXRoLmFicyhlKT4zfHxNYXRoLmFicyhpKT4zKSYmdGhpcy5fcG9pbnRlckRvbmUoKX0sZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixbXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwidW5pcG9pbnRlclwiKSk6dC5UYXBMaXN0ZW5lcj1lKHQsdC5Vbmlwb2ludGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0KXt0aGlzLmJpbmRUYXAodCl9dmFyIG49aS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cmV0dXJuIG4uYmluZFRhcD1mdW5jdGlvbih0KXt0JiYodGhpcy51bmJpbmRUYXAoKSx0aGlzLnRhcEVsZW1lbnQ9dCx0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCEwKSl9LG4udW5iaW5kVGFwPWZ1bmN0aW9uKCl7dGhpcy50YXBFbGVtZW50JiYodGhpcy5fYmluZFN0YXJ0RXZlbnQodGhpcy50YXBFbGVtZW50LCEwKSxkZWxldGUgdGhpcy50YXBFbGVtZW50KX0sbi5wb2ludGVyVXA9ZnVuY3Rpb24oaSxuKXtpZighdGhpcy5pc0lnbm9yaW5nTW91c2VVcHx8XCJtb3VzZXVwXCIhPWkudHlwZSl7dmFyIHM9ZS5nZXRQb2ludGVyUG9pbnQobiksbz10aGlzLnRhcEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkscj10LnBhZ2VYT2Zmc2V0LGE9dC5wYWdlWU9mZnNldCxsPXMueD49by5sZWZ0K3ImJnMueDw9by5yaWdodCtyJiZzLnk+PW8udG9wK2EmJnMueTw9by5ib3R0b20rYTtpZihsJiZ0aGlzLmVtaXRFdmVudChcInRhcFwiLFtpLG5dKSxcIm1vdXNldXBcIiE9aS50eXBlKXt0aGlzLmlzSWdub3JpbmdNb3VzZVVwPSEwO3ZhciBoPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSBoLmlzSWdub3JpbmdNb3VzZVVwfSw0MDApfX19LG4uZGVzdHJveT1mdW5jdGlvbigpe3RoaXMucG9pbnRlckRvbmUoKSx0aGlzLnVuYmluZFRhcCgpfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcHJldi1uZXh0LWJ1dHRvblwiLFtcIi4vZmxpY2tpdHlcIixcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidGFwLWxpc3RlbmVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5UYXBMaXN0ZW5lcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBzKHQsZSl7dGhpcy5kaXJlY3Rpb249dCx0aGlzLnBhcmVudD1lLHRoaXMuX2NyZWF0ZSgpfWZ1bmN0aW9uIG8odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQ/dDpcIk0gXCIrdC54MCtcIiw1MCBMIFwiK3QueDErXCIsXCIrKHQueTErNTApK1wiIEwgXCIrdC54MitcIixcIisodC55Mis1MCkrXCIgTCBcIit0LngzK1wiLDUwICBMIFwiK3QueDIrXCIsXCIrKDUwLXQueTIpK1wiIEwgXCIrdC54MStcIixcIisoNTAtdC55MSkrXCIgWlwifXZhciByPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtzLnByb3RvdHlwZT1uZXcgaSxzLnByb3RvdHlwZS5fY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWQ9ITAsdGhpcy5pc1ByZXZpb3VzPXRoaXMuZGlyZWN0aW9uPT0tMTt2YXIgdD10aGlzLnBhcmVudC5vcHRpb25zLnJpZ2h0VG9MZWZ0PzE6LTE7dGhpcy5pc0xlZnQ9dGhpcy5kaXJlY3Rpb249PXQ7dmFyIGU9dGhpcy5lbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7ZS5jbGFzc05hbWU9XCJmbGlja2l0eS1wcmV2LW5leHQtYnV0dG9uXCIsZS5jbGFzc05hbWUrPXRoaXMuaXNQcmV2aW91cz9cIiBwcmV2aW91c1wiOlwiIG5leHRcIixlLnNldEF0dHJpYnV0ZShcInR5cGVcIixcImJ1dHRvblwiKSx0aGlzLmRpc2FibGUoKSxlLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIix0aGlzLmlzUHJldmlvdXM/XCJwcmV2aW91c1wiOlwibmV4dFwiKTt2YXIgaT10aGlzLmNyZWF0ZVNWRygpO2UuYXBwZW5kQ2hpbGQoaSksdGhpcy5vbihcInRhcFwiLHRoaXMub25UYXApLHRoaXMucGFyZW50Lm9uKFwic2VsZWN0XCIsdGhpcy51cGRhdGUuYmluZCh0aGlzKSksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5wYXJlbnQuY2hpbGRVSVBvaW50ZXJEb3duLmJpbmQodGhpcy5wYXJlbnQpKX0scy5wcm90b3R5cGUuYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLmJpbmRUYXAodGhpcy5lbGVtZW50KSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcyksdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmVsZW1lbnQpfSxzLnByb3RvdHlwZS5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5wYXJlbnQuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLmVsZW1lbnQpLGkucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsdGhpcyl9LHMucHJvdG90eXBlLmNyZWF0ZVNWRz1mdW5jdGlvbigpe3ZhciB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhyLFwic3ZnXCIpO3Quc2V0QXR0cmlidXRlKFwidmlld0JveFwiLFwiMCAwIDEwMCAxMDBcIik7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKHIsXCJwYXRoXCIpLGk9byh0aGlzLnBhcmVudC5vcHRpb25zLmFycm93U2hhcGUpO3JldHVybiBlLnNldEF0dHJpYnV0ZShcImRcIixpKSxlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsXCJhcnJvd1wiKSx0aGlzLmlzTGVmdHx8ZS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIixcInRyYW5zbGF0ZSgxMDAsIDEwMCkgcm90YXRlKDE4MCkgXCIpLHQuYXBwZW5kQ2hpbGQoZSksdH0scy5wcm90b3R5cGUub25UYXA9ZnVuY3Rpb24oKXtpZih0aGlzLmlzRW5hYmxlZCl7dGhpcy5wYXJlbnQudWlDaGFuZ2UoKTt2YXIgdD10aGlzLmlzUHJldmlvdXM/XCJwcmV2aW91c1wiOlwibmV4dFwiO3RoaXMucGFyZW50W3RdKCl9fSxzLnByb3RvdHlwZS5oYW5kbGVFdmVudD1uLmhhbmRsZUV2ZW50LHMucHJvdG90eXBlLm9uY2xpY2s9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5hY3RpdmVFbGVtZW50O3QmJnQ9PXRoaXMuZWxlbWVudCYmdGhpcy5vblRhcCgpfSxzLnByb3RvdHlwZS5lbmFibGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZHx8KHRoaXMuZWxlbWVudC5kaXNhYmxlZD0hMSx0aGlzLmlzRW5hYmxlZD0hMCl9LHMucHJvdG90eXBlLmRpc2FibGU9ZnVuY3Rpb24oKXt0aGlzLmlzRW5hYmxlZCYmKHRoaXMuZWxlbWVudC5kaXNhYmxlZD0hMCx0aGlzLmlzRW5hYmxlZD0hMSl9LHMucHJvdG90eXBlLnVwZGF0ZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMucGFyZW50LnNsaWRlcztpZih0aGlzLnBhcmVudC5vcHRpb25zLndyYXBBcm91bmQmJnQubGVuZ3RoPjEpcmV0dXJuIHZvaWQgdGhpcy5lbmFibGUoKTt2YXIgZT10Lmxlbmd0aD90Lmxlbmd0aC0xOjAsaT10aGlzLmlzUHJldmlvdXM/MDplLG49dGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleD09aT9cImRpc2FibGVcIjpcImVuYWJsZVwiO3RoaXNbbl0oKX0scy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpfSxuLmV4dGVuZChlLmRlZmF1bHRzLHtwcmV2TmV4dEJ1dHRvbnM6ITAsYXJyb3dTaGFwZTp7eDA6MTAseDE6NjAseTE6NTAseDI6NzAseTI6NDAseDM6MzB9fSksZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlUHJldk5leHRCdXR0b25zXCIpO3ZhciBhPWUucHJvdG90eXBlO3JldHVybiBhLl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucHJldk5leHRCdXR0b25zJiYodGhpcy5wcmV2QnV0dG9uPW5ldyBzKCgtMSksdGhpcyksdGhpcy5uZXh0QnV0dG9uPW5ldyBzKDEsdGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVByZXZOZXh0QnV0dG9ucykpfSxhLmFjdGl2YXRlUHJldk5leHRCdXR0b25zPWZ1bmN0aW9uKCl7dGhpcy5wcmV2QnV0dG9uLmFjdGl2YXRlKCksdGhpcy5uZXh0QnV0dG9uLmFjdGl2YXRlKCksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpfSxhLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLnByZXZCdXR0b24uZGVhY3RpdmF0ZSgpLHRoaXMubmV4dEJ1dHRvbi5kZWFjdGl2YXRlKCksdGhpcy5vZmYoXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUHJldk5leHRCdXR0b25zKX0sZS5QcmV2TmV4dEJ1dHRvbj1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9wYWdlLWRvdHNcIixbXCIuL2ZsaWNraXR5XCIsXCJ0YXAtbGlzdGVuZXIvdGFwLWxpc3RlbmVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4scyl7cmV0dXJuIGUodCxpLG4scyl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcInRhcC1saXN0ZW5lclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuVGFwTGlzdGVuZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7ZnVuY3Rpb24gcyh0KXt0aGlzLnBhcmVudD10LHRoaXMuX2NyZWF0ZSgpfXMucHJvdG90eXBlPW5ldyBpLHMucHJvdG90eXBlLl9jcmVhdGU9ZnVuY3Rpb24oKXt0aGlzLmhvbGRlcj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib2xcIiksdGhpcy5ob2xkZXIuY2xhc3NOYW1lPVwiZmxpY2tpdHktcGFnZS1kb3RzXCIsdGhpcy5kb3RzPVtdLHRoaXMub24oXCJ0YXBcIix0aGlzLm9uVGFwKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnBhcmVudC5jaGlsZFVJUG9pbnRlckRvd24uYmluZCh0aGlzLnBhcmVudCkpfSxzLnByb3RvdHlwZS5hY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMuc2V0RG90cygpLHRoaXMuYmluZFRhcCh0aGlzLmhvbGRlciksdGhpcy5wYXJlbnQuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLmhvbGRlcil9LHMucHJvdG90eXBlLmRlYWN0aXZhdGU9ZnVuY3Rpb24oKXt0aGlzLnBhcmVudC5lbGVtZW50LnJlbW92ZUNoaWxkKHRoaXMuaG9sZGVyKSxpLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcyl9LHMucHJvdG90eXBlLnNldERvdHM9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnBhcmVudC5zbGlkZXMubGVuZ3RoLXRoaXMuZG90cy5sZW5ndGg7dD4wP3RoaXMuYWRkRG90cyh0KTp0PDAmJnRoaXMucmVtb3ZlRG90cygtdCl9LHMucHJvdG90eXBlLmFkZERvdHM9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKSxpPVtdO3Q7KXt2YXIgbj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7bi5jbGFzc05hbWU9XCJkb3RcIixlLmFwcGVuZENoaWxkKG4pLGkucHVzaChuKSx0LS19dGhpcy5ob2xkZXIuYXBwZW5kQ2hpbGQoZSksdGhpcy5kb3RzPXRoaXMuZG90cy5jb25jYXQoaSl9LHMucHJvdG90eXBlLnJlbW92ZURvdHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5kb3RzLnNwbGljZSh0aGlzLmRvdHMubGVuZ3RoLXQsdCk7ZS5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXMuaG9sZGVyLnJlbW92ZUNoaWxkKHQpfSx0aGlzKX0scy5wcm90b3R5cGUudXBkYXRlU2VsZWN0ZWQ9ZnVuY3Rpb24oKXt0aGlzLnNlbGVjdGVkRG90JiYodGhpcy5zZWxlY3RlZERvdC5jbGFzc05hbWU9XCJkb3RcIiksdGhpcy5kb3RzLmxlbmd0aCYmKHRoaXMuc2VsZWN0ZWREb3Q9dGhpcy5kb3RzW3RoaXMucGFyZW50LnNlbGVjdGVkSW5kZXhdLHRoaXMuc2VsZWN0ZWREb3QuY2xhc3NOYW1lPVwiZG90IGlzLXNlbGVjdGVkXCIpfSxzLnByb3RvdHlwZS5vblRhcD1mdW5jdGlvbih0KXt2YXIgZT10LnRhcmdldDtpZihcIkxJXCI9PWUubm9kZU5hbWUpe3RoaXMucGFyZW50LnVpQ2hhbmdlKCk7dmFyIGk9dGhpcy5kb3RzLmluZGV4T2YoZSk7dGhpcy5wYXJlbnQuc2VsZWN0KGkpfX0scy5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZGVhY3RpdmF0ZSgpfSxlLlBhZ2VEb3RzPXMsbi5leHRlbmQoZS5kZWZhdWx0cyx7cGFnZURvdHM6ITB9KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQYWdlRG90c1wiKTt2YXIgbz1lLnByb3RvdHlwZTtyZXR1cm4gby5fY3JlYXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMucGFnZURvdHMmJih0aGlzLnBhZ2VEb3RzPW5ldyBzKHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQYWdlRG90cyksdGhpcy5vbihcInNlbGVjdFwiLHRoaXMudXBkYXRlU2VsZWN0ZWRQYWdlRG90cyksdGhpcy5vbihcImNlbGxDaGFuZ2VcIix0aGlzLnVwZGF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwicmVzaXplXCIsdGhpcy51cGRhdGVQYWdlRG90cyksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQYWdlRG90cykpfSxvLmFjdGl2YXRlUGFnZURvdHM9ZnVuY3Rpb24oKXt0aGlzLnBhZ2VEb3RzLmFjdGl2YXRlKCl9LG8udXBkYXRlU2VsZWN0ZWRQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMudXBkYXRlU2VsZWN0ZWQoKX0sby51cGRhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuc2V0RG90cygpfSxvLmRlYWN0aXZhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuZGVhY3RpdmF0ZSgpfSxlLlBhZ2VEb3RzPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3BsYXllclwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIixcIi4vZmxpY2tpdHlcIl0sZnVuY3Rpb24odCxpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcImV2LWVtaXR0ZXJcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpLHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpKTplKHQuRXZFbWl0dGVyLHQuZml6enlVSVV0aWxzLHQuRmxpY2tpdHkpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe2Z1bmN0aW9uIG4odCl7dGhpcy5wYXJlbnQ9dCx0aGlzLnN0YXRlPVwic3RvcHBlZFwiLG8mJih0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZT1mdW5jdGlvbigpe3RoaXMudmlzaWJpbGl0eUNoYW5nZSgpfS5iaW5kKHRoaXMpLHRoaXMub25WaXNpYmlsaXR5UGxheT1mdW5jdGlvbigpe3RoaXMudmlzaWJpbGl0eVBsYXkoKX0uYmluZCh0aGlzKSl9dmFyIHMsbztcImhpZGRlblwiaW4gZG9jdW1lbnQ/KHM9XCJoaWRkZW5cIixvPVwidmlzaWJpbGl0eWNoYW5nZVwiKTpcIndlYmtpdEhpZGRlblwiaW4gZG9jdW1lbnQmJihzPVwid2Via2l0SGlkZGVuXCIsbz1cIndlYmtpdHZpc2liaWxpdHljaGFuZ2VcIiksbi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZSh0LnByb3RvdHlwZSksbi5wcm90b3R5cGUucGxheT1mdW5jdGlvbigpe2lmKFwicGxheWluZ1wiIT10aGlzLnN0YXRlKXt2YXIgdD1kb2N1bWVudFtzXTtpZihvJiZ0KXJldHVybiB2b2lkIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eVBsYXkpO3RoaXMuc3RhdGU9XCJwbGF5aW5nXCIsbyYmZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihvLHRoaXMub25WaXNpYmlsaXR5Q2hhbmdlKSx0aGlzLnRpY2soKX19LG4ucHJvdG90eXBlLnRpY2s9ZnVuY3Rpb24oKXtpZihcInBsYXlpbmdcIj09dGhpcy5zdGF0ZSl7dmFyIHQ9dGhpcy5wYXJlbnQub3B0aW9ucy5hdXRvUGxheTt0PVwibnVtYmVyXCI9PXR5cGVvZiB0P3Q6M2UzO3ZhciBlPXRoaXM7dGhpcy5jbGVhcigpLHRoaXMudGltZW91dD1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5wYXJlbnQubmV4dCghMCksZS50aWNrKCl9LHQpfX0sbi5wcm90b3R5cGUuc3RvcD1mdW5jdGlvbigpe3RoaXMuc3RhdGU9XCJzdG9wcGVkXCIsdGhpcy5jbGVhcigpLG8mJmRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIobyx0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSl9LG4ucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCl9LG4ucHJvdG90eXBlLnBhdXNlPWZ1bmN0aW9uKCl7XCJwbGF5aW5nXCI9PXRoaXMuc3RhdGUmJih0aGlzLnN0YXRlPVwicGF1c2VkXCIsdGhpcy5jbGVhcigpKX0sbi5wcm90b3R5cGUudW5wYXVzZT1mdW5jdGlvbigpe1wicGF1c2VkXCI9PXRoaXMuc3RhdGUmJnRoaXMucGxheSgpfSxuLnByb3RvdHlwZS52aXNpYmlsaXR5Q2hhbmdlPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnRbc107dGhpc1t0P1wicGF1c2VcIjpcInVucGF1c2VcIl0oKX0sbi5wcm90b3R5cGUudmlzaWJpbGl0eVBsYXk9ZnVuY3Rpb24oKXt0aGlzLnBsYXkoKSxkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKG8sdGhpcy5vblZpc2liaWxpdHlQbGF5KX0sZS5leHRlbmQoaS5kZWZhdWx0cyx7cGF1c2VBdXRvUGxheU9uSG92ZXI6ITB9KSxpLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQbGF5ZXJcIik7dmFyIHI9aS5wcm90b3R5cGU7cmV0dXJuIHIuX2NyZWF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyPW5ldyBuKHRoaXMpLHRoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVQbGF5ZXIpLHRoaXMub24oXCJ1aUNoYW5nZVwiLHRoaXMuc3RvcFBsYXllciksdGhpcy5vbihcInBvaW50ZXJEb3duXCIsdGhpcy5zdG9wUGxheWVyKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVBsYXllcil9LHIuYWN0aXZhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuYXV0b1BsYXkmJih0aGlzLnBsYXllci5wbGF5KCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsdGhpcykpfSxyLnBsYXlQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5wbGF5KCl9LHIuc3RvcFBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnN0b3AoKX0sci5wYXVzZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnBhdXNlKCl9LHIudW5wYXVzZVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnVucGF1c2UoKX0sci5kZWFjdGl2YXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIuc3RvcCgpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VlbnRlclwiLHRoaXMpfSxyLm9ubW91c2VlbnRlcj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wYXVzZUF1dG9QbGF5T25Ib3ZlciYmKHRoaXMucGxheWVyLnBhdXNlKCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWxlYXZlXCIsdGhpcykpfSxyLm9ubW91c2VsZWF2ZT1mdW5jdGlvbigpe3RoaXMucGxheWVyLnVucGF1c2UoKSx0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIix0aGlzKX0saS5QbGF5ZXI9bixpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvYWRkLXJlbW92ZS1jZWxsXCIsW1wiLi9mbGlja2l0eVwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpKTplKHQsdC5GbGlja2l0eSx0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7ZnVuY3Rpb24gbih0KXt2YXIgZT1kb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KCk7cmV0dXJuIHQuZm9yRWFjaChmdW5jdGlvbih0KXtlLmFwcGVuZENoaWxkKHQuZWxlbWVudCl9KSxlfXZhciBzPWUucHJvdG90eXBlO3JldHVybiBzLmluc2VydD1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX21ha2VDZWxscyh0KTtpZihpJiZpLmxlbmd0aCl7dmFyIHM9dGhpcy5jZWxscy5sZW5ndGg7ZT12b2lkIDA9PT1lP3M6ZTt2YXIgbz1uKGkpLHI9ZT09cztpZihyKXRoaXMuc2xpZGVyLmFwcGVuZENoaWxkKG8pO2Vsc2V7dmFyIGE9dGhpcy5jZWxsc1tlXS5lbGVtZW50O3RoaXMuc2xpZGVyLmluc2VydEJlZm9yZShvLGEpfWlmKDA9PT1lKXRoaXMuY2VsbHM9aS5jb25jYXQodGhpcy5jZWxscyk7ZWxzZSBpZihyKXRoaXMuY2VsbHM9dGhpcy5jZWxscy5jb25jYXQoaSk7ZWxzZXt2YXIgbD10aGlzLmNlbGxzLnNwbGljZShlLHMtZSk7dGhpcy5jZWxscz10aGlzLmNlbGxzLmNvbmNhdChpKS5jb25jYXQobCl9dGhpcy5fc2l6ZUNlbGxzKGkpO3ZhciBoPWU+dGhpcy5zZWxlY3RlZEluZGV4PzA6aS5sZW5ndGg7dGhpcy5fY2VsbEFkZGVkUmVtb3ZlZChlLGgpfX0scy5hcHBlbmQ9ZnVuY3Rpb24odCl7dGhpcy5pbnNlcnQodCx0aGlzLmNlbGxzLmxlbmd0aCl9LHMucHJlcGVuZD1mdW5jdGlvbih0KXt0aGlzLmluc2VydCh0LDApfSxzLnJlbW92ZT1mdW5jdGlvbih0KXt2YXIgZSxuLHM9dGhpcy5nZXRDZWxscyh0KSxvPTAscj1zLmxlbmd0aDtmb3IoZT0wO2U8cjtlKyspe249c1tlXTt2YXIgYT10aGlzLmNlbGxzLmluZGV4T2Yobik8dGhpcy5zZWxlY3RlZEluZGV4O28tPWE/MTowfWZvcihlPTA7ZTxyO2UrKyluPXNbZV0sbi5yZW1vdmUoKSxpLnJlbW92ZUZyb20odGhpcy5jZWxscyxuKTtzLmxlbmd0aCYmdGhpcy5fY2VsbEFkZGVkUmVtb3ZlZCgwLG8pfSxzLl9jZWxsQWRkZWRSZW1vdmVkPWZ1bmN0aW9uKHQsZSl7ZT1lfHwwLHRoaXMuc2VsZWN0ZWRJbmRleCs9ZSx0aGlzLnNlbGVjdGVkSW5kZXg9TWF0aC5tYXgoMCxNYXRoLm1pbih0aGlzLnNsaWRlcy5sZW5ndGgtMSx0aGlzLnNlbGVjdGVkSW5kZXgpKSx0aGlzLmNlbGxDaGFuZ2UodCwhMCksdGhpcy5lbWl0RXZlbnQoXCJjZWxsQWRkZWRSZW1vdmVkXCIsW3QsZV0pfSxzLmNlbGxTaXplQ2hhbmdlPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0Q2VsbCh0KTtpZihlKXtlLmdldFNpemUoKTt2YXIgaT10aGlzLmNlbGxzLmluZGV4T2YoZSk7dGhpcy5jZWxsQ2hhbmdlKGkpfX0scy5jZWxsQ2hhbmdlPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5zbGlkZWFibGVXaWR0aDtpZih0aGlzLl9wb3NpdGlvbkNlbGxzKHQpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpLHRoaXMuZW1pdEV2ZW50KFwiY2VsbENoYW5nZVwiLFt0XSksdGhpcy5vcHRpb25zLmZyZWVTY3JvbGwpe3ZhciBuPWktdGhpcy5zbGlkZWFibGVXaWR0aDt0aGlzLngrPW4qdGhpcy5jZWxsQWxpZ24sdGhpcy5wb3NpdGlvblNsaWRlcigpfWVsc2UgZSYmdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKSx0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgpfSxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvbGF6eWxvYWRcIixbXCIuL2ZsaWNraXR5XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe2lmKFwiSU1HXCI9PXQubm9kZU5hbWUmJnQuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKSlyZXR1cm5bdF07dmFyIGU9dC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nW2RhdGEtZmxpY2tpdHktbGF6eWxvYWRdXCIpO3JldHVybiBpLm1ha2VBcnJheShlKX1mdW5jdGlvbiBzKHQsZSl7dGhpcy5pbWc9dCx0aGlzLmZsaWNraXR5PWUsdGhpcy5sb2FkKCl9ZS5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlTGF6eWxvYWRcIik7dmFyIG89ZS5wcm90b3R5cGU7cmV0dXJuIG8uX2NyZWF0ZUxhenlsb2FkPWZ1bmN0aW9uKCl7dGhpcy5vbihcInNlbGVjdFwiLHRoaXMubGF6eUxvYWQpfSxvLmxhenlMb2FkPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLmxhenlMb2FkO2lmKHQpe3ZhciBlPVwibnVtYmVyXCI9PXR5cGVvZiB0P3Q6MCxpPXRoaXMuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMoZSksbz1bXTtpLmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGU9bih0KTtvPW8uY29uY2F0KGUpfSksby5mb3JFYWNoKGZ1bmN0aW9uKHQpe25ldyBzKHQsdGhpcyl9LHRoaXMpfX0scy5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9aS5oYW5kbGVFdmVudCxzLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7dGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5zcmM9dGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKSx0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkXCIpfSxzLnByb3RvdHlwZS5vbmxvYWQ9ZnVuY3Rpb24odCl7dGhpcy5jb21wbGV0ZSh0LFwiZmxpY2tpdHktbGF6eWxvYWRlZFwiKX0scy5wcm90b3R5cGUub25lcnJvcj1mdW5jdGlvbih0KXt0aGlzLmNvbXBsZXRlKHQsXCJmbGlja2l0eS1sYXp5ZXJyb3JcIil9LHMucHJvdG90eXBlLmNvbXBsZXRlPWZ1bmN0aW9uKHQsZSl7dGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKTt2YXIgaT10aGlzLmZsaWNraXR5LmdldFBhcmVudENlbGwodGhpcy5pbWcpLG49aSYmaS5lbGVtZW50O3RoaXMuZmxpY2tpdHkuY2VsbFNpemVDaGFuZ2UobiksdGhpcy5pbWcuY2xhc3NMaXN0LmFkZChlKSx0aGlzLmZsaWNraXR5LmRpc3BhdGNoRXZlbnQoXCJsYXp5TG9hZFwiLHQsbil9LGUuTGF6eUxvYWRlcj1zLGV9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9pbmRleFwiLFtcIi4vZmxpY2tpdHlcIixcIi4vZHJhZ1wiLFwiLi9wcmV2LW5leHQtYnV0dG9uXCIsXCIuL3BhZ2UtZG90c1wiLFwiLi9wbGF5ZXJcIixcIi4vYWRkLXJlbW92ZS1jZWxsXCIsXCIuL2xhenlsb2FkXCJdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzJiYobW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiLi9kcmFnXCIpLHJlcXVpcmUoXCIuL3ByZXYtbmV4dC1idXR0b25cIikscmVxdWlyZShcIi4vcGFnZS1kb3RzXCIpLHJlcXVpcmUoXCIuL3BsYXllclwiKSxyZXF1aXJlKFwiLi9hZGQtcmVtb3ZlLWNlbGxcIikscmVxdWlyZShcIi4vbGF6eWxvYWRcIikpKX0od2luZG93LGZ1bmN0aW9uKHQpe3JldHVybiB0fSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHktYXMtbmF2LWZvci9hcy1uYXYtZm9yXCIsW1wiZmxpY2tpdHkvanMvaW5kZXhcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcImZsaWNraXR5XCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6dC5GbGlja2l0eT1lKHQuRmxpY2tpdHksdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSxpKXtyZXR1cm4oZS10KSppK3R9dC5jcmVhdGVNZXRob2RzLnB1c2goXCJfY3JlYXRlQXNOYXZGb3JcIik7dmFyIG49dC5wcm90b3R5cGU7cmV0dXJuIG4uX2NyZWF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZUFzTmF2Rm9yKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZUFzTmF2Rm9yKSx0aGlzLm9uKFwiZGVzdHJveVwiLHRoaXMuZGVzdHJveUFzTmF2Rm9yKTt2YXIgdD10aGlzLm9wdGlvbnMuYXNOYXZGb3I7aWYodCl7dmFyIGU9dGhpcztzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5zZXROYXZDb21wYW5pb24odCl9KX19LG4uc2V0TmF2Q29tcGFuaW9uPWZ1bmN0aW9uKGkpe2k9ZS5nZXRRdWVyeUVsZW1lbnQoaSk7dmFyIG49dC5kYXRhKGkpO2lmKG4mJm4hPXRoaXMpe3RoaXMubmF2Q29tcGFuaW9uPW47dmFyIHM9dGhpczt0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0PWZ1bmN0aW9uKCl7cy5uYXZDb21wYW5pb25TZWxlY3QoKX0sbi5vbihcInNlbGVjdFwiLHRoaXMub25OYXZDb21wYW5pb25TZWxlY3QpLHRoaXMub24oXCJzdGF0aWNDbGlja1wiLHRoaXMub25OYXZTdGF0aWNDbGljayksdGhpcy5uYXZDb21wYW5pb25TZWxlY3QoITApfX0sbi5uYXZDb21wYW5pb25TZWxlY3Q9ZnVuY3Rpb24odCl7aWYodGhpcy5uYXZDb21wYW5pb24pe3ZhciBlPXRoaXMubmF2Q29tcGFuaW9uLnNlbGVjdGVkQ2VsbHNbMF0sbj10aGlzLm5hdkNvbXBhbmlvbi5jZWxscy5pbmRleE9mKGUpLHM9bit0aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RlZENlbGxzLmxlbmd0aC0xLG89TWF0aC5mbG9vcihpKG4scyx0aGlzLm5hdkNvbXBhbmlvbi5jZWxsQWxpZ24pKTtpZih0aGlzLnNlbGVjdENlbGwobywhMSx0KSx0aGlzLnJlbW92ZU5hdlNlbGVjdGVkRWxlbWVudHMoKSwhKG8+PXRoaXMuY2VsbHMubGVuZ3RoKSl7dmFyIHI9dGhpcy5jZWxscy5zbGljZShuLHMrMSk7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzPXIubWFwKGZ1bmN0aW9uKHQpe3JldHVybiB0LmVsZW1lbnR9KSx0aGlzLmNoYW5nZU5hdlNlbGVjdGVkQ2xhc3MoXCJhZGRcIil9fX0sbi5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzPWZ1bmN0aW9uKHQpe3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2UuY2xhc3NMaXN0W3RdKFwiaXMtbmF2LXNlbGVjdGVkXCIpfSl9LG4uYWN0aXZhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMubmF2Q29tcGFuaW9uU2VsZWN0KCEwKX0sbi5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzPWZ1bmN0aW9uKCl7dGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzJiYodGhpcy5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzKFwicmVtb3ZlXCIpLGRlbGV0ZSB0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMpfSxuLm9uTmF2U3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlLGksbil7XCJudW1iZXJcIj09dHlwZW9mIG4mJnRoaXMubmF2Q29tcGFuaW9uLnNlbGVjdENlbGwobil9LG4uZGVhY3RpdmF0ZUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzKCl9LG4uZGVzdHJveUFzTmF2Rm9yPWZ1bmN0aW9uKCl7dGhpcy5uYXZDb21wYW5pb24mJih0aGlzLm5hdkNvbXBhbmlvbi5vZmYoXCJzZWxlY3RcIix0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0KSx0aGlzLm9mZihcInN0YXRpY0NsaWNrXCIsdGhpcy5vbk5hdlN0YXRpY0NsaWNrKSxkZWxldGUgdGhpcy5uYXZDb21wYW5pb24pfSx0fSksZnVuY3Rpb24odCxlKXtcInVzZSBzdHJpY3RcIjtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiaW1hZ2VzbG9hZGVkL2ltYWdlc2xvYWRlZFwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJldi1lbWl0dGVyXCIpKTp0LmltYWdlc0xvYWRlZD1lKHQsdC5FdkVtaXR0ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSl7Zm9yKHZhciBpIGluIGUpdFtpXT1lW2ldO3JldHVybiB0fWZ1bmN0aW9uIG4odCl7dmFyIGU9W107aWYoQXJyYXkuaXNBcnJheSh0KSllPXQ7ZWxzZSBpZihcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGgpZm9yKHZhciBpPTA7aTx0Lmxlbmd0aDtpKyspZS5wdXNoKHRbaV0pO2Vsc2UgZS5wdXNoKHQpO3JldHVybiBlfWZ1bmN0aW9uIHModCxlLG8pe3JldHVybiB0aGlzIGluc3RhbmNlb2Ygcz8oXCJzdHJpbmdcIj09dHlwZW9mIHQmJih0PWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodCkpLHRoaXMuZWxlbWVudHM9bih0KSx0aGlzLm9wdGlvbnM9aSh7fSx0aGlzLm9wdGlvbnMpLFwiZnVuY3Rpb25cIj09dHlwZW9mIGU/bz1lOmkodGhpcy5vcHRpb25zLGUpLG8mJnRoaXMub24oXCJhbHdheXNcIixvKSx0aGlzLmdldEltYWdlcygpLGEmJih0aGlzLmpxRGVmZXJyZWQ9bmV3IGEuRGVmZXJyZWQpLHZvaWQgc2V0VGltZW91dChmdW5jdGlvbigpe3RoaXMuY2hlY2soKX0uYmluZCh0aGlzKSkpOm5ldyBzKHQsZSxvKX1mdW5jdGlvbiBvKHQpe3RoaXMuaW1nPXR9ZnVuY3Rpb24gcih0LGUpe3RoaXMudXJsPXQsdGhpcy5lbGVtZW50PWUsdGhpcy5pbWc9bmV3IEltYWdlfXZhciBhPXQualF1ZXJ5LGw9dC5jb25zb2xlO3MucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLHMucHJvdG90eXBlLm9wdGlvbnM9e30scy5wcm90b3R5cGUuZ2V0SW1hZ2VzPWZ1bmN0aW9uKCl7dGhpcy5pbWFnZXM9W10sdGhpcy5lbGVtZW50cy5mb3JFYWNoKHRoaXMuYWRkRWxlbWVudEltYWdlcyx0aGlzKX0scy5wcm90b3R5cGUuYWRkRWxlbWVudEltYWdlcz1mdW5jdGlvbih0KXtcIklNR1wiPT10Lm5vZGVOYW1lJiZ0aGlzLmFkZEltYWdlKHQpLHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kPT09ITAmJnRoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXModCk7dmFyIGU9dC5ub2RlVHlwZTtpZihlJiZoW2VdKXtmb3IodmFyIGk9dC5xdWVyeVNlbGVjdG9yQWxsKFwiaW1nXCIpLG49MDtuPGkubGVuZ3RoO24rKyl7dmFyIHM9aVtuXTt0aGlzLmFkZEltYWdlKHMpfWlmKFwic3RyaW5nXCI9PXR5cGVvZiB0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCl7dmFyIG89dC5xdWVyeVNlbGVjdG9yQWxsKHRoaXMub3B0aW9ucy5iYWNrZ3JvdW5kKTtmb3Iobj0wO248by5sZW5ndGg7bisrKXt2YXIgcj1vW25dO3RoaXMuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXMocil9fX19O3ZhciBoPXsxOiEwLDk6ITAsMTE6ITB9O3JldHVybiBzLnByb3RvdHlwZS5hZGRFbGVtZW50QmFja2dyb3VuZEltYWdlcz1mdW5jdGlvbih0KXt2YXIgZT1nZXRDb21wdXRlZFN0eWxlKHQpO2lmKGUpZm9yKHZhciBpPS91cmxcXCgoWydcIl0pPyguKj8pXFwxXFwpL2dpLG49aS5leGVjKGUuYmFja2dyb3VuZEltYWdlKTtudWxsIT09bjspe3ZhciBzPW4mJm5bMl07cyYmdGhpcy5hZGRCYWNrZ3JvdW5kKHMsdCksbj1pLmV4ZWMoZS5iYWNrZ3JvdW5kSW1hZ2UpfX0scy5wcm90b3R5cGUuYWRkSW1hZ2U9ZnVuY3Rpb24odCl7dmFyIGU9bmV3IG8odCk7dGhpcy5pbWFnZXMucHVzaChlKX0scy5wcm90b3R5cGUuYWRkQmFja2dyb3VuZD1mdW5jdGlvbih0LGUpe3ZhciBpPW5ldyByKHQsZSk7dGhpcy5pbWFnZXMucHVzaChpKX0scy5wcm90b3R5cGUuY2hlY2s9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsaSxuKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZS5wcm9ncmVzcyh0LGksbil9KX12YXIgZT10aGlzO3JldHVybiB0aGlzLnByb2dyZXNzZWRDb3VudD0wLHRoaXMuaGFzQW55QnJva2VuPSExLHRoaXMuaW1hZ2VzLmxlbmd0aD92b2lkIHRoaXMuaW1hZ2VzLmZvckVhY2goZnVuY3Rpb24oZSl7ZS5vbmNlKFwicHJvZ3Jlc3NcIix0KSxlLmNoZWNrKCl9KTp2b2lkIHRoaXMuY29tcGxldGUoKX0scy5wcm90b3R5cGUucHJvZ3Jlc3M9ZnVuY3Rpb24odCxlLGkpe3RoaXMucHJvZ3Jlc3NlZENvdW50KyssdGhpcy5oYXNBbnlCcm9rZW49dGhpcy5oYXNBbnlCcm9rZW58fCF0LmlzTG9hZGVkLHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0LGVdKSx0aGlzLmpxRGVmZXJyZWQmJnRoaXMuanFEZWZlcnJlZC5ub3RpZnkmJnRoaXMuanFEZWZlcnJlZC5ub3RpZnkodGhpcyx0KSx0aGlzLnByb2dyZXNzZWRDb3VudD09dGhpcy5pbWFnZXMubGVuZ3RoJiZ0aGlzLmNvbXBsZXRlKCksdGhpcy5vcHRpb25zLmRlYnVnJiZsJiZsLmxvZyhcInByb2dyZXNzOiBcIitpLHQsZSl9LHMucHJvdG90eXBlLmNvbXBsZXRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5oYXNBbnlCcm9rZW4/XCJmYWlsXCI6XCJkb25lXCI7aWYodGhpcy5pc0NvbXBsZXRlPSEwLHRoaXMuZW1pdEV2ZW50KHQsW3RoaXNdKSx0aGlzLmVtaXRFdmVudChcImFsd2F5c1wiLFt0aGlzXSksdGhpcy5qcURlZmVycmVkKXt2YXIgZT10aGlzLmhhc0FueUJyb2tlbj9cInJlamVjdFwiOlwicmVzb2x2ZVwiO3RoaXMuanFEZWZlcnJlZFtlXSh0aGlzKX19LG8ucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoZS5wcm90b3R5cGUpLG8ucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTtyZXR1cm4gdD92b2lkIHRoaXMuY29uZmlybSgwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRoLFwibmF0dXJhbFdpZHRoXCIpOih0aGlzLnByb3h5SW1hZ2U9bmV3IEltYWdlLHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMucHJveHlJbWFnZS5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHZvaWQodGhpcy5wcm94eUltYWdlLnNyYz10aGlzLmltZy5zcmMpKX0sby5wcm90b3R5cGUuZ2V0SXNJbWFnZUNvbXBsZXRlPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuaW1nLmNvbXBsZXRlJiZ2b2lkIDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGh9LG8ucHJvdG90eXBlLmNvbmZpcm09ZnVuY3Rpb24odCxlKXt0aGlzLmlzTG9hZGVkPXQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHRoaXMuaW1nLGVdKX0sby5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9ZnVuY3Rpb24odCl7dmFyIGU9XCJvblwiK3QudHlwZTt0aGlzW2VdJiZ0aGlzW2VdKHQpfSxvLnByb3RvdHlwZS5vbmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLmNvbmZpcm0oITAsXCJvbmxvYWRcIiksdGhpcy51bmJpbmRFdmVudHMoKX0sby5wcm90b3R5cGUub25lcnJvcj1mdW5jdGlvbigpe3RoaXMuY29uZmlybSghMSxcIm9uZXJyb3JcIiksdGhpcy51bmJpbmRFdmVudHMoKX0sby5wcm90b3R5cGUudW5iaW5kRXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5wcm94eUltYWdlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyl9LHIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoby5wcm90b3R5cGUpLHIucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7dGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5zcmM9dGhpcy51cmw7dmFyIHQ9dGhpcy5nZXRJc0ltYWdlQ29tcGxldGUoKTt0JiYodGhpcy5jb25maXJtKDAhPT10aGlzLmltZy5uYXR1cmFsV2lkdGgsXCJuYXR1cmFsV2lkdGhcIiksdGhpcy51bmJpbmRFdmVudHMoKSl9LHIucHJvdG90eXBlLnVuYmluZEV2ZW50cz1mdW5jdGlvbigpe3RoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyl9LHIucHJvdG90eXBlLmNvbmZpcm09ZnVuY3Rpb24odCxlKXt0aGlzLmlzTG9hZGVkPXQsdGhpcy5lbWl0RXZlbnQoXCJwcm9ncmVzc1wiLFt0aGlzLHRoaXMuZWxlbWVudCxlXSl9LHMubWFrZUpRdWVyeVBsdWdpbj1mdW5jdGlvbihlKXtlPWV8fHQualF1ZXJ5LGUmJihhPWUsYS5mbi5pbWFnZXNMb2FkZWQ9ZnVuY3Rpb24odCxlKXt2YXIgaT1uZXcgcyh0aGlzLHQsZSk7cmV0dXJuIGkuanFEZWZlcnJlZC5wcm9taXNlKGEodGhpcykpfSl9LHMubWFrZUpRdWVyeVBsdWdpbigpLHN9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wiZmxpY2tpdHkvanMvaW5kZXhcIixcImltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWRcIl0sZnVuY3Rpb24oaSxuKXtyZXR1cm4gZSh0LGksbil9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImZsaWNraXR5XCIpLHJlcXVpcmUoXCJpbWFnZXNsb2FkZWRcIikpOnQuRmxpY2tpdHk9ZSh0LHQuRmxpY2tpdHksdC5pbWFnZXNMb2FkZWQpfSh3aW5kb3csZnVuY3Rpb24odCxlLGkpe1widXNlIHN0cmljdFwiO2UuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUltYWdlc0xvYWRlZFwiKTt2YXIgbj1lLnByb3RvdHlwZTtyZXR1cm4gbi5fY3JlYXRlSW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5pbWFnZXNMb2FkZWQpfSxuLmltYWdlc0xvYWRlZD1mdW5jdGlvbigpe2Z1bmN0aW9uIHQodCxpKXt2YXIgbj1lLmdldFBhcmVudENlbGwoaS5pbWcpO2UuY2VsbFNpemVDaGFuZ2UobiYmbi5lbGVtZW50KSxlLm9wdGlvbnMuZnJlZVNjcm9sbHx8ZS5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKX1pZih0aGlzLm9wdGlvbnMuaW1hZ2VzTG9hZGVkKXt2YXIgZT10aGlzO2kodGhpcy5zbGlkZXIpLm9uKFwicHJvZ3Jlc3NcIix0KX19LGV9KTsiLCIvKipcbiAqIEZsaWNraXR5IGJhY2tncm91bmQgbGF6eWxvYWQgdjEuMC4wXG4gKiBsYXp5bG9hZCBiYWNrZ3JvdW5kIGNlbGwgaW1hZ2VzXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW51c2VkOiB0cnVlLCB1bmRlZjogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKmdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoIFtcbiAgICAgICdmbGlja2l0eS9qcy9pbmRleCcsXG4gICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnXG4gICAgXSwgZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KFxuICAgICAgcmVxdWlyZSgnZmxpY2tpdHknKSxcbiAgICAgIHJlcXVpcmUoJ2Zpenp5LXVpLXV0aWxzJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgZmFjdG9yeShcbiAgICAgIHdpbmRvdy5GbGlja2l0eSxcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHNcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggRmxpY2tpdHksIHV0aWxzICkge1xuLypqc2hpbnQgc3RyaWN0OiB0cnVlICovXG4ndXNlIHN0cmljdCc7XG5cbkZsaWNraXR5LmNyZWF0ZU1ldGhvZHMucHVzaCgnX2NyZWF0ZUJnTGF6eUxvYWQnKTtcblxudmFyIHByb3RvID0gRmxpY2tpdHkucHJvdG90eXBlO1xuXG5wcm90by5fY3JlYXRlQmdMYXp5TG9hZCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLm9uKCAnc2VsZWN0JywgdGhpcy5iZ0xhenlMb2FkICk7XG59O1xuXG5wcm90by5iZ0xhenlMb2FkID0gZnVuY3Rpb24oKSB7XG4gIHZhciBsYXp5TG9hZCA9IHRoaXMub3B0aW9ucy5iZ0xhenlMb2FkO1xuICBpZiAoICFsYXp5TG9hZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBnZXQgYWRqYWNlbnQgY2VsbHMsIHVzZSBsYXp5TG9hZCBvcHRpb24gZm9yIGFkamFjZW50IGNvdW50XG4gIHZhciBhZGpDb3VudCA9IHR5cGVvZiBsYXp5TG9hZCA9PSAnbnVtYmVyJyA/IGxhenlMb2FkIDogMDtcbiAgdmFyIGNlbGxFbGVtcyA9IHRoaXMuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHMoIGFkakNvdW50ICk7XG5cbiAgZm9yICggdmFyIGk9MDsgaSA8IGNlbGxFbGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgY2VsbEVsZW0gPSBjZWxsRWxlbXNbaV07XG4gICAgdGhpcy5iZ0xhenlMb2FkRWxlbSggY2VsbEVsZW0gKTtcbiAgICAvLyBzZWxlY3QgbGF6eSBlbGVtcyBpbiBjZWxsXG4gICAgdmFyIGNoaWxkcmVuID0gY2VsbEVsZW0ucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWRdJyk7XG4gICAgZm9yICggdmFyIGo9MDsgaiA8IGNoaWxkcmVuLmxlbmd0aDsgaisrICkge1xuICAgICAgdGhpcy5iZ0xhenlMb2FkRWxlbSggY2hpbGRyZW5bal0gKTtcbiAgICB9XG4gIH1cbn07XG5cbnByb3RvLmJnTGF6eUxvYWRFbGVtID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHZhciBhdHRyID0gZWxlbS5nZXRBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWQnKTtcbiAgaWYgKCBhdHRyICkge1xuICAgIG5ldyBCZ0xhenlMb2FkZXIoIGVsZW0sIGF0dHIsIHRoaXMgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gTGF6eUJHTG9hZGVyIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogY2xhc3MgdG8gaGFuZGxlIGxvYWRpbmcgaW1hZ2VzXG4gKi9cbmZ1bmN0aW9uIEJnTGF6eUxvYWRlciggZWxlbSwgdXJsLCBmbGlja2l0eSApIHtcbiAgdGhpcy5lbGVtZW50ID0gZWxlbTtcbiAgdGhpcy51cmwgPSB1cmw7XG4gIHRoaXMuaW1nID0gbmV3IEltYWdlKCk7XG4gIHRoaXMuZmxpY2tpdHkgPSBmbGlja2l0eTtcbiAgdGhpcy5sb2FkKCk7XG59XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUuaGFuZGxlRXZlbnQgPSB1dGlscy5oYW5kbGVFdmVudDtcblxuQmdMYXp5TG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoICdsb2FkJywgdGhpcyApO1xuICB0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKCAnZXJyb3InLCB0aGlzICk7XG4gIC8vIGxvYWQgaW1hZ2VcbiAgdGhpcy5pbWcuc3JjID0gdGhpcy51cmw7XG4gIC8vIHJlbW92ZSBhdHRyXG4gIHRoaXMuZWxlbWVudC5yZW1vdmVBdHRyaWJ1dGUoJ2RhdGEtZmxpY2tpdHktYmctbGF6eWxvYWQnKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUub25sb2FkID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLmVsZW1lbnQuc3R5bGUuYmFja2dyb3VuZEltYWdlID0gJ3VybCgnICsgdGhpcy51cmwgKyAnKSc7XG4gIHRoaXMuY29tcGxldGUoIGV2ZW50LCAnZmxpY2tpdHktYmctbGF6eWxvYWRlZCcgKTtcbn07XG5cbkJnTGF6eUxvYWRlci5wcm90b3R5cGUub25lcnJvciA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdGhpcy5jb21wbGV0ZSggZXZlbnQsICdmbGlja2l0eS1iZy1sYXp5ZXJyb3InICk7XG59O1xuXG5CZ0xhenlMb2FkZXIucHJvdG90eXBlLmNvbXBsZXRlID0gZnVuY3Rpb24oIGV2ZW50LCBjbGFzc05hbWUgKSB7XG4gIC8vIHVuYmluZCBldmVudHNcbiAgdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lciggJ2xvYWQnLCB0aGlzICk7XG4gIHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoICdlcnJvcicsIHRoaXMgKTtcblxuICB0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCggY2xhc3NOYW1lICk7XG4gIHRoaXMuZmxpY2tpdHkuZGlzcGF0Y2hFdmVudCggJ2JnTGF6eUxvYWQnLCBldmVudCwgdGhpcy5lbGVtZW50ICk7XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxuRmxpY2tpdHkuQmdMYXp5TG9hZGVyID0gQmdMYXp5TG9hZGVyO1xuXG5yZXR1cm4gRmxpY2tpdHk7XG5cbn0pKTtcbiIsIi8qKlxuKiAgQWpheCBBdXRvY29tcGxldGUgZm9yIGpRdWVyeSwgdmVyc2lvbiAxLjIuMjdcbiogIChjKSAyMDE1IFRvbWFzIEtpcmRhXG4qXG4qICBBamF4IEF1dG9jb21wbGV0ZSBmb3IgalF1ZXJ5IGlzIGZyZWVseSBkaXN0cmlidXRhYmxlIHVuZGVyIHRoZSB0ZXJtcyBvZiBhbiBNSVQtc3R5bGUgbGljZW5zZS5cbiogIEZvciBkZXRhaWxzLCBzZWUgdGhlIHdlYiBzaXRlOiBodHRwczovL2dpdGh1Yi5jb20vZGV2YnJpZGdlL2pRdWVyeS1BdXRvY29tcGxldGVcbiovXG5cbi8qanNsaW50ICBicm93c2VyOiB0cnVlLCB3aGl0ZTogdHJ1ZSwgc2luZ2xlOiB0cnVlLCB0aGlzOiB0cnVlLCBtdWx0aXZhcjogdHJ1ZSAqL1xuLypnbG9iYWwgZGVmaW5lLCB3aW5kb3csIGRvY3VtZW50LCBqUXVlcnksIGV4cG9ydHMsIHJlcXVpcmUgKi9cblxuLy8gRXhwb3NlIHBsdWdpbiBhcyBhbiBBTUQgbW9kdWxlIGlmIEFNRCBsb2FkZXIgaXMgcHJlc2VudDpcbihmdW5jdGlvbiAoZmFjdG9yeSkge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgLy8gQU1ELiBSZWdpc3RlciBhcyBhbiBhbm9ueW1vdXMgbW9kdWxlLlxuICAgICAgICBkZWZpbmUoWydqcXVlcnknXSwgZmFjdG9yeSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHJlcXVpcmUgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gQnJvd3NlcmlmeVxuICAgICAgICBmYWN0b3J5KHJlcXVpcmUoJ2pxdWVyeScpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHNcbiAgICAgICAgZmFjdG9yeShqUXVlcnkpO1xuICAgIH1cbn0oZnVuY3Rpb24gKCQpIHtcbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICB2YXJcbiAgICAgICAgdXRpbHMgPSAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBlc2NhcGVSZWdFeENoYXJzOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnJlcGxhY2UoL1t8XFxcXHt9KClbXFxdXiQrKj8uXS9nLCBcIlxcXFwkJlwiKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNyZWF0ZU5vZGU6IGZ1bmN0aW9uIChjb250YWluZXJDbGFzcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgICAgIGRpdi5jbGFzc05hbWUgPSBjb250YWluZXJDbGFzcztcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgICAgICAgICAgICAgZGl2LnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkaXY7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSgpKSxcblxuICAgICAgICBrZXlzID0ge1xuICAgICAgICAgICAgRVNDOiAyNyxcbiAgICAgICAgICAgIFRBQjogOSxcbiAgICAgICAgICAgIFJFVFVSTjogMTMsXG4gICAgICAgICAgICBMRUZUOiAzNyxcbiAgICAgICAgICAgIFVQOiAzOCxcbiAgICAgICAgICAgIFJJR0hUOiAzOSxcbiAgICAgICAgICAgIERPV046IDQwXG4gICAgICAgIH07XG5cbiAgICBmdW5jdGlvbiBBdXRvY29tcGxldGUoZWwsIG9wdGlvbnMpIHtcbiAgICAgICAgdmFyIG5vb3AgPSAkLm5vb3AsXG4gICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgIGRlZmF1bHRzID0ge1xuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5nczoge30sXG4gICAgICAgICAgICAgICAgYXV0b1NlbGVjdEZpcnN0OiBmYWxzZSxcbiAgICAgICAgICAgICAgICBhcHBlbmRUbzogZG9jdW1lbnQuYm9keSxcbiAgICAgICAgICAgICAgICBzZXJ2aWNlVXJsOiBudWxsLFxuICAgICAgICAgICAgICAgIGxvb2t1cDogbnVsbCxcbiAgICAgICAgICAgICAgICBvblNlbGVjdDogbnVsbCxcbiAgICAgICAgICAgICAgICB3aWR0aDogJ2F1dG8nLFxuICAgICAgICAgICAgICAgIG1pbkNoYXJzOiAxLFxuICAgICAgICAgICAgICAgIG1heEhlaWdodDogMzAwLFxuICAgICAgICAgICAgICAgIGRlZmVyUmVxdWVzdEJ5OiAwLFxuICAgICAgICAgICAgICAgIHBhcmFtczoge30sXG4gICAgICAgICAgICAgICAgZm9ybWF0UmVzdWx0OiBBdXRvY29tcGxldGUuZm9ybWF0UmVzdWx0LFxuICAgICAgICAgICAgICAgIGRlbGltaXRlcjogbnVsbCxcbiAgICAgICAgICAgICAgICB6SW5kZXg6IDk5OTksXG4gICAgICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICAgICAgbm9DYWNoZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgb25TZWFyY2hTdGFydDogbm9vcCxcbiAgICAgICAgICAgICAgICBvblNlYXJjaENvbXBsZXRlOiBub29wLFxuICAgICAgICAgICAgICAgIG9uU2VhcmNoRXJyb3I6IG5vb3AsXG4gICAgICAgICAgICAgICAgcHJlc2VydmVJbnB1dDogZmFsc2UsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyQ2xhc3M6ICdhdXRvY29tcGxldGUtc3VnZ2VzdGlvbnMnLFxuICAgICAgICAgICAgICAgIHRhYkRpc2FibGVkOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBkYXRhVHlwZTogJ3RleHQnLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRSZXF1ZXN0OiBudWxsLFxuICAgICAgICAgICAgICAgIHRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQ6IHRydWUsXG4gICAgICAgICAgICAgICAgcHJldmVudEJhZFF1ZXJpZXM6IHRydWUsXG4gICAgICAgICAgICAgICAgbG9va3VwRmlsdGVyOiBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgb3JpZ2luYWxRdWVyeSwgcXVlcnlMb3dlckNhc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHF1ZXJ5TG93ZXJDYXNlKSAhPT0gLTE7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYXJhbU5hbWU6ICdxdWVyeScsXG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtUmVzdWx0OiBmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHR5cGVvZiByZXNwb25zZSA9PT0gJ3N0cmluZycgPyAkLnBhcnNlSlNPTihyZXNwb25zZSkgOiByZXNwb25zZTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNob3dOb1N1Z2dlc3Rpb25Ob3RpY2U6IGZhbHNlLFxuICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbk5vdGljZTogJ05vIHJlc3VsdHMnLFxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAnYm90dG9tJyxcbiAgICAgICAgICAgICAgICBmb3JjZUZpeFBvc2l0aW9uOiBmYWxzZVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAvLyBTaGFyZWQgdmFyaWFibGVzOlxuICAgICAgICB0aGF0LmVsZW1lbnQgPSBlbDtcbiAgICAgICAgdGhhdC5lbCA9ICQoZWwpO1xuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gW107XG4gICAgICAgIHRoYXQuYmFkUXVlcmllcyA9IFtdO1xuICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgdGhhdC5jdXJyZW50VmFsdWUgPSB0aGF0LmVsZW1lbnQudmFsdWU7XG4gICAgICAgIHRoYXQuaW50ZXJ2YWxJZCA9IDA7XG4gICAgICAgIHRoYXQuY2FjaGVkUmVzcG9uc2UgPSB7fTtcbiAgICAgICAgdGhhdC5vbkNoYW5nZUludGVydmFsID0gbnVsbDtcbiAgICAgICAgdGhhdC5vbkNoYW5nZSA9IG51bGw7XG4gICAgICAgIHRoYXQuaXNMb2NhbCA9IGZhbHNlO1xuICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gbnVsbDtcbiAgICAgICAgdGhhdC5vcHRpb25zID0gJC5leHRlbmQoe30sIGRlZmF1bHRzLCBvcHRpb25zKTtcbiAgICAgICAgdGhhdC5jbGFzc2VzID0ge1xuICAgICAgICAgICAgc2VsZWN0ZWQ6ICdhdXRvY29tcGxldGUtc2VsZWN0ZWQnLFxuICAgICAgICAgICAgc3VnZ2VzdGlvbjogJ2F1dG9jb21wbGV0ZS1zdWdnZXN0aW9uJ1xuICAgICAgICB9O1xuICAgICAgICB0aGF0LmhpbnQgPSBudWxsO1xuICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9ICcnO1xuICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG5cbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBhbmQgc2V0IG9wdGlvbnM6XG4gICAgICAgIHRoYXQuaW5pdGlhbGl6ZSgpO1xuICAgICAgICB0aGF0LnNldE9wdGlvbnMob3B0aW9ucyk7XG4gICAgfVxuXG4gICAgQXV0b2NvbXBsZXRlLnV0aWxzID0gdXRpbHM7XG5cbiAgICAkLkF1dG9jb21wbGV0ZSA9IEF1dG9jb21wbGV0ZTtcblxuICAgIEF1dG9jb21wbGV0ZS5mb3JtYXRSZXN1bHQgPSBmdW5jdGlvbiAoc3VnZ2VzdGlvbiwgY3VycmVudFZhbHVlKSB7XG4gICAgICAgIC8vIERvIG5vdCByZXBsYWNlIGFueXRoaW5nIGlmIHRoZXJlIGN1cnJlbnQgdmFsdWUgaXMgZW1wdHlcbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9uLnZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB2YXIgcGF0dGVybiA9ICcoJyArIHV0aWxzLmVzY2FwZVJlZ0V4Q2hhcnMoY3VycmVudFZhbHVlKSArICcpJztcblxuICAgICAgICByZXR1cm4gc3VnZ2VzdGlvbi52YWx1ZVxuICAgICAgICAgICAgLnJlcGxhY2UobmV3IFJlZ0V4cChwYXR0ZXJuLCAnZ2knKSwgJzxzdHJvbmc+JDE8XFwvc3Ryb25nPicpXG4gICAgICAgICAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgICAgICAgICAgLnJlcGxhY2UoLyZsdDsoXFwvP3N0cm9uZykmZ3Q7L2csICc8JDE+Jyk7XG4gICAgfTtcblxuICAgIEF1dG9jb21wbGV0ZS5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAga2lsbGVyRm46IG51bGwsXG5cbiAgICAgICAgaW5pdGlhbGl6ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN1Z2dlc3Rpb25TZWxlY3RvciA9ICcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxuICAgICAgICAgICAgICAgIHNlbGVjdGVkID0gdGhhdC5jbGFzc2VzLnNlbGVjdGVkLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyO1xuXG4gICAgICAgICAgICAvLyBSZW1vdmUgYXV0b2NvbXBsZXRlIGF0dHJpYnV0ZSB0byBwcmV2ZW50IG5hdGl2ZSBzdWdnZXN0aW9uczpcbiAgICAgICAgICAgIHRoYXQuZWxlbWVudC5zZXRBdHRyaWJ1dGUoJ2F1dG9jb21wbGV0ZScsICdvZmYnKTtcblxuICAgICAgICAgICAgdGhhdC5raWxsZXJGbiA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuJyArIHRoYXQub3B0aW9ucy5jb250YWluZXJDbGFzcykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQua2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZGlzYWJsZUtpbGxlckZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgLy8gaHRtbCgpIGRlYWxzIHdpdGggbWFueSB0eXBlczogaHRtbFN0cmluZyBvciBFbGVtZW50IG9yIEFycmF5IG9yIGpRdWVyeVxuICAgICAgICAgICAgdGhhdC5ub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCgnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1uby1zdWdnZXN0aW9uXCI+PC9kaXY+JylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5odG1sKHRoaXMub3B0aW9ucy5ub1N1Z2dlc3Rpb25Ob3RpY2UpLmdldCgwKTtcblxuICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciA9IEF1dG9jb21wbGV0ZS51dGlscy5jcmVhdGVOb2RlKG9wdGlvbnMuY29udGFpbmVyQ2xhc3MpO1xuXG4gICAgICAgICAgICBjb250YWluZXIgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpO1xuXG4gICAgICAgICAgICBjb250YWluZXIuYXBwZW5kVG8ob3B0aW9ucy5hcHBlbmRUbyk7XG5cbiAgICAgICAgICAgIC8vIE9ubHkgc2V0IHdpZHRoIGlmIGl0IHdhcyBwcm92aWRlZDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLndpZHRoICE9PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY3NzKCd3aWR0aCcsIG9wdGlvbnMud2lkdGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIG1vdXNlIG92ZXIgZXZlbnQgb24gc3VnZ2VzdGlvbnMgbGlzdDpcbiAgICAgICAgICAgIGNvbnRhaW5lci5vbignbW91c2VvdmVyLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuYWN0aXZhdGUoJCh0aGlzKS5kYXRhKCdpbmRleCcpKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBEZXNlbGVjdCBhY3RpdmUgZWxlbWVudCB3aGVuIG1vdXNlIGxlYXZlcyBzdWdnZXN0aW9ucyBjb250YWluZXI6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ21vdXNlb3V0LmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAvLyBMaXN0ZW4gZm9yIGNsaWNrIGV2ZW50IG9uIHN1Z2dlc3Rpb25zIGxpc3Q6XG4gICAgICAgICAgICBjb250YWluZXIub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHN1Z2dlc3Rpb25TZWxlY3RvciwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0KCQodGhpcykuZGF0YSgnaW5kZXgnKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplLmF1dG9jb21wbGV0ZScsIHRoYXQuZml4UG9zaXRpb25DYXB0dXJlKTtcblxuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5ZG93bi5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5UHJlc3MoZSk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbigna2V5dXAuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKGUpIHsgdGhhdC5vbktleVVwKGUpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2JsdXIuYXV0b2NvbXBsZXRlJywgZnVuY3Rpb24gKCkgeyB0aGF0Lm9uQmx1cigpOyB9KTtcbiAgICAgICAgICAgIHRoYXQuZWwub24oJ2ZvY3VzLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uICgpIHsgdGhhdC5vbkZvY3VzKCk7IH0pO1xuICAgICAgICAgICAgdGhhdC5lbC5vbignY2hhbmdlLmF1dG9jb21wbGV0ZScsIGZ1bmN0aW9uIChlKSB7IHRoYXQub25LZXlVcChlKTsgfSk7XG4gICAgICAgICAgICB0aGF0LmVsLm9uKCdpbnB1dC5hdXRvY29tcGxldGUnLCBmdW5jdGlvbiAoZSkgeyB0aGF0Lm9uS2V5VXAoZSk7IH0pO1xuICAgICAgICB9LFxuXG4gICAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdGhhdC5maXhQb3NpdGlvbigpO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5lbC52YWwoKS5sZW5ndGggPj0gdGhhdC5vcHRpb25zLm1pbkNoYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vblZhbHVlQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25CbHVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmVuYWJsZUtpbGxlckZuKCk7XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICBhYm9ydEFqYXg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRSZXF1ZXN0KSB7XG4gICAgICAgICAgICAgICAgdGhhdC5jdXJyZW50UmVxdWVzdC5hYm9ydCgpO1xuICAgICAgICAgICAgICAgIHRoYXQuY3VycmVudFJlcXVlc3QgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIHNldE9wdGlvbnM6IGZ1bmN0aW9uIChzdXBwbGllZE9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICAkLmV4dGVuZChvcHRpb25zLCBzdXBwbGllZE9wdGlvbnMpO1xuXG4gICAgICAgICAgICB0aGF0LmlzTG9jYWwgPSAkLmlzQXJyYXkob3B0aW9ucy5sb29rdXApO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5pc0xvY2FsKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KG9wdGlvbnMubG9va3VwKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0aW9ucy5vcmllbnRhdGlvbiA9IHRoYXQudmFsaWRhdGVPcmllbnRhdGlvbihvcHRpb25zLm9yaWVudGF0aW9uLCAnYm90dG9tJyk7XG5cbiAgICAgICAgICAgIC8vIEFkanVzdCBoZWlnaHQsIHdpZHRoIGFuZCB6LWluZGV4OlxuICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5jc3Moe1xuICAgICAgICAgICAgICAgICdtYXgtaGVpZ2h0Jzogb3B0aW9ucy5tYXhIZWlnaHQgKyAncHgnLFxuICAgICAgICAgICAgICAgICd3aWR0aCc6IG9wdGlvbnMud2lkdGggKyAncHgnLFxuICAgICAgICAgICAgICAgICd6LWluZGV4Jzogb3B0aW9ucy56SW5kZXhcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuXG5cbiAgICAgICAgY2xlYXJDYWNoZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5jYWNoZWRSZXNwb25zZSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5iYWRRdWVyaWVzID0gW107XG4gICAgICAgIH0sXG5cbiAgICAgICAgY2xlYXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDYWNoZSgpO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50VmFsdWUgPSAnJztcbiAgICAgICAgICAgIHRoaXMuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNhYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgIHRoYXQuYWJvcnRBamF4KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZW5hYmxlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZml4UG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIFVzZSBvbmx5IHdoZW4gY29udGFpbmVyIGhhcyBhbHJlYWR5IGl0cyBjb250ZW50XG5cbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICAkY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjb250YWluZXJQYXJlbnQgPSAkY29udGFpbmVyLnBhcmVudCgpLmdldCgwKTtcbiAgICAgICAgICAgIC8vIEZpeCBwb3NpdGlvbiBhdXRvbWF0aWNhbGx5IHdoZW4gYXBwZW5kZWQgdG8gYm9keS5cbiAgICAgICAgICAgIC8vIEluIG90aGVyIGNhc2VzIGZvcmNlIHBhcmFtZXRlciBtdXN0IGJlIGdpdmVuLlxuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclBhcmVudCAhPT0gZG9jdW1lbnQuYm9keSAmJiAhdGhhdC5vcHRpb25zLmZvcmNlRml4UG9zaXRpb24pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgc2l0ZVNlYXJjaERpdiA9ICQoJy5zaXRlLXNlYXJjaCcpO1xuICAgICAgICAgICAgLy8gQ2hvb3NlIG9yaWVudGF0aW9uXG4gICAgICAgICAgICB2YXIgb3JpZW50YXRpb24gPSB0aGF0Lm9wdGlvbnMub3JpZW50YXRpb24sXG4gICAgICAgICAgICAgICAgY29udGFpbmVySGVpZ2h0ID0gJGNvbnRhaW5lci5vdXRlckhlaWdodCgpLFxuICAgICAgICAgICAgICAgIGhlaWdodCA9IHNpdGVTZWFyY2hEaXYub3V0ZXJIZWlnaHQoKSxcbiAgICAgICAgICAgICAgICBvZmZzZXQgPSBzaXRlU2VhcmNoRGl2Lm9mZnNldCgpLFxuICAgICAgICAgICAgICAgIHN0eWxlcyA9IHsgJ3RvcCc6IG9mZnNldC50b3AsICdsZWZ0Jzogb2Zmc2V0LmxlZnQgfTtcblxuICAgICAgICAgICAgaWYgKG9yaWVudGF0aW9uID09PSAnYXV0bycpIHtcbiAgICAgICAgICAgICAgICB2YXIgdmlld1BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCksXG4gICAgICAgICAgICAgICAgICAgIHNjcm9sbFRvcCA9ICQod2luZG93KS5zY3JvbGxUb3AoKSxcbiAgICAgICAgICAgICAgICAgICAgdG9wT3ZlcmZsb3cgPSAtc2Nyb2xsVG9wICsgb2Zmc2V0LnRvcCAtIGNvbnRhaW5lckhlaWdodCxcbiAgICAgICAgICAgICAgICAgICAgYm90dG9tT3ZlcmZsb3cgPSBzY3JvbGxUb3AgKyB2aWV3UG9ydEhlaWdodCAtIChvZmZzZXQudG9wICsgaGVpZ2h0ICsgY29udGFpbmVySGVpZ2h0KTtcblxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uID0gKE1hdGgubWF4KHRvcE92ZXJmbG93LCBib3R0b21PdmVyZmxvdykgPT09IHRvcE92ZXJmbG93KSA/ICd0b3AnIDogJ2JvdHRvbSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChvcmllbnRhdGlvbiA9PT0gJ3RvcCcpIHtcbiAgICAgICAgICAgICAgICBzdHlsZXMudG9wICs9IC1jb250YWluZXJIZWlnaHQ7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgKz0gaGVpZ2h0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBJZiBjb250YWluZXIgaXMgbm90IHBvc2l0aW9uZWQgdG8gYm9keSxcbiAgICAgICAgICAgIC8vIGNvcnJlY3QgaXRzIHBvc2l0aW9uIHVzaW5nIG9mZnNldCBwYXJlbnQgb2Zmc2V0XG4gICAgICAgICAgICBpZihjb250YWluZXJQYXJlbnQgIT09IGRvY3VtZW50LmJvZHkpIHtcbiAgICAgICAgICAgICAgICB2YXIgb3BhY2l0eSA9ICRjb250YWluZXIuY3NzKCdvcGFjaXR5JyksXG4gICAgICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmY7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvbnRhaW5lci5jc3MoJ29wYWNpdHknLCAwKS5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHBhcmVudE9mZnNldERpZmYgPSAkY29udGFpbmVyLm9mZnNldFBhcmVudCgpLm9mZnNldCgpO1xuICAgICAgICAgICAgICAgIHN0eWxlcy50b3AgLT0gcGFyZW50T2Zmc2V0RGlmZi50b3A7XG4gICAgICAgICAgICAgICAgc3R5bGVzLmxlZnQgLT0gcGFyZW50T2Zmc2V0RGlmZi5sZWZ0O1xuXG4gICAgICAgICAgICAgICAgaWYgKCF0aGF0LnZpc2libGUpe1xuICAgICAgICAgICAgICAgICAgICAkY29udGFpbmVyLmNzcygnb3BhY2l0eScsIG9wYWNpdHkpLmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0Lm9wdGlvbnMud2lkdGggPT09ICdhdXRvJykge1xuICAgICAgICAgICAgICAgIHN0eWxlcy53aWR0aCA9IHNpdGVTZWFyY2hEaXYub3V0ZXJXaWR0aCgpICsgJ3B4JztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJGNvbnRhaW5lci5jc3Moc3R5bGVzKTtcbiAgICAgICAgfSxcblxuICAgICAgICBlbmFibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrLmF1dG9jb21wbGV0ZScsIHRoYXQua2lsbGVyRm4pO1xuICAgICAgICB9LFxuXG4gICAgICAgIGRpc2FibGVLaWxsZXJGbjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgJChkb2N1bWVudCkub2ZmKCdjbGljay5hdXRvY29tcGxldGUnLCB0aGF0LmtpbGxlckZuKTtcbiAgICAgICAgfSxcblxuICAgICAgICBraWxsU3VnZ2VzdGlvbnM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIHRoYXQuc3RvcEtpbGxTdWdnZXN0aW9ucygpO1xuICAgICAgICAgICAgdGhhdC5pbnRlcnZhbElkID0gd2luZG93LnNldEludGVydmFsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5vIG5lZWQgdG8gcmVzdG9yZSB2YWx1ZSB3aGVuIFxuICAgICAgICAgICAgICAgICAgICAvLyBwcmVzZXJ2ZUlucHV0ID09PSB0cnVlLCBcbiAgICAgICAgICAgICAgICAgICAgLy8gYmVjYXVzZSB3ZSBkaWQgbm90IGNoYW5nZSBpdFxuICAgICAgICAgICAgICAgICAgICBpZiAoIXRoYXQub3B0aW9ucy5wcmVzZXJ2ZUlucHV0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhhdC5zdG9wS2lsbFN1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc3RvcEtpbGxTdWdnZXN0aW9uczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgd2luZG93LmNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgfSxcblxuICAgICAgICBpc0N1cnNvckF0RW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgdmFsTGVuZ3RoID0gdGhhdC5lbC52YWwoKS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uU3RhcnQgPSB0aGF0LmVsZW1lbnQuc2VsZWN0aW9uU3RhcnQsXG4gICAgICAgICAgICAgICAgcmFuZ2U7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2Ygc2VsZWN0aW9uU3RhcnQgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGVjdGlvblN0YXJ0ID09PSB2YWxMZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmFuZ2UgPSBkb2N1bWVudC5zZWxlY3Rpb24uY3JlYXRlUmFuZ2UoKTtcbiAgICAgICAgICAgICAgICByYW5nZS5tb3ZlU3RhcnQoJ2NoYXJhY3RlcicsIC12YWxMZW5ndGgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWxMZW5ndGggPT09IHJhbmdlLnRleHQubGVuZ3RoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25LZXlQcmVzczogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgLy8gSWYgc3VnZ2VzdGlvbnMgYXJlIGhpZGRlbiBhbmQgdXNlciBwcmVzc2VzIGFycm93IGRvd24sIGRpc3BsYXkgc3VnZ2VzdGlvbnM6XG4gICAgICAgICAgICBpZiAoIXRoYXQuZGlzYWJsZWQgJiYgIXRoYXQudmlzaWJsZSAmJiBlLndoaWNoID09PSBrZXlzLkRPV04gJiYgdGhhdC5jdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnN1Z2dlc3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmRpc2FibGVkIHx8ICF0aGF0LnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHN3aXRjaCAoZS53aGljaCkge1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5FU0M6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SSUdIVDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoYXQuaGludCAmJiB0aGF0Lm9wdGlvbnMub25IaW50ICYmIHRoYXQuaXNDdXJzb3JBdEVuZCgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdEhpbnQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVEFCOlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5oaW50ICYmIHRoYXQub3B0aW9ucy5vbkhpbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0SGludCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLnRhYkRpc2FibGVkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5SRVRVUk46XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0LmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdCh0aGF0LnNlbGVjdGVkSW5kZXgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIGtleXMuVVA6XG4gICAgICAgICAgICAgICAgICAgIHRoYXQubW92ZVVwKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm1vdmVEb3duKCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gQ2FuY2VsIGV2ZW50IGlmIGZ1bmN0aW9uIGRpZCBub3QgcmV0dXJuOlxuICAgICAgICAgICAgZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBvbktleVVwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAodGhhdC5kaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3dpdGNoIChlLndoaWNoKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBrZXlzLlVQOlxuICAgICAgICAgICAgICAgIGNhc2Uga2V5cy5ET1dOOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcblxuICAgICAgICAgICAgaWYgKHRoYXQuY3VycmVudFZhbHVlICE9PSB0aGF0LmVsLnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBEZWZlciBsb29rdXAgaW4gY2FzZSB3aGVuIHZhbHVlIGNoYW5nZXMgdmVyeSBxdWlja2x5OlxuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uQ2hhbmdlSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgdGhhdC5vcHRpb25zLmRlZmVyUmVxdWVzdEJ5KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGF0Lm9uVmFsdWVDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25WYWx1ZUNoYW5nZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgdmFsdWUgPSB0aGF0LmVsLnZhbCgpLFxuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gdGhhdC5nZXRRdWVyeSh2YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGlvbiAmJiB0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gcXVlcnkpIHtcbiAgICAgICAgICAgICAgICB0aGF0LnNlbGVjdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgKG9wdGlvbnMub25JbnZhbGlkYXRlU2VsZWN0aW9uIHx8ICQubm9vcCkuY2FsbCh0aGF0LmVsZW1lbnQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjbGVhckludGVydmFsKHRoYXQub25DaGFuZ2VJbnRlcnZhbCk7XG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHZhbHVlO1xuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gLTE7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGV4aXN0aW5nIHN1Z2dlc3Rpb24gZm9yIHRoZSBtYXRjaCBiZWZvcmUgcHJvY2VlZGluZzpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2gocXVlcnkpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocXVlcnkubGVuZ3RoIDwgb3B0aW9ucy5taW5DaGFycykge1xuICAgICAgICAgICAgICAgIHRoYXQuaGlkZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGF0LmdldFN1Z2dlc3Rpb25zKHF1ZXJ5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBpc0V4YWN0TWF0Y2g6IGZ1bmN0aW9uIChxdWVyeSkge1xuICAgICAgICAgICAgdmFyIHN1Z2dlc3Rpb25zID0gdGhpcy5zdWdnZXN0aW9ucztcblxuICAgICAgICAgICAgcmV0dXJuIChzdWdnZXN0aW9ucy5sZW5ndGggPT09IDEgJiYgc3VnZ2VzdGlvbnNbMF0udmFsdWUudG9Mb3dlckNhc2UoKSA9PT0gcXVlcnkudG9Mb3dlckNhc2UoKSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0UXVlcnk6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIGRlbGltaXRlciA9IHRoaXMub3B0aW9ucy5kZWxpbWl0ZXIsXG4gICAgICAgICAgICAgICAgcGFydHM7XG5cbiAgICAgICAgICAgIGlmICghZGVsaW1pdGVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFydHMgPSB2YWx1ZS5zcGxpdChkZWxpbWl0ZXIpO1xuICAgICAgICAgICAgcmV0dXJuICQudHJpbShwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgZ2V0U3VnZ2VzdGlvbnNMb2NhbDogZnVuY3Rpb24gKHF1ZXJ5KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IHRoYXQub3B0aW9ucyxcbiAgICAgICAgICAgICAgICBxdWVyeUxvd2VyQ2FzZSA9IHF1ZXJ5LnRvTG93ZXJDYXNlKCksXG4gICAgICAgICAgICAgICAgZmlsdGVyID0gb3B0aW9ucy5sb29rdXBGaWx0ZXIsXG4gICAgICAgICAgICAgICAgbGltaXQgPSBwYXJzZUludChvcHRpb25zLmxvb2t1cExpbWl0LCAxMCksXG4gICAgICAgICAgICAgICAgZGF0YTtcblxuICAgICAgICAgICAgZGF0YSA9IHtcbiAgICAgICAgICAgICAgICBzdWdnZXN0aW9uczogJC5ncmVwKG9wdGlvbnMubG9va3VwLCBmdW5jdGlvbiAoc3VnZ2VzdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyKHN1Z2dlc3Rpb24sIHF1ZXJ5LCBxdWVyeUxvd2VyQ2FzZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChsaW1pdCAmJiBkYXRhLnN1Z2dlc3Rpb25zLmxlbmd0aCA+IGxpbWl0KSB7XG4gICAgICAgICAgICAgICAgZGF0YS5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnMuc2xpY2UoMCwgbGltaXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSxcblxuICAgICAgICBnZXRTdWdnZXN0aW9uczogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIHZhciByZXNwb25zZSxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zLFxuICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBvcHRpb25zLnNlcnZpY2VVcmwsXG4gICAgICAgICAgICAgICAgcGFyYW1zLFxuICAgICAgICAgICAgICAgIGNhY2hlS2V5LFxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncztcblxuICAgICAgICAgICAgb3B0aW9ucy5wYXJhbXNbb3B0aW9ucy5wYXJhbU5hbWVdID0gcTtcbiAgICAgICAgICAgIHBhcmFtcyA9IG9wdGlvbnMuaWdub3JlUGFyYW1zID8gbnVsbCA6IG9wdGlvbnMucGFyYW1zO1xuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5vblNlYXJjaFN0YXJ0LmNhbGwodGhhdC5lbGVtZW50LCBvcHRpb25zLnBhcmFtcykgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKG9wdGlvbnMubG9va3VwKSl7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5sb29rdXAocSwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IGRhdGEuc3VnZ2VzdGlvbnM7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIGRhdGEuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoYXQuaXNMb2NhbCkge1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5nZXRTdWdnZXN0aW9uc0xvY2FsKHEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoJC5pc0Z1bmN0aW9uKHNlcnZpY2VVcmwpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlcnZpY2VVcmwgPSBzZXJ2aWNlVXJsLmNhbGwodGhhdC5lbGVtZW50LCBxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FjaGVLZXkgPSBzZXJ2aWNlVXJsICsgJz8nICsgJC5wYXJhbShwYXJhbXMgfHwge30pO1xuICAgICAgICAgICAgICAgIHJlc3BvbnNlID0gdGhhdC5jYWNoZWRSZXNwb25zZVtjYWNoZUtleV07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChyZXNwb25zZSAmJiAkLmlzQXJyYXkocmVzcG9uc2Uuc3VnZ2VzdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zdWdnZXN0aW9ucyA9IHJlc3BvbnNlLnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgICAgIHRoYXQuc3VnZ2VzdCgpO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hDb21wbGV0ZS5jYWxsKHRoYXQuZWxlbWVudCwgcSwgcmVzcG9uc2Uuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghdGhhdC5pc0JhZFF1ZXJ5KHEpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5hYm9ydEFqYXgoKTtcblxuICAgICAgICAgICAgICAgIGFqYXhTZXR0aW5ncyA9IHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBzZXJ2aWNlVXJsLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBwYXJhbXMsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG9wdGlvbnMudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgZGF0YVR5cGU6IG9wdGlvbnMuZGF0YVR5cGVcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgJC5leHRlbmQoYWpheFNldHRpbmdzLCBvcHRpb25zLmFqYXhTZXR0aW5ncyk7XG5cbiAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gJC5hamF4KGFqYXhTZXR0aW5ncykuZG9uZShmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmN1cnJlbnRSZXF1ZXN0ID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gb3B0aW9ucy50cmFuc2Zvcm1SZXN1bHQoZGF0YSwgcSk7XG4gICAgICAgICAgICAgICAgICAgIHRoYXQucHJvY2Vzc1Jlc3BvbnNlKHJlc3VsdCwgcSwgY2FjaGVLZXkpO1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uU2VhcmNoQ29tcGxldGUuY2FsbCh0aGF0LmVsZW1lbnQsIHEsIHJlc3VsdC5zdWdnZXN0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSkuZmFpbChmdW5jdGlvbiAoanFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKSB7XG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMub25TZWFyY2hFcnJvci5jYWxsKHRoYXQuZWxlbWVudCwgcSwganFYSFIsIHRleHRTdGF0dXMsIGVycm9yVGhyb3duKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5vblNlYXJjaENvbXBsZXRlLmNhbGwodGhhdC5lbGVtZW50LCBxLCBbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgaXNCYWRRdWVyeTogZnVuY3Rpb24gKHEpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnByZXZlbnRCYWRRdWVyaWVzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBiYWRRdWVyaWVzID0gdGhpcy5iYWRRdWVyaWVzLFxuICAgICAgICAgICAgICAgIGkgPSBiYWRRdWVyaWVzLmxlbmd0aDtcblxuICAgICAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgICAgICAgIGlmIChxLmluZGV4T2YoYmFkUXVlcmllc1tpXSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgaGlkZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIGlmICgkLmlzRnVuY3Rpb24odGhhdC5vcHRpb25zLm9uSGlkZSkgJiYgdGhhdC52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5vcHRpb25zLm9uSGlkZS5jYWxsKHRoYXQuZWxlbWVudCwgY29udGFpbmVyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgICB0aGF0LnNlbGVjdGVkSW5kZXggPSAtMTtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhhdC5vbkNoYW5nZUludGVydmFsKTtcbiAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuaGlkZSgpO1xuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KG51bGwpO1xuICAgICAgICB9LFxuXG4gICAgICAgIHN1Z2dlc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5zdWdnZXN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dOb1N1Z2dlc3Rpb25Ob3RpY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5ub1N1Z2dlc3Rpb25zKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgZ3JvdXBCeSA9IG9wdGlvbnMuZ3JvdXBCeSxcbiAgICAgICAgICAgICAgICBmb3JtYXRSZXN1bHQgPSBvcHRpb25zLmZvcm1hdFJlc3VsdCxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpLFxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZSA9IHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uLFxuICAgICAgICAgICAgICAgIGNsYXNzU2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBub1N1Z2dlc3Rpb25zQ29udGFpbmVyID0gJCh0aGF0Lm5vU3VnZ2VzdGlvbnNDb250YWluZXIpLFxuICAgICAgICAgICAgICAgIGJlZm9yZVJlbmRlciA9IG9wdGlvbnMuYmVmb3JlUmVuZGVyLFxuICAgICAgICAgICAgICAgIGh0bWwgPSAnJyxcbiAgICAgICAgICAgICAgICBjYXRlZ29yeSxcbiAgICAgICAgICAgICAgICBmb3JtYXRHcm91cCA9IGZ1bmN0aW9uIChzdWdnZXN0aW9uLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGN1cnJlbnRDYXRlZ29yeSA9IHN1Z2dlc3Rpb24uZGF0YVtncm91cEJ5XTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09PSBjdXJyZW50Q2F0ZWdvcnkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSBjdXJyZW50Q2F0ZWdvcnk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnPGRpdiBjbGFzcz1cImF1dG9jb21wbGV0ZS1ncm91cFwiPjxzdHJvbmc+JyArIGNhdGVnb3J5ICsgJzwvc3Ryb25nPjwvZGl2Pic7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLnRyaWdnZXJTZWxlY3RPblZhbGlkSW5wdXQgJiYgdGhhdC5pc0V4YWN0TWF0Y2godmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgdGhhdC5zZWxlY3QoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBCdWlsZCBzdWdnZXN0aW9ucyBpbm5lciBIVE1MOlxuICAgICAgICAgICAgJC5lYWNoKHRoYXQuc3VnZ2VzdGlvbnMsIGZ1bmN0aW9uIChpLCBzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwQnkpe1xuICAgICAgICAgICAgICAgICAgICBodG1sICs9IGZvcm1hdEdyb3VwKHN1Z2dlc3Rpb24sIHZhbHVlLCBpKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBodG1sICs9ICc8ZGl2IGNsYXNzPVwiJyArIGNsYXNzTmFtZSArICdcIiBkYXRhLWluZGV4PVwiJyArIGkgKyAnXCI+JyArIGZvcm1hdFJlc3VsdChzdWdnZXN0aW9uLCB2YWx1ZSwgaSkgKyAnPC9kaXY+JztcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB0aGlzLmFkanVzdENvbnRhaW5lcldpZHRoKCk7XG5cbiAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIuZGV0YWNoKCk7XG4gICAgICAgICAgICBjb250YWluZXIuaHRtbChodG1sKTtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihiZWZvcmVSZW5kZXIpKSB7XG4gICAgICAgICAgICAgICAgYmVmb3JlUmVuZGVyLmNhbGwodGhhdC5lbGVtZW50LCBjb250YWluZXIsIHRoYXQuc3VnZ2VzdGlvbnMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LmZpeFBvc2l0aW9uKCk7XG4gICAgICAgICAgICBjb250YWluZXIuc2hvdygpO1xuXG4gICAgICAgICAgICAvLyBTZWxlY3QgZmlyc3QgdmFsdWUgYnkgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmF1dG9TZWxlY3RGaXJzdCkge1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29udGFpbmVyLnNjcm9sbFRvcCgwKTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY2hpbGRyZW4oJy4nICsgY2xhc3NOYW1lKS5maXJzdCgpLmFkZENsYXNzKGNsYXNzU2VsZWN0ZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhhdC5maW5kQmVzdEhpbnQoKTtcbiAgICAgICAgfSxcblxuICAgICAgICBub1N1Z2dlc3Rpb25zOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgIGNvbnRhaW5lciA9ICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lciksXG4gICAgICAgICAgICAgICAgIG5vU3VnZ2VzdGlvbnNDb250YWluZXIgPSAkKHRoYXQubm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q29udGFpbmVyV2lkdGgoKTtcblxuICAgICAgICAgICAgLy8gU29tZSBleHBsaWNpdCBzdGVwcy4gQmUgY2FyZWZ1bCBoZXJlIGFzIGl0IGVhc3kgdG8gZ2V0XG4gICAgICAgICAgICAvLyBub1N1Z2dlc3Rpb25zQ29udGFpbmVyIHJlbW92ZWQgZnJvbSBET00gaWYgbm90IGRldGFjaGVkIHByb3Blcmx5LlxuICAgICAgICAgICAgbm9TdWdnZXN0aW9uc0NvbnRhaW5lci5kZXRhY2goKTtcbiAgICAgICAgICAgIGNvbnRhaW5lci5lbXB0eSgpOyAvLyBjbGVhbiBzdWdnZXN0aW9ucyBpZiBhbnlcbiAgICAgICAgICAgIGNvbnRhaW5lci5hcHBlbmQobm9TdWdnZXN0aW9uc0NvbnRhaW5lcik7XG5cbiAgICAgICAgICAgIHRoYXQuZml4UG9zaXRpb24oKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLnNob3coKTtcbiAgICAgICAgICAgIHRoYXQudmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWRqdXN0Q29udGFpbmVyV2lkdGg6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB0aGF0Lm9wdGlvbnMsXG4gICAgICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgLy8gSWYgd2lkdGggaXMgYXV0bywgYWRqdXN0IHdpZHRoIGJlZm9yZSBkaXNwbGF5aW5nIHN1Z2dlc3Rpb25zLFxuICAgICAgICAgICAgLy8gYmVjYXVzZSBpZiBpbnN0YW5jZSB3YXMgY3JlYXRlZCBiZWZvcmUgaW5wdXQgaGFkIHdpZHRoLCBpdCB3aWxsIGJlIHplcm8uXG4gICAgICAgICAgICAvLyBBbHNvIGl0IGFkanVzdHMgaWYgaW5wdXQgd2lkdGggaGFzIGNoYW5nZWQuXG4gICAgICAgICAgICBpZiAob3B0aW9ucy53aWR0aCA9PT0gJ2F1dG8nKSB7XG4gICAgICAgICAgICAgICAgd2lkdGggPSB0aGF0LmVsLm91dGVyV2lkdGgoKTtcbiAgICAgICAgICAgICAgICBjb250YWluZXIuY3NzKCd3aWR0aCcsIHdpZHRoID4gMCA/IHdpZHRoIDogMzAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmaW5kQmVzdEhpbnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IHRoYXQuZWwudmFsKCkudG9Mb3dlckNhc2UoKSxcbiAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBudWxsO1xuXG4gICAgICAgICAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkLmVhY2godGhhdC5zdWdnZXN0aW9ucywgZnVuY3Rpb24gKGksIHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgZm91bmRNYXRjaCA9IHN1Z2dlc3Rpb24udmFsdWUudG9Mb3dlckNhc2UoKS5pbmRleE9mKHZhbHVlKSA9PT0gMDtcbiAgICAgICAgICAgICAgICBpZiAoZm91bmRNYXRjaCkge1xuICAgICAgICAgICAgICAgICAgICBiZXN0TWF0Y2ggPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gIWZvdW5kTWF0Y2g7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgdGhhdC5zaWduYWxIaW50KGJlc3RNYXRjaCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2lnbmFsSGludDogZnVuY3Rpb24gKHN1Z2dlc3Rpb24pIHtcbiAgICAgICAgICAgIHZhciBoaW50VmFsdWUgPSAnJyxcbiAgICAgICAgICAgICAgICB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgIGlmIChzdWdnZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgaGludFZhbHVlID0gdGhhdC5jdXJyZW50VmFsdWUgKyBzdWdnZXN0aW9uLnZhbHVlLnN1YnN0cih0aGF0LmN1cnJlbnRWYWx1ZS5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoYXQuaGludFZhbHVlICE9PSBoaW50VmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnRWYWx1ZSA9IGhpbnRWYWx1ZTtcbiAgICAgICAgICAgICAgICB0aGF0LmhpbnQgPSBzdWdnZXN0aW9uO1xuICAgICAgICAgICAgICAgICh0aGlzLm9wdGlvbnMub25IaW50IHx8ICQubm9vcCkoaGludFZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICB2ZXJpZnlTdWdnZXN0aW9uc0Zvcm1hdDogZnVuY3Rpb24gKHN1Z2dlc3Rpb25zKSB7XG4gICAgICAgICAgICAvLyBJZiBzdWdnZXN0aW9ucyBpcyBzdHJpbmcgYXJyYXksIGNvbnZlcnQgdGhlbSB0byBzdXBwb3J0ZWQgZm9ybWF0OlxuICAgICAgICAgICAgaWYgKHN1Z2dlc3Rpb25zLmxlbmd0aCAmJiB0eXBlb2Ygc3VnZ2VzdGlvbnNbMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICQubWFwKHN1Z2dlc3Rpb25zLCBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IHZhbHVlLCBkYXRhOiBudWxsIH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBzdWdnZXN0aW9ucztcbiAgICAgICAgfSxcblxuICAgICAgICB2YWxpZGF0ZU9yaWVudGF0aW9uOiBmdW5jdGlvbihvcmllbnRhdGlvbiwgZmFsbGJhY2spIHtcbiAgICAgICAgICAgIG9yaWVudGF0aW9uID0gJC50cmltKG9yaWVudGF0aW9uIHx8ICcnKS50b0xvd2VyQ2FzZSgpO1xuXG4gICAgICAgICAgICBpZigkLmluQXJyYXkob3JpZW50YXRpb24sIFsnYXV0bycsICdib3R0b20nLCAndG9wJ10pID09PSAtMSl7XG4gICAgICAgICAgICAgICAgb3JpZW50YXRpb24gPSBmYWxsYmFjaztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG9yaWVudGF0aW9uO1xuICAgICAgICB9LFxuXG4gICAgICAgIHByb2Nlc3NSZXNwb25zZTogZnVuY3Rpb24gKHJlc3VsdCwgb3JpZ2luYWxRdWVyeSwgY2FjaGVLZXkpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gdGhhdC5vcHRpb25zO1xuXG4gICAgICAgICAgICByZXN1bHQuc3VnZ2VzdGlvbnMgPSB0aGF0LnZlcmlmeVN1Z2dlc3Rpb25zRm9ybWF0KHJlc3VsdC5zdWdnZXN0aW9ucyk7XG5cbiAgICAgICAgICAgIC8vIENhY2hlIHJlc3VsdHMgaWYgY2FjaGUgaXMgbm90IGRpc2FibGVkOlxuICAgICAgICAgICAgaWYgKCFvcHRpb25zLm5vQ2FjaGUpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmNhY2hlZFJlc3BvbnNlW2NhY2hlS2V5XSA9IHJlc3VsdDtcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5wcmV2ZW50QmFkUXVlcmllcyAmJiAhcmVzdWx0LnN1Z2dlc3Rpb25zLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGF0LmJhZFF1ZXJpZXMucHVzaChvcmlnaW5hbFF1ZXJ5KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJldHVybiBpZiBvcmlnaW5hbFF1ZXJ5IGlzIG5vdCBtYXRjaGluZyBjdXJyZW50IHF1ZXJ5OlxuICAgICAgICAgICAgaWYgKG9yaWdpbmFsUXVlcnkgIT09IHRoYXQuZ2V0UXVlcnkodGhhdC5jdXJyZW50VmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGF0LnN1Z2dlc3Rpb25zID0gcmVzdWx0LnN1Z2dlc3Rpb25zO1xuICAgICAgICAgICAgdGhhdC5zdWdnZXN0KCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYWN0aXZhdGU6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0sXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWQgPSB0aGF0LmNsYXNzZXMuc2VsZWN0ZWQsXG4gICAgICAgICAgICAgICAgY29udGFpbmVyID0gJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKSxcbiAgICAgICAgICAgICAgICBjaGlsZHJlbiA9IGNvbnRhaW5lci5maW5kKCcuJyArIHRoYXQuY2xhc3Nlcy5zdWdnZXN0aW9uKTtcblxuICAgICAgICAgICAgY29udGFpbmVyLmZpbmQoJy4nICsgc2VsZWN0ZWQpLnJlbW92ZUNsYXNzKHNlbGVjdGVkKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3RlZEluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggIT09IC0xICYmIGNoaWxkcmVuLmxlbmd0aCA+IHRoYXQuc2VsZWN0ZWRJbmRleCkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUl0ZW0gPSBjaGlsZHJlbi5nZXQodGhhdC5zZWxlY3RlZEluZGV4KTtcbiAgICAgICAgICAgICAgICAkKGFjdGl2ZUl0ZW0pLmFkZENsYXNzKHNlbGVjdGVkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gYWN0aXZlSXRlbTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0SGludDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGkgPSAkLmluQXJyYXkodGhhdC5oaW50LCB0aGF0LnN1Z2dlc3Rpb25zKTtcblxuICAgICAgICAgICAgdGhhdC5zZWxlY3QoaSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgc2VsZWN0OiBmdW5jdGlvbiAoaSkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgICAgICAgICAgdGhhdC5oaWRlKCk7XG4gICAgICAgICAgICB0aGF0Lm9uU2VsZWN0KGkpO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgfSxcblxuICAgICAgICBtb3ZlVXA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGF0LnNlbGVjdGVkSW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLmNoaWxkcmVuKCkuZmlyc3QoKS5yZW1vdmVDbGFzcyh0aGF0LmNsYXNzZXMuc2VsZWN0ZWQpO1xuICAgICAgICAgICAgICAgIHRoYXQuc2VsZWN0ZWRJbmRleCA9IC0xO1xuICAgICAgICAgICAgICAgIHRoYXQuZWwudmFsKHRoYXQuY3VycmVudFZhbHVlKTtcbiAgICAgICAgICAgICAgICB0aGF0LmZpbmRCZXN0SGludCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhhdC5hZGp1c3RTY3JvbGwodGhhdC5zZWxlY3RlZEluZGV4IC0gMSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgbW92ZURvd246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgaWYgKHRoYXQuc2VsZWN0ZWRJbmRleCA9PT0gKHRoYXQuc3VnZ2VzdGlvbnMubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuYWRqdXN0U2Nyb2xsKHRoYXQuc2VsZWN0ZWRJbmRleCArIDEpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGFkanVzdFNjcm9sbDogZnVuY3Rpb24gKGluZGV4KSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXMsXG4gICAgICAgICAgICAgICAgYWN0aXZlSXRlbSA9IHRoYXQuYWN0aXZhdGUoaW5kZXgpO1xuXG4gICAgICAgICAgICBpZiAoIWFjdGl2ZUl0ZW0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBvZmZzZXRUb3AsXG4gICAgICAgICAgICAgICAgdXBwZXJCb3VuZCxcbiAgICAgICAgICAgICAgICBsb3dlckJvdW5kLFxuICAgICAgICAgICAgICAgIGhlaWdodERlbHRhID0gJChhY3RpdmVJdGVtKS5vdXRlckhlaWdodCgpO1xuXG4gICAgICAgICAgICBvZmZzZXRUb3AgPSBhY3RpdmVJdGVtLm9mZnNldFRvcDtcbiAgICAgICAgICAgIHVwcGVyQm91bmQgPSAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnNjcm9sbFRvcCgpO1xuICAgICAgICAgICAgbG93ZXJCb3VuZCA9IHVwcGVyQm91bmQgKyB0aGF0Lm9wdGlvbnMubWF4SGVpZ2h0IC0gaGVpZ2h0RGVsdGE7XG5cbiAgICAgICAgICAgIGlmIChvZmZzZXRUb3AgPCB1cHBlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgJCh0aGF0LnN1Z2dlc3Rpb25zQ29udGFpbmVyKS5zY3JvbGxUb3Aob2Zmc2V0VG9wKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAob2Zmc2V0VG9wID4gbG93ZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgICQodGhhdC5zdWdnZXN0aW9uc0NvbnRhaW5lcikuc2Nyb2xsVG9wKG9mZnNldFRvcCAtIHRoYXQub3B0aW9ucy5tYXhIZWlnaHQgKyBoZWlnaHREZWx0YSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmdldFZhbHVlKHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdLnZhbHVlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGF0LnNpZ25hbEhpbnQobnVsbCk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgb25TZWxlY3Q6IGZ1bmN0aW9uIChpbmRleCkge1xuICAgICAgICAgICAgdmFyIHRoYXQgPSB0aGlzLFxuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2sgPSB0aGF0Lm9wdGlvbnMub25TZWxlY3QsXG4gICAgICAgICAgICAgICAgc3VnZ2VzdGlvbiA9IHRoYXQuc3VnZ2VzdGlvbnNbaW5kZXhdO1xuXG4gICAgICAgICAgICB0aGF0LmN1cnJlbnRWYWx1ZSA9IHRoYXQuZ2V0VmFsdWUoc3VnZ2VzdGlvbi52YWx1ZSk7XG5cbiAgICAgICAgICAgIGlmICh0aGF0LmN1cnJlbnRWYWx1ZSAhPT0gdGhhdC5lbC52YWwoKSAmJiAhdGhhdC5vcHRpb25zLnByZXNlcnZlSW5wdXQpIHtcbiAgICAgICAgICAgICAgICB0aGF0LmVsLnZhbCh0aGF0LmN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoYXQuc2lnbmFsSGludChudWxsKTtcbiAgICAgICAgICAgIHRoYXQuc3VnZ2VzdGlvbnMgPSBbXTtcbiAgICAgICAgICAgIHRoYXQuc2VsZWN0aW9uID0gc3VnZ2VzdGlvbjtcblxuICAgICAgICAgICAgaWYgKCQuaXNGdW5jdGlvbihvblNlbGVjdENhbGxiYWNrKSkge1xuICAgICAgICAgICAgICAgIG9uU2VsZWN0Q2FsbGJhY2suY2FsbCh0aGF0LmVsZW1lbnQsIHN1Z2dlc3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGdldFZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcyxcbiAgICAgICAgICAgICAgICBkZWxpbWl0ZXIgPSB0aGF0Lm9wdGlvbnMuZGVsaW1pdGVyLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSxcbiAgICAgICAgICAgICAgICBwYXJ0cztcblxuICAgICAgICAgICAgaWYgKCFkZWxpbWl0ZXIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IHRoYXQuY3VycmVudFZhbHVlO1xuICAgICAgICAgICAgcGFydHMgPSBjdXJyZW50VmFsdWUuc3BsaXQoZGVsaW1pdGVyKTtcblxuICAgICAgICAgICAgaWYgKHBhcnRzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5zdWJzdHIoMCwgY3VycmVudFZhbHVlLmxlbmd0aCAtIHBhcnRzW3BhcnRzLmxlbmd0aCAtIDFdLmxlbmd0aCkgKyB2YWx1ZTtcbiAgICAgICAgfSxcblxuICAgICAgICBkaXNwb3NlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICB0aGF0LmVsLm9mZignLmF1dG9jb21wbGV0ZScpLnJlbW92ZURhdGEoJ2F1dG9jb21wbGV0ZScpO1xuICAgICAgICAgICAgdGhhdC5kaXNhYmxlS2lsbGVyRm4oKTtcbiAgICAgICAgICAgICQod2luZG93KS5vZmYoJ3Jlc2l6ZS5hdXRvY29tcGxldGUnLCB0aGF0LmZpeFBvc2l0aW9uQ2FwdHVyZSk7XG4gICAgICAgICAgICAkKHRoYXQuc3VnZ2VzdGlvbnNDb250YWluZXIpLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vIENyZWF0ZSBjaGFpbmFibGUgalF1ZXJ5IHBsdWdpbjpcbiAgICAkLmZuLmF1dG9jb21wbGV0ZSA9ICQuZm4uZGV2YnJpZGdlQXV0b2NvbXBsZXRlID0gZnVuY3Rpb24gKG9wdGlvbnMsIGFyZ3MpIHtcbiAgICAgICAgdmFyIGRhdGFLZXkgPSAnYXV0b2NvbXBsZXRlJztcbiAgICAgICAgLy8gSWYgZnVuY3Rpb24gaW52b2tlZCB3aXRob3V0IGFyZ3VtZW50IHJldHVyblxuICAgICAgICAvLyBpbnN0YW5jZSBvZiB0aGUgZmlyc3QgbWF0Y2hlZCBlbGVtZW50OlxuICAgICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpcnN0KCkuZGF0YShkYXRhS2V5KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGlucHV0RWxlbWVudCA9ICQodGhpcyksXG4gICAgICAgICAgICAgICAgaW5zdGFuY2UgPSBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGlmIChpbnN0YW5jZSAmJiB0eXBlb2YgaW5zdGFuY2Vbb3B0aW9uc10gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgaW5zdGFuY2Vbb3B0aW9uc10oYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBJZiBpbnN0YW5jZSBhbHJlYWR5IGV4aXN0cywgZGVzdHJveSBpdDpcbiAgICAgICAgICAgICAgICBpZiAoaW5zdGFuY2UgJiYgaW5zdGFuY2UuZGlzcG9zZSkge1xuICAgICAgICAgICAgICAgICAgICBpbnN0YW5jZS5kaXNwb3NlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGluc3RhbmNlID0gbmV3IEF1dG9jb21wbGV0ZSh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBpbnB1dEVsZW1lbnQuZGF0YShkYXRhS2V5LCBpbnN0YW5jZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG59KSk7XG4iLCIkKCcuZ2ctZXZlbnQtc2xpZGVyJykuZmxpY2tpdHkoe1xuICAvLyBvcHRpb25zXG4gIGNlbGxBbGlnbjogJ2xlZnQnLFxuICBjb250YWluOiB0cnVlXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
