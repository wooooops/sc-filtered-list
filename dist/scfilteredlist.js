!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.scfilteredlist=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){

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

},{}],2:[function(_dereq_,module,exports){
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

},{"../vendor/stringscore":4}],3:[function(_dereq_,module,exports){
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

},{"../vendor/stringscore":4,"./filter":2}],4:[function(_dereq_,module,exports){
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

},{}],5:[function(_dereq_,module,exports){
var contains = _dereq_( "sc-contains" ),
  is = _dereq_( "sc-is" );

var cast = function ( _value, _castType, _default, _values, _additionalProperties ) {

  var parsedValue,
    castType = _castType.toLowerCase(),
    value,
    values = is.an.array( _values ) ? _values : [],
    alreadyCorrectlyTyped;

  switch ( true ) {
  case ( /float|integer/.test( castType ) ):
    castType = "number";
    break;
  }

  if ( is.a.hasOwnProperty( castType ) ) {
    alreadyCorrectlyTyped = is.a[ castType ]( _value );
  } else if ( castType === '*' ) {
    alreadyCorrectlyTyped = true;
  }

  if ( alreadyCorrectlyTyped ) {

    value = _value;

  } else {

    switch ( true ) {

    case castType === "array":

      try {
        if ( is.a.string( _value ) ) {
          value = JSON.parse( _value );
        }
        if ( is.not.an.array( value ) ) {
          throw "";
        }
      } catch ( e ) {
        if ( is.not.nullOrUndefined( _value ) ) {
          value = [ _value ];
        }
      }
      break;

    case castType === "boolean":

      try {
        value = /^(true|1|y|yes)$/i.test( _value.toString() ) ? true : undefined;
      } catch ( e ) {}

      if ( is.not.a.boolean( value ) ) {

        try {
          value = /^(false|-1|0|n|no)$/i.test( _value.toString() ) ? false : undefined;
        } catch ( e ) {}

      }

      value = is.a.boolean( value ) ? value : undefined;

      break;

    case ( castType === "date" || castType === "datetime" ):

      try {

        value = new Date( _value );

        value = isNaN( value.getTime() ) ? undefined : value;
      } catch ( e ) {}

      break;

    case castType === "string":
      if (is.a.string( _value )) {
        value = _value
      }

      if ( is.a.boolean( _value ) || is.a.number( _value ) ) {
        value = _value.toString();
      }

      break;

    case castType === "number":

      try {

        if( is.a.array( _value ) || is.a.guid( _value ) ) {
          throw "wrong number"; 
        }

        value = parseFloat( _value );

        if ( is.not.a.number( value ) || isNaN( value ) ) {
          value = undefined;
        }
      } catch ( e ) {
        value = undefined
      }

      if ( value !== undefined ) {
        switch ( true ) {
        case _castType === "integer":
          value = parseInt( value, 10 );
          break;
        }
      }

      break;

    default:

      try {
        value = cast( JSON.parse( _value ), castType )
      } catch ( e ) {}

      break;

    }

  }

  if ( values.length > 0 && !contains( values, value ) ) {
    value = values[ 0 ];
  }

  return is.not.undefined( value ) ? value : is.not.undefined( _default ) ? _default : null;

};

module.exports = cast;
},{"sc-contains":6,"sc-is":10}],6:[function(_dereq_,module,exports){
var contains = function ( data, item ) {
  var foundOne = false;

  if ( Array.isArray( data ) ) {

    data.forEach( function ( arrayItem ) {
      if ( foundOne === false && item === arrayItem ) {
        foundOne = true;
      }
    } );

  } else if ( Object( data ) === data ) {

    Object.keys( data ).forEach( function ( key ) {

      if ( foundOne === false && data[ key ] === item ) {
        foundOne = true;
      }

    } );

  }
  return foundOne;
};

module.exports = contains;
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
var type = _dereq_( "type-component" ),
  has = Object.prototype.hasOwnProperty;

function hasKey( object, keys, keyType ) {

  object = type( object ) === "object" ? object : {}, keys = type( keys ) === "array" ? keys : [];
  keyType = type( keyType ) === "string" ? keyType : "";

  var key = keys.length > 0 ? keys.shift() : "",
    keyExists = has.call( object, key ) || object[ key ] !== void 0,
    keyValue = keyExists ? object[ key ] : undefined,
    keyTypeIsCorrect = type( keyValue ) === keyType;

  if ( keys.length > 0 && keyExists ) {
    return hasKey( object[ key ], keys, keyType );
  }

  return keys.length > 0 || keyType === "" ? keyExists : keyExists && keyTypeIsCorrect;

}

module.exports = function ( object, keys, keyType ) {

  keys = type( keys ) === "string" ? keys.split( "." ) : [];

  return hasKey( object, keys, keyType );

};
},{"type-component":9}],9:[function(_dereq_,module,exports){

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

},{}],10:[function(_dereq_,module,exports){
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
},{"./ises/empty":11,"./ises/guid":12,"./ises/nullorundefined":13,"./ises/type":14}],11:[function(_dereq_,module,exports){
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
},{"../type":15}],12:[function(_dereq_,module,exports){
var guid = _dereq_( "sc-guid" );

module.exports = function ( value ) {
  return guid.isValid( value );
};
},{"sc-guid":7}],13:[function(_dereq_,module,exports){
module.exports = function ( value ) {
	return value === null || value === undefined || value === void 0;
};
},{}],14:[function(_dereq_,module,exports){
var type = _dereq_( "../type" );

module.exports = function ( _type ) {
  return function ( _value ) {
    return type( _value ) === _type;
  }
}
},{"../type":15}],15:[function(_dereq_,module,exports){
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
},{}],16:[function(_dereq_,module,exports){
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
},{"md5-component":17}],17:[function(_dereq_,module,exports){
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
},{}],18:[function(_dereq_,module,exports){
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
},{"type-component":19}],19:[function(_dereq_,module,exports){
module.exports=_dereq_(9)
},{}],20:[function(_dereq_,module,exports){
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
},{}],21:[function(_dereq_,module,exports){
module.exports={
  "name": "scfilteredlist",
  "className": "sc-filtered-list",
  "defaults": {
    "maxNumItemsVisible": 7,
    "maxNumItems": 10,
    "sortControlVisible": true,
    "itemLabelKey": "name",
    "defaultButtonLabel": "Choose one",
    "defalutListTitle": "Select an item"
  },
  "templates": {
    "listWrapper": "<div class='<%= config.className %>-container'><%= config.templates.listInput %><%= config.templates.listHeader %><%= config.templates.listItemWrapper %></div>",
    "listInput": "<div class='<%= config.className %>-input-container'><input type='text' class='<%= config.className %>-input'><%= config.templates.listSortToggle %></div>",
    "listHeader": "<header class='<%= config.className %>-header'><%= config.defaults.defalutListTitle %></header>",
    "listItemWrapper": "<ul class='<%= config.className %>-items'></ul>",
    "listItem": "<li class='<%= config.className %>-item' data-cid='<%= cid %>'><%= key %></li>",
    "listSortToggle": "<button type='button' class='<%= config.className %>-sort-toggle'></button>"
  }
}
},{}],22:[function(_dereq_,module,exports){
var cast = _dereq_( "sc-cast" ),
  config = _dereq_( "./config.json" ),
  emitter = _dereq_( "emitter-component" ),
  guid = _dereq_( "sc-guid" ),
  hasKey = _dereq_( "sc-haskey" ),
  helpers = _dereq_( "./helpers" ),
  is = _dereq_( "sc-is" ),
  List = _dereq_( "./list" ),
  observableArray = _dereq_( "sg-observable-array" );

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
  itemValue[ self.__config.defaults.itemLabelKey ] = self.__config.defaults.defaultButtonLabel;
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
};

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

  if ( !self.throttledFetch ) {
    self.throttledFetch = _.throttle( function () {
      var value = self.list.$input.val();

      self.__lastFetchedValue = value;
      self.emit( "fetch", self.__lastFetchedValue );
    }, 10 ); // TODO: check this
  }

  self.throttledFetch();
};

emitter( FilteredList.prototype );

exports = module.exports = FilteredList;
exports.defaults = config.defaults;

