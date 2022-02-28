import { Autolinker } from '../../src';

export const App: React.FC = () => {
    return <>
        <div className="container">
            <h1>
                <a className="title-link" href="https://github.com/gregjacobs/Autolinker.js" target="_top">Autolinker</a>
                <small>v{Autolinker.version} - Live Example</small>
            </h1>

            Type text on the left and see the output on the right. For full
            match/options reference, see the
            <a href="http://gregjacobs.github.io/Autolinker.js/api/#!/api/Autolinker" target="_top">API Docs</a>

            <div className="row pt10">
                <div className="col-lg-4 col-sm-6">
                    <h4>Match Types:</h4>
                    <div id="option-urls-schemeMatches"></div>
                    <div id="option-urls-wwwMatches"></div>
                    <div id="option-urls-tldMatches"></div>
                    <div id="option-email"></div>
                    <div id="option-phone"></div>
                    <div id="option-mention"></div>
                    <div id="option-hashtag"></div>
                </div>

                <div className="col-lg-4 col-sm-6">
                    <h4>Other Options:</h4>
                    <div id="option-stripPrefix"></div>
                    <div id="option-stripTrailingSlash"></div>
                    <div id="option-decodePercentEncoding"></div>
                    <div id="option-newWindow"></div>
                    <br />
                    <div id="option-truncate-length"></div>
                    <div id="option-truncate-location"></div>
                    <br />
                    <div id="option-className"></div>
                </div>

                <div className="col-lg-4 col-sm-12">
                    <h4>Code Sample:</h4>
                    <pre id="options-output" className="code-sample"></pre>
                </div>
            </div>

            <div className="row pt10">
                {/* Input */}
                <div className="col-xs-6">
                    <textarea id="input" className="code-box">
                        http://google.com
                        www.google.com
                        google.com
                        google@google.com
                        123-456-7890
                        @MentionUser
                        #HashTag
                    </textarea>  {/* Note: </textarea> tag intentionally directly against the end of the text to avoid an extra line */}
                </div>

                <div className="col-xs-6">
                    {/* NOTE: This ID "output" is also used by the 'test-live-example' integration test */}
                    <div id="output" className="full-height code-box"></div>
                </div>
            </div>
        </div>
    </>;
};