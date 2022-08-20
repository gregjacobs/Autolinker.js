/**
 * Assigns (shallow copies) the properties of `src` onto `dest`, if the
 * corresponding property on `dest` === `undefined`.
 *
 * @param {Object} dest The destination object.
 * @param {Object} src The source object.
 * @return {Object} The destination object (`dest`)
 */
export function defaults(dest: any, src: any) {
    for (let prop in src) {
        if (src.hasOwnProperty(prop) && dest[prop] === undefined) {
            dest[prop] = src[prop];
        }
    }

    return dest;
}

/**
 * Truncates the `str` at `len - ellipsisChars.length`, and adds the `ellipsisChars` to the
 * end of the string (by default, two periods: '..'). If the `str` length does not exceed
 * `len`, the string will be returned unchanged.
 *
 * @param {String} str The string to truncate and add an ellipsis to.
 * @param {Number} truncateLen The length to truncate the string at.
 * @param {String} [ellipsisChars=...] The ellipsis character(s) to add to the end of `str`
 *   when truncated. Defaults to '...'
 */
export function ellipsis(str: string, truncateLen: number, ellipsisChars?: string) {
    let ellipsisLength: number;

    if (str.length > truncateLen) {
        if (ellipsisChars == null) {
            ellipsisChars = '&hellip;';
            ellipsisLength = 3;
        } else {
            ellipsisLength = ellipsisChars.length;
        }

        str = str.substring(0, truncateLen - ellipsisLength) + ellipsisChars;
    }
    return str;
}

/**
 * Removes array elements based on a filtering function. Mutates the input
 * array.
 *
 * Using this instead of the ES5 Array.prototype.filter() function, to allow
 * Autolinker compatibility with IE8, and also to prevent creating many new
 * arrays in memory for filtering.
 *
 * @param {Array} arr The array to remove elements from. This array is
 *   mutated.
 * @param {Function} fn A function which should return `true` to
 *   remove an element.
 * @return {Array} The mutated input `arr`.
 */
export function remove<T>(arr: T[], fn: (item: T) => boolean) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (fn(arr[i]) === true) {
            arr.splice(i, 1);
        }
    }
}

/**
 * Performs the functionality of what modern browsers do when `String.prototype.split()` is called
 * with a regular expression that contains capturing parenthesis.
 *
 * For example:
 *
 *     // Modern browsers:
 *     "a,b,c".split( /(,)/ );  // --> [ 'a', ',', 'b', ',', 'c' ]
 *
 *     // Old IE (including IE8):
 *     "a,b,c".split( /(,)/ );  // --> [ 'a', 'b', 'c' ]
 *
 * This method emulates the functionality of modern browsers for the old IE case.
 *
 * @param {String} str The string to split.
 * @param {RegExp} splitRegex The regular expression to split the input `str` on. The splitting
 *   character(s) will be spliced into the array, as in the "modern browsers" example in the
 *   description of this method.
 *   Note #1: the supplied regular expression **must** have the 'g' flag specified.
 *   Note #2: for simplicity's sake, the regular expression does not need
 *   to contain capturing parenthesis - it will be assumed that any match has them.
 * @return {String[]} The split array of strings, with the splitting character(s) included.
 */
export function splitAndCapture(str: string, splitRegex: RegExp) {
    if (!splitRegex.global) throw new Error("`splitRegex` must have the 'g' flag set");

    let result: string[] = [],
        lastIdx = 0,
        match: RegExpExecArray | null;

    while ((match = splitRegex.exec(str))) {
        result.push(str.substring(lastIdx, match.index));
        result.push(match[0]); // push the splitting char(s)

        lastIdx = match.index + match[0].length;
    }
    result.push(str.substring(lastIdx));

    return result;
}

/**
 * Function that should never be called but is used to check that every
 * enum value is handled using TypeScript's 'never' type.
 */
export function throwUnhandledCaseError(theValue: never) {
    throw new Error(`Unhandled case for value: '${theValue}'`);
}
