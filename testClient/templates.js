FilteredList.templates.listWrapper = "<div data-template-test='listWrapper' class='{{config.className}}-container'>{{!config.templates.listInput}}{{!config.templates.listHeader}}{{!config.templates.listItemWrapper}}</div>";
FilteredList.templates.listInput = "<div data-template-test='listInput' class='{{config.className}}-input-container'><input type='text' class='{{config.className}}-input form-control'></div>";
FilteredList.templates.listHeader = "<header data-template-test='listHeader' class='{{config.className}}-header panel-heading'>{{!config.defaults.listTitle}}{{!config.templates.listSortToggle}}</header>";
FilteredList.templates.listItemWrapper = "<div data-template-test='listItemWrapper' class='{{config.className}}-items list-group'></div>";
FilteredList.templates.listItem = "<a data-template-test='listItem' href class='{{config.className}}-item list-group-item' data-cid='{{cid}}'>{{!key}}</a>";
FilteredList.templates.listSortToggle = "<button data-template-test='listSortToggle' type='button' class='{{config.className}}-sort-toggle btn btn-default btn-xs' title='sort'></button>";

describe( "data", function () {

  it( "should add a bunch of items in one go", function () {

    var filter = $( "button[data-sc-filtered-list]" ).data( "scfilteredlist" );

    filter.items.push( {
      name: "david"
    } );

    filter.list.open();

    setTimeout( function () {

      filter.list.$el.attr( "data-template-test" ).should.equal( "listWrapper" );
      filter.list.$input.parent().attr( "data-template-test" ).should.equal( "listInput" );
      filter.list.$list.attr( "data-template-test" ).should.equal( "listItemWrapper" );
      filter.list.$header.attr( "data-template-test" ).should.equal( "listHeader" );
      filter.list.$list.find( ">a" ).attr( "data-template-test" ).should.equal( "listItem" );
      filter.list.$sortToggle.attr( "data-template-test" ).should.equal( "listSortToggle" );

    }, 100 );

  } );

} );