// This file is run by PhantomJS to compile the regular expression from its source into a single regex
// It is a very specific compilation file. It basically expects to see a doc header (created with /** and */ comments),
// and expects the file to evaluate to a compiled regular expression for the regex.
// It will then put the doc header in, the variable name (Autolinker.matcherRegex), and the source of the compiled regex.
// Ex output:
//
//     /**
//      * doc header
//      */
//     /*global Autolinker*/
//     Autolinker.matcherRegex = /regexIsHere/;

/*global phantom, console */
/*jslint evil:true */

var fs = require( 'fs' );


if( phantom.args.length !== 2 ) {
	console.log( 'Usage: phantomjs compileRegex.js sourceRegexFile destinationRegexFile\n\n' +
	             'Where sourceRegexFile is the path to the .js file that holds the source regular expression, ' +
	             'and destinationRegexFile is the path to where the compiled output regex should be placed.' );
	
} else {
	var sourceFilePath = phantom.args[ 0 ],
	    destinationFilePath = phantom.args[ 1 ];
	
	// Normalize the source and destination paths to an absolute path
	if( !fs.isAbsolute( sourceFilePath ) ) {
		sourceFilePath = fs.workingDirectory + fs.separator + sourceFilePath;
	}
	if( !fs.isAbsolute( destinationFilePath ) ) {
		destinationFilePath = fs.workingDirectory + fs.separator + destinationFilePath;
	}
	
	
	// ------------------------------
	
	
	// Read the source file
	var stream;
	try {
		stream = fs.open( sourceFilePath, 'r' );
	} catch( ex ) {
		console.log( ex );
		phantom.exit();
	}
	var fileContents = stream.read();
	
	// Grab the doc header, which we'll prepend to the output regex
	// Matches starting with the /** to the */
	var docHeader = fileContents.match( /\/\*\*[\s\S]*?\*\// )[ 0 ];
	
	// Now evaluate the code, which returns the compiled regular expression
	Autolinker = {};
	eval( fileContents );
	var regex = Autolinker.matcherRegex;

	
	// ------------------------------
	
	
	// Create the output for the new file with the doc header, the variable name, and the compiled regex
	var regexFlags = "";
	if( regex.global ) { regexFlags += 'g'; }
	if( regex.multiline ) { regexFlags += 'm'; }
	if( regex.ignoreCase ) { regexFlags += 'i'; }
	
	var output = 
		docHeader + "\n" +
		"/*global Autolinker*/\n" + 
		"Autolinker.matcherRegex = /" + regex.source + "/" + regexFlags + ";";
	
	
	
	// ------------------------------
	
	// Write the output (destination) file
	try {
		fs.write( destinationFilePath, output, 'w' );
		console.log( "Wrote output file: " + destinationFilePath );
	} catch( ex ) {
		console.log( ex );
		phantom.exit();
	}
}

phantom.exit();