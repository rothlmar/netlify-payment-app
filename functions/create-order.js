const config = require('./config');
const { sqStringify } = require('./util');
const uuid4 = require('uuid/v4');

const ordersApi = config.ORDERS_API;

const WEEKLY_RENTAL_AMOUNT = 100;
const DEPOSIT_AMOUNT = 200;


exports.handler = async function(event, context, callback) {
  if (event.httpMethod != 'POST') {
    return callback(null, {statusCode: 404, body: '{"error": "Not found"}'});
  }
  const req_body_incoming = JSON.parse(event.body);
  const {location_id, rental_length, rental_selected, start_date,
         contact_name, rental_address, contact_number, ...rental_details} = req_body_incoming;

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
        { quantity: rental_length.toString(),
          name: rental_selected,
          basePriceMoney: { amount: WEEKLY_RENTAL_AMOUNT, currency: config.CURRENCY }
        }
      ],
      fulfillments: [
        {
          type: "SHIPMENT",
          metadata: {
            "startDate": start_date,
            "rentalLength": rental_length.toString()
          },
          shipmentDetails: {
            recipient: {
              displayName: contact_name || "Valued Customer",
              address: {
                addressLine1: rental_address || "Somewhere USA"
              },
              phoneNumber: contact_number || "xxx-xxxx"
            }
          }
        }
      ]
    }
  }

  try {
    const { result, ...httpResponse } = await ordersApi.createOrder(create_order_request_body);
    return callback(null, {statusCode: 200, body: sqStringify(result)});
  } catch(error) {
    console.log("ERROR: ", error);
    return callback(null, { statusCode: 500, body: error });
  }
}
