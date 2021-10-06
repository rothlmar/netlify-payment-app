const config = require('./config');
const { sqStringify } = require('./util');
const ordersApi = config.ORDERS_API;

exports.handler = async function(event, context, callback) {
  const query_params = event.queryStringParameters;
  const order_id = query_params.order_id;

  try {
    const { result, ...httpResponse } = await ordersApi.retrieveOrder(order_id);
    console.log(result);
    return callback(null, { statusCode: 200, body: sqStringify(result)});
  } catch(error) {
    console.log("ERROR: ", error);
    return callback(null, { statusCode: 500, body: error });
  }
}
