# Autolinker.js

Because I had so much trouble finding a **GOOD** autolinking implementation, I decided to roll my own. Everything that I found out there was either a naive implementation, or just didn't cover every case. I saw deficiencies like:

- Not autolinking URLs that didn't start with a protocol (i.e. http://). They would not link the string "google.com".
- Not properly handling URLs with certain (but allowable) characters
- Not properly handling URLs with query parameters or a named anchor (i.e. hash)
- Not autolinking email addresses.
- Not autolinking Twitter handles.
- Not properly handling HTML, or not handling HTML at all, such as autolinking the href attribute inside anchor (&lt;a&gt;) tags (which caused doubly nested anchor tags...). 

Other implementations that I found were just plain limited as well (such as jQuery-only solutions), or did things which one shouldn't (like adding methods to `String.prototype`).


## Usage

This utility is very easy to use. Simply copy the Autolinker.js (or Autolinker.min.js) file into your project, link to it, and then run it as such:

	var linkedText = Autolinker.link( text[, options] );
	
Ex:

	var linkedText = Autolinker.link( "The sky is falling from google.com" );
	// Produces: "The sky is falling from <a href="http://google.com" target="_blank">google.com</a>"
	
### Options
There are options which may be specified for the linking. The only one at this time however is the `newWindow` option, which allows you to specify if the link should open in a new window or not. It defaults to true, but if you wanted to disable this, you could do:

	var linkedText = Autolinker.link( "The sky is falling from google.com", { newWindow: false } );
	// Produces: "The sky is falling from <a href="http://google.com">google.com</a>"

### More Examples
One could update a DOM element that has unlinked text as such:

	var myTextEl = document.getElementById( 'text' );
	myTextEl.innerHTML = Autolinker.link( myTextEl.innerHTML );

## Changelog:

### 0.1

* Initial implementation, which autolinks URLs and email addresses. Working on linking Twitter handles.
