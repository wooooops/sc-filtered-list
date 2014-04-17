!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.scfilteredlist=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9kZWJvdW5jZS9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZW1pdHRlci1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL2Z1enphbGRyaW4vbGliL2ZpbHRlci5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZnV6emFsZHJpbi9saWIvZnV6emFsZHJpbi5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZnV6emFsZHJpbi92ZW5kb3Ivc3RyaW5nc2NvcmUuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL21pbnN0YWNoZS9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtZ3VpZC9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvZW1wdHkuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvZ3VpZC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvaXNlcy9udWxsb3J1bmRlZmluZWQuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvdHlwZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvdHlwZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtbWQ1L2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9zYy1tZDUvbm9kZV9tb2R1bGVzL21kNS1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLW1lcmdlL2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9zYy1tZXJnZS9ub2RlX21vZHVsZXMvdHlwZS1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NnLW9ic2VydmFibGUtYXJyYXkvc3JjL2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2NvbmZpZy5qc29uIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2Zha2VfYjc2MmIxMzEuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvc3JjL3NjcmlwdHMvaGVscGVycy5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9zcmMvc2NyaXB0cy9pdGVtLXZhbHVlLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2xpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7O0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlVQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIERlYm91bmNlcyBhIGZ1bmN0aW9uIGJ5IHRoZSBnaXZlbiB0aHJlc2hvbGQuXG4gKlxuICogQHNlZSBodHRwOi8vdW5zY3JpcHRhYmxlLmNvbS8yMDA5LzAzLzIwL2RlYm91bmNpbmctamF2YXNjcmlwdC1tZXRob2RzL1xuICogQHBhcmFtIHtGdW5jdGlvbn0gZnVuY3Rpb24gdG8gd3JhcFxuICogQHBhcmFtIHtOdW1iZXJ9IHRpbWVvdXQgaW4gbXMgKGAxMDBgKVxuICogQHBhcmFtIHtCb29sZWFufSB3aGV0aGVyIHRvIGV4ZWN1dGUgYXQgdGhlIGJlZ2lubmluZyAoYGZhbHNlYClcbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBkZWJvdW5jZShmdW5jLCB0aHJlc2hvbGQsIGV4ZWNBc2FwKXtcbiAgdmFyIHRpbWVvdXQ7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZCgpe1xuICAgIHZhciBvYmogPSB0aGlzLCBhcmdzID0gYXJndW1lbnRzO1xuXG4gICAgZnVuY3Rpb24gZGVsYXllZCAoKSB7XG4gICAgICBpZiAoIWV4ZWNBc2FwKSB7XG4gICAgICAgIGZ1bmMuYXBwbHkob2JqLCBhcmdzKTtcbiAgICAgIH1cbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgIH1cblxuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgfSBlbHNlIGlmIChleGVjQXNhcCkge1xuICAgICAgZnVuYy5hcHBseShvYmosIGFyZ3MpO1xuICAgIH1cblxuICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGRlbGF5ZWQsIHRocmVzaG9sZCB8fCAxMDApO1xuICB9O1xufTtcbiIsIlxuLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gRW1pdHRlcjtcblxuLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbmZ1bmN0aW9uIEVtaXR0ZXIob2JqKSB7XG4gIGlmIChvYmopIHJldHVybiBtaXhpbihvYmopO1xufTtcblxuLyoqXG4gKiBNaXhpbiB0aGUgZW1pdHRlciBwcm9wZXJ0aWVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm4ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovXG5cbmZ1bmN0aW9uIG1peGluKG9iaikge1xuICBmb3IgKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtcbiAgICBvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07XG4gIH1cbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uID1cbkVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gICh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSlcbiAgICAucHVzaChmbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LCBmbil7XG4gIHZhciBzZWxmID0gdGhpcztcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIGZ1bmN0aW9uIG9uKCkge1xuICAgIHNlbGYub2ZmKGV2ZW50LCBvbik7XG4gICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfVxuXG4gIG9uLmZuID0gZm47XG4gIHRoaXMub24oZXZlbnQsIG9uKTtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vZmYgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG5cbiAgLy8gYWxsXG4gIGlmICgwID09IGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICB0aGlzLl9jYWxsYmFja3MgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIHZhciBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICBpZiAoIWNhbGxiYWNrcykgcmV0dXJuIHRoaXM7XG5cbiAgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuICBpZiAoMSA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxuICB2YXIgY2I7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgY2FsbGJhY2tzLmxlbmd0aDsgaSsrKSB7XG4gICAgY2IgPSBjYWxsYmFja3NbaV07XG4gICAgaWYgKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pIHtcbiAgICAgIGNhbGxiYWNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEVtaXQgYGV2ZW50YCB3aXRoIHRoZSBnaXZlbiBhcmdzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtNaXhlZH0gLi4uXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcbiAgdmFyIGFyZ3MgPSBbXS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSlcbiAgICAsIGNhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF07XG5cbiAgaWYgKGNhbGxiYWNrcykge1xuICAgIGNhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gY2FsbGJhY2tzLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICBjYWxsYmFja3NbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHJldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGlzIGVtaXR0ZXIgaGFzIGBldmVudGAgaGFuZGxlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7XG4gIHJldHVybiAhISB0aGlzLmxpc3RlbmVycyhldmVudCkubGVuZ3RoO1xufTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIGJhc2VuYW1lU2NvcmUsIHN0cmluZ1Njb3JlO1xuXG4gIHN0cmluZ1Njb3JlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3N0cmluZ3Njb3JlJyk7XG5cbiAgYmFzZW5hbWVTY29yZSA9IGZ1bmN0aW9uKHN0cmluZywgcXVlcnksIHNjb3JlKSB7XG4gICAgdmFyIGJhc2UsIGRlcHRoLCBpbmRleCwgbGFzdENoYXJhY3Rlciwgc2VnbWVudENvdW50LCBzbGFzaENvdW50O1xuICAgIGluZGV4ID0gc3RyaW5nLmxlbmd0aCAtIDE7XG4gICAgd2hpbGUgKHN0cmluZ1tpbmRleF0gPT09ICcvJykge1xuICAgICAgaW5kZXgtLTtcbiAgICB9XG4gICAgc2xhc2hDb3VudCA9IDA7XG4gICAgbGFzdENoYXJhY3RlciA9IGluZGV4O1xuICAgIGJhc2UgPSBudWxsO1xuICAgIHdoaWxlIChpbmRleCA+PSAwKSB7XG4gICAgICBpZiAoc3RyaW5nW2luZGV4XSA9PT0gJy8nKSB7XG4gICAgICAgIHNsYXNoQ291bnQrKztcbiAgICAgICAgaWYgKGJhc2UgPT0gbnVsbCkge1xuICAgICAgICAgIGJhc2UgPSBzdHJpbmcuc3Vic3RyaW5nKGluZGV4ICsgMSwgbGFzdENoYXJhY3RlciArIDEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgIGlmIChsYXN0Q2hhcmFjdGVyIDwgc3RyaW5nLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICBpZiAoYmFzZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlID0gc3RyaW5nLnN1YnN0cmluZygwLCBsYXN0Q2hhcmFjdGVyICsgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChiYXNlID09IG51bGwpIHtcbiAgICAgICAgICAgIGJhc2UgPSBzdHJpbmc7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpbmRleC0tO1xuICAgIH1cbiAgICBpZiAoYmFzZSA9PT0gc3RyaW5nKSB7XG4gICAgICBzY29yZSAqPSAyO1xuICAgIH0gZWxzZSBpZiAoYmFzZSkge1xuICAgICAgc2NvcmUgKz0gc3RyaW5nU2NvcmUoYmFzZSwgcXVlcnkpO1xuICAgIH1cbiAgICBzZWdtZW50Q291bnQgPSBzbGFzaENvdW50ICsgMTtcbiAgICBkZXB0aCA9IE1hdGgubWF4KDEsIDEwIC0gc2VnbWVudENvdW50KTtcbiAgICBzY29yZSAqPSBkZXB0aCAqIDAuMDE7XG4gICAgcmV0dXJuIHNjb3JlO1xuICB9O1xuXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oY2FuZGlkYXRlcywgcXVlcnksIF9hcmcpIHtcbiAgICB2YXIgY2FuZGlkYXRlLCBrZXksIG1heFJlc3VsdHMsIHF1ZXJ5SGFzTm9TbGFzaGVzLCBzY29yZSwgc2NvcmVkQ2FuZGlkYXRlLCBzY29yZWRDYW5kaWRhdGVzLCBzdHJpbmcsIF9pLCBfbGVuLCBfcmVmO1xuICAgIF9yZWYgPSBfYXJnICE9IG51bGwgPyBfYXJnIDoge30sIGtleSA9IF9yZWYua2V5LCBtYXhSZXN1bHRzID0gX3JlZi5tYXhSZXN1bHRzO1xuICAgIGlmIChxdWVyeSkge1xuICAgICAgcXVlcnlIYXNOb1NsYXNoZXMgPSBxdWVyeS5pbmRleE9mKCcvJykgPT09IC0xO1xuICAgICAgc2NvcmVkQ2FuZGlkYXRlcyA9IFtdO1xuICAgICAgZm9yIChfaSA9IDAsIF9sZW4gPSBjYW5kaWRhdGVzLmxlbmd0aDsgX2kgPCBfbGVuOyBfaSsrKSB7XG4gICAgICAgIGNhbmRpZGF0ZSA9IGNhbmRpZGF0ZXNbX2ldO1xuICAgICAgICBzdHJpbmcgPSBrZXkgIT0gbnVsbCA/IGNhbmRpZGF0ZVtrZXldIDogY2FuZGlkYXRlO1xuICAgICAgICBpZiAoIXN0cmluZykge1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIHNjb3JlID0gc3RyaW5nU2NvcmUoc3RyaW5nLCBxdWVyeSk7XG4gICAgICAgIGlmIChxdWVyeUhhc05vU2xhc2hlcykge1xuICAgICAgICAgIHNjb3JlID0gYmFzZW5hbWVTY29yZShzdHJpbmcsIHF1ZXJ5LCBzY29yZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNjb3JlID4gMCkge1xuICAgICAgICAgIHNjb3JlZENhbmRpZGF0ZXMucHVzaCh7XG4gICAgICAgICAgICBjYW5kaWRhdGU6IGNhbmRpZGF0ZSxcbiAgICAgICAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzY29yZWRDYW5kaWRhdGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICByZXR1cm4gYi5zY29yZSAtIGEuc2NvcmU7XG4gICAgICB9KTtcbiAgICAgIGNhbmRpZGF0ZXMgPSAoZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBfaiwgX2xlbjEsIF9yZXN1bHRzO1xuICAgICAgICBfcmVzdWx0cyA9IFtdO1xuICAgICAgICBmb3IgKF9qID0gMCwgX2xlbjEgPSBzY29yZWRDYW5kaWRhdGVzLmxlbmd0aDsgX2ogPCBfbGVuMTsgX2orKykge1xuICAgICAgICAgIHNjb3JlZENhbmRpZGF0ZSA9IHNjb3JlZENhbmRpZGF0ZXNbX2pdO1xuICAgICAgICAgIF9yZXN1bHRzLnB1c2goc2NvcmVkQ2FuZGlkYXRlLmNhbmRpZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIF9yZXN1bHRzO1xuICAgICAgfSkoKTtcbiAgICB9XG4gICAgaWYgKG1heFJlc3VsdHMgIT0gbnVsbCkge1xuICAgICAgY2FuZGlkYXRlcyA9IGNhbmRpZGF0ZXMuc2xpY2UoMCwgbWF4UmVzdWx0cyk7XG4gICAgfVxuICAgIHJldHVybiBjYW5kaWRhdGVzO1xuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiKGZ1bmN0aW9uKCkge1xuICB2YXIgc3RyaW5nU2NvcmU7XG5cbiAgc3RyaW5nU2NvcmUgPSByZXF1aXJlKCcuLi92ZW5kb3Ivc3RyaW5nc2NvcmUnKTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBmaWx0ZXI6IHJlcXVpcmUoJy4vZmlsdGVyJyksXG4gICAgc2NvcmU6IGZ1bmN0aW9uKHN0cmluZywgcXVlcnkpIHtcbiAgICAgIGlmICghc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiAwO1xuICAgICAgfVxuICAgICAgaWYgKCFxdWVyeSkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIHJldHVybiBzdHJpbmdTY29yZShzdHJpbmcsIHF1ZXJ5KTtcbiAgICB9XG4gIH07XG5cbn0pLmNhbGwodGhpcyk7XG4iLCIvLyBNT0RJRklFRCBCWSBOUy9DSiAtIERvbid0IGV4dGVuZCB0aGUgcHJvdG90eXBlIG9mIFN0cmluZ1xuLy8gTU9ESUZJRUQgQlkgQ0ogLSBSZW1vdmUgc3RhcnRfb2Zfc3RyaW5nX2JvbnVzXG5cbi8qIVxuICogc3RyaW5nX3Njb3JlLmpzOiBTdHJpbmcgU2NvcmluZyBBbGdvcml0aG0gMC4xLjEwXG4gKlxuICogaHR0cDovL2pvc2hhdmVuLmNvbS9zdHJpbmdfc2NvcmVcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3NoYXZlbi9zdHJpbmdfc2NvcmVcbiAqXG4gKiBDb3B5cmlnaHQgKEMpIDIwMDktMjAxMSBKb3NoYXZlbiBQb3R0ZXIgPHlvdXJ0ZWNoQGdtYWlsLmNvbT5cbiAqIFNwZWNpYWwgdGhhbmtzIHRvIGFsbCBvZiB0aGUgY29udHJpYnV0b3JzIGxpc3RlZCBoZXJlIGh0dHBzOi8vZ2l0aHViLmNvbS9qb3NoYXZlbi9zdHJpbmdfc2NvcmVcbiAqIE1JVCBsaWNlbnNlOiBodHRwOi8vd3d3Lm9wZW5zb3VyY2Uub3JnL2xpY2Vuc2VzL21pdC1saWNlbnNlLnBocFxuICpcbiAqIERhdGU6IFR1ZSBNYXIgMSAyMDExXG4qL1xuXG4vKipcbiAqIFNjb3JlcyBhIHN0cmluZyBhZ2FpbnN0IGFub3RoZXIgc3RyaW5nLlxuICogICdIZWxsbyBXb3JsZCcuc2NvcmUoJ2hlJyk7ICAgICAvLz0+IDAuNTkzMTgxODE4MTgxODE4MVxuICogICdIZWxsbyBXb3JsZCcuc2NvcmUoJ0hlbGxvJyk7ICAvLz0+IDAuNzMxODE4MTgxODE4MTgxOFxuICovXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKHN0cmluZywgYWJicmV2aWF0aW9uKSB7XG4gIC8vIElmIHRoZSBzdHJpbmcgaXMgZXF1YWwgdG8gdGhlIGFiYnJldmlhdGlvbiwgcGVyZmVjdCBtYXRjaC5cbiAgaWYgKHN0cmluZyA9PSBhYmJyZXZpYXRpb24pIHtyZXR1cm4gMTt9XG5cbiAgdmFyIHRvdGFsX2NoYXJhY3Rlcl9zY29yZSA9IDAsXG4gICAgICBhYmJyZXZpYXRpb25fbGVuZ3RoID0gYWJicmV2aWF0aW9uLmxlbmd0aCxcbiAgICAgIHN0cmluZ19sZW5ndGggPSBzdHJpbmcubGVuZ3RoLFxuICAgICAgc3RhcnRfb2Zfc3RyaW5nX2JvbnVzLFxuICAgICAgYWJicmV2aWF0aW9uX3Njb3JlLFxuICAgICAgZmluYWxfc2NvcmU7XG5cbiAgLy8gV2FsayB0aHJvdWdoIGFiYnJldmlhdGlvbiBhbmQgYWRkIHVwIHNjb3Jlcy5cbiAgZm9yICh2YXIgaSA9IDAsXG4gICAgICAgICBjaGFyYWN0ZXJfc2NvcmUvKiA9IDAqLyxcbiAgICAgICAgIGluZGV4X2luX3N0cmluZy8qID0gMCovLFxuICAgICAgICAgYy8qID0gJycqLyxcbiAgICAgICAgIGluZGV4X2NfbG93ZXJjYXNlLyogPSAwKi8sXG4gICAgICAgICBpbmRleF9jX3VwcGVyY2FzZS8qID0gMCovLFxuICAgICAgICAgbWluX2luZGV4LyogPSAwKi87XG4gICAgIGkgPCBhYmJyZXZpYXRpb25fbGVuZ3RoO1xuICAgICArK2kpIHtcblxuICAgIC8vIEZpbmQgdGhlIGZpcnN0IGNhc2UtaW5zZW5zaXRpdmUgbWF0Y2ggb2YgYSBjaGFyYWN0ZXIuXG4gICAgYyA9IGFiYnJldmlhdGlvbi5jaGFyQXQoaSk7XG5cbiAgICBpbmRleF9jX2xvd2VyY2FzZSA9IHN0cmluZy5pbmRleE9mKGMudG9Mb3dlckNhc2UoKSk7XG4gICAgaW5kZXhfY191cHBlcmNhc2UgPSBzdHJpbmcuaW5kZXhPZihjLnRvVXBwZXJDYXNlKCkpO1xuICAgIG1pbl9pbmRleCA9IE1hdGgubWluKGluZGV4X2NfbG93ZXJjYXNlLCBpbmRleF9jX3VwcGVyY2FzZSk7XG4gICAgaW5kZXhfaW5fc3RyaW5nID0gKG1pbl9pbmRleCA+IC0xKSA/IG1pbl9pbmRleCA6IE1hdGgubWF4KGluZGV4X2NfbG93ZXJjYXNlLCBpbmRleF9jX3VwcGVyY2FzZSk7XG5cbiAgICBpZiAoaW5kZXhfaW5fc3RyaW5nID09PSAtMSkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNoYXJhY3Rlcl9zY29yZSA9IDAuMTtcbiAgICB9XG5cbiAgICAvLyBTZXQgYmFzZSBzY29yZSBmb3IgbWF0Y2hpbmcgJ2MnLlxuXG4gICAgLy8gU2FtZSBjYXNlIGJvbnVzLlxuICAgIGlmIChzdHJpbmdbaW5kZXhfaW5fc3RyaW5nXSA9PT0gYykge1xuICAgICAgY2hhcmFjdGVyX3Njb3JlICs9IDAuMTtcbiAgICB9XG5cbiAgICAvLyBDb25zZWN1dGl2ZSBsZXR0ZXIgJiBzdGFydC1vZi1zdHJpbmcgQm9udXNcbiAgICBpZiAoaW5kZXhfaW5fc3RyaW5nID09PSAwKSB7XG4gICAgICAvLyBJbmNyZWFzZSB0aGUgc2NvcmUgd2hlbiBtYXRjaGluZyBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHJlbWFpbmRlciBvZiB0aGUgc3RyaW5nXG4gICAgICBjaGFyYWN0ZXJfc2NvcmUgKz0gMC42O1xuICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgLy8gSWYgbWF0Y2ggaXMgdGhlIGZpcnN0IGNoYXJhY3RlciBvZiB0aGUgc3RyaW5nXG4gICAgICAgIC8vICYgdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBhYmJyZXZpYXRpb24sIGFkZCBhXG4gICAgICAgIC8vIHN0YXJ0LW9mLXN0cmluZyBtYXRjaCBib251cy5cbiAgICAgICAgLy8gc3RhcnRfb2Zfc3RyaW5nX2JvbnVzID0gMSAvL3RydWU7XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgLy8gQWNyb255bSBCb251c1xuICAgICAgLy8gV2VpZ2hpbmcgTG9naWM6IFR5cGluZyB0aGUgZmlyc3QgY2hhcmFjdGVyIG9mIGFuIGFjcm9ueW0gaXMgYXMgaWYgeW91XG4gICAgICAvLyBwcmVjZWRlZCBpdCB3aXRoIHR3byBwZXJmZWN0IGNoYXJhY3RlciBtYXRjaGVzLlxuICAgICAgaWYgKHN0cmluZy5jaGFyQXQoaW5kZXhfaW5fc3RyaW5nIC0gMSkgPT09ICcgJykge1xuICAgICAgICBjaGFyYWN0ZXJfc2NvcmUgKz0gMC44OyAvLyAqIE1hdGgubWluKGluZGV4X2luX3N0cmluZywgNSk7IC8vIENhcCBib251cyBhdCAwLjQgKiA1XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gTGVmdCB0cmltIHRoZSBhbHJlYWR5IG1hdGNoZWQgcGFydCBvZiB0aGUgc3RyaW5nXG4gICAgLy8gKGZvcmNlcyBzZXF1ZW50aWFsIG1hdGNoaW5nKS5cbiAgICBzdHJpbmcgPSBzdHJpbmcuc3Vic3RyaW5nKGluZGV4X2luX3N0cmluZyArIDEsIHN0cmluZ19sZW5ndGgpO1xuXG4gICAgdG90YWxfY2hhcmFjdGVyX3Njb3JlICs9IGNoYXJhY3Rlcl9zY29yZTtcbiAgfSAvLyBlbmQgb2YgZm9yIGxvb3BcblxuICAvLyBVbmNvbW1lbnQgdG8gd2VpZ2ggc21hbGxlciB3b3JkcyBoaWdoZXIuXG4gIC8vIHJldHVybiB0b3RhbF9jaGFyYWN0ZXJfc2NvcmUgLyBzdHJpbmdfbGVuZ3RoO1xuXG4gIGFiYnJldmlhdGlvbl9zY29yZSA9IHRvdGFsX2NoYXJhY3Rlcl9zY29yZSAvIGFiYnJldmlhdGlvbl9sZW5ndGg7XG4gIC8vcGVyY2VudGFnZV9vZl9tYXRjaGVkX3N0cmluZyA9IGFiYnJldmlhdGlvbl9sZW5ndGggLyBzdHJpbmdfbGVuZ3RoO1xuICAvL3dvcmRfc2NvcmUgPSBhYmJyZXZpYXRpb25fc2NvcmUgKiBwZXJjZW50YWdlX29mX21hdGNoZWRfc3RyaW5nO1xuXG4gIC8vIFJlZHVjZSBwZW5hbHR5IGZvciBsb25nZXIgc3RyaW5ncy5cbiAgLy9maW5hbF9zY29yZSA9ICh3b3JkX3Njb3JlICsgYWJicmV2aWF0aW9uX3Njb3JlKSAvIDI7XG4gIGZpbmFsX3Njb3JlID0gKChhYmJyZXZpYXRpb25fc2NvcmUgKiAoYWJicmV2aWF0aW9uX2xlbmd0aCAvIHN0cmluZ19sZW5ndGgpKSArIGFiYnJldmlhdGlvbl9zY29yZSkgLyAyO1xuXG4gIGlmIChzdGFydF9vZl9zdHJpbmdfYm9udXMgJiYgKGZpbmFsX3Njb3JlICsgMC4xNSA8IDEpKSB7XG4gICAgZmluYWxfc2NvcmUgKz0gMC4xNTtcbiAgfVxuXG4gIHJldHVybiBmaW5hbF9zY29yZTtcbn07XG4iLCJcbi8qKlxuICogRXhwb3NlIGByZW5kZXIoKWAuYFxuICovXG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IHJlbmRlcjtcblxuLyoqXG4gKiBFeHBvc2UgYGNvbXBpbGUoKWAuXG4gKi9cblxuZXhwb3J0cy5jb21waWxlID0gY29tcGlsZTtcblxuLyoqXG4gKiBSZW5kZXIgdGhlIGdpdmVuIG11c3RhY2hlIGBzdHJgIHdpdGggYG9iamAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiByZW5kZXIoc3RyLCBvYmopIHtcbiAgb2JqID0gb2JqIHx8IHt9O1xuICB2YXIgZm4gPSBjb21waWxlKHN0cik7XG4gIHJldHVybiBmbihvYmopO1xufVxuXG4vKipcbiAqIENvbXBpbGUgdGhlIGdpdmVuIGBzdHJgIHRvIGEgYEZ1bmN0aW9uYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZShzdHIpIHtcbiAgdmFyIGpzID0gW107XG4gIHZhciB0b2tzID0gcGFyc2Uoc3RyKTtcbiAgdmFyIHRvaztcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHRva3MubGVuZ3RoOyArK2kpIHtcbiAgICB0b2sgPSB0b2tzW2ldO1xuICAgIGlmIChpICUgMiA9PSAwKSB7XG4gICAgICBqcy5wdXNoKCdcIicgKyB0b2sucmVwbGFjZSgvXCIvZywgJ1xcXFxcIicpICsgJ1wiJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN3aXRjaCAodG9rWzBdKSB7XG4gICAgICAgIGNhc2UgJy8nOlxuICAgICAgICAgIHRvayA9IHRvay5zbGljZSgxKTtcbiAgICAgICAgICBqcy5wdXNoKCcpICsgJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ14nOlxuICAgICAgICAgIHRvayA9IHRvay5zbGljZSgxKTtcbiAgICAgICAgICBhc3NlcnRQcm9wZXJ0eSh0b2spO1xuICAgICAgICAgIGpzLnB1c2goJyArIHNlY3Rpb24ob2JqLCBcIicgKyB0b2sgKyAnXCIsIHRydWUsICcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcjJzpcbiAgICAgICAgICB0b2sgPSB0b2suc2xpY2UoMSk7XG4gICAgICAgICAgYXNzZXJ0UHJvcGVydHkodG9rKTtcbiAgICAgICAgICBqcy5wdXNoKCcgKyBzZWN0aW9uKG9iaiwgXCInICsgdG9rICsgJ1wiLCBmYWxzZSwgJyk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJyEnOlxuICAgICAgICAgIHRvayA9IHRvay5zbGljZSgxKTtcbiAgICAgICAgICBhc3NlcnRQcm9wZXJ0eSh0b2spO1xuICAgICAgICAgIGpzLnB1c2goJyArIG9iai4nICsgdG9rICsgJyArICcpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGFzc2VydFByb3BlcnR5KHRvayk7XG4gICAgICAgICAganMucHVzaCgnICsgZXNjYXBlKG9iai4nICsgdG9rICsgJykgKyAnKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBqcyA9ICdcXG4nXG4gICAgKyBpbmRlbnQoZXNjYXBlLnRvU3RyaW5nKCkpICsgJztcXG5cXG4nXG4gICAgKyBpbmRlbnQoc2VjdGlvbi50b1N0cmluZygpKSArICc7XFxuXFxuJ1xuICAgICsgJyAgcmV0dXJuICcgKyBqcy5qb2luKCcnKS5yZXBsYWNlKC9cXG4vZywgJ1xcXFxuJyk7XG5cbiAgcmV0dXJuIG5ldyBGdW5jdGlvbignb2JqJywganMpO1xufVxuXG4vKipcbiAqIEFzc2VydCB0aGF0IGBwcm9wYCBpcyBhIHZhbGlkIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBhc3NlcnRQcm9wZXJ0eShwcm9wKSB7XG4gIGlmICghcHJvcC5tYXRjaCgvXltcXHcuXSskLykpIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBwcm9wZXJ0eSBcIicgKyBwcm9wICsgJ1wiJyk7XG59XG5cbi8qKlxuICogUGFyc2UgYHN0cmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBwYXJzZShzdHIpIHtcbiAgcmV0dXJuIHN0ci5zcGxpdCgvXFx7XFx7fFxcfVxcfS8pO1xufVxuXG4vKipcbiAqIEluZGVudCBgc3RyYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBpbmRlbnQoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZSgvXi9nbSwgJyAgJyk7XG59XG5cbi8qKlxuICogU2VjdGlvbiBoYW5kbGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbmVnYXRlXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBzZWN0aW9uKG9iaiwgcHJvcCwgbmVnYXRlLCBzdHIpIHtcbiAgdmFyIHZhbCA9IG9ialtwcm9wXTtcbiAgaWYgKCdmdW5jdGlvbicgPT0gdHlwZW9mIHZhbCkgcmV0dXJuIHZhbC5jYWxsKG9iaiwgc3RyKTtcbiAgaWYgKG5lZ2F0ZSkgdmFsID0gIXZhbDtcbiAgaWYgKHZhbCkgcmV0dXJuIHN0cjtcbiAgcmV0dXJuICcnO1xufVxuXG4vKipcbiAqIEVzY2FwZSB0aGUgZ2l2ZW4gYGh0bWxgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBodG1sXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBlc2NhcGUoaHRtbCkge1xuICByZXR1cm4gU3RyaW5nKGh0bWwpXG4gICAgLnJlcGxhY2UoLyYvZywgJyZhbXA7JylcbiAgICAucmVwbGFjZSgvXCIvZywgJyZxdW90OycpXG4gICAgLnJlcGxhY2UoLzwvZywgJyZsdDsnKVxuICAgIC5yZXBsYWNlKC8+L2csICcmZ3Q7Jyk7XG59XG4iLCJ2YXIgZ3VpZFJ4ID0gXCJ7P1swLTlBLUZhLWZdezh9LVswLTlBLUZhLWZdezR9LTRbMC05QS1GYS1mXXszfS1bMC05QS1GYS1mXXs0fS1bMC05QS1GYS1mXXsxMn19P1wiO1xuXG5leHBvcnRzLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB2YXIgZ3VpZCA9IFwieHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4XCIucmVwbGFjZSggL1t4eV0vZywgZnVuY3Rpb24gKCBjICkge1xuICAgIHZhciByID0gKCBkICsgTWF0aC5yYW5kb20oKSAqIDE2ICkgJSAxNiB8IDA7XG4gICAgZCA9IE1hdGguZmxvb3IoIGQgLyAxNiApO1xuICAgIHJldHVybiAoIGMgPT09IFwieFwiID8gciA6ICggciAmIDB4NyB8IDB4OCApICkudG9TdHJpbmcoIDE2ICk7XG4gIH0gKTtcbiAgcmV0dXJuIGd1aWQ7XG59O1xuXG5leHBvcnRzLm1hdGNoID0gZnVuY3Rpb24gKCBzdHJpbmcgKSB7XG4gIHZhciByeCA9IG5ldyBSZWdFeHAoIGd1aWRSeCwgXCJnXCIgKSxcbiAgICBtYXRjaGVzID0gKCB0eXBlb2Ygc3RyaW5nID09PSBcInN0cmluZ1wiID8gc3RyaW5nIDogXCJcIiApLm1hdGNoKCByeCApO1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSggbWF0Y2hlcyApID8gbWF0Y2hlcyA6IFtdO1xufTtcblxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gKCBndWlkICkge1xuICB2YXIgcnggPSBuZXcgUmVnRXhwKCBndWlkUnggKTtcbiAgcmV0dXJuIHJ4LnRlc3QoIGd1aWQgKTtcbn07IiwidmFyIHR5cGUgPSByZXF1aXJlKCBcIi4vaXNlcy90eXBlXCIgKSxcbiAgaXMgPSB7XG4gICAgYToge30sXG4gICAgYW46IHt9LFxuICAgIG5vdDoge1xuICAgICAgYToge30sXG4gICAgICBhbjoge31cbiAgICB9XG4gIH07XG5cbnZhciBpc2VzID0ge1xuICBcImFyZ3VtZW50c1wiOiBbIFwiYXJndW1lbnRzXCIsIHR5cGUoIFwiYXJndW1lbnRzXCIgKSBdLFxuICBcImFycmF5XCI6IFsgXCJhcnJheVwiLCB0eXBlKCBcImFycmF5XCIgKSBdLFxuICBcImJvb2xlYW5cIjogWyBcImJvb2xlYW5cIiwgdHlwZSggXCJib29sZWFuXCIgKSBdLFxuICBcImRhdGVcIjogWyBcImRhdGVcIiwgdHlwZSggXCJkYXRlXCIgKSBdLFxuICBcImZ1bmN0aW9uXCI6IFsgXCJmdW5jdGlvblwiLCBcImZ1bmNcIiwgXCJmblwiLCB0eXBlKCBcImZ1bmN0aW9uXCIgKSBdLFxuICBcIm51bGxcIjogWyBcIm51bGxcIiwgdHlwZSggXCJudWxsXCIgKSBdLFxuICBcIm51bWJlclwiOiBbIFwibnVtYmVyXCIsIFwiaW50ZWdlclwiLCBcImludFwiLCB0eXBlKCBcIm51bWJlclwiICkgXSxcbiAgXCJvYmplY3RcIjogWyBcIm9iamVjdFwiLCB0eXBlKCBcIm9iamVjdFwiICkgXSxcbiAgXCJyZWdleHBcIjogWyBcInJlZ2V4cFwiLCB0eXBlKCBcInJlZ2V4cFwiICkgXSxcbiAgXCJzdHJpbmdcIjogWyBcInN0cmluZ1wiLCB0eXBlKCBcInN0cmluZ1wiICkgXSxcbiAgXCJ1bmRlZmluZWRcIjogWyBcInVuZGVmaW5lZFwiLCB0eXBlKCBcInVuZGVmaW5lZFwiICkgXSxcbiAgXCJlbXB0eVwiOiBbIFwiZW1wdHlcIiwgcmVxdWlyZSggXCIuL2lzZXMvZW1wdHlcIiApIF0sXG4gIFwibnVsbG9ydW5kZWZpbmVkXCI6IFsgXCJudWxsT3JVbmRlZmluZWRcIiwgXCJudWxsb3J1bmRlZmluZWRcIiwgcmVxdWlyZSggXCIuL2lzZXMvbnVsbG9ydW5kZWZpbmVkXCIgKSBdLFxuICBcImd1aWRcIjogWyBcImd1aWRcIiwgcmVxdWlyZSggXCIuL2lzZXMvZ3VpZFwiICkgXVxufVxuXG5PYmplY3Qua2V5cyggaXNlcyApLmZvckVhY2goIGZ1bmN0aW9uICgga2V5ICkge1xuXG4gIHZhciBtZXRob2RzID0gaXNlc1sga2V5IF0uc2xpY2UoIDAsIGlzZXNbIGtleSBdLmxlbmd0aCAtIDEgKSxcbiAgICBmbiA9IGlzZXNbIGtleSBdWyBpc2VzWyBrZXkgXS5sZW5ndGggLSAxIF07XG5cbiAgbWV0aG9kcy5mb3JFYWNoKCBmdW5jdGlvbiAoIG1ldGhvZEtleSApIHtcbiAgICBpc1sgbWV0aG9kS2V5IF0gPSBpcy5hWyBtZXRob2RLZXkgXSA9IGlzLmFuWyBtZXRob2RLZXkgXSA9IGZuO1xuICAgIGlzLm5vdFsgbWV0aG9kS2V5IF0gPSBpcy5ub3QuYVsgbWV0aG9kS2V5IF0gPSBpcy5ub3QuYW5bIG1ldGhvZEtleSBdID0gZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGZuLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKSA/IGZhbHNlIDogdHJ1ZTtcbiAgICB9XG4gIH0gKTtcblxufSApO1xuXG5leHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBpcztcbmV4cG9ydHMudHlwZSA9IHR5cGU7IiwidmFyIHR5cGUgPSByZXF1aXJlKFwiLi4vdHlwZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xuICB2YXIgZW1wdHkgPSBmYWxzZTtcblxuICBpZiAoIHR5cGUoIHZhbHVlICkgPT09IFwibnVsbFwiIHx8IHR5cGUoIHZhbHVlICkgPT09IFwidW5kZWZpbmVkXCIgKSB7XG4gICAgZW1wdHkgPSB0cnVlO1xuICB9IGVsc2UgaWYgKCB0eXBlKCB2YWx1ZSApID09PSBcIm9iamVjdFwiICkge1xuICAgIGVtcHR5ID0gT2JqZWN0LmtleXMoIHZhbHVlICkubGVuZ3RoID09PSAwO1xuICB9IGVsc2UgaWYgKCB0eXBlKCB2YWx1ZSApID09PSBcImJvb2xlYW5cIiApIHtcbiAgICBlbXB0eSA9IHZhbHVlID09PSBmYWxzZTtcbiAgfSBlbHNlIGlmICggdHlwZSggdmFsdWUgKSA9PT0gXCJudW1iZXJcIiApIHtcbiAgICBlbXB0eSA9IHZhbHVlID09PSAwIHx8IHZhbHVlID09PSAtMTtcbiAgfSBlbHNlIGlmICggdHlwZSggdmFsdWUgKSA9PT0gXCJhcnJheVwiIHx8IHR5cGUoIHZhbHVlICkgPT09IFwic3RyaW5nXCIgKSB7XG4gICAgZW1wdHkgPSB2YWx1ZS5sZW5ndGggPT09IDA7XG4gIH1cblxuICByZXR1cm4gZW1wdHk7XG5cbn07IiwidmFyIGd1aWQgPSByZXF1aXJlKCBcInNjLWd1aWRcIiApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XG4gIHJldHVybiBndWlkLmlzVmFsaWQoIHZhbHVlICk7XG59OyIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcblx0cmV0dXJuIHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQgfHwgdmFsdWUgPT09IHZvaWQgMDtcbn07IiwidmFyIHR5cGUgPSByZXF1aXJlKCBcIi4uL3R5cGVcIiApO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICggX3R5cGUgKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoIF92YWx1ZSApIHtcbiAgICByZXR1cm4gdHlwZSggX3ZhbHVlICkgPT09IF90eXBlO1xuICB9XG59IiwidmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoIHZhbCApIHtcbiAgc3dpdGNoICggdG9TdHJpbmcuY2FsbCggdmFsICkgKSB7XG4gIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzpcbiAgICByZXR1cm4gJ2Z1bmN0aW9uJztcbiAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgcmV0dXJuICdkYXRlJztcbiAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICByZXR1cm4gJ3JlZ2V4cCc7XG4gIGNhc2UgJ1tvYmplY3QgQXJndW1lbnRzXSc6XG4gICAgcmV0dXJuICdhcmd1bWVudHMnO1xuICBjYXNlICdbb2JqZWN0IEFycmF5XSc6XG4gICAgcmV0dXJuICdhcnJheSc7XG4gIH1cblxuICBpZiAoIHZhbCA9PT0gbnVsbCApIHJldHVybiAnbnVsbCc7XG4gIGlmICggdmFsID09PSB1bmRlZmluZWQgKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICggdmFsID09PSBPYmplY3QoIHZhbCApICkgcmV0dXJuICdvYmplY3QnO1xuXG4gIHJldHVybiB0eXBlb2YgdmFsO1xufTsiLCJ2YXIgbWQ1ID0gcmVxdWlyZSggXCJtZDUtY29tcG9uZW50XCIgKTtcblxuZnVuY3Rpb24gc3RyaW5naWZ5KCBfb2JqZWN0ICkge1xuICByZXR1cm4gSlNPTi5zdHJpbmdpZnkoIF9vYmplY3QgKTtcbn1cblxuZnVuY3Rpb24gaGFzaCggX29iamVjdCApIHtcbiAgcmV0dXJuIG1kNSggc3RyaW5naWZ5KCBfb2JqZWN0ICkgKTtcbn1cblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gaGFzaDtcbmV4cG9ydHMuc3RyaW5naWZ5ID0gc3RyaW5naWZ5O1xuZXhwb3J0cy5tZDUgPSBtZDU7IiwiLyoqXG4gKiBtZDUuanNcbiAqIENvcHlyaWdodCAoYykgMjAxMSwgWW9zaGlub3JpIEtvaHlhbWEgKGh0dHA6Ly9hbGdvYml0LmpwLylcbiAqIGFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBkaWdlc3RTdHJpbmc7XG5cbmZ1bmN0aW9uIGRpZ2VzdChNKSB7XG4gIHZhciBvcmlnaW5hbExlbmd0aFxuICAgICwgaVxuICAgICwgalxuICAgICwga1xuICAgICwgbFxuICAgICwgQVxuICAgICwgQlxuICAgICwgQ1xuICAgICwgRFxuICAgICwgQUFcbiAgICAsIEJCXG4gICAgLCBDQ1xuICAgICwgRERcbiAgICAsIFhcbiAgICAsIHJ2YWxcbiAgICA7XG5cblx0ZnVuY3Rpb24gRih4LCB5LCB6KSB7IHJldHVybiAoeCAmIHkpIHwgKH54ICYgeik7IH1cblx0ZnVuY3Rpb24gRyh4LCB5LCB6KSB7IHJldHVybiAoeCAmIHopIHwgKHkgJiB+eik7IH1cblx0ZnVuY3Rpb24gSCh4LCB5LCB6KSB7IHJldHVybiB4IF4geSBeIHo7ICAgICAgICAgIH1cblx0ZnVuY3Rpb24gSSh4LCB5LCB6KSB7IHJldHVybiB5IF4gKHggfCB+eik7ICAgICAgIH1cblxuXHRmdW5jdGlvbiB0bzRieXRlcyhuKSB7XG5cdFx0cmV0dXJuIFtuJjB4ZmYsIChuPj4+OCkmMHhmZiwgKG4+Pj4xNikmMHhmZiwgKG4+Pj4yNCkmMHhmZl07XG5cdH1cblxuXHRvcmlnaW5hbExlbmd0aCA9IE0ubGVuZ3RoOyAvLyBmb3IgU3RlcC4yXG5cblx0Ly8gMy4xIFN0ZXAgMS4gQXBwZW5kIFBhZGRpbmcgQml0c1xuXHRNLnB1c2goMHg4MCk7XG5cdGwgPSAoNTYgLSBNLmxlbmd0aCkmMHgzZjtcblx0Zm9yIChpID0gMDsgaSA8IGw7IGkrKylcblx0XHRNLnB1c2goMCk7XG5cblx0Ly8gMy4yIFN0ZXAgMi4gQXBwZW5kIExlbmd0aFxuXHR0bzRieXRlcyg4Km9yaWdpbmFsTGVuZ3RoKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IE0ucHVzaChlKTsgfSk7XG5cdFswLCAwLCAwLCAwXS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IE0ucHVzaChlKTsgfSk7XG5cblx0Ly8gMy4zIFN0ZXAgMy4gSW5pdGlhbGl6ZSBNRCBCdWZmZXJcblx0QSA9IFsweDY3NDUyMzAxXTtcblx0QiA9IFsweGVmY2RhYjg5XTtcblx0QyA9IFsweDk4YmFkY2ZlXTtcblx0RCA9IFsweDEwMzI1NDc2XTtcblxuXHQvLyAzLjQgU3RlcCA0LiBQcm9jZXNzIE1lc3NhZ2UgaW4gMTYtV29yZCBCbG9ja3Ncblx0ZnVuY3Rpb24gcm91bmRzKGEsIGIsIGMsIGQsIGssIHMsIHQsIGYpIHtcblx0XHRhWzBdICs9IGYoYlswXSwgY1swXSwgZFswXSkgKyBYW2tdICsgdDtcblx0XHRhWzBdID0gKChhWzBdPDxzKXwoYVswXT4+PigzMiAtIHMpKSk7XG5cdFx0YVswXSArPSBiWzBdO1xuXHR9XG5cblx0Zm9yIChpID0gMDsgaSA8IE0ubGVuZ3RoOyBpICs9IDY0KSB7XG5cdFx0WCA9IFtdO1xuXHRcdGZvciAoaiA9IDA7IGogPCA2NDsgaiArPSA0KSB7XG5cdFx0XHRrID0gaSArIGo7XG5cdFx0XHRYLnB1c2goTVtrXXwoTVtrICsgMV08PDgpfChNW2sgKyAyXTw8MTYpfChNW2sgKyAzXTw8MjQpKTtcblx0XHR9XG5cdFx0QUEgPSBBWzBdO1xuXHRcdEJCID0gQlswXTtcblx0XHRDQyA9IENbMF07XG5cdFx0REQgPSBEWzBdO1xuXG5cdFx0Ly8gUm91bmQgMS5cblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDAsICA3LCAweGQ3NmFhNDc4LCBGKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDEsIDEyLCAweGU4YzdiNzU2LCBGKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDIsIDE3LCAweDI0MjA3MGRiLCBGKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDMsIDIyLCAweGMxYmRjZWVlLCBGKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDQsICA3LCAweGY1N2MwZmFmLCBGKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDUsIDEyLCAweDQ3ODdjNjJhLCBGKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDYsIDE3LCAweGE4MzA0NjEzLCBGKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDcsIDIyLCAweGZkNDY5NTAxLCBGKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDgsICA3LCAweDY5ODA5OGQ4LCBGKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDksIDEyLCAweDhiNDRmN2FmLCBGKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTAsIDE3LCAweGZmZmY1YmIxLCBGKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgMTEsIDIyLCAweDg5NWNkN2JlLCBGKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgMTIsICA3LCAweDZiOTAxMTIyLCBGKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgMTMsIDEyLCAweGZkOTg3MTkzLCBGKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTQsIDE3LCAweGE2Nzk0MzhlLCBGKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgMTUsIDIyLCAweDQ5YjQwODIxLCBGKTtcblxuXHRcdC8vIFJvdW5kIDIuXG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICAxLCAgNSwgMHhmNjFlMjU2MiwgRyk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA2LCAgOSwgMHhjMDQwYjM0MCwgRyk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDExLCAxNCwgMHgyNjVlNWE1MSwgRyk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICAwLCAyMCwgMHhlOWI2YzdhYSwgRyk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA1LCAgNSwgMHhkNjJmMTA1ZCwgRyk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDEwLCAgOSwgMHgwMjQ0MTQ1MywgRyk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDE1LCAxNCwgMHhkOGExZTY4MSwgRyk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA0LCAyMCwgMHhlN2QzZmJjOCwgRyk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA5LCAgNSwgMHgyMWUxY2RlNiwgRyk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDE0LCAgOSwgMHhjMzM3MDdkNiwgRyk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICAzLCAxNCwgMHhmNGQ1MGQ4NywgRyk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA4LCAyMCwgMHg0NTVhMTRlZCwgRyk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsIDEzLCAgNSwgMHhhOWUzZTkwNSwgRyk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICAyLCAgOSwgMHhmY2VmYTNmOCwgRyk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICA3LCAxNCwgMHg2NzZmMDJkOSwgRyk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDEyLCAyMCwgMHg4ZDJhNGM4YSwgRyk7XG5cblx0XHQvLyBSb3VuZCAzLlxuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgNSwgIDQsIDB4ZmZmYTM5NDIsIEgpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgOCwgMTEsIDB4ODc3MWY2ODEsIEgpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxMSwgMTYsIDB4NmQ5ZDYxMjIsIEgpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAxNCwgMjMsIDB4ZmRlNTM4MGMsIEgpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgMSwgIDQsIDB4YTRiZWVhNDQsIEgpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgNCwgMTEsIDB4NGJkZWNmYTksIEgpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgNywgMTYsIDB4ZjZiYjRiNjAsIEgpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAxMCwgMjMsIDB4YmViZmJjNzAsIEgpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAxMywgIDQsIDB4Mjg5YjdlYzYsIEgpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgMCwgMTEsIDB4ZWFhMTI3ZmEsIEgpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgMywgMTYsIDB4ZDRlZjMwODUsIEgpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgNiwgMjMsIDB4MDQ4ODFkMDUsIEgpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgOSwgIDQsIDB4ZDlkNGQwMzksIEgpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAxMiwgMTEsIDB4ZTZkYjk5ZTUsIEgpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxNSwgMTYsIDB4MWZhMjdjZjgsIEgpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgMiwgMjMsIDB4YzRhYzU2NjUsIEgpO1xuXG5cdFx0Ly8gUm91bmQgNC5cblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDAsICA2LCAweGY0MjkyMjQ0LCBJKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDcsIDEwLCAweDQzMmFmZjk3LCBJKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTQsIDE1LCAweGFiOTQyM2E3LCBJKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDUsIDIxLCAweGZjOTNhMDM5LCBJKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgMTIsICA2LCAweDY1NWI1OWMzLCBJKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDMsIDEwLCAweDhmMGNjYzkyLCBJKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTAsIDE1LCAweGZmZWZmNDdkLCBJKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDEsIDIxLCAweDg1ODQ1ZGQxLCBJKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDgsICA2LCAweDZmYTg3ZTRmLCBJKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgMTUsIDEwLCAweGZlMmNlNmUwLCBJKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDYsIDE1LCAweGEzMDE0MzE0LCBJKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgMTMsIDIxLCAweDRlMDgxMWExLCBJKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDQsICA2LCAweGY3NTM3ZTgyLCBJKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgMTEsIDEwLCAweGJkM2FmMjM1LCBJKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDIsIDE1LCAweDJhZDdkMmJiLCBJKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDksIDIxLCAweGViODZkMzkxLCBJKTtcblxuXHRcdEFbMF0gKz0gQUE7XG5cdFx0QlswXSArPSBCQjtcblx0XHRDWzBdICs9IENDO1xuXHRcdERbMF0gKz0gREQ7XG5cdH1cblxuXHRydmFsID0gW107XG5cdHRvNGJ5dGVzKEFbMF0pLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgcnZhbC5wdXNoKGUpOyB9KTtcblx0dG80Ynl0ZXMoQlswXSkuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBydmFsLnB1c2goZSk7IH0pO1xuXHR0bzRieXRlcyhDWzBdKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IHJ2YWwucHVzaChlKTsgfSk7XG5cdHRvNGJ5dGVzKERbMF0pLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgcnZhbC5wdXNoKGUpOyB9KTtcblxuXHRyZXR1cm4gcnZhbDtcbn1cblxuZnVuY3Rpb24gZGlnZXN0U3RyaW5nKHMpIHtcblx0dmFyIE0gPSBbXVxuICAgICwgaVxuICAgICwgZFxuICAgICwgcnN0clxuICAgICwgc1xuICAgIDtcblxuXHRmb3IgKGkgPSAwOyBpIDwgcy5sZW5ndGg7IGkrKylcblx0XHRNLnB1c2gocy5jaGFyQ29kZUF0KGkpKTtcblxuXHRkID0gZGlnZXN0KE0pO1xuXHRyc3RyID0gJyc7XG5cblx0ZC5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG5cdFx0cyA9IGUudG9TdHJpbmcoMTYpO1xuXHRcdHdoaWxlIChzLmxlbmd0aCA8IDIpXG5cdFx0XHRzID0gJzAnICsgcztcblx0XHRyc3RyICs9IHM7XG5cdH0pO1xuXG5cdHJldHVybiByc3RyO1xufSIsInZhciB0eXBlID0gcmVxdWlyZSggXCJ0eXBlLWNvbXBvbmVudFwiICk7XG5cbnZhciBtZXJnZSA9IGZ1bmN0aW9uICgpIHtcblxuICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKCBhcmd1bWVudHMgKSxcbiAgICBkZWVwID0gdHlwZSggYXJnc1sgMCBdICkgPT09IFwiYm9vbGVhblwiID8gYXJncy5zaGlmdCgpIDogZmFsc2UsXG4gICAgb2JqZWN0cyA9IGFyZ3MsXG4gICAgcmVzdWx0ID0ge307XG5cbiAgb2JqZWN0cy5mb3JFYWNoKCBmdW5jdGlvbiAoIG9iamVjdG4gKSB7XG5cbiAgICBpZiAoIHR5cGUoIG9iamVjdG4gKSAhPT0gXCJvYmplY3RcIiApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBPYmplY3Qua2V5cyggb2JqZWN0biApLmZvckVhY2goIGZ1bmN0aW9uICgga2V5ICkge1xuICAgICAgaWYgKCBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwoIG9iamVjdG4sIGtleSApICkge1xuICAgICAgICBpZiAoIGRlZXAgJiYgdHlwZSggb2JqZWN0blsga2V5IF0gKSA9PT0gXCJvYmplY3RcIiApIHtcbiAgICAgICAgICByZXN1bHRbIGtleSBdID0gbWVyZ2UoIGRlZXAsIHt9LCByZXN1bHRbIGtleSBdLCBvYmplY3RuWyBrZXkgXSApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFsga2V5IF0gPSBvYmplY3RuWyBrZXkgXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcblxuICB9ICk7XG5cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbWVyZ2U7IiwiXG4vKipcbiAqIHRvU3RyaW5nIHJlZi5cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG4vKipcbiAqIFJldHVybiB0aGUgdHlwZSBvZiBgdmFsYC5cbiAqXG4gKiBAcGFyYW0ge01peGVkfSB2YWxcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqIEBhcGkgcHVibGljXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwpe1xuICBzd2l0Y2ggKHRvU3RyaW5nLmNhbGwodmFsKSkge1xuICAgIGNhc2UgJ1tvYmplY3QgRnVuY3Rpb25dJzogcmV0dXJuICdmdW5jdGlvbic7XG4gICAgY2FzZSAnW29iamVjdCBEYXRlXSc6IHJldHVybiAnZGF0ZSc7XG4gICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzogcmV0dXJuICdyZWdleHAnO1xuICAgIGNhc2UgJ1tvYmplY3QgQXJndW1lbnRzXSc6IHJldHVybiAnYXJndW1lbnRzJztcbiAgICBjYXNlICdbb2JqZWN0IEFycmF5XSc6IHJldHVybiAnYXJyYXknO1xuICB9XG5cbiAgaWYgKHZhbCA9PT0gbnVsbCkgcmV0dXJuICdudWxsJztcbiAgaWYgKHZhbCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gJ3VuZGVmaW5lZCc7XG4gIGlmICh2YWwgPT09IE9iamVjdCh2YWwpKSByZXR1cm4gJ29iamVjdCc7XG5cbiAgcmV0dXJuIHR5cGVvZiB2YWw7XG59O1xuIiwidmFyIE9ic2VydmFibGVBcnJheSA9IGZ1bmN0aW9uICggX2FycmF5ICkge1xuXHR2YXIgaGFuZGxlcnMgPSB7fSxcblx0XHRhcnJheSA9IEFycmF5LmlzQXJyYXkoIF9hcnJheSApID8gX2FycmF5IDogW107XG5cblx0dmFyIHByb3h5ID0gZnVuY3Rpb24gKCBfbWV0aG9kLCBfdmFsdWUgKSB7XG5cdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzLCAxICk7XG5cblx0XHRpZiAoIGhhbmRsZXJzWyBfbWV0aG9kIF0gKSB7XG5cdFx0XHRyZXR1cm4gaGFuZGxlcnNbIF9tZXRob2QgXS5hcHBseSggYXJyYXksIGFyZ3MgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGFycmF5WyAnX18nICsgX21ldGhvZCBdLmFwcGx5KCBhcnJheSwgYXJncyApO1xuXHRcdH1cblx0fTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyggYXJyYXksIHtcblx0XHRvbjoge1xuXHRcdFx0dmFsdWU6IGZ1bmN0aW9uICggX2V2ZW50LCBfY2FsbGJhY2sgKSB7XG5cdFx0XHRcdGhhbmRsZXJzWyBfZXZlbnQgXSA9IF9jYWxsYmFjaztcblx0XHRcdH1cblx0XHR9XG5cdH0gKTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIGFycmF5LCAncG9wJywge1xuXHRcdHZhbHVlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gcHJveHkoICdwb3AnLCBhcnJheVsgYXJyYXkubGVuZ3RoIC0gMSBdICk7XG5cdFx0fVxuXHR9ICk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBhcnJheSwgJ19fcG9wJywge1xuXHRcdHZhbHVlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLnBvcC5hcHBseSggYXJyYXksIGFyZ3VtZW50cyApO1xuXHRcdH1cblx0fSApO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggYXJyYXksICdzaGlmdCcsIHtcblx0XHR2YWx1ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHByb3h5KCAnc2hpZnQnLCBhcnJheVsgMCBdICk7XG5cdFx0fVxuXHR9ICk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBhcnJheSwgJ19fc2hpZnQnLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBBcnJheS5wcm90b3R5cGUuc2hpZnQuYXBwbHkoIGFycmF5LCBhcmd1bWVudHMgKTtcblx0XHR9XG5cdH0gKTtcblxuXHRbICdwdXNoJywgJ3JldmVyc2UnLCAndW5zaGlmdCcsICdzb3J0JywgJ3NwbGljZScgXS5mb3JFYWNoKCBmdW5jdGlvbiAoIF9tZXRob2QgKSB7XG5cdFx0dmFyIHByb3BlcnRpZXMgPSB7fTtcblxuXHRcdHByb3BlcnRpZXNbIF9tZXRob2QgXSA9IHtcblx0XHRcdHZhbHVlOiBwcm94eS5iaW5kKCBudWxsLCBfbWV0aG9kIClcblx0XHR9O1xuXG5cdFx0cHJvcGVydGllc1sgJ19fJyArIF9tZXRob2QgXSA9IHtcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiAoIF92YWx1ZSApIHtcblx0XHRcdFx0cmV0dXJuIEFycmF5LnByb3RvdHlwZVsgX21ldGhvZCBdLmFwcGx5KCBhcnJheSwgYXJndW1lbnRzICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBhcnJheSwgcHJvcGVydGllcyApO1xuXHR9ICk7XG5cblx0cmV0dXJuIGFycmF5O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPYnNlcnZhYmxlQXJyYXk7IiwibW9kdWxlLmV4cG9ydHM9e1xuICBcIm5hbWVcIjogXCJzY2ZpbHRlcmVkbGlzdFwiLFxuICBcImNsYXNzTmFtZVwiOiBcInNjLWZpbHRlcmVkLWxpc3RcIixcbiAgXCJkZWZhdWx0c1wiOiB7XG4gICAgXCJidXR0b25MYWJlbFwiOiBcIkNob29zZSBvbmVcIixcbiAgICBcImZ1enp5XCI6IGZhbHNlLFxuICAgIFwiaXRlbUxhYmVsS2V5XCI6IFwibmFtZVwiLFxuICAgIFwibGlzdFRpdGxlXCI6IFwiU2VsZWN0IGFuIGl0ZW1cIixcbiAgICBcIm1heE51bUl0ZW1zXCI6IDEwLFxuICAgIFwibWF4TnVtSXRlbXNWaXNpYmxlXCI6IDcsXG4gICAgXCJtaW5XaWR0aFwiOiAzMDAsXG4gICAgXCJzb3J0XCI6IFwiZGVzY1wiLFxuICAgIFwic29ydENvbnRyb2xWaXNpYmxlXCI6IHRydWVcbiAgfSxcbiAgXCJ0ZW1wbGF0ZXNcIjoge1xuICAgIFwibGlzdFdyYXBwZXJcIjogXCI8ZGl2IGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1jb250YWluZXInPnt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdElucHV0fX17eyFjb25maWcudGVtcGxhdGVzLmxpc3RIZWFkZXJ9fXt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdEl0ZW1XcmFwcGVyfX08L2Rpdj5cIixcbiAgICBcImxpc3RJbnB1dFwiOiBcIjxkaXYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWlucHV0LWNvbnRhaW5lcic+PGlucHV0IHR5cGU9J3RleHQnIGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1pbnB1dCBmb3JtLWNvbnRyb2wnPjwvZGl2PlwiLFxuICAgIFwibGlzdEhlYWRlclwiOiBcIjxoZWFkZXIgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWhlYWRlciBwYW5lbC1oZWFkaW5nJz57eyFjb25maWcuZGVmYXVsdHMubGlzdFRpdGxlfX17eyFjb25maWcudGVtcGxhdGVzLmxpc3RTb3J0VG9nZ2xlfX08L2hlYWRlcj5cIixcbiAgICBcImxpc3RJdGVtV3JhcHBlclwiOiBcIjxkaXYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWl0ZW1zIGxpc3QtZ3JvdXAnPjwvZGl2PlwiLFxuICAgIFwibGlzdEl0ZW1cIjogXCI8YSBocmVmIGNsYXNzPSd7e2NvbmZpZy5jbGFzc05hbWV9fS1pdGVtIGxpc3QtZ3JvdXAtaXRlbScgZGF0YS1jaWQ9J3t7Y2lkfX0nPnt7IWtleX19PC9hPlwiLFxuICAgIFwibGlzdFNvcnRUb2dnbGVcIjogXCI8YnV0dG9uIHR5cGU9J2J1dHRvbicgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LXNvcnQtdG9nZ2xlIGJ0biBidG4tZGVmYXVsdCBidG4teHMnIHRpdGxlPSdzb3J0Jz48L2J1dHRvbj5cIlxuICB9XG59IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoIFwiLi9jb25maWcuanNvblwiICksXG4gIGVtaXR0ZXIgPSByZXF1aXJlKCBcImVtaXR0ZXItY29tcG9uZW50XCIgKSxcbiAgZ3VpZCA9IHJlcXVpcmUoIFwic2MtZ3VpZFwiICksXG4gIGhlbHBlcnMgPSByZXF1aXJlKCBcIi4vaGVscGVyc1wiICksXG4gIGlzID0gcmVxdWlyZSggXCJzYy1pc1wiICksXG4gIExpc3QgPSByZXF1aXJlKCBcIi4vbGlzdFwiICksXG4gIG9ic2VydmFibGVBcnJheSA9IHJlcXVpcmUoIFwic2ctb2JzZXJ2YWJsZS1hcnJheVwiICk7XG5cbi8qKlxuICogYHNjLWZpbHRlcmVkLWxpc3RgIGlzIGEgVUkgY29udHJvbCB0byBhbGxvdyB0aGUgdXNlciB0byBxdWlja2x5IGNob29zZSBhXG4gKiBzaW5nbGUgb2JqZWN0IGZyb20gYSBsaXN0IG9mIG1hbnkgb2JqZWN0cy5cbiAqXG4gKiAjIyBPdmVydmlld1xuICpcbiAqIFRoaXMgY29udHJvbCBpcyBhdHRhY2hlZCB0byBhIGJ1dHRvbi4gV2hlbiB0aGUgYnV0dG9uIGlzIGNsaWNrZWQgYSBsaXN0XG4gKiB3b3VsZCBhcHBlYXIgaW5saW5lIHRvIGFsbG93IHRoZSB1c2VyIHRvIGVpdGhlciB1c2UgdGhlIG1vdXNlIG9yIGtleWJvYXJkXG4gKiB0byBjaG9vc2UgYW4gaXRlbS4gQSB0ZXh0IGlucHV0IGlzIGF2YWlsYWJsZSB0byBhbGxvdyB0aGUgbGlzdCB0byBiZVxuICogZmlsdGVyZWQuXG4gKlxuICogIyMgSW5zdGFudGlhdGVcbiAqXG4gKiBUaGUgYEZpbHRlcmVkTGlzdGAgY2FuIGJlIGluc3RhbnRpYXRlZCB1c2luZyBgZGF0YS1gIGF0dHJpYnV0ZXMgZGlyZWN0bHkgaW5cbiAqIHRoZSBtYXJrdXAgb3IgbWFudWFsbHkgYnkgY29kZS5cbiAqXG4gKiAqKkluc3RhbnRpYXRlIHVzaW5nIGBkYXRhLWAgYXR0cmlidXRlcyoqXG4gKlxuICogQWRkIGBkYXRhLXNjLWZpbHRlcmVkLWxpc3RgIHRvIGEgYDxidXR0b24+YC4gV2lsbCBpbnN0YW50aWF0ZSBvbiBkb21yZWFkeS5cbiAqXG4gKiAgIDxidXR0b24gZGF0YS1zYy1maWx0ZXJlZC1saXN0PlxuICpcbiAqIFRvIGdldCBhIHJlZmVyZW5jZSB0byB0aGUgaW5zdGFudGlhdGVkIG9iamVjdCB1c2UgdGhlIGpRdWVyeSBgZGF0YWAgbWV0aG9kOlxuICpcbiAqICAgJCgnI215QnV0dG9uJykuZGF0YSgnc2NmaWx0ZXJlZGxpc3QnKTtcbiAqXG4gKiAqKkluc3RhbnRpYXRlIHVzaW5nIGNvZGUqKlxuICpcbiAqICAgdmFyIGZpbHRlciA9IG5ldyBGaWx0ZXJlZExpc3QoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI215QnV0dG9uJykpO1xuICpcbiAqICMjIyBPcHRpb25zXG4gKlxuICogR2l2ZSBvcHRpb25zIHVzaW5nIHRoZSBgZGF0YS1gIGF0dHJpYnV0ZS5cbiAqXG4gKiAgIDxidXR0b24gZGF0YS1zYy1maWx0ZXJlZC1saXN0IGRhdGEtc2MtZmlsdGVyZWQtbGlzdC1vcHRpb25zPSd7XCJmdXp6eVwiOiB0cnVlfSc+XG4gKlxuICogPiBUaGUgb3B0aW9ucyBvYmplY3QgbXVzdCBiZSBhIHByb3Blcmx5IGZvcm1hdHRlZCBKU09OIHN0cmluZy5cbiAqXG4gKiBHaXZlIG9wdGlvbnMgdXNpbmcgY29kZS5cbiAqXG4gKiAgIHZhciBmaWx0ZXIgPSBuZXcgRmlsdGVyZWRMaXN0KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNteUJ1dHRvbicpLCB7XG4gKiAgICAgZnV6enk6IHRydWVcbiAqICAgfSk7XG4gKlxuICogLSBgYnV0dG9uTGFiZWxgIFRoZSBidXR0b24gbGFiZWwgKGRlZmF1bHQ6IFwiQ2hvb3NlIG9uZVwiKVxuICogLSBgZnV6enlgIFRoZSBzZWFyY2ggdHlwZS4gSWYgdHJ1ZSBcImR2ZFwiIHdpbGwgbWF0Y2ggXCJkYXZpZFwiIChkZWZhdWx0OiBmYWxzZSlcbiAqIC0gYGl0ZW1MYWJlbEtleWAgVGhlIG9iamVjdCBrZXkgdG8gdXNlIGZvciB0aGUgaXRlbXMgbGFiZWwgKGRlZmF1bHQ6IFwibmFtZVwiKVxuICogLSBgbGlzdFRpdGxlYCBUaGUgdGl0bGUgYWJvdmUgdGhlIGxpc3QgKGRlZmF1bHQ6IFwiU2VsZWN0IGFuIGl0ZW1cIilcbiAqIC0gYG1heE51bUl0ZW1zYCBUaGUgbWF4aW11bSBudW1iZXIgb2YgaXRlbXMgaW4gdGhlIGxpc3QgKGRlZmF1bHQ6IDEwKVxuICogLSBgbWF4TnVtSXRlbXNWaXNpYmxlYCBUaGUgbWF4aW11bSBudW1iZXIgb2YgaXRlbXMgdmlzaWJsZSAoZGVmYXVsdDogNylcbiAqIC0gYG1pbldpZHRoYCBUaGUgd2lkdGggb2YgdGhlIGxpc3QgKGRlZmF1bHQ6IDMwMClcbiAqIC0gYHNvcnRgIFRoZSBkZWZhdWx0IHNvcnQgW1wiXCIsIFwiYXNjXCIsIFwiZGVzY1wiXSAoZGVmYXVsdDogXCJkZXNjXCIpXG4gKiAtIGBzb3J0Q29udHJvbFZpc2libGVgIElmIHRoZSBzb3J0IGNvbnRyb2wgaXMgdmlzaWJsZSAoZGVmYXVsdDogdHJ1ZSlcbiAqXG4gKiAjIyMgRGVmYXVsdHNcbiAqXG4gKiBUbyBjaGFuZ2UgdGhlIGRlZmF1bHRzLCB1c2UgdGhlIGdsb2JhbCBgRmlsdGVyZWRMaXN0YCB2YXJpYWJsZS5cbiAqXG4gKiAgIEZpbHRlcmVkTGlzdC5kZWZhdWx0cy5tYXhOdW1JdGVtcyA9IDEwO1xuICpcbiAqICMjIyBFdmVudHNcbiAqXG4gKiBUaGUgYEZpbHRlcmVkTGlzdGAgdXNlcyBhbiBldmVudCBiYXNlZCBzeXN0ZW0gd2l0aCBtZXRob2RzIGBvbmAsIGBvZmZgIGFuZFxuICogYG9uY2VgLlxuICpcbiAqICAgbXlMaXN0Lm9uKCdjaGFuZ2UnLCBmdW5jdGlvbigpe30pO1xuICpcbiAqICoqRXZlbnRzKipcbiAqXG4gKiAtIGBjaGFuZ2VgIFdoZW4gdGhlIHVzZXIgc2VsZWN0cyBhbmQgaXRlbSBhbmQgdGhlIHZhbHVlIGhhcyBjaGFuZ2VkXG4gKiAtIGBjbG9zZWAgV2hlbiB0aGUgbGlzdCBjbG9zZXNcbiAqIC0gYGRlc3Ryb3lgIFdoZW4gdGhlIGBGaWx0ZXJlZExpc3RgIGlzIGRlc3Ryb3llZFxuICogLSBgZmlsdGVyZWRgIFdoZW4gdGhlIHNlYXJjaCB2YWx1ZSBjaGFuZ2VzXG4gKiAtIGBpdGVtRm9jdXNgIFdoZW4gYW4gaXRlbSBpbiB0aGUgbGlzdCBnYWlucyBmb2N1c1xuICogLSBgb3BlbmAgV2hlbiB0aGUgbGlzdCBvcGVuc1xuICogLSBgc29ydGAgV2hlbiB0aGUgbGlzdCBpcyBzb3J0ZWRcbiAqIC0gYHJlZHJhd2AgV2hlbiB0aGUgbGlzdCByZWRyYXdzIGl0c2VsZlxuICogLSBgZmV0Y2hgIFdoZW4gdGhlIGxpc3QgdHJpZXMgdG8gZmV0Y2ggZGF0YSBiYXNlZCBvbiB0aGUgc2VhcmNoIHRlcm1cbiAqXG4gKiAjIyMgU3R5bGluZ1xuICpcbiAqIENTUyBpcyBwcm92aWRlZCBhbmQgaXMgcmVxdWlyZWQgaG93ZXZlciBpdCBpcyBwbGFpbiBieSBkZXNpZ24uIFRoZXJlIGFyZSAyXG4gKiB3YXlzIHRvIG1ha2UgdGhlIGxpc3QgcHJldHR5LlxuICpcbiAqIDEuIEluY2x1ZGUgYm9vdHN0cmFwIDMueFxuICogMi4gV3JpdGUgeW91ciBvd25cbiAqXG4gKiAjIyMgVGVtcGxhdGVzXG4gKlxuICogVGhlIG1hcmt1cCB0aGF0IGlzIGdlbmVyYXRlZCBvbiBpbnN0YW50aWF0aW9uIGlzIHRlbXBsYXRlIGRyaXZlbi4gVGhlc2UgdGVtcGxhdGVzXG4gKiBjYW4gYmUgY2hhbmdlZCBpZiBuZWNlc3NhcnkuXG4gKlxuICogKipGaWx0ZXJlZExpc3QudGVtcGxhdGVzLmxpc3RXcmFwcGVyKipcbiAqXG4gKiAgIDxkaXYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWNvbnRhaW5lcic+e3shY29uZmlnLnRlbXBsYXRlcy5saXN0SW5wdXR9fXt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdEhlYWRlcn19e3shY29uZmlnLnRlbXBsYXRlcy5saXN0SXRlbVdyYXBwZXJ9fTwvZGl2PlxuICpcbiAqICoqRmlsdGVyZWRMaXN0LnRlbXBsYXRlcy5saXN0SW5wdXQqKlxuICpcbiAqICAgPGRpdiBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taW5wdXQtY29udGFpbmVyJz48aW5wdXQgdHlwZT0ndGV4dCcgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWlucHV0IGZvcm0tY29udHJvbCc+PC9kaXY+XG4gKlxuICogKipGaWx0ZXJlZExpc3QudGVtcGxhdGVzLmxpc3RIZWFkZXIqKlxuICpcbiAqICAgPGhlYWRlciBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taGVhZGVyIHBhbmVsLWhlYWRpbmcnPnt7IWNvbmZpZy5kZWZhdWx0cy5saXN0VGl0bGV9fXt7IWNvbmZpZy50ZW1wbGF0ZXMubGlzdFNvcnRUb2dnbGV9fTwvaGVhZGVyPlxuICpcbiAqICoqRmlsdGVyZWRMaXN0LnRlbXBsYXRlcy5saXN0SXRlbVdyYXBwZXIqKlxuICpcbiAqICAgPGRpdiBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0taXRlbXMgbGlzdC1ncm91cCc+PC9kaXY+XG4gKlxuICogKipGaWx0ZXJlZExpc3QudGVtcGxhdGVzLmxpc3RJdGVtKipcbiAqXG4gKiAgIDxhIGhyZWYgY2xhc3M9J3t7Y29uZmlnLmNsYXNzTmFtZX19LWl0ZW0gbGlzdC1ncm91cC1pdGVtJyBkYXRhLWNpZD0ne3tjaWR9fSc+e3sha2V5fX08L2E+XG4gKlxuICogKipGaWx0ZXJlZExpc3QudGVtcGxhdGVzLmxpc3RTb3J0VG9nZ2xlKipcbiAqXG4gKiAgIDxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0ne3tjb25maWcuY2xhc3NOYW1lfX0tc29ydC10b2dnbGUgYnRuIGJ0bi1kZWZhdWx0IGJ0bi14cycgdGl0bGU9J3NvcnQnPjwvYnV0dG9uPlxuICpcbiAqIEBjbGFzcyBGaWx0ZXJlZExpc3RcbiAqIEBwYXJhbSB7alF1ZXJ5fEhUTUxFbGVtZW50fSBfZWwgVGhlIGVsZW1lbnQgeW91IHdhbnQgdG8gYXR0YWNoIHRoZSBsaXN0IHRvXG4gKiBAcGFyYW0ge09iamVjdH0gX2RlZmF1bHRzIEEgZGVmYXVsdHMgb2JqZWN0XG4gKiBAcHJvcGVydHkge1N0cmluZ30gX19jaWQgQW4gYXV0b21hdGVkIEdVSUQgdXNlZCBpbnRlcm5hbGx5XG4gKiBAcHJvcGVydHkge1N0cmluZ30gX19jb25maWcgVGhlIGNvbmZpZ1xuICogQHByb3BlcnR5IHtCb29sZWFufSBfX2Rlc3Ryb3llZCBXaGV0aGVyIG9yIG5vdCB0aGUgb2JqZWN0IGhhcyBiZWVuIGRlc3Ryb3llZFxuICogQHJldHVybiB7RmlsdGVyZWRMaXN0fVxuICovXG52YXIgRmlsdGVyZWRMaXN0ID0gZnVuY3Rpb24gKCBfZWwsIF9kZWZhdWx0cyApIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNpZCA9IGd1aWQuZ2VuZXJhdGUoKSxcbiAgICBkZWZhdWx0cyxcbiAgICBsb2NhbENvbmZpZztcblxuICBzZWxmLiRlbCA9ICQoIF9lbCApO1xuXG4gIGlmICggc2VsZi4kZWwubGVuZ3RoID09PSAwICkge1xuICAgIHRocm93IG5ldyBFcnJvciggXCJBbiBpbnZhbGlkIERPTSBlbGVtZW50IHdhcyBnaXZlblwiICk7XG4gIH1cblxuICBkZWZhdWx0cyA9ICQuZXh0ZW5kKCB7fSwgY29uZmlnLmRlZmF1bHRzLCBzZWxmLiRlbC5kYXRhKCBjb25maWcuY2xhc3NOYW1lICsgXCItb3B0aW9uc1wiICksIF9kZWZhdWx0cyApO1xuXG4gIGxvY2FsQ29uZmlnID0gJC5leHRlbmQoIHt9LCBjb25maWcsIHtcbiAgICBkZWZhdWx0czogZGVmYXVsdHNcbiAgfSApO1xuXG4gIHNlbGYuJGVsLndyYXAoIFwiPHNwYW4gY2xhc3M9J1wiICsgbG9jYWxDb25maWcuY2xhc3NOYW1lICsgXCInIGRhdGEtc2MtZmlsdGVyZWQtbGlzdC1jaWQ9J1wiICsgY2lkICsgXCInPlwiICk7XG4gIHNlbGYuJHdyYXBwZXIgPSBzZWxmLiRlbC5wYXJlbnQoKTtcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggc2VsZiwge1xuICAgIFwiX19jaWRcIjoge1xuICAgICAgdmFsdWU6IGNpZFxuICAgIH0sXG4gICAgXCJfX2NvbmZpZ1wiOiB7XG4gICAgICB2YWx1ZTogbG9jYWxDb25maWcsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2Rlc3Ryb3llZFwiOiB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2ZldGNoaW5nXCI6IHtcbiAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9faXRlbXNcIjoge1xuICAgICAgdmFsdWU6IHt9LFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19sYWJlbFwiOiB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fbGFzdEZldGNoZWRWYWx1ZVwiOiB7XG4gICAgICB2YWx1ZTogXCJcIixcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fb3JpZ2luYWxcIjoge1xuICAgICAgdmFsdWU6IHt9LFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19zb3J0XCI6IHtcbiAgICAgIHZhbHVlOiBcIlwiLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX192YWx1ZVwiOiB7XG4gICAgICB2YWx1ZTogbnVsbCxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcImFjdGl2ZUl0ZW1cIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLmFjdGl2ZUl0ZW1HZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLmFjdGl2ZUl0ZW1TZXQuYmluZCggc2VsZiApXG4gICAgfSxcbiAgICBcIml0ZW1zXCI6IHtcbiAgICAgIHZhbHVlOiBvYnNlcnZhYmxlQXJyYXkoIFtdICksXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJsYWJlbFwiOiB7XG4gICAgICBnZXQ6IGhlbHBlcnMubGFiZWxHZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLmxhYmVsU2V0LmJpbmQoIHNlbGYgKVxuICAgIH0sXG4gICAgXCJsaXN0XCI6IHtcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcImxpc3RWaXNpYmxlXCI6IHtcbiAgICAgIGdldDogaGVscGVycy5saXN0VmlzaWJsZUdldC5iaW5kKCBzZWxmICksXG4gICAgICBzZXQ6IGhlbHBlcnMubGlzdFZpc2libGVTZXQuYmluZCggc2VsZiApXG4gICAgfSxcbiAgICBcInJlc3VsdHNcIjoge1xuICAgICAgdmFsdWU6IFtdLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwic29ydFwiOiB7XG4gICAgICBnZXQ6IGhlbHBlcnMuc29ydEdldC5iaW5kKCBzZWxmICksXG4gICAgICBzZXQ6IGhlbHBlcnMuc29ydFNldC5iaW5kKCBzZWxmIClcbiAgICB9LFxuICAgIFwidmFsdWVcIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLnZhbHVlR2V0LmJpbmQoIHNlbGYgKSxcbiAgICAgIHNldDogaGVscGVycy52YWx1ZVNldC5iaW5kKCBzZWxmIClcbiAgICB9XG4gIH0gKTtcblxuICBzZWxmLmxpc3QgPSBuZXcgTGlzdCggc2VsZiApO1xuICBzZWxmLl9fb3JpZ2luYWwuYnV0dG9uVGV4dCA9IHNlbGYuJGVsLnRleHQoKTtcblxuICB2YXIgaXRlbVZhbHVlID0ge307XG4gIGl0ZW1WYWx1ZVsgc2VsZi5fX2NvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXkgXSA9IHNlbGYuX19jb25maWcuZGVmYXVsdHMuYnV0dG9uTGFiZWw7XG4gIHNlbGYudmFsdWUgPSBpdGVtVmFsdWU7XG5cbiAgc2VsZi4kZWxcbiAgICAuYWRkQ2xhc3MoIHNlbGYuX19jb25maWcuY2xhc3NOYW1lICsgXCItYnV0dG9uXCIgKVxuICAgIC5kYXRhKCBzZWxmLl9fY29uZmlnLm5hbWUsIHNlbGYgKVxuICAgIC50cmlnZ2VyKCBzZWxmLl9fY29uZmlnLm5hbWUgKyBcIi1yZWFkeVwiICk7XG5cbiAgaWYgKCBzZWxmLl9fY29uZmlnLmRlZmF1bHRzLnNvcnRDb250cm9sVmlzaWJsZSAhPT0gdHJ1ZSApIHtcbiAgICBzZWxmLiR3cmFwcGVyLmFkZENsYXNzKCBzZWxmLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLXNvcnQtaGlkZGVuXCIgKTtcbiAgfVxuXG4gIFsgXCJwdXNoXCIsIFwic2hpZnRcIiBdLmZvckVhY2goIGZ1bmN0aW9uICggX21ldGhvZCApIHtcbiAgICBzZWxmLml0ZW1zLm9uKCBfbWV0aG9kLCBoZWxwZXJzWyBcIml0ZW1cIiArIF9tZXRob2QgXS5iaW5kKCBzZWxmICkgKTtcbiAgfSApO1xuXG4gICQoIHdpbmRvdyApLm9uKCBcImNsaWNrLlwiICsgc2VsZi5fX2NvbmZpZy5uYW1lLCBoZWxwZXJzLmJvZHlDbGljay5iaW5kKCBzZWxmICkgKTtcblxuICBzZWxmLmZldGNoKCk7XG4gIHNlbGYuZW1pdCggc2VsZi5fX2NvbmZpZy5uYW1lICsgXCItcmVhZHlcIiApO1xufTtcblxuLyoqXG4gKiBBZGRzIGFuIGFycmF5IG9mIG9iamVjdHMvaXRlbXMgaW4gYnVsa1xuICpcbiAqICAgbXlMaXN0LmRhdGEoW3tcbiAqICAgICBuYW1lOiBcImRhdmlkXCJcbiAqICAgfSwge1xuICogICAgIG5hbWU6IFwibWF4XCJcbiAqICAgfV0pO1xuICpcbiAqICMjIEFkZCBhIHNpbmdsZSBvYmplY3QvaXRlbVxuICpcbiAqICAgbXlMaXN0Lml0ZW1zLnB1c2goe1xuICogICAgIG5hbWU6IFwiZGF2aWRcIlxuICogICB9KTtcbiAqXG4gKiAjIyBHZXQgdGhlIHZhbHVlXG4gKlxuICogVG8gZ2V0IHRoZSB2YWx1ZSBvZiB0aGUgc2VsZWN0ZWQgb2JqZWN0L2l0ZW0gdXNlIHRoZSBgdmFsdWVgIHByb3BlcnR5LlxuICpcbiAqICAgbXlMaXN0LnZhbHVlO1xuICpcbiAqL1xuRmlsdGVyZWRMaXN0LnByb3RvdHlwZS5kYXRhID0gZnVuY3Rpb24gKCBfYXJyYXlPZkl0ZW1zICkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBpdGVtcyA9IGlzLmFycmF5KCBfYXJyYXlPZkl0ZW1zICkgPyBfYXJyYXlPZkl0ZW1zIDogW107XG5cbiAgaXRlbXMuZm9yRWFjaCggZnVuY3Rpb24gKCBfaXRlbSApIHtcbiAgICBpZiAoIGlzLmFuLm9iamVjdCggX2l0ZW0gKSApIHtcbiAgICAgIHNlbGYuaXRlbXMucHVzaCggX2l0ZW0gKTtcbiAgICB9XG4gIH0gKTtcbn07XG5cbi8qKlxuICogRGVzdHJveXMgdGhlIGBGaWx0ZXJlZExpc3RgIGFuZCBpbnZhbGlkYXRlcyB0aGUgb2JqZWN0LlxuICpcbiAqICAgbXlMaXN0LmRlc3Ryb3koKTtcbiAqXG4gKiA+IEFueSBmdXJ0aGVyIGNhbGxlcyB0byBtZXRob2RzIGxpa2UgYGRlc3Ryb3lgIG9yIGBkYXRhYCBldGMgd2lsbCByZXR1cm5cbiAqIG5vdGhpbmcuXG4gKi9cbkZpbHRlcmVkTGlzdC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZWxmLl9fZGVzdHJveWVkID0gdHJ1ZTtcbiAgc2VsZi5saXN0LmRlc3Ryb3koKTtcbiAgJCggd2luZG93ICkub2ZmKCBcIi5cIiArIHNlbGYuX19jb25maWcubmFtZSApO1xuXG4gIHNlbGYuJGVsXG4gICAgLnRleHQoIHNlbGYuX19vcmlnaW5hbC5idXR0b25UZXh0IClcbiAgICAudW53cmFwKClcbiAgICAuZGF0YSggc2VsZi5fX2NvbmZpZy5uYW1lLCBudWxsIClcbiAgICAucmVtb3ZlQ2xhc3MoIHNlbGYuX19jb25maWcuY2xhc3NOYW1lICsgXCItYnV0dG9uXCIgKTtcblxuICBzZWxmLmVtaXQoIFwiZGVzdHJveVwiICk7XG59O1xuXG5GaWx0ZXJlZExpc3QucHJvdG90eXBlLmZldGNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciB2YWx1ZSA9IHNlbGYubGlzdC4kaW5wdXQudmFsKCk7XG5cbiAgc2VsZi5fX2xhc3RGZXRjaGVkVmFsdWUgPSB2YWx1ZTtcbiAgc2VsZi5lbWl0KCBcImZldGNoXCIsIHNlbGYuX19sYXN0RmV0Y2hlZFZhbHVlICk7XG59O1xuXG5lbWl0dGVyKCBGaWx0ZXJlZExpc3QucHJvdG90eXBlICk7XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IEZpbHRlcmVkTGlzdDtcbmV4cG9ydHMuZGVmYXVsdHMgPSBjb25maWcuZGVmYXVsdHM7XG5leHBvcnRzLnRlbXBsYXRlcyA9IGNvbmZpZy50ZW1wbGF0ZXM7XG5cbiQoIGZ1bmN0aW9uICgpIHtcbiAgJCggXCJidXR0b25bZGF0YS1cIiArIGNvbmZpZy5jbGFzc05hbWUgKyBcIl1cIiApLmVhY2goIGZ1bmN0aW9uICggX2ksIF9lbCApIHtcbiAgICBuZXcgRmlsdGVyZWRMaXN0KCBfZWwgKTtcbiAgfSApO1xufSApOyIsInZhciBpcyA9IHJlcXVpcmUoIFwic2MtaXNcIiApLFxuICBJdGVtVmFsdWUgPSByZXF1aXJlKCBcIi4vaXRlbS12YWx1ZVwiICksXG4gIHNvcnRUb2dnbGVPcHRpb25zID0gWyBcIlwiLCBcImRlc2NcIiwgXCJhc2NcIiBdLFxuICBtZDUgPSByZXF1aXJlKCBcInNjLW1kNVwiICk7XG5cbmV4cG9ydHMuYWN0aXZlSXRlbUdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlci5saXN0LmdldEFjdGl2ZUl0ZW0oKTtcbn07XG5cbmV4cG9ydHMuYWN0aXZlSXRlbVNldCA9IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmaWx0ZXIudmFsdWUgPSBfdmFsdWU7XG4gIGZpbHRlci5lbWl0KCBcImNoYW5nZVwiLCBfdmFsdWUgKTtcbn07XG5cbmV4cG9ydHMuYWN0aXZlSXRlbUluZGV4R2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gbGlzdC5fX2FjdGl2ZUl0ZW1JbmRleDtcbn07XG5cbmV4cG9ydHMuYWN0aXZlSXRlbUluZGV4U2V0ID0gZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG4gIHZhciBsaXN0ID0gdGhpcztcblxuICBpZiAoIGxpc3QuZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBpbmRleCA9IGlzLmEubnVtYmVyKCBfdmFsdWUgKSA/IF92YWx1ZSA6IDAsXG4gICAgaXRlbUFjdGl2ZUNsYXNzTmFtZSA9IGxpc3QuZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWl0ZW0tYWN0aXZlXCIsXG4gICAgJGl0ZW1DaGlsZHJlbiA9IGxpc3QuJGxpc3QuY2hpbGRyZW4oKSxcbiAgICAkZmlyc3RJdGVtID0gJCggJGl0ZW1DaGlsZHJlblsgMCBdICksXG4gICAgJGFjdGl2ZUl0ZW1JbmRleEJ5Q2xhc3MgPSBsaXN0LiRsaXN0LmZpbmQoIFwiLlwiICsgaXRlbUFjdGl2ZUNsYXNzTmFtZSApLFxuICAgICRhY3RpdmVJdGVtSW5kZXhCeUluZGV4ID0gJCggJGl0ZW1DaGlsZHJlblsgaW5kZXggXSApLFxuICAgICRhY3RpdmVJdGVtSW5kZXggPSAkYWN0aXZlSXRlbUluZGV4QnlJbmRleC5sZW5ndGggPT09IDEgPyAkYWN0aXZlSXRlbUluZGV4QnlJbmRleCA6ICRhY3RpdmVJdGVtSW5kZXhCeUNsYXNzLmxlbmd0aCA9PT0gMSA/ICRhY3RpdmVJdGVtSW5kZXhCeUNsYXNzIDogJGZpcnN0SXRlbTtcblxuICAkYWN0aXZlSXRlbUluZGV4QnlDbGFzcy5yZW1vdmVDbGFzcyggaXRlbUFjdGl2ZUNsYXNzTmFtZSApO1xuICAkYWN0aXZlSXRlbUluZGV4LmFkZENsYXNzKCBpdGVtQWN0aXZlQ2xhc3NOYW1lICk7XG4gIGxpc3QuX19hY3RpdmVJdGVtSW5kZXggPSAkaXRlbUNoaWxkcmVuLmluZGV4KCAkYWN0aXZlSXRlbUluZGV4ICk7XG5cbiAgaWYgKCBsaXN0Ll9fdmlzaWJsZSApIHtcbiAgICBsaXN0LmZpbHRlci5lbWl0KCBcIml0ZW1Gb2N1c1wiICk7XG4gIH1cbn07XG5cbmV4cG9ydHMuYm9keUNsaWNrID0gZnVuY3Rpb24gKCBfZXZlbnQgKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBidXR0b25DbGFzcyA9IFwiLlwiICsgZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWJ1dHRvblwiLFxuICAgIGNvbnRhaW5lckNsYXNzID0gXCIuXCIgKyBmaWx0ZXIuX19jb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyXCIsXG4gICAgJGNsaWNrZWRFbGVtZW50ID0gJCggaXMub2JqZWN0KCBfZXZlbnQgKSAmJiBfZXZlbnQudGFyZ2V0ID8gX2V2ZW50LnRhcmdldCA6IG51bGwgKSxcbiAgICAkdGhpc1BhcmVudCA9ICRjbGlja2VkRWxlbWVudC5jbG9zZXN0KCBcIltkYXRhLVwiICsgZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWNpZD1cIiArIGZpbHRlci5fX2NpZCArIFwiXVwiICksXG4gICAgY2xpY2tlZEJ1dHRvbiA9ICR0aGlzUGFyZW50Lmxlbmd0aCA+IDAgJiYgKCAkY2xpY2tlZEVsZW1lbnQuaXMoIGJ1dHRvbkNsYXNzICkgfHwgJGNsaWNrZWRFbGVtZW50LmNsb3Nlc3QoIGJ1dHRvbkNsYXNzICkubGVuZ3RoICkgPyB0cnVlIDogZmFsc2UsXG4gICAgY2xpY2tlZExpc3QgPSAkdGhpc1BhcmVudC5sZW5ndGggPiAwICYmICggJGNsaWNrZWRFbGVtZW50LmlzKCBjb250YWluZXJDbGFzcyApIHx8ICRjbGlja2VkRWxlbWVudC5jbG9zZXN0KCBjb250YWluZXJDbGFzcyApLmxlbmd0aCApID8gdHJ1ZSA6IGZhbHNlO1xuXG4gIGlmICggY2xpY2tlZEJ1dHRvbiAmJiAhZmlsdGVyLmxpc3RWaXNpYmxlICkge1xuICAgIGZpbHRlci5saXN0VmlzaWJsZSA9IHRydWU7XG4gIH0gZWxzZSBpZiAoIGZpbHRlci5saXN0VmlzaWJsZSAmJiAhY2xpY2tlZExpc3QgKSB7XG4gICAgZmlsdGVyLmxpc3RWaXNpYmxlID0gZmFsc2U7XG4gIH1cbn07XG5cbmV4cG9ydHMuZmlsdGVyQ2hhbmdlZCA9IGZ1bmN0aW9uICggX2V2ZW50ICkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIga2V5Q29kZSA9IGlzLm9iamVjdCggX2V2ZW50ICkgJiYgaXMubnVtYmVyKCBfZXZlbnQua2V5Q29kZSApID8gX2V2ZW50LmtleUNvZGUgOiAtMSxcbiAgICB2YWwgPSBsaXN0LiRpbnB1dC52YWwoKTtcblxuICBzd2l0Y2ggKCBrZXlDb2RlICkge1xuICBjYXNlIDI3OiAvLyBlc2NhcGVcbiAgICBsaXN0LmNsb3NlKCk7XG4gICAgYnJlYWs7XG4gIGNhc2UgMTM6IC8vIGVudGVyXG4gICAgbGlzdC5jbG9zZSgpO1xuICAgIGxpc3QuZmlsdGVyLmFjdGl2ZUl0ZW0gPSBsaXN0LmdldEFjdGl2ZUl0ZW0oKTtcbiAgICBicmVhaztcbiAgY2FzZSAzODogLy8gdXBcbiAgICBsaXN0LmFjdGl2ZUl0ZW1JbmRleC0tO1xuICAgIGJyZWFrO1xuICBjYXNlIDQwOiAvLyBkb3duXG4gICAgbGlzdC5hY3RpdmVJdGVtSW5kZXgrKztcbiAgICBicmVhaztcbiAgZGVmYXVsdDpcbiAgICBpZiAoIGtleUNvZGUgPj0gMCApIHtcbiAgICAgIGxpc3QuZmlsdGVyLmVtaXQoIFwiZmlsdGVyQ2hhbmdlZFwiLCB2YWwgKTtcbiAgICAgIGxpc3QuZmlsdGVyLmZldGNoKCk7XG4gICAgfVxuICAgIGJyZWFrO1xuICB9XG5cbn07XG5cbmV4cG9ydHMuaW5kZXhPZiA9IGZ1bmN0aW9uICggX2FycmF5LCBfdmFsdWUgKSB7XG4gIHZhciBhcnJheSA9IGlzLmFycmF5KCBfYXJyYXkgKSA/IF9hcnJheSA6IFtdLFxuICAgIGluZGV4ID0gLTE7XG5cbiAgYXJyYXkuZm9yRWFjaCggZnVuY3Rpb24gKCBfdmFsLCBfaSApIHtcbiAgICBpZiAoIGluZGV4ID09PSAtMSAmJiBfdmFsdWUgPT09IF92YWwgKSB7XG4gICAgICBpbmRleCA9IF9pO1xuICAgIH1cbiAgfSApO1xuXG4gIHJldHVybiBpbmRleDtcbn07XG5cbmV4cG9ydHMud2luZG93S2V5VXAgPSBmdW5jdGlvbiAoIF9ldmVudCApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGtleUNvZGUgPSBpcy5vYmplY3QoIF9ldmVudCApICYmIGlzLm51bWJlciggX2V2ZW50LmtleUNvZGUgKSA/IF9ldmVudC5rZXlDb2RlIDogLTE7XG5cbiAgc3dpdGNoICgga2V5Q29kZSApIHtcbiAgY2FzZSAyNzogLy8gZXNjYXBlXG4gICAgbGlzdC5jbG9zZSgpO1xuICAgIGJyZWFrO1xuICB9XG59O1xuXG5leHBvcnRzLml0ZW1DbGljayA9IGZ1bmN0aW9uICggX2V2ZW50ICkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBfZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICB2YXIgJGl0ZW0gPSAkKCBfZXZlbnQuY3VycmVudFRhcmdldCApO1xuXG4gIGxpc3QuYWN0aXZlSXRlbUluZGV4ID0gJGl0ZW0ucGFyZW50KCkuY2hpbGRyZW4oKS5pbmRleCggJGl0ZW0gKTtcbiAgbGlzdC5maWx0ZXIuYWN0aXZlSXRlbSA9IGxpc3QuZ2V0QWN0aXZlSXRlbSgpO1xuICBsaXN0LmNsb3NlKCk7XG59O1xuXG5leHBvcnRzLml0ZW1wdXNoID0gZnVuY3Rpb24gKCBfaXRlbSApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCAhX2l0ZW0uaGFzT3duUHJvcGVydHkoIFwiX19jaWRcIiApICkge1xuICAgIHZhciBpdGVtSGFzaCA9IG1kNSggX2l0ZW0gKTtcblxuICAgIGlmICggIWZpbHRlci5fX2l0ZW1zWyBpdGVtSGFzaCBdICkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KCBfaXRlbSwgXCJfX2NpZFwiLCB7XG4gICAgICAgIHZhbHVlOiBpdGVtSGFzaFxuICAgICAgfSApO1xuICAgICAgZmlsdGVyLl9faXRlbXNbIGl0ZW1IYXNoIF0gPSBfaXRlbTtcbiAgICAgIGZpbHRlci5pdGVtcy5fX3B1c2goIF9pdGVtICk7XG4gICAgICBmaWx0ZXIubGlzdC5yZWRyYXcoKTtcbiAgICB9XG4gIH1cblxufTtcblxuZXhwb3J0cy5pdGVtc2hpZnQgPSBmdW5jdGlvbiAoIF9pdGVtICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaXRlbUhhc2ggPSBtZDUoIF9pdGVtICk7XG4gIGRlbGV0ZSBmaWx0ZXIuX19pdGVtc1sgaXRlbUhhc2ggXTtcbiAgZmlsdGVyLml0ZW1zLl9fc2hpZnQoKTtcbn07XG5cbmV4cG9ydHMubGFiZWxHZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBmaWx0ZXIuX19sYWJlbDtcbn07XG5cbmV4cG9ydHMubGFiZWxTZXQgPSBmdW5jdGlvbiAoIF9sYWJlbCApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZmlsdGVyLl9fbGFiZWwgPSBfbGFiZWwgfHwgZmlsdGVyLl9fY29uZmlnLmRlZmF1bHRzLmRlZmF1bHRCdXR0b25MYWJlbDtcbiAgZmlsdGVyLiRlbC50ZXh0KCBmaWx0ZXIuX19sYWJlbCApO1xuICByZXR1cm4gZmlsdGVyLl9fbGFiZWw7XG59O1xuXG5leHBvcnRzLmxpc3RWaXNpYmxlR2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gZmlsdGVyLmxpc3QuX192aXNpYmxlO1xufTtcblxuZXhwb3J0cy5saXN0VmlzaWJsZVNldCA9IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdmlzaWJsZSA9IF92YWx1ZSA9PT0gdHJ1ZSB8fCBmYWxzZTtcbiAgcmV0dXJuIHZpc2libGUgPyBmaWx0ZXIubGlzdC5vcGVuKCkgOiBmaWx0ZXIubGlzdC5jbG9zZSgpO1xufTtcblxuZXhwb3J0cy5wdXRGb2N1c3NlZEl0ZW1JblZpZXcgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsaXN0ID0gdGhpcztcblxuICBpZiAoIGxpc3QuZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNldFRpbWVvdXQoIGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbGlzdEhlaWdodCA9IGxpc3QuJGxpc3QuaGVpZ2h0KCksXG4gICAgICBmb2N1c3NlZEl0ZW0gPSBsaXN0LiRsaXN0LmZpbmQoIFwiLlwiICsgbGlzdC5maWx0ZXIuX19jb25maWcuY2xhc3NOYW1lICsgXCItaXRlbS1hY3RpdmVcIiApO1xuXG4gICAgaWYgKCBmb2N1c3NlZEl0ZW0ubGVuZ3RoID09PSAwICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBpdGVtSGVpZ2h0ID0gZm9jdXNzZWRJdGVtLm91dGVySGVpZ2h0KCksXG4gICAgICBpdGVtVG9wID0gZm9jdXNzZWRJdGVtLnBvc2l0aW9uKCkudG9wLCAvLyBUT0RPOiBvZmZzZXQgdG9wIGNvdWxkIGJlIGdvb2QgZW5vdWdoIGhlcmVcbiAgICAgIGl0ZW1Cb3R0b20gPSBpdGVtVG9wICsgaXRlbUhlaWdodDtcblxuICAgIGlmICggaXRlbVRvcCA8IDAgfHwgaXRlbUJvdHRvbSA+IGxpc3RIZWlnaHQgKSB7XG4gICAgICBmb2N1c3NlZEl0ZW1bIDAgXS5zY3JvbGxJbnRvVmlldyggaXRlbVRvcCA8IDAgKTtcbiAgICB9XG5cbiAgfSwgMTAgKTtcbn07XG5cbmV4cG9ydHMuc29ydEdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlci5fX3NvcnQ7XG59O1xuXG5leHBvcnRzLnNvcnRTZXQgPSBmdW5jdGlvbiAoIF92YWx1ZSApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXMsXG4gICAgc29ydE9wdGlvbjtcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc29ydENsYXNzTmFtZSA9IGZpbHRlci5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1zb3J0LVwiLFxuICAgIHNvcnRDbGFzc05hbWVzID0gc29ydFRvZ2dsZU9wdGlvbnMuam9pbiggXCIgXCIgKyBzb3J0Q2xhc3NOYW1lICkudHJpbSgpO1xuXG4gIHNvcnRUb2dnbGVPcHRpb25zLmZvckVhY2goIGZ1bmN0aW9uICggX3NvcnRPcHRpb24gKSB7XG4gICAgaWYgKCAhc29ydE9wdGlvbiAmJiBfc29ydE9wdGlvbiA9PT0gX3ZhbHVlICkge1xuICAgICAgc29ydE9wdGlvbiA9IF92YWx1ZTtcbiAgICB9XG4gIH0gKTtcblxuICBmaWx0ZXIuX19zb3J0ID0gc29ydE9wdGlvbiB8fCBzb3J0VG9nZ2xlT3B0aW9uc1sgMCBdO1xuICBmaWx0ZXIubGlzdC5yZWRyYXcoKTtcbiAgZmlsdGVyLiR3cmFwcGVyLnJlbW92ZUNsYXNzKCBzb3J0Q2xhc3NOYW1lcyApLmFkZENsYXNzKCBmaWx0ZXIuX19zb3J0ID8gc29ydENsYXNzTmFtZSArIGZpbHRlci5fX3NvcnQgOiBcIlwiICk7XG4gIGZpbHRlci5lbWl0KCBcInNvcnRcIiApO1xuICByZXR1cm4gZmlsdGVyLl9fc29ydDtcbn07XG5cbmV4cG9ydHMuc29ydFRvZ2dsZUNsaWNrZWQgPSBmdW5jdGlvbiAoIF9ldmVudCApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGZpbHRlciA9IGxpc3QuZmlsdGVyLFxuICAgIGN1cnJlbnRTb3J0ID0gZmlsdGVyLnNvcnQsXG4gICAgaW5kZXggPSBleHBvcnRzLmluZGV4T2YoIHNvcnRUb2dnbGVPcHRpb25zLCBjdXJyZW50U29ydCApLFxuICAgIG5leHRJbmRleCA9IGluZGV4ICsgMSxcbiAgICBuZXh0U29ydCA9IHNvcnRUb2dnbGVPcHRpb25zWyBuZXh0SW5kZXggXSA9PT0gdW5kZWZpbmVkID8gc29ydFRvZ2dsZU9wdGlvbnNbIDAgXSA6IHNvcnRUb2dnbGVPcHRpb25zWyBuZXh0SW5kZXggXTtcblxuICBmaWx0ZXIuc29ydCA9IG5leHRTb3J0O1xufTtcblxuZXhwb3J0cy52YWx1ZUdldCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmV0dXJuIGZpbHRlci5fX3ZhbHVlLnZhbHVlO1xufTtcblxuZXhwb3J0cy52YWx1ZVNldCA9IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBmaWx0ZXIuX192YWx1ZSA9IG5ldyBJdGVtVmFsdWUoIGZpbHRlci5fX2NvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXksIF92YWx1ZSApO1xuICBmaWx0ZXIubGFiZWwgPSBmaWx0ZXIuX192YWx1ZS5rZXk7XG4gIGZpbHRlci4kZWwudGV4dCggZmlsdGVyLmxhYmVsICk7XG4gIHJldHVybiBmaWx0ZXIuX192YWx1ZTtcbn07IiwidmFyIGlzID0gcmVxdWlyZSggXCJzYy1pc1wiICk7XG5cbnZhciBJdGVtVmFsdWUgPSBmdW5jdGlvbiAoIF9rZXksIF92YWx1ZSApIHtcbiAgdmFyIHZhbHVlID0ge307XG4gIHZhbHVlLmtleSA9IGlzLm9iamVjdCggX3ZhbHVlICkgJiYgaXMuc3RyaW5nKCBfdmFsdWVbIF9rZXkgXSApID8gX3ZhbHVlWyBfa2V5IF0gOiBcIlwiO1xuICB2YWx1ZS52YWx1ZSA9IF92YWx1ZTtcbiAgcmV0dXJuIHZhbHVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtVmFsdWU7IiwidmFyIGhlbHBlcnMgPSByZXF1aXJlKCBcIi4vaGVscGVyc1wiICksXG4gIGZ1enp5ID0gcmVxdWlyZSggXCJmdXp6YWxkcmluXCIgKSxcbiAgbWVyZ2UgPSByZXF1aXJlKCBcInNjLW1lcmdlXCIgKSxcbiAgbWluc3RhY2hlID0gcmVxdWlyZSggXCJtaW5zdGFjaGVcIiApLFxuICBkZWJvdW5jZSA9IHJlcXVpcmUoIFwiZGVib3VuY2VcIiApO1xuXG52YXIgTGlzdCA9IGZ1bmN0aW9uICggX2ZpbHRlciApIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZztcblxuICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyggc2VsZiwge1xuICAgIFwiX19hY3RpdmVJdGVtSW5kZXhcIjoge1xuICAgICAgdmFsdWU6IDAsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2Rlc3Ryb3llZFwiOiB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX3RlbXBsYXRlc1wiOiB7XG4gICAgICB2YWx1ZToge31cbiAgICB9LFxuICAgIFwiX192aXNpYmxlXCI6IHtcbiAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcImFjdGl2ZUl0ZW1JbmRleFwiOiB7XG4gICAgICBnZXQ6IGhlbHBlcnMuYWN0aXZlSXRlbUluZGV4R2V0LmJpbmQoIHNlbGYgKSxcbiAgICAgIHNldDogaGVscGVycy5hY3RpdmVJdGVtSW5kZXhTZXQuYmluZCggc2VsZiApXG4gICAgfSxcbiAgICBcImZpbHRlclwiOiB7XG4gICAgICB2YWx1ZTogX2ZpbHRlclxuICAgIH1cbiAgfSApO1xuXG4gIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIE9iamVjdC5rZXlzKCBjb25maWcudGVtcGxhdGVzICkuZm9yRWFjaCggZnVuY3Rpb24gKCBfdGVtcGxhdGVOYW1lICkge1xuICAgIHNlbGYuX190ZW1wbGF0ZXNbIF90ZW1wbGF0ZU5hbWUgXSA9IG1pbnN0YWNoZSggY29uZmlnLnRlbXBsYXRlc1sgX3RlbXBsYXRlTmFtZSBdLCB7XG4gICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgIGNpZDogXCJcIixcbiAgICAgIGtleTogXCJcIlxuICAgIH0gKTtcbiAgfSApO1xuXG4gIHNlbGYuJGVsID0gJCggbWluc3RhY2hlKCBzZWxmLl9fdGVtcGxhdGVzLmxpc3RXcmFwcGVyLCB7XG4gICAgY29uZmlnOiBtZXJnZSggY29uZmlnLCB7XG4gICAgICB0ZW1wbGF0ZXM6IHNlbGYuX190ZW1wbGF0ZXNcbiAgICB9IClcbiAgfSApICk7XG5cbiAgc2VsZi4kZWwud2lkdGgoIGNvbmZpZy5kZWZhdWx0cy5taW5XaWR0aCApO1xuXG4gIHNlbGYuJGlucHV0ID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaW5wdXRcIiApO1xuICBzZWxmLiRoZWFkZXIgPSBzZWxmLiRlbC5maW5kKCBcIi5cIiArIGNvbmZpZy5jbGFzc05hbWUgKyBcIi1oZWFkZXJcIiApO1xuICBzZWxmLiRsaXN0ID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaXRlbXNcIiApO1xuICBzZWxmLiRzb3J0VG9nZ2xlID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItc29ydC10b2dnbGVcIiApO1xuXG4gIHNlbGYuJGlucHV0Lm9uKCBcImNoYW5nZS5cIiArIGNvbmZpZy5uYW1lICsgXCIga2V5ZG93bi5cIiArIGNvbmZpZy5uYW1lLCBoZWxwZXJzLmZpbHRlckNoYW5nZWQuYmluZCggc2VsZiApICk7XG4gIHNlbGYuJHNvcnRUb2dnbGUub24oIFwiY2xpY2suXCIgKyBjb25maWcubmFtZSwgaGVscGVycy5zb3J0VG9nZ2xlQ2xpY2tlZC5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5maWx0ZXIub24oIFwiZmlsdGVyQ2hhbmdlZFwiLCBzZWxmLnJlZHJhdy5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5maWx0ZXIub24oIFwiaXRlbUZvY3VzXCIsIGhlbHBlcnMucHV0Rm9jdXNzZWRJdGVtSW5WaWV3LmJpbmQoIHNlbGYgKSApO1xuICBzZWxmLmZpbHRlci4kZWwuYWZ0ZXIoIHNlbGYuJGVsICk7XG5cbiAgc2VsZi5maWx0ZXIub25jZSggY29uZmlnLm5hbWUgKyBcIi1yZWFkeVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCBjb25maWcuZGVmYXVsdHMuc29ydCApIHtcbiAgICAgIHNlbGYuZmlsdGVyLnNvcnQgPSBjb25maWcuZGVmYXVsdHMuc29ydDtcbiAgICB9XG4gIH0gKTtcbn07XG5cbkxpc3QucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgY29uZmlnID0gc2VsZi5maWx0ZXIuX19jb25maWc7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNlbGYuX192aXNpYmxlID0gZmFsc2U7XG4gIHNlbGYuJGVsLnJlbW92ZUNsYXNzKCBjb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyLXZpc2libGVcIiApO1xuICBzZWxmLmZpbHRlci5lbWl0KCBcImNsb3NlXCIgKTtcbiAgJCggd2luZG93ICkub2ZmKCBcImtleXVwLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgc2VsZi4kZWwub2ZmKCBcImNsaWNrLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgcmV0dXJuIHNlbGYuX192aXNpYmxlO1xufTtcblxuTGlzdC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZWxmLmZpbHRlci5fX2Rlc3Ryb3llZCA9IHNlbGYuX19kZXN0cm95ZWQgPSB0cnVlO1xuICAkKCB3aW5kb3cgKS5vZmYoIFwiLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgc2VsZi4kaW5wdXQub2ZmKCBcIi5cIiArIGNvbmZpZy5uYW1lICk7XG4gIHNlbGYuJGVsLm9mZiggXCIuXCIgKyBjb25maWcubmFtZSApO1xuICBzZWxmLiRzb3J0VG9nZ2xlLm9mZiggXCIuXCIgKyBjb25maWcubmFtZSApO1xuICBzZWxmLmZpbHRlci5vZmYoIFwiZmlsdGVyQ2hhbmdlZFwiICk7XG4gIHNlbGYuZmlsdGVyLm9mZiggXCJpdGVtRm9jdXNcIiApO1xuICBzZWxmLiRlbC5yZW1vdmUoKTtcblxufTtcblxuTGlzdC5wcm90b3R5cGUuZ2V0QWN0aXZlSXRlbSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgJHNlbGVjdGVkSXRlbSA9IHNlbGYuJGxpc3QuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaXRlbS1hY3RpdmVcIiApLFxuICAgIHNlbGVjdGVkSXRlbUhhc2ggPSAkc2VsZWN0ZWRJdGVtLmRhdGEoIFwiY2lkXCIgKSxcbiAgICBzZWxlY3RlZEl0ZW0gPSBzZWxmLmZpbHRlci5fX2l0ZW1zWyBzZWxlY3RlZEl0ZW1IYXNoIF07XG5cbiAgcmV0dXJuIHNlbGVjdGVkSXRlbTtcbn07XG5cbkxpc3QucHJvdG90eXBlLm9wZW4gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjb25maWcgPSBzZWxmLmZpbHRlci5fX2NvbmZpZztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc2VsZi5fX3Zpc2libGUgPSB0cnVlO1xuICBzZWxmLmZpbHRlci5lbWl0KCBcIm9wZW5cIiApO1xuICAkKCB3aW5kb3cgKS5vbiggXCJrZXl1cC5cIiArIGNvbmZpZy5uYW1lLCBoZWxwZXJzLndpbmRvd0tleVVwLmJpbmQoIHNlbGYgKSApO1xuICBzZWxmLiRlbC5vbiggXCJjbGljay5cIiArIGNvbmZpZy5uYW1lLCBcIi5cIiArIGNvbmZpZy5jbGFzc05hbWUgKyBcIi1pdGVtXCIsIGhlbHBlcnMuaXRlbUNsaWNrLmJpbmQoIHNlbGYgKSApO1xuICBzZWxmLnJlZHJhdygpO1xuXG4gIHNlbGYuZmlsdGVyLm9uY2UoIFwicmVkcmF3XCIsIGZ1bmN0aW9uICgpIHtcbiAgICBzZWxmLiRpbnB1dC5mb2N1cygpLnNlbGVjdCgpO1xuICB9ICk7XG5cbiAgcmV0dXJuIHNlbGYuX192aXNpYmxlO1xufTtcblxuTGlzdC5wcm90b3R5cGUucmVkcmF3ID0gZGVib3VuY2UoIGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmlsdGVyQnkgPSBzZWxmLiRpbnB1dC52YWwoKSB8fCBcIlwiLFxuICAgIGl0ZW1zTWFya3VwID0gXCJcIixcbiAgICByZXN1bHRzO1xuXG4gIGlmICggY29uZmlnLmRlZmF1bHRzLmZ1enp5ICkge1xuICAgIHJlc3VsdHMgPSBmdXp6eS5maWx0ZXIoIHNlbGYuZmlsdGVyLml0ZW1zLCBmaWx0ZXJCeSwge1xuICAgICAga2V5OiBjb25maWcuZGVmYXVsdHMuaXRlbUxhYmVsS2V5LFxuICAgICAgbWF4UmVzdWx0czogY29uZmlnLmRlZmF1bHRzLm1heE51bUl0ZW1zXG4gICAgfSApO1xuICB9IGVsc2Uge1xuICAgIHZhciByeCA9IG5ldyBSZWdFeHAoIFwiXFxcXGJcIiArIGZpbHRlckJ5LCBcImlcIiApO1xuICAgIHJlc3VsdHMgPSBbXTtcbiAgICBzZWxmLmZpbHRlci5pdGVtcy5mb3JFYWNoKCBmdW5jdGlvbiAoIF9pdGVtLCBfaSApIHtcbiAgICAgIGlmICggX2kgPCBjb25maWcuZGVmYXVsdHMubWF4TnVtSXRlbXMgKSB7XG4gICAgICAgIGlmICggcngudGVzdCggX2l0ZW1bIGNvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXkgXSApICkge1xuICAgICAgICAgIHJlc3VsdHMucHVzaCggX2l0ZW0gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gKTtcbiAgfVxuXG5cbiAgaWYgKCBzZWxmLmZpbHRlci5fX3NvcnQgKSB7XG4gICAgcmVzdWx0cy5zb3J0KCBmdW5jdGlvbiAoIGEsIGIgKSB7XG4gICAgICB2YXIgb3JkZXIgPSBzZWxmLmZpbHRlci5fX3NvcnQgPT09IFwiZGVzY1wiID8gYS5uYW1lID4gYi5uYW1lIDogYS5uYW1lIDwgYi5uYW1lO1xuICAgICAgcmV0dXJuIG9yZGVyID8gMSA6IC0xO1xuICAgIH0gKTtcbiAgfVxuXG4gIHNlbGYuZmlsdGVyLnJlc3VsdHMgPSByZXN1bHRzO1xuXG4gIHNlbGYuZmlsdGVyLmVtaXQoIFwiZmlsdGVyZWRcIiApO1xuXG4gIHJlc3VsdHMuZm9yRWFjaCggZnVuY3Rpb24gKCBfaXRlbSApIHtcbiAgICBfaXRlbS5rZXkgPSBfaXRlbVsgY29uZmlnLmRlZmF1bHRzLml0ZW1MYWJlbEtleSBdO1xuICAgIGl0ZW1zTWFya3VwICs9IG1pbnN0YWNoZSggY29uZmlnLnRlbXBsYXRlcy5saXN0SXRlbSwgbWVyZ2UoIHtcbiAgICAgIGNvbmZpZzogY29uZmlnLFxuICAgICAgY2lkOiBfaXRlbS5fX2NpZFxuICAgIH0sIF9pdGVtICkgKTtcbiAgfSApO1xuXG4gIHNlbGYuJGxpc3QuZW1wdHkoKS5odG1sKCBpdGVtc01hcmt1cCApO1xuICBzZWxmLmFjdGl2ZUl0ZW1JbmRleCA9IHNlbGYuYWN0aXZlSXRlbUluZGV4O1xuXG4gIGlmICggc2VsZi5fX3Zpc2libGUgKSB7XG4gICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuXG4gICAgICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdmFyIHZpc2libGVJdGVtc0hlaWdodCA9IDA7XG4gICAgICBzZWxmLiRlbC5hZGRDbGFzcyggY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lci1pbnZpc2libGVcIiApO1xuXG4gICAgICBzZWxmLiRsaXN0LmZpbmQoIFwiPjpsdChcIiArIGNvbmZpZy5kZWZhdWx0cy5tYXhOdW1JdGVtc1Zpc2libGUgKyBcIilcIiApLmVhY2goIGZ1bmN0aW9uICggX2ksIF9lbCApIHtcbiAgICAgICAgdmlzaWJsZUl0ZW1zSGVpZ2h0ICs9ICQoIF9lbCApLm91dGVySGVpZ2h0KCk7XG4gICAgICB9ICk7XG5cbiAgICAgIHNlbGYuJGxpc3QuaGVpZ2h0KCB2aXNpYmxlSXRlbXNIZWlnaHQgKTtcbiAgICAgIHNlbGYuJGVsLmFkZENsYXNzKCBjb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyLXZpc2libGVcIiApLnJlbW92ZUNsYXNzKCBjb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyLWludmlzaWJsZVwiICk7XG4gICAgICBzZWxmLmZpbHRlci5lbWl0KCBcInJlZHJhd1wiICk7XG4gICAgfSwgMCApO1xuXG4gIH1cblxufSwgMTAgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaXN0OyJdfQ==
(20)
});
