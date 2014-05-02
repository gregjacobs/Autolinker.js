module.exports = function(grunt) {
    'use strict';

    var banner = [
        '/*!',
        ' * <%= pkg.name %>',
        ' * <%= pkg.version %>',
        ' *',
        ' * Copyright(c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>',
        ' * <%= pkg.license %>',
        ' *',
        ' * <%= pkg.homepage %>',
        ' */\n'
    ].join('\n');

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
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
        },
        concat: {
            development: {
                options: {
                    banner: banner
                },
                src: ['src/Autolinker.js'],
                dest: 'dist/Autolinker.js',
            },
        },
        uglify: {
            production: {
                options: {
                    banner: banner
                },
                src: ['src/Autolinker.js'],
                dest: 'dist/Autolinker.min.js',
            }
        }
    });

    // Plugins
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Tasks
    grunt.registerTask('default', ['test', 'build']);
    grunt.registerTask('test', ['jasmine']);
    grunt.registerTask('build', ['concat:development', 'uglify:production']);
    grunt.registerTask('serve', ['connect:server:keepalive']);
};
