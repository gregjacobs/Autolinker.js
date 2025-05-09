import { Char } from '../char';
import {
    isAsciiDigitChar,
    isAsciiLetterChar,
    isQuoteChar,
    isWhitespaceChar,
    isControlChar,
    isAsciiAlphaNumericChar,
    isHexChar,
    isSurrogateChar,
    isAsciiUpperHexDigitChar,
} from '../char-utils';
import { assertNever } from '../utils';
import { c1ControlCharReplacements } from './c1-control-chars';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

class CurrentTag {
    public idx: number; // the index of the '<' in the html string
    public type: HtmlTagType;
    public name: string;
    public isOpening: boolean; // true if it's an opening tag, OR a self-closing open tag
    public isClosing: boolean; // true if it's a closing tag, OR a self-closing open tag

    constructor(cfg: Partial<CurrentTag> = {}) {
        this.idx = cfg.idx !== undefined ? cfg.idx : -1;
        this.type = cfg.type || HtmlTagType.Tag;
        this.name = cfg.name || '';
        this.isOpening = !!cfg.isOpening;
        this.isClosing = !!cfg.isClosing;
    }
}

// For debugging: temporarily remove 'const'
const enum HtmlTagType {
    Tag = 0, // normal html tag, like <div>
    Comment, // <!-- html comment tag -->
    Doctype, // <!DOCTYPE> tag
}

// Represents the current HTML character reference (ex: '&amp;') being read
class CurrentCharReference {
    public readonly idx: number; // the index of the '&' in the html string
    public type: CharReferenceType;
    public charRefCode = 0; // for numeric character references like '&#60;' or '&#x3C', we'll use this to calculate the character code as we read digits

    constructor(idx: number) {
        this.idx = idx;
        this.type = CharReferenceType.Unknown;
    }
}

// For debugging: temporarily remove 'const'
const enum CharReferenceType {
    Unknown = 0, // not yet known (we need to read more characters)
    Named, // ex: '&amp;'
    DecimalNumeric, // ex: '&#60;'
    HexNumeric, // ex: '&#x3C;'
}

/**
 * Context object containing all the state needed by the HTML parsing state
 * machine function.
 *
 * ## Historical note
 *
 * In v4.1.5, we used nested functions to handle the context via closures, but
 * this necessitated re-creating the functions for each call to `parseHtml()`,
 * which made them difficult for v8 to JIT optimize. In v4.1.6, we lifted all of
 * the functions to the top-level scope and passed the context object between
 * them, which allows the functions to be JIT compiled once and reused.
 */
class ParseHtmlContext {
    public readonly html: string; // The input html being parsed
    public readonly callbacks: ParseHtmlCallbacks;
    public charIdx = 0; // Current character index being processed
    public state: State = State.Data; // begin in the Data (i.e. non-tag) state
    public currentDataStartIdx = 0; // where the current Data (non-tag) section has started
    public currentDataSliceIdx = 0; // where the current Data (non-tag) slice index is. If we are reading multiple slices of data (text), such as in the string "hello &amp; world", we will have a slice for 'hello ', '&', and ' world'
    public currentDataSlices: string[] = []; // an array of strings for the current data (i.e. non-tag) string that is being read. If we need to decode an HTML entity like '&#60;' into a '<' char, it will end up in this array (with all the text before it) before we emit
    public currentTag: CurrentTag | null = null; // describes the current tag that is being read
    public currentCharRef: CurrentCharReference | null = null; // describes the current HTML character reference / entity (ex: '&amp;') that is being read

    constructor(html: string, callbacks: ParseHtmlCallbacks) {
        this.html = html;
        this.callbacks = callbacks;
    }
}

/**
 * The callback functions that can be provided to {@link #parseHtml}.
 */
