const data = {
  payments: [],
  user: null
};

const computed = {
  isLoggedIn: function() { return this.user != null }
}

const app = new Vue({
  el: '#adminApp',
  data: data,
  computed: computed,
  methods: { completePayment, cancelPayment, getPayments, refundDeposit, triggerIdAction },
  filters: { toMoney }
});

function getPayment(payment, index) {
  fetch(`/.netlify/functions/get-payment?payment_id=${payment.id}`, { method: 'GET' })
    .then(rsp => rsp.json())
    .then(rsp => {
      if (index !== undefined) {
        Vue.set(app.payments, index, Object.assign({}, payment, rsp))
      }
    });
}

function getPayments() {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/list-payments',
                   { method: 'GET',
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(response => response.json())
      .then(response => {
        response['payments'].forEach((element, index) => Vue.set(app.payments, index, element))
        return app.payments;
      })
      .then(payments => payments.map(getPayment));
  }
}

function completePayment(payment, index) {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/complete-payment',
                   { method: 'POST',
                     body: JSON.stringify({payment_id: payment.id}),
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(() => setTimeout(() => getPayment(payment, index), 1000));
  }
}

function cancelPayment(payment, index) {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/cancel-payment',
                   { method: 'POST',
                     body: JSON.stringify({payment_id: payment.id}),
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(() => setTimeout(() => getPayment(payment, index), 1000));
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

function toMoney(value) {
  if (!value) {
    return '$0.00';
  }
  return '$' + value.toFixed(2);
}

netlifyIdentity.on('login', user => {data.user = user; getPayments(); });
