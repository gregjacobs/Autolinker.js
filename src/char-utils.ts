
// NOTE: THIS FILE IS GENERATED. DO NOT EDIT.
// INSTEAD, RUN: npm run generate-char-utils

/**
 * Determines if the given character `c` matches the regular expression /[\x00-\x1F\x7F]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isControlChar(c: number): boolean {
    return ((c >= 0 && c <= 31) || c == 127);
}

/**
 * Determines if the given character `c` matches the regular expression /[A-Za-z]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isAsciiLetterChar(c: number): boolean {
    return ((c >= 65 && c <= 90) || (c >= 97 && c <= 122));
}

/**
 * Determines if the given character `c` matches the regular expression /\d/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isDigitChar(c: number): boolean {
    return (c >= 48 && c <= 57);
}

/**
 * Determines if the given character `c` matches the regular expression /['"]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isQuoteChar(c: number): boolean {
    return (c == 34 || c == 39);
}

/**
 * Determines if the given character `c` matches the regular expression /\s/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isWhitespaceChar(c: number): boolean {
    return (c < 8232 ? (c < 160 ? ((c >= 9 && c <= 13) || c == 32) : (c < 5760 ? c == 160 : (c == 5760 || (c >= 8192 && c <= 8202)))) : (c < 8287 ? ((c >= 8232 && c <= 8233) || c == 8239) : (c < 12288 ? c == 8287 : (c == 12288 || c == 65279))));
}

/**
 * Determines if the given character `c` matches the regular expression /[A-Za-z\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16F1-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC\u2700-\u27bf\udde6-\uddff\ud800-\udbff\udc00-\udfff\ufe0e\ufe0f\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0\ud83c\udffb-\udfff\u200d\u3299\u3297\u303d\u3030\u24c2\ud83c\udd70-\udd71\udd7e-\udd7f\udd8e\udd91-\udd9a\udde6-\uddff\ude01-\ude02\ude1a\ude2f\ude32-\ude3a\ude50-\ude51\u203c\u2049\u25aa-\u25ab\u25b6\u25c0\u25fb-\u25fe\u00a9\u00ae\u2122\u2139\udc04\u2600-\u26FF\u2b05\u2b06\u2b07\u2b1b\u2b1c\u2b50\u2b55\u231a\u231b\u2328\u23cf\u23e9-\u23f3\u23f8-\u23fa\udccf\u2935\u2934\u2190-\u21ff\u0300-\u036F\u0483-\u0489\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED\u0711\u0730-\u074A\u07A6-\u07B0\u07EB-\u07F3\u0816-\u0819\u081B-\u0823\u0825-\u0827\u0829-\u082D\u0859-\u085B\u08D4-\u08E1\u08E3-\u0903\u093A-\u093C\u093E-\u094F\u0951-\u0957\u0962\u0963\u0981-\u0983\u09BC\u09BE-\u09C4\u09C7\u09C8\u09CB-\u09CD\u09D7\u09E2\u09E3\u0A01-\u0A03\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A70\u0A71\u0A75\u0A81-\u0A83\u0ABC\u0ABE-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AE2\u0AE3\u0B01-\u0B03\u0B3C\u0B3E-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B62\u0B63\u0B82\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD7\u0C00-\u0C03\u0C3E-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C62\u0C63\u0C81-\u0C83\u0CBC\u0CBE-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CE2\u0CE3\u0D01-\u0D03\u0D3E-\u0D44\u0D46-\u0D48\u0D4A-\u0D4D\u0D57\u0D62\u0D63\u0D82\u0D83\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DF2\u0DF3\u0E31\u0E34-\u0E3A\u0E47-\u0E4E\u0EB1\u0EB4-\u0EB9\u0EBB\u0EBC\u0EC8-\u0ECD\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F84\u0F86\u0F87\u0F8D-\u0F97\u0F99-\u0FBC\u0FC6\u102B-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D\u135D-\u135F\u1712-\u1714\u1732-\u1734\u1752\u1753\u1772\u1773\u17B4-\u17D3\u17DD\u180B-\u180D\u1885\u1886\u18A9\u1920-\u192B\u1930-\u193B\u1A17-\u1A1B\u1A55-\u1A5E\u1A60-\u1A7C\u1A7F\u1AB0-\u1ABE\u1B00-\u1B04\u1B34-\u1B44\u1B6B-\u1B73\u1B80-\u1B82\u1BA1-\u1BAD\u1BE6-\u1BF3\u1C24-\u1C37\u1CD0-\u1CD2\u1CD4-\u1CE8\u1CED\u1CF2-\u1CF4\u1CF8\u1CF9\u1DC0-\u1DF5\u1DFB-\u1DFF\u20D0-\u20F0\u2CEF-\u2CF1\u2D7F\u2DE0-\u2DFF\u302A-\u302F\u3099\u309A\uA66F-\uA672\uA674-\uA67D\uA69E\uA69F\uA6F0\uA6F1\uA802\uA806\uA80B\uA823-\uA827\uA880\uA881\uA8B4-\uA8C5\uA8E0-\uA8F1\uA926-\uA92D\uA947-\uA953\uA980-\uA983\uA9B3-\uA9C0\uA9E5\uAA29-\uAA36\uAA43\uAA4C\uAA4D\uAA7B-\uAA7D\uAAB0\uAAB2-\uAAB4\uAAB7\uAAB8\uAABE\uAABF\uAAC1\uAAEB-\uAAEF\uAAF5\uAAF6\uABE3-\uABEA\uABEC\uABED\uFB1E\uFE00-\uFE0F\uFE20-\uFE2F0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isAlphaNumericOrMarkChar(c: number): boolean {
    return (c < 4800 ? (c < 2949 ? (c < 2451 ? (c < 1425 ? (c < 768 ? (c < 192 ? (c < 169 ? (c < 65 ? (c >= 48 && c <= 57) : ((c >= 65 && c <= 90) || (c >= 97 && c <= 122))) : (c < 181 ? ((c >= 169 && c <= 170) || c == 174) : (c == 181 || c == 186))) : (c < 710 ? (c < 216 ? (c >= 192 && c <= 214) : ((c >= 216 && c <= 246) || (c >= 248 && c <= 705))) : (c < 748 ? ((c >= 710 && c <= 721) || (c >= 736 && c <= 740)) : (c == 748 || c == 750)))) : (c < 910 ? (c < 895 ? (c < 886 ? (c >= 768 && c <= 884) : ((c >= 886 && c <= 887) || (c >= 890 && c <= 893))) : (c < 904 ? (c == 895 || c == 902) : ((c >= 904 && c <= 906) || c == 908))) : (c < 1155 ? (c < 931 ? (c >= 910 && c <= 929) : ((c >= 931 && c <= 1013) || (c >= 1015 && c <= 1153))) : (c < 1369 ? ((c >= 1155 && c <= 1327) || (c >= 1329 && c <= 1366)) : (c == 1369 || (c >= 1377 && c <= 1415)))))) : (c < 1808 ? (c < 1552 ? (c < 1476 ? (c < 1471 ? (c >= 1425 && c <= 1469) : (c == 1471 || (c >= 1473 && c <= 1474))) : (c < 1488 ? ((c >= 1476 && c <= 1477) || c == 1479) : ((c >= 1488 && c <= 1514) || (c >= 1520 && c <= 1522)))) : (c < 1749 ? (c < 1568 ? (c >= 1552 && c <= 1562) : ((c >= 1568 && c <= 1641) || (c >= 1646 && c <= 1747))) : (c < 1770 ? ((c >= 1749 && c <= 1756) || (c >= 1759 && c <= 1768)) : ((c >= 1770 && c <= 1788) || c == 1791)))) : (c < 2230 ? (c < 2042 ? (c < 1869 ? (c >= 1808 && c <= 1866) : ((c >= 1869 && c <= 1969) || (c >= 1984 && c <= 2037))) : (c < 2112 ? (c == 2042 || (c >= 2048 && c <= 2093)) : ((c >= 2112 && c <= 2139) || (c >= 2208 && c <= 2228)))) : (c < 2406 ? (c < 2260 ? (c >= 2230 && c <= 2237) : ((c >= 2260 && c <= 2273) || (c >= 2275 && c <= 2403))) : (c < 2437 ? ((c >= 2406 && c <= 2415) || (c >= 2417 && c <= 2435)) : ((c >= 2437 && c <= 2444) || (c >= 2447 && c <= 2448))))))) : (c < 2693 ? (c < 2579 ? (c < 2519 ? (c < 2486 ? (c < 2474 ? (c >= 2451 && c <= 2472) : ((c >= 2474 && c <= 2480) || c == 2482)) : (c < 2503 ? ((c >= 2486 && c <= 2489) || (c >= 2492 && c <= 2500)) : ((c >= 2503 && c <= 2504) || (c >= 2507 && c <= 2510)))) : (c < 2534 ? (c < 2524 ? c == 2519 : ((c >= 2524 && c <= 2525) || (c >= 2527 && c <= 2531))) : (c < 2565 ? ((c >= 2534 && c <= 2545) || (c >= 2561 && c <= 2563)) : ((c >= 2565 && c <= 2570) || (c >= 2575 && c <= 2576))))) : (c < 2631 ? (c < 2613 ? (c < 2602 ? (c >= 2579 && c <= 2600) : ((c >= 2602 && c <= 2608) || (c >= 2610 && c <= 2611))) : (c < 2620 ? ((c >= 2613 && c <= 2614) || (c >= 2616 && c <= 2617)) : (c == 2620 || (c >= 2622 && c <= 2626)))) : (c < 2649 ? (c < 2635 ? (c >= 2631 && c <= 2632) : ((c >= 2635 && c <= 2637) || c == 2641)) : (c < 2662 ? ((c >= 2649 && c <= 2652) || c == 2654) : ((c >= 2662 && c <= 2677) || (c >= 2689 && c <= 2691)))))) : (c < 2821 ? (c < 2759 ? (c < 2730 ? (c < 2703 ? (c >= 2693 && c <= 2701) : ((c >= 2703 && c <= 2705) || (c >= 2707 && c <= 2728))) : (c < 2741 ? ((c >= 2730 && c <= 2736) || (c >= 2738 && c <= 2739)) : ((c >= 2741 && c <= 2745) || (c >= 2748 && c <= 2757)))) : (c < 2784 ? (c < 2763 ? (c >= 2759 && c <= 2761) : ((c >= 2763 && c <= 2765) || c == 2768)) : (c < 2809 ? ((c >= 2784 && c <= 2787) || (c >= 2790 && c <= 2799)) : (c == 2809 || (c >= 2817 && c <= 2819))))) : (c < 2887 ? (c < 2858 ? (c < 2831 ? (c >= 2821 && c <= 2828) : ((c >= 2831 && c <= 2832) || (c >= 2835 && c <= 2856))) : (c < 2869 ? ((c >= 2858 && c <= 2864) || (c >= 2866 && c <= 2867)) : ((c >= 2869 && c <= 2873) || (c >= 2876 && c <= 2884)))) : (c < 2911 ? (c < 2902 ? ((c >= 2887 && c <= 2888) || (c >= 2891 && c <= 2893)) : ((c >= 2902 && c <= 2903) || (c >= 2908 && c <= 2909))) : (c < 2929 ? ((c >= 2911 && c <= 2915) || (c >= 2918 && c <= 2927)) : (c == 2929 || (c >= 2946 && c <= 2947)))))))) : (c < 3517 ? (c < 3205 ? (c < 3046 ? (c < 2984 ? (c < 2969 ? (c < 2958 ? (c >= 2949 && c <= 2954) : ((c >= 2958 && c <= 2960) || (c >= 2962 && c <= 2965))) : (c < 2974 ? ((c >= 2969 && c <= 2970) || c == 2972) : ((c >= 2974 && c <= 2975) || (c >= 2979 && c <= 2980)))) : (c < 3014 ? (c < 2990 ? (c >= 2984 && c <= 2986) : ((c >= 2990 && c <= 3001) || (c >= 3006 && c <= 3010))) : (c < 3024 ? ((c >= 3014 && c <= 3016) || (c >= 3018 && c <= 3021)) : (c == 3024 || c == 3031)))) : (c < 3142 ? (c < 3086 ? (c < 3072 ? (c >= 3046 && c <= 3055) : ((c >= 3072 && c <= 3075) || (c >= 3077 && c <= 3084))) : (c < 3114 ? ((c >= 3086 && c <= 3088) || (c >= 3090 && c <= 3112)) : ((c >= 3114 && c <= 3129) || (c >= 3133 && c <= 3140)))) : (c < 3160 ? (c < 3146 ? (c >= 3142 && c <= 3144) : ((c >= 3146 && c <= 3149) || (c >= 3157 && c <= 3158))) : (c < 3174 ? ((c >= 3160 && c <= 3162) || (c >= 3168 && c <= 3171)) : ((c >= 3174 && c <= 3183) || (c >= 3200 && c <= 3203)))))) : (c < 3333 ? (c < 3274 ? (c < 3242 ? (c < 3214 ? (c >= 3205 && c <= 3212) : ((c >= 3214 && c <= 3216) || (c >= 3218 && c <= 3240))) : (c < 3260 ? ((c >= 3242 && c <= 3251) || (c >= 3253 && c <= 3257)) : ((c >= 3260 && c <= 3268) || (c >= 3270 && c <= 3272)))) : (c < 3296 ? (c < 3285 ? (c >= 3274 && c <= 3277) : ((c >= 3285 && c <= 3286) || c == 3294)) : (c < 3313 ? ((c >= 3296 && c <= 3299) || (c >= 3302 && c <= 3311)) : ((c >= 3313 && c <= 3314) || (c >= 3329 && c <= 3331))))) : (c < 3423 ? (c < 3389 ? (c < 3342 ? (c >= 3333 && c <= 3340) : ((c >= 3342 && c <= 3344) || (c >= 3346 && c <= 3386))) : (c < 3402 ? ((c >= 3389 && c <= 3396) || (c >= 3398 && c <= 3400)) : ((c >= 3402 && c <= 3406) || (c >= 3412 && c <= 3415)))) : (c < 3458 ? (c < 3430 ? (c >= 3423 && c <= 3427) : ((c >= 3430 && c <= 3439) || (c >= 3450 && c <= 3455))) : (c < 3482 ? ((c >= 3458 && c <= 3459) || (c >= 3461 && c <= 3478)) : ((c >= 3482 && c <= 3505) || (c >= 3507 && c <= 3515))))))) : (c < 3804 ? (c < 3722 ? (c < 3570 ? (c < 3535 ? (c < 3520 ? c == 3517 : ((c >= 3520 && c <= 3526) || c == 3530)) : (c < 3544 ? ((c >= 3535 && c <= 3540) || c == 3542) : ((c >= 3544 && c <= 3551) || (c >= 3558 && c <= 3567)))) : (c < 3664 ? (c < 3585 ? (c >= 3570 && c <= 3571) : ((c >= 3585 && c <= 3642) || (c >= 3648 && c <= 3662))) : (c < 3716 ? ((c >= 3664 && c <= 3673) || (c >= 3713 && c <= 3714)) : (c == 3716 || (c >= 3719 && c <= 3720))))) : (c < 3754 ? (c < 3737 ? (c < 3725 ? c == 3722 : (c == 3725 || (c >= 3732 && c <= 3735))) : (c < 3749 ? ((c >= 3737 && c <= 3743) || (c >= 3745 && c <= 3747)) : (c == 3749 || c == 3751))) : (c < 3776 ? (c < 3757 ? (c >= 3754 && c <= 3755) : ((c >= 3757 && c <= 3769) || (c >= 3771 && c <= 3773))) : (c < 3784 ? ((c >= 3776 && c <= 3780) || c == 3782) : ((c >= 3784 && c <= 3789) || (c >= 3792 && c <= 3801)))))) : (c < 4176 ? (c < 3902 ? (c < 3872 ? (c < 3840 ? (c >= 3804 && c <= 3807) : (c == 3840 || (c >= 3864 && c <= 3865))) : (c < 3895 ? ((c >= 3872 && c <= 3881) || c == 3893) : (c == 3895 || c == 3897))) : (c < 3974 ? (c < 3913 ? (c >= 3902 && c <= 3911) : ((c >= 3913 && c <= 3948) || (c >= 3953 && c <= 3972))) : (c < 4038 ? ((c >= 3974 && c <= 3991) || (c >= 3993 && c <= 4028)) : (c == 4038 || (c >= 4096 && c <= 4169))))) : (c < 4688 ? (c < 4301 ? (c < 4256 ? (c >= 4176 && c <= 4253) : ((c >= 4256 && c <= 4293) || c == 4295)) : (c < 4348 ? (c == 4301 || (c >= 4304 && c <= 4346)) : ((c >= 4348 && c <= 4680) || (c >= 4682 && c <= 4685)))) : (c < 4746 ? (c < 4698 ? ((c >= 4688 && c <= 4694) || c == 4696) : ((c >= 4698 && c <= 4701) || (c >= 4704 && c <= 4744))) : (c < 4786 ? ((c >= 4746 && c <= 4749) || (c >= 4752 && c <= 4784)) : ((c >= 4786 && c <= 4789) || (c >= 4792 && c <= 4798))))))))) : (c < 11035 ? (c < 7416 ? (c < 6176 ? (c < 5873 ? (c < 4992 ? (c < 4824 ? (c < 4802 ? c == 4800 : ((c >= 4802 && c <= 4805) || (c >= 4808 && c <= 4822))) : (c < 4888 ? ((c >= 4824 && c <= 4880) || (c >= 4882 && c <= 4885)) : ((c >= 4888 && c <= 4954) || (c >= 4957 && c <= 4959)))) : (c < 5121 ? (c < 5024 ? (c >= 4992 && c <= 5007) : ((c >= 5024 && c <= 5109) || (c >= 5112 && c <= 5117))) : (c < 5761 ? ((c >= 5121 && c <= 5740) || (c >= 5743 && c <= 5759)) : ((c >= 5761 && c <= 5786) || (c >= 5792 && c <= 5866))))) : (c < 6002 ? (c < 5920 ? (c < 5888 ? (c >= 5873 && c <= 5880) : ((c >= 5888 && c <= 5900) || (c >= 5902 && c <= 5908))) : (c < 5984 ? ((c >= 5920 && c <= 5940) || (c >= 5952 && c <= 5971)) : ((c >= 5984 && c <= 5996) || (c >= 5998 && c <= 6000)))) : (c < 6108 ? (c < 6016 ? (c >= 6002 && c <= 6003) : ((c >= 6016 && c <= 6099) || c == 6103)) : (c < 6155 ? ((c >= 6108 && c <= 6109) || (c >= 6112 && c <= 6121)) : ((c >= 6155 && c <= 6157) || (c >= 6160 && c <= 6169)))))) : (c < 6783 ? (c < 6512 ? (c < 6400 ? (c < 6272 ? (c >= 6176 && c <= 6263) : ((c >= 6272 && c <= 6314) || (c >= 6320 && c <= 6389))) : (c < 6448 ? ((c >= 6400 && c <= 6430) || (c >= 6432 && c <= 6443)) : ((c >= 6448 && c <= 6459) || (c >= 6470 && c <= 6509)))) : (c < 6608 ? (c < 6528 ? (c >= 6512 && c <= 6516) : ((c >= 6528 && c <= 6571) || (c >= 6576 && c <= 6601))) : (c < 6688 ? ((c >= 6608 && c <= 6617) || (c >= 6656 && c <= 6683)) : ((c >= 6688 && c <= 6750) || (c >= 6752 && c <= 6780))))) : (c < 7040 ? (c < 6832 ? (c < 6800 ? (c >= 6783 && c <= 6793) : ((c >= 6800 && c <= 6809) || c == 6823)) : (c < 6992 ? ((c >= 6832 && c <= 6846) || (c >= 6912 && c <= 6987)) : ((c >= 6992 && c <= 7001) || (c >= 7019 && c <= 7027)))) : (c < 7245 ? (c < 7168 ? (c >= 7040 && c <= 7155) : ((c >= 7168 && c <= 7223) || (c >= 7232 && c <= 7241))) : (c < 7376 ? ((c >= 7245 && c <= 7293) || (c >= 7296 && c <= 7304)) : ((c >= 7376 && c <= 7378) || (c >= 7380 && c <= 7414))))))) : (c < 8450 ? (c < 8130 ? (c < 8025 ? (c < 7960 ? (c < 7424 ? (c >= 7416 && c <= 7417) : ((c >= 7424 && c <= 7669) || (c >= 7675 && c <= 7957))) : (c < 8008 ? ((c >= 7960 && c <= 7965) || (c >= 7968 && c <= 8005)) : ((c >= 8008 && c <= 8013) || (c >= 8016 && c <= 8023)))) : (c < 8031 ? (c < 8027 ? c == 8025 : (c == 8027 || c == 8029)) : (c < 8118 ? ((c >= 8031 && c <= 8061) || (c >= 8064 && c <= 8116)) : ((c >= 8118 && c <= 8124) || c == 8126)))) : (c < 8205 ? (c < 8150 ? (c < 8134 ? (c >= 8130 && c <= 8132) : ((c >= 8134 && c <= 8140) || (c >= 8144 && c <= 8147))) : (c < 8178 ? ((c >= 8150 && c <= 8155) || (c >= 8160 && c <= 8172)) : ((c >= 8178 && c <= 8180) || (c >= 8182 && c <= 8188)))) : (c < 8305 ? (c < 8252 ? c == 8205 : (c == 8252 || c == 8265)) : (c < 8336 ? (c == 8305 || c == 8319) : ((c >= 8336 && c <= 8348) || (c >= 8400 && c <= 8432)))))) : (c < 8579 ? (c < 8486 ? (c < 8469 ? (c < 8455 ? c == 8450 : (c == 8455 || (c >= 8458 && c <= 8467))) : (c < 8482 ? (c == 8469 || (c >= 8473 && c <= 8477)) : (c == 8482 || c == 8484))) : (c < 8495 ? (c < 8488 ? c == 8486 : (c == 8488 || (c >= 8490 && c <= 8493))) : (c < 8517 ? ((c >= 8495 && c <= 8505) || (c >= 8508 && c <= 8511)) : ((c >= 8517 && c <= 8521) || c == 8526)))) : (c < 9410 ? (c < 9000 ? (c < 8592 ? (c >= 8579 && c <= 8580) : ((c >= 8592 && c <= 8703) || (c >= 8986 && c <= 8987))) : (c < 9193 ? (c == 9000 || c == 9167) : ((c >= 9193 && c <= 9203) || (c >= 9208 && c <= 9210)))) : (c < 9723 ? (c < 9654 ? (c == 9410 || (c >= 9642 && c <= 9643)) : (c == 9654 || c == 9664)) : (c < 10548 ? ((c >= 9723 && c <= 9726) || (c >= 9728 && c <= 10175)) : ((c >= 10548 && c <= 10549) || (c >= 11013 && c <= 11015)))))))) : (c < 43259 ? (c < 12445 ? (c < 11688 ? (c < 11520 ? (c < 11264 ? (c < 11088 ? (c >= 11035 && c <= 11036) : (c == 11088 || c == 11093)) : (c < 11360 ? ((c >= 11264 && c <= 11310) || (c >= 11312 && c <= 11358)) : ((c >= 11360 && c <= 11492) || (c >= 11499 && c <= 11507)))) : (c < 11568 ? (c < 11559 ? (c >= 11520 && c <= 11557) : (c == 11559 || c == 11565)) : (c < 11647 ? ((c >= 11568 && c <= 11623) || c == 11631) : ((c >= 11647 && c <= 11670) || (c >= 11680 && c <= 11686))))) : (c < 11744 ? (c < 11712 ? (c < 11696 ? (c >= 11688 && c <= 11694) : ((c >= 11696 && c <= 11702) || (c >= 11704 && c <= 11710))) : (c < 11728 ? ((c >= 11712 && c <= 11718) || (c >= 11720 && c <= 11726)) : ((c >= 11728 && c <= 11734) || (c >= 11736 && c <= 11742)))) : (c < 12330 ? (c < 11823 ? (c >= 11744 && c <= 11775) : (c == 11823 || (c >= 12293 && c <= 12294))) : (c < 12353 ? ((c >= 12330 && c <= 12341) || (c >= 12347 && c <= 12349)) : ((c >= 12353 && c <= 12438) || (c >= 12441 && c <= 12442)))))) : (c < 42512 ? (c < 12951 ? (c < 12549 ? (c < 12449 ? (c >= 12445 && c <= 12447) : ((c >= 12449 && c <= 12538) || (c >= 12540 && c <= 12543))) : (c < 12704 ? ((c >= 12549 && c <= 12589) || (c >= 12593 && c <= 12686)) : ((c >= 12704 && c <= 12730) || (c >= 12784 && c <= 12799)))) : (c < 19968 ? (c < 12953 ? c == 12951 : (c == 12953 || (c >= 13312 && c <= 19893))) : (c < 42192 ? ((c >= 19968 && c <= 40917) || (c >= 40960 && c <= 42124)) : ((c >= 42192 && c <= 42237) || (c >= 42240 && c <= 42508))))) : (c < 42891 ? (c < 42623 ? (c < 42560 ? (c >= 42512 && c <= 42539) : ((c >= 42560 && c <= 42610) || (c >= 42612 && c <= 42621))) : (c < 42775 ? ((c >= 42623 && c <= 42725) || (c >= 42736 && c <= 42737)) : ((c >= 42775 && c <= 42783) || (c >= 42786 && c <= 42888)))) : (c < 43072 ? (c < 42928 ? (c >= 42891 && c <= 42926) : ((c >= 42928 && c <= 42935) || (c >= 42999 && c <= 43047))) : (c < 43216 ? ((c >= 43072 && c <= 43123) || (c >= 43136 && c <= 43205)) : ((c >= 43216 && c <= 43225) || (c >= 43232 && c <= 43255))))))) : (c < 55243 ? (c < 43744 ? (c < 43488 ? (c < 43312 ? (c < 43261 ? c == 43259 : (c == 43261 || (c >= 43264 && c <= 43309))) : (c < 43392 ? ((c >= 43312 && c <= 43347) || (c >= 43360 && c <= 43388)) : ((c >= 43392 && c <= 43456) || (c >= 43471 && c <= 43481)))) : (c < 43600 ? (c < 43520 ? (c >= 43488 && c <= 43518) : ((c >= 43520 && c <= 43574) || (c >= 43584 && c <= 43597))) : (c < 43642 ? ((c >= 43600 && c <= 43609) || (c >= 43616 && c <= 43638)) : ((c >= 43642 && c <= 43714) || (c >= 43739 && c <= 43741))))) : (c < 43824 ? (c < 43785 ? (c < 43762 ? (c >= 43744 && c <= 43759) : ((c >= 43762 && c <= 43766) || (c >= 43777 && c <= 43782))) : (c < 43808 ? ((c >= 43785 && c <= 43790) || (c >= 43793 && c <= 43798)) : ((c >= 43808 && c <= 43814) || (c >= 43816 && c <= 43822)))) : (c < 44012 ? (c < 43868 ? (c >= 43824 && c <= 43866) : ((c >= 43868 && c <= 43877) || (c >= 43888 && c <= 44010))) : (c < 44032 ? ((c >= 44012 && c <= 44013) || (c >= 44016 && c <= 44025)) : ((c >= 44032 && c <= 55203) || (c >= 55216 && c <= 55238)))))) : (c < 64848 ? (c < 64298 ? (c < 64112 ? (c < 55296 ? (c >= 55243 && c <= 55291) : ((c >= 55296 && c <= 57343) || (c >= 63744 && c <= 64109))) : (c < 64275 ? ((c >= 64112 && c <= 64217) || (c >= 64256 && c <= 64262)) : ((c >= 64275 && c <= 64279) || (c >= 64285 && c <= 64296)))) : (c < 64320 ? (c < 64312 ? (c >= 64298 && c <= 64310) : ((c >= 64312 && c <= 64316) || c == 64318)) : (c < 64326 ? ((c >= 64320 && c <= 64321) || (c >= 64323 && c <= 64324)) : ((c >= 64326 && c <= 64433) || (c >= 64467 && c <= 64829))))) : (c < 65296 ? (c < 65024 ? (c < 64914 ? (c >= 64848 && c <= 64911) : ((c >= 64914 && c <= 64967) || (c >= 65008 && c <= 65019))) : (c < 65136 ? ((c >= 65024 && c <= 65039) || (c >= 65056 && c <= 65071)) : ((c >= 65136 && c <= 65140) || (c >= 65142 && c <= 65276)))) : (c < 65474 ? (c < 65345 ? ((c >= 65296 && c <= 65305) || (c >= 65313 && c <= 65338)) : ((c >= 65345 && c <= 65370) || (c >= 65382 && c <= 65470))) : (c < 65490 ? ((c >= 65474 && c <= 65479) || (c >= 65482 && c <= 65487)) : ((c >= 65490 && c <= 65495) || (c >= 65498 && c <= 65500))))))))));
}

/**
 * Determines if the given character `c` matches the regular expression /[!#$%&'*+/=?^_`{|}~-]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isValidEmailLocalPartSpecialChar(c: number): boolean {
    return (c < 47 ? (c < 42 ? (c == 33 || (c >= 35 && c <= 39)) : ((c >= 42 && c <= 43) || c == 45)) : (c < 63 ? (c == 47 || c == 61) : (c < 94 ? c == 63 : ((c >= 94 && c <= 96) || (c >= 123 && c <= 126)))));
}

/**
 * Determines if the given character `c` matches the regular expression /[-+&@#/%=~_()|'$*[\]{}\u2713]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isUrlSuffixAllowedSpecialChar(c: number): boolean {
    return (c < 91 ? (c < 47 ? ((c >= 35 && c <= 43) || c == 45) : (c < 61 ? c == 47 : (c == 61 || c == 64))) : (c < 95 ? (c == 91 || c == 93) : (c < 123 ? c == 95 : ((c >= 123 && c <= 126) || c == 10003))));
}

/**
 * Determines if the given character `c` matches the regular expression /[?!:,.;^]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isUrlSuffixNotAllowedAsFinalChar(c: number): boolean {
    return (c < 58 ? (c < 44 ? c == 33 : (c == 44 || c == 46)) : (c < 63 ? (c >= 58 && c <= 59) : (c == 63 || c == 94)));
}

/**
 * Determines if the given character `c` matches the regular expression /[({[]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isOpenBraceChar(c: number): boolean {
    return (c < 91 ? c == 40 : (c == 91 || c == 123));
}

/**
 * Determines if the given character `c` matches the regular expression /[)}\]]/ 
 * by checking it via character code in a binary search fashion.
 * 
 * This technique speeds this function up by a factor of ~10x vs. running RegExp.prototype.test() 
 * on the character itself.
 * 
 * NOTE: This function is generated. Do not edit manually. To regenerate, run: 
 * 
 *     npm run generate-char-utils
 */
export function isCloseBraceChar(c: number): boolean {
    return (c < 93 ? c == 41 : (c == 93 || c == 125));
}
