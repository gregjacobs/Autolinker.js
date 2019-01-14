import { State } from './state';
import CliTable from 'cli-table';

/**
 * Parses an HTML string, calling the callbacks to notify of tags and text.
 *
 * ## History
 * 
 * This file previously used a regular expression to find html tags in the input 
 * text. Unfortunately, we ran into a bunch of catastrophic backtracking issues 
 * with certain input text, causing Autolinker to either hang or just take a 
 * really long time to parse the string.
 *
 * The current code is intended to be a O(n) algorithm that walks through
 * the string in one pass, and tries to be as cheap as possible. We don't need
 * to implement the full HTML spec, but rather simply determine where the string
 * looks like an HTML tag, and where it looks like text (so that we can autolink
 * that).
 * 
 * This state machine parser is intended just to be a simple but performant
 * parser of HTML for the subset of requirements we have. We simply need to:
 *
 * 1. Determine where HTML tags are
 * 2. Determine the tag name (Autolinker specifically only cares about <a>,
 *    <script>, and <style> tags, so as not to link any text within them)
 *
 * We don't need to:
 *
 * 1. Create a parse tree
 * 2. Auto-close tags with invalid markup
 * 3. etc.
 * 
 * The other intention behind this is that we didn't want to add external 
 * dependencies on the Autolinker utility which would increase its size. For 
 * instance, adding htmlparser2 adds 125kb to the minified output file,
 * increasing its final size from 47kb to 172kb (at the time of writing). It 
 * also doesn't work exactly correctly, treating the string "<3 blah blah blah"
 * as an HTML tag.
 * 
 * Reference for HTML spec: 
 * 
 *     https://www.w3.org/TR/html51/syntax.html#sec-tokenization
 *
 * @param {String} html The HTML to parse
 * @param {Object} callbacks
 * @param {Function} callbacks.onOpenTag Callback function to call when an open
 *   tag is parsed. Called with the tagName as its argument.
 * @param {Function} callbacks.onCloseTag Callback function to call when a close
 *   tag is parsed. Called with the tagName as its argument. If a self-closing
 *   tag is found, `onCloseTag` is called immediately after `onOpenTag`.
 * @param {Function} callbacks.onText Callback function to call when text (i.e
 *   not an HTML tag) is parsed. Called with the text (string) as its first 
 *   argument, and offset (number) into the string as its second.
 */
