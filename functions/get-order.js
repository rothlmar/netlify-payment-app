const config = require('./config');
const { sqStringify } = require('./util');
const ordersApi = config.ORDERS_API;

exports.handler = async function(event, context, callback) {
  const query_params = event.queryStringParameters;
  if (!('order_id') in query_params) {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const order_id = query_params.order_id;

  try {
    const { result, ...httpResponse } = await ordersApi.retrieveOrder(order_id);
    console.log(result);
    return callback(null, { statusCode: 200, body: sqStringify(result),
                            headers: { "Access-Control-Allow-Origin": "*" }});
  } catch(error) {
    console.log("ERROR: ", error);
    return callback(null, { statusCode: 500, body: error,
                            headers: { "Access-Control-Allow-Origin": "*" }});
  }
}
