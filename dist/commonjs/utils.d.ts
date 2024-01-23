/**
 * Simpler helper method to check for undefined simply for the benefit of
 * gaining better compression when minified by not needing to have multiple
 * comparisons to the `undefined` keyword in the codebase.
 */
export declare function isUndefined(value: any): value is undefined;
/**
 * Simpler helper method to check for a boolean type simply for the benefit of
 * gaining better compression when minified by not needing to have multiple
 * `typeof` comparisons in the codebase.
 */
export declare function isBoolean(value: any): value is boolean;
/**
 * Assigns (shallow copies) the properties of `src` onto `dest`, if the
 * corresponding property on `dest` === `undefined`.
 *
 * @param {Object} dest The destination object.
 * @param {Object} src The source object.
 * @return {Object} The destination object (`dest`)
 */
export declare function defaults(dest: any, src: any): any;
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
export declare function ellipsis(str: string, truncateLen: number, ellipsisChars?: string): string;
/**
 * Removes array elements by value. Mutates the input array.
 *
 * Using this instead of the ES5 Array.prototype.filter() function to prevent
 * creating many new arrays in memory for removing an element.
 *
 * @param arr The array to remove elements from. This array is mutated.
 * @param fn The element to remove.
 */
export declare function remove<T>(arr: T[], item: T): void;
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
export declare function removeWithPredicate<T>(arr: T[], fn: (item: T) => boolean): void;
/**
 * Function that should never be called but is used to check that every
 * enum value is handled using TypeScript's 'never' type.
 */
export declare function assertNever(theValue: never): void;
