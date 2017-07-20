/**
 * Date: 2015-10-05
 * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
 *
 * A truncation feature, where the ellipsis will be placed at a section within
 * the URL making it still somewhat human readable.
 *
 * @param {String} url						 A URL.
 * @param {Number} truncateLen		 The maximum length of the truncated output URL string.
 * @param {String} ellipsisChars	 The characters to place within the url, e.g. "...".
 * @return {String} The truncated URL.
 */
export function truncateSmart( url: string, truncateLen: number, ellipsisChars?: string ) {

	let ellipsisLengthBeforeParsing: number;
	let ellipsisLength: number;

	if(ellipsisChars == null) {
		ellipsisChars = '&hellip;';
		ellipsisLength = 3;
		ellipsisLengthBeforeParsing = 8;
	} else {
		ellipsisLength = ellipsisChars.length;
		ellipsisLengthBeforeParsing = ellipsisChars.length;
	}

	let parse_url = function(url: string) { // Functionality inspired by PHP function of same name
		let urlObj: UrlObject = {};
		let urlSub = url;
		let match = urlSub.match(/^([a-z]+):\/\//i);
		if (match) {
			urlObj.scheme = match[1];
			urlSub = urlSub.substr(match[0].length);
		}
		match = urlSub.match(/^(.*?)(?=(\?|#|\/|$))/i);
		if (match) {
			urlObj.host = match[1];
			urlSub = urlSub.substr(match[0].length);
		}
		match = urlSub.match(/^\/(.*?)(?=(\?|#|$))/i);
		if (match) {
			urlObj.path = match[1];
			urlSub = urlSub.substr(match[0].length);
		}
		match = urlSub.match(/^\?(.*?)(?=(#|$))/i);
		if (match) {
			urlObj.query = match[1];
			urlSub = urlSub.substr(match[0].length);
		}
		match = urlSub.match(/^#(.*?)$/i);
		if (match) {
			urlObj.fragment = match[1];
			//urlSub = urlSub.substr(match[0].length);  -- not used. Uncomment if adding another block.
		}
		return urlObj;
	};

	let buildUrl = function(urlObj: UrlObject){
		let url = "";
		if (urlObj.scheme && urlObj.host) {
			url += urlObj.scheme + "://";
		}
		if (urlObj.host) {
			url += urlObj.host;
		}
		if (urlObj.path) {
			url += "/" + urlObj.path;
		}
		if (urlObj.query) {
			url += "?" + urlObj.query;
		}
		if (urlObj.fragment) {
			url += "#" + urlObj.fragment;
		}
		return url;
	};

	let buildSegment = function(segment: string, remainingAvailableLength: number){
		let remainingAvailableLengthHalf = remainingAvailableLength/ 2,
				startOffset = Math.ceil(remainingAvailableLengthHalf),
				endOffset = (-1)*Math.floor(remainingAvailableLengthHalf),
				end = "";
		if (endOffset < 0) {
			end = segment.substr(endOffset);
		}
		return segment.substr(0, startOffset) + ellipsisChars + end;
	};
	if (url.length <= truncateLen) {
		return url;
	}
	let availableLength = truncateLen - ellipsisLength;
	let urlObj = parse_url(url);
	// Clean up the URL
	if (urlObj.query) {
		let matchQuery = urlObj.query.match(/^(.*?)(?=(\?|\#))(.*?)$/i);
		if (matchQuery) {
			// Malformed URL; two or more "?". Removed any content behind the 2nd.
			urlObj.query = urlObj.query.substr(0, matchQuery[1].length);
			url = buildUrl(urlObj);
		}
	}
	if (url.length <= truncateLen) {
		return url;
	}
	if (urlObj.host) {
		urlObj.host = urlObj.host.replace(/^www\./, "");
		url = buildUrl(urlObj);
	}
	if (url.length <= truncateLen) {
		return url;
	}
	// Process and build the URL
	let str = "";
	if (urlObj.host) {
		str += urlObj.host;
	}
	if (str.length >= availableLength) {
		if ((urlObj.host as string).length == truncateLen) {
			return ((urlObj.host as string).substr(0, (truncateLen - ellipsisLength)) + ellipsisChars).substr(0, availableLength + ellipsisLengthBeforeParsing);
		}
		return buildSegment(str, availableLength).substr(0, availableLength + ellipsisLengthBeforeParsing);
	}
	let pathAndQuery = "";
	if (urlObj.path) {
		pathAndQuery += "/" + urlObj.path;
	}
	if (urlObj.query) {
		pathAndQuery += "?" + urlObj.query;
	}
	if (pathAndQuery) {
		if ((str+pathAndQuery).length >= availableLength) {
			if ((str+pathAndQuery).length == truncateLen) {
				return (str + pathAndQuery).substr(0, truncateLen);
			}
			let remainingAvailableLength = availableLength - str.length;
			return (str + buildSegment(pathAndQuery, remainingAvailableLength)).substr(0, availableLength + ellipsisLengthBeforeParsing);
		} else {
			str += pathAndQuery;
		}
	}
	if (urlObj.fragment) {
		let fragment = "#"+urlObj.fragment;
		if ((str+fragment).length >= availableLength) {
			if ((str+fragment).length == truncateLen) {
				return (str + fragment).substr(0, truncateLen);
			}
			let remainingAvailableLength2 = availableLength - str.length;
			return (str + buildSegment(fragment, remainingAvailableLength2)).substr(0, availableLength + ellipsisLengthBeforeParsing);
		} else {
			str += fragment;
		}
	}
	if (urlObj.scheme && urlObj.host) {
		let scheme = urlObj.scheme + "://";
		if ((str+scheme).length < availableLength) {
			return (scheme + str).substr(0, truncateLen);
		}
	}
	if (str.length <= truncateLen) {
		return str;
	}
	let end = "";
	if (availableLength > 0) {
		end = str.substr((-1)*Math.floor(availableLength/2));
	}
	return (str.substr(0, Math.ceil(availableLength/2)) + ellipsisChars + end).substr(0, availableLength + ellipsisLengthBeforeParsing);
}


interface UrlObject {
	scheme?: string;
	host?: string;
	path?: string;
	query?: string;
	fragment?: string
}