/**
 * The subset of the parser states defined in https://www.w3.org/TR/html51/syntax.html
 * which are useful for Autolinker.
 */
export enum State {
	Data = 0,
	TagOpen,
	EndTagOpen,
	TagName,
	BeforeAttributeName,
	AttributeName,
	AfterAttributeName,
	BeforeAttributeValue,
	AttributeValueDoubleQuoted,
	AttributeValueSingleQuoted,
	AttributeValueUnquoted,
	AfterAttributeValueQuoted,
	SelfClosingStartTag,
	Doctype
}