const config = require('./config');

const ADMIN_ROLE = 'admin';
const paymentsApi = config.PAYMENTS_API;

exports.handler = function(event, context, callback) {
  const { user } = context.clientContext
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  if (!user || !user.app_metadata.roles.includes(ADMIN_ROLE)) {
    return callback(null, {statusCode: 401, body: '{"error": "Not authorized"}'});
  }
  const req_body_incoming = JSON.parse(event.body);

  paymentsApi.completePayment(req_body_incoming.payment_id)
    .then(payment =>
          callback(null, {statusCode: 200, body: JSON.stringify(payment)}))
    .catch(error => {
      console.log('ERROR: ', JSON.stringify(response));
      callback(null, {statusCode: 500, body: JSON.stringify(error)})
    });
}
