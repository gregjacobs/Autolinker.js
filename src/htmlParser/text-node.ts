import { HtmlNode } from "./HtmlNode";

/**
 * @class Autolinker.htmlParser.TextNode
 * @extends Autolinker.htmlParser.HtmlNode
 *
 * Represents a text node that has been parsed by the {@link Autolinker.htmlParser.HtmlParser}.
 *
 * See this class's superclass ({@link Autolinker.htmlParser.HtmlNode}) for more
 * details.
 */
export class TextNode extends HtmlNode {

	/**
	 * Returns a string name for the type of node that this class represents.
	 *
	 * @return {String}
	 */
	getType() {
		return 'text';
	}

}