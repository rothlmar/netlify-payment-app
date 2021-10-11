require('dotenv').config();
const { Client, Environment } = require('square');

const SQUARE_BASE_PATH = process.env.SQUARE_ENV == 'PROD' ? 'https://connect.squareup.com' :
      'https://connect.squareupsandbox.com';
const SQUARE_ENVIRONMENT = process.env.SQUARE_ENV == 'PROD' ? Environment.Production : Environment.Sandbox

const squareClient = new Client({
  environment: SQUARE_ENVIRONMENT,
  accessToken: process.env.SQUARE_ACCESS_TOKEN
});

module.exports = {
  CURRENCY: 'USD',
  EMAIL_FROM: 'rothlmar@gmail.com',
  APPLICATION_BASE: 'https://payment-app-hackweek.netlify.com',
  PAYMENTS_API: squareClient.paymentsApi,
  ORDERS_API: squareClient.ordersApi
}
