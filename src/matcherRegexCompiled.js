/**
 * @member Autolinker
 * @private
 * @property {RegExp} matcherRegex
 * 
 * The regular expression that matches URLs, email addresses, and Twitter handles.
 * 
 * Capturing groups:
 * 
 * 1. Group that is used to determine if there is a match at all. The regex ignores anchor tags including their innerHTML,
 *    so we check this to see if it is defined to see if the match is legitimate.
 */
/*global Autolinker*/
Autolinker.matcherRegex = /<a\b[^<>]*>[\s\S]*?<\/a>|((@\w{1,15})|(?:(?:([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:[A-Za-z0-9\.\-]*[A-Za-z0-9\-]\.(com|org|net|gov|edu|mil|us|info|biz|ws|name|mobi|cc|tv|co\.uk|de|ru|hu|fr|br)))(?:(?:\/[\+~%\/\.\w\-]*)?(?:\?[\-\+=&;%@\.\w]*)?(?:#[\-\.\!\/\\\w%]*)?)?)/g;