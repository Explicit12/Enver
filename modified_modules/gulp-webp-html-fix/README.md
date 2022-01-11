# gulp-webp-html-fix

> Fix bugs
> Replace `<img/>` to `<picture/>` supports webp

[![npm (scoped)](https://img.shields.io/npm/v/gulp-webp-html-fix.svg?style=flat-square)](https://www.npmjs.com/package/gulp-webp-html-fix)
[![License](https://img.shields.io/github/license/bladhard/gulp-webp-html-fix.svg?style=flat-square)](https://github.com/Bladhard/gulp-webp-html-fix/blob/master/LICENSE)
## Install

```npm
npm i --save-dev gulp-webp-html-fix
```

## Example

```html
// Input
<img src="/img/tmp/catalogImage.jpg">

// Output
<picture>
    <source srcset="/img/tmp/catalogImage.webp" type="image/webp">
    <img src="/img/tmp/catalogImage.jpg">
</picture>
```

## Usage

```javascript
var webpHTML = require('gulp-webp-html');

gulp.task('html',function(){
    gulp.src('./assets/**/*.html')
        .pipe(webpHTML())
        .pipe(gulp.dest('./public/'))
});
```

## Original

[gulp-webp-html](https://www.npmjs.com/package/gulp-webp-html)

## Donate

<a href="https://www.buymeacoffee.com/bladhard" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" height="38.25px" width="162.75px"></a>
