var config = require( "./config.json" ),
  emitter = require( "emitter-component" ),
  guid = require( "sc-guid" ),
  helpers = require( "./helpers" ),
  is = require( "sc-is" ),
  List = require( "./list" ),
  observableArray = require( "sg-observable-array" );

/**
 * `sc-filtered-list` is a UI control to allow the user to quickly choose a
 * single object from a list of many objects.
 *
 * ## Installation
 *
 * Get [Node.js](http://nodejs.org). And then in a console...
 *
 * ```bash
 * npm install
 * ```
 *
 * ## Overview
 *
 * This control is attached to a button. When the button is clicked a list
 * would appear inline to allow the user to either use the mouse or keyboard
 * to choose an item. A text input is available to allow the list to be
 * filtered.
 *
 * ## Instantiate
 *
 * The `FilteredList` can be instantiated using `data-` attributes directly in
 * the markup or manually by code.
 *
 * **Instantiate using `data-` attributes**
 *
 * Add `data-sc-filtered-list` to a `<button>`. Will instantiate on domready.
 *
 *   <button data-sc-filtered-list>
 *
 * To get a reference to the instantiated object use the jQuery `data` method:
 *
 *   $('#myButton').data('scfilteredlist');
 *
 * **Instantiate using code**
 *
 *   var filter = new FilteredList(document.querySelector('#myButton'));
 *
 * ### Options
 *
 * Give options using the `data-` attribute.
 *
 *   <button data-sc-filtered-list data-sc-filtered-list-options='{"fuzzy": true}'>
 *
 * > The options object must be a properly formatted JSON string.
 *
 * Give options using code.
 *
 *   var filter = new FilteredList(document.querySelector('#myButton'), {
 *     fuzzy: true
 *   });
 *
 * - `buttonLabel` The button label (default: "Choose one")
 * - `fuzzy` The search type. If true "dvd" will match "david" (default: false)
 * - `itemLabelKey` The object key to use for the items label (default: "name")
 * - `listTitle` The title above the list (default: "Select an item")
 * - `maxNumItems` The maximum number of items in the list (default: 10)
 * - `maxNumItemsVisible` The maximum number of items visible (default: 7)
 * - `minWidth` The width of the list (default: 300)
 * - `sort` The default sort ["", "asc", "desc"] (default: "desc")
 * - `sortControlVisible` If the sort control is visible (default: true)
 *
 * ### Defaults
 *
 * To change the defaults, use the global `FilteredList` variable.
 *
 *   FilteredList.defaults.maxNumItems = 10;
 *
 * ### Events
 *
 * The `FilteredList` uses an event based system with methods `on`, `off` and
 * `once`.
 *
 *   myList.on('change', function(){});
 *
 * **Events**
 *
 * - `change` When the user selects and item and the value has changed
 * - `close` When the list closes
 * - `destroy` When the `FilteredList` is destroyed
 * - `filtered` When the search value changes
 * - `itemFocus` When an item in the list gains focus
 * - `open` When the list opens
 * - `sort` When the list is sorted
 * - `redraw` When the list redraws itself
 * - `fetch` When the list tries to fetch data based on the search term
 *
 * ### Styling
 *
 * CSS is provided and is required however it is plain by design. There are 2
 * ways to make the list pretty.
 *
 * 1. Include bootstrap 3.x
 * 2. Write your own
 *
 * ### Templates
 *
 * The markup that is generated on instantiation is template driven. These templates
 * can be changed if necessary.
 *
 * **FilteredList.templates.listWrapper**
 *
 *   <div class='{{config.className}}-container'>{{!config.templates.listInput}}{{!config.templates.listHeader}}{{!config.templates.listItemWrapper}}</div>
 *
 * **FilteredList.templates.listInput**
 *
 *   <div class='{{config.className}}-input-container'><input type='text' class='{{config.className}}-input form-control'></div>
 *
 * **FilteredList.templates.listHeader**
 *
 *   <header class='{{config.className}}-header panel-heading'>{{!config.defaults.listTitle}}{{!config.templates.listSortToggle}}</header>
 *
 * **FilteredList.templates.listItemWrapper**
 *
 *   <div class='{{config.className}}-items list-group'></div>
 *
 * **FilteredList.templates.listItem**
 *
 *   <a href class='{{config.className}}-item list-group-item' data-cid='{{cid}}'>{{!key}}</a>
 *
 * **FilteredList.templates.listSortToggle**
 *
 *   <button type='button' class='{{config.className}}-sort-toggle btn btn-default btn-xs' title='sort'></button>
 *
 * @class FilteredList
 * @param {jQuery|HTMLElement} _el The element you want to attach the list to
 * @param {Object} _defaults A defaults object
 * @property {String} __cid An automated GUID used internally
 * @property {String} __config The config
 * @property {Boolean} __destroyed Whether or not the object has been destroyed
 * @return {FilteredList}
 */
