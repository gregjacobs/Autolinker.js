import { expect } from 'chai';
import puppeteer, { Browser, Page } from 'puppeteer';

describe('Webpack build with TypeScript in a browser', function () {
    let browser: Browser;
    let page: Page;

    before(async () => {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        page = await browser.newPage();

        // Print errors from the page
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', (err: Error) => console.error(err));

        await page.goto(`file://${__dirname}/webpack-output/index.html`, {
            waitUntil: 'load',
        });
    });

    after(async () => {
        await browser.close();
    });

    it('Autolinker should work', async () => {
        const innerHTML = await page.evaluate(() => {
            return document.querySelector('#result')!.innerHTML.trim();
        });

        expect(innerHTML).to.equal('Go to <a href="http://google.com">google.com</a>');
    });
});
