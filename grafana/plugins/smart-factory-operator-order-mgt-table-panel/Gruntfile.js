module.exports = function (grunt) {
  require("load-grunt-tasks")(grunt);

  grunt.loadNpmTasks('grunt-execute');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-multi-dest');
  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-force-task');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: ["dist"],

    jshint: {
      options: {
        jshintrc: '.jshintrc',
      },
      src: ['Gruntfile.js', 'src/*.js'],
    },
    
    copy: {
      src_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['**/*', '!**/*.js', '!image/**/*'],
        dest: 'dist'
      },
      libs: {
        cwd: 'libs',
        expand: true,
        src: ['**.*'],
        dest: 'dist/libs',
        options: {
          process: content => content.replace(/(\'|")ion.rangeSlider(\'|")/g, '$1./ion.rangeSlider.min$2'), // eslint-disable-line
        },
      },
      echarts_libs: {
        cwd: 'node_modules/echarts/dist',
        expand: true,
        src: ['echarts.min.js'],
        dest: 'dist/libs/',
      },
      image_to_dist: {
        cwd: 'src',
        expand: true,
        src: ['src/image/**/*'],
        dest: 'dist/image/'
      },
      pluginDef: {
        expand: true,
        src: ['plugin.json'],
        dest: 'dist',
      }
    },

    watch: {
      rebuild_all: {
        files: ['src/**/*', 'plugin.json'],
        tasks: ['default'],
        options: {spawn: false}
      },
    },

    babel: {
      options: {
        ignore: ["**/src/libs/*"],
        sourceMap: true,
        presets: ["es2015"],
        plugins: ['transform-es2015-modules-systemjs', "transform-es2015-for-of"],
      },
      dist: {
        files: [{
          cwd: 'src',
          expand: true,
          src: ['*.js'],
          dest: 'dist',
          ext: '.js'
        }]
      },
    },
  });
  grunt.registerTask('default', [
    // 'jshint',
    'clean',
    "copy:src_to_dist",
    'copy:libs',
    // 'copy:echarts_libs',
    "copy:pluginDef",
    'copy:image_to_dist',
    'babel']);
};