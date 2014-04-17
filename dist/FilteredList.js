!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.FilteredList=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/**
 * Debounces a function by the given threshold.
 *
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */

module.exports = function debounce(func, threshold, execAsap){
  var timeout;

  return function debounced(){
    var obj = this, args = arguments;

    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null;
    }

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100);
  };
};

},{}],2:[function(_dereq_,module,exports){

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on =
Emitter.prototype.addEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  on.fn = fn;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners =
Emitter.prototype.removeEventListener = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var cb;
  for (var i = 0; i < callbacks.length; i++) {
    cb = callbacks[i];
    if (cb === fn || cb.fn === fn) {
      callbacks.splice(i, 1);
      break;
    }
  }
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

},{}],3:[function(_dereq_,module,exports){
(function() {
  var basenameScore, stringScore;

  stringScore = _dereq_('../vendor/stringscore');

  basenameScore = function(string, query, score) {
    var base, depth, index, lastCharacter, segmentCount, slashCount;
    index = string.length - 1;
    while (string[index] === '/') {
      index--;
    }
    slashCount = 0;
    lastCharacter = index;
    base = null;
    while (index >= 0) {
      if (string[index] === '/') {
        slashCount++;
        if (base == null) {
          base = string.substring(index + 1, lastCharacter + 1);
        }
      } else if (index === 0) {
        if (lastCharacter < string.length - 1) {
          if (base == null) {
            base = string.substring(0, lastCharacter + 1);
          }
        } else {
          if (base == null) {
            base = string;
          }
        }
      }
      index--;
    }
    if (base === string) {
      score *= 2;
    } else if (base) {
      score += stringScore(base, query);
    }
    segmentCount = slashCount + 1;
    depth = Math.max(1, 10 - segmentCount);
    score *= depth * 0.01;
    return score;
  };

  module.exports = function(candidates, query, _arg) {
    var candidate, key, maxResults, queryHasNoSlashes, score, scoredCandidate, scoredCandidates, string, _i, _len, _ref;
    _ref = _arg != null ? _arg : {}, key = _ref.key, maxResults = _ref.maxResults;
    if (query) {
      queryHasNoSlashes = query.indexOf('/') === -1;
      scoredCandidates = [];
      for (_i = 0, _len = candidates.length; _i < _len; _i++) {
        candidate = candidates[_i];
        string = key != null ? candidate[key] : candidate;
        if (!string) {
          continue;
        }
        score = stringScore(string, query);
        if (queryHasNoSlashes) {
          score = basenameScore(string, query, score);
        }
        if (score > 0) {
          scoredCandidates.push({
            candidate: candidate,
            score: score
          });
        }
      }
      scoredCandidates.sort(function(a, b) {
        return b.score - a.score;
      });
      candidates = (function() {
        var _j, _len1, _results;
        _results = [];
        for (_j = 0, _len1 = scoredCandidates.length; _j < _len1; _j++) {
          scoredCandidate = scoredCandidates[_j];
          _results.push(scoredCandidate.candidate);
        }
        return _results;
      })();
    }
    if (maxResults != null) {
      candidates = candidates.slice(0, maxResults);
    }
    return candidates;
  };

}).call(this);

},{"../vendor/stringscore":5}],4:[function(_dereq_,module,exports){
(function() {
  var stringScore;

  stringScore = _dereq_('../vendor/stringscore');

  module.exports = {
    filter: _dereq_('./filter'),
    score: function(string, query) {
      if (!string) {
        return 0;
      }
      if (!query) {
        return 0;
      }
      return stringScore(string, query);
    }
  };

}).call(this);

},{"../vendor/stringscore":5,"./filter":3}],5:[function(_dereq_,module,exports){
// MODIFIED BY NS/CJ - Don't extend the prototype of String
// MODIFIED BY CJ - Remove start_of_string_bonus

/*!
 * string_score.js: String Scoring Algorithm 0.1.10
 *
 * http://joshaven.com/string_score
 * https://github.com/joshaven/string_score
 *
 * Copyright (C) 2009-2011 Joshaven Potter <yourtech@gmail.com>
 * Special thanks to all of the contributors listed here https://github.com/joshaven/string_score
 * MIT license: http://www.opensource.org/licenses/mit-license.php
 *
 * Date: Tue Mar 1 2011
*/

/**
 * Scores a string against another string.
 *  'Hello World'.score('he');     //=> 0.5931818181818181
 *  'Hello World'.score('Hello');  //=> 0.7318181818181818
 */
module.exports = function(string, abbreviation) {
  // If the string is equal to the abbreviation, perfect match.
  if (string == abbreviation) {return 1;}

  var total_character_score = 0,
      abbreviation_length = abbreviation.length,
      string_length = string.length,
      start_of_string_bonus,
      abbreviation_score,
      final_score;

  // Walk through abbreviation and add up scores.
  for (var i = 0,
         character_score/* = 0*/,
         index_in_string/* = 0*/,
         c/* = ''*/,
         index_c_lowercase/* = 0*/,
         index_c_uppercase/* = 0*/,
         min_index/* = 0*/;
     i < abbreviation_length;
     ++i) {

    // Find the first case-insensitive match of a character.
    c = abbreviation.charAt(i);

    index_c_lowercase = string.indexOf(c.toLowerCase());
    index_c_uppercase = string.indexOf(c.toUpperCase());
    min_index = Math.min(index_c_lowercase, index_c_uppercase);
    index_in_string = (min_index > -1) ? min_index : Math.max(index_c_lowercase, index_c_uppercase);

    if (index_in_string === -1) {
      return 0;
    } else {
      character_score = 0.1;
    }

    // Set base score for matching 'c'.

    // Same case bonus.
    if (string[index_in_string] === c) {
      character_score += 0.1;
    }

    // Consecutive letter & start-of-string Bonus
    if (index_in_string === 0) {
      // Increase the score when matching first character of the remainder of the string
      character_score += 0.6;
      if (i === 0) {
        // If match is the first character of the string
        // & the first character of abbreviation, add a
        // start-of-string match bonus.
        // start_of_string_bonus = 1 //true;
      }
    }
    else {
      // Acronym Bonus
      // Weighing Logic: Typing the first character of an acronym is as if you
      // preceded it with two perfect character matches.
      if (string.charAt(index_in_string - 1) === ' ') {
        character_score += 0.8; // * Math.min(index_in_string, 5); // Cap bonus at 0.4 * 5
      }
    }

    // Left trim the already matched part of the string
    // (forces sequential matching).
    string = string.substring(index_in_string + 1, string_length);

    total_character_score += character_score;
  } // end of for loop

  // Uncomment to weigh smaller words higher.
  // return total_character_score / string_length;

  abbreviation_score = total_character_score / abbreviation_length;
  //percentage_of_matched_string = abbreviation_length / string_length;
  //word_score = abbreviation_score * percentage_of_matched_string;

  // Reduce penalty for longer strings.
  //final_score = (word_score + abbreviation_score) / 2;
  final_score = ((abbreviation_score * (abbreviation_length / string_length)) + abbreviation_score) / 2;

  if (start_of_string_bonus && (final_score + 0.15 < 1)) {
    final_score += 0.15;
  }

  return final_score;
};

},{}],6:[function(_dereq_,module,exports){

/**
 * Expose `render()`.`
 */

exports = module.exports = render;

/**
 * Expose `compile()`.
 */

exports.compile = compile;

/**
 * Render the given mustache `str` with `obj`.
 *
 * @param {String} str
 * @param {Object} obj
 * @return {String}
 * @api public
 */

function render(str, obj) {
  obj = obj || {};
  var fn = compile(str);
  return fn(obj);
}

/**
 * Compile the given `str` to a `Function`.
 *
 * @param {String} str
 * @return {Function}
 * @api public
 */

function compile(str) {
  var js = [];
  var toks = parse(str);
  var tok;

  for (var i = 0; i < toks.length; ++i) {
    tok = toks[i];
    if (i % 2 == 0) {
      js.push('"' + tok.replace(/"/g, '\\"') + '"');
    } else {
      switch (tok[0]) {
        case '/':
          tok = tok.slice(1);
          js.push(') + ');
          break;
        case '^':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + section(obj, "' + tok + '", true, ');
          break;
        case '#':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + section(obj, "' + tok + '", false, ');
          break;
        case '!':
          tok = tok.slice(1);
          assertProperty(tok);
          js.push(' + obj.' + tok + ' + ');
          break;
        default:
          assertProperty(tok);
          js.push(' + escape(obj.' + tok + ') + ');
      }
    }
  }

  js = '\n'
    + indent(escape.toString()) + ';\n\n'
    + indent(section.toString()) + ';\n\n'
    + '  return ' + js.join('').replace(/\n/g, '\\n');

  return new Function('obj', js);
}

/**
 * Assert that `prop` is a valid property.
 *
 * @param {String} prop
 * @api private
 */

function assertProperty(prop) {
  if (!prop.match(/^[\w.]+$/)) throw new Error('invalid property "' + prop + '"');
}

/**
 * Parse `str`.
 *
 * @param {String} str
 * @return {Array}
 * @api private
 */

function parse(str) {
  return str.split(/\{\{|\}\}/);
}

/**
 * Indent `str`.
 *
 * @param {String} str
 * @return {String}
 * @api private
 */

function indent(str) {
  return str.replace(/^/gm, '  ');
}

/**
 * Section handler.
 *
 * @param {Object} context obj
 * @param {String} prop
 * @param {String} str
 * @param {Boolean} negate
 * @api private
 */

function section(obj, prop, negate, str) {
  var val = obj[prop];
  if ('function' == typeof val) return val.call(obj, str);
  if (negate) val = !val;
  if (val) return str;
  return '';
}

/**
 * Escape the given `html`.
 *
 * @param {String} html
 * @return {String}
 * @api private
 */

function escape(html) {
  return String(html)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

},{}],7:[function(_dereq_,module,exports){
var guidRx = "{?[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}}?";

exports.generate = function () {
  var d = new Date().getTime();
  var guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace( /[xy]/g, function ( c ) {
    var r = ( d + Math.random() * 16 ) % 16 | 0;
    d = Math.floor( d / 16 );
    return ( c === "x" ? r : ( r & 0x7 | 0x8 ) ).toString( 16 );
  } );
  return guid;
};

exports.match = function ( string ) {
  var rx = new RegExp( guidRx, "g" ),
    matches = ( typeof string === "string" ? string : "" ).match( rx );
  return Array.isArray( matches ) ? matches : [];
};

exports.isValid = function ( guid ) {
  var rx = new RegExp( guidRx );
  return rx.test( guid );
};
},{}],8:[function(_dereq_,module,exports){
var type = _dereq_( "./ises/type" ),
  is = {
    a: {},
    an: {},
    not: {
      a: {},
      an: {}
    }
  };

var ises = {
  "arguments": [ "arguments", type( "arguments" ) ],
  "array": [ "array", type( "array" ) ],
  "boolean": [ "boolean", type( "boolean" ) ],
  "date": [ "date", type( "date" ) ],
  "function": [ "function", "func", "fn", type( "function" ) ],
  "null": [ "null", type( "null" ) ],
  "number": [ "number", "integer", "int", type( "number" ) ],
  "object": [ "object", type( "object" ) ],
  "regexp": [ "regexp", type( "regexp" ) ],
  "string": [ "string", type( "string" ) ],
  "undefined": [ "undefined", type( "undefined" ) ],
  "empty": [ "empty", _dereq_( "./ises/empty" ) ],
  "nullorundefined": [ "nullOrUndefined", "nullorundefined", _dereq_( "./ises/nullorundefined" ) ],
  "guid": [ "guid", _dereq_( "./ises/guid" ) ]
}

Object.keys( ises ).forEach( function ( key ) {

  var methods = ises[ key ].slice( 0, ises[ key ].length - 1 ),
    fn = ises[ key ][ ises[ key ].length - 1 ];

  methods.forEach( function ( methodKey ) {
    is[ methodKey ] = is.a[ methodKey ] = is.an[ methodKey ] = fn;
    is.not[ methodKey ] = is.not.a[ methodKey ] = is.not.an[ methodKey ] = function () {
      return fn.apply( this, arguments ) ? false : true;
    }
  } );

} );

exports = module.exports = is;
exports.type = type;
},{"./ises/empty":9,"./ises/guid":10,"./ises/nullorundefined":11,"./ises/type":12}],9:[function(_dereq_,module,exports){
var type = _dereq_("../type");

module.exports = function ( value ) {
  var empty = false;

  if ( type( value ) === "null" || type( value ) === "undefined" ) {
    empty = true;
  } else if ( type( value ) === "object" ) {
    empty = Object.keys( value ).length === 0;
  } else if ( type( value ) === "boolean" ) {
    empty = value === false;
  } else if ( type( value ) === "number" ) {
    empty = value === 0 || value === -1;
  } else if ( type( value ) === "array" || type( value ) === "string" ) {
    empty = value.length === 0;
  }

  return empty;

};
},{"../type":13}],10:[function(_dereq_,module,exports){
var guid = _dereq_( "sc-guid" );

module.exports = function ( value ) {
  return guid.isValid( value );
};
},{"sc-guid":7}],11:[function(_dereq_,module,exports){
module.exports = function ( value ) {
	return value === null || value === undefined || value === void 0;
};
},{}],12:[function(_dereq_,module,exports){
var type = _dereq_( "../type" );

module.exports = function ( _type ) {
  return function ( _value ) {
    return type( _value ) === _type;
  }
}
},{"../type":13}],13:[function(_dereq_,module,exports){
var toString = Object.prototype.toString;

module.exports = function ( val ) {
  switch ( toString.call( val ) ) {
  case '[object Function]':
    return 'function';
  case '[object Date]':
    return 'date';
  case '[object RegExp]':
    return 'regexp';
  case '[object Arguments]':
    return 'arguments';
  case '[object Array]':
    return 'array';
  }

  if ( val === null ) return 'null';
  if ( val === undefined ) return 'undefined';
  if ( val === Object( val ) ) return 'object';

  return typeof val;
};
},{}],14:[function(_dereq_,module,exports){
var md5 = _dereq_( "md5-component" );

function stringify( _object ) {
  return JSON.stringify( _object );
}

function hash( _object ) {
  return md5( stringify( _object ) );
}

exports = module.exports = hash;
exports.stringify = stringify;
exports.md5 = md5;
},{"md5-component":15}],15:[function(_dereq_,module,exports){
/**
 * md5.js
 * Copyright (c) 2011, Yoshinori Kohyama (http://algobit.jp/)
 * all rights reserved.
 */

module.exports = digestString;

function digest(M) {
  var originalLength
    , i
    , j
    , k
    , l
    , A
    , B
    , C
    , D
    , AA
    , BB
    , CC
    , DD
    , X
    , rval
    ;

	function F(x, y, z) { return (x & y) | (~x & z); }
	function G(x, y, z) { return (x & z) | (y & ~z); }
	function H(x, y, z) { return x ^ y ^ z;          }
	function I(x, y, z) { return y ^ (x | ~z);       }

	function to4bytes(n) {
		return [n&0xff, (n>>>8)&0xff, (n>>>16)&0xff, (n>>>24)&0xff];
	}

	originalLength = M.length; // for Step.2

	// 3.1 Step 1. Append Padding Bits
	M.push(0x80);
	l = (56 - M.length)&0x3f;
	for (i = 0; i < l; i++)
		M.push(0);

	// 3.2 Step 2. Append Length
	to4bytes(8*originalLength).forEach(function (e) { M.push(e); });
	[0, 0, 0, 0].forEach(function (e) { M.push(e); });

	// 3.3 Step 3. Initialize MD Buffer
	A = [0x67452301];
	B = [0xefcdab89];
	C = [0x98badcfe];
	D = [0x10325476];

	// 3.4 Step 4. Process Message in 16-Word Blocks
	function rounds(a, b, c, d, k, s, t, f) {
		a[0] += f(b[0], c[0], d[0]) + X[k] + t;
		a[0] = ((a[0]<<s)|(a[0]>>>(32 - s)));
		a[0] += b[0];
	}

	for (i = 0; i < M.length; i += 64) {
		X = [];
		for (j = 0; j < 64; j += 4) {
			k = i + j;
			X.push(M[k]|(M[k + 1]<<8)|(M[k + 2]<<16)|(M[k + 3]<<24));
		}
		AA = A[0];
		BB = B[0];
		CC = C[0];
		DD = D[0];

		// Round 1.
		rounds(A, B, C, D,  0,  7, 0xd76aa478, F);
		rounds(D, A, B, C,  1, 12, 0xe8c7b756, F);
		rounds(C, D, A, B,  2, 17, 0x242070db, F);
		rounds(B, C, D, A,  3, 22, 0xc1bdceee, F);
		rounds(A, B, C, D,  4,  7, 0xf57c0faf, F);
		rounds(D, A, B, C,  5, 12, 0x4787c62a, F);
		rounds(C, D, A, B,  6, 17, 0xa8304613, F);
		rounds(B, C, D, A,  7, 22, 0xfd469501, F);
		rounds(A, B, C, D,  8,  7, 0x698098d8, F);
		rounds(D, A, B, C,  9, 12, 0x8b44f7af, F);
		rounds(C, D, A, B, 10, 17, 0xffff5bb1, F);
		rounds(B, C, D, A, 11, 22, 0x895cd7be, F);
		rounds(A, B, C, D, 12,  7, 0x6b901122, F);
		rounds(D, A, B, C, 13, 12, 0xfd987193, F);
		rounds(C, D, A, B, 14, 17, 0xa679438e, F);
		rounds(B, C, D, A, 15, 22, 0x49b40821, F);

		// Round 2.
		rounds(A, B, C, D,  1,  5, 0xf61e2562, G);
		rounds(D, A, B, C,  6,  9, 0xc040b340, G);
		rounds(C, D, A, B, 11, 14, 0x265e5a51, G);
		rounds(B, C, D, A,  0, 20, 0xe9b6c7aa, G);
		rounds(A, B, C, D,  5,  5, 0xd62f105d, G);
		rounds(D, A, B, C, 10,  9, 0x02441453, G);
		rounds(C, D, A, B, 15, 14, 0xd8a1e681, G);
		rounds(B, C, D, A,  4, 20, 0xe7d3fbc8, G);
		rounds(A, B, C, D,  9,  5, 0x21e1cde6, G);
		rounds(D, A, B, C, 14,  9, 0xc33707d6, G);
		rounds(C, D, A, B,  3, 14, 0xf4d50d87, G);
		rounds(B, C, D, A,  8, 20, 0x455a14ed, G);
		rounds(A, B, C, D, 13,  5, 0xa9e3e905, G);
		rounds(D, A, B, C,  2,  9, 0xfcefa3f8, G);
		rounds(C, D, A, B,  7, 14, 0x676f02d9, G);
		rounds(B, C, D, A, 12, 20, 0x8d2a4c8a, G);

		// Round 3.
		rounds(A, B, C, D,  5,  4, 0xfffa3942, H);
		rounds(D, A, B, C,  8, 11, 0x8771f681, H);
		rounds(C, D, A, B, 11, 16, 0x6d9d6122, H);
		rounds(B, C, D, A, 14, 23, 0xfde5380c, H);
		rounds(A, B, C, D,  1,  4, 0xa4beea44, H);
		rounds(D, A, B, C,  4, 11, 0x4bdecfa9, H);
		rounds(C, D, A, B,  7, 16, 0xf6bb4b60, H);
		rounds(B, C, D, A, 10, 23, 0xbebfbc70, H);
		rounds(A, B, C, D, 13,  4, 0x289b7ec6, H);
		rounds(D, A, B, C,  0, 11, 0xeaa127fa, H);
		rounds(C, D, A, B,  3, 16, 0xd4ef3085, H);
		rounds(B, C, D, A,  6, 23, 0x04881d05, H);
		rounds(A, B, C, D,  9,  4, 0xd9d4d039, H);
		rounds(D, A, B, C, 12, 11, 0xe6db99e5, H);
		rounds(C, D, A, B, 15, 16, 0x1fa27cf8, H);
		rounds(B, C, D, A,  2, 23, 0xc4ac5665, H);

		// Round 4.
		rounds(A, B, C, D,  0,  6, 0xf4292244, I);
		rounds(D, A, B, C,  7, 10, 0x432aff97, I);
		rounds(C, D, A, B, 14, 15, 0xab9423a7, I);
		rounds(B, C, D, A,  5, 21, 0xfc93a039, I);
		rounds(A, B, C, D, 12,  6, 0x655b59c3, I);
		rounds(D, A, B, C,  3, 10, 0x8f0ccc92, I);
		rounds(C, D, A, B, 10, 15, 0xffeff47d, I);
		rounds(B, C, D, A,  1, 21, 0x85845dd1, I);
		rounds(A, B, C, D,  8,  6, 0x6fa87e4f, I);
		rounds(D, A, B, C, 15, 10, 0xfe2ce6e0, I);
		rounds(C, D, A, B,  6, 15, 0xa3014314, I);
		rounds(B, C, D, A, 13, 21, 0x4e0811a1, I);
		rounds(A, B, C, D,  4,  6, 0xf7537e82, I);
		rounds(D, A, B, C, 11, 10, 0xbd3af235, I);
		rounds(C, D, A, B,  2, 15, 0x2ad7d2bb, I);
		rounds(B, C, D, A,  9, 21, 0xeb86d391, I);

		A[0] += AA;
		B[0] += BB;
		C[0] += CC;
		D[0] += DD;
	}

	rval = [];
	to4bytes(A[0]).forEach(function (e) { rval.push(e); });
	to4bytes(B[0]).forEach(function (e) { rval.push(e); });
	to4bytes(C[0]).forEach(function (e) { rval.push(e); });
	to4bytes(D[0]).forEach(function (e) { rval.push(e); });

	return rval;
}

function digestString(s) {
	var M = []
    , i
    , d
    , rstr
    , s
    ;

	for (i = 0; i < s.length; i++)
		M.push(s.charCodeAt(i));

	d = digest(M);
	rstr = '';

	d.forEach(function (e) {
		s = e.toString(16);
		while (s.length < 2)
			s = '0' + s;
		rstr += s;
	});

	return rstr;
}
},{}],16:[function(_dereq_,module,exports){
var type = _dereq_( "type-component" );

var merge = function () {

  var args = Array.prototype.slice.call( arguments ),
    deep = type( args[ 0 ] ) === "boolean" ? args.shift() : false,
    objects = args,
    result = {};

  objects.forEach( function ( objectn ) {

    if ( type( objectn ) !== "object" ) {
      return;
    }

    Object.keys( objectn ).forEach( function ( key ) {
      if ( Object.prototype.hasOwnProperty.call( objectn, key ) ) {
        if ( deep && type( objectn[ key ] ) === "object" ) {
          result[ key ] = merge( deep, {}, result[ key ], objectn[ key ] );
        } else {
          result[ key ] = objectn[ key ];
        }
      }
    } );

  } );

  return result;
};

module.exports = merge;
},{"type-component":17}],17:[function(_dereq_,module,exports){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val === Object(val)) return 'object';

  return typeof val;
};

},{}],18:[function(_dereq_,module,exports){
var ObservableArray = function ( _array ) {
	var handlers = {},
		array = Array.isArray( _array ) ? _array : [];

	var proxy = function ( _method, _value ) {
		var args = Array.prototype.slice.call( arguments, 1 );

		if ( handlers[ _method ] ) {
			return handlers[ _method ].apply( array, args );
		} else {
			return array[ '__' + _method ].apply( array, args );
		}
	};

	Object.defineProperties( array, {
		on: {
			value: function ( _event, _callback ) {
				handlers[ _event ] = _callback;
			}
		}
	} );

	Object.defineProperty( array, 'pop', {
		value: function () {
			return proxy( 'pop', array[ array.length - 1 ] );
		}
	} );

	Object.defineProperty( array, '__pop', {
		value: function () {
			return Array.prototype.pop.apply( array, arguments );
		}
	} );

	Object.defineProperty( array, 'shift', {
		value: function () {
			return proxy( 'shift', array[ 0 ] );
		}
	} );

	Object.defineProperty( array, '__shift', {
		value: function () {
			return Array.prototype.shift.apply( array, arguments );
		}
	} );

	[ 'push', 'reverse', 'unshift', 'sort', 'splice' ].forEach( function ( _method ) {
		var properties = {};

		properties[ _method ] = {
			value: proxy.bind( null, _method )
		};

		properties[ '__' + _method ] = {
			value: function ( _value ) {
				return Array.prototype[ _method ].apply( array, arguments );
			}
		};

		Object.defineProperties( array, properties );
	} );

	return array;
};

module.exports = ObservableArray;
},{}],19:[function(_dereq_,module,exports){
module.exports={
  "name": "scfilteredlist",
  "className": "sc-filtered-list",
  "defaults": {
    "buttonLabel": "Choose one",
    "fuzzy": false,
    "itemLabelKey": "name",
    "listTitle": "Select an item",
    "maxNumItems": 10,
    "maxNumItemsVisible": 7,
    "minWidth": 300,
    "sort": "desc",
    "sortControlVisible": true
  },
  "templates": {
    "listWrapper": "<div class='{{config.className}}-container'>{{!config.templates.listInput}}{{!config.templates.listHeader}}{{!config.templates.listItemWrapper}}</div>",
    "listInput": "<div class='{{config.className}}-input-container'><input type='text' class='{{config.className}}-input form-control'></div>",
    "listHeader": "<header class='{{config.className}}-header panel-heading'>{{!config.defaults.listTitle}}{{!config.templates.listSortToggle}}</header>",
    "listItemWrapper": "<div class='{{config.className}}-items list-group'></div>",
    "listItem": "<a href class='{{config.className}}-item list-group-item' data-cid='{{cid}}'>{{!key}}</a>",
    "listSortToggle": "<button type='button' class='{{config.className}}-sort-toggle btn btn-default btn-xs' title='sort'></button>"
  }
}
},{}],20:[function(_dereq_,module,exports){
var config = _dereq_( "./config.json" ),
  emitter = _dereq_( "emitter-component" ),
  guid = _dereq_( "sc-guid" ),
  helpers = _dereq_( "./helpers" ),
  is = _dereq_( "sc-is" ),
  List = _dereq_( "./list" ),
  observableArray = _dereq_( "sg-observable-array" );

/**
 * `sc-filtered-list` is a UI control to allow the user to quickly choose a
 * single object from a list of many objects.
 *
 * <img src="https://raw.githubusercontent.com/SPEAKUI/sc-filtered-list/master/demo/demo.gif" style="align: center">
 *
 * ## Installation
 *
 * Get [Node.js](http://nodejs.org). And then in a console...
 *
 * ```bash
 * npm install
 * ```
 *
 * ## Overview
 *
 * This control is attached to a button. When the button is clicked a list
 * would appear inline to allow the user to either use the mouse or keyboard
 * to choose an item. A text input is available to allow the list to be
 * filtered.
 *
 * ## Instantiate
 *
 * The `FilteredList` can be instantiated using `data-` attributes directly in
 * the markup or manually by code.
 *
 * **Instantiate using `data-` attributes**
 *
 * Add `data-sc-filtered-list` to a `<button>`. Will instantiate on domready.
 *
 *   <button data-sc-filtered-list>
 *
 * To get a reference to the instantiated object use the jQuery `data` method:
 *
 *   $('#myButton').data('scfilteredlist');
 *
 * **Instantiate using code**
 *
 *   var filter = new FilteredList(document.querySelector('#myButton'));
 *
 * ### Options
 *
 * Give options using the `data-` attribute.
 *
 *   <button data-sc-filtered-list data-sc-filtered-list-options='{"fuzzy": true}'>
 *
 * > The options object must be a properly formatted JSON string.
 *
 * Give options using code.
 *
 *   var filter = new FilteredList(document.querySelector('#myButton'), {
 *     fuzzy: true
 *   });
 *
 * - `buttonLabel` The button label (default: "Choose one")
 * - `fuzzy` The search type. If true "dvd" will match "david" (default: false)
 * - `itemLabelKey` The object key to use for the items label (default: "name")
 * - `listTitle` The title above the list (default: "Select an item")
 * - `maxNumItems` The maximum number of items in the list (default: 10)
 * - `maxNumItemsVisible` The maximum number of items visible (default: 7)
 * - `minWidth` The width of the list (default: 300)
 * - `sort` The default sort ["", "asc", "desc"] (default: "desc")
 * - `sortControlVisible` If the sort control is visible (default: true)
 *
 * ### Defaults
 *
 * To change the defaults, use the global `FilteredList` variable.
 *
 *   FilteredList.defaults.maxNumItems = 10;
 *
 * ### Events
 *
 * The `FilteredList` uses an event based system with methods `on`, `off` and
 * `once`.
 *
 *   myList.on('change', function(){});
 *
 * **Events**
 *
 * - `change` When the user selects and item and the value has changed
 * - `close` When the list closes
 * - `destroy` When the `FilteredList` is destroyed
 * - `filtered` When the search value changes
 * - `itemFocus` When an item in the list gains focus
 * - `open` When the list opens
 * - `sort` When the list is sorted
 * - `redraw` When the list redraws itself
 * - `fetch` When the list tries to fetch data based on the search term
 *
 * ### Styling
 *
 * CSS is provided and is required however it is plain by design. There are 2
 * ways to make the list pretty.
 *
 * 1. Include bootstrap 3.x
 * 2. Write your own
 *
 * ### Templates
 *
 * The markup that is generated on instantiation is template driven. These templates
 * can be changed if necessary.
 *
 * **FilteredList.templates.listWrapper**
 *
 *   <div class='{{config.className}}-container'>{{!config.templates.listInput}}{{!config.templates.listHeader}}{{!config.templates.listItemWrapper}}</div>
 *
 * **FilteredList.templates.listInput**
 *
 *   <div class='{{config.className}}-input-container'><input type='text' class='{{config.className}}-input form-control'></div>
 *
 * **FilteredList.templates.listHeader**
 *
 *   <header class='{{config.className}}-header panel-heading'>{{!config.defaults.listTitle}}{{!config.templates.listSortToggle}}</header>
 *
 * **FilteredList.templates.listItemWrapper**
 *
 *   <div class='{{config.className}}-items list-group'></div>
 *
 * **FilteredList.templates.listItem**
 *
 *   <a href class='{{config.className}}-item list-group-item' data-cid='{{cid}}'>{{!key}}</a>
 *
 * **FilteredList.templates.listSortToggle**
 *
 *   <button type='button' class='{{config.className}}-sort-toggle btn btn-default btn-xs' title='sort'></button>
 *
 * @class FilteredList
 * @param {jQuery|HTMLElement} _el The element you want to attach the list to
 * @param {Object} _defaults A defaults object
 * @property {String} __cid An automated GUID used internally
 * @property {String} __config The config
 * @property {Boolean} __destroyed Whether or not the object has been destroyed
 * @return {FilteredList}
 */
var FilteredList = function ( _el, _defaults ) {
  var self = this,
    cid = guid.generate(),
    defaults,
    localConfig;

  self.$el = $( _el );

  if ( self.$el.length === 0 ) {
    throw new Error( "An invalid DOM element was given" );
  }

  defaults = $.extend( {}, config.defaults, self.$el.data( config.className + "-options" ), _defaults );

  localConfig = $.extend( {}, config, {
    defaults: defaults
  } );

  self.$el.wrap( "<span class='" + localConfig.className + "' data-sc-filtered-list-cid='" + cid + "'>" );
  self.$wrapper = self.$el.parent();

  Object.defineProperties( self, {
    "__cid": {
      value: cid
    },
    "__config": {
      value: localConfig,
      writable: true
    },
    "__destroyed": {
      value: false,
      writable: true
    },
    "__fetching": {
      value: false,
      writable: true
    },
    "__items": {
      value: {},
      writable: true
    },
    "__label": {
      value: null,
      writable: true
    },
    "__lastFetchedValue": {
      value: "",
      writable: true
    },
    "__original": {
      value: {},
      writable: true
    },
    "__sort": {
      value: "",
      writable: true
    },
    "__value": {
      value: null,
      writable: true
    },
    "activeItem": {
      get: helpers.activeItemGet.bind( self ),
      set: helpers.activeItemSet.bind( self )
    },
    "items": {
      value: observableArray( [] ),
      writable: true
    },
    "label": {
      get: helpers.labelGet.bind( self ),
      set: helpers.labelSet.bind( self )
    },
    "list": {
      writable: true
    },
    "listVisible": {
      get: helpers.listVisibleGet.bind( self ),
      set: helpers.listVisibleSet.bind( self )
    },
    "results": {
      value: [],
      writable: true
    },
    "sort": {
      get: helpers.sortGet.bind( self ),
      set: helpers.sortSet.bind( self )
    },
    "value": {
      get: helpers.valueGet.bind( self ),
      set: helpers.valueSet.bind( self )
    }
  } );

  self.list = new List( self );
  self.__original.buttonText = self.$el.text();

  var itemValue = {};
  itemValue[ self.__config.defaults.itemLabelKey ] = self.__config.defaults.buttonLabel;
  self.value = itemValue;

  self.$el
    .addClass( self.__config.className + "-button" )
    .data( self.__config.name, self )
    .trigger( self.__config.name + "-ready" );

  if ( self.__config.defaults.sortControlVisible !== true ) {
    self.$wrapper.addClass( self.__config.className + "-sort-hidden" );
  }

  [ "push", "shift" ].forEach( function ( _method ) {
    self.items.on( _method, helpers[ "item" + _method ].bind( self ) );
  } );

  $( window ).on( "click." + self.__config.name, helpers.bodyClick.bind( self ) );

  self.fetch();
  self.emit( self.__config.name + "-ready" );
};

/**
 * Adds an array of objects/items in bulk
 *
 *   myList.data([{
 *     name: "david"
 *   }, {
 *     name: "max"
 *   }]);
 *
 * ## Add a single object/item
 *
 *   myList.items.push({
 *     name: "david"
 *   });
 *
 * ## Get the value
 *
 * To get the value of the selected object/item use the `value` property.
 *
 *   myList.value;
 *
 */
FilteredList.prototype.data = function ( _arrayOfItems ) {
  var self = this;

  if ( self.__destroyed ) {
    return;
  }

  var items = is.array( _arrayOfItems ) ? _arrayOfItems : [];

  items.forEach( function ( _item ) {
    if ( is.an.object( _item ) ) {
      self.items.push( _item );
    }
  } );
};

/**
 * Destroys the `FilteredList` and invalidates the object.
 *
 *   myList.destroy();
 *
 * > Any further calles to methods like `destroy` or `data` etc will return
 * nothing.
 */
FilteredList.prototype.destroy = function () {
  var self = this;

  if ( self.__destroyed ) {
    return;
  }

  self.__destroyed = true;
  self.list.destroy();
  $( window ).off( "." + self.__config.name );

  self.$el
    .text( self.__original.buttonText )
    .unwrap()
    .data( self.__config.name, null )
    .removeClass( self.__config.className + "-button" );

  self.emit( "destroy" );
};

FilteredList.prototype.fetch = function () {
  var self = this;

  if ( self.__destroyed ) {
    return;
  }

  var value = self.list.$input.val();

  self.__lastFetchedValue = value;
  self.emit( "fetch", self.__lastFetchedValue );
};

emitter( FilteredList.prototype );

exports = module.exports = FilteredList;
exports.defaults = config.defaults;
exports.templates = config.templates;

$( function () {
  $( "button[data-" + config.className + "]" ).each( function ( _i, _el ) {
    new FilteredList( _el );
  } );
} );
},{"./config.json":19,"./helpers":21,"./list":23,"emitter-component":2,"sc-guid":7,"sc-is":8,"sg-observable-array":18}],21:[function(_dereq_,module,exports){
var is = _dereq_( "sc-is" ),
  ItemValue = _dereq_( "./item-value" ),
  sortToggleOptions = [ "", "desc", "asc" ],
  md5 = _dereq_( "sc-md5" );

exports.activeItemGet = function () {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  return filter.list.getActiveItem();
};

exports.activeItemSet = function ( _value ) {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  filter.value = _value;
  filter.emit( "change", _value );
};

exports.activeItemIndexGet = function () {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  return list.__activeItemIndex;
};

exports.activeItemIndexSet = function ( _value ) {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  var index = is.a.number( _value ) ? _value : 0,
    itemActiveClassName = list.filter.__config.className + "-item-active",
    $itemChildren = list.$list.children(),
    $firstItem = $( $itemChildren[ 0 ] ),
    $activeItemIndexByClass = list.$list.find( "." + itemActiveClassName ),
    $activeItemIndexByIndex = $( $itemChildren[ index ] ),
    $activeItemIndex = $activeItemIndexByIndex.length === 1 ? $activeItemIndexByIndex : $activeItemIndexByClass.length === 1 ? $activeItemIndexByClass : $firstItem;

  $activeItemIndexByClass.removeClass( itemActiveClassName );
  $activeItemIndex.addClass( itemActiveClassName );
  list.__activeItemIndex = $itemChildren.index( $activeItemIndex );

  if ( list.__visible ) {
    list.filter.emit( "itemFocus" );
  }
};

exports.bodyClick = function ( _event ) {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  var buttonClass = "." + filter.__config.className + "-button",
    containerClass = "." + filter.__config.className + "-container",
    $clickedElement = $( is.object( _event ) && _event.target ? _event.target : null ),
    $thisParent = $clickedElement.closest( "[data-" + filter.__config.className + "-cid=" + filter.__cid + "]" ),
    clickedButton = $thisParent.length > 0 && ( $clickedElement.is( buttonClass ) || $clickedElement.closest( buttonClass ).length ) ? true : false,
    clickedList = $thisParent.length > 0 && ( $clickedElement.is( containerClass ) || $clickedElement.closest( containerClass ).length ) ? true : false;

  if ( clickedButton && !filter.listVisible ) {
    filter.listVisible = true;
  } else if ( filter.listVisible && !clickedList ) {
    filter.listVisible = false;
  }
};

exports.filterChanged = function ( _event ) {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  var keyCode = is.object( _event ) && is.number( _event.keyCode ) ? _event.keyCode : -1,
    val = list.$input.val();

  switch ( keyCode ) {
  case 27: // escape
    list.close();
    break;
  case 13: // enter
    list.close();
    list.filter.activeItem = list.getActiveItem();
    break;
  case 38: // up
    list.activeItemIndex--;
    break;
  case 40: // down
    list.activeItemIndex++;
    break;
  default:
    if ( keyCode >= 0 ) {
      list.filter.emit( "filterChanged", val );
      list.filter.fetch();
    }
    break;
  }

};

exports.indexOf = function ( _array, _value ) {
  var array = is.array( _array ) ? _array : [],
    index = -1;

  array.forEach( function ( _val, _i ) {
    if ( index === -1 && _value === _val ) {
      index = _i;
    }
  } );

  return index;
};

exports.windowKeyUp = function ( _event ) {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  var keyCode = is.object( _event ) && is.number( _event.keyCode ) ? _event.keyCode : -1;

  switch ( keyCode ) {
  case 27: // escape
    list.close();
    break;
  }
};

exports.itemClick = function ( _event ) {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  _event.preventDefault();

  var $item = $( _event.currentTarget );

  list.activeItemIndex = $item.parent().children().index( $item );
  list.filter.activeItem = list.getActiveItem();
  list.close();
};

exports.itempush = function ( _item ) {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  if ( !_item.hasOwnProperty( "__cid" ) ) {
    var itemHash = md5( _item );

    if ( !filter.__items[ itemHash ] ) {
      Object.defineProperty( _item, "__cid", {
        value: itemHash
      } );
      filter.__items[ itemHash ] = _item;
      filter.items.__push( _item );
      filter.list.redraw();
    }
  }

};

exports.itemshift = function ( _item ) {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  var itemHash = md5( _item );
  delete filter.__items[ itemHash ];
  filter.items.__shift();
};

exports.labelGet = function () {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  return filter.__label;
};

exports.labelSet = function ( _label ) {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  filter.__label = _label || filter.__config.defaults.defaultButtonLabel;
  filter.$el.text( filter.__label );
  return filter.__label;
};

exports.listVisibleGet = function () {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  return filter.list.__visible;
};

exports.listVisibleSet = function ( _value ) {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  var visible = _value === true || false;
  return visible ? filter.list.open() : filter.list.close();
};

exports.putFocussedItemInView = function () {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  setTimeout( function () {
    var listHeight = list.$list.height(),
      focussedItem = list.$list.find( "." + list.filter.__config.className + "-item-active" );

    if ( focussedItem.length === 0 ) {
      return;
    }

    var itemHeight = focussedItem.outerHeight(),
      itemTop = focussedItem.position().top, // TODO: offset top could be good enough here
      itemBottom = itemTop + itemHeight;

    if ( itemTop < 0 || itemBottom > listHeight ) {
      focussedItem[ 0 ].scrollIntoView( itemTop < 0 );
    }

  }, 10 );
};

exports.sortGet = function () {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  return filter.__sort;
};

exports.sortSet = function ( _value ) {
  var filter = this,
    sortOption;

  if ( filter.__destroyed ) {
    return;
  }

  var sortClassName = filter.__config.className + "-sort-",
    sortClassNames = sortToggleOptions.join( " " + sortClassName ).trim();

  sortToggleOptions.forEach( function ( _sortOption ) {
    if ( !sortOption && _sortOption === _value ) {
      sortOption = _value;
    }
  } );

  filter.__sort = sortOption || sortToggleOptions[ 0 ];
  filter.list.redraw();
  filter.$wrapper.removeClass( sortClassNames ).addClass( filter.__sort ? sortClassName + filter.__sort : "" );
  filter.emit( "sort" );
  return filter.__sort;
};

exports.sortToggleClicked = function ( _event ) {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  var filter = list.filter,
    currentSort = filter.sort,
    index = exports.indexOf( sortToggleOptions, currentSort ),
    nextIndex = index + 1,
    nextSort = sortToggleOptions[ nextIndex ] === undefined ? sortToggleOptions[ 0 ] : sortToggleOptions[ nextIndex ];

  filter.sort = nextSort;
};

exports.valueGet = function () {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  return filter.__value.value;
};

exports.valueSet = function ( _value ) {
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  filter.__value = new ItemValue( filter.__config.defaults.itemLabelKey, _value );
  filter.label = filter.__value.key;
  filter.$el.text( filter.label );
  return filter.__value;
};
},{"./item-value":22,"sc-is":8,"sc-md5":14}],22:[function(_dereq_,module,exports){
var is = _dereq_( "sc-is" );

var ItemValue = function ( _key, _value ) {
  var value = {};
  value.key = is.object( _value ) && is.string( _value[ _key ] ) ? _value[ _key ] : "";
  value.value = _value;
  return value;
};

module.exports = ItemValue;
},{"sc-is":8}],23:[function(_dereq_,module,exports){
var helpers = _dereq_( "./helpers" ),
  fuzzy = _dereq_( "fuzzaldrin" ),
  merge = _dereq_( "sc-merge" ),
  minstache = _dereq_( "minstache" ),
  debounce = _dereq_( "debounce" );

var List = function ( _filter ) {
  var self = this,
    config;

  Object.defineProperties( self, {
    "__activeItemIndex": {
      value: 0,
      writable: true
    },
    "__destroyed": {
      value: false,
      writable: true
    },
    "__templates": {
      value: {}
    },
    "__visible": {
      value: false,
      writable: true
    },
    "activeItemIndex": {
      get: helpers.activeItemIndexGet.bind( self ),
      set: helpers.activeItemIndexSet.bind( self )
    },
    "filter": {
      value: _filter
    }
  } );

  config = self.filter.__config;

  Object.keys( config.templates ).forEach( function ( _templateName ) {
    self.__templates[ _templateName ] = minstache( config.templates[ _templateName ], {
      config: config,
      cid: "",
      key: ""
    } );
  } );

  self.$el = $( minstache( self.__templates.listWrapper, {
    config: merge( config, {
      templates: self.__templates
    } )
  } ) );

  self.$el.width( config.defaults.minWidth );

  self.$input = self.$el.find( "." + config.className + "-input" );
  self.$header = self.$el.find( "." + config.className + "-header" );
  self.$list = self.$el.find( "." + config.className + "-items" );
  self.$sortToggle = self.$el.find( "." + config.className + "-sort-toggle" );

  self.$input.on( "change." + config.name + " keydown." + config.name, helpers.filterChanged.bind( self ) );
  self.$sortToggle.on( "click." + config.name, helpers.sortToggleClicked.bind( self ) );
  self.filter.on( "filterChanged", self.redraw.bind( self ) );
  self.filter.on( "itemFocus", helpers.putFocussedItemInView.bind( self ) );
  self.filter.$el.after( self.$el );

  self.filter.once( config.name + "-ready", function () {
    if ( config.defaults.sort ) {
      self.filter.sort = config.defaults.sort;
    }
  } );
};

List.prototype.close = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  self.__visible = false;
  self.$el.removeClass( config.className + "-container-visible" );
  self.filter.emit( "close" );
  $( window ).off( "keyup." + config.name );
  self.$el.off( "click." + config.name );
  return self.__visible;
};

List.prototype.destroy = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  self.filter.__destroyed = self.__destroyed = true;
  $( window ).off( "." + config.name );
  self.$input.off( "." + config.name );
  self.$el.off( "." + config.name );
  self.$sortToggle.off( "." + config.name );
  self.filter.off( "filterChanged" );
  self.filter.off( "itemFocus" );
  self.$el.remove();

};

List.prototype.getActiveItem = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  var $selectedItem = self.$list.find( "." + config.className + "-item-active" ),
    selectedItemHash = $selectedItem.data( "cid" ),
    selectedItem = self.filter.__items[ selectedItemHash ];

  return selectedItem;
};

List.prototype.open = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  self.__visible = true;
  self.filter.emit( "open" );
  $( window ).on( "keyup." + config.name, helpers.windowKeyUp.bind( self ) );
  self.$el.on( "click." + config.name, "." + config.className + "-item", helpers.itemClick.bind( self ) );
  self.redraw();

  self.filter.once( "redraw", function () {
    self.$input.focus().select();
  } );

  return self.__visible;
};

List.prototype.redraw = debounce( function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  var filterBy = self.$input.val() || "",
    itemsMarkup = "",
    results;

  if ( config.defaults.fuzzy ) {
    results = fuzzy.filter( self.filter.items, filterBy, {
      key: config.defaults.itemLabelKey,
      maxResults: config.defaults.maxNumItems
    } );
  } else {
    var rx = new RegExp( "\\b" + filterBy, "i" );
    results = [];
    self.filter.items.forEach( function ( _item, _i ) {
      if ( _i < config.defaults.maxNumItems ) {
        if ( rx.test( _item[ config.defaults.itemLabelKey ] ) ) {
          results.push( _item );
        }
      }
    } );
  }


  if ( self.filter.__sort ) {
    results.sort( function ( a, b ) {
      var order = self.filter.__sort === "desc" ? a.name > b.name : a.name < b.name;
      return order ? 1 : -1;
    } );
  }

  self.filter.results = results;

  self.filter.emit( "filtered" );

  results.forEach( function ( _item ) {
    _item.key = _item[ config.defaults.itemLabelKey ];
    itemsMarkup += minstache( config.templates.listItem, merge( {
      config: config,
      cid: _item.__cid
    }, _item ) );
  } );

  self.$list.empty().html( itemsMarkup );
  self.activeItemIndex = self.activeItemIndex;

  if ( self.__visible ) {
    setTimeout( function () {

      if ( self.__destroyed ) {
        return;
      }

      var visibleItemsHeight = 0;
      self.$el.addClass( config.className + "-container-invisible" );

      self.$list.find( ">:lt(" + config.defaults.maxNumItemsVisible + ")" ).each( function ( _i, _el ) {
        visibleItemsHeight += $( _el ).outerHeight();
      } );

      self.$list.height( visibleItemsHeight );
      self.$el.addClass( config.className + "-container-visible" ).removeClass( config.className + "-container-invisible" );
      self.filter.emit( "redraw" );
    }, 0 );

  }

}, 10 );

