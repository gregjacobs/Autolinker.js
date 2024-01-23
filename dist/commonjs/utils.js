"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertNever = exports.removeWithPredicate = exports.remove = exports.ellipsis = exports.defaults = exports.isBoolean = exports.isUndefined = void 0;
/**
 * Simpler helper method to check for undefined simply for the benefit of
 * gaining better compression when minified by not needing to have multiple
 * comparisons to the `undefined` keyword in the codebase.
 */
function isUndefined(value) {
    return value === undefined;
}
exports.isUndefined = isUndefined;
/**
 * Simpler helper method to check for a boolean type simply for the benefit of
 * gaining better compression when minified by not needing to have multiple
 * `typeof` comparisons in the codebase.
 */
function isBoolean(value) {
    return typeof value === 'boolean';
}
exports.isBoolean = isBoolean;
/**
 * Assigns (shallow copies) the properties of `src` onto `dest`, if the
 * corresponding property on `dest` === `undefined`.
 *
 * @param {Object} dest The destination object.
 * @param {Object} src The source object.
 * @return {Object} The destination object (`dest`)
 */
function defaults(dest, src) {
    for (var prop in src) {
        if (src.hasOwnProperty(prop) && isUndefined(dest[prop])) {
            dest[prop] = src[prop];
        }
    }
    return dest;
}
exports.defaults = defaults;
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
function ellipsis(str, truncateLen, ellipsisChars) {
    var ellipsisLength;
    if (str.length > truncateLen) {
        if (ellipsisChars == null) {
            ellipsisChars = '&hellip;';
            ellipsisLength = 3;
        }
        else {
            ellipsisLength = ellipsisChars.length;
        }
        str = str.substring(0, truncateLen - ellipsisLength) + ellipsisChars;
    }
    return str;
}
exports.ellipsis = ellipsis;
/**
 * Removes array elements by value. Mutates the input array.
 *
 * Using this instead of the ES5 Array.prototype.filter() function to prevent
 * creating many new arrays in memory for removing an element.
 *
 * @param arr The array to remove elements from. This array is mutated.
 * @param fn The element to remove.
 */
function remove(arr, item) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (arr[i] === item) {
            arr.splice(i, 1);
        }
    }
}
exports.remove = remove;
/**
 * Removes array elements based on a filtering function. Mutates the input
 * array.
 *
 * Using this instead of the ES5 Array.prototype.filter() function to prevent
 * creating many new arrays in memory for filtering.
 *
 * @param arr The array to remove elements from. This array is mutated.
 * @param fn The predicate function which should return `true` to remove an
 *   element.
 */
function removeWithPredicate(arr, fn) {
    for (var i = arr.length - 1; i >= 0; i--) {
        if (fn(arr[i]) === true) {
            arr.splice(i, 1);
        }
    }
}
exports.removeWithPredicate = removeWithPredicate;
/**
 * Function that should never be called but is used to check that every
 * enum value is handled using TypeScript's 'never' type.
 */
function assertNever(theValue) {
    throw new Error("Unhandled case for value: '".concat(theValue, "'"));
}
exports.assertNever = assertNever;
//# sourceMappingURL=utils.js.map