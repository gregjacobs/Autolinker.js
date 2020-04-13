import { Matcher } from "./matcher";
import { alphaNumericAndMarksCharsStr, domainNameCharRegex } from "../regex-lib";
import { EmailMatch } from "../match/email-match";
import { tldRegex } from './tld-regex';

// For debugging: search for other "For debugging" lines
// import CliTable from 'cli-table';

// RegExp objects which are shared by all instances of EmailMatcher. These are
// here to avoid re-instantiating the RegExp objects if `Autolinker.link()` is
// called multiple times, thus instantiating EmailMatcher and its RegExp 
// objects each time (which is very expensive - see https://github.com/gregjacobs/Autolinker.js/issues/314). 
// See descriptions of the properties where they are used for details about them
const localPartCharRegex = new RegExp( `[${alphaNumericAndMarksCharsStr}!#$%&'*+/=?^_\`{|}~-]` );
const strictTldRegex = new RegExp( `^${tldRegex.source}$` );

class State {
	private edges: [RegExp, State, boolean][] = [];

	constructor(
		public accepting = false
	) {}

	public on(char: RegExp, nextState: State, invalidatesLastMatch = false): this {
		this.edges.push([char, nextState, invalidatesLastMatch]);
		return this;
	}

	public nextState(char: string): {nextState: State | undefined, invalidatesLastMatch: boolean } {
		for (const edge of this.edges) {
			const [testCharOrRegex, nextState, invalidatesLastMatch] = edge;

			if (testCharOrRegex.test(char)) return { nextState, invalidatesLastMatch };
		}
		return { nextState: undefined, invalidatesLastMatch: false };
	}
}

function createState(accepts = false): State {
	return new State(accepts);
}

const stateNonEmail = createState();  // starting state
const stateMailToM = createState();
const stateMailToA = createState();
const stateMailToI = createState();
const stateMailToL = createState();
const stateMailToT = createState();
const stateMailToO = createState();
const stateMailToColon = createState();
const stateLocalPart = createState();
const stateLocalPartDot = createState();
const stateAtSign = createState();
const stateFirstDomainLabel = createState();
const stateFirstDomainLabelHyphen = createState();
const stateDomainDot = createState();
const stateDomainLabel = createState(true);
const stateDomainLabelHyphen = createState();

const dot = /\./;
const at = /@/;
const hyphen = /-/;

stateNonEmail
    .on(/m/i, stateMailToM)
	.on(localPartCharRegex, stateLocalPart);

stateMailToM
	.on(/a/i, stateMailToA)
	.on(dot, stateLocalPartDot)
	.on(at, stateAtSign)
	.on(localPartCharRegex, stateLocalPart);

stateMailToA
	.on(/i/i, stateMailToI)
	.on(dot, stateLocalPartDot)
	.on(at, stateAtSign)
	.on(localPartCharRegex, stateLocalPart);

stateMailToI
	.on(/l/i, stateMailToL)
	.on(dot, stateLocalPartDot)
	.on(at, stateAtSign)
	.on(localPartCharRegex, stateLocalPart);

stateMailToL
	.on(/t/i, stateMailToT)
	.on(dot, stateLocalPartDot)
	.on(at, stateAtSign)
	.on(localPartCharRegex, stateLocalPart);

stateMailToT
	.on(/o/i, stateMailToO)
	.on(dot, stateLocalPartDot)
	.on(at, stateAtSign)
	.on(localPartCharRegex, stateLocalPart);

stateMailToO
	.on(/:/, stateMailToColon)
	.on(dot, stateLocalPartDot)
	.on(at, stateAtSign)
	.on(localPartCharRegex, stateLocalPart);

stateMailToColon
	.on(localPartCharRegex, stateLocalPart);

stateLocalPart
	.on(dot, stateLocalPartDot)
	.on(at, stateAtSign)
	.on(localPartCharRegex, stateLocalPart);

stateLocalPartDot
	.on(dot, stateNonEmail)  // We read a second '.' in a row, not a valid email address local part
	.on(at, stateNonEmail)  // We read the '@' character immediately after a dot ('.'), not an email address
	.on(localPartCharRegex, stateLocalPart);

stateAtSign
	.on(domainNameCharRegex, stateFirstDomainLabel);

stateFirstDomainLabel
	.on(dot, stateDomainDot)
	.on(hyphen, stateFirstDomainLabelHyphen)
	.on(domainNameCharRegex, stateFirstDomainLabel);