module.exports = List;
},{"./helpers":21,"debounce":1,"fuzzaldrin":4,"minstache":6,"sc-merge":16}]},{},[20])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9kZWJvdW5jZS9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZW1pdHRlci1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL2Z1enphbGRyaW4vbGliL2ZpbHRlci5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZnV6emFsZHJpbi9saWIvZnV6emFsZHJpbi5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZnV6emFsZHJpbi92ZW5kb3Ivc3RyaW5nc2NvcmUuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL21pbnN0YWNoZS9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtZ3VpZC9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvZW1wdHkuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvZ3VpZC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvaXNlcy9udWxsb3J1bmRlZmluZWQuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvdHlwZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvdHlwZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtbWQ1L2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9zYy1tZDUvbm9kZV9tb2R1bGVzL21kNS1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLW1lcmdlL2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9zYy1tZXJnZS9ub2RlX21vZHVsZXMvdHlwZS1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NnLW9ic2VydmFibGUtYXJyYXkvc3JjL2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2NvbmZpZy5qc29uIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2Zha2VfMzA5ZGU0ODcuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvc3JjL3NjcmlwdHMvaGVscGVycy5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9zcmMvc2NyaXB0cy9pdGVtLXZhbHVlLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2xpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogRGVib3VuY2VzIGEgZnVuY3Rpb24gYnkgdGhlIGdpdmVuIHRocmVzaG9sZC5cbiAqXG4gKiBAc2VlIGh0dHA6Ly91bnNjcmlwdGFibGUuY29tLzIwMDkvMDMvMjAvZGVib3VuY2luZy1qYXZhc2NyaXB0LW1ldGhvZHMvXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmdW5jdGlvbiB0byB3cmFwXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZW91dCBpbiBtcyAoYDEwMGApXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHdoZXRoZXIgdG8gZXhlY3V0ZSBhdCB0aGUgYmVnaW5uaW5nIChgZmFsc2VgKVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGRlYm91bmNlKGZ1bmMsIHRocmVzaG9sZCwgZXhlY0FzYXApe1xuICB2YXIgdGltZW91dDtcblxuICByZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VkKCl7XG4gICAgdmFyIG9iaiA9IHRoaXMsIGFyZ3MgPSBhcmd1bWVudHM7XG5cbiAgICBmdW5jdGlvbiBkZWxheWVkICgpIHtcbiAgICAgIGlmICghZXhlY0FzYXApIHtcbiAgICAgICAgZnVuYy5hcHBseShvYmosIGFyZ3MpO1xuICAgICAgfVxuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgfVxuXG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICB9IGVsc2UgaWYgKGV4ZWNBc2FwKSB7XG4gICAgICBmdW5jLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgfVxuXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQoZGVsYXllZCwgdGhyZXNob2xkIHx8IDEwMCk7XG4gIH07XG59O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgRW1pdHRlcmAuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyO1xuXG4vKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gRW1pdHRlcihvYmopIHtcbiAgaWYgKG9iaikgcmV0dXJuIG1peGluKG9iaik7XG59O1xuXG4vKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gbWl4aW4ob2JqKSB7XG4gIGZvciAodmFyIGtleSBpbiBFbWl0dGVyLnByb3RvdHlwZSkge1xuICAgIG9ialtrZXldID0gRW1pdHRlci5wcm90b3R5cGVba2V5XTtcbiAgfVxuICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub24gPVxuRW1pdHRlci5wcm90b3R5cGUuYWRkRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgKHRoaXMuX2NhbGxiYWNrc1tldmVudF0gPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdKVxuICAgIC5wdXNoKGZuKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgZnVuY3Rpb24gb24oKSB7XG4gICAgc2VsZi5vZmYoZXZlbnQsIG9uKTtcbiAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9XG5cbiAgb24uZm4gPSBmbjtcbiAgdGhpcy5vbihldmVudCwgb24pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIHRoZSBnaXZlbiBjYWxsYmFjayBmb3IgYGV2ZW50YCBvciBhbGxcbiAqIHJlZ2lzdGVyZWQgY2FsbGJhY2tzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9mZiA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICAvLyBhbGxcbiAgaWYgKDAgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIHRoaXMuX2NhbGxiYWNrcyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gc3BlY2lmaWMgZXZlbnRcbiAgdmFyIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gIGlmICghY2FsbGJhY2tzKSByZXR1cm4gdGhpcztcblxuICAvLyByZW1vdmUgYWxsIGhhbmRsZXJzXG4gIGlmICgxID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG4gIHZhciBjYjtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYWxsYmFja3MubGVuZ3RoOyBpKyspIHtcbiAgICBjYiA9IGNhbGxiYWNrc1tpXTtcbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgY2FsbGJhY2tzLnNwbGljZShpLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKVxuICAgICwgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcblxuICBpZiAoY2FsbGJhY2tzKSB7XG4gICAgY2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBjYWxsYmFja3MubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIGNhbGxiYWNrc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmV0dXJuIGFycmF5IG9mIGNhbGxiYWNrcyBmb3IgYGV2ZW50YC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgcmV0dXJuIHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW107XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmhhc0xpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgcmV0dXJuICEhIHRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7XG59O1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgYmFzZW5hbWVTY29yZSwgc3RyaW5nU2NvcmU7XG5cbiAgc3RyaW5nU2NvcmUgPSByZXF1aXJlKCcuLi92ZW5kb3Ivc3RyaW5nc2NvcmUnKTtcblxuICBiYXNlbmFtZVNjb3JlID0gZnVuY3Rpb24oc3RyaW5nLCBxdWVyeSwgc2NvcmUpIHtcbiAgICB2YXIgYmFzZSwgZGVwdGgsIGluZGV4LCBsYXN0Q2hhcmFjdGVyLCBzZWdtZW50Q291bnQsIHNsYXNoQ291bnQ7XG4gICAgaW5kZXggPSBzdHJpbmcubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAoc3RyaW5nW2luZGV4XSA9PT0gJy8nKSB7XG4gICAgICBpbmRleC0tO1xuICAgIH1cbiAgICBzbGFzaENvdW50ID0gMDtcbiAgICBsYXN0Q2hhcmFjdGVyID0gaW5kZXg7XG4gICAgYmFzZSA9IG51bGw7XG4gICAgd2hpbGUgKGluZGV4ID49IDApIHtcbiAgICAgIGlmIChzdHJpbmdbaW5kZXhdID09PSAnLycpIHtcbiAgICAgICAgc2xhc2hDb3VudCsrO1xuICAgICAgICBpZiAoYmFzZSA9PSBudWxsKSB7XG4gICAgICAgICAgYmFzZSA9IHN0cmluZy5zdWJzdHJpbmcoaW5kZXggKyAxLCBsYXN0Q2hhcmFjdGVyICsgMSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgaWYgKGxhc3RDaGFyYWN0ZXIgPCBzdHJpbmcubGVuZ3RoIC0gMSkge1xuICAgICAgICAgIGlmIChiYXNlID09IG51bGwpIHtcbiAgICAgICAgICAgIGJhc2UgPSBzdHJpbmcuc3Vic3RyaW5nKDAsIGxhc3RDaGFyYWN0ZXIgKyAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKGJhc2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgYmFzZSA9IHN0cmluZztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGluZGV4LS07XG4gICAgfVxuICAgIGlmIChiYXNlID09PSBzdHJpbmcpIHtcbiAgICAgIHNjb3JlICo9IDI7XG4gICAgfSBlbHNlIGlmIChiYXNlKSB7XG4gICAgICBzY29yZSArPSBzdHJpbmdTY29yZShiYXNlLCBxdWVyeSk7XG4gICAgfVxuICAgIHNlZ21lbnRDb3VudCA9IHNsYXNoQ291bnQgKyAxO1xuICAgIGRlcHRoID0gTWF0aC5tYXgoMSwgMTAgLSBzZWdtZW50Q291bnQpO1xuICAgIHNjb3JlICo9IGRlcHRoICogMC4wMTtcbiAgICByZXR1cm4gc2NvcmU7XG4gIH07XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjYW5kaWRhdGVzLCBxdWVyeSwgX2FyZykge1xuICAgIHZhciBjYW5kaWRhdGUsIGtleSwgbWF4UmVzdWx0cywgcXVlcnlIYXNOb1NsYXNoZXMsIHNjb3JlLCBzY29yZWRDYW5kaWRhdGUsIHNjb3JlZENhbmRpZGF0ZXMsIHN0cmluZywgX2ksIF9sZW4sIF9yZWY7XG4gICAgX3JlZiA9IF9hcmcgIT0gbnVsbCA/IF9hcmcgOiB7fSwga2V5ID0gX3JlZi5rZXksIG1heFJlc3VsdHMgPSBfcmVmLm1heFJlc3VsdHM7XG4gICAgaWYgKHF1ZXJ5KSB7XG4gICAgICBxdWVyeUhhc05vU2xhc2hlcyA9IHF1ZXJ5LmluZGV4T2YoJy8nKSA9PT0gLTE7XG4gICAgICBzY29yZWRDYW5kaWRhdGVzID0gW107XG4gICAgICBmb3IgKF9pID0gMCwgX2xlbiA9IGNhbmRpZGF0ZXMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICAgICAgY2FuZGlkYXRlID0gY2FuZGlkYXRlc1tfaV07XG4gICAgICAgIHN0cmluZyA9IGtleSAhPSBudWxsID8gY2FuZGlkYXRlW2tleV0gOiBjYW5kaWRhdGU7XG4gICAgICAgIGlmICghc3RyaW5nKSB7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcmUgPSBzdHJpbmdTY29yZShzdHJpbmcsIHF1ZXJ5KTtcbiAgICAgICAgaWYgKHF1ZXJ5SGFzTm9TbGFzaGVzKSB7XG4gICAgICAgICAgc2NvcmUgPSBiYXNlbmFtZVNjb3JlKHN0cmluZywgcXVlcnksIHNjb3JlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc2NvcmUgPiAwKSB7XG4gICAgICAgICAgc2NvcmVkQ2FuZGlkYXRlcy5wdXNoKHtcbiAgICAgICAgICAgIGNhbmRpZGF0ZTogY2FuZGlkYXRlLFxuICAgICAgICAgICAgc2NvcmU6IHNjb3JlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNjb3JlZENhbmRpZGF0ZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBiLnNjb3JlIC0gYS5zY29yZTtcbiAgICAgIH0pO1xuICAgICAgY2FuZGlkYXRlcyA9IChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIF9qLCBfbGVuMSwgX3Jlc3VsdHM7XG4gICAgICAgIF9yZXN1bHRzID0gW107XG4gICAgICAgIGZvciAoX2ogPSAwLCBfbGVuMSA9IHNjb3JlZENhbmRpZGF0ZXMubGVuZ3RoOyBfaiA8IF9sZW4xOyBfaisrKSB7XG4gICAgICAgICAgc2NvcmVkQ2FuZGlkYXRlID0gc2NvcmVkQ2FuZGlkYXRlc1tfal07XG4gICAgICAgICAgX3Jlc3VsdHMucHVzaChzY29yZWRDYW5kaWRhdGUuY2FuZGlkYXRlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gX3Jlc3VsdHM7XG4gICAgICB9KSgpO1xuICAgIH1cbiAgICBpZiAobWF4UmVzdWx0cyAhPSBudWxsKSB7XG4gICAgICBjYW5kaWRhdGVzID0gY2FuZGlkYXRlcy5zbGljZSgwLCBtYXhSZXN1bHRzKTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbmRpZGF0ZXM7XG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBzdHJpbmdTY29yZTtcblxuICBzdHJpbmdTY29yZSA9IHJlcXVpcmUoJy4uL3ZlbmRvci9zdHJpbmdzY29yZScpO1xuXG4gIG1vZHVsZS5leHBvcnRzID0ge1xuICAgIGZpbHRlcjogcmVxdWlyZSgnLi9maWx0ZXInKSxcbiAgICBzY29yZTogZnVuY3Rpb24oc3RyaW5nLCBxdWVyeSkge1xuICAgICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICBpZiAoIXF1ZXJ5KSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHN0cmluZ1Njb3JlKHN0cmluZywgcXVlcnkpO1xuICAgIH1cbiAgfTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIi8vIE1PRElGSUVEIEJZIE5TL0NKIC0gRG9uJ3QgZXh0ZW5kIHRoZSBwcm90b3R5cGUgb2YgU3RyaW5nXG4vLyBNT0RJRklFRCBCWSBDSiAtIFJlbW92ZSBzdGFydF9vZl9zdHJpbmdfYm9udXNcblxuLyohXG4gKiBzdHJpbmdfc2NvcmUuanM6IFN0cmluZyBTY29yaW5nIEFsZ29yaXRobSAwLjEuMTBcbiAqXG4gKiBodHRwOi8vam9zaGF2ZW4uY29tL3N0cmluZ19zY29yZVxuICogaHR0cHM6Ly9naXRodWIuY29tL2pvc2hhdmVuL3N0cmluZ19zY29yZVxuICpcbiAqIENvcHlyaWdodCAoQykgMjAwOS0yMDExIEpvc2hhdmVuIFBvdHRlciA8eW91cnRlY2hAZ21haWwuY29tPlxuICogU3BlY2lhbCB0aGFua3MgdG8gYWxsIG9mIHRoZSBjb250cmlidXRvcnMgbGlzdGVkIGhlcmUgaHR0cHM6Ly9naXRodWIuY29tL2pvc2hhdmVuL3N0cmluZ19zY29yZVxuICogTUlUIGxpY2Vuc2U6IGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKlxuICogRGF0ZTogVHVlIE1hciAxIDIwMTFcbiovXG5cbi8qKlxuICogU2NvcmVzIGEgc3RyaW5nIGFnYWluc3QgYW5vdGhlciBzdHJpbmcuXG4gKiAgJ0hlbGxvIFdvcmxkJy5zY29yZSgnaGUnKTsgICAgIC8vPT4gMC41OTMxODE4MTgxODE4MTgxXG4gKiAgJ0hlbGxvIFdvcmxkJy5zY29yZSgnSGVsbG8nKTsgIC8vPT4gMC43MzE4MTgxODE4MTgxODE4XG4gKi9cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oc3RyaW5nLCBhYmJyZXZpYXRpb24pIHtcbiAgLy8gSWYgdGhlIHN0cmluZyBpcyBlcXVhbCB0byB0aGUgYWJicmV2aWF0aW9uLCBwZXJmZWN0IG1hdGNoLlxuICBpZiAoc3RyaW5nID09IGFiYnJldmlhdGlvbikge3JldHVybiAxO31cblxuICB2YXIgdG90YWxfY2hhcmFjdGVyX3Njb3JlID0gMCxcbiAgICAgIGFiYnJldmlhdGlvbl9sZW5ndGggPSBhYmJyZXZpYXRpb24ubGVuZ3RoLFxuICAgICAgc3RyaW5nX2xlbmd0aCA9IHN0cmluZy5sZW5ndGgsXG4gICAgICBzdGFydF9vZl9zdHJpbmdfYm9udXMsXG4gICAgICBhYmJyZXZpYXRpb25fc2NvcmUsXG4gICAgICBmaW5hbF9zY29yZTtcblxuICAvLyBXYWxrIHRocm91Z2ggYWJicmV2aWF0aW9uIGFuZCBhZGQgdXAgc2NvcmVzLlxuICBmb3IgKHZhciBpID0gMCxcbiAgICAgICAgIGNoYXJhY3Rlcl9zY29yZS8qID0gMCovLFxuICAgICAgICAgaW5kZXhfaW5fc3RyaW5nLyogPSAwKi8sXG4gICAgICAgICBjLyogPSAnJyovLFxuICAgICAgICAgaW5kZXhfY19sb3dlcmNhc2UvKiA9IDAqLyxcbiAgICAgICAgIGluZGV4X2NfdXBwZXJjYXNlLyogPSAwKi8sXG4gICAgICAgICBtaW5faW5kZXgvKiA9IDAqLztcbiAgICAgaSA8IGFiYnJldmlhdGlvbl9sZW5ndGg7XG4gICAgICsraSkge1xuXG4gICAgLy8gRmluZCB0aGUgZmlyc3QgY2FzZS1pbnNlbnNpdGl2ZSBtYXRjaCBvZiBhIGNoYXJhY3Rlci5cbiAgICBjID0gYWJicmV2aWF0aW9uLmNoYXJBdChpKTtcblxuICAgIGluZGV4X2NfbG93ZXJjYXNlID0gc3RyaW5nLmluZGV4T2YoYy50b0xvd2VyQ2FzZSgpKTtcbiAgICBpbmRleF9jX3VwcGVyY2FzZSA9IHN0cmluZy5pbmRleE9mKGMudG9VcHBlckNhc2UoKSk7XG4gICAgbWluX2luZGV4ID0gTWF0aC5taW4oaW5kZXhfY19sb3dlcmNhc2UsIGluZGV4X2NfdXBwZXJjYXNlKTtcbiAgICBpbmRleF9pbl9zdHJpbmcgPSAobWluX2luZGV4ID4gLTEpID8gbWluX2luZGV4IDogTWF0aC5tYXgoaW5kZXhfY19sb3dlcmNhc2UsIGluZGV4X2NfdXBwZXJjYXNlKTtcblxuICAgIGlmIChpbmRleF9pbl9zdHJpbmcgPT09IC0xKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hhcmFjdGVyX3Njb3JlID0gMC4xO1xuICAgIH1cblxuICAgIC8vIFNldCBiYXNlIHNjb3JlIGZvciBtYXRjaGluZyAnYycuXG5cbiAgICAvLyBTYW1lIGNhc2UgYm9udXMuXG4gICAgaWYgKHN0cmluZ1tpbmRleF9pbl9zdHJpbmddID09PSBjKSB7XG4gICAgICBjaGFyYWN0ZXJfc2NvcmUgKz0gMC4xO1xuICAgIH1cblxuICAgIC8vIENvbnNlY3V0aXZlIGxldHRlciAmIHN0YXJ0LW9mLXN0cmluZyBCb251c1xuICAgIGlmIChpbmRleF9pbl9zdHJpbmcgPT09IDApIHtcbiAgICAgIC8vIEluY3JlYXNlIHRoZSBzY29yZSB3aGVuIG1hdGNoaW5nIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgcmVtYWluZGVyIG9mIHRoZSBzdHJpbmdcbiAgICAgIGNoYXJhY3Rlcl9zY29yZSArPSAwLjY7XG4gICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAvLyBJZiBtYXRjaCBpcyB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSBzdHJpbmdcbiAgICAgICAgLy8gJiB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIGFiYnJldmlhdGlvbiwgYWRkIGFcbiAgICAgICAgLy8gc3RhcnQtb2Ytc3RyaW5nIG1hdGNoIGJvbnVzLlxuICAgICAgICAvLyBzdGFydF9vZl9zdHJpbmdfYm9udXMgPSAxIC8vdHJ1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAvLyBBY3JvbnltIEJvbnVzXG4gICAgICAvLyBXZWlnaGluZyBMb2dpYzogVHlwaW5nIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgYW4gYWNyb255bSBpcyBhcyBpZiB5b3VcbiAgICAgIC8vIHByZWNlZGVkIGl0IHdpdGggdHdvIHBlcmZlY3QgY2hhcmFjdGVyIG1hdGNoZXMuXG4gICAgICBpZiAoc3RyaW5nLmNoYXJBdChpbmRleF9pbl9zdHJpbmcgLSAxKSA9PT0gJyAnKSB7XG4gICAgICAgIGNoYXJhY3Rlcl9zY29yZSArPSAwLjg7IC8vICogTWF0aC5taW4oaW5kZXhfaW5fc3RyaW5nLCA1KTsgLy8gQ2FwIGJvbnVzIGF0IDAuNCAqIDVcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMZWZ0IHRyaW0gdGhlIGFscmVhZHkgbWF0Y2hlZCBwYXJ0IG9mIHRoZSBzdHJpbmdcbiAgICAvLyAoZm9yY2VzIHNlcXVlbnRpYWwgbWF0Y2hpbmcpLlxuICAgIHN0cmluZyA9IHN0cmluZy5zdWJzdHJpbmcoaW5kZXhfaW5fc3RyaW5nICsgMSwgc3RyaW5nX2xlbmd0aCk7XG5cbiAgICB0b3RhbF9jaGFyYWN0ZXJfc2NvcmUgKz0gY2hhcmFjdGVyX3Njb3JlO1xuICB9IC8vIGVuZCBvZiBmb3IgbG9vcFxuXG4gIC8vIFVuY29tbWVudCB0byB3ZWlnaCBzbWFsbGVyIHdvcmRzIGhpZ2hlci5cbiAgLy8gcmV0dXJuIHRvdGFsX2NoYXJhY3Rlcl9zY29yZSAvIHN0cmluZ19sZW5ndGg7XG5cbiAgYWJicmV2aWF0aW9uX3Njb3JlID0gdG90YWxfY2hhcmFjdGVyX3Njb3JlIC8gYWJicmV2aWF0aW9uX2xlbmd0aDtcbiAgLy9wZXJjZW50YWdlX29mX21hdGNoZWRfc3RyaW5nID0gYWJicmV2aWF0aW9uX2xlbmd0aCAvIHN0cmluZ19sZW5ndGg7XG4gIC8vd29yZF9zY29yZSA9IGFiYnJldmlhdGlvbl9zY29yZSAqIHBlcmNlbnRhZ2Vfb2ZfbWF0Y2hlZF9zdHJpbmc7XG5cbiAgLy8gUmVkdWNlIHBlbmFsdHkgZm9yIGxvbmdlciBzdHJpbmdzLlxuICAvL2ZpbmFsX3Njb3JlID0gKHdvcmRfc2NvcmUgKyBhYmJyZXZpYXRpb25fc2NvcmUpIC8gMjtcbiAgZmluYWxfc2NvcmUgPSAoKGFiYnJldmlhdGlvbl9zY29yZSAqIChhYmJyZXZpYXRpb25fbGVuZ3RoIC8gc3RyaW5nX2xlbmd0aCkpICsgYWJicmV2aWF0aW9uX3Njb3JlKSAvIDI7XG5cbiAgaWYgKHN0YXJ0X29mX3N0cmluZ19ib251cyAmJiAoZmluYWxfc2NvcmUgKyAwLjE1IDwgMSkpIHtcbiAgICBmaW5hbF9zY29yZSArPSAwLjE1O1xuICB9XG5cbiAgcmV0dXJuIGZpbmFsX3Njb3JlO1xufTtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYHJlbmRlcigpYC5gXG4gKi9cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gcmVuZGVyO1xuXG4vKipcbiAqIEV4cG9zZSBgY29tcGlsZSgpYC5cbiAqL1xuXG5leHBvcnRzLmNvbXBpbGUgPSBjb21waWxlO1xuXG4vKipcbiAqIFJlbmRlciB0aGUgZ2l2ZW4gbXVzdGFjaGUgYHN0cmAgd2l0aCBgb2JqYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIHJlbmRlcihzdHIsIG9iaikge1xuICBvYmogPSBvYmogfHwge307XG4gIHZhciBmbiA9IGNvbXBpbGUoc3RyKTtcbiAgcmV0dXJuIGZuKG9iaik7XG59XG5cbi8qKlxuICogQ29tcGlsZSB0aGUgZ2l2ZW4gYHN0cmAgdG8gYSBgRnVuY3Rpb25gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlKHN0cikge1xuICB2YXIganMgPSBbXTtcbiAgdmFyIHRva3MgPSBwYXJzZShzdHIpO1xuICB2YXIgdG9rO1xuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdG9rcy5sZW5ndGg7ICsraSkge1xuICAgIHRvayA9IHRva3NbaV07XG4gICAgaWYgKGkgJSAyID09IDApIHtcbiAgICAgIGpzLnB1c2goJ1wiJyArIHRvay5yZXBsYWNlKC9cIi9nLCAnXFxcXFwiJykgKyAnXCInKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3dpdGNoICh0b2tbMF0pIHtcbiAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgdG9rID0gdG9rLnNsaWNlKDEpO1xuICAgICAgICAgIGpzLnB1c2goJykgKyAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnXic6XG4gICAgICAgICAgdG9rID0gdG9rLnNsaWNlKDEpO1xuICAgICAgICAgIGFzc2VydFByb3BlcnR5KHRvayk7XG4gICAgICAgICAganMucHVzaCgnICsgc2VjdGlvbihvYmosIFwiJyArIHRvayArICdcIiwgdHJ1ZSwgJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJyMnOlxuICAgICAgICAgIHRvayA9IHRvay5zbGljZSgxKTtcbiAgICAgICAgICBhc3NlcnRQcm9wZXJ0eSh0b2spO1xuICAgICAgICAgIGpzLnB1c2goJyArIHNlY3Rpb24ob2JqLCBcIicgKyB0b2sgKyAnXCIsIGZhbHNlLCAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnISc6XG4gICAgICAgICAgdG9rID0gdG9rLnNsaWNlKDEpO1xuICAgICAgICAgIGFzc2VydFByb3BlcnR5KHRvayk7XG4gICAgICAgICAganMucHVzaCgnICsgb2JqLicgKyB0b2sgKyAnICsgJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgYXNzZXJ0UHJvcGVydHkodG9rKTtcbiAgICAgICAgICBqcy5wdXNoKCcgKyBlc2NhcGUob2JqLicgKyB0b2sgKyAnKSArICcpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGpzID0gJ1xcbidcbiAgICArIGluZGVudChlc2NhcGUudG9TdHJpbmcoKSkgKyAnO1xcblxcbidcbiAgICArIGluZGVudChzZWN0aW9uLnRvU3RyaW5nKCkpICsgJztcXG5cXG4nXG4gICAgKyAnICByZXR1cm4gJyArIGpzLmpvaW4oJycpLnJlcGxhY2UoL1xcbi9nLCAnXFxcXG4nKTtcblxuICByZXR1cm4gbmV3IEZ1bmN0aW9uKCdvYmonLCBqcyk7XG59XG5cbi8qKlxuICogQXNzZXJ0IHRoYXQgYHByb3BgIGlzIGEgdmFsaWQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGFzc2VydFByb3BlcnR5KHByb3ApIHtcbiAgaWYgKCFwcm9wLm1hdGNoKC9eW1xcdy5dKyQvKSkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHByb3BlcnR5IFwiJyArIHByb3AgKyAnXCInKTtcbn1cblxuLyoqXG4gKiBQYXJzZSBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlKHN0cikge1xuICByZXR1cm4gc3RyLnNwbGl0KC9cXHtcXHt8XFx9XFx9Lyk7XG59XG5cbi8qKlxuICogSW5kZW50IGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGluZGVudChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eL2dtLCAnICAnKTtcbn1cblxuLyoqXG4gKiBTZWN0aW9uIGhhbmRsZXIuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHQgb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtCb29sZWFufSBuZWdhdGVcbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIHNlY3Rpb24ob2JqLCBwcm9wLCBuZWdhdGUsIHN0cikge1xuICB2YXIgdmFsID0gb2JqW3Byb3BdO1xuICBpZiAoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgdmFsKSByZXR1cm4gdmFsLmNhbGwob2JqLCBzdHIpO1xuICBpZiAobmVnYXRlKSB2YWwgPSAhdmFsO1xuICBpZiAodmFsKSByZXR1cm4gc3RyO1xuICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogRXNjYXBlIHRoZSBnaXZlbiBgaHRtbGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGh0bWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIGVzY2FwZShodG1sKSB7XG4gIHJldHVybiBTdHJpbmcoaHRtbClcbiAgICAucmVwbGFjZSgvJi9nLCAnJmFtcDsnKVxuICAgIC5yZXBsYWNlKC9cIi9nLCAnJnF1b3Q7JylcbiAgICAucmVwbGFjZSgvPC9nLCAnJmx0OycpXG4gICAgLnJlcGxhY2UoLz4vZywgJyZndDsnKTtcbn1cbiIsInZhciBndWlkUnggPSBcIns/WzAtOUEtRmEtZl17OH0tWzAtOUEtRmEtZl17NH0tNFswLTlBLUZhLWZdezN9LVswLTlBLUZhLWZdezR9LVswLTlBLUZhLWZdezEyfX0/XCI7XG5cbmV4cG9ydHMuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIHZhciBndWlkID0gXCJ4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHhcIi5yZXBsYWNlKCAvW3h5XS9nLCBmdW5jdGlvbiAoIGMgKSB7XG4gICAgdmFyIHIgPSAoIGQgKyBNYXRoLnJhbmRvbSgpICogMTYgKSAlIDE2IHwgMDtcbiAgICBkID0gTWF0aC5mbG9vciggZCAvIDE2ICk7XG4gICAgcmV0dXJuICggYyA9PT0gXCJ4XCIgPyByIDogKCByICYgMHg3IHwgMHg4ICkgKS50b1N0cmluZyggMTYgKTtcbiAgfSApO1xuICByZXR1cm4gZ3VpZDtcbn07XG5cbmV4cG9ydHMubWF0Y2ggPSBmdW5jdGlvbiAoIHN0cmluZyApIHtcbiAgdmFyIHJ4ID0gbmV3IFJlZ0V4cCggZ3VpZFJ4LCBcImdcIiApLFxuICAgIG1hdGNoZXMgPSAoIHR5cGVvZiBzdHJpbmcgPT09IFwic3RyaW5nXCIgPyBzdHJpbmcgOiBcIlwiICkubWF0Y2goIHJ4ICk7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KCBtYXRjaGVzICkgPyBtYXRjaGVzIDogW107XG59O1xuXG5leHBvcnRzLmlzVmFsaWQgPSBmdW5jdGlvbiAoIGd1aWQgKSB7XG4gIHZhciByeCA9IG5ldyBSZWdFeHAoIGd1aWRSeCApO1xuICByZXR1cm4gcngudGVzdCggZ3VpZCApO1xufTsiLCJ2YXIgdHlwZSA9IHJlcXVpcmUoIFwiLi9pc2VzL3R5cGVcIiApLFxuICBpcyA9IHtcbiAgICBhOiB7fSxcbiAgICBhbjoge30sXG4gICAgbm90OiB7XG4gICAgICBhOiB7fSxcbiAgICAgIGFuOiB7fVxuICAgIH1cbiAgfTtcblxudmFyIGlzZXMgPSB7XG4gIFwiYXJndW1lbnRzXCI6IFsgXCJhcmd1bWVudHNcIiwgdHlwZSggXCJhcmd1bWVudHNcIiApIF0sXG4gIFwiYXJyYXlcIjogWyBcImFycmF5XCIsIHR5cGUoIFwiYXJyYXlcIiApIF0sXG4gIFwiYm9vbGVhblwiOiBbIFwiYm9vbGVhblwiLCB0eXBlKCBcImJvb2xlYW5cIiApIF0sXG4gIFwiZGF0ZVwiOiBbIFwiZGF0ZVwiLCB0eXBlKCBcImRhdGVcIiApIF0sXG4gIFwiZnVuY3Rpb25cIjogWyBcImZ1bmN0aW9uXCIsIFwiZnVuY1wiLCBcImZuXCIsIHR5cGUoIFwiZnVuY3Rpb25cIiApIF0sXG4gIFwibnVsbFwiOiBbIFwibnVsbFwiLCB0eXBlKCBcIm51bGxcIiApIF0sXG4gIFwibnVtYmVyXCI6IFsgXCJudW1iZXJcIiwgXCJpbnRlZ2VyXCIsIFwiaW50XCIsIHR5cGUoIFwibnVtYmVyXCIgKSBdLFxuICBcIm9iamVjdFwiOiBbIFwib2JqZWN0XCIsIHR5cGUoIFwib2JqZWN0XCIgKSBdLFxuICBcInJlZ2V4cFwiOiBbIFwicmVnZXhwXCIsIHR5cGUoIFwicmVnZXhwXCIgKSBdLFxuICBcInN0cmluZ1wiOiBbIFwic3RyaW5nXCIsIHR5cGUoIFwic3RyaW5nXCIgKSBdLFxuICBcInVuZGVmaW5lZFwiOiBbIFwidW5kZWZpbmVkXCIsIHR5cGUoIFwidW5kZWZpbmVkXCIgKSBdLFxuICBcImVtcHR5XCI6IFsgXCJlbXB0eVwiLCByZXF1aXJlKCBcIi4vaXNlcy9lbXB0eVwiICkgXSxcbiAgXCJudWxsb3J1bmRlZmluZWRcIjogWyBcIm51bGxPclVuZGVmaW5lZFwiLCBcIm51bGxvcnVuZGVmaW5lZFwiLCByZXF1aXJlKCBcIi4vaXNlcy9udWxsb3J1bmRlZmluZWRcIiApIF0sXG4gIFwiZ3VpZFwiOiBbIFwiZ3VpZFwiLCByZXF1aXJlKCBcIi4vaXNlcy9ndWlkXCIgKSBdXG59XG5cbk9iamVjdC5rZXlzKCBpc2VzICkuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG5cbiAgdmFyIG1ldGhvZHMgPSBpc2VzWyBrZXkgXS5zbGljZSggMCwgaXNlc1sga2V5IF0ubGVuZ3RoIC0gMSApLFxuICAgIGZuID0gaXNlc1sga2V5IF1bIGlzZXNbIGtleSBdLmxlbmd0aCAtIDEgXTtcblxuICBtZXRob2RzLmZvckVhY2goIGZ1bmN0aW9uICggbWV0aG9kS2V5ICkge1xuICAgIGlzWyBtZXRob2RLZXkgXSA9IGlzLmFbIG1ldGhvZEtleSBdID0gaXMuYW5bIG1ldGhvZEtleSBdID0gZm47XG4gICAgaXMubm90WyBtZXRob2RLZXkgXSA9IGlzLm5vdC5hWyBtZXRob2RLZXkgXSA9IGlzLm5vdC5hblsgbWV0aG9kS2V5IF0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApID8gZmFsc2UgOiB0cnVlO1xuICAgIH1cbiAgfSApO1xuXG59ICk7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGlzO1xuZXhwb3J0cy50eXBlID0gdHlwZTsiLCJ2YXIgdHlwZSA9IHJlcXVpcmUoXCIuLi90eXBlXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XG4gIHZhciBlbXB0eSA9IGZhbHNlO1xuXG4gIGlmICggdHlwZSggdmFsdWUgKSA9PT0gXCJudWxsXCIgfHwgdHlwZSggdmFsdWUgKSA9PT0gXCJ1bmRlZmluZWRcIiApIHtcbiAgICBlbXB0eSA9IHRydWU7XG4gIH0gZWxzZSBpZiAoIHR5cGUoIHZhbHVlICkgPT09IFwib2JqZWN0XCIgKSB7XG4gICAgZW1wdHkgPSBPYmplY3Qua2V5cyggdmFsdWUgKS5sZW5ndGggPT09IDA7XG4gIH0gZWxzZSBpZiAoIHR5cGUoIHZhbHVlICkgPT09IFwiYm9vbGVhblwiICkge1xuICAgIGVtcHR5ID0gdmFsdWUgPT09IGZhbHNlO1xuICB9IGVsc2UgaWYgKCB0eXBlKCB2YWx1ZSApID09PSBcIm51bWJlclwiICkge1xuICAgIGVtcHR5ID0gdmFsdWUgPT09IDAgfHwgdmFsdWUgPT09IC0xO1xuICB9IGVsc2UgaWYgKCB0eXBlKCB2YWx1ZSApID09PSBcImFycmF5XCIgfHwgdHlwZSggdmFsdWUgKSA9PT0gXCJzdHJpbmdcIiApIHtcbiAgICBlbXB0eSA9IHZhbHVlLmxlbmd0aCA9PT0gMDtcbiAgfVxuXG4gIHJldHVybiBlbXB0eTtcblxufTsiLCJ2YXIgZ3VpZCA9IHJlcXVpcmUoIFwic2MtZ3VpZFwiICk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcbiAgcmV0dXJuIGd1aWQuaXNWYWxpZCggdmFsdWUgKTtcbn07IiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xuXHRyZXR1cm4gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHVuZGVmaW5lZCB8fCB2YWx1ZSA9PT0gdm9pZCAwO1xufTsiLCJ2YXIgdHlwZSA9IHJlcXVpcmUoIFwiLi4vdHlwZVwiICk7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCBfdHlwZSApIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICAgIHJldHVybiB0eXBlKCBfdmFsdWUgKSA9PT0gX3R5cGU7XG4gIH1cbn0iLCJ2YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICggdmFsICkge1xuICBzd2l0Y2ggKCB0b1N0cmluZy5jYWxsKCB2YWwgKSApIHtcbiAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOlxuICAgIHJldHVybiAnZnVuY3Rpb24nO1xuICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICByZXR1cm4gJ2RhdGUnO1xuICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgIHJldHVybiAncmVnZXhwJztcbiAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzpcbiAgICByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gIGNhc2UgJ1tvYmplY3QgQXJyYXldJzpcbiAgICByZXR1cm4gJ2FycmF5JztcbiAgfVxuXG4gIGlmICggdmFsID09PSBudWxsICkgcmV0dXJuICdudWxsJztcbiAgaWYgKCB2YWwgPT09IHVuZGVmaW5lZCApIHJldHVybiAndW5kZWZpbmVkJztcbiAgaWYgKCB2YWwgPT09IE9iamVjdCggdmFsICkgKSByZXR1cm4gJ29iamVjdCc7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59OyIsInZhciBtZDUgPSByZXF1aXJlKCBcIm1kNS1jb21wb25lbnRcIiApO1xuXG5mdW5jdGlvbiBzdHJpbmdpZnkoIF9vYmplY3QgKSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSggX29iamVjdCApO1xufVxuXG5mdW5jdGlvbiBoYXNoKCBfb2JqZWN0ICkge1xuICByZXR1cm4gbWQ1KCBzdHJpbmdpZnkoIF9vYmplY3QgKSApO1xufVxuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBoYXNoO1xuZXhwb3J0cy5zdHJpbmdpZnkgPSBzdHJpbmdpZnk7XG5leHBvcnRzLm1kNSA9IG1kNTsiLCIvKipcbiAqIG1kNS5qc1xuICogQ29weXJpZ2h0IChjKSAyMDExLCBZb3NoaW5vcmkgS29oeWFtYSAoaHR0cDovL2FsZ29iaXQuanAvKVxuICogYWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGRpZ2VzdFN0cmluZztcblxuZnVuY3Rpb24gZGlnZXN0KE0pIHtcbiAgdmFyIG9yaWdpbmFsTGVuZ3RoXG4gICAgLCBpXG4gICAgLCBqXG4gICAgLCBrXG4gICAgLCBsXG4gICAgLCBBXG4gICAgLCBCXG4gICAgLCBDXG4gICAgLCBEXG4gICAgLCBBQVxuICAgICwgQkJcbiAgICAsIENDXG4gICAgLCBERFxuICAgICwgWFxuICAgICwgcnZhbFxuICAgIDtcblxuXHRmdW5jdGlvbiBGKHgsIHksIHopIHsgcmV0dXJuICh4ICYgeSkgfCAofnggJiB6KTsgfVxuXHRmdW5jdGlvbiBHKHgsIHksIHopIHsgcmV0dXJuICh4ICYgeikgfCAoeSAmIH56KTsgfVxuXHRmdW5jdGlvbiBIKHgsIHksIHopIHsgcmV0dXJuIHggXiB5IF4gejsgICAgICAgICAgfVxuXHRmdW5jdGlvbiBJKHgsIHksIHopIHsgcmV0dXJuIHkgXiAoeCB8IH56KTsgICAgICAgfVxuXG5cdGZ1bmN0aW9uIHRvNGJ5dGVzKG4pIHtcblx0XHRyZXR1cm4gW24mMHhmZiwgKG4+Pj44KSYweGZmLCAobj4+PjE2KSYweGZmLCAobj4+PjI0KSYweGZmXTtcblx0fVxuXG5cdG9yaWdpbmFsTGVuZ3RoID0gTS5sZW5ndGg7IC8vIGZvciBTdGVwLjJcblxuXHQvLyAzLjEgU3RlcCAxLiBBcHBlbmQgUGFkZGluZyBCaXRzXG5cdE0ucHVzaCgweDgwKTtcblx0bCA9ICg1NiAtIE0ubGVuZ3RoKSYweDNmO1xuXHRmb3IgKGkgPSAwOyBpIDwgbDsgaSsrKVxuXHRcdE0ucHVzaCgwKTtcblxuXHQvLyAzLjIgU3RlcCAyLiBBcHBlbmQgTGVuZ3RoXG5cdHRvNGJ5dGVzKDgqb3JpZ2luYWxMZW5ndGgpLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgTS5wdXNoKGUpOyB9KTtcblx0WzAsIDAsIDAsIDBdLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgTS5wdXNoKGUpOyB9KTtcblxuXHQvLyAzLjMgU3RlcCAzLiBJbml0aWFsaXplIE1EIEJ1ZmZlclxuXHRBID0gWzB4Njc0NTIzMDFdO1xuXHRCID0gWzB4ZWZjZGFiODldO1xuXHRDID0gWzB4OThiYWRjZmVdO1xuXHREID0gWzB4MTAzMjU0NzZdO1xuXG5cdC8vIDMuNCBTdGVwIDQuIFByb2Nlc3MgTWVzc2FnZSBpbiAxNi1Xb3JkIEJsb2Nrc1xuXHRmdW5jdGlvbiByb3VuZHMoYSwgYiwgYywgZCwgaywgcywgdCwgZikge1xuXHRcdGFbMF0gKz0gZihiWzBdLCBjWzBdLCBkWzBdKSArIFhba10gKyB0O1xuXHRcdGFbMF0gPSAoKGFbMF08PHMpfChhWzBdPj4+KDMyIC0gcykpKTtcblx0XHRhWzBdICs9IGJbMF07XG5cdH1cblxuXHRmb3IgKGkgPSAwOyBpIDwgTS5sZW5ndGg7IGkgKz0gNjQpIHtcblx0XHRYID0gW107XG5cdFx0Zm9yIChqID0gMDsgaiA8IDY0OyBqICs9IDQpIHtcblx0XHRcdGsgPSBpICsgajtcblx0XHRcdFgucHVzaChNW2tdfChNW2sgKyAxXTw8OCl8KE1bayArIDJdPDwxNil8KE1bayArIDNdPDwyNCkpO1xuXHRcdH1cblx0XHRBQSA9IEFbMF07XG5cdFx0QkIgPSBCWzBdO1xuXHRcdENDID0gQ1swXTtcblx0XHRERCA9IERbMF07XG5cblx0XHQvLyBSb3VuZCAxLlxuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgMCwgIDcsIDB4ZDc2YWE0NzgsIEYpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgMSwgMTIsIDB4ZThjN2I3NTYsIEYpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgMiwgMTcsIDB4MjQyMDcwZGIsIEYpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgMywgMjIsIDB4YzFiZGNlZWUsIEYpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgNCwgIDcsIDB4ZjU3YzBmYWYsIEYpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgNSwgMTIsIDB4NDc4N2M2MmEsIEYpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgNiwgMTcsIDB4YTgzMDQ2MTMsIEYpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgNywgMjIsIDB4ZmQ0Njk1MDEsIEYpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgOCwgIDcsIDB4Njk4MDk4ZDgsIEYpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgOSwgMTIsIDB4OGI0NGY3YWYsIEYpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxMCwgMTcsIDB4ZmZmZjViYjEsIEYpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAxMSwgMjIsIDB4ODk1Y2Q3YmUsIEYpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAxMiwgIDcsIDB4NmI5MDExMjIsIEYpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAxMywgMTIsIDB4ZmQ5ODcxOTMsIEYpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxNCwgMTcsIDB4YTY3OTQzOGUsIEYpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAxNSwgMjIsIDB4NDliNDA4MjEsIEYpO1xuXG5cdFx0Ly8gUm91bmQgMi5cblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDEsICA1LCAweGY2MWUyNTYyLCBHKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDYsICA5LCAweGMwNDBiMzQwLCBHKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTEsIDE0LCAweDI2NWU1YTUxLCBHKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDAsIDIwLCAweGU5YjZjN2FhLCBHKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDUsICA1LCAweGQ2MmYxMDVkLCBHKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgMTAsICA5LCAweDAyNDQxNDUzLCBHKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTUsIDE0LCAweGQ4YTFlNjgxLCBHKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDQsIDIwLCAweGU3ZDNmYmM4LCBHKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDksICA1LCAweDIxZTFjZGU2LCBHKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgMTQsICA5LCAweGMzMzcwN2Q2LCBHKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDMsIDE0LCAweGY0ZDUwZDg3LCBHKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDgsIDIwLCAweDQ1NWExNGVkLCBHKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgMTMsICA1LCAweGE5ZTNlOTA1LCBHKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDIsICA5LCAweGZjZWZhM2Y4LCBHKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDcsIDE0LCAweDY3NmYwMmQ5LCBHKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgMTIsIDIwLCAweDhkMmE0YzhhLCBHKTtcblxuXHRcdC8vIFJvdW5kIDMuXG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA1LCAgNCwgMHhmZmZhMzk0MiwgSCk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA4LCAxMSwgMHg4NzcxZjY4MSwgSCk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDExLCAxNiwgMHg2ZDlkNjEyMiwgSCk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDE0LCAyMywgMHhmZGU1MzgwYywgSCk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICAxLCAgNCwgMHhhNGJlZWE0NCwgSCk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA0LCAxMSwgMHg0YmRlY2ZhOSwgSCk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICA3LCAxNiwgMHhmNmJiNGI2MCwgSCk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDEwLCAyMywgMHhiZWJmYmM3MCwgSCk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsIDEzLCAgNCwgMHgyODliN2VjNiwgSCk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICAwLCAxMSwgMHhlYWExMjdmYSwgSCk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICAzLCAxNiwgMHhkNGVmMzA4NSwgSCk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA2LCAyMywgMHgwNDg4MWQwNSwgSCk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA5LCAgNCwgMHhkOWQ0ZDAzOSwgSCk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDEyLCAxMSwgMHhlNmRiOTllNSwgSCk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDE1LCAxNiwgMHgxZmEyN2NmOCwgSCk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICAyLCAyMywgMHhjNGFjNTY2NSwgSCk7XG5cblx0XHQvLyBSb3VuZCA0LlxuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgMCwgIDYsIDB4ZjQyOTIyNDQsIEkpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgNywgMTAsIDB4NDMyYWZmOTcsIEkpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxNCwgMTUsIDB4YWI5NDIzYTcsIEkpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgNSwgMjEsIDB4ZmM5M2EwMzksIEkpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAxMiwgIDYsIDB4NjU1YjU5YzMsIEkpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgMywgMTAsIDB4OGYwY2NjOTIsIEkpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxMCwgMTUsIDB4ZmZlZmY0N2QsIEkpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgMSwgMjEsIDB4ODU4NDVkZDEsIEkpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgOCwgIDYsIDB4NmZhODdlNGYsIEkpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAxNSwgMTAsIDB4ZmUyY2U2ZTAsIEkpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgNiwgMTUsIDB4YTMwMTQzMTQsIEkpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAxMywgMjEsIDB4NGUwODExYTEsIEkpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgNCwgIDYsIDB4Zjc1MzdlODIsIEkpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAxMSwgMTAsIDB4YmQzYWYyMzUsIEkpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgMiwgMTUsIDB4MmFkN2QyYmIsIEkpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgOSwgMjEsIDB4ZWI4NmQzOTEsIEkpO1xuXG5cdFx0QVswXSArPSBBQTtcblx0XHRCWzBdICs9IEJCO1xuXHRcdENbMF0gKz0gQ0M7XG5cdFx0RFswXSArPSBERDtcblx0fVxuXG5cdHJ2YWwgPSBbXTtcblx0dG80Ynl0ZXMoQVswXSkuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBydmFsLnB1c2goZSk7IH0pO1xuXHR0bzRieXRlcyhCWzBdKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IHJ2YWwucHVzaChlKTsgfSk7XG5cdHRvNGJ5dGVzKENbMF0pLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgcnZhbC5wdXNoKGUpOyB9KTtcblx0dG80Ynl0ZXMoRFswXSkuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBydmFsLnB1c2goZSk7IH0pO1xuXG5cdHJldHVybiBydmFsO1xufVxuXG5mdW5jdGlvbiBkaWdlc3RTdHJpbmcocykge1xuXHR2YXIgTSA9IFtdXG4gICAgLCBpXG4gICAgLCBkXG4gICAgLCByc3RyXG4gICAgLCBzXG4gICAgO1xuXG5cdGZvciAoaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKVxuXHRcdE0ucHVzaChzLmNoYXJDb2RlQXQoaSkpO1xuXG5cdGQgPSBkaWdlc3QoTSk7XG5cdHJzdHIgPSAnJztcblxuXHRkLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcblx0XHRzID0gZS50b1N0cmluZygxNik7XG5cdFx0d2hpbGUgKHMubGVuZ3RoIDwgMilcblx0XHRcdHMgPSAnMCcgKyBzO1xuXHRcdHJzdHIgKz0gcztcblx0fSk7XG5cblx0cmV0dXJuIHJzdHI7XG59IiwidmFyIHR5cGUgPSByZXF1aXJlKCBcInR5cGUtY29tcG9uZW50XCIgKTtcblxudmFyIG1lcmdlID0gZnVuY3Rpb24gKCkge1xuXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cyApLFxuICAgIGRlZXAgPSB0eXBlKCBhcmdzWyAwIF0gKSA9PT0gXCJib29sZWFuXCIgPyBhcmdzLnNoaWZ0KCkgOiBmYWxzZSxcbiAgICBvYmplY3RzID0gYXJncyxcbiAgICByZXN1bHQgPSB7fTtcblxuICBvYmplY3RzLmZvckVhY2goIGZ1bmN0aW9uICggb2JqZWN0biApIHtcblxuICAgIGlmICggdHlwZSggb2JqZWN0biApICE9PSBcIm9iamVjdFwiICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIE9iamVjdC5rZXlzKCBvYmplY3RuICkuZm9yRWFjaCggZnVuY3Rpb24gKCBrZXkgKSB7XG4gICAgICBpZiAoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCggb2JqZWN0biwga2V5ICkgKSB7XG4gICAgICAgIGlmICggZGVlcCAmJiB0eXBlKCBvYmplY3RuWyBrZXkgXSApID09PSBcIm9iamVjdFwiICkge1xuICAgICAgICAgIHJlc3VsdFsga2V5IF0gPSBtZXJnZSggZGVlcCwge30sIHJlc3VsdFsga2V5IF0sIG9iamVjdG5bIGtleSBdICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0WyBrZXkgXSA9IG9iamVjdG5bIGtleSBdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSApO1xuXG4gIH0gKTtcblxuICByZXR1cm4gcmVzdWx0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBtZXJnZTsiLCJcbi8qKlxuICogdG9TdHJpbmcgcmVmLlxuICovXG5cbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbi8qKlxuICogUmV0dXJuIHRoZSB0eXBlIG9mIGB2YWxgLlxuICpcbiAqIEBwYXJhbSB7TWl4ZWR9IHZhbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHZhbCl7XG4gIHN3aXRjaCAodG9TdHJpbmcuY2FsbCh2YWwpKSB7XG4gICAgY2FzZSAnW29iamVjdCBGdW5jdGlvbl0nOiByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgICBjYXNlICdbb2JqZWN0IERhdGVdJzogcmV0dXJuICdkYXRlJztcbiAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOiByZXR1cm4gJ3JlZ2V4cCc7XG4gICAgY2FzZSAnW29iamVjdCBBcmd1bWVudHNdJzogcmV0dXJuICdhcmd1bWVudHMnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJyYXldJzogcmV0dXJuICdhcnJheSc7XG4gIH1cblxuICBpZiAodmFsID09PSBudWxsKSByZXR1cm4gJ251bGwnO1xuICBpZiAodmFsID09PSB1bmRlZmluZWQpIHJldHVybiAndW5kZWZpbmVkJztcbiAgaWYgKHZhbCA9PT0gT2JqZWN0KHZhbCkpIHJldHVybiAnb2JqZWN0JztcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn07XG4iLCJ2YXIgT2JzZXJ2YWJsZUFycmF5ID0gZnVuY3Rpb24gKCBfYXJyYXkgKSB7XG5cdHZhciBoYW5kbGVycyA9IHt9LFxuXHRcdGFycmF5ID0gQXJyYXkuaXNBcnJheSggX2FycmF5ICkgPyBfYXJyYXkgOiBbXTtcblxuXHR2YXIgcHJveHkgPSBmdW5jdGlvbiAoIF9tZXRob2QsIF92YWx1ZSApIHtcblx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcblxuXHRcdGlmICggaGFuZGxlcnNbIF9tZXRob2QgXSApIHtcblx0XHRcdHJldHVybiBoYW5kbGVyc1sgX21ldGhvZCBdLmFwcGx5KCBhcnJheSwgYXJncyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gYXJyYXlbICdfXycgKyBfbWV0aG9kIF0uYXBwbHkoIGFycmF5LCBhcmdzICk7XG5cdFx0fVxuXHR9O1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBhcnJheSwge1xuXHRcdG9uOiB7XG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gKCBfZXZlbnQsIF9jYWxsYmFjayApIHtcblx0XHRcdFx0aGFuZGxlcnNbIF9ldmVudCBdID0gX2NhbGxiYWNrO1xuXHRcdFx0fVxuXHRcdH1cblx0fSApO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggYXJyYXksICdwb3AnLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBwcm94eSggJ3BvcCcsIGFycmF5WyBhcnJheS5sZW5ndGggLSAxIF0gKTtcblx0XHR9XG5cdH0gKTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIGFycmF5LCAnX19wb3AnLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBBcnJheS5wcm90b3R5cGUucG9wLmFwcGx5KCBhcnJheSwgYXJndW1lbnRzICk7XG5cdFx0fVxuXHR9ICk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBhcnJheSwgJ3NoaWZ0Jywge1xuXHRcdHZhbHVlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gcHJveHkoICdzaGlmdCcsIGFycmF5WyAwIF0gKTtcblx0XHR9XG5cdH0gKTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIGFycmF5LCAnX19zaGlmdCcsIHtcblx0XHR2YWx1ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5zaGlmdC5hcHBseSggYXJyYXksIGFyZ3VtZW50cyApO1xuXHRcdH1cblx0fSApO1xuXG5cdFsgJ3B1c2gnLCAncmV2ZXJzZScsICd1bnNoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJyBdLmZvckVhY2goIGZ1bmN0aW9uICggX21ldGhvZCApIHtcblx0XHR2YXIgcHJvcGVydGllcyA9IHt9O1xuXG5cdFx0cHJvcGVydGllc1sgX21ldGhvZCBdID0ge1xuXHRcdFx0dmFsdWU6IHByb3h5LmJpbmQoIG51bGwsIF9tZXRob2QgKVxuXHRcdH07XG5cblx0XHRwcm9wZXJ0aWVzWyAnX18nICsgX21ldGhvZCBdID0ge1xuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuXHRcdFx0XHRyZXR1cm4gQXJyYXkucHJvdG90eXBlWyBfbWV0aG9kIF0uYXBwbHkoIGFycmF5LCBhcmd1bWVudHMgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIGFycmF5LCBwcm9wZXJ0aWVzICk7XG5cdH0gKTtcblxuXHRyZXR1cm4gYXJyYXk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9ic2VydmFibGVBcnJheTsiLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwibmFtZVwiOiBcInNjZmlsdGVyZWRsaXN0XCIsXG4gIFwiY2xhc3NOYW1lXCI6IFwic2MtZmlsdGVyZWQtbGlzdFwiLFxuICBcImRlZmF1bHRzXCI6IHtcbiAgICBcImJ1dHRvbkxhYmVsXCI6IFwiQ2hvb3NlIG9uZVwiLFxuICAgIFwiZnV6enlcIjogZmFsc2UsXG4gICAgXCJpdGVtTGFiZWxLZXlcIjogXCJuYW1lXCIsXG4gICAgXCJsaXN0VGl0bGVcIjogXCJTZWxlY3QgYW4gaXRlbVwiLFxuICAgIFwibWF4TnVtSXRlbXNcIjogMTAsXG4gICAgXCJtYXhOdW1JdGVtc1Zpc2libGVcIjogNyxcbiAgICBcIm1pbldpZHRoXCI6IDMwMCxcbiAgICBcInNvcnRcIjogXCJkZXNjXCIsXG4gICAgXCJzb3J0Q29udHJvbFZpc2libGVcIjogdHJ1ZVxuICB9LFxuICBcInRlbXBsYXRlc1wiOiB7XG4gICAgXCJsaXN0V3JhcHBlclwiOiBcIjxkaXYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWNvbnRhaW5lcic+e3shY29uZmlnLnRlbXBsYXRlcy5saXN0SW5wdXR9fXt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdEhlYWRlcn19e3shY29uZmlnLnRlbXBsYXRlcy5saXN0SXRlbVdyYXBwZXJ9fTwvZGl2PlwiLFxuICAgIFwibGlzdElucHV0XCI6IFwiPGRpdiBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taW5wdXQtY29udGFpbmVyJz48aW5wdXQgdHlwZT0ndGV4dCcgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWlucHV0IGZvcm0tY29udHJvbCc+PC9kaXY+XCIsXG4gICAgXCJsaXN0SGVhZGVyXCI6IFwiPGhlYWRlciBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taGVhZGVyIHBhbmVsLWhlYWRpbmcnPnt7IWNvbmZpZy5kZWZhdWx0cy5saXN0VGl0bGV9fXt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdFNvcnRUb2dnbGV9fTwvaGVhZGVyPlwiLFxuICAgIFwibGlzdEl0ZW1XcmFwcGVyXCI6IFwiPGRpdiBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taXRlbXMgbGlzdC1ncm91cCc+PC9kaXY+XCIsXG4gICAgXCJsaXN0SXRlbVwiOiBcIjxhIGhyZWYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWl0ZW0gbGlzdC1ncm91cC1pdGVtJyBkYXRhLWNpZD0ne3tjaWR9fSc+e3sha2V5fX08L2E+XCIsXG4gICAgXCJsaXN0U29ydFRvZ2dsZVwiOiBcIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0tc29ydC10b2dnbGUgYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cycgdGl0bGU9J3NvcnQnPjwvYnV0dG9uPlwiXG4gIH1cbn0iLCJ2YXIgY29uZmlnID0gcmVxdWlyZSggXCIuL2NvbmZpZy5qc29uXCIgKSxcbiAgZW1pdHRlciA9IHJlcXVpcmUoIFwiZW1pdHRlci1jb21wb25lbnRcIiApLFxuICBndWlkID0gcmVxdWlyZSggXCJzYy1ndWlkXCIgKSxcbiAgaGVscGVycyA9IHJlcXVpcmUoIFwiLi9oZWxwZXJzXCIgKSxcbiAgaXMgPSByZXF1aXJlKCBcInNjLWlzXCIgKSxcbiAgTGlzdCA9IHJlcXVpcmUoIFwiLi9saXN0XCIgKSxcbiAgb2JzZXJ2YWJsZUFycmF5ID0gcmVxdWlyZSggXCJzZy1vYnNlcnZhYmxlLWFycmF5XCIgKTtcblxuLyoqXG4gKiBgc2MtZmlsdGVyZWQtbGlzdGAgaXMgYSBVSSBjb250cm9sIHRvIGFsbG93IHRoZSB1c2VyIHRvIHF1aWNrbHkgY2hvb3NlIGFcbiAqIHNpbmdsZSBvYmplY3QgZnJvbSBhIGxpc3Qgb2YgbWFueSBvYmplY3RzLlxuICpcbiAqIDxpbWcgc3JjPVwiaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1NQRUFLVUkvc2MtZmlsdGVyZWQtbGlzdC9tYXN0ZXIvZGVtby9kZW1vLmdpZlwiIHN0eWxlPVwiYWxpZ246IGNlbnRlclwiPlxuICpcbiAqICMjIEluc3RhbGxhdGlvblxuICpcbiAqIEdldCBbTm9kZS5qc10oaHR0cDovL25vZGVqcy5vcmcpLiBBbmQgdGhlbiBpbiBhIGNvbnNvbGUuLi5cbiAqXG4gKiBgYGBiYXNoXG4gKiBucG0gaW5zdGFsbFxuICogYGBgXG4gKlxuICogIyMgT3ZlcnZpZXdcbiAqXG4gKiBUaGlzIGNvbnRyb2wgaXMgYXR0YWNoZWQgdG8gYSBidXR0b24uIFdoZW4gdGhlIGJ1dHRvbiBpcyBjbGlja2VkIGEgbGlzdFxuICogd291bGQgYXBwZWFyIGlubGluZSB0byBhbGxvdyB0aGUgdXNlciB0byBlaXRoZXIgdXNlIHRoZSBtb3VzZSBvciBrZXlib2FyZFxuICogdG8gY2hvb3NlIGFuIGl0ZW0uIEEgdGV4dCBpbnB1dCBpcyBhdmFpbGFibGUgdG8gYWxsb3cgdGhlIGxpc3QgdG8gYmVcbiAqIGZpbHRlcmVkLlxuICpcbiAqICMjIEluc3RhbnRpYXRlXG4gKlxuICogVGhlIGBGaWx0ZXJlZExpc3RgIGNhbiBiZSBpbnN0YW50aWF0ZWQgdXNpbmcgYGRhdGEtYCBhdHRyaWJ1dGVzIGRpcmVjdGx5IGluXG4gKiB0aGUgbWFya3VwIG9yIG1hbnVhbGx5IGJ5IGNvZGUuXG4gKlxuICogKipJbnN0YW50aWF0ZSB1c2luZyBgZGF0YS1gIGF0dHJpYnV0ZXMqKlxuICpcbiAqIEFkZCBgZGF0YS1zYy1maWx0ZXJlZC1saXN0YCB0byBhIGA8YnV0dG9uPmAuIFdpbGwgaW5zdGFudGlhdGUgb24gZG9tcmVhZHkuXG4gKlxuICogICA8YnV0dG9uIGRhdGEtc2MtZmlsdGVyZWQtbGlzdD5cbiAqXG4gKiBUbyBnZXQgYSByZWZlcmVuY2UgdG8gdGhlIGluc3RhbnRpYXRlZCBvYmplY3QgdXNlIHRoZSBqUXVlcnkgYGRhdGFgIG1ldGhvZDpcbiAqXG4gKiAgICQoJyNteUJ1dHRvbicpLmRhdGEoJ3NjZmlsdGVyZWRsaXN0Jyk7XG4gKlxuICogKipJbnN0YW50aWF0ZSB1c2luZyBjb2RlKipcbiAqXG4gKiAgIHZhciBmaWx0ZXIgPSBuZXcgRmlsdGVyZWRMaXN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNteUJ1dHRvbicpKTtcbiAqXG4gKiAjIyMgT3B0aW9uc1xuICpcbiAqIEdpdmUgb3B0aW9ucyB1c2luZyB0aGUgYGRhdGEtYCBhdHRyaWJ1dGUuXG4gKlxuICogICA8YnV0dG9uIGRhdGEtc2MtZmlsdGVyZWQtbGlzdCBkYXRhLXNjLWZpbHRlcmVkLWxpc3Qtb3B0aW9ucz0ne1wiZnV6enlcIjogdHJ1ZX0nPlxuICpcbiAqID4gVGhlIG9wdGlvbnMgb2JqZWN0IG11c3QgYmUgYSBwcm9wZXJseSBmb3JtYXR0ZWQgSlNPTiBzdHJpbmcuXG4gKlxuICogR2l2ZSBvcHRpb25zIHVzaW5nIGNvZGUuXG4gKlxuICogICB2YXIgZmlsdGVyID0gbmV3IEZpbHRlcmVkTGlzdChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbXlCdXR0b24nKSwge1xuICogICAgIGZ1enp5OiB0cnVlXG4gKiAgIH0pO1xuICpcbiAqIC0gYGJ1dHRvbkxhYmVsYCBUaGUgYnV0dG9uIGxhYmVsIChkZWZhdWx0OiBcIkNob29zZSBvbmVcIilcbiAqIC0gYGZ1enp5YCBUaGUgc2VhcmNoIHR5cGUuIElmIHRydWUgXCJkdmRcIiB3aWxsIG1hdGNoIFwiZGF2aWRcIiAoZGVmYXVsdDogZmFsc2UpXG4gKiAtIGBpdGVtTGFiZWxLZXlgIFRoZSBvYmplY3Qga2V5IHRvIHVzZSBmb3IgdGhlIGl0ZW1zIGxhYmVsIChkZWZhdWx0OiBcIm5hbWVcIilcbiAqIC0gYGxpc3RUaXRsZWAgVGhlIHRpdGxlIGFib3ZlIHRoZSBsaXN0IChkZWZhdWx0OiBcIlNlbGVjdCBhbiBpdGVtXCIpXG4gKiAtIGBtYXhOdW1JdGVtc2AgVGhlIG1heGltdW0gbnVtYmVyIG9mIGl0ZW1zIGluIHRoZSBsaXN0IChkZWZhdWx0OiAxMClcbiAqIC0gYG1heE51bUl0ZW1zVmlzaWJsZWAgVGhlIG1heGltdW0gbnVtYmVyIG9mIGl0ZW1zIHZpc2libGUgKGRlZmF1bHQ6IDcpXG4gKiAtIGBtaW5XaWR0aGAgVGhlIHdpZHRoIG9mIHRoZSBsaXN0IChkZWZhdWx0OiAzMDApXG4gKiAtIGBzb3J0YCBUaGUgZGVmYXVsdCBzb3J0IFtcIlwiLCBcImFzY1wiLCBcImRlc2NcIl0gKGRlZmF1bHQ6IFwiZGVzY1wiKVxuICogLSBgc29ydENvbnRyb2xWaXNpYmxlYCBJZiB0aGUgc29ydCBjb250cm9sIGlzIHZpc2libGUgKGRlZmF1bHQ6IHRydWUpXG4gKlxuICogIyMjIERlZmF1bHRzXG4gKlxuICogVG8gY2hhbmdlIHRoZSBkZWZhdWx0cywgdXNlIHRoZSBnbG9iYWwgYEZpbHRlcmVkTGlzdGAgdmFyaWFibGUuXG4gKlxuICogICBGaWx0ZXJlZExpc3QuZGVmYXVsdHMubWF4TnVtSXRlbXMgPSAxMDtcbiAqXG4gKiAjIyMgRXZlbnRzXG4gKlxuICogVGhlIGBGaWx0ZXJlZExpc3RgIHVzZXMgYW4gZXZlbnQgYmFzZWQgc3lzdGVtIHdpdGggbWV0aG9kcyBgb25gLCBgb2ZmYCBhbmRcbiAqIGBvbmNlYC5cbiAqXG4gKiAgIG15TGlzdC5vbignY2hhbmdlJywgZnVuY3Rpb24oKXt9KTtcbiAqXG4gKiAqKkV2ZW50cyoqXG4gKlxuICogLSBgY2hhbmdlYCBXaGVuIHRoZSB1c2VyIHNlbGVjdHMgYW5kIGl0ZW0gYW5kIHRoZSB2YWx1ZSBoYXMgY2hhbmdlZFxuICogLSBgY2xvc2VgIFdoZW4gdGhlIGxpc3QgY2xvc2VzXG4gKiAtIGBkZXN0cm95YCBXaGVuIHRoZSBgRmlsdGVyZWRMaXN0YCBpcyBkZXN0cm95ZWRcbiAqIC0gYGZpbHRlcmVkYCBXaGVuIHRoZSBzZWFyY2ggdmFsdWUgY2hhbmdlc1xuICogLSBgaXRlbUZvY3VzYCBXaGVuIGFuIGl0ZW0gaW4gdGhlIGxpc3QgZ2FpbnMgZm9jdXNcbiAqIC0gYG9wZW5gIFdoZW4gdGhlIGxpc3Qgb3BlbnNcbiAqIC0gYHNvcnRgIFdoZW4gdGhlIGxpc3QgaXMgc29ydGVkXG4gKiAtIGByZWRyYXdgIFdoZW4gdGhlIGxpc3QgcmVkcmF3cyBpdHNlbGZcbiAqIC0gYGZldGNoYCBXaGVuIHRoZSBsaXN0IHRyaWVzIHRvIGZldGNoIGRhdGEgYmFzZWQgb24gdGhlIHNlYXJjaCB0ZXJtXG4gKlxuICogIyMjIFN0eWxpbmdcbiAqXG4gKiBDU1MgaXMgcHJvdmlkZWQgYW5kIGlzIHJlcXVpcmVkIGhvd2V2ZXIgaXQgaXMgcGxhaW4gYnkgZGVzaWduLiBUaGVyZSBhcmUgMlxuICogd2F5cyB0byBtYWtlIHRoZSBsaXN0IHByZXR0eS5cbiAqXG4gKiAxLiBJbmNsdWRlIGJvb3RzdHJhcCAzLnhcbiAqIDIuIFdyaXRlIHlvdXIgb3duXG4gKlxuICogIyMjIFRlbXBsYXRlc1xuICpcbiAqIFRoZSBtYXJrdXAgdGhhdCBpcyBnZW5lcmF0ZWQgb24gaW5zdGFudGlhdGlvbiBpcyB0ZW1wbGF0ZSBkcml2ZW4uIFRoZXNlIHRlbXBsYXRlc1xuICogY2FuIGJlIGNoYW5nZWQgaWYgbmVjZXNzYXJ5LlxuICpcbiAqICoqRmlsdGVyZWRMaXN0LnRlbXBsYXRlcy5saXN0V3JhcHBlcioqXG4gKlxuICogICA8ZGl2IGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1jb250YWluZXInPnt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdElucHV0fX17eyFjb25maWcudGVtcGxhdGVzLmxpc3RIZWFkZXJ9fXt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdEl0ZW1XcmFwcGVyfX08L2Rpdj5cbiAqXG4gKiAqKkZpbHRlcmVkTGlzdC50ZW1wbGF0ZXMubGlzdElucHV0KipcbiAqXG4gKiAgIDxkaXYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWlucHV0LWNvbnRhaW5lcic+PGlucHV0IHR5cGU9J3RleHQnIGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1pbnB1dCBmb3JtLWNvbnRyb2wnPjwvZGl2PlxuICpcbiAqICoqRmlsdGVyZWRMaXN0LnRlbXBsYXRlcy5saXN0SGVhZGVyKipcbiAqXG4gKiAgIDxoZWFkZXIgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWhlYWRlciBwYW5lbC1oZWFkaW5nJz57eyFjb25maWcuZGVmYXVsdHMubGlzdFRpdGxlfX17eyFjb25maWcudGVtcGxhdGVzLmxpc3RTb3J0VG9nZ2xlfX08L2hlYWRlcj5cbiAqXG4gKiAqKkZpbHRlcmVkTGlzdC50ZW1wbGF0ZXMubGlzdEl0ZW1XcmFwcGVyKipcbiAqXG4gKiAgIDxkaXYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWl0ZW1zIGxpc3QtZ3JvdXAnPjwvZGl2PlxuICpcbiAqICoqRmlsdGVyZWRMaXN0LnRlbXBsYXRlcy5saXN0SXRlbSoqXG4gKlxuICogICA8YSBocmVmIGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1pdGVtIGxpc3QtZ3JvdXAtaXRlbScgZGF0YS1jaWQ9J3t7Y2lkfX0nPnt7IWtleX19PC9hPlxuICpcbiAqICoqRmlsdGVyZWRMaXN0LnRlbXBsYXRlcy5saXN0U29ydFRvZ2dsZSoqXG4gKlxuICogICA8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LXNvcnQtdG9nZ2xlIGJ0biBidG4tZGVmYXVsdCBidG4teHMnIHRpdGxlPSdzb3J0Jz48L2J1dHRvbj5cbiAqXG4gKiBAY2xhc3MgRmlsdGVyZWRMaXN0XG4gKiBAcGFyYW0ge2pRdWVyeXxIVE1MRWxlbWVudH0gX2VsIFRoZSBlbGVtZW50IHlvdSB3YW50IHRvIGF0dGFjaCB0aGUgbGlzdCB0b1xuICogQHBhcmFtIHtPYmplY3R9IF9kZWZhdWx0cyBBIGRlZmF1bHRzIG9iamVjdFxuICogQHByb3BlcnR5IHtTdHJpbmd9IF9fY2lkIEFuIGF1dG9tYXRlZCBHVUlEIHVzZWQgaW50ZXJuYWxseVxuICogQHByb3BlcnR5IHtTdHJpbmd9IF9fY29uZmlnIFRoZSBjb25maWdcbiAqIEBwcm9wZXJ0eSB7Qm9vbGVhbn0gX19kZXN0cm95ZWQgV2hldGhlciBvciBub3QgdGhlIG9iamVjdCBoYXMgYmVlbiBkZXN0cm95ZWRcbiAqIEByZXR1cm4ge0ZpbHRlcmVkTGlzdH1cbiAqL1xudmFyIEZpbHRlcmVkTGlzdCA9IGZ1bmN0aW9uICggX2VsLCBfZGVmYXVsdHMgKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjaWQgPSBndWlkLmdlbmVyYXRlKCksXG4gICAgZGVmYXVsdHMsXG4gICAgbG9jYWxDb25maWc7XG5cbiAgc2VsZi4kZWwgPSAkKCBfZWwgKTtcblxuICBpZiAoIHNlbGYuJGVsLmxlbmd0aCA9PT0gMCApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIFwiQW4gaW52YWxpZCBET00gZWxlbWVudCB3YXMgZ2l2ZW5cIiApO1xuICB9XG5cbiAgZGVmYXVsdHMgPSAkLmV4dGVuZCgge30sIGNvbmZpZy5kZWZhdWx0cywgc2VsZi4kZWwuZGF0YSggY29uZmlnLmNsYXNzTmFtZSArIFwiLW9wdGlvbnNcIiApLCBfZGVmYXVsdHMgKTtcblxuICBsb2NhbENvbmZpZyA9ICQuZXh0ZW5kKCB7fSwgY29uZmlnLCB7XG4gICAgZGVmYXVsdHM6IGRlZmF1bHRzXG4gIH0gKTtcblxuICBzZWxmLiRlbC53cmFwKCBcIjxzcGFuIGNsYXNzPSdcIiArIGxvY2FsQ29uZmlnLmNsYXNzTmFtZSArIFwiJyBkYXRhLXNjLWZpbHRlcmVkLWxpc3QtY2lkPSdcIiArIGNpZCArIFwiJz5cIiApO1xuICBzZWxmLiR3cmFwcGVyID0gc2VsZi4kZWwucGFyZW50KCk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIHNlbGYsIHtcbiAgICBcIl9fY2lkXCI6IHtcbiAgICAgIHZhbHVlOiBjaWRcbiAgICB9LFxuICAgIFwiX19jb25maWdcIjoge1xuICAgICAgdmFsdWU6IGxvY2FsQ29uZmlnLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19kZXN0cm95ZWRcIjoge1xuICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19mZXRjaGluZ1wiOiB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2l0ZW1zXCI6IHtcbiAgICAgIHZhbHVlOiB7fSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fbGFiZWxcIjoge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2xhc3RGZXRjaGVkVmFsdWVcIjoge1xuICAgICAgdmFsdWU6IFwiXCIsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX29yaWdpbmFsXCI6IHtcbiAgICAgIHZhbHVlOiB7fSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fc29ydFwiOiB7XG4gICAgICB2YWx1ZTogXCJcIixcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fdmFsdWVcIjoge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJhY3RpdmVJdGVtXCI6IHtcbiAgICAgIGdldDogaGVscGVycy5hY3RpdmVJdGVtR2V0LmJpbmQoIHNlbGYgKSxcbiAgICAgIHNldDogaGVscGVycy5hY3RpdmVJdGVtU2V0LmJpbmQoIHNlbGYgKVxuICAgIH0sXG4gICAgXCJpdGVtc1wiOiB7XG4gICAgICB2YWx1ZTogb2JzZXJ2YWJsZUFycmF5KCBbXSApLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwibGFiZWxcIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLmxhYmVsR2V0LmJpbmQoIHNlbGYgKSxcbiAgICAgIHNldDogaGVscGVycy5sYWJlbFNldC5iaW5kKCBzZWxmIClcbiAgICB9LFxuICAgIFwibGlzdFwiOiB7XG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJsaXN0VmlzaWJsZVwiOiB7XG4gICAgICBnZXQ6IGhlbHBlcnMubGlzdFZpc2libGVHZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLmxpc3RWaXNpYmxlU2V0LmJpbmQoIHNlbGYgKVxuICAgIH0sXG4gICAgXCJyZXN1bHRzXCI6IHtcbiAgICAgIHZhbHVlOiBbXSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcInNvcnRcIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLnNvcnRHZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLnNvcnRTZXQuYmluZCggc2VsZiApXG4gICAgfSxcbiAgICBcInZhbHVlXCI6IHtcbiAgICAgIGdldDogaGVscGVycy52YWx1ZUdldC5iaW5kKCBzZWxmICksXG4gICAgICBzZXQ6IGhlbHBlcnMudmFsdWVTZXQuYmluZCggc2VsZiApXG4gICAgfVxuICB9ICk7XG5cbiAgc2VsZi5saXN0ID0gbmV3IExpc3QoIHNlbGYgKTtcbiAgc2VsZi5fX29yaWdpbmFsLmJ1dHRvblRleHQgPSBzZWxmLiRlbC50ZXh0KCk7XG5cbiAgdmFyIGl0ZW1WYWx1ZSA9IHt9O1xuICBpdGVtVmFsdWVbIHNlbGYuX19jb25maWcuZGVmYXVsdHMuaXRlbUxhYmVsS2V5IF0gPSBzZWxmLl9fY29uZmlnLmRlZmF1bHRzLmJ1dHRvbkxhYmVsO1xuICBzZWxmLnZhbHVlID0gaXRlbVZhbHVlO1xuXG4gIHNlbGYuJGVsXG4gICAgLmFkZENsYXNzKCBzZWxmLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWJ1dHRvblwiIClcbiAgICAuZGF0YSggc2VsZi5fX2NvbmZpZy5uYW1lLCBzZWxmIClcbiAgICAudHJpZ2dlciggc2VsZi5fX2NvbmZpZy5uYW1lICsgXCItcmVhZHlcIiApO1xuXG4gIGlmICggc2VsZi5fX2NvbmZpZy5kZWZhdWx0cy5zb3J0Q29udHJvbFZpc2libGUgIT09IHRydWUgKSB7XG4gICAgc2VsZi4kd3JhcHBlci5hZGRDbGFzcyggc2VsZi5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1zb3J0LWhpZGRlblwiICk7XG4gIH1cblxuICBbIFwicHVzaFwiLCBcInNoaWZ0XCIgXS5mb3JFYWNoKCBmdW5jdGlvbiAoIF9tZXRob2QgKSB7XG4gICAgc2VsZi5pdGVtcy5vbiggX21ldGhvZCwgaGVscGVyc1sgXCJpdGVtXCIgKyBfbWV0aG9kIF0uYmluZCggc2VsZiApICk7XG4gIH0gKTtcblxuICAkKCB3aW5kb3cgKS5vbiggXCJjbGljay5cIiArIHNlbGYuX19jb25maWcubmFtZSwgaGVscGVycy5ib2R5Q2xpY2suYmluZCggc2VsZiApICk7XG5cbiAgc2VsZi5mZXRjaCgpO1xuICBzZWxmLmVtaXQoIHNlbGYuX19jb25maWcubmFtZSArIFwiLXJlYWR5XCIgKTtcbn07XG5cbi8qKlxuICogQWRkcyBhbiBhcnJheSBvZiBvYmplY3RzL2l0ZW1zIGluIGJ1bGtcbiAqXG4gKiAgIG15TGlzdC5kYXRhKFt7XG4gKiAgICAgbmFtZTogXCJkYXZpZFwiXG4gKiAgIH0sIHtcbiAqICAgICBuYW1lOiBcIm1heFwiXG4gKiAgIH1dKTtcbiAqXG4gKiAjIyBBZGQgYSBzaW5nbGUgb2JqZWN0L2l0ZW1cbiAqXG4gKiAgIG15TGlzdC5pdGVtcy5wdXNoKHtcbiAqICAgICBuYW1lOiBcImRhdmlkXCJcbiAqICAgfSk7XG4gKlxuICogIyMgR2V0IHRoZSB2YWx1ZVxuICpcbiAqIFRvIGdldCB0aGUgdmFsdWUgb2YgdGhlIHNlbGVjdGVkIG9iamVjdC9pdGVtIHVzZSB0aGUgYHZhbHVlYCBwcm9wZXJ0eS5cbiAqXG4gKiAgIG15TGlzdC52YWx1ZTtcbiAqXG4gKi9cbkZpbHRlcmVkTGlzdC5wcm90b3R5cGUuZGF0YSA9IGZ1bmN0aW9uICggX2FycmF5T2ZJdGVtcyApIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaXRlbXMgPSBpcy5hcnJheSggX2FycmF5T2ZJdGVtcyApID8gX2FycmF5T2ZJdGVtcyA6IFtdO1xuXG4gIGl0ZW1zLmZvckVhY2goIGZ1bmN0aW9uICggX2l0ZW0gKSB7XG4gICAgaWYgKCBpcy5hbi5vYmplY3QoIF9pdGVtICkgKSB7XG4gICAgICBzZWxmLml0ZW1zLnB1c2goIF9pdGVtICk7XG4gICAgfVxuICB9ICk7XG59O1xuXG4vKipcbiAqIERlc3Ryb3lzIHRoZSBgRmlsdGVyZWRMaXN0YCBhbmQgaW52YWxpZGF0ZXMgdGhlIG9iamVjdC5cbiAqXG4gKiAgIG15TGlzdC5kZXN0cm95KCk7XG4gKlxuICogPiBBbnkgZnVydGhlciBjYWxsZXMgdG8gbWV0aG9kcyBsaWtlIGBkZXN0cm95YCBvciBgZGF0YWAgZXRjIHdpbGwgcmV0dXJuXG4gKiBub3RoaW5nLlxuICovXG5GaWx0ZXJlZExpc3QucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc2VsZi5fX2Rlc3Ryb3llZCA9IHRydWU7XG4gIHNlbGYubGlzdC5kZXN0cm95KCk7XG4gICQoIHdpbmRvdyApLm9mZiggXCIuXCIgKyBzZWxmLl9fY29uZmlnLm5hbWUgKTtcblxuICBzZWxmLiRlbFxuICAgIC50ZXh0KCBzZWxmLl9fb3JpZ2luYWwuYnV0dG9uVGV4dCApXG4gICAgLnVud3JhcCgpXG4gICAgLmRhdGEoIHNlbGYuX19jb25maWcubmFtZSwgbnVsbCApXG4gICAgLnJlbW92ZUNsYXNzKCBzZWxmLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWJ1dHRvblwiICk7XG5cbiAgc2VsZi5lbWl0KCBcImRlc3Ryb3lcIiApO1xufTtcblxuRmlsdGVyZWRMaXN0LnByb3RvdHlwZS5mZXRjaCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdmFsdWUgPSBzZWxmLmxpc3QuJGlucHV0LnZhbCgpO1xuXG4gIHNlbGYuX19sYXN0RmV0Y2hlZFZhbHVlID0gdmFsdWU7XG4gIHNlbGYuZW1pdCggXCJmZXRjaFwiLCBzZWxmLl9fbGFzdEZldGNoZWRWYWx1ZSApO1xufTtcblxuZW1pdHRlciggRmlsdGVyZWRMaXN0LnByb3RvdHlwZSApO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBGaWx0ZXJlZExpc3Q7XG5leHBvcnRzLmRlZmF1bHRzID0gY29uZmlnLmRlZmF1bHRzO1xuZXhwb3J0cy50ZW1wbGF0ZXMgPSBjb25maWcudGVtcGxhdGVzO1xuXG4kKCBmdW5jdGlvbiAoKSB7XG4gICQoIFwiYnV0dG9uW2RhdGEtXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCJdXCIgKS5lYWNoKCBmdW5jdGlvbiAoIF9pLCBfZWwgKSB7XG4gICAgbmV3IEZpbHRlcmVkTGlzdCggX2VsICk7XG4gIH0gKTtcbn0gKTsiLCJ2YXIgaXMgPSByZXF1aXJlKCBcInNjLWlzXCIgKSxcbiAgSXRlbVZhbHVlID0gcmVxdWlyZSggXCIuL2l0ZW0tdmFsdWVcIiApLFxuICBzb3J0VG9nZ2xlT3B0aW9ucyA9IFsgXCJcIiwgXCJkZXNjXCIsIFwiYXNjXCIgXSxcbiAgbWQ1ID0gcmVxdWlyZSggXCJzYy1tZDVcIiApO1xuXG5leHBvcnRzLmFjdGl2ZUl0ZW1HZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBmaWx0ZXIubGlzdC5nZXRBY3RpdmVJdGVtKCk7XG59O1xuXG5leHBvcnRzLmFjdGl2ZUl0ZW1TZXQgPSBmdW5jdGlvbiAoIF92YWx1ZSApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZmlsdGVyLnZhbHVlID0gX3ZhbHVlO1xuICBmaWx0ZXIuZW1pdCggXCJjaGFuZ2VcIiwgX3ZhbHVlICk7XG59O1xuXG5leHBvcnRzLmFjdGl2ZUl0ZW1JbmRleEdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGxpc3QuX19hY3RpdmVJdGVtSW5kZXg7XG59O1xuXG5leHBvcnRzLmFjdGl2ZUl0ZW1JbmRleFNldCA9IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaW5kZXggPSBpcy5hLm51bWJlciggX3ZhbHVlICkgPyBfdmFsdWUgOiAwLFxuICAgIGl0ZW1BY3RpdmVDbGFzc05hbWUgPSBsaXN0LmZpbHRlci5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1pdGVtLWFjdGl2ZVwiLFxuICAgICRpdGVtQ2hpbGRyZW4gPSBsaXN0LiRsaXN0LmNoaWxkcmVuKCksXG4gICAgJGZpcnN0SXRlbSA9ICQoICRpdGVtQ2hpbGRyZW5bIDAgXSApLFxuICAgICRhY3RpdmVJdGVtSW5kZXhCeUNsYXNzID0gbGlzdC4kbGlzdC5maW5kKCBcIi5cIiArIGl0ZW1BY3RpdmVDbGFzc05hbWUgKSxcbiAgICAkYWN0aXZlSXRlbUluZGV4QnlJbmRleCA9ICQoICRpdGVtQ2hpbGRyZW5bIGluZGV4IF0gKSxcbiAgICAkYWN0aXZlSXRlbUluZGV4ID0gJGFjdGl2ZUl0ZW1JbmRleEJ5SW5kZXgubGVuZ3RoID09PSAxID8gJGFjdGl2ZUl0ZW1JbmRleEJ5SW5kZXggOiAkYWN0aXZlSXRlbUluZGV4QnlDbGFzcy5sZW5ndGggPT09IDEgPyAkYWN0aXZlSXRlbUluZGV4QnlDbGFzcyA6ICRmaXJzdEl0ZW07XG5cbiAgJGFjdGl2ZUl0ZW1JbmRleEJ5Q2xhc3MucmVtb3ZlQ2xhc3MoIGl0ZW1BY3RpdmVDbGFzc05hbWUgKTtcbiAgJGFjdGl2ZUl0ZW1JbmRleC5hZGRDbGFzcyggaXRlbUFjdGl2ZUNsYXNzTmFtZSApO1xuICBsaXN0Ll9fYWN0aXZlSXRlbUluZGV4ID0gJGl0ZW1DaGlsZHJlbi5pbmRleCggJGFjdGl2ZUl0ZW1JbmRleCApO1xuXG4gIGlmICggbGlzdC5fX3Zpc2libGUgKSB7XG4gICAgbGlzdC5maWx0ZXIuZW1pdCggXCJpdGVtRm9jdXNcIiApO1xuICB9XG59O1xuXG5leHBvcnRzLmJvZHlDbGljayA9IGZ1bmN0aW9uICggX2V2ZW50ICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgYnV0dG9uQ2xhc3MgPSBcIi5cIiArIGZpbHRlci5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1idXR0b25cIixcbiAgICBjb250YWluZXJDbGFzcyA9IFwiLlwiICsgZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lclwiLFxuICAgICRjbGlja2VkRWxlbWVudCA9ICQoIGlzLm9iamVjdCggX2V2ZW50ICkgJiYgX2V2ZW50LnRhcmdldCA/IF9ldmVudC50YXJnZXQgOiBudWxsICksXG4gICAgJHRoaXNQYXJlbnQgPSAkY2xpY2tlZEVsZW1lbnQuY2xvc2VzdCggXCJbZGF0YS1cIiArIGZpbHRlci5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1jaWQ9XCIgKyBmaWx0ZXIuX19jaWQgKyBcIl1cIiApLFxuICAgIGNsaWNrZWRCdXR0b24gPSAkdGhpc1BhcmVudC5sZW5ndGggPiAwICYmICggJGNsaWNrZWRFbGVtZW50LmlzKCBidXR0b25DbGFzcyApIHx8ICRjbGlja2VkRWxlbWVudC5jbG9zZXN0KCBidXR0b25DbGFzcyApLmxlbmd0aCApID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGNsaWNrZWRMaXN0ID0gJHRoaXNQYXJlbnQubGVuZ3RoID4gMCAmJiAoICRjbGlja2VkRWxlbWVudC5pcyggY29udGFpbmVyQ2xhc3MgKSB8fCAkY2xpY2tlZEVsZW1lbnQuY2xvc2VzdCggY29udGFpbmVyQ2xhc3MgKS5sZW5ndGggKSA/IHRydWUgOiBmYWxzZTtcblxuICBpZiAoIGNsaWNrZWRCdXR0b24gJiYgIWZpbHRlci5saXN0VmlzaWJsZSApIHtcbiAgICBmaWx0ZXIubGlzdFZpc2libGUgPSB0cnVlO1xuICB9IGVsc2UgaWYgKCBmaWx0ZXIubGlzdFZpc2libGUgJiYgIWNsaWNrZWRMaXN0ICkge1xuICAgIGZpbHRlci5saXN0VmlzaWJsZSA9IGZhbHNlO1xuICB9XG59O1xuXG5leHBvcnRzLmZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbiAoIF9ldmVudCApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGtleUNvZGUgPSBpcy5vYmplY3QoIF9ldmVudCApICYmIGlzLm51bWJlciggX2V2ZW50LmtleUNvZGUgKSA/IF9ldmVudC5rZXlDb2RlIDogLTEsXG4gICAgdmFsID0gbGlzdC4kaW5wdXQudmFsKCk7XG5cbiAgc3dpdGNoICgga2V5Q29kZSApIHtcbiAgY2FzZSAyNzogLy8gZXNjYXBlXG4gICAgbGlzdC5jbG9zZSgpO1xuICAgIGJyZWFrO1xuICBjYXNlIDEzOiAvLyBlbnRlclxuICAgIGxpc3QuY2xvc2UoKTtcbiAgICBsaXN0LmZpbHRlci5hY3RpdmVJdGVtID0gbGlzdC5nZXRBY3RpdmVJdGVtKCk7XG4gICAgYnJlYWs7XG4gIGNhc2UgMzg6IC8vIHVwXG4gICAgbGlzdC5hY3RpdmVJdGVtSW5kZXgtLTtcbiAgICBicmVhaztcbiAgY2FzZSA0MDogLy8gZG93blxuICAgIGxpc3QuYWN0aXZlSXRlbUluZGV4Kys7XG4gICAgYnJlYWs7XG4gIGRlZmF1bHQ6XG4gICAgaWYgKCBrZXlDb2RlID49IDAgKSB7XG4gICAgICBsaXN0LmZpbHRlci5lbWl0KCBcImZpbHRlckNoYW5nZWRcIiwgdmFsICk7XG4gICAgICBsaXN0LmZpbHRlci5mZXRjaCgpO1xuICAgIH1cbiAgICBicmVhaztcbiAgfVxuXG59O1xuXG5leHBvcnRzLmluZGV4T2YgPSBmdW5jdGlvbiAoIF9hcnJheSwgX3ZhbHVlICkge1xuICB2YXIgYXJyYXkgPSBpcy5hcnJheSggX2FycmF5ICkgPyBfYXJyYXkgOiBbXSxcbiAgICBpbmRleCA9IC0xO1xuXG4gIGFycmF5LmZvckVhY2goIGZ1bmN0aW9uICggX3ZhbCwgX2kgKSB7XG4gICAgaWYgKCBpbmRleCA9PT0gLTEgJiYgX3ZhbHVlID09PSBfdmFsICkge1xuICAgICAgaW5kZXggPSBfaTtcbiAgICB9XG4gIH0gKTtcblxuICByZXR1cm4gaW5kZXg7XG59O1xuXG5leHBvcnRzLndpbmRvd0tleVVwID0gZnVuY3Rpb24gKCBfZXZlbnQgKSB7XG4gIHZhciBsaXN0ID0gdGhpcztcblxuICBpZiAoIGxpc3QuZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBrZXlDb2RlID0gaXMub2JqZWN0KCBfZXZlbnQgKSAmJiBpcy5udW1iZXIoIF9ldmVudC5rZXlDb2RlICkgPyBfZXZlbnQua2V5Q29kZSA6IC0xO1xuXG4gIHN3aXRjaCAoIGtleUNvZGUgKSB7XG4gIGNhc2UgMjc6IC8vIGVzY2FwZVxuICAgIGxpc3QuY2xvc2UoKTtcbiAgICBicmVhaztcbiAgfVxufTtcblxuZXhwb3J0cy5pdGVtQ2xpY2sgPSBmdW5jdGlvbiAoIF9ldmVudCApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgX2V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgdmFyICRpdGVtID0gJCggX2V2ZW50LmN1cnJlbnRUYXJnZXQgKTtcblxuICBsaXN0LmFjdGl2ZUl0ZW1JbmRleCA9ICRpdGVtLnBhcmVudCgpLmNoaWxkcmVuKCkuaW5kZXgoICRpdGVtICk7XG4gIGxpc3QuZmlsdGVyLmFjdGl2ZUl0ZW0gPSBsaXN0LmdldEFjdGl2ZUl0ZW0oKTtcbiAgbGlzdC5jbG9zZSgpO1xufTtcblxuZXhwb3J0cy5pdGVtcHVzaCA9IGZ1bmN0aW9uICggX2l0ZW0gKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGlmICggIV9pdGVtLmhhc093blByb3BlcnR5KCBcIl9fY2lkXCIgKSApIHtcbiAgICB2YXIgaXRlbUhhc2ggPSBtZDUoIF9pdGVtICk7XG5cbiAgICBpZiAoICFmaWx0ZXIuX19pdGVtc1sgaXRlbUhhc2ggXSApIHtcbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggX2l0ZW0sIFwiX19jaWRcIiwge1xuICAgICAgICB2YWx1ZTogaXRlbUhhc2hcbiAgICAgIH0gKTtcbiAgICAgIGZpbHRlci5fX2l0ZW1zWyBpdGVtSGFzaCBdID0gX2l0ZW07XG4gICAgICBmaWx0ZXIuaXRlbXMuX19wdXNoKCBfaXRlbSApO1xuICAgICAgZmlsdGVyLmxpc3QucmVkcmF3KCk7XG4gICAgfVxuICB9XG5cbn07XG5cbmV4cG9ydHMuaXRlbXNoaWZ0ID0gZnVuY3Rpb24gKCBfaXRlbSApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGl0ZW1IYXNoID0gbWQ1KCBfaXRlbSApO1xuICBkZWxldGUgZmlsdGVyLl9faXRlbXNbIGl0ZW1IYXNoIF07XG4gIGZpbHRlci5pdGVtcy5fX3NoaWZ0KCk7XG59O1xuXG5leHBvcnRzLmxhYmVsR2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gZmlsdGVyLl9fbGFiZWw7XG59O1xuXG5leHBvcnRzLmxhYmVsU2V0ID0gZnVuY3Rpb24gKCBfbGFiZWwgKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZpbHRlci5fX2xhYmVsID0gX2xhYmVsIHx8IGZpbHRlci5fX2NvbmZpZy5kZWZhdWx0cy5kZWZhdWx0QnV0dG9uTGFiZWw7XG4gIGZpbHRlci4kZWwudGV4dCggZmlsdGVyLl9fbGFiZWwgKTtcbiAgcmV0dXJuIGZpbHRlci5fX2xhYmVsO1xufTtcblxuZXhwb3J0cy5saXN0VmlzaWJsZUdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlci5saXN0Ll9fdmlzaWJsZTtcbn07XG5cbmV4cG9ydHMubGlzdFZpc2libGVTZXQgPSBmdW5jdGlvbiAoIF92YWx1ZSApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHZpc2libGUgPSBfdmFsdWUgPT09IHRydWUgfHwgZmFsc2U7XG4gIHJldHVybiB2aXNpYmxlID8gZmlsdGVyLmxpc3Qub3BlbigpIDogZmlsdGVyLmxpc3QuY2xvc2UoKTtcbn07XG5cbmV4cG9ydHMucHV0Rm9jdXNzZWRJdGVtSW5WaWV3ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxpc3RIZWlnaHQgPSBsaXN0LiRsaXN0LmhlaWdodCgpLFxuICAgICAgZm9jdXNzZWRJdGVtID0gbGlzdC4kbGlzdC5maW5kKCBcIi5cIiArIGxpc3QuZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWl0ZW0tYWN0aXZlXCIgKTtcblxuICAgIGlmICggZm9jdXNzZWRJdGVtLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgaXRlbUhlaWdodCA9IGZvY3Vzc2VkSXRlbS5vdXRlckhlaWdodCgpLFxuICAgICAgaXRlbVRvcCA9IGZvY3Vzc2VkSXRlbS5wb3NpdGlvbigpLnRvcCwgLy8gVE9ETzogb2Zmc2V0IHRvcCBjb3VsZCBiZSBnb29kIGVub3VnaCBoZXJlXG4gICAgICBpdGVtQm90dG9tID0gaXRlbVRvcCArIGl0ZW1IZWlnaHQ7XG5cbiAgICBpZiAoIGl0ZW1Ub3AgPCAwIHx8IGl0ZW1Cb3R0b20gPiBsaXN0SGVpZ2h0ICkge1xuICAgICAgZm9jdXNzZWRJdGVtWyAwIF0uc2Nyb2xsSW50b1ZpZXcoIGl0ZW1Ub3AgPCAwICk7XG4gICAgfVxuXG4gIH0sIDEwICk7XG59O1xuXG5leHBvcnRzLnNvcnRHZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBmaWx0ZXIuX19zb3J0O1xufTtcblxuZXhwb3J0cy5zb3J0U2V0ID0gZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzLFxuICAgIHNvcnRPcHRpb247XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHNvcnRDbGFzc05hbWUgPSBmaWx0ZXIuX19jb25maWcuY2xhc3NOYW1lICsgXCItc29ydC1cIixcbiAgICBzb3J0Q2xhc3NOYW1lcyA9IHNvcnRUb2dnbGVPcHRpb25zLmpvaW4oIFwiIFwiICsgc29ydENsYXNzTmFtZSApLnRyaW0oKTtcblxuICBzb3J0VG9nZ2xlT3B0aW9ucy5mb3JFYWNoKCBmdW5jdGlvbiAoIF9zb3J0T3B0aW9uICkge1xuICAgIGlmICggIXNvcnRPcHRpb24gJiYgX3NvcnRPcHRpb24gPT09IF92YWx1ZSApIHtcbiAgICAgIHNvcnRPcHRpb24gPSBfdmFsdWU7XG4gICAgfVxuICB9ICk7XG5cbiAgZmlsdGVyLl9fc29ydCA9IHNvcnRPcHRpb24gfHwgc29ydFRvZ2dsZU9wdGlvbnNbIDAgXTtcbiAgZmlsdGVyLmxpc3QucmVkcmF3KCk7XG4gIGZpbHRlci4kd3JhcHBlci5yZW1vdmVDbGFzcyggc29ydENsYXNzTmFtZXMgKS5hZGRDbGFzcyggZmlsdGVyLl9fc29ydCA/IHNvcnRDbGFzc05hbWUgKyBmaWx0ZXIuX19zb3J0IDogXCJcIiApO1xuICBmaWx0ZXIuZW1pdCggXCJzb3J0XCIgKTtcbiAgcmV0dXJuIGZpbHRlci5fX3NvcnQ7XG59O1xuXG5leHBvcnRzLnNvcnRUb2dnbGVDbGlja2VkID0gZnVuY3Rpb24gKCBfZXZlbnQgKSB7XG4gIHZhciBsaXN0ID0gdGhpcztcblxuICBpZiAoIGxpc3QuZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBmaWx0ZXIgPSBsaXN0LmZpbHRlcixcbiAgICBjdXJyZW50U29ydCA9IGZpbHRlci5zb3J0LFxuICAgIGluZGV4ID0gZXhwb3J0cy5pbmRleE9mKCBzb3J0VG9nZ2xlT3B0aW9ucywgY3VycmVudFNvcnQgKSxcbiAgICBuZXh0SW5kZXggPSBpbmRleCArIDEsXG4gICAgbmV4dFNvcnQgPSBzb3J0VG9nZ2xlT3B0aW9uc1sgbmV4dEluZGV4IF0gPT09IHVuZGVmaW5lZCA/IHNvcnRUb2dnbGVPcHRpb25zWyAwIF0gOiBzb3J0VG9nZ2xlT3B0aW9uc1sgbmV4dEluZGV4IF07XG5cbiAgZmlsdGVyLnNvcnQgPSBuZXh0U29ydDtcbn07XG5cbmV4cG9ydHMudmFsdWVHZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBmaWx0ZXIuX192YWx1ZS52YWx1ZTtcbn07XG5cbmV4cG9ydHMudmFsdWVTZXQgPSBmdW5jdGlvbiAoIF92YWx1ZSApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZmlsdGVyLl9fdmFsdWUgPSBuZXcgSXRlbVZhbHVlKCBmaWx0ZXIuX19jb25maWcuZGVmYXVsdHMuaXRlbUxhYmVsS2V5LCBfdmFsdWUgKTtcbiAgZmlsdGVyLmxhYmVsID0gZmlsdGVyLl9fdmFsdWUua2V5O1xuICBmaWx0ZXIuJGVsLnRleHQoIGZpbHRlci5sYWJlbCApO1xuICByZXR1cm4gZmlsdGVyLl9fdmFsdWU7XG59OyIsInZhciBpcyA9IHJlcXVpcmUoIFwic2MtaXNcIiApO1xuXG52YXIgSXRlbVZhbHVlID0gZnVuY3Rpb24gKCBfa2V5LCBfdmFsdWUgKSB7XG4gIHZhciB2YWx1ZSA9IHt9O1xuICB2YWx1ZS5rZXkgPSBpcy5vYmplY3QoIF92YWx1ZSApICYmIGlzLnN0cmluZyggX3ZhbHVlWyBfa2V5IF0gKSA/IF92YWx1ZVsgX2tleSBdIDogXCJcIjtcbiAgdmFsdWUudmFsdWUgPSBfdmFsdWU7XG4gIHJldHVybiB2YWx1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSXRlbVZhbHVlOyIsInZhciBoZWxwZXJzID0gcmVxdWlyZSggXCIuL2hlbHBlcnNcIiApLFxuICBmdXp6eSA9IHJlcXVpcmUoIFwiZnV6emFsZHJpblwiICksXG4gIG1lcmdlID0gcmVxdWlyZSggXCJzYy1tZXJnZVwiICksXG4gIG1pbnN0YWNoZSA9IHJlcXVpcmUoIFwibWluc3RhY2hlXCIgKSxcbiAgZGVib3VuY2UgPSByZXF1aXJlKCBcImRlYm91bmNlXCIgKTtcblxudmFyIExpc3QgPSBmdW5jdGlvbiAoIF9maWx0ZXIgKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjb25maWc7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIHNlbGYsIHtcbiAgICBcIl9fYWN0aXZlSXRlbUluZGV4XCI6IHtcbiAgICAgIHZhbHVlOiAwLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19kZXN0cm95ZWRcIjoge1xuICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX190ZW1wbGF0ZXNcIjoge1xuICAgICAgdmFsdWU6IHt9XG4gICAgfSxcbiAgICBcIl9fdmlzaWJsZVwiOiB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJhY3RpdmVJdGVtSW5kZXhcIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLmFjdGl2ZUl0ZW1JbmRleEdldC5iaW5kKCBzZWxmICksXG4gICAgICBzZXQ6IGhlbHBlcnMuYWN0aXZlSXRlbUluZGV4U2V0LmJpbmQoIHNlbGYgKVxuICAgIH0sXG4gICAgXCJmaWx0ZXJcIjoge1xuICAgICAgdmFsdWU6IF9maWx0ZXJcbiAgICB9XG4gIH0gKTtcblxuICBjb25maWcgPSBzZWxmLmZpbHRlci5fX2NvbmZpZztcblxuICBPYmplY3Qua2V5cyggY29uZmlnLnRlbXBsYXRlcyApLmZvckVhY2goIGZ1bmN0aW9uICggX3RlbXBsYXRlTmFtZSApIHtcbiAgICBzZWxmLl9fdGVtcGxhdGVzWyBfdGVtcGxhdGVOYW1lIF0gPSBtaW5zdGFjaGUoIGNvbmZpZy50ZW1wbGF0ZXNbIF90ZW1wbGF0ZU5hbWUgXSwge1xuICAgICAgY29uZmlnOiBjb25maWcsXG4gICAgICBjaWQ6IFwiXCIsXG4gICAgICBrZXk6IFwiXCJcbiAgICB9ICk7XG4gIH0gKTtcblxuICBzZWxmLiRlbCA9ICQoIG1pbnN0YWNoZSggc2VsZi5fX3RlbXBsYXRlcy5saXN0V3JhcHBlciwge1xuICAgIGNvbmZpZzogbWVyZ2UoIGNvbmZpZywge1xuICAgICAgdGVtcGxhdGVzOiBzZWxmLl9fdGVtcGxhdGVzXG4gICAgfSApXG4gIH0gKSApO1xuXG4gIHNlbGYuJGVsLndpZHRoKCBjb25maWcuZGVmYXVsdHMubWluV2lkdGggKTtcblxuICBzZWxmLiRpbnB1dCA9IHNlbGYuJGVsLmZpbmQoIFwiLlwiICsgY29uZmlnLmNsYXNzTmFtZSArIFwiLWlucHV0XCIgKTtcbiAgc2VsZi4kaGVhZGVyID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaGVhZGVyXCIgKTtcbiAgc2VsZi4kbGlzdCA9IHNlbGYuJGVsLmZpbmQoIFwiLlwiICsgY29uZmlnLmNsYXNzTmFtZSArIFwiLWl0ZW1zXCIgKTtcbiAgc2VsZi4kc29ydFRvZ2dsZSA9IHNlbGYuJGVsLmZpbmQoIFwiLlwiICsgY29uZmlnLmNsYXNzTmFtZSArIFwiLXNvcnQtdG9nZ2xlXCIgKTtcblxuICBzZWxmLiRpbnB1dC5vbiggXCJjaGFuZ2UuXCIgKyBjb25maWcubmFtZSArIFwiIGtleWRvd24uXCIgKyBjb25maWcubmFtZSwgaGVscGVycy5maWx0ZXJDaGFuZ2VkLmJpbmQoIHNlbGYgKSApO1xuICBzZWxmLiRzb3J0VG9nZ2xlLm9uKCBcImNsaWNrLlwiICsgY29uZmlnLm5hbWUsIGhlbHBlcnMuc29ydFRvZ2dsZUNsaWNrZWQuYmluZCggc2VsZiApICk7XG4gIHNlbGYuZmlsdGVyLm9uKCBcImZpbHRlckNoYW5nZWRcIiwgc2VsZi5yZWRyYXcuYmluZCggc2VsZiApICk7XG4gIHNlbGYuZmlsdGVyLm9uKCBcIml0ZW1Gb2N1c1wiLCBoZWxwZXJzLnB1dEZvY3Vzc2VkSXRlbUluVmlldy5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5maWx0ZXIuJGVsLmFmdGVyKCBzZWxmLiRlbCApO1xuXG4gIHNlbGYuZmlsdGVyLm9uY2UoIGNvbmZpZy5uYW1lICsgXCItcmVhZHlcIiwgZnVuY3Rpb24gKCkge1xuICAgIGlmICggY29uZmlnLmRlZmF1bHRzLnNvcnQgKSB7XG4gICAgICBzZWxmLmZpbHRlci5zb3J0ID0gY29uZmlnLmRlZmF1bHRzLnNvcnQ7XG4gICAgfVxuICB9ICk7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZWxmLl9fdmlzaWJsZSA9IGZhbHNlO1xuICBzZWxmLiRlbC5yZW1vdmVDbGFzcyggY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lci12aXNpYmxlXCIgKTtcbiAgc2VsZi5maWx0ZXIuZW1pdCggXCJjbG9zZVwiICk7XG4gICQoIHdpbmRvdyApLm9mZiggXCJrZXl1cC5cIiArIGNvbmZpZy5uYW1lICk7XG4gIHNlbGYuJGVsLm9mZiggXCJjbGljay5cIiArIGNvbmZpZy5uYW1lICk7XG4gIHJldHVybiBzZWxmLl9fdmlzaWJsZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjb25maWcgPSBzZWxmLmZpbHRlci5fX2NvbmZpZztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc2VsZi5maWx0ZXIuX19kZXN0cm95ZWQgPSBzZWxmLl9fZGVzdHJveWVkID0gdHJ1ZTtcbiAgJCggd2luZG93ICkub2ZmKCBcIi5cIiArIGNvbmZpZy5uYW1lICk7XG4gIHNlbGYuJGlucHV0Lm9mZiggXCIuXCIgKyBjb25maWcubmFtZSApO1xuICBzZWxmLiRlbC5vZmYoIFwiLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgc2VsZi4kc29ydFRvZ2dsZS5vZmYoIFwiLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgc2VsZi5maWx0ZXIub2ZmKCBcImZpbHRlckNoYW5nZWRcIiApO1xuICBzZWxmLmZpbHRlci5vZmYoIFwiaXRlbUZvY3VzXCIgKTtcbiAgc2VsZi4kZWwucmVtb3ZlKCk7XG5cbn07XG5cbkxpc3QucHJvdG90eXBlLmdldEFjdGl2ZUl0ZW0gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjb25maWcgPSBzZWxmLmZpbHRlci5fX2NvbmZpZztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyICRzZWxlY3RlZEl0ZW0gPSBzZWxmLiRsaXN0LmZpbmQoIFwiLlwiICsgY29uZmlnLmNsYXNzTmFtZSArIFwiLWl0ZW0tYWN0aXZlXCIgKSxcbiAgICBzZWxlY3RlZEl0ZW1IYXNoID0gJHNlbGVjdGVkSXRlbS5kYXRhKCBcImNpZFwiICksXG4gICAgc2VsZWN0ZWRJdGVtID0gc2VsZi5maWx0ZXIuX19pdGVtc1sgc2VsZWN0ZWRJdGVtSGFzaCBdO1xuXG4gIHJldHVybiBzZWxlY3RlZEl0ZW07XG59O1xuXG5MaXN0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgY29uZmlnID0gc2VsZi5maWx0ZXIuX19jb25maWc7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNlbGYuX192aXNpYmxlID0gdHJ1ZTtcbiAgc2VsZi5maWx0ZXIuZW1pdCggXCJvcGVuXCIgKTtcbiAgJCggd2luZG93ICkub24oIFwia2V5dXAuXCIgKyBjb25maWcubmFtZSwgaGVscGVycy53aW5kb3dLZXlVcC5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi4kZWwub24oIFwiY2xpY2suXCIgKyBjb25maWcubmFtZSwgXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaXRlbVwiLCBoZWxwZXJzLml0ZW1DbGljay5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5yZWRyYXcoKTtcblxuICBzZWxmLmZpbHRlci5vbmNlKCBcInJlZHJhd1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi4kaW5wdXQuZm9jdXMoKS5zZWxlY3QoKTtcbiAgfSApO1xuXG4gIHJldHVybiBzZWxmLl9fdmlzaWJsZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLnJlZHJhdyA9IGRlYm91bmNlKCBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjb25maWcgPSBzZWxmLmZpbHRlci5fX2NvbmZpZztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGZpbHRlckJ5ID0gc2VsZi4kaW5wdXQudmFsKCkgfHwgXCJcIixcbiAgICBpdGVtc01hcmt1cCA9IFwiXCIsXG4gICAgcmVzdWx0cztcblxuICBpZiAoIGNvbmZpZy5kZWZhdWx0cy5mdXp6eSApIHtcbiAgICByZXN1bHRzID0gZnV6enkuZmlsdGVyKCBzZWxmLmZpbHRlci5pdGVtcywgZmlsdGVyQnksIHtcbiAgICAgIGtleTogY29uZmlnLmRlZmF1bHRzLml0ZW1MYWJlbEtleSxcbiAgICAgIG1heFJlc3VsdHM6IGNvbmZpZy5kZWZhdWx0cy5tYXhOdW1JdGVtc1xuICAgIH0gKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgcnggPSBuZXcgUmVnRXhwKCBcIlxcXFxiXCIgKyBmaWx0ZXJCeSwgXCJpXCIgKTtcbiAgICByZXN1bHRzID0gW107XG4gICAgc2VsZi5maWx0ZXIuaXRlbXMuZm9yRWFjaCggZnVuY3Rpb24gKCBfaXRlbSwgX2kgKSB7XG4gICAgICBpZiAoIF9pIDwgY29uZmlnLmRlZmF1bHRzLm1heE51bUl0ZW1zICkge1xuICAgICAgICBpZiAoIHJ4LnRlc3QoIF9pdGVtWyBjb25maWcuZGVmYXVsdHMuaXRlbUxhYmVsS2V5IF0gKSApIHtcbiAgICAgICAgICByZXN1bHRzLnB1c2goIF9pdGVtICk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG4gIH1cblxuXG4gIGlmICggc2VsZi5maWx0ZXIuX19zb3J0ICkge1xuICAgIHJlc3VsdHMuc29ydCggZnVuY3Rpb24gKCBhLCBiICkge1xuICAgICAgdmFyIG9yZGVyID0gc2VsZi5maWx0ZXIuX19zb3J0ID09PSBcImRlc2NcIiA/IGEubmFtZSA+IGIubmFtZSA6IGEubmFtZSA8IGIubmFtZTtcbiAgICAgIHJldHVybiBvcmRlciA/IDEgOiAtMTtcbiAgICB9ICk7XG4gIH1cblxuICBzZWxmLmZpbHRlci5yZXN1bHRzID0gcmVzdWx0cztcblxuICBzZWxmLmZpbHRlci5lbWl0KCBcImZpbHRlcmVkXCIgKTtcblxuICByZXN1bHRzLmZvckVhY2goIGZ1bmN0aW9uICggX2l0ZW0gKSB7XG4gICAgX2l0ZW0ua2V5ID0gX2l0ZW1bIGNvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXkgXTtcbiAgICBpdGVtc01hcmt1cCArPSBtaW5zdGFjaGUoIGNvbmZpZy50ZW1wbGF0ZXMubGlzdEl0ZW0sIG1lcmdlKCB7XG4gICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgIGNpZDogX2l0ZW0uX19jaWRcbiAgICB9LCBfaXRlbSApICk7XG4gIH0gKTtcblxuICBzZWxmLiRsaXN0LmVtcHR5KCkuaHRtbCggaXRlbXNNYXJrdXAgKTtcbiAgc2VsZi5hY3RpdmVJdGVtSW5kZXggPSBzZWxmLmFjdGl2ZUl0ZW1JbmRleDtcblxuICBpZiAoIHNlbGYuX192aXNpYmxlICkge1xuICAgIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcblxuICAgICAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciB2aXNpYmxlSXRlbXNIZWlnaHQgPSAwO1xuICAgICAgc2VsZi4kZWwuYWRkQ2xhc3MoIGNvbmZpZy5jbGFzc05hbWUgKyBcIi1jb250YWluZXItaW52aXNpYmxlXCIgKTtcblxuICAgICAgc2VsZi4kbGlzdC5maW5kKCBcIj46bHQoXCIgKyBjb25maWcuZGVmYXVsdHMubWF4TnVtSXRlbXNWaXNpYmxlICsgXCIpXCIgKS5lYWNoKCBmdW5jdGlvbiAoIF9pLCBfZWwgKSB7XG4gICAgICAgIHZpc2libGVJdGVtc0hlaWdodCArPSAkKCBfZWwgKS5vdXRlckhlaWdodCgpO1xuICAgICAgfSApO1xuXG4gICAgICBzZWxmLiRsaXN0LmhlaWdodCggdmlzaWJsZUl0ZW1zSGVpZ2h0ICk7XG4gICAgICBzZWxmLiRlbC5hZGRDbGFzcyggY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lci12aXNpYmxlXCIgKS5yZW1vdmVDbGFzcyggY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lci1pbnZpc2libGVcIiApO1xuICAgICAgc2VsZi5maWx0ZXIuZW1pdCggXCJyZWRyYXdcIiApO1xuICAgIH0sIDAgKTtcblxuICB9XG5cbn0sIDEwICk7XG5cbm1vZHVsZS5leHBvcnRzID0gTGlzdDsiXX0=
(20)
});
