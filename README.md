# jQuery Same Height

This jQuery plugin sets all the matched elements' height to the highest one without explicitly setting it.

The plugin will manage **image loading** (elements will be resized when contained images will have their own height setted, i.e. during their download).

It's compatible with elements contained in a [CSS columns](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Columns) layout.

## Returns

An instance of the observer with the `stop()` method to stop listening the resize event (similar to the jQuery's `off()` method).

## Options

- `compact` *(boolean, default = false)*: each row will have its own height.
- `responsive` *(boolean, default = true)*: if true, the max height depends from the elements' content, from css otherwise.
- `target` *(DOM element)*: if given, the height will be its one
- `debounce` *(number)*: debounce in milliseconds (will be rounded by requestAnimationFrame).
- `observe` *(window|DOM element, default = window)*: elements which size changes must be detected.
- `columnCount` *(number|string, default = 1)*: closest ancestor's CSS column-count property's value ('auto' is not supported). If set as 'calc', each time the resize event is triggered the DOM will be traversed upward until an element with a column-count value greater than 1 will be found, so it's better to avoid it and explicitly set a number.

## Smooth resize

To achieve the most fluid animation possible, the plugin will try to use [ResizeObserver](https://developers.google.com/web/updates/2016/10/resizeobserver) or, if not available, [CSS-Element-Queries](https://github.com/marcj/css-element-queries). Otherwise, some frameskip may occur.
