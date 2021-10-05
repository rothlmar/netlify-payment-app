const config = require('./config');
const SquareConnect = require('square-connect');
const ordersApi = config.ORDERS_API;

exports.handler = function(event, context, callback) {
  if (event.httpMethod != 'GET') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const query_params = event.queryStringParameters;
  const order_id = query_params.order_id;

  const bodyOrderIds = [order_id];
  const body = SquareConnect.OrdersApi.constructFromObject({
    order_ids: bodyOrderIds
  });

  console.log(body);

  ordersApi.batchRetrieveOrders(body).then(data =>
          callback(null, {statusCode: 200, body: JSON.stringify(data)}))
    .catch(response =>
           callback(null, {statusCode: 500, body: JSON.stringify(response.data)}));
}
