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
export function parseHtml(
    html: string,
    {
        onOpenTag,
        onCloseTag,
        onText,
        onComment,
        onDoctype,
    }: {
        onOpenTag: (tagName: string, offset: number) => void;
        onCloseTag: (tagName: string, offset: number) => void;
        onText: (text: string, offset: number) => void;
        onComment: (offset: number) => void;
        onDoctype: (offset: number) => void;
    }
) {
    const noCurrentTag = new CurrentTag();

    const len = html.length;
    let charIdx = 0,
        state = State.Data as State,
        currentDataIdx = 0, // where the current data start index is
        currentTag = noCurrentTag; // describes the current tag that is being read

    // For debugging: search for other "For debugging" lines
    // const table = new CliTable( {
    // 	head: [ 'charIdx', 'char', 'state', 'currentDataIdx', 'currentOpenTagIdx', 'tag.type' ]
    // } );

    while (charIdx < len) {
        const char = html.charAt(charIdx);
        const charCode = html.charCodeAt(charIdx);

        // For debugging: search for other "For debugging" lines
        // ALSO: Temporarily remove the 'const' keyword on the State enum
        // table.push([
        //     String(charIdx),
        //     char,
        //     State[state],
        //     String(currentDataIdx),
        //     String(currentTag.idx),
        //     currentTag.idx === -1 ? '' : currentTag.type
        // ]);

        switch (state) {
            case State.Data:
                stateData(char);
                break;
            case State.TagOpen:
                stateTagOpen(char, charCode);
                break;
            case State.EndTagOpen:
                stateEndTagOpen(char, charCode);
                break;
            case State.TagName:
                stateTagName(char, charCode);
                break;
            case State.BeforeAttributeName:
                stateBeforeAttributeName(char, charCode);
                break;
            case State.AttributeName:
                stateAttributeName(char, charCode);
                break;
            case State.AfterAttributeName:
                stateAfterAttributeName(char, charCode);
                break;
            case State.BeforeAttributeValue:
                stateBeforeAttributeValue(char, charCode);
                break;
            case State.AttributeValueDoubleQuoted:
                stateAttributeValueDoubleQuoted(char);
                break;
            case State.AttributeValueSingleQuoted:
                stateAttributeValueSingleQuoted(char);
                break;
            case State.AttributeValueUnquoted:
                stateAttributeValueUnquoted(char, charCode);
                break;
            case State.AfterAttributeValueQuoted:
                stateAfterAttributeValueQuoted(char, charCode);
                break;
            case State.SelfClosingStartTag:
                stateSelfClosingStartTag(char);
                break;
            case State.MarkupDeclarationOpenState:
                stateMarkupDeclarationOpen();
                break;
            case State.CommentStart:
                stateCommentStart(char);
                break;
            case State.CommentStartDash:
                stateCommentStartDash(char);
                break;
            case State.Comment:
                stateComment(char);
                break;
            case State.CommentEndDash:
                stateCommentEndDash(char);
                break;
            case State.CommentEnd:
                stateCommentEnd(char);
                break;
            case State.CommentEndBang:
                stateCommentEndBang(char);
                break;
            case State.Doctype:
                stateDoctype(char);
                break;

            /* istanbul ignore next */
            default:
                assertNever(state);
        }

        // For debugging: search for other "For debugging" lines
        // ALSO: Temporarily remove the 'const' keyword on the State enum
        // table.push([
        //     String(charIdx),
        //     char,
        //     State[state],
        //     String(currentDataIdx),
        //     String(currentTag.idx),
        //     currentTag.idx === -1 ? '' : currentTag.type
        // ]);

        charIdx++;
    }

    if (currentDataIdx < charIdx) {
        emitText();
    }

    // For debugging: search for other "For debugging" lines
    // console.log( '\n' + table.toString() );

    // Called when non-tags are being read (i.e. the text around HTML †ags)
    // https://www.w3.org/TR/html51/syntax.html#data-state
    function stateData(char: string) {
        if (char === '<') {
            startNewTag();
        }
    }

    // Called after a '<' is read from the Data state
    // https://www.w3.org/TR/html51/syntax.html#tag-open-state
    function stateTagOpen(char: string, charCode: number) {
        if (char === '!') {
            state = State.MarkupDeclarationOpenState;
        } else if (char === '/') {
            state = State.EndTagOpen;
            currentTag = new CurrentTag({ ...currentTag, isClosing: true });
        } else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag();
        } else if (isAsciiLetterChar(charCode)) {
            // tag name start (and no '/' read)
            state = State.TagName;
            currentTag = new CurrentTag({ ...currentTag, isOpening: true });
        } else {
            // Any other
            state = State.Data;
            currentTag = noCurrentTag;
        }
    }

    // After a '<x', '</x' sequence is read (where 'x' is a letter character),
    // this is to continue reading the tag name
    // https://www.w3.org/TR/html51/syntax.html#tag-name-state
    function stateTagName(char: string, charCode: number) {
        if (isWhitespaceChar(charCode)) {
            currentTag = new CurrentTag({
                ...currentTag,
                name: captureTagName(),
            });
            state = State.BeforeAttributeName;
        } else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag();
        } else if (char === '/') {
            currentTag = new CurrentTag({
                ...currentTag,
                name: captureTagName(),
            });
            state = State.SelfClosingStartTag;
        } else if (char === '>') {
            currentTag = new CurrentTag({
                ...currentTag,
                name: captureTagName(),
            });
            emitTagAndPreviousTextNode(); // resets to Data state as well
        } else if (!isAsciiLetterChar(charCode) && !isDigitChar(charCode) && char !== ':') {
            // Anything else that does not form an html tag. Note: the colon
            // character is accepted for XML namespaced tags
            resetToDataState();
        } else {
            // continue reading tag name
        }
    }

    // Called after the '/' is read from a '</' sequence
    // https://www.w3.org/TR/html51/syntax.html#end-tag-open-state
    function stateEndTagOpen(char: string, charCode: number) {
        if (char === '>') {
            // parse error. Encountered "</>". Skip it without treating as a tag
            resetToDataState();
        } else if (isAsciiLetterChar(charCode)) {
            state = State.TagName;
        } else {
            // some other non-tag-like character, don't treat this as a tag
            resetToDataState();
        }
    }

    // https://www.w3.org/TR/html51/syntax.html#before-attribute-name-state
    function stateBeforeAttributeName(char: string, charCode: number) {
        if (isWhitespaceChar(charCode)) {
            // stay in BeforeAttributeName state - continue reading chars
        } else if (char === '/') {
            state = State.SelfClosingStartTag;
        } else if (char === '>') {
            emitTagAndPreviousTextNode(); // resets to Data state as well
        } else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag();
        } else if (char === `=` || isQuoteChar(charCode) || isControlChar(charCode)) {
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
    function stateAttributeName(char: string, charCode: number) {
        if (isWhitespaceChar(charCode)) {
            state = State.AfterAttributeName;
        } else if (char === '/') {
            state = State.SelfClosingStartTag;
        } else if (char === '=') {
            state = State.BeforeAttributeValue;
        } else if (char === '>') {
            emitTagAndPreviousTextNode(); // resets to Data state as well
        } else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag();
        } else if (isQuoteChar(charCode)) {
            // "Parse error" characters that, according to the spec, should be
            // appended to the attribute name, but we'll treat these characters
            // as not forming a real HTML tag
            resetToDataState();
        } else {
            // anything else: continue reading attribute name
        }
    }

    // https://www.w3.org/TR/html51/syntax.html#after-attribute-name-state
    function stateAfterAttributeName(char: string, charCode: number) {
        if (isWhitespaceChar(charCode)) {
            // ignore the character - continue reading
        } else if (char === '/') {
            state = State.SelfClosingStartTag;
        } else if (char === '=') {
            state = State.BeforeAttributeValue;
        } else if (char === '>') {
            emitTagAndPreviousTextNode();
        } else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag();
        } else if (isQuoteChar(charCode)) {
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
    function stateBeforeAttributeValue(char: string, charCode: number) {
        if (isWhitespaceChar(charCode)) {
            // ignore the character - continue reading
        } else if (char === `"`) {
            state = State.AttributeValueDoubleQuoted;
        } else if (char === `'`) {
            state = State.AttributeValueSingleQuoted;
        } else if (/[>=`]/.test(char)) {
            // Invalid chars after an '=' for an attribute value, don't count
            // the current tag as an HTML tag
            resetToDataState();
        } else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag();
        } else {
            // Any other character, consider it an unquoted attribute value
            state = State.AttributeValueUnquoted;
        }
    }

    // https://www.w3.org/TR/html51/syntax.html#attribute-value-double-quoted-state
    function stateAttributeValueDoubleQuoted(char: string) {
        if (char === `"`) {
            // end the current double-quoted attribute
            state = State.AfterAttributeValueQuoted;
        } else {
            // consume the character as part of the double-quoted attribute value
        }
    }

    // https://www.w3.org/TR/html51/syntax.html#attribute-value-single-quoted-state
    function stateAttributeValueSingleQuoted(char: string) {
        if (char === `'`) {
            // end the current single-quoted attribute
            state = State.AfterAttributeValueQuoted;
        } else {
            // consume the character as part of the double-quoted attribute value
        }
    }

    // https://www.w3.org/TR/html51/syntax.html#attribute-value-unquoted-state
    function stateAttributeValueUnquoted(char: string, charCode: number) {
        if (isWhitespaceChar(charCode)) {
            state = State.BeforeAttributeName;
        } else if (char === '>') {
            emitTagAndPreviousTextNode();
        } else if (char === '<') {
            // start of another tag (ignore the previous, incomplete one)
            startNewTag();
        } else {
            // Any other character, treat it as part of the attribute value
        }
    }

    // Called after a double-quoted or single-quoted attribute value is read
    // (i.e. after the closing quote character)
    // https://www.w3.org/TR/html51/syntax.html#after-attribute-value-quoted-state
    function stateAfterAttributeValueQuoted(char: string, charCode: number) {
        if (isWhitespaceChar(charCode)) {
            state = State.BeforeAttributeName;
        } else if (char === '/') {
            state = State.SelfClosingStartTag;
        } else if (char === '>') {
            emitTagAndPreviousTextNode();
        } else if (char === '<') {
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
    function stateSelfClosingStartTag(char: string) {
        if (char === '>') {
            currentTag = new CurrentTag({ ...currentTag, isClosing: true });
            emitTagAndPreviousTextNode(); // resets to Data state as well
        } else {
            // Note: the spec calls for a character after a '/' within a start
            // tag to go back into the BeforeAttributeName state (in order to
            // read more attributes, but for the purposes of Autolinker, this is
            // most likely not a valid HTML tag. For example: "<something / other>"
            // state = State.BeforeAttributeName;

            // Instead, just treat as regular text
            resetToDataState();
        }
    }

    // https://www.w3.org/TR/html51/syntax.html#markup-declaration-open-state
    // (HTML Comments or !DOCTYPE)
    function stateMarkupDeclarationOpen() {
        if (html.slice(charIdx, charIdx + 2) === '--') {
            // html comment
            charIdx++; // "consume" the second '-' character. Next loop iteration will consume the character after the '<!--' sequence
            currentTag = new CurrentTag({ ...currentTag, type: 'comment' });
            state = State.CommentStart;
        } else if (html.slice(charIdx, charIdx + 7).toUpperCase() === 'DOCTYPE') {
            charIdx += 6; // "consume" the characters "OCTYPE" (the current loop iteraction consumed the 'D'). Next loop iteration will consume the character after the '<!DOCTYPE' sequence
            currentTag = new CurrentTag({ ...currentTag, type: 'doctype' });
            state = State.Doctype;
        } else {
            // At this point, the spec specifies that the state machine should
            // enter the "bogus comment" state, in which case any character(s)
            // after the '<!' that were read should become an HTML comment up
            // until the first '>' that is read (or EOF). Instead, we'll assume
            // that a user just typed '<!' as part of some piece of non-html
            // text
            resetToDataState();
        }
    }

    // Handles after the sequence '<!--' has been read
    // https://www.w3.org/TR/html51/syntax.html#comment-start-state
    function stateCommentStart(char: string) {
        if (char === '-') {
            // We've read the sequence '<!---' at this point (3 dashes)
            state = State.CommentStartDash;
        } else if (char === '>') {
            // At this point, we'll assume the comment wasn't a real comment
            // so we'll just emit it as data. We basically read the sequence
            // '<!-->'
            resetToDataState();
        } else {
            // Any other char, take it as part of the comment
            state = State.Comment;
        }
    }

    // We've read the sequence '<!---' at this point (3 dashes)
    // https://www.w3.org/TR/html51/syntax.html#comment-start-dash-state
    function stateCommentStartDash(char: string) {
        if (char === '-') {
            // We've read '<!----' (4 dashes) at this point
            state = State.CommentEnd;
        } else if (char === '>') {
            // At this point, we'll assume the comment wasn't a real comment
            // so we'll just emit it as data. We basically read the sequence
            // '<!--->'
            resetToDataState();
        } else {
            // Anything else, take it as a valid comment
            state = State.Comment;
        }
    }

    // Currently reading the comment's text (data)
    // https://www.w3.org/TR/html51/syntax.html#comment-state
    function stateComment(char: string) {
        if (char === '-') {
            state = State.CommentEndDash;
        } else {
            // Any other character, stay in the Comment state
        }
    }

    // When we we've read the first dash inside a comment, it may signal the
    // end of the comment if we read another dash
    // https://www.w3.org/TR/html51/syntax.html#comment-end-dash-state
    function stateCommentEndDash(char: string) {
        if (char === '-') {
            state = State.CommentEnd;
        } else {
            // Wasn't a dash, must still be part of the comment
            state = State.Comment;
        }
    }

    // After we've read two dashes inside a comment, it may signal the end of
    // the comment if we then read a '>' char
    // https://www.w3.org/TR/html51/syntax.html#comment-end-state
    function stateCommentEnd(char: string) {
        if (char === '>') {
            emitTagAndPreviousTextNode();
        } else if (char === '!') {
            state = State.CommentEndBang;
        } else if (char === '-') {
            // A 3rd '-' has been read: stay in the CommentEnd state
        } else {
            // Anything else, switch back to the comment state since we didn't
            // read the full "end comment" sequence (i.e. '-->')
            state = State.Comment;
        }
    }

    // We've read the sequence '--!' inside of a comment
    // https://www.w3.org/TR/html51/syntax.html#comment-end-bang-state
    function stateCommentEndBang(char: string) {
        if (char === '-') {
            // We read the sequence '--!-' inside of a comment. The last dash
            // could signify that the comment is going to close
            state = State.CommentEndDash;
        } else if (char === '>') {
            // End of comment with the sequence '--!>'
            emitTagAndPreviousTextNode();
        } else {
            // The '--!' was not followed by a '>', continue reading the
            // comment's text
            state = State.Comment;
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
    function stateDoctype(char: string) {
        if (char === '>') {
            emitTagAndPreviousTextNode();
        } else if (char === '<') {
            startNewTag();
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
        currentTag = new CurrentTag({ idx: charIdx });
    }

    /**
     * Once we've decided to emit an open tag, that means we can also emit the
     * text node before it.
     */
    function emitTagAndPreviousTextNode() {
        const textBeforeTag = html.slice(currentDataIdx, currentTag.idx);
        if (textBeforeTag) {
            // the html tag was the first element in the html string, or two
            // tags next to each other, in which case we should not emit a text
            // node
            onText(textBeforeTag, currentDataIdx);
        }

        if (currentTag.type === 'comment') {
            onComment(currentTag.idx);
        } else if (currentTag.type === 'doctype') {
            onDoctype(currentTag.idx);
        } else {
            if (currentTag.isOpening) {
                onOpenTag(currentTag.name, currentTag.idx);
            }
            if (currentTag.isClosing) {
                // note: self-closing tags will emit both opening and closing
                onCloseTag(currentTag.name, currentTag.idx);
            }
        }

        // Since we just emitted a tag, reset to the data state for the next char
        resetToDataState();
        currentDataIdx = charIdx + 1;
    }

    function emitText() {
        const text = html.slice(currentDataIdx, charIdx);
        onText(text, currentDataIdx);

        currentDataIdx = charIdx + 1;
    }

    /**
     * Captures the tag name from the start of the tag to the current character
     * index, and converts it to lower case
     */
    function captureTagName() {
        const startIdx = currentTag.idx + (currentTag.isClosing ? 2 : 1);
        return html.slice(startIdx, charIdx).toLowerCase();
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
    readonly idx: number; // the index of the '<' in the html string
    readonly type: 'tag' | 'comment' | 'doctype';
    readonly name: string;
    readonly isOpening: boolean; // true if it's an opening tag, OR a self-closing open tag
    readonly isClosing: boolean; // true if it's a closing tag, OR a self-closing open tag

    constructor(cfg: Partial<CurrentTag> = {}) {
        this.idx = cfg.idx !== undefined ? cfg.idx : -1;
        this.type = cfg.type || 'tag';
        this.name = cfg.name || '';
        this.isOpening = !!cfg.isOpening;
        this.isClosing = !!cfg.isClosing;
    }
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
}
