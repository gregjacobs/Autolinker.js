/**
 * Determines if the given `char` is a an allowed character in a hashtag. These
 * are underscores or any alphanumeric char.
 */
export declare function isHashtagTextChar(char: string): boolean;
/**
 * Determines if a hashtag match is valid.
 */
export declare function isValidHashtag(hashtag: string): boolean;
export type HashtagService = 'twitter' | 'facebook' | 'instagram' | 'tiktok';
export declare const hashtagServices: HashtagService[];
