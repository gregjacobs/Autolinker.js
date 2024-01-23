/**
 * Determines if the given character can be part of a mention's text characters.
 */
export declare function isMentionTextChar(char: string): boolean;
/**
 * Determines if the given `mention` text is valid.
 */
export declare function isValidMention(mention: string, serviceName: MentionService): boolean;
export type MentionService = 'twitter' | 'instagram' | 'soundcloud' | 'tiktok';
export declare const mentionServices: MentionService[];
