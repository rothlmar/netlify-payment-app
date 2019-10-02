const axios = require('axios');
const config = require('./config');

const ADMIN_ROLE = 'admin';

exports.handler = function(event, context, callback) {
  const { user } = context.clientContext
  if (event.httpMethod != 'GET') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const query_params = event.queryStringParameters;
  console.log(JSON.stringify(query_params));

  axios.get(`/v2/payments/${query_params.payment_id}`)
    .then(response =>
          callback(null, {statusCode: 200, body: JSON.stringify(response.data)}))
    .catch(response =>
           callback(null, {statusCode: 500, body: JSON.stringify(response.data)}));
}
