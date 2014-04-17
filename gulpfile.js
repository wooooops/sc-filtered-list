var gulp = require( "gulp" ),
  browserify = require( "gulp-browserify" ),
  css = require( "gulp-minify-css" ),
  concat = require( "gulp-concat" ),
  jshint = require( "gulp-jshint" ),
  jshintReporter = require( "jshint-stylish" ),
  less = require( "gulp-less" ),
  mochaPhantomJS = require( "gulp-mocha-phantomjs" ),
  rename = require( "gulp-rename" ),
  shell = require( "gulp-shell" ),
  uglify = require( "gulp-uglify" );

var pkg = require( "./package.json" ),
  livereloadServer,
  moduleName = pkg.name.replace( /-(\w)/g, "$1" );

var livereload = function ( _file ) {
  return function () {
    if ( livereloadServer ) livereloadServer.changed( _file );
  }
}

gulp.task( "concatScripts", function () {
  return gulp.src( [ "./src/scripts/index.js", "./src/scripts/list.js" ] )
    .pipe( concat( "src.js" ) )
    .pipe( gulp.dest( "./.tmp/" ) );
} );

gulp.task( "jshint", function () {
  return gulp.src( [ "./src/scripts/**/*.js", "test/**/*.js", "testClient/**/*.js" ] )
    .pipe( jshint() )
    .pipe( jshint.reporter( jshintReporter ) );
} );

gulp.task( "minifyScripts", [ "jshint", "scriptMain" ], function () {
  gulp.src( [ "./dist/" + moduleName + ".js" ] )
    .pipe( uglify() )
    .pipe( rename( moduleName + ".min.js" ) )
    .pipe( gulp.dest( "./dist/" ) )
    .on( "end", livereload( ".js" ) );
} );

gulp.task( "minifyStyles", [ "stylesMain" ], function () {
  gulp.src( [ "./dist/" + moduleName + ".css" ] )
    .pipe( css() )
    .pipe( rename( moduleName + ".min.css" ) )
    .pipe( gulp.dest( "./dist/" ) )
    .on( "end", livereload( ".js" ) );
} );

gulp.task( "readme", [ "concatScripts" ], function () {
  gulp.src( "" )
    .pipe( shell( [
      "./node_modules/.bin/dox < ./.tmp/src.js -a > README.md"
    ] ) )
    .on( "end", livereload( ".js" ) );
} );

gulp.task( "scriptMain", function () {
  return gulp.src( [ "./src/scripts/index.js" ] )
    .pipe( browserify( {
      standalone: moduleName,
      debug: true
    } ) )
    .pipe( rename( moduleName + ".js" ) )
    .pipe( gulp.dest( "./dist/" ) )
    .on( "end", livereload( ".js" ) );
} );

gulp.task( "stylesMain", function () {
  return gulp.src( [ "./src/styles/index.less" ] )
    .pipe( less() )
    .pipe( rename( moduleName + ".css" ) )
    .pipe( gulp.dest( "./dist/" ) )
    .on( "end", livereload( ".css" ) );
} );

gulp.task( "test", function () {
  return gulp.src( "" ).pipe( shell( [
    "npm test"
  ] ) );
} );

gulp.task( "tests", [ "scriptMain", "stylesMain" ], function () {
  [
    "testClient/data.html",
    "testClient/defaults.html",
    "testClient/destroy.html",
    "testClient/fuzzy-search.html",
    "testClient/more-than-one.html",
    "testClient/open-close.html",
    "testClient/options-given-by-data-attrs.html",
    "testClient/sort.html",
    "testClient/templates.html"
  ].forEach( function ( _html ) {
    gulp.src( _html ).pipe( mochaPhantomJS() );
  } );
} );

gulp.task( "watch", function () {
  livereloadServer = require( "gulp-livereload" )();

  gulp.watch( [ "./src/scripts/**/*.js*" ], [ "scripts", "minifyScripts", "test", "docs" ] );
  gulp.watch( [ "./src/styles/**/*.less" ], [ "styles" ] );
  gulp.watch( [ "./demo/*" ], [ "default" ] );
  gulp.watch( [ "./test/**/*", "./testClient/**/*" ], [ "test" ] );
  gulp.watch( [ "*.js*" ], [ "default" ] );
} );

gulp.task( "default", [ "build", "test" ] );
gulp.task( "build", [ "scripts", "styles", "minify", "docs" ] );
gulp.task( "scripts", [ "scriptMain" ] );
gulp.task( "styles", [ "stylesMain" ] );
gulp.task( "minify", [ "minifyScripts", "minifyStyles" ] );
gulp.task( "docs", [ "readme" ] );
gulp.task( "run", [ "build", "test", "watch" ] );