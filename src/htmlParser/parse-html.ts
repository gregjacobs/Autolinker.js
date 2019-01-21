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
		  quoteRe = /['"]/,
		  controlCharsRe = /[\x00-\x1F\x7F]/,  // control chars (0-31), and the backspace char (127)
		  noCurrentTag = new CurrentTag();

	let charIdx = 0,
		len = html.length,
		state: State = State.Data,

		currentDataIdx = 0,  // where the current data start index is
		currentTag = noCurrentTag;  // describes the current tag that is being read

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
			case State.AttributeName: stateAttributeName( char ); break;
			case State.AfterAttributeName: stateAfterAttributeName( char ); break;
			case State.BeforeAttributeValue: stateBeforeAttributeValue( char ); break;
			case State.AttributeValueDoubleQuoted: stateAttributeValueDoubleQuoted( char ); break;
			case State.AttributeValueSingleQuoted: stateAttributeValueSingleQuoted( char ); break;
			case State.AttributeValueUnquoted: stateAttributeValueUnquoted( char ); break;
			case State.AfterAttributeValueQuoted: stateAfterAttributeValueQuoted( char ); break;
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
			startNewTag();
		}
	}

	// Called after a '<' is read from the Data state
	// https://www.w3.org/TR/html51/syntax.html#tag-open-state
	function stateTagOpen( char: string ) {
		if( char === '!' ) {
			// TODO

		} else if( char === '/' ) {
			state = State.EndTagOpen;
			currentTag = new CurrentTag( { ...currentTag, isClosing: true } );

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			startNewTag();

		} else if( letterRe.test( char ) ) {
			// tag name start (and no '/' read)
			state = State.TagName;
			currentTag = new CurrentTag( { ...currentTag, isOpening: true } );

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
			currentTag = new CurrentTag( { ...currentTag, name: captureTagName() } );
			state = State.BeforeAttributeName;

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			startNewTag();

		} else if( char === '/' ) {
			currentTag = new CurrentTag( { ...currentTag, name: captureTagName() } );
			state = State.SelfClosingStartTag;

		} else if( char === '>' ) {
			currentTag = new CurrentTag( { ...currentTag, name: captureTagName() } );
			emitTagAndPreviousTextNode();  // resets to Data state as well

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
		if( whitespaceRe.test( char ) ) {
			// stay in BeforeAttributeName state - continue reading chars

		} else if( char === '/' ) {
			state = State.SelfClosingStartTag;

		} else if( char === '>' ) {
			emitTagAndPreviousTextNode();  // resets to Data state as well

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			startNewTag();

		} else if( char === `=` || quoteRe.test( char ) || controlCharsRe.test( char ) ) {
			// "Parse error" characters that, according to the spec, should be
			// appended to the attribute name, but we'll treat these characters
			// as not forming a real HTML tag
			resetToDataState();

		} else {
			// Any other char, start of a new attribute name
			state = State.AttributeName;
		}
	}


	// https://www.w3.org/TR/html51/syntax.html#attribute-name-state
	function stateAttributeName( char: string ) {
		if( whitespaceRe.test( char ) ) {
			state = State.AfterAttributeName;

		} else if( char === '/' ) {
			state = State.SelfClosingStartTag;

		} else if( char === '=' ) {
			state = State.BeforeAttributeValue;

		} else if( char === '>' ) {
			emitTagAndPreviousTextNode();  // resets to Data state as well

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			startNewTag();

		} else if( quoteRe.test( char ) ) {
			// "Parse error" characters that, according to the spec, should be
			// appended to the attribute name, but we'll treat these characters
			// as not forming a real HTML tag
			resetToDataState();

		} else {
			// anything else: continue reading attribute name
		}
	}


	// https://www.w3.org/TR/html51/syntax.html#after-attribute-name-state
	function stateAfterAttributeName( char: string ) {
		if( whitespaceRe.test( char ) ) {
			// ignore the character - continue reading

		} else if( char === '/' ) {
			state = State.SelfClosingStartTag;

		} else if( char === '=' ) {
			state = State.BeforeAttributeValue;

		} else if( char === '>' ) {
			emitTagAndPreviousTextNode();

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			startNewTag();

		} else if( quoteRe.test( char ) ) {
			// "Parse error" characters that, according to the spec, should be
			// appended to the attribute name, but we'll treat these characters
			// as not forming a real HTML tag
			resetToDataState();

		} else {
			// Any other character, start a new attribute in the current tag
			state = State.AttributeName;
		}
	}


	// https://www.w3.org/TR/html51/syntax.html#before-attribute-value-state
	function stateBeforeAttributeValue( char: string ) {
		if( whitespaceRe.test( char ) ) {
			// ignore the character - continue reading

		} else if( char === `"` ) {
			state = State.AttributeValueDoubleQuoted;

		} else if( char === `'` ) {
			state = State.AttributeValueSingleQuoted;

		} else if( /[>=`]/.test( char ) ) {
			// Invalid chars after an '=' for an attribute value, don't count 
			// the current tag as an HTML tag
			resetToDataState();

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			startNewTag();

		} else {
			// Any other character, consider it an unquoted attribute value
			state = State.AttributeValueUnquoted;
		}
	}


	// https://www.w3.org/TR/html51/syntax.html#attribute-value-double-quoted-state
	function stateAttributeValueDoubleQuoted( char: string ) {
		if( char === `"` ) {  // end the current double-quoted attribute
			state = State.AfterAttributeValueQuoted;

		} else {
			// consume the character as part of the double-quoted attribute value
		}
	}


	// https://www.w3.org/TR/html51/syntax.html#attribute-value-single-quoted-state
	function stateAttributeValueSingleQuoted( char: string ) {
		if( char === `'` ) {  // end the current single-quoted attribute
			state = State.AfterAttributeValueQuoted;

		} else {
			// consume the character as part of the double-quoted attribute value
		}
	}


	// https://www.w3.org/TR/html51/syntax.html#attribute-value-unquoted-state
	function stateAttributeValueUnquoted( char: string ) {
		if( whitespaceRe.test( char ) ) {
			state = State.BeforeAttributeName;

		} else if( char === '>' ) {
			emitTagAndPreviousTextNode();

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			startNewTag();

		} else if( quoteRe.test( char ) || /[=`]/.test( char ) ) {
			// "Parse error" characters that, according to the spec, should be
			// appended to the attribute value, but we'll treat these characters
			// as not forming a real HTML tag
			resetToDataState();

		} else {
			// Any other character, treat it as part of the attribute value
		}
	}


	// https://www.w3.org/TR/html51/syntax.html#after-attribute-value-quoted-state
	function stateAfterAttributeValueQuoted( char: string ) {
		if( whitespaceRe.test( char ) ) {
			state = State.BeforeAttributeName;

		} else if( char === '/' ) {
			state = State.SelfClosingStartTag;

		} else if( char === '>' ) {
			emitTagAndPreviousTextNode();

		} else if( char === '<' ) {
			// start of another tag (ignore the previous, incomplete one)
			startNewTag();

		} else {
			// Any other character, "parse error". Spec says to switch to the
			// BeforeAttributeState and re-consume the character, as it may be
			// the start of a new attribute name
			state = State.BeforeAttributeName;
			reconsumeCurrentCharacter();
		}
	}


	// A '/' has just been read in the current tag (presumably for '/>'), and 
	// this handles the next character
	// https://www.w3.org/TR/html51/syntax.html#self-closing-start-tag-state
	function stateSelfClosingStartTag( char: string ) {
		if( char === '>' ) {
			currentTag = new CurrentTag( { ...currentTag, isClosing: true } );
			emitTagAndPreviousTextNode();  // resets to Data state as well
			
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


	/**
	 * Resets the state back to the Data state, and removes the current tag.
	 * 
	 * We'll generally run this function whenever a "parse error" is 
	 * encountered, where the current tag that is being read no longer looks 
	 * like a real HTML tag.
	 */
	function resetToDataState() {
		state = State.Data;
		currentTag = noCurrentTag;
	}


	/**
	 * Starts a new HTML tag at the current index, ignoring any previous HTML
	 * tag that was being read.
	 * 
	 * We'll generally run this function whenever we read a new '<' character,
	 * including when we read a '<' character inside of an HTML tag that we were
	 * previously reading.
	 */
	function startNewTag() {
		state = State.TagOpen;
		currentTag = new CurrentTag( { idx: charIdx } );
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

		// Since we just emitted a tag, reset to the data state for the next 
		// char
		resetToDataState();
		currentDataIdx = charIdx + 1;
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


	/**
	 * Causes the main loop to re-consume the current character, such as after
	 * encountering a "parse error" that changed state and needs to reconsume
	 * the same character in that new state.
	 */
	function reconsumeCurrentCharacter() {
		charIdx--;
	}
}


class CurrentTag {
	readonly idx: number;  // the index of the '<' in the html string
	readonly name: string;
	readonly isOpening: boolean;  // true if it's an opening tag, OR a self-closing open tag
	readonly isClosing: boolean;  // true if it's a closing tag, OR a self-closing open tag

	constructor( cfg: Partial<CurrentTag> = {} ) {
		this.idx = cfg.idx !== undefined ? cfg.idx : -1;
		this.name = cfg.name || '';
		this.isOpening = !!cfg.isOpening;
		this.isClosing = !!cfg.isClosing;
	}
}