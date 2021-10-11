const config = require('./config');
const { sqStringify } = require('./util')
const paymentsApi = config.PAYMENTS_API;
const ordersApi = config.ORDERS_API;

exports.handler = async function(event, context, callback) {
  const { user } = context.clientContext
  if (event.httpMethod != 'GET') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const query_params = event.queryStringParameters;
  const payment_id = query_params.payment_id;

  try {
    const { result, ...httpResponse } = await paymentsApi.getPayment(payment_id);
    const payment_data = {payment: result.payment};
    const order_id = result.payment.orderId;
    const orderResponse = await ordersApi.retrieveOrder(order_id);
    const data = Object.assign({}, payment_data, orderResponse.result);
    return callback(null, {statusCode: 200, body: sqStringify(data)});
  } catch(error) {
    console.log('ERROR: ', error);
    return callback(null, {statusCode: 500, body: JSON.stringify(error)});
  }
}
