import { alphaNumericAndMarksRe } from '../regex-lib';

/**
 * Determines if the given `char` is a an allowed character in a hashtag. These
 * are underscores or any alphanumeric char.
 */
export function isHashtagTextChar(char: string): boolean {
    return char === '_' || alphaNumericAndMarksRe.test(char);
}

/**
 * Determines if a hashtag match is valid.
 */
export function isValidHashtag(hashtag: string): boolean {
    // Max length of 140 for a hashtag ('#' char + 139 word chars)
    return hashtag.length <= 140;
}

export type HashtagService = 'twitter' | 'facebook' | 'instagram' | 'tiktok';
export const hashtagServices: HashtagService[] = ['twitter', 'facebook', 'instagram', 'tiktok'];
