import Autolinker, { AutolinkerConfig } from 'autolinker';

describe( 'test Autolinker with TypeScript in Node', () => {

	it( 'should run using the AutolinkerConfig interface import', () => {
		var options: AutolinkerConfig = { newWindow: false };  // Note: Testing that the AutolinkerConfig interface can be imported
		var linkedStr = Autolinker.link( 'Go to google.com', options );

		expect( linkedStr ).toBe( `Go to <a href="http://google.com">google.com</a>` );
	} );

} );