export interface ParseHtmlCallbacks {
    onOpenTag: (tagName: string, offset: number) => void;
    onCloseTag: (tagName: string, offset: number) => void;
    onText: (text: string, offset: number) => void;
    onComment: (offset: number) => void;
    onDoctype: (offset: number) => void;
}

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
export function parseHtml(html: string, callbacks: ParseHtmlCallbacks) {
    const context = new ParseHtmlContext(html, callbacks);

    // For debugging: search for other "For debugging" lines
    // const table = new CliTable( {
    // 	head: [ 'charIdx', 'char', 'state', 'currentDataIdx', 'currentOpenTagIdx', 'tag.type' ]
    // } );

    const len = html.length;
    while (context.charIdx < len) {
        const char = html.charAt(context.charIdx);
        const charCode = html.charCodeAt(context.charIdx);

        // For debugging: search for other "For debugging" lines
        // ALSO: Temporarily remove the 'const' keyword on the State enum
        // table.push([
        //     String(charIdx),
        //     char,
        //     State[state],
        //     String(currentDataIdx),
        //     String(currentTag.idx),
        //     currentTag.idx === -1 ? '' : CurrentTagType[currentTag.type]
        // ]);

        switch (context.state) {
            case State.Data:
                stateData(context, char);
                break;
            case State.TagOpen:
                stateTagOpen(context, char, charCode);
                break;
            case State.EndTagOpen:
                stateEndTagOpen(context, char, charCode);
                break;
            case State.TagName:
                stateTagName(context, char, charCode);
                break;
            case State.BeforeAttributeName:
                stateBeforeAttributeName(context, char, charCode);
                break;
            case State.AttributeName:
                stateAttributeName(context, char, charCode);
                break;
            case State.AfterAttributeName:
                stateAfterAttributeName(context, char, charCode);
                break;
            case State.BeforeAttributeValue:
                stateBeforeAttributeValue(context, char, charCode);
                break;
            case State.AttributeValueDoubleQuoted:
                stateAttributeValueDoubleQuoted(context, char);
                break;
            case State.AttributeValueSingleQuoted:
                stateAttributeValueSingleQuoted(context, char);
                break;
            case State.AttributeValueUnquoted:
                stateAttributeValueUnquoted(context, char, charCode);
                break;
            case State.AfterAttributeValueQuoted:
                stateAfterAttributeValueQuoted(context, char, charCode);
                break;
            case State.SelfClosingStartTag:
                stateSelfClosingStartTag(context, char);
                break;
            case State.MarkupDeclarationOpenState:
                stateMarkupDeclarationOpen(context);
                break;
            case State.CommentStart:
                stateCommentStart(context, char);
                break;
            case State.CommentStartDash:
                stateCommentStartDash(context, char);
                break;
            case State.Comment:
                stateComment(context, char);
                break;
            case State.CommentEndDash:
                stateCommentEndDash(context, char);
                break;
            case State.CommentEnd:
                stateCommentEnd(context, char);
                break;
            case State.CommentEndBang:
                stateCommentEndBang(context, char);
                break;
            case State.Doctype:
                stateDoctype(context, char);
                break;
            case State.CharacterReference:
                stateCharacterReference(context, charCode);
                break;
            case State.CharacterReferenceNamed:
                stateCharacterReferenceNamed(context, charCode);
                break;
            case State.CharacterReferenceNumeric:
                stateCharacterReferenceNumeric(context, charCode);
                break;
            case State.CharacterReferenceHexadecimalStart:
                stateCharacterReferenceHexadecimalStart(context, charCode);
                break;
            case State.CharacterReferenceHexadecimal:
                stateCharacterReferenceHexadecimal(context, charCode);
                break;
            case State.CharacterReferenceDecimal:
                stateCharacterReferenceDecimal(context, charCode);
                break;

            /* istanbul ignore next */
            default:
                assertNever(context.state);
        }

        // For debugging: search for other "For debugging" lines
        // ALSO: Temporarily remove the 'const' keyword on the State enum
        // table.push([
        //     String(context.charIdx),
        //     char,
        //     State[context.state],
        //     String(context.currentDataIdx),
        //     String(context.currentTag.idx),
        //     context.currentTag.idx === -1 ? '' : CurrentTagType[context.currentTag.type]
        // ]);

        context.charIdx++;
    }

    if (context.currentDataSliceIdx < context.charIdx) {
        captureCurrentDataAndEmit(context, context.charIdx);
    }

    // For debugging: search for other "For debugging" lines
    // console.log( '\n' + table.toString() );
}

// Called when non-tags are being read (i.e. the text around HTML †ags)
// https://www.w3.org/TR/html51/syntax.html#data-state
function stateData(context: ParseHtmlContext, char: string) {
    if (char === '<') {
        startNewTag(context);
    } else if (char === '&') {
        startNewEntity(context);
    }
}

