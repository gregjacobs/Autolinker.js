import { expect } from 'chai';
import fs from 'fs';
import puppeteer, { Browser, Page } from 'puppeteer';

describe('Autolinker.js UMD file in browser', function () {
    let browser: Browser;
    let page: Page;

    before(async () => {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        page = await browser.newPage();

        // Print errors from the page
        page.on('console', msg => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', (err: Error) => console.error(err));

        const pathToHtmlFile = `${__dirname}/test-browser-umd.html`;
        if (!fs.existsSync(pathToHtmlFile)) {
            throw new Error(
                `The test-browser-umd.html file was not found at path: '${pathToHtmlFile}'`
            );
        }

        const url = `file://${pathToHtmlFile}`;
        const response = await page.goto(url, { waitUntil: 'load' });
        if (!response || !response.ok()) {
            throw new Error(`Failed to load url ${url}. Response status: ${response?.status()}`);
        }
    });

    after(async () => {
        await browser.close();
    });

    it('should have the `window.Autolinker` global, and Autolinker should work', async () => {
        const innerHTML = await page.evaluate(() => {
            return document.querySelector('#result')!.innerHTML.trim();
        });

        expect(innerHTML).to.equal('Go to <a href="http://google.com">google.com</a>');
    });
});
