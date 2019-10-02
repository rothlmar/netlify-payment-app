const data = {
  payments: [],
  user: null
};

const computed = {
  isLoggedIn: function() { return this.user != null }
}

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

function refundDeposit(payment_id, current_amount) {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/edit-amount',
                   { method: 'POST',
                     body: JSON.stringify({payment_id: payment_id, amount: current_amount - 200}),
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(() => setTimeout(getPayments, 2000));
  }
}

function triggerIdAction(action) {
  if (action == 'login') {
    netlifyIdentity.open(action);
  } else if (action == 'logout') {
    netlifyIdentity.logout();
    data.payments = [];
    data.user = null;
  }
}

const app = new Vue({
  el: '#adminApp',
  data: data,
  computed: computed,
  methods: { completePayment, cancelPayment, getPayments, refundDeposit, triggerIdAction }
});

netlifyIdentity.on('login', user => {data.user = user; getPayments(); });
