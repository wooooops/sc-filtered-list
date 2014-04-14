var helpers = require( "./helpers" ),
  fuzzy = require( "fuzzaldrin" ),
  merge = require( "sc-merge" ),
  minstache = require( "minstache" );

var List = function ( _filter ) {
  var self = this,
    config;

  Object.defineProperties( self, {
    "__activeItemIndex": {
      value: 0,
      writable: true
    },
    "__destroyed": {
      value: false,
      writable: true
    },
    "__templates": {
      value: {}
    },
    "__visible": {
      value: false,
      writable: true
    },
    "activeItemIndex": {
      get: helpers.activeItemIndexGet.bind( self ),
      set: helpers.activeItemIndexSet.bind( self )
    },
    "filter": {
      value: _filter
    }
  } );

  config = self.filter.__config;

  Object.keys( config.templates ).forEach( function ( _templateName ) {
    self.__templates[ _templateName ] = minstache( config.templates[ _templateName ], {
      config: config,
      cid: "",
      key: ""
    } );
  } );

  self.$el = $( minstache( self.__templates.listWrapper, {
    config: merge( config, {
      templates: self.__templates
    } )
  } ) );

  self.$input = self.$el.find( "." + config.className + "-input" );
  self.$header = self.$el.find( "." + config.className + "-header" );
  self.$list = self.$el.find( "." + config.className + "-items" );
  self.$sortToggle = self.$el.find( "." + config.className + "-sort-toggle" );

  self.$input.on( "change." + config.name + " keydown." + config.name, helpers.filterChanged.bind( self ) );
  self.$sortToggle.on( "click." + config.name, helpers.sortToggleClicked.bind( self ) );
  self.filter.on( "filterChanged", self.redraw.bind( self ) );
  self.filter.on( "itemFocus", helpers.putFocussedItemInView.bind( self ) );
  self.filter.$el.after( self.$el );
};

List.prototype.close = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  self.__visible = false;
  self.$el.removeClass( config.className + "-container-visible" );
  self.filter.emit( "close" );
  $( window ).off( "keyup." + config.name );
  self.$el.off( "click." + config.name );
  return self.__visible;
};

List.prototype.destroy = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  self.filter.__destroyed = self.__destroyed = true;
  $( window ).off( "." + config.name );
  self.$input.off( "." + config.name );
  self.$el.off( "." + config.name );
  self.$sortToggle.off( "." + config.name );
  self.filter.off( "filterChanged" );
  self.filter.off( "itemFocus" );
  self.$el.remove();

};

List.prototype.getActiveItem = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  var $selectedItem = self.$list.find( "." + config.className + "-item-active" ),
    selectedItemHash = $selectedItem.data( "cid" ),
    selectedItem = self.filter.__items[ selectedItemHash ];

  return selectedItem;
};

List.prototype.open = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  self.__visible = true;
  self.filter.emit( "open" );
  $( window ).on( "keyup." + config.name, helpers.windowKeyUp.bind( self ) );
  self.$el.on( "click." + config.name, "." + config.className + "-item", helpers.itemClick.bind( self ) );
  self.redraw();

  self.filter.once( "redraw", function () {
    self.$input.focus().select();
  } );

  return self.__visible;
};

List.prototype.redraw = function () {
  var self = this,
    config = self.filter.__config;

  if ( self.__destroyed ) {
    return;
  }

  if ( self.redrawTimeout ) {
    clearTimeout( self.redrawTimeout );
    return self.redrawTimeout = null;
  }

  self.redrawTimeout = setTimeout( function () {
    self.redrawTimeout = null;

    if ( self.__destroyed ) {
      return;
    }

    var filterBy = self.$input.val(),
      itemsMarkup = "",
      results = fuzzy.filter( self.filter.items, filterBy || "", {
        key: config.defaults.itemLabelKey,
        maxResults: self.filter.__config.defaults.maxNumItems
      } );

    if ( self.filter.__sort ) {
      results.sort( function ( a, b ) {
        var order = self.filter.__sort === "desc" ? a.name > b.name : a.name < b.name;
        return order ? 1 : -1;
      } );
    }

    self.filter.results = results;

    self.filter.emit( "filtered" );

    results.forEach( function ( _item ) {
      _item.key = _item[ config.defaults.itemLabelKey ];
      itemsMarkup += minstache( config.templates.listItem, merge( {
        config: config,
        cid: _item.__cid
      }, _item ) );
    } );

    self.$list.empty().html( itemsMarkup );
    self.activeItemIndex = self.activeItemIndex;

    if ( self.__visible ) {
      setTimeout( function () {

        if ( self.__destroyed ) {
          return;
        }

        var visibleItemsHeight = 0;
        self.$el.addClass( config.className + "-container-invisible" );

        self.$list.find( ">:lt(" + self.filter.__config.defaults.maxNumItemsVisible + ")" ).each( function ( _i, _el ) {
          visibleItemsHeight += $( _el ).outerHeight();
        } );

        self.$list.height( visibleItemsHeight );
        self.$el.addClass( config.className + "-container-visible" ).removeClass( config.className + "-container-invisible" );
        self.filter.emit( "redraw" );
      }, 0 );

    }

  }, 0 );

};

module.exports = List;