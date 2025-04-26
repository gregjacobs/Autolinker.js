/* global Tinytest, Autolinker */
Tinytest.add('Autolinker - phone', function (test) {
    test.equal(Autolinker.link('12345678'), '<a href="tel:12345678" target="_blank">12345678</a>');
    test.equal(
        Autolinker.link('1692089-4635'),
        '<a href="tel:1692089-4635" target="_blank">1692089-4635</a>'
    );
    test.equal(
        Autolinker.link('16920894635'),
        '<a href="tel:16920894635" target="_blank">16920894635</a>'
    );
    test.equal(
        Autolinker.link('(16)99202-4635'),
        '<a href="tel:(16)99202-4635" target="_blank">(16)99202-4635</a>'
    );
    test.equal(
        Autolinker.link('(16) 92089-4635'),
        '<a href="tel:(16) 92089-4635" target="_blank">(16) 92089-4635</a>'
    );
    test.equal(
        Autolinker.link('(15) 4343-4343'),
        '<a href="tel:(15) 4343-4343" target="_blank">(15) 4343-4343</a>'
    );
    test.equal(
        Autolinker.link('+55 15 3702-7523'),
        '+55 <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a>'
    );
    test.equal(
        Autolinker.link('(+55) 15 3702-7523'),
        '(+55) <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a>'
    );
    test.equal(
        Autolinker.link('(+55)1537027523'),
        '(+55)<a href="tel:1537027523" target="_blank">1537027523</a>'
    );
    test.equal(
        Autolinker.link('(+55)(15)3702-7523'),
        '(+55)<a href="tel:(15)3702-7523" target="_blank">(15)3702-7523</a>'
    );
    test.equal(
        Autolinker.link('(+55) 15 3702-7523'),
        '(+55) <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a>'
    );
    test.equal(
        Autolinker.link('(+55) 15 99202-7523'),
        '(+55) <a href="tel:15 99202-7523" target="_blank">15 99202-7523</a>'
    );
    test.equal(
        Autolinker.link('9202-4635'),
        '<a href="tel:9202-4635" target="_blank">9202-4635</a>'
    );
    test.equal(
        Autolinker.link('(16) 9208-4635'),
        '<a href="tel:(16) 9208-4635" target="_blank">(16) 9208-4635</a>'
    );
    test.equal(
        Autolinker.link('51-12345678'),
        '<a href="tel:51-12345678" target="_blank">51-12345678</a>'
    );
    test.equal(
        Autolinker.link('51-1234-5678'),
        '<a href="tel:51-1234-5678" target="_blank">51-1234-5678</a>'
    );

    test.equal(
        Autolinker.link('texto 12345678'),
        'texto <a href="tel:12345678" target="_blank">12345678</a>'
    );
    test.equal(
        Autolinker.link('texto 1692089-4635'),
        'texto <a href="tel:1692089-4635" target="_blank">1692089-4635</a>'
    );
    test.equal(
        Autolinker.link('texto 16920894635'),
        'texto <a href="tel:16920894635" target="_blank">16920894635</a>'
    );
    test.equal(
        Autolinker.link('texto (16)99202-4635'),
        'texto <a href="tel:(16)99202-4635" target="_blank">(16)99202-4635</a>'
    );
    test.equal(
        Autolinker.link('texto (16) 92089-4635'),
        'texto <a href="tel:(16) 92089-4635" target="_blank">(16) 92089-4635</a>'
    );
    test.equal(
        Autolinker.link('texto (15) 4343-4343'),
        'texto <a href="tel:(15) 4343-4343" target="_blank">(15) 4343-4343</a>'
    );
    test.equal(
        Autolinker.link('texto +55 15 3702-7523'),
        'texto +55 <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a>'
    );
    test.equal(
        Autolinker.link('texto (+55) 15 3702-7523'),
        'texto (+55) <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a>'
    );
    test.equal(
        Autolinker.link('texto (+55)1537027523'),
        'texto (+55)<a href="tel:1537027523" target="_blank">1537027523</a>'
    );
    test.equal(
        Autolinker.link('texto (+55)(15)3702-7523'),
        'texto (+55)<a href="tel:(15)3702-7523" target="_blank">(15)3702-7523</a>'
    );
    test.equal(
        Autolinker.link('texto (+55) 15 3702-7523'),
        'texto (+55) <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a>'
    );
    test.equal(
        Autolinker.link('texto (+55) 15 99202-7523'),
        'texto (+55) <a href="tel:15 99202-7523" target="_blank">15 99202-7523</a>'
    );
    test.equal(
        Autolinker.link('texto 9202-4635'),
        'texto <a href="tel:9202-4635" target="_blank">9202-4635</a>'
    );
    test.equal(
        Autolinker.link('texto (16) 9208-4635'),
        'texto <a href="tel:(16) 9208-4635" target="_blank">(16) 9208-4635</a>'
    );
    test.equal(
        Autolinker.link('texto 51-12345678'),
        'texto <a href="tel:51-12345678" target="_blank">51-12345678</a>'
    );
    test.equal(
        Autolinker.link('texto 51-1234-5678'),
        'texto <a href="tel:51-1234-5678" target="_blank">51-1234-5678</a>'
    );

    test.equal(
        Autolinker.link('12345678 texto'),
        '<a href="tel:12345678" target="_blank">12345678</a> texto'
    );
    test.equal(
        Autolinker.link('1692089-4635 texto'),
        '<a href="tel:1692089-4635" target="_blank">1692089-4635</a> texto'
    );
    test.equal(
        Autolinker.link('16920894635 texto'),
        '<a href="tel:16920894635" target="_blank">16920894635</a> texto'
    );
    test.equal(
        Autolinker.link('(16)99202-4635 texto'),
        '<a href="tel:(16)99202-4635" target="_blank">(16)99202-4635</a> texto'
    );
    test.equal(
        Autolinker.link('(16) 92089-4635 texto'),
        '<a href="tel:(16) 92089-4635" target="_blank">(16) 92089-4635</a> texto'
    );
    test.equal(
        Autolinker.link('(15) 4343-4343 texto'),
        '<a href="tel:(15) 4343-4343" target="_blank">(15) 4343-4343</a> texto'
    );
    test.equal(
        Autolinker.link('+55 15 3702-7523 texto'),
        '+55 <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a> texto'
    );
    test.equal(
        Autolinker.link('(+55) 15 3702-7523 texto'),
        '(+55) <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a> texto'
    );
    test.equal(
        Autolinker.link('(+55)1537027523 texto'),
        '(+55)<a href="tel:1537027523" target="_blank">1537027523</a> texto'
    );
    test.equal(
        Autolinker.link('(+55)(15)3702-7523 texto'),
        '(+55)<a href="tel:(15)3702-7523" target="_blank">(15)3702-7523</a> texto'
    );
    test.equal(
        Autolinker.link('(+55) 15 3702-7523 texto'),
        '(+55) <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a> texto'
    );
    test.equal(
        Autolinker.link('(+55) 15 99202-7523 texto'),
        '(+55) <a href="tel:15 99202-7523" target="_blank">15 99202-7523</a> texto'
    );
    test.equal(
        Autolinker.link('9202-4635 texto'),
        '<a href="tel:9202-4635" target="_blank">9202-4635</a> texto'
    );
    test.equal(
        Autolinker.link('(16) 9208-4635 texto'),
        '<a href="tel:(16) 9208-4635" target="_blank">(16) 9208-4635</a> texto'
    );
    test.equal(
        Autolinker.link('51-12345678 texto'),
        '<a href="tel:51-12345678" target="_blank">51-12345678</a> texto'
    );
    test.equal(
        Autolinker.link('51-1234-5678 texto'),
        '<a href="tel:51-1234-5678" target="_blank">51-1234-5678</a> texto'
    );

    test.equal(
        Autolinker.link('texto 12345678 texto'),
        'texto <a href="tel:12345678" target="_blank">12345678</a> texto'
    );
    test.equal(
        Autolinker.link('texto 1692089-4635 texto'),
        'texto <a href="tel:1692089-4635" target="_blank">1692089-4635</a> texto'
    );
    test.equal(
        Autolinker.link('texto 16920894635 texto'),
        'texto <a href="tel:16920894635" target="_blank">16920894635</a> texto'
    );
    test.equal(
        Autolinker.link('texto (16)99202-4635 texto'),
        'texto <a href="tel:(16)99202-4635" target="_blank">(16)99202-4635</a> texto'
    );
    test.equal(
        Autolinker.link('texto (16) 92089-4635 texto'),
        'texto <a href="tel:(16) 92089-4635" target="_blank">(16) 92089-4635</a> texto'
    );
    test.equal(
        Autolinker.link('texto (15) 4343-4343 texto'),
        'texto <a href="tel:(15) 4343-4343" target="_blank">(15) 4343-4343</a> texto'
    );
    test.equal(
        Autolinker.link('texto +55 15 3702-7523 texto'),
        'texto +55 <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a> texto'
    );
    test.equal(
        Autolinker.link('texto (+55) 15 3702-7523 texto'),
        'texto (+55) <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a> texto'
    );
    test.equal(
        Autolinker.link('texto (+55)1537027523 texto'),
        'texto (+55)<a href="tel:1537027523" target="_blank">1537027523</a> texto'
    );
    test.equal(
        Autolinker.link('texto (+55)(15)3702-7523 texto'),
        'texto (+55)<a href="tel:(15)3702-7523" target="_blank">(15)3702-7523</a> texto'
    );
    test.equal(
        Autolinker.link('texto (+55) 15 3702-7523 texto'),
        'texto (+55) <a href="tel:15 3702-7523" target="_blank">15 3702-7523</a> texto'
    );
    test.equal(
        Autolinker.link('texto (+55) 15 99202-7523 texto'),
        'texto (+55) <a href="tel:15 99202-7523" target="_blank">15 99202-7523</a> texto'
    );
    test.equal(
        Autolinker.link('texto 9202-4635 texto'),
        'texto <a href="tel:9202-4635" target="_blank">9202-4635</a> texto'
    );
    test.equal(
        Autolinker.link('texto (16) 9208-4635 texto'),
        'texto <a href="tel:(16) 9208-4635" target="_blank">(16) 9208-4635</a> texto'
    );
    test.equal(
        Autolinker.link('texto 51-12345678 texto'),
        'texto <a href="tel:51-12345678" target="_blank">51-12345678</a> texto'
    );
    test.equal(
        Autolinker.link('texto 51-1234-5678 texto'),
        'texto <a href="tel:51-1234-5678" target="_blank">51-1234-5678</a> texto'
    );
});
