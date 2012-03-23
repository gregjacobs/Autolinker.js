/**
 * @member Autolinker
 * @private
 * @property {RegExp} matcherRegex
 * 
 * The regular expression that matches URLs, email addresses, and Twitter handles.
 */
/*global Autolinker*/
Autolinker.matcherRegex = /((?:([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:[A-Za-z0-9\.\-]*[A-Za-z0-9\-]\.(com|org|net|gov|edu|mil|us|info|biz|ws|name|mobi|cc|tv|co\.uk|de|ru|hu|fr|br)))(?:(?:\/[\+~%\/\.\w\-]*)?(?:\?[\-\+=&;%@\.\w]*)?(?:#[\-\.\!\/\\\w%]*)?)?/g;