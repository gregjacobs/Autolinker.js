# Autolinker.js

Because I had so much trouble finding a **good** autolinking implementation out in the wild, I decided to roll my own. Everything that I found out there was either a naive implementation, or just didn't cover every case. 

So, this utility attempts to handle everything! It:

- Autolinks URLs, whether or not they start with a protocol (i.e. 'http://'). In other words, it will automatically link the text "google.com", as well "http://google.com".
- Will properly handle URLs with special characters
- Will properly handle URLs with query parameters or a named anchor (i.e. hash)
- Will autolink email addresses.
- Will autolink Twitter handles.
- Will properly handle HTML input. The utility will not change the `href` attribute inside anchor (&lt;a&gt;) tags (or any other tag/attribute for that matter), and will not accidentally wrap the inner text of an anchor tag with a new one (which would cause doubly nested anchor tags, and would not be expected behavior as the inner text of an anchor is already linked). 


## Usage

This utility is very easy to use. Simply copy the Autolinker.js (or Autolinker.min.js) file into your project, link to it with a script tag, and then run it as such:

	var linkedText = Autolinker.link( textToAutolink[, options] );
	
Example:

	var linkedText = Autolinker.link( "The sky is falling from google.com" );
	// Produces: "The sky is falling from <a href="http://google.com" target="_blank">google.com</a>"
	
### Options
There are options which may be specified for the linking. These are specified by providing an Object as the second parameter to `Autolinker.link()`. Options include:

- **newWindow** : Boolean<br />
  `true` to have the links should open in a new window when clicked, `false` otherwise. Defaults to `true`.
- **truncate** : Number<br />
  A number for how many characters long URLs/emails/twitter handles should be truncated to inside the text of a link. If the URL/email/twitter is over the number of characters, it will be truncated to this length by adding a two period ellipsis ('..') into the middle of the string.
  Ex: a url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated to 25 characters may look like this: 'http://www...th/to/a/file'
   

If you wanted to disable links opening in new windows, you could do:

	var linkedText = Autolinker.link( "The sky is falling from google.com", { newWindow: false } );
	// Produces: "The sky is falling from <a href="http://google.com">google.com</a>"

And if you wanted to truncate the length of URLs (while also not opening in a new window), you could do:

	var linkedText = Autolinker.link( "http://www.yahoo.com/some/long/path/to/a/file", { truncate: 25, newWindow: false } );
	// Produces: "<a href="http://www.yahoo.com/some/long/path/to/a/file">http://www...th/to/a/file</a>"


### More Examples
One could update a DOM element that has unlinked text to autolink them as such:

	var myTextEl = document.getElementById( 'text' );
	myTextEl.innerHTML = Autolinker.link( myTextEl.innerHTML );

## Changelog:

### 0.3.1

- Fixed handling of nested HTML tags within anchor tags in the input string.

### 0.3

- Implemented the `truncate` option.

### 0.2

- Implemented autolinking Twitter handles.

### 0.1

* Initial implementation, which autolinks URLs and email addresses. Working on linking Twitter handles.
