Package.describe({
	name: 'autolinker:autolinker',
	summary: "Official Autolinker.js packaged for Meteor.",
	version: "1.0.2",
	git: "https://github.com/gregjacobs/Autolinker.js.git"
});

Package.onUse(function(api) {
	api.versionsFrom('1.0.2.1');
	api.use('templating', 'client');
	api.addFiles('dist/Autolinker.js', ['client', 'server']);
	api.addFiles('meteor/helpers.js', ['client']);
	api.export("Autolinker");
});

Package.onTest(function(api) {
	api.use('tinytest');
	api.use('autolinker:autolinker');
	api.addFiles('meteor/test.js', ['client']);
});
