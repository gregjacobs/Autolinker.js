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
Autolinker.matcherRegex = (function() {
	var twitterRegex = /(^|\s)@(\w{1,15})/,                 // For matching a twitter handle. Ex: @gregory_jacobs
	    
	    emailRegex = /(?:[\-;:&=\+\$,\w\.]+@)/,             // something@ for email addresses (a.k.a. local-part)
	    
	    protocolRegex = /(?:[A-Za-z]{3,9}:(?:\/\/)?)/,      // match protocol, allow in format http:// or mailto:
	    wwwRegex = /(?:www\.)/,                             // starting with 'www.'
	    domainNameRegex = /[A-Za-z0-9\.\-]*[A-Za-z0-9\-]/,  // anything looking at all like a domain, non-unicode domains, not ending in a period
	    tldRegex = /\.(?:international|construction|contractors|enterprises|photography|productions|foundation|immobilien|industries|management|properties|technology|christmas|community|directory|education|equipment|institute|marketing|solutions|vacations|bargains|boutique|builders|catering|cleaning|clothing|computer|democrat|diamonds|graphics|holdings|lighting|partners|plumbing|supplies|training|ventures|academy|careers|company|cruises|domains|exposed|flights|florist|gallery|guitars|holiday|kitchen|neustar|okinawa|recipes|rentals|reviews|shiksha|singles|support|systems|agency|berlin|camera|center|coffee|condos|dating|estate|events|expert|futbol|kaufen|luxury|maison|monash|museum|nagoya|photos|repair|report|social|supply|tattoo|tienda|travel|viajes|villas|vision|voting|voyage|actor|build|cards|cheap|codes|dance|email|glass|house|mango|ninja|parts|photo|shoes|solar|today|tokyo|tools|watch|works|aero|arpa|asia|best|bike|blue|buzz|camp|club|cool|coop|farm|fish|gift|guru|info|jobs|kiwi|kred|land|limo|link|menu|mobi|moda|name|pics|pink|post|qpon|rich|ruhr|sexy|tips|vote|voto|wang|wien|wiki|zone|bar|bid|biz|cab|cat|ceo|com|edu|gov|int|kim|mil|net|onl|org|pro|pub|red|tel|uno|wed|xxx|xyz|ac|ad|ae|af|ag|ai|al|am|an|ao|aq|ar|as|at|au|aw|ax|az|ba|bb|bd|be|bf|bg|bh|bi|bj|bm|bn|bo|br|bs|bt|bv|bw|by|bz|ca|cc|cd|cf|cg|ch|ci|ck|cl|cm|cn|co|cr|cu|cv|cw|cx|cy|cz|de|dj|dk|dm|do|dz|ec|ee|eg|er|es|et|eu|fi|fj|fk|fm|fo|fr|ga|gb|gd|ge|gf|gg|gh|gi|gl|gm|gn|gp|gq|gr|gs|gt|gu|gw|gy|hk|hm|hn|hr|ht|hu|id|ie|il|im|in|io|iq|ir|is|it|je|jm|jo|jp|ke|kg|kh|ki|km|kn|kp|kr|kw|ky|kz|la|lb|lc|li|lk|lr|ls|lt|lu|lv|ly|ma|mc|md|me|mg|mh|mk|ml|mm|mn|mo|mp|mq|mr|ms|mt|mu|mv|mw|mx|my|mz|na|nc|ne|nf|ng|ni|nl|no|np|nr|nu|nz|om|pa|pe|pf|pg|ph|pk|pl|pm|pn|pr|ps|pt|pw|py|qa|re|ro|rs|ru|rw|sa|sb|sc|sd|se|sg|sh|si|sj|sk|sl|sm|sn|so|sr|st|su|sv|sx|sy|sz|tc|td|tf|tg|th|tj|tk|tl|tm|tn|to|tp|tr|tt|tv|tw|tz|ua|ug|uk|us|uy|uz|va|vc|ve|vg|vi|vn|vu|wf|ws|ye|yt|za|zm|zw)\b/,   // match our known top level domains (TLDs)
	    
	    pathRegex = /(?:\/(?:[\+~%\/\.\w\-]*[\+~%\/\w\-])?)?/,  // allow optional /path
	    queryStringRegex = /(?:\?[\-\+=&;%@\.\w]*)?/,       // allow optional query string starting with ? 
	    hashRegex = /(?:#[\-\.\!\/\\\w%]*)?/;               // allow optional hash anchor #anchor 
	
	
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
			
			'(?:',  // parens to cover match for path, query string, and hash anchor
				pathRegex.source,
				queryStringRegex.source,
				hashRegex.source,
			')?',  // make this section optional
		')'
	].join( "" ), 'g' );
})();
