/**
 * @member Autolinker
 * @private
 * @property {RegExp} matcherRegex
 * 
 * The regular expression that matches URLs, email addresses, and Twitter handles.
 */
(function() {
	var protocolRegex = /([A-Za-z]{3,9}:(?:\/\/)?)/,        // match protocol, allow in format http:// or mailto:
	    emailRegex = /(?:[\-;:&=\+\$,\w]+@)?/,              // allow something@ for email addresses
	    domainNameRegex = /[A-Za-z0-9\.\-]*[A-Za-z0-9\-]/,  // anything looking at all like a domain, non-unicode domains, not ending in a period
	    
	    wwwRegex = /(?:www\.|[\-;:&=\+\$,\w]+@)/,           // starting with something@ or www.
	    
	    tldRegex = /\.(com|org|net|gov|edu|mil|us|info|biz|ws|name|mobi|cc|tv|co\.uk|de|ru|hu|fr|br)/,   // match our known top level domains (TLDs)
	    
	    pathRegex = /(?:\/[\+~%\/\.\w\-]*)?/,               // allow optional /path
	    queryStringRegex = /(?:\?[\-\+=&;%@\.\w]*)?/,       // allow optional query string starting with ? 
	    hashRegex = /(?:#[\-\.\!\/\\\w%]*)?/;               // allow optional hash anchor #anchor 
	
	return new RegExp( [
		'(', // parens to cover match for protocol (optional), and domain
			'(?:',  // non-capturing paren for a protocol or email address url 
				protocolRegex.source,
				emailRegex.source,
				domainNameRegex.source,
			')',
			'|',  // or instead of above
			'(?:',  // non-capturing paren for a 'www.' url
				wwwRegex.source,
				domainNameRegex.source,
			')',
			'|',
			'(?:',  // non-capturing paren for known a TLD url
				domainNameRegex.source,
				tldRegex.source,
			')',
		')',
		
		'(?:',  // parens to cover match for path, query string, and hash anchor
			pathRegex.source,
			queryStringRegex.source,
			hashRegex.source,
		')?'  // make this section optional
	].join( "" ), 'g' );
})();