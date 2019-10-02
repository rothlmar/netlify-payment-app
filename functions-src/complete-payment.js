const axios = require('axios');
const config = require('./config');

const ADMIN_ROLE = 'admin';

exports.handler = function(event, context, callback) {
  const { user } = context.clientContext
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  if (!user || !user.app_metadata.roles.includes(ADMIN_ROLE)) {
    return callback(null, {statusCode: 401, body: '{"error": "Not authorized"}'});
  }
  const req_body_incoming = JSON.parse(event.body);

  axios.post(`${config.BASE_PATH}/v2/payments/${req_body_incoming.payment_id}/complete`, {}, {
    headers: {'Authorization': `Bearer ${config.ACCESS_TOKEN}`}
  })
    .then(response =>
          callback(null, {statusCode: 200, body: JSON.stringify(response.data)}))
    .catch(response => {
      console.log('ERROR: ', JSON.stringify(response.data));
      callback(null, {statusCode: 500, body: JSON.stringify(response.data)})
    });
}
