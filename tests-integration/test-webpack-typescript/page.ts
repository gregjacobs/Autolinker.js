import Autolinker from 'autolinker';

document.addEventListener( 'DOMContentLoaded', () => {
	var resultEl = document.getElementById( 'result' )!;
	
	var linkedStr = Autolinker.link( 'Go to google.com', { newWindow: false } );
	resultEl.innerHTML = linkedStr;
} );