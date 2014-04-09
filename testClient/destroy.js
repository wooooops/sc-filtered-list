describe( "destroy", function () {

  it( "should destroy the filtered list and remove all events", function ( _done ) {

    this.slow( 5000 );

    var $list = $( "button[data-sc-filtered-list]" ),
      list = $list.data( "scfilteredlist" );

    list.destroy();

    [ "change", "close", "destroy", "filtered", "itemFocus", "open", "sort", "redraw" ].forEach( function ( _event ) {
      list.on( _event, function () {
        throw new Error( "The `" + _event + "` event should have been destroyed" );
      } );
    } );

    list.items.push( {
      name: "david"
    } );

    list.items.push( {
      name: "leonie"
    } );

    list.items.push( {
      name: "max"
    } );

    setTimeout( function () {

      Object.keys( list.list ).forEach( function ( _key ) {
        if ( /^\$/.test( _key ) ) {
          $( "body" ).find( list.list[ _key ] ).length.should.equal( 0 );
        }
      } );

      $( "body" ).find( list.$el ).length.should.equal( 1 );
      $( "body" ).find( list.$wrapper ).length.should.equal( 0 );

      list.$el.trigger( "click" );
      list.$el.text().should.equal( list.__original.buttonText );
      /section/i.test( list.$el.parent()[ 0 ].tagName );

      setTimeout( _done, 100 );

    }, 100 );

  } );

} );