$( function () {
  $( "button[data-" + config.className + "]" ).each( function ( _i, _el ) {
    new FilteredList( _el );
  } );
} );
},{"./config.json":21,"./helpers":23,"./list":25,"emitter-component":1,"sc-cast":5,"sc-guid":7,"sc-haskey":8,"sc-is":10,"sg-observable-array":20}],23:[function(_dereq_,module,exports){
var cast = _dereq_( "sc-cast" ),
  hasKey = _dereq_( "sc-haskey" ),
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

  var index = cast( _value, "number", 0 ),
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
    $clickedElement = $( hasKey( _event, "target" ) ? _event.target : null ),
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

  var keyCode = hasKey( _event, "keyCode", "number" ) ? _event.keyCode : -1,
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

exports.windowKeyUp = function ( _event ) {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  var keyCode = hasKey( _event, "keyCode", "number" ) ? _event.keyCode : -1;

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

  var itemHash = md5( _item );

  if ( !filter.__items[ itemHash ] ) {
    Object.defineProperty( _item, "__cid", {
      value: itemHash
    } );
    filter.__items[ itemHash ] = _item;
    filter.items.__push( _item );
    filter.list.redraw();
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

  filter.__label = cast( _label, "string", filter.__config.defaults.defaultButtonLabel );
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

  var visible = cast( _value, "boolean", false );
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
  var filter = this;

  if ( filter.__destroyed ) {
    return;
  }

  var sortClassName = filter.__config.className + "-sort-",
    sortClassNames = sortToggleOptions.join( " " + sortClassName ).trim();

  filter.__sort = cast( _value, "string", null, sortToggleOptions );
  filter.list.redraw();
  filter.$wrapper.removeClass( sortClassNames ).addClass( filter.__sort ? sortClassName + filter.__sort : "" );
  filter.emit( "sort" );
  return filter.__sort;
};

exports.sortToggleClicked = function () {
  var list = this;

  if ( list.filter.__destroyed ) {
    return;
  }

  var filter = list.filter,
    currentSort = filter.sort,
    index = _.indexOf( sortToggleOptions, currentSort ),
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
},{"./item-value":24,"sc-cast":5,"sc-haskey":8,"sc-md5":16}],24:[function(_dereq_,module,exports){
var hasKey = _dereq_( "sc-haskey" );

var ItemValue = function ( _key, _value ) {
  var value = {};
  value.key = hasKey( _value, _key, "string" ) ? _value[ _key ] : "";
  value.value = _value;
  return value;
};

module.exports = ItemValue;
},{"sc-haskey":8}],25:[function(_dereq_,module,exports){
var cast = _dereq_( "sc-cast" ),
  helpers = _dereq_( "./helpers" ),
  merge = _dereq_( "sc-merge" ),
  fuzzy = _dereq_( "fuzzaldrin" );

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
    self.__templates[ _templateName ] = _.template( config.templates[ _templateName ], {
      config: config,
      cid: "",
      key: ""
    } );
  } );

  self.$el = $( _.template( self.__templates.listWrapper, {
    config: merge( config, {
      templates: self.__templates
    } )
  } ) );

  self.$input = self.$el.find( "." + config.className + "-input" );
  self.$header = self.$el.find( "." + config.className + "-header" );
  self.$list = self.$el.find( "." + config.className + "-items" );
  self.$sortToggle = self.$el.find( "." + config.className + "-sort-toggle" );

  self.$input.on( "change." + config.name + " keydown." + config.name, helpers.filterChanged.bind( self ) );
  self.$sortToggle.on( "click." + config.name, helpers.sortToggleClicked.bind( self ) );
  self.filter.on( "filterChanged", self.redraw.bind( self ) );
  self.filter.on( "itemFocus", helpers.putFocussedItemInView.bind( self ) );
  self.filter.$el.after( self.$el );
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

List.prototype.redraw = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  if ( self.redrawTimeout ) {
    clearTimeout( self.redrawTimeout );
    return self.redrawTimeout = null;
  }

  self.redrawTimeout = setTimeout( function () {
    self.redrawTimeout = null;

    if ( self.__destroyed ) {
      return;
    }

    var filterBy = self.$input.val(),
      itemsMarkup = "",
      results = fuzzy.filter( self.filter.items, filterBy || "", {
        key: config.defaults.itemLabelKey,
        maxResults: self.filter.__config.defaults.maxNumItems
      } );

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
      itemsMarkup += _.template( config.templates.listItem, merge( {
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

        self.$list.find( ">:lt(" + self.filter.__config.defaults.maxNumItemsVisible + ")" ).each( function ( _i, _el ) {
          visibleItemsHeight += $( _el ).outerHeight();
        } );

        self.$list.height( visibleItemsHeight );
        self.$el.addClass( config.className + "-container-visible" ).removeClass( config.className + "-container-invisible" );
        self.filter.emit( "redraw" );
      }, 0 );

    }

  }, 0 );

};

module.exports = List;
},{"./helpers":23,"fuzzaldrin":3,"sc-cast":5,"sc-merge":18}]},{},[22])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL2d1bHAtYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9lbWl0dGVyLWNvbXBvbmVudC9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvZnV6emFsZHJpbi9saWIvZmlsdGVyLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9mdXp6YWxkcmluL2xpYi9mdXp6YWxkcmluLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9mdXp6YWxkcmluL3ZlbmRvci9zdHJpbmdzY29yZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtY2FzdC9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtY2FzdC9ub2RlX21vZHVsZXMvc2MtY29udGFpbnMvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWd1aWQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWhhc2tleS9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaGFza2V5L25vZGVfbW9kdWxlcy90eXBlLWNvbXBvbmVudC9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvZW1wdHkuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvZ3VpZC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvaXNlcy9udWxsb3J1bmRlZmluZWQuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLWlzL2lzZXMvdHlwZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtaXMvdHlwZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9ub2RlX21vZHVsZXMvc2MtbWQ1L2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9zYy1tZDUvbm9kZV9tb2R1bGVzL21kNS1jb21wb25lbnQvaW5kZXguanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvbm9kZV9tb2R1bGVzL3NjLW1lcmdlL2luZGV4LmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L25vZGVfbW9kdWxlcy9zZy1vYnNlcnZhYmxlLWFycmF5L3NyYy9pbmRleC5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9zcmMvc2NyaXB0cy9jb25maWcuanNvbiIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9zcmMvc2NyaXB0cy9mYWtlXzY5YWI1NzllLmpzIiwiL1VzZXJzL2RhdmlkdHN1amkvRHJvcGJveC9TaXRlcy9zYy9zYy1maWx0ZXJlZC1saXN0L3NyYy9zY3JpcHRzL2hlbHBlcnMuanMiLCIvVXNlcnMvZGF2aWR0c3VqaS9Ecm9wYm94L1NpdGVzL3NjL3NjLWZpbHRlcmVkLWxpc3Qvc3JjL3NjcmlwdHMvaXRlbS12YWx1ZS5qcyIsIi9Vc2Vycy9kYXZpZHRzdWppL0Ryb3Bib3gvU2l0ZXMvc2Mvc2MtZmlsdGVyZWQtbGlzdC9zcmMvc2NyaXB0cy9saXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM5QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpfXZhciBmPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChmLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGYsZi5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcbi8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtaXR0ZXI7XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBhIG5ldyBgRW1pdHRlcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBFbWl0dGVyKG9iaikge1xuICBpZiAob2JqKSByZXR1cm4gbWl4aW4ob2JqKTtcbn07XG5cbi8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuXG5mdW5jdGlvbiBtaXhpbihvYmopIHtcbiAgZm9yICh2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7XG4gICAgb2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO1xuICB9XG4gIHJldHVybiBvYmo7XG59XG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5vbiA9XG5FbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICAodGhpcy5fY2FsbGJhY2tzW2V2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1tldmVudF0gfHwgW10pXG4gICAgLnB1c2goZm4pO1xuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbihldmVudCwgZm4pe1xuICB2YXIgc2VsZiA9IHRoaXM7XG4gIHRoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtcblxuICBmdW5jdGlvbiBvbigpIHtcbiAgICBzZWxmLm9mZihldmVudCwgb24pO1xuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICBvbi5mbiA9IGZuO1xuICB0aGlzLm9uKGV2ZW50LCBvbik7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUub2ZmID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID1cbkVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG5FbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsIGZuKXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuXG4gIC8vIGFsbFxuICBpZiAoMCA9PSBhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fY2FsbGJhY2tzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBzcGVjaWZpYyBldmVudFxuICB2YXIgY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtcbiAgaWYgKCFjYWxsYmFja3MpIHJldHVybiB0aGlzO1xuXG4gIC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgaWYgKDEgPT0gYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGRlbGV0ZSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gcmVtb3ZlIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkrKykge1xuICAgIGNiID0gY2FsbGJhY2tzW2ldO1xuICAgIGlmIChjYiA9PT0gZm4gfHwgY2IuZm4gPT09IGZuKSB7XG4gICAgICBjYWxsYmFja3Muc3BsaWNlKGksIDEpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL1xuXG5FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe1xuICB0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307XG4gIHZhciBhcmdzID0gW10uc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgLCBjYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3NbZXZlbnRdO1xuXG4gIGlmIChjYWxsYmFja3MpIHtcbiAgICBjYWxsYmFja3MgPSBjYWxsYmFja3Muc2xpY2UoMCk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNhbGxiYWNrcy5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgY2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbkVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKGV2ZW50KXtcbiAgdGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O1xuICByZXR1cm4gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9cblxuRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe1xuICByZXR1cm4gISEgdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDtcbn07XG4iLCIoZnVuY3Rpb24oKSB7XG4gIHZhciBiYXNlbmFtZVNjb3JlLCBzdHJpbmdTY29yZTtcblxuICBzdHJpbmdTY29yZSA9IHJlcXVpcmUoJy4uL3ZlbmRvci9zdHJpbmdzY29yZScpO1xuXG4gIGJhc2VuYW1lU2NvcmUgPSBmdW5jdGlvbihzdHJpbmcsIHF1ZXJ5LCBzY29yZSkge1xuICAgIHZhciBiYXNlLCBkZXB0aCwgaW5kZXgsIGxhc3RDaGFyYWN0ZXIsIHNlZ21lbnRDb3VudCwgc2xhc2hDb3VudDtcbiAgICBpbmRleCA9IHN0cmluZy5sZW5ndGggLSAxO1xuICAgIHdoaWxlIChzdHJpbmdbaW5kZXhdID09PSAnLycpIHtcbiAgICAgIGluZGV4LS07XG4gICAgfVxuICAgIHNsYXNoQ291bnQgPSAwO1xuICAgIGxhc3RDaGFyYWN0ZXIgPSBpbmRleDtcbiAgICBiYXNlID0gbnVsbDtcbiAgICB3aGlsZSAoaW5kZXggPj0gMCkge1xuICAgICAgaWYgKHN0cmluZ1tpbmRleF0gPT09ICcvJykge1xuICAgICAgICBzbGFzaENvdW50Kys7XG4gICAgICAgIGlmIChiYXNlID09IG51bGwpIHtcbiAgICAgICAgICBiYXNlID0gc3RyaW5nLnN1YnN0cmluZyhpbmRleCArIDEsIGxhc3RDaGFyYWN0ZXIgKyAxKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgICBpZiAobGFzdENoYXJhY3RlciA8IHN0cmluZy5sZW5ndGggLSAxKSB7XG4gICAgICAgICAgaWYgKGJhc2UgPT0gbnVsbCkge1xuICAgICAgICAgICAgYmFzZSA9IHN0cmluZy5zdWJzdHJpbmcoMCwgbGFzdENoYXJhY3RlciArIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoYmFzZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBiYXNlID0gc3RyaW5nO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaW5kZXgtLTtcbiAgICB9XG4gICAgaWYgKGJhc2UgPT09IHN0cmluZykge1xuICAgICAgc2NvcmUgKj0gMjtcbiAgICB9IGVsc2UgaWYgKGJhc2UpIHtcbiAgICAgIHNjb3JlICs9IHN0cmluZ1Njb3JlKGJhc2UsIHF1ZXJ5KTtcbiAgICB9XG4gICAgc2VnbWVudENvdW50ID0gc2xhc2hDb3VudCArIDE7XG4gICAgZGVwdGggPSBNYXRoLm1heCgxLCAxMCAtIHNlZ21lbnRDb3VudCk7XG4gICAgc2NvcmUgKj0gZGVwdGggKiAwLjAxO1xuICAgIHJldHVybiBzY29yZTtcbiAgfTtcblxuICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNhbmRpZGF0ZXMsIHF1ZXJ5LCBfYXJnKSB7XG4gICAgdmFyIGNhbmRpZGF0ZSwga2V5LCBtYXhSZXN1bHRzLCBxdWVyeUhhc05vU2xhc2hlcywgc2NvcmUsIHNjb3JlZENhbmRpZGF0ZSwgc2NvcmVkQ2FuZGlkYXRlcywgc3RyaW5nLCBfaSwgX2xlbiwgX3JlZjtcbiAgICBfcmVmID0gX2FyZyAhPSBudWxsID8gX2FyZyA6IHt9LCBrZXkgPSBfcmVmLmtleSwgbWF4UmVzdWx0cyA9IF9yZWYubWF4UmVzdWx0cztcbiAgICBpZiAocXVlcnkpIHtcbiAgICAgIHF1ZXJ5SGFzTm9TbGFzaGVzID0gcXVlcnkuaW5kZXhPZignLycpID09PSAtMTtcbiAgICAgIHNjb3JlZENhbmRpZGF0ZXMgPSBbXTtcbiAgICAgIGZvciAoX2kgPSAwLCBfbGVuID0gY2FuZGlkYXRlcy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgICAgICBjYW5kaWRhdGUgPSBjYW5kaWRhdGVzW19pXTtcbiAgICAgICAgc3RyaW5nID0ga2V5ICE9IG51bGwgPyBjYW5kaWRhdGVba2V5XSA6IGNhbmRpZGF0ZTtcbiAgICAgICAgaWYgKCFzdHJpbmcpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBzY29yZSA9IHN0cmluZ1Njb3JlKHN0cmluZywgcXVlcnkpO1xuICAgICAgICBpZiAocXVlcnlIYXNOb1NsYXNoZXMpIHtcbiAgICAgICAgICBzY29yZSA9IGJhc2VuYW1lU2NvcmUoc3RyaW5nLCBxdWVyeSwgc2NvcmUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzY29yZSA+IDApIHtcbiAgICAgICAgICBzY29yZWRDYW5kaWRhdGVzLnB1c2goe1xuICAgICAgICAgICAgY2FuZGlkYXRlOiBjYW5kaWRhdGUsXG4gICAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgc2NvcmVkQ2FuZGlkYXRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGIuc2NvcmUgLSBhLnNjb3JlO1xuICAgICAgfSk7XG4gICAgICBjYW5kaWRhdGVzID0gKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgX2osIF9sZW4xLCBfcmVzdWx0cztcbiAgICAgICAgX3Jlc3VsdHMgPSBbXTtcbiAgICAgICAgZm9yIChfaiA9IDAsIF9sZW4xID0gc2NvcmVkQ2FuZGlkYXRlcy5sZW5ndGg7IF9qIDwgX2xlbjE7IF9qKyspIHtcbiAgICAgICAgICBzY29yZWRDYW5kaWRhdGUgPSBzY29yZWRDYW5kaWRhdGVzW19qXTtcbiAgICAgICAgICBfcmVzdWx0cy5wdXNoKHNjb3JlZENhbmRpZGF0ZS5jYW5kaWRhdGUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBfcmVzdWx0cztcbiAgICAgIH0pKCk7XG4gICAgfVxuICAgIGlmIChtYXhSZXN1bHRzICE9IG51bGwpIHtcbiAgICAgIGNhbmRpZGF0ZXMgPSBjYW5kaWRhdGVzLnNsaWNlKDAsIG1heFJlc3VsdHMpO1xuICAgIH1cbiAgICByZXR1cm4gY2FuZGlkYXRlcztcbiAgfTtcblxufSkuY2FsbCh0aGlzKTtcbiIsIihmdW5jdGlvbigpIHtcbiAgdmFyIHN0cmluZ1Njb3JlO1xuXG4gIHN0cmluZ1Njb3JlID0gcmVxdWlyZSgnLi4vdmVuZG9yL3N0cmluZ3Njb3JlJyk7XG5cbiAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZmlsdGVyOiByZXF1aXJlKCcuL2ZpbHRlcicpLFxuICAgIHNjb3JlOiBmdW5jdGlvbihzdHJpbmcsIHF1ZXJ5KSB7XG4gICAgICBpZiAoIXN0cmluZykge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cbiAgICAgIGlmICghcXVlcnkpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyaW5nU2NvcmUoc3RyaW5nLCBxdWVyeSk7XG4gICAgfVxuICB9O1xuXG59KS5jYWxsKHRoaXMpO1xuIiwiLy8gTU9ESUZJRUQgQlkgTlMvQ0ogLSBEb24ndCBleHRlbmQgdGhlIHByb3RvdHlwZSBvZiBTdHJpbmdcbi8vIE1PRElGSUVEIEJZIENKIC0gUmVtb3ZlIHN0YXJ0X29mX3N0cmluZ19ib251c1xuXG4vKiFcbiAqIHN0cmluZ19zY29yZS5qczogU3RyaW5nIFNjb3JpbmcgQWxnb3JpdGhtIDAuMS4xMFxuICpcbiAqIGh0dHA6Ly9qb3NoYXZlbi5jb20vc3RyaW5nX3Njb3JlXG4gKiBodHRwczovL2dpdGh1Yi5jb20vam9zaGF2ZW4vc3RyaW5nX3Njb3JlXG4gKlxuICogQ29weXJpZ2h0IChDKSAyMDA5LTIwMTEgSm9zaGF2ZW4gUG90dGVyIDx5b3VydGVjaEBnbWFpbC5jb20+XG4gKiBTcGVjaWFsIHRoYW5rcyB0byBhbGwgb2YgdGhlIGNvbnRyaWJ1dG9ycyBsaXN0ZWQgaGVyZSBodHRwczovL2dpdGh1Yi5jb20vam9zaGF2ZW4vc3RyaW5nX3Njb3JlXG4gKiBNSVQgbGljZW5zZTogaHR0cDovL3d3dy5vcGVuc291cmNlLm9yZy9saWNlbnNlcy9taXQtbGljZW5zZS5waHBcbiAqXG4gKiBEYXRlOiBUdWUgTWFyIDEgMjAxMVxuKi9cblxuLyoqXG4gKiBTY29yZXMgYSBzdHJpbmcgYWdhaW5zdCBhbm90aGVyIHN0cmluZy5cbiAqICAnSGVsbG8gV29ybGQnLnNjb3JlKCdoZScpOyAgICAgLy89PiAwLjU5MzE4MTgxODE4MTgxODFcbiAqICAnSGVsbG8gV29ybGQnLnNjb3JlKCdIZWxsbycpOyAgLy89PiAwLjczMTgxODE4MTgxODE4MThcbiAqL1xubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihzdHJpbmcsIGFiYnJldmlhdGlvbikge1xuICAvLyBJZiB0aGUgc3RyaW5nIGlzIGVxdWFsIHRvIHRoZSBhYmJyZXZpYXRpb24sIHBlcmZlY3QgbWF0Y2guXG4gIGlmIChzdHJpbmcgPT0gYWJicmV2aWF0aW9uKSB7cmV0dXJuIDE7fVxuXG4gIHZhciB0b3RhbF9jaGFyYWN0ZXJfc2NvcmUgPSAwLFxuICAgICAgYWJicmV2aWF0aW9uX2xlbmd0aCA9IGFiYnJldmlhdGlvbi5sZW5ndGgsXG4gICAgICBzdHJpbmdfbGVuZ3RoID0gc3RyaW5nLmxlbmd0aCxcbiAgICAgIHN0YXJ0X29mX3N0cmluZ19ib251cyxcbiAgICAgIGFiYnJldmlhdGlvbl9zY29yZSxcbiAgICAgIGZpbmFsX3Njb3JlO1xuXG4gIC8vIFdhbGsgdGhyb3VnaCBhYmJyZXZpYXRpb24gYW5kIGFkZCB1cCBzY29yZXMuXG4gIGZvciAodmFyIGkgPSAwLFxuICAgICAgICAgY2hhcmFjdGVyX3Njb3JlLyogPSAwKi8sXG4gICAgICAgICBpbmRleF9pbl9zdHJpbmcvKiA9IDAqLyxcbiAgICAgICAgIGMvKiA9ICcnKi8sXG4gICAgICAgICBpbmRleF9jX2xvd2VyY2FzZS8qID0gMCovLFxuICAgICAgICAgaW5kZXhfY191cHBlcmNhc2UvKiA9IDAqLyxcbiAgICAgICAgIG1pbl9pbmRleC8qID0gMCovO1xuICAgICBpIDwgYWJicmV2aWF0aW9uX2xlbmd0aDtcbiAgICAgKytpKSB7XG5cbiAgICAvLyBGaW5kIHRoZSBmaXJzdCBjYXNlLWluc2Vuc2l0aXZlIG1hdGNoIG9mIGEgY2hhcmFjdGVyLlxuICAgIGMgPSBhYmJyZXZpYXRpb24uY2hhckF0KGkpO1xuXG4gICAgaW5kZXhfY19sb3dlcmNhc2UgPSBzdHJpbmcuaW5kZXhPZihjLnRvTG93ZXJDYXNlKCkpO1xuICAgIGluZGV4X2NfdXBwZXJjYXNlID0gc3RyaW5nLmluZGV4T2YoYy50b1VwcGVyQ2FzZSgpKTtcbiAgICBtaW5faW5kZXggPSBNYXRoLm1pbihpbmRleF9jX2xvd2VyY2FzZSwgaW5kZXhfY191cHBlcmNhc2UpO1xuICAgIGluZGV4X2luX3N0cmluZyA9IChtaW5faW5kZXggPiAtMSkgPyBtaW5faW5kZXggOiBNYXRoLm1heChpbmRleF9jX2xvd2VyY2FzZSwgaW5kZXhfY191cHBlcmNhc2UpO1xuXG4gICAgaWYgKGluZGV4X2luX3N0cmluZyA9PT0gLTEpIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBjaGFyYWN0ZXJfc2NvcmUgPSAwLjE7XG4gICAgfVxuXG4gICAgLy8gU2V0IGJhc2Ugc2NvcmUgZm9yIG1hdGNoaW5nICdjJy5cblxuICAgIC8vIFNhbWUgY2FzZSBib251cy5cbiAgICBpZiAoc3RyaW5nW2luZGV4X2luX3N0cmluZ10gPT09IGMpIHtcbiAgICAgIGNoYXJhY3Rlcl9zY29yZSArPSAwLjE7XG4gICAgfVxuXG4gICAgLy8gQ29uc2VjdXRpdmUgbGV0dGVyICYgc3RhcnQtb2Ytc3RyaW5nIEJvbnVzXG4gICAgaWYgKGluZGV4X2luX3N0cmluZyA9PT0gMCkge1xuICAgICAgLy8gSW5jcmVhc2UgdGhlIHNjb3JlIHdoZW4gbWF0Y2hpbmcgZmlyc3QgY2hhcmFjdGVyIG9mIHRoZSByZW1haW5kZXIgb2YgdGhlIHN0cmluZ1xuICAgICAgY2hhcmFjdGVyX3Njb3JlICs9IDAuNjtcbiAgICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIC8vIElmIG1hdGNoIGlzIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgdGhlIHN0cmluZ1xuICAgICAgICAvLyAmIHRoZSBmaXJzdCBjaGFyYWN0ZXIgb2YgYWJicmV2aWF0aW9uLCBhZGQgYVxuICAgICAgICAvLyBzdGFydC1vZi1zdHJpbmcgbWF0Y2ggYm9udXMuXG4gICAgICAgIC8vIHN0YXJ0X29mX3N0cmluZ19ib251cyA9IDEgLy90cnVlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIC8vIEFjcm9ueW0gQm9udXNcbiAgICAgIC8vIFdlaWdoaW5nIExvZ2ljOiBUeXBpbmcgdGhlIGZpcnN0IGNoYXJhY3RlciBvZiBhbiBhY3JvbnltIGlzIGFzIGlmIHlvdVxuICAgICAgLy8gcHJlY2VkZWQgaXQgd2l0aCB0d28gcGVyZmVjdCBjaGFyYWN0ZXIgbWF0Y2hlcy5cbiAgICAgIGlmIChzdHJpbmcuY2hhckF0KGluZGV4X2luX3N0cmluZyAtIDEpID09PSAnICcpIHtcbiAgICAgICAgY2hhcmFjdGVyX3Njb3JlICs9IDAuODsgLy8gKiBNYXRoLm1pbihpbmRleF9pbl9zdHJpbmcsIDUpOyAvLyBDYXAgYm9udXMgYXQgMC40ICogNVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIExlZnQgdHJpbSB0aGUgYWxyZWFkeSBtYXRjaGVkIHBhcnQgb2YgdGhlIHN0cmluZ1xuICAgIC8vIChmb3JjZXMgc2VxdWVudGlhbCBtYXRjaGluZykuXG4gICAgc3RyaW5nID0gc3RyaW5nLnN1YnN0cmluZyhpbmRleF9pbl9zdHJpbmcgKyAxLCBzdHJpbmdfbGVuZ3RoKTtcblxuICAgIHRvdGFsX2NoYXJhY3Rlcl9zY29yZSArPSBjaGFyYWN0ZXJfc2NvcmU7XG4gIH0gLy8gZW5kIG9mIGZvciBsb29wXG5cbiAgLy8gVW5jb21tZW50IHRvIHdlaWdoIHNtYWxsZXIgd29yZHMgaGlnaGVyLlxuICAvLyByZXR1cm4gdG90YWxfY2hhcmFjdGVyX3Njb3JlIC8gc3RyaW5nX2xlbmd0aDtcblxuICBhYmJyZXZpYXRpb25fc2NvcmUgPSB0b3RhbF9jaGFyYWN0ZXJfc2NvcmUgLyBhYmJyZXZpYXRpb25fbGVuZ3RoO1xuICAvL3BlcmNlbnRhZ2Vfb2ZfbWF0Y2hlZF9zdHJpbmcgPSBhYmJyZXZpYXRpb25fbGVuZ3RoIC8gc3RyaW5nX2xlbmd0aDtcbiAgLy93b3JkX3Njb3JlID0gYWJicmV2aWF0aW9uX3Njb3JlICogcGVyY2VudGFnZV9vZl9tYXRjaGVkX3N0cmluZztcblxuICAvLyBSZWR1Y2UgcGVuYWx0eSBmb3IgbG9uZ2VyIHN0cmluZ3MuXG4gIC8vZmluYWxfc2NvcmUgPSAod29yZF9zY29yZSArIGFiYnJldmlhdGlvbl9zY29yZSkgLyAyO1xuICBmaW5hbF9zY29yZSA9ICgoYWJicmV2aWF0aW9uX3Njb3JlICogKGFiYnJldmlhdGlvbl9sZW5ndGggLyBzdHJpbmdfbGVuZ3RoKSkgKyBhYmJyZXZpYXRpb25fc2NvcmUpIC8gMjtcblxuICBpZiAoc3RhcnRfb2Zfc3RyaW5nX2JvbnVzICYmIChmaW5hbF9zY29yZSArIDAuMTUgPCAxKSkge1xuICAgIGZpbmFsX3Njb3JlICs9IDAuMTU7XG4gIH1cblxuICByZXR1cm4gZmluYWxfc2NvcmU7XG59O1xuIiwidmFyIGNvbnRhaW5zID0gcmVxdWlyZSggXCJzYy1jb250YWluc1wiICksXHJcbiAgaXMgPSByZXF1aXJlKCBcInNjLWlzXCIgKTtcclxuXHJcbnZhciBjYXN0ID0gZnVuY3Rpb24gKCBfdmFsdWUsIF9jYXN0VHlwZSwgX2RlZmF1bHQsIF92YWx1ZXMsIF9hZGRpdGlvbmFsUHJvcGVydGllcyApIHtcclxuXHJcbiAgdmFyIHBhcnNlZFZhbHVlLFxyXG4gICAgY2FzdFR5cGUgPSBfY2FzdFR5cGUudG9Mb3dlckNhc2UoKSxcclxuICAgIHZhbHVlLFxyXG4gICAgdmFsdWVzID0gaXMuYW4uYXJyYXkoIF92YWx1ZXMgKSA/IF92YWx1ZXMgOiBbXSxcclxuICAgIGFscmVhZHlDb3JyZWN0bHlUeXBlZDtcclxuXHJcbiAgc3dpdGNoICggdHJ1ZSApIHtcclxuICBjYXNlICggL2Zsb2F0fGludGVnZXIvLnRlc3QoIGNhc3RUeXBlICkgKTpcclxuICAgIGNhc3RUeXBlID0gXCJudW1iZXJcIjtcclxuICAgIGJyZWFrO1xyXG4gIH1cclxuXHJcbiAgaWYgKCBpcy5hLmhhc093blByb3BlcnR5KCBjYXN0VHlwZSApICkge1xyXG4gICAgYWxyZWFkeUNvcnJlY3RseVR5cGVkID0gaXMuYVsgY2FzdFR5cGUgXSggX3ZhbHVlICk7XHJcbiAgfSBlbHNlIGlmICggY2FzdFR5cGUgPT09ICcqJyApIHtcclxuICAgIGFscmVhZHlDb3JyZWN0bHlUeXBlZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBpZiAoIGFscmVhZHlDb3JyZWN0bHlUeXBlZCApIHtcclxuXHJcbiAgICB2YWx1ZSA9IF92YWx1ZTtcclxuXHJcbiAgfSBlbHNlIHtcclxuXHJcbiAgICBzd2l0Y2ggKCB0cnVlICkge1xyXG5cclxuICAgIGNhc2UgY2FzdFR5cGUgPT09IFwiYXJyYXlcIjpcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgaWYgKCBpcy5hLnN0cmluZyggX3ZhbHVlICkgKSB7XHJcbiAgICAgICAgICB2YWx1ZSA9IEpTT04ucGFyc2UoIF92YWx1ZSApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoIGlzLm5vdC5hbi5hcnJheSggdmFsdWUgKSApIHtcclxuICAgICAgICAgIHRocm93IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoICggZSApIHtcclxuICAgICAgICBpZiAoIGlzLm5vdC5udWxsT3JVbmRlZmluZWQoIF92YWx1ZSApICkge1xyXG4gICAgICAgICAgdmFsdWUgPSBbIF92YWx1ZSBdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBjYXNlIGNhc3RUeXBlID09PSBcImJvb2xlYW5cIjpcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdmFsdWUgPSAvXih0cnVlfDF8eXx5ZXMpJC9pLnRlc3QoIF92YWx1ZS50b1N0cmluZygpICkgPyB0cnVlIDogdW5kZWZpbmVkO1xyXG4gICAgICB9IGNhdGNoICggZSApIHt9XHJcblxyXG4gICAgICBpZiAoIGlzLm5vdC5hLmJvb2xlYW4oIHZhbHVlICkgKSB7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICB2YWx1ZSA9IC9eKGZhbHNlfC0xfDB8bnxubykkL2kudGVzdCggX3ZhbHVlLnRvU3RyaW5nKCkgKSA/IGZhbHNlIDogdW5kZWZpbmVkO1xyXG4gICAgICAgIH0gY2F0Y2ggKCBlICkge31cclxuXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhbHVlID0gaXMuYS5ib29sZWFuKCB2YWx1ZSApID8gdmFsdWUgOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBjYXNlICggY2FzdFR5cGUgPT09IFwiZGF0ZVwiIHx8IGNhc3RUeXBlID09PSBcImRhdGV0aW1lXCIgKTpcclxuXHJcbiAgICAgIHRyeSB7XHJcblxyXG4gICAgICAgIHZhbHVlID0gbmV3IERhdGUoIF92YWx1ZSApO1xyXG5cclxuICAgICAgICB2YWx1ZSA9IGlzTmFOKCB2YWx1ZS5nZXRUaW1lKCkgKSA/IHVuZGVmaW5lZCA6IHZhbHVlO1xyXG4gICAgICB9IGNhdGNoICggZSApIHt9XHJcblxyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBjYXNlIGNhc3RUeXBlID09PSBcInN0cmluZ1wiOlxyXG4gICAgICBpZiAoaXMuYS5zdHJpbmcoIF92YWx1ZSApKSB7XHJcbiAgICAgICAgdmFsdWUgPSBfdmFsdWVcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCBpcy5hLmJvb2xlYW4oIF92YWx1ZSApIHx8IGlzLmEubnVtYmVyKCBfdmFsdWUgKSApIHtcclxuICAgICAgICB2YWx1ZSA9IF92YWx1ZS50b1N0cmluZygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBicmVhaztcclxuXHJcbiAgICBjYXNlIGNhc3RUeXBlID09PSBcIm51bWJlclwiOlxyXG5cclxuICAgICAgdHJ5IHtcclxuXHJcbiAgICAgICAgaWYoIGlzLmEuYXJyYXkoIF92YWx1ZSApIHx8IGlzLmEuZ3VpZCggX3ZhbHVlICkgKSB7XHJcbiAgICAgICAgICB0aHJvdyBcIndyb25nIG51bWJlclwiOyBcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhbHVlID0gcGFyc2VGbG9hdCggX3ZhbHVlICk7XHJcblxyXG4gICAgICAgIGlmICggaXMubm90LmEubnVtYmVyKCB2YWx1ZSApIHx8IGlzTmFOKCB2YWx1ZSApICkge1xyXG4gICAgICAgICAgdmFsdWUgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGNhdGNoICggZSApIHtcclxuICAgICAgICB2YWx1ZSA9IHVuZGVmaW5lZFxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoIHZhbHVlICE9PSB1bmRlZmluZWQgKSB7XHJcbiAgICAgICAgc3dpdGNoICggdHJ1ZSApIHtcclxuICAgICAgICBjYXNlIF9jYXN0VHlwZSA9PT0gXCJpbnRlZ2VyXCI6XHJcbiAgICAgICAgICB2YWx1ZSA9IHBhcnNlSW50KCB2YWx1ZSwgMTAgKTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgYnJlYWs7XHJcblxyXG4gICAgZGVmYXVsdDpcclxuXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgdmFsdWUgPSBjYXN0KCBKU09OLnBhcnNlKCBfdmFsdWUgKSwgY2FzdFR5cGUgKVxyXG4gICAgICB9IGNhdGNoICggZSApIHt9XHJcblxyXG4gICAgICBicmVhaztcclxuXHJcbiAgICB9XHJcblxyXG4gIH1cclxuXHJcbiAgaWYgKCB2YWx1ZXMubGVuZ3RoID4gMCAmJiAhY29udGFpbnMoIHZhbHVlcywgdmFsdWUgKSApIHtcclxuICAgIHZhbHVlID0gdmFsdWVzWyAwIF07XHJcbiAgfVxyXG5cclxuICByZXR1cm4gaXMubm90LnVuZGVmaW5lZCggdmFsdWUgKSA/IHZhbHVlIDogaXMubm90LnVuZGVmaW5lZCggX2RlZmF1bHQgKSA/IF9kZWZhdWx0IDogbnVsbDtcclxuXHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNhc3Q7IiwidmFyIGNvbnRhaW5zID0gZnVuY3Rpb24gKCBkYXRhLCBpdGVtICkge1xuICB2YXIgZm91bmRPbmUgPSBmYWxzZTtcblxuICBpZiAoIEFycmF5LmlzQXJyYXkoIGRhdGEgKSApIHtcblxuICAgIGRhdGEuZm9yRWFjaCggZnVuY3Rpb24gKCBhcnJheUl0ZW0gKSB7XG4gICAgICBpZiAoIGZvdW5kT25lID09PSBmYWxzZSAmJiBpdGVtID09PSBhcnJheUl0ZW0gKSB7XG4gICAgICAgIGZvdW5kT25lID0gdHJ1ZTtcbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgfSBlbHNlIGlmICggT2JqZWN0KCBkYXRhICkgPT09IGRhdGEgKSB7XG5cbiAgICBPYmplY3Qua2V5cyggZGF0YSApLmZvckVhY2goIGZ1bmN0aW9uICgga2V5ICkge1xuXG4gICAgICBpZiAoIGZvdW5kT25lID09PSBmYWxzZSAmJiBkYXRhWyBrZXkgXSA9PT0gaXRlbSApIHtcbiAgICAgICAgZm91bmRPbmUgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgfSApO1xuXG4gIH1cbiAgcmV0dXJuIGZvdW5kT25lO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjb250YWluczsiLCJ2YXIgZ3VpZFJ4ID0gXCJ7P1swLTlBLUZhLWZdezh9LVswLTlBLUZhLWZdezR9LTRbMC05QS1GYS1mXXszfS1bMC05QS1GYS1mXXs0fS1bMC05QS1GYS1mXXsxMn19P1wiO1xuXG5leHBvcnRzLmdlbmVyYXRlID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB2YXIgZ3VpZCA9IFwieHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4XCIucmVwbGFjZSggL1t4eV0vZywgZnVuY3Rpb24gKCBjICkge1xuICAgIHZhciByID0gKCBkICsgTWF0aC5yYW5kb20oKSAqIDE2ICkgJSAxNiB8IDA7XG4gICAgZCA9IE1hdGguZmxvb3IoIGQgLyAxNiApO1xuICAgIHJldHVybiAoIGMgPT09IFwieFwiID8gciA6ICggciAmIDB4NyB8IDB4OCApICkudG9TdHJpbmcoIDE2ICk7XG4gIH0gKTtcbiAgcmV0dXJuIGd1aWQ7XG59O1xuXG5leHBvcnRzLm1hdGNoID0gZnVuY3Rpb24gKCBzdHJpbmcgKSB7XG4gIHZhciByeCA9IG5ldyBSZWdFeHAoIGd1aWRSeCwgXCJnXCIgKSxcbiAgICBtYXRjaGVzID0gKCB0eXBlb2Ygc3RyaW5nID09PSBcInN0cmluZ1wiID8gc3RyaW5nIDogXCJcIiApLm1hdGNoKCByeCApO1xuICByZXR1cm4gQXJyYXkuaXNBcnJheSggbWF0Y2hlcyApID8gbWF0Y2hlcyA6IFtdO1xufTtcblxuZXhwb3J0cy5pc1ZhbGlkID0gZnVuY3Rpb24gKCBndWlkICkge1xuICB2YXIgcnggPSBuZXcgUmVnRXhwKCBndWlkUnggKTtcbiAgcmV0dXJuIHJ4LnRlc3QoIGd1aWQgKTtcbn07IiwidmFyIHR5cGUgPSByZXF1aXJlKCBcInR5cGUtY29tcG9uZW50XCIgKSxcbiAgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcblxuZnVuY3Rpb24gaGFzS2V5KCBvYmplY3QsIGtleXMsIGtleVR5cGUgKSB7XG5cbiAgb2JqZWN0ID0gdHlwZSggb2JqZWN0ICkgPT09IFwib2JqZWN0XCIgPyBvYmplY3QgOiB7fSwga2V5cyA9IHR5cGUoIGtleXMgKSA9PT0gXCJhcnJheVwiID8ga2V5cyA6IFtdO1xuICBrZXlUeXBlID0gdHlwZSgga2V5VHlwZSApID09PSBcInN0cmluZ1wiID8ga2V5VHlwZSA6IFwiXCI7XG5cbiAgdmFyIGtleSA9IGtleXMubGVuZ3RoID4gMCA/IGtleXMuc2hpZnQoKSA6IFwiXCIsXG4gICAga2V5RXhpc3RzID0gaGFzLmNhbGwoIG9iamVjdCwga2V5ICkgfHwgb2JqZWN0WyBrZXkgXSAhPT0gdm9pZCAwLFxuICAgIGtleVZhbHVlID0ga2V5RXhpc3RzID8gb2JqZWN0WyBrZXkgXSA6IHVuZGVmaW5lZCxcbiAgICBrZXlUeXBlSXNDb3JyZWN0ID0gdHlwZSgga2V5VmFsdWUgKSA9PT0ga2V5VHlwZTtcblxuICBpZiAoIGtleXMubGVuZ3RoID4gMCAmJiBrZXlFeGlzdHMgKSB7XG4gICAgcmV0dXJuIGhhc0tleSggb2JqZWN0WyBrZXkgXSwga2V5cywga2V5VHlwZSApO1xuICB9XG5cbiAgcmV0dXJuIGtleXMubGVuZ3RoID4gMCB8fCBrZXlUeXBlID09PSBcIlwiID8ga2V5RXhpc3RzIDoga2V5RXhpc3RzICYmIGtleVR5cGVJc0NvcnJlY3Q7XG5cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoIG9iamVjdCwga2V5cywga2V5VHlwZSApIHtcblxuICBrZXlzID0gdHlwZSgga2V5cyApID09PSBcInN0cmluZ1wiID8ga2V5cy5zcGxpdCggXCIuXCIgKSA6IFtdO1xuXG4gIHJldHVybiBoYXNLZXkoIG9iamVjdCwga2V5cywga2V5VHlwZSApO1xuXG59OyIsIlxuLyoqXG4gKiB0b1N0cmluZyByZWYuXG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuLyoqXG4gKiBSZXR1cm4gdGhlIHR5cGUgb2YgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24odmFsKXtcbiAgc3dpdGNoICh0b1N0cmluZy5jYWxsKHZhbCkpIHtcbiAgICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6IHJldHVybiAnZnVuY3Rpb24nO1xuICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOiByZXR1cm4gJ2RhdGUnO1xuICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6IHJldHVybiAncmVnZXhwJztcbiAgICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOiByZXR1cm4gJ2FyZ3VtZW50cyc7XG4gICAgY2FzZSAnW29iamVjdCBBcnJheV0nOiByZXR1cm4gJ2FycmF5JztcbiAgfVxuXG4gIGlmICh2YWwgPT09IG51bGwpIHJldHVybiAnbnVsbCc7XG4gIGlmICh2YWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAodmFsID09PSBPYmplY3QodmFsKSkgcmV0dXJuICdvYmplY3QnO1xuXG4gIHJldHVybiB0eXBlb2YgdmFsO1xufTtcbiIsInZhciB0eXBlID0gcmVxdWlyZSggXCIuL2lzZXMvdHlwZVwiICksXG4gIGlzID0ge1xuICAgIGE6IHt9LFxuICAgIGFuOiB7fSxcbiAgICBub3Q6IHtcbiAgICAgIGE6IHt9LFxuICAgICAgYW46IHt9XG4gICAgfVxuICB9O1xuXG52YXIgaXNlcyA9IHtcbiAgXCJhcmd1bWVudHNcIjogWyBcImFyZ3VtZW50c1wiLCB0eXBlKCBcImFyZ3VtZW50c1wiICkgXSxcbiAgXCJhcnJheVwiOiBbIFwiYXJyYXlcIiwgdHlwZSggXCJhcnJheVwiICkgXSxcbiAgXCJib29sZWFuXCI6IFsgXCJib29sZWFuXCIsIHR5cGUoIFwiYm9vbGVhblwiICkgXSxcbiAgXCJkYXRlXCI6IFsgXCJkYXRlXCIsIHR5cGUoIFwiZGF0ZVwiICkgXSxcbiAgXCJmdW5jdGlvblwiOiBbIFwiZnVuY3Rpb25cIiwgXCJmdW5jXCIsIFwiZm5cIiwgdHlwZSggXCJmdW5jdGlvblwiICkgXSxcbiAgXCJudWxsXCI6IFsgXCJudWxsXCIsIHR5cGUoIFwibnVsbFwiICkgXSxcbiAgXCJudW1iZXJcIjogWyBcIm51bWJlclwiLCBcImludGVnZXJcIiwgXCJpbnRcIiwgdHlwZSggXCJudW1iZXJcIiApIF0sXG4gIFwib2JqZWN0XCI6IFsgXCJvYmplY3RcIiwgdHlwZSggXCJvYmplY3RcIiApIF0sXG4gIFwicmVnZXhwXCI6IFsgXCJyZWdleHBcIiwgdHlwZSggXCJyZWdleHBcIiApIF0sXG4gIFwic3RyaW5nXCI6IFsgXCJzdHJpbmdcIiwgdHlwZSggXCJzdHJpbmdcIiApIF0sXG4gIFwidW5kZWZpbmVkXCI6IFsgXCJ1bmRlZmluZWRcIiwgdHlwZSggXCJ1bmRlZmluZWRcIiApIF0sXG4gIFwiZW1wdHlcIjogWyBcImVtcHR5XCIsIHJlcXVpcmUoIFwiLi9pc2VzL2VtcHR5XCIgKSBdLFxuICBcIm51bGxvcnVuZGVmaW5lZFwiOiBbIFwibnVsbE9yVW5kZWZpbmVkXCIsIFwibnVsbG9ydW5kZWZpbmVkXCIsIHJlcXVpcmUoIFwiLi9pc2VzL251bGxvcnVuZGVmaW5lZFwiICkgXSxcbiAgXCJndWlkXCI6IFsgXCJndWlkXCIsIHJlcXVpcmUoIFwiLi9pc2VzL2d1aWRcIiApIF1cbn1cblxuT2JqZWN0LmtleXMoIGlzZXMgKS5mb3JFYWNoKCBmdW5jdGlvbiAoIGtleSApIHtcblxuICB2YXIgbWV0aG9kcyA9IGlzZXNbIGtleSBdLnNsaWNlKCAwLCBpc2VzWyBrZXkgXS5sZW5ndGggLSAxICksXG4gICAgZm4gPSBpc2VzWyBrZXkgXVsgaXNlc1sga2V5IF0ubGVuZ3RoIC0gMSBdO1xuXG4gIG1ldGhvZHMuZm9yRWFjaCggZnVuY3Rpb24gKCBtZXRob2RLZXkgKSB7XG4gICAgaXNbIG1ldGhvZEtleSBdID0gaXMuYVsgbWV0aG9kS2V5IF0gPSBpcy5hblsgbWV0aG9kS2V5IF0gPSBmbjtcbiAgICBpcy5ub3RbIG1ldGhvZEtleSBdID0gaXMubm90LmFbIG1ldGhvZEtleSBdID0gaXMubm90LmFuWyBtZXRob2RLZXkgXSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBmbi5hcHBseSggdGhpcywgYXJndW1lbnRzICkgPyBmYWxzZSA6IHRydWU7XG4gICAgfVxuICB9ICk7XG5cbn0gKTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gaXM7XG5leHBvcnRzLnR5cGUgPSB0eXBlOyIsInZhciB0eXBlID0gcmVxdWlyZShcIi4uL3R5cGVcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCB2YWx1ZSApIHtcbiAgdmFyIGVtcHR5ID0gZmFsc2U7XG5cbiAgaWYgKCB0eXBlKCB2YWx1ZSApID09PSBcIm51bGxcIiB8fCB0eXBlKCB2YWx1ZSApID09PSBcInVuZGVmaW5lZFwiICkge1xuICAgIGVtcHR5ID0gdHJ1ZTtcbiAgfSBlbHNlIGlmICggdHlwZSggdmFsdWUgKSA9PT0gXCJvYmplY3RcIiApIHtcbiAgICBlbXB0eSA9IE9iamVjdC5rZXlzKCB2YWx1ZSApLmxlbmd0aCA9PT0gMDtcbiAgfSBlbHNlIGlmICggdHlwZSggdmFsdWUgKSA9PT0gXCJib29sZWFuXCIgKSB7XG4gICAgZW1wdHkgPSB2YWx1ZSA9PT0gZmFsc2U7XG4gIH0gZWxzZSBpZiAoIHR5cGUoIHZhbHVlICkgPT09IFwibnVtYmVyXCIgKSB7XG4gICAgZW1wdHkgPSB2YWx1ZSA9PT0gMCB8fCB2YWx1ZSA9PT0gLTE7XG4gIH0gZWxzZSBpZiAoIHR5cGUoIHZhbHVlICkgPT09IFwiYXJyYXlcIiB8fCB0eXBlKCB2YWx1ZSApID09PSBcInN0cmluZ1wiICkge1xuICAgIGVtcHR5ID0gdmFsdWUubGVuZ3RoID09PSAwO1xuICB9XG5cbiAgcmV0dXJuIGVtcHR5O1xuXG59OyIsInZhciBndWlkID0gcmVxdWlyZSggXCJzYy1ndWlkXCIgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoIHZhbHVlICkge1xuICByZXR1cm4gZ3VpZC5pc1ZhbGlkKCB2YWx1ZSApO1xufTsiLCJtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICggdmFsdWUgKSB7XG5cdHJldHVybiB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSB2b2lkIDA7XG59OyIsInZhciB0eXBlID0gcmVxdWlyZSggXCIuLi90eXBlXCIgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoIF90eXBlICkge1xuICByZXR1cm4gZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG4gICAgcmV0dXJuIHR5cGUoIF92YWx1ZSApID09PSBfdHlwZTtcbiAgfVxufSIsInZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKCB2YWwgKSB7XG4gIHN3aXRjaCAoIHRvU3RyaW5nLmNhbGwoIHZhbCApICkge1xuICBjYXNlICdbb2JqZWN0IEZ1bmN0aW9uXSc6XG4gICAgcmV0dXJuICdmdW5jdGlvbic7XG4gIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgIHJldHVybiAnZGF0ZSc7XG4gIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgcmV0dXJuICdyZWdleHAnO1xuICBjYXNlICdbb2JqZWN0IEFyZ3VtZW50c10nOlxuICAgIHJldHVybiAnYXJndW1lbnRzJztcbiAgY2FzZSAnW29iamVjdCBBcnJheV0nOlxuICAgIHJldHVybiAnYXJyYXknO1xuICB9XG5cbiAgaWYgKCB2YWwgPT09IG51bGwgKSByZXR1cm4gJ251bGwnO1xuICBpZiAoIHZhbCA9PT0gdW5kZWZpbmVkICkgcmV0dXJuICd1bmRlZmluZWQnO1xuICBpZiAoIHZhbCA9PT0gT2JqZWN0KCB2YWwgKSApIHJldHVybiAnb2JqZWN0JztcblxuICByZXR1cm4gdHlwZW9mIHZhbDtcbn07IiwidmFyIG1kNSA9IHJlcXVpcmUoIFwibWQ1LWNvbXBvbmVudFwiICk7XG5cbmZ1bmN0aW9uIHN0cmluZ2lmeSggX29iamVjdCApIHtcbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KCBfb2JqZWN0ICk7XG59XG5cbmZ1bmN0aW9uIGhhc2goIF9vYmplY3QgKSB7XG4gIHJldHVybiBtZDUoIHN0cmluZ2lmeSggX29iamVjdCApICk7XG59XG5cbmV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IGhhc2g7XG5leHBvcnRzLnN0cmluZ2lmeSA9IHN0cmluZ2lmeTtcbmV4cG9ydHMubWQ1ID0gbWQ1OyIsIi8qKlxuICogbWQ1LmpzXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTEsIFlvc2hpbm9yaSBLb2h5YW1hIChodHRwOi8vYWxnb2JpdC5qcC8pXG4gKiBhbGwgcmlnaHRzIHJlc2VydmVkLlxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZGlnZXN0U3RyaW5nO1xuXG5mdW5jdGlvbiBkaWdlc3QoTSkge1xuICB2YXIgb3JpZ2luYWxMZW5ndGhcbiAgICAsIGlcbiAgICAsIGpcbiAgICAsIGtcbiAgICAsIGxcbiAgICAsIEFcbiAgICAsIEJcbiAgICAsIENcbiAgICAsIERcbiAgICAsIEFBXG4gICAgLCBCQlxuICAgICwgQ0NcbiAgICAsIEREXG4gICAgLCBYXG4gICAgLCBydmFsXG4gICAgO1xuXG5cdGZ1bmN0aW9uIEYoeCwgeSwgeikgeyByZXR1cm4gKHggJiB5KSB8ICh+eCAmIHopOyB9XG5cdGZ1bmN0aW9uIEcoeCwgeSwgeikgeyByZXR1cm4gKHggJiB6KSB8ICh5ICYgfnopOyB9XG5cdGZ1bmN0aW9uIEgoeCwgeSwgeikgeyByZXR1cm4geCBeIHkgXiB6OyAgICAgICAgICB9XG5cdGZ1bmN0aW9uIEkoeCwgeSwgeikgeyByZXR1cm4geSBeICh4IHwgfnopOyAgICAgICB9XG5cblx0ZnVuY3Rpb24gdG80Ynl0ZXMobikge1xuXHRcdHJldHVybiBbbiYweGZmLCAobj4+PjgpJjB4ZmYsIChuPj4+MTYpJjB4ZmYsIChuPj4+MjQpJjB4ZmZdO1xuXHR9XG5cblx0b3JpZ2luYWxMZW5ndGggPSBNLmxlbmd0aDsgLy8gZm9yIFN0ZXAuMlxuXG5cdC8vIDMuMSBTdGVwIDEuIEFwcGVuZCBQYWRkaW5nIEJpdHNcblx0TS5wdXNoKDB4ODApO1xuXHRsID0gKDU2IC0gTS5sZW5ndGgpJjB4M2Y7XG5cdGZvciAoaSA9IDA7IGkgPCBsOyBpKyspXG5cdFx0TS5wdXNoKDApO1xuXG5cdC8vIDMuMiBTdGVwIDIuIEFwcGVuZCBMZW5ndGhcblx0dG80Ynl0ZXMoOCpvcmlnaW5hbExlbmd0aCkuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBNLnB1c2goZSk7IH0pO1xuXHRbMCwgMCwgMCwgMF0uZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBNLnB1c2goZSk7IH0pO1xuXG5cdC8vIDMuMyBTdGVwIDMuIEluaXRpYWxpemUgTUQgQnVmZmVyXG5cdEEgPSBbMHg2NzQ1MjMwMV07XG5cdEIgPSBbMHhlZmNkYWI4OV07XG5cdEMgPSBbMHg5OGJhZGNmZV07XG5cdEQgPSBbMHgxMDMyNTQ3Nl07XG5cblx0Ly8gMy40IFN0ZXAgNC4gUHJvY2VzcyBNZXNzYWdlIGluIDE2LVdvcmQgQmxvY2tzXG5cdGZ1bmN0aW9uIHJvdW5kcyhhLCBiLCBjLCBkLCBrLCBzLCB0LCBmKSB7XG5cdFx0YVswXSArPSBmKGJbMF0sIGNbMF0sIGRbMF0pICsgWFtrXSArIHQ7XG5cdFx0YVswXSA9ICgoYVswXTw8cyl8KGFbMF0+Pj4oMzIgLSBzKSkpO1xuXHRcdGFbMF0gKz0gYlswXTtcblx0fVxuXG5cdGZvciAoaSA9IDA7IGkgPCBNLmxlbmd0aDsgaSArPSA2NCkge1xuXHRcdFggPSBbXTtcblx0XHRmb3IgKGogPSAwOyBqIDwgNjQ7IGogKz0gNCkge1xuXHRcdFx0ayA9IGkgKyBqO1xuXHRcdFx0WC5wdXNoKE1ba118KE1bayArIDFdPDw4KXwoTVtrICsgMl08PDE2KXwoTVtrICsgM108PDI0KSk7XG5cdFx0fVxuXHRcdEFBID0gQVswXTtcblx0XHRCQiA9IEJbMF07XG5cdFx0Q0MgPSBDWzBdO1xuXHRcdEREID0gRFswXTtcblxuXHRcdC8vIFJvdW5kIDEuXG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICAwLCAgNywgMHhkNzZhYTQ3OCwgRik7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICAxLCAxMiwgMHhlOGM3Yjc1NiwgRik7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICAyLCAxNywgMHgyNDIwNzBkYiwgRik7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICAzLCAyMiwgMHhjMWJkY2VlZSwgRik7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA0LCAgNywgMHhmNTdjMGZhZiwgRik7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA1LCAxMiwgMHg0Nzg3YzYyYSwgRik7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICA2LCAxNywgMHhhODMwNDYxMywgRik7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA3LCAyMiwgMHhmZDQ2OTUwMSwgRik7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA4LCAgNywgMHg2OTgwOThkOCwgRik7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA5LCAxMiwgMHg4YjQ0ZjdhZiwgRik7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDEwLCAxNywgMHhmZmZmNWJiMSwgRik7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDExLCAyMiwgMHg4OTVjZDdiZSwgRik7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsIDEyLCAgNywgMHg2YjkwMTEyMiwgRik7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDEzLCAxMiwgMHhmZDk4NzE5MywgRik7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDE0LCAxNywgMHhhNjc5NDM4ZSwgRik7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDE1LCAyMiwgMHg0OWI0MDgyMSwgRik7XG5cblx0XHQvLyBSb3VuZCAyLlxuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgMSwgIDUsIDB4ZjYxZTI1NjIsIEcpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgNiwgIDksIDB4YzA0MGIzNDAsIEcpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxMSwgMTQsIDB4MjY1ZTVhNTEsIEcpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgMCwgMjAsIDB4ZTliNmM3YWEsIEcpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgNSwgIDUsIDB4ZDYyZjEwNWQsIEcpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAxMCwgIDksIDB4MDI0NDE0NTMsIEcpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAxNSwgMTQsIDB4ZDhhMWU2ODEsIEcpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgNCwgMjAsIDB4ZTdkM2ZiYzgsIEcpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAgOSwgIDUsIDB4MjFlMWNkZTYsIEcpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAxNCwgIDksIDB4YzMzNzA3ZDYsIEcpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgMywgMTQsIDB4ZjRkNTBkODcsIEcpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAgOCwgMjAsIDB4NDU1YTE0ZWQsIEcpO1xuXHRcdHJvdW5kcyhBLCBCLCBDLCBELCAxMywgIDUsIDB4YTllM2U5MDUsIEcpO1xuXHRcdHJvdW5kcyhELCBBLCBCLCBDLCAgMiwgIDksIDB4ZmNlZmEzZjgsIEcpO1xuXHRcdHJvdW5kcyhDLCBELCBBLCBCLCAgNywgMTQsIDB4Njc2ZjAyZDksIEcpO1xuXHRcdHJvdW5kcyhCLCBDLCBELCBBLCAxMiwgMjAsIDB4OGQyYTRjOGEsIEcpO1xuXG5cdFx0Ly8gUm91bmQgMy5cblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDUsICA0LCAweGZmZmEzOTQyLCBIKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDgsIDExLCAweDg3NzFmNjgxLCBIKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTEsIDE2LCAweDZkOWQ2MTIyLCBIKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgMTQsIDIzLCAweGZkZTUzODBjLCBIKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDEsICA0LCAweGE0YmVlYTQ0LCBIKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDQsIDExLCAweDRiZGVjZmE5LCBIKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDcsIDE2LCAweGY2YmI0YjYwLCBIKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgMTAsIDIzLCAweGJlYmZiYzcwLCBIKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgMTMsICA0LCAweDI4OWI3ZWM2LCBIKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgIDAsIDExLCAweGVhYTEyN2ZhLCBIKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgIDMsIDE2LCAweGQ0ZWYzMDg1LCBIKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDYsIDIzLCAweDA0ODgxZDA1LCBIKTtcblx0XHRyb3VuZHMoQSwgQiwgQywgRCwgIDksICA0LCAweGQ5ZDRkMDM5LCBIKTtcblx0XHRyb3VuZHMoRCwgQSwgQiwgQywgMTIsIDExLCAweGU2ZGI5OWU1LCBIKTtcblx0XHRyb3VuZHMoQywgRCwgQSwgQiwgMTUsIDE2LCAweDFmYTI3Y2Y4LCBIKTtcblx0XHRyb3VuZHMoQiwgQywgRCwgQSwgIDIsIDIzLCAweGM0YWM1NjY1LCBIKTtcblxuXHRcdC8vIFJvdW5kIDQuXG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICAwLCAgNiwgMHhmNDI5MjI0NCwgSSk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICA3LCAxMCwgMHg0MzJhZmY5NywgSSk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDE0LCAxNSwgMHhhYjk0MjNhNywgSSk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA1LCAyMSwgMHhmYzkzYTAzOSwgSSk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsIDEyLCAgNiwgMHg2NTViNTljMywgSSk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsICAzLCAxMCwgMHg4ZjBjY2M5MiwgSSk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsIDEwLCAxNSwgMHhmZmVmZjQ3ZCwgSSk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICAxLCAyMSwgMHg4NTg0NWRkMSwgSSk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA4LCAgNiwgMHg2ZmE4N2U0ZiwgSSk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDE1LCAxMCwgMHhmZTJjZTZlMCwgSSk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICA2LCAxNSwgMHhhMzAxNDMxNCwgSSk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsIDEzLCAyMSwgMHg0ZTA4MTFhMSwgSSk7XG5cdFx0cm91bmRzKEEsIEIsIEMsIEQsICA0LCAgNiwgMHhmNzUzN2U4MiwgSSk7XG5cdFx0cm91bmRzKEQsIEEsIEIsIEMsIDExLCAxMCwgMHhiZDNhZjIzNSwgSSk7XG5cdFx0cm91bmRzKEMsIEQsIEEsIEIsICAyLCAxNSwgMHgyYWQ3ZDJiYiwgSSk7XG5cdFx0cm91bmRzKEIsIEMsIEQsIEEsICA5LCAyMSwgMHhlYjg2ZDM5MSwgSSk7XG5cblx0XHRBWzBdICs9IEFBO1xuXHRcdEJbMF0gKz0gQkI7XG5cdFx0Q1swXSArPSBDQztcblx0XHREWzBdICs9IEREO1xuXHR9XG5cblx0cnZhbCA9IFtdO1xuXHR0bzRieXRlcyhBWzBdKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IHJ2YWwucHVzaChlKTsgfSk7XG5cdHRvNGJ5dGVzKEJbMF0pLmZvckVhY2goZnVuY3Rpb24gKGUpIHsgcnZhbC5wdXNoKGUpOyB9KTtcblx0dG80Ynl0ZXMoQ1swXSkuZm9yRWFjaChmdW5jdGlvbiAoZSkgeyBydmFsLnB1c2goZSk7IH0pO1xuXHR0bzRieXRlcyhEWzBdKS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7IHJ2YWwucHVzaChlKTsgfSk7XG5cblx0cmV0dXJuIHJ2YWw7XG59XG5cbmZ1bmN0aW9uIGRpZ2VzdFN0cmluZyhzKSB7XG5cdHZhciBNID0gW11cbiAgICAsIGlcbiAgICAsIGRcbiAgICAsIHJzdHJcbiAgICAsIHNcbiAgICA7XG5cblx0Zm9yIChpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspXG5cdFx0TS5wdXNoKHMuY2hhckNvZGVBdChpKSk7XG5cblx0ZCA9IGRpZ2VzdChNKTtcblx0cnN0ciA9ICcnO1xuXG5cdGQuZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuXHRcdHMgPSBlLnRvU3RyaW5nKDE2KTtcblx0XHR3aGlsZSAocy5sZW5ndGggPCAyKVxuXHRcdFx0cyA9ICcwJyArIHM7XG5cdFx0cnN0ciArPSBzO1xuXHR9KTtcblxuXHRyZXR1cm4gcnN0cjtcbn0iLCJ2YXIgdHlwZSA9IHJlcXVpcmUoIFwidHlwZS1jb21wb25lbnRcIiApO1xuXG52YXIgbWVyZ2UgPSBmdW5jdGlvbiAoKSB7XG5cbiAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCggYXJndW1lbnRzICksXG4gICAgZGVlcCA9IHR5cGUoIGFyZ3NbIDAgXSApID09PSBcImJvb2xlYW5cIiA/IGFyZ3Muc2hpZnQoKSA6IGZhbHNlLFxuICAgIG9iamVjdHMgPSBhcmdzLFxuICAgIHJlc3VsdCA9IHt9O1xuXG4gIG9iamVjdHMuZm9yRWFjaCggZnVuY3Rpb24gKCBvYmplY3RuICkge1xuXG4gICAgaWYgKCB0eXBlKCBvYmplY3RuICkgIT09IFwib2JqZWN0XCIgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgT2JqZWN0LmtleXMoIG9iamVjdG4gKS5mb3JFYWNoKCBmdW5jdGlvbiAoIGtleSApIHtcbiAgICAgIGlmICggT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKCBvYmplY3RuLCBrZXkgKSApIHtcbiAgICAgICAgaWYgKCBkZWVwICYmIHR5cGUoIG9iamVjdG5bIGtleSBdICkgPT09IFwib2JqZWN0XCIgKSB7XG4gICAgICAgICAgcmVzdWx0WyBrZXkgXSA9IG1lcmdlKCBkZWVwLCB7fSwgcmVzdWx0WyBrZXkgXSwgb2JqZWN0blsga2V5IF0gKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXN1bHRbIGtleSBdID0gb2JqZWN0blsga2V5IF07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9ICk7XG5cbiAgfSApO1xuXG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IG1lcmdlOyIsInZhciBPYnNlcnZhYmxlQXJyYXkgPSBmdW5jdGlvbiAoIF9hcnJheSApIHtcblx0dmFyIGhhbmRsZXJzID0ge30sXG5cdFx0YXJyYXkgPSBBcnJheS5pc0FycmF5KCBfYXJyYXkgKSA/IF9hcnJheSA6IFtdO1xuXG5cdHZhciBwcm94eSA9IGZ1bmN0aW9uICggX21ldGhvZCwgX3ZhbHVlICkge1xuXHRcdHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoIGFyZ3VtZW50cywgMSApO1xuXG5cdFx0aWYgKCBoYW5kbGVyc1sgX21ldGhvZCBdICkge1xuXHRcdFx0cmV0dXJuIGhhbmRsZXJzWyBfbWV0aG9kIF0uYXBwbHkoIGFycmF5LCBhcmdzICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBhcnJheVsgJ19fJyArIF9tZXRob2QgXS5hcHBseSggYXJyYXksIGFyZ3MgKTtcblx0XHR9XG5cdH07XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIGFycmF5LCB7XG5cdFx0b246IHtcblx0XHRcdHZhbHVlOiBmdW5jdGlvbiAoIF9ldmVudCwgX2NhbGxiYWNrICkge1xuXHRcdFx0XHRoYW5kbGVyc1sgX2V2ZW50IF0gPSBfY2FsbGJhY2s7XG5cdFx0XHR9XG5cdFx0fVxuXHR9ICk7XG5cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCBhcnJheSwgJ3BvcCcsIHtcblx0XHR2YWx1ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHByb3h5KCAncG9wJywgYXJyYXlbIGFycmF5Lmxlbmd0aCAtIDEgXSApO1xuXHRcdH1cblx0fSApO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggYXJyYXksICdfX3BvcCcsIHtcblx0XHR2YWx1ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIEFycmF5LnByb3RvdHlwZS5wb3AuYXBwbHkoIGFycmF5LCBhcmd1bWVudHMgKTtcblx0XHR9XG5cdH0gKTtcblxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoIGFycmF5LCAnc2hpZnQnLCB7XG5cdFx0dmFsdWU6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBwcm94eSggJ3NoaWZ0JywgYXJyYXlbIDAgXSApO1xuXHRcdH1cblx0fSApO1xuXG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSggYXJyYXksICdfX3NoaWZ0Jywge1xuXHRcdHZhbHVlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gQXJyYXkucHJvdG90eXBlLnNoaWZ0LmFwcGx5KCBhcnJheSwgYXJndW1lbnRzICk7XG5cdFx0fVxuXHR9ICk7XG5cblx0WyAncHVzaCcsICdyZXZlcnNlJywgJ3Vuc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnIF0uZm9yRWFjaCggZnVuY3Rpb24gKCBfbWV0aG9kICkge1xuXHRcdHZhciBwcm9wZXJ0aWVzID0ge307XG5cblx0XHRwcm9wZXJ0aWVzWyBfbWV0aG9kIF0gPSB7XG5cdFx0XHR2YWx1ZTogcHJveHkuYmluZCggbnVsbCwgX21ldGhvZCApXG5cdFx0fTtcblxuXHRcdHByb3BlcnRpZXNbICdfXycgKyBfbWV0aG9kIF0gPSB7XG5cdFx0XHR2YWx1ZTogZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG5cdFx0XHRcdHJldHVybiBBcnJheS5wcm90b3R5cGVbIF9tZXRob2QgXS5hcHBseSggYXJyYXksIGFyZ3VtZW50cyApO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydGllcyggYXJyYXksIHByb3BlcnRpZXMgKTtcblx0fSApO1xuXG5cdHJldHVybiBhcnJheTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2YWJsZUFycmF5OyIsIm1vZHVsZS5leHBvcnRzPXtcbiAgXCJuYW1lXCI6IFwic2NmaWx0ZXJlZGxpc3RcIixcbiAgXCJjbGFzc05hbWVcIjogXCJzYy1maWx0ZXJlZC1saXN0XCIsXG4gIFwiZGVmYXVsdHNcIjoge1xuICAgIFwibWF4TnVtSXRlbXNWaXNpYmxlXCI6IDcsXG4gICAgXCJtYXhOdW1JdGVtc1wiOiAxMCxcbiAgICBcInNvcnRDb250cm9sVmlzaWJsZVwiOiB0cnVlLFxuICAgIFwiaXRlbUxhYmVsS2V5XCI6IFwibmFtZVwiLFxuICAgIFwiZGVmYXVsdEJ1dHRvbkxhYmVsXCI6IFwiQ2hvb3NlIG9uZVwiLFxuICAgIFwiZGVmYWx1dExpc3RUaXRsZVwiOiBcIlNlbGVjdCBhbiBpdGVtXCJcbiAgfSxcbiAgXCJ0ZW1wbGF0ZXNcIjoge1xuICAgIFwibGlzdFdyYXBwZXJcIjogXCI8ZGl2IGNsYXNzPSc8JT0gY29uZmlnLmNsYXNzTmFtZSAlPi1jb250YWluZXInPjwlPSBjb25maWcudGVtcGxhdGVzLmxpc3RJbnB1dCAlPjwlPSBjb25maWcudGVtcGxhdGVzLmxpc3RIZWFkZXIgJT48JT0gY29uZmlnLnRlbXBsYXRlcy5saXN0SXRlbVdyYXBwZXIgJT48L2Rpdj5cIixcbiAgICBcImxpc3RJbnB1dFwiOiBcIjxkaXYgY2xhc3M9JzwlPSBjb25maWcuY2xhc3NOYW1lICU+LWlucHV0LWNvbnRhaW5lcic+PGlucHV0IHR5cGU9J3RleHQnIGNsYXNzPSc8JT0gY29uZmlnLmNsYXNzTmFtZSAlPi1pbnB1dCc+PCU9IGNvbmZpZy50ZW1wbGF0ZXMubGlzdFNvcnRUb2dnbGUgJT48L2Rpdj5cIixcbiAgICBcImxpc3RIZWFkZXJcIjogXCI8aGVhZGVyIGNsYXNzPSc8JT0gY29uZmlnLmNsYXNzTmFtZSAlPi1oZWFkZXInPjwlPSBjb25maWcuZGVmYXVsdHMuZGVmYWx1dExpc3RUaXRsZSAlPjwvaGVhZGVyPlwiLFxuICAgIFwibGlzdEl0ZW1XcmFwcGVyXCI6IFwiPHVsIGNsYXNzPSc8JT0gY29uZmlnLmNsYXNzTmFtZSAlPi1pdGVtcyc+PC91bD5cIixcbiAgICBcImxpc3RJdGVtXCI6IFwiPGxpIGNsYXNzPSc8JT0gY29uZmlnLmNsYXNzTmFtZSAlPi1pdGVtJyBkYXRhLWNpZD0nPCU9IGNpZCAlPic+PCU9IGtleSAlPjwvbGk+XCIsXG4gICAgXCJsaXN0U29ydFRvZ2dsZVwiOiBcIjxidXR0b24gdHlwZT0nYnV0dG9uJyBjbGFzcz0nPCU9IGNvbmZpZy5jbGFzc05hbWUgJT4tc29ydC10b2dnbGUnPjwvYnV0dG9uPlwiXG4gIH1cbn0iLCJ2YXIgY2FzdCA9IHJlcXVpcmUoIFwic2MtY2FzdFwiICksXG4gIGNvbmZpZyA9IHJlcXVpcmUoIFwiLi9jb25maWcuanNvblwiICksXG4gIGVtaXR0ZXIgPSByZXF1aXJlKCBcImVtaXR0ZXItY29tcG9uZW50XCIgKSxcbiAgZ3VpZCA9IHJlcXVpcmUoIFwic2MtZ3VpZFwiICksXG4gIGhhc0tleSA9IHJlcXVpcmUoIFwic2MtaGFza2V5XCIgKSxcbiAgaGVscGVycyA9IHJlcXVpcmUoIFwiLi9oZWxwZXJzXCIgKSxcbiAgaXMgPSByZXF1aXJlKCBcInNjLWlzXCIgKSxcbiAgTGlzdCA9IHJlcXVpcmUoIFwiLi9saXN0XCIgKSxcbiAgb2JzZXJ2YWJsZUFycmF5ID0gcmVxdWlyZSggXCJzZy1vYnNlcnZhYmxlLWFycmF5XCIgKTtcblxudmFyIEZpbHRlcmVkTGlzdCA9IGZ1bmN0aW9uICggX2VsLCBfZGVmYXVsdHMgKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjaWQgPSBndWlkLmdlbmVyYXRlKCksXG4gICAgZGVmYXVsdHMsXG4gICAgbG9jYWxDb25maWc7XG5cbiAgc2VsZi4kZWwgPSAkKCBfZWwgKTtcblxuICBpZiAoIHNlbGYuJGVsLmxlbmd0aCA9PT0gMCApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoIFwiQW4gaW52YWxpZCBET00gZWxlbWVudCB3YXMgZ2l2ZW5cIiApO1xuICB9XG5cbiAgZGVmYXVsdHMgPSAkLmV4dGVuZCgge30sIGNvbmZpZy5kZWZhdWx0cywgc2VsZi4kZWwuZGF0YSggY29uZmlnLmNsYXNzTmFtZSArIFwiLW9wdGlvbnNcIiApLCBfZGVmYXVsdHMgKTtcblxuICBsb2NhbENvbmZpZyA9ICQuZXh0ZW5kKCB7fSwgY29uZmlnLCB7XG4gICAgZGVmYXVsdHM6IGRlZmF1bHRzXG4gIH0gKTtcblxuICBzZWxmLiRlbC53cmFwKCBcIjxzcGFuIGNsYXNzPSdcIiArIGxvY2FsQ29uZmlnLmNsYXNzTmFtZSArIFwiJyBkYXRhLXNjLWZpbHRlcmVkLWxpc3QtY2lkPSdcIiArIGNpZCArIFwiJz5cIiApO1xuICBzZWxmLiR3cmFwcGVyID0gc2VsZi4kZWwucGFyZW50KCk7XG5cbiAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXMoIHNlbGYsIHtcbiAgICBcIl9fY2lkXCI6IHtcbiAgICAgIHZhbHVlOiBjaWRcbiAgICB9LFxuICAgIFwiX19jb25maWdcIjoge1xuICAgICAgdmFsdWU6IGxvY2FsQ29uZmlnLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19kZXN0cm95ZWRcIjoge1xuICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiX19mZXRjaGluZ1wiOiB7XG4gICAgICB2YWx1ZTogZmFsc2UsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2l0ZW1zXCI6IHtcbiAgICAgIHZhbHVlOiB7fSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fbGFiZWxcIjoge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX2xhc3RGZXRjaGVkVmFsdWVcIjoge1xuICAgICAgdmFsdWU6IFwiXCIsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJfX29yaWdpbmFsXCI6IHtcbiAgICAgIHZhbHVlOiB7fSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fc29ydFwiOiB7XG4gICAgICB2YWx1ZTogXCJcIixcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fdmFsdWVcIjoge1xuICAgICAgdmFsdWU6IG51bGwsXG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJhY3RpdmVJdGVtXCI6IHtcbiAgICAgIGdldDogaGVscGVycy5hY3RpdmVJdGVtR2V0LmJpbmQoIHNlbGYgKSxcbiAgICAgIHNldDogaGVscGVycy5hY3RpdmVJdGVtU2V0LmJpbmQoIHNlbGYgKVxuICAgIH0sXG4gICAgXCJpdGVtc1wiOiB7XG4gICAgICB2YWx1ZTogb2JzZXJ2YWJsZUFycmF5KCBbXSApLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwibGFiZWxcIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLmxhYmVsR2V0LmJpbmQoIHNlbGYgKSxcbiAgICAgIHNldDogaGVscGVycy5sYWJlbFNldC5iaW5kKCBzZWxmIClcbiAgICB9LFxuICAgIFwibGlzdFwiOiB7XG4gICAgICB3cml0YWJsZTogdHJ1ZVxuICAgIH0sXG4gICAgXCJsaXN0VmlzaWJsZVwiOiB7XG4gICAgICBnZXQ6IGhlbHBlcnMubGlzdFZpc2libGVHZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLmxpc3RWaXNpYmxlU2V0LmJpbmQoIHNlbGYgKVxuICAgIH0sXG4gICAgXCJyZXN1bHRzXCI6IHtcbiAgICAgIHZhbHVlOiBbXSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcInNvcnRcIjoge1xuICAgICAgZ2V0OiBoZWxwZXJzLnNvcnRHZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLnNvcnRTZXQuYmluZCggc2VsZiApXG4gICAgfSxcbiAgICBcInZhbHVlXCI6IHtcbiAgICAgIGdldDogaGVscGVycy52YWx1ZUdldC5iaW5kKCBzZWxmICksXG4gICAgICBzZXQ6IGhlbHBlcnMudmFsdWVTZXQuYmluZCggc2VsZiApXG4gICAgfVxuICB9ICk7XG5cbiAgc2VsZi5saXN0ID0gbmV3IExpc3QoIHNlbGYgKTtcblxuICBzZWxmLl9fb3JpZ2luYWwuYnV0dG9uVGV4dCA9IHNlbGYuJGVsLnRleHQoKTtcblxuICB2YXIgaXRlbVZhbHVlID0ge307XG4gIGl0ZW1WYWx1ZVsgc2VsZi5fX2NvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXkgXSA9IHNlbGYuX19jb25maWcuZGVmYXVsdHMuZGVmYXVsdEJ1dHRvbkxhYmVsO1xuICBzZWxmLnZhbHVlID0gaXRlbVZhbHVlO1xuXG4gIHNlbGYuJGVsXG4gICAgLmFkZENsYXNzKCBzZWxmLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWJ1dHRvblwiIClcbiAgICAuZGF0YSggc2VsZi5fX2NvbmZpZy5uYW1lLCBzZWxmIClcbiAgICAudHJpZ2dlciggc2VsZi5fX2NvbmZpZy5uYW1lICsgXCItcmVhZHlcIiApO1xuXG4gIGlmICggc2VsZi5fX2NvbmZpZy5kZWZhdWx0cy5zb3J0Q29udHJvbFZpc2libGUgIT09IHRydWUgKSB7XG4gICAgc2VsZi4kd3JhcHBlci5hZGRDbGFzcyggc2VsZi5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1zb3J0LWhpZGRlblwiICk7XG4gIH1cblxuICBbIFwicHVzaFwiLCBcInNoaWZ0XCIgXS5mb3JFYWNoKCBmdW5jdGlvbiAoIF9tZXRob2QgKSB7XG4gICAgc2VsZi5pdGVtcy5vbiggX21ldGhvZCwgaGVscGVyc1sgXCJpdGVtXCIgKyBfbWV0aG9kIF0uYmluZCggc2VsZiApICk7XG4gIH0gKTtcblxuICAkKCB3aW5kb3cgKS5vbiggXCJjbGljay5cIiArIHNlbGYuX19jb25maWcubmFtZSwgaGVscGVycy5ib2R5Q2xpY2suYmluZCggc2VsZiApICk7XG5cbiAgc2VsZi5mZXRjaCgpO1xufTtcblxuRmlsdGVyZWRMaXN0LnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNlbGYuX19kZXN0cm95ZWQgPSB0cnVlO1xuICBzZWxmLmxpc3QuZGVzdHJveSgpO1xuICAkKCB3aW5kb3cgKS5vZmYoIFwiLlwiICsgc2VsZi5fX2NvbmZpZy5uYW1lICk7XG5cbiAgc2VsZi4kZWxcbiAgICAudGV4dCggc2VsZi5fX29yaWdpbmFsLmJ1dHRvblRleHQgKVxuICAgIC51bndyYXAoKVxuICAgIC5kYXRhKCBzZWxmLl9fY29uZmlnLm5hbWUsIG51bGwgKVxuICAgIC5yZW1vdmVDbGFzcyggc2VsZi5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1idXR0b25cIiApO1xuXG4gIHNlbGYuZW1pdCggXCJkZXN0cm95XCIgKTtcbn07XG5cbkZpbHRlcmVkTGlzdC5wcm90b3R5cGUuZmV0Y2ggPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCAhc2VsZi50aHJvdHRsZWRGZXRjaCApIHtcbiAgICBzZWxmLnRocm90dGxlZEZldGNoID0gXy50aHJvdHRsZSggZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIHZhbHVlID0gc2VsZi5saXN0LiRpbnB1dC52YWwoKTtcblxuICAgICAgc2VsZi5fX2xhc3RGZXRjaGVkVmFsdWUgPSB2YWx1ZTtcbiAgICAgIHNlbGYuZW1pdCggXCJmZXRjaFwiLCBzZWxmLl9fbGFzdEZldGNoZWRWYWx1ZSApO1xuICAgIH0sIDEwICk7IC8vIFRPRE86IGNoZWNrIHRoaXNcbiAgfVxuXG4gIHNlbGYudGhyb3R0bGVkRmV0Y2goKTtcbn07XG5cbmVtaXR0ZXIoIEZpbHRlcmVkTGlzdC5wcm90b3R5cGUgKTtcblxuZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gRmlsdGVyZWRMaXN0O1xuZXhwb3J0cy5kZWZhdWx0cyA9IGNvbmZpZy5kZWZhdWx0cztcblxuJCggZnVuY3Rpb24gKCkge1xuICAkKCBcImJ1dHRvbltkYXRhLVwiICsgY29uZmlnLmNsYXNzTmFtZSArIFwiXVwiICkuZWFjaCggZnVuY3Rpb24gKCBfaSwgX2VsICkge1xuICAgIG5ldyBGaWx0ZXJlZExpc3QoIF9lbCApO1xuICB9ICk7XG59ICk7IiwidmFyIGNhc3QgPSByZXF1aXJlKCBcInNjLWNhc3RcIiApLFxuICBoYXNLZXkgPSByZXF1aXJlKCBcInNjLWhhc2tleVwiICksXG4gIEl0ZW1WYWx1ZSA9IHJlcXVpcmUoIFwiLi9pdGVtLXZhbHVlXCIgKSxcbiAgc29ydFRvZ2dsZU9wdGlvbnMgPSBbIFwiXCIsIFwiZGVzY1wiLCBcImFzY1wiIF0sXG4gIG1kNSA9IHJlcXVpcmUoIFwic2MtbWQ1XCIgKTtcblxuZXhwb3J0cy5hY3RpdmVJdGVtR2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gZmlsdGVyLmxpc3QuZ2V0QWN0aXZlSXRlbSgpO1xufTtcblxuZXhwb3J0cy5hY3RpdmVJdGVtU2V0ID0gZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZpbHRlci52YWx1ZSA9IF92YWx1ZTtcbiAgZmlsdGVyLmVtaXQoIFwiY2hhbmdlXCIsIF92YWx1ZSApO1xufTtcblxuZXhwb3J0cy5hY3RpdmVJdGVtSW5kZXhHZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBsaXN0ID0gdGhpcztcblxuICBpZiAoIGxpc3QuZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBsaXN0Ll9fYWN0aXZlSXRlbUluZGV4O1xufTtcblxuZXhwb3J0cy5hY3RpdmVJdGVtSW5kZXhTZXQgPSBmdW5jdGlvbiAoIF92YWx1ZSApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGluZGV4ID0gY2FzdCggX3ZhbHVlLCBcIm51bWJlclwiLCAwICksXG4gICAgaXRlbUFjdGl2ZUNsYXNzTmFtZSA9IGxpc3QuZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWl0ZW0tYWN0aXZlXCIsXG4gICAgJGl0ZW1DaGlsZHJlbiA9IGxpc3QuJGxpc3QuY2hpbGRyZW4oKSxcbiAgICAkZmlyc3RJdGVtID0gJCggJGl0ZW1DaGlsZHJlblsgMCBdICksXG4gICAgJGFjdGl2ZUl0ZW1JbmRleEJ5Q2xhc3MgPSBsaXN0LiRsaXN0LmZpbmQoIFwiLlwiICsgaXRlbUFjdGl2ZUNsYXNzTmFtZSApLFxuICAgICRhY3RpdmVJdGVtSW5kZXhCeUluZGV4ID0gJCggJGl0ZW1DaGlsZHJlblsgaW5kZXggXSApLFxuICAgICRhY3RpdmVJdGVtSW5kZXggPSAkYWN0aXZlSXRlbUluZGV4QnlJbmRleC5sZW5ndGggPT09IDEgPyAkYWN0aXZlSXRlbUluZGV4QnlJbmRleCA6ICRhY3RpdmVJdGVtSW5kZXhCeUNsYXNzLmxlbmd0aCA9PT0gMSA/ICRhY3RpdmVJdGVtSW5kZXhCeUNsYXNzIDogJGZpcnN0SXRlbTtcblxuICAkYWN0aXZlSXRlbUluZGV4QnlDbGFzcy5yZW1vdmVDbGFzcyggaXRlbUFjdGl2ZUNsYXNzTmFtZSApO1xuICAkYWN0aXZlSXRlbUluZGV4LmFkZENsYXNzKCBpdGVtQWN0aXZlQ2xhc3NOYW1lICk7XG4gIGxpc3QuX19hY3RpdmVJdGVtSW5kZXggPSAkaXRlbUNoaWxkcmVuLmluZGV4KCAkYWN0aXZlSXRlbUluZGV4ICk7XG5cbiAgaWYgKCBsaXN0Ll9fdmlzaWJsZSApIHtcbiAgICBsaXN0LmZpbHRlci5lbWl0KCBcIml0ZW1Gb2N1c1wiICk7XG4gIH1cbn07XG5cbmV4cG9ydHMuYm9keUNsaWNrID0gZnVuY3Rpb24gKCBfZXZlbnQgKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBidXR0b25DbGFzcyA9IFwiLlwiICsgZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWJ1dHRvblwiLFxuICAgIGNvbnRhaW5lckNsYXNzID0gXCIuXCIgKyBmaWx0ZXIuX19jb25maWcuY2xhc3NOYW1lICsgXCItY29udGFpbmVyXCIsXG4gICAgJGNsaWNrZWRFbGVtZW50ID0gJCggaGFzS2V5KCBfZXZlbnQsIFwidGFyZ2V0XCIgKSA/IF9ldmVudC50YXJnZXQgOiBudWxsICksXG4gICAgJHRoaXNQYXJlbnQgPSAkY2xpY2tlZEVsZW1lbnQuY2xvc2VzdCggXCJbZGF0YS1cIiArIGZpbHRlci5fX2NvbmZpZy5jbGFzc05hbWUgKyBcIi1jaWQ9XCIgKyBmaWx0ZXIuX19jaWQgKyBcIl1cIiApLFxuICAgIGNsaWNrZWRCdXR0b24gPSAkdGhpc1BhcmVudC5sZW5ndGggPiAwICYmICggJGNsaWNrZWRFbGVtZW50LmlzKCBidXR0b25DbGFzcyApIHx8ICRjbGlja2VkRWxlbWVudC5jbG9zZXN0KCBidXR0b25DbGFzcyApLmxlbmd0aCApID8gdHJ1ZSA6IGZhbHNlLFxuICAgIGNsaWNrZWRMaXN0ID0gJHRoaXNQYXJlbnQubGVuZ3RoID4gMCAmJiAoICRjbGlja2VkRWxlbWVudC5pcyggY29udGFpbmVyQ2xhc3MgKSB8fCAkY2xpY2tlZEVsZW1lbnQuY2xvc2VzdCggY29udGFpbmVyQ2xhc3MgKS5sZW5ndGggKSA/IHRydWUgOiBmYWxzZTtcblxuICBpZiAoIGNsaWNrZWRCdXR0b24gJiYgIWZpbHRlci5saXN0VmlzaWJsZSApIHtcbiAgICBmaWx0ZXIubGlzdFZpc2libGUgPSB0cnVlO1xuICB9IGVsc2UgaWYgKCBmaWx0ZXIubGlzdFZpc2libGUgJiYgIWNsaWNrZWRMaXN0ICkge1xuICAgIGZpbHRlci5saXN0VmlzaWJsZSA9IGZhbHNlO1xuICB9XG59O1xuXG5leHBvcnRzLmZpbHRlckNoYW5nZWQgPSBmdW5jdGlvbiAoIF9ldmVudCApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGtleUNvZGUgPSBoYXNLZXkoIF9ldmVudCwgXCJrZXlDb2RlXCIsIFwibnVtYmVyXCIgKSA/IF9ldmVudC5rZXlDb2RlIDogLTEsXG4gICAgdmFsID0gbGlzdC4kaW5wdXQudmFsKCk7XG5cbiAgc3dpdGNoICgga2V5Q29kZSApIHtcbiAgY2FzZSAyNzogLy8gZXNjYXBlXG4gICAgbGlzdC5jbG9zZSgpO1xuICAgIGJyZWFrO1xuICBjYXNlIDEzOiAvLyBlbnRlclxuICAgIGxpc3QuY2xvc2UoKTtcbiAgICBsaXN0LmZpbHRlci5hY3RpdmVJdGVtID0gbGlzdC5nZXRBY3RpdmVJdGVtKCk7XG4gICAgYnJlYWs7XG4gIGNhc2UgMzg6IC8vIHVwXG4gICAgbGlzdC5hY3RpdmVJdGVtSW5kZXgtLTtcbiAgICBicmVhaztcbiAgY2FzZSA0MDogLy8gZG93blxuICAgIGxpc3QuYWN0aXZlSXRlbUluZGV4Kys7XG4gICAgYnJlYWs7XG4gIGRlZmF1bHQ6XG4gICAgaWYgKCBrZXlDb2RlID49IDAgKSB7XG4gICAgICBsaXN0LmZpbHRlci5lbWl0KCBcImZpbHRlckNoYW5nZWRcIiwgdmFsICk7XG4gICAgICBsaXN0LmZpbHRlci5mZXRjaCgpO1xuICAgIH1cbiAgICBicmVhaztcbiAgfVxuXG59O1xuXG5leHBvcnRzLndpbmRvd0tleVVwID0gZnVuY3Rpb24gKCBfZXZlbnQgKSB7XG4gIHZhciBsaXN0ID0gdGhpcztcblxuICBpZiAoIGxpc3QuZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBrZXlDb2RlID0gaGFzS2V5KCBfZXZlbnQsIFwia2V5Q29kZVwiLCBcIm51bWJlclwiICkgPyBfZXZlbnQua2V5Q29kZSA6IC0xO1xuXG4gIHN3aXRjaCAoIGtleUNvZGUgKSB7XG4gIGNhc2UgMjc6IC8vIGVzY2FwZVxuICAgIGxpc3QuY2xvc2UoKTtcbiAgICBicmVhaztcbiAgfVxufTtcblxuZXhwb3J0cy5pdGVtQ2xpY2sgPSBmdW5jdGlvbiAoIF9ldmVudCApIHtcbiAgdmFyIGxpc3QgPSB0aGlzO1xuXG4gIGlmICggbGlzdC5maWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyICRpdGVtID0gJCggX2V2ZW50LmN1cnJlbnRUYXJnZXQgKTtcblxuICBsaXN0LmFjdGl2ZUl0ZW1JbmRleCA9ICRpdGVtLnBhcmVudCgpLmNoaWxkcmVuKCkuaW5kZXgoICRpdGVtICk7XG4gIGxpc3QuZmlsdGVyLmFjdGl2ZUl0ZW0gPSBsaXN0LmdldEFjdGl2ZUl0ZW0oKTtcbiAgbGlzdC5jbG9zZSgpO1xufTtcblxuZXhwb3J0cy5pdGVtcHVzaCA9IGZ1bmN0aW9uICggX2l0ZW0gKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBpdGVtSGFzaCA9IG1kNSggX2l0ZW0gKTtcblxuICBpZiAoICFmaWx0ZXIuX19pdGVtc1sgaXRlbUhhc2ggXSApIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoIF9pdGVtLCBcIl9fY2lkXCIsIHtcbiAgICAgIHZhbHVlOiBpdGVtSGFzaFxuICAgIH0gKTtcbiAgICBmaWx0ZXIuX19pdGVtc1sgaXRlbUhhc2ggXSA9IF9pdGVtO1xuICAgIGZpbHRlci5pdGVtcy5fX3B1c2goIF9pdGVtICk7XG4gICAgZmlsdGVyLmxpc3QucmVkcmF3KCk7XG4gIH1cblxufTtcblxuZXhwb3J0cy5pdGVtc2hpZnQgPSBmdW5jdGlvbiAoIF9pdGVtICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgaXRlbUhhc2ggPSBtZDUoIF9pdGVtICk7XG4gIGRlbGV0ZSBmaWx0ZXIuX19pdGVtc1sgaXRlbUhhc2ggXTtcbiAgZmlsdGVyLml0ZW1zLl9fc2hpZnQoKTtcbn07XG5cbmV4cG9ydHMubGFiZWxHZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBmaWx0ZXIuX19sYWJlbDtcbn07XG5cbmV4cG9ydHMubGFiZWxTZXQgPSBmdW5jdGlvbiAoIF9sYWJlbCApIHtcbiAgdmFyIGZpbHRlciA9IHRoaXM7XG5cbiAgaWYgKCBmaWx0ZXIuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgZmlsdGVyLl9fbGFiZWwgPSBjYXN0KCBfbGFiZWwsIFwic3RyaW5nXCIsIGZpbHRlci5fX2NvbmZpZy5kZWZhdWx0cy5kZWZhdWx0QnV0dG9uTGFiZWwgKTtcbiAgZmlsdGVyLiRlbC50ZXh0KCBmaWx0ZXIuX19sYWJlbCApO1xuICByZXR1cm4gZmlsdGVyLl9fbGFiZWw7XG59O1xuXG5leHBvcnRzLmxpc3RWaXNpYmxlR2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gZmlsdGVyLmxpc3QuX192aXNpYmxlO1xufTtcblxuZXhwb3J0cy5saXN0VmlzaWJsZVNldCA9IGZ1bmN0aW9uICggX3ZhbHVlICkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgdmlzaWJsZSA9IGNhc3QoIF92YWx1ZSwgXCJib29sZWFuXCIsIGZhbHNlICk7XG4gIHJldHVybiB2aXNpYmxlID8gZmlsdGVyLmxpc3Qub3BlbigpIDogZmlsdGVyLmxpc3QuY2xvc2UoKTtcbn07XG5cbmV4cG9ydHMucHV0Rm9jdXNzZWRJdGVtSW5WaWV3ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZXRUaW1lb3V0KCBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxpc3RIZWlnaHQgPSBsaXN0LiRsaXN0LmhlaWdodCgpLFxuICAgICAgZm9jdXNzZWRJdGVtID0gbGlzdC4kbGlzdC5maW5kKCBcIi5cIiArIGxpc3QuZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLWl0ZW0tYWN0aXZlXCIgKTtcblxuICAgIGlmICggZm9jdXNzZWRJdGVtLmxlbmd0aCA9PT0gMCApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgaXRlbUhlaWdodCA9IGZvY3Vzc2VkSXRlbS5vdXRlckhlaWdodCgpLFxuICAgICAgaXRlbVRvcCA9IGZvY3Vzc2VkSXRlbS5wb3NpdGlvbigpLnRvcCwgLy8gVE9ETzogb2Zmc2V0IHRvcCBjb3VsZCBiZSBnb29kIGVub3VnaCBoZXJlXG4gICAgICBpdGVtQm90dG9tID0gaXRlbVRvcCArIGl0ZW1IZWlnaHQ7XG5cbiAgICBpZiAoIGl0ZW1Ub3AgPCAwIHx8IGl0ZW1Cb3R0b20gPiBsaXN0SGVpZ2h0ICkge1xuICAgICAgZm9jdXNzZWRJdGVtWyAwIF0uc2Nyb2xsSW50b1ZpZXcoIGl0ZW1Ub3AgPCAwICk7XG4gICAgfVxuXG4gIH0sIDEwICk7XG59O1xuXG5leHBvcnRzLnNvcnRHZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJldHVybiBmaWx0ZXIuX19zb3J0O1xufTtcblxuZXhwb3J0cy5zb3J0U2V0ID0gZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzb3J0Q2xhc3NOYW1lID0gZmlsdGVyLl9fY29uZmlnLmNsYXNzTmFtZSArIFwiLXNvcnQtXCIsXG4gICAgc29ydENsYXNzTmFtZXMgPSBzb3J0VG9nZ2xlT3B0aW9ucy5qb2luKCBcIiBcIiArIHNvcnRDbGFzc05hbWUgKS50cmltKCk7XG5cbiAgZmlsdGVyLl9fc29ydCA9IGNhc3QoIF92YWx1ZSwgXCJzdHJpbmdcIiwgbnVsbCwgc29ydFRvZ2dsZU9wdGlvbnMgKTtcbiAgZmlsdGVyLmxpc3QucmVkcmF3KCk7XG4gIGZpbHRlci4kd3JhcHBlci5yZW1vdmVDbGFzcyggc29ydENsYXNzTmFtZXMgKS5hZGRDbGFzcyggZmlsdGVyLl9fc29ydCA/IHNvcnRDbGFzc05hbWUgKyBmaWx0ZXIuX19zb3J0IDogXCJcIiApO1xuICBmaWx0ZXIuZW1pdCggXCJzb3J0XCIgKTtcbiAgcmV0dXJuIGZpbHRlci5fX3NvcnQ7XG59O1xuXG5leHBvcnRzLnNvcnRUb2dnbGVDbGlja2VkID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbGlzdCA9IHRoaXM7XG5cbiAgaWYgKCBsaXN0LmZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZmlsdGVyID0gbGlzdC5maWx0ZXIsXG4gICAgY3VycmVudFNvcnQgPSBmaWx0ZXIuc29ydCxcbiAgICBpbmRleCA9IF8uaW5kZXhPZiggc29ydFRvZ2dsZU9wdGlvbnMsIGN1cnJlbnRTb3J0ICksXG4gICAgbmV4dEluZGV4ID0gaW5kZXggKyAxLFxuICAgIG5leHRTb3J0ID0gc29ydFRvZ2dsZU9wdGlvbnNbIG5leHRJbmRleCBdID09PSB1bmRlZmluZWQgPyBzb3J0VG9nZ2xlT3B0aW9uc1sgMCBdIDogc29ydFRvZ2dsZU9wdGlvbnNbIG5leHRJbmRleCBdO1xuXG4gIGZpbHRlci5zb3J0ID0gbmV4dFNvcnQ7XG59O1xuXG5leHBvcnRzLnZhbHVlR2V0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgZmlsdGVyID0gdGhpcztcblxuICBpZiAoIGZpbHRlci5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICByZXR1cm4gZmlsdGVyLl9fdmFsdWUudmFsdWU7XG59O1xuXG5leHBvcnRzLnZhbHVlU2V0ID0gZnVuY3Rpb24gKCBfdmFsdWUgKSB7XG4gIHZhciBmaWx0ZXIgPSB0aGlzO1xuXG4gIGlmICggZmlsdGVyLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGZpbHRlci5fX3ZhbHVlID0gbmV3IEl0ZW1WYWx1ZSggZmlsdGVyLl9fY29uZmlnLmRlZmF1bHRzLml0ZW1MYWJlbEtleSwgX3ZhbHVlICk7XG4gIGZpbHRlci5sYWJlbCA9IGZpbHRlci5fX3ZhbHVlLmtleTtcbiAgZmlsdGVyLiRlbC50ZXh0KCBmaWx0ZXIubGFiZWwgKTtcbiAgcmV0dXJuIGZpbHRlci5fX3ZhbHVlO1xufTsiLCJ2YXIgaGFzS2V5ID0gcmVxdWlyZSggXCJzYy1oYXNrZXlcIiApO1xuXG52YXIgSXRlbVZhbHVlID0gZnVuY3Rpb24gKCBfa2V5LCBfdmFsdWUgKSB7XG4gIHZhciB2YWx1ZSA9IHt9O1xuICB2YWx1ZS5rZXkgPSBoYXNLZXkoIF92YWx1ZSwgX2tleSwgXCJzdHJpbmdcIiApID8gX3ZhbHVlWyBfa2V5IF0gOiBcIlwiO1xuICB2YWx1ZS52YWx1ZSA9IF92YWx1ZTtcbiAgcmV0dXJuIHZhbHVlO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBJdGVtVmFsdWU7IiwidmFyIGNhc3QgPSByZXF1aXJlKCBcInNjLWNhc3RcIiApLFxuICBoZWxwZXJzID0gcmVxdWlyZSggXCIuL2hlbHBlcnNcIiApLFxuICBtZXJnZSA9IHJlcXVpcmUoIFwic2MtbWVyZ2VcIiApLFxuICBmdXp6eSA9IHJlcXVpcmUoIFwiZnV6emFsZHJpblwiICk7XG5cbnZhciBMaXN0ID0gZnVuY3Rpb24gKCBfZmlsdGVyICkge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgY29uZmlnO1xuXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKCBzZWxmLCB7XG4gICAgXCJfX2FjdGl2ZUl0ZW1JbmRleFwiOiB7XG4gICAgICB2YWx1ZTogMCxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fZGVzdHJveWVkXCI6IHtcbiAgICAgIHZhbHVlOiBmYWxzZSxcbiAgICAgIHdyaXRhYmxlOiB0cnVlXG4gICAgfSxcbiAgICBcIl9fdGVtcGxhdGVzXCI6IHtcbiAgICAgIHZhbHVlOiB7fVxuICAgIH0sXG4gICAgXCJfX3Zpc2libGVcIjoge1xuICAgICAgdmFsdWU6IGZhbHNlLFxuICAgICAgd3JpdGFibGU6IHRydWVcbiAgICB9LFxuICAgIFwiYWN0aXZlSXRlbUluZGV4XCI6IHtcbiAgICAgIGdldDogaGVscGVycy5hY3RpdmVJdGVtSW5kZXhHZXQuYmluZCggc2VsZiApLFxuICAgICAgc2V0OiBoZWxwZXJzLmFjdGl2ZUl0ZW1JbmRleFNldC5iaW5kKCBzZWxmIClcbiAgICB9LFxuICAgIFwiZmlsdGVyXCI6IHtcbiAgICAgIHZhbHVlOiBfZmlsdGVyXG4gICAgfVxuICB9ICk7XG5cbiAgY29uZmlnID0gc2VsZi5maWx0ZXIuX19jb25maWc7XG5cbiAgT2JqZWN0LmtleXMoIGNvbmZpZy50ZW1wbGF0ZXMgKS5mb3JFYWNoKCBmdW5jdGlvbiAoIF90ZW1wbGF0ZU5hbWUgKSB7XG4gICAgc2VsZi5fX3RlbXBsYXRlc1sgX3RlbXBsYXRlTmFtZSBdID0gXy50ZW1wbGF0ZSggY29uZmlnLnRlbXBsYXRlc1sgX3RlbXBsYXRlTmFtZSBdLCB7XG4gICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgIGNpZDogXCJcIixcbiAgICAgIGtleTogXCJcIlxuICAgIH0gKTtcbiAgfSApO1xuXG4gIHNlbGYuJGVsID0gJCggXy50ZW1wbGF0ZSggc2VsZi5fX3RlbXBsYXRlcy5saXN0V3JhcHBlciwge1xuICAgIGNvbmZpZzogbWVyZ2UoIGNvbmZpZywge1xuICAgICAgdGVtcGxhdGVzOiBzZWxmLl9fdGVtcGxhdGVzXG4gICAgfSApXG4gIH0gKSApO1xuXG4gIHNlbGYuJGlucHV0ID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaW5wdXRcIiApO1xuICBzZWxmLiRoZWFkZXIgPSBzZWxmLiRlbC5maW5kKCBcIi5cIiArIGNvbmZpZy5jbGFzc05hbWUgKyBcIi1oZWFkZXJcIiApO1xuICBzZWxmLiRsaXN0ID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaXRlbXNcIiApO1xuICBzZWxmLiRzb3J0VG9nZ2xlID0gc2VsZi4kZWwuZmluZCggXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItc29ydC10b2dnbGVcIiApO1xuXG4gIHNlbGYuJGlucHV0Lm9uKCBcImNoYW5nZS5cIiArIGNvbmZpZy5uYW1lICsgXCIga2V5ZG93bi5cIiArIGNvbmZpZy5uYW1lLCBoZWxwZXJzLmZpbHRlckNoYW5nZWQuYmluZCggc2VsZiApICk7XG4gIHNlbGYuJHNvcnRUb2dnbGUub24oIFwiY2xpY2suXCIgKyBjb25maWcubmFtZSwgaGVscGVycy5zb3J0VG9nZ2xlQ2xpY2tlZC5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5maWx0ZXIub24oIFwiZmlsdGVyQ2hhbmdlZFwiLCBzZWxmLnJlZHJhdy5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5maWx0ZXIub24oIFwiaXRlbUZvY3VzXCIsIGhlbHBlcnMucHV0Rm9jdXNzZWRJdGVtSW5WaWV3LmJpbmQoIHNlbGYgKSApO1xuICBzZWxmLmZpbHRlci4kZWwuYWZ0ZXIoIHNlbGYuJGVsICk7XG59O1xuXG5MaXN0LnByb3RvdHlwZS5jbG9zZSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBzZWxmLl9fdmlzaWJsZSA9IGZhbHNlO1xuICBzZWxmLiRlbC5yZW1vdmVDbGFzcyggY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lci12aXNpYmxlXCIgKTtcbiAgc2VsZi5maWx0ZXIuZW1pdCggXCJjbG9zZVwiICk7XG4gICQoIHdpbmRvdyApLm9mZiggXCJrZXl1cC5cIiArIGNvbmZpZy5uYW1lICk7XG4gIHNlbGYuJGVsLm9mZiggXCJjbGljay5cIiArIGNvbmZpZy5uYW1lICk7XG4gIHJldHVybiBzZWxmLl9fdmlzaWJsZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjb25maWcgPSBzZWxmLmZpbHRlci5fX2NvbmZpZztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgc2VsZi5maWx0ZXIuX19kZXN0cm95ZWQgPSBzZWxmLl9fZGVzdHJveWVkID0gdHJ1ZTtcbiAgJCggd2luZG93ICkub2ZmKCBcIi5cIiArIGNvbmZpZy5uYW1lICk7XG4gIHNlbGYuJGlucHV0Lm9mZiggXCIuXCIgKyBjb25maWcubmFtZSApO1xuICBzZWxmLiRlbC5vZmYoIFwiLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgc2VsZi4kc29ydFRvZ2dsZS5vZmYoIFwiLlwiICsgY29uZmlnLm5hbWUgKTtcbiAgc2VsZi5maWx0ZXIub2ZmKCBcImZpbHRlckNoYW5nZWRcIiApO1xuICBzZWxmLmZpbHRlci5vZmYoIFwiaXRlbUZvY3VzXCIgKTtcbiAgc2VsZi4kZWwucmVtb3ZlKCk7XG5cbn07XG5cbkxpc3QucHJvdG90eXBlLmdldEFjdGl2ZUl0ZW0gPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBzZWxmID0gdGhpcyxcbiAgICBjb25maWcgPSBzZWxmLmZpbHRlci5fX2NvbmZpZztcblxuICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyICRzZWxlY3RlZEl0ZW0gPSBzZWxmLiRsaXN0LmZpbmQoIFwiLlwiICsgY29uZmlnLmNsYXNzTmFtZSArIFwiLWl0ZW0tYWN0aXZlXCIgKSxcbiAgICBzZWxlY3RlZEl0ZW1IYXNoID0gJHNlbGVjdGVkSXRlbS5kYXRhKCBcImNpZFwiICksXG4gICAgc2VsZWN0ZWRJdGVtID0gc2VsZi5maWx0ZXIuX19pdGVtc1sgc2VsZWN0ZWRJdGVtSGFzaCBdO1xuXG4gIHJldHVybiBzZWxlY3RlZEl0ZW07XG59O1xuXG5MaXN0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24gKCkge1xuICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgY29uZmlnID0gc2VsZi5maWx0ZXIuX19jb25maWc7XG5cbiAgaWYgKCBzZWxmLl9fZGVzdHJveWVkICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHNlbGYuX192aXNpYmxlID0gdHJ1ZTtcbiAgc2VsZi5maWx0ZXIuZW1pdCggXCJvcGVuXCIgKTtcbiAgJCggd2luZG93ICkub24oIFwia2V5dXAuXCIgKyBjb25maWcubmFtZSwgaGVscGVycy53aW5kb3dLZXlVcC5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi4kZWwub24oIFwiY2xpY2suXCIgKyBjb25maWcubmFtZSwgXCIuXCIgKyBjb25maWcuY2xhc3NOYW1lICsgXCItaXRlbVwiLCBoZWxwZXJzLml0ZW1DbGljay5iaW5kKCBzZWxmICkgKTtcbiAgc2VsZi5yZWRyYXcoKTtcblxuICBzZWxmLmZpbHRlci5vbmNlKCBcInJlZHJhd1wiLCBmdW5jdGlvbiAoKSB7XG4gICAgc2VsZi4kaW5wdXQuZm9jdXMoKS5zZWxlY3QoKTtcbiAgfSApO1xuXG4gIHJldHVybiBzZWxmLl9fdmlzaWJsZTtcbn07XG5cbkxpc3QucHJvdG90eXBlLnJlZHJhdyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHNlbGYgPSB0aGlzLFxuICAgIGNvbmZpZyA9IHNlbGYuZmlsdGVyLl9fY29uZmlnO1xuXG4gIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIHNlbGYucmVkcmF3VGltZW91dCApIHtcbiAgICBjbGVhclRpbWVvdXQoIHNlbGYucmVkcmF3VGltZW91dCApO1xuICAgIHJldHVybiBzZWxmLnJlZHJhd1RpbWVvdXQgPSBudWxsO1xuICB9XG5cbiAgc2VsZi5yZWRyYXdUaW1lb3V0ID0gc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuICAgIHNlbGYucmVkcmF3VGltZW91dCA9IG51bGw7XG5cbiAgICBpZiAoIHNlbGYuX19kZXN0cm95ZWQgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGZpbHRlckJ5ID0gc2VsZi4kaW5wdXQudmFsKCksXG4gICAgICBpdGVtc01hcmt1cCA9IFwiXCIsXG4gICAgICByZXN1bHRzID0gZnV6enkuZmlsdGVyKCBzZWxmLmZpbHRlci5pdGVtcywgZmlsdGVyQnkgfHwgXCJcIiwge1xuICAgICAgICBrZXk6IGNvbmZpZy5kZWZhdWx0cy5pdGVtTGFiZWxLZXksXG4gICAgICAgIG1heFJlc3VsdHM6IHNlbGYuZmlsdGVyLl9fY29uZmlnLmRlZmF1bHRzLm1heE51bUl0ZW1zXG4gICAgICB9ICk7XG5cbiAgICBpZiAoIHNlbGYuZmlsdGVyLl9fc29ydCApIHtcbiAgICAgIHJlc3VsdHMuc29ydCggZnVuY3Rpb24gKCBhLCBiICkge1xuICAgICAgICB2YXIgb3JkZXIgPSBzZWxmLmZpbHRlci5fX3NvcnQgPT09IFwiZGVzY1wiID8gYS5uYW1lID4gYi5uYW1lIDogYS5uYW1lIDwgYi5uYW1lO1xuICAgICAgICByZXR1cm4gb3JkZXIgPyAxIDogLTE7XG4gICAgICB9ICk7XG4gICAgfVxuXG4gICAgc2VsZi5maWx0ZXIucmVzdWx0cyA9IHJlc3VsdHM7XG5cbiAgICBzZWxmLmZpbHRlci5lbWl0KCBcImZpbHRlcmVkXCIgKTtcblxuICAgIHJlc3VsdHMuZm9yRWFjaCggZnVuY3Rpb24gKCBfaXRlbSApIHtcbiAgICAgIF9pdGVtLmtleSA9IF9pdGVtWyBjb25maWcuZGVmYXVsdHMuaXRlbUxhYmVsS2V5IF07XG4gICAgICBpdGVtc01hcmt1cCArPSBfLnRlbXBsYXRlKCBjb25maWcudGVtcGxhdGVzLmxpc3RJdGVtLCBtZXJnZSgge1xuICAgICAgICBjb25maWc6IGNvbmZpZyxcbiAgICAgICAgY2lkOiBfaXRlbS5fX2NpZFxuICAgICAgfSwgX2l0ZW0gKSApO1xuICAgIH0gKTtcblxuICAgIHNlbGYuJGxpc3QuZW1wdHkoKS5odG1sKCBpdGVtc01hcmt1cCApO1xuICAgIHNlbGYuYWN0aXZlSXRlbUluZGV4ID0gc2VsZi5hY3RpdmVJdGVtSW5kZXg7XG5cbiAgICBpZiAoIHNlbGYuX192aXNpYmxlICkge1xuICAgICAgc2V0VGltZW91dCggZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGlmICggc2VsZi5fX2Rlc3Ryb3llZCApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdmlzaWJsZUl0ZW1zSGVpZ2h0ID0gMDtcbiAgICAgICAgc2VsZi4kZWwuYWRkQ2xhc3MoIGNvbmZpZy5jbGFzc05hbWUgKyBcIi1jb250YWluZXItaW52aXNpYmxlXCIgKTtcblxuICAgICAgICBzZWxmLiRsaXN0LmZpbmQoIFwiPjpsdChcIiArIHNlbGYuZmlsdGVyLl9fY29uZmlnLmRlZmF1bHRzLm1heE51bUl0ZW1zVmlzaWJsZSArIFwiKVwiICkuZWFjaCggZnVuY3Rpb24gKCBfaSwgX2VsICkge1xuICAgICAgICAgIHZpc2libGVJdGVtc0hlaWdodCArPSAkKCBfZWwgKS5vdXRlckhlaWdodCgpO1xuICAgICAgICB9ICk7XG5cbiAgICAgICAgc2VsZi4kbGlzdC5oZWlnaHQoIHZpc2libGVJdGVtc0hlaWdodCApO1xuICAgICAgICBzZWxmLiRlbC5hZGRDbGFzcyggY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lci12aXNpYmxlXCIgKS5yZW1vdmVDbGFzcyggY29uZmlnLmNsYXNzTmFtZSArIFwiLWNvbnRhaW5lci1pbnZpc2libGVcIiApO1xuICAgICAgICBzZWxmLmZpbHRlci5lbWl0KCBcInJlZHJhd1wiICk7XG4gICAgICB9LCAwICk7XG5cbiAgICB9XG5cbiAgfSwgMCApO1xuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpc3Q7Il19
(22)
});
