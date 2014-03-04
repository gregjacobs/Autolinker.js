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
	    tldRegex = /\.(?:ac|academy|actor|ad|ae|aero|af|ag|agency|ai|al|am|an|ao|aq|ar|arpa|as|asia|at|au|aw|ax|az|ba|bar|bargains|bb|bd|be|berlin|best|bf|bg|bh|bi|bid|bike|biz|bj|blue|bm|bn|bo|boutique|br|bs|bt|build|builders|buzz|bv|bw|by|bz|ca|cab|camera|camp|cards|careers|cat|catering|cc|cd|center|ceo|cf|cg|ch|cheap|christmas|ci|ck|cl|cleaning|clothing|club|cm|cn|co|codes|coffee|com|community|company|computer|condos|construction|contractors|cool|coop|cr|cruises|cu|cv|cw|cx|cy|cz|dance|dating|de|democrat|diamonds|directory|dj|dk|dm|do|domains|dz|ec|edu|education|ee|eg|email|enterprises|equipment|er|es|estate|et|eu|events|expert|exposed|farm|fi|fish|fj|fk|flights|florist|fm|fo|foundation|fr|futbol|ga|gallery|gb|gd|ge|gf|gg|gh|gi|gift|gl|glass|gm|gn|gov|gp|gq|gr|graphics|gs|gt|gu|guitars|guru|gw|gy|hk|hm|hn|holdings|holiday|house|hr|ht|hu|id|ie|il|im|immobilien|in|industries|info|institute|int|international|io|iq|ir|is|it|je|jm|jo|jobs|jp|kaufen|ke|kg|kh|ki|kim|kitchen|kiwi|km|kn|kp|kr|kred|kw|ky|kz|la|land|lb|lc|li|lighting|limo|link|lk|lr|ls|lt|lu|luxury|lv|ly|ma|maison|management|mango|marketing|mc|md|me|menu|mg|mh|mil|mk|ml|mm|mn|mo|mobi|moda|monash|mp|mq|mr|ms|mt|mu|museum|mv|mw|mx|my|mz|na|nagoya|name|nc|ne|net|neustar|nf|ng|ni|ninja|nl|no|np|nr|nu|nz|okinawa|om|onl|org|pa|partners|parts|pe|pf|pg|ph|photo|photography|photos|pics|pink|pk|pl|plumbing|pm|pn|post|pr|pro|productions|properties|ps|pt|pub|pw|py|qa|qpon|re|recipes|red|rentals|repair|report|reviews|rich|ro|rs|ru|ruhr|rw|sa|sb|sc|sd|se|sexy|sg|sh|shiksha|shoes|si|singles|sj|sk|sl|sm|sn|so|social|solar|solutions|sr|st|su|supplies|supply|support|sv|sx|sy|systems|sz|tattoo|tc|td|technology|tel|tf|tg|th|tienda|tips|tj|tk|tl|tm|tn|to|today|tokyo|tools|tp|tr|training|travel|tt|tv|tw|tz|ua|ug|uk|uno|us|uy|uz|va|vacations|vc|ve|ventures|vg|vi|viajes|villas|vision|vn|vote|voting|voto|voyage|vu|wang|watch|wed|wf|wien|wiki|works|ws|xxx|xyz|ye|yt|za|zm|zone|zw)/,   // match our known top level domains (TLDs)
	    
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
