const config = require('./config');
const { sqStringify } = require('./util');
const uuid4 = require('uuid/v4');

const paymentsApi = config.PAYMENTS_API;
const ordersApi = config.ORDERS_API;

const WEEKLY_RENTAL_AMOUNT = 100;
const DEPOSIT_AMOUNT = 200;

exports.handler = async function(event, context, callback) {
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const req_body_incoming = JSON.parse(event.body);
  const amount_money = req_body_incoming.order_amount || req_body_incoming.rental_length*WEEKLY_RENTAL_AMOUNT + DEPOSIT_AMOUNT;
  const {source_id, location_id, tip, billing_address, order_id, ...rental_details} = req_body_incoming;

  const order_idempotency_key = uuid4();
  const create_order_request_body = {
    idempotency_key: order_idempotency_key,
    order: {
      locationId: location_id,
      lineItems: [
        { quantity: "1",
          name: "Deposit",
          basePriceMoney: { amount: DEPOSIT_AMOUNT, currency: config.CURRENCY }
        },
        { quantity: req_body_incoming.rental_length.toString(),
          name: req_body_incoming.rental_selected,
          basePriceMoney: { amount: WEEKLY_RENTAL_AMOUNT, currency: config.CURRENCY }
        }
      ],
      fulfillments: [
        {
          type: "SHIPMENT",
          metadata: {
            "startDate": req_body_incoming.start_date,
            "rentalLength": req_body_incoming.rental_length.toString()
          },
          shipmentDetails: {
            recipient: {
              displayName: req_body_incoming.contact_name || "Valued Customer",
              address: {
                addressLine1: req_body_incoming.rental_address || "Somewhere USA"
              },
              phoneNumber: req_body_incoming.contact_number || "xxx-xxxx"
            }
          }
        }
      ]
    }
  }

  const idempotency_key = uuid4();
  const request_body = {
    sourceId: source_id,
    locationId: location_id,
    amountMoney: { amount: amount_money, currency: config.CURRENCY },
    idempotencyKey: idempotency_key,
    autocomplete: false
  }
  if (tip) {
    request_body.tipMoney = { amount: tip, currency: config.CURRENCY};
  }
  if (billing_address) {
    request_body.billingAddress = billing_address;
  }
  if (order_id) {
    request_body.orderId = order_id;
  } else {
    try {
      const { result, ...httpResponse } = await ordersApi.createOrder(create_order_request_body);
      request_body.orderId = result.order.id;
    } catch(error) {
      console.log("ORDERS ERROR: ", error);
    }
  }

  try {
    const createPaymentResponse = await paymentsApi.createPayment(request_body);
    return callback(null, {statusCode: 200, body: sqStringify(createPaymentResponse.result)});
  } catch(error) {
    console.log("ERROR: ", error);
    return callback(null, { statusCode: 500, body: error });
  }
}
