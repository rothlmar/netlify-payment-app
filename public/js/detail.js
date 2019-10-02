const data = { payment: null,
               new_tip: 0 };
const computed = {
  tip: function() { return (this.payment != null) && ('tip_money' in this.payment) ?
                    this.payment.tip_money.amount : 0 }
}

function getPayment() {
  const payment_id = window.location.pathname.split('/')[2];
  fetch(`/.netlify/functions/get-payment?payment_id=${payment_id}`,
        { method: 'GET'})
    .then(response => response.json())
    .then(response => {
      data.payment = response['payment'];
      data.new_tip = data.payment.tip_money.amount / 100;
    });
}

function editTip(new_tip, payment_id) {
  const req_body = { payment_id: payment_id,
                     tip: Number.parseInt(Number.parseFloat(new_tip)*100) };
  fetch('/.netlify/functions/edit-tip',
        { method: 'POST',
          body: JSON.stringify(req_body) })
    .then(response => response.json())
    .then(response => data.payment = response['payment']);
}

const app = new Vue({
  el: '#detail',
  data: data,
  computed: computed,
  methods: { editTip },
  beforeMount: getPayment
});
