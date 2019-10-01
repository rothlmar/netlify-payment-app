const axios = require('axios');
const config = require('./config');

exports.handler = function(event, context, callback) {
  if (event.httpMethod != 'GET') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  axios.get(config.BASE_PATH + '/v2/payments', {
    headers: {'Authorization': 'Bearer ' + config.ACCESS_TOKEN}
  })
    .then(response =>
          callback(null, {statusCode: 200, body: JSON.stringify(response.data)}))
    .catch(response =>
           callback(null, {statusCode: 500, body: JSON.stringify(response.data)}));
}
