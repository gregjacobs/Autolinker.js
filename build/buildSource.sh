# Note: You must have PhantomJS installed (http://www.phantomjs.org/), and it must exist in your PATH variable
# Google how to do that if you don't know how.
phantomJS compileMatcherRegex.js ../src/matcherRegexSource.js ../src/matcherRegexCompiled.js

# Note: You must have Java installed, and the Java executable must be in your PATH variable.
java -jar ../vendor/webappbuilder/WebAppBuilder.jar