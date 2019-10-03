const config = require('./config');
const axios = require('axios');
const uuid4 = require('uuid/v4');

exports.handler = function(event, context, callback) {
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const req_body_incoming = JSON.parse(event.body);
  if (!('tip' in req_body_incoming)) {
    return callback(null, {statusCode: 400, body: '{"error": "Missing required field: tip"}'});
  }
  if (!('payment_id' in req_body_incoming)) {
    return callback(null, {statusCode: 400, body: '{"error": "Missing required field: payment_id"}'});
  }

  const idempotency_key = uuid4();
  const request_body = {
    idempotency_key: idempotency_key,
    payment: { tip_money: { amount: req_body_incoming.tip, currency: config.CURRENCY } }
  }

  axios.put(`/v2/payments/${req_body_incoming.payment_id}`, request_body)
    .then(response =>
          callback(null, {statusCode: 200, body: JSON.stringify(response.data)}))
    .catch(response =>
           callback(null, {statusCode: 500, body: JSON.stringify(response.data)}));
}
