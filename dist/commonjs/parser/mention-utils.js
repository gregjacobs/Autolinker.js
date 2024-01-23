"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mentionServices = exports.isValidMention = exports.isMentionTextChar = void 0;
var mentionRegexes = {
    twitter: /^@\w{1,15}$/,
    instagram: /^@[_\w]{1,30}$/,
    soundcloud: /^@[-a-z0-9_]{3,25}$/,
    // TikTok usernames are 1-24 characters containing letters, numbers, underscores
    // and periods, but cannot end in a period: https://support.tiktok.com/en/getting-started/setting-up-your-profile/changing-your-username
    tiktok: /^@[.\w]{1,23}[\w]$/,
};
// Regex that allows for all possible mention characters for any service. We'll
// confirm the match based on the user-configured service name after a match is
// found.
var mentionTextCharRe = /[-\w.]/;
/**
 * Determines if the given character can be part of a mention's text characters.
 */
function isMentionTextChar(char) {
    return mentionTextCharRe.test(char);
}
exports.isMentionTextChar = isMentionTextChar;
/**
 * Determines if the given `mention` text is valid.
 */
function isValidMention(mention, serviceName) {
    var re = mentionRegexes[serviceName];
    return re.test(mention);
}
exports.isValidMention = isValidMention;
exports.mentionServices = ['twitter', 'instagram', 'soundcloud', 'tiktok'];
//# sourceMappingURL=mention-utils.js.map