const axios = require('axios');
const SquareConnect = require('square-connect');

const SQUARE_BASE_PATH = process.env.SQUARE_ENV == 'PROD' ? 'https://connect.squareup.com' :
      'https://connect.squareupsandbox.com';

axios.defaults.baseURL = SQUARE_BASE_PATH;
axios.defaults.headers.common['Authorization'] =  `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`;

const squareClient = SquareConnect.ApiClient.instance;
squareClient.basePath = SQUARE_BASE_PATH;
const oauth2 = squareClient.authentications['oauth2'];
oauth2.accessToken = process.env.SQUARE_ACCESS_TOKEN;

module.exports = {
  CURRENCY: 'USD',
  EMAIL_FROM: 'rothlmar@gmail.com',
  APPLICATION_BASE: 'https://payment-app-hackweek.netlify.com',
  PAYMENTS_API: new SquareConnect.PaymentsApi()
}
