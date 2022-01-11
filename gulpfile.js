"use strict"

// main section
import gulp from "gulp";
import rename from "gulp-rename";
import fs from "fs";

// browser sync
import sync from "browser-sync";
import del from "del";

// html
import fileInclude from "gulp-file-include";
import htmlmin from "gulp-htmlmin";

// scss and css
import gulpSass from "gulp-sass";
import dartSass from "sass";
import autoPrefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import media from "gulp-group-css-media-queries";

// javaScript
import terser from "gulp-terser";
import babel from "gulp-babel";
import npmDist from "gulp-npm-dist";

// images
import imageMin from "gulp-imagemin";
import webp from "gulp-webp";
import webpHTML from "./modified_modules/gulp-webp-html-fix/index.js";

const project_folder = "dist";
const source_folder = "src";

const path = {
    build: {
        html: `${project_folder}/`,
        css: `${project_folder}/`,
        pages: `${project_folder}/pages`,
        js: `${project_folder}/js`,
        img: `${project_folder}/img`,
        fonts: `${project_folder}/fonts`,
        svg: `${project_folder}/svg`
    },

    src: {
        html: `${source_folder}/index.html`,
        pages: `${source_folder}/pages/*.html`,
        scss: `${source_folder}/style.scss`,
        js: `${source_folder}/js/*.js`,
        img: `${source_folder}/img/**/**`,
        fonts: `${source_folder}/fonts/**/**`,
        svg: `${source_folder}/svg/**/*.svg`
    },

    watch: {
        html: `${source_folder}/index.html`,
        html_modules: `${source_folder}/html_modules/**/*.html`,
        pages: `${source_folder}/pages/*.html`,
        scss: `${source_folder}/style.scss`,
        scss_modules: `${source_folder}/scss_modules/**/*.scss`,
        js: `${source_folder}/*.js`,
        img: `${source_folder}/img/**/**`,
        fonts: `${source_folder}/fonts/**/**`,
        svg: `${source_folder}/svg/**/*.svg`
    },

    clean: `./${project_folder}/`
}

function html() {
    return gulp.src(path.src.html)
        .pipe(fileInclude({
            prefix: "@@"
        }))
        .pipe(webpHTML())
        .pipe(gulp.dest(path.build.html))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(path.build.html));
}

const sassFunc = gulpSass(dartSass);
function sass() {
    return gulp.src(path.src.scss)
        .pipe(sassFunc().on("error", sassFunc.logError))
        .pipe(autoPrefixer())
        .pipe(media())
        .pipe(csso())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(path.build.css));
}

function resetCSS() {
    return gulp.src(source_folder + "/reset.css")
        .pipe(csso())
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(path.build.css));
}

function javaSrcipt() {
    return gulp.src(path.src.js)
        .pipe(babel({
            presets: ["@babel/env"]
        }))
        .pipe(terser())
        .pipe(rename({ extname: '.min.js' }))
        .pipe(gulp.dest(path.build.js));
}

function libs() {
    let packageJson = JSON.parse(fs.readFileSync("package.json")).dependencies;
    if (!packageJson) return Promise.resolve("There's no dependencies");
    return gulp.src(npmDist(), { base: "./node_modules" })
        .pipe(gulp.dest(path.build.js + "/libs"));
}

function img() {
    return gulp.src(path.src.img)
        .pipe(webp({
            quality: 70
        }))
        .pipe(gulp.dest(path.build.img))
        .pipe(gulp.src(path.src.img))
        .pipe(imageMin({
            progressive: true,
            interlaced: true,
            opimizationLavel: 3
        }))
        .pipe(gulp.dest(path.build.img));
}

function svg() {
    return gulp.src(path.src.svg)
        .pipe(imageMin({
            removeViewBox: true
        }))
        .pipe(gulp.dest(path.build.svg));
}

function fonts() {
    return gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.build.fonts));
}

function browserSync() {
    sync.init({
        server: { baseDir: "./" + project_folder + "/" },
        port: 3000,
        notify: false,
        open: false
    }),
        gulp.watch(path.watch.html, gulp.series(html)).on("change", sync.reload),
        gulp.watch(path.watch.html_modules, gulp.series(html, htmlPages)).on("change", sync.reload),
        gulp.watch(path.watch.scss, gulp.series(sass)).on("change", sync.reload),
        gulp.watch(path.watch.scss_modules, gulp.series(sass)).on("change", sync.reload),
        gulp.watch(path.watch.js, gulp.series(js)).on("change", sync.reload),
        gulp.watch("package.json", gulp.series(libs)).on("change", sync.reload),
        gulp.watch(path.watch.img, gulp.series(img)).on("change", sync.reload),
        gulp.watch(path.watch.svg, gulp.series(svg)).on("change", sync.reload),
        gulp.watch(path.watch.fonts, gulp.series(fonts)).on("change", sync.reload)
}


const clear = () => del(path.clean);

const css = gulp.parallel(sass, resetCSS);
const js = gulp.parallel(javaSrcipt, libs);
const build = gulp.parallel(img, svg, fonts, html, css, js);
export default gulp.series(clear, build, browserSync);