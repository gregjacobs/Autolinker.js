describe( 'Webpack build with TypeScript in a browser', function() {
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

		await page.goto( `file://${__dirname}/webpack-output/index.html`, { 
			waitUntil: 'load' 
		} );
	} );
  
	afterAll( async () => {
		await browser.close();
	} );
  

	it( 'Autolinker should work', async () => {
		const innerHTML = await page.evaluate( () => {
			return ( document as any ).querySelector( '#result' ).innerHTML.trim();
		} );

		expect( innerHTML ).toBe( 'Go to <a href="http://google.com">google.com</a>' );
	} );

} );


