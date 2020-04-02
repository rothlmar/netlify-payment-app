const config = require('./config');
const axios = require('axios');
const uuid4 = require('uuid/v4');
const faunadb = require('faunadb');
const q = faunadb.query;
const db_client = new faunadb.Client({
  secret: process.env.FAUNADB_ACCESS_KEY
});

const WEEKLY_RENTAL_AMOUNT = 100;
const DEPOSIT_AMOUNT = 200;

exports.handler = function(event, context, callback) {
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const req_body_incoming = JSON.parse(event.body);
  const amount_money = req_body_incoming.rental_length*WEEKLY_RENTAL_AMOUNT + DEPOSIT_AMOUNT;
  const {nonce, location_id, tip, billing_address, ...rental_details} = req_body_incoming;

  const idempotency_key = uuid4();
  const request_body = {
    source_id: nonce,
    location_id: location_id,
    amount_money: { amount: amount_money, currency: config.CURRENCY },
    idempotency_key: idempotency_key,
    autocomplete: false
  }
  if (tip) {
    request_body.tip_money = { amount: tip, currency: config.CURRENCY};
  }
  if (billing_address) {
    request_body.billing_address = billing_address
  }

  // Constructing this directly, instead of using the API, in case we want to use
  // alpha features that are not yet in the CreatePaymentRequest
  axios.post('/v2/payments', request_body)
    .then(response => {
      rental_details.payment_id = response.data.payment.id;
      return db_client.query(q.Create(q.Collection('rentals'), {data: rental_details }))
        .then(db_rsp => response)
        .catch(db_rsp => { console.log('DB ERROR IS', JSON.stringify(db_rsp)); return response; })
    })
    .then(response =>
          callback(null, {statusCode: 200, body: JSON.stringify(response.data)}))
    .catch(error => {
      callback(null, {statusCode: 500, body: JSON.stringify(error)});
    });

}
