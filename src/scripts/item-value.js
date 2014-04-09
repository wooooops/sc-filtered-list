var hasKey = require( "sc-haskey" );

var ItemValue = function ( _key, _value ) {
  var value = {};
  value.key = hasKey( _value, _key, "string" ) ? _value[ _key ] : "";
  value.value = _value;
  return value;
};

module.exports = ItemValue;