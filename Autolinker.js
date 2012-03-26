/*!
 * Autolinker.js
 * Version 0.3.1
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
	 * 1. If it is an end tag, this group will have the '/'.
	 * 2. The tag name.
	 */
	htmlRegex : /<(\/)?(\w+)(?:(?:\s+\w+(?:\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g,
	
	
	
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
	 * @param {Number} [options.truncate] A number for how many characters long URLs/emails/twitter handles should be truncated to
	 *   inside the text of a link. If the URL/email/twitter is over the number of characters, it will be truncated to this length by 
	 *   adding a two period ellipsis ('..') into the middle of the string.
	 *   Ex: a url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters might look like this: 'http://www...th/to/a/file'
	 * @return {String} The HTML text, with URLs automatically linked
	 */
	link : function( html, options ) {
		options = options || {};
		
		var htmlRegex = Autolinker.htmlRegex,         // full path for friendly
		    matcherRegex = Autolinker.matcherRegex,   // out-of-scope calls
		    newWindow = ( 'newWindow' in options ) ? options.newWindow : true,  // defaults to true
		    truncate = options.truncate,
		    currentResult, 
		    lastIndex = 0,
		    inBetweenTagsText,
		    resultHtml = "",
		    anchorTagStackCount = 0;
		
		// Function to process the text that lies between HTML tags. This function does the actual wrapping of
		// URLs with anchor tags.
		function autolinkText( text ) {
			text = text.replace( matcherRegex, function( match, $1, $2, $3, $4, $5 ) {
				var twitterMatch = $1,
				    twitterHandlePrefixWhitespaceChar = $2,  // The whitespace char before the @ sign in a Twitter handle match. This is needed because of no lookbehinds in JS regexes
				    twitterHandle = $3, // The actual twitterUser (i.e the word after the @ sign in a Twitter handle match)
				    emailAddress = $4,   // For both determining if it is an email address, and stores the actual email address
				    
				    prefixStr = "",     // A string to use to prefix the anchor tag that is created. This is needed for the Twitter handle match
				    anchorHref = "",
				    anchorText = "";
				
				
				var anchorAttributes = [];
				anchorHref = match;  // initialize both of these
				anchorText = match;  // values as the full match
				
				// Process the urls that are found. We need to change URLs like "www.yahoo.com" to "http://www.yahoo.com" (or the browser
				// will try to direct the user to "http://jux.com/www.yahoo.com"), and we need to prefix 'mailto:' to email addresses.
				if( twitterMatch ) {
					prefixStr = twitterHandlePrefixWhitespaceChar;
					anchorHref = 'https://twitter.com/' + twitterHandle;
					anchorText = '@' + twitterHandle;
				
				} else if( emailAddress ) {
					anchorHref = 'mailto:' + emailAddress;
					anchorText = emailAddress;
				
				} else if( !/^[A-Za-z]{3,9}:/i.test( anchorHref ) ) {  // string doesn't begin with a protocol, add http://
					anchorHref = 'http://' + anchorHref;   // handle all other urls by prefixing 'http://'
				}
				
				// Set the attributes for the anchor tag
				anchorAttributes.push( 'href="' + anchorHref + '"' );
				if( newWindow ) {
					anchorAttributes.push( 'target="_blank"' );
				}
				
				// Truncate the anchor text if it is longer than the provided 'truncate' option
				if( truncate && anchorText.length > truncate ) {
					var startStrTruncateLength = Math.floor( truncate / 2 ) - 1,  // -1 for one of the two dots in the '..' ellipsis
					    endStrTruncateLength = Math.ceil( truncate / 2 ) - 1;     // -1 for one of the two dots in the '..' ellipsis
					
					anchorText = 
						anchorText.substring( 0, startStrTruncateLength ) +                // take the beginning part of the full string
						'..' +    // add the ellipsis in the middle
						anchorText.substring( anchorText.length - endStrTruncateLength );  // take the end part of the full string
				}
				
				return prefixStr + '<a ' + anchorAttributes.join( " " ) + '>' + anchorText + '</a>';  // wrap the match in an anchor tag
			} );
			
			return text;
		}
		
		
		// Loop over the HTML string, ignoring HTML tags, and processing the text that lies between them,
		// wrapping the URLs in anchor tags 
		while( ( currentResult = htmlRegex.exec( html ) ) !== null ) {
			var tagText = currentResult[ 0 ],
			    tagName = currentResult[ 2 ],
			    isClosingTag = !!currentResult[ 1 ];
			
			inBetweenTagsText = html.substring( lastIndex, currentResult.index );
			lastIndex = currentResult.index + tagText.length;
			
			// Process around anchor tags, and any inner text / html they may have
			if( tagName === 'a' ) {
				if( !isClosingTag ) {  // it's the start <a> tag
					anchorTagStackCount++;
					resultHtml += autolinkText( inBetweenTagsText );
					
				} else {     // it's the end </a> tag
					anchorTagStackCount--;	
					if( anchorTagStackCount === 0 ) {
						resultHtml += inBetweenTagsText;  // We hit the matching </a> tag, simply add all of the text from the start <a> tag to the end </a> tag without linking it
					}
				}
				
			} else if( anchorTagStackCount === 0 ) {   // not within an anchor tag, link the "in between" text
				resultHtml += autolinkText( inBetweenTagsText );
			}
			
			resultHtml += tagText;  // now add the text of the tag itself verbatim
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
 * 1. Group that is used to determine if there is a Twitter handle match (i.e. @someTwitterUser). Simply check for its existence
 *    to determine if there is a Twitter handle match. The next couple of capturing groups give information about the Twitter 
 *    handle match.
 * 2. The whitespace character before the @sign in a Twitter handle. This is needed because there are no lookbehinds in JS regular
 *    expressions, and can be used to reconstruct the original string in a replace().
 * 3. The Twitter handle itself in a Twitter match. If the match is '@someTwitterUser', the handle is 'someTwitterUser'.
 * 4. Group that matches an email address. Used to determine if the match is an email address, as well as holding the full address.
 *    Ex: 'me@my.com'
 * 5. Group that matches a URL in the input text. Ex: 'http://google.com', 'www.google.com', or just 'google.com'.
 *    This also includes a path, url parameters, or hash anchors. Ex: google.com/path/to/file?q1=1&q2=2#myAnchor
 */
/*global Autolinker*/
Autolinker.matcherRegex = /((^|\s)@(\w{1,15}))|((?:[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+\.[A-Za-z0-9\.\-]+)|((?:(?:(?:[A-Za-z]{3,9}:(?:\/\/)?)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:(?:www\.)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:[A-Za-z0-9\.\-]*[A-Za-z0-9\-]\.(?:com|org|net|gov|edu|mil|us|info|biz|ws|name|mobi|cc|tv|co\.uk|de|ru|hu|fr|br)))(?:(?:\/[\+~%\/\.\w\-]*)?(?:\?[\-\+=&;%@\.\w]*)?(?:#[\-\.\!\/\\\w%]*)?)?)/g;

