let app = new Vue({
  el: '#app',
  data: {
    greeting: 'Vue'
  }
})

const paymentForm = new SqPaymentForm({
  applicationId: 'sandbox-sq0idb-ZdLpK4-bnjWPq2Qgg5F9Xw',
  card: { elementId: 'sq-card' },
  callbacks: {
    cardNonceResponseReceived: function(errors, nonce, paymentData, contacts) {
      if (!errors) {
        fetch('/.netlify/functions/createPayment', {
          method: 'POST',
          body: JSON.stringify({nonce: nonce})
        })
          .then(data => console.log(response.text()))
      }
    }
  }
});

function submitCardClick(event) {
  event.preventDefault();
  paymentForm.requestCardNonce();
}

paymentForm.build();
