describe( "sort", function () {

  it( "should sort the list", function ( _done ) {

    this.slow( 5000 );

    var $filter = $( "button[data-sc-filtered-list]" ),
      filter = $filter.data( "scfilteredlist" );

    filter.items.push( {
      name: "leonie"
    } );
    filter.items.push( {
      name: "david"
    } );
    filter.items.push( {
      name: "max"
    } );

    setTimeout( function () {
      itemLabelsShouldBe.apply( this, [ filter, "david", "leonie", "max" ] );
      filter.list.$sortToggle.trigger( "click" );

      setTimeout( function () {
        itemLabelsShouldBe.apply( this, [ filter, "max", "leonie", "david" ] );
        filter.list.$sortToggle.trigger( "click" );

        setTimeout( function () {
          itemLabelsShouldBe.apply( this, [ filter, "leonie", "david", "max" ] );

          setTimeout( function () {
            filter.destroy();
            _done();

          }, 100 );

        }, 100 );

      }, 100 );

    }, 100 );

  } );

  it( "should sort using the default", function () {

    var $filter = $( "button[data-sc-filtered-list]" ),
      filter;

    $filter.attr( "data-sc-filtered-list-options", "{\"sort\": \"asc\"}" );

    filter = window.filter = new FilteredList( $filter );

    filter.items.push( {
      name: "leonie"
    } );
    filter.items.push( {
      name: "david"
    } );
    filter.items.push( {
      name: "max"
    } );

    setTimeout( function () {
      itemLabelsShouldBe.apply( this, [ filter, "max", "leonie", "david" ] );
    }, 100 );

  } );

} );