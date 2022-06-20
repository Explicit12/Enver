/* eslint-disable max-classes-per-file */

"use strict";

// Main
import gulp from "gulp";
import gulpMode from "gulp-mode";
import del from "del";
import fileinclude from "gulp-file-include";
import browserSync from "browser-sync";
import sourcemaps from "gulp-sourcemaps";

// JavaScript
import rollup from "@rbnlffl/gulp-rollup";
import babel from "gulp-babel";
import terser from "gulp-terser";

// Images
import webp from "gulp-webp";
import imagemin, { mozjpeg, svgo } from "gulp-imagemin";

// svg
import svgSprite from "gulp-svg-sprite";

// html
import htmlmin from "gulp-htmlmin";

// css
import dartSass from "sass";
import gulpSass from "gulp-sass";
import postcss from "gulp-postcss";
import postcssPresetEnv from "postcss-preset-env";
import cssnano from "cssnano";
import cssMqpacker from "css-mqpacker";

const sass = gulpSass(dartSass);
const mode = gulpMode();

class Path {
  static source = "./src";
  static dist = "./dist";

  static build = {
    html: `${this.dist}/`,
    css: `${this.dist}/`,
    js: `${this.dist}/js`,
    img: `${this.dist}/assets/img`,
    fonts: `${this.dist}/assets/fonts`,
    svg: `${this.dist}/assets/svg`,
    public: `${this.dist}/public`,
  };

  static src = {
    html: `${this.source}/index.html`,
    scss: `${this.source}/style.scss`,
    js: `${this.source}/**/*.js`,
    mainjs: `${this.source}/js/main.js`,
    img: `${this.source}/assets/img/**/*`,
    fonts: `${this.source}/assets/fonts/**/*.{eot,svg,ttf,woff,woff2}`,
    svg: `${this.source}/assets/svg/**/*.svg`,
    svgSprites: `${this.source}/assets/svgSprites/**/*.svg`,
    public: `${this.source}/public/**`,
  };

  static watch = {
    html: `${this.source}/**/*.html`,
    js: `${this.source}/js/**/*.js`,
    scss: `${this.source}/**/*.scss`,
    img: `${this.source}/assets/img/**/*`,
    fonts: `${this.source}/assets/fonts/**/**`,
    svg: `${this.source}/assets/svg/**/*.svg`,
    svgSprites: `${this.source}/assets/svgSprites/**/*.svg`,
    public: `${this.source}/public/**`,
  };

  static clean = `./${this.dist}/`;
}

class Task {
  static javaScript() {
    return gulp
      .src(Path.src.mainjs)
      .pipe(mode.development(sourcemaps.init()))
      .pipe(rollup({}, { format: "iife" }))
      .pipe(
        babel({
          presets: ["@babel/env"],
        }),
      )
      .pipe(terser())
      .pipe(mode.development(sourcemaps.write()))
      .pipe(gulp.dest(Path.build.js));
  }

  static html() {
    return gulp
      .src(Path.src.html)
      .pipe(mode.development(sourcemaps.init()))
      .pipe(fileinclude({ prefix: "@@" }))
      .pipe(htmlmin({ collapseWhitespace: true }))
      .pipe(mode.development(sourcemaps.write()))
      .pipe(gulp.dest(Path.build.html));
  }

  static css() {
    return gulp
      .src(Path.src.scss)
      .pipe(mode.development(sourcemaps.init()))
      .pipe(sass().on("error", sass.logError))
      .pipe(postcss([cssnano(), postcssPresetEnv({ browsers: "last 2 versions" }), cssMqpacker()]))
      .pipe(mode.development(sourcemaps.write()))
      .pipe(gulp.dest(Path.build.css));
  }

  static img() {
    return gulp
      .src(Path.src.img)
      .pipe(
        webp({
          quality: 70,
        }),
      )
      .pipe(gulp.dest(Path.build.img))
      .pipe(gulp.src(Path.src.img))
      .pipe(
        mode.production(
          imagemin([
            mozjpeg({
              quality: 75,
              progressive: true,
            }),
          ]),
        ),
      )
      .pipe(gulp.dest(Path.build.img));
  }

  static svg() {
    return gulp
      .src(Path.src.svg)
      .pipe(
        imagemin([
          svgo({
            plugins: [
              {
                name: "removeViewBox",
                active: true,
              },
              {
                name: "cleanupIDs",
                active: false,
              },
            ],
          }),
        ]),
      )
      .pipe(gulp.dest(Path.build.svg));
  }

  static svgSprites() {
    return gulp
      .src(Path.src.svgSprites)
      .pipe(
        imagemin([
          svgo({
            plugins: [
              {
                name: "removeViewBox",
                active: true,
              },
              {
                name: "cleanupIDs",
                active: false,
              },
            ],
          }),
        ]),
      )
      .pipe(
        svgSprite({
          shape: {
            dimension: {
              maxWidth: 24,
              maxHeight: 24,
            },
          },
          mode: {
            symbol: {
              sprite: "../sprites.svg",
            },
          },
        }),
      )
      .pipe(gulp.dest(Path.build.svg));
  }

  static fonts() {
    return gulp.src(Path.src.fonts).pipe(gulp.dest(Path.build.fonts));
  }

  static public() {
    return gulp.src(Path.src.public).pipe(gulp.dest(Path.build.public));
  }

  static browserSyncTask = () => {
    browserSync.init({
      server: { baseDir: `${Path.dist}/` },
      port: 3000,
      notify: false,
      open: false,
    });

    gulp.watch(Path.watch.html, gulp.series(this.html)).on("change", browserSync.reload);
    gulp.watch(Path.watch.js, gulp.series(this.javaScript)).on("change", browserSync.reload);
    gulp.watch(Path.watch.scss, gulp.series(this.css)).on("change", browserSync.reload);
    gulp.watch(Path.watch.img, gulp.series(this.img)).on("change", browserSync.reload);
    gulp.watch(Path.watch.fonts, gulp.series(this.fonts)).on("change", browserSync.reload);
    gulp.watch(Path.watch.svg, gulp.series(this.svg)).on("change", browserSync.reload);
    gulp.watch(Path.watch.public, gulp.series(this.public)).on("change", browserSync.reload);
  };

  static clear = () => del(Path.clean);

  static buildAssets = gulp.parallel(this.img, this.svg, this.svgSprites, this.public, this.fonts);
  static buildCode = gulp.parallel(this.html, this.css, this.javaScript);
  static build = gulp.series(this.buildAssets, this.buildCode);
}

export default mode.production()
  ? gulp.series(Task.clear, Task.build)
  : gulp.series(Task.clear, Task.build, Task.browserSyncTask);
