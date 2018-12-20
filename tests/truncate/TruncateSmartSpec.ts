/*global Autolinker */
/*
 * Date: 2015-10-05
 * Author: Kasper Søfren <soefritz@gmail.com> (https://github.com/kafoso)
 *
 * These tests target the "TruncateSmart" addition to Autolinker
 * (Autolinker.truncate.TruncateSmart), exclusively.
 */
describe("Truncate.truncate.TruncateSmart", function() {

	it("Will not truncate a URL which is shorter than the specified length", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 999, "..");
		expect(truncatedUrl).toBe("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee");
		expect(truncatedUrl.length).toBe(72);
	});


	it("Will remove malformed query section 1st", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 61, "..");
		expect(truncatedUrl).toBe("http://www.yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee");
		expect(truncatedUrl.length).toBe(61);
	});


	it("Will remove 'www' 2nd", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 57, "..");
		expect(truncatedUrl).toBe("http://yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee");
		expect(truncatedUrl.length).toBe(57);
	});


	it("Will remove scheme ('http') 3rd", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 53, "..");
		expect(truncatedUrl).toBe("yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee");
		expect(truncatedUrl.length).toBe(50);
	});


	it("Will truncate fragment ('#') 4th", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 45, "..");
		expect(truncatedUrl).toBe("yahoo.com/some/long/path/to/a/file?foo=bar#..");
		expect(truncatedUrl.length).toBe(45);
	});


	it("Will truncate path ('/') 5th", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorezthis#baz=bee", 40, "..");
		expect(truncatedUrl).toBe("yahoo.com/some/long/path..a/file?foo=bar");
		expect(truncatedUrl.length).toBe(40);
	});


	it("Will keep fragment when there is room for it", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 50, "..");
		expect(truncatedUrl).toBe("yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee");
		expect(truncatedUrl.length).toBe(50);
	});


	it("Will remove/truncate 'path' before 'host'", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 12, "..");
		expect(truncatedUrl).toBe("yahoo.com/..");
		expect(truncatedUrl.length).toBe(12);
	});


	it("Will truncate 'host' when 'truncateLen' is very short", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 7, "..");
		expect(truncatedUrl).toBe("yah..om");
		expect(truncatedUrl.length).toBe(7);
	});


	it("Will truncate 'path' when no 'query' exists", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file#baz=bee", 17, "..");
		expect(truncatedUrl).toBe("yahoo.com/so..ile");
		expect(truncatedUrl.length).toBe(17);
	});


	it("Will truncate 'query' when no 'path' exists", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com?foo=bar?ignorethis#baz=bee", 17, "..");
		expect(truncatedUrl).toBe("yahoo.com?foo=bar");
		expect(truncatedUrl.length).toBe(17);
	});


	it("Works when no 'scheme' or 'host' exists", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 17, "..");
		expect(truncatedUrl).toBe("/some/lo..foo=bar");
		expect(truncatedUrl.length).toBe(17);
	});


	it("Works when only 'query' exists", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("?foo=bar?ignorethis#baz=bee", 15, "..");
		expect(truncatedUrl).toBe("?foo=bar#ba..ee");
		expect(truncatedUrl.length).toBe(15);
	});


	it("Works when only 'fragment' exists", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("#baz=bee", 5, "..");
		expect(truncatedUrl).toBe("#b..e");
		expect(truncatedUrl.length).toBe(5);
	});


	it("Works with a standard Google search URL", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("https://www.google.com/search?q=cake&oq=cake&aqs=chrome..69i57j69i60l5.573j0j7&sourceid=chrome&es_sm=93&ie=UTF-8", 80, "..");
		expect(truncatedUrl).toBe("google.com/search?q=cake&oq=cake&aqs=chrome...&sourceid=chrome&es_sm=93&ie=UTF-8");
		expect(truncatedUrl.length).toBe(80);
	});


	it("Works with a long URL", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("https://www.google.com/search?q=cake&safe=off&es_sm=93&tbas=0&tbs=qdr:d,itp:photo,ic:specific,isc:red,isz:l&tbm=isch&source=lnt&sa=X&ved=0CBQQpwVqFQoTCMCUxfOErMgCFeFrcgodUDwD1w&dpr=1&biw=1920&bih=955", 80, "..");
		expect(truncatedUrl).toBe("google.com/search?q=cake&safe=off&es_sm=93&t..rcgodUDwD1w&dpr=1&biw=1920&bih=955");
		expect(truncatedUrl.length).toBe(80);
	});


	it("Will start with a character from the URL and then append the ellipsis character(s)", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 3, "..");
		expect(truncatedUrl).toBe("y..");
		expect(truncatedUrl.length).toBe(3);
	});


	it("Will write only the ellipsis character(s) ('..') when truncate length is 2", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 2, "..");
		expect(truncatedUrl).toBe("..");
		expect(truncatedUrl.length).toBe(2);
	});


	it("Will write only the ellipsis character ('.') when truncate length is 1", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 1, "..");
		expect(truncatedUrl).toBe(".");
		expect(truncatedUrl.length).toBe(1);
	});


	it("Will write nothing (empty string) when truncate length is 0", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 0, "..");
		expect(truncatedUrl).toBe("");
		expect(truncatedUrl.length).toBe(0);
	});


	it("Will truncate 'hashtag routing' nicely", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("/app#my/little/hashtag/route", 20, "..");
		expect(truncatedUrl).toBe("/app#my/lit..g/route");
		expect(truncatedUrl.length).toBe(20);
	});


	it("Allows a 'query' section in 'hashtag routing'", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("/app#my/little/hashtag/route?foo=bar", 20, "..");
		expect(truncatedUrl).toBe("/app#my/lit..foo=bar");
		expect(truncatedUrl.length).toBe(20);
	});


	it("Removes 'hashtag routing' when truncate length is very small", function() {
		var truncatedUrl = Autolinker.truncate.TruncateSmart("/app#my/little/hashtag/route?foo=bar", 4, "..");
		expect(truncatedUrl).toBe("/app");
		expect(truncatedUrl.length).toBe(4);
	});

});
