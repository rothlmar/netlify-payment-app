const { src, dest, parallel } = require('gulp');
const replace = require('gulp-replace');

const env_dependent_substitutions = {
  PROD: {
    SQUARE_PAYMENT_FORM_SCRIPT_BASE_PATH: 'https://js.squareup.com'
  },
  SANDBOX: {
    SQUARE_PAYMENT_FORM_SCRIPT_BASE_PATH: 'https://js.squareupsandbox.com'
  }

}

function square_env_var_replace(match, p1, offset, string) {
  const square_env = process.env.SQUARE_ENV.toUpperCase();
  return env_dependent_substitutions[square_env][p1.trim().toUpperCase()];
}

function env_var_replace(match, p1, offset, string) {
  return process.env[p1.trim().toUpperCase()];
}

function html() {
  return src('src/*.html')
    .pipe(replace(/#{(.*)}/g, square_env_var_replace))
    .pipe(dest('public'));
}

function js() {
  return src('src/js/*.js')
    .pipe(replace(/#{(.*)}/g, env_var_replace))
    .pipe(dest('public/js'));
}

exports.default = parallel(html, js);
