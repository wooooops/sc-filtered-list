describe( "fuzzy search", function () {

  var Filter = scfilteredlist;

  it( "should filter the list using fuzzy matching", function ( _done ) {

    this.slow( 5000 );

    var $filter = $( "button[data-sc-filtered-list]" ),
      filter;

    filter = new Filter( $filter, {
      fuzzy: true
    } );

    filter.items.push( {
      name: "leonie"
    } );
    filter.items.push( {
      name: "mr david"
    } );
    filter.items.push( {
      name: "max"
    } );

    setTimeout( function () {

      filter.list.open();
      filter.list.$input.val( "ma" );

      setTimeout( function () {

        itemLabelsShouldBe.apply( this, [ filter, "max", "mr david" ] );

        filter.list.$input.val( "mx" );
        filter.emit( "filterChanged" );

        setTimeout( function () {

          itemLabelsShouldBe.apply( this, [ filter, "max" ] );
          filter.destroy();
          _done();

        }, 100 );

      }, 100 );

    }, 100 );

  } );

  it( "should filter the list without fuzzy matching", function ( _done ) {
    var self = this;

    this.slow( 5000 );

    var $filter = $( "button[data-sc-filtered-list]" ),
      filter;

    filter = new Filter( $filter, {
      fuzzy: false
    } );

    filter.items.push( {
      name: "leonie"
    } );
    filter.items.push( {
      name: "mr david"
    } );
    filter.items.push( {
      name: "mr max"
    } );

    async.series( [

      function ( cb ) {
        filter.list.open();
        setTimeout( cb, 100 );
      },

      function ( cb ) {
        filter.list.$input.val( "ma" );
        filter.emit( "filterChanged" );
        setTimeout( cb, 100 );
      },

      function ( cb ) {
        itemLabelsShouldBe.apply( self, [ filter, "mr max" ] );
        filter.list.$input.val( "mx" );
        filter.emit( "filterChanged" );
        setTimeout( cb, 100 );
      },

      function ( cb ) {
        filter.list.$list.children().should.have.a.lengthOf( 0 );
        filter.list.$input.val( "m" );
        filter.emit( "filterChanged" );
        setTimeout( cb, 100 );
      },

      function ( cb ) {
        itemLabelsShouldBe.apply( self, [ filter, "mr david", "mr max" ] );
        filter.list.$input.val( "oni" );
        filter.emit( "filterChanged" );
        setTimeout( cb, 100 );
      },

      function ( cb ) {
        filter.list.$list.children().should.have.a.lengthOf( 0 );
        setTimeout( cb, 100 );
      },

      function () {
        _done();
      }

    ] );

  } );

} );