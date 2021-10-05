const config = require('./config');
const axios = require('axios');
const ordersApi = config.ORDERS_API;

exports.handler = function(event, context, callback) {
  if (event.httpMethod != 'GET') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const query_params = event.queryStringParameters;
  const order_id = query_params.order_id;
  const location_id = query_params.location_id;

  const bodyOrderIds = [order_id];
  const request_body = {
    order_ids: bodyOrderIds
  };

  console.log(`/v2/locations/${location_id}/orders/batch-retrieve`)
  console.log(body);

  axios.post(`/v2/locations/${location_id}/orders/batch-retrieve`, request_body)
  .then(data =>
    callback(null, {statusCode: 200, body: JSON.stringify(data)}))
  .catch(response =>
    callback(null, {statusCode: 500, body: JSON.stringify(response.data)}));
}
