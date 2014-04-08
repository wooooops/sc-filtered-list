/**
 * Dependencies
 * - jQuery
 * - underscore
 */

( function ( $, _ ) {

  var cast = require( "sc-cast" ),
    config = require( "./config.json" ),
    emitter = require( "emitter-component" ),
    hasKey = require( "sc-haskey" ),
    helpers = require( "./helpers" ),
    is = require( "sc-is" ),
    ItemValue = require( "./item-value" ),
    List = require( "./list" ),
    observableArray = require( "sg-observable-array" );

  var FilteredList = function ( _el, _options ) {
    var self = this;

    self.$el = $( _el );

    if ( self.$el.length === 0 ) {
      throw new Error( "An invalid DOM element was given" );
    }

    Object.defineProperties( self, {
      "__fetching": {
        value: false,
        writable: true
      },
      "__items": {
        value: {},
        writable: true
      },
      "__label": {
        value: null,
        writable: true
      },
      "__lastFetchedValue": {
        value: "",
        writable: true
      },
      "__options": {
        value: $.extend( FilteredList.defaults, self.$el.data( config.className + "-options" ), _options )
      },
      "__value": {
        value: null,
        writable: true
      },
      "activeItem": {
        get: helpers.activeItemGet.bind( self ),
        set: helpers.activeItemSet.bind( self )
      },
      "items": {
        value: observableArray( [] ),
        writable: true
      },
      "label": {
        get: helpers.labelGet.bind( self ),
        set: helpers.labelSet.bind( self )
      },
      "list": {
        value: new List( self )
      },
      "listVisible": {
        get: helpers.listVisibleGet.bind( self ),
        set: helpers.listVisibleSet.bind( self )
      },
      "value": {
        get: helpers.valueGet.bind( self ),
        set: helpers.valueSet.bind( self )
      }
    } );

    self.value = {
      key: is.not.empty( self.$el.text() ) ? self.$el.text() : config.defaults.defaultButtonLabel
    };

    self.$el
      .addClass( config.className )
      .addClass( config.className + "-button" )
      .on( "click", self.click.bind( self ) )
      .data( config.name, self )
      .trigger( config.name + "-ready" );

    [ "push", "shift" ].forEach( function ( _method ) {
        self.items.on( _method, helpers[ "item" + _method ].bind( self ) );
      } );

    $( window ).on( "click", helpers.bodyClick.bind( self ) );

    self.fetch();
  };

  FilteredList.prototype.click = function () {
    var self = this,
      args = Array.prototype.slice.call( arguments );

  };

  FilteredList.prototype.destroy = function () {
    var self = this;
    self.emit( "destroy" );
  };

  FilteredList.prototype.fetch = function () {
    var self = this;

    if ( !self.throttledFetch ) {
      self.throttledFetch = _.throttle( function () {
        var value = self.list.$input.val();

        self.__lastFetchedValue = value;
        self.emit( "fetch", self.__lastFetchedValue );
      }, self.__options.throttleFetch );
    }

    self.throttledFetch();
  };

  emitter( FilteredList.prototype );
  exports = module.exports = FilteredList;
  exports.defaults = config.defaults;

  $( function () {
    $( "button[data-" + config.className + "]" ).each( function ( _i, _el ) {
      new FilteredList( _el );
    } );
  } );

} )( jQuery, _ );