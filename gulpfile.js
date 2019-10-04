const { src, dest, parallel } = require('gulp');
const replace = require('gulp-replace');

function env_var_replace(match, p1, offset, string) {
  return process.env[p1.trim().toUpperCase()];
}

function html() {
  return src('src/*.html')
    .pipe(replace(/#{(.*)}/g, env_var_replace))
    .pipe(dest('public'));
}

function js() {
  return src('src/js/*.js')
    .pipe(replace(/#{(.*)}/g, env_var_replace))
    .pipe(dest('public/js'));
}

exports.default = parallel(html, js);
