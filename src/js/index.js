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

function call_create_payment(nonce, data) {
  return fetch('/.netlify/functions/create-payment', {
    method: 'POST',
    body: JSON.stringify({
      nonce: nonce,
      rental_length: data.rental_length,
      tip: Number.parseInt(Number.parseFloat(data.delivery_tip)*100),
      start_date: data.start_date,
      rental_address: data.rental_address,
      contact_name: data.contact_name,
      contact_number: data.contact_number,
      rental_selected: data.rental_selected
    })
  })
    .then(response => response.json())
    .then(response => data.payment_id = response['payment']['id']);
}

const cardPaymentForm = new SqPaymentForm({
  applicationId: '#{ square_application_id }',
  card: { elementId: 'sq-card' },
  callbacks: {
    cardNonceResponseReceived: function(errors, nonce, paymentData, contacts) {
      if (!errors) {
        call_create_payment(nonce, data);
      }
    }
  }
});
cardPaymentForm.build();

const gPayPaymentForm = new SqPaymentForm({
  applicationId: '#{ square_application_id }',
  locationId: '#{ square_location_id }',
  googlePay: { elementId: 'sq-google-pay' },
  callbacks: {
    cardNonceResponseReceived: function(errors, nonce, paymentData, contacts) {
      if (!errors) {
        call_create_payment(nonce, data);
      }
    },
    methodsSupported: function(methods, unsupportedReason) {
      var googlePayBtn = document.getElementById('sq-google-pay');

      if (methods.googlePay === true) {
        googlePayBtn.style.display = 'inline-block';
      } else {
        console.log(unsupportedReason.message);
      }
    },
    createPaymentRequest: function() {
      let paymentRequestJson = {
        requestBillingAddress: true,
        currencyCode: 'USD',
        countryCode: 'US',
        total: {
          label: 'TOTAL AMOUNT',
          amount: compute_total_price(data.rental_length, data.delivery_tip),
          pending: false
        }
      };

      return paymentRequestJson;
    }
  }
});
gPayPaymentForm.build();

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
    gatewayMerchantId: '#{ square_location_id }'
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

function doGoogleStuff() {
  googlePaymentsClient = new google.payments.api.PaymentsClient({
    environment: '#{ google_pay_env }',
    paymentDataCallbacks: { onPaymentAuthorized: onPaymentAuthorized }
  });
  const isReadyToPayRequest = Object.assign({}, baseGooglePayRequest);
  isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];
  googlePaymentsClient.isReadyToPay(isReadyToPayRequest)
    .then(function(response) {
      if (response.result) {
        const button = googlePaymentsClient.createButton(
          { onClick: onGooglePaymentButtonClicked }
        );
        document.getElementById('google-pay-direct').appendChild(button);
      }
    })
    .catch(function(err) {
      console.log(err);
    })
}

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
    merchantName: 'Example Merchant',
    merchantId: '01234567890123456789'
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
    console.log('PAYMENT DATA:');
    console.log(paymentData);
    const effectiveNonce = 'gpay:' + paymentToken;
    call_create_payment(effectiveNonce, data)
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

function submitCardClick(event) {
  event.preventDefault();
  cardPaymentForm.requestCardNonce();
}

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
  methods: { submitCardClick, sendEmail }
});
