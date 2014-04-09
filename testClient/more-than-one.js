var FilteredList = scfilteredlist;

describe( "more than one", function () {

  var $filter1,
    $filter2,
    $filter3;

  var filter1,
    filter2,
    filter3;

  it( "should have created 3 filtered lists", function () {

    $filter1 = $( "button.filter1" ),
    $filter2 = $( "button.filter2" ),
    $filter3 = $( "button.filter3" );

    filter1 = $filter1.data( "scfilteredlist" ),
    filter2 = $filter2.data( "scfilteredlist" ),
    filter3 = $filter3.data( "scfilteredlist" );

    filter1.should.be.a.FilteredList;
    filter2.should.be.a.FilteredList;
    filter3.should.be.a.FilteredList;

  } );

  it( "should add a different length of items to each list", function ( _done ) {

    this.slow( 5000 );

    filter1.items.push( {
      name: "one"
    } );
    filter1.items.push( {
      name: "two"
    } );

    filter2.items.push( {
      name: "three"
    } );
    filter2.items.push( {
      name: "four"
    } );
    filter2.items.push( {
      name: "five"
    } );

    filter3.items.push( {
      name: "six"
    } );

    filter1.$el.text().should.equal( "one" );
    filter2.$el.text().should.equal( "two" );
    filter3.$el.text().should.equal( "three" );

    async.waterfall( [

      function ( cb ) {
        filter1.$el.trigger( "click" );
        setTimeout( function () {
          filter1.list.$list.children().should.have.a.lengthOf( 2 );
          cb();
        }, 100 )
      },

      function ( cb ) {
        filter2.$el.trigger( "click" );
        setTimeout( function () {
          filter2.list.$list.children().should.have.a.lengthOf( 3 );
          filter2.list.$sortToggle.is( ":visible" ).should.be.false;
          cb();
        }, 100 )
      },

      function ( cb ) {
        filter3.$el.trigger( "click" );
        setTimeout( function () {
          filter3.list.$list.children().should.have.a.lengthOf( 1 );
          cb();
        }, 100 )
      }
    ], _done );

  } );

  it( "should destroy the lists", function ( _done ) {

    this.slow( 5000 );

    filter1.destroy();
    filter2.destroy();
    filter3.destroy();

    setTimeout( function () {

      $filter1.text().should.equal( "1" );
      $filter2.text().should.equal( "2" );
      $filter3.text().should.equal( "3" );

      _done();

    }, 100 );

  } );

} );