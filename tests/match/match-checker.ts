/**
 * @class Autolinker.match.MatchChecker
 * @singleton
 *
 * A testing utility used to easily make assertions about
 * {@link Autolinker.match.Match} objects.
 */
import { Match } from "../../src/match/match";
import { UrlMatch } from "../../src/match/url-match";
import { HashtagServices, MentionServices } from "../../src/autolinker";
import { MentionMatch } from "../../src/match/mention-match";
import { PhoneMatch } from "../../src/match/phone-match";
import { HashtagMatch } from "../../src/match/hashtag-match";
import { EmailMatch } from "../../src/match/email-match";

export class MatchChecker {

	/**
	 * Expects an {@link Autolinker.match.Email Email} match.
	 *
	 * @param {Autolinker.match.Email} match The Match object to check.
	 * @param {String} email The email address to expect.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	static expectEmailMatch( match: Match, email: string, offset: number ) {
		this.expectMatchType( match, 'email' );

		expect( ( match as EmailMatch ).getEmail() ).toBe( email );
		expect( match.getOffset() ).toBe( offset );
	}


	/**
	 * Expects a {@link Autolinker.match.Hashtag HashtagMatch} match.
	 *
	 * @param {Autolinker.match.Hashtag} match The Match object to check.
	 * @param {String} serviceName The service name to expect of where to direct
	 *   clicks to the hashtag to. Ex: 'facebook', 'twitter'.
	 * @param {String} hashtag The hashtag to expect, without the prefixed '#'
	 *   character.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	static expectHashtagMatch( match: Match, serviceName: HashtagServices, hashtag: string, offset: number ) {
		this.expectMatchType( match, 'hashtag' );

		expect( ( match as HashtagMatch ).getServiceName() ).toBe( serviceName );
		expect( ( match as HashtagMatch ).getHashtag() ).toBe( hashtag );
		expect( match.getOffset() ).toBe( offset );
	}


	/**
	 * Expects a {@link Autolinker.match.Phone Phone} match.
	 *
	 * @param {Autolinker.match.Phone} match The Match object to check.
	 * @param {String} number The phone number to expect, without any delimiter
	 *   characters, and without a prefixed '+' character.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	static expectPhoneMatch( match: Match, number: string, offset: number ) {
		this.expectMatchType( match, 'phone' );

		expect( ( match as PhoneMatch ).getNumber() ).toBe( number );
		expect( match.getOffset() ).toBe( offset );
	}


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
	static expectMentionMatch( match: Match, serviceName: MentionServices, mention: string, offset: number ) {
		this.expectMatchType( match, 'mention' );

		expect( ( match as MentionMatch ).getServiceName() ).toBe( serviceName );
		expect( ( match as MentionMatch ).getMention() ).toBe( mention );
		expect( match.getOffset() ).toBe( offset );
	}


	/**
	 * Expects a {@link Autolinker.match.Url Url} match.
	 *
	 * @param {Autolinker.match.Url} match The Match object to check.
	 * @param {String} url The URL to expect, with the URI scheme prepended.
	 * @param {Number} offset The offset for the match in the original string to
	 *   expect.
	 */
	static expectUrlMatch( match: Match, url: string, offset: number ) {
		this.expectMatchType( match, 'url' );

		expect( ( match as UrlMatch ).getUrl() ).toBe( url );
		expect( match.getOffset() ).toBe( offset );
	}


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
	static expectMatchType( match: Match, typeName: string ) {
		switch( typeName ) {
			case 'email' :
				if( !( match instanceof EmailMatch ) ) {
					throw new Error( 'Expected an EmailMatch object' );
				}
				break;

			case 'hashtag' :
				if( !( match instanceof HashtagMatch ) ) {
					throw new Error( 'Expected a HashtagMatch object' );
				}
				break;

			case 'phone' :
				if( !( match instanceof PhoneMatch ) ) {
					throw new Error( 'Expected a PhoneMatch object' );
				}
				break;

			case 'mention' :
				if( !( match instanceof MentionMatch ) ) {
					throw new Error( 'Expected a MentionMatch object' );
				}
				break;

			case 'url' :
				if( !( match instanceof UrlMatch ) ) {
					throw new Error( 'Expected a UrlMatch object' );
				}
				break;

			default:
				throw new Error( `Unknown typeName: ${typeName}` );
		}
	}

}