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
(function(root, factory){
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    define(function(){
      return factory(root);
    });
  } else if (typeof module == 'object' && module && module.exports) {
    module.exports = factory(root);
  } else {
    root.Levenshtein = factory(root);
  }
}(this, function(root){

  function forEach( array, fn ) { var i, length
    i = -1
    length = array.length
    while ( ++i < length )
      fn( array[ i ], i, array )
  }

  function map( array, fn ) { var result
    result = Array( array.length )
    forEach( array, function ( val, i, array ) {
      result.push( fn( val, i, array ) )
    })
    return result
  }

  function reduce( array, fn, accumulator ) {
    forEach( array, function( val, i, array ) {
      accumulator = fn( val, i, array )
    })
    return accumulator
  }

  // Levenshtein distance
  function Levenshtein( str_m, str_n ) { var previous, current, matrix
    // Constructor
    matrix = this._matrix = []

    // Sanity checks
    if ( str_m == str_n )
      return this.distance = 0
    else if ( str_m == '' )
      return this.distance = str_n.length
    else if ( str_n == '' )
      return this.distance = str_m.length
    else {
      // Danger Will Robinson
      previous = [ 0 ]
      forEach( str_m, function( v, i ) { i++, previous[ i ] = i } )

      matrix[0] = previous
      forEach( str_n, function( n_val, n_idx ) {
        current = [ ++n_idx ]
        forEach( str_m, function( m_val, m_idx ) {
          m_idx++
          if ( str_m.charAt( m_idx - 1 ) == str_n.charAt( n_idx - 1 ) )
            current[ m_idx ] = previous[ m_idx - 1 ]
          else
            current[ m_idx ] = Math.min
              ( previous[ m_idx ]     + 1   // Deletion
              , current[  m_idx - 1 ] + 1   // Insertion
              , previous[ m_idx - 1 ] + 1   // Subtraction
              )
        })
        previous = current
        matrix[ matrix.length ] = previous
      })

      return this.distance = current[ current.length - 1 ]
    }
  }

  Levenshtein.prototype.toString = Levenshtein.prototype.inspect = function inspect ( no_print ) { var matrix, max, buff, sep, rows
    matrix = this.getMatrix()
    max = reduce( matrix,function( m, o ) {
      return Math.max( m, reduce( o, Math.max, 0 ) )
    }, 0 )
    buff = Array( ( max + '' ).length ).join( ' ' )

    sep = []
    while ( sep.length < (matrix[0] && matrix[0].length || 0) )
      sep[ sep.length ] = Array( buff.length + 1 ).join( '-' )
    sep = sep.join( '-+' ) + '-'

    rows = map( matrix, function( row ) { var cells
      cells = map( row, function( cell ) {
        return ( buff + cell ).slice( - buff.length )
      })
      return cells.join( ' |' ) + ' '
    })

    return rows.join( "\n" + sep + "\n" )
  }

  Levenshtein.prototype.getMatrix = function () {
    return this._matrix.slice()
  }

  Levenshtein.prototype.valueOf = function() {
    return this.distance
  }

  return Levenshtein

}));

},{}],3:[function(_dereq_,module,exports){
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
},{}],4:[function(_dereq_,module,exports){
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
},{"sc-contains":5,"sc-is":8}],5:[function(_dereq_,module,exports){
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
},{}],6:[function(_dereq_,module,exports){
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
},{"type-component":7}],7:[function(_dereq_,module,exports){

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
},{"../type":14}],10:[function(_dereq_,module,exports){
var guid = _dereq_( "sc-guid" );

module.exports = function ( value ) {
  return guid.isValid( value );
};
},{"sc-guid":13}],11:[function(_dereq_,module,exports){
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
},{"../type":14}],13:[function(_dereq_,module,exports){
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
},{}],14:[function(_dereq_,module,exports){
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
},{}],15:[function(_dereq_,module,exports){
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
},{"md5-component":3}],16:[function(_dereq_,module,exports){
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
module.exports=_dereq_(7)
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
    "maxNumItemsVisible": 7,
    "maxNumItems": 10,
    "throttleFetch": 500,
    "sortControlVisible": true,
    "dataSource": [],
    "defaultButtonLabel": "Choose one",
    "defalutListTitle": "Select an item"
  },
  "templates": {
    "listWrapper": "<div class='<%= config.className %> <%= config.className %>-list'><%= config.templates.listInput %><%= config.templates.listHeader %><%= config.templates.listItemWrapper %></div>",
    "listInput": "<div class='<%= config.className %>-list-input'><input type='text'></div>",
    "listHeader": "<header class='<%= config.className %>-list-header'><%= config.defaults.defalutListTitle %></header>",
    "listItemWrapper": "<ul class='<%= config.className %>-list-item-wrapper'></ul>",
    "listItem": "<li class='<%= config.className %>-list-item' data-cid='<%= cid %>'><%= name %></li>"
  }
}
},{}],20:[function(_dereq_,module,exports){
/**
 * Dependencies
 * - jQuery
 * - underscore
 */

( function ( $, _ ) {

  var cast = _dereq_( "sc-cast" ),
    config = _dereq_( "./config.json" ),
    emitter = _dereq_( "emitter-component" ),
    hasKey = _dereq_( "sc-haskey" ),
    helpers = _dereq_( "./helpers" ),
    is = _dereq_( "sc-is" ),
    ItemValue = _dereq_( "./item-value" ),
    List = _dereq_( "./list" ),
    observableArray = _dereq_( "sg-observable-array" );

  var FilteredList = function ( _el, _options ) {
    var self = this;

    self.$el = $( _el );

    if ( self.$el.length === 0 ) {
      throw new Error( "An invalid DOM element was given" );
    }

    Object.defineProperties( self, {
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
      "__options": {
        value: $.extend( FilteredList.defaults, self.$el.data( config.className + "-options" ), _options )
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
        value: new List( self )
      },
      "listVisible": {
        get: helpers.listVisibleGet.bind( self ),
        set: helpers.listVisibleSet.bind( self )
      },
      "value": {
        get: helpers.valueGet.bind( self ),
        set: helpers.valueSet.bind( self )
      }
    } );

    self.value = {
      key: is.not.empty( self.$el.text() ) ? self.$el.text() : config.defaults.defaultButtonLabel
    };

    self.$el
      .addClass( config.className )
      .addClass( config.className + "-button" )
      .on( "click", self.click.bind( self ) )
      .data( config.name, self )
      .trigger( config.name + "-ready" );

    [ "push", "shift" ].forEach( function ( _method ) {
        self.items.on( _method, helpers[ "item" + _method ].bind( self ) );
      } );

    $( window ).on( "click", helpers.bodyClick.bind( self ) );

    self.fetch();
  };

  FilteredList.prototype.click = function () {
    var self = this,
      args = Array.prototype.slice.call( arguments );

  };

  FilteredList.prototype.destroy = function () {
    var self = this;
    self.emit( "destroy" );
  };

  FilteredList.prototype.fetch = function () {
    var self = this;

    if ( !self.throttledFetch ) {
      self.throttledFetch = _.throttle( function () {
        var value = self.list.$input.val();

        self.__lastFetchedValue = value;
        self.emit( "fetch", self.__lastFetchedValue );
      }, self.__options.throttleFetch );
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

} )( jQuery, _ );
},{"./config.json":19,"./helpers":21,"./item-value":22,"./list":23,"emitter-component":1,"sc-cast":4,"sc-haskey":6,"sc-is":8,"sg-observable-array":18}],21:[function(_dereq_,module,exports){
var cast = _dereq_( "sc-cast" ),
  config = _dereq_( "./config.json" ),
  hasKey = _dereq_( "sc-haskey" ),
  ItemValue = _dereq_( "./item-value" ),
  md5 = _dereq_( "sc-md5" );

exports.activeItemGet = function () {
  var filter = this;
  return filter.list.getActiveItem();
};

exports.activeItemSet = function ( _value ) {
  var filter = this;
  filter.$el.html( _value.name );
  filter.emit( "change", _value );
};

exports.activeItemIndexGet = function () {
  var list = this;
  return list.__activeItemIndex;
};

exports.activeItemIndexSet = function ( _value ) {
  var list = this,
    index = cast( _value, "number", 0 ),
    itemActiveClassName = config.className + "-list-item-active",
    $itemChildren = list.$list.children(),
    $firstItem = $( $itemChildren[ 0 ] ),
    $activeItemIndexByClass = list.$list.find( "." + itemActiveClassName ),
    $activeItemIndexByIndex = $( $itemChildren[ index ] ),
    $activeItemIndex = $activeItemIndexByIndex.length === 1 ? $activeItemIndexByIndex : $activeItemIndexByClass.length === 1 ? $activeItemIndexByClass : $firstItem;

  $activeItemIndexByClass.removeClass( itemActiveClassName );
  $activeItemIndex.addClass( itemActiveClassName );

  list.__activeItemIndex = $itemChildren.index( $activeItemIndex );
};

exports.bodyClick = function ( _event ) {
  var filter = this,
    clickedElement = $( hasKey( _event, "toElement" ) ? _event.toElement : null ),
    $clickedElement = clickedElement.length > 0 ? clickedElement : null,
    clickedButton = $clickedElement.closest( "." + config.className + "-button" ).length > 0,
    clickedList = $clickedElement.closest( "." + config.className + "-list" ).length > 0,
    args = Array.prototype.slice.call( arguments );


  if ( clickedButton && !filter.listVisible ) {
    filter.listVisible = true;
  } else if ( filter.listVisible && !clickedList ) {
    filter.listVisible = false;
  }
};

exports.filterChanged = function ( _event ) {
  var list = this,
    keyCode = hasKey( _event, "keyCode", "number" ) ? _event.keyCode : -1,
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
  var list = this,
    keyCode = hasKey( _event, "keyCode", "number" ) ? _event.keyCode : -1;

  switch ( keyCode ) {
  case 27: // escape
    list.close();
    break;
  }
};

exports.itemClick = function ( _event ) {
  var list = this,
    $item = $( _event.currentTarget );

  list.activeItemIndex = $item.parent().children().index( $item );
  list.filter.activeItem = list.getActiveItem();
  list.close();

};

exports.itempush = function ( _item ) {
  var filter = this,
    itemHash = md5( _item );

  // TODO: limit num items push
  // TODO: check if the data is in the list before adding it

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
  var filter = this,
    itemHash = md5( _item );
  delete filter.__items[ itemHash ];
  filter.items.__shift();
};

exports.labelGet = function () {
  var filter = this;
  return filter.__label;
};

exports.labelSet = function ( _label ) {
  var filter = this;
  filter.__label = cast( _label, "string", config.defaultButtonLabel );
  filter.$el.text( filter.__label );
  return filter.__label;
};

exports.listVisibleGet = function () {
  var filter = this;
  return filter.list.__visible;
};

exports.listVisibleSet = function ( _value ) {
  var filter = this,
    visible = cast( _value, "boolean", false );
  return visible ? filter.list.open() : filter.list.close();
};

exports.valueGet = function () {
  var filter = this;
  return filter.__value;
};

exports.valueSet = function ( _value ) {
  var filter = this;
  filter.__value = new ItemValue( _value );
  filter.label = filter.__value.key;
  filter.$el.text( filter.label );
  return filter.__value;
};
},{"./config.json":19,"./item-value":22,"sc-cast":4,"sc-haskey":6,"sc-md5":15}],22:[function(_dereq_,module,exports){
var hasKey = _dereq_( "sc-haskey" );

var ItemValue = function ( _value ) {
  var value = {};
  value.key = hasKey( _value, "key", "string" ) ? _value.key : "";
  value.value = hasKey( _value, "value" ) ? _value.value : "";
  return value;
};

module.exports = ItemValue;
},{"sc-haskey":6}],23:[function(_dereq_,module,exports){
( function ( $, _ ) {

  var cast = _dereq_( "sc-cast" ),
    config = _dereq_( "./config.json" ),
    helpers = _dereq_( "./helpers" ),
    merge = _dereq_( "sc-merge" ),
    Levenshtein = _dereq_( "levenshtein" );

  var List = function ( _filter ) {
    var self = this;

    Object.defineProperties( self, {
      "__activeItemIndex": {
        value: 0,
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

    Object.keys( config.templates ).forEach( function ( _templateName ) {
      self.__templates[ _templateName ] = _.template( config.templates[ _templateName ], {
        config: config,
        cid: ""
      } );
    } );

    self.$el = $( _.template( self.__templates.listWrapper, {
      config: merge( config, {
        templates: self.__templates
      } )
    } ) );

    self.$input = self.$el.find( "." + config.className + "-list-input input" );
    self.$header = self.$el.find( "." + config.className + "-list-header" );
    self.$list = self.$el.find( "." + config.className + "-list-item-wrapper" );

    self.$input.on( "change keydown", helpers.filterChanged.bind( self ) );
    self.filter.on( "filterChanged", self.redraw.bind( self ) );
    self.filter.$el.after( self.$el );

    window.Levenshtein = Levenshtein;

  };

  List.prototype.close = function () {
    var self = this;
    self.__visible = false;
    self.$el.removeClass( config.className + "-visible" );
    self.filter.emit( "close" );
    $( window ).off( "keyup." + config.name );
    self.$el.off( "click." + config.name );
    return self.__visible;
  };

  List.prototype.getActiveItem = function () {
    var self = this,
      $selectedItem = self.$list.find( "." + config.className + "-list-item-active" ),
      selectedItemHash = $selectedItem.data( "cid" ),
      selectedItem = self.filter.__items[ selectedItemHash ];

    return selectedItem;
  };

  List.prototype.open = function () {
    var self = this;
    self.__visible = true;
    self.redraw();
    self.$el.addClass( config.className + "-visible" );
    self.$input.focus();
    self.filter.emit( "open" );
    $( window ).on( "keyup." + config.name, helpers.windowKeyUp.bind( self ) );
    self.$el.on( "click." + config.name, "." + config.className + "-list-item", helpers.itemClick.bind( self ) );
    return self.__visible;
  };

  List.prototype.redraw = function () {
    var self = this;

    setTimeout( function () {
      var filterBy = self.$input.val(),
        numVisibleItems = 0,
        itemsMarkup = "";

      self.filter.items.forEach( function ( _item ) {
        if ( numVisibleItems < self.filter.__options.maxNumItems ) {

          // var rx = new RegExp( filterBy, "i" ),
          //   matched = rx.test( _item.name );

          var match = new Levenshtein( _item.name, filterBy ),
            matched = match.distance < 3;

          // console.log( match );

          if ( matched ) {
            itemsMarkup += _.template( config.templates.listItem, merge( {
              config: config,
              cid: _item.__cid
            }, _item ) );
            numVisibleItems++;
          }

        }
      } );

      self.$list.empty().html( itemsMarkup );
      self.activeItemIndex = self.activeItemIndex;
    }, 0 );

  };

  module.exports = List;

} )( jQuery, _ );
},{"./config.json":19,"./helpers":21,"levenshtein":2,"sc-cast":4,"sc-merge":16}]},{},[20])
(20)
});