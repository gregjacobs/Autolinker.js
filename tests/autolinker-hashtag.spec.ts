import _ from 'lodash';
import Autolinker from '../src/autolinker';

describe( `Autolinker Hashtag Matching -`, () => {
	const autolinker = new Autolinker( { newWindow: false } );
	const twitterAutolinker = new Autolinker( { hashtag: 'twitter', newWindow: false } );
	const facebookAutolinker = new Autolinker( { hashtag: 'facebook', newWindow: false } );
	const instagramAutolinker = new Autolinker( { hashtag: 'instagram', newWindow: false } );

	const services = [
		{ serviceName: 'twitter', urlPrefix: 'https://twitter.com/hashtag', autolinker: twitterAutolinker },
		{ serviceName: 'instagram', urlPrefix: 'https://instagram.com/explore/tags', autolinker: instagramAutolinker },
		{ serviceName: 'facebook', urlPrefix: 'https://www.facebook.com/hashtag', autolinker: facebookAutolinker },
	];


	it( `should NOT autolink hashtags by default for both backward compatibility, 
		 and because we don't know which service (twitter, facebook, etc.) to 
		 point them to`, 
	() => {
		expect( autolinker.link( `#test` ) ).toBe( `#test` );
	} );


	it( `should NOT autolink hashtags the 'hashtag' cfg is explicitly false`, () => {
		const result = Autolinker.link( `#test`, { hashtag: false } );

		expect( result ).toBe( `#test` );
	} );


	describe( 'all services hashtag tests', () => {

		services.forEach( ( { serviceName, urlPrefix, autolinker } ) => {

			it( `should automatically link hashtags to ${serviceName} when the 
				 'hashtag' option is '${serviceName}'`, 
			() => {
				const result = autolinker.link( `#test` );

				expect( result ).toBe( `<a href="${urlPrefix}/test">#test</a>` );
			} );


			it( `should automatically link hashtags which are part of a full 
				 string when using the ${serviceName} service`, 
			() => {
				const result = autolinker.link( `my hashtag is #test these days` );

				expect( result ).toBe( `my hashtag is <a href="${urlPrefix}/test">#test</a> these days` );
			} );


			it( `should link a hashtag that is up to 139 characters long when 
				 using the ${serviceName} service`, 
			() => {
				const aHashtag = _.repeat( 'a', 139 );
				const bHashtag = _.repeat( 'b', 140 );  // too long - don't link

				const result = autolinker.link( `#${aHashtag} and #${bHashtag}` );
				expect( result ).toBe( `<a href="${urlPrefix}/${aHashtag}">#${aHashtag}</a> and #${bHashtag}` );
			} );


			it( `should automatically link a hashtag with underscores when using
				 the ${serviceName} service`, 
			() => {
				const result = autolinker.link( `Yay, #hello_world` );
				expect( result ).toBe( `Yay, <a href="${urlPrefix}/hello_world">#hello_world</a>` );
			} );


			it( `should automatically link a hashtag with accented characters 
				 when using the ${serviceName} service`,
			() => {
				const result = autolinker.link( `Yay, #mañana` );
				expect( result ).toBe( `Yay, <a href="${urlPrefix}/mañana">#mañana</a>` );
			} );


			it( `should automatically link a hashtag with cyrillic characters
				 when using the ${serviceName} service`, 
			() => {
				const result = autolinker.link( `Yay, #Кириллица` );
				expect( result ).toBe( `Yay, <a href="${urlPrefix}/Кириллица">#Кириллица</a>` );
			} );


			it( `should NOT automatically link a hashtag when the '#' belongs to 
				 part of another string when using the ${serviceName} service`, 
			() => {
				const result = autolinker.link( `test as#df test` );

				expect( result ).toBe( `test as#df test` );
			} );


			it( `should NOT automatically link a hashtag that is actually a 
				 named anchor within a URL when using the ${serviceName} service`, 
			() => {
				const result = autolinker.link( `http://google.com/#link` );

				expect( result ).toBe( `<a href="http://google.com/#link">google.com/#link</a>` );
			} );


			it( `should NOT automatically link a hashtag that is actually a 
				 named anchor within a URL **when URL linking is turned off** 
				 when using the ${serviceName} service`, 
			() => {
				const noUrlTwitterHashtagAutolinker = new Autolinker( { 
					urls: false,
					hashtag: 'twitter', 
					newWindow: false 
				} );
				const result = noUrlTwitterHashtagAutolinker.link( `http://google.com/#link` );

				expect( result ).toBe( `http://google.com/#link` );
			} );

		} );

	} );

} );
