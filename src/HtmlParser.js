/*global Autolinker */
/**
 * @private
 * @class Autolinker.HtmlParser
 * @extends Object
 * 
 * An HTML parser implementation which simply walks an HTML string and calls the provided visitor functions to process 
 * HTML and text nodes.
 * 
 * Autolinker uses this to only link URLs/emails/Twitter handles within text nodes, basically ignoring HTML tags.
 */
Autolinker.HtmlParser = Autolinker.Util.extend( Object, {
	
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
	 * Walks an HTML string, calling the `options.processHtmlNode` function for each HTML tag that is encountered, and calling
	 * the `options.processTextNode` function when each text around HTML tags is encountered.
	 * 
	 * @param {String} html The HTML to parse.
	 * @param {Object} [options] An Object (map) which may contain the following properties:
	 * 
	 * @param {Function} [options.processHtmlNode] A visitor function which allows processing of an encountered HTML node.
	 *   This function is called with the following arguments:
	 * @param {String} [options.processHtmlNode.tagText] The HTML tag text that was found.
	 * @param {String} [options.processHtmlNode.tagName] The tag name for the HTML tag that was found. Ex: 'a' for an anchor tag.
	 * @param {String} [options.processHtmlNode.isClosingTag] `true` if the tag is a closing tag (ex: &lt;/a&gt;), `false` otherwise.
	 *  
	 * @param {Function} [options.processTextNode] A visitor function which allows processing of an encountered text node.
	 *   This function is called with the following arguments:
	 * @param {String} [options.processTextNode.text] The text node that was matched.
	 */
	parse : function( html, options ) {
		options = options || {};
		
		var processHtmlNodeVisitor = options.processHtmlNode || function() {},
		    processTextNodeVisitor = options.processTextNode || function() {},
		    htmlRegex = this.htmlRegex,
		    currentResult,
		    lastIndex = 0;
		
		// Loop over the HTML string, ignoring HTML tags, and processing the text that lies between them,
		// wrapping the URLs in anchor tags
		while( ( currentResult = htmlRegex.exec( html ) ) !== null ) {
			var tagText = currentResult[ 0 ],
			    tagName = currentResult[ 2 ],
			    isClosingTag = !!currentResult[ 1 ],
			    inBetweenTagsText = html.substring( lastIndex, currentResult.index );
			
			if( inBetweenTagsText ) {
				processTextNodeVisitor( inBetweenTagsText );
			}
			
			processHtmlNodeVisitor( tagText, tagName, isClosingTag );
			
			lastIndex = currentResult.index + tagText.length;
		}
		
		// Process any remaining text after the last HTML element. Will process all of the text if there were no HTML elements.
		if( lastIndex < html.length ) {
			var text = html.substring( lastIndex );
			
			if( text ) {
				processTextNodeVisitor( text );
			}
		}
	}
	
} );