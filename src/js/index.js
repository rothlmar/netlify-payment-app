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
        countryCode: 'US'
      };

      return paymentRequestJson;
    }
  }
});
paymentForm.build();

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
