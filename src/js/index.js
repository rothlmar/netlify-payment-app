const LOCATION_ID = '#{ square_location_id }';

const data = {
  rental_length: 3,
  deposit_amount: "2.00",
  delivery_tip: "1.00",
  payment_id: null,
  start_date: new Date().toISOString().slice(0, 10),
  rental_address: '',
  contact_name: '',
  contact_number: '',
  rental_options: ['Medical Device', 'Bouncy Castle'],
  rental_selected: '',
  email_address: ''
};

let card;

const computed = {
  rental_price: function() { return Number.parseFloat(this.rental_length).toFixed(2) },
  rental_period: function() { return this.rental_selected == 'Bouncy Castle' ? 'days' : 'weeks' },
  total_price: function() { return compute_total_price(this.rental_length, this.delivery_tip) },
  payment_made: function() { return this.payment_id != null }
}

function compute_total_price(rental_length, delivery_tip) {
  deposit_amount = 2;
  total_amount = deposit_amount + Number.parseFloat(rental_length) +
    Number.parseFloat(delivery_tip);
  return total_amount.toFixed(2);
}

function call_create_payment(source_id, data, billingPostalCode) {
  const req_body = {
    source_id: source_id,
    rental_length: data.rental_length,
    tip: Number.parseInt(Number.parseFloat(data.delivery_tip)*100),
    start_date: data.start_date,
    rental_address: data.rental_address,
    contact_name: data.contact_name,
    contact_number: data.contact_number,
    rental_selected: data.rental_selected,
    location_id: LOCATION_ID
  }
  if (billingPostalCode !== undefined) {
    req_body.billing_address = { postal_code: billingPostalCode }
  }

  return fetch('/.netlify/functions/create-payment', {
    method: 'POST',
    body: JSON.stringify(req_body)
  })
    .then(response => response.json())
    .then(response => data.payment_id = response['payment']['id']);
}

function initWebPaymentsSdk() {
  const appId = '#{ square_application_id }';
  const locationId = LOCATION_ID;
  async function initializeCard(payments) {
    const card = await payments.card();
    await card.attach('#card-container');
    return card;
  }

  document.addEventListener('DOMContentLoaded', async function() {
    if (!window.Square) {
      throw new Error('Square.js failed to load properly.');
    }
    const payments = window.Square.payments(appId, locationId);
    try {
      card = await initializeCard(payments);
    } catch (e) {
      console.error('Initializing Card failed', e);
      return;
    }
  })
}

async function tokenize(paymentMethod) {
  const tokenResult = await paymentMethod.tokenize();
  if (tokenResult.status === 'OK') {
    return tokenResult.token;
  } else {
    let errorMessage = `Tokenization failed-status: ${tokenResult.status}`;
    if (tokenResult.errors) {
      errorMessage += ` and errors: ${JSON.stringify(tokenResult.errors)}`;
    }
  }
  throw new Error(errorMessage);
}

async function handlePaymentMethodSubmission(event, paymentMethod) {
  event.preventDefault();
  try {
    const token = await tokenize(paymentMethod);
    call_create_payment(token, data);
  } catch (e) {
    console.error(e.message);
  }
}

// if (document.getElementById('sq-google-pay') !== null) {
//   const gPayPaymentForm = new SqPaymentForm({
//     applicationId: '#{ square_application_id }',
//     locationId: LOCATION_ID,
//     googlePay: { elementId: 'sq-google-pay' },
//     callbacks: {
//       cardNonceResponseReceived: function(errors, nonce, paymentData, contacts) {
//         if (!errors) {
//           call_create_payment(nonce, data);
//         }
//       },
//       methodsSupported: function(methods, unsupportedReason) {
//         var googlePayBtn = document.getElementById('sq-google-pay');

