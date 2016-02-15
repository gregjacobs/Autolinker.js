/*global Autolinker */
/**
 * @property Autolinker.matcher.domainNameRegex
 *
 * A regular expression to match domain names of a URL or email address. Ex:
 * 'google', 'yahoo', 'some-other-company', etc.
 *
 * This is shared by {@link Autolinker.matcher.Url} and {@link Autolinker.matcher.Email},
 * and thus needed to exist as a seperate entity.
 */
Autolinker.matcher.domainNameRegex = /[A-Za-z0-9\u00C0-\u017F\.\-]*[A-Za-z0-9\u00C0-\u017F\-]/;  // anything looking at all like a domain, not ending in a period.
