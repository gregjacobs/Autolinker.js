import { HtmlNode, HtmlNodeConfig } from "./html-node";

/**
 * @class Autolinker.htmlParser.ElementNode
 * @extends Autolinker.htmlParser.HtmlNode
 *
 * Represents an HTML element node that has been parsed by the {@link Autolinker.htmlParser.HtmlParser}.
 *
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more
 * details.
 */
export class ElementNode extends HtmlNode {

	/**
	 * @cfg {String} tagName (required)
	 *
	 * The name of the tag that was matched.
	 */
	tagName: string = '';  // default value just to get the above doc comment in the ES5 output and documentation generator

	/**
	 * @cfg {Boolean} closing (required)
	 *
	 * `true` if the element (tag) is a closing tag, `false` if its an opening
	 * tag.
	 */
	closing: boolean = false;  // default value just to get the above doc comment in the ES5 output and documentation generator


	/**
	 * @method constructor
	 * @param {Object} cfg The configuration options for this class, specified
	 *   in an Object.
	 */
	constructor( cfg: ElementNodeConfig ) {
		super( cfg );

		this.tagName = cfg.tagName;
		this.closing = cfg.closing;
	}


	/**
	 * Returns a string name for the type of node that this class represents.
	 *
	 * @return {String}
	 */
	getType() {
		return 'element';
	}


	/**
	 * Returns the HTML element's (tag's) name. Ex: for an &lt;img&gt; tag,
	 * returns "img".
	 *
	 * @return {String}
	 */
	getTagName() {
		return this.tagName;
	}


	/**
	 * Determines if the HTML element (tag) is a closing tag. Ex: &lt;div&gt;
	 * returns `false`, while &lt;/div&gt; returns `true`.
	 *
	 * @return {Boolean}
	 */
	isClosing() {
		return this.closing;
	}

}

export interface ElementNodeConfig extends HtmlNodeConfig {
	tagName: string;
	closing: boolean;
}