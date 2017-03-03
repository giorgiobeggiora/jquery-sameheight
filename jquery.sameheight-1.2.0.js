/*

 Name: jQuery sameHeight 1.2.0
 Author: giorgio.beggiora@artigianidelweb.com

 This plugin sets all the selected element's height to the highest one,
 waiting for images in them to have their height setted (i.e. when they're loaded).
 It's compatible with elements in a container
 with the css property column-count greater than 1.

 Options:

 - compact (boolean) [default=true] : each row will have its own height.

 - responsive (boolean) [default=true] : if true, the max height depends
 from the elements' content, from css otherwise.
 
 - target: if an element is given, the height will be its one.

 - debounce: debounce milliseconds. 
 
 */

(function ( $ ) {

	$.fn.sameHeight = function( options ) {

		var settings = $.extend({
			compact: true,
			responsive: true,
			target: null,
			debounce: 250
		}, options );
		
		// rhic - responsive height items container //
		var rhic_timeoutHandler;
		var elements = this;
		
		function debouncedWindowResize(){

			clearTimeout(rhic_timeoutHandler);
			var $el = $(settings.target || elements);
			if(!$el.length) return false;
			
			rhic_timeoutHandler = setTimeout(function(){
				
				var $el = $(settings.target || elements);
				var images = $el.find('img, input[type="image"]').toArray();
				var allImagesHaveHeight = images.every(function(img){
					return !! ( img.complete || img.height || parseInt(img.style.height) );
				});
				if(!allImagesHaveHeight){
					clearTimeout(rhic_timeoutHandler);
					rhic_timeoutHandler = setTimeout(debouncedWindowResize, settings.debounce);
				}
				
				var el = $el.toArray(),
					el_length = el.length,
					$target = $(settings.target)
				;
				if($target.length){
					$el.height($target.height());
					clearTimeout(rhic_timeoutHandler);
					rhic_timeoutHandler = setTimeout(debouncedWindowResize, settings.debounce);
					return;
				}
				
				var grouped = [];

				var r, c, cols, rows;

				if(settings.compact){
					cols = $el.parent().css('column-count');
					var cssColumns;
					if(cols !== 'auto'){
						cssColumns = true;
					}else{
						cssColumns = false;
					}
					if(!cssColumns){
						var y = null;
						for(cols = 0; cols < el_length; cols++){
							var offset = $el.eq(cols).offset();
							var offsetTop = offset.top;
							if(y !== offsetTop){
								if(y === null){
									y = offsetTop;
								}else{
									break;
								}
							}
						}
						rows = Math.ceil(el_length / cols);
						for(i = 0; i < el_length; i++){
							r = Math.floor(i / cols);
							c = i % cols;
							if(typeof grouped[r] === 'undefined'){
								grouped[r] = [];
							}
							grouped[r].push(el[i]);
						}
					}else{
						cols *= 1;
						rows = Math.ceil(el_length / cols);
						for(i = 0; i < el_length; i++){
							r = i % rows;
							c = Math.floor(i / rows);
							if(typeof grouped[r] === 'undefined'){
								grouped[r] = [];
							}
							grouped[r].push(el[i]);
						}
					}
				}else{
					cols = 1;
					rows = 1;
					grouped[0] = [];
					for(i = 0; i < el_length; i++){
						grouped[0].push(el[i]);
					}
				}

				for(r = 0; r < rows; r++){
					var maxHeight = 0;
					var g = grouped[r], gl = g.length;
					for(i = 0; i < gl; i++){
						var item = g[i], $item = $(item);
						if(settings.responsive){
							item.style.height = 'auto';
						}
						maxHeight = Math.max(maxHeight, $item.height());
					}
					$(g).height(maxHeight);
				}
			}, settings.debounce);
		}
		
		$(window).resize(debouncedWindowResize);

		debouncedWindowResize();

		return this;

	};

}( jQuery ));