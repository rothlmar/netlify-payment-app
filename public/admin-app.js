function getPayments() {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/payments',
                   { method: 'GET',
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(response => response.json())
      .then(response => {data.payments = response['payments']});
  }
}

function completePayment(payment_id) {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/complete-payment',
                   { method: 'POST',
                     body: JSON.stringify({payment_id: payment_id}),
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(() => setTimeout(getPayments, 2000));
  }
}

function cancelPayment(payment_id) {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/cancel-payment',
                   { method: 'POST',
                     body: JSON.stringify({payment_id: payment_id}),
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(() => setTimeout(getPayments, 2000));
  }
}

const data = {
  payments: []
};

const app = new Vue({
  el: '#adminApp',
  data: data,
  methods: { completePayment, cancelPayment, getPayments }
});

netlifyIdentity.on('init', getPayments);
netlifyIdentity.on('login', getPayments);
netlifyIdentity.on('logout', () => { data.payments = []; })
