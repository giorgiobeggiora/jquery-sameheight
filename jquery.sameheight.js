/*

 Name: jQuery sameHeight 1.3.0
 Author: giorgio.beggiora@artigianidelweb.com

 requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
 https://gist.github.com/paulirish/1579671

 Optional dependency: CSS-Element-Queries
 http://marcj.github.io/css-element-queries/

 This plugin sets all the matched elements' height to the highest one,
 waiting for images in them to have their height setted (i.e. when they're loaded).
 It's compatible with elements in a container with the css property column-count
 greater than 1.

 Options:

 - compact (boolean) [default = false] : each row will have its own height.

 - responsive (boolean) [default = true] : if true, the max height depends
 from the elements' content, from css otherwise.

 - target: if an element is given, the height will be its one.

 - debounce: debounce milliseconds.

 - observe (window/DOM element/CSS query) [default = window]: elements which size changes must be detected.

 */

if (!Number.isFinite) Number.isFinite = function(value) {
    return typeof value === 'number' && isFinite(value);
}

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

(function ( $ ) {

	$.fn.sameHeight = function( options ) {

		var settings = $.extend({
			compact: false,
			responsive: true,
			target: null,
			observe: window
		}, options );

		if (!Number.isFinite(settings.debounce)) {
			settings.debounce = 250;
		}

		var rAFTimeoutHandlers = {};
		var rAFTimeoutHandlersNextId = 0;

		function setRAFTimeout(callback, ms){

			var id, h, now = Date.now();
			if(arguments.length > 2){
				id = arguments[2];
				h = rAFTimeoutHandlers[id];
			}else{
				id = rAFTimeoutHandlersNextId++ ;
				h = { id: id, start: now };
				rAFTimeoutHandlers[id] = h;
			}

			if( h ){
				if( now - h.start < ms ){
					requestAnimationFrame(setRAFTimeout.bind(this, callback, ms, id));
				}else{
					delete rAFTimeoutHandlers[id];
					callback();
				}
			}

			return id;
		}

		function clearRAFTimeout(id){
			delete rAFTimeoutHandlers[id];
		}

		var msPerLoop = settings.debounce;

		var elements = this;

		function doTheMagic(){

			var $el = $(settings.target || elements);

			var images = $el.find('img, input[type="image"]').toArray();
			var allImagesHaveHeight = images.every(function(img){
				return !! ( img.complete || img.height || parseInt(img.style.height) );
			});
			if(!allImagesHaveHeight){
				clearRAFTimeout(handler);
				handler = setRAFTimeout(debouncedResize, msPerLoop);
			}

			var el = $el.toArray(),
				el_length = el.length,
				$target = $(settings.target)
			;
			if($target.length){
				$el.height($target.height());
				clearRAFTimeout(handler);
				handler = setRAFTimeout(debouncedResize, msPerLoop);
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

		}

		var handler;
		function debouncedResize(){
			clearRAFTimeout(handler);
			var $el = $(settings.target || elements);
			if(!$el.length) return false;
			handler = setRAFTimeout(doTheMagic, msPerLoop);
		}

		var observeType = Object.prototype.toString.call( settings.observe );
		var observeWhat = '';

		if ( observeType === '[object String]' ) {
			observeWhat = 'query';
		} if ( observeType === '[object Window]' ) {
			observeWhat = 'window';
		} else if ( observeType === '[object HTMLCollection]' ) {
			observeWhat = 'element';
		} else if ( observeType.indexOf('[object HTML') === 0 ) {
			observeWhat = 'element';
		}

		if (observeWhat === 'window') {

			$([settings.observe, settings.observe.document]).on('load resize', debouncedResize);

		} else if(observeWhat) {

			if(typeof ResizeSensor !== 'undefined'){
				console.log('observe')
				$(settings.observe).each(function(){
					new ResizeSensor(this, debouncedResize);
				});
			}else{
				var oldw = [], oldh = [];
				(function resizeLoop(){
					var neww = [], newh = [];
					$(settings.observe).each(function(){
						var $element = $(this);
						neww.push($element.width());
						newh.push($element.height());
					});
					var i = neww.length;
					while(i--){
						if( neww[i] !== oldw[i] || newh[i] !== oldh[i] ){
							oldw = neww;
							oldh = newh;
							debouncedResize();
							break;
						}
					}
					setRAFTimeout(resizeLoop, msPerLoop);
				})();
			}

		}

		debouncedResize();

		return this;

	};

}( jQuery ));