stateFirstDomainLabelHyphen
	.on(hyphen, stateNonEmail)  // Not valid to have two hyphens ('--')
	.on(dot, stateNonEmail)  // Not valid to have hyphen+dot ('-.')
	.on(domainNameCharRegex, stateFirstDomainLabel);

stateDomainLabel
	.on(dot, stateDomainDot)
	.on(hyphen, stateDomainLabelHyphen)
	.on(domainNameCharRegex, stateDomainLabel);

stateDomainLabelHyphen
	.on(hyphen, stateNonEmail)  // Not valid to have two hyphens ('--')
	.on(dot, stateNonEmail)  // Not valid to have hyphen+dot ('-.')
	.on(domainNameCharRegex, stateDomainLabel);

stateDomainDot
	.on(dot, stateNonEmail)  // Not valid to have two dots ('..')
	.on(hyphen, stateNonEmail)  // Not valid to have dot+hyphen ('.-')
	.on(domainNameCharRegex, stateDomainLabel);

/**
 * @class Autolinker.matcher.Email
 * @extends Autolinker.matcher.Matcher
 *
 * Matcher to find email matches in an input string.
 *
 * See this class's superclass ({@link Autolinker.matcher.Matcher}) for more details.
 */
export class EmailMatcher extends Matcher {

	/**
	 * Valid characters that can be used in the "local" part of an email address,
	 * i.e. the "name" part of "name@site.com"
	 */
	protected localPartCharRegex = localPartCharRegex;

	/**
	 * @inheritdoc
	 */
	parseMatches( str: string ) {
		const tagBuilder = this.tagBuilder;
		const matches: EmailMatch[] = [];
		let state: State = stateNonEmail;
		let matchStartIdx = 0;
		let lastAcceptingCharIdx = -1;

		for (let charIdx = 0, len = str.length; charIdx < len; charIdx++) {
			const char = str.charAt(charIdx);
	
			const { nextState, invalidatesLastMatch } = state.nextState(char);
			//console.log(`${charIdx} | ${stateName(state)}: '${char}' -> ${stateName(nextState || stateNonEmail)}`);
			state = nextState || stateNonEmail;

			if (invalidatesLastMatch) lastAcceptingCharIdx = -1;
	
			if (state === stateNonEmail) {
				if (lastAcceptingCharIdx !== -1) {
					captureMatch(matchStartIdx, lastAcceptingCharIdx + 1);
				}
				state = stateNonEmail;
				matchStartIdx = charIdx + 1;
				lastAcceptingCharIdx = -1;
			} else {
				if (state.accepting) {
					lastAcceptingCharIdx = charIdx;
				}
			}
		}
	
		// Handle last match
		if (state !== stateNonEmail && lastAcceptingCharIdx !== -1) {
			captureMatch(matchStartIdx, lastAcceptingCharIdx + 1);
		}
	
		return matches;

		function captureMatch(startIdx: number, endIdx: number) {
			const matchedText = str.substring(startIdx, endIdx);
			const email = /^mailto:/i.test(matchedText)
				? matchedText.slice( 'mailto:'.length ) 
				: matchedText;
			const tld = email.slice(email.lastIndexOf('.') + 1).toLowerCase();

			if (strictTldRegex.test(tld)) {
				matches.push(new EmailMatch( {
					tagBuilder  : tagBuilder,
					matchedText,
					offset      : startIdx,
					email
				} ) );
			}
		}
	}

}


function stateName(state: State): string {
	switch(state) {
		case stateNonEmail: return 'stateNonEmail';
		case stateMailToM: return 'stateMailToM';
		case stateMailToA: return 'stateMailToA';
		case stateMailToI: return 'stateMailToI';
		case stateMailToL: return 'stateMailToL';
		case stateMailToT: return 'stateMailToT';
		case stateMailToO: return 'stateMailToO';
		case stateMailToColon: return 'stateMailToColon';
		case stateLocalPart: return 'stateLocalPart';
		case stateLocalPartDot: return 'stateLocalPartDot';
		case stateAtSign: return 'stateAtSign';
		case stateFirstDomainLabel: return 'stateFirstDomainLabel';
		case stateFirstDomainLabelHyphen: return 'stateFirstDomainLabelHyphen';
		case stateDomainDot: return 'stateDomainDot';
		case stateDomainLabel: return 'stateDomainLabel';
		case stateDomainLabelHyphen: return 'stateDomainLabelHyphen';
		default: throw new Error('Unknown state in stateName() function');
	}
}