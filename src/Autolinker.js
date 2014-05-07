/*global define, module */
// Set up Autolinker appropriately for the environment.
( function( root, factory ) {
	if( typeof define === 'function' && define.amd ) {
		define( factory );             // Define as AMD module if an AMD loader is present (ex: RequireJS).
	} else if( typeof exports !== 'undefined' ) {
		module.exports = factory();    // Define as CommonJS module for Node.js, if available.
	} else {
		root.Autolinker = factory();   // Finally, define as a browser global if no module loader.
	}
}( this, function() {
	
	/**
	 * @class Autolinker
	 * @extends Object
	 * 
	 * Utility class used to process a given string of text, and wrap the URLs, email addresses, and Twitter handles in 
	 * the appropriate anchor (&lt;a&gt;) tags to turn them into links.
	 * 
	 * Any of the configuration options may be provided in an Object (map) provided to the Autolinker constructor, which
	 * will configure how the {@link #link link()} method will process the links.
	 * 
	 * For example:
	 * 
	 *     var autolinker = new Autolinker( {
	 *         newWindow : false,
	 *         truncate  : 30
	 *     } );
	 *     
	 *     var html = autolinker.link( "Joe went to www.yahoo.com" );
	 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
	 * 
	 * 
	 * The {@link #static-link static link()} method may also be used to inline options into a single call, which may
	 * be more convenient for one-off uses. For example:
	 * 
	 *     var html = Autolinker.link( "Joe went to www.yahoo.com", {
	 *         newWindow : false,
	 *         truncate  : 30
	 *     } );
	 *     // produces: 'Joe went to <a href="http://www.yahoo.com">yahoo.com</a>'
	 * 
	 * @constructor
	 * @param {Object} [config] The configuration options for the Autolinker instance, specified in an Object (map).
	 */
	var Autolinker = function( cfg ) {
		cfg = cfg || {};
		
		// Assign the properties of `cfg` onto the Autolinker instance
		for( var prop in cfg )
			if( cfg.hasOwnProperty( prop ) ) this[ prop ] = cfg[ prop ];
	};
	
	
	Autolinker.prototype = {
		constructor : Autolinker,  // fix constructor property
		
		/**
		 * @cfg {Boolean} newWindow
		 * 
		 * `true` if the links should open in a new window, `false` otherwise.
		 */
		newWindow : true,
		
		/**
		 * @cfg {Boolean} stripPrefix
		 * 
		 * `true` if 'http://' or 'https://' and/or the 'www.' should be stripped from the beginning of links, `false` otherwise.
		 */
		stripPrefix : true,
		
		/**
		 * @cfg {Number} truncate
		 * 
		 * A number for how many characters long URLs/emails/twitter handles should be truncated to inside the text of 
		 * a link. If the URL/email/twitter is over this number of characters, it will be truncated to this length by 
		 * adding a two period ellipsis ('..') into the middle of the string.
		 * 
		 * For example: A url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters might look
		 * something like this: 'http://www...th/to/a/file'
		 */
		
		/**
		 * @cfg {Boolean} twitter
		 * 
		 * `true` if Twitter handles ("@example") should be automatically linked, `false` if they should not be.
		 */
		twitter : true,
		
		/**
		 * @cfg {Boolean} email
		 * 
		 * `true` if email addresses should be automatically linked, `false` if they should not be.
		 */
		email : true,
		
		/**
		 * @cfg {Boolean} urls
		 * 
		 * `true` if miscellaneous URLs should be automatically linked, `false` if they should not be.
		 */
		urls : true,
		
		/**
		 * @cfg {String} className
		 * 
		 * A CSS class name to add to the generated links. This class will be added to all links, as well as this class
		 * plus url/email/twitter suffixes for styling url/email/twitter links differently.
		 * 
		 * For example, if this config is provided as "myLink", then:
		 * 
		 * 1) URL links will have the CSS classes: "myLink myLink-url"
		 * 2) Email links will have the CSS classes: "myLink myLink-email", and
		 * 3) Twitter links will have the CSS classes: "myLink myLink-twitter"
		 */
		className : "",
		
		
		/**
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
		matcherRegex: (function() {
			var twitterRegex = /(^|\s)@(\w{1,15})/,                 // For matching a twitter handle. Ex: @gregory_jacobs
				
				emailRegex = /(?:[\-;:&=\+\$,\w\.]+@)/,             // something@ for email addresses (a.k.a. local-part)
				
				protocolRegex = /(?:[A-Za-z]{3,9}:(?:\/\/)?)/,      // match protocol, allow in format http:// or mailto:
				wwwRegex = /(?:www\.)/,                             // starting with 'www.'
				domainNameRegex = /[A-Za-z0-9\.\-]*[A-Za-z0-9\-]/,  // anything looking at all like a domain, non-unicode domains, not ending in a period
				tldRegex = /\.(?:international|construction|contractors|enterprises|photography|productions|foundation|immobilien|industries|management|properties|technology|christmas|community|directory|education|equipment|institute|marketing|solutions|vacations|bargains|boutique|builders|catering|cleaning|clothing|computer|democrat|diamonds|graphics|holdings|lighting|partners|plumbing|supplies|training|ventures|academy|careers|company|cruises|domains|exposed|flights|florist|gallery|guitars|holiday|kitchen|neustar|okinawa|recipes|rentals|reviews|shiksha|singles|support|systems|agency|berlin|camera|center|coffee|condos|dating|estate|events|expert|futbol|kaufen|luxury|maison|monash|museum|nagoya|photos|repair|report|social|supply|tattoo|tienda|travel|viajes|villas|vision|voting|voyage|actor|build|cards|cheap|codes|dance|email|glass|house|mango|ninja|parts|photo|shoes|solar|today|tokyo|tools|watch|works|aero|arpa|asia|best|bike|blue|buzz|camp|club|cool|coop|farm|fish|gift|guru|info|jobs|kiwi|kred|land|limo|link|menu|mobi|moda|name|pics|pink|post|qpon|rich|ruhr|sexy|tips|vote|voto|wang|wien|wiki|zone|bar|bid|biz|cab|cat|ceo|com|edu|gov|int|kim|mil|net|onl|org|pro|pub|red|tel|uno|wed|xxx|xyz|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b/,   // match our known top level domains (TLDs)
				
				// Allow optional path, query string, and hash anchor, not ending in the following characters: "!:,.;"
				// http://blog.codinghorror.com/the-problem-with-urls/
				urlSuffixRegex = /(?:[\-A-Za-z0-9+&@#\/%?=~_()|!:,.;]*[\-A-Za-z0-9+&@#\/%=~_()|])?/;  // note: optional part of the full regex
			
			
			return new RegExp( [
				'(',  // *** Capturing group $1, which can be used to check for a twitter handle match. Use group $3 for the actual twitter handle though. $2 may be used to reconstruct the original string in a replace() 
					// *** Capturing group $2, which matches the whitespace character before the '@' sign (needed because of no lookbehinds), and 
					// *** Capturing group $3, which matches the actual twitter handle
					twitterRegex.source,
				')',
				
				'|',
				
				'(',  // *** Capturing group $4, which is used to determine an email match
					emailRegex.source,
					domainNameRegex.source,
					tldRegex.source,
				')',
				
				'|',
				
				'(',  // *** Capturing group $5, which is used to match a URL
					'(?:', // parens to cover match for protocol (optional), and domain
						'(?:',  // non-capturing paren for a protocol-prefixed url (ex: http://google.com) 
							protocolRegex.source,
							domainNameRegex.source,
						')',
						
						'|',
						
						'(?:',  // non-capturing paren for a 'www.' prefixed url (ex: www.google.com)
							wwwRegex.source,
							domainNameRegex.source,
						')',
						
						'|',
						
						'(?:',  // non-capturing paren for known a TLD url (ex: google.com)
							domainNameRegex.source,
							tldRegex.source,
						')',
					')',
					
					urlSuffixRegex.source,  // match for path, query string, and/or hash anchor
				')'
			].join( "" ), 'g' );
		} )(),
		
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
        htmlRegex : /<(\/)?([0-9a-zA-Z:]+)(?:(?:\s+[^\s\0"'>\/=\x01-\x1F\x7F]+(?:\s*=\s*(?:".*?"|'.*?'|[^'"=<>`\s]+))?)+\s*|\s*)\/?>/g,

		/**
		 * @private
		 * @property {RegExp} urlPrefixRegex
		 * 
		 * A regular expression used to remove the 'http://' or 'https://' and/or the 'www.' from URLs.
		 */
		urlPrefixRegex: /^(https?:\/\/)?(www\.)?/,
		
		
		/**
		 * Automatically links URLs, email addresses, and Twitter handles found in the given chunk of HTML. 
		 * Does not link URLs found within HTML tags.
		 * 
		 * For instance, if given the text: `You should go to http://www.yahoo.com`, then the result
		 * will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
		 * 
		 * @method link
		 * @param {String} textOrHtml The HTML or text to link URLs, email addresses, and Twitter handles within.
		 * @return {String} The HTML, with URLs/emails/twitter handles automatically linked.
		 */
		link : function( textOrHtml ) {
			return this.processHtml( textOrHtml );
		},
		
		
		/**
		 * Processes the given HTML to auto-link URLs/emails/Twitter handles.
		 * 
		 * Finds the text around any HTML elements in the input `html`, which will be the text that is processed.
		 * Any original HTML elements will be left as-is, as well as the text that is already wrapped in anchor tags.
		 * 
		 * @private
		 * @method processHtml
		 * @param {String} html The input text or HTML to process in order to auto-link.
		 * @return {String}
		 */
		processHtml : function( html ) {
			// Loop over the HTML string, ignoring HTML tags, and processing the text that lies between them,
			// wrapping the URLs in anchor tags
			var htmlRegex = this.htmlRegex,
			    currentResult,
			    inBetweenTagsText,
			    lastIndex = 0,
			    anchorTagStackCount = 0,
			    resultHtml = [];
			
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
						resultHtml.push( this.processTextNode( inBetweenTagsText ) );
						
					} else {   // it's the end </a> tag
						anchorTagStackCount--;	
						if( anchorTagStackCount === 0 ) {
							resultHtml.push( inBetweenTagsText );  // We hit the matching </a> tag, simply add all of the text from the start <a> tag to the end </a> tag without linking it
						}
					}
					
				} else if( anchorTagStackCount === 0 ) {   // not within an anchor tag, link the "in between" text
					resultHtml.push( this.processTextNode( inBetweenTagsText ) );
				}
				
				resultHtml.push( tagText );  // now add the text of the tag itself verbatim
			}
			
			// Process any remaining text after the last HTML element. Will process all of the text if there were no HTML elements.
			if( lastIndex < html.length ) {
				var processedTextNode = this.processTextNode( html.substring( lastIndex ) );
				resultHtml.push( processedTextNode );
			}
			
			return resultHtml.join( "" );
		},
		
		
		/**
		 * Process the text that lies inbetween HTML tags. This method does the actual wrapping of URLs with
		 * anchor tags.
		 * 
		 * @private
		 * @param {String} text The text to auto-link.
		 * @return {String} The text with anchor tags auto-filled.
		 */
		processTextNode : function( text ) {
			var me = this,  // for closures
			    matcherRegex = this.matcherRegex,
				enableTwitter = this.twitter,
				enableEmailAddresses = this.email,
				enableUrls = this.urls;
			
			return text.replace( matcherRegex, function( matchStr, $1, $2, $3, $4, $5 ) {
				var twitterMatch = $1,
					twitterHandlePrefixWhitespaceChar = $2,  // The whitespace char before the @ sign in a Twitter handle match. This is needed because of no lookbehinds in JS regexes
					twitterHandle = $3,  // The actual twitterUser (i.e the word after the @ sign in a Twitter handle match)
					emailAddress = $4,   // For both determining if it is an email address, and stores the actual email address
					urlMatch = $5,       // The matched URL string
					
					prefixStr = "",      // A string to use to prefix the anchor tag that is created. This is needed for the Twitter handle match
					suffixStr = "";      // A string to suffix the anchor tag that is created. This is used if there is a trailing parenthesis that should not be auto-linked.
				
				// Handle a closing parenthesis at the end of the match, and exclude it if there is not a matching open parenthesis
				// in the match. This handles cases like the string "wikipedia.com/something_(disambiguation)" (which should be auto-
				// linked, and when it is enclosed in parenthesis itself, such as: "(wikipedia.com/something_(disambiguation))" (in
				// which the outer parens should *not* be auto-linked.
				var lastChar = matchStr.charAt( matchStr.length - 1 );
				if( lastChar === ')' ) {
					var openParensMatch = matchStr.match( /\(/g ),
						closeParensMatch = matchStr.match( /\)/g ),
						numOpenParens = ( openParensMatch && openParensMatch.length ) || 0,
						numCloseParens = ( closeParensMatch && closeParensMatch.length ) || 0;
					
					if( numOpenParens < numCloseParens ) {
						matchStr = matchStr.substr( 0, matchStr.length - 1 );  // remove the trailing ")"
						suffixStr = ")";  // this will be added after the <a> tag
					}
				}
				
				
				var anchorHref = matchStr,  // initialize both of these
					anchorText = matchStr;  // values as the full match

				if( ( twitterMatch && !enableTwitter ) || ( emailAddress && !enableEmailAddresses ) || ( urlMatch && !enableUrls ) ) {
					// A disabled link type
					return prefixStr + anchorText + suffixStr;
				}
				
				// Process the urls that are found. We need to change URLs like "www.yahoo.com" to "http://www.yahoo.com" (or the browser
				// will try to direct the user to "http://current-domain.com/www.yahoo.com"), and we need to prefix 'mailto:' to email addresses.
				var linkType = 'url';
				if( twitterMatch ) {
					linkType = 'twitter';
					prefixStr = twitterHandlePrefixWhitespaceChar;
					anchorHref = 'https://twitter.com/' + twitterHandle;
					anchorText = '@' + twitterHandle;
				} else if( emailAddress ) {
					linkType = 'email';
					anchorHref = 'mailto:' + emailAddress;
					anchorText = emailAddress;
				} else if( !/^[A-Za-z]{3,9}:/i.test( anchorHref ) ) {  // url string doesn't begin with a protocol, assume http://
					anchorHref = 'http://' + anchorHref;
				}

				// wrap the match in an anchor tag
				var anchorTag = me.createAnchorTag( linkType, anchorHref, anchorText );
				return prefixStr + anchorTag + suffixStr;
			} );
		},
		
		
		/**
		 * Generates the actual anchor (&lt;a&gt;) tag to use in place of a source url/email/twitter link.
		 * 
		 * @private
		 * @param {"url"/"email"/"twitter"} linkType The type of link that an anchor tag is being generated for.
		 * @param {String} anchorHref The href for the anchor tag.
		 * @param {String} anchorText The anchor tag's text (i.e. what will be displayed).
		 * @return {String} The full HTML for the anchor tag.
		 */
		createAnchorTag : function( linkType, anchorHref, anchorText ) {
			var attributesStr = this.createAnchorAttrsStr( linkType, anchorHref );
			anchorText = this.processAnchorText( anchorText );
			
			return '<a ' + attributesStr + '>' + anchorText + '</a>';
		},
		
		
		/**
		 * Creates the string which will be the HTML attributes for the anchor (&lt;a&gt;) tag being generated.
		 * 
		 * @private
		 * @param {"url"/"email"/"twitter"} linkType The type of link that an anchor tag is being generated for.
		 * @param {String} href The href for the anchor tag.
		 * @return {String} The anchor tag's attribute. Ex: `href="http://google.com" class="myLink myLink-url" target="_blank"` 
		 */
		createAnchorAttrsStr : function( linkType, anchorHref ) {
			var attrs = [ 'href="' + anchorHref + '"' ];  // we'll always have the `href` attribute
			
			var cssClass = this.createCssClass( linkType );
			if( cssClass ) {
				attrs.push( 'class="' + cssClass + '"' );
			}
			if( this.newWindow ) {
				attrs.push( 'target="_blank"' );
			}
			
			return attrs.join( " " );
		},
		
		
		/**
		 * Creates the CSS class that will be used for a given anchor tag, based on the `linkType` and the {@link #className}
		 * config.
		 * 
		 * @private
		 * @param {"url"/"email"/"twitter"} linkType The type of link that an anchor tag is being generated for.
		 * @return {String} The CSS class string for the link. Example return: "myLink myLink-url". If no {@link #className}
		 *   was configured, returns an empty string.
		 */
		createCssClass : function( linkType ) {
			var className = this.className;
			
			if( !className ) 
				return "";
			else
				return className + " " + className + "-" + linkType;  // ex: "myLink myLink-url", "myLink myLink-email", or "myLink myLink-twitter"
		},
		
		
		/**
		 * Processes the `anchorText` by stripping the URL prefix (if {@link #stripPrefix} is `true`), removing
		 * any trailing slash, and truncating the text according to the {@link #truncate} config.
		 * 
		 * @private
		 * @param {String} anchorText The anchor tag's text (i.e. what will be displayed).
		 * @return {String} The processed `anchorText`.
		 */
		processAnchorText : function( anchorText ) {
			if( this.stripPrefix ) {
				anchorText = this.stripUrlPrefix( anchorText );
			}
			anchorText = this.removeTrailingSlash( anchorText );  // remove trailing slash, if there is one
			anchorText = this.doTruncate( anchorText );
			
			return anchorText;
		},
		
		
		/**
		 * Strips the URL prefix (such as "http://" or "https://") from the given text.
		 * 
		 * @private
		 * @param {String} text The text of the anchor that is being generated, for which to strip off the
		 *   url prefix (such as stripping off "http://")
		 * @return {String} The `anchorText`, with the prefix stripped.
		 */
		stripUrlPrefix : function( text ) {
			return text.replace( this.urlPrefixRegex, '' );
		},
		
		
		/**
		 * Removes any trailing slash from the given `anchorText`, in prepration for the text to be displayed.
		 * 
		 * @private
		 * @param {String} anchorText The text of the anchor that is being generated, for which to remove any trailing
		 *   slash ('/') that may exist.
		 * @return {String} The `anchorText`, with the trailing slash removed.
		 */
		removeTrailingSlash : function( anchorText ) {
			if( anchorText.charAt( anchorText.length - 1 ) === '/' ) {
				anchorText = anchorText.slice( 0, -1 );
			}
			return anchorText;
		},
		
		
		/**
		 * Performs the truncation of the `anchorText`, if the `anchorText` is longer than the {@link #truncate} option.
		 * Truncates the text to 2 characters fewer than the {@link #truncate} option, and adds ".." to the end.
		 * 
		 * @private
		 * @param {String} text The anchor tag's text (i.e. what will be displayed).
		 * @return {String} The truncated anchor text.
		 */
		doTruncate : function( anchorText ) {
			var truncateLen = this.truncate;
			
			// Truncate the anchor text if it is longer than the provided 'truncate' option
			if( truncateLen && anchorText.length > truncateLen ) {
				anchorText = anchorText.substring( 0, truncateLen - 2 ) + '..';
			}
			return anchorText;
		}
	
	};
	
	
	/**
	 * Automatically links URLs, email addresses, and Twitter handles found in the given chunk of HTML. 
	 * Does not link URLs found within HTML tags.
	 * 
	 * For instance, if given the text: `You should go to http://www.yahoo.com`, then the result
	 * will be `You should go to &lt;a href="http://www.yahoo.com"&gt;http://www.yahoo.com&lt;/a&gt;`
	 * 
	 * Example:
	 * 
	 *     var linkedText = Autolinker.link( "Go to google.com", { newWindow: false } );
	 *     // Produces: "Go to <a href="http://google.com">google.com</a>"
	 * 
	 * @static
	 * @method link
	 * @param {String} html The HTML text to link URLs within.
	 * @param {Object} [options] Any of the configuration options for the Autolinker class, specified in an Object (map).
	 *   See the class description for an example call.
	 * @return {String} The HTML text, with URLs automatically linked
	 */
	Autolinker.link = function( text, options ) {
		var autolinker = new Autolinker( options );
		return autolinker.link( text );
	};

	
	return Autolinker;
	
} ) );
