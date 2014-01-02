/**
 * @member Autolinker
 * @private
 * @property {RegExp} matcherRegex
 * 
 * The regular expression that matches URLs, email addresses, and Twitter handles.
 * 
 * Capturing groups:
 * 
 * 1. Group that is used to determine if there is a Twitter handle match (i.e. @someTwitterUser). Simply check for its existence
 *    to determine if there is a Twitter handle match. The next couple of capturing groups give information about the Twitter 
 *    handle match.
 * 2. The whitespace character before the @sign in a Twitter handle. This is needed because there are no lookbehinds in JS regular
 *    expressions, and can be used to reconstruct the original string in a replace().
 * 3. The Twitter handle itself in a Twitter match. If the match is '@someTwitterUser', the handle is 'someTwitterUser'.
 * 4. Group that matches an email address. Used to determine if the match is an email address, as well as holding the full address.
 *    Ex: 'me@my.com'
 * 5. Group that matches a URL in the input text. Ex: 'http://google.com', 'www.google.com', or just 'google.com'.
 *    This also includes a path, url parameters, or hash anchors. Ex: google.com/path/to/file?q1=1&q2=2#myAnchor
 */
/*global Autolinker*/
Autolinker.matcherRegex = /((^|\s)@(\w{1,15}))|((?:[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+\.[A-Za-z0-9\.\-]+)|((?:(?:(?:[A-Za-z]{3,9}:(?:\/\/)?)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:(?:www\.)[A-Za-z0-9\.\-]*[A-Za-z0-9\-])|(?:[A-Za-z0-9\.\-]*[A-Za-z0-9\-]\.(?:com|org|net|gov|edu|mil|us|info|biz|ws|name|mobi|cc|tv|co\.uk|de|ru|hu|fr|br)))(?:(?:\/(?:[\+~%\/\.\w\-]*[\+~%\/\w\-])?)?(?:\?[\-\+=&;%@\.\w]*)?(?:#[\-\.\!\/\\\w%]*)?)?)/g;