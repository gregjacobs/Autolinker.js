import Autolinker, { AutolinkerConfig } from 'autolinker';

document.addEventListener( 'DOMContentLoaded', () => {
	var resultEl = document.getElementById( 'result' )!;
	
	var options: AutolinkerConfig = { newWindow: false };  // Note: Testing that the AutolinkerConfig interface can be imported
	var linkedStr = Autolinker.link( 'Go to google.com', options );
	resultEl.innerHTML = linkedStr;
} );