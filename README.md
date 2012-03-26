# Autolinker.js

Because I had so much trouble finding a **GOOD** autolinking implementation, I decided to roll my own. Everything that I found out there was either a naive implementation, or just didn't cover every case. I saw deficiencies like:

- Not autolinking URLs that didn't start with a protocol (i.e. http://). In other words, they would not link the string "google.com", but would link "http://google.com".
- Not properly handling URLs with special (but allowable) characters
- Not properly handling URLs with query parameters or a named anchor (i.e. hash)
- Not autolinking email addresses.
- Not autolinking Twitter handles.
- Not properly handling HTML, or not handling HTML at all, such as either autolinking the `href` attribute inside anchor (&lt;a&gt;) tags (which caused invalid HTML), or wrapping the inner text of an anchor tag if it also looked like a URL (which causes doubly nested anchor tags...). 

Other implementations that I found were just plain limited as well, such as jQuery-only solutions, or did things which one shouldn't (like adding methods to `String.prototype`).


## Usage

This utility is very easy to use. Simply copy the Autolinker.js (or Autolinker.min.js) file into your project, link to it with a script tag, and then run it as such:

	var linkedText = Autolinker.link( textToAutolink[, options] );
	
Example:

	var linkedText = Autolinker.link( "The sky is falling from google.com" );
	// Produces: "The sky is falling from <a href="http://google.com" target="_blank">google.com</a>"
	
### Options
There are options which may be specified for the linking. These are specified by providing an Object as the second parameter to `Autolinker.link()`. Options include:

- **newWindow** : Boolean
  `true` to have the links should open in a new window when clicked, `false` otherwise. Defaults to `true`.
- **truncate** : Number
  A number for how many characters long URLs/emails/twitter handles should be truncated to inside the text of a link. If the URL/email/twitter is over the number of characters, it will be truncated to this length by adding a two period ellipsis ('..') into the middle of the string.
  Ex: a url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters may look like this: 'http://www...th/to/a/file'
   

If you wanted to disable links opening in new windows, you could do:

	var linkedText = Autolinker.link( "The sky is falling from google.com", { newWindow: false } );
	// Produces: "The sky is falling from <a href="http://google.com">google.com</a>"

And if you wanted to truncate the length of URLs (while also not opening in a new window), you could do:

	var linkedText = Autolinker.link( "http://www.yahoo.com/some/long/path/to/a/file", { truncate: 25, newWindow: false } );
	// Produces: "The sky is falling from <a href="http://www.yahoo.com/some/long/path/to/a/file">http://www...th/to/a/file</a>"


### More Examples
One could update a DOM element that has unlinked text to autolink them as such:

	var myTextEl = document.getElementById( 'text' );
	myTextEl.innerHTML = Autolinker.link( myTextEl.innerHTML );

## Changelog:

### 0.3

- Implemented the `truncate` option.

### 0.2

- Implemented autolinking Twitter handles.

### 0.1

* Initial implementation, which autolinks URLs and email addresses. Working on linking Twitter handles.
