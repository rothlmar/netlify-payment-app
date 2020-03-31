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
  total_price: function() {
    deposit_amount = 2;
    total_amount = deposit_amount + Number.parseFloat(this.rental_length) +
      Number.parseFloat(this.delivery_tip);
    return  total_amount.toFixed(2);
  },
  payment_made: function() { return this.payment_id != null }
}

const paymentForm = new SqPaymentForm({
  applicationId: '#{ square_application_id }',
  locationId: '#{ square_location_id }',
  // card: { elementId: 'sq-card' },
  googlePay: { elementId: 'sq-google-pay' },
  callbacks: {
    cardNonceResponseReceived: function(errors, nonce, paymentData, contacts) {
      if (!errors) {
        fetch('/.netlify/functions/create-payment', {
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
    },
    methodsSupported: function(methods, unsupportedReason) {
      console.log(methods);
      var googlePayBtn = document.getElementById('sq-google-pay');

      if (methods.googlePay === true) {
        googlePayBtn.style.display = 'inline-block';
      } else {
        console.log(unsupportedReason);
      }
    },
    createPaymentRequest: function() {
      let paymentRequestJson = {
        requestShippingAddres: true,
        requestBillingAddress: true,
        currencyCode: 'USD',
        countryCode: 'US',
        total: {
          label: 'MERCHANT NAME',
          amount: '1.00',
          pending: false
        },
        lineItems: [
          {
            label: 'Subtotal',
            amount: '1.00',
            pending: false
          },
          {
            label: 'Shipping',
            amount: '1.00',
            pending: false
          }
        ],
        shippingOptions: [
          {
            id: '1',
            label: 'Standard',
            amount: '1.00'
          },
          { id: '2',
            label: 'Express',
            amount: '2.00'
          }
        ]
      };

      return paymentRequestJson;
    }
  }
});
paymentForm.build();

const baseGooglePayRequest = {
  apiVersion: 2,
  apiVersionMinor: 0
};

const tokenizationSpecification = {
  type: 'PAYMENT_GATEWAY',
  parameters: {
    gateway: 'square',
    gatewayMerchantId: 'example'
  }
};

const allowedCardNetworks = ["AMEX", "DISCOVER", "INTERAC", "JCB", "MASTERCARD", "VISA"];
const allowedCardAuthMethods = ["PAN_ONLY", "CRYPTOGRAM_3DS"];

const baseCardPaymentMethod = {
  type: 'CARD',
  parameters: {
    allowedAuthMethods: allowedCardAuthMethods,
    allowedCardNetworks: allowedCardNetworks
  }
};

const cardPaymentMethod = Object.assign(
  {tokenizationSpecification: tokenizationSpecification},
  baseCardPaymentMethod
);

let paymentsClient;

function doGoogleStuff() {
  console.log("THIS IS LOADED AFTER GOOGLE PAY FORM LOADED");
  paymentsClient = new google.payments.api.PaymentsClient({environment: 'TEST'});
  const isReadyToPayRequest = Object.assign({}, baseGooglePayRequest);
  isReadyToPayRequest.allowedPaymentMethods = [baseCardPaymentMethod];
  paymentsClient.isReadyToPay(isReadyToPayRequest)
    .then(function(response) {
      if (response.result) {
        console.log("READY TO PAY!!!!!!");
        console.log(response.result);
        const button = paymentsClient.createButton({onClick: () => console.log("TODO ADD HANDLER") });
        document.getElementById('google-pay-direct').appendChild(button);
      }
    })
    .catch(function(err) {
      console.log("NOT READY TO PAY!");
      console.log(err);
    })
}

function submitCardClick(event) {
  event.preventDefault();
  paymentForm.requestCardNonce();
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
