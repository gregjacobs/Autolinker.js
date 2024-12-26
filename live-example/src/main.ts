import { Autolinker } from '../../src';
import { Option } from './Option';
import { CheckboxOption } from './CheckboxOption';
import { RadioOption } from './RadioOption';
import { TextOption } from './TextOption';

$(document).ready(function () {
    $('#version').text(Autolinker.version);

    var $inputEl = $('#input'),
        $outputEl = $('#output'),
        $optionsOutputEl = $('#options-output'),
        urlsSchemeOption: Option,
        urlsTldOption: Option,
        urlsIpV4Option: Option,
        emailOption: Option,
        phoneOption: Option,
        mentionOption: Option,
        hashtagOption: Option,
        newWindowOption: Option,
        stripPrefixOption: Option,
        stripTrailingSlashOption: Option,
        truncateLengthOption: Option,
        truncationLocationOption: Option,
        classNameOption: Option;

    init();

    function init() {
        urlsSchemeOption = new CheckboxOption({
            name: 'urls.schemeMatches',
            description: 'Scheme:// URLs',
            defaultValue: true,
        }).onChange(autolink);

        urlsTldOption = new CheckboxOption({
            name: 'urls.tldMatches',
            description: 'TLD URLs',
            defaultValue: true,
        }).onChange(autolink);

        urlsIpV4Option = new CheckboxOption({
            name: 'urls.ipV4Matches',
            description: 'IPv4 URLs',
            defaultValue: true,
        }).onChange(autolink);

        emailOption = new CheckboxOption({
            name: 'email',
            description: 'Email Addresses',
            defaultValue: true,
        }).onChange(autolink);

        phoneOption = new CheckboxOption({
            name: 'phone',
            description: 'Phone Numbers',
            defaultValue: true,
        }).onChange(autolink);

        mentionOption = new RadioOption({
            name: 'mention',
            description: 'Mentions',
            options: [false, 'twitter', 'instagram', 'soundcloud', 'tiktok'],
            defaultValue: false,
        }).onChange(autolink);

        hashtagOption = new RadioOption({
            name: 'hashtag',
            description: 'Hashtags',
            options: [false, 'twitter', 'facebook', 'instagram', 'tiktok', 'youtube'],
            defaultValue: false,
        }).onChange(autolink);

        newWindowOption = new CheckboxOption({
            name: 'newWindow',
            description: 'Open in new window',
            defaultValue: true,
        }).onChange(autolink);

        stripPrefixOption = new CheckboxOption({
            name: 'stripPrefix',
            description: 'Strip prefix',
            defaultValue: true,
        }).onChange(autolink);

        stripTrailingSlashOption = new CheckboxOption({
            name: 'stripTrailingSlash',
            description: 'Strip trailing slash',
            defaultValue: true,
        }).onChange(autolink);

        truncateLengthOption = new TextOption({
            name: 'truncate.length',
            description: 'Truncate Length',
            size: 2,
            defaultValue: '0',
        }).onChange(autolink);

        truncationLocationOption = new RadioOption({
            name: 'truncate.location',
            description: 'Truncate Location',
            options: ['end', 'middle', 'smart'],
            defaultValue: 'end',
        }).onChange(autolink);

        classNameOption = new TextOption({
            name: 'className',
            description: 'CSS class(es)',
            size: 10,
        }).onChange(autolink);

        $inputEl.on('keyup change', autolink);

        $inputEl.on('scroll', syncOutputScroll);
        $outputEl.on('scroll', syncInputScroll);

        // Perform initial autolinking
        autolink();
    }

    function autolink() {
        var inputText = ($inputEl.val() as string).replace(/\n/g, '<br>'),
            optionsObj = createAutolinkerOptionsObj(),
            linkedHtml = Autolinker.link(inputText, optionsObj);

        $optionsOutputEl.html(createCodeSample(optionsObj));
        $outputEl.html(linkedHtml);
    }

    function createAutolinkerOptionsObj() {
        return {
            urls: {
                schemeMatches: urlsSchemeOption.getValue(),
                tldMatches: urlsTldOption.getValue(),
                ipV4Matches: urlsIpV4Option.getValue(),
            },
            email: emailOption.getValue(),
            phone: phoneOption.getValue(),
            mention: mentionOption.getValue(),
            hashtag: hashtagOption.getValue(),

            newWindow: newWindowOption.getValue(),
            stripPrefix: stripPrefixOption.getValue(),
            stripTrailingSlash: stripTrailingSlashOption.getValue(),
            className: classNameOption.getValue(),
            truncate: {
                length: +truncateLengthOption.getValue(),
                location: truncationLocationOption.getValue(),
            },
        };
    }

    function createCodeSample(optionsObj: any) {
        return [
            `var autolinker = new Autolinker( {`,
            `    urls : {`,
            `        schemeMatches : ${optionsObj.urls.schemeMatches},`,
            `        tldMatches    : ${optionsObj.urls.tldMatches}`,
            `        ipV4Matches   : ${optionsObj.urls.ipV4Matches},`,
            `    },`,
            `    email       : ${optionsObj.email},`,
            `    phone       : ${optionsObj.phone},`,
            `    mention     : ${
                typeof optionsObj.mention === 'string'
                    ? "'" + optionsObj.mention + "'"
                    : optionsObj.mention
            },`,
            `    hashtag     : ${
                typeof optionsObj.hashtag === 'string'
                    ? "'" + optionsObj.hashtag + "'"
                    : optionsObj.hashtag
            },`,
            ``,
            `    stripPrefix : ${optionsObj.stripPrefix},`,
            `    stripTrailingSlash : ${optionsObj.stripTrailingSlash},`,
            `    newWindow   : ${optionsObj.newWindow},`,
            ``,
            `    truncate : {`,
            `        length   : ${optionsObj.truncate.length},`,
            `        location : '${optionsObj.truncate.location}'`,
            `    },`,
            ``,
            `    className : '${optionsObj.className}'`,
            `} );`,
            ``,
            `var myLinkedHtml = autolinker.link( myText );`,
        ].join('\n');
    }

    function syncInputScroll() {
        $inputEl.scrollTop($outputEl.scrollTop()!);
    }

    function syncOutputScroll() {
        $outputEl.scrollTop($inputEl.scrollTop()!);
    }
});
