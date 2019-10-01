const data = {
  rental_length: 3,
  delivery_tip: 1
};

const computed = {
  rental_price: function() { return Number.parseFloat(this.rental_length).toFixed(2) },
  total_price: function() {
    deposit_amount = 2;
    total_amount = deposit_amount + Number.parseFloat(this.rental_length) +
      Number.parseFloat(this.delivery_tip);
    return  total_amount.toFixed(2);
  }
}

const app = new Vue({
  el: '#app',
  data: data,
  computed: computed
});

const paymentForm = new SqPaymentForm({
  applicationId: 'sandbox-sq0idb-ZdLpK4-bnjWPq2Qgg5F9Xw',
  card: { elementId: 'sq-card' },
  callbacks: {
    cardNonceResponseReceived: function(errors, nonce, paymentData, contacts) {
      if (!errors) {
        fetch('/.netlify/functions/create-payment', {
          method: 'POST',
          body: JSON.stringify({nonce: nonce,
                                rental_length: data.rental_length,
                                tip: Number.parseFloat(data.delivery_tip)*100})
        })
          .then(data => console.log(response.text()))
      }
    }
  }
});
paymentForm.build();

function submitCardClick(event) {
  event.preventDefault();
  paymentForm.requestCardNonce();
}
