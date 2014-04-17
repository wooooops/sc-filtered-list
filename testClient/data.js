var FilteredList = scfilteredlist;

describe( "data", function () {

  it( "should add a bunch of items in one go", function ( _done ) {

    this.slow( 5000 );

    var filter = $( "button[data-sc-filtered-list]" ).data( "scfilteredlist" ),
      items = [ {
        name: "david"
      }, {
        name: "leonie"
      }, {
        name: "max"
      } ];

    filter.data( items );
    filter.list.open();

    async.waterfall( [

      function ( _callback ) {
        filter.items.should.have.a.lengthOf( 3 );
        setTimeout( _callback, 100 );
      },

      function ( _callback ) {
        filter.list.$list.children().should.have.a.lengthOf( 3 );
        _callback();
      }

    ], function ( _error ) {
      _done( _error );
    } );

  } );

} );