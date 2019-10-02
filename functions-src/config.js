const axios = require('axios');

axios.defaults.baseURL = process.env.SQUARE_BASE_PATH;
axios.defaults.headers.common['Authorization'] =  `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`;

module.exports = {
  ACCESS_TOKEN: process.env.SQUARE_ACCESS_TOKEN,
  BASE_PATH: process.env.SQUARE_BASE_PATH,
  CURRENCY: 'USD'
}
