/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param {String/Function} testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param {String/Function} onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param {Number} timeOutMillis the max amount of time to wait. If not specified, 10 sec is used.
 */
/*global console, phantom, WebPage, runnerResults, testsFailed */
/*jslint evil:true */
function waitFor(testFx, onReady, timeOutMillis) {
	var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 20001, //< Default Max Timeout is 20s
		start = new Date().getTime(),
		condition = false,
		interval = setInterval(function() {
			if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
				// If not time-out yet and condition not yet fulfilled
				condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
			} else {
				if(!condition) {
					// If condition still not fulfilled (timeout but condition is 'false')
					console.log("'waitFor()' timeout");
					phantom.exit(1);
				} else {
					// Condition fulfilled (timeout and/or condition is 'true')
					//console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
					typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
					clearInterval(interval); //< Stop this interval
				}
			}
		}, 100); //< repeat check every 100ms
}


if (phantom.args.length === 0 || phantom.args.length > 2) {
	console.log('Usage: phantomJS-extTest-runner.js URL');
	phantom.exit();
}

var page = new WebPage();

// Route "console.log()" calls from within the Page context to the main Phantom context (i.e. current "this")
page.onConsoleMessage = function(msg) {
	console.log(msg);
};

page.open(phantom.args[0], function(status){
	if (status !== "success") {
		console.log("Unable to access network");
		phantom.exit();
		
	} else {
		var startTime = new Date().getTime();
		console.log( "Starting tests..." );
	
		waitFor(function(){
			return page.evaluate(function(){
				if( typeof runnerResults === 'object' ) {
					return true;
				}
				return false;
			});
		}, function(){
			console.log( "Tests finished in " + (new Date().getTime() - startTime) + "ms.");
			var numFailed = page.evaluate( function() {
				// 'runnerResults' and 'testsFailed' variables defined on page
				
				console.log( "\nResults:\n--------" );
				console.log( "  Passed: " + runnerResults.passed + "    Failed: " + runnerResults.failed + "    Ignored: " + runnerResults.ignored );
				
				if( testsFailed.length > 0 ) {
					console.log( "\nFailures:\n---------" );
					console.log( testsFailed.join( "\n\n" ) );
				}
				
				return testsFailed.length;
			} );
			
			phantom.exit( ( numFailed > 0 ) ? 1 : 0 );  // return code 1 for failed tests
		});
	}
});
