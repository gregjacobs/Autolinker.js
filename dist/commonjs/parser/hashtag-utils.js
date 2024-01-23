"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashtagServices = exports.isValidHashtag = exports.isHashtagTextChar = void 0;
var regex_lib_1 = require("../regex-lib");
/**
 * Determines if the given `char` is a an allowed character in a hashtag. These
 * are underscores or any alphanumeric char.
 */
function isHashtagTextChar(char) {
    return char === '_' || regex_lib_1.alphaNumericAndMarksRe.test(char);
}
exports.isHashtagTextChar = isHashtagTextChar;
/**
 * Determines if a hashtag match is valid.
 */
function isValidHashtag(hashtag) {
    // Max length of 140 for a hashtag ('#' char + 139 word chars)
    return hashtag.length <= 140;
}
exports.isValidHashtag = isValidHashtag;
exports.hashtagServices = ['twitter', 'facebook', 'instagram', 'tiktok'];
//# sourceMappingURL=hashtag-utils.js.map