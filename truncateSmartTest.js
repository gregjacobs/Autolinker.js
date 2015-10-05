var truncateSmart = require("./truncateSmart");
var assert = require("chai").assert;

describe("truncateSmart", function(){
  it("Will not truncate a URL which is shorter than the specified length", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 999, "..");
    assert.equal("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", truncatedUrl);
    assert.equal(72, truncatedUrl.length);
  });
  it("Will remove malformed query section 1st", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 61, "..");
    assert.equal("http://www.yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee", truncatedUrl);
    assert.equal(61, truncatedUrl.length);
  });
  it("Will remove 'www' 2nd", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 57, "..");
    assert.equal("http://yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee", truncatedUrl);
    assert.equal(57, truncatedUrl.length);
  });
  it("Will remove scheme ('http') 3rd", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 53, "..");
    assert.equal("yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee", truncatedUrl);
    assert.equal(50, truncatedUrl.length);
  });
  it("Will truncate fragment ('#') 4th", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 45, "..");
    assert.equal("yahoo.com/some/long/path/to/a/file?foo=bar#..", truncatedUrl);
    assert.equal(45, truncatedUrl.length);
  });
  it("Will truncate path ('/') 5th", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 40, "..");
    assert.equal("yahoo.com/some/long/path..a/file?foo=bar", truncatedUrl);
    assert.equal(40, truncatedUrl.length);
  });
  it("Will keep fragment when there is room for it", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 50, "..");
    assert.equal("yahoo.com/some/long/path/to/a/file?foo=bar#baz=bee", truncatedUrl);
    assert.equal(50, truncatedUrl.length);
  });
  it("Will remove/truncate 'path' before 'host'", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 12, "..");
    assert.equal("yahoo.com/..", truncatedUrl);
    assert.equal(12, truncatedUrl.length);
  });
  it("Will truncate 'host' when 'truncateLen' is very short", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 7, "..");
    assert.equal("yah..om", truncatedUrl);
    assert.equal(7, truncatedUrl.length);
  });
  it("Will truncate 'path' when no 'query' exists", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file#baz=bee", 17, "..");
    assert.equal("yahoo.com/so..ile", truncatedUrl);
    assert.equal(17, truncatedUrl.length);
  });
  it("Will truncate 'query' when no 'path' exists", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com?foo=bar?ignorethis#baz=bee", 17, "..");
    assert.equal("yahoo.com?foo=bar", truncatedUrl);
    assert.equal(17, truncatedUrl.length);
  });
  it("Works when no 'scheme' or 'host' exists", function(){
    var truncatedUrl = truncateSmart("/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 17, "..");
    assert.equal("/some/lo..foo=bar", truncatedUrl);
    assert.equal(17, truncatedUrl.length);
  });
  it("Works when only 'query' exists", function(){
    var truncatedUrl = truncateSmart("?foo=bar?ignorethis#baz=bee", 15, "..");
    assert.equal("?foo=bar#ba..ee", truncatedUrl);
    assert.equal(15, truncatedUrl.length);
  });
  it("Works when only 'fragment' exists", function(){
    var truncatedUrl = truncateSmart("#baz=bee", 5, "..");
    assert.equal("#b..e", truncatedUrl);
    assert.equal(5, truncatedUrl.length);
  });
  it("Works with a standard Google search URL", function(){
    var truncatedUrl = truncateSmart("https://www.google.com/search?q=cake&oq=cake&aqs=chrome..69i57j69i60l5.573j0j7&sourceid=chrome&es_sm=93&ie=UTF-8", 80, "..");
    assert.equal("google.com/search?q=cake&oq=cake&aqs=chrome...&sourceid=chrome&es_sm=93&ie=UTF-8", truncatedUrl);
    assert.equal(80, truncatedUrl.length);
  });
  it("Works with a long URL", function(){
    var truncatedUrl = truncateSmart("https://www.google.com/search?q=cake&safe=off&es_sm=93&tbas=0&tbs=qdr:d,itp:photo,ic:specific,isc:red,isz:l&tbm=isch&source=lnt&sa=X&ved=0CBQQpwVqFQoTCMCUxfOErMgCFeFrcgodUDwD1w&dpr=1&biw=1920&bih=955", 80, "..");
    assert.equal("google.com/search?q=cake&safe=off&es_sm=93&t..rcgodUDwD1w&dpr=1&biw=1920&bih=955", truncatedUrl);
    assert.equal(80, truncatedUrl.length);
  });
  it("Will start with a character from the URL and then append the ellipsis character(s)", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 3, "..");
    assert.equal("y..", truncatedUrl);
    assert.equal(3, truncatedUrl.length);
  });
  it("Will write only the ellipsis character(s) ('..') when truncate length is 2", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 2, "..");
    assert.equal("..", truncatedUrl);
    assert.equal(2, truncatedUrl.length);
  });
  it("Will write only the ellipsis character ('.') when truncate length is 1", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 1, "..");
    assert.equal(".", truncatedUrl);
    assert.equal(1, truncatedUrl.length);
  });
  it("Will write nothing (empty string) when truncate length is 0", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com/some/long/path/to/a/file?foo=bar?ignorethis#baz=bee", 0, "..");
    assert.equal("", truncatedUrl);
    assert.equal(0, truncatedUrl.length);
  });
});
