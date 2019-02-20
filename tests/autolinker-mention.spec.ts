import _ from 'lodash';
import Autolinker from '../src/autolinker';

describe( "Autolinker Mention Matching -", () => {
	const twitterAutolinker = new Autolinker( { mention: 'twitter', newWindow: false } )
	const instagramAutolinker = new Autolinker( { mention: 'instagram', newWindow: false } );
	const soundcloudAutolinker = new Autolinker( { mention: 'soundcloud', newWindow: false } );

	const services = [
		{ serviceName: 'twitter', urlPrefix: 'https://twitter.com', autolinker: twitterAutolinker },
		{ serviceName: 'instagram', urlPrefix: 'https://instagram.com', autolinker: instagramAutolinker },
		{ serviceName: 'soundcloud', urlPrefix: 'https://soundcloud.com', autolinker: soundcloudAutolinker },
	];

	it( `should not autolink mentions by default`, () => {
		let autolinker = new Autolinker( { newWindow: false } );
		expect( autolinker.link( "@test" ) ).toBe( '@test' );
	} );


	describe( 'all services mention tests', () => {

		services.forEach( ( { serviceName, urlPrefix, autolinker } ) => {
			
			it( `should automatically link a ${serviceName} handle which is the 
				 only thing in the string
			`, () => {
				let result = autolinker.link( `@joe` );

				expect( result ).toBe( `<a href="${urlPrefix}/joe">@joe</a>` );
			} );
	
	
			it( `should automatically link a ${serviceName} handle with underscores 
				 in it`, 
			() => {
				let result = autolinker.link( `@joe_the_man12` );

				expect( result ).toBe( `<a href="${urlPrefix}/joe_the_man12">@joe_the_man12</a>` );
			} );
	
	
			it( `should automatically link ${serviceName} handles at the 
				 beginning of a string`, 
			() => {
				let result = autolinker.link( `@greg is my ${serviceName} handle` );

				expect( result ).toBe( `<a href="${urlPrefix}/greg">@greg</a> is my ${serviceName} handle` );
			} );
	
	
			it( `should automatically link ${serviceName} handles in the middle 
				 of a string`, 
			() => {
				let result = autolinker.link( `Joe's ${serviceName} is @joe_the_man12 today, but what will it be tomorrow?` );

				expect( result ).toBe( `Joe's ${serviceName} is <a href="${urlPrefix}/joe_the_man12">@joe_the_man12</a> today, but what will it be tomorrow?` );
			} );
	
	
			it( `should automatically link ${serviceName} handles at the end of 
				 a string`, 
			() => {
				let result = autolinker.link( `Joe's ${serviceName} is @joe_the_man12` );

				expect( result ).toBe( `Joe's ${serviceName} is <a href="${urlPrefix}/joe_the_man12">@joe_the_man12</a>` );
			} );
	
	
			it( `should automatically link ${serviceName} handles at the end of 
				 a string with a period at the end`, 
			() => {
				let result = autolinker.link( `Joe's ${serviceName} is @joe_the_man12.` );

				expect( result ).toBe( `Joe's ${serviceName} is <a href="${urlPrefix}/joe_the_man12">@joe_the_man12</a>.` );
			} );
	
	
			it( `should automatically link ${serviceName} handles surrounded by 
				 parentheses`, 
			() => {
				let result = autolinker.link( `Joe's ${serviceName} is (@joe_the_man12)` );

				expect( result ).toBe( `Joe's ${serviceName} is (<a href="${urlPrefix}/joe_the_man12">@joe_the_man12</a>)` );
			} );
	
	
			it( `should automatically link ${serviceName} handles surrounded by 
			     curly brackets`, 
			() => {
				let result = autolinker.link( `Joe's ${serviceName} is {@joe_the_man12}` );

				expect( result ).toBe( `Joe's ${serviceName} is {<a href="${urlPrefix}/joe_the_man12">@joe_the_man12</a>}` );
			} );
	
	
			it( `should automatically link ${serviceName} handles surrounded by 
				 square brackets`, 
			() => {
				let result = autolinker.link( `Joe's ${serviceName} is [@joe_the_man12]` );

				expect( result ).toBe( `Joe's ${serviceName} is [<a href="${urlPrefix}/joe_the_man12">@joe_the_man12</a>]` );
			} );
	
	
			it( `should automatically link multiple ${serviceName} handles in a 
				 string`, 
			() => {
				let result = autolinker.link( `@greg is tweeting @joe with @josh` );

				expect( result ).toBe( `<a href="${urlPrefix}/greg">@greg</a> is tweeting <a href="${urlPrefix}/joe">@joe</a> with <a href="${urlPrefix}/josh">@josh</a>` );
			} );
	
	
			it( `should automatically link fully capitalized ${serviceName} handles`, () => {
				let result = autolinker.link( `@GREG is tweeting @JOE with @JOSH` );

				expect( result ).toBe( `<a href="${urlPrefix}/GREG">@GREG</a> is tweeting <a href="${urlPrefix}/JOE">@JOE</a> with <a href="${urlPrefix}/JOSH">@JOSH</a>` );
			} );
	
	
			// NOTE: Twitter itself does not accept accented characters, but
			// other services might so linking them anyway
			it( `should automatically link username handles with accented 
				 characters for ${serviceName}`, 
			() => {
				let result = autolinker.link( `Hello @mañana how are you?` );

				expect( result ).toBe( `Hello <a href="${urlPrefix}/mañana">@mañana</a> how are you?` );
			} );
	
	
			// NOTE: Twitter itself does not accept cyrillic characters, but
			// other services might so linking them anyway
			it( `should automatically link username handles with cyrillic 
				 characters for service ${serviceName}
			`, () => {
				let result = autolinker.link( `Hello @Кириллица how are you?` );

				expect( result ).toBe( `Hello <a href="${urlPrefix}/Кириллица">@Кириллица</a> how are you?` );
			} );
	
	
			it( `should NOT automatically link a mention when the '@' belongs to 
				 part of another string`, 
			() => {
				let result = autolinker.link( `test as@df test` );
		
				expect( result ).toBe( `test as@df test` );
			} );

		} );

	} );


	describe( 'twitter-specific tests', () => {

		it( 'should link a twitter mention that is up to 50 characters long', () => {
			const aUsername = _.repeat( 'a', 50 );
			const bUsername = _.repeat( 'b', 51 );  // too long - don't link

			const result = twitterAutolinker.link( `@${aUsername} and @${bUsername}` );
			expect( result ).toBe( `<a href="https://twitter.com/${aUsername}">@${aUsername}</a> and @${bUsername}` );
		} );


		it( `should link a twitter mention that has a period in it only up until
			 the period`, 
		() => {
			const result = twitterAutolinker.link( `Hello @asdf.defg` );

			expect( result ).toBe( `Hello <a href="https://twitter.com/asdf">@asdf</a>.defg` );
		} );

	} );


	describe( 'instagram-specific tests', () => {

		it( 'should link an instagram mention that is up to 30 characters long', () => {
			const aUsername = _.repeat( 'a', 30 );
			const bUsername = _.repeat( 'b', 31 );  // too long - don't link

			const result = instagramAutolinker.link( `@${aUsername} and @${bUsername}` );
			expect( result ).toBe( `<a href="https://instagram.com/${aUsername}">@${aUsername}</a> and @${bUsername}` );
		} );


		it( `should link an instagram mention that has a period in it`, () => {
			const result = instagramAutolinker.link( `Hello @asdf.defg` );

			expect( result ).toBe( `Hello <a href="https://instagram.com/asdf.defg">@asdf.defg</a>` );
		} );

	} );


	describe( 'soundcloud-specific tests', () => {

		it( 'should link a soundcloud mention that is up to 50 characters long', () => {
			const aUsername = _.repeat( 'a', 50 );
			const bUsername = _.repeat( 'b', 51 );  // too long - don't link

			const result = soundcloudAutolinker.link( `@${aUsername} and @${bUsername}` );
			expect( result ).toBe( `<a href="https://soundcloud.com/${aUsername}">@${aUsername}</a> and @${bUsername}` );
		} );


		it( `should link a soundcloud mention that has a period in it`, () => {
			const result = soundcloudAutolinker.link( `Hello @asdf.defg` );

			expect( result ).toBe( `Hello <a href="https://soundcloud.com/asdf.defg">@asdf.defg</a>` );
		} );

	} );


	it( `should NOT automatically link a username that is actually part of an 
		 email address when email address linking is turned on
	`, () => {
		let emailAutolinker = new Autolinker( {
			email: true,
			mention: 'twitter',
			newWindow: false
		} );
		let result = emailAutolinker.link( "asdf@asdf.com" );

		expect( result ).toBe( '<a href="mailto:asdf@asdf.com">asdf@asdf.com</a>' );
	} );


	it( `should NOT automatically link a username that is actually part of an 
		 email address when email address linking is turned *off*
	`, () => {
		let noEmailAutolinker = new Autolinker( {
			email: false,
			mention: 'twitter',
			newWindow: false
		} );
		let result = noEmailAutolinker.link( "asdf@asdf.com" );

		expect( result ).toBe( 'asdf@asdf.com' );
	} );

} );
