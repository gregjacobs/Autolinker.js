/**
 * Date: 2015-10-05
 * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
 *
 * A truncation feature, where the ellipsis will be placed in the dead-center of the URL.
 *
 * @param {String} url             A URL.
 * @param {Number} truncateLen     The maximum length of the truncated output URL string.
 * @param {String} ellipsisChars   The characters to place within the url, e.g. "..".
 * @return {String} The truncated URL.
 */
export function truncateMiddle( url: string, truncateLen: number, ellipsisChars?: string ){
  if (url.length <= truncateLen) {
    return url;
  }

  let ellipsisLengthBeforeParsing: number;
  let ellipsisLength: number;

  if(ellipsisChars == null) {
    ellipsisChars = '&hellip;';
    ellipsisLengthBeforeParsing = 8;
    ellipsisLength = 3;
  } else {
    ellipsisLengthBeforeParsing = ellipsisChars.length;
    ellipsisLength = ellipsisChars.length;
  }

  let availableLength = truncateLen - ellipsisLength;
  let end = "";
  if (availableLength > 0) {
    end = url.substr((-1)*Math.floor(availableLength/2));
  }
  return (url.substr(0, Math.ceil(availableLength/2)) + ellipsisChars + end).substr(0, availableLength + ellipsisLengthBeforeParsing);
}
