const data = { payment: null }
const computed = {
  tip: function() { return (this.payment != null) && ('tip_money' in this.payment) ?
                    this.payment.tip_money.amount : 0 }
}

function getPayment() {
  const payment_id = window.location.pathname.split('/')[2];
  fetch(`/.netlify/functions/get-payment?payment_id=${payment_id}`,
        { method: 'GET'})
    .then(response => response.json())
    .then(response => data.payment = response['payment']);
}

const app = new Vue({
  el: '#detail',
  data: data,
  computed: computed,
  beforeMount: getPayment
});
