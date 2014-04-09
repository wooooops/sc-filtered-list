describe( "open close", function () {

  it( "should open and close the list as designed", function ( _done ) {

    this.slow( 5000 );

    var filter = $( "[data-sc-filtered-list]" ).data( "scfilteredlist" );

    var listVisible = function () {
      return filter.list.$list.is( ":visible" );
    };

    var openList = function () {
      filter.$el.trigger( "click" );
    };

    async.series( [

      function ( cb ) {
        openList();
        filter.list.$list.should.have.a.lengthOf( 1 );
        setTimeout( cb, 100 );
      },
      function ( cb ) {
        filter.list.$list.trigger( "click" );
        filter.list.$input.trigger( "click" );
        listVisible().should.be.true;
        setTimeout( cb, 100 );
      },
      function ( cb ) {
        listVisible().should.be.true;
        var event = $.Event( "keydown", {
          keyCode: 27
        } );
        filter.list.$input.trigger( event );
        setTimeout( function () {
          listVisible().should.be.false;
          openList();
          setTimeout( cb, 100 );
        }, 100 );
      },
      function ( cb ) {
        listVisible().should.be.true;
        var event = $.Event( "keydown", {
          keyCode: 13
        } );
        filter.list.$input.trigger( event );
        setTimeout( function () {
          listVisible().should.be.false;
          openList();
          setTimeout( cb, 100 );
        }, 100 );
      },
      function ( cb ) {
        listVisible().should.be.true;
        $( window ).trigger( "click" );
        setTimeout( function () {
          listVisible().should.be.false;
          setTimeout( cb, 100 );
        }, 100 );
      },
      function () {
        _done();
      }
    ] );

  } );

} );