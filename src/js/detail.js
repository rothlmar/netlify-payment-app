const data = { payment: null,
               order: null,
               recipient: null,
               metadata: null,
               info: null,
               new_tip: 0 };
const computed = {
  tip: function() { return (this.payment != null) && ('tipMoney' in this.payment) ?
                    this.payment.tipMoney.amount : 0 }
}

function processResponse(response) {
  response.json().then(response => {
    data.info = response;
    if ('order' in response) {
      data.order = response['order'];
      if ('fulfillments' in data.order) {
        data.recipient = data.order.fulfillments[0].shipmentDetails.recipient;
        data.metadata = data.order.fulfillments[0].metadata;
      }
    }
    data.payment = response['payment'];
    data.new_tip = data.payment.tipMoney.amount / 100;
  })
}

function getPayment() {
  const payment_id = window.location.pathname.split('/')[2];
  fetch(`/.netlify/functions/get-payment?payment_id=${payment_id}`,
        { method: 'GET'})
    .then(processResponse);
}

function editTip(new_tip, payment_id) {
  const req_body = { payment_id: payment_id,
                     tip: Number.parseInt(Number.parseFloat(new_tip)*100) };
  fetch('/.netlify/functions/edit-tip',
        { method: 'POST',
          body: JSON.stringify(req_body) })
    .then(processResponse);
}

function toMoney(value) {
  if (!value) {
    return '$0.00';
  }
  return '$' + value.toFixed(2);
}

const app = new Vue({
  el: '#detail',
  data: data,
  computed: computed,
  methods: { editTip },
  filters: { toMoney },
  beforeMount: getPayment

});
