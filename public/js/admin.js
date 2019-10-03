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

function getPayments() {
  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/list-payments',
                   { method: 'GET',
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(response => response.json())
      .then(response => data.payments = response['payments'])
      .then(payments => {
        payments.map(payment => {
          fetch(`/.netlify/functions/get-payment?payment_id=${payment.id}`,
                { method: 'GET' })
            .then(rsp => rsp.json())
            .then(rsp => {
              payment.info = rsp;
              app.$forceUpdate();
            }) });
      })
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

function toMoney(value) {
  if (!value) {
    return '$0.00';
  }
  return '$' + value.toFixed(2);
}

netlifyIdentity.on('login', user => {data.user = user; getPayments(); });
