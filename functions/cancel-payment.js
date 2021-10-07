const config = require('./config');
const { sqStringify } = require('./util');

const ADMIN_ROLE = 'admin';
const paymentsApi = config.PAYMENTS_API;

exports.handler = async function(event, context, callback) {
  const { user } = context.clientContext
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  if (!user || !user.app_metadata.roles.includes(ADMIN_ROLE)) {
    return callback(null, {statusCode: 401, body: '{"error": "Not authorized"}'});
  }
  const req_body_incoming = JSON.parse(event.body);
  const payment_id = req_body_incoming.payment_id;

  try {
    const { result, ...httpResponse } = await paymentsApi.cancelPayment(payment_id)
    return callback(null, {statusCode: 200, body: sqStringify(result)});
  } catch(error) {
    console.log('ERROR:', error)
    return callback(null, {statusCode: 500, body: sqStringify(error)});
  }
}
