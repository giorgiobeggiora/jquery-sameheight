# jQuery Same Height

This jQuery plugin sets all the matched elements' height to the highest one, checking for contained images to have their own height setted (i.e. when they're loaded).

It's compatible with elements in a container with the css property column-count greater than 1.

## Options

- compact (boolean) [default = false] : each row will have its own height.
- responsive (boolean) [default = true] : if true, the max height depends from the elements' content, from css otherwise.
- target (DOM element): if given, the height will be its one
- debounce (number): debounce milliseconds (rounded to multiple of 1/60).
- observe (window/DOM element/CSS query) [default = window]: elements which size changes must be detected.

## Smooth resize

To achieve the most fluid animation it's strongly suggested to include [CSS-Element-Queries](http://marcj.github.io/css-element-queries/). Otherwise, frame skip will occur due to the requestAnimationFrame fallback.
