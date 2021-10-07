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
        rsp.payment.order = rsp.order;
        Vue.set(app.payments, index, Object.assign({}, payment, rsp.payment));
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
        response.forEach((element, index) => Vue.set(app.payments, index, element))
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

function refundDeposit(index) {
  const payment = data.payments[index];
  const new_payment_amount = payment.amountMoney.amount - 200;
  const order = {
    id: payment.order.id,
    location_id: payment.order.locationId,
    version: payment.order.version,
    deposit_line_item_uid: payment.order.lineItems[0].uid
  }

  if (netlifyIdentity.currentUser()) {
    return netlifyIdentity.currentUser().jwt().then(token => {
      return fetch('/.netlify/functions/edit-amount',
                   { method: 'POST',
                     body: JSON.stringify({payment_id: payment.id, amount: new_payment_amount, order: order}),
                     headers: {'Authorization': `Bearer ${token}`}})})
      .then(() => setTimeout(() => getPayment(payment, index), 1000));
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