// Called after a '<' is read from the Data state
// https://www.w3.org/TR/html51/syntax.html#tag-open-state
function stateTagOpen(context: ParseHtmlContext, char: string, charCode: number) {
    if (char === '!') {
        context.state = State.MarkupDeclarationOpenState;
    } else if (char === '/') {
        context.state = State.EndTagOpen;
        context.currentTag!.isClosing = true;
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else if (isAsciiLetterChar(charCode)) {
        // tag name start (and no '/' read)
        context.state = State.TagName;
        context.currentTag!.isOpening = true;
    } else {
        // Any other
        context.state = State.Data;
        context.currentTag = null;
    }
}

// After a '<x', '</x' sequence is read (where 'x' is a letter character),
// this is to continue reading the tag name
// https://www.w3.org/TR/html51/syntax.html#tag-name-state
function stateTagName(context: ParseHtmlContext, char: string, charCode: number) {
    if (isWhitespaceChar(charCode)) {
        context.currentTag!.name = captureTagName(context);
        context.state = State.BeforeAttributeName;
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else if (char === '/') {
        context.currentTag!.name = captureTagName(context);
        context.state = State.SelfClosingStartTag;
    } else if (char === '>') {
        context.currentTag!.name = captureTagName(context);
        emitTagAndPreviousTextNode(context); // resets to Data state as well
    } else if (!isAsciiLetterChar(charCode) && !isAsciiDigitChar(charCode) && char !== ':') {
        // Anything else that does not form an html tag. Note: the colon
        // character is accepted for XML namespaced tags
        resetToDataState(context);
    } else {
        // continue reading tag name
    }
}

// Called after the '/' is read from a '</' sequence
// https://www.w3.org/TR/html51/syntax.html#end-tag-open-state
function stateEndTagOpen(context: ParseHtmlContext, char: string, charCode: number) {
    if (char === '>') {
        // parse error. Encountered "</>". Skip it without treating as a tag
        resetToDataState(context);
    } else if (isAsciiLetterChar(charCode)) {
        context.state = State.TagName;
    } else {
        // some other non-tag-like character, don't treat this as a tag
        resetToDataState(context);
    }
}

// https://www.w3.org/TR/html51/syntax.html#before-attribute-name-state
function stateBeforeAttributeName(context: ParseHtmlContext, char: string, charCode: number) {
    if (isWhitespaceChar(charCode)) {
        // stay in BeforeAttributeName state - continue reading chars
    } else if (char === '/') {
        context.state = State.SelfClosingStartTag;
    } else if (char === '>') {
        emitTagAndPreviousTextNode(context); // resets to Data state as well
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else if (char === `=` || isQuoteChar(charCode) || isControlChar(charCode)) {
        // "Parse error" characters that, according to the spec, should be
        // appended to the attribute name, but we'll treat these characters
        // as not forming a real HTML tag
        resetToDataState(context);
    } else {
        // Any other char, start of a new attribute name
        context.state = State.AttributeName;
    }
}

// https://www.w3.org/TR/html51/syntax.html#attribute-name-state
function stateAttributeName(context: ParseHtmlContext, char: string, charCode: number) {
    if (isWhitespaceChar(charCode)) {
        context.state = State.AfterAttributeName;
    } else if (char === '/') {
        context.state = State.SelfClosingStartTag;
    } else if (char === '=') {
        context.state = State.BeforeAttributeValue;
    } else if (char === '>') {
        emitTagAndPreviousTextNode(context); // resets to Data state as well
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else if (isQuoteChar(charCode)) {
        // "Parse error" characters that, according to the spec, should be
        // appended to the attribute name, but we'll treat these characters
        // as not forming a real HTML tag
        resetToDataState(context);
    } else {
        // anything else: continue reading attribute name
    }
}

// https://www.w3.org/TR/html51/syntax.html#after-attribute-name-state
function stateAfterAttributeName(context: ParseHtmlContext, char: string, charCode: number) {
    if (isWhitespaceChar(charCode)) {
        // ignore the character - continue reading
    } else if (char === '/') {
        context.state = State.SelfClosingStartTag;
    } else if (char === '=') {
        context.state = State.BeforeAttributeValue;
    } else if (char === '>') {
        emitTagAndPreviousTextNode(context);
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else if (isQuoteChar(charCode)) {
        // "Parse error" characters that, according to the spec, should be
        // appended to the attribute name, but we'll treat these characters
        // as not forming a real HTML tag
        resetToDataState(context);
    } else {
        // Any other character, start a new attribute in the current tag
        context.state = State.AttributeName;
    }
}

// https://www.w3.org/TR/html51/syntax.html#before-attribute-value-state
function stateBeforeAttributeValue(context: ParseHtmlContext, char: string, charCode: number) {
    if (isWhitespaceChar(charCode)) {
        // ignore the character - continue reading
    } else if (char === `"`) {
        context.state = State.AttributeValueDoubleQuoted;
    } else if (char === `'`) {
        context.state = State.AttributeValueSingleQuoted;
    } else if (/[>=`]/.test(char)) {
        // Invalid chars after an '=' for an attribute value, don't count
        // the current tag as an HTML tag
        resetToDataState(context);
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else {
        // Any other character, consider it an unquoted attribute value
        context.state = State.AttributeValueUnquoted;
    }
}

// https://www.w3.org/TR/html51/syntax.html#attribute-value-double-quoted-state
function stateAttributeValueDoubleQuoted(context: ParseHtmlContext, char: string) {
    if (char === `"`) {
        // end the current double-quoted attribute
        context.state = State.AfterAttributeValueQuoted;
    } else {
        // consume the character as part of the double-quoted attribute value
    }
}

// https://www.w3.org/TR/html51/syntax.html#attribute-value-single-quoted-state
function stateAttributeValueSingleQuoted(context: ParseHtmlContext, char: string) {
    if (char === `'`) {
        // end the current single-quoted attribute
        context.state = State.AfterAttributeValueQuoted;
    } else {
        // consume the character as part of the double-quoted attribute value
    }
}

// https://www.w3.org/TR/html51/syntax.html#attribute-value-unquoted-state
function stateAttributeValueUnquoted(context: ParseHtmlContext, char: string, charCode: number) {
    if (isWhitespaceChar(charCode)) {
        context.state = State.BeforeAttributeName;
    } else if (char === '>') {
        emitTagAndPreviousTextNode(context);
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else {
        // Any other character, treat it as part of the attribute value
    }
}

// Called after a double-quoted or single-quoted attribute value is read
// (i.e. after the closing quote character)
// https://www.w3.org/TR/html51/syntax.html#after-attribute-value-quoted-state
function stateAfterAttributeValueQuoted(context: ParseHtmlContext, char: string, charCode: number) {
    if (isWhitespaceChar(charCode)) {
        context.state = State.BeforeAttributeName;
    } else if (char === '/') {
        context.state = State.SelfClosingStartTag;
    } else if (char === '>') {
        emitTagAndPreviousTextNode(context);
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else {
        // Any other character, "parse error". Spec says to switch to the
        // BeforeAttributeState and re-consume the character, as it may be
        // the start of a new attribute name
        context.state = State.BeforeAttributeName;
        reconsumeCurrentChar(context);
    }
}

// A '/' has just been read in the current tag (presumably for '/>'), and
// this handles the next character
// https://www.w3.org/TR/html51/syntax.html#self-closing-start-tag-state
function stateSelfClosingStartTag(context: ParseHtmlContext, char: string) {
    if (char === '>') {
        context.currentTag!.isClosing = true;
        emitTagAndPreviousTextNode(context); // resets to Data state as well
    } else {
        // Note: the spec calls for a character after a '/' within a start
        // tag to go back into the BeforeAttributeName state (in order to
        // read more attributes, but for the purposes of Autolinker, this is
        // most likely not a valid HTML tag. For example: "<something / other>"
        // state = State.BeforeAttributeName;

        // Instead, just treat as regular text
        resetToDataState(context);
    }
}

// https://www.w3.org/TR/html51/syntax.html#markup-declaration-open-state
// (HTML Comments or !DOCTYPE)
function stateMarkupDeclarationOpen(context: ParseHtmlContext) {
    const { html, charIdx } = context;

    if (html.slice(charIdx, charIdx + 2) === '--') {
        // html comment
        context.charIdx++; // "consume" the second '-' character (the current loop iteration consumed the first). Next loop iteration will consume the character after the '<!--' sequence
        context.currentTag!.type = HtmlTagType.Comment;
        context.state = State.CommentStart;
    } else if (html.slice(charIdx, charIdx + 7).toUpperCase() === 'DOCTYPE') {
        context.charIdx += 6; // "consume" the characters "OCTYPE" (the current loop iteraction consumed the 'D'). Next loop iteration will consume the character after the '<!DOCTYPE' sequence
        context.currentTag!.type = HtmlTagType.Doctype;
        context.state = State.Doctype;
    } else {
        // At this point, the spec specifies that the state machine should
        // enter the "bogus comment" state, in which case any character(s)
        // after the '<!' that were read should become an HTML comment up
        // until the first '>' that is read (or EOF). Instead, we'll assume
        // that a user just typed '<!' as part of some piece of non-html
        // text
        resetToDataState(context);
    }
}

// Handles after the sequence '<!--' has been read
// https://www.w3.org/TR/html51/syntax.html#comment-start-state
function stateCommentStart(context: ParseHtmlContext, char: string) {
    if (char === '-') {
        // We've read the sequence '<!---' at this point (3 dashes)
        context.state = State.CommentStartDash;
    } else if (char === '>') {
        // At this point, we'll assume the comment wasn't a real comment
        // so we'll just emit it as data. We basically read the sequence
        // '<!-->'
        resetToDataState(context);
    } else {
        // Any other char, take it as part of the comment
        context.state = State.Comment;
    }
}

// We've read the sequence '<!---' at this point (3 dashes)
// https://www.w3.org/TR/html51/syntax.html#comment-start-dash-state
function stateCommentStartDash(context: ParseHtmlContext, char: string) {
    if (char === '-') {
        // We've read '<!----' (4 dashes) at this point
        context.state = State.CommentEnd;
    } else if (char === '>') {
        // At this point, we'll assume the comment wasn't a real comment
        // so we'll just emit it as data. We basically read the sequence
        // '<!--->'
        resetToDataState(context);
    } else {
        // Anything else, take it as a valid comment
        context.state = State.Comment;
    }
}

// Currently reading the comment's text (data)
// https://www.w3.org/TR/html51/syntax.html#comment-state
function stateComment(context: ParseHtmlContext, char: string) {
    if (char === '-') {
        context.state = State.CommentEndDash;
    } else {
        // Any other character, stay in the Comment state
    }
}

// When we we've read the first dash inside a comment, it may signal the
// end of the comment if we read another dash
// https://www.w3.org/TR/html51/syntax.html#comment-end-dash-state
function stateCommentEndDash(context: ParseHtmlContext, char: string) {
    if (char === '-') {
        context.state = State.CommentEnd;
    } else {
        // Wasn't a dash, must still be part of the comment
        context.state = State.Comment;
    }
}

// After we've read two dashes inside a comment, it may signal the end of
// the comment if we then read a '>' char
// https://www.w3.org/TR/html51/syntax.html#comment-end-state
function stateCommentEnd(context: ParseHtmlContext, char: string) {
    if (char === '>') {
        emitTagAndPreviousTextNode(context);
    } else if (char === '!') {
        context.state = State.CommentEndBang;
    } else if (char === '-') {
        // A 3rd '-' has been read: stay in the CommentEnd state
    } else {
        // Anything else, switch back to the comment state since we didn't
        // read the full "end comment" sequence (i.e. '-->')
        context.state = State.Comment;
    }
}

// We've read the sequence '--!' inside of a comment
// https://www.w3.org/TR/html51/syntax.html#comment-end-bang-state
function stateCommentEndBang(context: ParseHtmlContext, char: string) {
    if (char === '-') {
        // We read the sequence '--!-' inside of a comment. The last dash
        // could signify that the comment is going to close
        context.state = State.CommentEndDash;
    } else if (char === '>') {
        // End of comment with the sequence '--!>'
        emitTagAndPreviousTextNode(context);
    } else {
        // The '--!' was not followed by a '>', continue reading the
        // comment's text
        context.state = State.Comment;
    }
}

/**
 * For DOCTYPES in particular, we don't care about the attributes. Just
 * advance to the '>' character and emit the tag, unless we find a '<'
 * character in which case we'll start a new tag.
 *
 * Example doctype tag:
 *    <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
 *
 * Actual spec: https://www.w3.org/TR/html51/syntax.html#doctype-state
 */
function stateDoctype(context: ParseHtmlContext, char: string) {
    if (char === '>') {
        emitTagAndPreviousTextNode(context);
    } else if (char === '<') {
        startNewTag(context);
    } else {
        // stay in the Doctype state
    }
}

// We've read a '&' character
// https://html.spec.whatwg.org/multipage/parsing.html#character-reference-state
function stateCharacterReference(context: ParseHtmlContext, charCode: number) {
    if (charCode === Char.NumberSign /* '#' */) {
        context.state = State.CharacterReferenceNumeric;
    } else if (isAsciiAlphaNumericChar(charCode)) {
        context.currentCharRef!.type = CharReferenceType.Named;
        context.state = State.CharacterReferenceNamed;
    } else {
        // TODO: Can we be inside a tag when we get here? If so, don't reset the
        //       currentTag
        resetToDataState(context);
    }
}

// We've read an ASCII alpha-numeric character after a '&' char, such as reading
// the 'a' character in '&amp;'
// https://html.spec.whatwg.org/multipage/parsing.html#named-character-reference-state
function stateCharacterReferenceNamed(context: ParseHtmlContext, charCode: number) {
    if (charCode === Char.SemiColon /* ';' */) {
        const currentEntity = context.currentCharRef!;
        const entityText = context.html.slice(currentEntity.idx, context.charIdx);

        const mappedChar = decodeNamedCharacterReference(entityText);
        if (mappedChar) {
            // Store the data (text) that came before the character reference
            context.currentDataSlices.push(
                context.html.slice(context.currentDataSliceIdx, currentEntity.idx)
            );
            context.currentDataSliceIdx = currentEntity.idx + entityText.length;

            // Then store the decoded character reference
            context.currentDataSlices.push(mappedChar);
        } else {
            // We don't have a mapping for the named character reference, so
            // simply leave it as-is in the data stream. The unaltered character
            // reference will simply be captured as-is when the next string
            // slice of the html is taken.
        }
    } else if (isAsciiAlphaNumericChar(charCode)) {
        // stay in the CharacterReferenceNamed state
    } else {
        // Some other char, just reset to data state - not a named character reference sequence
        resetToDataState(context);
    }
}

// We've read a '#' char after '&' which begins a numeric character reference.
// For example, we could be reading the sequence '&#60;' or '&#x3C;'
// https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-state
function stateCharacterReferenceNumeric(context: ParseHtmlContext, charCode: number) {
    if (charCode === Char.X || charCode === Char.x) {
        context.state = State.CharacterReferenceHexadecimalStart;
    } else if (isAsciiDigitChar(charCode)) {
        context.state = State.CharacterReferenceDecimal;
        reconsumeCurrentChar(context);
    } else {
        // Not a numeric character reference, back to data state
        // https://html.spec.whatwg.org/multipage/parsing.html#parse-error-absence-of-digits-in-numeric-character-reference
        resetToDataState(context);
    }
}

// We've read an 'x' or 'X' char after a '&#' sequence, which begins a hexadecimal
// character reference. For example, we could be reading the sequence '&#x3C;'
// https://html.spec.whatwg.org/multipage/parsing.html#hexadecimal-character-reference-start-state
function stateCharacterReferenceHexadecimalStart(context: ParseHtmlContext, charCode: number) {
    if (isHexChar(charCode)) {
        context.state = State.CharacterReferenceHexadecimal;
        reconsumeCurrentChar(context);
    } else {
        // Not a hexadecimal character reference, back to data state - not a
        // valid character reference (HTML entity) sequence
        resetToDataState(context);
    }
}

// We've read a hexadecimal (0-9, A-F) char after a '&#x' sequence, which begins a hexadecimal
// character reference. For example, we could be reading the sequence '&#x3C;'
// https://html.spec.whatwg.org/multipage/parsing.html#hexadecimal-character-reference-state
function stateCharacterReferenceHexadecimal(context: ParseHtmlContext, charCode: number) {
    if (/*charCode === Char.SemiColon ||*/ !isHexChar(charCode)) {
        // Either a ';' char to end the character reference, or some other character
        // which is a "missing-semicolon-after-character-reference" error:
        //     https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-semicolon-after-character-reference
        // Either way, capture the current reference according to the spec
        captureCurrentCharacterRef(context);
    } else {
        const currentEntity = context.currentCharRef!;
        const charRefCode = currentEntity.charRefCode;

        if (isAsciiDigitChar(charCode)) {
            // stay in the CharacterReferenceHexadecimal state
            currentEntity.charRefCode = charRefCode * 16 + (charCode - 0x30); // 0x30 (in the spec) is 48 decimal. Char "0" == 48 decimal, hence 48 - 48 = 0
        } else if (isAsciiUpperHexDigitChar(charCode)) {
            // stay in the CharacterReferenceHexadecimal state
            currentEntity.charRefCode = charRefCode * 16 + (charCode - 0x37); // 0x37 (in the spec) is 55 decimal. Char "A" == 65 decimal, but it's +10 for Hex so 65 - 55 = 10
        } /*if (isAsciiLowerHexDigitChar(charCode))*/ else {
            // stay in the CharacterReferenceHexadecimal state
            currentEntity.charRefCode = charRefCode * 16 + (charCode - 0x57); // 0x57 (in the spec) is 87 decimal. Char "a" == 97 decimal, but it's +10 for Hex so 97 - 87 = 10
        }
    }
}

// We've read an ASCII digit after a '&#' sequence, which begins a decimal (base 10)
// character reference. For example, we could be reading the sequence '&#60;'
// https://html.spec.whatwg.org/multipage/parsing.html#decimal-character-reference-start-state
function stateCharacterReferenceDecimal(context: ParseHtmlContext, charCode: number) {
    if (!isAsciiDigitChar(charCode)) {
        // Either a ';' char to end the character reference, or some other character
        // which is a "missing-semicolon-after-character-reference" error:
        //     https://html.spec.whatwg.org/multipage/parsing.html#parse-error-missing-semicolon-after-character-reference
        // Either way, capture the current reference according to the spec
        captureCurrentCharacterRef(context);
    } else {
        // ASCII digit, stay in the CharacterReferenceDecimal state
        const currentEntity = context.currentCharRef!;
        currentEntity.charRefCode = currentEntity.charRefCode * 10 + (charCode - 0x30); // 0x30 (in the spec) is 48 decimal. Char "0" == 48 decimal, hence 48 - 48 = 0. Char "1" would give us the value 1, etc.
    }
}

// We've read a ';' character to end a numeric character reference such as '&#60;',
// OR there was an invalid char after a valid sequence such as '&#60Hello' where
// we'll still decode the '&#60' part
// https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state
function captureCurrentCharacterRef(context: ParseHtmlContext) {
    const { currentCharRef: currentEntity, currentDataSlices } = context;
    const { charRefCode } = currentEntity!;

    let replacementCharCode: number;

    if (charRefCode === 0 || charRefCode > 0x10ffff || isSurrogateChar(charRefCode)) {
        // 0: "null-reference-char" parse error: https://html.spec.whatwg.org/multipage/parsing.html#parse-error-null-character-reference
        // >0x10FFFF: "character-reference-outside-unicode-range" parse error: https://html.spec.whatwg.org/multipage/parsing.html#parse-error-character-reference-outside-unicode-range
        // U+D800 to U+DFFF (Unicode surrogate chars): "surrogate-character-reference": https://html.spec.whatwg.org/multipage/parsing.html#parse-error-surrogate-character-reference
        replacementCharCode = 0xfffd; // use '�' char according to the spec
    } else {
        const c1ControlCharReplacement = c1ControlCharReplacements.get(charRefCode);

        if (c1ControlCharReplacement) {
            // The value was a control character in the replacements table described
            // here: https://html.spec.whatwg.org/multipage/parsing.html#numeric-character-reference-end-state
            replacementCharCode = c1ControlCharReplacement;
        } else {
            // Otherwise we'll use the character code as-is
            replacementCharCode = charRefCode;
        }
    }

    // TODO! Need to capture the 'data' string behind the character reference first

    currentDataSlices.push(String.fromCharCode(replacementCharCode));
    resetToDataState(context);
}

/**
 * Attempts to decode a named HTML character reference (e.g. '&amp;') based on
 * the mappings that we have.
 *
 * If we have a mapping for the character reference, we'll return the mapped
 * character (e.g. '&'), or otherwise return `null`.
 */
function decodeNamedCharacterReference(entityText: string): string | null {
    // For now, just map '&amp';
    // TODO: map more common character entities that are important
    switch (entityText) {
        case '&amp':
            return '&';

        default:
            return null;
    }

    // Old code in autolinker.ts
    // // "Walk around" common HTML entities. An '&nbsp;' (for example)
    // // could be at the end of a URL, but we don't want to
    // // include the trailing '&' in the URL. See issue #76
    // // TODO: Handle HTML entities separately in parseHtml() and
    // // don't emit them as "text" except for &amp; entities
    // const htmlCharacterEntitiesRegex =
    //     /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;|&quot;|&#34;|&#39;)/gi; // NOTE: capturing group is significant to include the split characters in the .split() call below
    // const textSplit = text.split(htmlCharacterEntitiesRegex);

    // let currentOffset = offset;
    // textSplit.forEach((splitText, i) => {
    //     // even number matches are text, odd numbers are html entities
    //     if (i % 2 === 0) {
    //         const textNodeMatches = this.parseText(splitText, currentOffset);
    //         matches.push(...textNodeMatches);
    //     }
    //     currentOffset += splitText.length;
    // });
}

// -----------------------------------------------------
// Utility functions

/**
 * Resets the state back to the Data state, and removes the current tag.
 *
 * We'll generally run this function whenever a "parse error" is
 * encountered, where the current tag that is being read no longer looks
 * like a real HTML tag.
 */
function resetToDataState(context: ParseHtmlContext) {
    context.state = State.Data;
    context.currentTag = null;
    context.currentCharRef = null;
    context.currentDataSlices = []; // TODO: Use null value to avoid extra garbage collection
}

/**
 * Starts a new HTML tag at the current index, ignoring any previous HTML
 * tag that was being read.
 *
 * We'll generally run this function whenever we read a new '<' character,
 * including when we read a '<' character inside of an HTML tag that we were
 * previously reading.
 */
function startNewTag(context: ParseHtmlContext) {
    context.state = State.TagOpen;
    context.currentTag = new CurrentTag({ idx: context.charIdx });
}

/**
 * Starts a new HTML entity at the current index, ignoring any previous HTML
 * entity that was being read.
 *
 * We'll generally run this function whenever we read a new '&' character.
 */
function startNewEntity(context: ParseHtmlContext) {
    context.state = State.CharacterReference;
    context.currentCharRef = new CurrentCharReference(context.charIdx);
}

/**
 * Once we've decided to emit a tag, that means we can also emit the text node
 * before it.
 */
function emitTagAndPreviousTextNode(context: ParseHtmlContext) {
    const { currentTag } = context;
    const { idx: currentTagIdx, type: currentTagType, name: currentTagName } = currentTag!;

    // Emit the data slice before the tag
    captureCurrentDataAndEmit(context, currentTagIdx);

    switch (currentTagType) {
        case HtmlTagType.Comment:
            context.callbacks.onComment(currentTagIdx);
            break;

        case HtmlTagType.Doctype:
            context.callbacks.onDoctype(currentTagIdx);
            break;

        case HtmlTagType.Tag: {
            const { isOpening, isClosing } = currentTag!;

            if (isOpening) {
                context.callbacks.onOpenTag(currentTagName, currentTagIdx);
            }
            if (isClosing) {
                // note: self-closing tags will emit both opening and closing
                context.callbacks.onCloseTag(currentTagName, currentTagIdx);
            }
            break;
        }

        /* istanbul ignore next */
        default:
            assertNever(currentTagType);
    }

    // Since we just emitted a tag, reset to the data state for the next char
    resetToDataState(context);
    context.currentDataStartIdx = context.currentDataSliceIdx = context.charIdx + 1;
}

/**
 *
 *
 * @param context
 * @param upToCharIdx
 */
function captureCurrentDataAndEmit(context: ParseHtmlContext, upToCharIdx: number) {
    const { currentDataStartIdx, currentDataSliceIdx, currentDataSlices, html } = context;

    const dataSliceBeforeCharIdx = html.slice(currentDataSliceIdx, upToCharIdx);
    if (dataSliceBeforeCharIdx.length > 0) {
        currentDataSlices.push(dataSliceBeforeCharIdx);
    }
    if (currentDataSlices.length > 0) {
        // if the html tag was the first element in the html string, or two
        // tags were next to each other, we won't have `textBeforeTag` (in which
        // case we should not emit a text node)
        context.callbacks.onText(currentDataSlices.join(''), currentDataStartIdx);
    }
}

/**
 * Captures the tag name from the start of the tag to the current character
 * index, and converts it to lower case
 */
function captureTagName(context: ParseHtmlContext) {
    const startIdx = context.currentTag!.idx + (context.currentTag!.isClosing ? 2 : 1);
    return context.html.slice(startIdx, context.charIdx).toLowerCase();
}

/**
 * Causes the main loop to re-consume the current character, such as after
 * encountering a "parse error" that changed state and needs to reconsume
 * the same character in that new state.
 */
function reconsumeCurrentChar(context: ParseHtmlContext) {
    context.charIdx--;
}

/**
 * The subset of the parser states defined in https://www.w3.org/TR/html51/syntax.html
 * which are useful for Autolinker.
 */
// For debugging: temporarily remove 'const' keyword on the State enum
export const enum State {
    Data = 0,
    TagOpen,
    EndTagOpen,
    TagName,
    BeforeAttributeName,
    AttributeName,
    AfterAttributeName,
    BeforeAttributeValue,
    AttributeValueDoubleQuoted,
    AttributeValueSingleQuoted,
    AttributeValueUnquoted,
    AfterAttributeValueQuoted,
    SelfClosingStartTag,
    MarkupDeclarationOpenState, // When the sequence '<!' is read for an HTML comment or doctype
    CommentStart,
    CommentStartDash,
    Comment,
    CommentEndDash,
    CommentEnd,
    CommentEndBang,
    Doctype,
    CharacterReference, // beginning with a '&' char
    CharacterReferenceNamed, // example: '&amp;'
    CharacterReferenceNumeric, // when we've read the '#' in '&#60;' or '&#x3C;'
    CharacterReferenceHexadecimalStart, // when we've read the 'x' char in '&#x3C;'
    CharacterReferenceHexadecimal, // when we've read the first hexadecimal digit in '&#x3C;'
    CharacterReferenceDecimal, // when we've read the first decimal digit in '&#60;'
}
