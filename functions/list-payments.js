const config = require('./config');

const ADMIN_ROLE = 'admin';
const paymentsApi = config.PAYMENTS_API;

exports.handler = function(event, context, callback) {
  const { user } = context.clientContext
  if (event.httpMethod != 'GET') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  if (!user || !user.app_metadata.roles.includes(ADMIN_ROLE)) {
    return callback(null, {statusCode: 401, body: '{"error": "Not authorized"}'});
  }
  paymentsApi.listPayments({})
    .then(payments => callback(null, {statusCode: 200, body: JSON.stringify(payments)}))
    .catch(error => callback(null, {statusCode: 500, body: JSON.stringify(error)}));
}
