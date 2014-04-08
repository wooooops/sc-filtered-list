var hasKey = require( "sc-haskey" );

var ItemValue = function ( _value ) {
  var value = {};
  value.key = hasKey( _value, "key", "string" ) ? _value.key : "";
  value.value = hasKey( _value, "value" ) ? _value.value : "";
  return value;
};

module.exports = ItemValue;