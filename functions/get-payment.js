const config = require('./config');
const { sqStringify } = require('./util')
const faunadb = require('faunadb');
const q = faunadb.query;
const db_client = new faunadb.Client({
  secret: process.env.FAUNADB_ACCESS_KEY
});
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

    // db_client.query(q.Get(q.Match(q.Index("by_payment_id"), payment_id)))
    //   .then(db_rsp => {
    //     console.log("FAUNA rsp: ", db_rsp);
    //     return Object.assign({}, payment_data, db_rsp.data)
    //   })
    //   .catch(db_err => {
    //     console.log("FAUNA ERR: ", db_err);
    //     return payment_data;
    //   })
    //   .then(data => {
    //     console.log('data', data);
    //     return callback(null, });
    //   });
  } catch(error) {
    console.log('ERROR: ', error);
    return callback(null, {statusCode: 500, body: JSON.stringify(error)});
  }
}
