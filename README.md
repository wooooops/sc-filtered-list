  - [FilteredList()](#filteredlist)
  - [Installation](#installation)
  - [Overview](#overview)
  - [Instantiate](#instantiate)
  - [Options](#options)
  - [Defaults](#defaults)
  - [Events](#events)
  - [Styling](#styling)
  - [Templates](#templates)
  - [FilteredList.data()](#filteredlistdata)
  - [Add a single object/item](#addasingleobjectitem)
  - [Get the value](#getthevalue)
  - [FilteredList.destroy()](#filteredlistdestroy)

## FilteredList()

  `sc-filtered-list` is a UI control to allow the user to quickly choose a
  single object from a list of many objects.
  
# Installation
  
  Get [Node.js](http://nodejs.org). And then in a console...
  
  ```bash
  npm install
  ```
  
# Overview
  
  This control is attached to a button. When the button is clicked a list
  would appear inline to allow the user to either use the mouse or keyboard
  to choose an item. A text input is available to allow the list to be
  filtered.
  
# Instantiate
  
  The `FilteredList` can be instantiated using `data-` attributes directly in
  the markup or manually by code.
  
  **Instantiate using `data-` attributes**
  
  Add `data-sc-filtered-list` to a `<button>`. Will instantiate on domready.
  
```js
<button data-sc-filtered-list>
```

  
  To get a reference to the instantiated object use the jQuery `data` method:
  
```js
$('#myButton').data('scfilteredlist');
```

  
  **Instantiate using code**
  
```js
var filter = new FilteredList(document.querySelector('#myButton'));
```

  
## Options
  
  Give options using the `data-` attribute.
  
```js
<button data-sc-filtered-list data-sc-filtered-list-options='{"fuzzy": true}'>
```

  
  > The options object must be a properly formatted JSON string.
  
  Give options using code.
  
```js
var filter = new FilteredList(document.querySelector('#myButton'), {
  fuzzy: true
});
```

  
  - `buttonLabel` The button label (default: "Choose one")
  - `fuzzy` The search type. If true "dvd" will match "david" (default: false)
  - `itemLabelKey` The object key to use for the items label (default: "name")
  - `listTitle` The title above the list (default: "Select an item")
  - `maxNumItems` The maximum number of items in the list (default: 10)
  - `maxNumItemsVisible` The maximum number of items visible (default: 7)
  - `minWidth` The width of the list (default: 300)
  - `sort` The default sort ["", "asc", "desc"] (default: "desc")
  - `sortControlVisible` If the sort control is visible (default: true)
  
## Defaults
  
  To change the defaults, use the global `FilteredList` variable.
  
```js
FilteredList.defaults.maxNumItems = 10;
```

  
## Events
  
  The `FilteredList` uses an event based system with methods `on`, `off` and
  `once`.
  
```js
myList.on('change', function(){});
```

  
  **Events**
  
  - `change` When the user selects and item and the value has changed
  - `close` When the list closes
  - `destroy` When the `FilteredList` is destroyed
  - `filtered` When the search value changes
  - `itemFocus` When an item in the list gains focus
  - `open` When the list opens
  - `sort` When the list is sorted
  - `redraw` When the list redraws itself
  - `fetch` When the list tries to fetch data based on the search term
  
## Styling
  
  CSS is provided and is required however it is plain by design. There are 2
  ways to make the list pretty.
  
  1. Include bootstrap 3.x
  2. Write your own
  
## Templates
  
  The markup that is generated on instantiation is template driven. These templates
  can be changed if necessary.
  
  **FilteredList.templates.listWrapper**
  
```js
<div class='{{config.className}}-container'>{{!config.templates.listInput}}{{!config.templates.listHeader}}{{!config.templates.listItemWrapper}}</div>
```

  
  **FilteredList.templates.listInput**
  
```js
<div class='{{config.className}}-input-container'><input type='text' class='{{config.className}}-input form-control'></div>
```

  
  **FilteredList.templates.listHeader**
  
```js
<header class='{{config.className}}-header panel-heading'>{{!config.defaults.listTitle}}{{!config.templates.listSortToggle}}</header>
```

  
  **FilteredList.templates.listItemWrapper**
  
```js
<div class='{{config.className}}-items list-group'></div>
```

  
  **FilteredList.templates.listItem**
  
```js
<a href class='{{config.className}}-item list-group-item' data-cid='{{cid}}'>{{!key}}</a>
```

  
  **FilteredList.templates.listSortToggle**
  
```js
<button type='button' class='{{config.className}}-sort-toggle btn btn-default btn-xs' title='sort'></button>
```

## FilteredList.data()

  Adds an array of objects/items in bulk
  
```js
myList.data([{
  name: "david"
}, {
  name: "max"
}]);
```

  
# Add a single object/item
  
```js
myList.items.push({
  name: "david"
});
```

  
# Get the value
  
  To get the value of the selected object/item use the `value` property.
  
```js
myList.value;
```

## FilteredList.destroy()

  Destroys the `FilteredList` and invalidates the object.
  
```js
myList.destroy();
```

  
  > Any further calles to methods like `destroy` or `data` etc will return
  nothing.
