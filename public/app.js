const paymentForm = new SqPaymentForm({
  applicationId: 'sandbox-sq0idb-ZdLpK4-bnjWPq2Qgg5F9Xw',
  card: { elementId: 'sq-card' },
  callbacks: {
    cardNonceResponseReceived: function(errors, nonce, paymentData, contacts) {
      if (!errors) {
        fetch('/.netlify/functions/create-payment', {
          method: 'POST',
          body: JSON.stringify({nonce: nonce, rental_length: 3})
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
