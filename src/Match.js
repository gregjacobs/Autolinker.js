/**
 * @private
 * @abstract
 * @class Autolinker.Match
 * 
 * Represents a match found in an input string which should be Autolinked.
 * 
 * @constructor
 * @param {Object} [config] The configuration options for the Autolinker.Match instance, specified in an Object (map).
 */
Autolinker.Match = function( cfg ) {
	cfg = cfg || {};
	
	// Assign the properties of `cfg` onto the Autolinker instance. Prototype properties will be used for missing configs. 
	for( var prop in cfg )
		if( cfg.hasOwnProperty( prop ) ) this[ prop ] = cfg[ prop ];
};

AutoLinker.Match.prototype = {
	constructor : AutoLinker.Match,
	
	
	
	
	
	getType : function() {
		throw 'abstract';
	}

};