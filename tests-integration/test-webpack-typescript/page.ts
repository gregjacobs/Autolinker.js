import Autolinker, { AutolinkerConfig } from 'autolinker';

document.addEventListener('DOMContentLoaded', () => {
    const resultEl = document.getElementById('result')!;

    const options: AutolinkerConfig = { newWindow: false }; // Note: Testing that the AutolinkerConfig interface can be imported
    const linkedStr = Autolinker.link('Go to google.com', options);
    resultEl.innerHTML = linkedStr;
});
