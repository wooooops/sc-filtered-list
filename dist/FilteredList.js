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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9kZWJvdW5jZS9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZW1pdHRlci1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL2Z1enphbGRyaW4vbGliL2ZpbHRlci5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZnV6emFsZHJpbi9saWIvZnV6emFsZHJpbi5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZnV6emFsZHJpbi92ZW5kb3Ivc3RyaW5nc2NvcmUuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL21pbnN0YWNoZS9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtZ3VpZC9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvZW1wdHkuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvZ3VpZC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvaXNlcy9udWxsb3J1bmRlZmluZWQuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvdHlwZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvdHlwZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtbWQ1L2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9zYy1tZDUvbm9kZV9tb2R1bGVzL21kNS1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLW1lcmdlL2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9zYy1tZXJnZS9ub2RlX21vZHVsZXMvdHlwZS1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NnLW9ic2VydmFibGUtYXJyYXkvc3JjL2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2NvbmZpZy5qc29uIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2Zha2VfOWRkYjdlN2IuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvc3JjL3NjcmlwdHMvaGVscGVycy5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9zcmMvc2NyaXB0cy9pdGVtLXZhbHVlLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2xpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3VkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBEZWJvdW5jZXMgYSBmdW5jdGlvbiBieSB0aGUgZ2l2ZW4gdGhyZXNob2xkLlxuICpcbiAqIEBzZWUgaHR0cDovL3Vuc2NyaXB0YWJsZS5jb20vMjAwOS8wMy8yMC9kZWJvdW5jaW5nLWphdmFzY3JpcHQtbWV0aG9kcy9cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmN0aW9uIHRvIHdyYXBcbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0IGluIG1zIChgMTAwYClcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gd2hldGhlciB0byBleGVjdXRlIGF0IHRoZSBiZWdpbm5pbmcgKGBmYWxzZWApXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZGVib3VuY2UoZnVuYywgdGhyZXNob2xkLCBleGVjQXNhcCl7XG4gIHZhciB0aW1lb3V0O1xuXG4gIHJldHVybiBmdW5jdGlvbiBkZWJvdW5jZWQoKXtcbiAgICB2YXIgb2JqID0gdGhpcywgYXJncyA9IGFyZ3VtZW50cztcblxuICAgIGZ1bmN0aW9uIGRlbGF5ZWQgKCkge1xuICAgICAgaWYgKCFleGVjQXNhcCkge1xuICAgICAgICBmdW5jLmFwcGx5KG9iaiwgYXJncyk7XG4gICAgICB9XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAodGltZW91dCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgIH0gZWxzZSBpZiAoZXhlY0FzYXApIHtcbiAgICAgIGZ1bmMuYXBwbHkob2JqLCBhcmdzKTtcbiAgICB9XG5cbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChkZWxheWVkLCB0aHJlc2hvbGQgfHwgMTAwKTtcbiAgfTtcbn07XG4iLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBiYXNlbmFtZVNjb3JlLCBzdHJpbmdTY29yZTtcblxuICBzdHJpbmdTY29yZSA9IHJlcXVpcmUoJy4uL3ZlbmRvci9zdHJpbmdzY29yZScpO1xuXG4gIGJhc2VuYW1lU2NvcmUgPSBmdW5jdGlvbihzdHJpbmcsIHF1ZXJ5LCBzY29yZSkge1xuICAgIHZhciBiYXNlLCBkZXB0aCwgaW5kZXgsIGxhc3RDaGFyYWN0ZXIsIHNlZ21lbnRDb3VudCwgc2xhc2hDb3VudDtcbiAgICBpbmRleCA9IHN0cmluZy5sZW5ndGggLSAxO1xuICAgIHdoaWxlIChzdHJpbmdbaW5kZXhdID09PSAnLycpIHtcbiAgICAgIGluZGV4LS07XG4gICAgfVxuICAgIHNsYXNoQ291bnQgPSAwO1xuICAgIGxhc3RDaGFyYWN0ZXIgPSBpbmRleDtcbiAgICBiYXNlID0gbnVsbDtcbiAgICB3aGlsZSAoaW5kZXggPj0gMCkge1xuICAgICAgaWYgKHN0cmluZ1tpbmRleF0gPT09ICcvJykge1xuICAgICAgICBzbGFzaENvdW50Kys7XG4gICAgICAgIGlmIChiYXNlID09IG51bGwpIHtcbiAgICAgICAgICBiYXNlID0gc3RyaW5nLnN1YnN0cmluZyhpbmRleCArIDEsIGxhc3RDaGFyYWN0ZXIgKyAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICBpZiAobGFzdENoYXJhY3RlciA8IHN0cmluZy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgaWYgKGJhc2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgYmFzZSA9IHN0cmluZy5zdWJzdHJpbmcoMCwgbGFzdENoYXJhY3RlciArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoYmFzZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlID0gc3RyaW5nO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaW5kZXgtLTtcbiAgICB9XG4gICAgaWYgKGJhc2UgPT09IHN0cmluZykge1xuICAgICAgc2NvcmUgKj0gMjtcbiAgICB9IGVsc2UgaWYgKGJhc2UpIHtcbiAgICAgIHNjb3JlICs9IHN0cmluZ1Njb3JlKGJhc2UsIHF1ZXJ5KTtcbiAgICB9XG4gICAgc2VnbWVudENvdW50ID0gc2xhc2hDb3VudCArIDE7XG4gICAgZGVwdGggPSBNYXRoLm1heCgxLCAxMCAtIHNlZ21lbnRDb3VudCk7XG4gICAgc2NvcmUgKj0gZGVwdGggKiAwLjAxO1xuICAgIHJldHVybiBzY29yZTtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNhbmRpZGF0ZXMsIHF1ZXJ5LCBfYXJnKSB7XG4gICAgdmFyIGNhbmRpZGF0ZSwga2V5LCBtYXhSZXN1bHRzLCBxdWVyeUhhc05vU2xhc2hlcywgc2NvcmUsIHNjb3JlZENhbmRpZGF0ZSwgc2NvcmVkQ2FuZGlkYXRlcywgc3RyaW5nLCBfaSwgX2xlbiwgX3JlZjtcbiAgICBfcmVmID0gX2FyZyAhPSBudWxsID8gX2FyZyA6IHt9LCBrZXkgPSBfcmVmLmtleSwgbWF4UmVzdWx0cyA9IF9yZWYubWF4UmVzdWx0cztcbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHF1ZXJ5SGFzTm9TbGFzaGVzID0gcXVlcnkuaW5kZXhPZignLycpID09PSAtMTtcbiAgICAgIHNjb3JlZENhbmRpZGF0ZXMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gY2FuZGlkYXRlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBjYW5kaWRhdGUgPSBjYW5kaWRhdGVzW19pXTtcbiAgICAgICAgc3RyaW5nID0ga2V5ICE9IG51bGwgPyBjYW5kaWRhdGVba2V5XSA6IGNhbmRpZGF0ZTtcbiAgICAgICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzY29yZSA9IHN0cmluZ1Njb3JlKHN0cmluZywgcXVlcnkpO1xuICAgICAgICBpZiAocXVlcnlIYXNOb1NsYXNoZXMpIHtcbiAgICAgICAgICBzY29yZSA9IGJhc2VuYW1lU2NvcmUoc3RyaW5nLCBxdWVyeSwgc2NvcmUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgICBzY29yZWRDYW5kaWRhdGVzLnB1c2goe1xuICAgICAgICAgICAgY2FuZGlkYXRlOiBjYW5kaWRhdGUsXG4gICAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2NvcmVkQ2FuZGlkYXRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGIuc2NvcmUgLSBhLnNjb3JlO1xuICAgICAgfSk7XG4gICAgICBjYW5kaWRhdGVzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX2osIF9sZW4xLCBfcmVzdWx0cztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gc2NvcmVkQ2FuZGlkYXRlcy5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICBzY29yZWRDYW5kaWRhdGUgPSBzY29yZWRDYW5kaWRhdGVzW19qXTtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKHNjb3JlZENhbmRpZGF0ZS5jYW5kaWRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH0pKCk7XG4gICAgfVxuICAgIGlmIChtYXhSZXN1bHRzICE9IG51bGwpIHtcbiAgICAgIGNhbmRpZGF0ZXMgPSBjYW5kaWRhdGVzLnNsaWNlKDAsIG1heFJlc3VsdHMpO1xuICAgIH1cbiAgICByZXR1cm4gY2FuZGlkYXRlcztcbiAgfTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIHN0cmluZ1Njb3JlO1xuXG4gIHN0cmluZ1Njb3JlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3N0cmluZ3Njb3JlJyk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZmlsdGVyOiByZXF1aXJlKCcuL2ZpbHRlcicpLFxuICAgIHNjb3JlOiBmdW5jdGlvbihzdHJpbmcsIHF1ZXJ5KSB7XG4gICAgICBpZiAoIXN0cmluZykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIGlmICghcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyaW5nU2NvcmUoc3RyaW5nLCBxdWVyeSk7XG4gICAgfVxuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gTU9ESUZJRUQgQlkgTlMvQ0ogLSBEb24ndCBleHRlbmQgdGhlIHByb3RvdHlwZSBvZiBTdHJpbmdcbi8vIE1PRElGSUVEIEJZIENKIC0gUmVtb3ZlIHN0YXJ0X29mX3N0cmluZ19ib251c1xuXG4vKiFcbiAqIHN0cmluZ19zY29yZS5qczogU3RyaW5nIFNjb3JpbmcgQWxnb3JpdGhtIDAuMS4xMFxuICpcbiAqIGh0dHA6Ly9qb3NoYXZlbi5jb20vc3RyaW5nX3Njb3JlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vam9zaGF2ZW4vc3RyaW5nX3Njb3JlXG4gKlxuICogQ29weXJpZ2h0IChDKSAyMDA5LTIwMTEgSm9zaGF2ZW4gUG90dGVyIDx5b3VydGVjaEBnbWFpbC5jb20+XG4gKiBTcGVjaWFsIHRoYW5rcyB0byBhbGwgb2YgdGhlIGNvbnRyaWJ1dG9ycyBsaXN0ZWQgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vam9zaGF2ZW4vc3RyaW5nX3Njb3JlXG4gKiBNSVQgbGljZW5zZTogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBEYXRlOiBUdWUgTWFyIDEgMjAxMVxuKi9cblxuLyoqXG4gKiBTY29yZXMgYSBzdHJpbmcgYWdhaW5zdCBhbm90aGVyIHN0cmluZy5cbiAqICAnSGVsbG8gV29ybGQnLnNjb3JlKCdoZScpOyAgICAgLy89PiAwLjU5MzE4MTgxODE4MTgxODFcbiAqICAnSGVsbG8gV29ybGQnLnNjb3JlKCdIZWxsbycpOyAgLy89PiAwLjczMTgxODE4MTgxODE4MThcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHJpbmcsIGFiYnJldmlhdGlvbikge1xuICAvLyBJZiB0aGUgc3RyaW5nIGlzIGVxdWFsIHRvIHRoZSBhYmJyZXZpYXRpb24sIHBlcmZlY3QgbWF0Y2guXG4gIGlmIChzdHJpbmcgPT0gYWJicmV2aWF0aW9uKSB7cmV0dXJuIDE7fVxuXG4gIHZhciB0b3RhbF9jaGFyYWN0ZXJfc2NvcmUgPSAwLFxuICAgICAgYWJicmV2aWF0aW9uX2xlbmd0aCA9IGFiYnJldmlhdGlvbi5sZW5ndGgsXG4gICAgICBzdHJpbmdfbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcbiAgICAgIHN0YXJ0X29mX3N0cmluZ19ib251cyxcbiAgICAgIGFiYnJldmlhdGlvbl9zY29yZSxcbiAgICAgIGZpbmFsX3Njb3JlO1xuXG4gIC8vIFdhbGsgdGhyb3VnaCBhYmJyZXZpYXRpb24gYW5kIGFkZCB1cCBzY29yZXMuXG4gIGZvciAodmFyIGkgPSAwLFxuICAgICAgICAgY2hhcmFjdGVyX3Njb3JlLyogPSAwKi8sXG4gICAgICAgICBpbmRleF9pbl9zdHJpbmcvKiA9IDAqLyxcbiAgICAgICAgIGMvKiA9ICcnKi8sXG4gICAgICAgICBpbmRleF9jX2xvd2VyY2FzZS8qID0gMCovLFxuICAgICAgICAgaW5kZXhfY191cHBlcmNhc2UvKiA9IDAqLyxcbiAgICAgICAgIG1pbl9pbmRleC8qID0gMCovO1xuICAgICBpIDwgYWJicmV2aWF0aW9uX2xlbmd0aDtcbiAgICAgKytpKSB7XG5cbiAgICAvLyBGaW5kIHRoZSBmaXJzdCBjYXNlLWluc2Vuc2l0aXZlIG1hdGNoIG9mIGEgY2hhcmFjdGVyLlxuICAgIGMgPSBhYmJyZXZpYXRpb24uY2hhckF0KGkpO1xuXG4gICAgaW5kZXhfY19sb3dlcmNhc2UgPSBzdHJpbmcuaW5kZXhPZihjLnRvTG93ZXJDYXNlKCkpO1xuICAgIGluZGV4X2NfdXBwZXJjYXNlID0gc3RyaW5nLmluZGV4T2YoYy50b1VwcGVyQ2FzZSgpKTtcbiAgICBtaW5faW5kZXggPSBNYXRoLm1pbihpbmRleF9jX2xvd2VyY2FzZSwgaW5kZXhfY191cHBlcmNhc2UpO1xuICAgIGluZGV4X2luX3N0cmluZyA9IChtaW5faW5kZXggPiAtMSkgPyBtaW5faW5kZXggOiBNYXRoLm1heChpbmRleF9jX2xvd2VyY2FzZSwgaW5kZXhfY191cHBlcmNhc2UpO1xuXG4gICAgaWYgKGluZGV4X2luX3N0cmluZyA9PT0gLTEpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGFyYWN0ZXJfc2NvcmUgPSAwLjE7XG4gICAgfVxuXG4gICAgLy8gU2V0IGJhc2Ugc2NvcmUgZm9yIG1hdGNoaW5nICdjJy5cblxuICAgIC8vIFNhbWUgY2FzZSBib251cy5cbiAgICBpZiAoc3RyaW5nW2luZGV4X2luX3N0cmluZ10gPT09IGMpIHtcbiAgICAgIGNoYXJhY3Rlcl9zY29yZSArPSAwLjE7XG4gICAgfVxuXG4gICAgLy8gQ29uc2VjdXRpdmUgbGV0dGVyICYgc3RhcnQtb2Ytc3RyaW5nIEJvbnVzXG4gICAgaWYgKGluZGV4X2luX3N0cmluZyA9PT0gMCkge1xuICAgICAgLy8gSW5jcmVhc2UgdGhlIHNjb3JlIHdoZW4gbWF0Y2hpbmcgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSByZW1haW5kZXIgb2YgdGhlIHN0cmluZ1xuICAgICAgY2hhcmFjdGVyX3Njb3JlICs9IDAuNjtcbiAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIC8vIElmIG1hdGNoIGlzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHN0cmluZ1xuICAgICAgICAvLyAmIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgYWJicmV2aWF0aW9uLCBhZGQgYVxuICAgICAgICAvLyBzdGFydC1vZi1zdHJpbmcgbWF0Y2ggYm9udXMuXG4gICAgICAgIC8vIHN0YXJ0X29mX3N0cmluZ19ib251cyA9IDEgLy90cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIEFjcm9ueW0gQm9udXNcbiAgICAgIC8vIFdlaWdoaW5nIExvZ2ljOiBUeXBpbmcgdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBhbiBhY3JvbnltIGlzIGFzIGlmIHlvdVxuICAgICAgLy8gcHJlY2VkZWQgaXQgd2l0aCB0d28gcGVyZmVjdCBjaGFyYWN0ZXIgbWF0Y2hlcy5cbiAgICAgIGlmIChzdHJpbmcuY2hhckF0KGluZGV4X2luX3N0cmluZyAtIDEpID09PSAnICcpIHtcbiAgICAgICAgY2hhcmFjdGVyX3Njb3JlICs9IDAuODsgLy8gKiBNYXRoLm1pbihpbmRleF9pbl9zdHJpbmcsIDUpOyAvLyBDYXAgYm9udXMgYXQgMC40ICogNVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExlZnQgdHJpbSB0aGUgYWxyZWFkeSBtYXRjaGVkIHBhcnQgb2YgdGhlIHN0cmluZ1xuICAgIC8vIChmb3JjZXMgc2VxdWVudGlhbCBtYXRjaGluZykuXG4gICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhpbmRleF9pbl9zdHJpbmcgKyAxLCBzdHJpbmdfbGVuZ3RoKTtcblxuICAgIHRvdGFsX2NoYXJhY3Rlcl9zY29yZSArPSBjaGFyYWN0ZXJfc2NvcmU7XG4gIH0gLy8gZW5kIG9mIGZvciBsb29wXG5cbiAgLy8gVW5jb21tZW50IHRvIHdlaWdoIHNtYWxsZXIgd29yZHMgaGlnaGVyLlxuICAvLyByZXR1cm4gdG90YWxfY2hhcmFjdGVyX3Njb3JlIC8gc3RyaW5nX2xlbmd0aDtcblxuICBhYmJyZXZpYXRpb25fc2NvcmUgPSB0b3RhbF9jaGFyYWN0ZXJfc2NvcmUgLyBhYmJyZXZpYXRpb25fbGVuZ3RoO1xuICAvL3BlcmNlbnRhZ2Vfb2ZfbWF0Y2hlZF9zdHJpbmcgPSBhYmJyZXZpYXRpb25fbGVuZ3RoIC8gc3RyaW5nX2xlbmd0aDtcbiAgLy93b3JkX3Njb3JlID0gYWJicmV2aWF0aW9uX3Njb3JlICogcGVyY2VudGFnZV9vZl9tYXRjaGVkX3N0cmluZztcblxuICAvLyBSZWR1Y2UgcGVuYWx0eSBmb3IgbG9uZ2VyIHN0cmluZ3MuXG4gIC8vZmluYWxfc2NvcmUgPSAod29yZF9zY29yZSArIGFiYnJldmlhdGlvbl9zY29yZSkgLyAyO1xuICBmaW5hbF9zY29yZSA9ICgoYWJicmV2aWF0aW9uX3Njb3JlICogKGFiYnJldmlhdGlvbl9sZW5ndGggLyBzdHJpbmdfbGVuZ3RoKSkgKyBhYmJyZXZpYXRpb25fc2NvcmUpIC8gMjtcblxuICBpZiAoc3RhcnRfb2Zfc3RyaW5nX2JvbnVzICYmIChmaW5hbF9zY29yZSArIDAuMTUgPCAxKSkge1xuICAgIGZpbmFsX3Njb3JlICs9IDAuMTU7XG4gIH1cblxuICByZXR1cm4gZmluYWxfc2NvcmU7XG59O1xuIiwiXG4vKipcbiAqIEV4cG9zZSBgcmVuZGVyKClgLmBcbiAqL1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSByZW5kZXI7XG5cbi8qKlxuICogRXhwb3NlIGBjb21waWxlKClgLlxuICovXG5cbmV4cG9ydHMuY29tcGlsZSA9IGNvbXBpbGU7XG5cbi8qKlxuICogUmVuZGVyIHRoZSBnaXZlbiBtdXN0YWNoZSBgc3RyYCB3aXRoIGBvYmpgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gcmVuZGVyKHN0ciwgb2JqKSB7XG4gIG9iaiA9IG9iaiB8fCB7fTtcbiAgdmFyIGZuID0gY29tcGlsZShzdHIpO1xuICByZXR1cm4gZm4ob2JqKTtcbn1cblxuLyoqXG4gKiBDb21waWxlIHRoZSBnaXZlbiBgc3RyYCB0byBhIGBGdW5jdGlvbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGUoc3RyKSB7XG4gIHZhciBqcyA9IFtdO1xuICB2YXIgdG9rcyA9IHBhcnNlKHN0cik7XG4gIHZhciB0b2s7XG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b2tzLmxlbmd0aDsgKytpKSB7XG4gICAgdG9rID0gdG9rc1tpXTtcbiAgICBpZiAoaSAlIDIgPT0gMCkge1xuICAgICAganMucHVzaCgnXCInICsgdG9rLnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSArICdcIicpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKHRva1swXSkge1xuICAgICAgICBjYXNlICcvJzpcbiAgICAgICAgICB0b2sgPSB0b2suc2xpY2UoMSk7XG4gICAgICAgICAganMucHVzaCgnKSArICcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICB0b2sgPSB0b2suc2xpY2UoMSk7XG4gICAgICAgICAgYXNzZXJ0UHJvcGVydHkodG9rKTtcbiAgICAgICAgICBqcy5wdXNoKCcgKyBzZWN0aW9uKG9iaiwgXCInICsgdG9rICsgJ1wiLCB0cnVlLCAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnIyc6XG4gICAgICAgICAgdG9rID0gdG9rLnNsaWNlKDEpO1xuICAgICAgICAgIGFzc2VydFByb3BlcnR5KHRvayk7XG4gICAgICAgICAganMucHVzaCgnICsgc2VjdGlvbihvYmosIFwiJyArIHRvayArICdcIiwgZmFsc2UsICcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICchJzpcbiAgICAgICAgICB0b2sgPSB0b2suc2xpY2UoMSk7XG4gICAgICAgICAgYXNzZXJ0UHJvcGVydHkodG9rKTtcbiAgICAgICAgICBqcy5wdXNoKCcgKyBvYmouJyArIHRvayArICcgKyAnKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBhc3NlcnRQcm9wZXJ0eSh0b2spO1xuICAgICAgICAgIGpzLnB1c2goJyArIGVzY2FwZShvYmouJyArIHRvayArICcpICsgJyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAganMgPSAnXFxuJ1xuICAgICsgaW5kZW50KGVzY2FwZS50b1N0cmluZygpKSArICc7XFxuXFxuJ1xuICAgICsgaW5kZW50KHNlY3Rpb24udG9TdHJpbmcoKSkgKyAnO1xcblxcbidcbiAgICArICcgIHJldHVybiAnICsganMuam9pbignJykucmVwbGFjZSgvXFxuL2csICdcXFxcbicpO1xuXG4gIHJldHVybiBuZXcgRnVuY3Rpb24oJ29iaicsIGpzKTtcbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhhdCBgcHJvcGAgaXMgYSB2YWxpZCBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gYXNzZXJ0UHJvcGVydHkocHJvcCkge1xuICBpZiAoIXByb3AubWF0Y2goL15bXFx3Ll0rJC8pKSB0aHJvdyBuZXcgRXJyb3IoJ2ludmFsaWQgcHJvcGVydHkgXCInICsgcHJvcCArICdcIicpO1xufVxuXG4vKipcbiAqIFBhcnNlIGBzdHJgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5fVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gcGFyc2Uoc3RyKSB7XG4gIHJldHVybiBzdHIuc3BsaXQoL1xce1xce3xcXH1cXH0vKTtcbn1cblxuLyoqXG4gKiBJbmRlbnQgYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gaW5kZW50KHN0cikge1xuICByZXR1cm4gc3RyLnJlcGxhY2UoL14vZ20sICcgICcpO1xufVxuXG4vKipcbiAqIFNlY3Rpb24gaGFuZGxlci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dCBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG5lZ2F0ZVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gc2VjdGlvbihvYmosIHByb3AsIG5lZ2F0ZSwgc3RyKSB7XG4gIHZhciB2YWwgPSBvYmpbcHJvcF07XG4gIGlmICgnZnVuY3Rpb24nID09IHR5cGVvZiB2YWwpIHJldHVybiB2YWwuY2FsbChvYmosIHN0cik7XG4gIGlmIChuZWdhdGUpIHZhbCA9ICF2YWw7XG4gIGlmICh2YWwpIHJldHVybiBzdHI7XG4gIHJldHVybiAnJztcbn1cblxuLyoqXG4gKiBFc2NhcGUgdGhlIGdpdmVuIGBodG1sYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gaHRtbFxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gZXNjYXBlKGh0bWwpIHtcbiAgcmV0dXJuIFN0cmluZyhodG1sKVxuICAgIC5yZXBsYWNlKC8mL2csICcmYW1wOycpXG4gICAgLnJlcGxhY2UoL1wiL2csICcmcXVvdDsnKVxuICAgIC5yZXBsYWNlKC88L2csICcmbHQ7JylcbiAgICAucmVwbGFjZSgvPi9nLCAnJmd0OycpO1xufVxuIiwidmFyIGd1aWRSeCA9IFwiez9bMC05QS1GYS1mXXs4fS1bMC05QS1GYS1mXXs0fS00WzAtOUEtRmEtZl17M30tWzAtOUEtRmEtZl17NH0tWzAtOUEtRmEtZl17MTJ9fT9cIjtcblxuZXhwb3J0cy5nZW5lcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgdmFyIGd1aWQgPSBcInh4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eFwiLnJlcGxhY2UoIC9beHldL2csIGZ1bmN0aW9uICggYyApIHtcbiAgICB2YXIgciA9ICggZCArIE1hdGgucmFuZG9tKCkgKiAxNiApICUgMTYgfCAwO1xuICAgIGQgPSBNYXRoLmZsb29yKCBkIC8gMTYgKTtcbiAgICByZXR1cm4gKCBjID09PSBcInhcIiA/IHIgOiAoIHIgJiAweDcgfCAweDggKSApLnRvU3RyaW5nKCAxNiApO1xuICB9ICk7XG4gIHJldHVybiBndWlkO1xufTtcblxuZXhwb3J0cy5tYXRjaCA9IGZ1bmN0aW9uICggc3RyaW5nICkge1xuICB2YXIgcnggPSBuZXcgUmVnRXhwKCBndWlkUngsIFwiZ1wiICksXG4gICAgbWF0Y2hlcyA9ICggdHlwZW9mIHN0cmluZyA9PT0gXCJzdHJpbmdcIiA/IHN0cmluZyA6IFwiXCIgKS5tYXRjaCggcnggKTtcbiAgcmV0dXJuIEFycmF5LmlzQXJyYXkoIG1hdGNoZXMgKSA/IG1hdGNoZXMgOiBbXTtcbn07XG5cbmV4cG9ydHMuaXNWYWxpZCA9IGZ1bmN0aW9uICggZ3VpZCApIHtcbiAgdmFyIHJ4ID0gbmV3IFJlZ0V4cCggZ3VpZFJ4ICk7XG4gIHJldHVybiByeC50ZXN0KCBndWlkICk7XG59OyIsInZhciB0eXBlID0gcmVxdWlyZSggXCIuL2lzZXMvdHlwZVwiICksXG4gIGlzID0ge1xuICAgIGE6IHt9LFxuICAgIGFuOiB7fSxcbiAgICBub3Q6IHtcbiAgICAgIGE6IHt9LFxuICAgICAgYW46IHt9XG4gICAgfVxuICB9O1xuXG52YXIgaXNlcyA9IHtcbiAgXCJhcmd1bWVudHNcIjogWyBcImFyZ3VtZW50c1wiLCB0eXBlKCBcImFyZ3VtZW50c1wiICkgXSxcbiAgXCJhcnJheVwiOiBbIFwiYXJyYXlcIiwgdHlwZSggXCJhcnJheVwiICkgXSxcbiAgXCJib29sZWFuXCI6IFsgXCJib29sZWFuXCIsIHR5cGUoIFwiYm9vbGVhblwiICkgXSxcbiAgXCJkYXRlXCI6IFsgXCJkYXRlXCIsIHR5cGUoIFwiZGF0ZVwiICkgXSxcbiAgXCJmdW5jdGlvblwiOiBbIFwiZnVuY3Rpb25cIiwgXCJmdW5jXCIsIFwiZm5cIiwgdHlwZSggXCJmdW5jdGlvblwiICkgXSxcbiAgXCJudWxsXCI6IFsgXCJudWxsXCIsIHR5cGUoIFwibnVsbFwiICkgXSxcbiAgXCJudW1iZXJcIjogWyBcIm51bWJlclwiLCBcImludGVnZXJcIiwgXCJpbnRcIiwgdHlwZSggXCJudW1iZXJcIiApIF0sXG4gIFwib2JqZWN0XCI6IFsgXCJvYmplY3RcIiwgdHlwZSggXCJvYmplY3RcIiApIF0sXG4gIFwicmVnZXhwXCI6IFsgXCJyZWdleHBcIiwgdHlwZSggXCJyZWdleHBcIiApIF0sXG4gIFwic3RyaW5nXCI6IFsgXCJzdHJpbmdcIiwgdHlwZSggXCJzdHJpbmdcIiApIF0sXG4gIFwidW5kZWZpbmVkXCI6IFsgXCJ1bmRlZmluZWRcIiwgdHlwZSggXCJ1bmRlZmluZWRcIiApIF0sXG4gIFwiZW1wdHlcIjogWyBcImVtcHR5XCIsIHJlcXVpcmUoIFwiLi9pc2VzL2VtcHR5XCIgKSBdLFxuICBcIm51bGxvcnVuZGVmaW5lZFwiOiBbIFwibnVsbE9yVW5kZWZpbmVkXCIsIFwibnVsbG9ydW5kZWZpbmVkXCIsIHJlcXVpcmUoIFwiLi9pc2VzL251bGxvcnVuZGVmaW5lZFwiICkgXSxcbiAgXCJndWlkXCI6IFsgXCJndWlkXCIsIHJlcXVpcmUoIFwiLi9pc2VzL2d1aWRcIiApIF1cbn1cblxuT2JqZWN0LmtleXMoIGlzZXMgKS5mb3JFYWNoKCBmdW5jdGlvbiAoIGtleSApIHtcblxuICB2YXIgbWV0aG9kcyA9IGlzZXNbIGtleSBdLnNsaWNlKCAwLCBpc2VzWyBrZXkgXS5sZW5ndGggLSAxICksXG4gICAgZm4gPSBpc2VzWyBrZXkgXVsgaXNlc1sga2V5IF0ubGVuZ3RoIC0gMSBdO1xuXG4gIG1ldGhvZHMuZm9yRWFjaCggZnVuY3Rpb24gKCBtZXRob2RLZXkgKSB7XG4gICAgaXNbIG1ldGhvZEtleSBdID0gaXMuYVsgbWV0aG9kS2V5IF0gPSBpcy5hblsgbWV0aG9kS2V5IF0gPSBmbjtcbiAgICBpcy5ub3RbIG1ldGhvZEtleSBdID0gaXMubm90LmFbIG1ldGhvZEtleSBdID0gaXMubm90LmFuWyBtZXRob2RLZXkgXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseSggdGhpcywgYXJndW1lbnRzICkgPyBmYWxzZSA6IHRydWU7XG4gICAgfVxuICB9ICk7XG5cbn0gKTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gaXM7XG5leHBvcnRzLnR5cGUgPSB0eXBlOyIsInZhciB0eXBlID0gcmVxdWlyZShcIi4uL3R5cGVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcbiAgdmFyIGVtcHR5ID0gZmFsc2U7XG5cbiAgaWYgKCB0eXBlKCB2YWx1ZSApID09PSBcIm51bGxcIiB8fCB0eXBlKCB2YWx1ZSApID09PSBcInVuZGVmaW5lZFwiICkge1xuICAgIGVtcHR5ID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICggdHlwZSggdmFsdWUgKSA9PT0gXCJvYmplY3RcIiApIHtcbiAgICBlbXB0eSA9IE9iamVjdC5rZXlzKCB2YWx1ZSApLmxlbmd0aCA9PT0gMDtcbiAgfSBlbHNlIGlmICggdHlwZSggdmFsdWUgKSA9PT0gXCJib29sZWFuXCIgKSB7XG4gICAgZW1wdHkgPSB2YWx1ZSA9PT0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoIHR5cGUoIHZhbHVlICkgPT09IFwibnVtYmVyXCIgKSB7XG4gICAgZW1wdHkgPSB2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA9PT0gLTE7XG4gIH0gZWxzZSBpZiAoIHR5cGUoIHZhbHVlICkgPT09IFwiYXJyYXlcIiB8fCB0eXBlKCB2YWx1ZSApID09PSBcInN0cmluZ1wiICkge1xuICAgIGVtcHR5ID0gdmFsdWUubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgcmV0dXJuIGVtcHR5O1xuXG59OyIsInZhciBndWlkID0gcmVxdWlyZSggXCJzYy1ndWlkXCIgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xuICByZXR1cm4gZ3VpZC5pc1ZhbGlkKCB2YWx1ZSApO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XG5cdHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSB2b2lkIDA7XG59OyIsInZhciB0eXBlID0gcmVxdWlyZSggXCIuLi90eXBlXCIgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoIF90eXBlICkge1xuICByZXR1cm4gZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG4gICAgcmV0dXJuIHR5cGUoIF92YWx1ZSApID09PSBfdHlwZTtcbiAgfVxufSIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCB2YWwgKSB7XG4gIHN3aXRjaCAoIHRvU3RyaW5nLmNhbGwoIHZhbCApICkge1xuICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6XG4gICAgcmV0dXJuICdmdW5jdGlvbic7XG4gIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgIHJldHVybiAnZGF0ZSc7XG4gIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgcmV0dXJuICdyZWdleHAnO1xuICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOlxuICAgIHJldHVybiAnYXJndW1lbnRzJztcbiAgY2FzZSAnW29iamVjdCBBcnJheV0nOlxuICAgIHJldHVybiAnYXJyYXknO1xuICB9XG5cbiAgaWYgKCB2YWwgPT09IG51bGwgKSByZXR1cm4gJ251bGwnO1xuICBpZiAoIHZhbCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAoIHZhbCA9PT0gT2JqZWN0KCB2YWwgKSApIHJldHVybiAnb2JqZWN0JztcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn07IiwidmFyIG1kNSA9IHJlcXVpcmUoIFwibWQ1LWNvbXBvbmVudFwiICk7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeSggX29iamVjdCApIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCBfb2JqZWN0ICk7XG59XG5cbmZ1bmN0aW9uIGhhc2goIF9vYmplY3QgKSB7XG4gIHJldHVybiBtZDUoIHN0cmluZ2lmeSggX29iamVjdCApICk7XG59XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGhhc2g7XG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbmV4cG9ydHMubWQ1ID0gbWQ1OyIsIi8qKlxuICogbWQ1LmpzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEsIFlvc2hpbm9yaSBLb2h5YW1hIChodHRwOi8vYWxnb2JpdC5qcC8pXG4gKiBhbGwgcmlnaHRzIHJlc2VydmVkLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZGlnZXN0U3RyaW5nO1xuXG5mdW5jdGlvbiBkaWdlc3QoTSkge1xuICB2YXIgb3JpZ2luYWxMZW5ndGhcbiAgICAsIGlcbiAgICAsIGpcbiAgICAsIGtcbiAgICAsIGxcbiAgICAsIEFcbiAgICAsIEJcbiAgICAsIENcbiAgICAsIERcbiAgICAsIEFBXG4gICAgLCBCQlxuICAgICwgQ0NcbiAgICAsIEREXG4gICAgLCBYXG4gICAgLCBydmFsXG4gICAgO1xuXG5cdGZ1bmN0aW9uIEYoeCwgeSwgeikgeyByZXR1cm4gKHggJiB5KSB8ICh+eCAmIHopOyB9XG5cdGZ1bmN0aW9uIEcoeCwgeSwgeikgeyByZXR1cm4gKHggJiB6KSB8ICh5ICYgfnopOyB9XG5cdGZ1bmN0aW9uIEgoeCwgeSwgeikgeyByZXR1cm4geCBeIHkgXiB6OyAgICAgICAgICB9XG5cdGZ1bmN0aW9uIEkoeCwgeSwgeikgeyByZXR1cm4geSBeICh4IHwgfnopOyAgICAgICB9XG5cblx0ZnVuY3Rpb24gdG80Ynl0ZXMobikge1xuXHRcdHJldHVybiBbbiYweGZmLCAobj4+PjgpJjB4ZmYsIChuPj4+MTYpJjB4ZmYsIChuPj4+MjQpJjB4ZmZdO1xuXHR9XG5cblx0b3JpZ2luYWxMZW5ndGggPSBNLmxlbmd0aDsgLy8gZm9yIFN0ZXAuMlxuXG5cdC8vIDMuMSBTdGVwIDEuIEFwcGVuZCBQYWRkaW5nIEJpdHNcblx0TS5wdXNoKDB4ODApO1xuXHRsID0gKDU2IC0gTS5sZW5ndGgpJjB4M2Y7XG5cdGZvciAoaSA9IDA7IGkgPCBsOyBpKyspXG5cdFx0TS5wdXNoKDApO1xuXG5cdC8vIDMuMiBTdGVwIDIuIEFwcGVuZCBMZW5ndGhcblx0dG80Ynl0ZXMoOCpvcmlnaW5hbExlbmd0aCkuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBNLnB1c2goZSk7IH0pO1xuXHRbMCwgMCwgMCwgMF0uZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBNLnB1c2goZSk7IH0pO1xuXG5cdC8vIDMuMyBTdGVwIDMuIEluaXRpYWxpemUgTUQgQnVmZmVyXG5cdEEgPSBbMHg2NzQ1MjMwMV07XG5cdEIgPSBbMHhlZmNkYWI4OV07XG5cdEMgPSBbMHg5OGJhZGNmZV07XG5cdEQgPSBbMHgxMDMyNTQ3Nl07XG5cblx0Ly8gMy40IFN0ZXAgNC4gUHJvY2VzcyBNZXNzYWdlIGluIDE2LVdvcmQgQmxvY2tzXG5cdGZ1bmN0aW9uIHJvdW5kcyhhLCBiLCBjLCBkLCBrLCBzLCB0LCBmKSB7XG5cdFx0YVswXSArPSBmKGJbMF0sIGNbMF0sIGRbMF0pICsgWFtrXSArIHQ7XG5cdFx0YVswXSA9ICgoYVswXTw8cyl8KGFbMF0+Pj4oMzIgLSBzKSkpO1xuXHRcdGFbMF0gKz0gYlswXTtcblx0fVxuXG5cdGZvciAoaSA9IDA7IGkgPCBNLmxlbmd0aDsgaSArPSA2NCkge1xuXHRcdFggPSBbXTtcblx0XHRmb3IgKGogPSAwOyBqIDwgNjQ7IGogKz0gNCkge1xuXHRcdFx0ayA9IGkgKyBqO1xuXHRcdFx0WC5wdXNoKE1ba118KE1bayArIDFdPDw4KXwoTVtrICsgMl08PDE2KXwoTVtrICsgM108PDI0KSk7XG5cdFx0fVxuXHRcdEFBID0gQVswXTtcblx0XHRCQiA9IEJbMF07XG5cdFx0Q0MgPSBDWzBdO1xuXHRcdEREID0gRFswXTtcblxuXHRcdC8vIFJvdW5kIDEuXG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICAwLCAgNywgMHhkNzZhYTQ3OCwgRik7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICAxLCAxMiwgMHhlOGM3Yjc1NiwgRik7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICAyLCAxNywgMHgyNDIwNzBkYiwgRik7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICAzLCAyMiwgMHhjMWJkY2VlZSwgRik7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA0LCAgNywgMHhmNTdjMGZhZiwgRik7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA1LCAxMiwgMHg0Nzg3YzYyYSwgRik7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICA2LCAxNywgMHhhODMwNDYxMywgRik7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA3LCAyMiwgMHhmZDQ2OTUwMSwgRik7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA4LCAgNywgMHg2OTgwOThkOCwgRik7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA5LCAxMiwgMHg4YjQ0ZjdhZiwgRik7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDEwLCAxNywgMHhmZmZmNWJiMSwgRik7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDExLCAyMiwgMHg4OTVjZDdiZSwgRik7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsIDEyLCAgNywgMHg2YjkwMTEyMiwgRik7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDEzLCAxMiwgMHhmZDk4NzE5MywgRik7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDE0LCAxNywgMHhhNjc5NDM4ZSwgRik7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDE1LCAyMiwgMHg0OWI0MDgyMSwgRik7XG5cblx0XHQvLyBSb3VuZCAyLlxuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgMSwgIDUsIDB4ZjYxZTI1NjIsIEcpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgNiwgIDksIDB4YzA0MGIzNDAsIEcpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxMSwgMTQsIDB4MjY1ZTVhNTEsIEcpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgMCwgMjAsIDB4ZTliNmM3YWEsIEcpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgNSwgIDUsIDB4ZDYyZjEwNWQsIEcpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAxMCwgIDksIDB4MDI0NDE0NTMsIEcpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxNSwgMTQsIDB4ZDhhMWU2ODEsIEcpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgNCwgMjAsIDB4ZTdkM2ZiYzgsIEcpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgOSwgIDUsIDB4MjFlMWNkZTYsIEcpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAxNCwgIDksIDB4YzMzNzA3ZDYsIEcpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgMywgMTQsIDB4ZjRkNTBkODcsIEcpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgOCwgMjAsIDB4NDU1YTE0ZWQsIEcpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAxMywgIDUsIDB4YTllM2U5MDUsIEcpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgMiwgIDksIDB4ZmNlZmEzZjgsIEcpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgNywgMTQsIDB4Njc2ZjAyZDksIEcpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAxMiwgMjAsIDB4OGQyYTRjOGEsIEcpO1xuXG5cdFx0Ly8gUm91bmQgMy5cblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDUsICA0LCAweGZmZmEzOTQyLCBIKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDgsIDExLCAweDg3NzFmNjgxLCBIKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTEsIDE2LCAweDZkOWQ2MTIyLCBIKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgMTQsIDIzLCAweGZkZTUzODBjLCBIKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDEsICA0LCAweGE0YmVlYTQ0LCBIKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDQsIDExLCAweDRiZGVjZmE5LCBIKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDcsIDE2LCAweGY2YmI0YjYwLCBIKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgMTAsIDIzLCAweGJlYmZiYzcwLCBIKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgMTMsICA0LCAweDI4OWI3ZWM2LCBIKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDAsIDExLCAweGVhYTEyN2ZhLCBIKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDMsIDE2LCAweGQ0ZWYzMDg1LCBIKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDYsIDIzLCAweDA0ODgxZDA1LCBIKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDksICA0LCAweGQ5ZDRkMDM5LCBIKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgMTIsIDExLCAweGU2ZGI5OWU1LCBIKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTUsIDE2LCAweDFmYTI3Y2Y4LCBIKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDIsIDIzLCAweGM0YWM1NjY1LCBIKTtcblxuXHRcdC8vIFJvdW5kIDQuXG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICAwLCAgNiwgMHhmNDI5MjI0NCwgSSk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA3LCAxMCwgMHg0MzJhZmY5NywgSSk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDE0LCAxNSwgMHhhYjk0MjNhNywgSSk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA1LCAyMSwgMHhmYzkzYTAzOSwgSSk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsIDEyLCAgNiwgMHg2NTViNTljMywgSSk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICAzLCAxMCwgMHg4ZjBjY2M5MiwgSSk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDEwLCAxNSwgMHhmZmVmZjQ3ZCwgSSk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICAxLCAyMSwgMHg4NTg0NWRkMSwgSSk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA4LCAgNiwgMHg2ZmE4N2U0ZiwgSSk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDE1LCAxMCwgMHhmZTJjZTZlMCwgSSk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICA2LCAxNSwgMHhhMzAxNDMxNCwgSSk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDEzLCAyMSwgMHg0ZTA4MTFhMSwgSSk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA0LCAgNiwgMHhmNzUzN2U4MiwgSSk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDExLCAxMCwgMHhiZDNhZjIzNSwgSSk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICAyLCAxNSwgMHgyYWQ3ZDJiYiwgSSk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA5LCAyMSwgMHhlYjg2ZDM5MSwgSSk7XG5cblx0XHRBWzBdICs9IEFBO1xuXHRcdEJbMF0gKz0gQkI7XG5cdFx0Q1swXSArPSBDQztcblx0XHREWzBdICs9IEREO1xuXHR9XG5cblx0cnZhbCA9IFtdO1xuXHR0bzRieXRlcyhBWzBdKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IHJ2YWwucHVzaChlKTsgfSk7XG5cdHRvNGJ5dGVzKEJbMF0pLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgcnZhbC5wdXNoKGUpOyB9KTtcblx0dG80Ynl0ZXMoQ1swXSkuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBydmFsLnB1c2goZSk7IH0pO1xuXHR0bzRieXRlcyhEWzBdKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IHJ2YWwucHVzaChlKTsgfSk7XG5cblx0cmV0dXJuIHJ2YWw7XG59XG5cbmZ1bmN0aW9uIGRpZ2VzdFN0cmluZyhzKSB7XG5cdHZhciBNID0gW11cbiAgICAsIGlcbiAgICAsIGRcbiAgICAsIHJzdHJcbiAgICAsIHNcbiAgICA7XG5cblx0Zm9yIChpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspXG5cdFx0TS5wdXNoKHMuY2hhckNvZGVBdChpKSk7XG5cblx0ZCA9IGRpZ2VzdChNKTtcblx0cnN0ciA9ICcnO1xuXG5cdGQuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuXHRcdHMgPSBlLnRvU3RyaW5nKDE2KTtcblx0XHR3aGlsZSAocy5sZW5ndGggPCAyKVxuXHRcdFx0cyA9ICcwJyArIHM7XG5cdFx0cnN0ciArPSBzO1xuXHR9KTtcblxuXHRyZXR1cm4gcnN0cjtcbn0iLCJ2YXIgdHlwZSA9IHJlcXVpcmUoIFwidHlwZS1jb21wb25lbnRcIiApO1xuXG52YXIgbWVyZ2UgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzICksXG4gICAgZGVlcCA9IHR5cGUoIGFyZ3NbIDAgXSApID09PSBcImJvb2xlYW5cIiA/IGFyZ3Muc2hpZnQoKSA6IGZhbHNlLFxuICAgIG9iamVjdHMgPSBhcmdzLFxuICAgIHJlc3VsdCA9IHt9O1xuXG4gIG9iamVjdHMuZm9yRWFjaCggZnVuY3Rpb24gKCBvYmplY3RuICkge1xuXG4gICAgaWYgKCB0eXBlKCBvYmplY3RuICkgIT09IFwib2JqZWN0XCIgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoIG9iamVjdG4gKS5mb3JFYWNoKCBmdW5jdGlvbiAoIGtleSApIHtcbiAgICAgIGlmICggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKCBvYmplY3RuLCBrZXkgKSApIHtcbiAgICAgICAgaWYgKCBkZWVwICYmIHR5cGUoIG9iamVjdG5bIGtleSBdICkgPT09IFwib2JqZWN0XCIgKSB7XG4gICAgICAgICAgcmVzdWx0WyBrZXkgXSA9IG1lcmdlKCBkZWVwLCB7fSwgcmVzdWx0WyBrZXkgXSwgb2JqZWN0blsga2V5IF0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRbIGtleSBdID0gb2JqZWN0blsga2V5IF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgfSApO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlOyIsIlxuLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6IHJldHVybiAnZnVuY3Rpb24nO1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsID09PSBPYmplY3QodmFsKSkgcmV0dXJuICdvYmplY3QnO1xuXG4gIHJldHVybiB0eXBlb2YgdmFsO1xufTtcbiIsInZhciBPYnNlcnZhYmxlQXJyYXkgPSBmdW5jdGlvbiAoIF9hcnJheSApIHtcblx0dmFyIGhhbmRsZXJzID0ge30sXG5cdFx0YXJyYXkgPSBBcnJheS5pc0FycmF5KCBfYXJyYXkgKSA/IF9hcnJheSA6IFtdO1xuXG5cdHZhciBwcm94eSA9IGZ1bmN0aW9uICggX21ldGhvZCwgX3ZhbHVlICkge1xuXHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApO1xuXG5cdFx0aWYgKCBoYW5kbGVyc1sgX21ldGhvZCBdICkge1xuXHRcdFx0cmV0dXJuIGhhbmRsZXJzWyBfbWV0aG9kIF0uYXBwbHkoIGFycmF5LCBhcmdzICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhcnJheVsgJ19fJyArIF9tZXRob2QgXS5hcHBseSggYXJyYXksIGFyZ3MgKTtcblx0XHR9XG5cdH07XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIGFycmF5LCB7XG5cdFx0b246IHtcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiAoIF9ldmVudCwgX2NhbGxiYWNrICkge1xuXHRcdFx0XHRoYW5kbGVyc1sgX2V2ZW50IF0gPSBfY2FsbGJhY2s7XG5cdFx0XHR9XG5cdFx0fVxuXHR9ICk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBhcnJheSwgJ3BvcCcsIHtcblx0XHR2YWx1ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHByb3h5KCAncG9wJywgYXJyYXlbIGFycmF5Lmxlbmd0aCAtIDEgXSApO1xuXHRcdH1cblx0fSApO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggYXJyYXksICdfX3BvcCcsIHtcblx0XHR2YWx1ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5wb3AuYXBwbHkoIGFycmF5LCBhcmd1bWVudHMgKTtcblx0XHR9XG5cdH0gKTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIGFycmF5LCAnc2hpZnQnLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBwcm94eSggJ3NoaWZ0JywgYXJyYXlbIDAgXSApO1xuXHRcdH1cblx0fSApO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggYXJyYXksICdfX3NoaWZ0Jywge1xuXHRcdHZhbHVlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KCBhcnJheSwgYXJndW1lbnRzICk7XG5cdFx0fVxuXHR9ICk7XG5cblx0WyAncHVzaCcsICdyZXZlcnNlJywgJ3Vuc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnIF0uZm9yRWFjaCggZnVuY3Rpb24gKCBfbWV0aG9kICkge1xuXHRcdHZhciBwcm9wZXJ0aWVzID0ge307XG5cblx0XHRwcm9wZXJ0aWVzWyBfbWV0aG9kIF0gPSB7XG5cdFx0XHR2YWx1ZTogcHJveHkuYmluZCggbnVsbCwgX21ldGhvZCApXG5cdFx0fTtcblxuXHRcdHByb3BlcnRpZXNbICdfXycgKyBfbWV0aG9kIF0gPSB7XG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG5cdFx0XHRcdHJldHVybiBBcnJheS5wcm90b3R5cGVbIF9tZXRob2QgXS5hcHBseSggYXJyYXksIGFyZ3VtZW50cyApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyggYXJyYXksIHByb3BlcnRpZXMgKTtcblx0fSApO1xuXG5cdHJldHVybiBhcnJheTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2YWJsZUFycmF5OyIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwic2NmaWx0ZXJlZGxpc3RcIixcbiAgXCJjbGFzc05hbWVcIjogXCJzYy1maWx0ZXJlZC1saXN0XCIsXG4gIFwiZGVmYXVsdHNcIjoge1xuICAgIFwiYnV0dG9uTGFiZWxcIjogXCJDaG9vc2Ugb25lXCIsXG4gICAgXCJmdXp6eVwiOiBmYWxzZSxcbiAgICBcIml0ZW1MYWJlbEtleVwiOiBcIm5hbWVcIixcbiAgICBcImxpc3RUaXRsZVwiOiBcIlNlbGVjdCBhbiBpdGVtXCIsXG4gICAgXCJtYXhOdW1JdGVtc1wiOiAxMCxcbiAgICBcIm1heE51bUl0ZW1zVmlzaWJsZVwiOiA3LFxuICAgIFwibWluV2lkdGhcIjogMzAwLFxuICAgIFwic29ydFwiOiBcImRlc2NcIixcbiAgICBcInNvcnRDb250cm9sVmlzaWJsZVwiOiB0cnVlXG4gIH0sXG4gIFwidGVtcGxhdGVzXCI6IHtcbiAgICBcImxpc3RXcmFwcGVyXCI6IFwiPGRpdiBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0tY29udGFpbmVyJz57eyFjb25maWcudGVtcGxhdGVzLmxpc3RJbnB1dH19e3shY29uZmlnLnRlbXBsYXRlcy5saXN0SGVhZGVyfX17eyFjb25maWcudGVtcGxhdGVzLmxpc3RJdGVtV3JhcHBlcn19PC9kaXY+XCIsXG4gICAgXCJsaXN0SW5wdXRcIjogXCI8ZGl2IGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1pbnB1dC1jb250YWluZXInPjxpbnB1dCB0eXBlPSd0ZXh0JyBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taW5wdXQgZm9ybS1jb250cm9sJz48L2Rpdj5cIixcbiAgICBcImxpc3RIZWFkZXJcIjogXCI8aGVhZGVyIGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1oZWFkZXIgcGFuZWwtaGVhZGluZyc+e3shY29uZmlnLmRlZmF1bHRzLmxpc3RUaXRsZX19e3shY29uZmlnLnRlbXBsYXRlcy5saXN0U29ydFRvZ2dsZX19PC9oZWFkZXI+XCIsXG4gICAgXCJsaXN0SXRlbVdyYXBwZXJcIjogXCI8ZGl2IGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1pdGVtcyBsaXN0LWdyb3VwJz48L2Rpdj5cIixcbiAgICBcImxpc3RJdGVtXCI6IFwiPGEgaHJlZiBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taXRlbSBsaXN0LWdyb3VwLWl0ZW0nIGRhdGEtY2lkPSd7e2NpZH19Jz57eyFrZXl9fTwvYT5cIixcbiAgICBcImxpc3RTb3J0VG9nZ2xlXCI6IFwiPGJ1dHRvbiB0eXBlPSdidXR0b24nIGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1zb3J0LXRvZ2dsZSBidG4gYnRuLWRlZmF1bHQgYnRuLXhzJyB0aXRsZT0nc29ydCc+PC9idXR0b24+XCJcbiAgfVxufSIsInZhciBjb25maWcgPSByZXF1aXJlKCBcIi4vY29uZmlnLmpzb25cIiApLFxuICBlbWl0dGVyID0gcmVxdWlyZSggXCJlbWl0dGVyLWNvbXBvbmVudFwiICksXG4gIGd1aWQgPSByZXF1aXJlKCBcInNjLWd1aWRcIiApLFxuICBoZWxwZXJzID0gcmVxdWlyZSggXCIuL2hlbHBlcnNcIiApLFxuICBpcyA9IHJlcXVpcmUoIFwic2MtaXNcIiApLFxuICBMaXN0ID0gcmVxdWlyZSggXCIuL2xpc3RcIiApLFxuICBvYnNlcnZhYmxlQXJyYXkgPSByZXF1aXJlKCBcInNnLW9ic2VydmFibGUtYXJyYXlcIiApO1xuXG4vKipcbiAqIGBzYy1maWx0ZXJlZC1saXN0YCBpcyBhIFVJIGNvbnRyb2wgdG8gYWxsb3cgdGhlIHVzZXIgdG8gcXVpY2tseSBjaG9vc2UgYVxuICogc2luZ2xlIG9iamVjdCBmcm9tIGEgbGlzdCBvZiBtYW55IG9iamVjdHMuXG4gKlxuICogIyMgSW5zdGFsbGF0aW9uXG4gKlxuICogR2V0IFtOb2RlLmpzXShodHRwOi8vbm9kZWpzLm9yZykuIEFuZCB0aGVuIGluIGEgY29uc29sZS4uLlxuICpcbiAqIGBgYGJhc2hcbiAqIG5wbSBpbnN0YWxsXG4gKiBgYGBcbiAqXG4gKiAjIyBPdmVydmlld1xuICpcbiAqIFRoaXMgY29udHJvbCBpcyBhdHRhY2hlZCB0byBhIGJ1dHRvbi4gV2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQgYSBsaXN0XG4gKiB3b3VsZCBhcHBlYXIgaW5saW5lIHRvIGFsbG93IHRoZSB1c2VyIHRvIGVpdGhlciB1c2UgdGhlIG1vdXNlIG9yIGtleWJvYXJkXG4gKiB0byBjaG9vc2UgYW4gaXRlbS4gQSB0ZXh0IGlucHV0IGlzIGF2YWlsYWJsZSB0byBhbGxvdyB0aGUgbGlzdCB0byBiZVxuICogZmlsdGVyZWQuXG4gKlxuICogIyMgSW5zdGFudGlhdGVcbiAqXG4gKiBUaGUgYEZpbHRlcmVkTGlzdGAgY2FuIGJlIGluc3RhbnRpYXRlZCB1c2luZyBgZGF0YS1gIGF0dHJpYnV0ZXMgZGlyZWN0bHkgaW5cbiAqIHRoZSBtYXJrdXAgb3IgbWFudWFsbHkgYnkgY29kZS5cbiAqXG4gKiAqKkluc3RhbnRpYXRlIHVzaW5nIGBkYXRhLWAgYXR0cmlidXRlcyoqXG4gKlxuICogQWRkIGBkYXRhLXNjLWZpbHRlcmVkLWxpc3RgIHRvIGEgYDxidXR0b24+YC4gV2lsbCBpbnN0YW50aWF0ZSBvbiBkb21yZWFkeS5cbiAqXG4gKiAgIDxidXR0b24gZGF0YS1zYy1maWx0ZXJlZC1saXN0PlxuICpcbiAqIFRvIGdldCBhIHJlZmVyZW5jZSB0byB0aGUgaW5zdGFudGlhdGVkIG9iamVjdCB1c2UgdGhlIGpRdWVyeSBgZGF0YWAgbWV0aG9kOlxuICpcbiAqICAgJCgnI215QnV0dG9uJykuZGF0YSgnc2NmaWx0ZXJlZGxpc3QnKTtcbiAqXG4gKiAqKkluc3RhbnRpYXRlIHVzaW5nIGNvZGUqKlxuICpcbiAqICAgdmFyIGZpbHRlciA9IG5ldyBGaWx0ZXJlZExpc3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI215QnV0dG9uJykpO1xuICpcbiAqICMjIyBPcHRpb25zXG4gKlxuICogR2l2ZSBvcHRpb25zIHVzaW5nIHRoZSBgZGF0YS1gIGF0dHJpYnV0ZS5cbiAqXG4gKiAgIDxidXR0b24gZGF0YS1zYy1maWx0ZXJlZC1saXN0IGRhdGEtc2MtZmlsdGVyZWQtbGlzdC1vcHRpb25zPSd7XCJmdXp6eVwiOiB0cnVlfSc+XG4gKlxuICogPiBUaGUgb3B0aW9ucyBvYmplY3QgbXVzdCBiZSBhIHByb3Blcmx5IGZvcm1hdHRlZCBKU09OIHN0cmluZy5cbiAqXG4gKiBHaXZlIG9wdGlvbnMgdXNpbmcgY29kZS5cbiAqXG4gKiAgIHZhciBmaWx0ZXIgPSBuZXcgRmlsdGVyZWRMaXN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNteUJ1dHRvbicpLCB7XG4gKiAgICAgZnV6enk6IHRydWVcbiAqICAgfSk7XG4gKlxuICogLSBgYnV0dG9uTGFiZWxgIFRoZSBidXR0b24gbGFiZWwgKGRlZmF1bHQ6IFwiQ2hvb3NlIG9uZVwiKVxuICogLSBgZnV6enlgIFRoZSBzZWFyY2ggdHlwZS4gSWYgdHJ1ZSBcImR2ZFwiIHdpbGwgbWF0Y2ggXCJkYXZpZFwiIChkZWZhdWx0OiBmYWxzZSlcbiAqIC0gYGl0ZW1MYWJlbEtleWAgVGhlIG9iamVjdCBrZXkgdG8gdXNlIGZvciB0aGUgaXRlbXMgbGFiZWwgKGRlZmF1bHQ6IFwibmFtZVwiKVxuICogLSBgbGlzdFRpdGxlYCBUaGUgdGl0bGUgYWJvdmUgdGhlIGxpc3QgKGRlZmF1bHQ6IFwiU2VsZWN0IGFuIGl0ZW1cIilcbiAqIC0gYG1heE51bUl0ZW1zYCBUaGUgbWF4aW11bSBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIGxpc3QgKGRlZmF1bHQ6IDEwKVxuICogLSBgbWF4TnVtSXRlbXNWaXNpYmxlYCBUaGUgbWF4aW11bSBudW1iZXIgb2YgaXRlbXMgdmlzaWJsZSAoZGVmYXVsdDogNylcbiAqIC0gYG1pbldpZHRoYCBUaGUgd2lkdGggb2YgdGhlIGxpc3QgKGRlZmF1bHQ6IDMwMClcbiAqIC0gYHNvcnRgIFRoZSBkZWZhdWx0IHNvcnQgW1wiXCIsIFwiYXNjXCIsIFwiZGVzY1wiXSAoZGVmYXVsdDogXCJkZXNjXCIpXG4gKiAtIGBzb3J0Q29udHJvbFZpc2libGVgIElmIHRoZSBzb3J0IGNvbnRyb2wgaXMgdmlzaWJsZSAoZGVmYXVsdDogdHJ1ZSlcbiAqXG4gKiAjIyMgRGVmYXVsdHNcbiAqXG4gKiBUbyBjaGFuZ2UgdGhlIGRlZmF1bHRzLCB1c2UgdGhlIGdsb2JhbCBgRmlsdGVyZWRMaXN0YCB2YXJpYWJsZS5cbiAqXG4gKiAgIEZpbHRlcmVkTGlzdC5kZWZhdWx0cy5tYXhOdW1JdGVtcyA9IDEwO1xuICpcbiAqICMjIyBFdmVudHNcbiAqXG4gKiBUaGUgYEZpbHRlcmVkTGlzdGAgdXNlcyBhbiBldmVudCBiYXNlZCBzeXN0ZW0gd2l0aCBtZXRob2RzIGBvbmAsIGBvZmZgIGFuZFxuICogYG9uY2VgLlxuICpcbiAqICAgbXlMaXN0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe30pO1xuICpcbiAqICoqRXZlbnRzKipcbiAqXG4gKiAtIGBjaGFuZ2VgIFdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhbmQgaXRlbSBhbmQgdGhlIHZhbHVlIGhhcyBjaGFuZ2VkXG4gKiAtIGBjbG9zZWAgV2hlbiB0aGUgbGlzdCBjbG9zZXNcbiAqIC0gYGRlc3Ryb3lgIFdoZW4gdGhlIGBGaWx0ZXJlZExpc3RgIGlzIGRlc3Ryb3llZFxuICogLSBgZmlsdGVyZWRgIFdoZW4gdGhlIHNlYXJjaCB2YWx1ZSBjaGFuZ2VzXG4gKiAtIGBpdGVtRm9jdXNgIFdoZW4gYW4gaXRlbSBpbiB0aGUgbGlzdCBnYWlucyBmb2N1c1xuICogLSBgb3BlbmAgV2hlbiB0aGUgbGlzdCBvcGVuc1xuICogLSBgc29ydGAgV2hlbiB0aGUgbGlzdCBpcyBzb3J0ZWRcbiAqIC0gYHJlZHJhd2AgV2hlbiB0aGUgbGlzdCByZWRyYXdzIGl0c2VsZlxuICogLSBgZmV0Y2hgIFdoZW4gdGhlIGxpc3QgdHJpZXMgdG8gZmV0Y2ggZGF0YSBiYXNlZCBvbiB0aGUgc2VhcmNoIHRlcm1cbiAqXG4gKiAjIyMgU3R5bGluZ1xuICpcbiAqIENTUyBpcyBwcm92aWRlZCBhbmQgaXMgcmVxdWlyZWQgaG93ZXZlciBpdCBpcyBwbGFpbiBieSBkZXNpZ24uIFRoZXJlIGFyZSAyXG4gKiB3YXlzIHRvIG1ha2UgdGhlIGxpc3QgcHJldHR5LlxuICpcbiAqIDEuIEluY2x1ZGUgYm9vdHN0cmFwIDMueFxuICogMi4gV3JpdGUgeW91ciBvd25cbiAqXG4gKiAjIyMgVGVtcGxhdGVzXG4gKlxuICogVGhlIG1hcmt1cCB0aGF0IGlzIGdlbmVyYXRlZCBvbiBpbnN0YW50aWF0aW9uIGlzIHRlbXBsYXRlIGRyaXZlbi4gVGhlc2UgdGVtcGxhdGVzXG4gKiBjYW4gYmUgY2hhbmdlZCBpZiBuZWNlc3NhcnkuXG4gKlxuICogKipGaWx0ZXJlZExpc3QudGVtcGxhdGVzLmxpc3RXcmFwcGVyKipcbiAqXG4gKiAgIDxkaXYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWNvbnRhaW5lcic+e3shY29uZmlnLnRlbXBsYXRlcy5saXN0SW5wdXR9fXt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdEhlYWRlcn19e3shY29uZmlnLnRlbXBsYXRlcy5saXN0SXRlbVdyYXBwZXJ9fTwvZGl2PlxuICpcbiAqICoqRmlsdGVyZWRMaXN0LnRlbXBsYXRlcy5saXN0SW5wdXQqKlxuICpcbiAqICAgPGRpdiBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taW5wdXQtY29udGFpbmVyJz48aW5wdXQgdHlwZT0ndGV4dCcgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWlucHV0IGZvcm0tY29udHJvbCc+PC9kaXY+XG4gKlxuICogKipGaWx0ZXJlZExpc3QudGVtcGxhdGVzLmxpc3RIZWFkZXIqKlxuICpcbiAqICAgPGhlYWRlciBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taGVhZGVyIHBhbmVsLWhlYWRpbmcnPnt7IWNvbmZpZy5kZWZhdWx0cy5saXN0VGl0bGV9fXt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdFNvcnRUb2dnbGV9fTwvaGVhZGVyPlxuICpcbiAqICoqRmlsdGVyZWRMaXN0LnRlbXBsYXRlcy5saXN0SXRlbVdyYXBwZXIqKlxuICpcbiAqICAgPGRpdiBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taXRlbXMgbGlzdC1ncm91cCc+PC9kaXY+XG4gKlxuICogKipGaWx0ZXJlZExpc3QudGVtcGxhdGVzLmxpc3RJdGVtKipcbiAqXG4gKiAgIDxhIGhyZWYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWl0ZW0gbGlzdC1ncm91cC1pdGVtJyBkYXRhLWNpZD0ne3tjaWR9fSc+e3sha2V5fX08L2E+XG4gKlxuICogKipGaWx0ZXJlZExpc3QudGVtcGxhdGVzLmxpc3RTb3J0VG9nZ2xlKipcbiAqXG4gKiAgIDxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0tc29ydC10b2dnbGUgYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cycgdGl0bGU9J3NvcnQnPjwvYnV0dG9uPlxuICpcbiAqIEBjbGFzcyBGaWx0ZXJlZExpc3RcbiAqIEBwYXJhbSB7alF1ZXJ5fEhUTUxFbGVtZW50fSBfZWwgVGhlIGVsZW1lbnQgeW91IHdhbnQgdG8gYXR0YWNoIHRoZSBsaXN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gX2RlZmF1bHRzIEEgZGVmYXVsdHMgb2JqZWN0XG4gKiBAcHJvcGVydHkge1N0cmluZ30gX19jaWQgQW4gYXV0b21hdGVkIEdVSUQgdXNlZCBpbnRlcm5hbGx5XG4gKiBAcHJvcGVydHkge1N0cmluZ30gX19jb25maWcgVGhlIGNvbmZpZ1xuICogQHByb3BlcnR5IHtCb29sZWFufSBfX2Rlc3Ryb3llZCBXaGV0aGVyIG9yIG5vdCB0aGUgb2JqZWN0IGhhcyBiZWVuIGRlc3Ryb3llZFxuICogQHJldHVybiB7RmlsdGVyZWRMaXN0fVxuICovXG52YXIgRmlsdGVyZWRMaXN0ID0gZnVuY3Rpb24gKCBfZWwsIF9kZWZhdWx0cyApIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNpZCA9IGd1aWQuZ2VuZXJhdGUoKSxcbiAgICBkZWZhdWx0cyxcbiAgICBsb2NhbENvbmZpZztcblxuICBzZWxmLiRlbCA9ICQoIF9lbCApO1xuXG4gIGlmICggc2VsZi4kZWwubGVuZ3RoID09PSAwICkge1xuICAgIHRocm93IG5ldyBFcnJvciggXCJBbiBpbnZhbGlkIERPTSBlbGVtZW50IHdhcyBnaXZlblwiICk7XG4gIH1cblxuICBkZWZhdWx0cyA9ICQuZXh0ZW5kKCB7fSwgY29uZmlnLmRlZmF1bHRzLCBzZWxmLiRlbC5kYXRhKCBjb25maWcuY2xhc3NOYW1lICsgXCItb3B0aW9uc1wiICksIF9kZWZhdWx0cyApO1xuXG4gIGxvY2FsQ29uZmlnID0gJC5leHRlbmQoIHt9LCBjb25maWcsIHtcbiAgICBkZWZhdWx0czogZGVmYXVsdHNcbiAgfSApO1xuXG4gIHNlbGYuJGVsLndyYXAoIFwiPHNwYW4gY2xhc3M9J1wiICsgbG9jYWxDb25maWcuY2xhc3NOYW1lICsgXCInIGRhdGEtc2MtZmlsdGVyZWQtbGlzdC1jaWQ9J1wiICsgY2lkICsgXCInPlwiICk7XG4gIHNlbGYuJHdyYXBwZXIgPSBzZWxmLiRlbC5wYXJlbnQoKTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggc2VsZiwge1xuICAgIFwiX19jaWRcIjoge1xuICAgICAgdmFsdWU6IGNpZFxuICAgIH0sXG4gICAgXCJfX2NvbmZpZ1wiOiB7XG4gICAgICB2YWx1ZTogbG9jYWxDb25maWcsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2Rlc3Ryb3llZFwiOiB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2ZldGNoaW5nXCI6IHtcbiAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9faXRlbXNcIjoge1xuICAgICAgdmFsdWU6IHt9LFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19sYWJlbFwiOiB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fbGFzdEZldGNoZWRWYWx1ZVwiOiB7XG4gICAgICB2YWx1ZTogXCJcIixcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fb3JpZ2luYWxcIjoge1xuICAgICAgdmFsdWU6IHt9LFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19zb3J0XCI6IHtcbiAgICAgIHZhbHVlOiBcIlwiLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX192YWx1ZVwiOiB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcImFjdGl2ZUl0ZW1cIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLmFjdGl2ZUl0ZW1HZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLmFjdGl2ZUl0ZW1TZXQuYmluZCggc2VsZiApXG4gICAgfSxcbiAgICBcIml0ZW1zXCI6IHtcbiAgICAgIHZhbHVlOiBvYnNlcnZhYmxlQXJyYXkoIFtdICksXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJsYWJlbFwiOiB7XG4gICAgICBnZXQ6IGhlbHBlcnMubGFiZWxHZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLmxhYmVsU2V0LmJpbmQoIHNlbGYgKVxuICAgIH0sXG4gICAgXCJsaXN0XCI6IHtcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcImxpc3RWaXNpYmxlXCI6IHtcbiAgICAgIGdldDogaGVscGVycy5saXN0VmlzaWJsZUdldC5iaW5kKCBzZWxmICksXG4gICAgICBzZXQ6IGhlbHBlcnMubGlzdFZpc2libGVTZXQuYmluZCggc2VsZiApXG4gICAgfSxcbiAgICBcInJlc3VsdHNcIjoge1xuICAgICAgdmFsdWU6IFtdLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwic29ydFwiOiB7XG4gICAgICBnZXQ6IGhlbHBlcnMuc29ydEdldC5iaW5kKCBzZWxmICksXG4gICAgICBzZXQ6IGhlbHBlcnMuc29ydFNldC5iaW5kKCBzZWxmIClcbiAgICB9LFxuICAgIFwidmFsdWVcIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLnZhbHVlR2V0LmJpbmQoIHNlbGYgKSxcbiAgICAgIHNldDogaGVscGVycy52YWx1ZVNldC5iaW5kKCBzZWxmIClcbiAgICB9XG4gIH0gKTtcblxuICBzZWxmLmxpc3QgPSBuZXcgTGlzdCggc2VsZiApO1xuICBzZWxmLl9fb3JpZ2luYWwuYnV0dG9uVGV4dCA9IHNlbGYuJGVsLnRleHQoKTtcblxuICB2YXIgaXRlbVZhbHVlID0ge307XG4gIGl0ZW1WYWx1ZVsgc2VsZi5fX2NvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXkgXSA9IHNlbGYuX19jb25maWcuZGVmYXVsdHMuYnV0dG9uTGFiZWw7XG4gIHNlbGYudmFsdWUgPSBpdGVtVmFsdWU7XG5cbiAgc2VsZi4kZWxcbiAgICAuYWRkQ2xhc3MoIHNlbGYuX19jb25maWcuY2xhc3NOYW1lICsgXCItYnV0dG9uXCIgKVxuICAgIC5kYXRhKCBzZWxmLl9fY29uZmlnLm5hbWUsIHNlbGYgKVxuICAgIC50cmlnZ2VyKCBzZWxmLl9fY29uZmlnLm5hbWUgKyBcIi1yZWFkeVwiICk7XG5cbiAgaWYgKCBzZWxmLl9fY29uZmlnLmRlZmF1bHRzLnNvcnRDb250cm9sVmlzaWJsZSAhPT0gdHJ1ZSApIHtcbiAgICBzZWxmLiR3cmFwcGVyLmFkZENsYXNzKCBzZWxmLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLXNvcnQtaGlkZGVuXCIgKTtcbiAgfVxuXG4gIFsgXCJwdXNoXCIsIFwic2hpZnRcIiBdLmZvckVhY2goIGZ1bmN0aW9uICggX21ldGhvZCApIHtcbiAgICBzZWxmLml0ZW1zLm9uKCBfbWV0aG9kLCBoZWxwZXJzWyBcIml0ZW1cIiArIF9tZXRob2QgXS5iaW5kKCBzZWxmICkgKTtcbiAgfSApO1xuXG4gICQoIHdpbmRvdyApLm9uKCBcImNsaWNrLlwiICsgc2VsZi5fX2NvbmZpZy5uYW1lLCBoZWxwZXJzLmJvZHlDbGljay5iaW5kKCBzZWxmICkgKTtcblxuICBzZWxmLmZldGNoKCk7XG4gIHNlbGYuZW1pdCggc2VsZi5fX2NvbmZpZy5uYW1lICsgXCItcmVhZHlcIiApO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGFycmF5IG9mIG9iamVjdHMvaXRlbXMgaW4gYnVsa1xuICpcbiAqICAgbXlMaXN0LmRhdGEoW3tcbiAqICAgICBuYW1lOiBcImRhdmlkXCJcbiAqICAgfSwge1xuICogICAgIG5hbWU6IFwibWF4XCJcbiAqICAgfV0pO1xuICpcbiAqICMjIEFkZCBhIHNpbmdsZSBvYmplY3QvaXRlbVxuICpcbiAqICAgbXlMaXN0Lml0ZW1zLnB1c2goe1xuICogICAgIG5hbWU6IFwiZGF2aWRcIlxuICogICB9KTtcbiAqXG4gKiAjIyBHZXQgdGhlIHZhbHVlXG4gKlxuICogVG8gZ2V0IHRoZSB2YWx1ZSBvZiB0aGUgc2VsZWN0ZWQgb2JqZWN0L2l0ZW0gdXNlIHRoZSBgdmFsdWVgIHByb3BlcnR5LlxuICpcbiAqICAgbXlMaXN0LnZhbHVlO1xuICpcbiAqL1xuRmlsdGVyZWRMaXN0LnByb3RvdHlwZS5kYXRhID0gZnVuY3Rpb24gKCBfYXJyYXlPZkl0ZW1zICkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBpdGVtcyA9IGlzLmFycmF5KCBfYXJyYXlPZkl0ZW1zICkgPyBfYXJyYXlPZkl0ZW1zIDogW107XG5cbiAgaXRlbXMuZm9yRWFjaCggZnVuY3Rpb24gKCBfaXRlbSApIHtcbiAgICBpZiAoIGlzLmFuLm9iamVjdCggX2l0ZW0gKSApIHtcbiAgICAgIHNlbGYuaXRlbXMucHVzaCggX2l0ZW0gKTtcbiAgICB9XG4gIH0gKTtcbn07XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIGBGaWx0ZXJlZExpc3RgIGFuZCBpbnZhbGlkYXRlcyB0aGUgb2JqZWN0LlxuICpcbiAqICAgbXlMaXN0LmRlc3Ryb3koKTtcbiAqXG4gKiA+IEFueSBmdXJ0aGVyIGNhbGxlcyB0byBtZXRob2RzIGxpa2UgYGRlc3Ryb3lgIG9yIGBkYXRhYCBldGMgd2lsbCByZXR1cm5cbiAqIG5vdGhpbmcuXG4gKi9cbkZpbHRlcmVkTGlzdC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZWxmLl9fZGVzdHJveWVkID0gdHJ1ZTtcbiAgc2VsZi5saXN0LmRlc3Ryb3koKTtcbiAgJCggd2luZG93ICkub2ZmKCBcIi5cIiArIHNlbGYuX19jb25maWcubmFtZSApO1xuXG4gIHNlbGYuJGVsXG4gICAgLnRleHQoIHNlbGYuX19vcmlnaW5hbC5idXR0b25UZXh0IClcbiAgICAudW53cmFwKClcbiAgICAuZGF0YSggc2VsZi5fX2NvbmZpZy5uYW1lLCBudWxsIClcbiAgICAucmVtb3ZlQ2xhc3MoIHNlbGYuX19jb25maWcuY2xhc3NOYW1lICsgXCItYnV0dG9uXCIgKTtcblxuICBzZWxmLmVtaXQoIFwiZGVzdHJveVwiICk7XG59O1xuXG5GaWx0ZXJlZExpc3QucHJvdG90eXBlLmZldGNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB2YWx1ZSA9IHNlbGYubGlzdC4kaW5wdXQudmFsKCk7XG5cbiAgc2VsZi5fX2xhc3RGZXRjaGVkVmFsdWUgPSB2YWx1ZTtcbiAgc2VsZi5lbWl0KCBcImZldGNoXCIsIHNlbGYuX19sYXN0RmV0Y2hlZFZhbHVlICk7XG59O1xuXG5lbWl0dGVyKCBGaWx0ZXJlZExpc3QucHJvdG90eXBlICk7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEZpbHRlcmVkTGlzdDtcbmV4cG9ydHMuZGVmYXVsdHMgPSBjb25maWcuZGVmYXVsdHM7XG5leHBvcnRzLnRlbXBsYXRlcyA9IGNvbmZpZy50ZW1wbGF0ZXM7XG5cbiQoIGZ1bmN0aW9uICgpIHtcbiAgJCggXCJidXR0b25bZGF0YS1cIiArIGNvbmZpZy5jbGFzc05hbWUgKyBcIl1cIiApLmVhY2goIGZ1bmN0aW9uICggX2ksIF9lbCApIHtcbiAgICBuZXcgRmlsdGVyZWRMaXN0KCBfZWwgKTtcbiAgfSApO1xufSApOyIsInZhciBpcyA9IHJlcXVpcmUoIFwic2MtaXNcIiApLFxuICBJdGVtVmFsdWUgPSByZXF1aXJlKCBcIi4vaXRlbS12YWx1ZVwiICksXG4gIHNvcnRUb2dnbGVPcHRpb25zID0gWyBcIlwiLCBcImRlc2NcIiwgXCJhc2NcIiBdLFxuICBtZDUgPSByZXF1aXJlKCBcInNjLW1kNVwiICk7XG5cbmV4cG9ydHMuYWN0aXZlSXRlbUdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlci5saXN0LmdldEFjdGl2ZUl0ZW0oKTtcbn07XG5cbmV4cG9ydHMuYWN0aXZlSXRlbVNldCA9IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmaWx0ZXIudmFsdWUgPSBfdmFsdWU7XG4gIGZpbHRlci5lbWl0KCBcImNoYW5nZVwiLCBfdmFsdWUgKTtcbn07XG5cbmV4cG9ydHMuYWN0aXZlSXRlbUluZGV4R2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gbGlzdC5fX2FjdGl2ZUl0ZW1JbmRleDtcbn07XG5cbmV4cG9ydHMuYWN0aXZlSXRlbUluZGV4U2V0ID0gZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG4gIHZhciBsaXN0ID0gdGhpcztcblxuICBpZiAoIGxpc3QuZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBpbmRleCA9IGlzLmEubnVtYmVyKCBfdmFsdWUgKSA/IF92YWx1ZSA6IDAsXG4gICAgaXRlbUFjdGl2ZUNsYXNzTmFtZSA9IGxpc3QuZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWl0ZW0tYWN0aXZlXCIsXG4gICAgJGl0ZW1DaGlsZHJlbiA9IGxpc3QuJGxpc3QuY2hpbGRyZW4oKSxcbiAgICAkZmlyc3RJdGVtID0gJCggJGl0ZW1DaGlsZHJlblsgMCBdICksXG4gICAgJGFjdGl2ZUl0ZW1JbmRleEJ5Q2xhc3MgPSBsaXN0LiRsaXN0LmZpbmQoIFwiLlwiICsgaXRlbUFjdGl2ZUNsYXNzTmFtZSApLFxuICAgICRhY3RpdmVJdGVtSW5kZXhCeUluZGV4ID0gJCggJGl0ZW1DaGlsZHJlblsgaW5kZXggXSApLFxuICAgICRhY3RpdmVJdGVtSW5kZXggPSAkYWN0aXZlSXRlbUluZGV4QnlJbmRleC5sZW5ndGggPT09IDEgPyAkYWN0aXZlSXRlbUluZGV4QnlJbmRleCA6ICRhY3RpdmVJdGVtSW5kZXhCeUNsYXNzLmxlbmd0aCA9PT0gMSA/ICRhY3RpdmVJdGVtSW5kZXhCeUNsYXNzIDogJGZpcnN0SXRlbTtcblxuICAkYWN0aXZlSXRlbUluZGV4QnlDbGFzcy5yZW1vdmVDbGFzcyggaXRlbUFjdGl2ZUNsYXNzTmFtZSApO1xuICAkYWN0aXZlSXRlbUluZGV4LmFkZENsYXNzKCBpdGVtQWN0aXZlQ2xhc3NOYW1lICk7XG4gIGxpc3QuX19hY3RpdmVJdGVtSW5kZXggPSAkaXRlbUNoaWxkcmVuLmluZGV4KCAkYWN0aXZlSXRlbUluZGV4ICk7XG5cbiAgaWYgKCBsaXN0Ll9fdmlzaWJsZSApIHtcbiAgICBsaXN0LmZpbHRlci5lbWl0KCBcIml0ZW1Gb2N1c1wiICk7XG4gIH1cbn07XG5cbmV4cG9ydHMuYm9keUNsaWNrID0gZnVuY3Rpb24gKCBfZXZlbnQgKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBidXR0b25DbGFzcyA9IFwiLlwiICsgZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWJ1dHRvblwiLFxuICAgIGNvbnRhaW5lckNsYXNzID0gXCIuXCIgKyBmaWx0ZXIuX19jb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyXCIsXG4gICAgJGNsaWNrZWRFbGVtZW50ID0gJCggaXMub2JqZWN0KCBfZXZlbnQgKSAmJiBfZXZlbnQudGFyZ2V0ID8gX2V2ZW50LnRhcmdldCA6IG51bGwgKSxcbiAgICAkdGhpc1BhcmVudCA9ICRjbGlja2VkRWxlbWVudC5jbG9zZXN0KCBcIltkYXRhLVwiICsgZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWNpZD1cIiArIGZpbHRlci5fX2NpZCArIFwiXVwiICksXG4gICAgY2xpY2tlZEJ1dHRvbiA9ICR0aGlzUGFyZW50Lmxlbmd0aCA+IDAgJiYgKCAkY2xpY2tlZEVsZW1lbnQuaXMoIGJ1dHRvbkNsYXNzICkgfHwgJGNsaWNrZWRFbGVtZW50LmNsb3Nlc3QoIGJ1dHRvbkNsYXNzICkubGVuZ3RoICkgPyB0cnVlIDogZmFsc2UsXG4gICAgY2xpY2tlZExpc3QgPSAkdGhpc1BhcmVudC5sZW5ndGggPiAwICYmICggJGNsaWNrZWRFbGVtZW50LmlzKCBjb250YWluZXJDbGFzcyApIHx8ICRjbGlja2VkRWxlbWVudC5jbG9zZXN0KCBjb250YWluZXJDbGFzcyApLmxlbmd0aCApID8gdHJ1ZSA6IGZhbHNlO1xuXG4gIGlmICggY2xpY2tlZEJ1dHRvbiAmJiAhZmlsdGVyLmxpc3RWaXNpYmxlICkge1xuICAgIGZpbHRlci5saXN0VmlzaWJsZSA9IHRydWU7XG4gIH0gZWxzZSBpZiAoIGZpbHRlci5saXN0VmlzaWJsZSAmJiAhY2xpY2tlZExpc3QgKSB7XG4gICAgZmlsdGVyLmxpc3RWaXNpYmxlID0gZmFsc2U7XG4gIH1cbn07XG5cbmV4cG9ydHMuZmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uICggX2V2ZW50ICkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIga2V5Q29kZSA9IGlzLm9iamVjdCggX2V2ZW50ICkgJiYgaXMubnVtYmVyKCBfZXZlbnQua2V5Q29kZSApID8gX2V2ZW50LmtleUNvZGUgOiAtMSxcbiAgICB2YWwgPSBsaXN0LiRpbnB1dC52YWwoKTtcblxuICBzd2l0Y2ggKCBrZXlDb2RlICkge1xuICBjYXNlIDI3OiAvLyBlc2NhcGVcbiAgICBsaXN0LmNsb3NlKCk7XG4gICAgYnJlYWs7XG4gIGNhc2UgMTM6IC8vIGVudGVyXG4gICAgbGlzdC5jbG9zZSgpO1xuICAgIGxpc3QuZmlsdGVyLmFjdGl2ZUl0ZW0gPSBsaXN0LmdldEFjdGl2ZUl0ZW0oKTtcbiAgICBicmVhaztcbiAgY2FzZSAzODogLy8gdXBcbiAgICBsaXN0LmFjdGl2ZUl0ZW1JbmRleC0tO1xuICAgIGJyZWFrO1xuICBjYXNlIDQwOiAvLyBkb3duXG4gICAgbGlzdC5hY3RpdmVJdGVtSW5kZXgrKztcbiAgICBicmVhaztcbiAgZGVmYXVsdDpcbiAgICBpZiAoIGtleUNvZGUgPj0gMCApIHtcbiAgICAgIGxpc3QuZmlsdGVyLmVtaXQoIFwiZmlsdGVyQ2hhbmdlZFwiLCB2YWwgKTtcbiAgICAgIGxpc3QuZmlsdGVyLmZldGNoKCk7XG4gICAgfVxuICAgIGJyZWFrO1xuICB9XG5cbn07XG5cbmV4cG9ydHMuaW5kZXhPZiA9IGZ1bmN0aW9uICggX2FycmF5LCBfdmFsdWUgKSB7XG4gIHZhciBhcnJheSA9IGlzLmFycmF5KCBfYXJyYXkgKSA/IF9hcnJheSA6IFtdLFxuICAgIGluZGV4ID0gLTE7XG5cbiAgYXJyYXkuZm9yRWFjaCggZnVuY3Rpb24gKCBfdmFsLCBfaSApIHtcbiAgICBpZiAoIGluZGV4ID09PSAtMSAmJiBfdmFsdWUgPT09IF92YWwgKSB7XG4gICAgICBpbmRleCA9IF9pO1xuICAgIH1cbiAgfSApO1xuXG4gIHJldHVybiBpbmRleDtcbn07XG5cbmV4cG9ydHMud2luZG93S2V5VXAgPSBmdW5jdGlvbiAoIF9ldmVudCApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGtleUNvZGUgPSBpcy5vYmplY3QoIF9ldmVudCApICYmIGlzLm51bWJlciggX2V2ZW50LmtleUNvZGUgKSA/IF9ldmVudC5rZXlDb2RlIDogLTE7XG5cbiAgc3dpdGNoICgga2V5Q29kZSApIHtcbiAgY2FzZSAyNzogLy8gZXNjYXBlXG4gICAgbGlzdC5jbG9zZSgpO1xuICAgIGJyZWFrO1xuICB9XG59O1xuXG5leHBvcnRzLml0ZW1DbGljayA9IGZ1bmN0aW9uICggX2V2ZW50ICkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBfZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICB2YXIgJGl0ZW0gPSAkKCBfZXZlbnQuY3VycmVudFRhcmdldCApO1xuXG4gIGxpc3QuYWN0aXZlSXRlbUluZGV4ID0gJGl0ZW0ucGFyZW50KCkuY2hpbGRyZW4oKS5pbmRleCggJGl0ZW0gKTtcbiAgbGlzdC5maWx0ZXIuYWN0aXZlSXRlbSA9IGxpc3QuZ2V0QWN0aXZlSXRlbSgpO1xuICBsaXN0LmNsb3NlKCk7XG59O1xuXG5leHBvcnRzLml0ZW1wdXNoID0gZnVuY3Rpb24gKCBfaXRlbSApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCAhX2l0ZW0uaGFzT3duUHJvcGVydHkoIFwiX19jaWRcIiApICkge1xuICAgIHZhciBpdGVtSGFzaCA9IG1kNSggX2l0ZW0gKTtcblxuICAgIGlmICggIWZpbHRlci5fX2l0ZW1zWyBpdGVtSGFzaCBdICkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBfaXRlbSwgXCJfX2NpZFwiLCB7XG4gICAgICAgIHZhbHVlOiBpdGVtSGFzaFxuICAgICAgfSApO1xuICAgICAgZmlsdGVyLl9faXRlbXNbIGl0ZW1IYXNoIF0gPSBfaXRlbTtcbiAgICAgIGZpbHRlci5pdGVtcy5fX3B1c2goIF9pdGVtICk7XG4gICAgICBmaWx0ZXIubGlzdC5yZWRyYXcoKTtcbiAgICB9XG4gIH1cblxufTtcblxuZXhwb3J0cy5pdGVtc2hpZnQgPSBmdW5jdGlvbiAoIF9pdGVtICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaXRlbUhhc2ggPSBtZDUoIF9pdGVtICk7XG4gIGRlbGV0ZSBmaWx0ZXIuX19pdGVtc1sgaXRlbUhhc2ggXTtcbiAgZmlsdGVyLml0ZW1zLl9fc2hpZnQoKTtcbn07XG5cbmV4cG9ydHMubGFiZWxHZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBmaWx0ZXIuX19sYWJlbDtcbn07XG5cbmV4cG9ydHMubGFiZWxTZXQgPSBmdW5jdGlvbiAoIF9sYWJlbCApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZmlsdGVyLl9fbGFiZWwgPSBfbGFiZWwgfHwgZmlsdGVyLl9fY29uZmlnLmRlZmF1bHRzLmRlZmF1bHRCdXR0b25MYWJlbDtcbiAgZmlsdGVyLiRlbC50ZXh0KCBmaWx0ZXIuX19sYWJlbCApO1xuICByZXR1cm4gZmlsdGVyLl9fbGFiZWw7XG59O1xuXG5leHBvcnRzLmxpc3RWaXNpYmxlR2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gZmlsdGVyLmxpc3QuX192aXNpYmxlO1xufTtcblxuZXhwb3J0cy5saXN0VmlzaWJsZVNldCA9IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdmlzaWJsZSA9IF92YWx1ZSA9PT0gdHJ1ZSB8fCBmYWxzZTtcbiAgcmV0dXJuIHZpc2libGUgPyBmaWx0ZXIubGlzdC5vcGVuKCkgOiBmaWx0ZXIubGlzdC5jbG9zZSgpO1xufTtcblxuZXhwb3J0cy5wdXRGb2N1c3NlZEl0ZW1JblZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsaXN0ID0gdGhpcztcblxuICBpZiAoIGxpc3QuZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbGlzdEhlaWdodCA9IGxpc3QuJGxpc3QuaGVpZ2h0KCksXG4gICAgICBmb2N1c3NlZEl0ZW0gPSBsaXN0LiRsaXN0LmZpbmQoIFwiLlwiICsgbGlzdC5maWx0ZXIuX19jb25maWcuY2xhc3NOYW1lICsgXCItaXRlbS1hY3RpdmVcIiApO1xuXG4gICAgaWYgKCBmb2N1c3NlZEl0ZW0ubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBpdGVtSGVpZ2h0ID0gZm9jdXNzZWRJdGVtLm91dGVySGVpZ2h0KCksXG4gICAgICBpdGVtVG9wID0gZm9jdXNzZWRJdGVtLnBvc2l0aW9uKCkudG9wLCAvLyBUT0RPOiBvZmZzZXQgdG9wIGNvdWxkIGJlIGdvb2QgZW5vdWdoIGhlcmVcbiAgICAgIGl0ZW1Cb3R0b20gPSBpdGVtVG9wICsgaXRlbUhlaWdodDtcblxuICAgIGlmICggaXRlbVRvcCA8IDAgfHwgaXRlbUJvdHRvbSA+IGxpc3RIZWlnaHQgKSB7XG4gICAgICBmb2N1c3NlZEl0ZW1bIDAgXS5zY3JvbGxJbnRvVmlldyggaXRlbVRvcCA8IDAgKTtcbiAgICB9XG5cbiAgfSwgMTAgKTtcbn07XG5cbmV4cG9ydHMuc29ydEdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlci5fX3NvcnQ7XG59O1xuXG5leHBvcnRzLnNvcnRTZXQgPSBmdW5jdGlvbiAoIF92YWx1ZSApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXMsXG4gICAgc29ydE9wdGlvbjtcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc29ydENsYXNzTmFtZSA9IGZpbHRlci5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1zb3J0LVwiLFxuICAgIHNvcnRDbGFzc05hbWVzID0gc29ydFRvZ2dsZU9wdGlvbnMuam9pbiggXCIgXCIgKyBzb3J0Q2xhc3NOYW1lICkudHJpbSgpO1xuXG4gIHNvcnRUb2dnbGVPcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uICggX3NvcnRPcHRpb24gKSB7XG4gICAgaWYgKCAhc29ydE9wdGlvbiAmJiBfc29ydE9wdGlvbiA9PT0gX3ZhbHVlICkge1xuICAgICAgc29ydE9wdGlvbiA9IF92YWx1ZTtcbiAgICB9XG4gIH0gKTtcblxuICBmaWx0ZXIuX19zb3J0ID0gc29ydE9wdGlvbiB8fCBzb3J0VG9nZ2xlT3B0aW9uc1sgMCBdO1xuICBmaWx0ZXIubGlzdC5yZWRyYXcoKTtcbiAgZmlsdGVyLiR3cmFwcGVyLnJlbW92ZUNsYXNzKCBzb3J0Q2xhc3NOYW1lcyApLmFkZENsYXNzKCBmaWx0ZXIuX19zb3J0ID8gc29ydENsYXNzTmFtZSArIGZpbHRlci5fX3NvcnQgOiBcIlwiICk7XG4gIGZpbHRlci5lbWl0KCBcInNvcnRcIiApO1xuICByZXR1cm4gZmlsdGVyLl9fc29ydDtcbn07XG5cbmV4cG9ydHMuc29ydFRvZ2dsZUNsaWNrZWQgPSBmdW5jdGlvbiAoIF9ldmVudCApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGZpbHRlciA9IGxpc3QuZmlsdGVyLFxuICAgIGN1cnJlbnRTb3J0ID0gZmlsdGVyLnNvcnQsXG4gICAgaW5kZXggPSBleHBvcnRzLmluZGV4T2YoIHNvcnRUb2dnbGVPcHRpb25zLCBjdXJyZW50U29ydCApLFxuICAgIG5leHRJbmRleCA9IGluZGV4ICsgMSxcbiAgICBuZXh0U29ydCA9IHNvcnRUb2dnbGVPcHRpb25zWyBuZXh0SW5kZXggXSA9PT0gdW5kZWZpbmVkID8gc29ydFRvZ2dsZU9wdGlvbnNbIDAgXSA6IHNvcnRUb2dnbGVPcHRpb25zWyBuZXh0SW5kZXggXTtcblxuICBmaWx0ZXIuc29ydCA9IG5leHRTb3J0O1xufTtcblxuZXhwb3J0cy52YWx1ZUdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlci5fX3ZhbHVlLnZhbHVlO1xufTtcblxuZXhwb3J0cy52YWx1ZVNldCA9IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmaWx0ZXIuX192YWx1ZSA9IG5ldyBJdGVtVmFsdWUoIGZpbHRlci5fX2NvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXksIF92YWx1ZSApO1xuICBmaWx0ZXIubGFiZWwgPSBmaWx0ZXIuX192YWx1ZS5rZXk7XG4gIGZpbHRlci4kZWwudGV4dCggZmlsdGVyLmxhYmVsICk7XG4gIHJldHVybiBmaWx0ZXIuX192YWx1ZTtcbn07IiwidmFyIGlzID0gcmVxdWlyZSggXCJzYy1pc1wiICk7XG5cbnZhciBJdGVtVmFsdWUgPSBmdW5jdGlvbiAoIF9rZXksIF92YWx1ZSApIHtcbiAgdmFyIHZhbHVlID0ge307XG4gIHZhbHVlLmtleSA9IGlzLm9iamVjdCggX3ZhbHVlICkgJiYgaXMuc3RyaW5nKCBfdmFsdWVbIF9rZXkgXSApID8gX3ZhbHVlWyBfa2V5IF0gOiBcIlwiO1xuICB2YWx1ZS52YWx1ZSA9IF92YWx1ZTtcbiAgcmV0dXJuIHZhbHVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtVmFsdWU7IiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKCBcIi4vaGVscGVyc1wiICksXG4gIGZ1enp5ID0gcmVxdWlyZSggXCJmdXp6YWxkcmluXCIgKSxcbiAgbWVyZ2UgPSByZXF1aXJlKCBcInNjLW1lcmdlXCIgKSxcbiAgbWluc3RhY2hlID0gcmVxdWlyZSggXCJtaW5zdGFjaGVcIiApLFxuICBkZWJvdW5jZSA9IHJlcXVpcmUoIFwiZGVib3VuY2VcIiApO1xuXG52YXIgTGlzdCA9IGZ1bmN0aW9uICggX2ZpbHRlciApIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZztcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggc2VsZiwge1xuICAgIFwiX19hY3RpdmVJdGVtSW5kZXhcIjoge1xuICAgICAgdmFsdWU6IDAsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2Rlc3Ryb3llZFwiOiB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX3RlbXBsYXRlc1wiOiB7XG4gICAgICB2YWx1ZToge31cbiAgICB9LFxuICAgIFwiX192aXNpYmxlXCI6IHtcbiAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcImFjdGl2ZUl0ZW1JbmRleFwiOiB7XG4gICAgICBnZXQ6IGhlbHBlcnMuYWN0aXZlSXRlbUluZGV4R2V0LmJpbmQoIHNlbGYgKSxcbiAgICAgIHNldDogaGVscGVycy5hY3RpdmVJdGVtSW5kZXhTZXQuYmluZCggc2VsZiApXG4gICAgfSxcbiAgICBcImZpbHRlclwiOiB7XG4gICAgICB2YWx1ZTogX2ZpbHRlclxuICAgIH1cbiAgfSApO1xuXG4gIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIE9iamVjdC5rZXlzKCBjb25maWcudGVtcGxhdGVzICkuZm9yRWFjaCggZnVuY3Rpb24gKCBfdGVtcGxhdGVOYW1lICkge1xuICAgIHNlbGYuX190ZW1wbGF0ZXNbIF90ZW1wbGF0ZU5hbWUgXSA9IG1pbnN0YWNoZSggY29uZmlnLnRlbXBsYXRlc1sgX3RlbXBsYXRlTmFtZSBdLCB7XG4gICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgIGNpZDogXCJcIixcbiAgICAgIGtleTogXCJcIlxuICAgIH0gKTtcbiAgfSApO1xuXG4gIHNlbGYuJGVsID0gJCggbWluc3RhY2hlKCBzZWxmLl9fdGVtcGxhdGVzLmxpc3RXcmFwcGVyLCB7XG4gICAgY29uZmlnOiBtZXJnZSggY29uZmlnLCB7XG4gICAgICB0ZW1wbGF0ZXM6IHNlbGYuX190ZW1wbGF0ZXNcbiAgICB9IClcbiAgfSApICk7XG5cbiAgc2VsZi4kZWwud2lkdGgoIGNvbmZpZy5kZWZhdWx0cy5taW5XaWR0aCApO1xuXG4gIHNlbGYuJGlucHV0ID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaW5wdXRcIiApO1xuICBzZWxmLiRoZWFkZXIgPSBzZWxmLiRlbC5maW5kKCBcIi5cIiArIGNvbmZpZy5jbGFzc05hbWUgKyBcIi1oZWFkZXJcIiApO1xuICBzZWxmLiRsaXN0ID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaXRlbXNcIiApO1xuICBzZWxmLiRzb3J0VG9nZ2xlID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItc29ydC10b2dnbGVcIiApO1xuXG4gIHNlbGYuJGlucHV0Lm9uKCBcImNoYW5nZS5cIiArIGNvbmZpZy5uYW1lICsgXCIga2V5ZG93bi5cIiArIGNvbmZpZy5uYW1lLCBoZWxwZXJzLmZpbHRlckNoYW5nZWQuYmluZCggc2VsZiApICk7XG4gIHNlbGYuJHNvcnRUb2dnbGUub24oIFwiY2xpY2suXCIgKyBjb25maWcubmFtZSwgaGVscGVycy5zb3J0VG9nZ2xlQ2xpY2tlZC5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5maWx0ZXIub24oIFwiZmlsdGVyQ2hhbmdlZFwiLCBzZWxmLnJlZHJhdy5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5maWx0ZXIub24oIFwiaXRlbUZvY3VzXCIsIGhlbHBlcnMucHV0Rm9jdXNzZWRJdGVtSW5WaWV3LmJpbmQoIHNlbGYgKSApO1xuICBzZWxmLmZpbHRlci4kZWwuYWZ0ZXIoIHNlbGYuJGVsICk7XG5cbiAgc2VsZi5maWx0ZXIub25jZSggY29uZmlnLm5hbWUgKyBcIi1yZWFkeVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBjb25maWcuZGVmYXVsdHMuc29ydCApIHtcbiAgICAgIHNlbGYuZmlsdGVyLnNvcnQgPSBjb25maWcuZGVmYXVsdHMuc29ydDtcbiAgICB9XG4gIH0gKTtcbn07XG5cbkxpc3QucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgY29uZmlnID0gc2VsZi5maWx0ZXIuX19jb25maWc7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNlbGYuX192aXNpYmxlID0gZmFsc2U7XG4gIHNlbGYuJGVsLnJlbW92ZUNsYXNzKCBjb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyLXZpc2libGVcIiApO1xuICBzZWxmLmZpbHRlci5lbWl0KCBcImNsb3NlXCIgKTtcbiAgJCggd2luZG93ICkub2ZmKCBcImtleXVwLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgc2VsZi4kZWwub2ZmKCBcImNsaWNrLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgcmV0dXJuIHNlbGYuX192aXNpYmxlO1xufTtcblxuTGlzdC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZWxmLmZpbHRlci5fX2Rlc3Ryb3llZCA9IHNlbGYuX19kZXN0cm95ZWQgPSB0cnVlO1xuICAkKCB3aW5kb3cgKS5vZmYoIFwiLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgc2VsZi4kaW5wdXQub2ZmKCBcIi5cIiArIGNvbmZpZy5uYW1lICk7XG4gIHNlbGYuJGVsLm9mZiggXCIuXCIgKyBjb25maWcubmFtZSApO1xuICBzZWxmLiRzb3J0VG9nZ2xlLm9mZiggXCIuXCIgKyBjb25maWcubmFtZSApO1xuICBzZWxmLmZpbHRlci5vZmYoIFwiZmlsdGVyQ2hhbmdlZFwiICk7XG4gIHNlbGYuZmlsdGVyLm9mZiggXCJpdGVtRm9jdXNcIiApO1xuICBzZWxmLiRlbC5yZW1vdmUoKTtcblxufTtcblxuTGlzdC5wcm90b3R5cGUuZ2V0QWN0aXZlSXRlbSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgJHNlbGVjdGVkSXRlbSA9IHNlbGYuJGxpc3QuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaXRlbS1hY3RpdmVcIiApLFxuICAgIHNlbGVjdGVkSXRlbUhhc2ggPSAkc2VsZWN0ZWRJdGVtLmRhdGEoIFwiY2lkXCIgKSxcbiAgICBzZWxlY3RlZEl0ZW0gPSBzZWxmLmZpbHRlci5fX2l0ZW1zWyBzZWxlY3RlZEl0ZW1IYXNoIF07XG5cbiAgcmV0dXJuIHNlbGVjdGVkSXRlbTtcbn07XG5cbkxpc3QucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjb25maWcgPSBzZWxmLmZpbHRlci5fX2NvbmZpZztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc2VsZi5fX3Zpc2libGUgPSB0cnVlO1xuICBzZWxmLmZpbHRlci5lbWl0KCBcIm9wZW5cIiApO1xuICAkKCB3aW5kb3cgKS5vbiggXCJrZXl1cC5cIiArIGNvbmZpZy5uYW1lLCBoZWxwZXJzLndpbmRvd0tleVVwLmJpbmQoIHNlbGYgKSApO1xuICBzZWxmLiRlbC5vbiggXCJjbGljay5cIiArIGNvbmZpZy5uYW1lLCBcIi5cIiArIGNvbmZpZy5jbGFzc05hbWUgKyBcIi1pdGVtXCIsIGhlbHBlcnMuaXRlbUNsaWNrLmJpbmQoIHNlbGYgKSApO1xuICBzZWxmLnJlZHJhdygpO1xuXG4gIHNlbGYuZmlsdGVyLm9uY2UoIFwicmVkcmF3XCIsIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLiRpbnB1dC5mb2N1cygpLnNlbGVjdCgpO1xuICB9ICk7XG5cbiAgcmV0dXJuIHNlbGYuX192aXNpYmxlO1xufTtcblxuTGlzdC5wcm90b3R5cGUucmVkcmF3ID0gZGVib3VuY2UoIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmlsdGVyQnkgPSBzZWxmLiRpbnB1dC52YWwoKSB8fCBcIlwiLFxuICAgIGl0ZW1zTWFya3VwID0gXCJcIixcbiAgICByZXN1bHRzO1xuXG4gIGlmICggY29uZmlnLmRlZmF1bHRzLmZ1enp5ICkge1xuICAgIHJlc3VsdHMgPSBmdXp6eS5maWx0ZXIoIHNlbGYuZmlsdGVyLml0ZW1zLCBmaWx0ZXJCeSwge1xuICAgICAga2V5OiBjb25maWcuZGVmYXVsdHMuaXRlbUxhYmVsS2V5LFxuICAgICAgbWF4UmVzdWx0czogY29uZmlnLmRlZmF1bHRzLm1heE51bUl0ZW1zXG4gICAgfSApO1xuICB9IGVsc2Uge1xuICAgIHZhciByeCA9IG5ldyBSZWdFeHAoIFwiXFxcXGJcIiArIGZpbHRlckJ5LCBcImlcIiApO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBzZWxmLmZpbHRlci5pdGVtcy5mb3JFYWNoKCBmdW5jdGlvbiAoIF9pdGVtLCBfaSApIHtcbiAgICAgIGlmICggX2kgPCBjb25maWcuZGVmYXVsdHMubWF4TnVtSXRlbXMgKSB7XG4gICAgICAgIGlmICggcngudGVzdCggX2l0ZW1bIGNvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXkgXSApICkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCggX2l0ZW0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgaWYgKCBzZWxmLmZpbHRlci5fX3NvcnQgKSB7XG4gICAgcmVzdWx0cy5zb3J0KCBmdW5jdGlvbiAoIGEsIGIgKSB7XG4gICAgICB2YXIgb3JkZXIgPSBzZWxmLmZpbHRlci5fX3NvcnQgPT09IFwiZGVzY1wiID8gYS5uYW1lID4gYi5uYW1lIDogYS5uYW1lIDwgYi5uYW1lO1xuICAgICAgcmV0dXJuIG9yZGVyID8gMSA6IC0xO1xuICAgIH0gKTtcbiAgfVxuXG4gIHNlbGYuZmlsdGVyLnJlc3VsdHMgPSByZXN1bHRzO1xuXG4gIHNlbGYuZmlsdGVyLmVtaXQoIFwiZmlsdGVyZWRcIiApO1xuXG4gIHJlc3VsdHMuZm9yRWFjaCggZnVuY3Rpb24gKCBfaXRlbSApIHtcbiAgICBfaXRlbS5rZXkgPSBfaXRlbVsgY29uZmlnLmRlZmF1bHRzLml0ZW1MYWJlbEtleSBdO1xuICAgIGl0ZW1zTWFya3VwICs9IG1pbnN0YWNoZSggY29uZmlnLnRlbXBsYXRlcy5saXN0SXRlbSwgbWVyZ2UoIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgY2lkOiBfaXRlbS5fX2NpZFxuICAgIH0sIF9pdGVtICkgKTtcbiAgfSApO1xuXG4gIHNlbGYuJGxpc3QuZW1wdHkoKS5odG1sKCBpdGVtc01hcmt1cCApO1xuICBzZWxmLmFjdGl2ZUl0ZW1JbmRleCA9IHNlbGYuYWN0aXZlSXRlbUluZGV4O1xuXG4gIGlmICggc2VsZi5fX3Zpc2libGUgKSB7XG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHZpc2libGVJdGVtc0hlaWdodCA9IDA7XG4gICAgICBzZWxmLiRlbC5hZGRDbGFzcyggY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lci1pbnZpc2libGVcIiApO1xuXG4gICAgICBzZWxmLiRsaXN0LmZpbmQoIFwiPjpsdChcIiArIGNvbmZpZy5kZWZhdWx0cy5tYXhOdW1JdGVtc1Zpc2libGUgKyBcIilcIiApLmVhY2goIGZ1bmN0aW9uICggX2ksIF9lbCApIHtcbiAgICAgICAgdmlzaWJsZUl0ZW1zSGVpZ2h0ICs9ICQoIF9lbCApLm91dGVySGVpZ2h0KCk7XG4gICAgICB9ICk7XG5cbiAgICAgIHNlbGYuJGxpc3QuaGVpZ2h0KCB2aXNpYmxlSXRlbXNIZWlnaHQgKTtcbiAgICAgIHNlbGYuJGVsLmFkZENsYXNzKCBjb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyLXZpc2libGVcIiApLnJlbW92ZUNsYXNzKCBjb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyLWludmlzaWJsZVwiICk7XG4gICAgICBzZWxmLmZpbHRlci5lbWl0KCBcInJlZHJhd1wiICk7XG4gICAgfSwgMCApO1xuXG4gIH1cblxufSwgMTAgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0OyJdfQ==
(20)
});
