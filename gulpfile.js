var gulp = require( "gulp" ),
  browserify = require( "gulp-browserify" ),
  css = require( "gulp-minify-css" ),
  jshint = require( "gulp-jshint" ),
  jshintReporter = require( "jshint-stylish" ),
  less = require( "gulp-less" ),
  rename = require( "gulp-rename" ),
  shell = require( "gulp-shell" ),
  uglify = require( "gulp-uglify" );

var pkg = require( "./package.json" ),
  livereloadServer,
  moduleName = pkg.name.replace( /-(\w)/g, "$1" );

var livereload = function ( _file ) {
  return function ( _path ) {
    if ( livereloadServer ) livereloadServer.changed( _file );
  }
}

gulp.task( "jshint", function () {
  return gulp.src( [ "./src/scripts/**/*.js", "test/**/*.js", "testClient/**/*.js" ] )
    .pipe( jshint() )
    .pipe( jshint.reporter( jshintReporter ) );
} );

gulp.task( "minifyScripts", [ "scriptMain" ], function () {
  return gulp.src( [ "./dist/" + moduleName + ".js" ] )
    .pipe( uglify() )
    .pipe( rename( moduleName + ".min.js" ) )
    .pipe( gulp.dest( "./dist/" ) )
    .on( "end", livereload( ".js" ) );
} );

gulp.task( "minifyStyles", [ "stylesMain" ], function () {
  return gulp.src( [ "./dist/" + moduleName + ".css" ] )
    .pipe( css() )
    .pipe( rename( moduleName + ".min.css" ) )
    .pipe( gulp.dest( "./dist/" ) )
    .on( "end", livereload( ".js" ) );
} );

gulp.task( "scriptMain", [ "jshint" ], function () {
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
  ], {
    ignoreErrors: true
  } ) )
    .on( "end", livereload( ".js" ) );
} );

gulp.task( "watch", function () {
  livereloadServer = require( "gulp-livereload" )();

  gulp.watch( [ "./src/scripts/**/*.js*" ], [ "scripts", "minifyScripts" ] );
  gulp.watch( [ "./src/styles/**/*.less" ], [ "styles" ] );
  gulp.watch( [ "./demo/*" ], [ "default" ] );
  gulp.watch( [ "./test/**/*", "./testClient/**/*" ], [ "test" ] );
  gulp.watch( [ "*.js*" ], [ "default" ] );
} );

gulp.task( "default", [ "build", "test" ] );
gulp.task( "build", [ "jshint", "scripts", "styles", "minify" ] );
gulp.task( "scripts", [ "scriptMain" ] );
gulp.task( "styles", [ "stylesMain" ] );
gulp.task( "minify", [ "minifyScripts", "minifyStyles" ] );
gulp.task( "run", [ "build", "watch" ] );