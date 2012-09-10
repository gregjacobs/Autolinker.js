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
	    
	    emailRegex = /(?:[\-;:&=\+\$,\w]+@)/,               // something@ for email addresses
	    domainNameWithDot = /[A-Za-z0-9\.\-]+\.[A-Za-z0-9\.\-]+/,  // a regex to check for a domain name with at least one '.' in it, for the section after the '@' sign of an email address (so we don't just link any old "hi@you" kind of text)
	    
	    protocolRegex = /(?:[A-Za-z]{3,9}:(?:\/\/)?)/,      // match protocol, allow in format http:// or mailto:
	    wwwRegex = /(?:www\.)/,                             // starting with 'www.'
	    domainNameRegex = /[A-Za-z0-9\.\-]*[A-Za-z0-9\-]/,  // anything looking at all like a domain, non-unicode domains, not ending in a period
	    tldRegex = /\.(?:com|org|net|gov|edu|mil|us|info|biz|ws|name|mobi|cc|tv|co\.uk|de|ru|hu|fr|br)/,   // match our known top level domains (TLDs)
	    
	    pathRegex = /(?:\/[\+~%\/\.\w\-]*)?/,               // allow optional /path
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
			domainNameWithDot.source,
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
