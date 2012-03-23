/*!
 * Autolinker.js
 * Version 0.1
 * 
 * Copyright(c) 2012 Gregory Jacobs.
 * MIT Licensed. http://www.opensource.org/licenses/mit-license.php
 * 
 * https://github.com/gregjacobs/Autolinker.js
 */
/**
 * @class Autolinker
 * @extends Object
 * @singleton
 * 
 * Singleton class which exposes the {@link #link} method, used to process a given string of text,
 * and wrap the URLs, email addresses, and Twitter handles in the appropriate anchor (&lt;a&gt;) tags.
 */
var Autolinker = {
	
	// NOTE: The matcherRegex will be included after the class, from the compiled regex source
	
	
	/**
	 * @private
	 * @property {RegExp} htmlRegex
	 * 
	 * A regular expression used to pull out HTML tags from a string.
	 * 
	 * Capturing groups:
	 * 
	 * 1. The tag name.
	 */
	htmlRegex : /<\/?(\w+)((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g,
	
	
	
	/**
	 * Automatically links URLs, email addresses, and Twitter handles found in the given chunk of HTML. 
	 * Does not link URLs found within HTML tags.
	 * 
	 * For instance, if given the text: `You should go to http://www.yahoo.com`, then the result
	 * will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
	 * 
	 * @method link
	 * @param {String} html The HTML text to link URLs within.
	 * @param {Object} [options] Any options for the autolinking, specified in an object. It may have the following properties:
	 * @param {Boolean} [options.newWindow=true] True if the links should open in a new window, false otherwise.
	 * @return {String} The HTML text, with URLs automatically linked
	 */
	link : function( html, options ) {
		options = options || {};
		
		var htmlRegex = Autolinker.htmlRegex,         // full path for friendly
		    matcherRegex = Autolinker.matcherRegex,   // out-of-scope calls
		    newWindow = ( 'newWindow' in options ) ? options.newWindow : true,  // defaults to true
		    currentResult, 
		    lastIndex = 0,
		    inBetweenTagsText,
		    resultHtml = "";
		
		// Function to process the text that lies between HTML tags. This function does the actual wrapping of
		// URLs with anchor tags.
		function autolinkText( text ) {
			text = text.replace( matcherRegex, function( match, $1, $2 ) {
				var actualMatch = $1,
				    twitterHandle = $2;  // in the form @twitterUser
				
				if( !actualMatch ) {
					// If this is not an actual match (i.e. the regular expression matched an anchor tag with
					// its inner text), then ignore it. Simply return the anchor tag from <a> to </a> unchanged.
					return match;
					
				} else {
					var anchorUrl = match,
					    anchorAttributes = [];
					
					// Process the urls that are found. We need to change URLs like "www.yahoo.com" to "http://www.yahoo.com" (or the browser
					// will try to direct the user to "http://jux.com/www.yahoo.com"), and we need to prefix 'mailto:' to email addresses.
					if( twitterHandle ) {
						twitterHandle = twitterHandle.substr( 1 );  // remove the preceding @ character
							anchorUrl = 'https://twitter.com/#!/' + twitterHandle;
					
					} else if( !/^(https?|ftp|mailto):/i.test( anchorUrl ) ) {  // string doesn't begin with http:, https:, ftp:, or mailto: ...
						if( anchorUrl.indexOf( '@' ) > -1 ) {
							anchorUrl = 'mailto:' + anchorUrl;   // handle the url being an email address by prefixing 'mailto:'
						} else {
							anchorUrl = 'http://' + anchorUrl;   // handle all other urls by prefixing 'http://'
						}
					}
					
					anchorAttributes.push( 'href="' + anchorUrl + '"' );
					if( newWindow ) {
						anchorAttributes.push( 'target="_blank"' );
					}
					
					return '<a ' + anchorAttributes.join( " " ) + '>' + match + '</a>';  // wrap the match in an anchor tag
				}
			} );
			
			return text;
		}
		
		
		// Loop over the HTML string, ignoring HTML tags, and processing the text that lies between them,
		// wrapping the URLs in anchor tags 
		while( ( currentResult = htmlRegex.exec( html ) ) !== null ) {
			var tagName = currentResult[ 1 ];
			if( tagName !== 'a' ) {  // leave anchor tags in there. The regular expression that autolinks will handle it, not linking anything between the start <a> and end </a> tags 
				// Pull the string from this match's index to the last index we got
				inBetweenTagsText = html.substring( lastIndex, currentResult.index );
				lastIndex = currentResult.index + currentResult[ 0 ].length;
				
				resultHtml += autolinkText( inBetweenTagsText ) + currentResult[ 0 ];  // link the text between tags, and then add the tag back to the resulting string
			}
		}
		
		// Process any remaining text after the last HTML element. Will process all of the text if there were no HTML elements.
		if( lastIndex < html.length ) {
			resultHtml += autolinkText( html.substring( lastIndex ) );
		}
		
		return resultHtml;
	}

};

/**
 * @member Autolinker
 * @private
 * @property {RegExp} matcherRegex
 * 
 * The regular expression that matches URLs, email addresses, and Twitter handles.
 * 
 * Capturing groups:
 * 
 * 1. Group that is used to determine if there is a match at all. The regex ignores anchor tags including their innerHTML,
 *    so we check this to see if it is defined to see if the match is legitimate.
 */
/*global Autolinker*/
Autolinker.matcherRegex = /<a\b[^<>]*>[\s\S]*?<\/a>|((@\w{1,15})|(?:(?:([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:[A-Za-z0-9\.\-]*[A-Za-z0-9\-]\.(com|org|net|gov|edu|mil|us|info|biz|ws|name|mobi|cc|tv|co\.uk|de|ru|hu|fr|br)))(?:(?:\/[\+~%\/\.\w\-]*)?(?:\?[\-\+=&;%@\.\w]*)?(?:#[\-\.\!\/\\\w%]*)?)?)/g;

