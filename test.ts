import { alphaNumericAndMarksCharsStr, domainNameCharRegex } from "./src/regex-lib";
import { tldRegex } from './src/matcher/tld-regex';
import { EmailMatch } from './src/match/email-match';

class State {
	private edges: [RegExp, State, boolean][] = [];

	constructor(
		public accepting = false
	) {}

	public on(char: RegExp, nextState: State, invalidatesLastMatch = false): this {
		this.edges.push([char, nextState, invalidatesLastMatch]);
		return this;
	}

	// public acceptStrings(
	// 	strings: string[], 
	// 	backupEdges: { on: string | RegExp, nextState: State }[]
	// ): this {
	// 	const str = strings[0];
	// 	let currentState: State = this;

	// 	for (let idx = 0, len = str.length; idx < len; idx++) {
	// 		const char = str.charAt(idx);
	// 		const shouldAccept = idx === len - 1;  // last char accepts

	// 		let nextState = currentState.nextState(char);
	// 		if (!nextState) {
	// 			nextState = new State(shouldAccept);
	// 		} else {
	// 			if (!nextState.accepting && shouldAccept) {
	// 				nextState.accepting = true;
	// 			}
	// 		}
	// 		currentState = nextState;
	// 	}

	// 	return this;
	// }

	public nextState(char: string): {nextState: State | undefined, invalidatesLastMatch: boolean } {
		for (const edge of this.edges) {
			const [testCharOrRegex, nextState, invalidatesLastMatch] = edge;

			if (testCharOrRegex.test(char)) return { nextState, invalidatesLastMatch };
		}
		return { nextState: undefined, invalidatesLastMatch: false };
	}
}

/**
 * A specialized State class which, given a list of strings, creates states for
 * each character in those strings, and only accepts the input if the last 
 * character of the strings are hit.
 */
// class TrieState {
// 	constructor(
// 		public readonly accepting = false
// 	) {}

// 	public on(char: string | RegExp, nextState: State): this {
// 		this.edges.push([char, nextState]);
// 		return this;
// 	}

// 	public nextState(char: string): State | undefined {
// 		for (const edge of this.edges) {
// 			const [testCharOrRegex, nextState] = edge;

// 			if (typeof testCharOrRegex === 'string') {
// 				if (testCharOrRegex === char) return nextState;
// 			} else {
// 				if (testCharOrRegex.test(char)) return nextState;
// 			}
// 		}
// 	}
// }

// class TrieNode {

// }

const localPartCharRegex = new RegExp( `[${alphaNumericAndMarksCharsStr}!#$%&'*+/=?^_\`{|}~-]` );

const stateNonEmail = new State();  // starting state
const stateLocalPart = new State();
const stateLocalPartDot = new State();
const stateAtSign = new State();
const stateFirstDomainLabel = new State();
const stateFirstDomainLabelHyphen = new State();
const stateDomainDot = new State();
const stateDomainLabel = new State(true);
const stateDomainLabelHyphen = new State();

const dot = /\./;
const at = /@/;
const hyphen = /-/;

stateNonEmail
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
	//.on(/c/, stateC)
	// .acceptStrings(['com'], [
	// 	{ on: domainNameCharRegex, nextState: stateDomainLabel }
	// ])
	.on(dot, stateNonEmail)  // Not valid to have two dots ('..')
	.on(hyphen, stateNonEmail)  // Not valid to have dot+hyphen ('.-')
	.on(domainNameCharRegex, stateDomainLabel);

// const stateC = new State();
// const stateO = new State();
// const stateM = new State(true);

// stateC
// 	.on(/o/, stateO)
// 	.on(dot, stateDomainDot)
// 	.on(hyphen, stateDomainLabelHyphen)
// 	.on(domainNameCharRegex, stateDomainLabel, true);

// stateO
// 	.on(/m/, stateM)
// 	.on(dot, stateDomainDot)
// 	.on(hyphen, stateDomainLabelHyphen)
// 	.on(domainNameCharRegex, stateDomainLabel, true);

// stateM
// 	.on(dot, stateDomainDot)
// 	.on(hyphen, stateDomainLabelHyphen)
// 	.on(domainNameCharRegex, stateDomainLabel, true);


console.log(`Matches: '${matches('11abc1 asdf@asdf.com asdfadsf fdsa@fdas.com asdf', stateNonEmail)}'`);

function matches(str: string, startingState: State): string[] {
	const matches: string[] = [];

	let state: State = startingState;
	let matchStartIdx = 0;
	let lastAcceptingCharIdx = -1;

	for (let charIdx = 0, len = str.length; charIdx < len; charIdx++) {
		const char = str.charAt(charIdx);

		const { nextState, invalidatesLastMatch } = state.nextState(char) || startingState;
		state = nextState || startingState;
		if (invalidatesLastMatch) lastAcceptingCharIdx = -1;

		if (state === startingState) {
			if (lastAcceptingCharIdx !== -1) {
				matches.push(str.substring(matchStartIdx, lastAcceptingCharIdx + 1));
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
	if (state !== startingState && lastAcceptingCharIdx !== -1) {
		matches.push(str.substring(matchStartIdx, lastAcceptingCharIdx + 1));
	}

	return matches;
}

function firstMatch(str: string, startingState: State): string {
	let state: State = startingState;
	let matchStartIdx = 0;
	let lastAcceptingCharIdx = -1;

	for (let charIdx = 0, len = str.length; charIdx < len; charIdx++) {
		const char = str.charAt(charIdx);

		const { nextState, invalidatesLastMatch } = state.nextState(char) || startingState;
		state = nextState || startingState;
		if (invalidatesLastMatch) lastAcceptingCharIdx = -1;

		if (state === startingState) {
			if (lastAcceptingCharIdx !== -1) {
				return str.substring(matchStartIdx, lastAcceptingCharIdx + 1);
			}
			state = stateNonEmail;
			matchStartIdx = charIdx + 1;
		} else {
			if (state.accepting) {
				lastAcceptingCharIdx = charIdx;
			}
		}

	}

	return str.substring(matchStartIdx, lastAcceptingCharIdx + 1);
}
