/*global Autolinker */
/*
 * Date: 2015-10-05
 * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
 *
 * These tests target the "TruncateMiddle" addition to Autolinker
 * (Autolinker.truncate.TruncateMiddle), exclusively.
 */
describe("Truncate.truncate.TruncateMiddle", function(){

	it("Will not truncate a URL if 'truncateLen' is greater", function(){
		var truncatedUrl = Autolinker.truncate.TruncateMiddle("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 999, "..");
		expect(truncatedUrl).toBe("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee");
		expect(truncatedUrl.length).toBe(72);
	});

	it("Will truncate a simple URL correctly", function(){
		var truncatedUrl = Autolinker.truncate.TruncateMiddle("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 60, "..");
		expect(truncatedUrl).toBe("http://www.yahoo.com/some/lon..le?foo=bar?ignorethis#baz=bee");
		expect(truncatedUrl.length).toBe(60);
	});

	it("Will truncate a very short URL correctly", function(){
		var truncatedUrl = Autolinker.truncate.TruncateMiddle("yahoo.com", 4, "..");
		expect(truncatedUrl).toBe("y..m");
		expect(truncatedUrl.length).toBe(4);
	});

	it("Will truncate a long URL correctly", function(){
		var truncatedUrl = Autolinker.truncate.TruncateMiddle("https://www.google.com/search?q=cake&safe=off&es_sm=93&tbas=0&tbs=qdr:d,itp:photo,ic:specific,isc:red,isz:l&tbm=isch&source=lnt&sa=X&ved=0CBQQpwVqFQoTCMCUxfOErMgCFeFrcgodUDwD1w&dpr=1&biw=1920&bih=955", 80, "..");
		expect(truncatedUrl).toBe("https://www.google.com/search?q=cake&sa..gCFeFrcgodUDwD1w&dpr=1&biw=1920&bih=955");
		expect(truncatedUrl.length).toBe(80);
	});

});
