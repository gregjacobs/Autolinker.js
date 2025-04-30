export const inputText = `
    Joe went to http://yahoo.com and http://localhost today along with http://localhost:8000.
    He also had a path on localhost: http://localhost:8000/abc, and a query string: http://localhost:8000?abc
    But who could forget about hashes like http://localhost:8000#abc
    It seems http://www.google.com is a good site, but might want to be secure with https://www.google.com
    Sometimes people just need an IP 66.102.7.147, and a port like 10.0.0.108:9000
    Capitalized URLs are interesting: HTTP://WWW.YAHOO.COM
    We all like known TLDs like yahoo.com, but shouldn't go to unknown TLDs like nowhere.etcz
    And definitely shouldn't go to abc.123
    Don't want to include periods at the end of sentences like http://yahoo.com.
    Sometimes you need to go to a path like yahoo.com/my-page
    And hit query strings like yahoo.com?page=index
    Port numbers on known TLDs are important too like yahoo.com:8000.
    Hashes too yahoo.com:8000/#some-link.
    Sometimes you need a lot of things in the URL like https://abc123def.org/path1/2path?param1=value1#hash123z
    Do you see the need for dashes in these things too https://abc-def.org/his-path/?the-param=the-value#the-hash?
    There's a time for lots and lots of special characters like in https://abc123def.org/-+&@#/%=~_()|'$*[]?!:,.;/?param1=value-+&@#/%=~_()|'$*[]?!:,.;#hash-+&@#/%=~_()|'$*[]?!:,.;z
    Don't forget about good times with unicode https://ru.wikipedia.org/wiki/Кириллица?Кириллица=1#Кириллица
    and this unicode http://россия.рф
    along with punycode http://xn--d1acufc.xn--p1ai
    Oh good old www links like www.yahoo.com
    Someone's email is likely asdf@asdf.com.
    Hashtags like #coding are fun
    Mentions like @coding too
    But what about phone numbers like +1(123)456-7890

    <!-- Some already-linked HTML -->
    Joe went to <a href="http://yahoo.com">yahoo.com</a> and <a href="http://localhost">localhost</a> today along with <a href="http://localhost:8000">localhost:8000</a>.
    He also had a path on localhost: <a href="http://localhost:8000/abc">localhost:8000/abc</a>, and a query string: <a href="http://localhost:8000?abc">localhost:8000?abc</a>
    But who could forget about hashes like <a href="http://localhost:8000#abc">localhost:8000#abc</a>
    It seems <a href="http://www.google.com">www.google.com</a> is a good site, but might want to be secure with <a href="https://www.google.com">www.google.com</a>
    Sometimes people just need an IP <a href="http://66.102.7.147">66.102.7.147</a>, and a port like <a href="http://10.0.0.108:9000">10.0.0.108:9000</a>
    Capitalized URLs are interesting: <a href="HTTP://WWW.YAHOO.COM">WWW.YAHOO.COM</a>
    We all like known TLDs like <a href="http://yahoo.com">yahoo.com</a>, but shouldn't go to unknown TLDs like sencha.etc
`;
