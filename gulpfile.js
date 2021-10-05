require('dotenv').config();
const { src, dest, parallel } = require('gulp');
const replace = require('gulp-replace');

const env_dependent_substitutions = {
  PROD: {
    SQUARE_PAYMENT_FORM_SCRIPT_BASE_PATH: 'https://js.squareup.com',
    WEB_PAYMENTS_SDK_SCRIPT_BASE_PATH: 'https://web.squarecdn.com'
  },
  SANDBOX: {
    SQUARE_PAYMENT_FORM_SCRIPT_BASE_PATH: 'https://js.squareupsandbox.com',
    WEB_PAYMENTS_SDK_SCRIPT_BASE_PATH: 'https://sandbox.web.squarecdn.com'
  }

}

function square_env_var_replace(match, p1, offset, string) {
  const square_env = process.env.SQUARE_ENV.toUpperCase();
  const base_var = p1.trim().toUpperCase();
  return env_dependent_substitutions[square_env][base_var] || process.env[base_var + '_' + square_env];
}

function env_var_replace(match, p1, offset, string) {
  const square_env = process.env.SQUARE_ENV.toUpperCase();
  const base_var = p1.trim().toUpperCase();
  return process.env[base_var] || process.env[base_var + '_' + square_env];
}

function html() {
  return src('src/*.html')
    .pipe(replace(/#{(.*?)}/g, square_env_var_replace))
    .pipe(dest('public'));
}

function js() {
  return src('src/js/*.js')
    .pipe(replace(/#{(.*?)}/g, env_var_replace))
    .pipe(dest('public/js'));
}

exports.default = parallel(html, js);
