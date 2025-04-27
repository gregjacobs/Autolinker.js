import { expect } from 'chai';
import { HtmlTag } from '../src/html-tag';

describe('Autolinker.HtmlTag', function () {
    it('should be able to be instantiated with no arguments', function () {
        expect(function () {
            new HtmlTag();
        }).to.not.throw();
    });

    it('should be able to be configured via the config options', function () {
        const tag = new HtmlTag({
            tagName: 'a',
            attrs: { attr1: 'value1', attr2: 'value2' },
            innerHtml: 'Hello',
        });

        expect(tag.getTagName()).to.equal('a');
        expect(tag.getAttrs()).to.deep.equal({ attr1: 'value1', attr2: 'value2' });
        expect(tag.getAttr('attr1')).to.equal('value1');
        expect(tag.getAttr('attr2')).to.equal('value2');
        expect(tag.getInnerHtml()).to.equal('Hello');
    });

    it('should be able to be configured via setters', function () {
        const tag = new HtmlTag();
        tag.setTagName('a');
        tag.setAttrs({ attr1: 'value1', attr2: 'value2' });
        tag.setInnerHtml('Hello');

        expect(tag.getTagName()).to.equal('a');
        expect(tag.getAttrs()).to.deep.equal({ attr1: 'value1', attr2: 'value2' });
        expect(tag.getAttr('attr1')).to.equal('value1');
        expect(tag.getAttr('attr2')).to.equal('value2');
        expect(tag.getInnerHtml()).to.equal('Hello');
    });

    describe('setTagName()', function () {
        it('should set, and override, the tag name', function () {
            const tag = new HtmlTag();

            tag.setTagName('a');
            expect(tag.getTagName()).to.equal('a');

            tag.setTagName('button');
            expect(tag.getTagName()).to.equal('button');
        });

        it('should return a reference to the HtmlTag instance, to allow method chaining', function () {
            const tag = new HtmlTag();

            expect(tag.setTagName('a')).to.equal(tag); // return value should be the HtmlTag itself
        });
    });

    describe('setAttr()', function () {
        it('should set, then override, attribute properties', function () {
            const tag = new HtmlTag();

            tag.setAttr('attr1', 'value1'); // note: this call should lazily instantiate the `attrs` map
            tag.setAttr('attr2', 'value2');
            expect(tag.getAttrs()).to.deep.equal({
                attr1: 'value1',
                attr2: 'value2',
            });

            tag.setAttr('attr1', '42');
            expect(tag.getAttrs()).to.deep.equal({ attr1: '42', attr2: 'value2' });
        });

        it('should return a reference to the HtmlTag instance, to allow method chaining', function () {
            const tag = new HtmlTag();

            expect(tag.setAttr('href', 'test')).to.equal(tag); // return value should be the HtmlTag itself
        });
    });

    describe('setAttrs()', function () {
        it('should set, then override, attribute properties', function () {
            const tag = new HtmlTag();

            tag.setAttrs({ attr1: 'value1', attr2: 'value2' }); // note: this call should lazily instantiate the `attrs` map
            expect(tag.getAttrs()).to.deep.equal({
                attr1: 'value1',
                attr2: 'value2',
            });

            tag.setAttrs({ attr1: '42' });
            expect(tag.getAttrs()).to.deep.equal({ attr1: '42', attr2: 'value2' });
        });

        it('should return a reference to the HtmlTag instance, to allow method chaining', function () {
            const tag = new HtmlTag();

            expect(tag.setAttrs({ href: 'test' })).to.equal(tag); // return value should be the HtmlTag itself
        });
    });

    describe('setClass()', function () {
        let tag: HtmlTag;

        beforeEach(function () {
            tag = new HtmlTag();
        });

        it('should set the CSS class to the tag when there are none yet', function () {
            tag.setClass('test');

            expect(tag.getClass()).to.equal('test');
        });

        it('should overwrite the current CSS classes on the tag', function () {
            tag.setClass('test');
            tag.setClass('test_override');

            expect(tag.getClass()).to.equal('test_override');
        });

        it('should return a reference to the HtmlTag instance, to allow method chaining', function () {
            expect(tag.setClass('test')).to.equal(tag); // return value should be the HtmlTag itself
        });
    });

    describe('addClass()', function () {
        let tag: HtmlTag;

        beforeEach(function () {
            tag = new HtmlTag();
        });

        it('should add a CSS class to the tag when there are none yet', function () {
            tag.addClass('test');
            expect(tag.getClass()).to.equal('test');
        });

        it('should add multiple CSS classes to the tag when there are none yet', function () {
            tag.addClass('test1 test2');
            expect(tag.getClass()).to.equal('test1 test2');
        });

        it('should add a CSS class to existing CSS classes', function () {
            tag.addClass('test1');
            tag.addClass('test2');

            expect(tag.getClass()).to.equal('test1 test2');
        });

        it('should add multiple CSS classes to existing CSS classes', function () {
            tag.addClass('test1 test2');
            tag.addClass('test3 test4');

            expect(tag.getClass()).to.equal('test1 test2 test3 test4');
        });

        it('should not add duplicate CSS classes to the tag', function () {
            tag.addClass('test1 test2');
            tag.addClass('test1 test3 test4 test4');

            expect(tag.getClass()).to.equal('test1 test2 test3 test4');
        });

        it('should return a reference to the HtmlTag instance, to allow method chaining', function () {
            expect(tag.addClass('test')).to.equal(tag); // return value should be the HtmlTag itself
        });
    });

    describe('removeClass()', function () {
        let tag: HtmlTag;

        beforeEach(function () {
            tag = new HtmlTag();
        });

        it('should have no effect when removing a CSS class from an HtmlTag with no CSS classes', function () {
            expect(function () {
                tag.removeClass('test'); // simply make sure an error isn't thrown
            }).to.not.throw();
        });

        it('should remove a single CSS class from the HtmlTag', function () {
            tag.addClass('test1 test2 test3 test4');
            tag.removeClass('test1');

            expect(tag.getClass()).to.equal('test2 test3 test4');
        });

        it('should remove multiple CSS classes from the HtmlTag', function () {
            tag.addClass('test1 test2 test3 test4');
            tag.removeClass('test1 test3');

            expect(tag.getClass()).to.equal('test2 test4');
        });

        it('should return a reference to the HtmlTag instance, to allow method chaining', function () {
            expect(tag.removeClass('test')).to.equal(tag); // return value should be the HtmlTag itself
        });
    });

    describe('getClass()', function () {
        it('should return an empty string when there are no CSS classes on the HtmlTag', function () {
            const tag = new HtmlTag();

            expect(tag.getClass()).to.equal('');
        });

        it('should return the CSS classes configured on the HtmlTag', function () {
            const tag = new HtmlTag({
                attrs: { class: 'test1 test2' },
            });

            expect(tag.getClass()).to.equal('test1 test2');
        });

        it('should return the CSS classes set using addClass()', function () {
            const tag = new HtmlTag();
            tag.addClass('test1 test2');

            expect(tag.getClass()).to.equal('test1 test2');
        });
    });

    describe('hasClass()', function () {
        let tag: HtmlTag;

        beforeEach(function () {
            tag = new HtmlTag();
        });

        it('should return `false` when there are no CSS classes on the HtmlTag', function () {
            expect(tag.hasClass('test')).to.equal(false);
        });

        it('should return `true` for a CSS class that exists on the HtmlTag', function () {
            tag.addClass('test');

            expect(tag.hasClass('test')).to.equal(true);
        });

        it('should return `true` for a CSS class that exists on the HtmlTag, when there are multiple CSS classes', function () {
            tag.addClass('test1 test2');

            expect(tag.hasClass('test1')).to.equal(true);
            expect(tag.hasClass('test2')).to.equal(true);
            expect(tag.hasClass('test3')).to.equal(false);
        });

        it('should return `false` for a CSS class that is a substring of a CSS class on the HtmlTag', function () {
            tag.addClass('longCssClass');

            expect(tag.hasClass('longCss')).to.equal(false);
        });
    });

    describe('setInnerHtml()', function () {
        it("should set, then override, the tag's inner HTML", function () {
            const tag = new HtmlTag();

            tag.setInnerHtml('test');
            expect(tag.getInnerHtml()).to.equal('test');

            tag.setInnerHtml('test2');
            expect(tag.getInnerHtml()).to.equal('test2');
        });

        it('should return a reference to the HtmlTag instance, to allow method chaining', function () {
            const tag = new HtmlTag();

            expect(tag.setInnerHtml('test')).to.equal(tag); // return value should be the HtmlTag itself
        });
    });

    describe('getInnerHtml()', function () {
        it('should return an empty string if no inner HTML has been set', function () {
            const tag = new HtmlTag();

            expect(tag.getInnerHtml()).to.equal('');
        });

        it('should return the inner HTML set during construction', function () {
            const tag = new HtmlTag({ innerHtml: 'test' });

            expect(tag.getInnerHtml()).to.equal('test');
        });

        it('should return the inner HTML set with setInnerHtml()', function () {
            const tag = new HtmlTag();
            tag.setInnerHtml('test');

            expect(tag.getInnerHtml()).to.equal('test');
        });
    });

    describe('toAnchorString()', function () {
        it('should populate only the tag name when no attribute are set, and no inner HTML is set', function () {
            const tag = new HtmlTag({
                tagName: 'a',
            });

            expect(tag.toAnchorString()).to.equal('<a></a>');
        });

        it('should populate only the tag name and inner HTML when no attribute are set', function () {
            const tag = new HtmlTag({
                tagName: 'a',
                innerHtml: 'My Site',
            });

            expect(tag.toAnchorString()).to.equal('<a>My Site</a>');
        });

        it('should populate both the tag name and attributes when set', function () {
            const tag = new HtmlTag({
                tagName: 'a',
                attrs: { href: 'http://path/to/site', rel: 'nofollow' },
            });

            expect(tag.toAnchorString()).to.equal(
                '<a href="http://path/to/site" rel="nofollow"></a>'
            );
        });

        it('should populate all 3: tag name, attributes, and inner HTML when set', function () {
            const tag = new HtmlTag({
                tagName: 'a',
                attrs: { href: 'http://path/to/site', rel: 'nofollow' },
                innerHtml: 'My Site',
            });

            expect(tag.toAnchorString()).to.equal(
                '<a href="http://path/to/site" rel="nofollow">My Site</a>'
            );
        });

        it('should properly build an HTML string from just the mutator methods', function () {
            const tag = new HtmlTag();
            tag.setTagName('a');
            tag.addClass('test');
            tag.addClass('test2');
            tag.setAttr('href', 'http://path/to/site');
            tag.setInnerHtml('My Site');

            expect(tag.toAnchorString()).to.equal(
                '<a class="test test2" href="http://path/to/site">My Site</a>'
            );
        });
    });
});
