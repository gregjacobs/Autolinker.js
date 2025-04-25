import puppeteer, { Browser, Page } from 'puppeteer';

describe('Autolinker.js UMD file in browser', function () {
    let browser: Browser;
    let page: Page;

    beforeAll(async () => {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        page = await browser.newPage();

        // Print errors from the page
        page.on('console', (msg: any) => console.log('PAGE LOG:', msg.text()));
        page.on('pageerror', (err: Error) => console.error(err));

        const url = `file://${__dirname}/test-browser-umd.html`;
        const response = await page.goto(url, { waitUntil: 'load' });
        if (!response || !response.ok()) {
            throw new Error(`Failed to load ${url}. Error: ${response?.toString()}`);
        }
    });

    afterAll(async () => {
        await browser.close();
    });

    it('should have the `window.Autolinker` global, and Autolinker should work', async () => {
        const innerHTML = await page.evaluate(() => {
            return (document as any).querySelector('#result').innerHTML.trim();
        });

        expect(innerHTML).toBe('Go to <a href="http://google.com">google.com</a>');
    });
});
