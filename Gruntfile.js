module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    hostname: '*',
                    port: 3000,
                    base: '.'
                }
            }
        },
        jasmine: {
            src: 'src/Autolinker.js',
            options: {
                specs: 'tests/*Spec.js',
            }
        }
    });

    // Plugins
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    // Tasks
    grunt.registerTask('default', ['jasmine']);
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('serve', ['connect:server:keepalive']);
};
