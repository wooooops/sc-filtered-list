describe( "options-given-by-data-attrs", function () {
  var filter,
    options;

  it( "there should be options", function () {
    filter = $( "[data-sc-filtered-list]" ).data( "scfilteredlist" );
    options = filter.$el.data( "sc-filtered-list-options" );
  } );

  it( "the button label should come from the data attrs", function () {
    filter.$el.html().should.equal( options.defaultButtonLabel );
  } );

  it( "the list title should come from the data attrs", function () {
    filter.list.$header.html().should.equal( options.defalutListTitle );
  } );

  describe( "options by given object on instantiation", function () {

    it( "should create a new button", function () {
      var $button = $( "<button data-sc-filtered-list>" );
      $( "section.test" ).append( $button );

      new FilteredList( $button, {
        defaultButtonLabel: "a",
        defalutListTitle: "b"
      } );

    } );

  } );

} );