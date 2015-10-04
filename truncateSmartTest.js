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
  it("Will truncate 'query' when no 'path' exists", function(){
    var truncatedUrl = truncateSmart("http://www.yahoo.com?foo=bar?ignorethis#baz=bee", 17, "..");
    assert.equal("yahoo.com?foo=bar", truncatedUrl);
    assert.equal(17, truncatedUrl.length);
  });
});