var FilteredList = function ( _el, _defaults ) {
  var self = this,
    cid = guid.generate(),
    defaults,
    localConfig;

  self.$el = $( _el );

  if ( self.$el.length === 0 ) {
    throw new Error( "An invalid DOM element was given" );
  }

  defaults = $.extend( {}, config.defaults, self.$el.data( config.className + "-options" ), _defaults );

  localConfig = $.extend( {}, config, {
    defaults: defaults
  } );

  self.$el.wrap( "<span class='" + localConfig.className + "' data-sc-filtered-list-cid='" + cid + "'>" );
  self.$wrapper = self.$el.parent();

  Object.defineProperties( self, {
    "__cid": {
      value: cid
    },
    "__config": {
      value: localConfig,
      writable: true
    },
    "__destroyed": {
      value: false,
      writable: true
    },
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
    "__original": {
      value: {},
      writable: true
    },
    "__sort": {
      value: "",
      writable: true
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
      writable: true
    },
    "listVisible": {
      get: helpers.listVisibleGet.bind( self ),
      set: helpers.listVisibleSet.bind( self )
    },
    "results": {
      value: [],
      writable: true
    },
    "sort": {
      get: helpers.sortGet.bind( self ),
      set: helpers.sortSet.bind( self )
    },
    "value": {
      get: helpers.valueGet.bind( self ),
      set: helpers.valueSet.bind( self )
    }
  } );

  self.list = new List( self );
  self.__original.buttonText = self.$el.text();

  var itemValue = {};
  itemValue[ self.__config.defaults.itemLabelKey ] = self.__config.defaults.buttonLabel;
  self.value = itemValue;

  self.$el
    .addClass( self.__config.className + "-button" )
    .data( self.__config.name, self )
    .trigger( self.__config.name + "-ready" );

  if ( self.__config.defaults.sortControlVisible !== true ) {
    self.$wrapper.addClass( self.__config.className + "-sort-hidden" );
  }

  [ "push", "shift" ].forEach( function ( _method ) {
    self.items.on( _method, helpers[ "item" + _method ].bind( self ) );
  } );

  $( window ).on( "click." + self.__config.name, helpers.bodyClick.bind( self ) );

  self.fetch();
  self.emit( self.__config.name + "-ready" );
};

/**
 * Adds an array of objects/items in bulk
 *
 *   myList.data([{
 *     name: "david"
 *   }, {
 *     name: "max"
 *   }]);
 *
 * ## Add a single object/item
 *
 *   myList.items.push({
 *     name: "david"
 *   });
 *
 * ## Get the value
 *
 * To get the value of the selected object/item use the `value` property.
 *
 *   myList.value;
 *
 */
FilteredList.prototype.data = function ( _arrayOfItems ) {
  var self = this;

  if ( self.__destroyed ) {
    return;
  }

  var items = is.array( _arrayOfItems ) ? _arrayOfItems : [];

  items.forEach( function ( _item ) {
    if ( is.an.object( _item ) ) {
      self.items.push( _item );
    }
  } );
};

/**
 * Destroys the `FilteredList` and invalidates the object.
 *
 *   myList.destroy();
 *
 * > Any further calles to methods like `destroy` or `data` etc will return
 * nothing.
 */
FilteredList.prototype.destroy = function () {
  var self = this;

  if ( self.__destroyed ) {
    return;
  }

  self.__destroyed = true;
  self.list.destroy();
  $( window ).off( "." + self.__config.name );

  self.$el
    .text( self.__original.buttonText )
    .unwrap()
    .data( self.__config.name, null )
    .removeClass( self.__config.className + "-button" );

  self.emit( "destroy" );
};

FilteredList.prototype.fetch = function () {
  var self = this;

  if ( self.__destroyed ) {
    return;
  }

  var value = self.list.$input.val();

  self.__lastFetchedValue = value;
  self.emit( "fetch", self.__lastFetchedValue );
};

emitter( FilteredList.prototype );

exports = module.exports = FilteredList;
exports.defaults = config.defaults;
exports.templates = config.templates;

$( function () {
  $( "button[data-" + config.className + "]" ).each( function ( _i, _el ) {
    new FilteredList( _el );
  } );
} );