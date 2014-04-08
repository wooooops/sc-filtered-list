var list;

( function ( $ ) {
  var $el = $( "button[data-sc-filtered-list]" );

  var init = function () {
    list = $el.data( "scfilteredlist" );

    list.value = {
      key: "chicken",
      value: {
        chicken: "tasty"
      }
    };

    list.on( "change", function ( _value ) {
      console.log( "demo: item changed to", _value );
    } );

    list.on( "close", function () {
      // console.log( "demo: list close" );
    } );

    list.on( "open", function () {
      // console.log( "demo: list open" );
    } );

    list.on( "destroy", function () {
      console.log( "demo: list destroyed" );
    } );

    list.on( "fetch", function ( _value ) {
      // console.log( "demo: list fetch", "'" + _value + "'" );
      if ( list.items.length === 0 ) {
        dummy.data.items.forEach( function ( _item ) {
          list.items.push( _item );
        } );
      }
    } );

  };

  $el.data( "scfilteredlist" ) ? init() : $el.on( "scfilteredlist-ready", init.bind( this ) );

} )( jQuery );