const config = require('./config');
const { sqStringify } = require('./util');
const uuid4 = require('uuid/v4');
const paymentsApi = config.PAYMENTS_API;
const ordersApi = config.ORDERS_API;

exports.handler = async function(event, context, callback) {
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const req_body_incoming = JSON.parse(event.body);
  if (!('amount' in req_body_incoming)) {
    return callback(null, {statusCode: 400, body: '{"error": "Missing required field: amount"}'});
  }
  if (!('payment_id' in req_body_incoming)) {
    return callback(null, {statusCode: 400, body: '{"error": "Missing required field: payment_id"}'});
  }

  const order_id = req_body_incoming.order.id;
  const location_id = req_body_incoming.order.location_id;
  const order_version = req_body_incoming.order.version;
  const deposit_line_item_uid = req_body_incoming.order.deposit_line_item_uid;
  const update_order_idempotency_key = uuid4();

  const update_order_request_body = {
    idempotencyKey: update_order_idempotency_key,
    order: {
      locationId: location_id,
      version: order_version
    },
    fieldsToClear: [
      `line_items[${deposit_line_item_uid}]`
    ]
  }

  try {
    const ordersHttpResponse = await ordersApi.updateOrder(order_id, update_order_request_body);
  } catch(error) {
    console.log("ERROR: ", error);
    return callback(null, { statusCode: 500, body: error });
  }

  const payment_id = req_body_incoming.payment_id;
  const idempotency_key = uuid4();
  const request_body = {
    idempotencyKey: idempotency_key,
    payment: { amountMoney: { amount: req_body_incoming.amount, currency: config.CURRENCY } }
  }
  try {
    const { result, ...httpResponse } = await paymentsApi.updatePayment(payment_id, request_body);
    return callback(null, { statusCode: 200, body: sqStringify(result) });
  } catch(error) {
    console.log("ERROR: ", error);
    return callback(null, { statusCode: 500, body: error });
  }
}
