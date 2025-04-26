import Autolinker from '../src/autolinker';

describe('Matching behavior within HTML >', () => {
    const autolinker = new Autolinker({
        urls: true,
        email: true,
        phone: true,
        mention: 'instagram',
        hashtag: 'instagram',

        newWindow: false, // so that target="_blank" is not added to resulting autolinked URLs - makes it easier to test the resulting strings
        stripPrefix: {
            www: false, // for the purposes of the generated tests, leaving this as false makes it easier to automatically create the 'expected' values
        },
    });

    it(`should autolink URLs/emails/etc. found within HTML`, () => {
        const result = autolinker.link(`
            <html>
                <body>
                    <div>Hello, this is a test. Visit http://example.com for more info.</div>
                    <div>Contact us at hello@example.com</div>
                    <div>Our hashtag is #example</div>
                    <div>Our mention is @example</div>
                    <div>Our phone number is 123-456-7890</div>
                </body>
            </html>
        `);

        expect(result).toBe(`
            <html>
                <body>
                    <div>Hello, this is a test. Visit <a href="http://example.com">example.com</a> for more info.</div>
                    <div>Contact us at <a href="mailto:hello@example.com">hello@example.com</a></div>
                    <div>Our hashtag is <a href="https://instagram.com/explore/tags/example">#example</a></div>
                    <div>Our mention is <a href="https://instagram.com/example">@example</a></div>
                    <div>Our phone number is <a href="tel:1234567890">123-456-7890</a></div>
                </body>
            </html>
        `);
    });

    it(`should NOT link URLs/emails/etc. that are already part of <a> tags`, () => {
        const input = `
            <html>
                <body>
                    <div>Hello, this is a test. Visit <a href="http://example.com">example.com</a> for more info.</div>
                    <div>Contact us at <a href="mailto:hello@example.com">hello@example.com</a></div>
                    <div>Our hashtag is <a href="https://instagram.com/explore/tags/example">#example</a></div>
                    <div>Our mention is <a href="https://instagram.com/example">@example</a></div>
                    <div>Our phone number is <a href="tel:1234567890">123-456-7890</a></div>
                </body>
            </html>
        `;

        const result = autolinker.link(input);
        expect(result).toBe(input); // no changes should be made
    });

    it(`should NOT link URLs/emails/etc. that are inside of <script> tags`, () => {
        const input = `
            <html>
                <body>
                    <script>
                        const url = 'http://example.com';
                        const email = 'hello@example.com';
                        const hashtag = '#example';
                        const mention = '@example';
                        const phone = '123-456-7890';

                        console.log(url, email, hashtag, mention, phone);
                    </script>
                    <div>Hello, this is a test.</div>
                </body>
            </html>
        `;

        const result = autolinker.link(input);
        expect(result).toBe(input); // no changes should be made
    });

    it(`should NOT link URLs/emails/etc. that are inside of <style> tags`, () => {
        const input = `
            <html>
                <body>
                    <style>
                        /* urls */
                        .class-1 {
                            background: url('http://example.com');
                        }

                        /* emails */
                        .class-2 {
                            content: "hello@example.com";
                        }

                        /* hashtags */
                        .class-3 {
                            color: #efabcd;
                        }

                        /* mentions */
                        .class-4 {
                            content: "@example";
                        }

                        /* phone numbers */
                        .class-5 {
                            content: "123-456-7890";
                        }
                    </style>

                    <div>Hello, this is a test.</div>
                </body>
            </html>
        `;

        const result = autolinker.link(input);
        expect(result).toBe(input); // no changes should be made
    });
});
