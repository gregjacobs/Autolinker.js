/*global Autolinker, describe, it, expect, React */
describe("Autolinker", function () {

	describe("using within React", function () {

		it("should be able to handle react objects passed from custom replacer", function () {
			var autolinker = new Autolinker({
				replaceFn: function (autolinker, match) {
					switch (match.getType()) {
						case 'url' :
							return React.DOM.a({href: match.getUrl()}, match.getUrl());
					}
				},

				doJoin: false,
				React: React

			});

			var result = autolinker.link('preamble http://www.yahoo.com/some/long/path/to/a/file post <a href="http://www.yahoo.com/another/long/path/to/a/file">http://www.yahoo.com/another/long/path/to/a/file</a>');
			expect(Array.isArray(result)).toBe(true);
			expect(result[0]).toBe("preamble ");
			expect(React.isValidElement(result[1])).toBe(true);
			expect(result[2]).toBe(" post ");
			expect(result[3]).toBe('<a href="http://www.yahoo.com/another/long/path/to/a/file">');
			expect(result[4]).toBe('http://www.yahoo.com/another/long/path/to/a/file');
			expect(result[5]).toBe('</a>');
			expect(React.renderToStaticMarkup(React.DOM.div({}, result))).toBe('<div>preamble <a href="http://www.yahoo.com/some/long/path/to/a/file">http://www.yahoo.com/some/long/path/to/a/file</a> post &lt;a href=&quot;http://www.yahoo.com/another/long/path/to/a/file&quot;&gt;http://www.yahoo.com/another/long/path/to/a/file&lt;/a&gt;</div>');
		});
	});
});