# Autolinker.js

![version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fgregjacobs%2FAutolinker.js%2Frefs%2Fheads%2Fmaster%2Fpackage.json&query=%24.version&label=Version)
[![NPM Downloads](https://img.shields.io/npm/dw/autolinker)](https://www.npmjs.com/package/autolinker)
[![build](https://github.com/gregjacobs/Autolinker.js/actions/workflows/main.yml/badge.svg)](https://github.com/gregjacobs/Autolinker.js/actions/workflows/main.yml)
[![codecov](https://codecov.io/github/gregjacobs/Autolinker.js/graph/badge.svg?token=6sqLqa2oeb)](https://codecov.io/github/gregjacobs/Autolinker.js)
[![GitHub License](https://img.shields.io/github/license/gregjacobs/Autolinker.js)](https://github.com/gregjacobs/Autolinker.js/blob/master/LICENSE)

Automatic linking of URLs, emails, phone numbers, mentions, and hashtags in text.

```
Input:  "Visit google.com" 
         
               |
               |
               v

Output: "Visit <a href="https://google.com">google.com</a>"
```

Because I had so much trouble finding a good auto-linking implementation out in
the wild, I decided to roll my own. It seemed that everything I found was either 
an implementation that didn't cover every case, had many false positives linked, 
or was just limited in one way or another.

So, this utility attempts to handle everything. It:

- Autolinks URLs, whether or not they start with the protocol (i.e. 'http://').
  In other words, it will automatically link the text "google.com", as well as
  "http://google.com". Will also autolink IPv4 addresses.
- Will properly handle URLs with query params, anchors,
  and special characters, and not include chars like a trailing `.` at the end
  of a sentence, or a `)` char if the URL is inside parenenthesis.
- Will autolink email addresses
- Will autolink phone numbers
- Will autolink mentions (Twitter, Instagram, Soundcloud, TikTok, Youtube)
- Will autolink hashtags (Twitter, Instagram, Facebook, TikTok, Youtube)
- Won't clobber URLs with hash anchors by treating them as hashtags (like some other libraries do). For example: `google.com/#anchor` is properly linked.
- **Will properly handle HTML input.** The utility will not overwrite an `href`
  attribute inside anchor (`<a>`) tags (or any other tag/attribute), and will not 
  accidentally wrap the inner text of `<a>`/`<script>`/`<style>` tags with a new 
  one (which cause doubly-nested anchor tags, or mess with scripts)
- Will do all of this in `O(n)` (linear) time with low constant factors and without the possibility of RegExp [Catastrophic Backtracking](https://www.regular-expressions.info/catastrophic.html), making it extremely fast and unsusceptible to pathological inputs.

<a name="benchmarks-table"></a>Quick [benchmarks](#benchmarks) comparison:

| Library                             | Ops/Sec | MOE    | Compared to Fastest |
| ----------------------------------- | ------- | ------ | --------------------|
| **Autolinker**@4.1.5                | 3,278   | ±0.40% | Fastest ✅          |
| [anchorme][1]@3.0.8                 | 2,393   | ±0.35% | 26% (1.37x) slower  |
| [linkifyjs][2]@4.2.0 (linkify-html) | 1,875   | ±0.32% | 42% (1.75x) slower  |
| [linkify-it][3]@5.0.0               | 491     | ±0.54% | 85% (6.67x) slower  |

(please let me know of other comparable libraries to compare to!)

Hope that this utility helps you as well!

Full API Docs: [http://gregjacobs.github.io/Autolinker.js/api/](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker)<br>
Live Example: [http://gregjacobs.github.io/Autolinker.js/examples/live-example/](http://gregjacobs.github.io/Autolinker.js/examples/live-example/)


## Upgrading from a previous major version of Autolinker?

See [Breaking Changes](#upgrading-from-v3x---v4x-breaking-changes) at the bottom of this readme.

## Installation

#### Installing with [npm](https://www.npmjs.org/):

```shell
npm install autolinker --save
```


#### Installing with [Yarn](https://yarnpkg.com/):

```shell
yarn add autolinker
```


#### Installing with [pnpm](https://pnpm.io/):

```shell
pnpm add autolinker
```


#### Installing with [Bower](http://bower.io):	
  
```shell
bower install Autolinker.js --save
```


#### Direct download

Simply clone this repository or download a zip of the project, and link to 
either `dist/Autolinker.js` or `dist/Autolinker.min.js` with a `<script>` tag.


## Importing Autolinker

#### ES6+/TypeScript/Webpack/Node.js ESM:

```ts
import Autolinker from 'autolinker';
```

#### Node.js CommonJS:

```javascript
const Autolinker = require('autolinker');
// note: npm wants an all-lowercase package name, but the utility is a class and
// should be aliased with a capital letter
```

#### Browser

```html
<!-- 'Autolinker.js' or 'Autolinker.min.js' - non-minified is better for 
     debugging, minified is better for users' download time -->
<script src="path/to/autolinker/dist/Autolinker.min.js"></script>
```


## Usage

Using the static [link()](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-static-method-link)
method:

```javascript
const linkedText = Autolinker.link(textToAutolink[, options]);
```

Using as a class:

```javascript
const autolinker = new Autolinker([ options ]);

const linkedText = autolinker.link(textToAutoLink);
```

Note: if using the same options to autolink multiple pieces of html/text, it's
slightly more efficient to create a single Autolinker instance, and run the
[link()](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-method-link)
method repeatedly (i.e. use the "class" form above).


#### Examples:

```javascript
const linkedText = Autolinker.link("Check out google.com");
// Produces: "Check out <a href="http://google.com" target="_blank" rel="noopener noreferrer">google.com</a>"

const linkedText = Autolinker.link("Check out google.com", { 
    newWindow: false 
});
// Produces: "Check out <a href="http://google.com">google.com</a>"
```

## Options

The following are the options which may be specified for linking. These are 
specified by providing an Object as the second parameter to [Autolinker.link()](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-static-method-link). 
These include:

- [newWindow](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-newWindow) : boolean<br />
  `true` to have the links should open in a new window when clicked, `false`
  otherwise. Defaults to `true`.
  
- [urls](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-urls) : boolean/Object<br />
  `true` to have URLs auto-linked, `false` to skip auto-linking of URLs. Defaults 
  to `true`.

  This option also accepts an Object form with 3 properties to allow for 
  more customization of what exactly gets linked. All default to `true`:

    - schemeMatches (boolean): `true` to match URLs found prefixed with a scheme,
      i.e. `http://google.com`, or `other+scheme://google.com`, `false` to
      prevent these types of matches.
    - tldMatches: `true` to match URLs with known top level domains (.com, .net,
      etc.) that are not prefixed with a scheme (i.e. 'http://'). Ex: `google.com`,
      `asdf.org/?page=1`, etc. Set to `false` to prevent these types of matches.
    - ipV4Matches (boolean): `true` to match IPv4 addresses. Ex: `192.168.0.1`.
      `false` to prevent these types of matches. Note that if the IP address had 
      a prefixed scheme (such as 'http://'), and `schemeMatches` is true, it 
      will still be linked.

  Example usage: `urls: { schemeMatches: true, tldMatches: false, ipV4Matches: true }`

- [email](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-email) : boolean<br />
  `true` to have email addresses auto-linked, `false` to skip auto-linking of
  email addresses. Defaults to `true`.
  
- [phone](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-phone) : boolean<br />
  `true` to have phone numbers auto-linked, `false` to skip auto-linking of
  phone numbers. Defaults to `true`.

- [mention](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-mention) : string<br />
  A string for the service name to have mentions (@username) auto-linked to. Supported values at this time are 'twitter', 'soundcloud', 'instagram', 'tiktok', and 'youtube'. Pass `false` to skip auto-linking of mentions. Defaults to `false`.

- [hashtag](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-hashtag) : boolean/string<br />
  A string for the service name to have hashtags auto-linked to. Supported values at this time are 'twitter', 'facebook', 'instagram', 'tiktok', and 'youtube'. Pass `false` to skip auto-linking of hashtags. Defaults to `false`.

- [stripPrefix](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-stripPrefix) : boolean<br />
  `true` to have the `'http://'` (or `'https://'`) and/or the `'www.'` 
  stripped from the beginning of displayed links, `false` otherwise. 
  Defaults to `true`.
  
  This option also accepts an Object form with 2 properties to allow for 
  more customization of what exactly is prevented from being displayed. 
  Both default to `true`:

    - scheme (boolean): `true` to prevent the scheme part of a URL match
      from being displayed to the user. Example: `'http://google.com'` 
      will be displayed as `'google.com'`. `false` to not strip the 
      scheme. NOTE: Only an `'http://'` or `'https://'` scheme will be
      removed, so as not to remove a potentially dangerous scheme (such
      as `'file://'` or `'javascript:'`).
    - www (boolean): `true` to prevent the `'www.'` part of a URL match
      from being displayed to the user. Ex: `'www.google.com'` will be
      displayed as `'google.com'`. `false` to not strip the `'www'`.

- [stripTrailingSlash](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-stripTrailingSlash) : boolean<br />
  `true` to remove the trailing slash from URL matches, `false` to keep
  the trailing slash. Example when `true`: `http://google.com/` will be 
  displayed as `http://google.com`. Defaults to `true`.

- [truncate](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-truncate) : number/Object<br />
  A number for how many characters long URLs/emails/Twitter handles/Twitter
  hashtags should be truncated to inside the text of a link. If the match is
  over the number of characters, it will be truncated to this length by
  replacing the end of the string with a two period ellipsis ('..').

  Example: a url like 'http://www.yahoo.com/some/long/path/to/a/file' truncated
  to 25 characters may look like this: 'yahoo.com/some/long/pat..'

  In the object form, both `length` and `location` may be specified to perform
  truncation. Available options for `location` are: 'end' (default), 'middle',
  or 'smart'. Example usage:

    ```javascript
    truncate: { length: 32, location: 'middle' }
    ```

  The 'smart' truncation option is for URLs where the algorithm attempts to
  strip out unnecessary parts of the URL (such as the 'www.', then URL scheme,
  hash, etc.) before trying to find a good point to insert the ellipsis if it is
  still too long. For details, see source code of:
  [TruncateSmart](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker.truncate.TruncateSmart)
  
- [className](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-className) : string<br />
  A CSS class name to add to the generated anchor tags. This class will be added
  to all links, as well as this class plus "url"/"email"/"phone"/"hashtag"/"mention"
  suffixes for styling url/email/phone/hashtag/mention links differently.

  The name of the hashtag/mention service is also added as a CSS class for those
  types of matches.

  For example, if this config is provided as "my-link", then:

  - URL links will have the CSS classes: "my-link my-link-url"
  - Email links will have the CSS classes: "my-link my-link-email"
  - Phone links will have the CSS classes: "my-link my-link-phone"
  - Twitter mention links will have the CSS classes: "my-link my-link-mention my-link-twitter"
  - Instagram mention links will have the CSS classes: "my-link my-link-mention my-link-instagram"
  - Hashtag links will have the CSS classes: "my-link my-link-hashtag my-link-twitter"

- [decodePercentEncoding](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-decodePercentEncoding): boolean<br />
  `true` to decode percent-encoded characters in URL matches, `false` to keep
  the percent-encoded characters.
  
  Example when `true`: `https://en.wikipedia.org/wiki/San_Jos%C3%A9` will
  be displayed as `https://en.wikipedia.org/wiki/San_José`.
  
  Defaults to `true`.

- [replaceFn](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-replaceFn) : Function<br />
  A function to use to programmatically make replacements of matches in the
  input string, one at a time. See the section
  <a href="#custom-replacement-function">Custom Replacement Function</a> for
  more details.

- [sanitizeHtml](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-sanitizeHtml) : boolean<br />
  
	`true` to HTML-encode the start and end brackets of existing HTML tags found 
  in the input string. This will escape `<` and `>` characters to `&lt;` and 
  `&gt;`, respectively.
	
	Setting this to `true` will prevent XSS (Cross-site Scripting) attacks, 
	but will remove the significance of existing HTML tags in the input string. If 
  you would like to maintain the significance of existing HTML tags while also 
  making the output HTML string safe, leave this option as `false` and use a 
  tool like https://github.com/cure53/DOMPurify (or others) on the input string 
  before running Autolinker.

  Defaults to `false`.

For example, if you wanted to disable links from opening in [new windows](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-newWindow), you could do:

```javascript
const linkedText = Autolinker.link("Check out google.com", { 
    newWindow: false 
});
// Produces: "Check out <a href="http://google.com">google.com</a>"
```

And if you wanted to truncate the length of URLs (while also not opening in a new window), you could do:

```javascript
const linkedText = Autolinker.link("http://www.yahoo.com/some/long/path/to/a/file", { 
    truncate: 25, 
    newWindow: false 
});
// Produces: "<a href="http://www.yahoo.com/some/long/path/to/a/file">yahoo.com/some/long/pat..</a>"
```

## More Examples

One could update an entire DOM element that has unlinked text to auto-link them
as such:

```javascript
const myTextEl = document.getElementById('text');
myTextEl.innerHTML = Autolinker.link(myTextEl.innerHTML);
```

Using the same pre-configured [Autolinker](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker)
instance in multiple locations of a codebase (usually by dependency injection):

```javascript
const autolinker = new Autolinker({ newWindow: false, truncate: 25 });

//...

autolinker.link("Check out http://www.yahoo.com/some/long/path/to/a/file");
// Produces: "Check out <a href="http://www.yahoo.com/some/long/path/to/a/file">yahoo.com/some/long/pat..</a>"

//...

autolinker.link( "Go to www.google.com" );
// Produces: "Go to <a href="http://www.google.com">google.com</a>"

```

## Retrieving the List of Matches

If you're just interested in retrieving the list of [Matches](http://greg-jacobs.com/Autolinker.js/api/#!/api/Autolinker.match.Match) without producing a transformed string, you can use the [parse()](http://greg-jacobs.com/Autolinker.js/api/#!/api/Autolinker-static-method-parse) method.

For example:

```
const matches = Autolinker.parse("Hello google.com, I am asdf@asdf.com", {
    urls: true,
    email: true
});

console.log(matches.length);         // 2
console.log(matches[0].type);        // 'url'
console.log(matches[0].getUrl());    // 'google.com'
console.log(matches[1].type);        // 'email'
console.log(matches[1].getEmail());  // 'asdf@asdf.com'
```


## Custom Replacement Function

A custom replacement function ([replaceFn](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker-cfg-replaceFn))
may be provided to replace url/email/phone/mention/hashtag matches on an
individual basis, based on the return from this function.

#### Full example, for purposes of documenting the API:

```javascript
const input = "...";  // string with URLs, Email Addresses, Mentions (Twitter, Instagram), and Hashtags

const linkedText = Autolinker.link(input, {
    replaceFn : function(match) {
        console.log("href = ", match.getAnchorHref());
        console.log("text = ", match.getAnchorText());

        switch(match.type) {
            case 'url':
                console.log("url: ", match.getUrl());

                return true;  // let Autolinker perform its normal anchor tag replacement

            case 'email':
                const email = match.getEmail();
                console.log("email: ", email);

                if(email === "my@own.address") {
                    return false;  // don't auto-link this particular email address; leave as-is
                } else {
                    return;  // no return value will have Autolinker perform its normal anchor tag replacement (same as returning `true`)
                }

            case 'phone':
                console.log("Phone Number: ", match.getPhoneNumber());

                return '<a href="http://newplace.to.link.phone.numbers.to/">' + match.getPhoneNumber() + '</a>';

            case 'mention':
                console.log("Mention: ", match.getMention());
                console.log("Mention Service Name: ", match.getServiceName());

                return '<a href="http://newplace.to.link.mention.handles.to/">' + match.getMention() + '</a>';

            case 'hashtag':
                console.log("Hashtag: ", match.getHashtag());

                return '<a href="http://newplace.to.link.hashtag.handles.to/">' + match.getHashtag() + '</a>';
        }
    }
} );
```

#### Modifying the default generated anchor tag

```javascript
const input = "...";  // string with URLs, Email Addresses, Mentions (Twitter, Instagram), and Hashtags

const linkedText = Autolinker.link( input, {
    replaceFn : function( match ) {
        console.log("href = ", match.getAnchorHref());
        console.log("text = ", match.getAnchorText());

        const tag = match.buildTag();       // returns an `Autolinker.HtmlTag` instance for an <a> tag
        tag.setAttr('rel', 'nofollow');   // adds a 'rel' attribute
        tag.addClass('external-link');    // adds a CSS class
        tag.setInnerHtml('Click here!');  // sets the inner html for the anchor tag

        return tag;
    }
} );
```


The `replaceFn` is provided one argument:

1. An [Autolinker.match.Match](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker.match.Match)
   object which details the match that is to be replaced.


A replacement of the match is made based on the return value of the function.
The following return values may be provided:

1. No return value (`undefined`), or `true` (boolean): Delegate back to
   Autolinker to replace the match as it normally would.
2. `false` (boolean): Do not replace the current match at all - leave as-is.
3. Any string: If a string is returned from the function, the string will be used
   directly as the replacement HTML for the match.
4. An [Autolinker.HtmlTag](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker.HtmlTag)
   instance, which can be used to build/modify an HTML tag before writing out its
   HTML text.


## Full API Docs

The full API docs for Autolinker may be referenced at:
[http://gregjacobs.github.io/Autolinker.js/api/](http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker)

## Live Example

[http://gregjacobs.github.io/Autolinker.js/examples/](http://gregjacobs.github.io/Autolinker.js/examples/)


## Upgrading from v3.x -> v4.x (Breaking Changes)

1. Internet Explorer support has been removed since its official demise in June
   2022.
1. The `urls.wwwMatches` config has been removed. A `www.` prefix is now treated
   like any other subdomain of a top level domain (TLD) match (such as 
   'subdomain.google.com'). 
1. `Match.getType()` should be replaced with `Match.type`. This allows for 
   TypeScript type narrowing of `Match` objects returned by the `parse()` 
   method or inside the `replaceFn`.
1. The `Matcher` classes have been removed in favor of a single finite state
   machine parser, greatly improving the performance of Autolinker (3x 
   performance improvement over the 3.x branch), but removing some of the 
   customizability of the old regular expressions. Will address this 
   customizability in a future release.
1. `Autolinker.AnchorTagBuilder`, `Autolinker.HtmlTag`, and `Autolinker.match.*`
   references have been removed. These shouldn't be needed as public APIs, but
   please raise a GitHub issue if these are for some reason needed.

## Upgrading from v2.x -> v3.x (Breaking Changes)

1. If you are still on v1.x, first follow the instructions in the 
   [Upgrading from v1.x -> v2.x](#upgrading-from-v1x---v2x-breaking-changes) 
   section below.
2. The `HtmlParser` class has been removed in favor of an internal `parseHtml()`
   function which replaces the old regexp-based implementation with a state 
   machine parser that is guaranteed to run in linear time. If you were using 
   the `HtmlParser` class directly, I recommend switching to [htmlparser2](https://github.com/fb55/htmlparser2), which implements the HTML semantics 
   better. The internal `parseHtml()` function that Autolinker now uses is 
   fairly geared towards Autolinker's purposes, and may not be useful in a 
   general HTML parsing sense.

## Upgrading from v1.x -> v2.x (Breaking Changes)

1. If you are still on v0.x, first follow the instructions in the 
   [Upgrading from v0.x -> v1.x](#upgrading-from-v0x---v1x-breaking-changes) 
   section below.
2. The codebase has been converted to TypeScript, and uses ES6 exports. You can
   now use the `import` statement to pull in the `Autolinker` class and related 
   entities such as `Match`:

   ```ts
   // ES6/TypeScript/Webpack
   import Autolinker, { Match } from 'autolinker';
   ```

   The `require()` interface is still supported as well for Node.js:

   ```ts
   // Node.js
   const Autolinker = require('autolinker');
   ```

3. You will no longer need the `@types/autolinker` package as this package now
   exports its own types
4. You will no longer be able to override the regular expressions in the 
  `Matcher` classes by assigning to the prototype (for instance, something like
   `PhoneMatcher.prototype.regex = ...`). This is due to how TypeScript creates 
   properties for class instances in the constructor rather than on prototypes. 
   
   The idea of providing your own regular expression for these classes is a 
   brittle notion anyway, as the  `Matcher` classes rely on capturing groups in 
   the RegExp being in the right place, or even multiple capturing groups for 
   the same piece of information to support a different format. These capturing
   groups and associated code are subject to change as the regular expression 
   needs to be updated, and will not involve a major version release of 
   Autolinker.
   
   In the future you will be able to override the default `Matcher` classes
   entirely to provide your own implementation, but please raise an issue (or
   +1 an issue) if you think the library should support a currently-unsupported
   format.

## Upgrading from v0.x -> v1.x (Breaking Changes)

1. `twitter` option removed, replaced with `mention` (which accepts 'twitter', 
   'instagram' and 'soundcloud' values)
2. Matching mentions (previously the `twitter` option) now defaults to
   being turned off. Previously, Twitter handle matching was on by 
   default.
3. `replaceFn` option now called with just one argument: the `Match` 
   object (previously was called with two arguments: `autolinker` and 
   `match`)
4. (Used inside the `replaceFn`) `TwitterMatch` replaced with 
   `MentionMatch`, and `MentionMatch.getType()` now returns `'mention'` 
   instead of `'twitter'`
5. (Used inside the `replaceFn`) `TwitterMatch.getTwitterHandle()` -> 
   `MentionMatch.getMention()`


## Developing / Contributing

Pull requests definitely welcome. To setup the project, make sure you have 
[Node.js](https://nodejs.org) installed. Then open up a command prompt and type 
the following:

```sh
npm install -g pnpm@latest   # this project uses pnpm workspaces, and pnpm is a faster npm anyway :)

cd Autolinker.js             # where you cloned the project
pnpm install
```

To run the tests:

```sh
pnpm run test
```

- Make sure to add tests to check your new functionality/bugfix
- Run the `pnpm run test` command to test

#### Running the Live Example Page Locally

Run:

```sh
pnpm run devserver
```

Then open your browser to: http://localhost:8080/docs/examples/index.html

You should be able to make a change to source files, and refresh the page to see
the changes.

#### Running the benchmarks <a name="benchmarks"></a>

Run:

```sh
pnpm run benchmarks
```

> Note: See the [Benchmarks Table](#benchmarks-table) above for current results.

Couple points on the benchmarks:
* These benchmarks attempt to set up all libraries by configuring comparable features to Autolinker (e.g.: linking emails, hashtags, mentions, etc.) to try to get an apples-to-apples comparison.
* While developing, recommend running the benchmarks a few times both before and after making any changes if developing.
* See the [benchmarks](./benchmarks) folder and [benchmarks/input-text.ts](./benchmarks/input-text.ts) for how the benchmarks are set up and what input they are given.

#### Documentation Generator Notes

This project uses [JSDuck](https://github.com/senchalabs/jsduck) for its 
documentation generation, which produces the page at [http://gregjacobs.github.io/Autolinker.js](http://gregjacobs.github.io/Autolinker.js).

Unfortunately, JSDuck is a very old project that is no longer maintained. As 
such, it doesn't support TypeScript or anything from ES6 (the `class` keyword, 
arrow functions, etc). However, I have yet to find a better documentation 
generator that creates such a useful API site. (Suggestions for a new one are 
welcome though - please raise an issue.)

Since ES6 is not supported, we must generate the documentation from the ES5 
output. As such, a few precautions must be taken care of to make sure the 
documentation comes out right:

1. `@cfg` documentation tags must exist above a class property that has a 
   default value, or else it won't end up in the ES5 output. For example:

   ```ts
   // Will correctly end up in the ES5 output

   /**
    * @cfg {String} title
    */
   readonly title: string = '';



   // Will *not* end up in ES5 output, and thus, won't end up in the generated
   // documentation

   /**
    * @cfg {String} title
    */
   readonly title: string;
   ```
2. The `@constructor` tag must be replaced with `@method constructor`

To build the documentation, you will need [Ruby](https://www.ruby-lang.org) 
installed (note: Ruby comes pre-installed on MacOS), with the 
[JSDuck](https://github.com/senchalabs/jsduck) gem. 

See https://github.com/senchalabs/jsduck#getting-it for installation 
instructions on Windows/Mac/Linux.

## Changelog

See [Releases](https://github.com/gregjacobs/Autolinker.js/releases)

<!-- Reference Links -->

[1]: https://github.com/alexcorvi/anchorme.js "anchorme.js"
[2]: https://linkify.js.org/docs/linkify-html.html "linkify-html"
[3]: https://github.com/markdown-it/linkify-it "linkify-it"