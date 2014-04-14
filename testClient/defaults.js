var FilteredList = scfilteredlist;

FilteredList.defaults.buttonLabel = "__buttonLabel";
FilteredList.defaults.listTitle = "__listTitle";
FilteredList.defaults.maxNumItemsVisible = 3;
FilteredList.defaults.maxNumItems = 10;
FilteredList.defaults.sortControlVisible = false;
FilteredList.defaults.itemLabelKey = "key";

describe( "defaults", function () {

  it( "should override the defaults", function ( _done ) {

    this.slow( 5000 );

    var list = $( "button[data-sc-filtered-list]" ).data( "scfilteredlist" );

    dummy.data.items.forEach( function ( _item, _i ) {
      if ( _i < 100 ) {
        var item = $.extend( {}, _item );
        item.key = item.name;
        delete item.name;
        list.items.push( item );
      }
    } );

    list.list.open();

    setTimeout( function () {

      list.$el.text().should.equal( "__buttonLabel" );
      list.list.$header.text().should.equal( "__listTitle" );
      list.list.$list.children().length.should.equal( 10 );
      list.list.$sortToggle.is( ":visible" ).should.be.false;

      list.items.forEach( function ( _item, _i ) {
        list.items[ _i ].key === _item.key;
      } );

      list.destroy();

      _done();

    }, 10 );

  } );

  it( "should override the defaults by giving them to the constructor", function ( _done ) {

    this.slow( 5000 );

    var list = new FilteredList( $( "button[data-sc-filtered-list]" ), {
      buttonLabel: "choose",
      listTitle: "",
      maxNumItemsVisible: 10,
      maxNumItems: 20,
      sortControlVisible: true,
      itemLabelKey: "name"
    } );

    dummy.data.items.forEach( function ( _item, _i ) {
      if ( _i < 100 ) {
        var item = $.extend( {}, _item );
        list.items.push( item );
      }
    } );

    list.list.open();

    setTimeout( function () {

      list.$el.text().should.equal( "choose" );
      list.list.$header.text().should.equal( "" );
      list.list.$list.children().length.should.equal( 20 );
      list.list.$sortToggle.is( ":visible" ).should.be.true;

      list.items.forEach( function ( _item, _i ) {
        list.items[ _i ].name === _item.name;
      } );

      setTimeout( function () {

        list.destroy();
        _done();

      }, 100 );

    }, 100 );

  } );

  it( "by setting giving the constructor options, they should not have overriden the process defaults", function () {
    FilteredList.defaults.buttonLabel.should.equal( "__buttonLabel" );
    FilteredList.defaults.listTitle = "__listTitle";
    FilteredList.defaults.maxNumItemsVisible = 3;
    FilteredList.defaults.maxNumItems = 10;
    FilteredList.defaults.sortControlVisible = false;
    FilteredList.defaults.itemLabelKey = "key";
  } );

} );