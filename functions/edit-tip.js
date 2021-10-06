const config = require('./config');
const { sqStringify } = require('./util');
const uuid4 = require('uuid/v4');

const paymentsApi = config.PAYMENTS_API;

exports.handler = async function(event, context, callback) {
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

  const payment_id = req_body_incoming.payment_id;
  const idempotency_key = uuid4();
  const request_body = {
    idempotencyKey: idempotency_key,
    payment: { tipMoney: { amount: req_body_incoming.tip, currency: config.CURRENCY } }
  }

  try {
    const { result, ...httpResponse } = await paymentsApi.updatePayment(payment_id, request_body);
    return callback(null, { statusCode: 200, body: sqStringify(result) });
  } catch(error) {
    console.log("ERROR: ", error);
    return callback(null, { statusCode: 500, body: error });
  }
}
