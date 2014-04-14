var list;

( function ( $ ) {
  var $el = $( "button[data-sc-filtered-list]" );

  var init = function () {
    list = $el.data( "scfilteredlist" );

    list.on( "change", function ( _value ) {
      // console.log( "demo: item changed to", _value );
    } );

    list.on( "close", function () {
      // console.log( "demo: list close" );
    } );

    list.on( "destroy", function () {
      // console.log( "demo: list destroyed" );
    } );

    list.on( "filtered", function () {
      // console.log( "demo: list filtered", "(" + list.results.length, "of", list.items.length + ")" );
      if ( list.results.length === 0 ) {
        if ( list.items.length > 0 && list.items.length < 1000 ) {
          // console.log( "append the rest of the items" );
          dummy.data.items.forEach( function ( _item ) {
            list.items.push( _item );
          } );
        }
      }
    } );

    list.on( "itemFocus", function () {
      // console.log( "demo: itemFocus" );
    } );

    list.on( "open", function () {
      // console.log( "demo: list open" );
    } );

    list.on( "sort", function () {
      // console.log( "demo: list sort:", list.sort );
    } );

    list.on( "redraw", function () {
      // console.log( "demo: redraw" )
    } );

    list.on( "fetch", function ( _value ) {
      if ( list.items.length === 0 ) {
        dummy.data.items.forEach( function ( _item, _i ) {
          if ( _i <= 500 ) {
            // TODO: allow list.items = [{},{},{}]
            list.items.push( _item );
          }
        } );
      }
    } );

  };

  $el.data( "scfilteredlist" ) ? init() : $el.on( "scfilteredlist-ready", init.bind( this ) );

} )( jQuery );