export function parseHtml( html: string, { onOpenTag, onCloseTag, onText }: {
	onOpenTag: ( tagName: string, offset: number ) => void;
	onCloseTag: ( tagName: string, offset: number ) => void;
	onText: ( text: string, offset: number ) => void;
} ) {
	const letterRe = /[A-Za-z]/,
	      digitRe = /[0-9]/,
		  whitespaceRe = /\s/,
		  noCurrentTag: CurrentTag = { idx: -1, name: '', isOpening: false, isClosing: false };

	let charIdx = 0,
		len = html.length,
		state: State = State.Data,

		currentDataIdx = 0,  // where the current data start index is
		currentTag: CurrentTag = noCurrentTag;  // describes the current tag that is being read

	const table = new CliTable( {
		head: [ 'charIdx', 'char', 'state', 'currentDataIdx', 'currentOpenTagIdx' ]
	} );

	while( charIdx < len ) {
		var char = html.charAt( charIdx );

		table.push( 
			[ charIdx, char, State[ state ], currentDataIdx, currentTag.idx ] 
		);
		
		switch( +state ) {
			case State.Data: stateData( char ); break;
			case State.TagOpen: stateTagOpen( char ); break;
			case State.EndTagOpen: stateEndTagOpen( char ); break;
			case State.TagName: stateTagName( char ); break;
			case State.BeforeAttributeName: stateBeforeAttributeName( char ); break;
			case State.SelfClosingStartTag: stateSelfClosingStartTag( char ); break;
			case State.Doctype: stateDoctype( char ); break;
			default: 
				throw new Error( 'Unhandled State' );
		}

		table.push( 
			[ charIdx, char, State[ state ], currentDataIdx, currentTag.idx ] 
		);

		charIdx++;
	}

	if( currentDataIdx < charIdx ) {
		emitText();
	}
	console.log( table.toString() );


	// Called when non-tags are being read (i.e. the text around HTML †ags)
	// https://www.w3.org/TR/html51/syntax.html#data-state
	function stateData( char: string ) {
		if( char === '<' ) {
			state = State.TagOpen;
			currentTag = { idx: charIdx, name: '', isOpening: false, isClosing: false };
		}
	}

	// Called after a '<' is read from the Data state
	// https://www.w3.org/TR/html51/syntax.html#tag-open-state
	function stateTagOpen( char: string ) {
		if( char === '!' ) {
			// TODO

		} else if( char === '/' ) {
			state = State.EndTagOpen;
			currentTag.isClosing = true;

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			state = State.TagOpen;
			currentTag.idx = charIdx;

		} else if( letterRe.test( char ) ) {
			// tag name
			state = State.TagName;
			currentTag.isOpening = true;

		} else {
			// Any other 
			state = State.Data;
			currentTag = noCurrentTag;
		}
	}

	// After a '<x', '</x' sequence is read (where 'x' is a letter character), 
	// this is to continue reading the tag name
	// https://www.w3.org/TR/html51/syntax.html#tag-name-state
	function stateTagName( char: string ) {
		if( whitespaceRe.test( char ) ) {
			currentTag.name = captureTagName();
			state = State.BeforeAttributeName;

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			state = State.TagOpen;
			currentTag.idx = charIdx;

		} else if( char === '/' ) {
			currentTag.name = captureTagName();
			state = State.SelfClosingStartTag;

		} else if( char === '>' ) {
			currentTag.name = captureTagName();
			emitTagAndPreviousTextNode();
			resetToDataState();

			currentDataIdx = charIdx + 1;

		} else if( !letterRe.test( char ) && !digitRe.test( char ) ) {
			// Anything else that does not form an html tag
			resetToDataState();

		} else {
			// continue reading tag name
		}
	}

	// Called after the '/' is read from a '</' sequence
	// https://www.w3.org/TR/html51/syntax.html#end-tag-open-state
	function stateEndTagOpen( char: string ) {
		if( char === '>' ) {  // parse error. Encountered "</>". Skip it without treating as a tag
			resetToDataState();
		} else if( letterRe.test( char ) ) {
			state = State.TagName;
		} else {
			// some other non-tag-like character, don't treat this as a tag
			resetToDataState();
		}
	}
	

	// https://www.w3.org/TR/html51/syntax.html#before-attribute-name-state
	function stateBeforeAttributeName( char: string ) {
		// switch( char ) {
		// 	case '/':
		// 		state = State.SelfClosingStartTag;
		// 		break;

		// 	case '>':
		// 		state = State.Data;
		// 		emitTextAndTag( EMIT_START_TAG );
		// 		currentDataIdx = charIdx + 1;

		// 		break;

		// 	default:

		// 	case whitespaceRe.test( char ):
		// }
	}

	// A '/' has just been read in the current tag (presumably for '/>'), and 
	// this handles the next character
	// https://www.w3.org/TR/html51/syntax.html#self-closing-start-tag-state
	function stateSelfClosingStartTag( char: string ) {
		if( char === '>' ) {
			currentTag.isClosing = true;
			emitTagAndPreviousTextNode();
			resetToDataState();

			currentDataIdx = charIdx + 1;
		} else {
			state = State.BeforeAttributeName;
		}
	}

// 	// https://www.w3.org/TR/html51/syntax.html#markup-declaration-open-state
// 	// HTML Comments or !DOCTYPE
// 	case STATE_MARKUP_DECLARATION_OPEN_STATE :
// 		if( html.substr( charIdx, 2 ) === '--' ) {  // html comment
// 			charIdx += 2;  // "consume" characters
// 			state = STATE_COMMENT_START_STATE;

// 		} else if( html.substr( charIdx, 7 ).toUpperCase() === 'DOCTYPE' ) {
// 			charIdx += 7;  // "consume" characters
// 			state = STATE_DOCTYPE;
// 		}

// 		break;

// 	// https://www.w3.org/TR/html51/syntax.html#comment-start-state
// 	case STATE_COMMENT_START_STATE :
// 		break;

	// https://www.w3.org/TR/html51/syntax.html#doctype-state
	function stateDoctype( char: string ) {
		// For DOCTYPES in particular, we don't care about the attributes.
		// Just advance to the '>' character, and emit the tag.
		// while( charIdx < len && html.charAt( charIdx ) !== '>' ) charIdx++;

		// Records !DOCTYPE tag
	}

	// Capture any remaining text in the string as a text node
	// var dataText = html.substring( dataIdx );
	// if( dataText ) {
	// 	nodes.push( createTextNode( dataIdx, dataText ) );
	// }

	// return nodes;


	function resetToDataState() {
		state = State.Data;
		currentTag = noCurrentTag;
	}

	/**
	 * Once we've decided to emit an open tag, that means we can also emit the
	 * text node before it.
	 */
	function emitTagAndPreviousTextNode() {
		const textBeforeTag = html.slice( currentDataIdx, currentTag.idx );
		if( textBeforeTag ) {
			// the html tag was the first element in the html string, or two 
			// tags next to each other, in which case we should not emit a text 
			// node
			onText( textBeforeTag, currentDataIdx );
		}

		if( currentTag.isOpening ) {
			onOpenTag( currentTag.name, currentTag.idx );
		}
		if( currentTag.isClosing ) {  // note: self-closing tags will emit both opening and closing
			onCloseTag( currentTag.name, currentTag.idx );
		}

		currentDataIdx = charIdx + 1;
		currentTag = noCurrentTag;
	}


	function emitText() {
		const text = html.slice( currentDataIdx, charIdx );
		onText( text, currentDataIdx );

		currentDataIdx = charIdx + 1;
	}

	/**
	 * Captures the tag name from the start of the tag to the current character 
	 * index
	 */
	function captureTagName() {
		const startIdx = currentTag.idx + ( currentTag.isClosing ? 2 : 1 );
		return html.slice( startIdx, charIdx );
	}

	// function emitTextAndTag( startOrClose ) {
	// 	var dataBeforeTagText = html.substring( dataIdx, openTagIdx ),
	// 		tagText = html.substring( openTagIdx, charIdx + 1 ),
	// 		tagNameOffset = ( startOrClose === EMIT_CLOSE_TAG ) ? 2 : 1,  // +2 to skip over the '/' for a closing tag
	// 		tagName = html.substring( openTagIdx + tagNameOffset, charIdx );

	// 	if( dataBeforeTagText ) {
	// 		nodes.push( createTextNode( dataIdx, dataBeforeTagText ) );
	// 	}
	// 	nodes.push( createElementNode( openTagIdx, tagText, tagName, startOrClose === EMIT_CLOSE_TAG ) );
	// }
}


interface CurrentTag {
	idx: number;  // the index of the '<' in the html string
	name: string;
	isOpening: boolean;  // true if it's an opening tag, OR a self-closing open tag
	isClosing: boolean;  // true if it's a closing tag, OR a self-closing open tag
}