( function ( $, _ ) {

  var cast = require( "sc-cast" ),
    config = require( "./config.json" ),
    helpers = require( "./helpers" ),
    merge = require( "sc-merge" ),
    Levenshtein = require( "levenshtein" );

  var List = function ( _filter ) {
    var self = this;

    Object.defineProperties( self, {
      "__activeItemIndex": {
        value: 0,
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

    Object.keys( config.templates ).forEach( function ( _templateName ) {
      self.__templates[ _templateName ] = _.template( config.templates[ _templateName ], {
        config: config,
        cid: ""
      } );
    } );

    self.$el = $( _.template( self.__templates.listWrapper, {
      config: merge( config, {
        templates: self.__templates
      } )
    } ) );

    self.$input = self.$el.find( "." + config.className + "-list-input input" );
    self.$header = self.$el.find( "." + config.className + "-list-header" );
    self.$list = self.$el.find( "." + config.className + "-list-item-wrapper" );

    self.$input.on( "change keydown", helpers.filterChanged.bind( self ) );
    self.filter.on( "filterChanged", self.redraw.bind( self ) );
    self.filter.$el.after( self.$el );

    window.Levenshtein = Levenshtein;

  };

  List.prototype.close = function () {
    var self = this;
    self.__visible = false;
    self.$el.removeClass( config.className + "-visible" );
    self.filter.emit( "close" );
    $( window ).off( "keyup." + config.name );
    self.$el.off( "click." + config.name );
    return self.__visible;
  };

  List.prototype.getActiveItem = function () {
    var self = this,
      $selectedItem = self.$list.find( "." + config.className + "-list-item-active" ),
      selectedItemHash = $selectedItem.data( "cid" ),
      selectedItem = self.filter.__items[ selectedItemHash ];

    return selectedItem;
  };

  List.prototype.open = function () {
    var self = this;
    self.__visible = true;
    self.redraw();
    self.$el.addClass( config.className + "-visible" );
    self.$input.focus();
    self.filter.emit( "open" );
    $( window ).on( "keyup." + config.name, helpers.windowKeyUp.bind( self ) );
    self.$el.on( "click." + config.name, "." + config.className + "-list-item", helpers.itemClick.bind( self ) );
    return self.__visible;
  };

  List.prototype.redraw = function () {
    var self = this;

    setTimeout( function () {
      var filterBy = self.$input.val(),
        numVisibleItems = 0,
        itemsMarkup = "";

      self.filter.items.forEach( function ( _item ) {
        if ( numVisibleItems < self.filter.__options.maxNumItems ) {

          // var rx = new RegExp( filterBy, "i" ),
          //   matched = rx.test( _item.name );

          var match = new Levenshtein( _item.name, filterBy ),
            matched = match.distance < 3;

          // console.log( match );

          if ( matched ) {
            itemsMarkup += _.template( config.templates.listItem, merge( {
              config: config,
              cid: _item.__cid
            }, _item ) );
            numVisibleItems++;
          }

        }
      } );

      self.$list.empty().html( itemsMarkup );
      self.activeItemIndex = self.activeItemIndex;
    }, 0 );

  };

  module.exports = List;

} )( jQuery, _ );