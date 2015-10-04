var truncateSmart = function(url, truncateLen, ellipsisChars){
  var parse_url = function(url){
    var urlObj = {};
    var urlSub = url;
    var match = urlSub.match(/^([a-z]+)\:\/\//i);
    if (match) {
      urlObj["scheme"] = match[1];
      urlSub = urlSub.substr(match[0].length);
    }
    match = urlSub.match(/^(.*?)(?=(\?|\#|\/|$))/i);
    if (match) {
      urlObj["host"] = match[1];
      urlSub = urlSub.substr(match[0].length);
    }
    match = urlSub.match(/^\/(.*?)(?=(\?|\#|$))/i);
    if (match) {
      urlObj["path"] = match[1];
      urlSub = urlSub.substr(match[0].length);
    }
    match = urlSub.match(/^\?(.*?)(?=(\#))/i);
    if (match) {
      urlObj["query"] = match[1];
      urlSub = urlSub.substr(match[0].length);
    }
    match = urlSub.match(/^\#(.*?)$/i);
    if (match) {
      urlObj["fragment"] = match[1];
      urlSub = urlSub.substr(match[0].length);
    }
    return urlObj;
  };
  var buildUrl = function(urlObj){
    var url = "";
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
  var buildSegment = function(segment, remainingAvailableLength){
    var remainingAvailableLengthHalf = remainingAvailableLength/2
      , startOffset = Math.ceil(remainingAvailableLengthHalf)
      , endOffset = (-1)*Math.floor(remainingAvailableLengthHalf)
      , end = "";
    if (endOffset < 0) {
      end = segment.substr(endOffset);
    }
    return segment.substr(0, startOffset)
      + ellipsisChars
      + end;
  };
  var availableLength = truncateLen - ellipsisChars.length;
  if (url.length <= availableLength) {
    return url;
  }
  var urlObj = parse_url(url);
  // Clean up the URL
  if (urlObj.query) {
    var matchQuery = urlObj.query.match(/^(.*?)(?=(\?|\#))(.*?)$/i);
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
  var str = "";
  if (urlObj.host) {
    if (urlObj.host.length == truncateLen) {
      return urlObj.host.substr(0, (truncateLen - ellipsisChars.length)) + ellipsisChars;
    }
    str += urlObj.host;
  }
  if (str.length >= availableLength) {
    if (str.length == truncateLen) {
      return str.substr(0, ellipsisChars.length) + ellipsisChars;
    }
    var remainingAvailableLength = availableLength;
    return buildSegment(str, remainingAvailableLength);
  }
  var pathAndQuery = "";
  if (urlObj.path) {
    pathAndQuery += "/" + urlObj.path;
  }
  if (urlObj.query) {
    pathAndQuery += "?" + urlObj.query;
  }
  if (pathAndQuery) {
    if ((str+pathAndQuery).length >= availableLength) {
      if ((str+pathAndQuery).length == truncateLen) {
        return str + pathAndQuery;
      }
      var remainingAvailableLength = availableLength - str.length;
      return str + buildSegment(pathAndQuery, remainingAvailableLength);
    } else {
      str += pathAndQuery;
    }
  }
  if (urlObj.fragment) {
    var fragment = "#"+urlObj.fragment;
    if ((str+fragment).length >= availableLength) {
      if ((str+fragment).length == truncateLen) {
        return str + fragment;
      }
      var remainingAvailableLength = availableLength - str.length;
      return str + buildSegment(fragment, remainingAvailableLength);
    } else {
      str += fragment;
    }
  }
  if (urlObj.scheme && urlObj.host) {
    var scheme = urlObj.scheme + "://";
    if ((str+scheme).length < availableLength) {
      return scheme + str;
    }
  }
  if (str.length <= availableLength) {
    return str;
  }
  var end = "";
  if (availableLength > 0) {
    end = str.substr((-1)*Math.floor(availableLength/2));
  }
  return str.substr(0, Math.ceil(availableLength/2))
    + ellipsisChars
    + end;
};

if (typeof(module) != "object") {
  module = {};
}

module.exports = truncateSmart;
