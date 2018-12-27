import path from 'path';
import fs from 'fs';

describe( 'Live example page -', function() {
	// @types/puppeteer causing a lot of conflicts with @types/node. Removing for now.
	//import puppeteer, { Browser, Page } from 'puppeteer';
	const puppeteer = require( 'puppeteer' );

	let browser: any;  // :Browser
	let page: any;     // :Page
  
	beforeAll( async () => {
		browser = await puppeteer.launch( { headless: true } );
		page = await browser.newPage();

		// Print errors from the page
		page.on( 'console', ( msg: any ) => console.log( 'PAGE LOG:', msg.text() ) );
		page.on( 'pageerror', ( err: Error ) => console.error( err ) );
	} );
  
	afterAll( async () => {
		await browser.close();
	} );
  

	it( 'should correctly load Autolinker and display the output with the default settings', async () => {
		// Path to the index.html file of the live example *from the output
		// directory of this .spec file* (i.e. './.tmp/tests-integration/live-example')
		const pathToHtmlFile = path.normalize( `${__dirname}/../../../docs/examples/index.html` );
		if( !fs.existsSync( pathToHtmlFile ) ) {
			throw new Error( `The live example index.html file was not found at path: '${pathToHtmlFile}'\nDid the location of the file (or the output location of this .spec file) change? The file should be referenced from the root-level './docs/examples' folder in the repo` );
		}
		await page.goto( `file://${pathToHtmlFile}`, { waitUntil: 'load' } );

		const autolinkerOutputHtml = await page.evaluate( () => {
			return ( document as any ).querySelector( '#output' ).innerHTML.trim();
		} );
		expect( autolinkerOutputHtml ).toBe( [
			`<a href="http://google.com" target="_blank" rel="noopener noreferrer">google.com</a><br>`,
			`<a href="http://www.google.com" target="_blank" rel="noopener noreferrer">google.com</a><br>`,
			`<a href="http://google.com" target="_blank" rel="noopener noreferrer">google.com</a><br>`,
			`<a href="mailto:google@google.com" target="_blank" rel="noopener noreferrer">google@google.com</a><br>`,
			`<a href="tel:1234567890" target="_blank" rel="noopener noreferrer">123-456-7890</a><br>`,
			`@MentionUser<br>`,
			`#HashTag`
		].join( '' ) );
	} );

} );
