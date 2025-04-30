import { Char } from '../char';
import { isAlphaNumericOrMarkChar } from '../char-utils';

/**
 * Determines if the given `char` is a an allowed character in a hashtag. These
 * are underscores or any alphanumeric char.
 */
export function isHashtagTextChar(charCode: number): boolean {
    return charCode === Char.Underscore || isAlphaNumericOrMarkChar(charCode);
}

/**
 * Determines if a hashtag match is valid.
 */
export function isValidHashtag(hashtag: string): boolean {
    // Max length of 140 for a hashtag ('#' char + 139 word chars)
    return hashtag.length <= 140;
}

export type HashtagService = 'twitter' | 'facebook' | 'instagram' | 'tiktok' | 'youtube';
export const hashtagServices: HashtagService[] = [
    'twitter',
    'facebook',
    'instagram',
    'tiktok',
    'youtube',
];
