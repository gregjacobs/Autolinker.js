import {
    isDigitChar,
    isAsciiLetterChar,
    isQuoteChar,
    isWhitespaceChar,
    isControlChar,
} from '../char-utils';
import { assertNever } from '../utils';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

class CurrentTag {
    public idx: number; // the index of the '<' in the html string
    public type: CurrentTagType;
    public name: string;
    public isOpening: boolean; // true if it's an opening tag, OR a self-closing open tag
    public isClosing: boolean; // true if it's a closing tag, OR a self-closing open tag

    constructor(cfg: Partial<CurrentTag> = {}) {
        this.idx = cfg.idx !== undefined ? cfg.idx : -1;
        this.type = cfg.type || CurrentTagType.Tag;
        this.name = cfg.name || '';
        this.isOpening = !!cfg.isOpening;
        this.isClosing = !!cfg.isClosing;
    }
}

// For debugging: temporarily remove 'const'
const enum CurrentTagType {
    Tag = 0,
    Comment,
    Doctype,
}

// // Represents the current HTML entity (ex: '&amp;') being read
// class CurrentEntity {
//     readonly idx: number; // the index of the '&' in the html string
//     readonly type: 'decimal' | 'hex' | 'named' | undefined;
//     readonly content: string;

//     constructor(cfg: Partial<CurrentEntity> = {}) {
//         this.idx = cfg.idx !== undefined ? cfg.idx : -1;
//         this.type = cfg.type;
//         this.content = cfg.content || '';
//     }
// }

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
    public charIdx = 0; // Current character index being processed
    public readonly html: string; // The input html being parsed
    public readonly callbacks: ParseHtmlCallbacks;
    public state: State = State.Data; // begin in the Data state
    public currentDataIdx = 0; // where the current data start index is
    public currentTag: CurrentTag = new CurrentTag(); // describes the current tag that is being read
    // public currentEntity: CurrentEntity = new CurrentEntity(); // describes the current HTML entity (ex: '&amp;') that is being read

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

    if (context.currentDataIdx < context.charIdx) {
        emitText(context);
    }

    // For debugging: search for other "For debugging" lines
    // console.log( '\n' + table.toString() );
}

// Called when non-tags are being read (i.e. the text around HTML †ags)
// https://www.w3.org/TR/html51/syntax.html#data-state
function stateData(context: ParseHtmlContext, char: string) {
    if (char === '<') {
        startNewTag(context);
    } /*else if (char === '&') {
        startNewEntity(context);
    }*/
}

// Called after a '<' is read from the Data state
// https://www.w3.org/TR/html51/syntax.html#tag-open-state
function stateTagOpen(context: ParseHtmlContext, char: string, charCode: number) {
    if (char === '!') {
        context.state = State.MarkupDeclarationOpenState;
    } else if (char === '/') {
        context.state = State.EndTagOpen;
        context.currentTag.isClosing = true;
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else if (isAsciiLetterChar(charCode)) {
        // tag name start (and no '/' read)
        context.state = State.TagName;
        context.currentTag.isOpening = true;
    } else {
        // Any other
        context.state = State.Data;
        context.currentTag = new CurrentTag();
    }
}

// After a '<x', '</x' sequence is read (where 'x' is a letter character),
// this is to continue reading the tag name
// https://www.w3.org/TR/html51/syntax.html#tag-name-state
function stateTagName(context: ParseHtmlContext, char: string, charCode: number) {
    if (isWhitespaceChar(charCode)) {
        context.currentTag.name = captureTagName(context);
        context.state = State.BeforeAttributeName;
    } else if (char === '<') {
        // start of another tag (ignore the previous, incomplete one)
        startNewTag(context);
    } else if (char === '/') {
        context.currentTag.name = captureTagName(context);
        context.state = State.SelfClosingStartTag;
    } else if (char === '>') {
        context.currentTag.name = captureTagName(context);
        emitTagAndPreviousTextNode(context); // resets to Data state as well
    } else if (!isAsciiLetterChar(charCode) && !isDigitChar(charCode) && char !== ':') {
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
        context.currentTag.isClosing = true;
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
        context.charIdx++; // "consume" the second '-' character. Next loop iteration will consume the character after the '<!--' sequence
        context.currentTag.type = CurrentTagType.Comment;
        context.state = State.CommentStart;
    } else if (html.slice(charIdx, charIdx + 7).toUpperCase() === 'DOCTYPE') {
        context.charIdx += 6; // "consume" the characters "OCTYPE" (the current loop iteraction consumed the 'D'). Next loop iteration will consume the character after the '<!DOCTYPE' sequence
        context.currentTag.type = CurrentTagType.Doctype;
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

/**
 * Resets the state back to the Data state, and removes the current tag.
 *
 * We'll generally run this function whenever a "parse error" is
 * encountered, where the current tag that is being read no longer looks
 * like a real HTML tag.
 */
function resetToDataState(context: ParseHtmlContext) {
    context.state = State.Data;
    context.currentTag = new CurrentTag();
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
 * Once we've decided to emit an open tag, that means we can also emit the
 * text node before it.
 */
function emitTagAndPreviousTextNode(context: ParseHtmlContext) {
    const textBeforeTag = context.html.slice(context.currentDataIdx, context.currentTag.idx);
    if (textBeforeTag) {
        // the html tag was the first element in the html string, or two
        // tags next to each other, in which case we should not emit a text
        // node
        context.callbacks.onText(textBeforeTag, context.currentDataIdx);
    }

    const currentTag = context.currentTag;
    if (currentTag.type === CurrentTagType.Comment) {
        context.callbacks.onComment(currentTag.idx);
    } else if (currentTag.type === CurrentTagType.Doctype) {
        context.callbacks.onDoctype(currentTag.idx);
    } else {
        if (currentTag.isOpening) {
            context.callbacks.onOpenTag(currentTag.name, currentTag.idx);
        }
        if (currentTag.isClosing) {
            // note: self-closing tags will emit both opening and closing
            context.callbacks.onCloseTag(currentTag.name, currentTag.idx);
        }
    }

    // Since we just emitted a tag, reset to the data state for the next char
    resetToDataState(context);
    context.currentDataIdx = context.charIdx + 1;
}

function emitText(context: ParseHtmlContext) {
    const text = context.html.slice(context.currentDataIdx, context.charIdx);
    context.callbacks.onText(text, context.currentDataIdx);

    context.currentDataIdx = context.charIdx + 1;
}

/**
 * Captures the tag name from the start of the tag to the current character
 * index, and converts it to lower case
 */
function captureTagName(context: ParseHtmlContext) {
    const startIdx = context.currentTag.idx + (context.currentTag.isClosing ? 2 : 1);
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
    // CharacterReference, // beginning with a '&' char
    // CharacterReferenceNamed,  // example: '&amp;'
    // CharacterReferenceNumeric, // example: '&#60;'
    // CharacterReferenceHexadecimal, // example: '&#x3C;'
}
