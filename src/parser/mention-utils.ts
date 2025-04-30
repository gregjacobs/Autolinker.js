import { Char } from '../char';
import { isDigitChar, isAsciiLetterChar } from '../char-utils';

const mentionRegexes: { [serviceName in MentionService]: RegExp } = {
    twitter: /^@\w{1,15}$/,
    instagram: /^@[_\w]{1,30}$/,
    soundcloud: /^@[-a-z0-9_]{3,25}$/,

    // TikTok usernames are 1-24 characters containing letters, numbers, underscores
    // and periods, but cannot end in a period: https://support.tiktok.com/en/getting-started/setting-up-your-profile/changing-your-username
    tiktok: /^@[.\w]{1,23}[\w]$/,

    // Youtube usernames are 3-30 characters containing letters, numbers, underscores,
    // dashes, or latin middle dots ('·').
    // https://support.google.com/youtube/answer/11585688?hl=en&co=GENIE.Platform%3DAndroid#tns
    youtube: /^@[-.·\w]{3,30}$/,
};

/**
 * Determines if the given character can be part of a mention's text characters.
 *
 * Accepts characters that match the RegExp `/[-\w.]/`, which are the possible
 * mention characters for any service.
 *
 * We'll confirm the match based on the user-configured service name after the
 * match is found.
 */
export function isMentionTextChar(charCode: number): boolean {
    return (
        charCode === Char.Dash || // '-'
        charCode === Char.Dot || // '.'
        charCode === Char.Underscore || // '_'
        isAsciiLetterChar(charCode) ||
        isDigitChar(charCode)
    );
}

/**
 * Determines if the given `mention` text is valid.
 */
export function isValidMention(mention: string, serviceName: MentionService): boolean {
    const re = mentionRegexes[serviceName];

    return re.test(mention);
}

export type MentionService = 'twitter' | 'instagram' | 'soundcloud' | 'tiktok' | 'youtube';
export const mentionServices: MentionService[] = [
    'twitter',
    'instagram',
    'soundcloud',
    'tiktok',
    'youtube',
];
