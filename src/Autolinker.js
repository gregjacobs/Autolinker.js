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
	Autolinker.Util.assign( this, cfg );  // assign the properties of `cfg` onto the Autolinker instance. Prototype properties will be used for missing configs.
};


Autolinker.prototype = {
	constructor : Autolinker,  // fix constructor property
	
	/**
	 * @cfg {Boolean} urls
	 * 
	 * `true` if miscellaneous URLs should be automatically linked, `false` if they should not be.
	 */
	urls : true,
	
	/**
	 * @cfg {Boolean} email
	 * 
	 * `true` if email addresses should be automatically linked, `false` if they should not be.
	 */
	email : true,
	
	/**
	 * @cfg {Boolean} twitter
	 * 
	 * `true` if Twitter handles ("@example") should be automatically linked, `false` if they should not be.
	 */
	twitter : true,
	
	/**
	 * @cfg {Boolean} newWindow
	 * 
	 * `true` if the links should open in a new window, `false` otherwise.
	 */
	newWindow : true,
	
	/**
	 * @cfg {Boolean} stripPrefix
	 * 
	 * `true` if 'http://' or 'https://' and/or the 'www.' should be stripped from the beginning of URL links' text, 
	 * `false` otherwise.
	 */
	stripPrefix : true,
	
	/**
	 * @cfg {Number} truncate
	 * 
	 * A number for how many characters long URLs/emails/twitter handles should be truncated to inside the text of 
	 * a link. If the URL/email/twitter is over this number of characters, it will be truncated to this length by 
	 * adding a two period ellipsis ('..') to the end of the string.
	 * 
	 * For example: A url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters might look
	 * something like this: 'yahoo.com/some/long/pat..'
	 */
	
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
	 * @property {RegExp} htmlRegex
	 * 
	 * The regular expression used to pull out HTML tags from a string. Handles namespaced HTML tags and
	 * attribute names, as specified by http://www.w3.org/TR/html-markup/syntax.html.
	 * 
	 * Capturing groups:
	 * 
	 * 1. If it is an end tag, this group will have the '/'.
	 * 2. The tag name.
	 */
	htmlRegex : (function() {
		var tagNameRegex = /[0-9a-zA-Z:]+/,
		    attrNameRegex = /[^\s\0"'>\/=\x01-\x1F\x7F]+/,   // the unicode range accounts for excluding control chars, and the delete char
		    attrValueRegex = /(?:".*?"|'.*?'|[^'"=<>`\s]+)/, // double quoted, single quoted, or unquoted attribute values
		    nameEqualsValueRegex = attrNameRegex.source + '(?:\\s*=\\s*' + attrValueRegex.source + ')?';  // optional '=[value]'
		
		return new RegExp( [
			'<(?:!|(/))?',  // Beginning of a tag. Either '<' for a start tag, '</' for an end tag, or <! for the <!DOCTYPE ...> tag. The slash or an empty string is Capturing Group 1.
			
				// The tag name (Capturing Group 2)
				'(' + tagNameRegex.source + ')',
				
				// Zero or more attributes following the tag name
				'(?:',
					'\\s+',  // one or more whitespace chars before an attribute
					
					// Either:
					// A. tag="value", or 
					// B. "value" alone (for <!DOCTYPE> tag. Ex: <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">) 
					'(?:', nameEqualsValueRegex, '|', attrValueRegex.source + ')',
				')*',
				
				'\\s*/?',  // any trailing spaces and optional '/' before the closing '>'
			'>'
		].join( "" ), 'g' );
	} )(),

	/**
	 * @private
	 * @property {RegExp} htmlCharacterEntities
	 *
	 * The regular expression that matches common HTML character entities.
	 * 
	 * Ignoring &amp; as it coule be part of a query string, handling it separately
	 */
	htmlCharacterEntities: /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;)/i,
	
	/**
	 * @private
	 * @property {RegExp} matcherRegex
	 * 
	 * The regular expression that matches URLs, email addresses, and Twitter handles.
	 * 
	 * This regular expression has the following capturing groups:
	 * 
	 * 1. Group that is used to determine if there is a Twitter handle match (i.e. @someTwitterUser). Simply check for its 
	 *    existence to determine if there is a Twitter handle match. The next couple of capturing groups give information 
	 *    about the Twitter handle match.
	 * 2. The whitespace character before the @sign in a Twitter handle. This is needed because there are no lookbehinds in
	 *    JS regular expressions, and can be used to reconstruct the original string in a replace().
	 * 3. The Twitter handle itself in a Twitter match. If the match is '@someTwitterUser', the handle is 'someTwitterUser'.
	 * 4. Group that matches an email address. Used to determine if the match is an email address, as well as holding the full 
	 *    address. Ex: 'me@my.com'
	 * 5. Group that matches a URL in the input text. Ex: 'http://google.com', 'www.google.com', or just 'google.com'.
	 *    This also includes a path, url parameters, or hash anchors. Ex: google.com/path/to/file?q1=1&q2=2#myAnchor
	 * 6. A protocol-relative ('//') match for the case of a 'www.' prefixed URL. Will be an empty string if it is not a 
	 *    protocol-relative match. We need to know the character before the '//' in order to determine if it is a valid match
	 *    or the // was in a string we don't want to auto-link.
	 * 7. A protocol-relative ('//') match for the case of a known TLD prefixed URL. Will be an empty string if it is not a 
	 *    protocol-relative match. See #6 for more info. 
	 */
	matcherRegex : (function() {
		var twitterRegex = /(^|[^\w])@(\w{1,15})/,              // For matching a twitter handle. Ex: @gregory_jacobs
		    
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
						'(.?//)?',  // *** Capturing group $6 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
						wwwRegex.source,
						domainNameRegex.source,
					')',
					
					'|',
					
					'(?:',  // non-capturing paren for known a TLD url (ex: google.com)
						'(.?//)?',  // *** Capturing group $7 for an optional protocol-relative URL. Must be at the beginning of the string or start with a non-word character
						domainNameRegex.source,
						tldRegex.source,
					')',
				')',
				
				urlSuffixRegex.source,  // match for path, query string, and/or hash anchor
			')'
		].join( "" ), 'gi' );
	} )(),
	
	/**
	 * @private
	 * @property {RegExp} invalidProtocolRelMatchRegex
	 * 
	 * The regular expression used to check a potential protocol-relative URL match, coming from the {@link #matcherRegex}. 
	 * A protocol-relative URL is, for example, "//yahoo.com"
	 * 
	 * This regular expression is used in conjunction with the {@link #matcherRegex}, and checks to see if there is a word character
	 * before the '//' in order to determine if we should actually autolink a protocol-relative URL. This is needed because there
	 * is no negative look-behind in JavaScript regular expressions. 
	 * 
	 * For instance, we want to autolink something like "//google.com", but we don't want to autolink something 
	 * like "abc//google.com"
	 */
	invalidProtocolRelMatchRegex : /^[\w]\/\//,
	
	/**
	 * @private
	 * @property {RegExp} charBeforeProtocolRelMatchRegex
	 * 
	 * The regular expression used to retrieve the character before a protocol-relative URL match.
	 * 
	 * This is used in conjunction with the {@link #matcherRegex}, which needs to grab the character before a protocol-relative
	 * '//' due to the lack of a negative look-behind in JavaScript regular expressions. The character before the match is stripped
	 * from the URL.
	 */
	charBeforeProtocolRelMatchRegex : /^(.)?\/\//,
	
	
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
	 * Lazily instantiates and returns the {@link #anchorTagBuilder} instance for this Autolinker instance.
	 * 
	 * @return {Autolinker.AnchorTagBuilder}
	 */
	getAnchorTagBuilder : function() {
		var anchorTagBuilder = this.anchorTagBuilder;
		
		if( !anchorTagBuilder ) {
			anchorTagBuilder = this.anchorTagBuilder = new Autolinker.AnchorTagBuilder( {
				newWindow   : this.newWindow,
				stripPrefix : this.stripPrefix,
				truncate    : this.truncate,
				className   : this.className
			} );
		}
		
		return anchorTagBuilder;
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
		    resultHtml = [],
			htmlCharacterEntities = this.htmlCharacterEntities,
			unescapedText,
			textToProcess,
			i;
		
		while( ( currentResult = htmlRegex.exec( html ) ) !== null ) {
			var tagText = currentResult[ 0 ],
			    tagName = currentResult[ 2 ],
			    isClosingTag = !!currentResult[ 1 ];
			
			inBetweenTagsText = html.substring( lastIndex, currentResult.index );
			lastIndex = currentResult.index + tagText.length;

			//split at html entities
			unescapedText = inBetweenTagsText.split( htmlCharacterEntities );

			for ( i = 0; i < unescapedText.length; i++ ) {
				textToProcess = unescapedText[i];

				// Process around anchor tags, and any inner text / html they may have
				if( tagName === 'a' ) {
					if( !isClosingTag ) {  // it's the start <a> tag
						anchorTagStackCount++;
						resultHtml.push( this.processTextNode( textToProcess ) );

					} else {   // it's the end </a> tag
						anchorTagStackCount = Math.max( anchorTagStackCount - 1, 0 );  // attempt to handle extraneous </a> tags by making sure the stack count never goes below 0
						if( anchorTagStackCount === 0 ) {
							resultHtml.push( textToProcess );  // We hit the matching </a> tag, simply add all of the text from the start <a> tag to the end </a> tag without linking it
						}
					}

				} else if( anchorTagStackCount === 0 ) {   // not within an anchor tag, link the "in between" text
					resultHtml.push( this.processTextNode( textToProcess ) );

				} else {
					// if we have a tag that is in between anchor tags (ex: <a href="..."><b>google.com</b></a>),
					// just append the inner text
					resultHtml.push( textToProcess );
				}
			}
			
			resultHtml.push( tagText );  // now add the text of the tag itself verbatim
		}
		
		// Process any remaining text after the last HTML element. Will process all of the text if there were no HTML elements.
		if( lastIndex < html.length ) {
			//split at html entities
			unescapedText = html.substring( lastIndex ).split( htmlCharacterEntities );

			for ( i = 0; i < unescapedText.length; i++ ) {
				textToProcess = unescapedText[i];
				var processedTextNode = this.processTextNode( textToProcess );
				resultHtml.push( processedTextNode );
			}
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
		var me = this,  // for closure
		    invalidProtocolRelMatchRegex = this.invalidProtocolRelMatchRegex,
		    charBeforeProtocolRelMatchRegex = this.charBeforeProtocolRelMatchRegex,
		    anchorTagBuilder = this.getAnchorTagBuilder();
		
		return text.replace( this.matcherRegex, function( matchStr, $1, $2, $3, $4, $5, $6, $7 ) {
			var twitterMatch = $1,
			    twitterHandlePrefixWhitespaceChar = $2,  // The whitespace char before the @ sign in a Twitter handle match. This is needed because of no lookbehinds in JS regexes
			    twitterHandle = $3,      // The actual twitterUser (i.e the word after the @ sign in a Twitter handle match)
			    emailAddressMatch = $4,  // For both determining if it is an email address, and stores the actual email address
			    urlMatch = $5,           // The matched URL string
			    protocolRelativeMatch = $6 || $7,  // The '//' for a protocol-relative match, with the character that comes before the '//'
			    
			    prefixStr = "",       // A string to use to prefix the anchor tag that is created. This is needed for the Twitter handle match
			    suffixStr = "",       // A string to suffix the anchor tag that is created. This is used if there is a trailing parenthesis that should not be auto-linked.
			    
			    match;  // Will be an Autolinker.Match object
			
			
			// Return out with no changes for match types that are disabled (url, email, twitter), or for matches
			// that are invalid.
			if( !me.isValidMatch( twitterMatch, emailAddressMatch, urlMatch, protocolRelativeMatch ) ) {
				return matchStr;
			}
			
			
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
			
			
			if( twitterMatch ) {
				prefixStr = twitterHandlePrefixWhitespaceChar;
				match = new Autolinker.TwitterMatch( { twitterHandle: twitterHandle } );
				
			} else if( emailAddressMatch ) {
				match = new Autolinker.EmailMatch( { emailAddress: emailAddressMatch } );
				
			} else {  // url match
				// If it's a protocol-relative '//' match, remove the character before the '//' (which the matcherRegex needed
				// to match due to the lack of a negative look-behind in JavaScript regular expressions)
				if( protocolRelativeMatch ) {
					var charBeforeMatch = protocolRelativeMatch.match( charBeforeProtocolRelMatchRegex )[ 1 ] || "";
					
					if( charBeforeMatch ) {
						prefixStr = charBeforeMatch;  // re-add the character before the '//' to what will be placed before the generated <a> tag
						matchStr = matchStr.slice( 1 );
					}
				}
				
				match = new Autolinker.UrlMatch( { url: matchStr, protocolRelativeMatch: protocolRelativeMatch } );
			}

			// wrap the match in an anchor tag
			var anchorTag = anchorTagBuilder.createAnchorTag( match.getType(), match.getAnchorHref(), match.getAnchorText() );
			return prefixStr + anchorTag + suffixStr;
		} );
	},
	
	
	/**
	 * Determines if a given match found by {@link #processTextNode} is valid. Will return `false` for:
	 * 
	 * 1) Disabled link types (i.e. having a Twitter match, but {@link #twitter} matching is disabled)
	 * 2) URL matches which do not have at least have one period ('.') in the domain name (effectively skipping over 
	 *    matches like "abc:def")
	 * 3) A protocol-relative url match (a URL beginning with '//') whose previous character is a word character 
	 *    (effectively skipping over strings like "abc//google.com")
	 * 
	 * Otherwise, returns `true`.
	 * 
	 * @private
	 * @param {String} twitterMatch The matched Twitter handle, if there was one. Will be empty string if the match is not a 
	 *   Twitter match.
	 * @param {String} emailAddressMatch The matched Email address, if there was one. Will be empty string if the match is not 
	 *   an Email address match.
	 * @param {String} urlMatch The matched URL, if there was one. Will be an empty string if the match is not a URL match.
	 * @param {String} protocolRelativeMatch The protocol-relative string for a URL match (i.e. '//'), possibly with a preceding
	 *   character (ex, a space, such as: ' //', or a letter, such as: 'a//'). The match is invalid if there is a word character
	 *   preceding the '//'.
	 * @return {Boolean} `true` if the match given is valid and should be processed, or `false` if the match is invalid and/or 
	 *   should just not be processed (such as, if it's a Twitter match, but {@link #twitter} matching is disabled}.
	 */
	isValidMatch : function( twitterMatch, emailAddressMatch, urlMatch, protocolRelativeMatch ) {
		if( 
		    ( twitterMatch && !this.twitter ) || ( emailAddressMatch && !this.email ) || ( urlMatch && !this.urls ) ||
		    ( urlMatch && urlMatch.indexOf( '.' ) === -1 ) ||  // At least one period ('.') must exist in the URL match for us to consider it an actual URL
		    ( urlMatch && /^[A-Za-z]{3,9}:/.test( urlMatch ) && !/:.*?[A-Za-z]/.test( urlMatch ) ) ||     // At least one letter character must exist in the domain name after a protocol match. Ex: skip over something like "git:1.0"
		    ( protocolRelativeMatch && this.invalidProtocolRelMatchRegex.test( protocolRelativeMatch ) )  // a protocol-relative match which has a word character in front of it (so we can skip something like "abc//google.com")
		) {
			return false;
		}
		
		return true;
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
