var cast = require( "sc-cast" ),
  config = require( "./config.json" ),
  hasKey = require( "sc-haskey" ),
  ItemValue = require( "./item-value" ),
  md5 = require( "sc-md5" );

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