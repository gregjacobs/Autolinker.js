export const inputText = `
    Joe went to <a href="http://yahoo.com">yahoo.com</a> and <a href="http://localhost">localhost</a> today along with <a href="http://localhost:8000">localhost:8000</a>.
    He also had a path on localhost: <a href="http://localhost:8000/abc">localhost:8000/abc</a>, and a query string: <a href="http://localhost:8000?abc">localhost:8000?abc</a>
    But who could forget about hashes like <a href="http://localhost:8000#abc">localhost:8000#abc</a>
    It seems <a href="http://www.google.com">www.google.com</a> is a good site, but might want to be secure with <a href="https://www.google.com">www.google.com</a>
    Sometimes people just need an IP <a href="http://66.102.7.147">66.102.7.147</a>, and a port like <a href="http://10.0.0.108:9000">10.0.0.108:9000</a>
    Capitalized URLs are interesting: <a href="HTTP://WWW.YAHOO.COM">WWW.YAHOO.COM</a>
    We all like known TLDs like <a href="http://yahoo.com">yahoo.com</a>, but shouldn't go to unknown TLDs like sencha.etc
    And definitely shouldn't go to abc.123
    Don't want to include periods at the end of sentences like <a href="http://yahoo.com">yahoo.com</a>.
    Sometimes you need to go to a path like <a href="http://yahoo.com/my-page">yahoo.com/my-page</a>
    And hit query strings like <a href="http://yahoo.com?page=index">yahoo.com?page=index</a>
    Port numbers on known TLDs are important too like <a href="http://yahoo.com:8000">yahoo.com:8000</a>.
    Hashes too <a href="http://yahoo.com:8000/#some-link">yahoo.com:8000/#some-link</a>.
    Sometimes you need a lot of things in the URL like <a href="https://abc123def.org/path1/2path?param1=value1#hash123z">abc123def.org/path1/2path?param1=value1#hash123z</a>
    Do you see the need for dashes in these things too <a href="https://abc-def.org/his-path/?the-param=the-value#the-hash">abc-def.org/his-path/?the-param=the-value#the-hash</a>?
    There's a time for lots and lots of special characters like in <a href="https://abc123def.org/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z">abc123def.org/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z</a>
    Don't forget about good times with unicode <a href="https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица">ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица</a>
    and this unicode <a href="http://россия.рф">россия.рф</a>
    along with punycode <a href="http://xn--d1acufc.xn--p1ai">xn--d1acufc.xn--p1ai</a>
    Oh good old www links like <a href="http://www.yahoo.com">www.yahoo.com</a>
`;
