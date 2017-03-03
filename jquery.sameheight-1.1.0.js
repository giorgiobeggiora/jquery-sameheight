/*

 Name: jQuery sameHeight 1.1.0
 Author: giorgio.beggiora@artigianidelweb.com

 This plugin sets all the selected element's height to the highest one,
 waiting for images in them to be loaded. It's compatible with elements
 in a container with the css property column-count greater than 1.

 Options:

 - compact (boolean) [default=true] : each row will have its own height.

 - responsive (boolean) [default=true] : if true, the max height depends
 from the elements' content, from css otherwise.
 
 - target: if an element is given, the height will be its one.

 */

(function ( $ ) {

	$.fn.sameHeight = function( options ) {

		var settings = $.extend({
			compact: true,
			responsive: true,
			target: null
		}, options );
		
		// rhic - responsive height items container //
		var rhic_timeoutHandler;
		var elements = this;

		function debounceWindowResize(){

			clearTimeout(rhic_timeoutHandler);
			rhic_timeoutHandler=setTimeout(function(){
				var $elements=$(elements),
					elements_length=elements.length
					$target=$(settings.target),
					target_length=$target.length,
					$images=$(settings.target||elements).find('img,input[type="image"]'),
					images_length=$images.length
				;
				
				for(var i=0;i<images_length;i++){
					var img=$images[i];
					if( ! ( img.complete || img.height || parseInt(img.style.height) ) ){
						clearTimeout(rhic_timeoutHandler);
						rhic_timeoutHandler=setTimeout(debounceWindowResize,250);
						return;
					}
				}
				
				if(target_length){
					$elements.height($target.height());
					clearTimeout(rhic_timeoutHandler);
					rhic_timeoutHandler=setTimeout(debounceWindowResize,250);
					return;
				}
				
				var grouped=[];

				var r,c,cols,rows;

				if(settings.compact){
					cols=$elements.parent().css('column-count');
					var cssColumns;
					if(cols!=='auto'){
						cssColumns = true;
					}else{
						cssColumns = false;
					}
					if(!cssColumns){
						var y=null;
						for(cols=0;cols<elements_length;cols++){
							var offset=$(elements[cols]).offset();
							var offsetTop=offset.top;
							if(y!==offsetTop){
								if(y===null){
									y=offsetTop;
								}else{
									break;
								}
							}
						}
						rows=Math.ceil(elements_length/cols);
						for(i=0;i<elements_length;i++){
							r=Math.floor(i/cols);
							c=i%cols;
							if(typeof grouped[r]==='undefined'){
								grouped[r]=[];
							}
							grouped[r].push(elements[i]);
						}
					}else{
						cols*=1;
						rows=Math.ceil(elements_length/cols);
						for(i=0;i<elements_length;i++){
							r=i%rows;
							c=Math.floor(i/rows);
							if(typeof grouped[r]==='undefined'){
								grouped[r]=[];
							}
							grouped[r].push(elements[i]);
						}
					}
				}else{
					cols=1;
					rows=1;
					grouped[0]=[];
					for(i=0;i<elements_length;i++){
						grouped[0].push(elements[i]);
					}
				}

				for(r=0;r<rows;r++){
					var maxHeight=0;
					var g=grouped[r],gl=g.length;
					for(i=0;i<gl;i++){
						var item=g[i],$item=$(item);
						if(settings.responsive){
							item.style.height='auto';
						}
						maxHeight=Math.max(maxHeight,$item.height());
					}
					$(g).height(maxHeight);
				}
			},250);
		}
		
		$(window).resize(debounceWindowResize);

		debounceWindowResize();

		return this;

	};

}( jQuery ));