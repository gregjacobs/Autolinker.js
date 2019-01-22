import { defaults, splitAndCapture } from "../src/utils";

describe( "Autolinker.Util", function() {

	describe( 'defaults()', function() {

		it( 'should not overwrite any properties that exist on the destination object', function() {
			let obj = defaults( { a: 1, b: 2, c: 3 }, { a: 91, b: 92, c: 93 } );

			expect( obj ).toEqual( { a: 1, b: 2, c: 3 } );
		} );


		it( 'should add properties that do not exist on the destination object, without overwriting properties that do exist', function() {
			let obj = defaults( { b: 2 }, { a: 91, b: 92, c: 93 } );

			expect( obj ).toEqual( { a: 91, b: 2, c: 93 } );
		} );

	} );


	describe( 'splitAndCapture()', function() {

		it( "should return an array with the 'split' characters included", function() {
			let result = splitAndCapture( 'a,b,c', /,/g );

			expect( result ).toEqual( [ 'a', ',', 'b', ',', 'c' ] );
		} );


		it( `if a split character is found at the beginning of the string, the
			 empty string should be the first element in the returned array to 
			 match how JS engines which support split-and-capture do it`, 
		() => {
			let result = splitAndCapture( ',a,b,c', /,/g );  // equivalent of ',a,b,c'.split(/(,)/g) in newer JS engines

			expect( result ).toEqual( [ '', ',', 'a', ',', 'b', ',', 'c' ] );
		} );


		it( `if a split character is found at the end of the string, the
			 empty string should be the last element in the returned array to 
			 match how JS engines which support split-and-capture do it`, 
		() => {
			let result = splitAndCapture( ',a,b,', /,/g );  // equivalent of ',a,b,'.split(/(,)/g) in newer JS engines

			expect( result ).toEqual( [ '', ',', 'a', ',', 'b', ',', '' ] );
		} );


		it( "should return an array with the 'split' characters included, when there are multiple sequences of characters to split on", function() {
			let re = /(&nbsp;|&#160;|&lt;|&#60;|&gt;|&#62;)/g,
			    result = splitAndCapture( 'Joe went to yahoo.com and used HTML&nbsp;entities like &gt; and &lt; today', re );

			expect( result ).toEqual( [ 'Joe went to yahoo.com and used HTML', '&nbsp;', 'entities like ', '&gt;', ' and ', '&lt;', ' today' ] );
		} );

	} );

} );