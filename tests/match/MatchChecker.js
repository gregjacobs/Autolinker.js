/*global Autolinker */
/**
 * @class Autolinker.match.MatchChecker
 * @singleton
 *
 * A testing utility used to easily make assertions about
 * {@link Autolinker.match.Match} objects.
 */
Autolinker.match.MatchChecker = {

	/**
	 * Expects an {@link Autolinker.match.Email Email} match.
	 *
	 * @param {Autolinker.match.Email} match The Match object to check.
	 * @param {String} email The email address to expect.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	expectEmailMatch : function( match, email, offset ) {
		this.expectMatchType( match, 'Email' );

		expect( match.getEmail() ).toBe( email );
		expect( match.getOffset() ).toBe( offset );
	},


	/**
	 * Expects a {@link Autolinker.match.Hashtag Hashtag} match.
	 *
	 * @param {Autolinker.match.Hashtag} match The Match object to check.
	 * @param {String} serviceName The service name to expect of where to direct
	 *   clicks to the hashtag to. Ex: 'facebook', 'twitter'.
	 * @param {String} hashtag The hashtag to expect, without the prefixed '#'
	 *   character.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	expectHashtagMatch : function( match, serviceName, hashtag, offset ) {
		this.expectMatchType( match, 'Hashtag' );

		expect( match.getServiceName() ).toBe( serviceName );
		expect( match.getHashtag() ).toBe( hashtag );
		expect( match.getOffset() ).toBe( offset );
	},


	/**
	 * Expects a {@link Autolinker.match.Phone Phone} match.
	 *
	 * @param {Autolinker.match.Phone} match The Match object to check.
	 * @param {String} number The phone number to expect, without any delimiter
	 *   characters, and without a prefixed '+' character.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	expectPhoneMatch : function( match, number, offset ) {
		this.expectMatchType( match, 'Phone' );

		expect( match.getNumber() ).toBe( number );
		expect( match.getOffset() ).toBe( offset );
	},
	

	/**
	 * Expects a {@link Autolinker.match.Mention Mention} match.
	 *
	 * @param {Autolinker.match.Mention} match The Match object to check.
	 * @param {String} serviceName The service name to expect of where to direct
	 *   clicks to the mention to. Ex: 'twitter', 'instagram'.
	 * @param {String} mention The mention to expect, without the
	 *   prefixed '@' character.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	expectMentionMatch : function( match, serviceName, mention, offset ) {
		this.expectMatchType( match, 'Mention' );

		expect( match.getServiceName() ).toBe( serviceName );
		expect( match.getMention() ).toBe( mention );
		expect( match.getOffset() ).toBe( offset );
	},


	/**
	 * Expects a {@link Autolinker.match.Url Url} match.
	 *
	 * @param {Autolinker.match.Url} match The Match object to check.
	 * @param {String} url The URL to expect, with the URI scheme prepended.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	expectUrlMatch : function( match, url, offset ) {
		this.expectMatchType( match, 'Url' );

		expect( match.getUrl() ).toBe( url );
		expect( match.getOffset() ).toBe( offset );
	},


	// ---------------------------------------


	/**
	 * Private utility method used to check the type of the `match` object
	 * provided, and throws if it does not match the provided `typeName`.
	 *
	 * @param {Autolinker.match.Match} match The Match object to check against
	 *   the provided `typeName`.
	 * @param {String} typeName The name of the Match subclass. Ex: 'Email',
	 *   'Twitter', 'Url', etc.
	 * @throws {Error} If the `match` is not an instance of the `typeName`.
	 */
	expectMatchType : function( match, typeName ) {
		if( !( match instanceof Autolinker.match[ typeName ] ) ) {
			throw new Error( 'Expected an Autolinker.match.' + typeName + ' match object' );
		}
	}

};
