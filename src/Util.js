/**
 * @class Autolinker.Util
 * @singleton
 * 
 * A few utility methods for Autolinker.
 */
Autolinker.Util = {
	
	/**
	 * Assigns (shallow copies) the properties of `src` onto `dest`.
	 * 
	 * @param {Object} dest The destination object.
	 * @param {Object} src The source object.
	 * @return {Object} The destination object.
	 */
	assign : function( dest, src ) {
		for( var prop in src )
			if( src.hasOwnProperty( prop ) ) dest[ prop ] = src[ prop ];
		
		return dest;
	},
	
	
	/**
	 * Extends `subclass` as a prototypal is-a relationship of `superclass`.
	 * 
	 * @param {Function} superclass The constructor function for the superclass.
	 * @param {Function} subclass The constructor function for the subclass.
	 */
	extend : function( superclass, subclass ) {
		var F = function() {};
		F.prototype = superclass.prototype;
		
		subclass.prototype = new F();
	}
	
};