//         if (methods.googlePay === true) {
//           googlePayBtn.style.display = 'inline-block';
//         } else {
//           console.log(unsupportedReason.message);
//         }
//       },
//       createPaymentRequest: function() {
//         let paymentRequestJson = {
//           requestBillingAddress: true,
//           currencyCode: 'USD',
//           countryCode: 'US',
//           total: {
//             label: 'TOTAL AMOUNT',
//             amount: compute_total_price(data.rental_length, data.delivery_tip),
//             pending: false
//           }
//         };
//         return paymentRequestJson;
//       }
//     }
//   });
//   gPayPaymentForm.build();
// }

////////////////////
// Google Pay Direct
////////////////////

const baseGooglePayRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    gateway: 'square',
    gatewayMerchantId: LOCATION_ID
  }
};

const allowedCardNetworks = ["AMEX", "DISCOVER", "MASTERCARD", "VISA"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks,
    billingAddressRequired: true
  }
};

const cardPaymentMethod = Object.assign(
  {tokenizationSpecification: tokenizationSpecification},
  baseCardPaymentMethod
);

let googlePaymentsClient;

// function doGoogleStuff() {
//   googlePaymentsClient = new google.payments.api.PaymentsClient({
//     environment: '#{ google_pay_env }',
//     paymentDataCallbacks: { onPaymentAuthorized: onPaymentAuthorized }
//   });
//   const isReadyToPayRequest = Object.assign({}, baseGooglePayRequest);
//   isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];
//   googlePaymentsClient.isReadyToPay(isReadyToPayRequest)
//     .then(function(response) {
//       if (response.result) {
//         const button = googlePaymentsClient.createButton(
//           { onClick: onGooglePaymentButtonClicked }
//         );
//         document.getElementById('google-pay-direct').appendChild(button);
//       }
//     })
//     .catch(function(err) {
//       console.log(err);
//     })
// }

function getGooglePaymentDataRequest() {
  const paymentDataRequest = Object.assign({}, baseGooglePayRequest);
  paymentDataRequest.allowedPaymentMethods = [cardPaymentMethod];
  paymentDataRequest.transactionInfo = {
    totalPriceStatus: 'FINAL',
    totalPrice: compute_total_price(data.rental_length, data.delivery_tip),
    currencyCode: 'USD',
    countryCode: 'US'
  };
  paymentDataRequest.merchantInfo = {
    merchantName: '#{ google_pay_merchant_name }',
    merchantId: '#{ google_pay_merchant_id }'
  };
  paymentDataRequest.callbackIntents = ['PAYMENT_AUTHORIZATION'];
  return paymentDataRequest;
}

function onGooglePaymentButtonClicked() {
  googlePaymentsClient.loadPaymentData(getGooglePaymentDataRequest())
    .catch(function(err) {
      console.error('THERE WAS AN ERROR', err);
    });
}

function onPaymentAuthorized(paymentData) {
  return new Promise(function(resolve, reject) {
    const paymentToken = paymentData.paymentMethodData.tokenizationData.token;
    const billingPostalCode = paymentData.paymentMethodData.info.billingAddress.postalCode;
    const effectiveNonce = 'gpay:' + paymentToken;
    call_create_payment(effectiveNonce, data, billingPostalCode)
      .then(function() {
        resolve({ transactionState: 'SUCCESS' })
      })
      .catch(function(err) {
        console.error('ERROR CALLING CREATE PAYMENT', err);
        resolve({
          transactionState: 'ERROR',
          error: {
            intent: 'PAYMENT_AUTHORIZATION',
            message: 'An error occured, please try again',
            reason: 'PAYMENT_DATA_INVALID'
          }
        })
      });
  })
}

async function submitWpSdkClick(event) {
  await handlePaymentMethodSubmission(event, card);
};

function sendEmail(payment_id, email_address) {
  return fetch('/.netlify/functions/send-email', {
    method: 'POST',
    body: JSON.stringify({ payment_id, email_address })
  });
}

const app = new Vue({
  el: '#app',
  data: data,
  computed: computed,
  methods: { sendEmail, submitWpSdkClick }
});
